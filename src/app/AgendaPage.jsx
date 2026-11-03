import React, { useState, useEffect } from 'react';
import { Calendar, Plus, ChevronLeft, ChevronRight, MapPin, Clock, Trash2, CheckCircle, AlertCircle, HardHat, Filter } from 'lucide-react';
import { obtenerProyectos } from '../services/proyectosService';
import { 
  crearVisitaAgenda, 
  actualizarVisitaAgenda, 
  eliminarVisitaAgenda, 
  obtenerEventosCalendarioCompletos 
} from '../services/agendaService';
import ModalForm from '../components/ModalForm.jsx';
import { getFechaHoyLocal } from '../lib/dateUtils.js';

// ============================================================
// BLOQUE 1: COMPONENTE SECCIÓN 2 — AGENDA Y CALENDARIO DE OBRA
// Qué hace: Gestiona citas de medición, visitas técnicas e instalaciones, cargando automáticamente los inicios y entregas de cotizaciones.
// Por qué: Requerimiento del Fundador para control de cronograma y citas de obra.
// ============================================================
export default function AgendaPage() {
  const [proyectos, setProyectos] = useState([]);
  const [eventos, setEventos] = useState([]);
  const [proyectoFiltro, setProyectoFiltro] = useState('');

  const [cargando, setCargando] = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Control del mes y año en el calendario
  const [fechaActual, setFechaActual] = useState(new Date());

  // Formulario Crear Visita / Cita
  const [form, setForm] = useState({
    proyectoId: '',
    tipoEvento: 'Visita Técnica de Medición',
    concepto: '',
    fecha: getFechaHoyLocal(),
    horaInicio: '09:00',
    horaFin: '11:00',
    lugar: '',
    notas: '',
    estado: 'Pendiente'
  });

  const cargarDatos = async () => {
    setCargando(true);
    try {
      const dataProyectos = await obtenerProyectos();
      setProyectos(dataProyectos);

      const dataEventos = await obtenerEventosCalendarioCompletos(dataProyectos);
      setEventos(dataEventos);
    } catch (err) {
      console.error("Error al cargar agenda:", err);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  // Navegación de Meses
  const mesAnterior = () => {
    setFechaActual(new Date(fechaActual.getFullYear(), fechaActual.getMonth() - 1, 1));
  };

  const mesSiguiente = () => {
    setFechaActual(new Date(fechaActual.getFullYear(), fechaActual.getMonth() + 1, 1));
  };

  const irAHoy = () => {
    setFechaActual(new Date());
  };

  const handleGuardar = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!form.concepto.trim()) return setErrorMsg('El concepto o título de la cita es obligatorio');
    if (!form.fecha) return setErrorMsg('La fecha es obligatoria');

    const proyectoAsignado = proyectos.find(p => p.id === form.proyectoId);

    setGuardando(true);
    try {
      await crearVisitaAgenda({
        ...form,
        proyectoNombre: proyectoAsignado ? proyectoAsignado.nombre : 'General'
      });

      setForm({
        proyectoId: '',
        tipoEvento: 'Visita Técnica de Medición',
        concepto: '',
        fecha: new Date().toISOString().split('T')[0],
        horaInicio: '09:00',
        horaFin: '11:00',
        lugar: '',
        notas: '',
        estado: 'Pendiente'
      });
      setModalAbierto(false);
      await cargarDatos();
    } catch (err) {
      setErrorMsg(err.message || 'Error al agendar cita');
    } finally {
      setGuardando(false);
    }
  };

  const handleCambiarEstado = async (id, nuevoEstado) => {
    await actualizarVisitaAgenda(id, { estado: nuevoEstado });
    await cargarDatos();
  };

  const handleEliminar = async (id) => {
    if (window.confirm('¿Seguro que deseas eliminar esta cita de la agenda?')) {
      await eliminarVisitaAgenda(id);
      await cargarDatos();
    }
  };

  // Filtrar eventos por proyecto
  const eventosFiltrados = eventos.filter(ev => {
    if (!proyectoFiltro) return true;
    return ev.proyectoId === proyectoFiltro;
  });

  // Generación de la grilla del calendario mensual
  const año = fechaActual.getFullYear();
  const mes = fechaActual.getMonth();
  const primerDiaMes = new Date(año, mes, 1).getDay(); // 0 = Dom, 1 = Lun...
  const diasEnMes = new Date(año, mes + 1, 0).getDate();

  const nombresMeses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  // Construcción de días de la grilla
  const diasGrilla = [];
  for (let i = 0; i < primerDiaMes; i++) {
    diasGrilla.push(null);
  }
  for (let d = 1; d <= diasEnMes; d++) {
    diasGrilla.push(d);
  }

  const formatearFechaComparacion = (dia) => {
    const m = String(mes + 1).padStart(2, '0');
    const d = String(dia).padStart(2, '0');
    return `${año}-${m}-${d}`;
  };

  const hoyStr = new Date().toISOString().split('T')[0];

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
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0 }}>Agenda y Calendario de Obras</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
            Control de visitas técnicas, citas de medición, instalaciones y cronogramas de inicio/entrega de cotizaciones.
          </p>
        </div>
        <button onClick={() => setModalAbierto(true)} className="btn btn-primary">
          <Plus size={18} /> + Agendar Visita / Cita
        </button>
      </div>

      {/* BARRA SUPERIOR DE CONTROLES DEL CALENDARIO Y FILTRO */}
      <div className="card" style={{ marginBottom: '20px', padding: '14px 18px', background: 'rgba(30,41,59,0.7)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          
          {/* Navegación de Mes */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button onClick={mesAnterior} className="btn btn-secondary" style={{ padding: '6px 10px' }}>
              <ChevronLeft size={18} />
            </button>
            <strong style={{ fontSize: '1.15rem', color: '#38bdf8', minWidth: '160px', textAlign: 'center' }}>
              {nombresMeses[mes]} {año}
            </strong>
            <button onClick={mesSiguiente} className="btn btn-secondary" style={{ padding: '6px 10px' }}>
              <ChevronRight size={18} />
            </button>
            <button onClick={irAHoy} className="btn btn-secondary" style={{ fontSize: '0.8rem', padding: '6px 12px' }}>
              Hoy
            </button>
          </div>

          {/* Filtro por Proyecto */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Filter size={16} color="var(--text-muted)" />
            <select 
              className="input-field" 
              value={proyectoFiltro} 
              onChange={(e) => setProyectoFiltro(e.target.value)}
              style={{ fontSize: '0.85rem', width: '220px' }}
            >
              <option value="">-- Todos los Proyectos --</option>
              {proyectos.map(p => (
                <option key={p.id} value={p.id}>{p.nombre}</option>
              ))}
            </select>
          </div>

          {/* Leyenda de Colores */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', fontSize: '0.75rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#38bdf8' }} /> Visita / Cita
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#34d399' }} /> Instalación
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#c084fc' }} /> 🚀 Inicio Obra
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f43f5e' }} /> 🏁 Entrega Obra
            </span>
          </div>

        </div>
      </div>

      {cargando ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
          Cargando agenda y cronogramas de obra desde Firestore...
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* GRILLA MENSUAL INTERACTIVA */}
          <div className="card" style={{ padding: '16px', overflowX: 'auto' }}>
            {/* Cabecera Días de la Semana */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', textAlign: 'center', fontWeight: 700, fontSize: '0.82rem', color: '#38bdf8', marginBottom: '8px' }}>
              <div>DOM</div><div>LUN</div><div>MAR</div><div>MIÉ</div><div>JUE</div><div>VIE</div><div>SÁB</div>
            </div>

            {/* Días del Mes */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px' }}>
              {diasGrilla.map((dia, idx) => {
                if (dia === null) {
                  return <div key={`empty-${idx}`} style={{ minHeight: '90px', background: 'rgba(255,255,255,0.01)', borderRadius: '6px' }} />;
                }

                const fechaDiaStr = formatearFechaComparacion(dia);
                const esHoy = fechaDiaStr === hoyStr;
                const eventosDelDia = eventosFiltrados.filter(ev => ev.fecha === fechaDiaStr);

                return (
                  <div 
                    key={dia} 
                    style={{ 
                      minHeight: '95px', 
                      background: esHoy ? 'rgba(56, 189, 248, 0.08)' : 'rgba(15,23,42,0.6)', 
                      border: esHoy ? '1px solid #38bdf8' : '1px solid rgba(255,255,255,0.06)',
                      borderRadius: '6px',
                      padding: '6px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ 
                        fontSize: '0.85rem', 
                        fontWeight: esHoy ? 800 : 600, 
                        color: esHoy ? '#38bdf8' : 'var(--text-main)',
                        background: esHoy ? 'rgba(56, 189, 248, 0.2)' : 'transparent',
                        padding: '2px 6px',
                        borderRadius: '4px'
                      }}>
                        {dia}
                      </span>
                      {eventosDelDia.length > 0 && (
                        <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                          {eventosDelDia.length} ev
                        </span>
                      )}
                    </div>

                    {/* Lista de Eventos en la celda */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', overflowY: 'auto', maxHeight: '65px' }}>
                      {eventosDelDia.map(ev => (
                        <div 
                          key={ev.id}
                          style={{ 
                            fontSize: '0.72rem', 
                            padding: '3px 5px', 
                            borderRadius: '4px', 
                            background: ev.color ? `${ev.color}22` : 'rgba(56,189,248,0.2)',
                            borderLeft: `3px solid ${ev.color || '#38bdf8'}`,
                            color: '#ffffff',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}
                          title={`${ev.concepto} (${ev.horaInicio || ''}) - ${ev.proyectoNombre || ''}`}
                        >
                          <strong>{ev.horaInicio ? `${ev.horaInicio} ` : ''}</strong>{ev.concepto}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* LISTA CRONOLÓGICA DE PRÓXIMOS COMPROMISOS */}
          <div className="card" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px', color: '#38bdf8' }}>
              📋 Próximos Compromisos y Hitos de Obra
            </h3>

            {eventosFiltrados.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>
                No hay citas ni cronogramas registrados para los filtros seleccionados.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {eventosFiltrados.map(ev => (
                  <div 
                    key={ev.id} 
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      gap: '12px',
                      padding: '12px 16px',
                      background: 'rgba(15,23,42,0.6)',
                      borderLeft: `5px solid ${ev.color || '#38bdf8'}`,
                      borderRadius: '8px',
                      border: '1px solid rgba(255,255,255,0.06)'
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: ev.color || '#38bdf8', fontFamily: 'var(--font-mono)' }}>
                          📅 {ev.fecha} {ev.horaInicio ? `• ⏰ ${ev.horaInicio} - ${ev.horaFin}` : ''}
                        </span>
                        <span className="badge badge-secondary" style={{ fontSize: '0.72rem' }}>
                          🏢 {ev.proyectoNombre || 'General'}
                        </span>
                        {ev.estado && (
                          <span className={`badge ${ev.estado === 'Realizada' ? 'badge-success' : 'badge-warning'}`}>
                            {ev.estado}
                          </span>
                        )}
                      </div>
                      <strong style={{ fontSize: '0.95rem', display: 'block', marginTop: '4px' }}>
                        {ev.concepto}
                      </strong>
                      {ev.lugar && (
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <MapPin size={12} color="var(--color-primary)" /> {ev.lugar}
                        </div>
                      )}
                      {ev.notas && (
                        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                          📝 {ev.notas}
                        </p>
                      )}
                    </div>

                    {/* Acciones para eventos creados por usuario */}
                    {ev.origen === 'usuario' && (
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        {ev.estado !== 'Realizada' && (
                          <button 
                            onClick={() => handleCambiarEstado(ev.id, 'Realizada')}
                            className="btn btn-success"
                            style={{ padding: '4px 8px', fontSize: '0.75rem', gap: '4px', background: '#10b981' }}
                            title="Marcar Realizada"
                          >
                            <CheckCircle size={14} /> Listo
                          </button>
                        )}
                        <button 
                          onClick={() => handleEliminar(ev.id)}
                          style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', padding: '4px' }}
                          title="Eliminar"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

      {/* Modal Agendar Visita / Cita */}
      <ModalForm titulo="📅 Agendar Visita de Obra / Cita Técnica" abierto={modalAbierto} onClose={() => setModalAbierto(false)}>
        <form onSubmit={handleGuardar}>
          {errorMsg && <div style={{ padding: '10px', background: 'rgba(239,68,68,0.15)', color: '#fca5a5', borderRadius: '8px', marginBottom: '12px', fontSize: '0.85rem' }}>{errorMsg}</div>}

          <div className="input-group">
            <label className="input-label">Proyecto Asociado *</label>
            <select 
              className="input-field" 
              value={form.proyectoId}
              onChange={(e) => setForm({ ...form, proyectoId: e.target.value })}
              style={{ fontWeight: 600 }}
            >
              <option value="">-- Seleccionar Proyecto de Obra --</option>
              {proyectos.map(p => (
                <option key={p.id} value={p.id}>{p.nombre}</option>
              ))}
            </select>
          </div>

          <div className="input-group">
            <label className="input-label">Tipo de Evento / Cita *</label>
            <select 
              className="input-field"
              value={form.tipoEvento}
              onChange={(e) => setForm({ ...form, tipoEvento: e.target.value })}
            >
              <option value="Visita Técnica de Medición">📐 Visita Técnica de Medición</option>
              <option value="Reunión Cliente">🤝 Reunión Comercial / Cliente</option>
              <option value="Instalación">🛠️ Instalación en Sitio</option>
              <option value="Inspección / Entrega">🔍 Inspección / Entrega de Obra</option>
              <option value="Supervisión">📋 Supervisión de Avance</option>
            </select>
          </div>

          <div className="input-group">
            <label className="input-label">Concepto / Título de la Cita *</label>
            <input 
              type="text" 
              className="input-field" 
              required
              value={form.concepto}
              onChange={(e) => setForm({ ...form, concepto: e.target.value })}
              placeholder="Ej. Medición final mueble de cocina en obra"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
            <div className="input-group">
              <label className="input-label">Fecha *</label>
              <input 
                type="date" 
                className="input-field" 
                required
                value={form.fecha}
                onChange={(e) => setForm({ ...form, fecha: e.target.value })}
              />
            </div>
            <div className="input-group">
              <label className="input-label">Hora Inicio</label>
              <input 
                type="time" 
                className="input-field" 
                value={form.horaInicio}
                onChange={(e) => setForm({ ...form, horaInicio: e.target.value })}
              />
            </div>
            <div className="input-group">
              <label className="input-label">Hora Fin</label>
              <input 
                type="time" 
                className="input-field" 
                value={form.horaFin}
                onChange={(e) => setForm({ ...form, horaFin: e.target.value })}
              />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Lugar / Dirección de la Cita</label>
            <input 
              type="text" 
              className="input-field" 
              value={form.lugar}
              onChange={(e) => setForm({ ...form, lugar: e.target.value })}
              placeholder="Ej. Dirección de la obra o domicilio del cliente"
            />
          </div>

          <div className="input-group">
            <label className="input-label">Notas u Objetivo de la Visita</label>
            <textarea 
              className="input-field" 
              rows={3}
              value={form.notas}
              onChange={(e) => setForm({ ...form, notas: e.target.value })}
              placeholder="Detalles adicionales, herramientas a llevar o puntos a tratar..."
            />
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '20px' }}>
            <button type="button" onClick={() => setModalAbierto(false)} className="btn btn-secondary">Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={guardando}>
              {guardando ? 'Guardando...' : 'Agendar Cita'}
            </button>
          </div>
        </form>
      </ModalForm>
    </div>
  );
}
