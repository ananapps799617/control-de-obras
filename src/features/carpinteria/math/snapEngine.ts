// ============================================================
// ARCHIVO: src/features/carpinteria/math/snapEngine.ts
// QUÉ HACE: Motor de Imantación y Snap Magnético inteligente a caras y vértices.
// POR QUÉ: Permite ensamblar tableros a 90° con tolerancia cero y sin huecos.
// ============================================================
import { TableroLibre } from '../types/freeDesign';

interface BoundingBox3D {
  minX: number; maxX: number;
  minY: number; maxY: number;
  minZ: number; maxZ: number;
}

export function getTableroDimensions3D(t: TableroLibre): { dx: number; dy: number; dz: number } {
  if (t.orientacion === 'vertical-lateral') {
    // Tablero Vertical (Lateral): Espesor en X, Alto/Largo en Y, Profundidad/Ancho en Z
    return { dx: t.espesor, dy: t.largo, dz: t.ancho };
  } else if (t.orientacion === 'horizontal-base') {
    // Tablero Horizontal (Suelo/Techo/Repisa): Ancho/Largo en X, Espesor en Y, Profundidad/Ancho en Z
    return { dx: t.largo, dy: t.espesor, dz: t.ancho };
  } else {
    // Tablero Frontal (Fondo/Puerta): Ancho en X, Alto/Largo en Y, Espesor en Z
    return { dx: t.ancho, dy: t.largo, dz: t.espesor };
  }
}

export function getTableroBoundingBox(t: TableroLibre, pos?: { x: number; y: number; z: number }): BoundingBox3D {
  const p = pos || t.pos;
  const { dx, dy, dz } = getTableroDimensions3D(t);
  return {
    minX: p.x - dx / 2, maxX: p.x + dx / 2,
    minY: p.y - dy / 2, maxY: p.y + dy / 2,
    minZ: p.z - dz / 2, maxZ: p.z + dz / 2
  };
}

export function calcularPosicionConSnap(
  target: TableroLibre,
  nuevaPos: { x: number; y: number; z: number },
  otrosTableros: TableroLibre[],
  distanciaSnap: number = 30
): { x: number; y: number; z: number; huboSnap: boolean } {
  const { dx, dy, dz } = getTableroDimensions3D(target);
  let finalX = nuevaPos.x;
  let finalY = nuevaPos.y;
  let finalZ = nuevaPos.z;
  let huboSnap = false;

  for (const otro of otrosTableros) {
    if (otro.id === target.id) continue;
    const bbOtro = getTableroBoundingBox(otro);

    // 1. Snap en Eje X (Caras Izquierda y Derecha)
    const targetLeft = finalX - dx / 2;
    const targetRight = finalX + dx / 2;

    if (Math.abs(targetLeft - bbOtro.maxX) < distanciaSnap) {
      finalX = bbOtro.maxX + dx / 2;
      huboSnap = true;
    } else if (Math.abs(targetRight - bbOtro.minX) < distanciaSnap) {
      finalX = bbOtro.minX - dx / 2;
      huboSnap = true;
    } else if (Math.abs(targetLeft - bbOtro.minX) < distanciaSnap) {
      finalX = bbOtro.minX + dx / 2;
      huboSnap = true;
    } else if (Math.abs(targetRight - bbOtro.maxX) < distanciaSnap) {
      finalX = bbOtro.maxX - dx / 2;
      huboSnap = true;
    }

    // 2. Snap en Eje Y (Caras Superior e Inferior)
    const targetBottom = finalY - dy / 2;
    const targetTop = finalY + dy / 2;

    if (Math.abs(targetBottom - bbOtro.maxY) < distanciaSnap) {
      finalY = bbOtro.maxY + dy / 2;
      huboSnap = true;
    } else if (Math.abs(targetTop - bbOtro.minY) < distanciaSnap) {
      finalY = bbOtro.minY - dy / 2;
      huboSnap = true;
    } else if (Math.abs(targetBottom - bbOtro.minY) < distanciaSnap) {
      finalY = bbOtro.minY + dy / 2;
      huboSnap = true;
    } else if (Math.abs(targetTop - bbOtro.maxY) < distanciaSnap) {
      finalY = bbOtro.maxY - dy / 2;
      huboSnap = true;
    }

    // 3. Snap en Eje Z (Caras Frontal y Trasera)
    const targetBack = finalZ - dz / 2;
    const targetFront = finalZ + dz / 2;

    if (Math.abs(targetBack - bbOtro.maxZ) < distanciaSnap) {
      finalZ = bbOtro.maxZ + dz / 2;
      huboSnap = true;
    } else if (Math.abs(targetFront - bbOtro.minZ) < distanciaSnap) {
      finalZ = bbOtro.minZ - dz / 2;
      huboSnap = true;
    } else if (Math.abs(targetBack - bbOtro.minZ) < distanciaSnap) {
      finalZ = bbOtro.minZ + dz / 2;
      huboSnap = true;
    } else if (Math.abs(targetFront - bbOtro.maxZ) < distanciaSnap) {
      finalZ = bbOtro.maxZ - dz / 2;
      huboSnap = true;
    }
  }

  return { x: Math.round(finalX), y: Math.round(finalY), z: Math.round(finalZ), huboSnap };
}
