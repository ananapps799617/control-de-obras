import React, { useState, useEffect } from 'react';
import { 
  Share2, 
  Copy, 
  Check, 
  ExternalLink, 
  Camera, 
  FileText, 
  CheckCircle2, 
  Activity, 
  Sparkles, 
  ShieldCheck, 
  Building, 
  PhoneCall 
} from 'lucide-react';
import ModalForm from '../ModalForm.jsx';
import { obtenerFotosProyecto } from '../../services/fotosService.js';
import { obtenerBitacorasProyecto } from '../../services/bitacoraObraService.js';

// ============================================================
// BLOQUE 1: COMPONENTE PORTAL TRANSPARENTE DEL CLIENTE
// Qué hace: Genera enlace público y vista previa exclusiva de lectura
//          para que el cliente monitoree su obra y apruebe adicionales.
// Por qué: Cumple RT-01, RT-02 y requerimiento del Fundador para clientes.
// ============================================================
export default function ModalPortalCliente({ proyecto, cliente, onClose }) {
  const [fotos, setFotos] = useState([]);
  const [bitacoras, setBitacoras] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [copiado, setCopiado] = useState(false);
  const [tabCliente, setTabCliente] = useState('fotos'); // 'fotos' | 'bitacora'

  const urlPortal = `${window.location.origin}/?portalCliente=${proyecto?.id || 'demo'}`;

  useEffect(() => {
    if (proyecto?.id) {
      cargarDatosCliente();
    }
  }, [proyecto?.id]);

  const cargarDatosCliente = async () => {
    setCargando(true);
    try {
      const [fotosData, bitacorasData] = await Promise.all([
        obtenerFotosProyecto(proyecto.id),
        obtenerBitacorasProyecto(proyecto.id)
      ]);
      setFotos(fotosData);
      setBitacoras(bitacorasData);
    } catch (err) {
      console.error("Error al cargar datos del portal de cliente:", err);
    } finally {
      setCargando(false);
    }
  };

  const handleCopiarEnlace = () => {
    navigator.clipboard.writeText(urlPortal);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2500);
  };

  const porcentaje = proyecto?.porcentajeAvance || (proyecto?.estado === 'Finalizado' ? 100 : 0);

  return (
    <ModalForm
      abierto={true}
      titulo={`👁️ Portal del Cliente — ${proyecto?.nombre || 'Proyecto'}`}
      onClose={onClose}
      maxWidth="940px"
      cerrarEnOverlay={false}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

        {/* CADASTRACIÓN / ENLACE COMPARTIBLE */}
        <div style={{
          padding: '14px 18px',
          background: 'rgba(56, 189, 248, 0.08)',
          border: '1px solid rgba(56, 189, 248, 0.3)',
          borderRadius: '12px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#e0f2fe', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Share2 size={16} color="#38bdf8" /> Enlace de Consulta Exclusiva para el Cliente
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Este enlace permite a tu cliente seguir el porcentaje de avance, ver fotos y avances en modo lectura segura sin acceso a costos internos.
            </div>
          </div>

          <button
            onClick={handleCopiarEnlace}
            className="btn btn-primary"
            style={{ fontSize: '0.82rem', padding: '8px 14px', gap: '6px', background: copiado ? '#16a34a' : '#0284c7', borderColor: copiado ? '#15803d' : '#0369a1' }}
          >
            {copiado ? <Check size={16} /> : <Copy size={16} />}
            {copiado ? '¡Enlace Copiado!' : 'Copiar Enlace Cliente'}
          </button>
        </div>

        {/* VISTA PREVIA DEL PORTAL CLIENTE */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.7)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '14px',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}>
          {/* Header del Cliente */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            paddingBottom: '14px'
          }}>
            <div>
              <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', tracking: '1px', color: '#38bdf8', fontWeight: 700 }}>
                🏢 Control de Obras — Portal de Transparencia
              </div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, margin: '4px 0 0 0', color: 'var(--text-main)' }}>
                {proyecto?.nombre}
              </h2>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Cliente: <strong>{cliente?.nombre || 'Cliente Estimado'}</strong> | Código Obra: <code>{proyecto?.codigoObra || proyecto?.codigoCotizacion}</code>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Estado Actual:</div>
              <span className="badge badge-success" style={{ fontSize: '0.85rem', padding: '4px 10px' }}>
                {proyecto?.estado || 'En Proceso'}
              </span>
            </div>
          </div>

          {/* Porcentaje de Avance General */}
          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Activity size={16} color="#34d399" /> Progreso General de Construcción / Fabricación:
              </span>
              <span style={{ fontSize: '1.1rem', fontWeight: 800, color: porcentaje >= 100 ? '#22c55e' : '#38bdf8' }}>
                {porcentaje}%
              </span>
            </div>
            <div style={{ width: '100%', height: '10px', background: 'rgba(255,255,255,0.08)', borderRadius: '5px', overflow: 'hidden' }}>
              <div style={{ width: `${porcentaje}%`, height: '100%', background: porcentaje >= 100 ? '#22c55e' : '#38bdf8', borderRadius: '5px', transition: 'width 0.5s ease-in-out' }} />
            </div>
          </div>

          {/* Navegación por pestañas del Cliente: Fotos de Obra / Bitácora de Avances */}
          <div style={{ display: 'flex', gap: '10px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '10px' }}>
            <button
              onClick={() => setTabCliente('fotos')}
              className={`btn ${tabCliente === 'fotos' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.82rem', padding: '6px 14px', gap: '6px' }}
            >
              <Camera size={16} /> Galería de Fotos por Etapa ({fotos.length})
            </button>
            <button
              onClick={() => setTabCliente('bitacora')}
              className={`btn ${tabCliente === 'bitacora' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.82rem', padding: '6px 14px', gap: '6px' }}
            >
              <FileText size={16} /> Bitácora de Avances ({bitacoras.length})
            </button>
          </div>

          {/* CONTENIDO FOTOS PÚBLICAS */}
          {tabCliente === 'fotos' && (
            <div>
              {cargando ? (
                <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>Cargando fotos del proyecto...</div>
              ) : fotos.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>No hay fotos publicadas en esta obra aún.</div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px' }}>
                  {fotos.map(f => (
                    <div key={f.id} style={{ background: 'rgba(15, 23, 42, 0.6)', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)' }}>
                      <div style={{ height: '130px', width: '100%', overflow: 'hidden' }}>
                        <img src={f.previewUrl} alt={f.nombreArchivo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                      <div style={{ padding: '8px 10px' }}>
                        <span className="badge badge-info" style={{ fontSize: '0.7rem' }}>{f.etapaEtiqueta || f.etapa}</span>
                        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-main)', marginTop: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {f.nombreArchivo}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* CONTENIDO BITÁCORAS PÚBLICAS */}
          {tabCliente === 'bitacora' && (
            <div>
              {cargando ? (
                <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>Cargando bitácora de avances...</div>
              ) : bitacoras.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>No hay reportes de bitácora publicados aún.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {bitacoras.map(b => (
                    <div key={b.id} style={{ background: 'rgba(15, 23, 42, 0.5)', padding: '12px 14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#38bdf8' }}>📅 Reporte del {b.fecha}</span>
                        <span className="badge badge-secondary" style={{ fontSize: '0.72rem' }}>Clima: {b.clima}</span>
                      </div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-main)', whiteSpace: 'pre-line' }}>
                        {b.actividades}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </ModalForm>
  );
}
