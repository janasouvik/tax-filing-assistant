import dotenv from 'dotenv';
dotenv.config();

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  database: {
    url: process.env.DATABASE_URL || '',
  },
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || 'access-secret',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'refresh-secret',
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  frontend: {
    url: process.env.FRONTEND_URL || 'http://localhost:5173',
  },
  s3: {
    endpoint: process.env.S3_ENDPOINT || '',
    region: process.env.S3_REGION || 'ap-south-1',
    bucket: process.env.S3_BUCKET || 'taxpilot-documents',
    accessKey: process.env.S3_ACCESS_KEY || '',
    secretKey: process.env.S3_SECRET_KEY || '',
  },
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  },
  ocr: {
    provider: process.env.OCR_PROVIDER || 'mock',
    apiKey: process.env.OCR_API_KEY || '',
  },
  llm: {
    provider: process.env.LLM_PROVIDER || 'openai',
    apiKey: process.env.LLM_API_KEY || '',
    model: process.env.LLM_MODEL || 'gpt-4o',
  },
  pan: {
    /** "setu" | "mock". Default "mock" for safe development without credentials. */
    provider: process.env.PAN_PROVIDER || 'mock',
  },
  setu: {
    // These MUST remain server-side only. Never expose to frontend.
    baseUrl: process.env.SETU_BASE_URL || 'https://dg-sandbox.setu.co',
    clientId: process.env.SETU_CLIENT_ID || '',
    clientSecret: process.env.SETU_CLIENT_SECRET || '',
    productInstanceId: process.env.SETU_PRODUCT_INSTANCE_ID || '',
  },
};
