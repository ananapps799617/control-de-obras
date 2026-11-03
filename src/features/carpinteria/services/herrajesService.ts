// ============================================================
// ARCHIVO: src/features/carpinteria/services/herrajesService.ts
// QUÉ HACE: Servicio especializado para la gestión de herrajes en Firestore.
// POR QUÉ: Reutiliza la colección 'materiales' con categoría 'Herrajes' ($0 costo Cloud).
// ============================================================
import { 
  obtenerMateriales, 
  crearMaterial, 
  actualizarMaterial, 
  eliminarMaterial, 
  IMaterial 
} from '../../../services/materialesService';
import { CategoriaHerraje, PRECIOS_HERRAJES_BASE } from '../types/herrajes';

export interface IHerrajeDB extends IMaterial {
  subcategoria?: CategoriaHerraje;
  codigoReferencia?: string;
}

export async function obtenerHerrajesFirestore(): Promise<IHerrajeDB[]> {
  const materiales = await obtenerMateriales();
  return materiales
    .filter(m => m.categoria === 'Herrajes' || m.categoria === 'Ferretería')
    .map(m => ({
      ...m,
      subcategoria: (m as any).subcategoria || 'Tornillería'
    }));
}

export async function crearHerrajeFirestore(herraje: Partial<IHerrajeDB>): Promise<string> {
  return await crearMaterial({
    ...herraje,
    categoria: 'Herrajes',
    unidad: herraje.unidad || 'und',
    precioUnitario: Number(herraje.precioUnitario || 0)
  });
}

export async function actualizarHerrajeFirestore(id: string, herraje: Partial<IHerrajeDB>): Promise<void> {
  return await actualizarMaterial(id, {
    ...herraje,
    precioUnitario: Number(herraje.precioUnitario || 0)
  });
}

export async function eliminarHerrajeFirestore(id: string): Promise<void> {
  return await eliminarMaterial(id);
}

export async function sembrarHerrajesBaseFirestore(): Promise<number> {
  const herrajesExistentes = await obtenerHerrajesFirestore();
  const existentesSet = new Set(herrajesExistentes.map(h => h.nombre.toLowerCase().trim()));

  let sembrados = 0;
  for (const key of Object.keys(PRECIOS_HERRAJES_BASE)) {
    if (key.includes('melamina') || key.includes('canto')) continue;
    const base = PRECIOS_HERRAJES_BASE[key];
    if (!existentesSet.has(base.nombre.toLowerCase().trim())) {
      await crearMaterial({
        nombre: base.nombre,
        categoria: 'Herrajes',
        unidad: base.unidad,
        precioUnitario: base.precioUnitario,
        proveedorNombre: 'Ferretería Principal'
      });
      sembrados++;
    }
  }
  return sembrados;
}
