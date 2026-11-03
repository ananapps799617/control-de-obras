// ============================================================
// ARCHIVO: src/features/carpinteria/three/cabinetMeshFactory.ts
// QUÉ HACE: Construcción de Mallas Three.js, puertas batientes, elevables (pistón gas) y corredizas.
// POR QUÉ: Renderizado PBR de alta fidelidad, interactividad y cinemática realista.
// ============================================================
import * as THREE from 'three';
import { CabinetSpec, CabinetPart, TexturaMelamina } from '../types/cabinet3d';
import { getProceduralTexture } from './proceduralTextureFactory';

const COLOR_MAP: Record<TexturaMelamina, { color: number; roughness: number; metalness: number }> = {
  roble: { color: 0xc89666, roughness: 0.75, metalness: 0.05 },
  cedro: { color: 0x9b4e28, roughness: 0.65, metalness: 0.05 },
  blanco: { color: 0xf1f5f9, roughness: 0.85, metalness: 0.02 },
  arena: { color: 0xd6c7b2, roughness: 0.80, metalness: 0.02 },
  gris: { color: 0x475569, roughness: 0.70, metalness: 0.10 }
};

export function crearMueble3DGroup(parts: CabinetPart[], spec: CabinetSpec): THREE.Group {
  const group = new THREE.Group();
  group.name = 'mueble_paramétrico';

  const factor = Math.max(0, Math.min(1, spec.factorExplosion || 0));
  const isWireframe = spec.modoVista === 'alambre';
  
  let materialSolido: THREE.MeshStandardMaterial;

  if (spec.melamina) {
    const tex = getProceduralTexture(spec.melamina);
    materialSolido = new THREE.MeshStandardMaterial({
      map: tex,
      roughness: spec.melamina.roughness,
      metalness: spec.melamina.metalness,
      wireframe: isWireframe
    });
  } else {
    const finish = COLOR_MAP[spec.acabado] || COLOR_MAP.roble;
    materialSolido = new THREE.MeshStandardMaterial({
      color: finish.color,
      roughness: finish.roughness,
      metalness: finish.metalness,
      wireframe: isWireframe
    });
  }

  const materialCajaCajon = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    roughness: 0.8,
    metalness: 0.02,
    wireframe: isWireframe
  });

  const materialFondo = new THREE.MeshStandardMaterial({
    color: 0xd1b89d,
    roughness: 0.9,
    metalness: 0.0,
    wireframe: isWireframe
  });

  const materialAluminio = new THREE.MeshStandardMaterial({
    color: 0x94a3b8,
    roughness: 0.3,
    metalness: 0.85,
    wireframe: isWireframe
  });

  const lineMaterial = new THREE.LineBasicMaterial({
    color: isWireframe ? 0x38bdf8 : 0x0f172a,
    transparent: true,
    opacity: isWireframe ? 0.9 : 0.25
  });

  const offsetCenterX = spec.ancho / 2;
  const offsetCenterY = spec.alto / 2;
  const offsetCenterZ = spec.profundidad / 2;

  parts.forEach((part) => {
    const geom = new THREE.BoxGeometry(part.dim.x, part.dim.y, part.dim.z);
    
    // Seleccionar material
    let mat = materialSolido;
    if (part.tipo === 'FONDO' || part.tipo === 'FONDO_CAJON') {
      mat = materialFondo;
    } else if (
      part.tipo === 'LATERAL_CAJON_IZQ' || 
      part.tipo === 'LATERAL_CAJON_DER' || 
      part.tipo === 'CONTRAFRENTE_CAJON' || 
      part.tipo === 'TRASERA_CAJON'
    ) {
      mat = materialCajaCajon;
    } else if (part.tipo === 'RIEL_CORREDIZO') {
      mat = materialAluminio;
    }

    const mesh = new THREE.Mesh(geom, mat);
    mesh.castShadow = !isWireframe;
    mesh.receiveShadow = !isWireframe;

    // Calcular posición con factor de explosión y offsets de animación
    const animZ = part.animOffset ? part.animOffset.z : 0;
    let posX = part.pos.x - offsetCenterX + part.vecExplosion.x * factor;
    let posY = part.pos.y - offsetCenterY + part.vecExplosion.y * factor;
    let posZ = part.pos.z - offsetCenterZ + part.vecExplosion.z * factor + animZ;

    // 1. Cinemática de Puertas Batientes (Apertura angular en Y)
    if (spec.aperturaPuertas && (part.tipo === 'PUERTA_IZQ' || part.tipo === 'PUERTA_DER')) {
      const openAngle = Math.PI / 2.5;
      const wDoor = part.dim.x;

      if (part.tipo === 'PUERTA_IZQ') {
        const xHinge = part.pos.x - wDoor / 2 - offsetCenterX;
        const zHinge = part.pos.z - offsetCenterZ;
        const newX = xHinge + (wDoor / 2) * Math.cos(openAngle);
        const newZ = zHinge + (wDoor / 2) * Math.sin(openAngle);
        mesh.rotation.y = -openAngle;
        mesh.position.set(newX, posY, newZ);
      } else if (part.tipo === 'PUERTA_DER') {
        const xHinge = part.pos.x + wDoor / 2 - offsetCenterX;
        const zHinge = part.pos.z - offsetCenterZ;
        const newX = xHinge - (wDoor / 2) * Math.cos(openAngle);
        const newZ = zHinge + (wDoor / 2) * Math.sin(openAngle);
        mesh.rotation.y = openAngle;
        mesh.position.set(newX, posY, newZ);
      }
    }
    // 2. Cinemática de Puertas Elevables / Basculantes (Apertura hacia arriba en X + Pistones)
    else if (spec.aperturaPuertas && part.tipo === 'PUERTA_ELEVABLE') {
      const openAngle = -Math.PI / 2.3; // ~78° hacia arriba
      const hDoor = part.dim.y;
      const yHinge = part.pos.y + hDoor / 2 - offsetCenterY;
      const zHinge = part.pos.z - offsetCenterZ;

      const newY = yHinge - (hDoor / 2) * Math.cos(openAngle);
      const newZ = zHinge - (hDoor / 2) * Math.sin(openAngle);

      mesh.rotation.x = openAngle;
      mesh.position.set(posX, newY, newZ);

      // Renderizar Pistones Neumáticos de Gas
      const pistonMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.9, roughness: 0.2 });
      [-spec.ancho / 2 + 30, spec.ancho / 2 - 30].forEach(pistonX => {
        const pGeo = new THREE.CylinderGeometry(5, 5, hDoor * 0.55, 12);
        const pMesh = new THREE.Mesh(pGeo, pistonMat);
        pMesh.position.set(pistonX, yHinge - hDoor * 0.25, zHinge + 40);
        pMesh.rotation.x = -Math.PI / 4;
        group.add(pMesh);
      });
    }
    // 3. Cinemática de Puertas Corredizas (Deslizamiento lateral en X)
    else if (spec.aperturaPuertas && part.tipo === 'PUERTA_CORREDIZA_EXT') {
      const slideX = -(part.dim.x - 30);
      mesh.position.set(posX + slideX, posY, posZ);
    } else {
      mesh.position.set(posX, posY, posZ);
    }

    // Líneas de aristas
    const edges = new THREE.EdgesGeometry(geom);
    const line = new THREE.LineSegments(edges, lineMaterial);
    mesh.add(line);

    group.add(mesh);
  });

  return group;
}
