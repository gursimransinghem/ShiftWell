/**
 * ShiftWell Enterprise API — Sliding-Window Rate Limiter
 *
 * Limits requests to 100 per minute per client_id (JWT sub claim).
 * Falls back to IP address when no authenticated client_id is available.
 *
 * Algorithm: sliding window log
 *   - Stores a list of request timestamps per client in a Map
 *   - On each request: evict timestamps older than 60 seconds
 *   - If remaining count < limit: allow and record timestamp
 *   - Otherwise: return 429 with Retry-After header
 *
 * Sliding window (vs fixed window):
 *   - No burst vulnerability at window boundary
 *   - Consistent rate across any 60-second period
 *   - Trade-off: higher memory use (O(requests) vs O(clients))
 *
 * Memory management:
 *   - Idle clients (no requests in 2× window) are removed on the next
 *     request from any client (lazy GC — avoids a setInterval)
 *
 * Phase 29 — API Layer (ENT-05)
 */

import type { Request, Response, NextFunction } from 'express';

// ─── Configuration ─────────────────────────────────────────────────────────────

const DEFAULT_LIMIT = 100;       // max requests per window
const WINDOW_MS = 60 * 1000;     // 60-second window
const GC_INTERVAL_FACTOR = 2;    // evict clients inactive for 2× window

// ─── State ─────────────────────────────────────────────────────────────────────

/**
 * Map of client_id → sorted list of request timestamps (Unix ms).
 * Mutated in-place for performance (no object allocation per request).
 */
const windowMap = new Map<string, number[]>();

/** Track when each client last had activity (for GC) */
const lastSeenMap = new Map<string, number>();

let requestsSinceLastGc = 0;
const GC_EVERY_N_REQUESTS = 500;

// ─── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Lazy garbage collection: remove clients that have been idle for 2× window.
 * Called every GC_EVERY_N_REQUESTS requests to amortize cost.
 */
function maybePruneOldClients(now: number): void {
  requestsSinceLastGc++;
  if (requestsSinceLastGc < GC_EVERY_N_REQUESTS) return;
  requestsSinceLastGc = 0;

  const cutoff = now - GC_INTERVAL_FACTOR * WINDOW_MS;
  for (const [clientId, lastSeen] of lastSeenMap.entries()) {
    if (lastSeen < cutoff) {
      windowMap.delete(clientId);
      lastSeenMap.delete(clientId);
    }
  }
}

/**
 * Identify the rate-limit key for a request.
 * Prefer authenticated client_id; fall back to IP.
 */
function getClientKey(req: Request): string {
  if (req.clientId) return `client:${req.clientId}`;
  const ip = req.ip ?? req.socket.remoteAddress ?? 'unknown';
  return `ip:${ip}`;
}

// ─── Middleware ────────────────────────────────────────────────────────────────

/**
 * Sliding-window rate limiter middleware.
 *
 * Attaches standard rate-limit headers:
 *   X-RateLimit-Limit       — max requests per window
 *   X-RateLimit-Remaining   — requests remaining in current window
 *   X-RateLimit-Reset       — Unix timestamp when window resets (oldest entry)
 *
 * On 429:
 *   Retry-After             — seconds until the oldest entry expires
 */
export function rateLimit(limit: number = DEFAULT_LIMIT) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const now = Date.now();
    const clientKey = getClientKey(req);

    maybePruneOldClients(now);

    // Retrieve or initialise timestamp window for this client
    let timestamps = windowMap.get(clientKey);
    if (!timestamps) {
      timestamps = [];
      windowMap.set(clientKey, timestamps);
    }

    // Evict timestamps outside the current sliding window
    const windowStart = now - WINDOW_MS;
    let i = 0;
    while (i < timestamps.length && timestamps[i] < windowStart) {
      i++;
    }
    if (i > 0) {
      timestamps.splice(0, i);
    }

    const remaining = limit - timestamps.length;

    // Compute reset time (when the oldest in-window entry expires)
    const resetAt = timestamps.length > 0
      ? Math.ceil((timestamps[0] + WINDOW_MS) / 1000)
      : Math.ceil((now + WINDOW_MS) / 1000);

    // Standard rate-limit headers (always attached, even on 429)
    res.setHeader('X-RateLimit-Limit', limit);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, remaining - 1));
    res.setHeader('X-RateLimit-Reset', resetAt);

    if (remaining <= 0) {
      const retryAfter = Math.ceil((timestamps[0] + WINDOW_MS - now) / 1000);
      res.setHeader('Retry-After', retryAfter);
      res.status(429).json({
        error: `Rate limit exceeded. Maximum ${limit} requests per 60 seconds.`,
        code: 'RATE_LIMIT_EXCEEDED',
        requestId: req.requestId,
      });
      return;
    }

    // Record this request
    timestamps.push(now);
    lastSeenMap.set(clientKey, now);

    next();
  };
}

/**
 * Exported for tests — reset internal state between test suites.
 */
export function _resetRateLimitState(): void {
  windowMap.clear();
  lastSeenMap.clear();
  requestsSinceLastGc = 0;
}
