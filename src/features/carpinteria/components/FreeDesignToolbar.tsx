// ============================================================
// ARCHIVO: src/features/carpinteria/components/FreeDesignToolbar.tsx
// QUÉ HACE: Barra de herramientas táctil del Modo Diseño Libre 3D.
// POR QUÉ: Ergonomía estilo SketchUp (+ Tablero, Duplicar, Snap, Borrar).
// ============================================================
import React from 'react';
import { Plus, Magnet, Copy, Trash2, RotateCw, Sparkles, Layers } from 'lucide-react';
import { TableroLibre, OrientacionTablero } from '../types/freeDesign';
import { IMelamina, CATALOGO_MELAMINAS } from '../types/melaminas';

interface Props {
  tableros: TableroLibre[];
  selectedId: string | null;
  snapActivado: boolean;
  melaminaActiva: IMelamina;
  onAddTablero: (orientacion: OrientacionTablero) => void;
  onToggleSnap: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onRotateOrientacion: () => void;
  onReset: () => void;
}

export default function FreeDesignToolbar({
  tableros,
  selectedId,
  snapActivado,
  melaminaActiva,
  onAddTablero,
  onToggleSnap,
  onDuplicate,
  onDelete,
  onRotateOrientacion,
  onReset
}: Props) {
  const haySeleccion = selectedId !== null;

  return (
    <div className="card" style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
          <Layers size={16} color="var(--color-primary)" />
          <span>Herramientas de Ensamble Libre</span>
        </h3>

        {/* Toggle de Snap Magnético */}
        <button
          type="button"
          onClick={onToggleSnap}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '5px 10px',
            fontSize: '0.75rem',
            fontWeight: 600,
            borderRadius: '6px',
            border: snapActivado ? '1px solid #10b981' : '1px solid rgba(255,255,255,0.1)',
            background: snapActivado ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.03)',
            color: snapActivado ? '#10b981' : 'var(--text-secondary)',
            cursor: 'pointer'
          }}
        >
          <Magnet size={14} />
          <span>Snap Magnético: {snapActivado ? 'ACTIVO' : 'OFF'}</span>
        </button>
      </div>

      {/* Botones de Añadir Tableros Rápidos */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
        <button
          type="button"
          className="btn-primary-cyan"
          onClick={() => onAddTablero('vertical-lateral')}
          style={{ fontSize: '0.75rem', padding: '7px 4px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
        >
          <Plus size={14} /> Lateral Vertical
        </button>

        <button
          type="button"
          className="btn-primary-cyan"
          onClick={() => onAddTablero('horizontal-base')}
          style={{ fontSize: '0.75rem', padding: '7px 4px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
        >
          <Plus size={14} /> Base / Repisa
        </button>

        <button
          type="button"
          className="btn-primary-cyan"
          onClick={() => onAddTablero('frontal-fondo')}
          style={{ fontSize: '0.75rem', padding: '7px 4px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
        >
          <Plus size={14} /> Fondo / Puerta
        </button>
      </div>

      {/* Acciones para Pieza Seleccionada */}
      {haySeleccion && (
        <div style={{ display: 'flex', gap: '6px', paddingTop: '4px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <button
            type="button"
            onClick={onDuplicate}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              padding: '6px 8px',
              fontSize: '0.75rem',
              fontWeight: 600,
              borderRadius: '6px',
              border: '1px solid rgba(56,189,248,0.3)',
              background: 'rgba(56,189,248,0.1)',
              color: 'var(--color-primary)',
              cursor: 'pointer'
            }}
          >
            <Copy size={13} /> Duplicar
          </button>

          <button
            type="button"
            onClick={onRotateOrientacion}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              padding: '6px 8px',
              fontSize: '0.75rem',
              fontWeight: 600,
              borderRadius: '6px',
              border: '1px solid rgba(245,158,11,0.3)',
              background: 'rgba(245,158,11,0.1)',
              color: '#f59e0b',
              cursor: 'pointer'
            }}
          >
            <RotateCw size={13} /> Rotar 90°
          </button>

          <button
            type="button"
            onClick={onDelete}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '6px 12px',
              fontSize: '0.75rem',
              fontWeight: 600,
              borderRadius: '6px',
              border: '1px solid rgba(239,68,68,0.3)',
              background: 'rgba(239,68,68,0.1)',
              color: '#ef4444',
              cursor: 'pointer'
            }}
          >
            <Trash2 size={13} />
          </button>
        </div>
      )}
    </div>
  );
}
