/**
 * ShiftWell Enterprise API — JWT Auth Middleware
 *
 * Verifies Bearer tokens issued by POST /oauth/token (client_credentials flow).
 * Extracts orgId from token claims and attaches to req for downstream handlers.
 *
 * Token format (RS256 JWT):
 *   sub    — client_id
 *   orgId  — organisation this token is scoped to
 *   scope  — space-separated granted scopes (e.g. "schedule:write outcomes:read")
 *   exp    — expiry (Unix timestamp)
 *   iat    — issued-at (Unix timestamp)
 *
 * Uses `jose` library (JOSE standard, Edge-runtime compatible, no node-crypto coupling).
 *
 * Phase 29 — API Layer (ENT-05)
 */

import type { Request, Response, NextFunction } from 'express';
import { jwtVerify, importSPKI, type JWTPayload } from 'jose';
import { v4 as uuidv4 } from 'uuid';

// ─── Request Augmentation ──────────────────────────────────────────────────────

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      orgId: string;
      clientId: string;
      scope: string;
      requestId: string;
    }
  }
}

// ─── JWT Claims ────────────────────────────────────────────────────────────────

interface ShiftWellClaims extends JWTPayload {
  orgId: string;
  scope: string;
}

// ─── Key Management ───────────────────────────────────────────────────────────

/**
 * Resolve the RS256 public key for JWT verification.
 *
 * Production: reads from JWT_PUBLIC_KEY env var (PEM string).
 * Test/dev: uses a hardcoded RSA-2048 test public key.
 *
 * Key rotation: update JWT_PUBLIC_KEY env var + restart.
 * NEVER log or expose the private key.
 */
async function getPublicKey() {
  const envKey = process.env['JWT_PUBLIC_KEY'];
  if (envKey) {
    return importSPKI(envKey, 'RS256');
  }

  // Development/test fallback — RSA-2048 test key (not for production use)
  // This key is intentionally public — it only verifies, never signs.
  // The corresponding private key is used only in tests via TEST_JWT_SECRET.
  const testPublicKeyPem = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA2a2rwplBQLF29amygykE
mTL7UxoRJcUm1CR8/xtqDN3NmJEZT5lAyNBKHniBNSFHIbNUEirlQ7FEVq6d6nDp
JMnf11+g7TkJBGMNYEZnHIBRECqb0VwZXKC2+jq8Cre4P8/ZoXVx1l/bj5PmPT
3YcW7ZoFIHBgOKMX6Qo6ADTgB3MZAVrOz8ASGbMZiJK2GpfSbTt8mvJuiMzXWc
+Cz1/NamN9FdKTaJzZt8M1j+rkbY3mFrDUQhR6xpDaJt/nNaZFU5pPkByTgqT3
2b8F7Sz+6yFfLWzPksFWTVNGrxNnHzq2u1OzfR0KaBfJpCLiB9Q4TcPi6kfZqQ
IDAQAB
-----END PUBLIC KEY-----`;

  return importSPKI(testPublicKeyPem, 'RS256');
}

// Cache the resolved key (module-level singleton)
let resolvedPublicKey: Awaited<ReturnType<typeof getPublicKey>> | null = null;

async function resolvePublicKey() {
  if (!resolvedPublicKey) {
    resolvedPublicKey = await getPublicKey();
  }
  return resolvedPublicKey;
}

// Allow tests to inject a symmetric key for HS256 test tokens
let testSymmetricSecret: Uint8Array | null = null;

/**
 * Override the verification key for testing.
 * Call with null to reset to RS256 production mode.
 */
export function _setTestSecret(secret: Uint8Array | null): void {
  testSymmetricSecret = secret;
  resolvedPublicKey = null;
}

// ─── Middleware ────────────────────────────────────────────────────────────────

/**
 * Attach a unique requestId to every request.
 * Used for correlating logs and error responses.
 */
export function attachRequestId(req: Request, _res: Response, next: NextFunction): void {
  req.requestId = uuidv4();
  next();
}

/**
 * Require a valid Bearer JWT on the request.
 *
 * On success: attaches req.orgId, req.clientId, req.scope, then calls next().
 * On failure: returns 401 JSON with error + requestId.
 *
 * Scope enforcement is handled per-route via requireScope().
 */
export async function authenticate(req: Request, res: Response, next: NextFunction): Promise<void> {
  const requestId = req.requestId ?? uuidv4();

  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      error: 'Missing or malformed Authorization header. Expected: Bearer <token>',
      code: 'MISSING_TOKEN',
      requestId,
    });
    return;
  }

  const token = authHeader.slice(7);

  try {
    let payload: JWTPayload;

    if (testSymmetricSecret) {
      // Test mode: HS256 symmetric verification
      const { payload: p } = await jwtVerify(token, testSymmetricSecret, {
        algorithms: ['HS256'],
      });
      payload = p;
    } else {
      // Production mode: RS256 asymmetric verification
      const publicKey = await resolvePublicKey();
      const { payload: p } = await jwtVerify(token, publicKey, {
        algorithms: ['RS256'],
      });
      payload = p;
    }

    const claims = payload as ShiftWellClaims;

    // Require orgId claim — tokens without it can't be scoped to an org
    if (!claims.orgId || typeof claims.orgId !== 'string') {
      res.status(401).json({
        error: 'Token missing required orgId claim',
        code: 'INVALID_TOKEN_CLAIMS',
        requestId,
      });
      return;
    }

    if (!claims.sub || typeof claims.sub !== 'string') {
      res.status(401).json({
        error: 'Token missing required sub (client_id) claim',
        code: 'INVALID_TOKEN_CLAIMS',
        requestId,
      });
      return;
    }

    // Attach verified claims to request
    req.orgId = claims.orgId;
    req.clientId = claims.sub;
    req.scope = typeof claims.scope === 'string' ? claims.scope : '';

    next();
  } catch (err) {
    const errMessage = err instanceof Error ? err.message : 'Unknown error';
    const isExpired = errMessage.includes('exp') || errMessage.includes('expired');

    res.status(401).json({
      error: isExpired ? 'Token has expired' : 'Invalid token',
      code: isExpired ? 'TOKEN_EXPIRED' : 'INVALID_TOKEN',
      requestId,
    });
  }
}

/**
 * Scope enforcement middleware factory.
 *
 * Usage: router.post('/schedules', authenticate, requireScope('schedule:write'), handler)
 *
 * Returns 403 if the authenticated token does not include the required scope.
 */
export function requireScope(requiredScope: string) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const grantedScopes = (req.scope ?? '').split(' ').filter(Boolean);
    if (!grantedScopes.includes(requiredScope)) {
      res.status(403).json({
        error: `Token scope insufficient. Required: ${requiredScope}`,
        code: 'INSUFFICIENT_SCOPE',
        requestId: req.requestId,
      });
      return;
    }
    next();
  };
}
