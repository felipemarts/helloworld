const request = require('supertest');
const fs = require('fs');

describe('Task API Endpoints', () => {
  let app;
  let taskManager;
  let server;

  beforeAll(() => {
    // Import after ensuring clean state
    const indexModule = require('./index');
    app = indexModule.app;
    taskManager = indexModule.taskManager;
  });

  beforeEach(async () => {
    // Clear all tasks before each test
    await taskManager.clearAll();
  });

  afterAll(async () => {
    // Clean up
    await taskManager.close();
    
    // Remove test database directory
    const dbPath = './db';
    if (fs.existsSync(dbPath)) {
      fs.rmSync(dbPath, { recursive: true, force: true });
    }
  });

  describe('POST /api/tasks', () => {
    test('should create a new task with title and description', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .send({ title: 'Test Task', description: 'Test Description' })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toBe('Test Task');
      expect(response.body.description).toBe('Test Description');
      expect(response.body.completed).toBe(false);
    });

    test('should create a task with only title', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .send({ title: 'Test Task' })
        .expect(201);

      expect(response.body.title).toBe('Test Task');
      expect(response.body.description).toBe('');
    });

    test('should return 400 when title is missing', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .send({ description: 'Description only' })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/tasks', () => {
    test('should return empty array when no tasks exist', async () => {
      const response = await request(app)
        .get('/api/tasks')
        .expect(200);

      expect(response.body).toEqual([]);
    });

    test('should return all tasks', async () => {
      // Create some tasks
      await request(app).post('/api/tasks').send({ title: 'Task 1' });
      await request(app).post('/api/tasks').send({ title: 'Task 2' });
      await request(app).post('/api/tasks').send({ title: 'Task 3' });

      const response = await request(app)
        .get('/api/tasks')
        .expect(200);

      expect(response.body).toHaveLength(3);
    });
  });

  describe('GET /api/tasks/:id', () => {
    test('should return a specific task by ID', async () => {
      const createResponse = await request(app)
        .post('/api/tasks')
        .send({ title: 'Test Task', description: 'Description' });

      const taskId = createResponse.body.id;

      const response = await request(app)
        .get(`/api/tasks/${taskId}`)
        .expect(200);

      expect(response.body.id).toBe(taskId);
      expect(response.body.title).toBe('Test Task');
    });

    test('should return 404 for non-existent task', async () => {
      const response = await request(app)
        .get('/api/tasks/non-existent-id')
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('PUT /api/tasks/:id', () => {
    test('should update task title', async () => {
      const createResponse = await request(app)
        .post('/api/tasks')
        .send({ title: 'Original Title' });

      const taskId = createResponse.body.id;

      const response = await request(app)
        .put(`/api/tasks/${taskId}`)
        .send({ title: 'Updated Title' })
        .expect(200);

      expect(response.body.title).toBe('Updated Title');
      expect(response.body).toHaveProperty('updatedAt');
    });

    test('should update task description', async () => {
      const createResponse = await request(app)
        .post('/api/tasks')
        .send({ title: 'Task' });

      const taskId = createResponse.body.id;

      const response = await request(app)
        .put(`/api/tasks/${taskId}`)
        .send({ description: 'New Description' })
        .expect(200);

      expect(response.body.description).toBe('New Description');
    });

    test('should update task completed status', async () => {
      const createResponse = await request(app)
        .post('/api/tasks')
        .send({ title: 'Task' });

      const taskId = createResponse.body.id;

      const response = await request(app)
        .put(`/api/tasks/${taskId}`)
        .send({ completed: true })
        .expect(200);

      expect(response.body.completed).toBe(true);
    });

    test('should return 404 when updating non-existent task', async () => {
      const response = await request(app)
        .put('/api/tasks/non-existent-id')
        .send({ title: 'Updated Title' })
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('DELETE /api/tasks/:id', () => {
    test('should delete an existing task', async () => {
      const createResponse = await request(app)
        .post('/api/tasks')
        .send({ title: 'Task to Delete' });

      const taskId = createResponse.body.id;

      await request(app)
        .delete(`/api/tasks/${taskId}`)
        .expect(204);

      // Verify task is deleted
      await request(app)
        .get(`/api/tasks/${taskId}`)
        .expect(404);
    });

    test('should return 404 when deleting non-existent task', async () => {
      const response = await request(app)
        .delete('/api/tasks/non-existent-id')
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /health', () => {
    test('should return OK status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toEqual({ status: 'OK' });
    });
  });
});
