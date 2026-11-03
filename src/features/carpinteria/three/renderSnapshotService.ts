// ============================================================
// ARCHIVO: src/features/carpinteria/three/renderSnapshotService.ts
// QUÉ HACE: Motor de Captura Fotográfica 4K / Ultra-HD para Presentaciones a Clientes.
// POR QUÉ: Genera renders comerciales con ficha de dimensiones y marca de taller.
// ============================================================
import * as THREE from 'three';

export interface RenderOptions {
  resolution: '1080p' | '2K' | '4K';
  background: 'dark' | 'white';
  includeWatermark: boolean;
  cabinetName: string;
  dimensions: string;
  melaminaName: string;
}

const RESOLUCIONES = {
  '1080p': { width: 1920, height: 1080 },
  '2K': { width: 2560, height: 1440 },
  '4K': { width: 3840, height: 2160 }
};

export function captureHighResRender(
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  camera: THREE.PerspectiveCamera,
  options: RenderOptions
): Promise<string> {
  return new Promise((resolve) => {
    const { width, height } = RESOLUCIONES[options.resolution];

    // Guardar estado original
    const origWidth = renderer.domElement.width;
    const origHeight = renderer.domElement.height;
    const origAspect = camera.aspect;
    const origBg = scene.background;

    // Configurar fondo
    scene.background = new THREE.Color(options.background === 'white' ? 0xffffff : 0x0f172a);

    // Ajustar renderer y cámara
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
    renderer.render(scene, camera);

    // Crear canvas 2D para composición y overlay
    const canvas2d = document.createElement('canvas');
    canvas2d.width = width;
    canvas2d.height = height;
    const ctx = canvas2d.getContext('2d');

    if (ctx) {
      // 1. Dibujar render 3D
      ctx.drawImage(renderer.domElement, 0, 0);

      // 2. Overlay / Marca de agua y ficha técnica
      if (options.includeWatermark) {
        const isWhite = options.background === 'white';
        const textColor = isWhite ? '#0f172a' : '#f8fafc';
        const subTextColor = isWhite ? '#475569' : '#94a3b8';
        const cardBg = isWhite ? 'rgba(241, 245, 249, 0.92)' : 'rgba(15, 23, 42, 0.88)';
        const accentColor = '#38bdf8';

        // Tarjeta de Ficha Técnica Superior Izquierda
        ctx.fillStyle = cardBg;
        ctx.beginPath();
        ctx.roundRect(40, 40, 560, 150, 16);
        ctx.fill();
        ctx.strokeStyle = accentColor;
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.fillStyle = accentColor;
        ctx.font = 'bold 22px "Outfit", sans-serif';
        ctx.fillText('🪚 CONTROL DE OBRAS • SUITE 3D', 65, 80);

        ctx.fillStyle = textColor;
        ctx.font = 'bold 28px "Outfit", sans-serif';
        ctx.fillText(options.cabinetName.slice(0, 32), 65, 120);

        ctx.fillStyle = subTextColor;
        ctx.font = 'bold 20px "JetBrains Mono", monospace';
        ctx.fillText(`📐 ${options.dimensions}  •  🪵 ${options.melaminaName}`, 65, 155);

        // Marca de Agua Inferior Derecha
        ctx.fillStyle = isWhite ? 'rgba(15,23,42,0.6)' : 'rgba(255,255,255,0.45)';
        ctx.font = '600 18px "Outfit", sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(`Ecosistema AnAnApps v2.0 • Render 3D Ultra-HD`, width - 40, height - 40);
      }
    }

    const dataUrl = canvas2d.toDataURL('image/png', 1.0);

    // Restaurar estado original
    scene.background = origBg;
    camera.aspect = origAspect;
    camera.updateProjectionMatrix();
    renderer.setSize(origWidth, origHeight, false);
    renderer.render(scene, camera);

    resolve(dataUrl);
  });
}
