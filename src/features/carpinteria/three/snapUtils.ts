// ============================================================
// ARCHIVO: src/features/carpinteria/three/snapUtils.ts
// QUÉ HACE: Algoritmo matemático de Snapping a esquinas y vértices de tableros.
// POR QUÉ: Permite mediciones milimétricas 100% exactas estilo SketchUp.
// ============================================================
import * as THREE from 'three';

export interface SnapResult {
  point: THREE.Vector3;
  snapped: boolean;
  type: 'vertex' | 'surface';
  targetMesh?: THREE.Mesh;
}

const _vWorld = new THREE.Vector3();

export function getClosestCornerSnap(
  intersection: THREE.Intersection,
  snapThreshold = 35
): SnapResult {
  const mesh = intersection.object as THREE.Mesh;
  const geometry = mesh.geometry;
  const hitPoint = intersection.point;

  if (!geometry || !geometry.attributes.position) {
    return { point: hitPoint.clone(), snapped: false, type: 'surface', targetMesh: mesh };
  }

  // Si es un BoxGeometry, evaluamos las 8 esquinas extremas del tablero
  mesh.updateMatrixWorld(true);
  const matrixWorld = mesh.matrixWorld;

  let minDistanceSq = Infinity;
  let closestVertex = new THREE.Vector3();

  if (geometry instanceof THREE.BoxGeometry && (geometry as any).parameters) {
    const params = (geometry as any).parameters;
    const hw = (params.width || 0) / 2;
    const hh = (params.height || 0) / 2;
    const hd = (params.depth || 0) / 2;

    const corners: [number, number, number][] = [
      [-hw, -hh, -hd], [hw, -hh, -hd], [hw, hh, -hd], [-hw, hh, -hd],
      [-hw, -hh, hd],  [hw, -hh, hd],  [hw, hh, hd],  [-hw, hh, hd]
    ];

    for (const c of corners) {
      _vWorld.set(c[0], c[1], c[2]).applyMatrix4(matrixWorld);
      const distSq = _vWorld.distanceToSquared(hitPoint);
      if (distSq < minDistanceSq) {
        minDistanceSq = distSq;
        closestVertex.copy(_vWorld);
      }
    }
  } else {
    // Para geometrías arbitrarias, evaluamos los 3 vértices de la cara intersectada
    const posAttr = geometry.attributes.position;
    let indices: [number, number, number] | null = null;

    if (geometry.index && intersection.faceIndex != null) {
      const i = intersection.faceIndex * 3;
      indices = [
        geometry.index.getX(i),
        geometry.index.getX(i + 1),
        geometry.index.getX(i + 2)
      ];
    } else if (intersection.face) {
      indices = [intersection.face.a, intersection.face.b, intersection.face.c];
    }

    if (indices) {
      for (const idx of indices) {
        _vWorld.fromBufferAttribute(posAttr, idx).applyMatrix4(matrixWorld);
        const distSq = _vWorld.distanceToSquared(hitPoint);
        if (distSq < minDistanceSq) {
          minDistanceSq = distSq;
          closestVertex.copy(_vWorld);
        }
      }
    }
  }

  const thresholdSq = snapThreshold * snapThreshold;
  if (minDistanceSq <= thresholdSq) {
    return {
      point: closestVertex,
      snapped: true,
      type: 'vertex',
      targetMesh: mesh
    };
  }

  return {
    point: hitPoint.clone(),
    snapped: false,
    type: 'surface',
    targetMesh: mesh
  };
}
