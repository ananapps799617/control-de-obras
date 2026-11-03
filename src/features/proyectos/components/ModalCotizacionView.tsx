// ============================================================
// BLOQUE 1: IMPORTACIONES Y DEPENDENCIAS
// Qué hace: Visualizador rápido en modal de una cotización vinculada al proyecto.
// Por qué: Regla 2.2 Manual Maestro: Componentes modulares atómicos (< 200 líneas).
// ============================================================
import React from 'react';
import { FileText, Download } from 'lucide-react';
import ModalForm from '../../../components/ModalForm.jsx';

interface ModalCotizacionViewProps {
  abierto: boolean;
  onClose: () => void;
  cotizacion: {
    codigoCotizacion?: string;
    clienteNombre?: string;
    totalGeneral?: number;
    items?: Array<{ id: string; descripcion: string; cantidad: number; total: number }>;
  } | null;
}

export default function ModalCotizacionView({
  abierto,
  onClose,
  cotizacion
}: ModalCotizacionViewProps) {
  if (!cotizacion) return null;

  return (
    <ModalForm
      abierto={abierto}
      onClose={onClose}
      titulo={`Cotización ${cotizacion.codigoCotizacion || 'Oficial'}`}
      maxWidth="680px"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '14px', borderRadius: '8px' }}>
          <div>
            <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Cliente Vinculado</div>
            <div style={{ fontSize: '1rem', fontWeight: 600, color: '#f8fafc' }}>{cotizacion.clienteNombre || 'No especificado'}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Monto Total General</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#38bdf8' }}>
              ${Number(cotizacion.totalGeneral || 0).toLocaleString()} COP
            </div>
          </div>
        </div>

        {cotizacion.items && cotizacion.items.length > 0 && (
          <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
            <table className="table" style={{ width: '100%', fontSize: '0.85rem' }}>
              <thead>
                <tr>
                  <th>Ítem / Concepto</th>
                  <th>Cant.</th>
                  <th style={{ textAlign: 'right' }}>Total ($ COP)</th>
                </tr>
              </thead>
              <tbody>
                {cotizacion.items.map((item, idx) => (
                  <tr key={item.id || idx}>
                    <td style={{ color: '#f8fafc' }}>{item.descripcion}</td>
                    <td>{item.cantidad}</td>
                    <td style={{ textAlign: 'right', fontWeight: 600, color: '#cbd5e1' }}>
                      ${Number(item.total || 0).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </ModalForm>
  );
}
