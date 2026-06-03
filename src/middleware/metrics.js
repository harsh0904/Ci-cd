const client = require('prom-client');

// Create a Registry
const register = new client.Registry();

// Add default metrics (CPU, memory, event loop lag, etc.)
client.collectDefaultMetrics({ register, prefix: 'taskapi_' });

// ─── Custom Metrics ───────────────────────────────────────────────

// HTTP request duration histogram
const httpRequestDuration = new client.Histogram({
  name: 'taskapi_http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.01, 0.05, 0.1, 0.3, 0.5, 1, 2, 5],
  registers: [register]
});

// HTTP request counter
const httpRequestTotal = new client.Counter({
  name: 'taskapi_http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register]
});

// Active tasks gauge (updated on each request)
const activeTasksGauge = new client.Gauge({
  name: 'taskapi_active_tasks_total',
  help: 'Total number of active (non-done) tasks in database',
  registers: [register]
});

module.exports = { register, httpRequestDuration, httpRequestTotal, activeTasksGauge };
