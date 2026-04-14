import { useState, useEffect } from 'react';

const STORAGE_KEY = 'google_filestore_api_keys';

export const useApiKeys = () => {
  const [keys, setKeys] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(keys));
  }, [keys]);

  const addKey = (name, key) => {
    const newKey = {
      id: crypto.randomUUID(),
      name,
      key,
      active: keys.length === 0 // Activa si es la primera
    };
    setKeys([...keys, newKey]);
    return newKey;
  };

  const removeKey = (id) => {
    const keyToRemove = keys.find(k => k.id === id);
    const newKeys = keys.filter(k => k.id !== id);
    
    // Si la que borramos era la activa, activar otra si existe
    if (keyToRemove?.active && newKeys.length > 0) {
      newKeys[0].active = true;
    }
    
    setKeys(newKeys);
  };

  const setActiveKey = (id) => {
    setKeys(keys.map(k => ({
      ...k,
      active: k.id === id
    })));
  };

  const getActiveKey = () => {
    return keys.find(k => k.active);
  };

  return {
    keys,
    addKey,
    removeKey,
    setActiveKey,
    getActiveKey,
    hasKeys: keys.length > 0
  };
};
