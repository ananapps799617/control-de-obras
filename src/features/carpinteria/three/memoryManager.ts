// ============================================================
// ARCHIVO: src/features/carpinteria/three/memoryManager.ts
// QUÉ HACE: Liberación determinista de memoria VRAM y Heap en Three.js.
// POR QUÉ: Evita fugas de memoria (OOM) en dispositivos móviles Android/iOS.
// ============================================================
import * as THREE from 'three';

export function disposeThreeNode(node: THREE.Object3D | null | undefined): void {
  if (!node) return;

  node.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) {
      const mesh = child as THREE.Mesh;

      // 1. Liberar Geometría
      if (mesh.geometry) {
        mesh.geometry.dispose();
      }

      // 2. Liberar Materiales y Texturas
      if (mesh.material) {
        const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        materials.forEach((mat) => {
          const matObj = mat as unknown as Record<string, unknown>;
          Object.keys(matObj).forEach((prop) => {
            const val = matObj[prop];
            if (val && typeof val === 'object' && 'isTexture' in val && (val as THREE.Texture).isTexture) {
              (val as THREE.Texture).dispose();
            }
          });
          mat.dispose();
        });
      }
    }
  });

  if (node.parent) {
    node.parent.remove(node);
  }
}
