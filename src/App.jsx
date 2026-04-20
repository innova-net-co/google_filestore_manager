import React, { useState, useCallback, useMemo } from 'react';
import { useStores } from './hooks/useStores';
import { useDocuments } from './hooks/useDocuments';
import { useApiKeys } from './hooks/useApiKeys';
import { uploadFile } from './services/api';
import { ToastProvider, useToast } from './components/Toast';
import Toolbar from './components/Toolbar';
import TreeView from './components/TreeView';
import StorePanel from './components/StorePanel';
import { ConfirmModal, InputModal } from './components/Modal';
import ApiKeyModal from './components/ApiKeyModal';

function AppContent() {
  const { storesByKey, loadingByKey, fetchStoresByKey, addStore, removeStore } = useStores();
  const { keys, addKey, removeKey, setActiveKey, hasKeys } = useApiKeys();
  const { success, error, info } = useToast();

  // Selección actual
  const [selectedStoreId, setSelectedStoreId] = useState(null);
  const [selectedDocId, setSelectedDocId] = useState(null);
  const [selectedKeyId, setSelectedKeyId] = useState(null);
  const [selectedKeyApiKey, setSelectedKeyApiKey] = useState(null);

  // Upload inline por store
  const [uploadingByStore, setUploadingByStore] = useState({});

  const {
    documents,
    loading: docsLoading,
    fetchDocuments,
    removeDocument,
    clearDocuments,
  } = useDocuments(selectedStoreId, selectedKeyApiKey);

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createStoreForKeyId, setCreateStoreForKeyId] = useState(null);
  const [createStoreApiKeyValue, setCreateStoreApiKeyValue] = useState(null);
  const [showDeleteStoreModal, setShowDeleteStoreModal] = useState(false);
  const [docToDelete, setDocToDelete] = useState(null);
  const [showAddKeyModal, setShowAddKeyModal] = useState(false);

  // Store seleccionado como objeto
  const selectedStore = useMemo(() => {
    if (!selectedStoreId || !selectedKeyId) return null;
    const keyStores = storesByKey[selectedKeyId] || [];
    return keyStores.find(s => s.name?.split('/').pop() === selectedStoreId) || null;
  }, [selectedStoreId, selectedKeyId, storesByKey]);

  // ===== Callbacks =====

  const handleLoadStores = useCallback((keyId, apiKeyValue) => {
    fetchStoresByKey(keyId, apiKeyValue);
  }, [fetchStoresByKey]);

  const handleSelectStore = useCallback((storeId, keyId, apiKeyValue) => {
    if (selectedStoreId === storeId) return;
    setSelectedStoreId(storeId);
    setSelectedKeyId(keyId);
    setSelectedKeyApiKey(apiKeyValue);
    setSelectedDocId(null);
    // Activar la clave correspondiente
    setActiveKey(keyId);
    info(`Cargando documentos de ${storeId}...`);
  }, [selectedStoreId, setActiveKey, info]);

  const handleSelectDoc = useCallback((storeId, docId) => {
    setSelectedStoreId(storeId);
    setSelectedDocId(docId);
  }, []);

  const handleRefresh = useCallback(() => {
    if (selectedKeyId && selectedKeyApiKey) {
      fetchStoresByKey(selectedKeyId, selectedKeyApiKey);
    }
    if (selectedStoreId) {
      fetchDocuments(selectedStoreId);
    }
    success('Datos actualizados');
  }, [fetchStoresByKey, fetchDocuments, selectedKeyId, selectedKeyApiKey, selectedStoreId, success]);

  const handleOpenCreateStore = useCallback((keyId, apiKeyValue) => {
    setCreateStoreForKeyId(keyId);
    setCreateStoreApiKeyValue(apiKeyValue);
    setShowCreateModal(true);
  }, []);

  const handleCreateStore = async (displayName) => {
    try {
      await addStore(displayName, createStoreForKeyId, createStoreApiKeyValue);
      setShowCreateModal(false);
      setCreateStoreForKeyId(null);
      setCreateStoreApiKeyValue(null);
      success(`Store "${displayName}" creado correctamente`);
    } catch (err) {
      error(`Error al crear store: ${err.message}`);
    }
  };

  const handleDeleteStore = async () => {
    if (!selectedStoreId || !selectedKeyId) return;
    try {
      await removeStore(selectedStoreId, selectedKeyId, selectedKeyApiKey);
      setShowDeleteStoreModal(false);
      setSelectedStoreId(null);
      setSelectedKeyId(null);
      setSelectedKeyApiKey(null);
      setSelectedDocId(null);
      clearDocuments();
      success('Store eliminado correctamente');
    } catch (err) {
      error(`Error al eliminar store: ${err.message}`);
    }
  };

  const handleTreeUpload = useCallback(async (storeId, file, apiKeyValue) => {
    setUploadingByStore(prev => ({ ...prev, [storeId]: true }));
    try {
      info(`Subiendo "${file.name}"...`);
      await uploadFile(storeId, file, apiKeyValue);
      success(`Archivo "${file.name}" subido correctamente`);
      // Refrescar documentos si este store está seleccionado
      if (storeId === selectedStoreId) {
        fetchDocuments(storeId);
      }
    } catch (err) {
      error(`Error al subir archivo: ${err.message}`);
    } finally {
      setUploadingByStore(prev => ({ ...prev, [storeId]: false }));
    }
  }, [selectedStoreId, fetchDocuments, info, success, error]);

  const handleDeleteDocument = async () => {
    if (!docToDelete) return;
    try {
      await removeDocument(docToDelete.storeId, docToDelete.docId);
      setDocToDelete(null);
      success(`Documento "${docToDelete.displayName}" eliminado`);
    } catch (err) {
      error(`Error al eliminar documento: ${err.message}`);
    }
  };

  const handleCreateKey = useCallback(() => {
    setShowAddKeyModal(true);
  }, []);

  const handleDeleteKey = useCallback((keyId) => {
    // Si la clave eliminada es la que tiene el store seleccionado, limpiar selección
    if (keyId === selectedKeyId) {
      setSelectedStoreId(null);
      setSelectedKeyId(null);
      setSelectedKeyApiKey(null);
      setSelectedDocId(null);
      clearDocuments();
    }
    removeKey(keyId);
    success('Clave eliminada');
  }, [selectedKeyId, removeKey, clearDocuments, success]);

  const isLoading = Object.values(loadingByKey).some(Boolean)
    || docsLoading
    || Object.values(uploadingByStore).some(Boolean);

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="sidebar__header">
          <span className="sidebar__logo">🔍</span>
          <h1 className="sidebar__title">File Search Stores</h1>
        </div>
        <div className="sidebar__content">
          <TreeView
            keys={keys}
            storesByKey={storesByKey}
            loadingByKey={loadingByKey}
            uploadingByStore={uploadingByStore}
            selectedStoreId={selectedStoreId}
            onLoadStores={handleLoadStores}
            onSelectStore={handleSelectStore}
            onCreateKey={handleCreateKey}
            onDeleteKey={handleDeleteKey}
            onCreateStore={handleOpenCreateStore}
            onUploadFile={handleTreeUpload}
          />
        </div>
      </aside>

      <main className="main">
        <Toolbar
          selectedStoreId={selectedStoreId}
          selectedDocId={selectedDocId}
          onDeleteStore={() => setShowDeleteStoreModal(true)}
          onDeleteDocument={() => {
            const doc = documents.find(d => d.name?.split('/').pop() === selectedDocId);
            setDocToDelete({
              storeId: selectedStoreId,
              docId: selectedDocId,
              displayName: doc?.displayName || selectedDocId,
            });
          }}
          onRefresh={handleRefresh}
          loading={isLoading}
        />

        <div className="main__content">
          <StorePanel
            store={selectedStore}
            documents={documents}
            docsLoading={docsLoading}
            uploading={uploadingByStore[selectedStoreId] || false}
            onUploadFile={(storeId, file) => handleTreeUpload(storeId, file, selectedKeyApiKey)}
            onDeleteDocument={(storeId, docId, displayName) => {
              setDocToDelete({ storeId, docId, displayName });
            }}
          />
        </div>
      </main>

      {/* Modal: crear store */}
      {showCreateModal && (
        <InputModal
          title="Nuevo File Search Store"
          label="Nombre del Store"
          placeholder="Ej: Documentación Técnica"
          onSubmit={handleCreateStore}
          onCancel={() => {
            setShowCreateModal(false);
            setCreateStoreForKeyId(null);
            setCreateStoreApiKeyValue(null);
          }}
        />
      )}

      {/* Modal: confirmar eliminar store */}
      {showDeleteStoreModal && (
        <ConfirmModal
          title="Eliminar Store"
          message={`¿Estás seguro de que deseas eliminar el store "${selectedStore?.displayName || selectedStoreId}"? Esta acción eliminará permanentemente todos los documentos contenidos.`}
          danger={true}
          onConfirm={handleDeleteStore}
          onCancel={() => setShowDeleteStoreModal(false)}
        />
      )}

      {/* Modal: confirmar eliminar documento */}
      {docToDelete && (
        <ConfirmModal
          title="Eliminar Documento"
          message={`¿Deseas eliminar el documento "${docToDelete.displayName}"?`}
          danger={true}
          onConfirm={handleDeleteDocument}
          onCancel={() => setDocToDelete(null)}
        />
      )}

      {/* Modal: agregar API Key (obligatorio si no hay claves, o bajo demanda) */}
      {(!hasKeys || showAddKeyModal) && (
        <ApiKeyModal
          onSubmit={(name, key) => {
            addKey(name, key);
            success('API Key configurada correctamente');
            setShowAddKeyModal(false);
          }}
          onCancel={hasKeys ? () => setShowAddKeyModal(false) : undefined}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}
