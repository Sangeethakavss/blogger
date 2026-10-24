import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { connectDB } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import blogRoutes from './routes/blogRoutes.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

// Load environment variables
dotenv.config();

// Connect to Database
await connectDB();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendDist = path.resolve(__dirname, '../../frontend/dist');

// Middlewares
app.use(cors({
  origin: '*',
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Blogify API server is running smoothly',
    timestamp: new Date().toISOString(),
  });
});

// Mount API Routes
app.use('/api/auth', authRoutes);
app.use('/api/blogs', blogRoutes);

// Serve Frontend SPA in production / if dist exists
if (fs.existsSync(frontendDist)) {
  console.log(`📦 Serving static frontend from: ${frontendDist}`);
  app.use(express.static(frontendDist));

  // Catch-all route to serve React index.html for client-side routing
  app.get(/^(?!\/api).*/, (req, res) => {
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
}

// Error Handling Middlewares for API
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`🚀 Blogify Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  console.log(`🌐 Base API URL: http://localhost:${PORT}/api`);
  if (fs.existsSync(frontendDist)) {
    console.log(`🖥️ Frontend Web App available at: http://localhost:${PORT}`);
  }
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Gracefully shutting down server...');
  server.close(() => {
    console.log('Server terminated.');
    process.exit(0);
  });
});

export default app;

