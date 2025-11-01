import bodyParser from 'body-parser';
import express, { Request, Response } from 'express';
import path from 'path';
import TaskManager, { TaskUpdates } from './taskManager';

interface CreateTaskBody {
  title?: string;
  description?: string;
}

type UpdateTaskBody = Partial<{
  title: string;
  description: string;
  completed: boolean;
}>;

const app = express();
const port = process.env.PORT ? Number(process.env.PORT) : 3000;
const envMessage = process.env.MSG_ENV || 'hello world';
const taskManager = new TaskManager(path.resolve(__dirname, '../db'));

let counter = 0;
const heartbeat = setInterval(() => {
  console.log(`Counter: ${counter} - EnvMessage: ${envMessage}`);
  counter++;
}, 1000);
heartbeat.unref();

app.use(bodyParser.json());

const publicDir = path.resolve(__dirname, '../public');
app.use(express.static(publicDir));

taskManager.initialize().catch(console.error);

app.get('/', (_req: Request, res: Response) => {
  res.sendFile(path.join(publicDir, 'index.html'));
});

app.post('/api/tasks', async (req: Request<unknown, unknown, CreateTaskBody>, res: Response) => {
  try {
    const { title, description } = req.body;
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }
    const task = await taskManager.createTask(title, description ?? '');
    return res.status(201).json(task);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return res.status(500).json({ error: message });
  }
});

app.get('/api/tasks', async (_req: Request, res: Response) => {
  try {
    const tasks = await taskManager.getAllTasks();
    return res.json(tasks);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return res.status(500).json({ error: message });
  }
});

app.get('/api/tasks/:id', async (req: Request, res: Response) => {
  try {
    const task = await taskManager.getTask(req.params.id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    return res.json(task);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return res.status(500).json({ error: message });
  }
});

app.put('/api/tasks/:id', async (req: Request<{ id: string }, unknown, UpdateTaskBody>, res: Response) => {
  try {
    const updates: TaskUpdates = {};
    if (typeof req.body.title === 'string') {
      updates.title = req.body.title;
    }
    if (typeof req.body.description === 'string') {
      updates.description = req.body.description;
    }
    if (typeof req.body.completed === 'boolean') {
      updates.completed = req.body.completed;
    }

    const task = await taskManager.updateTask(req.params.id, updates);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    return res.json(task);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return res.status(500).json({ error: message });
  }
});

app.delete('/api/tasks/:id', async (req: Request, res: Response) => {
  try {
    const success = await taskManager.deleteTask(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Task not found' });
    }
    return res.status(204).send();
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return res.status(500).json({ error: message });
  }
});

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'OK' });
});

const server = app.listen(port, () => {
  console.log(`Task List API listening on port ${port}`);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(async () => {
    await taskManager.close();
    console.log('HTTP server closed');
  });
});

export { app, taskManager, server };
