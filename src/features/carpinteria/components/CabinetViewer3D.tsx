// ============================================================
// ARCHIVO: src/features/carpinteria/components/CabinetViewer3D.tsx
// QUÉ HACE: Contenedor Canvas WebGL con ThreeSceneManager, Cotas 3D, Gizmo, Room Studio y Render 4K.
// POR QUÉ: Permite modelado paramétrico, diseño libre, arrastre táctil y presentaciones a clientes.
// ============================================================
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { RotateCcw, Eye, Layers, Box, Ruler, Wrench, FileText, Move, RotateCw, Scaling, Camera, Home } from 'lucide-react';
import { CabinetSpec, CabinetPart, ModoVista3D } from '../types/cabinet3d';
import { TableroLibre } from '../types/freeDesign';
import { RoomEnvironmentOptions } from '../types/roomStudio';
import { ThreeSceneManager } from '../three/ThreeSceneManager';
import { MeasureData } from '../three/TapeMeasureTool';
import { BoundingBox3D } from '../three/dimensionLinesFactory';
import { crearMueble3DGroup } from '../three/cabinetMeshFactory';
import { crearMallaDisenoLibreGroup } from '../three/freeDesignMeshFactory';
import { calculateCabinetMachining } from '../math/machiningCalculator';
import { createCabinetMachiningGroup } from '../three/machiningMeshFactory';
import TapeMeasureHUD from './TapeMeasureHUD';
import FichaMecanizadoModal from './FichaMecanizadoModal';
import ModalRenderExport from './ModalRenderExport';
import RoomStudioModal from './RoomStudioModal';

interface Props {
  spec: CabinetSpec;
  parts: CabinetPart[];
  modoDiseno?: 'parametrico' | 'libre';
  tablerosLibres?: TableroLibre[];
  selectedBoardId?: string | null;
  onSelectBoardId?: (id: string | null) => void;
  onTransformBoard?: (id: string, pos: { x: number; y: number; z: number }) => void;
  onChangeSpec: (updater: (prev: CabinetSpec) => CabinetSpec) => void;
}

