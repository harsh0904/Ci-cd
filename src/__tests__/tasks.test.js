const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');

// Use in-memory MongoDB for tests
const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/taskmanager_test';

beforeAll(async () => {
  await mongoose.connect(MONGO_URI);
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

// ─── Health Check ─────────────────────────────────────────────────
describe('GET /health', () => {
  it('returns 200 with status ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body).toHaveProperty('uptime');
    expect(res.body).toHaveProperty('version');
  });
});

// ─── Metrics Endpoint ─────────────────────────────────────────────
describe('GET /metrics', () => {
  it('returns Prometheus metrics text', async () => {
    const res = await request(app).get('/metrics');
    expect(res.status).toBe(200);
    expect(res.text).toContain('taskapi_http_requests_total');
  });
});

// ─── Task CRUD ────────────────────────────────────────────────────
describe('POST /api/tasks', () => {
  it('creates a task with valid data', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .send({ title: 'Deploy to K8s', priority: 'high', status: 'todo' });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe('Deploy to K8s');
    expect(res.body.data.priority).toBe('high');
  });

  it('rejects task without title', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .send({ description: 'no title' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

describe('GET /api/tasks', () => {
  beforeEach(async () => {
    await request(app).post('/api/tasks').send({ title: 'Task 1', status: 'todo' });
    await request(app).post('/api/tasks').send({ title: 'Task 2', status: 'done' });
    await request(app).post('/api/tasks').send({ title: 'Task 3', status: 'in-progress' });
  });

  it('returns all tasks', async () => {
    const res = await request(app).get('/api/tasks');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(3);
    expect(res.body.pagination.total).toBe(3);
  });

  it('filters by status', async () => {
    const res = await request(app).get('/api/tasks?status=done');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].status).toBe('done');
  });
});

describe('PUT /api/tasks/:id', () => {
  it('updates a task', async () => {
    const create = await request(app).post('/api/tasks').send({ title: 'Original' });
    const id = create.body.data._id;

    const res = await request(app)
      .put(`/api/tasks/${id}`)
      .send({ title: 'Updated', status: 'done' });

    expect(res.status).toBe(200);
    expect(res.body.data.title).toBe('Updated');
    expect(res.body.data.status).toBe('done');
  });

  it('returns 404 for non-existent task', async () => {
    const res = await request(app)
      .put('/api/tasks/507f1f77bcf86cd799439011')
      .send({ title: 'Ghost' });
    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/tasks/:id', () => {
  it('deletes a task', async () => {
    const create = await request(app).post('/api/tasks').send({ title: 'To Delete' });
    const id = create.body.data._id;

    const del = await request(app).delete(`/api/tasks/${id}`);
    expect(del.status).toBe(200);
    expect(del.body.success).toBe(true);

    const get = await request(app).get(`/api/tasks/${id}`);
    expect(get.status).toBe(404);
  });
});
