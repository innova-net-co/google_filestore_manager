import { useState, useCallback } from 'react';
import { listStores, createStore, deleteStore } from '../services/api';

export function useStores() {
  // Mapa de stores por keyId: { [keyId]: stores[] }
  const [storesByKey, setStoresByKey] = useState({});
  // Mapa de loading por keyId: { [keyId]: boolean }
  const [loadingByKey, setLoadingByKey] = useState({});
  const [error, setError] = useState(null);

  /**
   * Carga los stores de una clave API específica.
   * @param {string} keyId - ID interno de la clave
   * @param {string} apiKeyValue - Valor de la API key de Google
   */
  const fetchStoresByKey = useCallback(async (keyId, apiKeyValue) => {
    setLoadingByKey(prev => ({ ...prev, [keyId]: true }));
    setError(null);
    try {
      const data = await listStores(apiKeyValue);
      setStoresByKey(prev => ({ ...prev, [keyId]: data.stores || [] }));
    } catch (err) {
      setError(err.message);
      setStoresByKey(prev => ({ ...prev, [keyId]: [] }));
    } finally {
      setLoadingByKey(prev => ({ ...prev, [keyId]: false }));
    }
  }, []);

  /**
   * Crea un store bajo una clave API específica.
   * @param {string} displayName - Nombre del store
   * @param {string} keyId - ID interno de la clave
   * @param {string} apiKeyValue - Valor de la API key de Google
   */
  const addStore = useCallback(async (displayName, keyId, apiKeyValue) => {
    setError(null);
    try {
      const newStore = await createStore(displayName, apiKeyValue);
      setStoresByKey(prev => ({
        ...prev,
        [keyId]: [...(prev[keyId] || []), newStore],
      }));
      return newStore;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  /**
   * Elimina un store de una clave API específica.
   * @param {string} storeId - ID del store a eliminar
   * @param {string} keyId - ID interno de la clave propietaria
   * @param {string} apiKeyValue - Valor de la API key de Google
   */
  const removeStore = useCallback(async (storeId, keyId, apiKeyValue) => {
    setError(null);
    try {
      await deleteStore(storeId, apiKeyValue);
      setStoresByKey(prev => ({
        ...prev,
        [keyId]: (prev[keyId] || []).filter(s => s.name?.split('/').pop() !== storeId),
      }));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  return {
    storesByKey,
    loadingByKey,
    error,
    fetchStoresByKey,
    addStore,
    removeStore,
  };
}
