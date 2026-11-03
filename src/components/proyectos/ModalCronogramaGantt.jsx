import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  CheckCircle2, 
  PlusCircle, 
  Trash2, 
  AlertCircle, 
  Sparkles, 
  Layers,
  ChevronRight,
  BarChart2
} from 'lucide-react';
import ModalForm from '../ModalForm.jsx';
import { 
  obtenerFasesProyecto, 
  inicializarFasesPredeterminadas, 
  guardarFaseProyecto, 
  actualizarFaseProyecto, 
  eliminarFaseProyecto 
} from '../../services/fasesProyectoService.js';
import { actualizarAvanceProyecto } from '../../services/proyectosService';

// ============================================================
// BLOQUE 1: COMPONENTE CRONOGRAMA Y DIAGRAMA GANTT DE OBRA
// Qué hace: Muestra y gestiona las fases de ejecución del proyecto con barra Gantt.
// Por qué: Cumple RT-01, RT-02 y especificaciones de cronograma del Fundador.
// ============================================================
export default function ModalCronogramaGantt({ proyecto, onClose }) {
  const [fases, setFases] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [modalNuevaFase, setModalNuevaFase] = useState(false);

  // Formulario nueva fase
  const [nombreFase, setNombreFase] = useState('');
  const [fechaInicioPlan, setFechaInicioPlan] = useState(new Date().toISOString().split('T')[0]);
  const [fechaFinPlan, setFechaFinPlan] = useState(new Date().toISOString().split('T')[0]);
  const [colorFase, setColorFase] = useState('#38bdf8');

  useEffect(() => {
    if (proyecto?.id) {
      cargarFases();
    }
  }, [proyecto?.id]);

  const cargarFases = async () => {
    setCargando(true);
    try {
      let data = await obtenerFasesProyecto(proyecto.id);
      if (data.length === 0) {
        // Inicializar fases predeterminadas para comodidad del usuario
        data = await inicializarFasesPredeterminadas(proyecto.id);
      }
      setFases(data);
      recalcularProgresoGeneralProyecto(data);
    } catch (err) {
      console.error("Error al cargar fases:", err);
    } finally {
      setCargando(false);
    }
  };

  const recalcularProgresoGeneralProyecto = async (listaFases) => {
    if (!listaFases || listaFases.length === 0) return;
    const sumaProgreso = listaFases.reduce((acc, f) => acc + (Number(f.progreso) || 0), 0);
    const promedio = Math.round(sumaProgreso / listaFases.length);

    // Evitar escrituras innecesarias en Firestore y prevenir bucles de actualización de componente
    if (promedio === Number(proyecto?.porcentajeAvance || 0)) return;

    try {
      const nuevoEstado = promedio >= 100 ? 'Finalizado' : undefined;
      await actualizarAvanceProyecto(proyecto.id, promedio, nuevoEstado);
    } catch (err) {
      console.warn("Error al auto-actualizar avance general desde Gantt:", err);
    }
  };

  const handleCambiarProgresoFase = async (faseId, nuevoProgreso) => {
    const prog = Math.min(100, Math.max(0, Number(nuevoProgreso) || 0));
    const nuevoEstado = prog >= 100 ? 'Completado' : prog > 0 ? 'En Proceso' : 'Pendiente';

    try {
      await actualizarFaseProyecto(faseId, { progreso: prog, estado: nuevoEstado });
      const listaActualizada = fases.map(f => f.id === faseId ? { ...f, progreso: prog, estado: nuevoEstado } : f);
      setFases(listaActualizada);
      recalcularProgresoGeneralProyecto(listaActualizada);
    } catch (err) {
      console.error("Error al cambiar progreso de fase:", err);
    }
  };

  const handleCambiarEstadoFase = async (faseId, nuevoEstado) => {
    const prog = nuevoEstado === 'Completado' ? 100 : nuevoEstado === 'Pendiente' ? 0 : 50;
    try {
      await actualizarFaseProyecto(faseId, { estado: nuevoEstado, progreso: prog });
      const listaActualizada = fases.map(f => f.id === faseId ? { ...f, estado: nuevoEstado, progreso: prog } : f);
      setFases(listaActualizada);
      recalcularProgresoGeneralProyecto(listaActualizada);
    } catch (err) {
      console.error("Error al cambiar estado de fase:", err);
    }
  };

  const handleCrearFase = async (e) => {
    e.preventDefault();
    if (!nombreFase.trim()) return;

    try {
      const nueva = await guardarFaseProyecto({
        proyectoId: proyecto.id,
        nombreFase,
        fechaInicioPlan,
        fechaFinPlan,
        color: colorFase,
        progreso: 0,
        estado: 'Pendiente'
      });

      const listaActualizada = [...fases, nueva];
      setFases(listaActualizada);
      setNombreFase('');
      setModalNuevaFase(false);
      recalcularProgresoGeneralProyecto(listaActualizada);
    } catch (err) {
      console.error("Error al crear fase:", err);
    }
  };

  const handleEliminarFase = async (faseId) => {
    if (!window.confirm("¿Estás seguro de eliminar esta etapa del cronograma?")) return;
    try {
      await eliminarFaseProyecto(faseId);
      const listaActualizada = fases.filter(f => f.id !== faseId);
      setFases(listaActualizada);
      recalcularProgresoGeneralProyecto(listaActualizada);
    } catch (err) {
      console.error("Error al eliminar fase:", err);
    }
  };

  // Calcular fechas mínima y máxima para la escala del diagrama Gantt
  let fechaMinima = new Date();
  let fechaMaxima = new Date();
  if (fases.length > 0) {
    const inicios = fases.map(f => new Date(f.fechaInicioPlan || Date.now()).getTime());
    const fines = fases.map(f => new Date(f.fechaFinPlan || Date.now()).getTime());
    fechaMinima = new Date(Math.min(...inicios));
    fechaMaxima = new Date(Math.max(...fines));
  }
  const diasTotalesProyecto = Math.max(1, Math.ceil((fechaMaxima - fechaMinima) / (1000 * 60 * 60 * 24)));

  return (
    <ModalForm
      abierto={true}
      titulo={`📅 Cronograma y Diagrama Gantt — ${proyecto?.nombre || 'Proyecto'}`}
      onClose={onClose}
      maxWidth="960px"
      cerrarEnOverlay={false}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

        {/* Resumen del Cronograma */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          padding: '12px 16px',
          background: 'rgba(15, 23, 42, 0.6)',
          borderRadius: '12px',
          border: '1px solid rgba(255,255,255,0.08)'
        }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Layers size={16} color="#38bdf8" /> 
              <span>Obra: {proyecto?.nombre}</span>
              <span className="badge badge-info" style={{ fontSize: '0.75rem' }}>
                {fases.length} Etapas
              </span>
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Duración estimada: <strong>{diasTotalesProyecto} días calendario</strong> ({fechaMinima.toISOString().split('T')[0]} al {fechaMaxima.toISOString().split('T')[0]})
            </div>
          </div>

          <button
            onClick={() => setModalNuevaFase(!modalNuevaFase)}
            className="btn btn-primary"
            style={{ fontSize: '0.8rem', padding: '6px 12px', gap: '6px', background: '#38bdf8', borderColor: '#0284c7', color: '#0f172a', fontWeight: 700 }}
          >
            <PlusCircle size={15} /> + Añadir Etapa
          </button>
        </div>

        {/* Formulario Nueva Fase Inline */}
        {modalNuevaFase && (
          <form onSubmit={handleCrearFase} style={{ background: 'rgba(56, 189, 248, 0.08)', padding: '14px', borderRadius: '10px', border: '1px solid rgba(56, 189, 248, 0.3)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#e0f2fe' }}>Añadir Nueva Fase al Cronograma:</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
              <div>
                <label className="input-label" style={{ fontSize: '0.75rem' }}>Nombre de la Fase:</label>
                <input
                  type="text"
                  placeholder="Ej. Colocación de Herrajes"
                  value={nombreFase}
                  onChange={(e) => setNombreFase(e.target.value)}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="input-label" style={{ fontSize: '0.75rem' }}>Inicio Estimado:</label>
                <input
                  type="date"
                  value={fechaInicioPlan}
                  onChange={(e) => setFechaInicioPlan(e.target.value)}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="input-label" style={{ fontSize: '0.75rem' }}>Fin Estimado:</label>
                <input
                  type="date"
                  value={fechaFinPlan}
                  onChange={(e) => setFechaFinPlan(e.target.value)}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="input-label" style={{ fontSize: '0.75rem' }}>Color Identificador:</label>
                <input
                  type="color"
                  value={colorFase}
                  onChange={(e) => setColorFase(e.target.value)}
                  style={{ width: '100%', height: '38px', borderRadius: '6px', cursor: 'pointer', border: 'none', background: 'transparent' }}
                />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button type="button" onClick={() => setModalNuevaFase(false)} className="btn btn-secondary" style={{ fontSize: '0.78rem', padding: '4px 10px' }}>Cancelar</button>
              <button type="submit" className="btn btn-primary" style={{ fontSize: '0.78rem', padding: '4px 12px' }}>Guardar Fase</button>
            </div>
          </form>
        )}

        {/* LISTADO DE FASES CON DIAGRAMA GANTT INTERACTIVO */}
        {cargando ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Cargando cronograma...</div>
        ) : fases.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
            No hay etapas en el cronograma. Haz clic en <strong>+ Añadir Etapa</strong>.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            
            {/* Header del Diagrama Gantt */}
            <div style={{ display: 'flex', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '6px' }}>
              <div style={{ flex: '0 0 240px' }}>ETAPA / FASE</div>
              <div style={{ flex: '0 0 130px' }}>ESTADO / AVANCE</div>
              <div style={{ flex: 1, paddingLeft: '10px' }}>DIAGRAMA DE BARRAS GANTT ({diasTotalesProyecto} DÍAS)</div>
            </div>

            {/* Fases del Cronograma */}
            {fases.map((fase) => {
              const inicioMs = new Date(fase.fechaInicioPlan || Date.now()).getTime();
              const finMs = new Date(fase.fechaFinPlan || Date.now()).getTime();
              
              // Calcular posición y ancho en % respecto a la escala de fechas del proyecto
              const offsetDias = Math.max(0, (inicioMs - fechaMinima.getTime()) / (1000 * 60 * 60 * 24));
              const duracionDias = Math.max(1, Math.ceil((finMs - inicioMs) / (1000 * 60 * 60 * 24)));

              const leftPercent = Math.min(95, Math.max(0, (offsetDias / diasTotalesProyecto) * 100));
              const widthPercent = Math.min(100 - leftPercent, Math.max(5, (duracionDias / diasTotalesProyecto) * 100));

              return (
                <div key={fase.id} className="card" style={{ padding: '10px 12px', background: 'rgba(15, 23, 42, 0.4)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    
                    {/* Columna 1: Nombre e Info de Fase */}
                    <div style={{ flex: '0 0 240px' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#e0f2fe', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: fase.color || '#38bdf8', display: 'inline-block' }} />
                        {fase.nombreFase}
                      </div>
                      <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        📅 {fase.fechaInicioPlan} ➔ {fase.fechaFinPlan} ({duracionDias}d)
                      </div>
                    </div>

                    {/* Columna 2: Estado y Slider de Avance */}
                    <div style={{ flex: '0 0 130px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <select
                        value={fase.estado || 'Pendiente'}
                        onChange={(e) => handleCambiarEstadoFase(fase.id, e.target.value)}
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          padding: '2px 6px',
                          borderRadius: '6px',
                          background: fase.estado === 'Completado' ? 'rgba(34,197,94,0.2)' : fase.estado === 'En Proceso' ? 'rgba(56,189,248,0.2)' : 'rgba(255,255,255,0.08)',
                          color: fase.estado === 'Completado' ? '#4ade80' : fase.estado === 'En Proceso' ? '#38bdf8' : '#94a3b8',
                          border: 'none',
                          cursor: 'pointer'
                        }}
                      >
                        <option value="Pendiente" style={{ background: '#0f172a', color: '#94a3b8' }}>Pendiente</option>
                        <option value="En Proceso" style={{ background: '#0f172a', color: '#38bdf8' }}>En Proceso</option>
                        <option value="Completado" style={{ background: '#0f172a', color: '#4ade80' }}>Completado ✓</option>
                      </select>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          step="10"
                          value={fase.progreso || 0}
                          onChange={(e) => handleCambiarProgresoFase(fase.id, e.target.value)}
                          style={{ flex: 1, cursor: 'pointer', height: '4px', accentColor: fase.color || '#38bdf8' }}
                        />
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-main)', minWidth: '28px' }}>
                          {fase.progreso || 0}%
                        </span>
                      </div>
                    </div>

                    {/* Columna 3: Barra Visual Gantt */}
                    <div style={{ flex: 1, minWidth: '180px', position: 'relative', height: '28px', background: 'rgba(255,255,255,0.03)', borderRadius: '6px', overflow: 'hidden', padding: '2px' }}>
                      <div
                        style={{
                          position: 'absolute',
                          left: `${leftPercent}%`,
                          width: `${widthPercent}%`,
                          height: '24px',
                          background: fase.color || '#38bdf8',
                          borderRadius: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '0 8px',
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          color: '#0f172a',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                          transition: 'all 0.3s ease'
                        }}
                        title={`${fase.nombreFase}: ${fase.progreso || 0}% (${duracionDias} días)`}
                      >
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{fase.nombreFase}</span>
                        <span>{fase.progreso || 0}%</span>
                      </div>
                    </div>

                    {/* Eliminar Fase */}
                    <button
                      onClick={() => handleEliminarFase(fase.id)}
                      className="btn btn-danger"
                      style={{ padding: '2px 6px', height: '28px', width: '28px' }}
                      title="Eliminar fase"
                    >
                      <Trash2 size={13} />
                    </button>

                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </ModalForm>
  );
}
