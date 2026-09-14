/**
 * Government & Enterprise Grade Security Middleware Suite
 * Ministry of Earth Sciences (MoES) & India Meteorological Department (IMD)
 * CAPACITY CONNECT Platform
 */

// In-Memory Sliding Window Rate Limiter (Production-grade, zero external latency)
class SlidingWindowRateLimiter {
  constructor({ windowMs = 15 * 60 * 1000, max = 100, message = 'Too many requests, please try again later.' }) {
    this.windowMs = windowMs;
    this.max = max;
    this.message = message;
    this.hits = new Map(); // ip -> [timestamps]

    // Periodic garbage collection every 5 minutes
    setInterval(() => {
      const now = Date.now();
      for (const [ip, timestamps] of this.hits.entries()) {
        const valid = timestamps.filter(t => now - t < this.windowMs);
        if (valid.length === 0) {
          this.hits.delete(ip);
        } else {
          this.hits.set(ip, valid);
        }
      }
    }, 5 * 60 * 1000).unref();
  }

  middleware() {
    return (req, res, next) => {
      // Extract client IP (respecting reverse proxies)
      const forwarded = req.headers['x-forwarded-for'];
      const ip = forwarded ? forwarded.split(',')[0].trim() : (req.socket.remoteAddress || 'unknown-ip');
      const now = Date.now();

      const timestamps = this.hits.get(ip) || [];
      const windowStart = now - this.windowMs;
      const validTimestamps = timestamps.filter(t => t > windowStart);

      if (validTimestamps.length >= this.max) {
        const oldest = validTimestamps[0];
        const retryAfterSeconds = Math.ceil((oldest + this.windowMs - now) / 1000);
        
        res.setHeader('Retry-After', retryAfterSeconds);
        res.setHeader('X-RateLimit-Limit', this.max);
        res.setHeader('X-RateLimit-Remaining', 0);
        res.setHeader('X-RateLimit-Reset', Math.ceil((oldest + this.windowMs) / 1000));

        return res.status(429).json({
          success: false,
          securityAlert: 'RATE_LIMIT_EXCEEDED',
          message: this.message,
          retryAfterSeconds
        });
      }

      validTimestamps.push(now);
      this.hits.set(ip, validTimestamps);

      res.setHeader('X-RateLimit-Limit', this.max);
      res.setHeader('X-RateLimit-Remaining', Math.max(0, this.max - validTimestamps.length));

      next();
    };
  }
}

// 1. Strict Auth Rate Limiter (Brute-Force defense: 15 attempts in production, 200 in dev/test)
const authRateLimiter = new SlidingWindowRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 15 : 200,
  message: 'Multiple authentication attempts detected from this network. For security reasons, please wait before trying again.'
}).middleware();

// 2. General API Rate Limiter (Anti-DDoS / Scraping defense: 500 requests / 15 minutes)
const apiRateLimiter = new SlidingWindowRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: 'API rate limit exceeded. Please throttle high-frequency client requests.'
}).middleware();

// 3. Recursive NoSQL Injection Sanitizer
// Detects and strips MongoDB query injection operators ($gt, $ne, $where, etc.)
const sanitizeObjectKeys = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;

  if (Array.isArray(obj)) {
    return obj.map(sanitizeObjectKeys);
  }

  const cleaned = {};
  for (const [key, value] of Object.entries(obj)) {
    // Strip operators starting with $ or containing a period (.)
    if (key.startsWith('$') || key.includes('.')) {
      console.warn(`[SECURITY WARN] Stripped potential NoSQL injection key: "${key}"`);
      continue;
    }
    cleaned[key] = sanitizeObjectKeys(value);
  }
  return cleaned;
};

const nosqlSanitizer = (req, res, next) => {
  if (req.body) req.body = sanitizeObjectKeys(req.body);
  if (req.params) req.params = sanitizeObjectKeys(req.params);
  if (req.query) req.query = sanitizeObjectKeys(req.query);
  next();
};

// 4. Cross-Site Scripting (XSS) Sanitizer
// Strips dangerous executable script tags and pseudo-protocols from input strings
const sanitizeString = (str) => {
  if (typeof str !== 'string') return str;
  return str
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/vbscript:/gi, '')
    .replace(/on\w+\s*=/gi, '');
};

const sanitizeXssDeep = (obj) => {
  if (!obj || typeof obj !== 'object') {
    return typeof obj === 'string' ? sanitizeString(obj) : obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(sanitizeXssDeep);
  }
  const cleaned = {};
  for (const [key, value] of Object.entries(obj)) {
    cleaned[key] = sanitizeXssDeep(value);
  }
  return cleaned;
};

const xssSanitizer = (req, res, next) => {
  if (req.body) req.body = sanitizeXssDeep(req.body);
  if (req.query) req.query = sanitizeXssDeep(req.query);
  next();
};

// 5. HTTP Parameter Pollution (HPP) Prevention
// Prevents array spoofing via duplicate query params e.g. ?role=student&role=admin
const hppSanitizer = (whitelist = ['domains', 'categories', 'levels', 'status', 'tags']) => {
  return (req, res, next) => {
    if (req.query) {
      for (const [key, value] of Object.entries(req.query)) {
        if (Array.isArray(value) && !whitelist.includes(key)) {
          // Keep only the last provided parameter value to prevent pollution exploits
          req.query[key] = value[value.length - 1];
        }
      }
    }
    next();
  };
};

// 6. Security Headers & Defense-in-Depth Middleware
const securityHeaders = (req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Allow uploaded learning materials (PDF, DOC, slides) to be framed inside client course player
  if (req.path?.startsWith('/uploads') || req.url?.startsWith('/uploads') || req.originalUrl?.startsWith('/uploads')) {
    res.removeHeader('X-Frame-Options');
    res.removeHeader('Cross-Origin-Opener-Policy');
    res.setHeader('Content-Security-Policy', "frame-ancestors 'self' http://localhost:5173 http://127.0.0.1:5173 http://localhost:3000 *; object-src 'self' blob: data: *;");
  } else {
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  }

  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');
  res.removeHeader('X-Powered-By'); // Hide Express footprint
  next();
};

module.exports = {
  authRateLimiter,
  apiRateLimiter,
  nosqlSanitizer,
  xssSanitizer,
  hppSanitizer,
  securityHeaders
};
