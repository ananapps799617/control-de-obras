import React, { useState, useEffect } from 'react';
import { Plus, Search, HardHat, MapPin, Trash2, FolderOpen, FileText, FileCheck, Navigation, Download, Camera, CheckCircle2, Activity, Flag, RotateCcw, Calendar, Eye, Layers } from 'lucide-react';
import { obtenerProyectos, crearProyecto, eliminarProyecto, obtenerSiguienteCodigoCotizacion, actualizarAvanceProyecto, actualizarEstadoProyecto } from '../services/proyectosService';
import { obtenerClientes } from '../services/clientesService';
import { obtenerCotizacionGuardadaPorProyecto } from '../services/cotizacionesService';
import { obtenerContratoGuardadoPorProyecto } from '../services/contratosService';
import ModalForm from '../components/ModalForm.jsx';
import ModalFotosProyecto from '../components/proyectos/ModalFotosProyecto.jsx';
import ModalBitacoraDiaria from '../components/proyectos/ModalBitacoraDiaria.jsx';
import ModalCronogramaGantt from '../components/proyectos/ModalCronogramaGantt.jsx';
import ModalPortalCliente from '../components/proyectos/ModalPortalCliente.jsx';

// ============================================================
// BLOQUE 1: COMPONENTE VISTA DE PROYECTOS / OBRAS
// Qué hace: Control de obras, estados de cotización, ubicación y carpetas Drive.
// Por qué: Reglas RT-01, RT-02 y especificaciones del Fundador.
// ============================================================
export default function ProyectosPage({ onNavegarTab }) {
  const [proyectos, setProyectos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [modalAbierto, setModalAbierto] = useState(false);

  // Modal Ver Cotización desde Proyecto
  const [modalCotizAbierto, setModalCotizAbierto] = useState(false);
  const [cotizacionModalData, setCotizacionModalData] = useState(null);

  // Modal Ver Contrato desde Proyecto
  const [modalContratoDocAbierto, setModalContratoDocAbierto] = useState(false);
  const [contratoModalData, setContratoModalData] = useState(null);

  // Modal Fotos de Obra por Proyecto
  const [proyectoFotosSeleccionado, setProyectoFotosSeleccionado] = useState(null);

  // Modal Bitácora Diaria por Proyecto
  const [proyectoBitacoraSeleccionado, setProyectoBitacoraSeleccionado] = useState(null);

  // Modal Cronograma Gantt por Proyecto
  const [proyectoGanttSeleccionado, setProyectoGanttSeleccionado] = useState(null);

  // Modal Portal Cliente por Proyecto
  const [proyectoPortalSeleccionado, setProyectoPortalSeleccionado] = useState(null);

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [form, setForm] = useState({
    nombre: '',
    codigoObra: '',
    clienteId: '',
    lugarObra: '',
    direccionObra: '',
    tipoCotizacion: 'RH-COT-001-0001',
    estado: 'Sin Cotizar'
  });

  const handleVerCotizacionDesdeProyecto = async (proyectoId) => {
    try {
      const cotiz = await obtenerCotizacionGuardadaPorProyecto(proyectoId);
      if (cotiz && cotiz.contenidoHtml) {
        setCotizacionModalData(cotiz);
        setModalCotizAbierto(true);
      } else {
        alert('⚠️ Este proyecto aún no cuenta con una Cotización Oficial guardada. Te redirigiremos a la Sección 4 para generarla.');
        if (onNavegarTab) onNavegarTab('cotizaciones-oficiales');
      }
    } catch (err) {
      console.error("Error al ver cotización:", err);
    }
  };

  const handleVerContratoDesdeProyecto = async (proyectoId) => {
    try {
      const contrato = await obtenerContratoGuardadoPorProyecto(proyectoId);
      if (contrato && contrato.contenidoHtml) {
        setContratoModalData(contrato);
        setModalContratoDocAbierto(true);
      } else {
        alert('⚠️ Este proyecto aún no cuenta con un Contrato Oficial (RH-CT-003) guardado. Te redirigiremos a la Sección 4 para legalizarlo.');
        if (onNavegarTab) onNavegarTab('contratos-oficiales');
      }
    } catch (err) {
      console.error("Error al ver contrato:", err);
    }
  };

  const handleCambiarAvance = async (proyectoId, nuevoPorcentaje) => {
    const num = Number(nuevoPorcentaje) || 0;
    try {
      let nuevoEstado = undefined;
      const projActual = proyectos.find(p => p.id === proyectoId);

      if (num >= 100) {
        nuevoEstado = 'Finalizado';
      } else if (projActual && projActual.estado === 'Finalizado' && num < 100) {
        nuevoEstado = 'Activo';
      }

      await actualizarAvanceProyecto(proyectoId, num, nuevoEstado);
      setProyectos(prev => prev.map(p => {
        if (p.id === proyectoId) {
          return {
            ...p,
            porcentajeAvance: num,
            estado: nuevoEstado || p.estado
          };
        }
        return p;
      }));
    } catch (err) {
      console.error("Error al actualizar avance:", err);
    }
  };

  const handleMarcarFinalizado = async (proyectoId) => {
    if (!window.confirm('🏁 ¿Deseas marcar esta obra como FINALIZADA al 100%?')) return;
    try {
      await actualizarAvanceProyecto(proyectoId, 100, 'Finalizado');
      setProyectos(prev => prev.map(p => {
        if (p.id === proyectoId) {
          return { ...p, porcentajeAvance: 100, estado: 'Finalizado' };
        }
        return p;
      }));
    } catch (err) {
      console.error("Error al marcar proyecto como finalizado:", err);
    }
  };

  const handleReabrirProyecto = async (proyectoId) => {
    try {
      await actualizarAvanceProyecto(proyectoId, 75, 'Activo');
      setProyectos(prev => prev.map(p => {
        if (p.id === proyectoId) {
          return { ...p, porcentajeAvance: 75, estado: 'Activo' };
        }
        return p;
      }));
    } catch (err) {
      console.error("Error al reabrir proyecto:", err);
    }
  };

  const handleCambiarEstadoDirecto = async (proyectoId, nuevoEstado) => {
    try {
      const projActual = proyectos.find(p => p.id === proyectoId);
      let avanceNuevo = projActual ? projActual.porcentajeAvance : 0;

      if (nuevoEstado === 'Finalizado') {
        avanceNuevo = 100;
      } else if (nuevoEstado === 'Activo' && avanceNuevo >= 100) {
        avanceNuevo = 75;
      }

      await actualizarAvanceProyecto(proyectoId, avanceNuevo, nuevoEstado);
      setProyectos(prev => prev.map(p => {
        if (p.id === proyectoId) {
          return {
            ...p,
            estado: nuevoEstado,
            porcentajeAvance: avanceNuevo
          };
        }
        return p;
      }));
    } catch (err) {
      console.error("Error al cambiar estado:", err);
    }
  };

  const getProgresoColor = (porcentaje, estado) => {
    if (estado === 'Finalizado' || porcentaje >= 100) return '#22c55e';
    if (porcentaje >= 75) return '#34d399';
    if (porcentaje >= 25) return '#38bdf8';
    return '#f59e0b';
  };

  const handleAbrirModal = async () => {
    try {
      const infoCotiz = await obtenerSiguienteCodigoCotizacion();
      setForm({
        nombre: '',
        codigoObra: '',
        clienteId: '',
        lugarObra: '',
        direccionObra: '',
        tipoCotizacion: infoCotiz.codigoCotizacion,
        estado: 'Sin Cotizar'
      });
    } catch (err) {
      console.warn("No se pudo autogenerar código de cotización:", err);
    }
    setModalAbierto(true);
  };

  const cargarDatos = async () => {
    setCargando(true);
    try {
      const [dataProyectos, dataClientes] = await Promise.all([
        obtenerProyectos(),
        obtenerClientes()
      ]);

      const sortAZ = (arr, key = 'nombre') => [...arr].sort((a, b) => (a[key] || '').trim().localeCompare((b[key] || '').trim(), 'es', { sensitivity: 'base' }));

      setProyectos(sortAZ(dataProyectos, 'nombre'));
      setClientes(sortAZ(dataClientes, 'nombre'));
    } catch (err) {
      console.error(err);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const handleGuardar = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!form.nombre.trim()) return setErrorMsg('El nombre del proyecto es obligatorio');
    if (!form.clienteId) return setErrorMsg('⚠️ Debes seleccionar un Cliente obligatoriamente antes de crear el proyecto');

    setGuardando(true);
    try {
      await crearProyecto(form);
      setForm({ 
        nombre: '', 
        codigoObra: '', 
        clienteId: '', 
        lugarObra: '', 
        direccionObra: '', 
        tipoCotizacion: 'RH-COT-001', 
        estado: 'Sin Cotizar' 
      });
      setModalAbierto(false);
      await cargarDatos();
    } catch (err) {
      setErrorMsg(err.message || 'Error al guardar en Firebase');
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminar = async (id) => {
    if (window.confirm('¿Seguro que deseas eliminar esta obra de Firestore?')) {
      await eliminarProyecto(id);
      await cargarDatos();
    }
  };

  const filtrados = proyectos.filter(p => 
    p.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
    p.codigoObra?.toLowerCase().includes(busqueda.toLowerCase()) ||
    p.lugarObra?.toLowerCase().includes(busqueda.toLowerCase()) ||
    p.direccionObra?.toLowerCase().includes(busqueda.toLowerCase())
  );

  const getBadgeEstadoClass = (estado) => {
    switch (estado) {
      case 'Activo': return 'badge-success';
      case 'Cotizado': return 'badge-info';
      case 'Sin Cotizar': return 'badge-warning';
      case 'Cancelado': return 'badge-danger';
      default: return 'badge-secondary';
    }
  };

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
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0 }}>Proyectos de Obra</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
            Directorio y control de estado de obras registradas.
          </p>
        </div>
        <button onClick={handleAbrirModal} className="btn btn-primary">
          <Plus size={18} /> Crear Proyecto
        </button>
      </div>

      <div style={{ position: 'relative', marginBottom: '20px' }}>
        <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '14px' }} />
        <input 
          type="text" 
          placeholder="Buscar por nombre, código, lugar o dirección de obra..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="input-field"
          style={{ paddingLeft: '42px' }}
        />
      </div>

      {cargando ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
          Cargando proyectos desde Firestore...
        </div>
      ) : filtrados.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
          No hay proyectos registrados aún. Haz clic en <strong>Crear Proyecto</strong> para comenzar.
        </div>
      ) : (
        <div className="grid-cards">
          {filtrados.map(p => {
            const clienteAsignado = clientes.find(c => c.id === p.clienteId);
            return (
              <div key={p.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 600, margin: 0, color: 'var(--text-main)' }}>
                      {p.nombre}
                    </h3>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '6px' }}>
                      {p.codigoObra && (
                        <span className="badge badge-info">CÓD: {p.codigoObra}</span>
                      )}
                      
                      {/* Selector de Estado Interactivo */}
                      <select
                        value={p.estado || 'Sin Cotizar'}
                        onChange={(e) => handleCambiarEstadoDirecto(p.id, e.target.value)}
                        style={{
                          background: p.estado === 'Activo' ? 'rgba(52,211,153,0.15)' :
                                      p.estado === 'Cotizado' ? 'rgba(56,189,248,0.15)' :
                                      p.estado === 'Finalizado' ? 'rgba(34,197,94,0.2)' : 'rgba(245,158,11,0.15)',
                          color: p.estado === 'Activo' ? '#34d399' :
                                 p.estado === 'Cotizado' ? '#38bdf8' :
                                 p.estado === 'Finalizado' ? '#4ade80' : '#fbbf24',
                          border: `1px solid ${
                            p.estado === 'Activo' ? 'rgba(52,211,153,0.4)' :
                            p.estado === 'Cotizado' ? 'rgba(56,189,248,0.4)' :
                            p.estado === 'Finalizado' ? 'rgba(34,197,94,0.5)' : 'rgba(245,158,11,0.4)'
                          }`,
                          borderRadius: '12px',
                          padding: '2px 8px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          outline: 'none'
                        }}
                        title="Cambiar estado del proyecto (Sin Cotizar, Cotizado, Activo, Finalizado)"
                      >
                        <option value="Sin Cotizar" style={{ background: '#0f172a', color: '#fbbf24' }}>Sin Cotizar</option>
                        <option value="Cotizado" style={{ background: '#0f172a', color: '#38bdf8' }}>Cotizado</option>
                        <option value="Activo" style={{ background: '#0f172a', color: '#34d399' }}>Activo</option>
                        <option value="Finalizado" style={{ background: '#0f172a', color: '#4ade80' }}>Finalizado 🎉</option>
                        <option value="Cancelado" style={{ background: '#0f172a', color: '#f87171' }}>Cancelado</option>
                      </select>

                      {p.tipoCotizacion && (
                        <span className="badge badge-secondary" style={{ background: 'rgba(255,255,255,0.08)' }}>
                          📄 {p.tipoCotizacion}
                        </span>
                      )}
                    </div>
                  </div>
                  <button 
                    onClick={() => handleEliminar(p.id)} 
                    className="btn btn-danger"
                    style={{ minHeight: '34px', width: '34px', padding: 0 }}
                    title="Eliminar"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                  {clienteAsignado && (
                    <div>🏢 Cliente: <strong>{clienteAsignado.nombre}</strong></div>
                  )}
                  {p.lugarObra && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Navigation size={14} color="var(--color-primary)" /> 
                      <span>Lugar: <strong>{p.lugarObra}</strong></span>
                    </div>
                  )}
                  {p.direccionObra && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <MapPin size={14} color="var(--color-primary)" /> 
                      <span>Dirección: <strong>{p.direccionObra}</strong></span>
                    </div>
                  )}
                </div>

                {/* Barra Visual de Porcentaje de Avance (0 - 100%) */}
                <div style={{
                  marginTop: '4px',
                  padding: '10px 12px',
                  background: 'rgba(15, 23, 42, 0.45)',
                  borderRadius: '8px',
                  border: '1px solid rgba(255,255,255,0.08)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Activity size={14} color={getProgresoColor(p.porcentajeAvance || 0, p.estado)} /> Avance:
                    </span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: getProgresoColor(p.porcentajeAvance || 0, p.estado) }}>
                      {p.estado === 'Finalizado' ? '100% (Finalizado 🎉)' : `${p.porcentajeAvance || 0}%`}
                    </span>
                  </div>

                  {/* Track y Fill de la Barra */}
                  <div style={{
                    width: '100%',
                    height: '8px',
                    background: 'rgba(255,255,255,0.08)',
                    borderRadius: '4px',
                    overflow: 'hidden',
                    marginBottom: '8px'
                  }}>
                    <div style={{
                      width: `${p.estado === 'Finalizado' ? 100 : (p.porcentajeAvance || 0)}%`,
                      height: '100%',
                      background: getProgresoColor(p.porcentajeAvance || 0, p.estado),
                      borderRadius: '4px',
                      transition: 'width 0.4s ease-in-out'
                    }} />
                  </div>

                  {/* Controles interactivos: Slider de Avance + Botones Marcar Finalizado / Reabrir */}
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={p.porcentajeAvance !== undefined && p.porcentajeAvance !== null ? p.porcentajeAvance : (p.estado === 'Finalizado' ? 100 : 0)}
                      onChange={(e) => handleCambiarAvance(p.id, e.target.value)}
                      style={{ flex: 1, cursor: 'pointer', accentColor: getProgresoColor(p.porcentajeAvance || 0, p.estado) }}
                      title="Desliza para ajustar el porcentaje de avance (mover abajo del 100% reactiva la obra)"
                    />
                    {p.estado === 'Finalizado' ? (
                      <button
                        onClick={() => handleReabrirProyecto(p.id)}
                        className="btn btn-secondary"
                        style={{ padding: '3px 10px', fontSize: '0.75rem', minHeight: '26px', gap: '4px', whiteSpace: 'nowrap', color: '#38bdf8', borderColor: 'rgba(56, 189, 248, 0.4)' }}
                        title="Reabrir este proyecto (cambiar de Finalizado a Activo)"
                      >
                        <RotateCcw size={13} /> ↩️ Reabrir
                      </button>
                    ) : (
                      <button
                        onClick={() => handleMarcarFinalizado(p.id)}
                        className="btn btn-success"
                        style={{ padding: '3px 10px', fontSize: '0.75rem', minHeight: '26px', gap: '4px', whiteSpace: 'nowrap', background: '#16a34a', borderColor: '#15803d' }}
                        title="Marcar esta obra como Finalizada al 100%"
                      >
                        <CheckCircle2 size={13} /> 🏁 Finalizar
                      </button>
                    )}
                  </div>
                </div>

                {/* Botones de Acción de la Tarjeta */}
                <div style={{ display: 'flex', gap: '6px', marginTop: 'auto', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => setProyectoGanttSeleccionado(p)}
                    className="btn btn-secondary"
                    style={{ flex: 1, minHeight: '36px', fontSize: '0.8rem', padding: '4px 8px', gap: '4px', color: '#38bdf8', borderColor: 'rgba(56, 189, 248, 0.4)' }}
                    title="Cronograma de Fases y Diagrama Gantt de Obra"
                  >
                    <Calendar size={15} /> Cronograma
                  </button>

                  <button
                    onClick={() => setProyectoPortalSeleccionado(p)}
                    className="btn btn-secondary"
                    style={{ flex: 1, minHeight: '36px', fontSize: '0.8rem', padding: '4px 8px', gap: '4px', color: '#c084fc', borderColor: 'rgba(192, 132, 252, 0.4)' }}
                    title="Portal de Transparencia Compartible para el Cliente"
                  >
                    <Eye size={15} /> Portal Cliente
                  </button>

                  <button
                    onClick={() => setProyectoBitacoraSeleccionado(p)}
                    className="btn btn-secondary"
                    style={{ flex: 1, minHeight: '36px', fontSize: '0.8rem', padding: '4px 8px', gap: '4px', color: '#34d399', borderColor: 'rgba(52, 211, 153, 0.4)' }}
                    title="Bitácora Diaria de Campo (Asistencia, Clima, Avances, Bloqueos)"
                  >
                    <FileText size={15} /> Bitácora
                  </button>

                  <button
                    onClick={() => setProyectoFotosSeleccionado(p)}
                    className="btn btn-secondary"
                    style={{ flex: 1, minHeight: '36px', fontSize: '0.8rem', padding: '4px 8px', gap: '4px', color: '#fbbf24', borderColor: 'rgba(251, 191, 36, 0.4)' }}
                    title="Carga y Galería de Fotos de Obra (Antes, Durante, Terminado)"
                  >
                    <Camera size={15} /> Fotos
                  </button>

                  <button
                    onClick={() => handleVerCotizacionDesdeProyecto(p.id)}
                    className="btn btn-secondary"
                    style={{ flex: 1, minHeight: '36px', fontSize: '0.8rem', padding: '4px 8px', gap: '4px', color: '#38bdf8', borderColor: 'rgba(56, 189, 248, 0.4)' }}
                    title="Ver Cotización Comercial"
                  >
                    <FileText size={15} /> Cotización
                  </button>

                  <button
                    onClick={() => handleVerContratoDesdeProyecto(p.id)}
                    className="btn btn-secondary"
                    style={{ flex: 1, minHeight: '36px', fontSize: '0.8rem', padding: '4px 8px', gap: '4px', color: '#c084fc', borderColor: 'rgba(192, 132, 252, 0.4)' }}
                    title="Ver Contrato de Obra (RH-CT-003)"
                  >
                    <FileCheck size={15} /> Contrato
                  </button>

                  <a
                    href={p.driveFolderUrl || '#'}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-secondary"
                    style={{ minHeight: '36px', fontSize: '0.8rem', padding: '4px 8px', gap: '4px' }}
                    title="Abrir en Google Drive"
                  >
                    <FolderOpen size={15} color="var(--color-primary)" /> Drive
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Cronograma Gantt del Proyecto */}
      {proyectoGanttSeleccionado && (
        <ModalCronogramaGantt
          proyecto={proyectoGanttSeleccionado}
          onClose={() => setProyectoGanttSeleccionado(null)}
        />
      )}

      {/* Modal Portal Cliente del Proyecto */}
      {proyectoPortalSeleccionado && (
        <ModalPortalCliente
          proyecto={proyectoPortalSeleccionado}
          cliente={clientes.find(c => c.id === proyectoPortalSeleccionado.clienteId)}
          onClose={() => setProyectoPortalSeleccionado(null)}
        />
      )}

      {/* Modal Bitácora Diaria del Proyecto */}
      {proyectoBitacoraSeleccionado && (
        <ModalBitacoraDiaria
          proyecto={proyectoBitacoraSeleccionado}
          onClose={() => setProyectoBitacoraSeleccionado(null)}
        />
      )}

      {/* Modal Galería y Carga de Fotos del Proyecto */}
      {proyectoFotosSeleccionado && (
        <ModalFotosProyecto
          proyecto={proyectoFotosSeleccionado}
          onClose={() => setProyectoFotosSeleccionado(null)}
        />
      )}

      <ModalForm 
        titulo="Crear Nuevo Proyecto de Obra" 
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
            <label className="input-label">Nombre del Proyecto / Obra *</label>
            <input 
              type="text" 
              className="input-field" 
              required
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              placeholder="Ej. Edificio Los Ceibos — Torre A"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="input-group">
              <label className="input-label">Código de Obra</label>
              <input 
                type="text" 
                className="input-field" 
                value={form.codigoObra}
                onChange={(e) => setForm({ ...form, codigoObra: e.target.value })}
                placeholder="Ej. OBRA-2026-01"
              />
            </div>
            <div className="input-group">
              <label className="input-label">Tipo de Cotización</label>
              <input 
                type="text" 
                className="input-field" 
                value={form.tipoCotizacion}
                onChange={(e) => setForm({ ...form, tipoCotizacion: e.target.value })}
                placeholder="RH-COT-001"
              />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Cliente Asignado (OBLIGATORIO) *</label>
            <select 
              className="input-field"
              required
              value={form.clienteId}
              onChange={(e) => setForm({ ...form, clienteId: e.target.value })}
            >
              <option value="">-- Selecciona el Cliente Responsable --</option>
              {clientes.map(c => (
                <option key={c.id} value={c.id}>{c.nombre} (Drive: /{c.aliasCarpeta || c.nombre})</option>
              ))}
            </select>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              La carpeta del proyecto se creará automáticamente <strong>DENTRO</strong> de la carpeta del Cliente seleccionado.
            </span>
          </div>

          <div className="input-group">
            <label className="input-label">Estado Inicial del Proyecto</label>
            <select 
              className="input-field"
              value={form.estado}
              onChange={(e) => setForm({ ...form, estado: e.target.value })}
            >
              <option value="Sin Cotizar">Sin Cotizar</option>
              <option value="Cotizado">Cotizado</option>
              <option value="Activo">Activo</option>
              <option value="Finalizado">Finalizado</option>
              <option value="Cancelado">Cancelado</option>
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="input-group">
              <label className="input-label">Lugar de Obra</label>
              <input 
                type="text" 
                className="input-field" 
                value={form.lugarObra}
                onChange={(e) => setForm({ ...form, lugarObra: e.target.value })}
                placeholder="Ej. Santiago / Sector Norte"
              />
            </div>
            <div className="input-group">
              <label className="input-label">Dirección de Obra</label>
              <input 
                type="text" 
                className="input-field" 
                value={form.direccionObra}
                onChange={(e) => setForm({ ...form, direccionObra: e.target.value })}
                placeholder="Ej. Av. Principal 456, Lote B"
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '20px' }}>
            <button type="button" onClick={() => setModalAbierto(false)} className="btn btn-secondary">
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={guardando}>
              {guardando ? 'Guardando...' : 'Crear Proyecto'}
            </button>
          </div>
        </form>
      </ModalForm>

      {/* Modal Ver Cotización Comercial desde Tarjeta del Proyecto */}
      <ModalForm 
        titulo={`📄 Cotización Comercial — ${cotizacionModalData?.nombreArchivo || ''}`} 
        abierto={modalCotizAbierto} 
        onClose={() => setModalCotizAbierto(false)}
      >
        <div style={{ maxHeight: '70vh', overflowY: 'auto', background: '#fff', padding: '10px', borderRadius: '8px' }}>
          {cotizacionModalData && (
            <iframe 
              srcDoc={cotizacionModalData.contenidoHtml} 
              title="Cotización Comercial Proyecto"
              style={{ width: '100%', height: '580px', border: 'none' }}
            />
          )}
        </div>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '16px' }}>
          <button type="button" onClick={() => setModalCotizAbierto(false)} className="btn btn-secondary">Cerrar</button>
          {cotizacionModalData && (
            <button 
              type="button" 
              onClick={() => {
                const blob = new Blob([cotizacionModalData.contenidoHtml], { type: 'text/html;charset=utf-8' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = cotizacionModalData.nombreArchivo || 'Cotizacion_Comercial.html';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
              }} 
              className="btn btn-primary" 
              style={{ background: '#10b981', gap: '6px' }}
            >
              <Download size={16} /> Descargar Archivo HTML
            </button>
          )}
        </div>
      </ModalForm>

      {/* Modal Ver Contrato Legal de Obra (RH-CT-003) desde Tarjeta del Proyecto */}
      <ModalForm 
        titulo={`📑 Contrato Legal (RH-CT-003) — ${contratoModalData?.nombreArchivo || ''}`} 
        abierto={modalContratoDocAbierto} 
        onClose={() => setModalContratoDocAbierto(false)}
      >
        <div style={{ maxHeight: '70vh', overflowY: 'auto', background: '#fff', padding: '10px', borderRadius: '8px' }}>
          {contratoModalData && (
            <iframe 
              srcDoc={contratoModalData.contenidoHtml} 
              title="Contrato Legal Proyecto"
              style={{ width: '100%', height: '580px', border: 'none' }}
            />
          )}
        </div>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '16px' }}>
          <button type="button" onClick={() => setModalContratoDocAbierto(false)} className="btn btn-secondary">Cerrar</button>
          {contratoModalData && (
            <button 
              type="button" 
              onClick={() => {
                const blob = new Blob([contratoModalData.contenidoHtml], { type: 'text/html;charset=utf-8' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = contratoModalData.nombreArchivo || 'Contrato_Legal_RH-CT-003.html';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
              }} 
              className="btn btn-primary" 
              style={{ background: '#10b981', gap: '6px' }}
            >
              <Download size={16} /> Descargar Contrato HTML
            </button>
          )}
        </div>
      </ModalForm>
    </div>
  );
}
