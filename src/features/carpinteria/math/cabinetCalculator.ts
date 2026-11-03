// ============================================================
// ARCHIVO: src/features/carpinteria/math/cabinetCalculator.ts
// QUÉ HACE: Algoritmo matemático O(1) de despiece paramétrico, cajones, puertas elevables y corredizas.
// POR QUÉ: Genera mallas Three.js y Lista de Corte con precisión milimétrica.
// ============================================================
import { CabinetSpec, CabinetPart } from '../types/cabinet3d';

export function calcularPiezasMueble(spec: CabinetSpec): CabinetPart[] {
  const { ancho: W, alto: H, profundidad: D, espesorEstructura: T, espesorFondo: Tb } = spec;
  const parts: CabinetPart[] = [];
  const zocaloH = spec.conZocalo ? spec.alturaZocalo : 0;
  const hCuerpo = H - zocaloH;
  const yBase = zocaloH;
  const slotOffset = 15;
  const sistemaPuertas = spec.tipoSistemaPuertas || 'batiente';

  // 1. LATERALES
  parts.push({
    id: 'lat_izq',
    etiqueta: 'Lateral Izquierdo',
    tipo: 'LATERAL_IZQ',
    dim: { x: T, y: hCuerpo, z: D },
    pos: { x: T / 2, y: yBase + hCuerpo / 2, z: D / 2 },
    vecExplosion: { x: -120, y: 0, z: 0 },
    esVetaVertical: true,
    cantoLargo: 'RIGIDO_2MM',
    cantoAncho: 'FLEXIBLE_045MM'
  });

  parts.push({
    id: 'lat_der',
    etiqueta: 'Lateral Derecho',
    tipo: 'LATERAL_DER',
    dim: { x: T, y: hCuerpo, z: D },
    pos: { x: W - T / 2, y: yBase + hCuerpo / 2, z: D / 2 },
    vecExplosion: { x: 120, y: 0, z: 0 },
    esVetaVertical: true,
    cantoLargo: 'RIGIDO_2MM',
    cantoAncho: 'FLEXIBLE_045MM'
  });

  // 2. SUELO / BASE
  const wInterno = W - 2 * T;
  parts.push({
    id: 'suelo',
    etiqueta: 'Suelo / Base',
    tipo: 'SUELO',
    dim: { x: wInterno, y: T, z: D },
    pos: { x: W / 2, y: yBase + T / 2, z: D / 2 },
    vecExplosion: { x: 0, y: -80, z: 0 },
    esVetaVertical: false,
    cantoLargo: 'RIGIDO_2MM',
    cantoAncho: 'NINGUNO'
  });

  // 3. TECHO O AMARRES
  if (spec.tipo === 'modulo-bajo') {
    const anchoAmarre = 80;
    parts.push({
      id: 'amarre_front',
      etiqueta: 'Amarre Frontal',
      tipo: 'AMARRE_FRONTAL',
      dim: { x: wInterno, y: T, z: anchoAmarre },
      pos: { x: W / 2, y: yBase + hCuerpo - T / 2, z: D - anchoAmarre / 2 },
      vecExplosion: { x: 0, y: 80, z: 20 },
      esVetaVertical: false,
      cantoLargo: 'FLEXIBLE_045MM',
      cantoAncho: 'NINGUNO'
    });
    parts.push({
      id: 'amarre_trasero',
      etiqueta: 'Amarre Trasero',
      tipo: 'AMARRE_TRASERO',
      dim: { x: wInterno, y: anchoAmarre, z: T },
      pos: { x: W / 2, y: yBase + hCuerpo - anchoAmarre / 2, z: slotOffset + Tb + T / 2 },
      vecExplosion: { x: 0, y: 80, z: -20 },
      esVetaVertical: false,
      cantoLargo: 'FLEXIBLE_045MM',
      cantoAncho: 'NINGUNO'
    });
  } else {
    parts.push({
      id: 'techo',
      etiqueta: 'Techo',
      tipo: 'TECHO',
      dim: { x: wInterno, y: T, z: D },
      pos: { x: W / 2, y: yBase + hCuerpo - T / 2, z: D / 2 },
      vecExplosion: { x: 0, y: 80, z: 0 },
      esVetaVertical: false,
      cantoLargo: 'RIGIDO_2MM',
      cantoAncho: 'NINGUNO'
    });
  }

  // 4. FONDO RANURADO
  const hFondo = hCuerpo - 2 * T + 2 * 8; // Ranura de 8mm arriba y abajo
  const wFondo = wInterno + 2 * 8;
  parts.push({
    id: 'fondo',
    etiqueta: `Fondo MDP (${Tb}mm)`,
    tipo: 'FONDO',
    dim: { x: wFondo, y: hFondo, z: Tb },
    pos: { x: W / 2, y: yBase + hCuerpo / 2, z: slotOffset + Tb / 2 },
    vecExplosion: { x: 0, y: 0, z: -100 },
    esVetaVertical: true,
    cantoLargo: 'NINGUNO',
    cantoAncho: 'NINGUNO'
  });

  // 5. DIVISIONES VERTICALES / PARANTES
  const numDiv = Math.max(0, Math.min(2, spec.divisionesVerticales));
  const hLuz = hCuerpo - 2 * T;
  const dLuz = D - slotOffset - Tb - 10;
  if (numDiv > 0) {
    for (let i = 1; i <= numDiv; i++) {
      const xParante = (W / (numDiv + 1)) * i;
      parts.push({
        id: `parante_${i}`,
        etiqueta: `Parante Vertical #${i}`,
        tipo: 'PARANTE_VERTICAL',
        dim: { x: T, y: hLuz, z: dLuz },
        pos: { x: xParante, y: yBase + T + hLuz / 2, z: slotOffset + Tb + dLuz / 2 },
        vecExplosion: { x: (i - (numDiv + 1) / 2) * 60, y: 0, z: 20 },
        esVetaVertical: true,
        cantoLargo: 'RIGIDO_2MM',
        cantoAncho: 'NINGUNO'
      });
    }
  }

  // 6. CAJONES (si aplica)
  const numCajones = Math.max(0, Math.min(4, spec.numeroCajones));
  if (numCajones > 0) {
    const luzCajonY = 3;
    const hFrenteTotal = hCuerpo - (numCajones + 1) * luzCajonY;
    const hFrenteIndividual = hFrenteTotal / numCajones;
    const holguraCorredera = 13; // 13mm por lado para correderas telescópicas
    const wCajaCajon = wInterno - 2 * holguraCorredera;
    const dCajaCajon = Math.floor((D - 60) / 50) * 50; // Múltiplos de 50mm (ej. 450mm, 500mm)

    for (let c = 0; c < numCajones; c++) {
      const yFrenteCentro = yBase + luzCajonY + c * (hFrenteIndividual + luzCajonY) + hFrenteIndividual / 2;
      const hCajaCajon = Math.max(80, hFrenteIndividual - 50);
      const openOffsetZ = spec.aperturaCajones ? dCajaCajon * 0.75 : 0;

      // Frente de Cajón
      parts.push({
        id: `frente_cajon_${c + 1}`,
        etiqueta: `Frente Cajón #${c + 1}`,
        tipo: 'FRENTE_CAJON',
        dim: { x: W - 2 * 2, y: hFrenteIndividual, z: T },
        pos: { x: W / 2, y: yFrenteCentro, z: D + T / 2 },
        vecExplosion: { x: 0, y: 0, z: 100 + c * 20 },
        animOffset: { x: 0, y: 0, z: openOffsetZ },
        esVetaVertical: true,
        cantoLargo: 'RIGIDO_2MM',
        cantoAncho: 'RIGIDO_2MM'
      });

      // Laterales de Cajón
      parts.push({
        id: `lat_cajon_izq_${c + 1}`,
        etiqueta: `Lateral Izq Cajón #${c + 1}`,
        tipo: 'LATERAL_CAJON_IZQ',
        dim: { x: T, y: hCajaCajon, z: dCajaCajon },
        pos: { x: W / 2 - wCajaCajon / 2 + T / 2, y: yFrenteCentro, z: D - dCajaCajon / 2 },
        vecExplosion: { x: -40, y: 0, z: 80 + c * 20 },
        animOffset: { x: 0, y: 0, z: openOffsetZ },
        esVetaVertical: false,
        cantoLargo: 'FLEXIBLE_045MM',
        cantoAncho: 'FLEXIBLE_045MM'
      });

      parts.push({
        id: `lat_cajon_der_${c + 1}`,
        etiqueta: `Lateral Der Cajón #${c + 1}`,
        tipo: 'LATERAL_CAJON_DER',
        dim: { x: T, y: hCajaCajon, z: dCajaCajon },
        pos: { x: W / 2 + wCajaCajon / 2 - T / 2, y: yFrenteCentro, z: D - dCajaCajon / 2 },
        vecExplosion: { x: 40, y: 0, z: 80 + c * 20 },
        animOffset: { x: 0, y: 0, z: openOffsetZ },
        esVetaVertical: false,
        cantoLargo: 'FLEXIBLE_045MM',
        cantoAncho: 'FLEXIBLE_045MM'
      });

      // Contrafrente & Trasera
      const wSubFront = wCajaCajon - 2 * T;
      parts.push({
        id: `contrafrente_cajon_${c + 1}`,
        etiqueta: `Contrafrente Cajón #${c + 1}`,
        tipo: 'CONTRAFRENTE_CAJON',
        dim: { x: wSubFront, y: hCajaCajon, z: T },
        pos: { x: W / 2, y: yFrenteCentro, z: D - T / 2 },
        vecExplosion: { x: 0, y: 0, z: 60 + c * 20 },
        animOffset: { x: 0, y: 0, z: openOffsetZ },
        esVetaVertical: false,
        cantoLargo: 'FLEXIBLE_045MM',
        cantoAncho: 'NINGUNO'
      });

      parts.push({
        id: `trasera_cajon_${c + 1}`,
        etiqueta: `Trasera Cajón #${c + 1}`,
        tipo: 'TRASERA_CAJON',
        dim: { x: wSubFront, y: hCajaCajon, z: T },
        pos: { x: W / 2, y: yFrenteCentro, z: D - dCajaCajon + T / 2 },
        vecExplosion: { x: 0, y: 0, z: 40 + c * 20 },
        animOffset: { x: 0, y: 0, z: openOffsetZ },
        esVetaVertical: false,
        cantoLargo: 'FLEXIBLE_045MM',
        cantoAncho: 'NINGUNO'
      });

      // Fondo de Cajón
      parts.push({
        id: `fondo_cajon_${c + 1}`,
        etiqueta: `Fondo Cajón #${c + 1} (${Tb}mm)`,
        tipo: 'FONDO_CAJON',
        dim: { x: wCajaCajon - 2, y: Tb, z: dCajaCajon - 2 },
        pos: { x: W / 2, y: yFrenteCentro - hCajaCajon / 2 + Tb / 2, z: D - dCajaCajon / 2 },
        vecExplosion: { x: 0, y: -30, z: 60 + c * 20 },
        animOffset: { x: 0, y: 0, z: openOffsetZ },
        esVetaVertical: false,
        cantoLargo: 'NINGUNO',
        cantoAncho: 'NINGUNO'
      });
    }
  }

  // 7. REPISAS INTERIORES
  const numRep = Math.max(0, Math.min(6, spec.numeroRepisas));
  if (numRep > 0 && numCajones === 0) {
    const dRepisa = D - slotOffset - Tb - 20;
    const gapShelf = 1.5;
    for (let i = 1; i <= numRep; i++) {
      const yRep = yBase + T + (i * hLuz) / (numRep + 1);
      parts.push({
        id: `repisa_${i}`,
        etiqueta: `Repisa Interior #${i}`,
        tipo: 'REPISA',
        dim: { x: wInterno - 2 * gapShelf, y: T, z: dRepisa },
        pos: { x: W / 2, y: yRep, z: slotOffset + Tb + dRepisa / 2 },
        vecExplosion: { x: 0, y: (i - (numRep + 1) / 2) * 40, z: 20 },
        esVetaVertical: false,
        cantoLargo: 'RIGIDO_2MM',
        cantoAncho: 'FLEXIBLE_045MM'
      });
    }
  }

  // 8. SISTEMA DE PUERTAS (Batientes, Elevables o Corredizas)
  const luzPuerta = 2;
  if (numCajones === 0 && spec.puertas > 0) {
    if (sistemaPuertas === 'elevable-basculante') {
      // Puerta Basculante / Elevable hacia arriba con Pistones de Gas
      parts.push({
        id: 'puerta_elevable',
        etiqueta: 'Puerta Basculante / Elevable',
        tipo: 'PUERTA_ELEVABLE',
        dim: { x: W - 2 * luzPuerta, y: hCuerpo - 2 * luzPuerta, z: T },
        pos: { x: W / 2, y: yBase + hCuerpo / 2, z: D + T / 2 },
        vecExplosion: { x: 0, y: 40, z: 120 },
        esVetaVertical: true,
        cantoLargo: 'RIGIDO_2MM',
        cantoAncho: 'RIGIDO_2MM'
      });
    } else if (sistemaPuertas === 'corrediza') {
      // 2 Puertas Corredizas Superpuestas con Rieles Superior e Inferior
      const solape = 25; // 25mm de cruce central
      const wHojaCorr = (wInterno + solape) / 2;
      const hHojaCorr = hLuz - 35; // Descuento de 35mm para riel y rodamientos

      // Riel Superior
      parts.push({
        id: 'riel_superior',
        etiqueta: 'Riel Corredizo Superior Aluminio',
        tipo: 'RIEL_CORREDIZO',
        dim: { x: wInterno, y: 15, z: 45 },
        pos: { x: W / 2, y: yBase + hCuerpo - T - 7.5, z: D - 25 },
        vecExplosion: { x: 0, y: 20, z: 0 },
        esVetaVertical: false,
        cantoLargo: 'NINGUNO',
        cantoAncho: 'NINGUNO'
      });

      // Riel Inferior
      parts.push({
        id: 'riel_inferior',
        etiqueta: 'Riel Corredizo Inferior Aluminio',
        tipo: 'RIEL_CORREDIZO',
        dim: { x: wInterno, y: 10, z: 45 },
        pos: { x: W / 2, y: yBase + T + 5, z: D - 25 },
        vecExplosion: { x: 0, y: -20, z: 0 },
        esVetaVertical: false,
        cantoLargo: 'NINGUNO',
        cantoAncho: 'NINGUNO'
      });

      // Hoja Trasera (Interior)
      parts.push({
        id: 'puerta_corr_int',
        etiqueta: 'Puerta Corrediza Interior',
        tipo: 'PUERTA_CORREDIZA_INT',
        dim: { x: wHojaCorr, y: hHojaCorr, z: T },
        pos: { x: T + wHojaCorr / 2, y: yBase + T + 18 + hHojaCorr / 2, z: D - 35 },
        vecExplosion: { x: -40, y: 0, z: 60 },
        esVetaVertical: true,
        cantoLargo: 'RIGIDO_2MM',
        cantoAncho: 'RIGIDO_2MM'
      });

      // Hoja Delantera (Exterior)
      parts.push({
        id: 'puerta_corr_ext',
        etiqueta: 'Puerta Corrediza Exterior',
        tipo: 'PUERTA_CORREDIZA_EXT',
        dim: { x: wHojaCorr, y: hHojaCorr, z: T },
        pos: { x: W - T - wHojaCorr / 2, y: yBase + T + 18 + hHojaCorr / 2, z: D - 15 },
        vecExplosion: { x: 40, y: 0, z: 90 },
        esVetaVertical: true,
        cantoLargo: 'RIGIDO_2MM',
        cantoAncho: 'RIGIDO_2MM'
      });
    } else {
      // Puertas Batientes Estándar (1 o 2 Hojas con Bisagras)
      if (spec.puertas === 1) {
        parts.push({
          id: 'puerta_unica',
          etiqueta: 'Puerta Principal Batiente',
          tipo: 'PUERTA_IZQ',
          dim: { x: W - 2 * luzPuerta, y: hCuerpo - 2 * luzPuerta, z: T },
          pos: { x: W / 2, y: yBase + hCuerpo / 2, z: D + T / 2 },
          vecExplosion: { x: 0, y: 0, z: 120 },
          esVetaVertical: true,
          cantoLargo: 'RIGIDO_2MM',
          cantoAncho: 'RIGIDO_2MM'
        });
      } else if (spec.puertas === 2) {
        const wHoja = (W - 3 * luzPuerta) / 2;
        const hPuerta = hCuerpo - 2 * luzPuerta;
        parts.push({
          id: 'puerta_izq',
          etiqueta: 'Puerta Hoja Izquierda',
          tipo: 'PUERTA_IZQ',
          dim: { x: wHoja, y: hPuerta, z: T },
          pos: { x: luzPuerta + wHoja / 2, y: yBase + hCuerpo / 2, z: D + T / 2 },
          vecExplosion: { x: -60, y: 0, z: 120 },
          esVetaVertical: true,
          cantoLargo: 'RIGIDO_2MM',
          cantoAncho: 'RIGIDO_2MM'
        });
        parts.push({
          id: 'puerta_der',
          etiqueta: 'Puerta Hoja Derecha',
          tipo: 'PUERTA_DER',
          dim: { x: wHoja, y: hPuerta, z: T },
          pos: { x: W - luzPuerta - wHoja / 2, y: yBase + hCuerpo / 2, z: D + T / 2 },
          vecExplosion: { x: 60, y: 0, z: 120 },
          esVetaVertical: true,
          cantoLargo: 'RIGIDO_2MM',
          cantoAncho: 'RIGIDO_2MM'
        });
      }
    }
  }

  // 9. ZÓCALO
  if (spec.conZocalo && zocaloH > 0) {
    parts.push({
      id: 'zocalo_front',
      etiqueta: 'Zócalo Frontal',
      tipo: 'ZOCALO',
      dim: { x: W - 2 * T, y: zocaloH, z: T },
      pos: { x: W / 2, y: zocaloH / 2, z: D - 40 },
      vecExplosion: { x: 0, y: -40, z: 40 },
      esVetaVertical: false,
      cantoLargo: 'FLEXIBLE_045MM',
      cantoAncho: 'NINGUNO'
    });
  }

  return parts;
}
