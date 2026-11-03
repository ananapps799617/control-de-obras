import React from 'react';
import { Trash2, Edit3 } from 'lucide-react';

// ============================================================
// BLOQUE 1: TABLA DE GASTOS DE OBRA
// Qué hace: Muestra la tabla de gastos del proyecto con opciones de editar y eliminar.
// Por qué: Extraído de FinanzasPage.jsx para reducir su tamaño.
// ============================================================
export default function TablaGastos({ gastos, onEditar, onEliminar }) {
  if (gastos.length === 0) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
        No hay gastos de obra registrados para este proyecto. Haz clic en <strong>+ Registrar Gasto</strong> (Mano de obra, materiales, etc.).
      </div>
    );
  }

  return (
    <div className="card" style={{ padding: '16px', overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem', textAlign: 'left' }}>
        <thead>
          <tr style={{ background: '#0f172a', color: '#fb923c', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <th style={{ padding: '10px 12px' }}>Fecha</th>
            <th style={{ padding: '10px 12px' }}>Categoría</th>
            <th style={{ padding: '10px 12px' }}>Concepto / Detalle</th>
            <th style={{ padding: '10px 12px' }}>Beneficiario / Proveedor</th>
            <th style={{ padding: '10px 12px', textAlign: 'right' }}>Monto ($ COP)</th>
            <th style={{ padding: '10px 12px', width: '80px', textAlign: 'center' }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {gastos.map((g, idx) => (
            <tr key={g.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)' }}>
              <td style={{ padding: '10px 12px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{g.fecha}</td>
              <td style={{ padding: '10px 12px' }}>
                <span className={`badge ${g.categoria === 'Mano de Obra' ? 'badge-warning' : g.categoria === 'Materiales' ? 'badge-info' : 'badge-secondary'}`}>
                  {g.categoria === 'Mano de Obra' ? '👷 Mano de Obra' : g.categoria === 'Materiales' ? '📦 Materiales' : g.categoria}
                </span>
              </td>
              <td style={{ padding: '10px 12px', fontWeight: 600 }}>{g.concepto}</td>
              <td style={{ padding: '10px 12px', color: 'var(--text-muted)' }}>{g.beneficiario || g.proveedorNombre || '-'}</td>
              <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700, color: '#fb923c', fontFamily: 'var(--font-mono)' }}>
                ${Number(g.monto || 0).toLocaleString()} COP
              </td>
              <td style={{ padding: '10px 12px', textAlign: 'center', display: 'flex', gap: '8px', justifyContent: 'center' }}>
                <button onClick={() => onEditar(g)} style={{ background: 'none', border: 'none', color: '#38bdf8', cursor: 'pointer' }} title="Editar Gasto">
                  <Edit3 size={16} />
                </button>
                <button onClick={() => onEliminar(g.id)} style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer' }} title="Eliminar Gasto">
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
