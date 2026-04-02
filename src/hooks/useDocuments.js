import { useState, useCallback } from 'react';
import { listDocuments, deleteDocument, uploadFile } from '../services/api';

export function useDocuments() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const fetchDocuments = useCallback(async (storeId) => {
    setLoading(true);
    setError(null);
    try {
      const data = await listDocuments(storeId);
      setDocuments(data.documents || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const removeDocument = useCallback(async (storeId, docId) => {
    setLoading(true);
    setError(null);
    try {
      await deleteDocument(storeId, docId);
      setDocuments((prev) => prev.filter((d) => {
        const id = d.name?.split('/').pop();
        return id !== docId;
      }));
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const upload = useCallback(async (storeId, file) => {
    setUploading(true);
    setError(null);
    try {
      const result = await uploadFile(storeId, file);
      // Re-fetch docs after upload to include the new one
      await fetchDocuments(storeId);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setUploading(false);
    }
  }, [fetchDocuments]);

  const clearDocuments = useCallback(() => {
    setDocuments([]);
    setError(null);
  }, []);

  return {
    documents,
    loading,
    uploading,
    error,
    fetchDocuments,
    removeDocument,
    upload,
    clearDocuments,
  };
}
