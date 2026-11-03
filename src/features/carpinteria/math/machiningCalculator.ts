// ============================================================
// ARCHIVO: src/features/carpinteria/math/machiningCalculator.ts
// QUÉ HACE: Deducción matemática de cazoletas, rieles, pistones de gas y repisas.
// POR QUÉ: Genera el mapa exacto de mecanizado para ensamble y CNC de taller.
// ============================================================
import { CabinetSpec, CabinetPart } from '../types/cabinet3d';
import { PartMachiningMap, PartMachining } from '../types/mecanizados';

export function calculateCabinetMachining(spec: CabinetSpec, parts: CabinetPart[]): PartMachiningMap {
  const map: PartMachiningMap = {};

  const ensureEntry = (part: CabinetPart): PartMachining => {
    if (!map[part.id]) {
      map[part.id] = {
        partId: part.id,
        partName: part.etiqueta,
        partType: part.tipo,
        dimensiones: {
          largo: part.dim.y,
          ancho: part.dim.x,
          espesor: part.dim.z
        },
        holes: [],
        railAxes: []
      };
    }
    return map[part.id];
  };

  const laterals = parts.filter(p => p.tipo === 'LATERAL_IZQ' || p.tipo === 'LATERAL_DER');
  const sistemaPuertas = spec.tipoSistemaPuertas || 'batiente';

  // 1. MECANIZADOS DE PUERTAS
  if (sistemaPuertas === 'elevable-basculante') {
    const puertaElevable = parts.find(p => p.tipo === 'PUERTA_ELEVABLE');
    if (puertaElevable) {
      const doorEntry = ensureEntry(puertaElevable);
      // Bisagras Superiores
      const xBisagras = [100, puertaElevable.dim.x - 100];
      xBisagras.forEach((x, idx) => {
        doorEntry.holes.push({
          id: `cazoleta_elev_${idx}`,
          tipo: 'cazoleta_35mm',
          cara: 'CARA_A',
          u: x,
          v: puertaElevable.dim.y - 22,
          diametro: 35,
          profundidad: 12,
          label: `Cazoleta Superior #${idx + 1}`
        });
      });

      // Anclaje de Pistón de Gas en Puerta
      doorEntry.holes.push(
        { id: 'piston_door_izq', tipo: 'perforacion_corredera', cara: 'CARA_A', u: 60, v: puertaElevable.dim.y - 120, diametro: 5, profundidad: 10, label: 'Soporte Pistón Gas Izq' },
        { id: 'piston_door_der', tipo: 'perforacion_corredera', cara: 'CARA_A', u: puertaElevable.dim.x - 60, v: puertaElevable.dim.y - 120, diametro: 5, profundidad: 10, label: 'Soporte Pistón Gas Der' }
      );

      // Anclaje de Pistón de Gas en Laterales
      laterals.forEach(lat => {
        const latEntry = ensureEntry(lat);
        latEntry.holes.push({
          id: `piston_lat_${lat.id}`,
          tipo: 'perforacion_corredera',
          cara: 'CARA_A',
          u: 80,
          v: lat.dim.y - 80,
          diametro: 5,
          profundidad: 11,
          label: 'Anclaje Pistón de Gas (100N)'
        });
      });
    }
  } else if (sistemaPuertas === 'corrediza') {
    const puertasCorr = parts.filter(p => p.tipo === 'PUERTA_CORREDIZA_INT' || p.tipo === 'PUERTA_CORREDIZA_EXT');
    puertasCorr.forEach(p => {
      const pEntry = ensureEntry(p);
      // Ruedas y Guías Inferiores
      pEntry.holes.push(
        { id: `carro_inf_izq_${p.id}`, tipo: 'perforacion_corredera', cara: 'CARA_A', u: 50, v: 30, diametro: 35, profundidad: 10, label: 'Cazoleta Rueda Inferior Izq' },
        { id: `carro_inf_der_${p.id}`, tipo: 'perforacion_corredera', cara: 'CARA_A', u: p.dim.x - 50, v: 30, diametro: 35, profundidad: 10, label: 'Cazoleta Rueda Inferior Der' }
      );
      // Guías Superiores
      pEntry.holes.push(
        { id: `guia_sup_izq_${p.id}`, tipo: 'perforacion_corredera', cara: 'CARA_A', u: 50, v: p.dim.y - 20, diametro: 5, profundidad: 10, label: 'Guía Superior Izq' },
        { id: `guia_sup_der_${p.id}`, tipo: 'perforacion_corredera', cara: 'CARA_A', u: p.dim.x - 50, v: p.dim.y - 20, diametro: 5, profundidad: 10, label: 'Guía Superior Der' }
      );
    });
  } else {
    // Puertas Batientes Estándar
    const doors = parts.filter(p => p.tipo === 'PUERTA_IZQ' || p.tipo === 'PUERTA_DER');
    doors.forEach((door, dIdx) => {
      const doorEntry = ensureEntry(door);
      const hDoor = door.dim.y;
      const yPositions = hDoor > 1200 ? [100, Math.round(hDoor / 2), hDoor - 100] : [100, hDoor - 100];

      yPositions.forEach((y, hIdx) => {
        doorEntry.holes.push({
          id: `cazoleta_${door.id}_${hIdx}`,
          tipo: 'cazoleta_35mm',
          cara: 'CARA_A',
          u: 22,
          v: y,
          diametro: 35,
          profundidad: 12,
          label: `Cazoleta Bisagra ${hIdx === 0 ? 'Inferior' : hIdx === 1 && yPositions.length === 3 ? 'Media' : 'Superior'}`
        });

        laterals.forEach(lat => {
          const latEntry = ensureEntry(lat);
          latEntry.holes.push({
            id: `base_bisagra_${lat.id}_${dIdx}_${hIdx}`,
            tipo: 'perforacion_corredera',
            cara: 'CARA_A',
            u: 37,
            v: y,
            diametro: 5,
            profundidad: 11,
            label: `Base Bisagra P${dIdx + 1} (${y}mm)`
          });
        });
      });
    });
  }

  // 2. Rieles y Correderas Telescópicas en Laterales (si hay cajones)
  if (spec.numeroCajones > 0) {
    const alturaUtil = spec.alto - spec.espesorEstructura * 2;
    const altoCajon = alturaUtil / spec.numeroCajones;
    const largoRiel = Math.min(spec.profundidad - 50, 450);

    laterals.forEach(lat => {
      const latEntry = ensureEntry(lat);

      for (let i = 0; i < spec.numeroCajones; i++) {
        const yNivel = spec.espesorEstructura + altoCajon * i + Math.round(altoCajon * 0.25);
        const offsets = [37, 37 + 128, 37 + 224].filter(x => x <= largoRiel);

        latEntry.railAxes.push({
          id: `riel_eje_${lat.id}_${i}`,
          nombre: `Riel Cajón ${i + 1}`,
          cajonIndice: i + 1,
          yLevel: yNivel,
          frontOffset: 37,
          length: largoRiel,
          holeOffsets: offsets
        });

        offsets.forEach((offX, oIdx) => {
          latEntry.holes.push({
            id: `barreno_riel_${lat.id}_${i}_${oIdx}`,
            tipo: 'perforacion_corredera',
            cara: 'CARA_A',
            u: offX,
            v: yNivel,
            diametro: 5,
            profundidad: 12,
            label: `Riel Cajón ${i + 1} P${oIdx + 1}`
          });
        });
      }
    });
  }

  // 3. Perforaciones para Soportes de Repisas Móviles
  const repisas = parts.filter(p => p.tipo === 'REPISA');
  if (repisas.length > 0) {
    laterals.forEach(lat => {
      const latEntry = ensureEntry(lat);
      repisas.forEach((rep, rIdx) => {
        const yCenter = rep.pos.y;
        [-32, 0, 32].forEach((offsetY, pIdx) => {
          [60, lat.dim.z - 60].forEach((posX, xIdx) => {
            latEntry.holes.push({
              id: `soporte_rep_${lat.id}_${rIdx}_${pIdx}_${xIdx}`,
              tipo: 'perforacion_repisa',
              cara: 'CARA_A',
              u: posX,
              v: yCenter + offsetY,
              diametro: 5,
              profundidad: 10,
              label: `Soporte Repisa #${rIdx + 1} (${pIdx === 1 ? 'Central' : pIdx === 0 ? '-32mm' : '+32mm'})`
            });
          });
        });
      });
    });
  }

  return map;
}
