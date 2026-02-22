import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { connectDB } from './config/db';
import { env } from './config/env';
import { apiLimiter } from './middleware/rateLimiter';
import { startAlertScheduler } from './services/alertService';

// Route imports
import authRoutes from './routes/authRoutes';
import cropRoutes from './routes/cropRoutes';
import marketRoutes from './routes/marketRoutes';
import priceRoutes from './routes/priceRoutes';
import sourceRoutes from './routes/sourceRoutes';
import alertRoutes from './routes/alertRoutes';
import analyticsRoutes from './routes/analyticsRoutes';
import ussdRoutes from './routes/ussdRoutes';

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
    origin: env.NODE_ENV === 'development' ? true : env.CLIENT_URL,
    credentials: true,
}));

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
app.use('/api/', apiLimiter);

// Health check
app.get('/api/health', (_req, res) => {
    res.json({
        status: 'ok',
        service: 'SokoPrice API',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
    });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/crops', cropRoutes);
app.use('/api/markets', marketRoutes);
app.use('/api/prices', priceRoutes);
app.use('/api/sources', sourceRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/ussd', ussdRoutes);

// 404 handler
app.use((_req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

// Error handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error('Server error:', err);
    res.status(500).json({
        message: env.NODE_ENV === 'development' ? err.message : 'Internal server error',
    });
});

// Start server
const startServer = async () => {
    await connectDB();

    app.listen(env.PORT, () => {
        console.log(`
🌾 ============================================
   SokoPrice API Server
   Port: ${env.PORT}
   Environment: ${env.NODE_ENV}
   USSD Code: ${env.USSD_SERVICE_CODE}
🌾 ============================================
    `);
    });

    // Start alert scheduler
    startAlertScheduler();
};

startServer().catch(console.error);

export default app;
