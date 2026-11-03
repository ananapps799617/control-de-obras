// ============================================================
// ARCHIVO: src/features/carpinteria/types/herrajes.ts
// QUÉ HACE: Tipos e interfaces del catálogo de herrajes y tornillería.
// POR QUÉ: Cálculo automático de ferretería y costos en pesos colombianos ($ COP).
// ============================================================

export type CategoriaHerraje = 
  | 'Tornillería' 
  | 'Bisagras' 
  | 'Correderas' 
  | 'Tiradores' 
  | 'Accesorios Closet' 
  | 'Soportes & Niveladores' 
  | 'Pistones & Neumáticos';

export interface IHerrajeCatalogo {
  id: string;
  nombre: string;
  categoria: CategoriaHerraje;
  unidad: 'und' | 'par' | 'set' | 'm';
  precioUnitario: number; // en COP
  descripcion?: string;
}

export interface IHerrajeCalculado {
  id: string;
  nombre: string;
  categoria: CategoriaHerraje;
  cantidad: number;
  unidad: 'und' | 'par' | 'set' | 'm';
  precioUnitario: number;
  subtotal: number;
  origen: 'automatico' | 'personalizado';
}

// Precios de referencia comercial en ferretería colombiana (COP)
export const PRECIOS_HERRAJES_BASE: Record<string, IHerrajeCatalogo> = {
  'tornillo-4x50': { id: 'tornillo-4x50', nombre: 'Tornillo Ensamble 4x50mm Drywall / Spax', categoria: 'Tornillería', unidad: 'und', precioUnitario: 120 },
  'tornillo-3x15': { id: 'tornillo-3x15', nombre: 'Tornillo Trasera / Fondo 3x15mm', categoria: 'Tornillería', unidad: 'und', precioUnitario: 60 },
  'tornillo-3.5x15': { id: 'tornillo-3.5x15', nombre: 'Tornillo Bisagra / Corredera 3.5x15mm', categoria: 'Tornillería', unidad: 'und', precioUnitario: 80 },
  'tornillo-m4x22': { id: 'tornillo-m4x22', nombre: 'Tornillo Tirador M4x22mm', categoria: 'Tornillería', unidad: 'und', precioUnitario: 150 },
  
  'bisagra-35-cierre-suave': { id: 'bisagra-35-cierre-suave', nombre: 'Bisagra Cazoleta 35mm Cierre Suave (Parche)', categoria: 'Bisagras', unidad: 'und', precioUnitario: 4500 },
  'corredera-telescopica-45': { id: 'corredera-telescopica-45', nombre: 'Corredera Telescópica Pesada 45cm Cierre Suave', categoria: 'Correderas', unidad: 'par', precioUnitario: 18500 },
  
  'tirador-barra-128': { id: 'tirador-barra-128', nombre: 'Manija / Tirador Barra Aluminio 128mm', categoria: 'Tiradores', unidad: 'und', precioUnitario: 6500 },
  'soporte-repisa-piton': { id: 'soporte-repisa-piton', nombre: 'Soporte de Repisa Niquelado (Pitón 5mm)', categoria: 'Soportes & Niveladores', unidad: 'und', precioUnitario: 400 },
  'pata-niveladora-100': { id: 'pata-niveladora-100', nombre: 'Pata Niveladora Plástica Negra 100mm', categoria: 'Soportes & Niveladores', unidad: 'und', precioUnitario: 2200 },
  
  'brazo-neumatico-100n': { id: 'brazo-neumatico-100n', nombre: 'Pistón de Gas Neumático 100N (Puerta Basculante)', categoria: 'Pistones & Neumáticos', unidad: 'und', precioUnitario: 12000 },
  'tubo-perchero-aluminio': { id: 'tubo-perchero-aluminio', nombre: 'Tubo Perchero Ovalado Aluminio + 2 Soportes', categoria: 'Accesorios Closet', unidad: 'set', precioUnitario: 16000 },

  // Materiales en Placa y Canto
  'melamina-m2': { id: 'melamina-m2', nombre: 'Tablero Melamina (Costo m² aprox)', categoria: 'Tornillería', unidad: 'm', precioUnitario: 58000 },
  'canto-rigido-m': { id: 'canto-rigido-m', nombre: 'Tapacanto Rígido PVC 2mm (Metro Lineal)', categoria: 'Tornillería', unidad: 'm', precioUnitario: 2800 },
  'canto-flexible-m': { id: 'canto-flexible-m', nombre: 'Tapacanto Flexible PVC 0.45mm (Metro Lineal)', categoria: 'Tornillería', unidad: 'm', precioUnitario: 1200 }
};
