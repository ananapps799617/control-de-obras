import React, { useState, useEffect } from 'react';
import { Truck, HardHat, DollarSign, Save, Folder, Plus, Trash2, CheckCircle, Calculator, ShieldAlert, Coffee, Wrench } from 'lucide-react';
import { obtenerProyectos } from '../services/proyectosService';
import { obtenerGastosPorProyecto, guardarGastosProyecto } from '../services/gastosService';

// ============================================================
// BLOQUE 1: COMPONENTE CALCULADORA DE MANO DE OBRA, TRANSPORTE Y GASTOS EXTRAS
// Qué hace: Calcula costos indirectos del proyecto y permite guardarlos en Firestore para integrarlos en las Cotizaciones Oficiales.
// Por qué: Requerimiento del Fundador para costear fletes, mano de obra, viáticos e imprevistos de obra.
// ============================================================
export default function CalculadoraGastosObraPage() {
  const [proyectos, setProyectos] = useState([]);
  const [proyectoSeleccionado, setProyectoSeleccionado] = useState('');

  const [cargando, setCargando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [mensajeExito, setMensajeExito] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Estado del Formulario de Gastos Extras
  const [form, setForm] = useState({
    // 1. Mano de Obra
    numOficiales: 1,
    numAyudantes: 1,
    diasTrabajoMO: 3,
    tarifaDiaOficial: 120000,
    tarifaDiaAyudante: 80000,

    // 2. Transporte y Fletes
    fleteAcarreoTaller: 150000,
    fleteMateriales: 80000,
    combustiblePeajes: 50000,

    // 3. Viáticos y Alimentación
    diasViaticos: 3,
    costoDiaViatico: 35000,

    // 4. Herramienta Menor y Consumibles
    totalConsumibles: 60000,

    // 5. Imprevistos y Extras
    porcentajeImprevistos: 5,
    gastosExtrasVarios: 100000,
    descripcionGastosExtras: 'Peajes, amarres y flete urbano de acarreos.'
  });

  const cargarProyectos = async () => {
    try {
      const dataProyectos = await obtenerProyectos();
      setProyectos(dataProyectos);
      if (dataProyectos.length > 0 && !proyectoSeleccionado) {
        setProyectoSeleccionado(dataProyectos[0].id);
      }
    } catch (err) {
      console.error("Error al cargar proyectos:", err);
    }
  };

  useEffect(() => {
    cargarProyectos();
  }, []);

  const cargarGastosProyecto = async () => {
    if (!proyectoSeleccionado) return;
    setCargando(true);
    setErrorMsg('');
    setMensajeExito('');
    try {
      const gastosData = await obtenerGastosPorProyecto(proyectoSeleccionado);
      if (gastosData) {
        setForm({
          numOficiales: gastosData.numOficiales !== undefined ? gastosData.numOficiales : 1,
          numAyudantes: gastosData.numAyudantes !== undefined ? gastosData.numAyudantes : 1,
          diasTrabajoMO: gastosData.diasTrabajoMO !== undefined ? gastosData.diasTrabajoMO : 3,
          tarifaDiaOficial: gastosData.tarifaDiaOficial !== undefined ? gastosData.tarifaDiaOficial : 120000,
          tarifaDiaAyudante: gastosData.tarifaDiaAyudante !== undefined ? gastosData.tarifaDiaAyudante : 80000,
          fleteAcarreoTaller: gastosData.fleteAcarreoTaller !== undefined ? gastosData.fleteAcarreoTaller : 150000,
          fleteMateriales: gastosData.fleteMateriales !== undefined ? gastosData.fleteMateriales : 80000,
          combustiblePeajes: gastosData.combustiblePeajes !== undefined ? gastosData.combustiblePeajes : 50000,
          diasViaticos: gastosData.diasViaticos !== undefined ? gastosData.diasViaticos : 3,
          costoDiaViatico: gastosData.costoDiaViatico !== undefined ? gastosData.costoDiaViatico : 35000,
          totalConsumibles: gastosData.totalConsumibles !== undefined ? gastosData.totalConsumibles : 60000,
          porcentajeImprevistos: gastosData.porcentajeImprevistos !== undefined ? gastosData.porcentajeImprevistos : 5,
          gastosExtrasVarios: gastosData.gastosExtrasVarios !== undefined ? gastosData.gastosExtrasVarios : 100000,
          descripcionGastosExtras: gastosData.descripcionGastosExtras || ''
        });
      }
    } catch (err) {
      console.error("Error al cargar gastos del proyecto:", err);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarGastosProyecto();
  }, [proyectoSeleccionado]);

  // CÁLCULOS EN TIEMPO REAL
  const calcularTotalManoObra = () => {
    const oficiales = (parseFloat(form.numOficiales) || 0) * (parseFloat(form.tarifaDiaOficial) || 0);
    const ayudantes = (parseFloat(form.numAyudantes) || 0) * (parseFloat(form.tarifaDiaAyudante) || 0);
    const dias = parseFloat(form.diasTrabajoMO) || 0;
    return (oficiales + ayudantes) * dias;
  };

  const calcularTotalTransporte = () => {
    return (parseFloat(form.fleteAcarreoTaller) || 0) + 
           (parseFloat(form.fleteMateriales) || 0) + 
           (parseFloat(form.combustiblePeajes) || 0);
  };

  const calcularTotalViaticos = () => {
    const personas = (parseFloat(form.numOficiales) || 0) + (parseFloat(form.numAyudantes) || 0);
    const dias = parseFloat(form.diasViaticos) || 0;
    const costo = parseFloat(form.costoDiaViatico) || 0;
    return personas * dias * costo;
  };

  const calcularSubtotalDirecto = () => {
    return calcularTotalManoObra() + calcularTotalTransporte() + calcularTotalViaticos() + (parseFloat(form.totalConsumibles) || 0) + (parseFloat(form.gastosExtrasVarios) || 0);
  };

  const calcularMontoImprevistos = () => {
    const subtotal = calcularSubtotalDirecto();
    const pct = parseFloat(form.porcentajeImprevistos) || 0;
    return (subtotal * pct) / 100;
  };

  const calcularGranTotalGastosIndirectos = () => {
    return calcularSubtotalDirecto() + calcularMontoImprevistos();
  };

  const handleGuardar = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setMensajeExito('');

    if (!proyectoSeleccionado) {
      return setErrorMsg('⚠️ Debes seleccionar un Proyecto obligatoriamente.');
    }

    const payload = {
      numOficiales: form.numOficiales,
      numAyudantes: form.numAyudantes,
      diasTrabajoMO: form.diasTrabajoMO,
      tarifaDiaOficial: form.tarifaDiaOficial,
      tarifaDiaAyudante: form.tarifaDiaAyudante,
      totalManoObra: calcularTotalManoObra(),

      fleteAcarreoTaller: form.fleteAcarreoTaller,
      fleteMateriales: form.fleteMateriales,
      combustiblePeajes: form.combustiblePeajes,
      totalTransporte: calcularTotalTransporte(),

      diasViaticos: form.diasViaticos,
      costoDiaViatico: form.costoDiaViatico,
      totalViaticos: calcularTotalViaticos(),

      totalConsumibles: form.totalConsumibles,
      porcentajeImprevistos: form.porcentajeImprevistos,
      montoImprevistos: calcularMontoImprevistos(),
      gastosExtrasVarios: form.gastosExtrasVarios,
      descripcionGastosExtras: form.descripcionGastosExtras,

      totalGastosIndirectos: calcularGranTotalGastosIndirectos()
    };

    setGuardando(true);
    try {
      await guardarGastosProyecto(proyectoSeleccionado, payload);
      setMensajeExito(`✅ ¡Gastos de Obra guardados en Firestore! ($${Number(calcularGranTotalGastosIndirectos()).toLocaleString()} COP). Se llamarán automáticamente en la Cotización Oficial.`);
      setTimeout(() => setMensajeExito(''), 6000);
    } catch (err) {
      setErrorMsg(err.message || 'Error al guardar los gastos en Firebase');
    } finally {
      setGuardando(false);
    }
  };

  const proyectoActual = proyectos.find(p => p.id === proyectoSeleccionado);

  return (
    <div>
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        marginBottom: '20px'
      }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0 }}>Calculadora de Mano de Obra, Transporte & Gastos Extras</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
            Calcula imprevistos, fletes y mano de obra del proyecto para incluirlos automáticamente en la Cotización Oficial.
          </p>
        </div>
      </div>

      {/* Selector de Proyecto Obligatorio */}
      <div className="card" style={{ marginBottom: '20px', background: 'rgba(30,41,59,0.7)', border: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <Folder size={20} color="var(--color-primary)" />
          <div style={{ flex: 1, minWidth: '220px' }}>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
              PROYECTO SELECCIONADO (OBLIGATORIO) *
            </label>
            <select 
              className="input-field" 
              value={proyectoSeleccionado}
              onChange={(e) => setProyectoSeleccionado(e.target.value)}
              style={{ fontWeight: 600, color: 'var(--color-primary)' }}
            >
              <option value="">-- Selecciona el Proyecto de Obra --</option>
              {proyectos.map(p => (
                <option key={p.id} value={p.id}>
                  {p.nombre} ({p.codigoCotizacion || p.tipoCotizacion || 'Sin Código'})
                </option>
              ))}
            </select>
          </div>

          {proyectoActual && (
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span className="badge badge-success">
                📄 {proyectoActual.codigoCotizacion || proyectoActual.tipoCotizacion}
              </span>
              <span className="badge badge-info">
                📍 {proyectoActual.lugarObra || 'Proyecto Activo'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Mensajes de Estado */}
      {mensajeExito && (
        <div style={{ padding: '12px 16px', background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)', color: '#4ade80', borderRadius: '8px', marginBottom: '16px', fontWeight: 600 }}>
          {mensajeExito}
        </div>
      )}
      {errorMsg && (
        <div style={{ padding: '12px 16px', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5', borderRadius: '8px', marginBottom: '16px', fontSize: '0.88rem' }}>
          {errorMsg}
        </div>
      )}

      {!proyectoSeleccionado ? (
        <div className="card" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
          Por favor selecciona un <strong>Proyecto de Obra</strong> para ingresar a la calculadora de mano de obra y transporte.
        </div>
      ) : cargando ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
          Cargando datos del proyecto desde Firestore...
        </div>
      ) : (
        <form onSubmit={handleGuardar}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '24px' }}>
            
            {/* CARD 1: MANO DE OBRA E INSTALACIÓN */}
            <div className="card" style={{ borderTop: '4px solid #38bdf8' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                <HardHat color="#38bdf8" size={22} />
                <h3 style={{ fontSize: '1.05rem', margin: 0, fontWeight: 700 }}>1. Mano de Obra e Instalación</h3>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div className="input-group">
                  <label className="input-label">N° de Oficiales</label>
                  <input 
                    type="number" 
                    className="input-field" 
                    value={form.numOficiales}
                    onChange={(e) => setForm({ ...form, numOficiales: e.target.value })}
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">Tarifa Día Oficial ($ COP)</label>
                  <input 
                    type="number" 
                    className="input-field" 
                    value={form.tarifaDiaOficial}
                    onChange={(e) => setForm({ ...form, tarifaDiaOficial: e.target.value })}
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">N° de Ayudantes</label>
                  <input 
                    type="number" 
                    className="input-field" 
                    value={form.numAyudantes}
                    onChange={(e) => setForm({ ...form, numAyudantes: e.target.value })}
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">Tarifa Día Ayudante ($ COP)</label>
                  <input 
                    type="number" 
                    className="input-field" 
                    value={form.tarifaDiaAyudante}
                    onChange={(e) => setForm({ ...form, tarifaDiaAyudante: e.target.value })}
                  />
                </div>
              </div>

              <div className="input-group" style={{ marginTop: '8px' }}>
                <label className="input-label">Días Totales Estimados de Trabajo</label>
                <input 
                  type="number" 
                  className="input-field" 
                  value={form.diasTrabajoMO}
                  onChange={(e) => setForm({ ...form, diasTrabajoMO: e.target.value })}
                  style={{ fontWeight: 700, color: '#38bdf8' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '14px', paddingTop: '10px', borderTop: '1px dashed rgba(255,255,255,0.1)', fontWeight: 700, color: '#38bdf8' }}>
                <span>Subtotal Mano de Obra:</span>
                <span>${Number(calcularTotalManoObra()).toLocaleString()} COP</span>
              </div>
            </div>

            {/* CARD 2: TRANSPORTE, FLETES Y ACARREOS */}
            <div className="card" style={{ borderTop: '4px solid #fb923c' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                <Truck color="#fb923c" size={22} />
                <h3 style={{ fontSize: '1.05rem', margin: 0, fontWeight: 700 }}>2. Transporte, Fletes & Acarreos</h3>
              </div>

              <div className="input-group">
                <label className="input-label">Flete / Acarreo de Taller a Obra ($ COP)</label>
                <input 
                  type="number" 
                  className="input-field" 
                  value={form.fleteAcarreoTaller}
                  onChange={(e) => setForm({ ...form, fleteAcarreoTaller: e.target.value })}
                />
              </div>

              <div className="input-group">
                <label className="input-label">Acarreo de Materiales e Insumos ($ COP)</label>
                <input 
                  type="number" 
                  className="input-field" 
                  value={form.fleteMateriales}
                  onChange={(e) => setForm({ ...form, fleteMateriales: e.target.value })}
                />
              </div>

              <div className="input-group">
                <label className="input-label">Combustible, Peajes & Movilización ($ COP)</label>
                <input 
                  type="number" 
                  className="input-field" 
                  value={form.combustiblePeajes}
                  onChange={(e) => setForm({ ...form, combustiblePeajes: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '14px', paddingTop: '10px', borderTop: '1px dashed rgba(255,255,255,0.1)', fontWeight: 700, color: '#fb923c' }}>
                <span>Subtotal Transporte:</span>
                <span>${Number(calcularTotalTransporte()).toLocaleString()} COP</span>
              </div>
            </div>

            {/* CARD 3: VIÁTICOS, CONSUMIBLES Y EXTRAS */}
            <div className="card" style={{ borderTop: '4px solid #c084fc' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                <Coffee color="#c084fc" size={22} />
                <h3 style={{ fontSize: '1.05rem', margin: 0, fontWeight: 700 }}>3. Viáticos, Consumibles & Extras</h3>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div className="input-group">
                  <label className="input-label">Días Alimentación</label>
                  <input 
                    type="number" 
                    className="input-field" 
                    value={form.diasViaticos}
                    onChange={(e) => setForm({ ...form, diasViaticos: e.target.value })}
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">Costo Alimentación/Día</label>
                  <input 
                    type="number" 
                    className="input-field" 
                    value={form.costoDiaViatico}
                    onChange={(e) => setForm({ ...form, costoDiaViatico: e.target.value })}
                  />
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">Herramienta Menor & Consumibles (Discos, lijas, EPP)</label>
                <input 
                  type="number" 
                  className="input-field" 
                  value={form.totalConsumibles}
                  onChange={(e) => setForm({ ...form, totalConsumibles: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '10px' }}>
                <div className="input-group">
                  <label className="input-label">% Imprevistos</label>
                  <input 
                    type="number" 
                    step="0.5"
                    className="input-field" 
                    value={form.porcentajeImprevistos}
                    onChange={(e) => setForm({ ...form, porcentajeImprevistos: e.target.value })}
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">Gastos Extras Varios</label>
                  <input 
                    type="number" 
                    className="input-field" 
                    value={form.gastosExtrasVarios}
                    onChange={(e) => setForm({ ...form, gastosExtrasVarios: e.target.value })}
                  />
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">Descripción de Gastos Extras</label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={form.descripcionGastosExtras}
                  onChange={(e) => setForm({ ...form, descripcionGastosExtras: e.target.value })}
                  placeholder="Detalle de gastos adicionados"
                />
              </div>
            </div>
          </div>

          {/* TARJETA RESUMEN TOTAL DE GASTOS INDIRECTOS Y BOTÓN DE GUARDADO */}
          <div className="card" style={{ background: 'rgba(15,23,42,0.9)', border: '1px solid rgba(52, 211, 153, 0.4)', padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', margin: 0, color: 'var(--text-main)', fontWeight: 700 }}>
                  💰 RESUMEN TOTAL DE GASTOS DE OBRA
                </h3>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Al guardar, se integrarán automáticamente en el desglose de la Cotización Oficial del Proyecto.
                </span>
              </div>

              <button 
                type="submit" 
                className="btn btn-primary"
                style={{ fontSize: '1rem', padding: '10px 24px', gap: '8px' }}
                disabled={guardando}
              >
                <Save size={18} /> {guardando ? 'Guardando en Firebase...' : '💾 Guardar Gastos de Obra'}
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              <div>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block' }}>Mano de Obra:</span>
                <strong style={{ color: '#38bdf8', fontSize: '1rem' }}>${Number(calcularTotalManoObra()).toLocaleString()} COP</strong>
              </div>
              <div>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block' }}>Transporte / Fletes:</span>
                <strong style={{ color: '#fb923c', fontSize: '1rem' }}>${Number(calcularTotalTransporte()).toLocaleString()} COP</strong>
              </div>
              <div>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block' }}>Viáticos & Consumibles:</span>
                <strong style={{ color: '#c084fc', fontSize: '1rem' }}>${Number(calcularTotalViaticos() + Number(form.totalConsumibles || 0)).toLocaleString()} COP</strong>
              </div>
              <div>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block' }}>Imprevistos ({form.porcentajeImprevistos}%):</span>
                <strong style={{ color: '#f43f5e', fontSize: '1rem' }}>+${Number(calcularMontoImprevistos()).toLocaleString()} COP</strong>
              </div>
              <div>
                <span style={{ fontSize: '0.78rem', color: '#34d399', display: 'block', fontWeight: 700 }}>GRAN TOTAL INDIRECTOS:</span>
                <strong style={{ color: '#34d399', fontSize: '1.3rem', fontFamily: 'var(--font-mono)' }}>${Number(calcularGranTotalGastosIndirectos()).toLocaleString()} COP</strong>
              </div>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
