// Centralized error handling middlewares
// Usage: place notFound after routes that weren't matched, then errorHandler last

function safeMessage(msg) {
  if (!msg) return 'Internal Server Error';
  const s = String(msg).slice(0, 500);
  return s.replace(/[\r\n\t]+/g, ' ').trim();
}

// 404 handler for unmatched routes
export function notFound(req, res, next) {
  res.status(404).json({ error: 'Not Found', path: req.originalUrl });
}

// Centralized error handler
export function errorHandler(err, req, res, next) {
  // Handle malformed JSON errors thrown by express.json()
  if (err?.type === 'entity.parse.failed' || err instanceof SyntaxError) {
    return res.status(400).json({ error: 'Invalid JSON payload' });
  }

  const status = typeof err?.status === 'number' && err.status >= 400 && err.status < 600
    ? err.status
    : 500;

  const code = err?.code && typeof err.code === 'string' ? err.code : undefined;

  // Avoid leaking stack/details in production; include minimal info
  const payload = {
    error: safeMessage(err?.message),
    ...(code ? { code } : {}),
  };

  // Optionally log the error (truncate to keep logs tidy)
  console.error('[ERROR]', {
    path: req.originalUrl,
    method: req.method,
    status,
    message: safeMessage(err?.message),
  });

  res.status(status).json(payload);
}
