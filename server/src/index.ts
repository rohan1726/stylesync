import express from 'express';
import cors from 'cors';
import scrapeRoutes from './routes/scrape';
import tokenRoutes from './routes/tokens';
import exportRoutes from './routes/export';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : []),
];
app.use(cors({
  origin: allowedOrigins,
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
