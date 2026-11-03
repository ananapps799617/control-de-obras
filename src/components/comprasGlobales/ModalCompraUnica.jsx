import React from 'react';
import ModalForm from '../ModalForm.jsx';

// ============================================================
// BLOQUE 1: COMPONENTE MODAL REGISTRAR / EDITAR COMPRA ÚNICA
// Qué hace: Formulario para registrar compras independientes o imputar a una obra.
// Por qué: Cumple RT-02 al extraer el formulario de ComprasGlobalesPage.jsx.
// ============================================================
export default function ModalCompraUnica({
  modalAbierto,
  onClose,
  compraEditando,
  form,
  setForm,
  handleGuardar,
  guardando,
  errorMsg,
  proveedores,
  proyectos
}) {
  return (
    <ModalForm 
      titulo={compraEditando ? "✏️ Editar Compra / Factura" : "🛒 Registrar Compra en Caja General"} 
      abierto={modalAbierto} 
      onClose={onClose}
      maxWidth="750px"
    >
      <form onSubmit={handleGuardar}>
        {errorMsg && <div style={{ padding: '10px', background: 'rgba(239,68,68,0.15)', color: '#fca5a5', borderRadius: '8px', marginBottom: '12px', fontSize: '0.85rem' }}>{errorMsg}</div>}
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px', marginBottom: '12px' }}>
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label className="input-label">Categoría de Gasto *</label>
            <select className="input-field" value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })} style={{ fontWeight: 600 }}>
              <option value="Materiales">📦 Materiales e Insumos</option>
              <option value="Herramientas / Equipos">🛠️ Herramientas, Discos, Brocas</option>
              <option value="Mano de Obra / Nomina">👷 Transferencia a Empleado / Avance</option>
              <option value="Transporte">🚚 Transporte / Fletes</option>
              <option value="Viáticos / Alimentación">🍱 Viáticos / Alimentación / Hospedaje</option>
              <option value="Otros">📦 Otros Gastos Administrativos</option>
            </select>
          </div>

          <div className="input-group" style={{ marginBottom: 0 }}>
            <label className="input-label">🗓️ Fecha de la Compra / Factura *</label>
            <input 
              type="date" 
              className="input-field" 
              required 
              value={form.fecha} 
              onChange={(e) => setForm({ ...form, fecha: e.target.value })} 
              style={{ fontWeight: 600, color: 'var(--color-primary)' }}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px', marginBottom: '12px' }}>
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label className="input-label">🏢 Proveedor / Establecimiento Comercial</label>
            <select 
              className="input-field" 
              value={form.proveedorId} 
              onChange={(e) => {
                const provSelected = proveedores.find(p => p.id === e.target.value);
                setForm({ 
                  ...form, 
                  proveedorId: e.target.value,
                  beneficiario: provSelected ? (provSelected.razonSocial || provSelected.nombre) : form.beneficiario
                });
              }}
            >
              <option value="">-- Seleccionar de Proveedores --</option>
              {proveedores.map(p => (
                <option key={p.id} value={p.id}>{p.razonSocial || p.nombre} ({p.nit || 'NIT N/A'})</option>
              ))}
            </select>
          </div>

          <div className="input-group" style={{ marginBottom: 0 }}>
            <label className="input-label">Beneficiario / Factura a Nombre de</label>
            <input 
              type="text" 
              className="input-field" 
              value={form.beneficiario} 
              onChange={(e) => setForm({ ...form, beneficiario: e.target.value })} 
              placeholder="Ej. Comercializadora Alfa S.A.S." 
            />
          </div>
        </div>

        <div className="input-group" style={{ marginBottom: '12px' }}>
          <label className="input-label">🏗️ Proyecto de Obra (Opcional - Imputar Directo)</label>
          <select 
            className="input-field" 
            value={form.proyectoId} 
            onChange={(e) => setForm({ ...form, proyectoId: e.target.value })}
            style={{ fontWeight: 600, color: form.proyectoId ? '#34d399' : 'var(--text-main)' }}
          >
            <option value="">-- Sin Imputar (Compra Libre en Caja General) --</option>
            {proyectos.map(p => (
              <option key={p.id} value={p.id}>{p.nombre} ({p.codigoCotizacion || 'Obra Activa'})</option>
            ))}
          </select>
        </div>

        <div className="input-group">
          <label className="input-label">Descripción del Insumo / Factura *</label>
          <input 
            type="text" 
            className="input-field" 
            required 
            value={form.concepto} 
            onChange={(e) => setForm({ ...form, concepto: e.target.value })} 
            placeholder="Ej. Compra 10 bultos de cemento y disco de corte 4.5" 
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' }}>
          <div className="input-group">
            <label className="input-label">Unidad Medida</label>
            <select className="input-field" value={form.unidad} onChange={(e) => setForm({ ...form, unidad: e.target.value })}>
              <option value="Unidad">Unidad</option>
              <option value="Bulto">Bulto</option>
              <option value="Global">Global</option>
              <option value="m²">m²</option>
              <option value="m³">m³</option>
              <option value="Metro">Metro</option>
              <option value="Caja">Caja</option>
              <option value="Litro">Litro</option>
              <option value="Kg">Kg</option>
            </select>
          </div>

          <div className="input-group">
            <label className="input-label">Cantidad</label>
            <input 
              type="number" 
              className="input-field" 
              value={form.cantidad} 
              onChange={(e) => {
                const cant = Number(e.target.value) || 0;
                const pu = Number(form.precioUnitario) || 0;
                setForm({ ...form, cantidad: e.target.value, monto: cant * pu });
              }} 
            />
          </div>

          <div className="input-group">
            <label className="input-label">Precio Unitario ($ COP)</label>
            <input 
              type="number" 
              className="input-field" 
              value={form.precioUnitario} 
              onChange={(e) => {
                const cant = Number(form.cantidad) || 1;
                const pu = Number(e.target.value) || 0;
                setForm({ ...form, precioUnitario: e.target.value, monto: cant * pu });
              }} 
              placeholder="Ej. 32000"
            />
          </div>

          <div className="input-group">
            <label className="input-label">Total ($ COP) *</label>
            <input 
              type="number" 
              className="input-field" 
              required 
              value={form.monto} 
              readOnly 
              style={{ fontWeight: 800, color: '#c084fc', fontFamily: 'var(--font-mono)' }} 
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '20px' }}>
          <button type="button" onClick={onClose} className="btn btn-secondary">Cancelar</button>
          <button type="submit" className="btn btn-primary" disabled={guardando}>{guardando ? 'Guardando...' : 'Guardar Compra'}</button>
        </div>
      </form>
    </ModalForm>
  );
}
