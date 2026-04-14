import { useState, useCallback, useEffect, useRef } from 'react';
import { listDocuments, deleteDocument, uploadFile } from '../services/api';

export function useDocuments() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const pollTimerRef = useRef(null);

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

  // Polling logic
  useEffect(() => {
    const hasPending = documents.some(doc => doc.state === 'STATE_PENDING');
    
    if (hasPending) {
      // If we already have a timer, don't start another one
      if (!pollTimerRef.current) {
        pollTimerRef.current = setInterval(() => {
          // Find the storeId from the first document (they all belong to the same store in this hook's context)
          const storeId = documents[0].name.split('/')[1];
          if (storeId) {
            fetchDocuments(storeId);
          }
        }, 5000);
      }
    } else {
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current);
        pollTimerRef.current = null;
      }
    }

    return () => {
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current);
        pollTimerRef.current = null;
      }
    };
  }, [documents, fetchDocuments]);

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
