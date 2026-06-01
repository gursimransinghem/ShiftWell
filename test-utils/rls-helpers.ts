import { execFileSync } from 'child_process';
import { createClient, type Session, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../src/lib/supabase/database.types';

export type TestUser = {
  id: string;
  email: string;
  password: string;
};

type LocalSupabaseConfig = {
  apiUrl: string;
  anonKey: string;
  dbUrl: string;
  serviceRoleKey: string;
  mailpitUrl: string;
};

type MailpitAddress = {
  Address: string;
};

type MailpitSummary = {
  ID: string;
  Subject: string;
  To?: MailpitAddress[];
};

type MailpitListResponse = {
  messages?: MailpitSummary[];
};

type MailpitMessage = {
  HTML?: string;
  Text?: string;
};

const createdUserIds = new Set<string>();
let cachedConfig: LocalSupabaseConfig | null = null;

function parseSupabaseEnv(raw: string): Record<string, string> {
  const env: Record<string, string> = {};

  for (const line of raw.split('\n')) {
    const match = line.match(/^([A-Z0-9_]+)=("?)(.*)\2$/);
    if (match) {
      env[match[1]] = match[3];
    }
  }

  return env;
}

export function localSupabaseConfig(): LocalSupabaseConfig {
  if (cachedConfig) {
    return cachedConfig;
  }

  const cliEnv = parseSupabaseEnv(
    execFileSync('supabase', ['status', '-o', 'env'], {
      cwd: process.cwd(),
      encoding: 'utf8',
    }),
  );

  cachedConfig = {
    apiUrl: process.env.SUPABASE_URL ?? cliEnv.API_URL,
    anonKey: process.env.SUPABASE_ANON_KEY ?? cliEnv.ANON_KEY,
    dbUrl: process.env.SUPABASE_DB_URL ?? cliEnv.DB_URL,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? cliEnv.SERVICE_ROLE_KEY,
    mailpitUrl: process.env.SUPABASE_MAILPIT_URL ?? cliEnv.MAILPIT_URL ?? cliEnv.INBUCKET_URL,
  };

  for (const [key, value] of Object.entries(cachedConfig)) {
    if (!value) {
      throw new Error(`Missing local Supabase config value: ${key}`);
    }
  }

  return cachedConfig;
}

export function createAnonClient(): SupabaseClient<Database> {
  const config = localSupabaseConfig();
  return createClient<Database>(config.apiUrl, config.anonKey, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
  });
}

export function createAdminClient(): SupabaseClient<Database> {
  const config = localSupabaseConfig();
  return createClient<Database>(config.apiUrl, config.serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
  });
}

export const adminClient = createAdminClient();

export function uniqueEmail(prefix: string): string {
  const nonce = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  return `${prefix}-${nonce}@shiftwell.test`;
}

export async function createTestUser(
  email = uniqueEmail('rls-user'),
  password = 'Supabase-local-123!',
): Promise<TestUser> {
  const { data, error } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (error || !data.user) {
    throw error ?? new Error('Supabase admin did not return a user.');
  }

  createdUserIds.add(data.user.id);

  return {
    id: data.user.id,
    email,
    password,
  };
}

export async function seedUserProfile(user: TestUser, displayName = user.email): Promise<void> {
  const { error } = await adminClient.from('users').upsert({
    id: user.id,
    email: user.email,
    display_name: displayName,
  });

  if (error) {
    throw error;
  }
}

export async function signInAs(
  email: string,
  password: string,
): Promise<{ client: SupabaseClient<Database>; session: Session }> {
  const client = createAnonClient();
  const { data, error } = await client.auth.signInWithPassword({ email, password });

  if (error || !data.session) {
    throw error ?? new Error(`No session returned for ${email}`);
  }

  return { client, session: data.session };
}

export async function cleanupTestUsers(): Promise<void> {
  await Promise.all(
    Array.from(createdUserIds).map(async (id) => {
      await adminClient.auth.admin.deleteUser(id);
    }),
  );
  createdUserIds.clear();
}

export async function waitForMail(
  recipient: string,
  subjectIncludes: string,
  timeoutMs = 5000,
): Promise<{ summary: MailpitSummary; body: string }> {
  const config = localSupabaseConfig();
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    const listResponse = await fetch(`${config.mailpitUrl}/api/v1/messages`);
    if (!listResponse.ok) {
      throw new Error(`Mailpit list failed: ${listResponse.status}`);
    }

    const list = (await listResponse.json()) as MailpitListResponse;
    const summary = list.messages?.find((message) => {
      const sentToRecipient = message.To?.some(
        (to) => to.Address.toLowerCase() === recipient.toLowerCase(),
      );
      return sentToRecipient && message.Subject.includes(subjectIncludes);
    });

    if (summary) {
      const messageResponse = await fetch(`${config.mailpitUrl}/api/v1/message/${summary.ID}`);
      if (!messageResponse.ok) {
        throw new Error(`Mailpit message fetch failed: ${messageResponse.status}`);
      }

      const message = (await messageResponse.json()) as MailpitMessage;
      return {
        summary,
        body: `${message.HTML ?? ''}\n${message.Text ?? ''}`,
      };
    }

    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  throw new Error(`Timed out waiting for ${subjectIncludes} email to ${recipient}`);
}

export function extractTokenHash(emailBody: string, type: 'signup' | 'recovery'): string {
  const links = emailBody.match(/https?:\/\/[^\s"'<>]+/g) ?? [];
  for (const link of links) {
    const url = new URL(link.replace(/&amp;/g, '&'));
    if (url.searchParams.get('type') === type && url.searchParams.get('token_hash')) {
      return url.searchParams.get('token_hash')!;
    }
  }

  throw new Error(`Could not find ${type} token_hash in email body.`);
}

export function extractOtpCode(emailBody: string): string {
  const match = emailBody.match(/(?:code|Code):\s*(\d{6})/);
  if (!match) {
    throw new Error('Could not find 6-digit OTP code in email body.');
  }
  return match[1];
}
