// Global sanitization and basic validation middleware
// - Recursively sanitizes req.body, req.query, req.params
// - Strips script tags and dangerous characters from strings
// - Removes prototype pollution keys
// - Ensures only plain JSON-compatible types pass through

function isPlainObject(value) {
  if (Object.prototype.toString.call(value) !== "[object Object]") return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

const DANGEROUS_KEYS = new Set(["__proto__", "constructor", "prototype"]);

function sanitizeString(str) {
  // Normalize to string
  let s = String(str);
  // Remove script/style tags and their content
  s = s.replace(/<\/(script|style)>/gi, "").replace(/<(script|style)[^>]*>[\s\S]*?<\/(script|style)>/gi, "");
  // Neutralize on* event handlers and javascript: URLs
  s = s.replace(/on\w+\s*=\s*"[^"]*"/gi, "");
  s = s.replace(/on\w+\s*=\s*'[^']*'/gi, "");
  s = s.replace(/on\w+\s*=\s*[^\s>]+/gi, "");
  s = s.replace(/javascript:\s*/gi, "");
  // Remove HTML comments and iframes/object tags
  s = s.replace(/<!--([\s\S]*?)-->/g, "");
  s = s.replace(/<\/(iframe|object|embed)>/gi, "").replace(/<(iframe|object|embed)[^>]*>[\s\S]*?<\/(iframe|object|embed)>/gi, "");
  // Trim excessive whitespace
  s = s.trim();
  return s;
}

function sanitizeValue(value, depth = 0) {
  if (depth > 50) return undefined; // prevent cyclic/too deep structures
  if (value == null) return value;
  if (typeof value === "string") return sanitizeString(value);
  if (typeof value === "number" || typeof value === "boolean") return value;
  if (Array.isArray(value)) return value.map((v) => sanitizeValue(v, depth + 1)).filter((v) => v !== undefined);
  if (isPlainObject(value)) {
    const out = {};
    for (const [k, v] of Object.entries(value)) {
      if (DANGEROUS_KEYS.has(k)) continue;
      const nk = sanitizeString(k);
      const nv = sanitizeValue(v, depth + 1);
      if (nv !== undefined) out[nk] = nv;
    }
    return out;
  }
  // Drop unsupported types (functions, symbols, BigInt, dates, buffers)
  return undefined;
}

export default function sanitizeMiddleware(req, res, next) {
  try {
    // Clone and sanitize each input source
   if (req.body && Object.keys(req.body).length > 0) {
  Object.assign(req.body, sanitizeValue(req.body));
}
if (req.query && Object.keys(req.query).length > 0) {
  Object.assign(req.query, sanitizeValue(req.query));
}
if (req.params && Object.keys(req.params).length > 0) {
  Object.assign(req.params, sanitizeValue(req.params));
}


    // Basic size guard
    const MAX_BODY_SIZE_KEYS = 5000;
    if (req.body && isPlainObject(req.body) && Object.keys(req.body).length > MAX_BODY_SIZE_KEYS) {
      return res.status(413).json({ error: "Request body too large" });
    }

    next();
  } catch (err) {
    next(err);
  }
}
