import path from 'path';
import { Level } from 'level';

export interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  createdAt: string;
  updatedAt?: string;
}

export type TaskUpdates = Partial<Omit<Task, 'id' | 'createdAt'>>;

export default class TaskManager {
  private db: Level<string, Task>;

  constructor(dbPath: string = path.resolve('./db')) {
    this.db = new Level<string, Task>(path.resolve(dbPath), { valueEncoding: 'json' });
  }

  async initialize(): Promise<void> {
    await this.db.open();
  }

  async close(): Promise<void> {
    await this.db.close();
  }

  async createTask(title: string, description: string = ''): Promise<Task> {
    const id = `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    const task: Task = {
      id,
      title,
      description,
      completed: false,
      createdAt: new Date().toISOString()
    };

    await this.db.put(id, task);
    return task;
  }

  async getTask(id: string): Promise<Task | null> {
    try {
      const task = await this.db.get(id);
      return task ?? null;
    } catch (error: unknown) {
      if (typeof error === 'object' && error !== null && ('notFound' in error || (error as { code?: string }).code === 'LEVEL_NOT_FOUND')) {
        return null;
      }
      throw error;
    }
  }

  async getAllTasks(): Promise<Task[]> {
    const tasks: Task[] = [];
    for await (const [, value] of this.db.iterator()) {
      tasks.push(value);
    }
    return tasks;
  }

  async updateTask(id: string, updates: TaskUpdates): Promise<Task | null> {
    const existing = await this.getTask(id);
    if (!existing) {
      return null;
    }

    const updatedTask: Task = {
      ...existing,
      ...updates,
      id,
      updatedAt: new Date().toISOString()
    };

    await this.db.put(id, updatedTask);
    return updatedTask;
  }

  async deleteTask(id: string): Promise<boolean> {
    const existing = await this.getTask(id);
    if (!existing) {
      return false;
    }

    await this.db.del(id);
    return true;
  }

  async clearAll(): Promise<void> {
    await this.db.clear();
  }
}
