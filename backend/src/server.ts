import app from './app';
import { config } from './config';
import prisma from './config/prisma';
import logger from './utils/logger';

const start = async () => {
  try {
    await prisma.$connect();
    logger.info('Connected to PostgreSQL database');

    const server = app.listen(config.port, () => {
      logger.info(`TaxPilot API running on http://localhost:${config.port}`);
      logger.info(`Environment: ${config.env}`);
      logger.info(`Health: http://localhost:${config.port}/health`);
    });

    const shutdown = async () => {
      logger.info('Shutting down...');
      server.close(async () => {
        await prisma.$disconnect();
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } catch (err) {
    logger.error(err, 'Failed to start server');
    process.exit(1);
  }
};

start();
