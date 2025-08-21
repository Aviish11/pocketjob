import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import cors from 'cors';
import { z } from 'zod';
import { prisma } from './lib/prisma.js';

// Env validation
const Env = z.object({
  PORT: z.string().default('4000'),
  CORS_ORIGINS: z.string().default('http://localhost:3000'),
});
const env = Env.parse(process.env);

const app = express();
app.use(helmet());
app.use(express.json({ limit: '1mb' }));

// CORS
const allowed = env.CORS_ORIGINS.split(',').map(s => s.trim());
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowed.includes(origin)) return cb(null, true);
    return cb(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

app.use(morgan('dev'));

// Health
app.get('/health', (_req, res) => {
  res.json({ ok: true, ts: new Date().toISOString() });
});

// Simple test route to check DB connectivity
app.get('/db/ping', async (_req, res, next) => {
  try {
    const now = await prisma.$queryRaw`SELECT NOW()`;
    res.json({ ok: true, now });
  } catch (err) {
    next(err);
  }
});

// 404
app.use((_req, res) => res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Route not found' } }));

// Error handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Something went wrong' } });
});

app.listen(Number(env.PORT), () => {
  console.log(`PocketJob backend listening on http://localhost:${env.PORT}`);
});