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
              padding: '6px 10px',
              borderRadius: '4px',
              background: k.active ? 'rgba(var(--primary-rgb), 0.1)' : 'transparent',
              border: k.active ? '1px solid var(--primary)' : '1px solid var(--border)',
              cursor: 'pointer'
            }}
            onClick={() => setActiveKey(k.id)}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
              <span style={{ 
                width: '8px', 
                height: '8px', 
                borderRadius: '50%', 
                background: k.active ? 'var(--primary)' : '#ccc',
                flexShrink: 0
              }}></span>
              <span style={{ fontSize: '0.85rem', fontWeight: k.active ? '600' : 'normal', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {k.name}
              </span>
              <span style={{ fontSize: '0.7rem', color: '#888', fontFamily: 'monospace' }}>
                {k.key.slice(0, 4)}...{k.key.slice(-4)}
              </span>
            </div>
            <button 
              className="btn--icon" 
              onClick={(e) => { e.stopPropagation(); removeKey(k.id); }}
              title="Eliminar"
              style={{ padding: '2px', opacity: 0.6 }}
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
