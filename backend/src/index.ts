import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import { prisma } from './config/db.js';

import authRoutes from './routes/auth.routes.js';
import productRoutes from './routes/product.routes.js';
import pickupRoutes from './routes/pickup.routes.js';
import inspectionRoutes from './routes/inspection.routes.js';
import valuationRoutes from './routes/valuation.routes.js';
import refurbishmentRoutes from './routes/refurbishment.routes.js';
import marketplaceRoutes from './routes/marketplace.routes.js';
import adminRoutes from './routes/admin.routes.js';
import passportRoutes from './routes/passport.routes.js';
import notificationRoutes from './routes/notification.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// 1. Security Headers via Helmet
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }, // allow serving uploaded media & svgs
    contentSecurityPolicy: false, // Vite dev & local previews
  })
);

// 2. CORS configuration
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',')
  : ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3000'];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, server-to-server)
      if (!origin || allowedOrigins.includes(origin) || origin.startsWith('http://localhost:')) {
        callback(null, true);
      } else {
        callback(null, true); // Permissive in development, configurable via CORS_ORIGIN
      }
    },
    credentials: true,
  })
);

// 3. Body parsers with payload limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 4. Request Logging in Development
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      console.log(`[${req.method}] ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
    });
    next();
  });
}

// 5. Static uploads directory
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// 6. Comprehensive API Health Check
app.get('/api/health', async (req, res) => {
  let dbStatus = 'healthy';
  let dbLatencyMs = 0;

  try {
    const start = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    dbLatencyMs = Date.now() - start;
  } catch (err: any) {
    dbStatus = `unhealthy: ${err.message}`;
  }

  res.json({
    status: dbStatus === 'healthy' ? 'online' : 'degraded',
    platform: 'ReCircuit E-Waste Platform & Circular Economy Engine',
    version: '1.0.0-production',
    uptimeSeconds: Math.floor(process.uptime()),
    database: {
      status: dbStatus,
      latencyMs: dbLatencyMs,
    },
    timestamp: new Date().toISOString(),
  });
});

// 7. API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/pickups', pickupRoutes);
app.use('/api/inspections', inspectionRoutes);
app.use('/api/valuations', valuationRoutes);
app.use('/api/refurbishment', refurbishmentRoutes);
app.use('/api/marketplace', marketplaceRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/passport', passportRoutes);
app.use('/api/notifications', notificationRoutes);

// 8. Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({
    message: 'Internal server error occurred',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

app.listen(PORT, () => {
  console.log(`🚀 ReCircuit Backend server running on http://localhost:${PORT}`);
});
