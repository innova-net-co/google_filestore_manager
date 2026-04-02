import { useState, useCallback } from 'react';
import { listStores, createStore, deleteStore } from '../services/api';

export function useStores() {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchStores = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listStores();
      setStores(data.stores || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const addStore = useCallback(async (displayName) => {
    setLoading(true);
    setError(null);
    try {
      const newStore = await createStore(displayName);
      setStores((prev) => [...prev, newStore]);
      return newStore;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const removeStore = useCallback(async (storeId) => {
    setLoading(true);
    setError(null);
    try {
      await deleteStore(storeId);
      setStores((prev) => prev.filter((s) => {
        const id = s.name?.split('/').pop();
        return id !== storeId;
      }));
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    stores,
    loading,
    error,
    fetchStores,
    addStore,
    removeStore,
  };
}
