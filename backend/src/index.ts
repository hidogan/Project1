import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import { logger, stream } from './utils/logger';
import trainingRoutes from './routes/training';
import fs from 'fs';
import path from 'path';

// Load environment variables
dotenv.config();

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'], // Allow frontend domains
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(morgan('combined', { stream }));

// Request logging middleware
app.use((req, res, next) => {
  logger.info('Incoming request:', {
    path: req.path,
    method: req.method,
    body: req.body,
    query: req.query,
    params: req.params,
  });
  next();
});

// Default route
app.get('/', (req, res) => {
  logger.info('Health check request received');
  res.json({ message: 'Welcome to the Training API' });
});

// Routes
app.use('/api/trainings', trainingRoutes);

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error:', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    body: req.body,
    query: req.query,
    params: req.params,
  });
  
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

const PORT = Number(process.env.PORT) || 5000;
const HOST = '127.0.0.1'; // Changed to explicitly use localhost IP

app.listen(PORT, HOST, () => {
  logger.info(`Server running on http://${HOST}:${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info('Application startup complete');
}); 