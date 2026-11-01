import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import fs from 'fs';
import { config } from './config';
import { errorHandler } from './utils/response';
import { clerkMiddleware } from '@clerk/express';

import authRoutes from './routes/auth.routes';
import workspaceRoutes from './routes/workspace.routes';
import taxReturnRoutes from './routes/taxReturn.routes';
import businessRoutes from './routes/business.routes';
import copilotRoutes from './routes/copilot.routes';
import dashboardRoutes from './routes/dashboard.routes';
import individualRoutes from './routes/individual.routes';
import documentRoutes from './routes/document.routes';
import {
  classifyPanPatternHandler,
  verifyIdentityHandler,
  getMockFixturesHandler,
} from './controllers/individual.controller';

const app = express();

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: false,
  contentSecurityPolicy: config.env === 'development' ? false : undefined,
}));
app.use(cors({
  origin: (origin, callback) => {
    // In development or when no origin (like curl, file://), allow all development origins
    if (!origin || config.env === 'development' || origin === config.frontend.url) {
      return callback(null, true);
    }
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
}));

// Rate limiting
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 200, standardHeaders: true, legacyHeaders: false }));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Clerk Middleware
app.use(clerkMiddleware());

// Health checks
app.get('/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));
app.get('/api/v1/health', (_req, res) => res.json({ status: 'ok', version: '1.0.0', timestamp: new Date().toISOString() }));

// Direct diagnostic PAN ML classification and Mock Identity endpoints (unauthenticated for test bench)
app.post('/api/v1/individual/pan/classify-pattern', classifyPanPatternHandler);
app.post('/api/v1/individual/pan/verify-identity', verifyIdentityHandler);
app.get('/api/v1/individual/pan/mock-fixtures', getMockFixturesHandler);

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1', workspaceRoutes);
app.use('/api/v1', taxReturnRoutes);
app.use('/api/v1', businessRoutes);
app.use('/api/v1', copilotRoutes);
app.use('/api/v1', dashboardRoutes);
app.use('/api/v1', individualRoutes);
app.use('/api/v1', documentRoutes);

// Temporary PAN ML Testing Interface
app.get('/testpan.html', (_req, res) => {
  res.removeHeader('Content-Security-Policy');
  const rootPath = path.resolve(process.cwd(), '..', 'testpan.html');
  const cwdPath = path.resolve(process.cwd(), 'testpan.html');
  const target = fs.existsSync(rootPath) ? rootPath : cwdPath;
  if (fs.existsSync(target)) {
    return res.sendFile(target);
  }
  return res.status(404).send('testpan.html not found. Place it in the project root directory.');
});

// 404
app.use((_req, res) => res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Route not found', details: [] } }));

// Global error handler
app.use(errorHandler);

export default app;
