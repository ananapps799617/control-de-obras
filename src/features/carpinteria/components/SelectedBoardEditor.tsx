// ============================================================
// ARCHIVO: src/features/carpinteria/components/SelectedBoardEditor.tsx
// QUÉ HACE: Editor de dimensiones, posición (X,Y,Z) y cantos del tablero seleccionado.
// POR QUÉ: Control táctil milimétrico de cada pieza libre.
// ============================================================
import React from 'react';
import { Sliders, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Move } from 'lucide-react';
import { TableroLibre } from '../types/freeDesign';

interface Props {
  tablero: TableroLibre;
  onUpdate: (updater: (prev: TableroLibre) => TableroLibre) => void;
}

export default function SelectedBoardEditor({ tablero, onUpdate }: Props) {
  const mover = (dx: number, dy: number, dz: number) => {
    onUpdate(prev => ({
      ...prev,
      pos: {
        x: prev.pos.x + dx,
        y: prev.pos.y + dy,
        z: prev.pos.z + dz
      }
    }));
  };

  return (
    <div className="card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', border: '1.5px solid var(--color-primary)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '6px', margin: 0 }}>
          <Sliders size={16} />
          <span>Editando: {tablero.nombre}</span>
        </h4>
        <span className="font-mono-num" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
          {tablero.largo} × {tablero.ancho} × {tablero.espesor} mm
        </span>
      </div>

      {/* Sliders de Dimensiones */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', marginBottom: '2px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Largo:</span>
            <strong className="font-mono-num" style={{ color: 'var(--color-primary)' }}>{tablero.largo} mm</strong>
          </div>
          <input
            type="range"
            min="100"
            max="2400"
            step="5"
            value={tablero.largo}
            onChange={(e) => onUpdate(prev => ({ ...prev, largo: Number(e.target.value) }))}
            style={{ width: '100%', accentColor: 'var(--color-primary)' }}
          />
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', marginBottom: '2px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Ancho:</span>
            <strong className="font-mono-num" style={{ color: 'var(--color-primary)' }}>{tablero.ancho} mm</strong>
          </div>
          <input
            type="range"
            min="100"
            max="1200"
            step="5"
            value={tablero.ancho}
            onChange={(e) => onUpdate(prev => ({ ...prev, ancho: Number(e.target.value) }))}
            style={{ width: '100%', accentColor: 'var(--color-primary)' }}
          />
        </div>
      </div>

      {/* Espesor y Cantos */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
        <div>
          <label style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '2px' }}>
            Espesor:
          </label>
          <select
            className="input font-mono-num"
            value={tablero.espesor}
            onChange={(e) => onUpdate(prev => ({ ...prev, espesor: Number(e.target.value) as any }))}
            style={{ width: '100%', padding: '4px 6px', fontSize: '0.75rem' }}
          >
            <option value={15}>15 mm</option>
            <option value={18}>18 mm (RH)</option>
            <option value={36}>36 mm (Doble)</option>
          </select>
        </div>

        <div>
          <label style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '2px' }}>
            Canto Largo:
          </label>
          <select
            className="input"
            value={tablero.cantoLargo}
            onChange={(e) => onUpdate(prev => ({ ...prev, cantoLargo: e.target.value as any }))}
            style={{ width: '100%', padding: '4px 6px', fontSize: '0.75rem' }}
          >
            <option value="RIGIDO_2MM">Rígido 2mm</option>
            <option value="FLEXIBLE_045MM">Flexible 0.45mm</option>
            <option value="NINGUNO">Sin Canto</option>
          </select>
        </div>
      </div>

      {/* Pad de Desplazamiento Táctil */}
      <div>
        <label style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px' }}>
          <Move size={12} /> Desplazar en el espacio (X, Y, Z):
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
          <button type="button" className="btn-secondary" onClick={() => mover(-50, 0, 0)} style={{ fontSize: '0.72rem', padding: '6px' }}>
            ⬅️ X -50
          </button>
          <button type="button" className="btn-secondary" onClick={() => mover(0, 50, 0)} style={{ fontSize: '0.72rem', padding: '6px' }}>
            ⬆️ Y +50
          </button>
          <button type="button" className="btn-secondary" onClick={() => mover(50, 0, 0)} style={{ fontSize: '0.72rem', padding: '6px' }}>
            ➡️ X +50
          </button>
          <button type="button" className="btn-secondary" onClick={() => mover(0, 0, -50)} style={{ fontSize: '0.72rem', padding: '6px' }}>
            🔼 Z -50
          </button>
          <button type="button" className="btn-secondary" onClick={() => mover(0, -50, 0)} style={{ fontSize: '0.72rem', padding: '6px' }}>
            ⬇️ Y -50
          </button>
          <button type="button" className="btn-secondary" onClick={() => mover(0, 0, 50)} style={{ fontSize: '0.72rem', padding: '6px' }}>
            🔽 Z +50
          </button>
        </div>
      </div>
    </div>
  );
}
