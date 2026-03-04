// Force restart -v10
import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { env } from './config/env';
import { errorMiddleware } from './middleware/error.middleware';
import { NotFoundError } from './utils/errors';
import { setupSwagger } from './config/swagger';
import { connectDB } from './config/database';

// // Initialize DB (for serverless environments)
// connectDB();

const app: Application = express();

// Security middleware
app.use(helmet());
const allowedOrigins = [
  env.CLIENT_URL,
  'http://localhost:3000',
  'http://192.168.0.107:3000',
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // In development, we can be more permissive if needed, 
    // but let's at least include common localhost variations
    const developmentOrigins = [
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'http://localhost:3001',
      'http://127.0.0.1:3001',
    ];

    const allAllowed = [...allowedOrigins, ...developmentOrigins];

    if (!origin || env.NODE_ENV === 'development') return callback(null, true);

    if (allAllowed.some(o => o && (origin === o || origin === o.replace(/\/$/, '')))) {
      callback(null, true);
    } else {
      console.error(`🚫 CORS Blocked: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes',
});
app.use('/api', limiter);

// Parsing middleware
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

// Swagger Documentation
setupSwagger(app);

// API routes
import router from './routes';
app.use('/api', router);

// Base route
app.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to SUST CSE Department API',
  });
});

// Health check route
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'SUST CSE Backend is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// 404 handler
app.all('*', (req: Request, res: Response, next) => {
  next(new NotFoundError(`Can't find ${req.originalUrl} on this server!`));
});

// Global error handler
app.use(errorMiddleware);

export default app;
