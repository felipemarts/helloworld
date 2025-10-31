const { Level } = require('level');
const path = require('path');

class TaskManager {
  constructor(dbPath = './db') {
    this.db = new Level(path.resolve(dbPath), { valueEncoding: 'json' });
  }

  async initialize() {
    // Ensure database is ready
    await this.db.open();
  }

  async close() {
    await this.db.close();
  }

  // Create a new task
  async createTask(title, description = '') {
    // Generate a more unique ID by combining timestamp with random value
    const id = `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    const task = {
      id,
      title,
      description,
      completed: false,
      createdAt: new Date().toISOString()
    };
    
    await this.db.put(id, task);
    return task;
  }

  // Read a single task by ID
  async getTask(id) {
    try {
      const task = await this.db.get(id);
      return task || null;
    } catch (error) {
      if (error.notFound || error.code === 'LEVEL_NOT_FOUND') {
        return null;
      }
      throw error;
    }
  }

  // Read all tasks
  async getAllTasks() {
    const tasks = [];
    for await (const [key, value] of this.db.iterator()) {
      tasks.push(value);
    }
    return tasks;
  }

  // Update a task
  async updateTask(id, updates) {
    const task = await this.getTask(id);
    if (!task) {
      return null;
    }

    const updatedTask = {
      ...task,
      ...updates,
      id, // Ensure ID cannot be changed
      updatedAt: new Date().toISOString()
    };

    await this.db.put(id, updatedTask);
    return updatedTask;
  }

  // Delete a task
  async deleteTask(id) {
    const task = await this.getTask(id);
    if (!task) {
      return false;
    }

    await this.db.del(id);
    return true;
  }

  // Clear all tasks (useful for testing)
  async clearAll() {
    await this.db.clear();
  }
}

module.exports = TaskManager;
