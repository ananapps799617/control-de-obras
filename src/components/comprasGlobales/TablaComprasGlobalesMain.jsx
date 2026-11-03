import React from 'react';
import { Trash2, ArrowUpRight, Edit, Split } from 'lucide-react';

// ============================================================
// BLOQUE 1: TABLA PRINCIPAL DE COMPRAS GLOBALES
// Qué hace: Muestra el listado de facturas/compras globales con opciones de imputar, dividir, editar y eliminar.
// Por qué: Extraído de ComprasGlobalesPage.jsx para modularidad.
// ============================================================
export default function TablaComprasGlobalesMain({
  compras,
  onImputarDirecto,
  onAbrirDividir,
  onAbrirEditar,
  onEliminar
}) {
  if (compras.length === 0) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
        No hay compras globales registradas con los filtros aplicados.
      </div>
    );
  }

  const getBadgeCategoria = (cat) => {
    const catLower = (cat || '').toLowerCase();
    if (catLower.includes('material')) {
      return { bg: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.3)', icon: '📦' };
    }
    if (catLower.includes('herramienta') || catLower.includes('equipo')) {
      return { bg: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', border: '1px solid rgba(245, 158, 11, 0.3)', icon: '🛠️' };
    }
    if (catLower.includes('mano') || catLower.includes('nomina') || catLower.includes('empleado')) {
      return { bg: 'rgba(192, 132, 252, 0.15)', color: '#c084fc', border: '1px solid rgba(192, 132, 252, 0.3)', icon: '👷' };
    }
    if (catLower.includes('transporte') || catLower.includes('flete')) {
      return { bg: 'rgba(52, 211, 153, 0.15)', color: '#34d399', border: '1px solid rgba(52, 211, 153, 0.3)', icon: '🚚' };
    }
    if (catLower.includes('viatico') || catLower.includes('viáticos') || catLower.includes('alimentacion') || catLower.includes('hospedaje') || catLower.includes('comida')) {
      return { bg: 'rgba(251, 146, 60, 0.15)', color: '#fb923c', border: '1px solid rgba(251, 146, 60, 0.3)', icon: '🍱' };
    }
    return { bg: 'rgba(244, 63, 94, 0.15)', color: '#fb7185', border: '1px solid rgba(244, 63, 94, 0.3)', icon: '📦' };
  };

  return (
    <div className="card" style={{ padding: '16px', overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem', textAlign: 'left' }}>
        <thead>
          <tr style={{ background: '#0f172a', color: '#c084fc', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <th style={{ padding: '10px 12px' }}>Fecha</th>
            <th style={{ padding: '10px 12px' }}>Categoría</th>
            <th style={{ padding: '10px 12px' }}>Concepto / Insumo</th>
            <th style={{ padding: '10px 12px' }}>Proveedor / Beneficiario</th>
            <th style={{ padding: '10px 12px', textAlign: 'right' }}>Monto ($ COP)</th>
            <th style={{ padding: '10px 12px', textAlign: 'center' }}>Asignación a Obra</th>
            <th style={{ padding: '10px 12px', width: '110px', textAlign: 'center' }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {compras.map((c, idx) => {
            const badgeEstilo = getBadgeCategoria(c.categoria);
            return (
              <tr key={c.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)' }}>
                <td style={{ padding: '10px 12px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{c.fecha}</td>
                <td style={{ padding: '10px 12px' }}>
                  <span className="badge" style={{ background: badgeEstilo.bg, color: badgeEstilo.color, border: badgeEstilo.border }}>
                    {badgeEstilo.icon} {c.categoria || 'Materiales'}
                  </span>
                </td>
              <td style={{ padding: '10px 12px', fontWeight: 600 }}>
                {c.concepto}
                {c.cantidad > 1 && (
                  <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 400 }}>
                    {c.cantidad} {c.unidad}s @ ${Number(c.precioUnitario || 0).toLocaleString()} c/u
                  </span>
                )}
              </td>
              <td style={{ padding: '10px 12px', color: 'var(--text-muted)' }}>{c.beneficiario || c.proveedorNombre || '-'}</td>
              <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700, color: '#c084fc', fontFamily: 'var(--font-mono)' }}>
                ${Number(c.monto || 0).toLocaleString()} COP
              </td>
              <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                {c.esDividido || (c.imputaciones && c.imputaciones.length > 0) ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                    <span className="badge badge-warning" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                      🔀 Dividido ({c.imputaciones ? c.imputaciones.length : 'Multi'} Obras)
                    </span>
                    <button 
                      onClick={() => onAbrirDividir(c)} 
                      className="btn btn-secondary"
                      style={{ padding: '3px 8px', fontSize: '0.72rem', background: 'rgba(251,146,60,0.15)', color: '#fb923c', border: '1px solid rgba(251,146,60,0.4)', gap: '4px', marginTop: '2px' }}
                      title="Editar proyectos y cantidades de la división"
                    >
                      <Split size={12} /> Editar División
                    </button>
                  </div>
                ) : (c.esImputado || c.proyectoId) ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                    <span className="badge badge-success">
                      ✅ {c.proyectoNombre || 'Imputado a Obra'}
                    </span>
                    <button 
                      onClick={() => onImputarDirecto(c)} 
                      className="btn btn-secondary"
                      style={{ padding: '3px 8px', fontSize: '0.72rem', background: 'rgba(56,189,248,0.15)', color: '#38bdf8', border: '1px solid rgba(56,189,248,0.4)', gap: '4px', marginTop: '2px' }}
                      title="Cambiar obra o reasignar proyecto"
                    >
                      <ArrowUpRight size={12} /> Reasignar Obra
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                    <button 
                      onClick={() => onImputarDirecto(c)} 
                      className="btn btn-secondary"
                      style={{ padding: '4px 8px', fontSize: '0.73rem', background: 'rgba(56,189,248,0.15)', color: '#38bdf8', border: '1px solid rgba(56,189,248,0.4)', gap: '4px' }}
                      title="Asignar a un solo proyecto"
                    >
                      <ArrowUpRight size={13} /> Imputar
                    </button>
                    <button 
                      onClick={() => onAbrirDividir(c)} 
                      className="btn btn-secondary"
                      style={{ padding: '4px 8px', fontSize: '0.73rem', background: 'rgba(251,146,60,0.15)', color: '#fb923c', border: '1px solid rgba(251,146,60,0.4)', gap: '4px' }}
                      title="Dividir gasto entre varios proyectos"
                    >
                      <Split size={13} /> Dividir
                    </button>
                  </div>
                )}
              </td>
              <td style={{ padding: '10px 12px', textAlign: 'center', display: 'flex', gap: '8px', justifyContent: 'center' }}>
                <button onClick={() => onAbrirEditar(c)} style={{ background: 'none', border: 'none', color: '#38bdf8', cursor: 'pointer' }} title="Editar Compra">
                  <Edit size={16} />
                </button>
                <button onClick={() => onEliminar(c.id)} style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer' }} title="Eliminar Compra">
                  <Trash2 size={16} />
                </button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
  );
}
