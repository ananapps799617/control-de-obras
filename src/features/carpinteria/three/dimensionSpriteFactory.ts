// ============================================================
// ARCHIVO: src/features/carpinteria/three/dimensionSpriteFactory.ts
// QUÉ HACE: Generador de Sprites 2D orientados a cámara para etiquetas de cotas 3D.
// POR QUÉ: Permite renderizar textos nítidos en milímetros con tipografía JetBrains Mono.
// ============================================================
import * as THREE from 'three';

export function createDimensionLabelSprite(
  texto: string,
  colorTexto = '#f8fafc',
  colorBorde = '#38bdf8',
  colorFondo = 'rgba(15, 23, 42, 0.9)'
): THREE.Sprite {
  const canvas = document.createElement('canvas');
  canvas.width = 384;
  canvas.height = 96;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    // Fondo redondeado con sombra
    ctx.fillStyle = colorFondo;
    ctx.beginPath();
    ctx.roundRect(8, 8, canvas.width - 16, canvas.height - 16, 16);
    ctx.fill();

    // Borde de color de acento
    ctx.lineWidth = 4;
    ctx.strokeStyle = colorBorde;
    ctx.stroke();

    // Texto de cota en JetBrains Mono
    ctx.font = 'bold 36px "JetBrains Mono", monospace, sans-serif';
    ctx.fillStyle = colorTexto;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(texto, canvas.width / 2, canvas.height / 2);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;

  const spriteMaterial = new THREE.SpriteMaterial({
    map: texture,
    depthTest: false,
    transparent: true
  });

  const sprite = new THREE.Sprite(spriteMaterial);
  sprite.scale.set(120, 30, 1);
  sprite.renderOrder = 1002;
  return sprite;
}
