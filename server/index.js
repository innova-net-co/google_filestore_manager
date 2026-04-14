import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import storesRouter from './routes/stores.js';
import documentsRouter from './routes/documents.js';
import fs from 'fs';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 3001;
const LOG_FILE = path.join(process.cwd(), 'server-errors.log');

// Helper to log to file
const logToFile = (msg, obj = '') => {
  const timestamp = new Date().toISOString();
  const content = `${timestamp} - ${msg} ${obj ? JSON.stringify(obj, null, 2) : ''}\n`;
  fs.appendFileSync(LOG_FILE, content);
};

// Clear log on start
fs.writeFileSync(LOG_FILE, '--- Server Started ---\n');

// Middleware
app.use(cors());
app.use(express.json());

// API Key Extraction Middleware
app.use((req, res, next) => {
  // Ignorar health check
  if (req.path === '/api/health') return next();

  const apiKey = req.headers['x-goog-api-key'];
  
  if (!apiKey) {
    return res.status(401).json({
      success: false,
      status: 401,
      message: 'API Key faltante en el header X-Goog-Api-Key'
    });
  }

  req.googleApiKey = apiKey;
  next();
});

// Routes
app.use('/api/stores', storesRouter);
app.use('/api/stores', documentsRouter);
// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`🔑 Dynamic API Key Authentication enabled (Header: X-Goog-Api-Key)`);
});
