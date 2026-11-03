// ============================================================
// ARCHIVO: src/features/carpinteria/services/itemObraTransformer.ts
// QUÉ HACE: Transforma diseño 3D + Despiece + Herrajes en Ítem Compuesto de Cotización.
// POR QUÉ: Conecta la Suite 3D directamente con itemsService.ts y el presupuesto de obra.
// ============================================================
import { CabinetSpec, CabinetPart } from '../types/cabinet3d';
import { TableroLibre } from '../types/freeDesign';
import { IHerrajeCalculado, PRECIOS_HERRAJES_BASE } from '../types/herrajes';
import { crearItemProyecto, IItemCompuestoProyecto, IMaterialFilaItem } from '../../../services/itemsService';

export async function exportarDisenoAItemProyecto(
  proyectoId: string,
  nombreItem: string,
  spec: CabinetSpec,
  parts: CabinetPart[],
  herrajes: IHerrajeCalculado[],
  porcentajeGanancia: number = 35,
  modoDiseno: 'parametrico' | 'libre' = 'parametrico',
  tablerosLibres: TableroLibre[] = []
): Promise<string> {
  const filasMateriales: IMaterialFilaItem[] = [];

  // 1. Cómputo de Placas de Melamina en m²
  let areaTotalM2 = 0;
  let nombreMelamina = spec.melamina ? `${spec.melamina.marca} ${spec.melamina.nombre}` : spec.acabado.toUpperCase();

  if (modoDiseno === 'libre') {
    areaTotalM2 = tablerosLibres.reduce((acc, t) => acc + (t.largo / 1000) * (t.ancho / 1000), 0);
  } else {
    areaTotalM2 = parts.reduce((acc, p) => {
      const w = p.dim.x / 1000;
      const h = p.dim.y / 1000;
      const d = p.dim.z / 1000;
      return acc + (p.esVetaVertical ? (h * d) : (w * d));
    }, 0);
  }

  // Factor de desperdicio técnico (10% adicional)
  const m2ConDesperdicio = Number((areaTotalM2 * 1.10).toFixed(2));
  const precioM2Melamina = PRECIOS_HERRAJES_BASE['melamina-m2']?.precioUnitario || 58000;

  filasMateriales.push({
    id: `mat_mel_${Date.now()}`,
    nombre: `Tablero Melamina ${nombreMelamina} ${spec.espesorEstructura}mm (+10% Desperdicio)`,
    cantidad: m2ConDesperdicio,
    precioUnitario: precioM2Melamina,
    subtotal: Math.round(m2ConDesperdicio * precioM2Melamina)
  });

  // 2. Cómputo de Metros Lineales de Tapacanto
  let metrosCantoRigido = 0;
  let metrosCantoFlexible = 0;

  if (modoDiseno === 'libre') {
    tablerosLibres.forEach(t => {
      const mlLargo = (t.largo * 2) / 1000;
      const mlAncho = (t.ancho * 2) / 1000;
      if (t.cantoLargo === 'RIGIDO_2MM') metrosCantoRigido += mlLargo;
      if (t.cantoLargo === 'FLEXIBLE_045MM') metrosCantoFlexible += mlLargo;
      if (t.cantoAncho === 'RIGIDO_2MM') metrosCantoRigido += mlAncho;
      if (t.cantoAncho === 'FLEXIBLE_045MM') metrosCantoFlexible += mlAncho;
    });
  } else {
    parts.forEach(p => {
      const l = (p.esVetaVertical ? p.dim.y : p.dim.x) / 1000;
      const a = (p.esVetaVertical ? p.dim.x : p.dim.z) / 1000;
      if (p.cantoLargo === 'RIGIDO_2MM') metrosCantoRigido += l * 2;
      if (p.cantoLargo === 'FLEXIBLE_045MM') metrosCantoFlexible += l * 2;
      if (p.cantoAncho === 'RIGIDO_2MM') metrosCantoRigido += a * 2;
      if (p.cantoAncho === 'FLEXIBLE_045MM') metrosCantoFlexible += a * 2;
    });
  }

  if (metrosCantoRigido > 0) {
    const mlRigido = Number(metrosCantoRigido.toFixed(1));
    const pRigido = PRECIOS_HERRAJES_BASE['canto-rigido-m']?.precioUnitario || 2800;
    filasMateriales.push({
      id: `mat_canto_rig_${Date.now()}`,
      nombre: `Tapacanto Rígido PVC 2mm (${nombreMelamina})`,
      cantidad: mlRigido,
      precioUnitario: pRigido,
      subtotal: Math.round(mlRigido * pRigido)
    });
  }

  if (metrosCantoFlexible > 0) {
    const mlFlex = Number(metrosCantoFlexible.toFixed(1));
    const pFlex = PRECIOS_HERRAJES_BASE['canto-flexible-m']?.precioUnitario || 1200;
    filasMateriales.push({
      id: `mat_canto_flex_${Date.now()}`,
      nombre: `Tapacanto Flexible PVC 0.45mm (${nombreMelamina})`,
      cantidad: mlFlex,
      precioUnitario: pFlex,
      subtotal: Math.round(mlFlex * pFlex)
    });
  }

  // 3. Añadir todos los Herrajes y Tornillería
  herrajes.forEach((h, idx) => {
    filasMateriales.push({
      id: `mat_her_${idx}_${Date.now()}`,
      nombre: h.nombre,
      cantidad: h.cantidad,
      precioUnitario: h.precioUnitario,
      subtotal: h.subtotal
    });
  });

  // 4. Totales Financieros
  const costoTotalMateriales = filasMateriales.reduce((acc, f) => acc + f.subtotal, 0);
  const factorGanancia = 1 + porcentajeGanancia / 100;
  const precioTotalFinal = Math.round(costoTotalMateriales * factorGanancia);

  const payload: Partial<IItemCompuestoProyecto> = {
    proyectoId,
    nombreItem: nombreItem.trim() || `Mueble 3D - ${spec.nombre}`,
    cantidad: 1,
    costoMateriales: costoTotalMateriales,
    porcentajeGanancia: porcentajeGanancia,
    precioTotalFinal: precioTotalFinal,
    materiales: filasMateriales
  };

  return await crearItemProyecto(payload);
}
