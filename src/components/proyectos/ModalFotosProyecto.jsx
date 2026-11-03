// ============================================================
// BLOQUE 1: MODAL DE FOTOS DE OBRA POR PROYECTO
// Qué hace: Carga, gestiona y visualiza fotos clasificadas en 3 etapas
//          (Antes, Durante/Proceso, Terminado) con nomenclatura automática
//          [nombre-proyecto]-[etapa]-[numero].jpg y subida a Google Drive.
// Por qué: Cumple con la solicitud de trazabilidad fotográfica del Fundador.
// ============================================================

import React, { useState, useEffect } from 'react';
import ModalForm from '../ModalForm';
import {
  Camera,
  Upload,
  Image as ImageIcon,
  Trash2,
  ExternalLink,
  ZoomIn,
  CheckCircle2,
  Clock,
  Sparkles,
  Loader2,
  FolderOpen,
  Filter,
  X
} from 'lucide-react';
import {
  obtenerFotosProyecto,
  obtenerSiguienteSecuenciaEtapa,
  generarNombreArchivoFoto,
  guardarFotoProyecto,
  eliminarFotoProyecto,
  comprimirImagenParaThumbnail
} from '../../services/fotosService';
import { subirFotoProyectoDrive } from '../../services/driveService';

export default function ModalFotosProyecto({ proyecto, onClose }) {
  const [fotos, setFotos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [subiendo, setSubiendo] = useState(false);
  const [filtroEtapa, setFiltroEtapa] = useState('todas'); // 'todas' | 'antes' | 'proceso' | 'terminado'

  // Estado del formulario de subida
  const [etapaSeleccionada, setEtapaSeleccionada] = useState('antes'); // 'antes' | 'proceso' | 'terminado'
  const [archivosSeleccionados, setArchivosSeleccionados] = useState([]);
  const [previsualizaciones, setPrevisualizaciones] = useState([]);

  // Estado del modal de imagen en pantalla completa (Zoom HD)
  const [fotoZoom, setFotoZoom] = useState(null);

  // Cargar fotos desde Firestore al abrir
  useEffect(() => {
    if (proyecto?.id) {
      cargarFotos();
    }
  }, [proyecto?.id]);

  const cargarFotos = async () => {
    setCargando(true);
    try {
      const data = await obtenerFotosProyecto(proyecto.id);
      setFotos(data);
    } catch (err) {
      console.error("Error al cargar fotos del proyecto:", err);
    } finally {
      setCargando(false);
    }
  };

  // Manejar selección de archivos desde la galería o cámara
  const handleSeleccionarArchivos = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Calcular la secuencia inicial para la etapa seleccionada
    const secInicial = await obtenerSiguienteSecuenciaEtapa(proyecto.id, etapaSeleccionada);
    const nombreBaseProyecto = proyecto.nombre || proyecto.codigoCotizacion || 'proyecto';

    const nuevosPreviews = [];
    const nuevosArchivos = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const numeroSecuencia = secInicial + i;

      // Obtener extensión real del archivo (ej: jpg, png, webp)
      const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
      const nombreCalculado = generarNombreArchivoFoto({
        nombreProyecto: nombreBaseProyecto,
        etapa: etapaSeleccionada,
        numero: numeroSecuencia,
        extension: ext
      });

      // Convertir archivo a DataURL (Base64) para vista previa instantánea y subida
      const previewDataUrl = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });

      nuevosArchivos.push({
        file,
        nombreCalculado,
        secuencia: numeroSecuencia,
        dataUrl: previewDataUrl,
        mimeType: file.type || 'image/jpeg'
      });

      nuevosPreviews.push({
        nombreCalculado,
        dataUrl: previewDataUrl
      });
    }

    setArchivosSeleccionados(nuevosArchivos);
    setPrevisualizaciones(nuevosPreviews);
  };

  // Subir archivos seleccionados a Google Drive y guardar en Firestore
  const handleSubirFotos = async () => {
    if (archivosSeleccionados.length === 0) return;

    setSubiendo(true);
    try {
      const driveFolderId = proyecto.driveFolderId || proyecto.driveFolderIdCliente || null;

      for (const item of archivosSeleccionados) {
        // Redimensionar imagen para optimizar ancho de banda móvil a max 1400px, 0.75 calidad
        const fotoOptimizada = await comprimirImagenParaThumbnail(item.dataUrl, 1400, 0.75);

        // 1. Subir foto a Google Drive (subcarpeta 'Fotos del proyecto')
        const driveRes = await subirFotoProyectoDrive({
          projectDriveFolderId: driveFolderId,
          nombreArchivo: item.nombreCalculado,
          base64Data: fotoOptimizada,
          mimeType: 'image/jpeg'
        });

        // Mapear etiqueta legible
        let etapaEtiqueta = 'Antes';
        if (etapaSeleccionada === 'proceso') etapaEtiqueta = 'Durante / Proceso';
        if (etapaSeleccionada === 'terminado') etapaEtiqueta = 'Terminado';

        // 2. Guardar registro en Firestore (proyectos_fotos)
        await guardarFotoProyecto({
          proyectoId: proyecto.id,
          codigoProyecto: proyecto.codigoCotizacion || '',
          nombreProyecto: proyecto.nombre || '',
          nombreArchivo: item.nombreCalculado,
          etapa: etapaSeleccionada,
          etapaEtiqueta,
          secuencia: item.secuencia,
          previewUrl: fotoOptimizada, // Se comprime automáticamente en guardarFotoProyecto
          driveUrl: driveRes?.webViewLink || '',
          driveFileId: driveRes?.fileId || '',
          fechaSubida: new Date().toISOString()
        });
      }

      // Limpiar selección de formulario y recargar fotos
      setArchivosSeleccionados([]);
      setPrevisualizaciones([]);
      await cargarFotos();
    } catch (err) {
      console.error("Error al subir fotos:", err);
      alert(`⚠️ Error al guardar la foto: ${err.message || 'Verifica tu conexión'}`);
    } finally {
      setSubiendo(false);
    }
  };

  // Eliminar foto
  const handleEliminarFoto = async (foto) => {
    if (!window.confirm(`¿Estás seguro de eliminar la foto "${foto.nombreArchivo}"?`)) return;

    try {
      await eliminarFotoProyecto(foto.id);
      setFotos(prev => prev.filter(f => f.id !== foto.id));
    } catch (err) {
      console.error("Error al eliminar foto:", err);
      alert("No se pudo eliminar la foto seleccionada.");
    }
  };

  // Filtrado de fotos
  const fotosFiltradas = fotos.filter(f => {
    if (filtroEtapa === 'todas') return true;
    return (f.etapa || '').toLowerCase() === filtroEtapa;
  });

  // Conteo por etapa
  const cantTodas = fotos.length;
  const cantAntes = fotos.filter(f => f.etapa === 'antes').length;
  const cantProceso = fotos.filter(f => f.etapa === 'proceso').length;
  const cantTerminado = fotos.filter(f => f.etapa === 'terminado').length;

  return (
    <ModalForm
      abierto={true}
      titulo={`📸 Fotos de Obra — ${proyecto.nombre || 'Proyecto'}`}
      onClose={onClose}
      maxWidth="940px"
      cerrarEnOverlay={false}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

        {/* ENCABEZADO E INFORMACIÓN DE LA CARPETA EN DRIVE */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          padding: '14px 18px',
          background: 'rgba(56, 189, 248, 0.08)',
          border: '1px solid rgba(56, 189, 248, 0.25)',
          borderRadius: '12px'
        }}>
          <div>
            <div style={{ fontWeight: '700', fontSize: '15px', color: '#e0f2fe', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>🏗️</span> Obra: {proyecto.nombre} ({proyecto.codigoCotizacion || 'Sin Código'})
            </div>
            <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '3px' }}>
              Las fotos se suben con nomenclatura automática a la subcarpeta <strong>"Fotos del proyecto"</strong> en Google Drive.
            </div>
          </div>

          {proyecto.driveFolderId && (
            <a
              href={`https://drive.google.com/drive/folders/${proyecto.driveFolderId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary"
              style={{ padding: '7px 14px', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <FolderOpen size={16} color="#38bdf8" />
              <span>Ver Folder en Drive</span>
              <ExternalLink size={14} />
            </a>
          )}
        </div>

        {/* PANEL DE SUBCIRDA DE NUEVAS FOTOS */}
        <div style={{
          padding: '18px',
          background: 'rgba(15, 23, 42, 0.65)',
          border: '1px dashed rgba(148, 163, 184, 0.3)',
          borderRadius: '12px'
        }}>
          <div style={{ fontSize: '14px', fontWeight: '700', color: '#f8fafc', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Upload size={18} color="#38bdf8" />
            <span>Subir Nuevas Fotos a la Obra</span>
          </div>

          {/* Selector de Etapa */}
          <div style={{ marginBottom: '14px' }}>
            <label style={{ fontSize: '12px', color: '#cbd5e1', fontWeight: '600', display: 'block', marginBottom: '6px' }}>
              1. Selecciona la Etapa de la Foto:
            </label>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => setEtapaSeleccionada('antes')}
                style={{
                  flex: '1',
                  minWidth: '130px',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: etapaSeleccionada === 'antes' ? '2px solid #0284c7' : '1px solid rgba(255,255,255,0.1)',
                  background: etapaSeleccionada === 'antes' ? 'rgba(2, 132, 199, 0.25)' : 'rgba(30, 41, 59, 0.6)',
                  color: etapaSeleccionada === 'antes' ? '#38bdf8' : '#94a3b8',
                  fontWeight: '700',
                  fontSize: '13px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  transition: 'all 0.2s'
                }}
              >
                <Clock size={16} />
                <span>📸 Antes</span>
              </button>

              <button
                type="button"
                onClick={() => setEtapaSeleccionada('proceso')}
                style={{
                  flex: '1',
                  minWidth: '130px',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: etapaSeleccionada === 'proceso' ? '2px solid #d97706' : '1px solid rgba(255,255,255,0.1)',
                  background: etapaSeleccionada === 'proceso' ? 'rgba(217, 119, 6, 0.25)' : 'rgba(30, 41, 59, 0.6)',
                  color: etapaSeleccionada === 'proceso' ? '#fbbf24' : '#94a3b8',
                  fontWeight: '700',
                  fontSize: '13px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  transition: 'all 0.2s'
                }}
              >
                <Camera size={16} />
                <span>🔨 Durante / Proceso</span>
              </button>

              <button
                type="button"
                onClick={() => setEtapaSeleccionada('terminado')}
                style={{
                  flex: '1',
                  minWidth: '130px',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: etapaSeleccionada === 'terminado' ? '2px solid #16a34a' : '1px solid rgba(255,255,255,0.1)',
                  background: etapaSeleccionada === 'terminado' ? 'rgba(22, 163, 74, 0.25)' : 'rgba(30, 41, 59, 0.6)',
                  color: etapaSeleccionada === 'terminado' ? '#4ade80' : '#94a3b8',
                  fontWeight: '700',
                  fontSize: '13px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  transition: 'all 0.2s'
                }}
              >
                <Sparkles size={16} />
                <span>✨ Terminado</span>
              </button>
            </div>
          </div>

          {/* Botón de Carga de Archivos */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <label
              className="btn btn-primary"
              style={{
                cursor: 'pointer',
                padding: '10px 18px',
                fontSize: '13px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: '#0284c7'
              }}
            >
              <Camera size={18} />
              <span>Elegir Foto(s) de Cámara o Galería</span>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleSeleccionarArchivos}
                style={{ display: 'none' }}
                disabled={subiendo}
              />
            </label>

            {archivosSeleccionados.length > 0 && (
              <button
                type="button"
                className="btn btn-success"
                onClick={handleSubirFotos}
                disabled={subiendo}
                style={{ padding: '10px 20px', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
              >
                {subiendo ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>Subiendo a Google Drive...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={18} />
                    <span>🚀 Subir {archivosSeleccionados.length} Foto(s)</span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* Vista Previa de Fotos a Subir */}
          {previsualizaciones.length > 0 && (
            <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid rgba(148, 163, 184, 0.2)' }}>
              <div style={{ fontSize: '12px', color: '#38bdf8', fontWeight: '600', marginBottom: '8px' }}>
                📸 Nombres automáticos asignados para subir:
              </div>
              <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '6px' }}>
                {archivosSeleccionados.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      minWidth: '140px',
                      maxWidth: '140px',
                      background: '#1e293b',
                      borderRadius: '8px',
                      padding: '6px',
                      border: '1px solid rgba(56, 189, 248, 0.3)',
                      fontSize: '11px'
                    }}
                  >
                    <img
                      src={item.dataUrl}
                      alt="Preview"
                      style={{ width: '100%', height: '80px', objectFit: 'cover', borderRadius: '6px', marginBottom: '4px' }}
                    />
                    <div style={{ color: '#f8fafc', fontWeight: '600', wordBreak: 'break-all', lineHeight: '1.2' }}>
                      {item.nombreCalculado}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* PESTAÑAS DE FILTRO DE GALERÍA */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', borderBottom: '1px solid rgba(148, 163, 184, 0.2)', paddingBottom: '8px' }}>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => setFiltroEtapa('todas')}
              style={{
                padding: '6px 14px',
                borderRadius: '20px',
                border: 'none',
                background: filtroEtapa === 'todas' ? '#38bdf8' : 'rgba(30, 41, 59, 0.8)',
                color: filtroEtapa === 'todas' ? '#0f172a' : '#cbd5e1',
                fontWeight: '700',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              Todas ({cantTodas})
            </button>
            <button
              type="button"
              onClick={() => setFiltroEtapa('antes')}
              style={{
                padding: '6px 14px',
                borderRadius: '20px',
                border: 'none',
                background: filtroEtapa === 'antes' ? '#0284c7' : 'rgba(30, 41, 59, 0.8)',
                color: filtroEtapa === 'antes' ? '#ffffff' : '#cbd5e1',
                fontWeight: '700',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              📸 Antes ({cantAntes})
            </button>
            <button
              type="button"
              onClick={() => setFiltroEtapa('proceso')}
              style={{
                padding: '6px 14px',
                borderRadius: '20px',
                border: 'none',
                background: filtroEtapa === 'proceso' ? '#d97706' : 'rgba(30, 41, 59, 0.8)',
                color: filtroEtapa === 'proceso' ? '#ffffff' : '#cbd5e1',
                fontWeight: '700',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              🔨 Durante ({cantProceso})
            </button>
            <button
              type="button"
              onClick={() => setFiltroEtapa('terminado')}
              style={{
                padding: '6px 14px',
                borderRadius: '20px',
                border: 'none',
                background: filtroEtapa === 'terminado' ? '#16a34a' : 'rgba(30, 41, 59, 0.8)',
                color: filtroEtapa === 'terminado' ? '#ffffff' : '#cbd5e1',
                fontWeight: '700',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              ✨ Terminado ({cantTerminado})
            </button>
          </div>

          <div style={{ fontSize: '12px', color: '#94a3b8' }}>
            Mostrando {fotosFiltradas.length} foto(s)
          </div>
        </div>

        {/* GALERÍA DE FOTOS EN CUADRÍCULA */}
        {cargando ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
            <Loader2 size={32} className="animate-spin" style={{ margin: '0 auto 12px' }} />
            <div>Cargando galería fotográfica del proyecto...</div>
          </div>
        ) : fotosFiltradas.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '40px 20px',
            background: 'rgba(30, 41, 59, 0.4)',
            borderRadius: '12px',
            color: '#94a3b8'
          }}>
            <ImageIcon size={48} style={{ opacity: '0.4', marginBottom: '10px' }} />
            <div style={{ fontWeight: '600', fontSize: '15px', color: '#e2e8f0' }}>No hay fotos registradas en esta etapa</div>
            <div style={{ fontSize: '13px', marginTop: '4px' }}>Utiliza el formulario de arriba para cargar fotos del proyecto.</div>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))',
            gap: '16px',
            maxHeight: '480px',
            overflowY: 'auto',
            paddingRight: '4px'
          }}>
            {fotosFiltradas.map((foto) => {
              // Estilo del badge según etapa
              let badgeBg = 'rgba(2, 132, 199, 0.2)';
              let badgeColor = '#38bdf8';
              let badgeBorder = '1px solid rgba(2, 132, 199, 0.4)';
              let badgeIcon = '📸';

              if (foto.etapa === 'proceso') {
                badgeBg = 'rgba(217, 119, 6, 0.2)';
                badgeColor = '#fbbf24';
                badgeBorder = '1px solid rgba(217, 119, 6, 0.4)';
                badgeIcon = '🔨';
              } else if (foto.etapa === 'terminado') {
                badgeBg = 'rgba(22, 163, 74, 0.2)';
                badgeColor = '#4ade80';
                badgeBorder = '1px solid rgba(22, 163, 74, 0.4)';
                badgeIcon = '✨';
              }

              return (
                <div
                  key={foto.id}
                  style={{
                    background: '#1e293b',
                    borderRadius: '12px',
                    border: '1px solid rgba(148, 163, 184, 0.2)',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    position: 'relative'
                  }}
                >
                  {/* Badge de Etapa */}
                  <div style={{
                    position: 'absolute',
                    top: '8px',
                    left: '8px',
                    zIndex: 2,
                    background: badgeBg,
                    color: badgeColor,
                    border: badgeBorder,
                    padding: '3px 8px',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontWeight: '700',
                    backdropFilter: 'blur(4px)'
                  }}>
                    {badgeIcon} {foto.etapaEtiqueta || foto.etapa}
                  </div>

                  {/* Imagen Thumbnail */}
                  <div
                    onClick={() => setFotoZoom(foto)}
                    style={{
                      height: '140px',
                      width: '100%',
                      overflow: 'hidden',
                      position: 'relative',
                      cursor: 'pointer',
                      background: '#0f172a'
                    }}
                  >
                    <img
                      src={foto.previewUrl || foto.driveUrl}
                      alt={foto.nombreArchivo}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'transform 0.3s'
                      }}
                    />
                    <div style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'rgba(0,0,0,0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      opacity: 0,
                      transition: 'opacity 0.2s'
                    }}
                    className="hover-overlay"
                    >
                      <ZoomIn size={24} color="#ffffff" />
                    </div>
                  </div>

                  {/* Contenido / Nombre */}
                  <div style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                    <div
                      title={foto.nombreArchivo}
                      style={{
                        fontSize: '12px',
                        fontWeight: '700',
                        color: '#f8fafc',
                        wordBreak: 'break-all',
                        lineHeight: '1.3'
                      }}
                    >
                      {foto.nombreArchivo}
                    </div>

                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                      {foto.fechaSubida ? new Date(foto.fechaSubida).toLocaleDateString('es-CO', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      }) : 'Sin fecha'}
                    </div>

                    {/* Botones de Acción */}
                    <div style={{ display: 'flex', gap: '6px', marginTop: 'auto', paddingTop: '8px' }}>
                      <button
                        type="button"
                        onClick={() => setFotoZoom(foto)}
                        className="btn btn-secondary"
                        style={{ flex: 1, padding: '4px 8px', fontSize: '11px', justifyContent: 'center' }}
                        title="Ver foto en pantalla completa"
                      >
                        <ZoomIn size={14} />
                        <span>Ver HD</span>
                      </button>

                      {foto.driveUrl && (
                        <a
                          href={foto.driveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-secondary"
                          style={{ padding: '4px 8px', fontSize: '11px', display: 'inline-flex', alignItems: 'center' }}
                          title="Abrir foto en Google Drive"
                        >
                          <FolderOpen size={14} color="#38bdf8" />
                        </a>
                      )}

                      <button
                        type="button"
                        onClick={() => handleEliminarFoto(foto)}
                        style={{
                          background: 'rgba(239, 68, 68, 0.15)',
                          color: '#ef4444',
                          border: '1px solid rgba(239, 68, 68, 0.3)',
                          borderRadius: '6px',
                          padding: '4px 8px',
                          cursor: 'pointer'
                        }}
                        title="Eliminar foto"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* MODAL ZOOM HD / LIGHTBOX DE IMAGEN */}
      {fotoZoom && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          background: 'rgba(0,0,0,0.92)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <button
            type="button"
            onClick={() => setFotoZoom(null)}
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              color: '#ffffff',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={24} />
          </button>

          <img
            src={fotoZoom.previewUrl || fotoZoom.driveUrl}
            alt={fotoZoom.nombreArchivo}
            style={{
              maxWidth: '90vw',
              maxHeight: '80vh',
              objectFit: 'contain',
              borderRadius: '8px',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5)'
            }}
          />

          <div style={{
            marginTop: '14px',
            color: '#f8fafc',
            textAlign: 'center',
            background: 'rgba(30, 41, 59, 0.8)',
            padding: '10px 20px',
            borderRadius: '12px',
            border: '1px solid rgba(148, 163, 184, 0.3)'
          }}>
            <div style={{ fontWeight: '700', fontSize: '15px' }}>{fotoZoom.nombreArchivo}</div>
            <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>
              Etapa: <strong>{fotoZoom.etapaEtiqueta || fotoZoom.etapa}</strong> • Obra: {proyecto.nombre}
            </div>
          </div>
        </div>
      )}
    </ModalForm>
  );
}
