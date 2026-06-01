import {
  adminClient,
  createAnonClient,
  extractOtpCode,
  uniqueEmail,
  waitForMail,
} from '../../test-utils/rls-helpers';

async function timed<T>(fn: () => Promise<T>): Promise<{ result: T; latencyMs: number }> {
  const start = performance.now();
  const result = await fn();
  return {
    result,
    latencyMs: Math.round(performance.now() - start),
  };
}

describe('local Supabase auth E2E', () => {
  jest.setTimeout(15000);

  it('signs up, verifies email, logs in, requests password reset, and logs out', async () => {
    const client = createAnonClient();
    const email = uniqueEmail('auth-e2e');
    const password = 'Supabase-local-123!';
    let userId: string | undefined;

    const latencies: Record<string, number> = {};

    try {
      const signup = await timed(() => client.auth.signUp({ email, password }));
      latencies.signup = signup.latencyMs;
      expect(signup.result.error).toBeNull();
      expect(signup.result.data.user?.email).toBe(email);
      expect(signup.result.data.session).toBeNull();
      userId = signup.result.data.user?.id;

      const signupMail = await timed(() => waitForMail(email, 'Confirm'));
      latencies.emailVerificationEmail = signupMail.latencyMs;
      expect(signupMail.result.summary.Subject).toContain('Confirm');

      const signupToken = extractOtpCode(signupMail.result.body);
      const verified = await timed(() => client.auth.verifyOtp({
        type: 'signup',
        email,
        token: signupToken,
      }));
      latencies.emailVerification = verified.latencyMs;
      expect(verified.result.error).toBeNull();
      expect(verified.result.data.session?.access_token).toBeTruthy();

      await client.auth.signOut();

      const login = await timed(() => client.auth.signInWithPassword({ email, password }));
      latencies.login = login.latencyMs;
      expect(login.result.error).toBeNull();
      expect(login.result.data.session?.access_token).toBeTruthy();
      expect(login.result.data.session?.expires_at).toBeGreaterThan(Math.floor(Date.now() / 1000));

      const passwordReset = await timed(() => client.auth.resetPasswordForEmail(email, {
        redirectTo: 'http://127.0.0.1:3000/reset-password',
      }));
      latencies.passwordResetRequest = passwordReset.latencyMs;
      expect(passwordReset.result.error).toBeNull();

      const resetMail = await timed(() => waitForMail(email, 'Reset'));
      latencies.passwordResetEmail = resetMail.latencyMs;
      expect(resetMail.result.summary.Subject).toContain('Reset');
      expect(extractOtpCode(resetMail.result.body)).toBeTruthy();

      const logout = await timed(() => client.auth.signOut());
      latencies.logout = logout.latencyMs;
      expect(logout.result.error).toBeNull();

      const sessionAfterLogout = await client.auth.getSession();
      expect(sessionAfterLogout.data.session).toBeNull();

      for (const latency of Object.values(latencies)) {
        expect(latency).toBeGreaterThanOrEqual(0);
        expect(latency).toBeLessThan(5000);
      }

      if (process.env.SHIFTWELL_AUTH_E2E_LOG_LATENCY === '1') {
        // Test-report hook for the Phase 2 execution report.
        console.info('auth-e2e-latencies-ms', JSON.stringify(latencies));
      }
    } finally {
      if (userId) {
        await adminClient.auth.admin.deleteUser(userId);
      }
    }
  });
});
