// ============================================================
// ARCHIVO: src/features/carpinteria/Disenador3DPage.tsx
// QUÉ HACE: Vista Principal de la Suite 3D (Paramétrico, Diseño Libre, Biblioteca y Cotas).
// POR QUÉ: Integra modelado 3D, plantillas en Firestore, despiece y herrajes ($ COP).
// ============================================================
import React, { useState, useMemo } from 'react';
import { Box, Sliders, Layers, Scissors, Wrench, BookmarkPlus, BookOpen } from 'lucide-react';
import { CabinetSpec } from './types/cabinet3d';
import { TableroLibre, OrientacionTablero } from './types/freeDesign';
import { CATALOGO_MELAMINAS } from './types/melaminas';
import { calcularPiezasMueble } from './math/cabinetCalculator';
import { calcularPosicionConSnap } from './math/snapEngine';
import ParametricControls from './components/ParametricControls';
import CabinetViewer3D from './components/CabinetViewer3D';
import ResumenDespiece3D from './components/ResumenDespiece3D';
import ResumenHerrajes3D from './components/ResumenHerrajes3D';
import MaterialTexturePicker from './components/MaterialTexturePicker';
import FreeDesignToolbar from './components/FreeDesignToolbar';
import SelectedBoardEditor from './components/SelectedBoardEditor';
import ModalGuardarPlantilla from './components/ModalGuardarPlantilla';
import ModalBibliotecaPlantillas from './components/ModalBibliotecaPlantillas';
import { IPlantillaMueble } from './services/plantillasMueblesService';

