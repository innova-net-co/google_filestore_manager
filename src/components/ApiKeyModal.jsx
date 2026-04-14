import { useState, useRef, useEffect } from 'react';

export default function ApiKeyModal({ onSubmit }) {
  const [name, setName] = useState('');
  const [key, setKey] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim() && key.trim()) {
      onSubmit(name.trim(), key.trim());
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal__title">Configuración de API Key</div>
        <div className="modal__body">
          <p style={{ fontSize: '0.9rem', marginBottom: '1rem', color: '#666' }}>
            Bienvenido. Para comenzar, por favor ingresa una API Key de Google Generative Language. 
            Tus claves se guardarán localmente en este navegador.
          </p>
          
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.85rem' }}>Nombre de la cuenta</label>
            <input
              ref={inputRef}
              className="modal__input"
              type="text"
              placeholder="Ej: Mi Proyecto Personal"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.85rem' }}>API Key</label>
            <input
              className="modal__input"
              type="password"
              placeholder="AIza..."
              value={key}
              onChange={(e) => setKey(e.target.value)}
            />
          </div>
        </div>
        <div className="modal__actions">
          <button
            className="btn btn--primary"
            onClick={handleSubmit}
            disabled={!name.trim() || !key.trim()}
            style={{ width: '100%' }}
          >
            Configurar y Empezar
          </button>
        </div>
      </div>
    </div>
  );
}
