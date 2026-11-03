// ============================================================
// ARCHIVO: src/features/carpinteria/components/ModalRenderExport.tsx
// QUÉ HACE: Modal para generar Fotos Render 4K y Exportar Modelos 3D (.GLB, .GLTF, .OBJ).
// POR QUÉ: Presentaciones comerciales de alta calidad y compatibilidad con Realidad Aumentada.
// ============================================================
import React, { useState } from 'react';
import { X, Camera, Download, Copy, Box, Sparkles, Image as ImageIcon, FileCode } from 'lucide-react';
import { ThreeSceneManager } from '../three/ThreeSceneManager';
import { CabinetSpec } from '../types/cabinet3d';

interface Props {
  isOpen: boolean;
  spec: CabinetSpec;
  sceneManager: ThreeSceneManager | null;
  onClose: () => void;
}

export default function ModalRenderExport({ isOpen, spec, sceneManager, onClose }: Props) {
  const [tab, setTab] = useState<'render' | 'export3d'>('render');
  const [resolucion, setResolucion] = useState<'1080p' | '2K' | '4K'>('1080p');
  const [fondo, setFondo] = useState<'dark' | 'white'>('dark');
  const [incluirFicha, setIncluirFicha] = useState<boolean>(true);
  const [generando, setGenerando] = useState<boolean>(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGenerarRender = async () => {
    if (!sceneManager) return;
    setGenerando(true);
    try {
      const dimensions = `${spec.ancho} × ${spec.alto} × ${spec.profundidad} mm`;
      const melamina = spec.melamina?.nombre || 'Melamina Estándar';
      const dataUrl = await sceneManager.captureRender({
        resolution: resolucion,
        background: fondo,
        includeWatermark: incluirFicha,
        cabinetName: spec.nombre || 'Módulo de Carpintería',
        dimensions,
        melaminaName: melamina
      });
      setPreviewUrl(dataUrl);
    } catch (err: any) {
      alert('Error al generar render: ' + (err.message || err));
    } finally {
      setGenerando(false);
    }
  };

  const handleDescargarPNG = () => {
    if (!previewUrl) return;
    const a = document.createElement('a');
    a.href = previewUrl;
    a.download = `${spec.nombre.toLowerCase().replace(/\s+/g, '_')}_render_${resolucion}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleCopiarPortapapeles = async () => {
    if (!previewUrl) return;
    try {
      const res = await fetch(previewUrl);
      const blob = await res.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ]);
      alert('¡Imagen copiada al portapapeles con éxito!');
    } catch (err) {
      alert('No se pudo copiar directamente al portapapeles. Usa el botón Descargar.');
    }
  };

  const handleExportGLB = async () => {
    if (!sceneManager) return;
    await sceneManager.exportModelGLTF(`${spec.nombre.toLowerCase().replace(/\s+/g, '_')}`, true);
  };

  const handleExportGLTF = async () => {
    if (!sceneManager) return;
    await sceneManager.exportModelGLTF(`${spec.nombre.toLowerCase().replace(/\s+/g, '_')}`, false);
  };

  const handleExportOBJ = () => {
    if (!sceneManager) return;
    sceneManager.exportModelOBJ(`${spec.nombre.toLowerCase().replace(/\s+/g, '_')}`);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.75)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '16px'
    }}>
      <div className="card" style={{
        width: '100%',
        maxWidth: '740px',
        maxHeight: '92vh',
        overflowY: 'auto',
        border: '1.5px solid var(--color-primary)',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '10px' }}>
          <div>
            <span className="badge-wood" style={{ fontSize: '0.7rem' }}>Presentación & AR</span>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '8px', margin: '4px 0 0 0' }}>
              <Camera size={20} />
              <span>Foto Render 4K & Exportación 3D</span>
            </h3>
          </div>
          <button type="button" onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Pestañas de Navegación */}
        <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '8px' }}>
          <button
            type="button"
            onClick={() => setTab('render')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              fontSize: '0.8rem',
              fontWeight: 700,
              borderRadius: '6px',
              border: tab === 'render' ? '1px solid var(--color-primary)' : '1px solid transparent',
              background: tab === 'render' ? 'rgba(56,189,248,0.15)' : 'transparent',
              color: tab === 'render' ? 'var(--color-primary)' : 'var(--text-secondary)',
              cursor: 'pointer'
            }}
          >
            <ImageIcon size={15} />
            <span>1. Foto Render Ultra-HD (PNG)</span>
          </button>

          <button
            type="button"
            onClick={() => setTab('export3d')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              fontSize: '0.8rem',
              fontWeight: 700,
              borderRadius: '6px',
              border: tab === 'export3d' ? '1.5px solid #f59e0b' : '1px solid transparent',
              background: tab === 'export3d' ? 'rgba(245,158,11,0.15)' : 'transparent',
              color: tab === 'export3d' ? '#f59e0b' : 'var(--text-secondary)',
              cursor: 'pointer'
            }}
          >
            <Box size={15} />
            <span>2. Exportar Modelos 3D (.GLB / .OBJ)</span>
          </button>
        </div>

        {/* Contenido Pestaña 1: Render */}
        {tab === 'render' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Opciones de Render */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', background: 'rgba(15,23,42,0.5)', padding: '12px', borderRadius: '8px' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Resolución de Salida:
                </label>
                <div style={{ display: 'flex', gap: '4px' }}>
                  {(['1080p', '2K', '4K'] as const).map(res => (
                    <button
                      key={res}
                      type="button"
                      onClick={() => setResolucion(res)}
                      style={{
                        flex: 1,
                        padding: '6px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        borderRadius: '4px',
                        border: resolucion === res ? '1px solid var(--color-primary)' : '1px solid rgba(255,255,255,0.08)',
                        background: resolucion === res ? 'rgba(56,189,248,0.2)' : 'transparent',
                        color: resolucion === res ? 'var(--color-primary)' : 'var(--text-secondary)',
                        cursor: 'pointer'
                      }}
                    >
                      {res}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Fondo de Render:
                </label>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button
                    type="button"
                    onClick={() => setFondo('dark')}
                    style={{
                      flex: 1,
                      padding: '6px',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      borderRadius: '4px',
                      border: fondo === 'dark' ? '1px solid var(--color-primary)' : '1px solid rgba(255,255,255,0.08)',
                      background: fondo === 'dark' ? 'rgba(56,189,248,0.2)' : 'transparent',
                      color: fondo === 'dark' ? 'var(--color-primary)' : 'var(--text-secondary)',
                      cursor: 'pointer'
                    }}
                  >
                    🌑 Estudio Oscuro
                  </button>
                  <button
                    type="button"
                    onClick={() => setFondo('white')}
                    style={{
                      flex: 1,
                      padding: '6px',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      borderRadius: '4px',
                      border: fondo === 'white' ? '1px solid #10b981' : '1px solid rgba(255,255,255,0.08)',
                      background: fondo === 'white' ? 'rgba(16,185,129,0.2)' : 'transparent',
                      color: fondo === 'white' ? '#10b981' : 'var(--text-secondary)',
                      cursor: 'pointer'
                    }}
                  >
                    ⚪ Fondo Blanco
                  </button>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--text-main)', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={incluirFicha}
                  onChange={(e) => setIncluirFicha(e.target.checked)}
                  style={{ accentColor: 'var(--color-primary)' }}
                />
                <span>Incluir Ficha Técnica y Marca de Agua Comercial</span>
              </label>

              <button
                type="button"
                className="btn-primary-cyan"
                onClick={handleGenerarRender}
                disabled={generando}
                style={{ fontSize: '0.78rem', padding: '6px 14px', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Sparkles size={14} />
                <span>{generando ? 'Renderizando...' : '📸 Tomar Foto HD'}</span>
              </button>
            </div>

            {/* Vista Previa de la Imagen */}
            {previewUrl ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{
                  position: 'relative',
                  width: '100%',
                  height: '240px',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  border: '1px solid rgba(56,189,248,0.3)',
                  backgroundColor: fondo === 'white' ? '#ffffff' : '#0f172a'
                }}>
                  <img
                    src={previewUrl}
                    alt="Preview Render 3D"
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={handleCopiarPortapapeles}
                    style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Copy size={14} />
                    <span>Copiar Imagen</span>
                  </button>

                  <button
                    type="button"
                    className="btn-primary-wood"
                    onClick={handleDescargarPNG}
                    style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px', background: '#f59e0b', color: '#0f172a', fontWeight: 700 }}
                  >
                    <Download size={14} />
                    <span>Descargar PNG ({resolucion})</span>
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-secondary)', background: 'rgba(15,23,42,0.4)', borderRadius: '8px' }}>
                Ajusta el ángulo de la cámara en el visor 3D y haz clic en <strong>"📸 Tomar Foto HD"</strong> para generar la foto comercial del mueble.
              </div>
            )}
          </div>
        )}

        {/* Contenido Pestaña 2: Exportación 3D */}
        {tab === 'export3d' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
            {/* Tarjeta GLB */}
            <div className="card" style={{ padding: '14px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '10px', border: '1px solid rgba(56,189,248,0.3)' }}>
              <div>
                <span className="badge-cyan" style={{ fontSize: '0.68rem' }}>Recomendado AR</span>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-primary)', margin: '6px 0 4px 0' }}>
                  Formato .GLB (Binario)
                </h4>
                <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', margin: 0 }}>
                  Empaqueta geometrías y texturas en un solo archivo. Compatible con Realidad Aumentada móvil y visores WebGL.
                </p>
              </div>
              <button
                type="button"
                className="btn-primary-cyan"
                onClick={handleExportGLB}
                style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                <Download size={14} />
                <span>Descargar .GLB</span>
              </button>
            </div>

            {/* Tarjeta GLTF */}
            <div className="card" style={{ padding: '14px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '10px', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div>
                <span className="badge-wood" style={{ fontSize: '0.68rem' }}>Estándar Abierto</span>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f59e0b', margin: '6px 0 4px 0' }}>
                  Formato .GLTF (JSON)
                </h4>
                <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', margin: 0 }}>
                  Estructura JSON editable ideal para inspeccionar nodos y jerarquías de piezas en motores como Three.js o Babylon.js.
                </p>
              </div>
              <button
                type="button"
                className="btn-secondary"
                onClick={handleExportGLTF}
                style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                <Download size={14} />
                <span>Descargar .GLTF</span>
              </button>
            </div>

            {/* Tarjeta OBJ */}
            <div className="card" style={{ padding: '14px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '10px', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div>
                <span style={{ fontSize: '0.68rem', color: '#10b981', background: 'rgba(16,185,129,0.1)', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>Universal CAD</span>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#10b981', margin: '6px 0 4px 0' }}>
                  Formato .OBJ (Wavefront)
                </h4>
                <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', margin: 0 }}>
                  Compatible con SketchUp, AutoCAD, Revit, SolidWorks y Blender para importar en planos de obra.
                </p>
              </div>
              <button
                type="button"
                className="btn-secondary"
                onClick={handleExportOBJ}
                style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                <Download size={14} />
                <span>Descargar .OBJ</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
