// ============================================================
// ARCHIVO: src/features/carpinteria/three/dimensionLinesFactory.ts
// QUÉ HACE: Fábrica de Líneas de Cota 3D Exteriores con Testigos/Líneas Guía estilo CAD.
// POR QUÉ: Muestra dimensiones milimétricas perfectamente ancladas a las esquinas del mueble.
// ============================================================
import * as THREE from 'three';
import { createDimensionLabelSprite } from './dimensionSpriteFactory';

export interface BoundingBox3D {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  minZ: number;
  maxZ: number;
}

export function createDimensionLinesGroup(box: BoundingBox3D, offset = 35): THREE.Group {
  const group = new THREE.Group();
  group.name = 'grupo_cotas_exteriores_3d';

  const w = Math.round(box.maxX - box.minX);
  const h = Math.round(box.maxY - box.minY);
  const d = Math.round(box.maxZ - box.minZ);

  if (w <= 0 || h <= 0 || d <= 0) return group;

  const lineMat = new THREE.LineBasicMaterial({
    color: 0x38bdf8,
    linewidth: 2,
    depthTest: false,
    transparent: true,
    opacity: 0.95
  });

  const witnessMat = new THREE.LineDashedMaterial({
    color: 0x64748b,
    dashSize: 8,
    gapSize: 4,
    depthTest: false,
    transparent: true,
    opacity: 0.75
  });

  const tickSize = 10;

  // 1. COTA DE ANCHO (W) — Parte Superior Frontal
  {
    const yCota = box.maxY + offset;
    const zCota = box.maxZ + 5;
    const points = [
      // Línea principal
      new THREE.Vector3(box.minX, yCota, zCota),
      new THREE.Vector3(box.maxX, yCota, zCota),
      // Tick izquierdo
      new THREE.Vector3(box.minX, yCota - tickSize, zCota),
      new THREE.Vector3(box.minX, yCota + tickSize, zCota),
      // Tick derecho
      new THREE.Vector3(box.maxX, yCota - tickSize, zCota),
      new THREE.Vector3(box.maxX, yCota + tickSize, zCota)
    ];

    const geo = new THREE.BufferGeometry().setFromPoints(points);
    const line = new THREE.LineSegments(geo, lineMat);
    line.renderOrder = 1000;
    group.add(line);

    // Líneas Testigo (Extension lines) desde el mueble hasta la cota
    const witnessPoints = [
      new THREE.Vector3(box.minX, box.maxY, zCota),
      new THREE.Vector3(box.minX, yCota + 5, zCota),
      new THREE.Vector3(box.maxX, box.maxY, zCota),
      new THREE.Vector3(box.maxX, yCota + 5, zCota)
    ];
    const witnessGeo = new THREE.BufferGeometry().setFromPoints(witnessPoints);
    const witnessLine = new THREE.LineSegments(witnessGeo, witnessMat);
    witnessLine.computeLineDistances();
    witnessLine.renderOrder = 999;
    group.add(witnessLine);

    const sprite = createDimensionLabelSprite(`W: ${w} mm`, '#f8fafc', '#38bdf8');
    sprite.position.set((box.minX + box.maxX) / 2, yCota + 20, zCota);
    group.add(sprite);
  }

  // 2. COTA DE ALTO (H) — Lateral Izquierdo Frontal
  {
    const xCota = box.minX - offset;
    const zCota = box.maxZ + 5;
    const points = [
      // Línea principal
      new THREE.Vector3(xCota, box.minY, zCota),
      new THREE.Vector3(xCota, box.maxY, zCota),
      // Tick inferior
      new THREE.Vector3(xCota - tickSize, box.minY, zCota),
      new THREE.Vector3(xCota + tickSize, box.minY, zCota),
      // Tick superior
      new THREE.Vector3(xCota - tickSize, box.maxY, zCota),
      new THREE.Vector3(xCota + tickSize, box.maxY, zCota)
    ];

    const geo = new THREE.BufferGeometry().setFromPoints(points);
    const line = new THREE.LineSegments(geo, lineMat);
    line.renderOrder = 1000;
    group.add(line);

    // Líneas Testigo (Extension lines)
    const witnessPoints = [
      new THREE.Vector3(box.minX, box.minY, zCota),
      new THREE.Vector3(xCota - 5, box.minY, zCota),
      new THREE.Vector3(box.minX, box.maxY, zCota),
      new THREE.Vector3(xCota - 5, box.maxY, zCota)
    ];
    const witnessGeo = new THREE.BufferGeometry().setFromPoints(witnessPoints);
    const witnessLine = new THREE.LineSegments(witnessGeo, witnessMat);
    witnessLine.computeLineDistances();
    witnessLine.renderOrder = 999;
    group.add(witnessLine);

    const sprite = createDimensionLabelSprite(`H: ${h} mm`, '#f8fafc', '#f59e0b');
    sprite.position.set(xCota - 25, (box.minY + box.maxY) / 2, zCota);
    group.add(sprite);
  }

  // 3. COTA DE PROFUNDIDAD (D) — Base Lateral Derecha
  {
    const xCota = box.maxX + offset;
    const yCota = box.minY;
    const points = [
      // Línea principal
      new THREE.Vector3(xCota, yCota, box.minZ),
      new THREE.Vector3(xCota, yCota, box.maxZ),
      // Tick trasero
      new THREE.Vector3(xCota, yCota - tickSize, box.minZ),
      new THREE.Vector3(xCota, yCota + tickSize, box.minZ),
      // Tick delantero
      new THREE.Vector3(xCota, yCota - tickSize, box.maxZ),
      new THREE.Vector3(xCota, yCota + tickSize, box.maxZ)
    ];

    const geo = new THREE.BufferGeometry().setFromPoints(points);
    const line = new THREE.LineSegments(geo, lineMat);
    line.renderOrder = 1000;
    group.add(line);

    // Líneas Testigo (Extension lines)
    const witnessPoints = [
      new THREE.Vector3(box.maxX, yCota, box.minZ),
      new THREE.Vector3(xCota + 5, yCota, box.minZ),
      new THREE.Vector3(box.maxX, yCota, box.maxZ),
      new THREE.Vector3(xCota + 5, yCota, box.maxZ)
    ];
    const witnessGeo = new THREE.BufferGeometry().setFromPoints(witnessPoints);
    const witnessLine = new THREE.LineSegments(witnessGeo, witnessMat);
    witnessLine.computeLineDistances();
    witnessLine.renderOrder = 999;
    group.add(witnessLine);

    const sprite = createDimensionLabelSprite(`D: ${d} mm`, '#f8fafc', '#10b981');
    sprite.position.set(xCota + 25, yCota + 15, (box.minZ + box.maxZ) / 2);
    group.add(sprite);
  }

  return group;
}
