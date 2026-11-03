// ============================================================
// ARCHIVO: src/features/carpinteria/components/MaterialTexturePicker.tsx
// QUÉ HACE: Selector visual y catálogo de melaminas Duratex y Primadera.
// POR QUÉ: Experiencia fotorrealista PBR táctil con catálogo oficial.
// ============================================================
import React, { useState, useMemo } from 'react';
import { Palette, Check, Search, Filter } from 'lucide-react';
import { CATALOGO_MELAMINAS, IMelamina, MarcaMelamina, CategoriaMelamina } from '../types/melaminas';
import { CabinetSpec } from '../types/cabinet3d';

interface Props {
  spec: CabinetSpec;
  onChangeSpec: (updater: (prev: CabinetSpec) => CabinetSpec) => void;
}

export default function MaterialTexturePicker({ spec, onChangeSpec }: Props) {
  const [marcaFiltro, setMarcaFiltro] = useState<MarcaMelamina | 'Todas'>('Todas');
  const [catFiltro, setCatFiltro] = useState<CategoriaMelamina | 'Todas'>('Todas');
  const [busqueda, setBusqueda] = useState<string>('');

  const melaminasFiltradas = useMemo(() => {
    return CATALOGO_MELAMINAS.filter(m => {
      const matchMarca = marcaFiltro === 'Todas' || m.marca === marcaFiltro;
      const matchCat = catFiltro === 'Todas' || m.categoria === catFiltro;
      const matchSearch = busqueda.trim() === '' || m.nombre.toLowerCase().includes(busqueda.toLowerCase());
      return matchMarca && matchCat && matchSearch;
    });
  }, [marcaFiltro, catFiltro, busqueda]);

  const melaminaActiva = spec.melamina || CATALOGO_MELAMINAS[0];

  const handleSelectMelamina = (m: IMelamina) => {
    onChangeSpec(prev => ({
      ...prev,
      melamina: m,
      acabado: m.id.includes('cedro') ? 'cedro' : (m.id.includes('blanco') ? 'blanco' : (m.id.includes('arena') ? 'arena' : (m.id.includes('gris') ? 'gris' : 'roble')))
    }));
  };

  return (
    <div className="card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Encabezado del Selector */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
          <Palette size={16} color="var(--color-primary)" />
          <span>Catálogo de Melaminas Reales</span>
        </h3>
        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-primary)' }}>
          {melaminaActiva.marca.toUpperCase()} • {melaminaActiva.nombre}
        </span>
      </div>

      {/* Tabs de Marcas (Duratex / Primadera / Todas) */}
      <div style={{ display: 'flex', gap: '6px' }}>
        {(['Todas', 'Duratex', 'Primadera'] as (MarcaMelamina | 'Todas')[]).map(marca => (
          <button
            key={marca}
            type="button"
            onClick={() => setMarcaFiltro(marca)}
            style={{
              padding: '5px 10px',
              fontSize: '0.75rem',
              fontWeight: 600,
              borderRadius: '6px',
              border: marcaFiltro === marca ? '1px solid var(--color-primary)' : '1px solid rgba(255,255,255,0.08)',
              background: marcaFiltro === marca ? 'rgba(56,189,248,0.2)' : 'rgba(255,255,255,0.03)',
              color: marcaFiltro === marca ? 'var(--color-primary)' : 'var(--text-secondary)',
              cursor: 'pointer'
            }}
          >
            {marca === 'Todas' ? 'Todas las Marcas' : `🌲 ${marca}`}
          </button>
        ))}
      </div>

      {/* Buscador & Categorías */}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={14} style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
          <input
            type="text"
            placeholder="Buscar acabado (ej. Viena, Teka, Caramelo)..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="input"
            style={{ width: '100%', paddingLeft: '28px', fontSize: '0.75rem', padding: '5px 8px 5px 28px' }}
          />
        </div>

        <select
          className="input"
          value={catFiltro}
          onChange={(e) => setCatFiltro(e.target.value as any)}
          style={{ fontSize: '0.75rem', padding: '5px 8px', maxWidth: '140px' }}
        >
          <option value="Todas">Todas las Líneas</option>
          <option value="Maderas Claras">Maderas Claras</option>
          <option value="Maderas Oscuras">Maderas Oscuras</option>
          <option value="Unicolores">Unicolores</option>
          <option value="Piedras & Textiles">Piedras & Textiles</option>
        </select>
      </div>

      {/* Grid de Muestras (Swatches) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
        gap: '8px',
        maxHeight: '220px',
        overflowY: 'auto',
        paddingRight: '4px'
      }}>
        {melaminasFiltradas.map(m => {
          const isSelected = melaminaActiva.id === m.id;
          return (
            <div
              key={m.id}
              onClick={() => handleSelectMelamina(m)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 8px',
                borderRadius: '6px',
                border: isSelected ? '1.5px solid var(--color-primary)' : '1px solid rgba(255,255,255,0.06)',
                background: isSelected ? 'rgba(56,189,248,0.12)' : 'rgba(255,255,255,0.02)',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {/* Muestra de Color Circular */}
              <div style={{
                width: '22px',
                height: '22px',
                borderRadius: '50%',
                background: m.colorHex,
                border: '1px solid rgba(255,255,255,0.2)',
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {isSelected && <Check size={12} color="#0f172a" strokeWidth={3} />}
              </div>

              {/* Info de Melamina */}
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontSize: '0.74rem', fontWeight: 600, color: 'var(--text-main)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                  {m.nombre}
                </div>
                <div style={{ fontSize: '0.65rem', color: m.marca === 'Duratex' ? '#f59e0b' : '#38bdf8' }}>
                  {m.marca}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
