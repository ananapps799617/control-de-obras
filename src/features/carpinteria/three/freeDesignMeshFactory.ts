// ============================================================
// ARCHIVO: src/features/carpinteria/three/freeDesignMeshFactory.ts
// QUÉ HACE: Renderizado Three.js para tableros del modo Diseño Libre.
// POR QUÉ: Mallas PBR con soporte de selección interactiva (Raycasting).
// ============================================================
import * as THREE from 'three';
import { TableroLibre } from '../types/freeDesign';
import { getTableroDimensions3D } from '../math/snapEngine';
import { getProceduralTexture } from './proceduralTextureFactory';

export function crearMallaDisenoLibreGroup(
  tableros: TableroLibre[],
  selectedId: string | null
): THREE.Group {
  const group = new THREE.Group();
  group.name = 'grupo_diseno_libre';

  const lineMaterialNormal = new THREE.LineBasicMaterial({
    color: 0x0f172a,
    transparent: true,
    opacity: 0.35
  });

  const lineMaterialSelected = new THREE.LineBasicMaterial({
    color: 0x38bdf8, // Cyan neón para resaltar selección
    linewidth: 3,
    transparent: true,
    opacity: 1.0
  });

  tableros.forEach((tablero) => {
    const isSelected = tablero.id === selectedId;
    const { dx, dy, dz } = getTableroDimensions3D(tablero);

    const geom = new THREE.BoxGeometry(dx, dy, dz);
    const texture = getProceduralTexture(tablero.melamina);

    const mat = new THREE.MeshStandardMaterial({
      map: texture,
      roughness: isSelected ? Math.max(0.2, tablero.melamina.roughness - 0.2) : tablero.melamina.roughness,
      metalness: isSelected ? 0.15 : tablero.melamina.metalness,
      emissive: isSelected ? new THREE.Color(0x0284c7) : new THREE.Color(0x000000),
      emissiveIntensity: isSelected ? 0.25 : 0.0
    });

    const mesh = new THREE.Mesh(geom, mat);
    mesh.name = `tablero_${tablero.id}`;
    mesh.userData = { boardId: tablero.id };
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    mesh.position.set(tablero.pos.x, tablero.pos.y, tablero.pos.z);

    // Aristas
    const edges = new THREE.EdgesGeometry(geom);
    const line = new THREE.LineSegments(edges, isSelected ? lineMaterialSelected : lineMaterialNormal);
    mesh.add(line);

    group.add(mesh);
  });

  return group;
}
