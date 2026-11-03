// ============================================================
// ARCHIVO: src/features/carpinteria/three/export3DService.ts
// QUÉ HACE: Exportador 3D universal en formatos .GLTF / .GLB y .OBJ.
// POR QUÉ: Permite abrir el mueble en Realidad Aumentada, Blender y SketchUp.
// ============================================================
import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import { OBJExporter } from 'three/examples/jsm/exporters/OBJExporter.js';

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportToGLTF(
  object: THREE.Object3D,
  filename = 'mueble_carpinteria_3d',
  binary = true
): Promise<void> {
  return new Promise((resolve, reject) => {
    const exporter = new GLTFExporter();
    exporter.parse(
      object,
      (gltf) => {
        if (gltf instanceof ArrayBuffer) {
          const blob = new Blob([gltf], { type: 'model/gltf-binary' });
          downloadBlob(blob, `${filename}.glb`);
        } else {
          const output = JSON.stringify(gltf, null, 2);
          const blob = new Blob([output], { type: 'model/gltf+json' });
          downloadBlob(blob, `${filename}.gltf`);
        }
        resolve();
      },
      (error) => {
        console.error('Error exportando GLTF:', error);
        reject(error);
      },
      { binary }
    );
  });
}

export function exportToOBJ(
  object: THREE.Object3D,
  filename = 'mueble_carpinteria_3d'
): void {
  const exporter = new OBJExporter();
  const result = exporter.parse(object);
  const blob = new Blob([result], { type: 'text/plain' });
  downloadBlob(blob, `${filename}.obj`);
}
