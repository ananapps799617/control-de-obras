// ============================================================
// BLOQUE 1: IMPORTACIONES Y DEPENDENCIAS
// Qué hace: Tabla dinámica para agregar, editar y eliminar ítems/muebles de la cotización.
// Por qué: Regla 2.2 Manual Maestro: Componentes modulares atómicos (< 200 líneas).
// ============================================================
import React from 'react';
import { Plus, Trash2 } from 'lucide-react';

interface TablaItemsCotizacionProps {
  items: Array<{ id: string; descripcion: string; cantidad: number; precioUnitario: number; total: number }>;
  onAgregarItem: () => void;
  onActualizarItem: (id: string, campo: string, valor: any) => void;
  onEliminarItem: (id: string) => void;
  totalGeneral: number;
}

export default function TablaItemsCotizacion({
  items,
  onAgregarItem,
  onActualizarItem,
  onEliminarItem,
  totalGeneral
}: TablaItemsCotizacionProps) {
  return (
    <div className="card" style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
        <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc' }}>
          Desglose de Ítems / Mobiliario a Cotizar
        </h3>
        <button
          type="button"
          onClick={onAgregarItem}
          className="btn btn-secondary"
          style={{ fontSize: '0.8rem', padding: '6px 12px', gap: '6px' }}
        >
          <Plus size={14} /> + Agregar Ítem
        </button>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table className="table" style={{ width: '100%', fontSize: '0.85rem' }}>
          <thead>
            <tr>
              <th style={{ width: '40px' }}>#</th>
              <th>Descripción del Mueble / Concepto</th>
              <th style={{ width: '90px' }}>Cant.</th>
              <th style={{ width: '160px' }}>Vlr. Unitario ($ COP)</th>
              <th style={{ width: '160px', textAlign: 'right' }}>Subtotal ($ COP)</th>
              <th style={{ width: '60px', textAlign: 'center' }}></th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr key={item.id}>
                <td style={{ color: '#94a3b8' }}>{idx + 1}</td>
                <td>
                  <input
                    type="text"
                    className="input"
                    placeholder="Ej: Mueble de Cocina Alto en Melamina RH"
                    value={item.descripcion}
                    onChange={(e) => onActualizarItem(item.id, 'descripcion', e.target.value)}
                    style={{ width: '100%' }}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    min="1"
                    className="input"
                    value={item.cantidad}
                    onChange={(e) => onActualizarItem(item.id, 'cantidad', e.target.value)}
                    style={{ width: '100%' }}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    className="input font-mono-num"
                    placeholder="0"
                    value={item.precioUnitario || ''}
                    onChange={(e) => onActualizarItem(item.id, 'precioUnitario', e.target.value)}
                    style={{ width: '100%', fontFamily: 'var(--font-mono)' }}
                  />
                </td>
                <td className="font-mono-num" style={{ textAlign: 'right', fontWeight: 700, color: '#38bdf8', fontFamily: 'var(--font-mono)' }}>
                  ${Number(item.total || 0).toLocaleString()}
                </td>
                <td style={{ textAlign: 'center' }}>
                  <button
                    type="button"
                    onClick={() => onEliminarItem(item.id)}
                    className="btn btn-secondary"
                    style={{ padding: '6px 8px', color: '#f87171' }}
                  >
                    <Trash2 size={13} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Caja de Total General */}
      <div style={{
        marginTop: '16px',
        padding: '14px 20px',
        background: 'rgba(56,189,248,0.08)',
        border: '1px solid rgba(56,189,248,0.2)',
        borderRadius: '8px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <span style={{ fontWeight: 600, color: '#94a3b8' }}>VALOR TOTAL DE LA COTIZACIÓN:</span>
        <strong className="font-mono-num" style={{ fontSize: '1.3rem', color: '#38bdf8', fontFamily: 'var(--font-mono)' }}>
          ${Number(totalGeneral || 0).toLocaleString()} COP
        </strong>
      </div>
    </div>
  );
}
