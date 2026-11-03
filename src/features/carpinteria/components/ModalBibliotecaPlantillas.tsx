// ============================================================
// ARCHIVO: src/features/carpinteria/components/ModalBibliotecaPlantillas.tsx
// QUÉ HACE: Modal para explorar, filtrar y cargar plantillas de muebles en el Visor 3D.
// POR QUÉ: Permite modular cocinas y clósets completos en segundos.
// ============================================================
import React, { useState, useEffect, useMemo } from 'react';
import { X, Search, BookOpen, Download, Trash2, Sparkles, RefreshCw, Layers } from 'lucide-react';
import { 
  IPlantillaMueble, 
  CategoriaPlantillaMueble, 
  obtenerPlantillasMuebles, 
  eliminarPlantillaMueble, 
  sembrarPlantillasBase 
} from '../services/plantillasMueblesService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelectPlantilla: (plantilla: IPlantillaMueble) => void;
}

const CHIPS_CATEGORIAS: { id: string; label: string }[] = [
  { id: 'todos', label: '🏷️ Todos' },
  { id: 'Cocina', label: '🍳 Cocina' },
  { id: 'Closets', label: '👔 Clósets' },
  { id: 'Baños', label: '🚿 Baños' },
  { id: 'Sala / TV', label: '📺 Sala / TV' },
  { id: 'Oficina', label: '💼 Oficina' }
];

export default function ModalBibliotecaPlantillas({ isOpen, onClose, onSelectPlantilla }: Props) {
  const [plantillas, setPlantillas] = useState<IPlantillaMueble[]>([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('todos');
  const [sembrando, setSembrando] = useState(false);

  const cargarDatos = async () => {
    setCargando(true);
    try {
      const lista = await obtenerPlantillasMuebles();
      setPlantillas(lista);
    } catch (err) {
      console.error('Error al cargar plantillas:', err);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      cargarDatos();
    }
  }, [isOpen]);

  const filtradas = useMemo(() => {
    return plantillas.filter(p => {
      const matchTexto = p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        (p.descripcion || '').toLowerCase().includes(busqueda.toLowerCase());
      const matchCat = categoriaFiltro === 'todos' || p.categoria === categoriaFiltro;
      return matchTexto && matchCat;
    });
  }, [plantillas, busqueda, categoriaFiltro]);

  const handleEliminar = async (id?: string) => {
    if (!id) return;
    if (confirm('¿Eliminar esta plantilla de tu biblioteca?')) {
      await eliminarPlantillaMueble(id);
      await cargarDatos();
    }
  };

  const handleSembrar = async () => {
    setSembrando(true);
    try {
      const sembradas = await sembrarPlantillasBase();
      alert(`Se han añadido ${sembradas} plantillas base a tu biblioteca.`);
      await cargarDatos();
    } catch (err: any) {
      alert('Error al cargar plantillas base: ' + (err.message || err));
    } finally {
      setSembrando(false);
    }
  };

  if (!isOpen) return null;

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
        maxWidth: '820px',
        maxHeight: '90vh',
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
            <span className="badge-cyan" style={{ fontSize: '0.7rem' }}>Biblioteca Firestore</span>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '8px', margin: '4px 0 0 0' }}>
              <BookOpen size={20} />
              <span>Biblioteca de Módulos & Muebles Favoritos</span>
            </h3>
          </div>
          <button type="button" onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Buscador y Chips */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
              <input
                type="text"
                className="input"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar por nombre o tipo de módulo (ej. Bajo Mesón, Torre, Alacena)..."
                style={{ width: '100%', paddingLeft: '36px' }}
              />
            </div>

            <button
              type="button"
              className="btn-secondary"
              onClick={handleSembrar}
              disabled={sembrando}
              style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}
            >
              <Sparkles size={14} color="#10b981" />
              <span>{sembrando ? 'Cargando...' : '🌱 Módulos Base'}</span>
            </button>
          </div>

          <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
            {CHIPS_CATEGORIAS.map(chip => (
              <button
                key={chip.id}
                type="button"
                onClick={() => setCategoriaFiltro(chip.id)}
                style={{
                  padding: '5px 12px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  borderRadius: '20px',
                  border: categoriaFiltro === chip.id ? '1px solid var(--color-primary)' : '1px solid rgba(255,255,255,0.08)',
                  background: categoriaFiltro === chip.id ? 'rgba(56,189,248,0.15)' : 'rgba(255,255,255,0.03)',
                  color: categoriaFiltro === chip.id ? 'var(--color-primary)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>

        {/* Grid de Tarjetas */}
        {cargando ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 10px auto', color: 'var(--color-primary)' }} />
            <span>Cargando plantillas de módulos...</span>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '12px', maxHeight: '420px', overflowY: 'auto' }}>
            {filtradas.map(p => (
              <div
                key={p.id}
                className="card"
                style={{
                  padding: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '8px',
                  border: '1px solid rgba(255,255,255,0.08)'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontSize: '0.68rem', color: 'var(--color-primary)', background: 'rgba(56,189,248,0.1)', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>
                      {p.categoria}
                    </span>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>
                      {p.modoDiseno === 'libre' ? '🪚 Libre' : '📐 Paramétrico'}
                    </span>
                  </div>

                  <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-main)', margin: '4px 0' }}>
                    {p.nombre}
                  </h4>

                  <div className="font-mono-num" style={{ fontSize: '0.78rem', color: '#f59e0b', fontWeight: 600 }}>
                    {p.dimensiones.ancho} × {p.dimensiones.alto} × {p.dimensiones.profundidad} mm
                  </div>

                  {p.descripcion && (
                    <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
                      {p.descripcion}
                    </p>
                  )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '8px' }}>
                  <button
                    type="button"
                    className="btn-primary-cyan"
                    onClick={() => {
                      onSelectPlantilla(p);
                      onClose();
                    }}
                    style={{ fontSize: '0.75rem', padding: '5px 10px', display: 'flex', alignItems: 'center', gap: '5px' }}
                  >
                    <Download size={13} />
                    <span>Cargar en 3D</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleEliminar(p.id)}
                    style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '4px' }}
                    title="Eliminar plantilla"
                  >
                    <Trash2 size={14} color="#ef4444" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {filtradas.length === 0 && !cargando && (
          <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-secondary)', background: 'rgba(15,23,42,0.4)', borderRadius: '8px' }}>
            No se encontraron plantillas. Haz clic en <strong>"🌱 Módulos Base"</strong> para sembrar módulos estándar de taller.
          </div>
        )}
      </div>
    </div>
  );
}
