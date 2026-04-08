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
const cleanUrl = (url: string) => url.trim().replace(/\/$/, ""); 
const frontendUrl = process.env.FRONTEND_URL ? cleanUrl(process.env.FRONTEND_URL) : null;
const netlifyFallback = 'https://stylesync1.netlify.app';

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  netlifyFallback,
  `${netlifyFallback}/`,
  ...(frontendUrl ? [frontendUrl, `${frontendUrl}/`] : []),
];

console.log('--- Environment Check ---');
console.log('PORT:', process.env.PORT);
console.log('FRONTEND_URL from env:', process.env.FRONTEND_URL);
console.log('Cleaned Frontend URL:', frontendUrl);
console.log('✅ CORS allowed origins:', allowedOrigins);
console.log('-------------------------');

app.use(cors({
  origin: (origin, callback) => {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const isAllowed = allowedOrigins.some(ao => cleanUrl(ao) === cleanUrl(origin));
    
    if (isAllowed) {
      callback(null, true);
    } else {
      console.warn(`⚠️ CORS blocked a request from origin: ${origin}`);
      // Don't pass an Error object as it can break preflight responses in some environments
      callback(null, false);
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
  optionsSuccessStatus: 200 // Some legacy browsers choke on 204
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
