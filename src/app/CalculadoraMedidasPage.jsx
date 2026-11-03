import React, { useState, useEffect } from 'react';
import { Calculator, Plus, Trash2, Edit3, Folder, CheckCircle, ChevronRight, Layers, Ruler } from 'lucide-react';
import { obtenerProyectos } from '../services/proyectosService';
import { obtenerMateriales } from '../services/materialesService';
import { obtenerMedicionesPorProyecto, crearMedicion, actualizarMedicion, eliminarMedicion } from '../services/medicionesService';
import ModalForm from '../components/ModalForm.jsx';

// ============================================================
// BLOQUE 1: COMPONENTE CALCULADORA DE MEDIDAS Y CUBICACIÓN
// Qué hace: Calcula y rectifica m² y m.l. por tramos asociándolos a un proyecto y material.
// Por qué: Requerimiento de cubicación rápida para presupuestos de obra.
// ============================================================
export default function CalculadoraMedidasPage() {
  const [proyectos, setProyectos] = useState([]);
  const [materiales, setMateriales] = useState([]);
  const [proyectoSeleccionado, setProyectoSeleccionado] = useState('');
  
  const [mediciones, setMediciones] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Estado del formulario de medición
  const [form, setForm] = useState({
    nombreZona: '',
    tipoCalculo: 'm²', // 'm²' o 'm.l.'
    materialId: '',
    tramos: [
      { id: Date.now(), etiqueta: 'Tramo 1', alto: '', ancho: '', subtotal: 0 }
    ]
  });

  const cargarCatalogos = async () => {
    try {
      const [dataProyectos, dataMateriales] = await Promise.all([
        obtenerProyectos(),
        obtenerMateriales()
      ]);
      setProyectos(dataProyectos);
      setMateriales(dataMateriales);

      // Auto-seleccionar primer proyecto si existe y no hay ninguno seleccionado
      if (dataProyectos.length > 0 && !proyectoSeleccionado) {
        setProyectoSeleccionado(dataProyectos[0].id);
      }
    } catch (err) {
      console.error("Error al cargar catálogos:", err);
    }
  };

  useEffect(() => {
    cargarCatalogos();
  }, []);

  const cargarMedicionesProyecto = async () => {
    if (!proyectoSeleccionado) return;
    setCargando(true);
    try {
      const data = await obtenerMedicionesPorProyecto(proyectoSeleccionado);
      setMediciones(data);
    } catch (err) {
      console.error(err);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarMedicionesProyecto();
  }, [proyectoSeleccionado]);

  // Recalcular subtotales de tramos y total acumulado
  const calcularSubtotalTramo = (tramo, tipoCalculo) => {
    const altoNum = parseFloat(tramo.alto) || 0;
    const anchoNum = parseFloat(tramo.ancho) || 0;
    if (tipoCalculo === 'm²') {
      return altoNum * anchoNum;
    } else {
      // m.l. (Metro Lineal): Usar Ancho/Largo si Alto no aplica o multiplicación si es desarrollo
      return anchoNum > 0 ? anchoNum : altoNum;
    }
  };

  const calcularTotalAcumulado = () => {
    return form.tramos.reduce((acc, t) => acc + (calcularSubtotalTramo(t, form.tipoCalculo)), 0);
  };

  const handleAgregarTramo = () => {
    setForm({
      ...form,
      tramos: [
        ...form.tramos,
        { id: Date.now(), etiqueta: `Tramo ${form.tramos.length + 1}`, alto: '', ancho: '', subtotal: 0 }
      ]
    });
  };

  const handleEliminarTramo = (idTramo) => {
    if (form.tramos.length === 1) return; // Al menos un tramo
    setForm({
      ...form,
      tramos: form.tramos.filter(t => t.id !== idTramo)
    });
  };

  const handleCambioTramo = (idTramo, campo, valor) => {
    setForm({
      ...form,
      tramos: form.tramos.map(t => {
        if (t.id === idTramo) {
          const modificado = { ...t, [campo]: valor };
          modificado.subtotal = calcularSubtotalTramo(modificado, form.tipoCalculo);
          return modificado;
        }
        return t;
      })
    });
  };

  const handleAbrirModalNuevo = () => {
    setEditandoId(null);
    setForm({
      nombreZona: '',
      tipoCalculo: 'm²',
      materialId: '',
      tramos: [
        { id: Date.now(), etiqueta: 'Tramo 1', alto: '', ancho: '', subtotal: 0 }
      ]
    });
    setErrorMsg('');
    setModalAbierto(true);
  };

  const handleAbrirModalRectificar = (medicion) => {
    setEditandoId(medicion.id);
    setForm({
      nombreZona: medicion.nombreZona || '',
      tipoCalculo: medicion.tipoCalculo || 'm²',
      materialId: medicion.materialId || '',
      tramos: (medicion.tramos && medicion.tramos.length > 0) ? medicion.tramos : [
        { id: Date.now(), etiqueta: 'Tramo 1', alto: '', ancho: '', subtotal: 0 }
      ]
    });
    setErrorMsg('');
    setModalAbierto(true);
  };

  const handleGuardar = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!proyectoSeleccionado) {
      return setErrorMsg('⚠️ Debes seleccionar un Proyecto obligatoriamente.');
    }
    if (!form.nombreZona.trim()) {
      return setErrorMsg('El nombre de la zona o elemento es obligatorio (ej. Cuarto 1).');
    }

    const totalCalculado = calcularTotalAcumulado();
    if (totalCalculado <= 0) {
      return setErrorMsg('Ingresa las dimensiones (alto/ancho) para obtener un resultado válido.');
    }

    const materialAsignado = materiales.find(m => m.id === form.materialId);

    const payload = {
      proyectoId: proyectoSeleccionado,
      nombreZona: form.nombreZona,
      tipoCalculo: form.tipoCalculo,
      materialId: form.materialId || '',
      materialNombre: materialAsignado ? materialAsignado.nombre : '',
      unidad: form.tipoCalculo,
      totalAcumulado: totalCalculado,
      tramos: form.tramos.map(t => ({
        id: t.id,
        etiqueta: t.etiqueta,
        alto: parseFloat(t.alto) || 0,
        ancho: parseFloat(t.ancho) || 0,
        subtotal: calcularSubtotalTramo(t, form.tipoCalculo)
      }))
    };

    setGuardando(true);
    try {
      if (editandoId) {
        await actualizarMedicion(editandoId, payload);
      } else {
        await crearMedicion(payload);
      }
      setModalAbierto(false);
      await cargarMedicionesProyecto();
    } catch (err) {
      setErrorMsg(err.message || 'Error al guardar la medición');
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminarMedicion = async (id) => {
    if (window.confirm('¿Seguro que deseas eliminar esta medición de cubización?')) {
      await eliminarMedicion(id);
      await cargarMedicionesProyecto();
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
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0 }}>Calculadora de Medidas y Cubicación</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
            Calcula metros cuadrados (m²) y lineales (m.l.) por tramos y asigna materiales por obra.
          </p>
        </div>
        <button 
          onClick={handleAbrirModalNuevo} 
          className="btn btn-primary"
          disabled={!proyectoSeleccionado}
        >
          <Plus size={18} /> Nueva Medición
        </button>
      </div>

      {/* Selector de Proyecto Obligatorio */}
      <div className="card" style={{ marginBottom: '24px', background: 'rgba(30,41,59,0.7)', border: '1px solid var(--border-color)' }}>
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
                📍 {proyectoActual.lugarObra || 'Ubicación registrada'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Lista de Mediciones Guardadas */}
      {!proyectoSeleccionado ? (
        <div className="card" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
          Por favor selecciona un <strong>Proyecto de Obra</strong> para ver y calcular sus medidas.
        </div>
      ) : cargando ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
          Cargando mediciones del proyecto...
        </div>
      ) : mediciones.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
          No hay medidas calculadas para este proyecto. Haz clic en <strong>Nueva Medición</strong> para comenzar.
        </div>
      ) : (
        <div className="grid-cards">
          {mediciones.map(m => (
            <div key={m.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 600, margin: 0, color: 'var(--text-main)' }}>
                    {m.nombreZona}
                  </h3>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '6px' }}>
                    <span className="badge badge-info">
                      {m.tipoCalculo === 'm²' ? '📐 Área (m²)' : '📏 Metro Lineal (m.l.)'}
                    </span>
                    {m.materialNombre && (
                      <span className="badge badge-warning">
                        🎨 Material: {m.materialNombre}
                      </span>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button 
                    onClick={() => handleAbrirModalRectificar(m)} 
                    className="btn btn-secondary"
                    style={{ minHeight: '34px', padding: '0 10px', fontSize: '0.8rem', gap: '4px' }}
                    title="Rectificar Medidas"
                  >
                    <Edit3 size={14} /> Rectificar
                  </button>
                  <button 
                    onClick={() => handleEliminarMedicion(m.id)} 
                    className="btn btn-danger"
                    style={{ minHeight: '34px', width: '34px', padding: 0 }}
                    title="Eliminar"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* Desglose de Tramos */}
              <div style={{ background: 'rgba(15,23,42,0.5)', padding: '10px 14px', borderRadius: 'var(--radius-md)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                  DESGLOSE DE TRAMOS:
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.85rem' }}>
                  {m.tramos && m.tramos.map((t, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                      <span>• {t.etiqueta || `Tramo ${idx + 1}`}: {t.alto}m × {t.ancho}m</span>
                      <strong style={{ color: 'var(--text-main)' }}>{Number(t.subtotal || 0).toFixed(2)} {m.unidad}</strong>
                    </div>
                  ))}
                </div>

                <div style={{ 
                  display: 'flex', 
                  justify: 'space-between', 
                  alignItems: 'center', 
                  marginTop: '10px', 
                  paddingTop: '8px', 
                  borderTop: '1px solid rgba(255,255,255,0.1)' 
                }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>TOTAL ACUMULADO</span>
                  <strong style={{ color: '#34d399', fontSize: '1.2rem', fontFamily: 'var(--font-mono)' }}>
                    {Number(m.totalAcumulado || 0).toFixed(2)} {m.unidad}
                  </strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal para Crear / Rectificar Medición */}
      <ModalForm 
        titulo={editandoId ? "✏️ Rectificar Medidas / Cubicación" : "📐 Nueva Toma de Medidas"} 
        abierto={modalAbierto} 
        onClose={() => setModalAbierto(false)}
      >
        <form onSubmit={handleGuardar}>
          {errorMsg && (
            <div style={{ padding: '10px', background: 'rgba(239,68,68,0.15)', color: '#fca5a5', borderRadius: '8px', marginBottom: '12px', fontSize: '0.85rem' }}>
              {errorMsg}
            </div>
          )}

          <div className="input-group">
            <label className="input-label">Nombre de la Zona / Elemento (ej. Cuarto 1, Muro Fachada) *</label>
            <input 
              type="text" 
              className="input-field" 
              required
              value={form.nombreZona}
              onChange={(e) => setForm({ ...form, nombreZona: e.target.value })}
              placeholder="Ej. Cuarto 1 / Muro Principal Estuco"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="input-group">
              <label className="input-label">Tipo de Cálculo</label>
              <select 
                className="input-field"
                value={form.tipoCalculo}
                onChange={(e) => setForm({ ...form, tipoCalculo: e.target.value })}
              >
                <option value="m²">Metros Cuadrados (m²) — Área</option>
                <option value="m.l.">Metros Lineales (m.l.) — Longitud</option>
              </select>
            </div>

            <div className="input-group">
              <label className="input-label">Material / Actividad Asociada</label>
              <select 
                className="input-field"
                value={form.materialId}
                onChange={(e) => setForm({ ...form, materialId: e.target.value })}
              >
                <option value="">-- Seleccionar del Catálogo --</option>
                {materiales.map(m => (
                  <option key={m.id} value={m.id}>{m.nombre} (${Number(m.precioUnitario).toLocaleString()} COP / {m.unidad})</option>
                ))}
              </select>
            </div>
          </div>

          {/* Tramos Dinámicos */}
          <div style={{ marginTop: '14px', marginBottom: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label className="input-label" style={{ margin: 0 }}>Tramos de Medición (Alto × Ancho/Largo)</label>
              <button 
                type="button" 
                onClick={handleAgregarTramo} 
                className="btn btn-secondary" 
                style={{ padding: '4px 10px', fontSize: '0.8rem', gap: '4px' }}
              >
                <Plus size={14} /> + Agregar Tramo
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {form.tramos.map((t, idx) => (
                <div key={t.id} style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '1.2fr 1fr 1fr 1fr auto', 
                  gap: '8px', 
                  alignItems: 'center',
                  background: 'rgba(15,23,42,0.4)',
                  padding: '8px 10px',
                  borderRadius: '6px'
                }}>
                  <input 
                    type="text"
                    className="input-field"
                    value={t.etiqueta}
                    onChange={(e) => handleCambioTramo(t.id, 'etiqueta', e.target.value)}
                    placeholder={`Tramo ${idx + 1}`}
                    style={{ padding: '6px 8px', fontSize: '0.85rem' }}
                  />
                  <input 
                    type="number"
                    step="0.01"
                    className="input-field"
                    value={t.alto}
                    onChange={(e) => handleCambioTramo(t.id, 'alto', e.target.value)}
                    placeholder="Alto (m)"
                    style={{ padding: '6px 8px', fontSize: '0.85rem' }}
                  />
                  <input 
                    type="number"
                    step="0.01"
                    className="input-field"
                    value={t.ancho}
                    onChange={(e) => handleCambioTramo(t.id, 'ancho', e.target.value)}
                    placeholder={form.tipoCalculo === 'm²' ? 'Ancho (m)' : 'Largo (m)'}
                    style={{ padding: '6px 8px', fontSize: '0.85rem' }}
                  />
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#34d399', textAlign: 'right' }}>
                    {Number(calcularSubtotalTramo(t, form.tipoCalculo)).toFixed(2)} {form.tipoCalculo}
                  </div>
                  {form.tramos.length > 1 && (
                    <button 
                      type="button" 
                      onClick={() => handleEliminarTramo(t.id)} 
                      style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', padding: '4px' }}
                      title="Eliminar Tramo"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Suma Total en el Modal */}
          <div style={{ 
            background: 'rgba(56, 189, 248, 0.1)', 
            border: '1px solid rgba(56, 189, 248, 0.3)', 
            padding: '12px 16px', 
            borderRadius: '8px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '16px'
          }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-primary)' }}>TOTAL CALCULADO</span>
            <strong style={{ fontSize: '1.3rem', color: '#38bdf8', fontFamily: 'var(--font-mono)' }}>
              {Number(calcularTotalAcumulado()).toFixed(2)} {form.tipoCalculo}
            </strong>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '20px' }}>
            <button type="button" onClick={() => setModalAbierto(false)} className="btn btn-secondary">
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={guardando}>
              {guardando ? 'Guardando en Firebase...' : editandoId ? 'Guardar Rectificación' : 'Finalizar y Guardar'}
            </button>
          </div>
        </form>
      </ModalForm>
    </div>
  );
}
