const TaskManager = require('./taskManager');
const fs = require('fs');
const path = require('path');

const TEST_DB_PATH = './test-db';

describe('TaskManager', () => {
  let taskManager;

  beforeEach(async () => {
    // Create a new TaskManager instance for each test
    taskManager = new TaskManager(TEST_DB_PATH);
    await taskManager.initialize();
    await taskManager.clearAll();
  });

  afterEach(async () => {
    // Clean up after each test
    await taskManager.close();
    
    // Remove test database directory
    if (fs.existsSync(TEST_DB_PATH)) {
      fs.rmSync(TEST_DB_PATH, { recursive: true, force: true });
    }
  });

  describe('createTask', () => {
    test('should create a task with title and description', async () => {
      const task = await taskManager.createTask('Test Task', 'Test Description');
      
      expect(task).toHaveProperty('id');
      expect(task.title).toBe('Test Task');
      expect(task.description).toBe('Test Description');
      expect(task.completed).toBe(false);
      expect(task).toHaveProperty('createdAt');
    });

    test('should create a task with only title', async () => {
      const task = await taskManager.createTask('Test Task');
      
      expect(task.title).toBe('Test Task');
      expect(task.description).toBe('');
      expect(task.completed).toBe(false);
    });

    test('should generate unique IDs for different tasks', async () => {
      const task1 = await taskManager.createTask('Task 1');
      const task2 = await taskManager.createTask('Task 2');
      
      expect(task1.id).not.toBe(task2.id);
    });
  });

  describe('getTask', () => {
    test('should retrieve an existing task by ID', async () => {
      const createdTask = await taskManager.createTask('Test Task', 'Description');
      const retrievedTask = await taskManager.getTask(createdTask.id);
      
      expect(retrievedTask).toEqual(createdTask);
    });

    test('should return null for non-existent task', async () => {
      const task = await taskManager.getTask('non-existent-id');
      
      expect(task).toBeNull();
    });
  });

  describe('getAllTasks', () => {
    test('should return empty array when no tasks exist', async () => {
      const tasks = await taskManager.getAllTasks();
      
      expect(tasks).toEqual([]);
    });

    test('should return all tasks', async () => {
      await taskManager.createTask('Task 1');
      await taskManager.createTask('Task 2');
      await taskManager.createTask('Task 3');
      
      const tasks = await taskManager.getAllTasks();
      
      expect(tasks).toHaveLength(3);
      expect(tasks.map(t => t.title)).toContain('Task 1');
      expect(tasks.map(t => t.title)).toContain('Task 2');
      expect(tasks.map(t => t.title)).toContain('Task 3');
    });
  });

  describe('updateTask', () => {
    test('should update task title', async () => {
      const task = await taskManager.createTask('Original Title');
      const updated = await taskManager.updateTask(task.id, { title: 'Updated Title' });
      
      expect(updated.title).toBe('Updated Title');
      expect(updated).toHaveProperty('updatedAt');
    });

    test('should update task description', async () => {
      const task = await taskManager.createTask('Task', 'Original Description');
      const updated = await taskManager.updateTask(task.id, { description: 'Updated Description' });
      
      expect(updated.description).toBe('Updated Description');
    });

    test('should update task completed status', async () => {
      const task = await taskManager.createTask('Task');
      const updated = await taskManager.updateTask(task.id, { completed: true });
      
      expect(updated.completed).toBe(true);
    });

    test('should update multiple fields at once', async () => {
      const task = await taskManager.createTask('Task', 'Description');
      const updated = await taskManager.updateTask(task.id, {
        title: 'New Title',
        description: 'New Description',
        completed: true
      });
      
      expect(updated.title).toBe('New Title');
      expect(updated.description).toBe('New Description');
      expect(updated.completed).toBe(true);
    });

    test('should not allow changing task ID', async () => {
      const task = await taskManager.createTask('Task');
      const originalId = task.id;
      const updated = await taskManager.updateTask(task.id, { id: 'different-id' });
      
      expect(updated.id).toBe(originalId);
    });

    test('should return null when updating non-existent task', async () => {
      const result = await taskManager.updateTask('non-existent-id', { title: 'New Title' });
      
      expect(result).toBeNull();
    });
  });

  describe('deleteTask', () => {
    test('should delete an existing task', async () => {
      const task = await taskManager.createTask('Task to Delete');
      const result = await taskManager.deleteTask(task.id);
      
      expect(result).toBe(true);
      
      const deletedTask = await taskManager.getTask(task.id);
      expect(deletedTask).toBeNull();
    });

    test('should return false when deleting non-existent task', async () => {
      const result = await taskManager.deleteTask('non-existent-id');
      
      expect(result).toBe(false);
    });

    test('should not affect other tasks when deleting one', async () => {
      const task1 = await taskManager.createTask('Task 1');
      const task2 = await taskManager.createTask('Task 2');
      
      await taskManager.deleteTask(task1.id);
      
      const remaining = await taskManager.getAllTasks();
      expect(remaining).toHaveLength(1);
      expect(remaining[0].id).toBe(task2.id);
    });
  });

  describe('clearAll', () => {
    test('should clear all tasks', async () => {
      await taskManager.createTask('Task 1');
      await taskManager.createTask('Task 2');
      await taskManager.createTask('Task 3');
      
      await taskManager.clearAll();
      
      const tasks = await taskManager.getAllTasks();
      expect(tasks).toEqual([]);
    });
  });
});
