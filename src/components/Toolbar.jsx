export default function Toolbar({
  selectedStoreId,
  selectedDocId,
  onDeleteStore,
  onDeleteDocument,
  onRefresh,
  loading,
}) {
  return (
    <div className="toolbar">
      {selectedStoreId && (
        <>
          <button
            className="btn btn--danger"
            onClick={() => onDeleteStore?.(selectedStoreId)}
            disabled={loading}
          >
            🗑️ Eliminar Store
          </button>
          <div className="toolbar__separator" />
        </>
      )}

      {selectedDocId && (
        <>
          <button
            className="btn btn--danger"
            onClick={() => onDeleteDocument?.()}
            disabled={loading}
          >
            🗑️ Eliminar Documento
          </button>
          <div className="toolbar__separator" />
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
    </div>
  );
}
