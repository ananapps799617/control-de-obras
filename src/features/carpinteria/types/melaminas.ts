// ============================================================
// ARCHIVO: src/features/carpinteria/types/melaminas.ts
// QUÉ HACE: Catálogo y tipos de melaminas comerciales Duratex y Primadera.
// POR QUÉ: Tipado estricto (0 any) y representación fotorrealista PBR.
// ============================================================

export type MarcaMelamina = 'Duratex' | 'Primadera';

export type CategoriaMelamina = 'Maderas Claras' | 'Maderas Oscuras' | 'Unicolores' | 'Piedras & Textiles';

export interface IMelamina {
  id: string;
  nombre: string;
  marca: MarcaMelamina;
  categoria: CategoriaMelamina;
  colorHex: string;
  roughness: number;
  metalness: number;
  tipoVeta: 'madera-suave' | 'madera-fuerte' | 'lino' | 'solido' | 'mineral';
  espesoresDisponibles: number[]; // ej. [15, 18, 36]
}

export const CATALOGO_MELAMINAS: IMelamina[] = [
  // --- DURATEX (Maderas) ---
  { id: 'dur-caramelo', nombre: 'Caramelo', marca: 'Duratex', categoria: 'Maderas Claras', colorHex: '#C68B59', roughness: 0.72, metalness: 0.05, tipoVeta: 'madera-suave', espesoresDisponibles: [15, 18] },
  { id: 'dur-viena', nombre: 'Viena', marca: 'Duratex', categoria: 'Maderas Claras', colorHex: '#D7C4A5', roughness: 0.75, metalness: 0.03, tipoVeta: 'madera-suave', espesoresDisponibles: [15, 18] },
  { id: 'dur-fresno', nombre: 'Fresno', marca: 'Duratex', categoria: 'Maderas Claras', colorHex: '#E2D5BE', roughness: 0.78, metalness: 0.02, tipoVeta: 'madera-suave', espesoresDisponibles: [15, 18] },
  { id: 'dur-rovere', nombre: 'Rovere', marca: 'Duratex', categoria: 'Maderas Claras', colorHex: '#B59473', roughness: 0.70, metalness: 0.05, tipoVeta: 'madera-fuerte', espesoresDisponibles: [15, 18, 36] },
  { id: 'dur-roble-rustico', nombre: 'Roble Rústico', marca: 'Duratex', categoria: 'Maderas Oscuras', colorHex: '#8B5A2B', roughness: 0.68, metalness: 0.06, tipoVeta: 'madera-fuerte', espesoresDisponibles: [15, 18] },
  { id: 'dur-nogal-terra', nombre: 'Nogal Terracota', marca: 'Duratex', categoria: 'Maderas Oscuras', colorHex: '#6F4E37', roughness: 0.65, metalness: 0.05, tipoVeta: 'madera-fuerte', espesoresDisponibles: [15, 18] },
  { id: 'dur-wengue', nombre: 'Wengue Imperial', marca: 'Duratex', categoria: 'Maderas Oscuras', colorHex: '#3D2817', roughness: 0.60, metalness: 0.08, tipoVeta: 'madera-suave', espesoresDisponibles: [15, 18] },
  
  // --- DURATEX (Unicolores & Piedras) ---
  { id: 'dur-blanco-polar', nombre: 'Blanco Polar', marca: 'Duratex', categoria: 'Unicolores', colorHex: '#F8FAFC', roughness: 0.85, metalness: 0.01, tipoVeta: 'solido', espesoresDisponibles: [15, 18] },
  { id: 'dur-arena', nombre: 'Arena Suave', marca: 'Duratex', categoria: 'Unicolores', colorHex: '#E2D8C3', roughness: 0.82, metalness: 0.02, tipoVeta: 'solido', espesoresDisponibles: [15, 18] },
  { id: 'dur-gris-humo', nombre: 'Gris Humo', marca: 'Duratex', categoria: 'Unicolores', colorHex: '#64748B', roughness: 0.75, metalness: 0.05, tipoVeta: 'solido', espesoresDisponibles: [15, 18] },
  { id: 'dur-plomo', nombre: 'Plomo Urbano', marca: 'Duratex', categoria: 'Unicolores', colorHex: '#334155', roughness: 0.70, metalness: 0.08, tipoVeta: 'solido', espesoresDisponibles: [15, 18] },
  { id: 'dur-negro', nombre: 'Negro Profundo', marca: 'Duratex', categoria: 'Unicolores', colorHex: '#0F172A', roughness: 0.70, metalness: 0.10, tipoVeta: 'solido', espesoresDisponibles: [15, 18] },
  { id: 'dur-calacatta', nombre: 'Mármol Calacatta', marca: 'Duratex', categoria: 'Piedras & Textiles', colorHex: '#EDE8E1', roughness: 0.50, metalness: 0.15, tipoVeta: 'mineral', espesoresDisponibles: [15, 18] },

  // --- PRIMADERA (Maderas) ---
  { id: 'pri-teka', nombre: 'Teka', marca: 'Primadera', categoria: 'Maderas Claras', colorHex: '#BA8C63', roughness: 0.70, metalness: 0.05, tipoVeta: 'madera-fuerte', espesoresDisponibles: [15, 18] },
  { id: 'pri-roble-real', nombre: 'Roble Real', marca: 'Primadera', categoria: 'Maderas Claras', colorHex: '#D2B48C', roughness: 0.72, metalness: 0.04, tipoVeta: 'madera-suave', espesoresDisponibles: [15, 18] },
  { id: 'pri-roble-claro', nombre: 'Roble Claro', marca: 'Primadera', categoria: 'Maderas Claras', colorHex: '#E0CCA9', roughness: 0.76, metalness: 0.03, tipoVeta: 'madera-suave', espesoresDisponibles: [15, 18] },
  { id: 'pri-cedro-amaz', nombre: 'Cedro Amazónico', marca: 'Primadera', categoria: 'Maderas Oscuras', colorHex: '#9E472A', roughness: 0.65, metalness: 0.05, tipoVeta: 'madera-fuerte', espesoresDisponibles: [15, 18] },
  { id: 'pri-sapan', nombre: 'Sapán Nativo', marca: 'Primadera', categoria: 'Maderas Oscuras', colorHex: '#803822', roughness: 0.64, metalness: 0.06, tipoVeta: 'madera-fuerte', espesoresDisponibles: [15, 18] },
  { id: 'pri-nogal-andino', nombre: 'Nogal Andino', marca: 'Primadera', categoria: 'Maderas Oscuras', colorHex: '#5C3A21', roughness: 0.62, metalness: 0.06, tipoVeta: 'madera-fuerte', espesoresDisponibles: [15, 18] },

  // --- PRIMADERA (Linos & Unicolores) ---
  { id: 'pri-lino-blanco', nombre: 'Lino Blanco', marca: 'Primadera', categoria: 'Piedras & Textiles', colorHex: '#F1EFEA', roughness: 0.88, metalness: 0.02, tipoVeta: 'lino', espesoresDisponibles: [15, 18] },
  { id: 'pri-lino-gris', nombre: 'Lino Gris', marca: 'Primadera', categoria: 'Piedras & Textiles', colorHex: '#C5C1B8', roughness: 0.86, metalness: 0.03, tipoVeta: 'lino', espesoresDisponibles: [15, 18] },
  { id: 'pri-macadamia', nombre: 'Macadamia', marca: 'Primadera', categoria: 'Unicolores', colorHex: '#D5C4B1', roughness: 0.80, metalness: 0.02, tipoVeta: 'solido', espesoresDisponibles: [15, 18] },
  { id: 'pri-blanco-glaciar', nombre: 'Blanco Glaciar', marca: 'Primadera', categoria: 'Unicolores', colorHex: '#FFFFFF', roughness: 0.85, metalness: 0.01, tipoVeta: 'solido', espesoresDisponibles: [15, 18] },
  { id: 'pri-gris-grafito', nombre: 'Gris Grafito', marca: 'Primadera', categoria: 'Unicolores', colorHex: '#4B5563', roughness: 0.72, metalness: 0.07, tipoVeta: 'solido', espesoresDisponibles: [15, 18] },
  { id: 'pri-taupe', nombre: 'Taupé Elegance', marca: 'Primadera', categoria: 'Unicolores', colorHex: '#8C827A', roughness: 0.78, metalness: 0.04, tipoVeta: 'solido', espesoresDisponibles: [15, 18] }
];
