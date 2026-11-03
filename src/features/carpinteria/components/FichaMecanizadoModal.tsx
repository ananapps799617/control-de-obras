// ============================================================
// ARCHIVO: src/features/carpinteria/components/FichaMecanizadoModal.tsx
// QUÉ HACE: Modal de Ficha Técnica de Perforado y Mecanizado para Taller.
// POR QUÉ: Permite al operario saber exactamente dónde perforar en el banco de trabajo.
// ============================================================
import React, { useState } from 'react';
import { X, Wrench, CheckCircle2, Circle, Printer } from 'lucide-react';
import { PartMachiningMap } from '../types/mecanizados';

interface Props {
  isOpen: boolean;
  machiningMap: PartMachiningMap;
  onClose: () => void;
}

export default function FichaMecanizadoModal({ isOpen, machiningMap, onClose }: Props) {
  const piezas = Object.values(machiningMap).filter(p => p.holes.length > 0 || p.railAxes.length > 0);
  const [piezaActivaId, setPiezaActivaId] = useState<string>(piezas[0]?.partId || '');
  const [completados, setCompletados] = useState<Record<string, boolean>>({});

  if (!isOpen || piezas.length === 0) return null;

  const piezaActiva = piezas.find(p => p.partId === piezaActivaId) || piezas[0];

  const toggleCompletado = (id: string) => {
    setCompletados(prev => ({ ...prev, [id]: !prev[id] }));
  };

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
        maxWidth: '720px',
        maxHeight: '90vh',
        overflowY: 'auto',
        border: '1.5px solid var(--color-primary)',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '12px' }}>
          <div>
            <span className="badge-wood" style={{ fontSize: '0.7rem' }}>Guía de Ensamble y Fabricación CNC</span>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '8px', margin: '4px 0 0 0' }}>
              <Wrench size={18} color="#f59e0b" />
              <span>Mapa de Perforado & Ubicación de Rieles</span>
            </h3>
          </div>
          <button type="button" onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Selector de Pieza */}
        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
          {piezas.map(p => (
            <button
              key={p.partId}
              type="button"
              onClick={() => setPiezaActivaId(p.partId)}
              style={{
                padding: '6px 12px',
                fontSize: '0.75rem',
                fontWeight: 600,
                borderRadius: '6px',
                border: piezaActiva.partId === p.partId ? '1px solid var(--color-primary)' : '1px solid rgba(255,255,255,0.08)',
                background: piezaActiva.partId === p.partId ? 'rgba(56,189,248,0.15)' : 'rgba(255,255,255,0.03)',
                color: piezaActiva.partId === p.partId ? 'var(--color-primary)' : 'var(--text-secondary)',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              {p.partName} ({p.holes.length} barrenos)
            </button>
          ))}
        </div>

        {/* Resumen de Pieza */}
        <div style={{ background: 'rgba(15,23,42,0.6)', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Dimensiones del Tablero:</span>
            <div className="font-mono-num" style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-main)' }}>
              {piezaActiva.dimensiones.largo} mm × {piezaActiva.dimensiones.ancho} mm (e: {piezaActiva.dimensiones.espesor} mm)
            </div>
          </div>
          {piezaActiva.railAxes.length > 0 && (
            <span className="badge-cyan" style={{ fontSize: '0.72rem' }}>
              ↔️ {piezaActiva.railAxes.length} Rieles Telescópicos
            </span>
          )}
        </div>

        {/* Tabla de Perforaciones */}
        <div style={{ overflowX: 'auto', maxHeight: '300px', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '6px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--text-secondary)', textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <th style={{ padding: '8px 10px', width: '36px' }}>OK</th>
                <th style={{ padding: '8px 10px' }}>Operación / Herraje</th>
                <th style={{ padding: '8px 10px', textAlign: 'center' }}>Cota X (Frente)</th>
                <th style={{ padding: '8px 10px', textAlign: 'center' }}>Cota Y (Base)</th>
                <th style={{ padding: '8px 10px', textAlign: 'center' }}>Ø Broca</th>
                <th style={{ padding: '8px 10px', textAlign: 'center' }}>Profundidad</th>
              </tr>
            </thead>
            <tbody>
              {piezaActiva.holes.map((h, idx) => {
                const isDone = !!completados[h.id];
                return (
                  <tr key={h.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', opacity: isDone ? 0.6 : 1 }}>
                    <td style={{ padding: '6px 10px', textAlign: 'center' }}>
                      <button
                        type="button"
                        onClick={() => toggleCompletado(h.id)}
                        style={{ background: 'transparent', border: 'none', color: isDone ? '#10b981' : 'var(--text-secondary)', cursor: 'pointer', padding: 0 }}
                      >
                        {isDone ? <CheckCircle2 size={16} /> : <Circle size={16} />}
                      </button>
                    </td>
                    <td style={{ padding: '6px 10px', fontWeight: 600, color: 'var(--text-main)', textDecoration: isDone ? 'line-through' : 'none' }}>
                      {h.label}
                    </td>
                    <td className="font-mono-num" style={{ padding: '6px 10px', textAlign: 'center', color: '#38bdf8' }}>
                      {h.u} mm
                    </td>
                    <td className="font-mono-num" style={{ padding: '6px 10px', textAlign: 'center', color: '#f59e0b' }}>
                      {h.v} mm
                    </td>
                    <td className="font-mono-num" style={{ padding: '6px 10px', textAlign: 'center', color: 'var(--text-main)' }}>
                      Ø{h.diametro} mm
                    </td>
                    <td className="font-mono-num" style={{ padding: '6px 10px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                      {h.profundidad} mm
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '10px' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
            * Cotas calculadas bajo Sistema 32 (Frente 37mm, Cazoletas K=4mm, Paso 32mm).
          </span>
          <button type="button" className="btn-secondary" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
