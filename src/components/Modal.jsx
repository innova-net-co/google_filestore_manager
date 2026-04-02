import { useState, useEffect, useRef } from 'react';

export function ConfirmModal({ title, message, onConfirm, onCancel, danger = false }) {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal__title">{title}</div>
        <div className="modal__body">{message}</div>
        <div className="modal__actions">
          <button className="btn" onClick={onCancel}>Cancelar</button>
          <button
            className={`btn ${danger ? 'btn--danger' : 'btn--primary'}`}
            onClick={onConfirm}
            style={danger ? { background: 'var(--danger)', color: '#fff', borderColor: 'var(--danger)' } : {}}
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}

export function InputModal({ title, label, placeholder, onSubmit, onCancel }) {
  const [value, setValue] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = () => {
    if (value.trim()) {
      onSubmit(value.trim());
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSubmit();
    } else if (e.key === 'Escape') {
      onCancel();
    }
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal__title">{title}</div>
        <div className="modal__body">
          <label>{label}</label>
          <input
            ref={inputRef}
            className="modal__input"
            type="text"
            placeholder={placeholder}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>
        <div className="modal__actions">
          <button className="btn" onClick={onCancel}>Cancelar</button>
          <button
            className="btn btn--primary"
            onClick={handleSubmit}
            disabled={!value.trim()}
          >
            Crear
          </button>
        </div>
      </div>
    </div>
  );
}
