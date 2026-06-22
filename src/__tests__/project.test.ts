import request from 'supertest';
import app from '../app';
import { setupTestDB } from './setup';

setupTestDB();

describe('Project Endpoints', () => {
  let token: string;
  let adminToken: string;

  const registerAndLogin = async (email: string, role = 'member') => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Test User',
      email,
      password: 'password123',
      role,
    });
    return res.body.data.token;
  };

  beforeEach(async () => {
    token = await registerAndLogin('user@example.com', 'member');
    adminToken = await registerAndLogin('admin@example.com', 'admin');
  });

  describe('POST /api/projects', () => {
    it('should create a project', async () => {
      const res = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Test Project', description: 'A test project' });

      expect(res.status).toBe(201);
      expect(res.body.data.title).toBe('Test Project');
    });

    it('should fail without auth', async () => {
      const res = await request(app)
        .post('/api/projects')
        .send({ title: 'Test Project' });

      expect(res.status).toBe(401);
    });

    it('should fail without title', async () => {
      const res = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${token}`)
        .send({ description: 'No title' });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/projects', () => {
    beforeEach(async () => {
      await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Project 1' });
      await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Project 2' });
    });

    it('should get all projects for the user', async () => {
      const res = await request(app)
        .get('/api/projects')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(2);
      expect(res.body.pagination).toBeDefined();
      expect(res.body.pagination.total).toBe(2);
    });

    it('should support pagination', async () => {
      const res = await request(app)
        .get('/api/projects?page=1&limit=1')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.pagination.totalPages).toBe(2);
    });

    it('admin should see all projects', async () => {
      const res = await request(app)
        .get('/api/projects')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('GET /api/projects/:id', () => {
    it('should get a project by ID', async () => {
      const createRes = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Test Project' });

      const res = await request(app)
        .get(`/api/projects/${createRes.body.data._id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.title).toBe('Test Project');
    });

    it('should return 404 for non-existent project', async () => {
      const res = await request(app)
        .get('/api/projects/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(404);
    });
  });

  describe('PUT /api/projects/:id', () => {
    it('should update a project', async () => {
      const createRes = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Old Title' });

      const res = await request(app)
        .put(`/api/projects/${createRes.body.data._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'New Title', status: 'completed' });

      expect(res.status).toBe(200);
      expect(res.body.data.title).toBe('New Title');
      expect(res.body.data.status).toBe('completed');
    });
  });

  describe('DELETE /api/projects/:id', () => {
    it('should delete a project', async () => {
      const createRes = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'To Delete' });

      const res = await request(app)
        .delete(`/api/projects/${createRes.body.data._id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);

      const getRes = await request(app)
        .get(`/api/projects/${createRes.body.data._id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(getRes.status).toBe(404);
    });
  });
});