export default function CabinetViewer3D({
  spec,
  parts,
  modoDiseno = 'parametrico',
  tablerosLibres = [],
  selectedBoardId = null,
  onSelectBoardId,
  onTransformBoard,
  onChangeSpec
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneManagerRef = useRef<ThreeSceneManager | null>(null);
  const [metroActivo, setMetroActivo] = useState<boolean>(false);
  const [verMecanizados, setVerMecanizados] = useState<boolean>(false);
  const [verCotas3D, setVerCotas3D] = useState<boolean>(true);
  const [modalFichaAbierto, setModalFichaAbierto] = useState<boolean>(false);
  const [modalRenderAbierto, setModalRenderAbierto] = useState<boolean>(false);
  const [modalRoomAbierto, setModalRoomAbierto] = useState<boolean>(false);
  const [measureData, setMeasureData] = useState<MeasureData | null>(null);
  const [gizmoMode, setGizmoMode] = useState<'translate' | 'rotate'>('translate');
  const [gizmoEnabled, setGizmoEnabled] = useState<boolean>(true);

  const [roomOptions, setRoomOptions] = useState<RoomEnvironmentOptions>({
    activo: false,
    tipoPiso: 'madera-parquet',
    tipoPared: 'blanco-yeso',
    mostrarRodapie: true,
    dimensionesCuarto: { ancho: 3000, alto: 2600, profundidad: 3000 }
  });

  // 1. Cálculo en memoria de los mecanizados paramétricos
  const machiningMap = useMemo(() => calculateCabinetMachining(spec, parts), [spec, parts]);

  // 2. Inicializar ThreeSceneManager al montar
  useEffect(() => {
    if (!containerRef.current) return;
    const manager = new ThreeSceneManager(containerRef.current);
    sceneManagerRef.current = manager;

    if (onSelectBoardId) {
      manager.setOnSelectBoard(onSelectBoardId);
    }

    if (onTransformBoard) {
      manager.setOnTransformBoard(onTransformBoard);
    }

    manager.tapeTool.onUpdate = (data) => {
      setMeasureData(data);
    };

    // Observador de Redimensionamiento
    const resizeObserver = new ResizeObserver(() => {
      manager.handleResize();
    });
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      manager.dispose();
      sceneManagerRef.current = null;
    };
  }, [onSelectBoardId, onTransformBoard]);

  // 3. Actualizar geometría, cotas 3D, room studio y mecanizados
  useEffect(() => {
    if (!sceneManagerRef.current) return;

    // Room Studio
    const dim = modoDiseno === 'libre' ? undefined : { width: spec.ancho, height: spec.alto, depth: spec.profundidad };
    sceneManagerRef.current.setRoomEnvironment(roomOptions.activo ? roomOptions : null, dim);

    if (modoDiseno === 'libre') {
      const group = crearMallaDisenoLibreGroup(tablerosLibres, selectedBoardId);
      sceneManagerRef.current.setMuebleGroup(group);

      if (gizmoEnabled && selectedBoardId) {
        sceneManagerRef.current.attachGizmo(selectedBoardId);
      } else {
        sceneManagerRef.current.attachGizmo(null);
      }

      // Cotas 3D en Modo Libre
      if (verCotas3D && tablerosLibres.length > 0) {
        let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity, minZ = Infinity, maxZ = -Infinity;
        tablerosLibres.forEach(t => {
          const hw = t.ancho / 2;
          const hh = t.largo / 2;
          const hd = t.espesor / 2;
          minX = Math.min(minX, t.pos.x - hw);
          maxX = Math.max(maxX, t.pos.x + hw);
          minY = Math.min(minY, t.pos.y - hh);
          maxY = Math.max(maxY, t.pos.y + hh);
          minZ = Math.min(minZ, t.pos.z - hd);
          maxZ = Math.max(maxZ, t.pos.z + hd);
        });
        sceneManagerRef.current.setDimensionLines({ minX, maxX, minY, maxY, minZ, maxZ });
      } else {
        sceneManagerRef.current.setDimensionLines(null);
      }
    } else {
      const group = crearMueble3DGroup(parts, spec);
      if (verMecanizados) {
        const machiningGroup = createCabinetMachiningGroup(parts, machiningMap, spec);
        group.add(machiningGroup);
      }
      sceneManagerRef.current.setMuebleGroup(group);
      sceneManagerRef.current.attachGizmo(null);

      // Cotas 3D en Modo Paramétrico (Centrado exacto en -H/2 a +H/2)
      if (verCotas3D) {
        const box: BoundingBox3D = {
          minX: -spec.ancho / 2,
          maxX: spec.ancho / 2,
          minY: -spec.alto / 2,
          maxY: spec.alto / 2,
          minZ: -spec.profundidad / 2,
          maxZ: spec.profundidad / 2
        };
        sceneManagerRef.current.setDimensionLines(box);
      } else {
        sceneManagerRef.current.setDimensionLines(null);
      }
    }
  }, [parts, spec, modoDiseno, tablerosLibres, selectedBoardId, verMecanizados, verCotas3D, machiningMap, gizmoEnabled, roomOptions]);

  const handleToggleMetro = () => {
    const next = !metroActivo;
    setMetroActivo(next);
    sceneManagerRef.current?.toggleTapeMeasure(next);
  };

  const handleToggleGizmoMode = (mode: 'translate' | 'rotate') => {
    setGizmoMode(mode);
    sceneManagerRef.current?.setGizmoMode(mode);
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '520px', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid rgba(56,189,248,0.2)' }}>
      {/* Contenedor del Canvas WebGL Three.js */}
      <div ref={containerRef} style={{ width: '100%', height: '100%', touchAction: 'none' }} />

      {/* Barra de Controles Superiores Flotantes */}
      <div style={{
        position: 'absolute',
        top: '12px',
        left: '12px',
        right: '12px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '8px',
        pointerEvents: 'none'
      }}>
        {/* Modos de Vista */}
        <div style={{ display: 'flex', gap: '6px', background: 'rgba(15,23,42,0.85)', padding: '4px', borderRadius: '8px', backdropFilter: 'blur(8px)', pointerEvents: 'auto' }}>
          {[
            { id: 'solido', label: 'Sólido', icon: Box },
            { id: 'alambre', label: 'Rayos X', icon: Eye },
            { id: 'explosionado', label: 'Despiece', icon: Layers }
          ].map(m => (
            <button
              key={m.id}
              type="button"
              onClick={() => onChangeSpec(prev => ({ ...prev, modoVista: m.id as ModoVista3D }))}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '6px 10px',
                fontSize: '0.75rem',
                fontWeight: 600,
                borderRadius: '6px',
                border: spec.modoVista === m.id ? '1px solid var(--color-primary)' : '1px solid transparent',
                background: spec.modoVista === m.id ? 'rgba(56,189,248,0.2)' : 'transparent',
                color: spec.modoVista === m.id ? 'var(--color-primary)' : 'var(--text-secondary)',
                cursor: 'pointer'
              }}
            >
              <m.icon size={13} />
              <span>{m.label}</span>
            </button>
          ))}
        </div>

        {/* Botones de Acción Rápida */}
        <div style={{ display: 'flex', gap: '6px', pointerEvents: 'auto', flexWrap: 'wrap' }}>
          {/* Botón Entorno de Habitación */}
          <button
            type="button"
            onClick={() => setModalRoomAbierto(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              padding: '6px 12px',
              fontSize: '0.75rem',
              fontWeight: 700,
              borderRadius: '6px',
              border: roomOptions.activo ? '1.5px solid #10b981' : '1px solid rgba(255,255,255,0.15)',
              background: roomOptions.activo ? 'rgba(16,185,129,0.25)' : 'rgba(15,23,42,0.85)',
              color: roomOptions.activo ? '#10b981' : 'var(--text-secondary)',
              cursor: 'pointer',
              backdropFilter: 'blur(8px)',
              boxShadow: roomOptions.activo ? '0 0 10px rgba(16,185,129,0.35)' : 'none'
            }}
            title="Configurar Entorno de Habitación (Pisos de Madera, Porcelanato y Paredes)"
          >
            <Home size={14} />
            <span>{roomOptions.activo ? '🏠 Entorno ON' : '🏠 Entorno'}</span>
          </button>

          {/* Botón Foto Render 4K & Exportación 3D */}
          <button
            type="button"
            onClick={() => setModalRenderAbierto(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              padding: '6px 12px',
              fontSize: '0.75rem',
              fontWeight: 700,
              borderRadius: '6px',
              border: '1.5px solid #f59e0b',
              background: 'rgba(245,158,11,0.2)',
              color: '#f59e0b',
              cursor: 'pointer',
              backdropFilter: 'blur(8px)',
              boxShadow: '0 0 10px rgba(245,158,11,0.3)'
            }}
            title="Generar Foto Render 4K para Clientes o Exportar en .GLB / .OBJ"
          >
            <Camera size={14} />
            <span>📸 Foto & 3D</span>
          </button>

          {/* Toggle Cotas 3D */}
          <button
            type="button"
            onClick={() => setVerCotas3D(!verCotas3D)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              fontSize: '0.75rem',
              fontWeight: 700,
              borderRadius: '6px',
              border: verCotas3D ? '1.5px solid #38bdf8' : '1px solid rgba(255,255,255,0.15)',
              background: verCotas3D ? 'rgba(56,189,248,0.25)' : 'rgba(15,23,42,0.85)',
              color: verCotas3D ? '#38bdf8' : 'var(--text-secondary)',
              cursor: 'pointer',
              backdropFilter: 'blur(8px)',
              boxShadow: verCotas3D ? '0 0 10px rgba(56,189,248,0.35)' : 'none'
            }}
            title="Haz clic para Mostrar u Ocultar las Cotas 3D Exteriores (Ancho, Alto, Profundidad)"
          >
            <Scaling size={14} color={verCotas3D ? '#38bdf8' : 'var(--text-secondary)'} />
            <span>{verCotas3D ? '📐 Cotas: Visibles' : '📐 Cotas: Ocultas'}</span>
          </button>

          {/* Controles de Gizmo 3D (Solo en modo libre y pieza seleccionada) */}
          {modoDiseno === 'libre' && selectedBoardId && (
            <div style={{ display: 'flex', gap: '4px', background: 'rgba(15,23,42,0.85)', padding: '3px', borderRadius: '6px', backdropFilter: 'blur(8px)', border: '1px solid rgba(56,189,248,0.3)' }}>
              <button
                type="button"
                onClick={() => handleToggleGizmoMode('translate')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '4px 8px',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  borderRadius: '4px',
                  background: gizmoMode === 'translate' ? 'rgba(56,189,248,0.25)' : 'transparent',
                  color: gizmoMode === 'translate' ? 'var(--color-primary)' : 'var(--text-secondary)',
                  border: 'none',
                  cursor: 'pointer'
                }}
                title="Mover tablero (Flechas X, Y, Z)"
              >
                <Move size={12} />
                <span>Mover</span>
              </button>

              <button
                type="button"
                onClick={() => handleToggleGizmoMode('rotate')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '4px 8px',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  borderRadius: '4px',
                  background: gizmoMode === 'rotate' ? 'rgba(56,189,248,0.25)' : 'transparent',
                  color: gizmoMode === 'rotate' ? 'var(--color-primary)' : 'var(--text-secondary)',
                  border: 'none',
                  cursor: 'pointer'
                }}
                title="Rotar tablero 90°"
              >
                <RotateCw size={12} />
                <span>Rotar</span>
              </button>
            </div>
          )}

          {/* Botón Mecanizados & Perforaciones 3D */}
          {modoDiseno === 'parametrico' && (
            <button
              type="button"
              onClick={() => setVerMecanizados(!verMecanizados)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '6px 10px',
                fontSize: '0.75rem',
                fontWeight: 700,
                borderRadius: '6px',
                border: verMecanizados ? '1.5px solid #38bdf8' : '1px solid rgba(255,255,255,0.1)',
                background: verMecanizados ? 'rgba(56,189,248,0.25)' : 'rgba(15,23,42,0.85)',
                color: verMecanizados ? '#38bdf8' : 'var(--text-main)',
                cursor: 'pointer',
                backdropFilter: 'blur(8px)',
                boxShadow: verMecanizados ? '0 0 10px rgba(56,189,248,0.4)' : 'none'
              }}
            >
              <Wrench size={13} color={verMecanizados ? '#38bdf8' : '#f59e0b'} />
              <span>{verMecanizados ? 'Perforaciones Activas' : '🛠️ Perforaciones'}</span>
            </button>
          )}

          {/* Botón Ficha de Taller */}
          {modoDiseno === 'parametrico' && (
            <button
              type="button"
              onClick={() => setModalFichaAbierto(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '6px 10px',
                fontSize: '0.75rem',
                fontWeight: 600,
                borderRadius: '6px',
                border: '1px solid rgba(255,255,255,0.1)',
                background: 'rgba(15,23,42,0.85)',
                color: 'var(--text-main)',
                cursor: 'pointer',
                backdropFilter: 'blur(8px)'
              }}
              title="Ver mapa de perforado y cotas"
            >
              <FileText size={13} color="#10b981" />
              <span>📋 Ficha</span>
            </button>
          )}

          {/* Botón Herramienta Metro 3D */}
          <button
            type="button"
            onClick={handleToggleMetro}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '6px 12px',
              fontSize: '0.75rem',
              fontWeight: 700,
              borderRadius: '6px',
              border: metroActivo ? '1.5px solid #f59e0b' : '1px solid rgba(255,255,255,0.1)',
              background: metroActivo ? 'rgba(245,158,11,0.25)' : 'rgba(15,23,42,0.85)',
              color: metroActivo ? '#f59e0b' : 'var(--text-main)',
              cursor: 'pointer',
              backdropFilter: 'blur(8px)',
              boxShadow: metroActivo ? '0 0 10px rgba(245,158,11,0.4)' : 'none'
            }}
          >
            <Ruler size={14} />
            <span>{metroActivo ? 'Midiendo' : '📏 Metro'}</span>
          </button>

          {modoDiseno === 'parametrico' && (
            <>
              {spec.numeroCajones > 0 ? (
                <button
                  type="button"
                  onClick={() => onChangeSpec(prev => ({ ...prev, aperturaCajones: !prev.aperturaCajones }))}
                  style={{
                    padding: '6px 10px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    borderRadius: '6px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    background: 'rgba(15,23,42,0.85)',
                    color: spec.aperturaCajones ? '#f59e0b' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    backdropFilter: 'blur(8px)'
                  }}
                >
                  📦 {spec.aperturaCajones ? 'Cerrar' : 'Extraer'}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => onChangeSpec(prev => ({ ...prev, aperturaPuertas: !prev.aperturaPuertas }))}
                  style={{
                    padding: '6px 10px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    borderRadius: '6px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    background: 'rgba(15,23,42,0.85)',
                    color: spec.aperturaPuertas ? '#f59e0b' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    backdropFilter: 'blur(8px)'
                  }}
                >
                  {spec.tipoSistemaPuertas === 'elevable-basculante'
                    ? (spec.aperturaPuertas ? '🛫 Bajar' : '🛫 Elevar')
                    : spec.tipoSistemaPuertas === 'corrediza'
                    ? (spec.aperturaPuertas ? '↔️ Cerrar' : '↔️ Deslizar')
                    : (spec.aperturaPuertas ? '🚪 Cerrar' : '🚪 Abrir')}
                </button>
              )}
            </>
          )}

          <button
            type="button"
            onClick={() => sceneManagerRef.current?.resetCamera()}
            title="Centrar Cámara"
            style={{
              padding: '6px 10px',
              fontSize: '0.75rem',
              fontWeight: 600,
              borderRadius: '6px',
              border: '1px solid rgba(255,255,255,0.1)',
              background: 'rgba(15,23,42,0.85)',
              color: 'var(--text-main)',
              cursor: 'pointer',
              backdropFilter: 'blur(8px)'
            }}
          >
            <RotateCcw size={13} />
          </button>
        </div>
      </div>

      {/* Widget HUD Flotante de Medición */}
      {metroActivo && measureData && (
        <TapeMeasureHUD
          data={measureData}
          onAddGuide={() => sceneManagerRef.current?.tapeTool.addGuidePoint()}
          onClearGuides={() => sceneManagerRef.current?.tapeTool.clearAllGuides()}
          onClose={handleToggleMetro}
        />
      )}

      {/* Modal Ficha Técnica de Perforado */}
      <FichaMecanizadoModal
        isOpen={modalFichaAbierto}
        machiningMap={machiningMap}
        onClose={() => setModalFichaAbierto(false)}
      />

      {/* Modal Foto Render 4K & Exportación 3D */}
      <ModalRenderExport
        isOpen={modalRenderAbierto}
        spec={spec}
        sceneManager={sceneManagerRef.current}
        onClose={() => setModalRenderAbierto(false)}
      />

      {/* Modal Entorno de Habitación */}
      <RoomStudioModal
        isOpen={modalRoomAbierto}
        options={roomOptions}
        onChangeOptions={setRoomOptions}
        onClose={() => setModalRoomAbierto(false)}
      />

      {/* Barra Inferior */}
      <div style={{
        position: 'absolute',
        bottom: '12px',
        left: '12px',
        right: '12px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '8px',
        background: 'rgba(15,23,42,0.88)',
        padding: '8px 14px',
        borderRadius: '8px',
        backdropFilter: 'blur(8px)',
        border: '1px solid rgba(255,255,255,0.06)'
      }}>
        {/* Indicador de Melamina */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '14px',
            height: '14px',
            borderRadius: '50%',
            background: spec.melamina?.colorHex || '#c89666',
            border: '1px solid rgba(255,255,255,0.3)',
            flexShrink: 0
          }} />
          <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-main)' }}>
            {spec.melamina ? `${spec.melamina.marca} • ${spec.melamina.nombre}` : 'Melamina Seleccionada'}
          </span>
        </div>

        {/* Slider de Despiece */}
        {modoDiseno === 'parametrico' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '180px' }}>
            <span style={{ fontSize: '0.75rem', color: '#f59e0b', fontWeight: 600 }}>Explosión:</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={spec.factorExplosion}
              onChange={(e) => onChangeSpec(prev => ({ ...prev, factorExplosion: parseFloat(e.target.value) }))}
              style={{ width: '100px', accentColor: '#f59e0b' }}
            />
            <span className="font-mono-num" style={{ fontSize: '0.75rem', color: '#f59e0b' }}>
              {Math.round(spec.factorExplosion * 100)}%
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
