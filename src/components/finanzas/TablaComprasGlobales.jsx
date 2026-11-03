import React from 'react';
import { Trash2 } from 'lucide-react';

// ============================================================
// BLOQUE 1: TABLA DE COMPRAS GLOBALES / CAJA GENERAL
// Qué hace: Muestra la tabla de compras globales con opción de imputar a proyecto.
// Por qué: Extraído de FinanzasPage.jsx para reducir su tamaño.
// ============================================================
export default function TablaComprasGlobales({ comprasGlobales, onImputar, onEliminar }) {
  if (comprasGlobales.length === 0) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
        No hay compras ni transferencias globales registradas en la Caja General. Haz clic en <strong>+ Registrar Compra / Transferencia</strong>.
      </div>
    );
  }

  return (
    <div className="card" style={{ padding: '16px', overflowX: 'auto' }}>
      <div style={{ marginBottom: '12px', fontSize: '0.8rem', color: '#c084fc', background: 'rgba(139,92,246,0.1)', padding: '8px 12px', borderRadius: '6px', border: '1px solid rgba(139,92,246,0.3)' }}>
        💡 <strong>Caja General del Administrador:</strong> Registra aquí compras generales o anticipos a personal. Haz clic en <strong>📥 Imputar a Proyecto</strong> para cargar el gasto al proyecto seleccionado.
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem', textAlign: 'left' }}>
        <thead>
          <tr style={{ background: '#0f172a', color: '#c084fc', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <th style={{ padding: '10px 12px' }}>Fecha</th>
            <th style={{ padding: '10px 12px' }}>Categoría</th>
            <th style={{ padding: '10px 12px' }}>Concepto / Detalle de Compra</th>
            <th style={{ padding: '10px 12px' }}>Proveedor / Beneficiario</th>
            <th style={{ padding: '10px 12px', textAlign: 'right' }}>Monto ($ COP)</th>
            <th style={{ padding: '10px 12px', textAlign: 'center' }}>Estado / Imputación</th>
            <th style={{ padding: '10px 12px', width: '40px' }}></th>
          </tr>
        </thead>
        <tbody>
          {comprasGlobales.map((c, idx) => (
            <tr key={c.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)' }}>
              <td style={{ padding: '10px 12px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{c.fecha}</td>
              <td style={{ padding: '10px 12px' }}>
                <span className="badge badge-info">{c.categoria || 'General'}</span>
              </td>
              <td style={{ padding: '10px 12px', fontWeight: 600 }}>{c.concepto}</td>
              <td style={{ padding: '10px 12px', color: 'var(--text-muted)' }}>{c.beneficiario || c.proveedorNombre || '-'}</td>
              <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700, color: '#c084fc', fontFamily: 'var(--font-mono)' }}>
                ${Number(c.monto || 0).toLocaleString()} COP
              </td>
              <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                {c.esImputado ? (
                  <span className="badge badge-success">✅ Imputado a Obra</span>
                ) : (
                  <button
                    onClick={() => onImputar(c)}
                    className="btn btn-secondary"
                    style={{ padding: '4px 8px', fontSize: '0.75rem', background: 'rgba(56,189,248,0.15)', color: '#38bdf8', border: '1px solid rgba(56,189,248,0.4)', gap: '4px' }}
                  >
                    📥 Imputar a Proyecto
                  </button>
                )}
              </td>
              <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                <button onClick={() => onEliminar(c.id)} style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer' }}>
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
