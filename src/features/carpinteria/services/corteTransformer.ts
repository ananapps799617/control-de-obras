// ============================================================
// ARCHIVO: src/features/carpinteria/services/corteTransformer.ts
// QUÉ HACE: Transforma piezas 3D (CabinetPart[] o TableroLibre[]) a Lista de Corte (IPiezaCorte[]).
// POR QUÉ: Sincronización instantánea entre el modelo 3D y la producción en taller.
// ============================================================
import { CabinetPart, CabinetSpec } from '../types/cabinet3d';
import { TableroLibre } from '../types/freeDesign';
import { IPiezaCorte } from '../../../services/corteService';

const cantoStr = (tipo: string) => {
  if (tipo === 'RIGIDO_2MM') return 'Rígido';
  if (tipo === 'FLEXIBLE_045MM') return 'Flexible';
  return 'Sin Canto (-)';
};

export function transformarPartesAListaCorte(parts: CabinetPart[], spec: CabinetSpec): IPiezaCorte[] {
  return parts.map((part, index) => {
    let largo = Math.round(part.dim.y);
    let ancho = Math.round(part.dim.x);

    if (!part.esVetaVertical) {
      largo = Math.round(part.dim.x);
      ancho = Math.round(part.dim.z);
    } else if (part.tipo === 'LATERAL_IZQ' || part.tipo === 'LATERAL_DER') {
      largo = Math.round(part.dim.y);
      ancho = Math.round(part.dim.z);
    }

    const nombreColor = spec.melamina 
      ? `${spec.melamina.marca.toUpperCase()} ${spec.melamina.nombre}`
      : spec.acabado.toUpperCase();

    return {
      id: index + 1,
      descripcion: `${spec.nombre} - ${part.etiqueta}`,
      cantidad: 1,
      altoVeta: largo,
      ancho: ancho,
      alto1: cantoStr(part.cantoLargo),
      alto2: cantoStr(part.cantoLargo),
      ancho1: cantoStr(part.cantoAncho),
      ancho2: cantoStr(part.cantoAncho),
      canto: cantoStr(part.cantoLargo),
      color: nombreColor
    };
  });
}

export function transformarTablerosLibresAListaCorte(tableros: TableroLibre[]): IPiezaCorte[] {
  return tableros.map((t, index) => {
    return {
      id: index + 1,
      descripcion: `Diseño Libre - ${t.nombre}`,
      cantidad: 1,
      altoVeta: Math.round(t.largo),
      ancho: Math.round(t.ancho),
      alto1: cantoStr(t.cantoLargo),
      alto2: cantoStr(t.cantoLargo),
      ancho1: cantoStr(t.cantoAncho),
      ancho2: cantoStr(t.cantoAncho),
      canto: cantoStr(t.cantoLargo),
      color: `${t.melamina.marca.toUpperCase()} ${t.melamina.nombre}`
    };
  });
}
