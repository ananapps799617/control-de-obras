// ============================================================
// ARCHIVO: src/features/carpinteria/components/TapeMeasureHUD.tsx
// QUÉ HACE: Panel HUD flotante de medición milimétrica en tiempo real.
// POR QUÉ: Muestra distancias euclidianas y deltas ortogonales estilo SketchUp.
// ============================================================
import React from 'react';
import { Ruler, MapPin, Trash2, X } from 'lucide-react';
import { MeasureData } from '../three/TapeMeasureTool';

interface Props {
  data: MeasureData;
  onAddGuide: () => void;
  onClearGuides: () => void;
  onClose: () => void;
}

export default function TapeMeasureHUD({ data, onAddGuide, onClearGuides, onClose }: Props) {
  return (
    <div style={{
      position: 'absolute',
      bottom: '68px',
      left: '12px',
      background: 'rgba(15,23,42,0.92)',
      border: '1.5px solid #f59e0b',
      borderRadius: '10px',
      padding: '12px 16px',
      backdropFilter: 'blur(10px)',
      boxShadow: '0 10px 25px -5px rgba(0,0,0,0.6)',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      minWidth: '260px',
      zIndex: 20
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '6px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#f59e0b', fontSize: '0.8rem', fontWeight: 700 }}>
          <Ruler size={15} />
          <span>Cinta Métrica 3D</span>
        </div>
        <button
          type="button"
          onClick={onClose}
          style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: 0 }}
        >
          <X size={15} />
        </button>
      </div>

      {/* Distancia Principal */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Distancia Total:</span>
        <span className="font-mono-num" style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f59e0b' }}>
          {data.distance.toFixed(1)} <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>mm</span>
        </span>
      </div>

      {/* Desglose de Deltas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', background: 'rgba(0,0,0,0.3)', padding: '6px 8px', borderRadius: '6px' }}>
        <div style={{ textAlign: 'center' }}>
          <span style={{ fontSize: '0.65rem', color: '#f87171', display: 'block', fontWeight: 600 }}>ΔX (Ancho)</span>
          <strong className="font-mono-num" style={{ fontSize: '0.78rem', color: 'var(--text-main)' }}>{data.dx}</strong>
        </div>
        <div style={{ textAlign: 'center' }}>
          <span style={{ fontSize: '0.65rem', color: '#34d399', display: 'block', fontWeight: 600 }}>ΔY (Alto)</span>
          <strong className="font-mono-num" style={{ fontSize: '0.78rem', color: 'var(--text-main)' }}>{data.dy}</strong>
        </div>
        <div style={{ textAlign: 'center' }}>
          <span style={{ fontSize: '0.65rem', color: '#38bdf8', display: 'block', fontWeight: 600 }}>ΔZ (Prof)</span>
          <strong className="font-mono-num" style={{ fontSize: '0.78rem', color: 'var(--text-main)' }}>{data.dz}</strong>
        </div>
      </div>

      {/* Botones de Acción */}
      <div style={{ display: 'flex', gap: '6px', marginTop: '2px' }}>
        <button
          type="button"
          onClick={onAddGuide}
          disabled={!data.start}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px',
            padding: '5px 8px',
            fontSize: '0.72rem',
            fontWeight: 600,
            borderRadius: '6px',
            border: '1px solid rgba(56,189,248,0.3)',
            background: 'rgba(56,189,248,0.15)',
            color: 'var(--color-primary)',
            cursor: data.start ? 'pointer' : 'not-allowed',
            opacity: data.start ? 1 : 0.5
          }}
        >
          <MapPin size={12} /> Fijar Guía
        </button>

        {data.guidesCount > 0 && (
          <button
            type="button"
            onClick={onClearGuides}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              padding: '5px 8px',
              fontSize: '0.72rem',
              fontWeight: 600,
              borderRadius: '6px',
              border: '1px solid rgba(239,68,68,0.3)',
              background: 'rgba(239,68,68,0.15)',
              color: '#ef4444',
              cursor: 'pointer'
            }}
            title="Borrar todas las guías"
          >
            <Trash2 size={12} /> ({data.guidesCount})
          </button>
        )}
      </div>
    </div>
  );
}
