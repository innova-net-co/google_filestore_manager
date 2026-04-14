import React, { useState, useEffect, useCallback } from 'react';
import { useStores } from './hooks/useStores';
import { useDocuments } from './hooks/useDocuments';
import { useApiKeys } from './hooks/useApiKeys';
import { ToastProvider, useToast } from './components/Toast';
import Toolbar from './components/Toolbar';
import TreeView from './components/TreeView';
import StorePanel from './components/StorePanel';
import { ConfirmModal, InputModal } from './components/Modal';
import ApiKeyManager from './components/ApiKeyManager';
import ApiKeyModal from './components/ApiKeyModal';

function AppContent() {
  const { stores, loading: storesLoading, fetchStores, addStore, removeStore } = useStores();
  const { documents, loading: docsLoading, uploading, fetchDocuments, removeDocument, upload, clearDocuments } = useDocuments();
  const { keys, addKey, hasKeys, getActiveKey } = useApiKeys();
  const { success, error, info } = useToast();

  const activeKey = getActiveKey();
  const [selectedStoreId, setSelectedStoreId] = useState(null);
  const [selectedDocId, setSelectedDocId] = useState(null);
  const [selectedStore, setSelectedStore] = useState(null);
  
  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteStoreModal, setShowDeleteStoreModal] = useState(false);
  const [docToDelete, setDocToDelete] = useState(null);

  // Initial load when keys are present or change
  useEffect(() => {
    if (hasKeys) {
      fetchStores();
    } else {
      // Si no hay keys, limpiar datos
      clearDocuments();
      setSelectedStoreId(null);
    }
  }, [hasKeys, activeKey?.id, fetchStores, clearDocuments]);

  // Sync selected store object
  useEffect(() => {
    if (selectedStoreId) {
      const store = stores.find(s => s.name?.split('/').pop() === selectedStoreId);
      setSelectedStore(store);
    } else {
      setSelectedStore(null);
    }
  }, [selectedStoreId, stores]);

  const handleSelectStore = useCallback((storeId) => {
    if (selectedStoreId === storeId) return;
    
    setSelectedStoreId(storeId);
    setSelectedDocId(null);
    fetchDocuments(storeId);
    info(`Cargando documentos de ${storeId}...`);
  }, [selectedStoreId, fetchDocuments, info]);

  const handleSelectDoc = useCallback((storeId, docId) => {
    setSelectedStoreId(storeId);
    setSelectedDocId(docId);
  }, []);

  const handleRefresh = useCallback(() => {
    fetchStores();
    if (selectedStoreId) {
      fetchDocuments(selectedStoreId);
    }
    success('Datos actualizados');
  }, [fetchStores, fetchDocuments, selectedStoreId, success]);

  const handleCreateStore = async (displayName) => {
    try {
      await addStore(displayName);
      setShowCreateModal(false);
      success(`Store "${displayName}" creado correctamente`);
    } catch (err) {
      error(`Error al crear store: ${err.message}`);
    }
  };

  const handleDeleteStore = async () => {
    if (!selectedStoreId) return;
    try {
      await removeStore(selectedStoreId);
      setShowDeleteStoreModal(false);
      setSelectedStoreId(null);
      clearDocuments();
      success('Store eliminado correctamente');
    } catch (err) {
      error(`Error al eliminar store: ${err.message}`);
    }
  };

  const handleUploadFile = async (storeId, file) => {
    try {
      info(`Subiendo "${file.name}"...`);
      await upload(storeId, file);
      success(`Archivo "${file.name}" subido correctamente`);
    } catch (err) {
      error(`Error al subir archivo: ${err.message}`);
    }
  };

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

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="sidebar__header">
          <span className="sidebar__logo">🔍</span>
          <h1 className="sidebar__title">File Search Stores</h1>
        </div>
        <ApiKeyManager />
        <div className="sidebar__content">
          <TreeView
            stores={stores}
            storesLoading={storesLoading}
            selectedStoreId={selectedStoreId}
            selectedDocId={selectedDocId}
            documents={documents}
            docsLoading={docsLoading}
            onSelectStore={handleSelectStore}
            onSelectDoc={handleSelectDoc}
          />
        </div>
      </aside>

      <main className="main">
        <Toolbar
          selectedStoreId={selectedStoreId}
          selectedDocId={selectedDocId}
          onCreateStore={() => setShowCreateModal(true)}
          onDeleteStore={() => setShowDeleteStoreModal(true)}
          onUploadFile={handleUploadFile}
          onDeleteDocument={() => {
            const doc = documents.find(d => d.name?.split('/').pop() === selectedDocId);
            setDocToDelete({
              storeId: selectedStoreId,
              docId: selectedDocId,
              displayName: doc?.displayName || selectedDocId
            });
          }}
          onRefresh={handleRefresh}
          loading={storesLoading || docsLoading || uploading}
        />
        
        <div className="main__content">
          <StorePanel
            store={selectedStore}
            documents={documents}
            docsLoading={docsLoading}
            uploading={uploading}
            onUploadFile={(storeId) => {
              // Trigger upload icon from here as well if needed
              const btn = document.querySelector('.btn--ghost');
              if (btn && btn.textContent.includes('Subir')) btn.click();
            }}
            onDeleteDocument={(storeId, docId, displayName) => {
              setDocToDelete({ storeId, docId, displayName });
            }}
          />
        </div>
      </main>

      {/* Modals */}
      {showCreateModal && (
        <InputModal
          title="Nuevo File Search Store"
          label="Nombre del Store"
          placeholder="Ej: Documentación Técnica"
          onSubmit={handleCreateStore}
          onCancel={() => setShowCreateModal(false)}
        />
      )}

      {showDeleteStoreModal && (
        <ConfirmModal
          title="Eliminar Store"
          message={`¿Estás seguro de que deseas eliminar el store "${selectedStore?.displayName || selectedStoreId}"? Esta acción eliminará permanentemente todos los documentos contenidos.`}
          danger={true}
          onConfirm={handleDeleteStore}
          onCancel={() => setShowDeleteStoreModal(false)}
        />
      )}

      {docToDelete && (
        <ConfirmModal
          title="Eliminar Documento"
          message={`¿Deseas eliminar el documento "${docToDelete.displayName}"?`}
          danger={true}
          onConfirm={handleDeleteDocument}
          onCancel={() => setDocToDelete(null)}
        />
      )}

      {!hasKeys && (
        <ApiKeyModal 
          onSubmit={(name, key) => {
            addKey(name, key);
            success('API Key configurada correctamente');
          }} 
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
