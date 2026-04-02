import { useRef } from 'react';

export default function Toolbar({
  selectedStoreId,
  selectedDocId,
  onCreateStore,
  onDeleteStore,
  onUploadFile,
  onDeleteDocument,
  onRefresh,
  loading,
}) {
  const fileInputRef = useRef(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file && selectedStoreId) {
      onUploadFile?.(selectedStoreId, file);
    }
    // Reset input for re-uploading same file
    e.target.value = '';
  };

  return (
    <div className="toolbar">
      <button
        className="btn btn--primary"
        onClick={onCreateStore}
        disabled={loading}
      >
        ➕ Nuevo Store
      </button>

      <div className="toolbar__separator" />

      {selectedStoreId && (
        <>
          <button
            className="btn btn--ghost"
            onClick={handleUploadClick}
            disabled={loading}
          >
            📎 Subir Archivo
          </button>
          <button
            className="btn btn--danger"
            onClick={() => onDeleteStore?.(selectedStoreId)}
            disabled={loading}
          >
            🗑️ Eliminar Store
          </button>
        </>
      )}

      {selectedDocId && (
        <>
          <div className="toolbar__separator" />
          <button
            className="btn btn--danger"
            onClick={() => onDeleteDocument?.()}
            disabled={loading}
          >
            🗑️ Eliminar Documento
          </button>
        </>
      )}

      <div style={{ flex: 1 }} />

      <button
        className="btn btn--ghost btn--icon"
        onClick={onRefresh}
        disabled={loading}
        title="Refrescar"
      >
        🔄
      </button>

      <input
        ref={fileInputRef}
        type="file"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
    </div>
  );
}
