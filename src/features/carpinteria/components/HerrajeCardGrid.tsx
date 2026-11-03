// ============================================================
// ARCHIVO: src/features/carpinteria/components/HerrajeCardGrid.tsx
// QUÉ HACE: Renderizado de tarjetas y tabla de herrajes con búsqueda y filtros.
// POR QUÉ: Ergonomía visual de taller con tipografía JetBrains Mono y precios COP.
// ============================================================
import React, { useState, useMemo } from 'react';
import { Search, Edit, Trash2, Tag, Wrench, DollarSign } from 'lucide-react';
import { IHerrajeDB, eliminarHerrajeFirestore } from '../services/herrajesService';
import { CategoriaHerraje } from '../types/herrajes';

interface Props {
  herrajes: IHerrajeDB[];
  onEditar: (herraje: IHerrajeDB) => void;
  onActualizado: () => void;
}

const CHIPS_CATEGORIAS: { id: string; label: string }[] = [
  { id: 'todos', label: '🏷️ Todos' },
  { id: 'Tornillería', label: '🔩 Tornillería' },
  { id: 'Bisagras', label: '🚪 Bisagras' },
  { id: 'Correderas', label: '↔️ Correderas' },
  { id: 'Tiradores', label: '🖐️ Tiradores' },
  { id: 'Accesorios Closet', label: '👔 Closet' },
  { id: 'Soportes & Niveladores', label: '🧱 Soportes & Patas' },
  { id: 'Pistones & Neumáticos', label: '💨 Pistones' }
];

export default function HerrajeCardGrid({ herrajes, onEditar, onActualizado }: Props) {
  const [busqueda, setBusqueda] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('todos');

  const filtrados = useMemo(() => {
    return herrajes.filter(h => {
      const matchTexto = h.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        (h.proveedorNombre || '').toLowerCase().includes(busqueda.toLowerCase());
      const matchCat = categoriaFiltro === 'todos' || h.subcategoria === categoriaFiltro;
      return matchTexto && matchCat;
    });
  }, [herrajes, busqueda, categoriaFiltro]);

  const handleEliminar = async (id?: string) => {
    if (!id) return;
    if (confirm('¿Estás seguro de eliminar este herraje del catálogo?')) {
      await eliminarHerrajeFirestore(id);
      onActualizado();
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {/* Barra de Búsqueda y Chips */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ position: 'relative', width: '100%' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
          <input
            type="text"
            className="input"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre, marca o especificación (ej. Blum, 45cm, Cierre Suave)..."
            style={{ width: '100%', paddingLeft: '36px' }}
          />
        </div>

        {/* Chips de Categorías */}
        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
          {CHIPS_CATEGORIAS.map(chip => (
            <button
              key={chip.id}
              type="button"
              onClick={() => setCategoriaFiltro(chip.id)}
              style={{
                whiteSpace: 'nowrap',
                padding: '5px 10px',
                fontSize: '0.75rem',
                fontWeight: 600,
                borderRadius: '20px',
                border: categoriaFiltro === chip.id ? '1px solid var(--color-primary)' : '1px solid rgba(255,255,255,0.08)',
                background: categoriaFiltro === chip.id ? 'rgba(56,189,248,0.15)' : 'rgba(255,255,255,0.03)',
                color: categoriaFiltro === chip.id ? 'var(--color-primary)' : 'var(--text-secondary)',
                cursor: 'pointer'
              }}
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid de Tarjetas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
        {filtrados.map(herraje => (
          <div
            key={herraje.id}
            className="card"
            style={{
              padding: '14px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '8px',
              border: '1px solid rgba(255,255,255,0.07)',
              transition: 'border-color 0.2s'
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '6px', marginBottom: '4px' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--color-primary)', background: 'rgba(56,189,248,0.1)', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>
                  {herraje.subcategoria || 'Herrajes'}
                </span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                  {herraje.proveedorNombre || 'Genérico'}
                </span>
              </div>
              <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-main)', margin: '4px 0' }}>
                {herraje.nombre}
              </h4>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '8px' }}>
              <div>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', display: 'block' }}>Precio / {herraje.unidad || 'und'}:</span>
                <strong className="font-mono-num" style={{ fontSize: '0.95rem', color: '#f59e0b' }}>
                  ${(herraje.precioUnitario || 0).toLocaleString('es-CO')} COP
                </strong>
              </div>

              <div style={{ display: 'flex', gap: '4px' }}>
                <button
                  type="button"
                  onClick={() => onEditar(herraje)}
                  style={{ background: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.3)', color: 'var(--color-primary)', borderRadius: '6px', padding: '5px 8px', cursor: 'pointer' }}
                  title="Editar"
                >
                  <Edit size={13} />
                </button>
                <button
                  type="button"
                  onClick={() => handleEliminar(herraje.id)}
                  style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', borderRadius: '6px', padding: '5px 8px', cursor: 'pointer' }}
                  title="Eliminar"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtrados.length === 0 && (
        <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-secondary)', background: 'rgba(15,23,42,0.4)', borderRadius: '8px' }}>
          No se encontraron herrajes con los filtros seleccionados.
        </div>
      )}
    </div>
  );
}
