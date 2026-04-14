const API_BASE = '/api';

const getHeaders = (headers = {}) => {
  const saved = localStorage.getItem('google_filestore_api_keys');
  const keys = saved ? JSON.parse(saved) : [];
  const activeKey = keys.find(k => k.active);
  
  const newHeaders = { ...headers };
  if (activeKey) {
    newHeaders['X-Goog-Api-Key'] = activeKey.key;
  }
  return newHeaders;
};

export async function listStores() {
  const res = await fetch(`${API_BASE}/stores`, {
    headers: getHeaders()
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || 'Failed to list stores');
  }
  return res.json();
}

export async function createStore(displayName) {
  const res = await fetch(`${API_BASE}/stores`, {
    method: 'POST',
    headers: getHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ displayName }),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || 'Failed to create store');
  }
  return res.json();
}

export async function deleteStore(storeId) {
  const res = await fetch(`${API_BASE}/stores/${storeId}`, {
    method: 'DELETE',
    headers: getHeaders()
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || 'Failed to delete store');
  }
  return res.json();
}

export async function listDocuments(storeId) {
  const res = await fetch(`${API_BASE}/stores/${storeId}/documents`, {
    headers: getHeaders()
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || 'Failed to list documents');
  }
  return res.json();
}

export async function deleteDocument(storeId, docId) {
  const res = await fetch(`${API_BASE}/stores/${storeId}/documents/${docId}`, {
    method: 'DELETE',
    headers: getHeaders()
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || 'Failed to delete document');
  }
  return res.json();
}

export async function uploadFile(storeId, file) {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_BASE}/stores/${storeId}/upload`, {
    method: 'POST',
    headers: getHeaders(), // Note: No Content-Type here, fetch will set it for FormData
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
