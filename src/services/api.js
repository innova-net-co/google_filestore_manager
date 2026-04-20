const API_BASE = '/api';

const getHeaders = (headers = {}, apiKey = null) => {
  const saved = localStorage.getItem('google_filestore_api_keys');
  const keys = saved ? JSON.parse(saved) : [];
  const effectiveKey = apiKey || keys.find(k => k.active)?.key;

  const newHeaders = { ...headers };
  if (effectiveKey) {
    newHeaders['X-Goog-Api-Key'] = effectiveKey;
  }
  return newHeaders;
};

export async function listStores(apiKey = null) {
  const res = await fetch(`${API_BASE}/stores`, {
    headers: getHeaders({}, apiKey)
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || 'Failed to list stores');
  }
  return res.json();
}

export async function createStore(displayName, apiKey = null) {
  const res = await fetch(`${API_BASE}/stores`, {
    method: 'POST',
    headers: getHeaders({ 'Content-Type': 'application/json' }, apiKey),
    body: JSON.stringify({ displayName }),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || 'Failed to create store');
  }
  return res.json();
}

export async function deleteStore(storeId, apiKey = null) {
  const res = await fetch(`${API_BASE}/stores/${storeId}`, {
    method: 'DELETE',
    headers: getHeaders({}, apiKey)
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || 'Failed to delete store');
  }
  return res.json();
}

export async function listDocuments(storeId, apiKey = null) {
  const res = await fetch(`${API_BASE}/stores/${storeId}/documents`, {
    headers: getHeaders({}, apiKey)
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || 'Failed to list documents');
  }
  return res.json();
}

export async function deleteDocument(storeId, docId, apiKey = null) {
  const res = await fetch(`${API_BASE}/stores/${storeId}/documents/${docId}`, {
    method: 'DELETE',
    headers: getHeaders({}, apiKey)
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || 'Failed to delete document');
  }
  return res.json();
}

export async function uploadFile(storeId, file, apiKey = null) {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_BASE}/stores/${storeId}/upload`, {
    method: 'POST',
    headers: getHeaders({}, apiKey), // Note: No Content-Type here, fetch will set it for FormData
    body: formData,
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || 'Failed to upload file');
  }
  return res.json();
}

export async function searchStore(storeId, query) {
  const res = await fetch(`${API_BASE}/stores/${storeId}/search`, {
    method: 'POST',
    headers: getHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ query }),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || 'Failed to search');
  }
  return res.json();
}

export function getFilePreviewUrl(storeId, docId) {
  return `${API_BASE}/files/${storeId}/${docId}`;
}
