import { Router } from 'express';
import express from 'express';
import path from 'path';
import fs from 'fs';

const router = Router();
const UPLOADS_DIR = path.join(process.cwd(), 'server', 'uploads');

// Static serving with generic access
// Files are at server/uploads/:storeId/:filename
router.use('/', express.static(UPLOADS_DIR));

// Helper to check if a file exists (for the frontend to know if it can show preview)
router.get('/check/:storeId/:docId', (req, res) => {
  const { storeId, docId } = req.params;
  const storeDir = path.join(UPLOADS_DIR, storeId);
  
  if (!fs.existsSync(storeDir)) {
    return res.json({ exists: false });
  }

  const files = fs.readdirSync(storeDir);
  const found = files.find(f => f.startsWith(docId));
  
  res.json({ 
    exists: !!found,
    filename: found || null
  });
});

export default router;
