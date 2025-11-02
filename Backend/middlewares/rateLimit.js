// Lightweight in-memory rate limiter middleware
// Not intended for multi-instance deployments without a shared store.
// Usage:
//   import rateLimit from './middlewares/rateLimit.js'
//   app.use(rateLimit({ windowMs: 15*60*1000, max: 1000 }))
//   router.post('/login', rateLimit({ windowMs: 15*60*1000, max: 20 }), handler)

const buckets = new Map(); // key -> { tokens: number, resetAt: ms }

function now() {
  return Date.now();
}

function getKey(req, keyGenerator) {
  try {
    if (typeof keyGenerator === 'function') return keyGenerator(req);
  } catch {}
  // default key: ip + route base path
  const ip = (req.ip || req.connection?.remoteAddress || 'unknown').toString();
  const base = req.baseUrl || '';
  return `${ip}:${base}`;
}

export default function rateLimit(options = {}) {
  const windowMs = Number(options.windowMs ?? 15 * 60 * 1000); // 15 minutes
  const max = Number(options.max ?? 1000);
  const message = options.message || 'Too many requests, please try again later.';
  const keyGenerator = options.keyGenerator;

  return function rateLimitMiddleware(req, res, next) {
    const key = getKey(req, keyGenerator);
    const nowMs = now();

    let entry = buckets.get(key);
    if (!entry || nowMs >= entry.resetAt) {
      entry = { tokens: max, resetAt: nowMs + windowMs };
      buckets.set(key, entry);
    }

    if (entry.tokens <= 0) {
      const retryAfterSec = Math.ceil((entry.resetAt - nowMs) / 1000);
      res.set('Retry-After', String(retryAfterSec));
      return res.status(429).json({ error: message });
    }

    entry.tokens -= 1;

    // Best-effort periodic cleanup to avoid unbounded memory growth
    if (buckets.size > 50000) {
      const cutoff = now() - windowMs;
      for (const [k, v] of buckets.entries()) {
        if (v.resetAt < cutoff) buckets.delete(k);
      }
    }

    next();
  };
}
