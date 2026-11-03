import React from 'react';
import { X } from 'lucide-react';

// ============================================================
// BLOQUE: MODAL REUTILIZABLE DE REGISTRO / EDICIÓN
// Qué hace: Renderiza una ventana modal con formulario responsivo.
// Por qué: Reutilización modular según Regla RT-02.
// ============================================================
export default function ModalForm({ titulo, abierto, onClose, children, maxWidth = '540px', cerrarEnOverlay = false }) {
  if (!abierto) return null;

  return (
    <div className="modal-overlay" onClick={() => { if (cerrarEnOverlay) onClose(); }}>
      <div 
        className="modal-container" 
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: maxWidth }}
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px',
          borderBottom: '1px solid var(--border-color)',
          paddingBottom: '12px'
        }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-main)' }}>
            {titulo}
          </h2>
          <button 
            type="button"
            onClick={onClose} 
            className="btn btn-secondary" 
            style={{ minHeight: '36px', width: '36px', padding: 0, borderRadius: 'var(--radius-full)' }}
            title="Cerrar ventana"
          >
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
