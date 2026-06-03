const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { register, httpRequestDuration, httpRequestTotal } = require('./middleware/metrics');

const app = express();

// ─── Security & Middleware ───────────────────────────────────────
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('combined'));

// ─── Prometheus Metrics Middleware ───────────────────────────────
app.use((req, res, next) => {
  const end = httpRequestDuration.startTimer();
  res.on('finish', () => {
    const route = req.route ? req.route.path : req.path;
    end({ method: req.method, route, status_code: res.statusCode });
    httpRequestTotal.inc({ method: req.method, route, status_code: res.statusCode });
  });
  next();
});

// ─── Routes ──────────────────────────────────────────────────────
app.use('/api/tasks', require('./routes/tasks'));

// Health check — used by K8s liveness & readiness probes
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    version: process.env.APP_VERSION || '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Prometheus metrics endpoint — scraped by Prometheus every 15s
app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (err) {
    res.status(500).end(err.message);
  }
});

// API info
app.get('/', (req, res) => {
  res.json({
    name: 'Task Manager API',
    version: process.env.APP_VERSION || '1.0.0',
    endpoints: {
      health: 'GET /health',
      metrics: 'GET /metrics',
      tasks: {
        list:   'GET    /api/tasks',
        create: 'POST   /api/tasks',
        get:    'GET    /api/tasks/:id',
        update: 'PUT    /api/tasks/:id',
        delete: 'DELETE /api/tasks/:id'
      }
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

module.exports = app;
