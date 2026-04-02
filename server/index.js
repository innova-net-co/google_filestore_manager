import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import storesRouter from './routes/stores.js';
import documentsRouter from './routes/documents.js';
import filesRouter from './routes/files.js';

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

// Validate API key
if (!process.env.GOOGLE_API_KEY) {
  console.error('❌ GOOGLE_API_KEY is not set in .env file. Please add it and restart the server.');
  process.exit(1);
}

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/stores', storesRouter);
app.use('/api/stores', documentsRouter);
app.use('/api/files', filesRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📁 API Key configured: ${process.env.GOOGLE_API_KEY.slice(0, 8)}...`);
});
