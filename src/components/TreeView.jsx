import { useState } from 'react';
import { useToast } from './Toast';

function getStoreId(store) {
  return store.name?.split('/').pop() || '';
}

function getDocId(doc) {
  return doc.name?.split('/').pop() || '';
}

function formatBytes(bytes) {
  if (!bytes) return '0 B';
  const num = parseInt(bytes, 10);
  if (num === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(num) / Math.log(k));
  return parseFloat((num / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function StateBadge({ state }) {
  const stateMap = {
    STATE_ACTIVE: { className: 'badge--active', icon: '●', label: 'Active' },
    STATE_PENDING: { className: 'badge--pending', icon: '◐', label: 'Pending' },
    STATE_FAILED: { className: 'badge--failed', icon: '●', label: 'Failed' },
  };
  const info = stateMap[state] || { className: '', icon: '○', label: state || 'Unknown' };
  return (
    <span className={`badge ${info.className}`}>
      {info.icon} {info.label}
    </span>
  );
}

function StoreNode({
  store,
  isSelected,
  isExpanded,
  documents,
  docsLoading,
  selectedDocId,
  onSelectStore,
  onSelectDoc,
  onToggleExpand,
}) {
  const { success } = useToast();
  const storeId = getStoreId(store);
  const activeCount = store.activeDocumentsCount || '0';
  const displayName = store.displayName || storeId;

  return (
    <div className="tree-node">
      <div
        className={`tree-node__row ${isSelected ? 'tree-node__row--selected' : ''}`}
        onClick={() => {
          onSelectStore(storeId);
          onToggleExpand(storeId);
        }}
      >
        <span className={`tree-node__chevron ${isExpanded ? 'tree-node__chevron--expanded' : ''}`}>
          ▶
        </span>
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
      </div>
      {isExpanded && (
        <div className="tree-node__children">
          {docsLoading ? (
            <div className="tree-node__row" style={{ paddingLeft: 'calc(var(--space-lg) + 24px)' }}>
              <span className="spinner spinner--sm"></span>
              <span className="tree-node__label" style={{ color: 'var(--text-secondary)' }}>
                Cargando documentos...
              </span>
            </div>
          ) : documents && documents.length > 0 ? (
            documents.map((doc) => {
              const docId = getDocId(doc);
              return (
                <div
                  key={docId}
                  className={`tree-node__row ${selectedDocId === docId ? 'tree-node__row--selected' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectDoc(storeId, docId);
                  }}
                >
                  <span className="tree-node__icon">📄</span>
                  <span className="tree-node__label" title={doc.displayName || docId}>
                    {doc.displayName || docId}
                  </span>
                  <StateBadge state={doc.state} />
                </div>
              );
            })
          ) : (
            <div className="tree-node__row" style={{ paddingLeft: 'calc(var(--space-lg) + 24px)' }}>
              <span className="tree-node__label" style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
                Sin documentos
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function TreeView({
  stores,
  storesLoading,
  selectedStoreId,
  selectedDocId,
  documents,
  docsLoading,
  onSelectStore,
  onSelectDoc,
}) {
  const [expandedStores, setExpandedStores] = useState(new Set());

  const handleToggleExpand = (storeId) => {
    setExpandedStores((prev) => {
      const next = new Set(prev);
      if (next.has(storeId)) {
        next.delete(storeId);
      } else {
        next.add(storeId);
      }
      return next;
    });
  };

  if (storesLoading) {
    return (
      <div className="empty-state" style={{ padding: 'var(--space-xl)' }}>
        <span className="spinner spinner--lg"></span>
        <p style={{ marginTop: 'var(--space-md)', color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>
          Cargando stores...
        </p>
      </div>
    );
  }

  if (!stores || stores.length === 0) {
    return (
      <div className="empty-state" style={{ padding: 'var(--space-xl)' }}>
        <div className="empty-state__icon">📂</div>
        <div className="empty-state__title">Sin stores</div>
        <div className="empty-state__text">
          No se encontraron File Search Stores. Crea uno nuevo para comenzar.
        </div>
      </div>
    );
  }

  return (
    <div>
      {stores.map((store) => {
        const storeId = getStoreId(store);
        const isExpanded = expandedStores.has(storeId);
        const isSelected = selectedStoreId === storeId;
        return (
          <StoreNode
            key={storeId}
            store={store}
            isSelected={isSelected}
            isExpanded={isExpanded}
            documents={isSelected ? documents : []}
            docsLoading={isSelected && docsLoading}
            selectedDocId={selectedDocId}
            onSelectStore={onSelectStore}
            onSelectDoc={onSelectDoc}
            onToggleExpand={handleToggleExpand}
          />
        );
      })}
    </div>
  );
}
