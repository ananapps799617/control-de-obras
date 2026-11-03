// ============================================================
// ARCHIVO: src/features/carpinteria/math/herrajesCalculator.ts
// QUÉ HACE: Deducción matemática de tornillos, bisagras, rieles y herrajes.
// POR QUÉ: Cómputo exacto para presupuestos y compras sin errores.
// ============================================================
import { CabinetSpec, CabinetPart } from '../types/cabinet3d';
import { TableroLibre } from '../types/freeDesign';
import { IHerrajeCalculado, PRECIOS_HERRAJES_BASE } from '../types/herrajes';

export function calcularHerrajesParametricos(spec: CabinetSpec, parts: CabinetPart[]): IHerrajeCalculado[] {
  const herrajes: IHerrajeCalculado[] = [];

  const add = (idKey: string, cantidad: number) => {
    if (cantidad <= 0) return;
    const base = PRECIOS_HERRAJES_BASE[idKey];
    if (!base) return;
    herrajes.push({
      id: idKey,
      nombre: base.nombre,
      categoria: base.categoria,
      cantidad,
      unidad: base.unidad,
      precioUnitario: base.precioUnitario,
      subtotal: Math.round(cantidad * base.precioUnitario),
      origen: 'automatico'
    });
  };

  // 1. Tornillos 4x50mm de ensamble (Estructura, laterales, suelo, amarres, parantes)
  const unionesLaterales = 4; // Suelo y Techo/Amarres con Laterales
  const parantes = spec.divisionesVerticales || 0;
  const tornillosEnsamble = unionesLaterales * 4 + parantes * 4 + (spec.tipo === 'modulo-bajo' ? 4 : 0);
  add('tornillo-4x50', tornillosEnsamble);

  // 2. Fondo ranurado/trasera: tornillos 3x15mm cada 15 cm de perímetro
  const perimetroFondo = (spec.ancho + spec.alto) * 2;
  const tornillosFondo = Math.max(12, Math.round(perimetroFondo / 150));
  add('tornillo-3x15', tornillosFondo);

  // 3. Bisagras y tornillos de bisagra
  if (spec.puertas > 0 && (spec.numeroCajones || 0) === 0) {
    const bisagrasPorPuerta = spec.alto > 1600 ? 4 : (spec.alto >= 1000 ? 3 : 2);
    const totalBisagras = bisagrasPorPuerta * spec.puertas;
    add('bisagra-35-cierre-suave', totalBisagras);
    add('tornillo-3.5x15', totalBisagras * 4);
    add('tirador-barra-128', spec.puertas);
    add('tornillo-m4x22', spec.puertas * 2);
  }

  // 4. Correderas telescópicas y tornillos para cajoneras
  const numCajones = spec.numeroCajones || 0;
  if (numCajones > 0) {
    add('corredera-telescopica-45', numCajones);
    add('tornillo-3.5x15', numCajones * 8 + (herrajes.find(h => h.id === 'tornillo-3.5x15')?.cantidad || 0));
    add('tirador-barra-128', numCajones);
    add('tornillo-m4x22', numCajones * 2);
  }

  // 5. Soportes de repisas móviles (pitones)
  const numRepisas = spec.numeroRepisas || 0;
  if (numRepisas > 0 && numCajones === 0) {
    add('soporte-repisa-piton', numRepisas * 4);
  }

  // 6. Patas Niveladoras para Módulo Bajo o Estantería
  if (spec.conZocalo && (spec.tipo === 'modulo-bajo' || spec.tipo === 'closet-estanteria')) {
    const patas = spec.ancho > 1200 ? 6 : 4;
    add('pata-niveladora-100', patas);
  }

  // 7. Accesorios especiales según tipo de mueble
  if (spec.tipo === 'alacena' && spec.puertas === 1) {
    add('brazo-neumatico-100n', 2);
  } else if (spec.tipo === 'closet-estanteria' && spec.alto >= 1600) {
    add('tubo-perchero-aluminio', 1);
  }

  return herrajes;
}

export function calcularHerrajesLibres(tableros: TableroLibre[]): IHerrajeCalculado[] {
  const herrajes: IHerrajeCalculado[] = [];
  const add = (idKey: string, cantidad: number) => {
    if (cantidad <= 0) return;
    const base = PRECIOS_HERRAJES_BASE[idKey];
    if (!base) return;
    herrajes.push({
      id: idKey,
      nombre: base.nombre,
      categoria: base.categoria,
      cantidad,
      unidad: base.unidad,
      precioUnitario: base.precioUnitario,
      subtotal: Math.round(cantidad * base.precioUnitario),
      origen: 'automatico'
    });
  };

  const totalTableros = tableros.length;
  if (totalTableros === 0) return [];

  // Ensamble promedio de 4 tornillos 4x50 por tablero
  add('tornillo-4x50', Math.max(8, totalTableros * 4));
  add('tornillo-3x15', Math.max(12, totalTableros * 2));
  add('soporte-repisa-piton', 8);

  return herrajes;
}
