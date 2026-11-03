import React from 'react';
import { Edit3, Trash2, ChevronDown, ChevronUp, Send } from 'lucide-react';

// ============================================================
// BLOQUE 1: LISTA DE ÍTEMS DEL PROYECTO
// Qué hace: Renderiza las tarjetas de ítems compuestos y especiales con el despiece de muebles.
// Por qué: Extraído de CreadorItemsPage.jsx para reducir su tamaño.
// ============================================================
export default function ListaItemsProyecto({
  items,
  piezasDesplegadas,
  onTogglePiezas,
  onEditar,
  onEliminar,
  onExportarListaCorte,
  calcularTotalesCantoMueble
}) {
  if (items.length === 0) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
        No hay ítems creados para este proyecto. Haz clic en <strong>Crear Nuevo Ítem</strong>.
      </div>
    );
  }

  return (
    <div className="grid-cards">
      {items.map(it => {
        const esEspecial = Boolean(it.esItemEspecial);
        const esMueble = (!esEspecial && it.tipoCategoria === 'Mueble / Carpintería');
        const estaDesplegado = piezasDesplegadas[it.id];
        const cantidadPiezas = (it.piezasDespieceMueble && it.piezasDespieceMueble.length) || 0;
        const cantosMuebleItem = calcularTotalesCantoMueble ? calcularTotalesCantoMueble(it.piezasDespieceMueble) : { totalFlexibleM: 0, totalRigidoM: 0 };

        return (
          <div key={it.id} className="card" style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '14px',
            borderLeft: esEspecial ? '4px solid #c084fc' : esMueble ? '4px solid #fbbf24' : '4px solid #38bdf8'
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>
                    {esEspecial ? '✨' : esMueble ? '🪚' : '📦'} {it.nombreItem}
                  </h3>
                </div>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '6px' }}>
                  <span className={`badge ${esEspecial ? 'badge-danger' : esMueble ? 'badge-warning' : 'badge-info'}`} style={{ background: esEspecial ? 'rgba(192, 132, 252, 0.2)' : undefined, color: esEspecial ? '#c084fc' : undefined, border: esEspecial ? '1px solid rgba(192, 132, 252, 0.4)' : undefined }}>
                    {esEspecial ? '✨ Ítem Especial / Servicio' : (it.tipoCategoria || 'Mueble / Carpintería')}
                  </span>
                  <span className="badge badge-success">
                    📈 Ganancia: {it.porcentajeGanancia}%
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '6px' }}>
                <button 
                  onClick={() => onEditar(it)} 
                  className="btn btn-secondary"
                  style={{ minHeight: '34px', padding: '0 10px', fontSize: '0.8rem', gap: '4px' }}
                  title="Editar Ítem"
                >
                  <Edit3 size={14} /> Editar
                </button>
                <button 
                  onClick={() => onEliminar(it.id)} 
                  className="btn btn-danger"
                  style={{ minHeight: '34px', width: '34px', padding: 0 }}
                  title="Eliminar"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            {/* SI ES UN ÍTEM ESPECIAL: MOSTRAR DETALLE DEL ALCANCE/SERVICIO */}
            {esEspecial ? (
              <div style={{ background: 'rgba(192, 132, 252, 0.08)', border: '1px solid rgba(192, 132, 252, 0.25)', padding: '12px 14px', borderRadius: 'var(--radius-md)' }}>
                <span style={{ fontSize: '0.75rem', color: '#c084fc', display: 'block', marginBottom: '4px', fontWeight: 700 }}>
                  📋 ALCANCE Y DESCRIPCIÓN DEL SERVICIO ESPECIAL:
                </span>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-main)', margin: '0 0 10px 0', lineHeight: '1.4' }}>
                  {it.descripcionEspecial || 'Trabajo especial directo (mano de obra / adecuación de obra civil).'}
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', paddingTop: '8px', borderTop: '1px dashed rgba(192, 132, 252, 0.3)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    <span>Costo Base Estimado:</span>
                    <strong>${Number(it.costoMateriales || 0).toLocaleString()} COP</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#38bdf8' }}>
                    <span>Margen Ganancia ({it.porcentajeGanancia}%):</span>
                    <strong>+${Number(it.valorGanancia || 0).toLocaleString()} COP</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '6px', marginTop: '4px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)' }}>PRECIO TOTAL VENTA</span>
                    <strong style={{ color: '#34d399', fontSize: '1.2rem', fontFamily: 'var(--font-mono)' }}>
                      ${Number(it.precioTotalFinal || 0).toLocaleString()} COP
                    </strong>
                  </div>
                </div>
              </div>
            ) : (
              /* SI ES ÍTEM COMPUESTO NORMAL: MOSTRAR MATERIALES BASE */
              <div style={{ background: 'rgba(15,23,42,0.5)', padding: '12px 14px', borderRadius: 'var(--radius-md)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px', fontWeight: 600 }}>
                  MATERIALES Y COSTEO BASE:
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.85rem' }}>
                  {it.materialesDespiece && it.materialesDespiece.map((m, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                      <span>• {m.materialNombre} ({m.cantidad} {m.unidad})</span>
                      <strong style={{ color: 'var(--text-main)' }}>${Number(m.subtotal || 0).toLocaleString()} COP</strong>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '12px', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    <span>Costo Insumos:</span>
                    <strong>${Number(it.costoMateriales || 0).toLocaleString()} COP</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#38bdf8' }}>
                    <span>Margen Ganancia ({it.porcentajeGanancia}%):</span>
                    <strong>+${Number(it.valorGanancia || 0).toLocaleString()} COP</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '6px', marginTop: '4px', borderTop: '1px dashed rgba(255,255,255,0.15)' }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)' }}>PRECIO TOTAL VENTA</span>
                    <strong style={{ color: '#34d399', fontSize: '1.2rem', fontFamily: 'var(--font-mono)' }}>
                      ${Number(it.precioTotalFinal || 0).toLocaleString()} COP
                    </strong>
                  </div>
                </div>
              </div>
            )}

            {/* SECCIÓN EXPANDIBLE SI ES UN MUEBLE CON PIEZAS */}
            {esMueble && (
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <button
                    onClick={() => onTogglePiezas(it.id)}
                    style={{ background: 'none', border: 'none', color: '#fbbf24', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', padding: 0 }}
                  >
                    🪚 {cantidadPiezas} Piezas de Despiece {estaDesplegado ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>

                  {cantidadPiezas > 0 && (
                    <button
                      onClick={() => onExportarListaCorte(it)}
                      className="btn btn-secondary"
                      style={{ fontSize: '0.75rem', padding: '3px 8px', gap: '4px', background: 'rgba(251,191,36,0.15)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.3)' }}
                    >
                      <Send size={12} /> Exportar a Lista de Corte
                    </button>
                  )}
                </div>

                {estaDesplegado && (
                  <div style={{ marginTop: '10px', background: '#0f172a', padding: '10px', borderRadius: '6px', fontSize: '0.78rem' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                      <thead>
                        <tr style={{ color: '#fbbf24', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                          <th style={{ padding: '4px' }}>Cant.</th>
                          <th style={{ padding: '4px' }}>Pieza</th>
                          <th style={{ padding: '4px' }}>Largo x Ancho (mm)</th>
                          <th style={{ padding: '4px' }}>Canto</th>
                        </tr>
                      </thead>
                      <tbody>
                        {it.piezasDespieceMueble.map((p, idx) => (
                          <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <td style={{ padding: '4px' }}>{p.cantidad}</td>
                            <td style={{ padding: '4px', fontWeight: 600 }}>{p.descripcion}</td>
                            <td style={{ padding: '4px', fontFamily: 'var(--font-mono)' }}>{p.altoVeta || '-'} x {p.ancho || '-'}</td>
                            <td style={{ padding: '4px', color: 'var(--text-muted)' }}>{p.canto || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    <div style={{ display: 'flex', gap: '12px', marginTop: '8px', paddingTop: '6px', borderTop: '1px dashed rgba(255,255,255,0.1)', color: '#fbbf24', fontSize: '0.74rem' }}>
                      <span>📏 Canto Delgado: <strong>{cantosMuebleItem.totalFlexibleM} m</strong></span>
                      <span>📏 Canto Rígido: <strong>{cantosMuebleItem.totalRigidoM} m</strong></span>
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>
        );
      })}
    </div>
  );
}
