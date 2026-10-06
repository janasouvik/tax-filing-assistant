import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config } from './config';
import { errorHandler } from './utils/response';

import authRoutes from './routes/auth.routes';
import workspaceRoutes from './routes/workspace.routes';
import taxReturnRoutes from './routes/taxReturn.routes';
import businessRoutes from './routes/business.routes';
import copilotRoutes from './routes/copilot.routes';
import dashboardRoutes from './routes/dashboard.routes';

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: config.frontend.url,
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
}));

// Rate limiting
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 200, standardHeaders: true, legacyHeaders: false }));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health checks
app.get('/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));
app.get('/api/v1/health', (_req, res) => res.json({ status: 'ok', version: '1.0.0', timestamp: new Date().toISOString() }));

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1', workspaceRoutes);
app.use('/api/v1', taxReturnRoutes);
app.use('/api/v1', businessRoutes);
app.use('/api/v1', copilotRoutes);
app.use('/api/v1', dashboardRoutes);

// 404
app.use((_req, res) => res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Route not found', details: [] } }));

// Global error handler
app.use(errorHandler);

export default app;
