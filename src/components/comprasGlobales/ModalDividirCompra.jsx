import React from 'react';
import ModalForm from '../ModalForm.jsx';

// ============================================================
// BLOQUE 1: COMPONENTE MODAL DIVIDIR COMPRA ENTRE PROYECTOS
// Qué hace: Permite dividir una compra global asignando cantidades a proyectos específicos.
// Por qué: Cumple RT-02 al extraer lógica de división de ComprasGlobalesPage.jsx.
// ============================================================
export default function ModalDividirCompra({
  modalDividirAbierto,
  onClose,
  compraADividir,
  desgloseFilas,
  setDesgloseFilas,
  handleGuardarDividido,
  guardando,
  errorMsg,
  proyectos
}) {
  return (
    <ModalForm titulo="🔀 Dividir Compra entre Varios Proyectos" abierto={modalDividirAbierto} onClose={onClose}>
      <form onSubmit={handleGuardarDividido}>
        {errorMsg && <div style={{ padding: '10px', background: 'rgba(239,68,68,0.15)', color: '#fca5a5', borderRadius: '8px', marginBottom: '12px', fontSize: '0.85rem' }}>{errorMsg}</div>}
        <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
          Dividir <strong>{compraADividir?.concepto}</strong> (Cant. Total: {compraADividir?.cantidad}) asignando cantidades a proyectos específicos.
        </p>
        {desgloseFilas.map((fila, index) => (
          <div key={index} style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '10px' }}>
            <select className="input-field" value={fila.proyectoId} onChange={(e) => { const newFilas = [...desgloseFilas]; newFilas[index].proyectoId = e.target.value; setDesgloseFilas(newFilas); }}>
              <option value="">-- Seleccionar Proyecto --</option>
              {proyectos.map(p => (<option key={p.id} value={p.id}>{p.nombre}</option>))}
            </select>
            <input type="number" className="input-field" style={{ width: '90px' }} value={fila.cantidad} onChange={(e) => { const newFilas = [...desgloseFilas]; newFilas[index].cantidad = e.target.value; setDesgloseFilas(newFilas); }} placeholder="Cant." />
            {desgloseFilas.length > 1 && (
              <button type="button" onClick={() => setDesgloseFilas(desgloseFilas.filter((_, i) => i !== index))} style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer' }}>✕</button>
            )}
          </div>
        ))}
        <button type="button" onClick={() => setDesgloseFilas([...desgloseFilas, { proyectoId: '', cantidad: 1 }])} className="btn btn-secondary" style={{ fontSize: '0.8rem', marginTop: '8px' }}>
          + Agregar Otro Proyecto
        </button>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '20px' }}>
          <button type="button" onClick={onClose} className="btn btn-secondary">Cancelar</button>
          <button type="submit" className="btn btn-primary" disabled={guardando}>{guardando ? 'Guardando...' : 'Confirmar División'}</button>
        </div>
      </form>
    </ModalForm>
  );
}
