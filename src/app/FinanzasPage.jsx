import React, { useState, useEffect } from 'react';
import { DollarSign, Plus, Folder, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import { obtenerProyectos } from '../services/proyectosService';
import { obtenerProveedores } from '../services/proveedoresService';
import { obtenerCotizacionGuardadaPorProyecto } from '../services/cotizacionesService';
import {
  obtenerFinanzasProyecto,
  guardarValorProyecto,
  obtenerAbonosPorProyecto,
  crearAbono,
  eliminarAbono,
  obtenerGastosPorProyecto,
  crearGasto,
  actualizarGasto,
  eliminarGasto
} from '../services/finanzasService';
import {
  obtenerComprasGlobales,
  crearCompraGlobal,
  eliminarCompraGlobal,
  imputarCompraAProyecto
} from '../services/comprasGlobalesService';
import ModalForm from '../components/ModalForm.jsx';
import { getFechaHoyLocal } from '../lib/dateUtils.js';

// ============================================================
// BLOQUE 1: SUBCOMPONENTES DE FINANZAS (importados)
// Qué hace: Carga las vistas visuales desacopladas de la lógica de datos.
// Por qué: Modularidad — cada archivo tiene una responsabilidad única.
// ============================================================
import FinanzasDashboard from '../components/finanzas/FinanzasDashboard.jsx';
import TablaGastos from '../components/finanzas/TablaGastos.jsx';
import TablaAbonos from '../components/finanzas/TablaAbonos.jsx';
import TablaComprasGlobales from '../components/finanzas/TablaComprasGlobales.jsx';

// ============================================================
// BLOQUE 2: COMPONENTE PRINCIPAL — FINANZAS DEL PROYECTO
// Qué hace: Controla toda la lógica de estado y datos de finanzas de obra.
// Por qué: Separa lógica (aquí) de presentación (en los subcomponentes de /finanzas/).
// ============================================================
export default function FinanzasPage() {
  const [proyectos, setProyectos] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [proyectoSeleccionado, setProyectoSeleccionado] = useState('');

  const [valorProyecto, setValorProyecto] = useState(0);
  const [esValorCotizado, setEsValorCotizado] = useState(false);
  const [abonos, setAbonos] = useState([]);
  const [gastos, setGastos] = useState([]);
  const [comprasGlobales, setComprasGlobales] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [pestanaActiva, setPestanaActiva] = useState('gastos');

  const [modalValorAbierto, setModalValorAbierto] = useState(false);
  const [modalAbonoAbierto, setModalAbonoAbierto] = useState(false);
  const [modalGastoAbierto, setModalGastoAbierto] = useState(false);
  const [modalCompraGlobalAbierto, setModalCompraGlobalAbierto] = useState(false);
  const [gastoEditando, setGastoEditando] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [inputValorProyecto, setInputValorProyecto] = useState('');

  const [formCompraGlobal, setFormCompraGlobal] = useState({
    concepto: '', categoria: 'Materiales', monto: '',
    fecha: getFechaHoyLocal(), beneficiario: '', proveedorId: ''
  });
  const [formAbono, setFormAbono] = useState({
    concepto: '', monto: '', fecha: getFechaHoyLocal(), metodoPago: 'Transferencia Bancaria'
  });
  const [formGasto, setFormGasto] = useState({
    concepto: '', categoria: 'Mano de Obra', monto: '',
    fecha: getFechaHoyLocal(), beneficiario: '', proveedorId: ''
  });

  // ============================================================
  // BLOQUE 3: CARGA DE DATOS DESDE FIRESTORE
  // ============================================================
  const cargarCatalogos = async () => {
    try {
      const [dataProyectos, dataProveedores] = await Promise.all([obtenerProyectos(), obtenerProveedores()]);
      setProyectos(dataProyectos);
      setProveedores(dataProveedores);
      if (dataProyectos.length > 0 && !proyectoSeleccionado) setProyectoSeleccionado(dataProyectos[0].id);
    } catch (err) { console.error("Error al cargar proyectos:", err); }
  };

  useEffect(() => { cargarCatalogos(); }, []);

  const cargarFinanzas = async () => {
    if (!proyectoSeleccionado) return;
    setCargando(true);
    try {
      const [finanzasData, dataAbonos, dataGastos, cotizacionGuardada, dataComprasGlobales] = await Promise.all([
        obtenerFinanzasProyecto(proyectoSeleccionado),
        obtenerAbonosPorProyecto(proyectoSeleccionado),
        obtenerGastosPorProyecto(proyectoSeleccionado),
        obtenerCotizacionGuardadaPorProyecto(proyectoSeleccionado),
        obtenerComprasGlobales()
      ]);
      let valorFinal = 0, esCotizado = false;
      if (finanzasData?.valorProyecto && Number(finanzasData.valorProyecto) > 0) {
        valorFinal = Number(finanzasData.valorProyecto);
      } else if (cotizacionGuardada?.valorTotal) {
        valorFinal = Number(cotizacionGuardada.valorTotal); esCotizado = true;
      }
      setValorProyecto(valorFinal); setEsValorCotizado(esCotizado);
      setAbonos(dataAbonos); setGastos(dataGastos); setComprasGlobales(dataComprasGlobales);
    } catch (err) { console.error("Error al cargar finanzas:", err); }
    finally { setCargando(false); }
  };

  useEffect(() => { cargarFinanzas(); }, [proyectoSeleccionado]);

  // ============================================================
  // BLOQUE 4: CÁLCULOS FINANCIEROS
  // ============================================================
  const totalAbonos = abonos.reduce((acc, a) => acc + (Number(a.monto) || 0), 0);
  const totalGastos = gastos.reduce((acc, g) => acc + (Number(g.monto) || 0), 0);
  const gastosManoObra = gastos.filter(g => g.categoria === 'Mano de Obra').reduce((acc, g) => acc + (Number(g.monto) || 0), 0);
  const gastosMateriales = gastos.filter(g => g.categoria === 'Materiales').reduce((acc, g) => acc + (Number(g.monto) || 0), 0);
  const saldoPorCobrar = valorProyecto - totalAbonos;
  const diferenciaNetaCaja = totalAbonos - totalGastos;

  // ============================================================
  // BLOQUE 5: MANEJADORES DE ACCIONES
  // ============================================================
  const handleGuardarValorProyecto = async (e) => {
    e.preventDefault(); setGuardando(true);
    try {
      await guardarValorProyecto(proyectoSeleccionado, inputValorProyecto);
      setValorProyecto(Number(inputValorProyecto)); setModalValorAbierto(false);
    } catch (err) { console.error(err); } finally { setGuardando(false); }
  };

  const handleGuardarAbono = async (e) => {
    e.preventDefault(); setErrorMsg('');
    if (!formAbono.concepto.trim()) return setErrorMsg('El concepto del abono es obligatorio');
    if (!formAbono.monto || Number(formAbono.monto) <= 0) return setErrorMsg('Ingresa un monto válido mayor a 0');
    setGuardando(true);
    try {
      await crearAbono({ ...formAbono, proyectoId: proyectoSeleccionado });
      setFormAbono({ concepto: '', monto: '', fecha: new Date().toISOString().split('T')[0], metodoPago: 'Transferencia Bancaria' });
      setModalAbonoAbierto(false); await cargarFinanzas();
    } catch (err) { setErrorMsg(err.message || 'Error al guardar el abono'); } finally { setGuardando(false); }
  };

  const handleAbrirCrearGasto = () => {
    setErrorMsg(''); setGastoEditando(null);
    setFormGasto({ concepto: '', categoria: 'Mano de Obra', monto: '', fecha: getFechaHoyLocal(), beneficiario: '', proveedorId: '' });
    setModalGastoAbierto(true);
  };

  const handleAbrirEditarGasto = (gasto) => {
    setErrorMsg(''); setGastoEditando(gasto);
    const conceptoLimpio = (gasto.concepto || '').replace(/^\[Compra Imputada.*?\]\s*/, '');
    setFormGasto({ concepto: conceptoLimpio, categoria: gasto.categoria || 'Mano de Obra', monto: gasto.monto ? String(gasto.monto) : '', fecha: gasto.fecha || getFechaHoyLocal(), beneficiario: gasto.beneficiario || '', proveedorId: gasto.proveedorId || '' });
    setModalGastoAbierto(true);
  };

  const handleGuardarGasto = async (e) => {
    e.preventDefault(); setErrorMsg('');
    if (!formGasto.concepto.trim()) return setErrorMsg('El concepto del gasto es obligatorio');
    if (!formGasto.monto || Number(formGasto.monto) <= 0) return setErrorMsg('Ingresa un monto válido mayor a 0');
    const proveedorAsignado = proveedores.find(p => p.id === formGasto.proveedorId);
    const nombreBeneficiarioFinal = formGasto.beneficiario.trim() || (proveedorAsignado ? (proveedorAsignado.razonSocial || proveedorAsignado.nombre) : '');
    setGuardando(true);
    try {
      if (gastoEditando) {
        await actualizarGasto(gastoEditando.id, { ...formGasto, concepto: gastoEditando.compraGlobalId ? `[Compra Imputada] ${formGasto.concepto}` : formGasto.concepto, proyectoId: proyectoSeleccionado, beneficiario: nombreBeneficiarioFinal, proveedorNombre: nombreBeneficiarioFinal, compraGlobalId: gastoEditando.compraGlobalId || null });
      } else {
        await crearGasto({ ...formGasto, proyectoId: proyectoSeleccionado, beneficiario: nombreBeneficiarioFinal, proveedorNombre: nombreBeneficiarioFinal });
      }
      setFormGasto({ concepto: '', categoria: 'Mano de Obra', monto: '', fecha: getFechaHoyLocal(), beneficiario: '', proveedorId: '' });
      setGastoEditando(null); setModalGastoAbierto(false); await cargarFinanzas();
    } catch (err) { setErrorMsg(err.message || 'Error al guardar el gasto'); } finally { setGuardando(false); }
  };

  const handleEliminarAbono = async (id) => {
    if (window.confirm('¿Seguro que deseas eliminar este registro de abono?')) { await eliminarAbono(id); await cargarFinanzas(); }
  };
  const handleEliminarGasto = async (id) => {
    if (window.confirm('¿Seguro que deseas eliminar este registro de gasto?')) { await eliminarGasto(id); await cargarFinanzas(); }
  };

  const handleGuardarCompraGlobal = async (e) => {
    e.preventDefault(); setErrorMsg('');
    if (!formCompraGlobal.concepto.trim()) return setErrorMsg('El concepto de la compra es obligatorio');
    if (!formCompraGlobal.monto || Number(formCompraGlobal.monto) <= 0) return setErrorMsg('Ingresa un monto válido mayor a 0');
    const proveedorAsignado = proveedores.find(p => p.id === formCompraGlobal.proveedorId);
    const nombreBeneficiarioFinal = formCompraGlobal.beneficiario.trim() || (proveedorAsignado ? (proveedorAsignado.razonSocial || proveedorAsignado.nombre) : '');
    setGuardando(true);
    try {
      await crearCompraGlobal({ ...formCompraGlobal, beneficiario: nombreBeneficiarioFinal, proveedorNombre: nombreBeneficiarioFinal });
      setFormCompraGlobal({ concepto: '', categoria: 'Materiales', monto: '', fecha: new Date().toISOString().split('T')[0], beneficiario: '', proveedorId: '' });
      setModalCompraGlobalAbierto(false); await cargarFinanzas();
    } catch (err) { setErrorMsg(err.message || 'Error al registrar compra global'); } finally { setGuardando(false); }
  };

  const handleImputarCompra = async (compra) => {
    if (!proyectoSeleccionado) return alert("Selecciona un proyecto para imputar la compra.");
    const proyectoActual = proyectos.find(p => p.id === proyectoSeleccionado);
    if (window.confirm(`¿Deseas imputar esta compra de $${Number(compra.monto).toLocaleString()} COP al proyecto "${proyectoActual?.nombre}"?`)) {
      setGuardando(true);
      try { await imputarCompraAProyecto(compra, proyectoSeleccionado); await cargarFinanzas(); }
      catch (err) { alert("Error al imputar compra al proyecto"); } finally { setGuardando(false); }
    }
  };
  const handleEliminarCompraGlobal = async (id) => {
    if (window.confirm('¿Seguro que deseas eliminar este registro de compra de la caja general?')) { await eliminarCompraGlobal(id); await cargarFinanzas(); }
  };

  const proyectoActual = proyectos.find(p => p.id === proyectoSeleccionado);

  // ============================================================
  // BLOQUE 6: RENDER PRINCIPAL
  // ============================================================
  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0 }}>Presupuesto y Finanzas del Proyecto</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
            Control de abonos del cliente, gastos de mano de obra y materiales, y liquidez neta en caja.
          </p>
        </div>
      </div>

      {/* Selector de Proyecto */}
      <div className="card" style={{ marginBottom: '20px', background: 'rgba(30,41,59,0.7)', border: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <Folder size={20} color="var(--color-primary)" />
          <div style={{ flex: 1, minWidth: '220px' }}>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
              PROYECTO SELECCIONADO (OBLIGATORIO) *
            </label>
            <select className="input-field" value={proyectoSeleccionado} onChange={(e) => setProyectoSeleccionado(e.target.value)} style={{ fontWeight: 600, color: 'var(--color-primary)' }}>
              <option value="">-- Selecciona el Proyecto de Obra --</option>
              {proyectos.map(p => (<option key={p.id} value={p.id}>{p.nombre} ({p.codigoCotizacion || p.tipoCotizacion || 'Sin Código'})</option>))}
            </select>
          </div>
          {proyectoActual && (
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span className="badge badge-success">📄 {proyectoActual.codigoCotizacion || proyectoActual.tipoCotizacion}</span>
              <span className="badge badge-info">📍 {proyectoActual.lugarObra || 'Proyecto Activo'}</span>
            </div>
          )}
        </div>
      </div>

      {!proyectoSeleccionado ? (
        <div className="card" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
          Por favor selecciona un <strong>Proyecto de Obra</strong> para desplegar sus finanzas.
        </div>
      ) : cargando ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
          Cargando métricas financieras desde Firestore...
        </div>
      ) : (
        <>
          {/* Dashboard KPI — Subcomponente */}
          <FinanzasDashboard
            valorProyecto={valorProyecto}
            esValorCotizado={esValorCotizado}
            totalAbonos={totalAbonos}
            totalGastos={totalGastos}
            gastosManoObra={gastosManoObra}
            gastosMateriales={gastosMateriales}
            saldoPorCobrar={saldoPorCobrar}
            diferenciaNetaCaja={diferenciaNetaCaja}
            abonos={abonos}
            onEditarValor={() => { setInputValorProyecto(valorProyecto); setModalValorAbierto(true); }}
          />

          {/* Barra de Pestañas */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button onClick={() => setPestanaActiva('gastos')} className={`btn ${pestanaActiva === 'gastos' ? 'btn-primary' : 'btn-secondary'}`} style={{ fontSize: '0.88rem', gap: '6px' }}>
                <ArrowDownCircle size={16} /> Gastos del Proyecto ({gastos.length})
              </button>
              <button onClick={() => setPestanaActiva('abonos')} className={`btn ${pestanaActiva === 'abonos' ? 'btn-primary' : 'btn-secondary'}`} style={{ fontSize: '0.88rem', gap: '6px' }}>
                <ArrowUpCircle size={16} /> Abonos del Cliente ({abonos.length})
              </button>
              <button onClick={() => setPestanaActiva('compras_globales')} className={`btn ${pestanaActiva === 'compras_globales' ? 'btn-primary' : 'btn-secondary'}`} style={{ fontSize: '0.88rem', gap: '6px', background: pestanaActiva === 'compras_globales' ? '#8b5cf6' : undefined }}>
                🛒 Compras & Caja General ({comprasGlobales.length})
              </button>
            </div>
            {pestanaActiva === 'gastos' ? (
              <button onClick={handleAbrirCrearGasto} className="btn btn-primary" style={{ fontSize: '0.88rem', gap: '6px', background: 'linear-gradient(135deg, #f97316, #fb923c)' }}>
                <Plus size={16} /> + Registrar Gasto de Obra
              </button>
            ) : pestanaActiva === 'abonos' ? (
              <button onClick={() => { setErrorMsg(''); setModalAbonoAbierto(true); }} className="btn btn-primary" style={{ fontSize: '0.88rem', gap: '6px', background: 'linear-gradient(135deg, #10b981, #34d399)' }}>
                <Plus size={16} /> + Registrar Abono de Cliente
              </button>
            ) : (
              <button onClick={() => { setErrorMsg(''); setModalCompraGlobalAbierto(true); }} className="btn btn-primary" style={{ fontSize: '0.88rem', gap: '6px', background: 'linear-gradient(135deg, #8b5cf6, #a855f7)' }}>
                <Plus size={16} /> + Registrar Compra / Transferencia (Caja General)
              </button>
            )}
          </div>

          {/* Tablas — Subcomponentes */}
          {pestanaActiva === 'gastos' && <TablaGastos gastos={gastos} onEditar={handleAbrirEditarGasto} onEliminar={handleEliminarGasto} />}
          {pestanaActiva === 'abonos' && <TablaAbonos abonos={abonos} onEliminar={handleEliminarAbono} />}
          {pestanaActiva === 'compras_globales' && <TablaComprasGlobales comprasGlobales={comprasGlobales} onImputar={handleImputarCompra} onEliminar={handleEliminarCompraGlobal} />}
        </>
      )}

      {/* Modal Editar Valor del Proyecto */}
      <ModalForm titulo="Definir Valor Contratado del Proyecto" abierto={modalValorAbierto} onClose={() => setModalValorAbierto(false)}>
        <form onSubmit={handleGuardarValorProyecto}>
          <div className="input-group">
            <label className="input-label">Valor Total del Proyecto ($ COP) *</label>
            <input type="number" className="input-field" required value={inputValorProyecto} onChange={(e) => setInputValorProyecto(e.target.value)} placeholder="Ej. 15000000" style={{ fontSize: '1.1rem', fontWeight: 700, color: '#38bdf8' }} />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Monto oficial negociado o cotizado para la ejecución completa de la obra.</span>
          </div>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '20px' }}>
            <button type="button" onClick={() => setModalValorAbierto(false)} className="btn btn-secondary">Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={guardando}>{guardando ? 'Guardando...' : 'Guardar Valor'}</button>
          </div>
        </form>
      </ModalForm>

      {/* Modal Registrar Abono de Cliente */}
      <ModalForm titulo="📥 Registrar Abono de Cliente" abierto={modalAbonoAbierto} onClose={() => setModalAbonoAbierto(false)}>
        <form onSubmit={handleGuardarAbono}>
          {errorMsg && <div style={{ padding: '10px', background: 'rgba(239,68,68,0.15)', color: '#fca5a5', borderRadius: '8px', marginBottom: '12px', fontSize: '0.85rem' }}>{errorMsg}</div>}
          <div className="input-group">
            <label className="input-label">Concepto del Abono *</label>
            <input type="text" className="input-field" required value={formAbono.concepto} onChange={(e) => setFormAbono({ ...formAbono, concepto: e.target.value })} placeholder="Ej. Anticipo 50% inicio de obra / Cuota 2" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="input-group">
              <label className="input-label">Monto del Abono ($ COP) *</label>
              <input type="number" className="input-field" required value={formAbono.monto} onChange={(e) => setFormAbono({ ...formAbono, monto: e.target.value })} placeholder="Ej. 5000000" />
            </div>
            <div className="input-group">
              <label className="input-label">Fecha del Pago</label>
              <input type="date" className="input-field" value={formAbono.fecha} onChange={(e) => setFormAbono({ ...formAbono, fecha: e.target.value })} />
            </div>
          </div>
          <div className="input-group">
            <label className="input-label">Método de Pago</label>
            <select className="input-field" value={formAbono.metodoPago} onChange={(e) => setFormAbono({ ...formAbono, metodoPago: e.target.value })}>
              <option value="Transferencia Bancaria">Transferencia Bancaria</option>
              <option value="Efectivo">Efectivo</option>
              <option value="Consignación">Consignación Bancaria</option>
              <option value="Cheque">Cheque</option>
            </select>
          </div>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '20px' }}>
            <button type="button" onClick={() => setModalAbonoAbierto(false)} className="btn btn-secondary">Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={guardando}>{guardando ? 'Guardando...' : 'Guardar Abono'}</button>
          </div>
        </form>
      </ModalForm>

      {/* Modal Registrar / Editar Gasto de Obra */}
      <ModalForm titulo={gastoEditando ? "✏️ Editar Gasto de Obra" : "📤 Registrar Gasto de Obra"} abierto={modalGastoAbierto} onClose={() => { setModalGastoAbierto(false); setGastoEditando(null); }}>
        <form onSubmit={handleGuardarGasto}>
          {errorMsg && <div style={{ padding: '10px', background: 'rgba(239,68,68,0.15)', color: '#fca5a5', borderRadius: '8px', marginBottom: '12px', fontSize: '0.85rem' }}>{errorMsg}</div>}
          <div className="input-group">
            <label className="input-label">Categoría del Gasto *</label>
            <select className="input-field" value={formGasto.categoria} onChange={(e) => setFormGasto({ ...formGasto, categoria: e.target.value })} style={{ fontWeight: 600 }}>
              <option value="Mano de Obra">👷 Mano de Obra (Oficiales / Ayudantes / Jornales)</option>
              <option value="Materiales">📦 Materiales e Insumos</option>
              <option value="Transporte">🚚 Transporte / Fletes</option>
              <option value="Viáticos / Alimentación">🍲 Viáticos / Alimentación (Comidas, Refrigerios)</option>
              <option value="Equipos">🚜 Equipos / Maquinaria</option>
              <option value="Otros">🛠️ Otros / Imprevistos</option>
            </select>
          </div>
          <div className="input-group">
            <label className="input-label">Concepto / Descripción del Gasto *</label>
            <input type="text" className="input-field" required value={formGasto.concepto} onChange={(e) => setFormGasto({ ...formGasto, concepto: e.target.value })} placeholder={formGasto.categoria === 'Mano de Obra' ? 'Ej. Pago semana 2 oficial Pedro y 2 ayudantes' : 'Ej. Compra 20 bultos de cemento'} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="input-group">
              <label className="input-label">Monto del Gasto ($ COP) *</label>
              <input type="number" className="input-field" required value={formGasto.monto} onChange={(e) => setFormGasto({ ...formGasto, monto: e.target.value })} placeholder="Ej. 1200000" />
            </div>
            <div className="input-group">
              <label className="input-label">Fecha del Gasto</label>
              <input type="date" className="input-field" value={formGasto.fecha} onChange={(e) => setFormGasto({ ...formGasto, fecha: e.target.value })} />
            </div>
          </div>
          {formGasto.categoria === 'Mano de Obra' ? (
            <div className="input-group">
              <label className="input-label">Trabajador(es) / Oficial(es) Beneficiario(s)</label>
              <input type="text" className="input-field" value={formGasto.beneficiario} onChange={(e) => setFormGasto({ ...formGasto, beneficiario: e.target.value })} placeholder="Ej. Pedro Gómez (Oficial) / Juan Pérez (Ayudante)" />
            </div>
          ) : formGasto.categoria === 'Transporte' ? (
            <div className="input-group">
              <label className="input-label">Transportador / Conductor / Acarreo *</label>
              <input type="text" className="input-field" value={formGasto.beneficiario} onChange={(e) => setFormGasto({ ...formGasto, beneficiario: e.target.value, proveedorId: '' })} placeholder="Ej. Don Carlos (Camioneta Acarreo) / Mototaxi Jhoan / Envía" />
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Escribe el nombre de la persona o servicio de transporte que prestó el servicio.</span>
            </div>
          ) : (
            <div className="input-group">
              <label className="input-label">Proveedor / Prestador del Servicio (Catálogo o nombre libre)</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <select className="input-field" value={formGasto.proveedorId} onChange={(e) => { const provId = e.target.value; const provObj = proveedores.find(p => p.id === provId); setFormGasto({ ...formGasto, proveedorId: provId, beneficiario: provObj ? (provObj.razonSocial || provObj.nombre) : formGasto.beneficiario }); }}>
                  <option value="">-- Seleccionar Proveedor del Catálogo (Opcional) --</option>
                  {proveedores.map(p => (<option key={p.id} value={p.id}>{p.razonSocial || p.nombre}</option>))}
                </select>
                <input type="text" className="input-field" value={formGasto.beneficiario} onChange={(e) => setFormGasto({ ...formGasto, beneficiario: e.target.value })} placeholder="O escribe libremente el nombre de la persona o negocio" />
              </div>
            </div>
          )}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '20px' }}>
            <button type="button" onClick={() => setModalGastoAbierto(false)} className="btn btn-secondary">Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={guardando}>{guardando ? 'Guardando...' : 'Guardar Gasto'}</button>
          </div>
        </form>
      </ModalForm>

      {/* Modal Registrar Compra / Egreso en Caja General */}
      <ModalForm titulo="🛒 Registrar Compra / Transferencia en Caja General" abierto={modalCompraGlobalAbierto} onClose={() => setModalCompraGlobalAbierto(false)}>
        <form onSubmit={handleGuardarCompraGlobal}>
          {errorMsg && <div style={{ padding: '10px', background: 'rgba(239,68,68,0.15)', color: '#fca5a5', borderRadius: '8px', marginBottom: '12px', fontSize: '0.85rem' }}>{errorMsg}</div>}
          <div className="input-group">
            <label className="input-label">Categoría *</label>
            <select className="input-field" value={formCompraGlobal.categoria} onChange={(e) => setFormCompraGlobal({ ...formCompraGlobal, categoria: e.target.value })} style={{ fontWeight: 600 }}>
              <option value="Materiales">📦 Compra de Materiales e Insumos</option>
              <option value="Herramientas / Equipos">🛠️ Herramientas, Discos, Brocas, Fresas</option>
              <option value="Mano de Obra / Nomina">👷 Transferencia a Empleado / Avance</option>
              <option value="Transporte">🚚 Transporte / Fletes</option>
              <option value="Viáticos / Alimentación">🍱 Viáticos / Alimentación / Hospedaje</option>
              <option value="Otros">📦 Otros Gastos Administrativos</option>
            </select>
          </div>
          <div className="input-group">
            <label className="input-label">Concepto / Descripción de la Compra *</label>
            <input type="text" className="input-field" required value={formCompraGlobal.concepto} onChange={(e) => setFormCompraGlobal({ ...formCompraGlobal, concepto: e.target.value })} placeholder="Ej. Compra 5 discos de corte MDF 10'' en Ferretería Central" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="input-group">
              <label className="input-label">Monto de la Compra ($ COP) *</label>
              <input type="number" className="input-field" required value={formCompraGlobal.monto} onChange={(e) => setFormCompraGlobal({ ...formCompraGlobal, monto: e.target.value })} placeholder="Ej. 350000" />
            </div>
            <div className="input-group">
              <label className="input-label">Fecha de Compra</label>
              <input type="date" className="input-field" value={formCompraGlobal.fecha} onChange={(e) => setFormCompraGlobal({ ...formCompraGlobal, fecha: e.target.value })} />
            </div>
          </div>
          <div className="input-group">
            <label className="input-label">Proveedor / Empleado / Negocio (Seleccionar o escribir libremente)</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <select className="input-field" value={formCompraGlobal.proveedorId} onChange={(e) => { const provId = e.target.value; const provObj = proveedores.find(p => p.id === provId); setFormCompraGlobal({ ...formCompraGlobal, proveedorId: provId, beneficiario: provObj ? (provObj.razonSocial || provObj.nombre) : formCompraGlobal.beneficiario }); }}>
                <option value="">-- Seleccionar Proveedor del Catálogo (Opcional) --</option>
                {proveedores.map(p => (<option key={p.id} value={p.id}>{p.razonSocial || p.nombre}</option>))}
              </select>
              <input type="text" className="input-field" value={formCompraGlobal.beneficiario} onChange={(e) => setFormCompraGlobal({ ...formCompraGlobal, beneficiario: e.target.value })} placeholder="O escribe libremente el nombre del negocio o persona" />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '20px' }}>
            <button type="button" onClick={() => setModalCompraGlobalAbierto(false)} className="btn btn-secondary">Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={guardando}>{guardando ? 'Guardando...' : 'Registrar en Caja General'}</button>
          </div>
        </form>
      </ModalForm>
    </div>
  );
}
