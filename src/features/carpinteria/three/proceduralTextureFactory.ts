// ============================================================
// ARCHIVO: src/features/carpinteria/three/proceduralTextureFactory.ts
// QUÉ HACE: Generador de Texturas PBR de Alta Definición con vetas orgánicas realistas.
// POR QUÉ: Simula vetas de madera reales (anillos, curvas y poros) On-Device.
// ============================================================
import * as THREE from 'three';
import { IMelamina } from '../types/melaminas';

const textureCache = new Map<string, THREE.CanvasTexture>();

// Convertir Hex a RGB
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const clean = hex.replace('#', '');
  const num = parseInt(clean, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255
  };
}

export function getProceduralTexture(melamina: IMelamina): THREE.CanvasTexture {
  if (textureCache.has(melamina.id)) {
    return textureCache.get(melamina.id)!;
  }

  const width = 1024;
  const height = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    const fallback = new THREE.CanvasTexture(canvas);
    return fallback;
  }

  const rgb = hexToRgb(melamina.colorHex);

  // 1. Color base con degradado suave
  const baseGrad = ctx.createLinearGradient(0, 0, width, height);
  baseGrad.addColorStop(0, `rgb(${Math.min(255, rgb.r + 8)}, ${Math.min(255, rgb.g + 8)}, ${Math.min(255, rgb.b + 8)})`);
  baseGrad.addColorStop(1, `rgb(${Math.max(0, rgb.r - 8)}, ${Math.max(0, rgb.g - 8)}, ${Math.max(0, rgb.b - 8)})`);
  ctx.fillStyle = baseGrad;
  ctx.fillRect(0, 0, width, height);

  // 2. Vetas de Madera Realistas (Curvas orgánicas, anillos de crecimiento y catedrales)
  if (melamina.tipoVeta === 'madera-suave' || melamina.tipoVeta === 'madera-fuerte') {
    const isStrong = melamina.tipoVeta === 'madera-fuerte';
    const lines = isStrong ? 220 : 130;
    const centerKnotX = width * (0.35 + Math.sin(parseInt(melamina.id, 36) || 1) * 0.25);

    // Ondas y vetas fluidas
    for (let i = 0; i < lines; i++) {
      const baseY = (i / lines) * height;
      const alpha = (Math.sin(i * 0.25) * 0.5 + 0.5) * (isStrong ? 0.16 : 0.09);
      const isDark = i % 2 === 0;

      ctx.strokeStyle = isDark
        ? `rgba(${Math.max(0, rgb.r - 40)}, ${Math.max(0, rgb.g - 40)}, ${Math.max(0, rgb.b - 40)}, ${alpha})`
        : `rgba(${Math.min(255, rgb.r + 35)}, ${Math.min(255, rgb.g + 35)}, ${Math.min(255, rgb.b + 35)}, ${alpha * 0.8})`;

      ctx.lineWidth = 1.5 + (Math.sin(i * 0.4) + 1) * 2;
      ctx.beginPath();

      for (let x = 0; x <= width; x += 16) {
        // Distorsión parabólica para crear la forma de "catedral" de la madera
        const distFromCenter = Math.abs(x - centerKnotX);
        const wave = Math.sin(x * 0.015 + i * 0.3) * 12 + Math.cos(x * 0.03) * 6;
        const arch = Math.exp(-distFromCenter * 0.003) * 25 * Math.sin(i * 0.1);
        const y = baseY + wave + arch;

        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();
    }

    // 3. Poros y micro-fibras longitudinales
    const poreCount = isStrong ? 800 : 400;
    ctx.fillStyle = `rgba(0, 0, 0, ${isStrong ? 0.08 : 0.04})`;
    for (let p = 0; p < poreCount; p++) {
      const px = Math.random() * width;
      const py = Math.random() * height;
      const pw = 1 + Math.random() * 1.5;
      const ph = 6 + Math.random() * 18;
      ctx.fillRect(px, py, pw, ph);
    }
  } else if (melamina.tipoVeta === 'lino') {
    // Trama de tejido textil fino
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    for (let x = 0; x < width; x += 3) {
      ctx.fillRect(x, 0, 1.2, height);
    }
    for (let y = 0; y < height; y += 3) {
      ctx.fillRect(0, y, width, 1.2);
    }
  } else if (melamina.tipoVeta === 'mineral') {
    // Vetas de mármol complejas
    ctx.strokeStyle = 'rgba(71, 85, 105, 0.22)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(100, 0);
    ctx.bezierCurveTo(400, 250, 200, 650, 700, 1024);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(148, 163, 184, 0.18)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 300);
    ctx.bezierCurveTo(350, 450, 600, 200, 1024, 700);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1, 1);
  texture.anisotropy = 8;

  textureCache.set(melamina.id, texture);
  return texture;
}

export function clearTextureCache(): void {
  textureCache.forEach(tex => tex.dispose());
  textureCache.clear();
}
