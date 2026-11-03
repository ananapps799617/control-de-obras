// ============================================================
// ARCHIVO: src/features/carpinteria/three/machiningMeshFactory.ts
// QUÉ HACE: Renderizado Three.js de perforaciones, cazoletas y rieles (Zero-CSG).
// POR QUÉ: Permite inspeccionar en 3D la ubicación de herrajes a 60 FPS con precisión milimétrica.
// ============================================================
import * as THREE from 'three';
import { CabinetPart, CabinetSpec } from '../types/cabinet3d';
import { PartMachiningMap, TipoMecanizado } from '../types/mecanizados';

const COLOR_MECANIZADO: Record<TipoMecanizado, number> = {
  cazoleta_35mm: 0xf59e0b,           // Ámbar
  perforacion_corredera: 0x38bdf8,   // Cyan
  perforacion_repisa: 0x10b981,      // Verde
  perforacion_tornillo_4x50: 0x94a3b8,// Gris
  ranura_fondo_3mm: 0x64748b,
  tarugo_8x30mm: 0xd97706
};

export function createCabinetMachiningGroup(
  parts: CabinetPart[],
  machiningMap: PartMachiningMap,
  spec: CabinetSpec
): THREE.Group {
  const rootGroup = new THREE.Group();
  rootGroup.name = 'grupo_mecanizados_3d';

  parts.forEach(part => {
    const machining = machiningMap[part.id];
    if (!machining) return;

    const isLateral = part.tipo === 'LATERAL_IZQ' || part.tipo === 'LATERAL_DER';
    const isDoor = part.tipo === 'PUERTA_IZQ' || part.tipo === 'PUERTA_DER';

    // 1. Renderizar Perforaciones como Marcadores Cilíndricos
    machining.holes.forEach(hole => {
      const radius = Math.max(hole.diametro / 2, 2.5);
      const geo = new THREE.CylinderGeometry(radius, radius, 3, 16);
      const color = COLOR_MECANIZADO[hole.tipo] || 0x38bdf8;

      const mat = new THREE.MeshBasicMaterial({
        color,
        depthTest: false,
        transparent: true,
        opacity: 0.95
      });

      const mesh = new THREE.Mesh(geo, mat);
      mesh.renderOrder = 996;

      if (isLateral) {
        const xOffset = hole.u - part.dim.z / 2;
        const yOffset = hole.v - part.dim.y / 2;
        const isLeft = part.tipo === 'LATERAL_IZQ';
        const zPos = isLeft ? -spec.ancho / 2 + spec.espesorEstructura + 1 : spec.ancho / 2 - spec.espesorEstructura - 1;

        mesh.rotation.z = Math.PI / 2;
        mesh.position.set(zPos, yOffset, xOffset);
        rootGroup.add(mesh);
      } else if (isDoor) {
        const xOffset = hole.u - part.dim.x / 2;
        const yOffset = hole.v - part.dim.y / 2;
        mesh.rotation.x = Math.PI / 2;
        mesh.position.set(xOffset, yOffset, spec.profundidad / 2 + 2);
        rootGroup.add(mesh);
      }
    });

    // 2. Renderizar Ejes de Rieles Telescópicos
    machining.railAxes.forEach(axis => {
      const isLeft = part.tipo === 'LATERAL_IZQ';
      const zPos = isLeft ? -spec.ancho / 2 + spec.espesorEstructura + 2 : spec.ancho / 2 - spec.espesorEstructura - 2;
      const yPos = -spec.alto / 2 + axis.yLevel;

      const points = [
        new THREE.Vector3(zPos, yPos, -spec.profundidad / 2 + axis.frontOffset),
        new THREE.Vector3(zPos, yPos, -spec.profundidad / 2 + axis.frontOffset + axis.length)
      ];

      const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
      const lineMat = new THREE.LineDashedMaterial({
        color: 0x38bdf8,
        dashSize: 10,
        gapSize: 5,
        depthTest: false,
        transparent: true,
        opacity: 0.9
      });

      const line = new THREE.Line(lineGeo, lineMat);
      line.computeLineDistances();
      line.renderOrder = 995;
      rootGroup.add(line);
    });
  });

  return rootGroup;
}
