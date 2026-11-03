// ============================================================
// ARCHIVO: src/features/carpinteria/components/ModalGuardarPlantilla.tsx
// QUÉ HACE: Modal para guardar el diseño 3D actual como plantilla en Firestore.
// POR QUÉ: Facilita la creación de bibliotecas de módulos reutilizables.
// ============================================================
import React, { useState } from 'react';
import { X, BookmarkPlus, Save, Sparkles } from 'lucide-react';
import { CabinetSpec } from '../types/cabinet3d';
import { TableroLibre } from '../types/freeDesign';
import { CategoriaPlantillaMueble, guardarPlantillaMueble } from '../services/plantillasMueblesService';

interface Props {
  isOpen: boolean;
  spec: CabinetSpec;
  modoDiseno: 'parametrico' | 'libre';
  tablerosLibres?: TableroLibre[];
  onClose: () => void;
  onSaved: () => void;
}

const CATEGORIAS: CategoriaPlantillaMueble[] = [
  'Cocina',
  'Closets',
  'Baños',
  'Sala / TV',
  'Oficina',
  'Especial'
];

export default function ModalGuardarPlantilla({
  isOpen,
  spec,
  modoDiseno,
  tablerosLibres = [],
  onClose,
  onSaved
}: Props) {
  const [nombre, setNombre] = useState(spec.nombre || 'Mi Módulo Personalizado');
  const [categoria, setCategoria] = useState<CategoriaPlantillaMueble>('Cocina');
  const [descripcion, setDescripcion] = useState('');
  const [guardando, setGuardando] = useState(false);

  if (!isOpen) return null;

  const w = modoDiseno === 'parametrico' ? spec.ancho : 800;
  const h = modoDiseno === 'parametrico' ? spec.alto : 750;
  const d = modoDiseno === 'parametrico' ? spec.profundidad : 550;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) {
      alert('Por favor ingresa un nombre para la plantilla.');
      return;
    }

    setGuardando(true);
    try {
      await guardarPlantillaMueble({
        nombre: nombre.trim(),
        categoria,
        modoDiseno,
        spec: modoDiseno === 'parametrico' ? spec : undefined,
        tablerosLibres: modoDiseno === 'libre' ? tablerosLibres : undefined,
        dimensiones: { ancho: w, alto: h, profundidad: d },
        descripcion: descripcion.trim()
      });
      alert('¡Plantilla guardada con éxito en tu biblioteca!');
      onSaved();
      onClose();
    } catch (err: any) {
      alert('Error al guardar plantilla: ' + (err.message || err));
    } finally {
      setGuardando(false);
    }
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
        maxWidth: '500px',
        border: '1.5px solid #f59e0b',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '10px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
            <BookmarkPlus size={20} />
            <span>Guardar en Biblioteca de Módulos</span>
          </h3>
          <button type="button" onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
              Nombre de la Plantilla / Módulo:
            </label>
            <input
              type="text"
              className="input"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej. Bajo Mesón 3 Cajones Cacerolero"
              required
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                Categoría:
              </label>
              <select
                className="input"
                value={categoria}
                onChange={(e) => setCategoria(e.target.value as any)}
                style={{ width: '100%' }}
              >
                {CATEGORIAS.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                Dimensiones ($W \times H \times D$):
              </label>
              <div className="font-mono-num" style={{ padding: '8px 10px', background: 'rgba(0,0,0,0.3)', borderRadius: '6px', fontSize: '0.8rem', color: 'var(--color-primary)', fontWeight: 700 }}>
                {w} × {h} × {d} mm
              </div>
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
              Notas / Especificaciones (Opcional):
            </label>
            <input
              type="text"
              className="input"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Ej. Rieles telescópicos pesados, melamina 18mm"
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
            <button type="button" className="btn-secondary" onClick={onClose} disabled={guardando}>
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-primary-wood"
              disabled={guardando}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#f59e0b', color: '#0f172a', fontWeight: 700 }}
            >
              <Save size={16} />
              <span>{guardando ? 'Guardando...' : 'Guardar Plantilla'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
