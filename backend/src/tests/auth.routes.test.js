const request = require('supertest');
const app = require('../app');

describe('Auth routes', () => {
  test('GET / returns API status', async () => {
    const response = await request(app).get('/');

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('HR Evaluation Exam System API is running');
  });

  test('POST /api/auth/login requires email and password', async () => {
    const response = await request(app).post('/api/auth/login').send({});

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Email and password are required');
  });

  test('POST /api/auth/register requires main fields', async () => {
    const response = await request(app).post('/api/auth/register').send({});

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Name, email, password, and role are required');
  });

  test('POST /api/auth/forgot-password requires email', async () => {
    const response = await request(app).post('/api/auth/forgot-password').send({});

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Email is required');
  });
});
