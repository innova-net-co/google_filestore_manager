import 'dotenv/config';
import express from 'express';
// import cors from 'cors'; // Task 1.3: Eliminar CORS
import storesRouter from './routes/stores.js';
import documentsRouter from './routes/documents.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const LOG_FILE = path.join(process.cwd(), 'server-errors.log');

// Helper to log to file
const logToFile = (msg, obj = '') => {
  const timestamp = new Date().toISOString();
  const content = `${timestamp} - ${msg} ${obj ? JSON.stringify(obj, null, 2) : ''}\n`;
  fs.appendFileSync(LOG_FILE, content);
};

// Clear log on start (only if not used as middleware)
if (process.env.NODE_ENV === 'production' || !process.env.VITE) {
  fs.writeFileSync(LOG_FILE, '--- Server Started ---\n');
}

// Middleware
// app.use(cors()); // Task 1.3: Ya no es necesario al estar unificado
app.use(express.json());

// API Key Extraction Middleware
app.use((req, res, next) => {
  // Ignorar health check
  if (req.path === '/api/health' || req.path === '/health') return next();

  // Solo validar API Key para rutas que comiencen con /api
  if (!req.path.startsWith('/api')) return next();

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

// Task 3.1, 3.2, 3.3: Configuración para Producción
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(process.cwd(), 'dist');
  
  // Servir archivos estáticos del frontend
  app.use(express.static(distPath));
  
  // Fallback para SPA (Single Page Application)
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(distPath, 'index.html'));
    } else {
      res.status(404).json({ 
        success: false, 
        status: 404,
        message: 'Endpoint de API no encontrado' 
      });
    }
  });
}

// Iniciar servidor solo si se ejecuta directamente y no como middleware de Vite
// En Vite, process.env.VITE suele estar definido o detectamos via argumentos
const isDirectRun = process.argv[1] && (
  process.argv[1].endsWith('index.js') || 
  process.argv[1].endsWith('server\\index.js') ||
  process.argv[1].endsWith('server/index.js')
);

if (isDirectRun || process.env.NODE_ENV === 'production') {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`🔑 Dynamic API Key Authentication enabled (Header: X-Goog-Api-Key)`);
    if (process.env.NODE_ENV === 'production') {
      console.log(`📦 Serving static files from dist/`);
    }
  });
}

export default app;
