/**
 * ShiftWell Enterprise API — Express App Factory
 *
 * buildApp() assembles the full Express application:
 *   - Request ID attachment
 *   - JSON body parsing
 *   - V1 routes: /v1/schedules, /v1/outcomes
 *   - OAuth token endpoint: /oauth/token (stub — prod uses dedicated auth server)
 *   - 404 + error handlers
 *
 * Designed for testability: buildApp() takes optional repo overrides.
 * Test token injection: reads TEST_JWT_SECRET env var to override RS256 key.
 *
 * Phase 29 — API Layer (ENT-06)
 */

import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { SignJWT } from 'jose';
import { attachRequestId, _setTestSecret } from './middleware/auth';
import { createScheduleRouter, type ScheduleRepository } from './routes/schedule';
import { createOutcomesRouter, type UserRepository } from './routes/outcomes';

// ─── App Factory ──────────────────────────────────────────────────────────────

export interface AppDependencies {
  scheduleRepo?: ScheduleRepository;
  userRepo?: UserRepository;
}

export function buildApp(deps: AppDependencies = {}) {
  // Inject test secret if provided (for HS256 test tokens)
  // This must happen before any request is processed.
  if (process.env['TEST_JWT_SECRET']) {
    const secret = new TextEncoder().encode(process.env['TEST_JWT_SECRET']);
    _setTestSecret(secret);
  } else if (process.env['NODE_ENV'] === 'test') {
    // Default test secret used by routes.test.ts
    const defaultTestSecret = new TextEncoder().encode('test-secret-minimum-32-chars-long!!');
    _setTestSecret(defaultTestSecret);
  }

  const app = express();

  // ── Middleware ──────────────────────────────────────────────────────────────
  app.use(express.json({ limit: '5mb' }));
  app.use(express.urlencoded({ extended: false }));
  app.use(attachRequestId);

  // ── Health check ───────────────────────────────────────────────────────────
  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', version: '1.0.0' });
  });

  // ── OAuth token endpoint (development stub) ────────────────────────────────
  // Production: replace with a real authorization server (Auth0, Keycloak, etc.)
  app.post('/oauth/token', express.urlencoded({ extended: false }), async (req, res) => {
    const { grant_type, client_id, client_secret, scope } = req.body as {
      grant_type?: string;
      client_id?: string;
      client_secret?: string;
      scope?: string;
    };

    if (grant_type !== 'client_credentials') {
      res.status(400).json({
        error: 'Unsupported grant_type. Expected: client_credentials',
        code: 'UNSUPPORTED_GRANT_TYPE',
        requestId: req.requestId,
      });
      return;
    }

    if (!client_id || !client_secret) {
      res.status(401).json({
        error: 'client_id and client_secret are required',
        code: 'MISSING_CREDENTIALS',
        requestId: req.requestId,
      });
      return;
    }

    // Stub credential check — production uses a real secrets store
    // Any non-empty client_id/secret pair is accepted in dev mode
    const orgId = client_id.replace(/^client_/, '');
    const grantedScope = scope ?? 'schedule:write outcomes:read';

    try {
      let token: string;

      if (process.env['NODE_ENV'] === 'test' || process.env['TEST_JWT_SECRET']) {
        const secret = new TextEncoder().encode(
          process.env['TEST_JWT_SECRET'] ?? 'test-secret-minimum-32-chars-long!!',
        );
        token = await new SignJWT({ orgId, scope: grantedScope })
          .setProtectedHeader({ alg: 'HS256' })
          .setSubject(client_id)
          .setExpirationTime('1h')
          .sign(secret);
      } else {
        // Production: issue RS256 token with private key
        // Implementation depends on key management approach
        res.status(501).json({
          error: 'Token issuance not configured for production environment',
          code: 'NOT_CONFIGURED',
        });
        return;
      }

      res.json({
        access_token: token,
        token_type: 'bearer',
        expires_in: 3600,
        scope: grantedScope,
      });
    } catch {
      res.status(500).json({
        error: 'Failed to issue token',
        code: 'TOKEN_ISSUANCE_ERROR',
        requestId: req.requestId ?? uuidv4(),
      });
    }
  });

  // ── API v1 routes ──────────────────────────────────────────────────────────
  app.use('/v1/schedules', createScheduleRouter(deps.scheduleRepo));
  app.use('/v1/outcomes', createOutcomesRouter(deps.userRepo));

  // ── 404 handler ────────────────────────────────────────────────────────────
  app.use((req, res) => {
    res.status(404).json({
      error: `Route ${req.method} ${req.path} not found`,
      code: 'NOT_FOUND',
    });
  });

  // ── Error handler ───────────────────────────────────────────────────────────
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error('[API Error]', err);
    res.status(500).json({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
    });
  });

  return { app };
}
