import React from 'react';
import ModalForm from '../ModalForm.jsx';

// ============================================================
// BLOQUE 1: COMPONENTE MODAL REGISTRAR FACTURA MULTI-ÍTEM
// Qué hace: Permite registrar múltiples compras masivas asociadas a una sola factura.
// Por qué: Cumple RT-02 al extraer el formulario masivo de ComprasGlobalesPage.jsx.
// ============================================================
export default function ModalFacturaMultiItem({
  modalMultiItemAbierto,
  onClose,
  formMultiItem,
  setFormMultiItem,
  handleGuardarFacturaMultiItem,
  handleAgregarFilaMultiItem,
  handleCambioFilaMultiItem,
  handleEliminarFilaMultiItem,
  guardando,
  errorMsg,
  proveedores,
  proyectos
}) {
  const totalCalculado = formMultiItem.items.reduce((acc, it) => acc + (Number(it.subtotal) || 0), 0);
  const itemsValidosCount = formMultiItem.items.filter(it => it.concepto.trim() !== '' && Number(it.subtotal) > 0).length;

  return (
    <ModalForm 
      titulo="🧾 Registrar Factura con Múltiples Ítems (Masivo)" 
      abierto={modalMultiItemAbierto} 
      onClose={onClose}
      maxWidth="950px"
    >
      <form onSubmit={handleGuardarFacturaMultiItem}>
        {errorMsg && <div style={{ padding: '10px', background: 'rgba(239,68,68,0.15)', color: '#fca5a5', borderRadius: '8px', marginBottom: '12px', fontSize: '0.85rem' }}>{errorMsg}</div>}

        {/* BLOQUE 1: ENCABEZADO DE FACTURA */}
        <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid var(--border-color)', padding: '14px', borderRadius: '8px', marginBottom: '16px' }}>
          <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#38bdf8', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            🏢 DATO COMÚN DE LA FACTURA / PROVEEDOR
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">🗓️ Fecha de la Factura *</label>
              <input type="date" className="input-field" required value={formMultiItem.fecha} onChange={(e) => setFormMultiItem({ ...formMultiItem, fecha: e.target.value })} />
            </div>

            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">🏢 Seleccionar Proveedor del Catálogo</label>
              <select 
                className="input-field" 
                value={formMultiItem.proveedorId} 
                onChange={(e) => {
                  const provId = e.target.value;
                  const provObj = proveedores.find(p => p.id === provId);
                  setFormMultiItem({
                    ...formMultiItem,
                    proveedorId: provId,
                    beneficiario: provObj ? (provObj.razonSocial || provObj.nombre) : formMultiItem.beneficiario
                  });
                }}
              >
                <option value="">-- Seleccionar Proveedor (Opcional) --</option>
                {proveedores.map(p => (<option key={p.id} value={p.id}>{p.razonSocial || p.nombre}</option>))}
              </select>
            </div>

            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">✍️ O Escribe Nombre Proveedor / Negocio *</label>
              <input type="text" className="input-field" required value={formMultiItem.beneficiario} onChange={(e) => setFormMultiItem({ ...formMultiItem, beneficiario: e.target.value })} placeholder="Ej. Ferretería Central / Duratex" />
            </div>

            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">📄 N° Factura / Remisión (Opcional)</label>
              <input type="text" className="input-field" value={formMultiItem.numeroFactura} onChange={(e) => setFormMultiItem({ ...formMultiItem, numeroFactura: e.target.value })} placeholder="Ej. FAC-9042" />
            </div>

            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">🏗️ Asignar Directo a Proyecto (Opcional)</label>
              <select className="input-field" value={formMultiItem.proyectoId} onChange={(e) => setFormMultiItem({ ...formMultiItem, proyectoId: e.target.value })}>
                <option value="">-- Dejar en Caja General (Sin Imputar) --</option>
                {proyectos.map(p => (<option key={p.id} value={p.id}>{p.nombre}</option>))}
              </select>
            </div>
          </div>
        </div>

        {/* BLOQUE 2: TABLA INTERACTIVA DE ÍTEMS DE LA FACTURA */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <label style={{ fontSize: '0.9rem', color: '#fbbf24', fontWeight: 700, margin: 0 }}>
              📦 Ítems Comprados en esta Factura ({formMultiItem.items.length})
            </label>
            <button type="button" onClick={handleAgregarFilaMultiItem} className="btn btn-secondary" style={{ fontSize: '0.8rem', color: '#fbbf24', borderColor: 'rgba(251,191,36,0.3)', padding: '5px 10px' }}>
              ➕ Agregar Ítem a la Factura
            </button>
          </div>

          <div className="scroll-x-touch" style={{ maxHeight: '360px', overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'rgba(15, 23, 42, 0.95)', color: '#38bdf8', borderBottom: '1px solid var(--border-color)', position: 'sticky', top: 0, zIndex: 2 }}>
                  <th style={{ padding: '8px 6px', width: '30px', textAlign: 'center' }}>#</th>
                  <th style={{ padding: '8px 6px', minWidth: '180px' }}>Concepto / Producto *</th>
                  <th style={{ padding: '8px 6px', width: '150px' }}>Categoría *</th>
                  <th style={{ padding: '8px 6px', width: '65px' }}>Cant.</th>
                  <th style={{ padding: '8px 6px', width: '80px' }}>Unidad</th>
                  <th style={{ padding: '8px 6px', width: '100px' }}>Precio Unit. ($)</th>
                  <th style={{ padding: '8px 6px', width: '110px', textAlign: 'right' }}>Subtotal ($ COP) *</th>
                  <th style={{ padding: '8px 6px', width: '40px', textAlign: 'center' }}>✕</th>
                </tr>
              </thead>
              <tbody>
                {formMultiItem.items.map((item, idx) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: idx % 2 === 0 ? 'rgba(30, 41, 59, 0.4)' : 'rgba(15, 23, 42, 0.4)' }}>
                    <td style={{ padding: '4px 6px', textAlign: 'center', fontWeight: 700, color: '#38bdf8' }}>{idx + 1}</td>
                    <td style={{ padding: '4px 6px' }}>
                      <input type="text" className="input-field" style={{ minHeight: '34px', fontSize: '0.82rem', padding: '0 6px' }} value={item.concepto} onChange={(e) => handleCambioFilaMultiItem(item.id, 'concepto', e.target.value)} placeholder="Ej. Disco de corte 10'' / Bisagras 35mm" required />
                    </td>
                    <td style={{ padding: '4px 6px' }}>
                      <select className="input-field" style={{ minHeight: '34px', fontSize: '0.78rem', padding: '0 4px', fontWeight: 600 }} value={item.categoria} onChange={(e) => handleCambioFilaMultiItem(item.id, 'categoria', e.target.value)}>
                        <option value="Materiales">📦 Materiales</option>
                        <option value="Herramientas / Equipos">🛠️ Herramientas</option>
                        <option value="Mano de Obra / Nomina">👷 Mano Obra</option>
                        <option value="Transporte">🚚 Transporte</option>
                        <option value="Viáticos / Alimentación">🍱 Viáticos</option>
                        <option value="Otros">📦 Otros</option>
                      </select>
                    </td>
                    <td style={{ padding: '4px 6px' }}>
                      <input type="number" className="input-field" style={{ minHeight: '34px', fontSize: '0.82rem', padding: '0 4px', textAlign: 'center' }} value={item.cantidad} onChange={(e) => handleCambioFilaMultiItem(item.id, 'cantidad', e.target.value)} />
                    </td>
                    <td style={{ padding: '4px 6px' }}>
                      <select className="input-field" style={{ minHeight: '34px', fontSize: '0.78rem', padding: '0 4px' }} value={item.unidad} onChange={(e) => handleCambioFilaMultiItem(item.id, 'unidad', e.target.value)}>
                        <option value="Unidad">Und</option>
                        <option value="Caja">Caja</option>
                        <option value="Bulto">Bulto</option>
                        <option value="Global">Global</option>
                        <option value="Metros">Metros</option>
                      </select>
                    </td>
                    <td style={{ padding: '4px 6px' }}>
                      <input type="number" className="input-field" style={{ minHeight: '34px', fontSize: '0.82rem', padding: '0 4px' }} value={item.precioUnitario} onChange={(e) => handleCambioFilaMultiItem(item.id, 'precioUnitario', e.target.value)} placeholder="Unitario" />
                    </td>
                    <td style={{ padding: '4px 6px' }}>
                      <input type="number" className="input-field" style={{ minHeight: '34px', fontSize: '0.82rem', padding: '0 4px', fontWeight: 700, color: '#34d399', textAlign: 'right' }} value={item.subtotal} onChange={(e) => handleCambioFilaMultiItem(item.id, 'subtotal', e.target.value)} placeholder="Subtotal" required />
                    </td>
                    <td style={{ padding: '4px 6px', textAlign: 'center' }}>
                      <button type="button" onClick={() => handleEliminarFilaMultiItem(item.id)} style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontWeight: 700 }}>✕</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* RESUMEN Y BOTÓN DE GUARDAR FACTURA */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(52, 211, 153, 0.1)', border: '1px solid rgba(52, 211, 153, 0.3)', padding: '12px 16px', borderRadius: '8px', marginTop: '14px' }}>
          <div>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>TOTAL ACUMULADO FACTURA:</span>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#34d399', fontFamily: 'var(--font-mono)' }}>
              ${Number(totalCalculado).toLocaleString()} COP
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">Cancelar</button>
            <button type="submit" className="btn btn-primary" style={{ background: 'linear-gradient(135deg, #059669, #10b981)' }} disabled={guardando}>
              {guardando ? 'Guardando Factura...' : `💾 Guardar Factura con ${itemsValidosCount} Compras`}
            </button>
          </div>
        </div>
      </form>
    </ModalForm>
  );
}
