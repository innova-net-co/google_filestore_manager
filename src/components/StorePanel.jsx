import { useState } from 'react';
import { useToast } from './Toast';
import { searchStore } from '../services/api';

function formatBytes(bytes) {
  if (!bytes) return '0 B';
  const num = parseInt(bytes, 10);
  if (num === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(num) / Math.log(k));
  return parseFloat((num / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
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

export default function StorePanel({
  store,
  documents,
  docsLoading,
  onDeleteDocument,
  onUploadFile,
  uploading,
}) {
  const { success, error: toastError } = useToast();
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState(null);

  if (!store) {
    return (
      <div className="empty-state">
        <div className="empty-state__icon">🗂️</div>
        <div className="empty-state__title">File Search Store Admin</div>
        <div className="empty-state__text">
          Selecciona un store del panel lateral para ver sus archivos, o crea uno nuevo.
        </div>
      </div>
    );
  }

  const storeId = store.name?.split('/').pop() || '';
  const displayName = store.displayName || storeId;

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setSearching(true);
    setResults(null);
    try {
      const data = await searchStore(storeId, query);
      setResults(data);
      success(`Sincronización de búsqueda completada`);
    } catch (err) {
      toastError(err.message);
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="store-panel">
      <div className="store-panel__header">
        <div className="store-panel__header-top">
          <h1 className="store-panel__title">📁 {displayName}</h1>
          <div className="store-panel__id-badge">
            {store.name}
            <button 
              className="copy-btn" 
              onClick={() => {
                navigator.clipboard.writeText(store.name);
                success('ID copiado al portapapeles');
              }}
              title="Copiar ID del Store"
            >
              <svg viewBox="0 0 16 16" fill="currentColor">
                <path d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 0 1 0 1.5h-1.5a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-1.5a.75.75 0 0 1 1.5 0v1.5A1.75 1.75 0 0 1 9.25 16h-7.5A1.75 1.75 0 0 1 0 14.25Z" />
                <path d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0 1 14.25 11h-7.5A1.75 1.75 0 0 1 5 9.25Zm1.75-.25a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-7.5a.25.25 0 0 0-.25-.25Z" />
              </svg>
            </button>
          </div>
        </div>
        <div className="store-panel__meta">
          <span className="store-panel__stat">
            🟢 {store.activeDocumentsCount || 0} activos
          </span>
          <span className="store-panel__stat">
            🟡 {store.pendingDocumentsCount || 0} pendientes
          </span>
          <span className="store-panel__stat">
            🔴 {store.failedDocumentsCount || 0} fallidos
          </span>
          <span className="store-panel__stat">
            💾 {formatBytes(store.sizeBytes)}
          </span>
          {store.createTime && (
            <span className="store-panel__stat">
              📅 {formatDate(store.createTime)}
            </span>
          )}
        </div>
      </div>

      <div className="store-panel__search">
        <form onSubmit={handleSearch} className="search-box">
          <input
            type="text"
            className="search-box__input"
            placeholder="Buscar contenido en este store..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={searching}
          />
          <button 
            type="submit" 
            className="btn btn--primary" 
            disabled={searching || !query.trim()}
          >
            {searching ? <span className="spinner spinner--sm"></span> : '🔍'} Buscar
          </button>
        </form>

        {results && (
          <div className="search-results">
            <h3 className="search-results__title">
              Respuesta generada (RAG)
            </h3>
            {results.answer && (
              <div className="result-answer">
                {results.answer}
              </div>
            )}
            
            <h3 className="search-results__title" style={{ marginTop: 'var(--space-lg)' }}>
              Fuentes recuperadas ({results.results?.length || 0})
            </h3>
            {results.results?.length > 0 ? (
              <div className="results-list">
                {results.results.map((result, idx) => (
                  <div key={idx} className="result-item">
                    <div className="result-item__text">{result.fileData?.content || 'Contenido del fragmento'}</div>
                    <div className="result-item__meta">
                      <span className="result-item__file">Archivo: {result.fileData?.fileResourceName?.split('/').pop() || 'Archivo origen'}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="search-results__empty">No se encontraron fragmentos para "{query}".</p>
            )}
            <button className="btn btn--secondary btn--sm" style={{ marginTop: 'var(--space-sm)' }} onClick={() => setResults(null)}>
              Limpiar resultados
            </button>
          </div>
        )}
      </div>

      <div className="store-panel__docs">
        <div className="store-panel__docs-header">
          Documentos {documents?.length ? `(${documents.length})` : ''}
          {uploading && (
            <span style={{ marginLeft: '8px' }}>
              <span className="spinner spinner--sm"></span> Subiendo...
            </span>
          )}
        </div>

        {docsLoading ? (
          <div style={{ padding: 'var(--space-xl)', textAlign: 'center' }}>
            <span className="spinner"></span>
            <p style={{ marginTop: 'var(--space-sm)', color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>
              Cargando documentos...
            </p>
          </div>
        ) : !documents || documents.length === 0 ? (
          <div style={{ padding: 'var(--space-xl)', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <p style={{ fontSize: 'var(--font-size-sm)' }}>No hay documentos en este store.</p>
            <button
              className="btn btn--primary"
              style={{ marginTop: 'var(--space-md)' }}
              onClick={() => onUploadFile?.(storeId)}
            >
              📎 Subir Archivo
            </button>
          </div>
        ) : (
          documents.map((doc) => {
            const docId = doc.name?.split('/').pop() || '';
            return (
              <div key={docId} className="doc-row">
                <span className="doc-row__icon">📄</span>
                <div className="doc-row__info">
                  <div className="doc-row__name">{doc.displayName || docId}</div>
                  <div className="doc-row__meta">
                    <span>{doc.mimeType || 'unknown'}</span>
                    <span>{formatBytes(doc.sizeBytes)}</span>
                    {doc.createTime && <span>{formatDate(doc.createTime)}</span>}
                  </div>
                </div>
                <StateBadge state={doc.state} />
                <div className="doc-row__actions">
                  <button
                    className="btn btn--danger btn--icon"
                    title="Eliminar documento"
                    onClick={() => onDeleteDocument?.(storeId, docId, doc.displayName || docId)}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
