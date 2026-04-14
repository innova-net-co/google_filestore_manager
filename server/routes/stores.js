import { Router } from 'express';
import fs from 'fs';
import path from 'path';

const router = Router();
const API_BASE = 'https://generativelanguage.googleapis.com/v1beta';
const LOG_FILE = path.join(process.cwd(), 'server-errors.log');

const logToFile = (msg, obj = '') => {
  const timestamp = new Date().toISOString();
  fs.appendFileSync(LOG_FILE, `[STORES] ${timestamp} - ${msg} ${obj ? JSON.stringify(obj, null, 2) : ''}\n`);
};

// GET /api/stores — List all FileSearchStores
router.get('/', async (req, res) => {
  try {
    const allStores = [];
    let pageToken = '';

    do {
      const url = `${API_BASE}/fileSearchStores?key=${req.googleApiKey}&pageSize=20${pageToken ? `&pageToken=${pageToken}` : ''}`;
      const response = await fetch(url);

      if (!response.ok) {
        const error = await response.json();
        return res.status(response.status).json({ error: error.error?.message || 'Failed to list stores' });
      }

      const data = await response.json();
      if (data.fileSearchStores) {
        allStores.push(...data.fileSearchStores);
      }
      pageToken = data.nextPageToken || '';
    } while (pageToken);

    res.json({ stores: allStores });
  } catch (err) {
    console.error('Error listing stores:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/stores — Create a new FileSearchStore
router.post('/', async (req, res) => {
  try {
    const { displayName } = req.body;

    if (!displayName || !displayName.trim()) {
      return res.status(400).json({ error: 'displayName is required' });
    }

    const url = `${API_BASE}/fileSearchStores?key=${req.googleApiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ displayName: displayName.trim() }),
    });

    if (!response.ok) {
      const error = await response.json();
      return res.status(response.status).json({ error: error.error?.message || 'Failed to create store' });
    }

    const store = await response.json();
    res.status(201).json(store);
  } catch (err) {
    console.error('Error creating store:', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/stores/:id — Delete a FileSearchStore
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const url = `${API_BASE}/fileSearchStores/${id}?force=true&key=${req.googleApiKey}`;
    const response = await fetch(url, { method: 'DELETE' });

    if (!response.ok) {
      const error = await response.json();
      return res.status(response.status).json({ error: error.error?.message || 'Failed to delete store' });
    }

    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting store:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/stores/:id/search — Search within a FileSearchStore using generateContent (RAG)
router.post('/:id/search', async (req, res) => {
  try {
    const { id } = req.params;
    const { query } = req.body;

    if (!query || !query.trim()) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    // Use generateContent with fileSearch tool (using snake_case as per requirement)
    // Endpoint: https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent
    const model = process.env.GOOGLE_MODEL || 'gemini-1.5-flash';
    const url = `${API_BASE}/models/${model}:generateContent?key=${req.googleApiKey}`;


    const requestBody = {
      contents: [{
        role: 'user',
        parts: [{ text: query.trim() }]
      }],
      tools: [{
        file_search: { // <--- Changed to snake_case from image
          file_search_store_names: [`fileSearchStores/${id}`]
        }
      }]
    };

    console.log('URL:', url);
    console.log('Query:', query);
    console.log('Store ID:', id);
    console.log('Model:', model);
    console.log('API Key:', req.googleApiKey);
    console.log('Request Body:', requestBody);

    logToFile(`🔍 Starting search for store: ${id}`);
    logToFile(`📡 URL: ${url.replace(req.googleApiKey, 'API_KEY_HIDDEN')}`);
    logToFile(`📦 Request Body:`, requestBody);

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const error = await response.json();
      logToFile(`❌ Google API Error (Search):`, error);
      console.error('❌ Google API Detailed Error (Search):');
      console.dir(error, { depth: null }); // Show full error in console
      return res.status(response.status).json({
        error: error.error?.message || 'Failed to perform search',
        details: error.error
      });
    }

    const data = await response.json();
    logToFile(`✅ Search results received:`, data);

    // Process the data to show the retrieved chunks
    const result = {
      answer: data.candidates?.[0]?.content?.parts?.[0]?.text,
      results: data.candidates?.[0]?.groundingMetadata?.groundingChunks?.map(chunk => ({
        fileData: {
          content: chunk.text,
          fileResourceName: chunk.sourceContent?.part?.fileData?.fileUri
        },
        relevanceScore: 1.0
      })) || []
    };

    res.json(result);
  } catch (err) {
    logToFile(`💥 Critical error in /search route:`, { message: err.message, stack: err.stack });
    console.error('💥 Critical error in /search route:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