export default function Disenador3DPage() {
  const [modoDiseno, setModoDiseno] = useState<'parametrico' | 'libre'>('parametrico');
  const [tabInferior, setTabInferior] = useState<'despiece' | 'herrajes'>('despiece');
  const [modalGuardarAbierto, setModalGuardarAbierto] = useState<boolean>(false);
  const [modalBibliotecaAbierto, setModalBibliotecaAbierto] = useState<boolean>(false);

  // Estado del mueble paramétrico
  const [spec, setSpec] = useState<CabinetSpec>({
    nombre: 'Módulo Bajo 2 Puertas Estándar',
    tipo: 'modulo-bajo',
    ancho: 800,
    alto: 750,
    profundidad: 550,
    espesorEstructura: 18,
    espesorFondo: 6,
    numeroRepisas: 1,
    divisionesVerticales: 0,
    puertas: 2,
    numeroCajones: 0,
    aperturaPuertas: false,
    aperturaCajones: false,
    conZocalo: true,
    alturaZocalo: 100,
    acabado: 'roble',
    melamina: CATALOGO_MELAMINAS[0],
    modoVista: 'solido',
    factorExplosion: 0
  });

  // Estado del modo diseño libre
  const [tablerosLibres, setTablerosLibres] = useState<TableroLibre[]>([
    {
      id: 'tab_lat_izq',
      nombre: 'Lateral Izquierdo',
      largo: 750,
      ancho: 550,
      espesor: 18,
      pos: { x: -391, y: 375, z: 0 },
      orientacion: 'vertical-lateral',
      melamina: CATALOGO_MELAMINAS[0],
      cantoLargo: 'RIGIDO_2MM',
      cantoAncho: 'FLEXIBLE_045MM',
      esVetaVertical: true
    },
    {
      id: 'tab_suelo',
      nombre: 'Base / Suelo',
      largo: 764,
      ancho: 550,
      espesor: 18,
      pos: { x: 0, y: 9, z: 0 },
      orientacion: 'horizontal-base',
      melamina: CATALOGO_MELAMINAS[0],
      cantoLargo: 'RIGIDO_2MM',
      cantoAncho: 'NINGUNO',
      esVetaVertical: false
    }
  ]);

  const [selectedBoardId, setSelectedBoardId] = useState<string | null>(tablerosLibres[0]?.id || null);
  const [snapActivado, setSnapActivado] = useState<boolean>(true);

  // Cálculo paramétrico
  const parts = useMemo(() => {
    return calcularPiezasMueble(spec);
  }, [spec]);

  const tableroSeleccionado = useMemo(() => {
    return tablerosLibres.find(t => t.id === selectedBoardId) || null;
  }, [tablerosLibres, selectedBoardId]);

  // Acciones Modo Libre
  const handleAddTablero = (orientacion: OrientacionTablero) => {
    const id = `tab_${Date.now().toString().slice(-4)}`;
    let nuevo: TableroLibre;

    if (orientacion === 'vertical-lateral') {
      nuevo = {
        id,
        nombre: `Lateral ${tablerosLibres.length + 1}`,
        largo: 750,
        ancho: 550,
        espesor: 18,
        pos: { x: 391, y: 375, z: 0 },
        orientacion: 'vertical-lateral',
        melamina: spec.melamina || CATALOGO_MELAMINAS[0],
        cantoLargo: 'RIGIDO_2MM',
        cantoAncho: 'FLEXIBLE_045MM',
        esVetaVertical: true
      };
    } else if (orientacion === 'horizontal-base') {
      nuevo = {
        id,
        nombre: `Repisa / Base ${tablerosLibres.length + 1}`,
        largo: 764,
        ancho: 550,
        espesor: 18,
        pos: { x: 0, y: 375, z: 0 },
        orientacion: 'horizontal-base',
        melamina: spec.melamina || CATALOGO_MELAMINAS[0],
        cantoLargo: 'RIGIDO_2MM',
        cantoAncho: 'NINGUNO',
        esVetaVertical: false
      };
    } else {
      nuevo = {
        id,
        nombre: `Fondo / Puerta ${tablerosLibres.length + 1}`,
        largo: 750,
        ancho: 764,
        espesor: 18,
        pos: { x: 0, y: 375, z: -272 },
        orientacion: 'frontal-fondo',
        melamina: spec.melamina || CATALOGO_MELAMINAS[0],
        cantoLargo: 'FLEXIBLE_045MM',
        cantoAncho: 'FLEXIBLE_045MM',
        esVetaVertical: true
      };
    }

    if (snapActivado && tablerosLibres.length > 0) {
      const { x, y, z } = calcularPosicionConSnap(nuevo, nuevo.pos, tablerosLibres, 25);
      nuevo.pos = { x, y, z };
    }

    setTablerosLibres(prev => [...prev, nuevo]);
    setSelectedBoardId(id);
  };

  const handleDuplicate = (id: string) => {
    const orig = tablerosLibres.find(t => t.id === id);
    if (!orig) return;
    const clon: TableroLibre = {
      ...orig,
      id: `tab_${Date.now().toString().slice(-4)}`,
      nombre: `${orig.nombre} (Copia)`,
      pos: { x: orig.pos.x + 30, y: orig.pos.y + 30, z: orig.pos.z }
    };
    setTablerosLibres(prev => [...prev, clon]);
    setSelectedBoardId(clon.id);
  };

  const handleDelete = (id: string) => {
    setTablerosLibres(prev => prev.filter(t => t.id !== id));
    if (selectedBoardId === id) {
      setSelectedBoardId(null);
    }
  };

  const handleRotateOrientacion = (id: string) => {
    setTablerosLibres(prev => prev.map(t => {
      if (t.id !== id) return t;
      const nextOr: OrientacionTablero = t.orientacion === 'vertical-lateral'
        ? 'horizontal-base'
        : t.orientacion === 'horizontal-base'
        ? 'frontal-fondo'
        : 'vertical-lateral';
      return { ...t, orientacion: nextOr };
    }));
  };

  const handleSelectPlantilla = (plantilla: IPlantillaMueble) => {
    if (plantilla.modoDiseno === 'libre' && plantilla.tablerosLibres) {
      setModoDiseno('libre');
      setTablerosLibres(plantilla.tablerosLibres);
      setSelectedBoardId(plantilla.tablerosLibres[0]?.id || null);
    } else if (plantilla.spec) {
      setModoDiseno('parametrico');
      setSpec(plantilla.spec);
    }
  };

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Encabezado Principal & Selector de Modos */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="badge-wood">🪚 Suite Exclusiva de Carpintería</span>
            <span className="badge-cyan">Three.js PBR On-Device</span>
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: '8px 0 0 0', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Box size={26} color="var(--color-primary)" />
            <span>Diseñador 3D Paramétrico & Despiece Automático</span>
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '4px' }}>
            Modela en 3D interactivo por módulos preestablecidos o diseña libremente pieza a pieza estilo SketchUp con cálculo de herrajes
          </p>
        </div>

        {/* Acciones de Biblioteca y Toggle de Modo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {/* Botones de Biblioteca de Módulos */}
          <button
            type="button"
            className="btn-secondary"
            onClick={() => setModalBibliotecaAbierto(true)}
            style={{ fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px' }}
          >
            <BookOpen size={15} color="var(--color-primary)" />
            <span>📚 Biblioteca</span>
          </button>

          <button
            type="button"
            className="btn-primary-wood"
            onClick={() => setModalGuardarAbierto(true)}
            style={{ fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px', background: '#f59e0b', color: '#0f172a', fontWeight: 700 }}
          >
            <BookmarkPlus size={15} />
            <span>⭐ Guardar Módulo</span>
          </button>

          {/* Toggle de Modo: Paramétrico vs Libre */}
          <div style={{ display: 'flex', background: 'rgba(15,23,42,0.85)', padding: '4px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <button
              type="button"
              onClick={() => setModoDiseno('parametrico')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                fontSize: '0.82rem',
                fontWeight: 700,
                borderRadius: '6px',
                border: modoDiseno === 'parametrico' ? '1px solid var(--color-primary)' : '1px solid transparent',
                background: modoDiseno === 'parametrico' ? 'rgba(56,189,248,0.2)' : 'transparent',
                color: modoDiseno === 'parametrico' ? 'var(--color-primary)' : 'var(--text-secondary)',
                cursor: 'pointer'
              }}
            >
              <Sliders size={15} /> Modo Paramétrico
            </button>

            <button
              type="button"
              onClick={() => setModoDiseno('libre')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                fontSize: '0.82rem',
                fontWeight: 700,
                borderRadius: '6px',
                border: modoDiseno === 'libre' ? '1px solid #10b981' : '1px solid transparent',
                background: modoDiseno === 'libre' ? 'rgba(16,185,129,0.2)' : 'transparent',
                color: modoDiseno === 'libre' ? '#10b981' : 'var(--text-secondary)',
                cursor: 'pointer'
              }}
            >
              <Layers size={15} /> 🪚 Modo Diseño Libre
            </button>
          </div>
        </div>
      </div>

      {/* Grid Principal */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px', alignItems: 'start' }}>
        {/* Columna Izquierda */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {modoDiseno === 'parametrico' ? (
            <ParametricControls spec={spec} onChangeSpec={setSpec} />
          ) : (
            <>
              <FreeDesignToolbar
                tableros={tablerosLibres}
                selectedId={selectedBoardId}
                snapActivado={snapActivado}
                melaminaActiva={spec.melamina || CATALOGO_MELAMINAS[0]}
                onAddTablero={handleAddTablero}
                onToggleSnap={() => setSnapActivado(!snapActivado)}
                onDuplicate={() => { if (selectedBoardId) handleDuplicate(selectedBoardId); }}
                onDelete={() => { if (selectedBoardId) handleDelete(selectedBoardId); }}
                onRotateOrientacion={() => { if (selectedBoardId) handleRotateOrientacion(selectedBoardId); }}
                onReset={() => setTablerosLibres([])}
              />
              {tableroSeleccionado && (
                <SelectedBoardEditor
                  tablero={tableroSeleccionado}
                  onUpdate={(updater) => {
                    setTablerosLibres(prev => prev.map(t => t.id === selectedBoardId ? updater(t) : t));
                  }}
                />
              )}
            </>
          )}
        </div>

        {/* Columna Derecha: Canvas 3D */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <CabinetViewer3D
            spec={spec}
            parts={parts}
            modoDiseno={modoDiseno}
            tablerosLibres={tablerosLibres}
            selectedBoardId={selectedBoardId}
            onSelectBoardId={setSelectedBoardId}
            onTransformBoard={(id, newPos) => {
              setTablerosLibres(prev => prev.map(t => t.id === id ? { ...t, pos: newPos } : t));
            }}
            onChangeSpec={setSpec}
          />
        </div>
      </div>

      {/* Selector de Catálogo de Melaminas */}
      <MaterialTexturePicker
        spec={spec}
        onChangeSpec={(updater) => {
          setSpec(prev => {
            const next = updater(prev);
            if (modoDiseno === 'libre' && selectedBoardId && next.melamina) {
              setTablerosLibres(tl => tl.map(t => t.id === selectedBoardId ? { ...t, melamina: next.melamina! } : t));
            }
            return next;
          });
        }}
      />

      {/* Pestañas Inferiores Duales */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '8px' }}>
          <button
            type="button"
            onClick={() => setTabInferior('despiece')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              fontSize: '0.85rem',
              fontWeight: 700,
              borderRadius: '8px',
              border: tabInferior === 'despiece' ? '1px solid var(--color-primary)' : '1px solid transparent',
              background: tabInferior === 'despiece' ? 'rgba(56,189,248,0.15)' : 'transparent',
              color: tabInferior === 'despiece' ? 'var(--color-primary)' : 'var(--text-secondary)',
              cursor: 'pointer'
            }}
          >
            <Scissors size={16} />
            <span>1. Despiece & Lista de Corte</span>
          </button>

          <button
            type="button"
            onClick={() => setTabInferior('herrajes')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              fontSize: '0.85rem',
              fontWeight: 700,
              borderRadius: '8px',
              border: tabInferior === 'herrajes' ? '1.5px solid #f59e0b' : '1px solid transparent',
              background: tabInferior === 'herrajes' ? 'rgba(245,158,11,0.15)' : 'transparent',
              color: tabInferior === 'herrajes' ? '#f59e0b' : 'var(--text-secondary)',
              cursor: 'pointer'
            }}
          >
            <Wrench size={16} />
            <span>2. Herrajes, Tornillería & Cotización ($ COP)</span>
          </button>
        </div>

        {tabInferior === 'despiece' ? (
          <ResumenDespiece3D
            spec={spec}
            parts={parts}
            modoDiseno={modoDiseno}
            tablerosLibres={tablerosLibres}
          />
        ) : (
          <ResumenHerrajes3D
            spec={spec}
            parts={parts}
            modoDiseno={modoDiseno}
            tablerosLibres={tablerosLibres}
          />
        )}
      </div>

      {/* Modal Guardar Plantilla */}
      <ModalGuardarPlantilla
        isOpen={modalGuardarAbierto}
        spec={spec}
        modoDiseno={modoDiseno}
        tablerosLibres={tablerosLibres}
        onClose={() => setModalGuardarAbierto(false)}
        onSaved={() => {}}
      />

      {/* Modal Biblioteca de Plantillas */}
      <ModalBibliotecaPlantillas
        isOpen={modalBibliotecaAbierto}
        onClose={() => setModalBibliotecaAbierto(false)}
        onSelectPlantilla={handleSelectPlantilla}
      />
    </div>
  );
}
