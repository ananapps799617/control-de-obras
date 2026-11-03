import React from 'react';
import { Trash2 } from 'lucide-react';

// ============================================================
// BLOQUE 1: TABLA DE ABONOS DEL CLIENTE
// Qué hace: Muestra la tabla de abonos recibidos por proyecto.
// Por qué: Extraído de FinanzasPage.jsx para reducir su tamaño.
// ============================================================
export default function TablaAbonos({ abonos, onEliminar }) {
  if (abonos.length === 0) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
        No hay abonos de cliente registrados para este proyecto. Haz clic en <strong>+ Registrar Abono</strong>.
      </div>
    );
  }

  return (
    <div className="card" style={{ padding: '16px', overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem', textAlign: 'left' }}>
        <thead>
          <tr style={{ background: '#0f172a', color: '#34d399', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <th style={{ padding: '10px 12px' }}>Fecha</th>
            <th style={{ padding: '10px 12px' }}>Concepto / Detalle</th>
            <th style={{ padding: '10px 12px' }}>Método de Pago</th>
            <th style={{ padding: '10px 12px', textAlign: 'right' }}>Monto Abono ($ COP)</th>
            <th style={{ padding: '10px 12px', width: '40px' }}></th>
          </tr>
        </thead>
        <tbody>
          {abonos.map((a, idx) => (
            <tr key={a.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)' }}>
              <td style={{ padding: '10px 12px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{a.fecha}</td>
              <td style={{ padding: '10px 12px', fontWeight: 600 }}>{a.concepto}</td>
              <td style={{ padding: '10px 12px' }}><span className="badge badge-info">{a.metodoPago}</span></td>
              <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700, color: '#34d399', fontFamily: 'var(--font-mono)' }}>
                +${Number(a.monto || 0).toLocaleString()} COP
              </td>
              <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                <button onClick={() => onEliminar(a.id)} style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer' }}>
                  <Trash2 size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
