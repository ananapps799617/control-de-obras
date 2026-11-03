// ============================================================
// ARCHIVO: src/features/carpinteria/components/RoomStudioModal.tsx
// QUÉ HACE: Modal para configurar el Entorno Realista de Habitación (Pisos y Paredes).
// POR QUÉ: Permite ambientar cocinas, salas y clósets para clientes.
// ============================================================
import React from 'react';
import { X, Home, Check } from 'lucide-react';
import { RoomEnvironmentOptions, TipoPisoStudio, TipoParedStudio } from '../types/roomStudio';

interface Props {
  isOpen: boolean;
  options: RoomEnvironmentOptions;
  onChangeOptions: (updater: (prev: RoomEnvironmentOptions) => RoomEnvironmentOptions) => void;
  onClose: () => void;
}

const PISOS: { id: TipoPisoStudio; label: string; icon: string; desc: string }[] = [
  { id: 'madera-parquet', label: 'Madera / Parquet', icon: '🪵', desc: 'Listones cálidos de roble/nogal' },
  { id: 'porcelanato-claro', label: 'Porcelanato Claro', icon: '🏛️', desc: 'Baldosas 60x60 brillantes' },
  { id: 'cemento-pulido', label: 'Cemento Pulido', icon: '🏢', desc: 'Microcemento industrial gris' }
];

const PAREDES: { id: TipoParedStudio; label: string; color: string }[] = [
  { id: 'blanco-yeso', label: 'Blanco Yeso', color: '#f1f5f9' },
  { id: 'gris-microcemento', label: 'Gris Cemento', color: '#94a3b8' },
  { id: 'beige-arena', label: 'Beige Arena', color: '#e2d9cc' }
];

export default function RoomStudioModal({ isOpen, options, onChangeOptions, onClose }: Props) {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.75)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '16px'
    }}>
      <div className="card" style={{
        width: '100%',
        maxWidth: '560px',
        border: '1.5px solid #10b981',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '10px' }}>
          <div>
            <span style={{ fontSize: '0.68rem', color: '#10b981', background: 'rgba(16,185,129,0.1)', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>
              Studio 3D PBR
            </span>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#10b981', display: 'flex', alignItems: 'center', gap: '8px', margin: '4px 0 0 0' }}>
              <Home size={20} />
              <span>Entorno Realista de Habitación</span>
            </h3>
          </div>
          <button type="button" onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Toggle Activar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(15,23,42,0.6)', padding: '10px 14px', borderRadius: '8px' }}>
          <div>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>
              Activar Piso y Paredes de Estudio
            </span>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', margin: 0 }}>
              Muestra el mueble en un rincón de habitación con sombras e iluminación cálida
            </p>
          </div>
          <input
            type="checkbox"
            checked={options.activo}
            onChange={(e) => onChangeOptions(prev => ({ ...prev, activo: e.target.checked }))}
            style={{ width: '18px', height: '18px', accentColor: '#10b981' }}
          />
        </div>

        {/* Selector de Piso */}
        <div>
          <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
            1. Tipo de Piso / Pavimento:
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '8px' }}>
            {PISOS.map(p => (
              <button
                key={p.id}
                type="button"
                onClick={() => onChangeOptions(prev => ({ ...prev, tipoPiso: p.id, activo: true }))}
                style={{
                  padding: '10px',
                  borderRadius: '6px',
                  border: options.tipoPiso === p.id && options.activo ? '1.5px solid #10b981' : '1px solid rgba(255,255,255,0.08)',
                  background: options.tipoPiso === p.id && options.activo ? 'rgba(16,185,129,0.15)' : 'rgba(15,23,42,0.4)',
                  color: options.tipoPiso === p.id && options.activo ? '#10b981' : 'var(--text-main)',
                  textAlign: 'left',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '1rem' }}>{p.icon}</span>
                  {options.tipoPiso === p.id && options.activo && <Check size={14} color="#10b981" />}
                </div>
                <span style={{ fontSize: '0.78rem', fontWeight: 700 }}>{p.label}</span>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>{p.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Selector de Pared */}
        <div>
          <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
            2. Color y Acabado de Pared:
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
            {PAREDES.map(w => (
              <button
                key={w.id}
                type="button"
                onClick={() => onChangeOptions(prev => ({ ...prev, tipoPared: w.id, activo: true }))}
                style={{
                  padding: '8px',
                  borderRadius: '6px',
                  border: options.tipoPared === w.id && options.activo ? '1.5px solid #10b981' : '1px solid rgba(255,255,255,0.08)',
                  background: options.tipoPared === w.id && options.activo ? 'rgba(16,185,129,0.15)' : 'rgba(15,23,42,0.4)',
                  color: options.tipoPared === w.id && options.activo ? '#10b981' : 'var(--text-main)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <div style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: w.color, border: '1px solid rgba(0,0,0,0.2)' }} />
                <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>{w.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Rodapié Toggle */}
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--text-main)', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={options.mostrarRodapie}
            onChange={(e) => onChangeOptions(prev => ({ ...prev, mostrarRodapie: e.target.checked }))}
            style={{ accentColor: '#10b981' }}
          />
          <span>Mostrar Guardaescobas / Rodapié Blanco Perimetral (80 mm)</span>
        </label>

        {/* Botón Aplicar */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px' }}>
          <button
            type="button"
            className="btn-primary-cyan"
            onClick={onClose}
            style={{ fontSize: '0.8rem', padding: '7px 16px', background: '#10b981', color: '#0f172a', fontWeight: 700 }}
          >
            Listo / Ver en 3D
          </button>
        </div>
      </div>
    </div>
  );
}
