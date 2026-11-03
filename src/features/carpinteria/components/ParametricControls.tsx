// ============================================================
// ARCHIVO: src/features/carpinteria/components/ParametricControls.tsx
// QUÉ HACE: Panel de control paramétrico de medidas, puertas batientes/elevables/corredizas y repisas.
// POR QUÉ: Permite al usuario reconfigurar el mueble con sliders y selectores inmediatos.
// ============================================================
import React from 'react';
import { Sliders, AlertTriangle } from 'lucide-react';
import { CabinetSpec, TipoMueble3D, TipoSistemaPuertas } from '../types/cabinet3d';

interface Props {
  spec: CabinetSpec;
  onChangeSpec: (updater: (prev: CabinetSpec) => CabinetSpec) => void;
}

export default function ParametricControls({ spec, onChangeSpec }: Props) {
  const aplicarPreset = (tipo: TipoMueble3D, preset?: 'puertas' | 'cajonera') => {
    if (tipo === 'modulo-bajo') {
      if (preset === 'cajonera') {
        onChangeSpec(prev => ({
          ...prev,
          tipo,
          ancho: 600,
          alto: 750,
          profundidad: 550,
          numeroCajones: 3,
          puertas: 0,
          numeroRepisas: 0,
          conZocalo: true,
          alturaZocalo: 100,
          divisionesVerticales: 0
        }));
      } else {
        onChangeSpec(prev => ({
          ...prev,
          tipo,
          ancho: 800,
          alto: 750,
          profundidad: 550,
          numeroCajones: 0,
          puertas: 2,
          tipoSistemaPuertas: 'batiente',
          numeroRepisas: 1,
          conZocalo: true,
          alturaZocalo: 100,
          divisionesVerticales: 0
        }));
      }
    } else if (tipo === 'alacena') {
      onChangeSpec(prev => ({
        ...prev,
        tipo,
        ancho: 800,
        alto: 600,
        profundidad: 320,
        numeroCajones: 0,
        puertas: 1,
        tipoSistemaPuertas: 'elevable-basculante',
        numeroRepisas: 1,
        conZocalo: false,
        alturaZocalo: 0,
        divisionesVerticales: 0
      }));
    } else if (tipo === 'closet-estanteria') {
      onChangeSpec(prev => ({
        ...prev,
        tipo,
        ancho: 1200,
        alto: 2000,
        profundidad: 600,
        numeroCajones: 0,
        puertas: 2,
        tipoSistemaPuertas: 'corrediza',
        numeroRepisas: 4,
        conZocalo: true,
        alturaZocalo: 80,
        divisionesVerticales: 0
      }));
    }
  };

  const anchoMinimo = spec.espesorEstructura * 2 + 100;
  const esAnchoInvalido = spec.ancho < anchoMinimo;

  return (
    <div className="card" style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
          <Sliders size={18} color="var(--color-primary)" />
          <span>Dimensiones & Ensamble</span>
        </h3>
        <span className="font-mono-num" style={{ fontSize: '0.75rem', color: 'var(--color-primary)' }}>
          {spec.ancho} × {spec.alto} × {spec.profundidad} mm
        </span>
      </div>

      {/* Selector de Arquetipos */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Arquetipos & Presets:</label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
          {[
            { id: 'modulo-bajo-puertas', label: 'Bajo Puertas', onClick: () => aplicarPreset('modulo-bajo', 'puertas'), active: spec.tipo === 'modulo-bajo' && spec.numeroCajones === 0 },
            { id: 'modulo-bajo-cajones', label: 'Bajo Cajonera', onClick: () => aplicarPreset('modulo-bajo', 'cajonera'), active: spec.tipo === 'modulo-bajo' && spec.numeroCajones > 0 },
            { id: 'alacena', label: 'Alacena Alta', onClick: () => aplicarPreset('alacena'), active: spec.tipo === 'alacena' },
            { id: 'closet-estanteria', label: 'Estantería', onClick: () => aplicarPreset('closet-estanteria'), active: spec.tipo === 'closet-estanteria' }
          ].map(m => (
            <button
              key={m.id}
              type="button"
              onClick={m.onClick}
              style={{
                padding: '6px 2px',
                fontSize: '0.72rem',
                fontWeight: 600,
                borderRadius: 'var(--radius-sm)',
                border: m.active ? '1px solid var(--color-primary)' : '1px solid var(--border-subtle)',
                background: m.active ? 'rgba(56,189,248,0.15)' : 'rgba(255,255,255,0.03)',
                color: m.active ? 'var(--color-primary)' : 'var(--text-secondary)',
                cursor: 'pointer'
              }}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Sliders de Dimensiones */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '2px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Ancho Exterior (X):</span>
            <strong className="font-mono-num" style={{ color: 'var(--color-primary)' }}>{spec.ancho} mm</strong>
          </div>
          <input
            type="range"
            min="300"
            max="1800"
            step="10"
            value={spec.ancho}
            onChange={(e) => onChangeSpec(prev => ({ ...prev, ancho: Number(e.target.value) }))}
            style={{ width: '100%', accentColor: 'var(--color-primary)' }}
          />
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '2px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Alto Total (Y):</span>
            <strong className="font-mono-num" style={{ color: 'var(--color-primary)' }}>{spec.alto} mm</strong>
          </div>
          <input
            type="range"
            min="300"
            max="2400"
            step="10"
            value={spec.alto}
            onChange={(e) => onChangeSpec(prev => ({ ...prev, alto: Number(e.target.value) }))}
            style={{ width: '100%', accentColor: 'var(--color-primary)' }}
          />
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '2px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Profundidad (Z):</span>
            <strong className="font-mono-num" style={{ color: 'var(--color-primary)' }}>{spec.profundidad} mm</strong>
          </div>
          <input
            type="range"
            min="200"
            max="800"
            step="10"
            value={spec.profundidad}
            onChange={(e) => onChangeSpec(prev => ({ ...prev, profundidad: Number(e.target.value) }))}
            style={{ width: '100%', accentColor: 'var(--color-primary)' }}
          />
        </div>
      </div>

      {/* Espesores */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
        <div>
          <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '2px' }}>
            Espesor Tablero:
          </label>
          <select
            className="input font-mono-num"
            value={spec.espesorEstructura}
            onChange={(e) => onChangeSpec(prev => ({ ...prev, espesorEstructura: Number(e.target.value) as any }))}
            style={{ width: '100%', padding: '5px 6px', fontSize: '0.78rem' }}
          >
            <option value={15}>15 mm (Estándar)</option>
            <option value={18}>18 mm (Estructural RH)</option>
            <option value={36}>36 mm (Engrosado)</option>
          </select>
        </div>

        <div>
          <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '2px' }}>
            Fondo MDP:
          </label>
          <select
            className="input font-mono-num"
            value={spec.espesorFondo}
            onChange={(e) => onChangeSpec(prev => ({ ...prev, espesorFondo: Number(e.target.value) as any }))}
            style={{ width: '100%', padding: '5px 6px', fontSize: '0.78rem' }}
          >
            <option value={3}>3 mm (Clásico)</option>
            <option value={6}>6 mm (Reforzado)</option>
          </select>
        </div>
      </div>

      {/* Modulación de Cajones y Parantes */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
        <div>
          <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '2px' }}>
            📦 Cajones:
          </label>
          <select
            className="input font-mono-num"
            value={spec.numeroCajones}
            onChange={(e) => {
              const val = Number(e.target.value) as any;
              onChangeSpec(prev => ({
                ...prev,
                numeroCajones: val,
                puertas: val > 0 ? 0 : prev.puertas,
                numeroRepisas: val > 0 ? 0 : prev.numeroRepisas
              }));
            }}
            style={{ width: '100%', padding: '5px 6px', fontSize: '0.78rem' }}
          >
            <option value={0}>Sin Cajones</option>
            <option value={1}>1 Cajón</option>
            <option value={2}>2 Gavetas</option>
            <option value={3}>3 Cajones (1+2)</option>
            <option value={4}>4 Cajones</option>
          </select>
        </div>

        <div>
          <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '2px' }}>
            Parantes Verticales:
          </label>
          <select
            className="input font-mono-num"
            value={spec.divisionesVerticales}
            onChange={(e) => onChangeSpec(prev => ({ ...prev, divisionesVerticales: Number(e.target.value) }))}
            style={{ width: '100%', padding: '5px 6px', fontSize: '0.78rem' }}
          >
            <option value={0}>1 Cuerpo (Sin Parante)</option>
            <option value={1}>2 Cuerpos (1 Parante)</option>
            <option value={2}>3 Cuerpos (2 Parantes)</option>
          </select>
        </div>
      </div>

      {/* Puertas y Repisas (cuando no hay cajones) */}
      {spec.numeroCajones === 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <div>
              <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '2px' }}>
                Puertas:
              </label>
              <select
                className="input"
                value={spec.puertas}
                onChange={(e) => onChangeSpec(prev => ({ ...prev, puertas: Number(e.target.value) as any }))}
                style={{ width: '100%', padding: '5px 6px', fontSize: '0.78rem' }}
              >
                <option value={0}>Abierto</option>
                <option value={1}>1 Puerta</option>
                <option value={2}>2 Puertas</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '2px' }}>
                Repisas:
              </label>
              <select
                className="input font-mono-num"
                value={spec.numeroRepisas}
                onChange={(e) => onChangeSpec(prev => ({ ...prev, numeroRepisas: Number(e.target.value) }))}
                style={{ width: '100%', padding: '5px 6px', fontSize: '0.78rem' }}
              >
                {[0, 1, 2, 3, 4, 5, 6].map(n => (
                  <option key={n} value={n}>{n === 0 ? 'Sin Repisas' : `${n} Repisas`}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Selector de Sistema de Apertura de Puertas */}
          {spec.puertas > 0 && (
            <div>
              <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--color-primary)', display: 'block', marginBottom: '2px' }}>
                🚪 Sistema de Apertura de Puertas:
              </label>
              <select
                className="input"
                value={spec.tipoSistemaPuertas || 'batiente'}
                onChange={(e) => onChangeSpec(prev => ({ ...prev, tipoSistemaPuertas: e.target.value as TipoSistemaPuertas }))}
                style={{ width: '100%', padding: '6px 8px', fontSize: '0.78rem', borderColor: 'var(--color-primary)' }}
              >
                <option value="batiente">🚪 Batientes (Bisagras de Cazoleta 35mm)</option>
                <option value="elevable-basculante">🛫 Elevable / Basculante (Pistones Gas / Aventos)</option>
                <option value="corrediza">↔️ Corredizas (Rieles Superior/Inferior)</option>
              </select>
            </div>
          )}
        </div>
      )}

      {/* Guard Clause */}
      {esAnchoInvalido && (
        <div style={{ padding: '6px 10px', background: 'rgba(239,68,68,0.15)', border: '1px solid #ef4444', borderRadius: '6px', fontSize: '0.72rem', color: '#fca5a5', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <AlertTriangle size={14} color="#ef4444" />
          <span>El ancho mínimo para este espesor es {anchoMinimo} mm.</span>
        </div>
      )}
    </div>
  );
}
