import { Router } from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';

const LOG_FILE = path.join(process.cwd(), 'server-errors.log');
const logToFile = (msg, obj = '') => {
  const timestamp = new Date().toISOString();
  fs.appendFileSync(LOG_FILE, `[DOCS] ${timestamp} - ${msg} ${obj ? JSON.stringify(obj, null, 2) : ''}\n`);
};

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });
const API_BASE = 'https://generativelanguage.googleapis.com/v1beta';
const UPLOAD_BASE = 'https://generativelanguage.googleapis.com/upload/v1beta';
const UPLOADS_DIR = path.join(process.cwd(), 'server', 'uploads');

// Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// GET /api/stores/:storeId/documents — List documents in a store
router.get('/:storeId/documents', async (req, res) => {
  try {
    const { storeId } = req.params;
    const allDocuments = [];
    let pageToken = '';

    do {
      const url = `${API_BASE}/fileSearchStores/${storeId}/documents?key=${req.googleApiKey}&pageSize=20${pageToken ? `&pageToken=${pageToken}` : ''}`;
      const response = await fetch(url);

      if (!response.ok) {
        const error = await response.json();
        return res.status(response.status).json({ error: error.error?.message || 'Failed to list documents' });
      }

      const data = await response.json();
      if (data.documents) {
        allDocuments.push(...data.documents);
      }
      pageToken = data.nextPageToken || '';
    } while (pageToken);

    res.json({ documents: allDocuments });
  } catch (err) {
    console.error('Error listing documents:', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/stores/:storeId/documents/:docId — Delete a document
router.delete('/:storeId/documents/:docId', async (req, res) => {
  try {
    const { storeId, docId } = req.params;
    const url = `${API_BASE}/fileSearchStores/${storeId}/documents/${docId}?force=true&key=${req.googleApiKey}`;
    const response = await fetch(url, { method: 'DELETE' });

    if (!response.ok) {
      const error = await response.json();
      return res.status(response.status).json({ error: error.error?.message || 'Failed to delete document' });
    }

    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting document:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/stores/:storeId/upload — Upload a file to a store
router.post('/:storeId/upload', upload.single('file'), async (req, res) => {
  try {
    const { storeId } = req.params;

    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const metadata = JSON.stringify({
      displayName: req.file.originalname,
    });

    logToFile('Starting upload for store:', storeId);
    logToFile('Metadata:', metadata);
    const boundary = '---BOUNDARY' + Date.now();
    const metadataPart = `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${metadata}\r\n`;
    const filePart = `--${boundary}\r\nContent-Type: ${req.file.mimetype}\r\n\r\n`;
    const ending = `\r\n--${boundary}--`;

    const metadataBuffer = Buffer.from(metadataPart, 'utf-8');
    const filePartBuffer = Buffer.from(filePart, 'utf-8');
    const endingBuffer = Buffer.from(ending, 'utf-8');
    const body = Buffer.concat([metadataBuffer, filePartBuffer, req.file.buffer, endingBuffer]);

    const url = `${UPLOAD_BASE}/fileSearchStores/${storeId}:uploadToFileSearchStore?key=${req.googleApiKey}&uploadType=multipart`;
    
    logToFile(`📤 Uploading file to Google: ${url.replace(req.googleApiKey, 'API_KEY_HIDDEN')}`);
    logToFile(`📏 Body size: ${body.length} bytes`);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body: body,
    });

    if (!response.ok) {
      let errorMessage = 'Failed to upload file';
      let errorData = null;
      try {
        errorData = await response.json();
        errorMessage = errorData.error?.message || errorMessage;
        logToFile('❌ Google API Error:', errorData);
      } catch (jsonErr) {
        const textError = await response.text();
        logToFile('❌ Raw error from Google:', textError);
        errorMessage = `API Error (${response.status}): ${textError.slice(0, 100)}`;
      }
      return res.status(response.status).json({ 
        error: errorMessage,
        details: errorData
      });
    }

    const result = await response.json();
    logToFile('✅ File uploaded successfully:', result);

    res.status(201).json(result);
  } catch (err) {
    logToFile('💥 Critical error in /upload route:', { 
      message: err.message, 
      stack: err.stack 
    });
    res.status(500).json({ 
      error: 'Internal Server Error', 
      message: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
});

export default router;
