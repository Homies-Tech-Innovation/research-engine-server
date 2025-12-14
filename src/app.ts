import { config } from '@config';
import { globalErrorHandler, responseEnhancer } from '@middleware';
import express, { type Request, type Response } from 'express';
import helmet from 'helmet';

const app = express();

// Middlewares
app.use(helmet());
app.use(express.json({ limit: config.env.MAX_PAYLOAD_SIZE }));
app.use(responseEnhancer);

// Test endpoints
app.get('/', (_req: Request, res: Response) => {
  res.success({ 'worked?': true });
});

app.get('/err', (_req: Request, _res: Response) => {
  type User = {
    id: number;
    name: string;
  };

  function getUser(): User | undefined {
    return undefined; // simulating a missing user
  }

  const user = getUser();
  console.log(user!.name);
});

// Global Error handler
app.use(globalErrorHandler);

export default app;
