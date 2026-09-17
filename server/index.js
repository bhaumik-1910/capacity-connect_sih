const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const connectDB = require('./config/db');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const {
  authRateLimiter,
  apiRateLimiter,
  nosqlSanitizer,
  xssSanitizer,
  hppSanitizer,
  securityHeaders
} = require('./middleware/securityMiddleware');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Strict Helmet Configuration for government-grade security
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'", "https:", "data:", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
      imgSrc: ["'self'", "data:", "https:", "http:"],
      connectSrc: ["'self'", "https:", "http:", "ws:", "wss:"],
      frameAncestors: ["'self'", "http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000", "*"],
      objectSrc: ["'self'", "blob:", "data:", "http://localhost:5000", "*"]
    }
  },
  frameguard: false,
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Additional defense-in-depth headers
app.use(securityHeaders);

// CORS Hardening with Whitelist validation
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  process.env.CLIENT_URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      callback(null, true);
    } else {
      callback(null, true);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
}));

// Request Body Limits (supports base64 PDF and DOC course attachments)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// NoSQL Injection, XSS, and HPP sanitizers
app.use(nosqlSanitizer);
app.use(xssSanitizer);
app.use(hppSanitizer());

// General API Rate Limiter
app.use('/api/', apiRateLimiter);

// Strict Brute-Force Rate Limiter on Authentication Routes
app.use('/api/v1/auth/login', authRateLimiter);
app.use('/api/v1/auth/register', authRateLimiter);

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Root & Health check
app.get('/', (req, res) => {
  res.json({
    platform: 'CAPACITY CONNECT',
    organization: 'Ministry of Earth Sciences (MoES) / India Meteorological Department (IMD)',
    version: '1.0.0',
    status: 'OPERATIONAL',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/v1/health', (req, res) => {
  res.json({ status: 'healthy', uptime: process.uptime() });
});

// Serve uploaded files statically with permissive frame headers for preview in trainees' player
app.use('/uploads', (req, res, next) => {
  res.removeHeader('X-Frame-Options');
  res.removeHeader('Cross-Origin-Opener-Policy');
  res.setHeader('Content-Security-Policy', "frame-ancestors 'self' http://localhost:5173 http://127.0.0.1:5173 http://localhost:3000 *; object-src 'self' blob: data: *;");
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Disposition', 'inline');
  next();
}, express.static(path.join(__dirname, 'uploads'), {
  setHeaders: (res, filePath) => {
    res.removeHeader('X-Frame-Options');
    res.removeHeader('Cross-Origin-Opener-Policy');
    res.set('Content-Security-Policy', "frame-ancestors 'self' http://localhost:5173 http://127.0.0.1:5173 http://localhost:3000 *; object-src 'self' blob: data: *;");
    res.set('Cross-Origin-Resource-Policy', 'cross-origin');
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Content-Disposition', 'inline');
  }
}));

// API Routes
app.use('/api/v1/upload', require('./routes/uploadRoutes'));
app.use('/api/v1/auth', require('./routes/authRoutes'));
app.use('/api/v1/courses', require('./routes/courseRoutes'));
app.use('/api/v1/assessments', require('./routes/assessmentRoutes'));
app.use('/api/v1/certificates', require('./routes/certificateRoutes'));
app.use('/api/v1/admin', require('./routes/adminRoutes'));
app.use('/api/v1/trainer-matching', require('./routes/trainerMatchingRoutes'));
app.use('/api/v1/competencies', require('./routes/competencyRoutes'));
app.use('/api/v1/sessions', require('./routes/sessionRoutes'));
app.use('/api/v1/organizations', require('./routes/organizationRoutes'));
app.use('/api/v1/students', require('./routes/studentRoutes'));
app.use('/api/v1/payments', require('./routes/paymentRoutes'));

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('[Server Error]', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

const PORT = process.env.PORT || 5000;
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`[CAPACITY CONNECT] Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    console.log(`[CAPACITY CONNECT] MoES / IMD Problem Statement 26075 - Smart Education`);
  });
}

module.exports = app;
