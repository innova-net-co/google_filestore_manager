import { useState } from 'react';
import { useApiKeys } from '../hooks/useApiKeys';

export default function ApiKeyManager() {
  const { keys, addKey, removeKey, setActiveKey } = useApiKeys();
  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newKey, setNewKey] = useState('');

  const handleAdd = (e) => {
    e.preventDefault();
    if (newName.trim() && newKey.trim()) {
      addKey(newName.trim(), newKey.trim());
      setNewName('');
      setNewKey('');
      setShowForm(false);
    }
  };

  return (
    <div className="api-key-manager" style={{ padding: '1rem', borderBottom: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
        <h3 style={{ margin: 0, fontSize: '0.9rem' }}>Gestión de API Keys</h3>
        <button 
          className="btn btn--primary" 
          onClick={() => setShowForm(!showForm)}
          style={{ padding: '2px 8px', fontSize: '0.8rem' }}
        >
          {showForm ? 'Cancelar' : 'Añadir Nueva'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem', flexDirection: 'column' }}>
          <input
            className="modal__input"
            style={{ padding: '4px 8px' }}
            placeholder="Nombre (ej. Mi Proyecto)"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <input
            className="modal__input"
            style={{ padding: '4px 8px' }}
            placeholder="API Key de Google"
            type="password"
            value={newKey}
            onChange={(e) => setNewKey(e.target.value)}
          />
          <button 
            type="submit" 
            className="btn btn--primary"
            disabled={!newName.trim() || !newKey.trim()}
          >
            Guardar Clave
          </button>
        </form>
      )}

      <div className="api-key-list" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {keys.map((k) => (
          <div
            key={k.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 10px',
              borderRadius: '6px',
              background: k.active ? 'var(--accent-subtle)' : 'var(--bg-tertiary)',
              border: k.active ? '1px solid var(--accent)' : '1px solid var(--border)',
              cursor: 'pointer',
              transition: 'all 150ms ease',
              boxShadow: k.active ? '0 0 0 1px var(--accent)' : 'none',
            }}
            onClick={() => setActiveKey(k.id)}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden', flex: 1, minWidth: 0 }}>
              <span style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: k.active ? 'var(--success)' : 'var(--text-muted)',
                flexShrink: 0,
                boxShadow: k.active ? '0 0 6px var(--success)' : 'none',
              }}></span>
              <span style={{
                fontSize: '0.85rem',
                fontWeight: k.active ? '600' : '400',
                color: k.active ? 'var(--accent)' : 'var(--text-primary)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                flex: 1,
                minWidth: 0,
              }}>
                {k.name}
              </span>
              {k.active && (
                <span style={{
                  fontSize: '0.65rem',
                  background: 'var(--success)',
                  color: '#fff',
                  padding: '1px 6px',
                  borderRadius: '10px',
                  fontWeight: '600',
                  flexShrink: 0,
                  letterSpacing: '0.02em',
                }}>
                  ACTIVA
                </span>
              )}
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'monospace', flexShrink: 0 }}>
                {k.key.slice(0, 4)}···{k.key.slice(-4)}
              </span>
            </div>
            <button
              className="btn--icon"
              onClick={(e) => { e.stopPropagation(); removeKey(k.id); }}
              title="Eliminar"
              style={{
                padding: '2px',
                marginLeft: '6px',
                color: 'var(--danger)',
                opacity: 0.7,
                flexShrink: 0,
              }}
            >
              ✕
            </button>
          </div>
        ))}
        {keys.length === 0 && (
          <div style={{ fontSize: '0.8rem', color: '#888', fontStyle: 'italic', textAlign: 'center', padding: '10px' }}>
            No hay claves configuradas.
          </div>
        )}
      </div>
    </div>
  );
}
