import request from 'supertest';
import app from '../app';
import { setupTestDB } from './setup';

setupTestDB();

describe('Task Endpoints', () => {
  let token: string;
  let projectId: string;

  beforeEach(async () => {
    const regRes = await request(app).post('/api/auth/register').send({
      name: 'Test User',
      email: 'user@example.com',
      password: 'password123',
    });
    token = regRes.body.data.token;

    const projRes = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Test Project' });
    projectId = projRes.body.data._id;
  });

  const createTask = (data = {}) =>
    request(app)
      .post(`/api/projects/${projectId}/tasks`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Test Task',
        description: 'A test task',
        dueDate: '2025-12-31',
        priority: 'medium',
        ...data,
      });

  describe('POST /api/projects/:projectId/tasks', () => {
    it('should create a task', async () => {
      const res = await createTask();

      expect(res.status).toBe(201);
      expect(res.body.data.title).toBe('Test Task');
      expect(res.body.data.status).toBe('pending');
      expect(res.body.data.priority).toBe('medium');
    });

    it('should fail without title', async () => {
      const res = await request(app)
        .post(`/api/projects/${projectId}/tasks`)
        .set('Authorization', `Bearer ${token}`)
        .send({ dueDate: '2025-12-31' });

      expect(res.status).toBe(400);
    });

    it('should fail for non-existent project', async () => {
      const res = await request(app)
        .post('/api/projects/507f1f77bcf86cd799439011/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Task', dueDate: '2025-12-31' });

      expect(res.status).toBe(404);
    });
  });

  describe('GET /api/projects/:projectId/tasks', () => {
    beforeEach(async () => {
      await createTask({ title: 'Task 1', priority: 'high', status: 'pending' });
      await createTask({ title: 'Task 2', priority: 'low', status: 'done' });
      await createTask({ title: 'Task 3', priority: 'medium', status: 'in_progress' });
    });

    it('should get all tasks for a project', async () => {
      const res = await request(app)
        .get(`/api/projects/${projectId}/tasks`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(3);
    });

    it('should filter by status', async () => {
      const res = await request(app)
        .get(`/api/projects/${projectId}/tasks?status=pending`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].status).toBe('pending');
    });

    it('should filter by priority', async () => {
      const res = await request(app)
        .get(`/api/projects/${projectId}/tasks?priority=high`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].priority).toBe('high');
    });

    it('should support pagination', async () => {
      const res = await request(app)
        .get(`/api/projects/${projectId}/tasks?page=1&limit=2`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(2);
      expect(res.body.pagination.totalPages).toBe(2);
    });

    it('should support sorting', async () => {
      const res = await request(app)
        .get(`/api/projects/${projectId}/tasks?sortBy=title&sortOrder=asc`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data[0].title).toBe('Task 1');
    });
  });

  describe('GET /api/projects/:projectId/tasks/:taskId', () => {
    it('should get a single task', async () => {
      const createRes = await createTask();
      const taskId = createRes.body.data._id;

      const res = await request(app)
        .get(`/api/projects/${projectId}/tasks/${taskId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data._id).toBe(taskId);
    });
  });

  describe('PUT /api/projects/:projectId/tasks/:taskId', () => {
    it('should update a task', async () => {
      const createRes = await createTask();
      const taskId = createRes.body.data._id;

      const res = await request(app)
        .put(`/api/projects/${projectId}/tasks/${taskId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'in_progress', priority: 'high' });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('in_progress');
      expect(res.body.data.priority).toBe('high');
    });
  });

  describe('DELETE /api/projects/:projectId/tasks/:taskId', () => {
    it('should delete a task', async () => {
      const createRes = await createTask();
      const taskId = createRes.body.data._id;

      const res = await request(app)
        .delete(`/api/projects/${projectId}/tasks/${taskId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);

      const getRes = await request(app)
        .get(`/api/projects/${projectId}/tasks/${taskId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(getRes.status).toBe(404);
    });
  });
});
