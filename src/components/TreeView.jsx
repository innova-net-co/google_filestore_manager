import { useState, useRef } from 'react';
import { useToast } from './Toast';

function getStoreId(store) {
  return store.name?.split('/').pop() || '';
}

function StoreNode({
  store,
  isSelected,
  uploading,
  onSelectStore,
  onUploadFile,
}) {
  const { success } = useToast();
  const fileInputRef = useRef(null);
  const storeId = getStoreId(store);
  const activeCount = store.activeDocumentsCount || '0';
  const displayName = store.displayName || storeId;

  const handleUploadClick = (e) => {
    e.stopPropagation();
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = '';
    if (files.length === 0) return;

    for (const file of files) {
      await onUploadFile?.(storeId, file);
    }
  };

  return (
    <div className="tree-node tree-node--store">
      <div
        className={`tree-node__row ${isSelected ? 'tree-node__row--selected' : ''}`}
        onClick={() => onSelectStore(storeId)}
      >
        <span className="tree-node__icon">📁</span>
        <div className="tree-node__info">
          <span className="tree-node__label" title={displayName}>{displayName}</span>
          <span className="tree-node__sublabel">
            {store.name}
            <button
              className="copy-btn"
              onClick={(e) => {
                e.stopPropagation();
                navigator.clipboard.writeText(store.name);
                success('Nombre del Store copiado');
              }}
              title="Copiar nombre completo"
            >
              <svg viewBox="0 0 16 16" fill="currentColor">
                <path d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 0 1 0 1.5h-1.5a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-1.5a.75.75 0 0 1 1.5 0v1.5A1.75 1.75 0 0 1 9.25 16h-7.5A1.75 1.75 0 0 1 0 14.25Z" />
                <path d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0 1 14.25 11h-7.5A1.75 1.75 0 0 1 5 9.25Zm1.75-.25a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-7.5a.25.25 0 0 0-.25-.25Z" />
              </svg>
            </button>
          </span>
        </div>
        <span className="tree-node__badge tree-node__badge--count">{activeCount}</span>
        <button
          className="tree-node__action-btn"
          onClick={handleUploadClick}
          disabled={uploading}
          title="Subir archivo"
        >
          {uploading
            ? <span className="spinner spinner--sm" style={{ width: '12px', height: '12px' }} />
            : '📎'}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
      </div>
    </div>
  );
}

function KeyNode({
  apiKey,
  isExpanded,
  stores,
  storesLoading,
  selectedStoreId,
  uploadingByStore,
  onToggle,
  onCreateStore,
  onDeleteKey,
  onSelectStore,
  onUploadFile,
}) {
  return (
    <div className="tree-node tree-node--key">
      <div
        className="tree-node__row tree-node__row--key"
        onClick={() => onToggle(apiKey.id)}
      >
        <span className={`tree-node__chevron ${isExpanded ? 'tree-node__chevron--expanded' : ''}`}>
          ▶
        </span>
        {apiKey.active && (
          <span className="key-active-dot" title="Clave activa" />
        )}
        <span className="tree-node__icon" style={{ fontSize: '0.85em' }}>🔑</span>
        <div className="tree-node__info">
          <span className="tree-node__label key-label" title={apiKey.name}>
            {apiKey.name}
          </span>
          {apiKey.active && (
            <span style={{
              fontSize: '0.6rem',
              background: 'var(--success)',
              color: '#fff',
              padding: '1px 5px',
              borderRadius: '10px',
              fontWeight: '600',
              letterSpacing: '0.02em',
            }}>
              ACTIVA
            </span>
          )}
        </div>
        {storesLoading && (
          <span className="spinner spinner--sm" style={{ marginLeft: '4px', marginRight: '4px' }} />
        )}
        <button
          className="tree-node__action-btn tree-node__action-btn--add"
          onClick={(e) => {
            e.stopPropagation();
            onCreateStore(apiKey.id, apiKey.key);
          }}
          title="Adicionar Store"
        >
          ＋
        </button>
        <button
          className="tree-node__action-btn tree-node__action-btn--delete"
          onClick={(e) => {
            e.stopPropagation();
            onDeleteKey(apiKey.id);
          }}
          title="Eliminar Clave"
        >
          ✕
        </button>
      </div>
      {isExpanded && (
        <div className="tree-node__children tree-node__children--key">
          {storesLoading ? (
            <div className="tree-node__row" style={{ paddingLeft: 'calc(var(--space-lg) + 24px)' }}>
              <span className="spinner spinner--sm"></span>
              <span className="tree-node__label" style={{ color: 'var(--text-secondary)' }}>
                Cargando stores...
              </span>
            </div>
          ) : stores && stores.length > 0 ? (
            stores.map((store) => {
              const storeId = store.name?.split('/').pop() || '';
              const isSelected = selectedStoreId === storeId;
              return (
                <div key={storeId} style={{ paddingLeft: 'var(--space-md)' }}>
                  <StoreNode
                    store={store}
                    isSelected={isSelected}
                    uploading={uploadingByStore?.[storeId] || false}
                    onSelectStore={(sid) => onSelectStore(sid, apiKey.id, apiKey.key)}
                    onUploadFile={(sid, file) => onUploadFile(sid, file, apiKey.key)}
                  />
                </div>
              );
            })
          ) : (
            <div className="tree-node__row" style={{ paddingLeft: 'calc(var(--space-lg) + 24px)' }}>
              <span className="tree-node__label" style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
                Sin stores
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function TreeView({
  keys,
  storesByKey,
  loadingByKey,
  uploadingByStore,
  selectedStoreId,
  onLoadStores,
  onSelectStore,
  onCreateKey,
  onDeleteKey,
  onCreateStore,
  onUploadFile,
}) {
  const [expandedKeyId, setExpandedKeyId] = useState(null);

  const handleKeyToggle = (keyId) => {
    if (expandedKeyId === keyId) {
      // Cerrar la clave abierta
      setExpandedKeyId(null);
    } else {
      // Abrir esta clave (cierra la anterior automáticamente)
      setExpandedKeyId(keyId);
      // Siempre recargar stores al expandir
      const key = keys?.find(k => k.id === keyId);
      if (key) {
        onLoadStores(keyId, key.key);
      }
    }
  };

  if (!keys || keys.length === 0) {
    return (
      <div className="empty-state" style={{ padding: 'var(--space-xl)' }}>
        <div className="empty-state__icon">🔑</div>
        <div className="empty-state__title">Sin claves configuradas</div>
        <div className="empty-state__text">
          Crea una clave API para comenzar.
        </div>
        <button
          className="btn btn--primary"
          style={{ marginTop: 'var(--space-md)' }}
          onClick={onCreateKey}
        >
          ➕ Crear Clave
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="tree-header">
        <button className="btn btn--primary btn--sm" onClick={onCreateKey}>
          ➕ Crear Clave
        </button>
      </div>
      {keys.map((apiKey) => (
        <KeyNode
          key={apiKey.id}
          apiKey={apiKey}
          isExpanded={expandedKeyId === apiKey.id}
          stores={storesByKey[apiKey.id]}
          storesLoading={loadingByKey[apiKey.id] || false}
          selectedStoreId={selectedStoreId}
          uploadingByStore={uploadingByStore}
          onToggle={handleKeyToggle}
          onCreateStore={onCreateStore}
          onDeleteKey={onDeleteKey}
          onSelectStore={onSelectStore}
          onUploadFile={onUploadFile}
        />
      ))}
    </div>
  );
}
