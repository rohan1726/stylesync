import express from 'express';
import cors from 'cors';
import scrapeRoutes from './routes/scrape';
import tokenRoutes from './routes/tokens';
import exportRoutes from './routes/export';

// Debug: Global error handlers for Railway
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('🚨 Uncaught Exception thrown:', err);
  process.exit(1);
});

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
const cleanFrontendUrl = (url: string) => url.replace(/\/$/, ""); 
const frontendUrl = process.env.FRONTEND_URL ? cleanFrontendUrl(process.env.FRONTEND_URL) : null;

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  ...(frontendUrl ? [frontendUrl, `${frontendUrl}/`] : []),
];

console.log('✅ CORS allowed origins:', allowedOrigins);

app.use(cors({
  origin: (origin, callback) => {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.warn(`⚠️ CORS blocked a request from origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));

// Routes
app.use('/api/scrape', scrapeRoutes);
app.use('/api/tokens', tokenRoutes);
app.use('/api/export', exportRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
const HOST = '0.0.0.0';
app.listen(Number(PORT), HOST, () => {
  console.log(`\n🎨 StyleSync API server running at http://${HOST}:${PORT}`);
  console.log(`   Health: http://${HOST}:${PORT}/api/health\n`);
});

export default app;
