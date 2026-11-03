import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Sun, 
  CloudRain, 
  CloudLightning, 
  CloudSun, 
  Users, 
  CheckSquare, 
  AlertTriangle, 
  Camera, 
  Trash2, 
  PlusCircle, 
  Clock, 
  UserCheck, 
  FileText,
  X,
  Maximize2
} from 'lucide-react';
import ModalForm from '../ModalForm.jsx';
import { 
  obtenerBitacorasProyecto, 
  guardarEntradaBitacora, 
  eliminarEntradaBitacora 
} from '../../services/bitacoraObraService.js';
import { comprimirImagenParaThumbnail } from '../../services/fotosService.js';

// ============================================================
// BLOQUE 1: COMPONENTE MODAL DE BITÁCORA DIARIA DE OBRA
// Qué hace: Permite registrar y consultar la bitácora de campo por día
// Por qué: Cumple RT-01, RT-02, RT-04 y requerimiento del Fundador.
// ============================================================
export default function ModalBitacoraDiaria({ proyecto, onClose }) {
  const [bitacoras, setBitacoras] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [tabActiva, setTabActiva] = useState('historial'); // 'historial' | 'nuevo'

  // Formulario de Nuevo Reporte Diario
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [clima, setClima] = useState('Soleado');
  const [maestros, setMaestros] = useState(1);
  const [oficiales, setOficiales] = useState(1);
  const [ayudantes, setAyudantes] = useState(2);
  const [actividades, setActividades] = useState('');
  const [bloqueos, setBloqueos] = useState('');
  const [fotosSeleccionadas, setFotosSeleccionadas] = useState([]);
  const [fotoEnZoom, setFotoEnZoom] = useState(null);

  useEffect(() => {
    if (proyecto?.id) {
      cargarBitacoras();
    }
  }, [proyecto?.id]);

  const cargarBitacoras = async () => {
    setCargando(true);
    try {
      const data = await obtenerBitacorasProyecto(proyecto.id);
      setBitacoras(data);
    } catch (err) {
      console.error("Error al cargar bitácora diaria:", err);
    } finally {
      setCargando(false);
    }
  };

  const handleSeleccionarFotos = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const fotosProcesadas = [];
    for (const file of files) {
      const dataUrl = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });

      // Comprimir para thumbnail de Firestore y almacenamiento ágil
      const fotoComprimida = await comprimirImagenParaThumbnail(dataUrl, 1000, 0.7);
      fotosProcesadas.push(fotoComprimida);
    }

    setFotosSeleccionadas(prev => [...prev, ...fotosProcesadas]);
  };

  const handleRemoverFotoForm = (index) => {
    setFotosSeleccionadas(prev => prev.filter((_, i) => i !== index));
  };

  const handleGuardarReporte = async (e) => {
    e.preventDefault();
    if (!actividades.trim()) {
      alert("⚠️ Por favor describe las actividades y avances realizados durante el día.");
      return;
    }

    setGuardando(true);
    try {
      await guardarEntradaBitacora({
        proyectoId: proyecto.id,
        codigoProyecto: proyecto.codigoObra || proyecto.codigoCotizacion || '',
        nombreProyecto: proyecto.nombre || '',
        fecha,
        clima,
        asistencia: {
          maestros: Number(maestros) || 0,
          oficiales: Number(oficiales) || 0,
          ayudantes: Number(ayudantes) || 0
        },
        actividades,
        bloqueos,
        fotosEvidencia: fotosSeleccionadas,
        registradoPor: 'Encargado de Obra'
      });

      // Limpiar formulario y recargar
      setActividades('');
      setBloqueos('');
      setFotosSeleccionadas([]);
      setTabActiva('historial');
      await cargarBitacoras();
    } catch (err) {
      console.error("Error al guardar reporte de bitácora:", err);
      alert("Ocurrió un inconveniente al guardar la bitácora. Revisa tu conexión.");
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminarReporte = async (bitacoraId, fechaReporte) => {
    if (!window.confirm(`¿Estás seguro de eliminar el reporte del ${fechaReporte}?`)) return;

    try {
      await eliminarEntradaBitacora(bitacoraId);
      setBitacoras(prev => prev.filter(b => b.id !== bitacoraId));
    } catch (err) {
      console.error("Error al eliminar entrada de bitácora:", err);
    }
  };

  const getClimaIcon = (climaNombre) => {
    switch (climaNombre) {
      case 'Lluvia': return <CloudRain size={16} color="#38bdf8" />;
      case 'Tormenta': return <CloudLightning size={16} color="#c084fc" />;
      case 'Nublado': return <CloudSun size={16} color="#94a3b8" />;
      default: return <Sun size={16} color="#fbbf24" />;
    }
  };

  const totalTrabajadoresForm = (Number(maestros) || 0) + (Number(oficiales) || 0) + (Number(ayudantes) || 0);

  return (
    <ModalForm
      abierto={true}
      titulo={`📝 Bitácora Diaria de Obra — ${proyecto?.nombre || 'Proyecto'}`}
      onClose={onClose}
      maxWidth="920px"
      cerrarEnOverlay={false}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

        {/* Encabezado y Navegación de Pestañas */}
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
              <span>Obra: {proyecto?.nombre}</span>
              <span className="badge badge-info" style={{ fontSize: '0.75rem' }}>
                {proyecto?.codigoObra || proyecto?.codigoCotizacion || 'N/A'}
              </span>
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Registros históricos: <strong>{bitacoras.length} entradas en bitácora</strong>
            </div>
          </div>

          {/* Botones Pestaña: Historial / Nuevo Reporte */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setTabActiva('historial')}
              className={`btn ${tabActiva === 'historial' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.8rem', padding: '6px 12px', gap: '6px' }}
            >
              <FileText size={15} /> Ver Bitácoras ({bitacoras.length})
            </button>
            <button
              onClick={() => setTabActiva('nuevo')}
              className={`btn ${tabActiva === 'nuevo' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.8rem', padding: '6px 12px', gap: '6px', background: tabActiva === 'nuevo' ? '#16a34a' : undefined, borderColor: tabActiva === 'nuevo' ? '#15803d' : undefined }}
            >
              <PlusCircle size={15} /> + Nuevo Reporte Diario
            </button>
          </div>
        </div>

        {/* CONTENIDO 1: FORMULARIO DE NUEVO REPORTE DIARIO */}
        {tabActiva === 'nuevo' && (
          <form onSubmit={handleGuardarReporte} style={{ display: 'flex', flexDirection: 'column', gap: '16px', background: 'rgba(15, 23, 42, 0.4)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <PlusCircle size={18} /> Registrar Jornada Diaria de Campo
            </h3>

            <div className="grid-form" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
              {/* Fecha */}
              <div>
                <label className="input-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                  <Calendar size={14} color="#38bdf8" /> Fecha del Reporte:
                </label>
                <input
                  type="date"
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                  className="input-field"
                  required
                />
              </div>

              {/* Clima del Día */}
              <div>
                <label className="input-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                  ⛅ Clima Predominante:
                </label>
                <select
                  value={clima}
                  onChange={(e) => setClima(e.target.value)}
                  className="input-field"
                >
                  <option value="Soleado">☀️ Soleado / Despejado</option>
                  <option value="Nublado">⛅ Nublado</option>
                  <option value="Lluvia">🌧️ Lluvia Ligera / Intermitente</option>
                  <option value="Tormenta">🌩️ Lluvia Fuerte / Tormenta</option>
                </select>
              </div>
            </div>

            {/* Asistencia de Personal */}
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, marginBottom: '10px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Users size={16} color="#34d399" /> Asistencia de Personal en Obra:
                </span>
                <span className="badge badge-success">Total: {totalTrabajadoresForm} trabajadores</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' }}>
                <div>
                  <label className="input-label" style={{ fontSize: '0.75rem' }}>Maestros:</label>
                  <input
                    type="number"
                    min="0"
                    value={maestros}
                    onChange={(e) => setMaestros(e.target.value)}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="input-label" style={{ fontSize: '0.75rem' }}>Oficiales:</label>
                  <input
                    type="number"
                    min="0"
                    value={oficiales}
                    onChange={(e) => setOficiales(e.target.value)}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="input-label" style={{ fontSize: '0.75rem' }}>Ayudantes:</label>
                  <input
                    type="number"
                    min="0"
                    value={ayudantes}
                    onChange={(e) => setAyudantes(e.target.value)}
                    className="input-field"
                  />
                </div>
              </div>
            </div>

            {/* Actividades y Avances del Día */}
            <div>
              <label className="input-label" style={{ fontSize: '0.82rem', fontWeight: 600 }}>
                🔨 Avances y Actividades Realizadas en la Jornada (Obligatorio):
              </label>
              <textarea
                rows="3"
                value={actividades}
                onChange={(e) => setActividades(e.target.value)}
                placeholder="Ejemplo: Se concluyó la instalación del armazón de closet en recámara principal. Aplicación de sellador y lijado..."
                className="input-field"
                required
                style={{ resize: 'vertical' }}
              />
            </div>

            {/* Imprevistos o Bloqueos */}
            <div>
              <label className="input-label" style={{ fontSize: '0.82rem', fontWeight: 600, color: '#fbbf24' }}>
                ⚠️ Imprevistos, Retrasos o Materiales Faltantes (Opcional):
              </label>
              <textarea
                rows="2"
                value={bloqueos}
                onChange={(e) => setBloqueos(e.target.value)}
                placeholder="Ejemplo: Faltan 2 bisagras de parche y tornillos 5/8. Se detuvo la lluvia a las 2 PM..."
                className="input-field"
                style={{ resize: 'vertical' }}
              />
            </div>

            {/* Fotos de Evidencia del Día */}
            <div>
              <label className="input-label" style={{ fontSize: '0.82rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Camera size={15} color="#fbbf24" /> Adjuntar Fotos de Evidencia del Día (Opcional):
              </label>
              
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                <label className="btn btn-secondary" style={{ cursor: 'pointer', fontSize: '0.8rem', padding: '6px 12px', gap: '6px', color: '#fbbf24', borderColor: 'rgba(251, 191, 36, 0.4)' }}>
                  <Camera size={16} /> Tomar / Elegir Fotos
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleSeleccionarFotos}
                    style={{ display: 'none' }}
                  />
                </label>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {fotosSeleccionadas.length} foto(s) adjunta(s)
                </span>
              </div>

              {/* Vista previa de fotos adjuntas al formulario */}
              {fotosSeleccionadas.length > 0 && (
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '10px' }}>
                  {fotosSeleccionadas.map((foto, idx) => (
                    <div key={idx} style={{ position: 'relative', width: '70px', height: '70px', borderRadius: '6px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.2)' }}>
                      <img src={foto} alt={`Adjunto ${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <button
                        type="button"
                        onClick={() => handleRemoverFotoForm(idx)}
                        style={{ position: 'absolute', top: '2px', right: '2px', background: 'rgba(239,68,68,0.9)', color: '#fff', border: 'none', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                        title="Eliminar foto"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Botones del Formulario */}
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '8px' }}>
              <button
                type="button"
                onClick={() => setTabActiva('historial')}
                className="btn btn-secondary"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={guardando}
                style={{ background: '#16a34a', borderColor: '#15803d' }}
              >
                {guardando ? 'Guardando Reporte...' : '💾 Guardar Reporte Diario'}
              </button>
            </div>
          </form>
        )}

        {/* CONTENIDO 2: HISTORIAL CRONOLÓGICO DE BITÁCORAS */}
        {tabActiva === 'historial' && (
          <div>
            {cargando ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                Cargando historial de bitácora...
              </div>
            ) : bitacoras.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                No hay reportes diarios en la bitácora aún. Haz clic en <strong>+ Nuevo Reporte Diario</strong> para registrar la jornada de hoy.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {bitacoras.map((item) => {
                  const totalPersonal = item.asistencia?.total || 
                    ((item.asistencia?.maestros || 0) + (item.asistencia?.oficiales || 0) + (item.asistencia?.ayudantes || 0));

                  return (
                    <div
                      key={item.id}
                      className="card"
                      style={{
                        padding: '14px 16px',
                        background: 'rgba(15, 23, 42, 0.45)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '10px'
                      }}
                    >
                      {/* Cabecera del Reporte Diario */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#e0f2fe', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Calendar size={16} color="#38bdf8" /> {item.fecha}
                          </span>

                          {/* Insignia Clima */}
                          <span className="badge badge-secondary" style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(255,255,255,0.08)' }}>
                            {getClimaIcon(item.clima)} {item.clima}
                          </span>

                          {/* Insignia Personal */}
                          <span className="badge badge-info" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Users size={13} /> {totalPersonal} Trabajadores ({item.asistencia?.maestros || 0}M / {item.asistencia?.oficiales || 0}O / {item.asistencia?.ayudantes || 0}A)
                          </span>
                        </div>

                        <button
                          onClick={() => handleEliminarReporte(item.id, item.fecha)}
                          className="btn btn-danger"
                          style={{ padding: '2px 6px', fontSize: '0.75rem', height: '26px' }}
                          title="Eliminar reporte"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>

                      {/* Avances del Día */}
                      <div style={{ fontSize: '0.88rem', color: 'var(--text-main)', marginBottom: '8px', whiteSpace: 'pre-line' }}>
                        <strong>🔨 Avances:</strong> {item.actividades}
                      </div>

                      {/* Imprevistos / Bloqueos */}
                      {item.bloqueos && (
                        <div style={{ fontSize: '0.83rem', color: '#fef08a', background: 'rgba(251,191,36,0.1)', padding: '6px 10px', borderRadius: '6px', border: '1px solid rgba(251,191,36,0.2)', marginBottom: '8px' }}>
                          <strong>⚠️ Observaciones / Bloqueos:</strong> {item.bloqueos}
                        </div>
                      )}

                      {/* Fotos de Evidencia */}
                      {item.fotosEvidencia && item.fotosEvidencia.length > 0 && (
                        <div style={{ marginTop: '8px' }}>
                          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
                            📸 Evidencias ({item.fotosEvidencia.length}):
                          </div>
                          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            {item.fotosEvidencia.map((imgSrc, imgIdx) => (
                              <div
                                key={imgIdx}
                                onClick={() => setFotoEnZoom(imgSrc)}
                                style={{ position: 'relative', width: '60px', height: '60px', borderRadius: '6px', overflow: 'hidden', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.2)' }}
                                title="Hacer clic para ampliar foto"
                              >
                                <img src={imgSrc} alt={`Evidencia ${imgIdx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                <div style={{ position: 'absolute', bottom: '2px', right: '2px', background: 'rgba(0,0,0,0.6)', borderRadius: '2px', padding: '1px' }}>
                                  <Maximize2 size={10} color="#fff" />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textAlign: 'right', marginTop: '6px' }}>
                        Reportado por: <strong>{item.registradoPor || 'Encargado de Obra'}</strong>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* MODAL ZOOM DE FOTO EN PANTALLA COMPLETA */}
      {fotoEnZoom && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0, 0, 0, 0.88)',
          zIndex: 99999,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '20px'
        }} onClick={() => setFotoEnZoom(null)}>
          <div style={{ position: 'relative', maxWidth: '90%', maxHeight: '90%' }}>
            <img src={fotoEnZoom} alt="Zoom HD" style={{ maxWidth: '100%', maxHeight: '85vh', borderRadius: '8px', objectFit: 'contain' }} />
            <button
              onClick={() => setFotoEnZoom(null)}
              style={{ position: 'absolute', top: '-15px', right: '-15px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}
    </ModalForm>
  );
}
