import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { env } from './config/env';
import logger from './config/logger';
import routes from './routes';
import { sendError } from './utils/response';

const app = express();

// Middlewares
const allowedOrigins = [
  'http://localhost:3000',
  'https://swiftwings.online',
  'https://www.swiftwings.online'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    return callback(new Error('CORS policy does not allow access from the specified Origin.'), false);
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request Logging Middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

// Rate Limiting
const limiter = rateLimit({
  windowMs: parseInt(env.RATE_LIMIT_WINDOW, 10),
  max: parseInt(env.RATE_LIMIT_MAX_REQUESTS, 10),
  message: {
    success: false,
    error: {
      code: 'RATE_LIMITED',
      message: 'Too many requests, please try again later.',
    }
  }
});
app.use('/api', limiter);

// API Routes
app.use('/api', routes);

// 404 Handler
app.use((req, res) => {
  sendError(res, 'Not Found', 'NOT_FOUND', null, 404);
});

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error(err.stack);
  sendError(res, err.message, 'INTERNAL_ERROR', null, 500);
});

export default app;
