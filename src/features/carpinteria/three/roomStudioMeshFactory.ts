// ============================================================
// ARCHIVO: src/features/carpinteria/three/roomStudioMeshFactory.ts
// QUÉ HACE: Fábrica Three.js del Entorno Realista de Habitación (Pisos, Paredes y Luces PBR).
// POR QUÉ: Alinea el suelo y muros exactamente en la base y fondo del mueble.
// ============================================================
import * as THREE from 'three';
import { RoomEnvironmentOptions, TipoPisoStudio, TipoParedStudio } from '../types/roomStudio';

function createFloorTexture(tipo: TipoPisoStudio): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    if (tipo === 'madera-parquet') {
      // Fondo madera cálida
      ctx.fillStyle = '#b48a60';
      ctx.fillRect(0, 0, 512, 512);

      // Listones de parquet
      ctx.strokeStyle = '#7c542e';
      ctx.lineWidth = 3;
      const slatH = 64;
      for (let y = 0; y < 512; y += slatH) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(512, y);
        ctx.stroke();

        // Juntas verticales escalonadas
        const offset = (y / slatH) % 2 === 0 ? 0 : 128;
        for (let x = offset; x < 512; x += 256) {
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x, y + slatH);
          ctx.stroke();
        }
      }
    } else if (tipo === 'porcelanato-claro') {
      // Fondo mármol claro / porcelanato
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(0, 0, 512, 512);

      // Juntas de baldosas 60x60
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 4;
      for (let i = 0; i <= 512; i += 128) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(512, i);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, 512);
        ctx.stroke();
      }
    } else {
      // Cemento pulido / Microcemento
      ctx.fillStyle = '#64748b';
      ctx.fillRect(0, 0, 512, 512);
      ctx.fillStyle = '#475569';
      for (let i = 0; i < 40; i++) {
        const x = (i * 73) % 512;
        const y = (i * 127) % 512;
        ctx.fillRect(x, y, 40, 20);
      }
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(6, 6);
  return texture;
}

const COLOR_PARED: Record<TipoParedStudio, number> = {
  'blanco-yeso': 0xf1f5f9,
  'gris-microcemento': 0x94a3b8,
  'beige-arena': 0xe2d9cc
};

export function createRoomStudioGroup(
  options: RoomEnvironmentOptions,
  cabinetDimensions?: { width: number; height: number; depth: number }
): THREE.Group {
  const group = new THREE.Group();
  group.name = 'grupo_entorno_habitacion_studio';

  const cabW = cabinetDimensions?.width || 800;
  const cabH = cabinetDimensions?.height || 750;
  const cabD = cabinetDimensions?.depth || 550;

  const yBase = -cabH / 2;
  const roomW = Math.max(options.dimensionesCuarto.ancho, cabW * 2.5);
  const roomH = options.dimensionesCuarto.alto || 2600;
  const roomD = Math.max(options.dimensionesCuarto.profundidad, cabD * 2.5);

  // 1. SUELO REALISTA PBR (Exactamente en la base del mueble)
  const floorTexture = createFloorTexture(options.tipoPiso);
  const floorGeo = new THREE.PlaneGeometry(roomW, roomD);
  const floorMat = new THREE.MeshStandardMaterial({
    map: floorTexture,
    roughness: options.tipoPiso === 'porcelanato-claro' ? 0.2 : 0.6,
    metalness: 0.05
  });
  const floorMesh = new THREE.Mesh(floorGeo, floorMat);
  floorMesh.rotation.x = -Math.PI / 2;
  floorMesh.position.set(0, yBase, 0);
  floorMesh.receiveShadow = true;
  group.add(floorMesh);

  // 2. PARED TRASERA (Justo detrás del mueble)
  const wallColor = COLOR_PARED[options.tipoPared] || 0xf1f5f9;
  const wallMat = new THREE.MeshStandardMaterial({
    color: wallColor,
    roughness: 0.85,
    metalness: 0.0
  });

  const backWallGeo = new THREE.PlaneGeometry(roomW, roomH);
  const backWallMesh = new THREE.Mesh(backWallGeo, wallMat);
  backWallMesh.position.set(0, yBase + roomH / 2, -cabD / 2 - 10);
  backWallMesh.receiveShadow = true;
  group.add(backWallMesh);

  // 3. PARED LATERAL IZQUIERDA
  const sideWallGeo = new THREE.PlaneGeometry(roomD, roomH);
  const sideWallMesh = new THREE.Mesh(sideWallGeo, wallMat);
  sideWallMesh.rotation.y = Math.PI / 2;
  sideWallMesh.position.set(-cabW / 2 - 100, yBase + roomH / 2, 0);
  sideWallMesh.receiveShadow = true;
  group.add(sideWallMesh);

  // 4. GUARDASCOBAS / RODAPIÉ
  if (options.mostrarRodapie) {
    const rodapieMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4 });
    const rodapieH = 80;
    const rodapieT = 15;

    // Rodapié Trasero
    const rodapieBackGeo = new THREE.BoxGeometry(roomW, rodapieH, rodapieT);
    const rodapieBackMesh = new THREE.Mesh(rodapieBackGeo, rodapieMat);
    rodapieBackMesh.position.set(0, yBase + rodapieH / 2, -cabD / 2 - 10 + rodapieT / 2);
    group.add(rodapieBackMesh);

    // Rodapié Lateral
    const rodapieSideGeo = new THREE.BoxGeometry(rodapieT, rodapieH, roomD);
    const rodapieSideMesh = new THREE.Mesh(rodapieSideGeo, rodapieMat);
    rodapieSideMesh.position.set(-cabW / 2 - 100 + rodapieT / 2, yBase + rodapieH / 2, 0);
    group.add(rodapieSideMesh);
  }

  // 5. LUZ DOWNLIGHT DE TECHO (Spotlight suave)
  const spotLight = new THREE.SpotLight(0xfffaed, 0.9);
  spotLight.position.set(0, yBase + roomH - 200, 500);
  spotLight.angle = Math.PI / 3;
  spotLight.penumbra = 0.6;
  spotLight.castShadow = true;
  spotLight.shadow.mapSize.width = 1024;
  spotLight.shadow.mapSize.height = 1024;
  group.add(spotLight);

  return group;
}
