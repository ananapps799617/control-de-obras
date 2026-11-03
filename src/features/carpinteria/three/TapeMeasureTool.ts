// ============================================================
// ARCHIVO: src/features/carpinteria/three/TapeMeasureTool.ts
// QUÉ HACE: Herramienta Cinta Métrica 3D y Puntos Guía estilo SketchUp.
// POR QUÉ: Mide cotas milimétricas exactas y fija marcas de referencia en 3D.
// ============================================================
import * as THREE from 'three';
import { getClosestCornerSnap } from './snapUtils';

export interface MeasureData {
  distance: number;
  dx: number;
  dy: number;
  dz: number;
  start: THREE.Vector3 | null;
  end: THREE.Vector3 | null;
  isMeasuring: boolean;
  guidesCount: number;
}

export class TapeMeasureTool {
  private scene: THREE.Scene;
  private camera: THREE.Camera;
  private domElement: HTMLElement;
  private targets: THREE.Object3D[] = [];

  public isActive = false;
  private isMeasuring = false;
  private startPoint: THREE.Vector3 | null = null;
  private currentPoint: THREE.Vector3 | null = null;
  private guides: THREE.Vector3[] = [];

  private raycaster = new THREE.Raycaster();
  private pointer = new THREE.Vector2();

  // Objetos 3D
  public toolGroup = new THREE.Group();
  private lineMesh: THREE.Line;
  private lineGeometry: THREE.BufferGeometry;
  private snapMarker: THREE.Mesh;
  private guidesGroup = new THREE.Group();

  public onUpdate?: (data: MeasureData | null) => void;
  public onRequestRender?: () => void;

  constructor(scene: THREE.Scene, camera: THREE.Camera, domElement: HTMLElement) {
    this.scene = scene;
    this.camera = camera;
    this.domElement = domElement;

    this.toolGroup.name = 'grupo_cinta_metrica';

    // 1. Línea Punteada Elástica
    this.lineGeometry = new THREE.BufferGeometry();
    this.lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0, 0, 0, 0], 3));
    const lineMat = new THREE.LineDashedMaterial({
      color: 0xf59e0b, // Ámbar de cinta métrica
      dashSize: 10,
      gapSize: 5,
      depthTest: false,
      transparent: true,
      opacity: 0.95
    });
    this.lineMesh = new THREE.Line(this.lineGeometry, lineMat);
    this.lineMesh.renderOrder = 998;
    this.lineMesh.visible = false;

    // 2. Marcador de Snap (Esfera indicadora)
    const sphereGeo = new THREE.SphereGeometry(6, 16, 16);
    const sphereMat = new THREE.MeshBasicMaterial({ color: 0x10b981, depthTest: false });
    this.snapMarker = new THREE.Mesh(sphereGeo, sphereMat);
    this.snapMarker.renderOrder = 999;
    this.snapMarker.visible = false;

    this.toolGroup.add(this.lineMesh);
    this.toolGroup.add(this.snapMarker);
    this.toolGroup.add(this.guidesGroup);
    this.scene.add(this.toolGroup);

    this.bindEvents();
  }

  public setTargets(targets: THREE.Object3D[]): void {
    this.targets = targets;
  }

  public activate(): void {
    this.isActive = true;
    this.domElement.style.cursor = 'crosshair';
    this.emitData();
  }

  public deactivate(): void {
    this.isActive = false;
    this.reset();
    this.domElement.style.cursor = 'default';
    if (this.onUpdate) this.onUpdate(null);
  }

  public reset(): void {
    this.isMeasuring = false;
    this.startPoint = null;
    this.currentPoint = null;
    this.lineMesh.visible = false;
    this.snapMarker.visible = false;
    this.emitData();
    this.onRequestRender?.();
  }

  public addGuidePoint(): void {
    const pt = this.currentPoint || this.startPoint;
    if (!pt) return;
    this.guides.push(pt.clone());
    this.renderGuides();
    this.emitData();
    this.onRequestRender?.();
  }

  public clearAllGuides(): void {
    this.guides = [];
    this.renderGuides();
    this.emitData();
    this.onRequestRender?.();
  }

  private renderGuides(): void {
    while (this.guidesGroup.children.length > 0) {
      const child = this.guidesGroup.children[0];
      this.guidesGroup.remove(child);
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();
      }
    }

    const geo = new THREE.SphereGeometry(5, 12, 12);
    const mat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, depthTest: false });

    this.guides.forEach(g => {
      const m = new THREE.Mesh(geo, mat);
      m.position.copy(g);
      m.renderOrder = 997;
      this.guidesGroup.add(m);
    });
  }

  private bindEvents(): void {
    this.domElement.addEventListener('pointerdown', this.onPointerDown);
    this.domElement.addEventListener('pointermove', this.onPointerMove);
  }

  private getRaycastSnap(e: PointerEvent) {
    const rect = this.domElement.getBoundingClientRect();
    this.pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this.pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.pointer, this.camera);
    const intersects = this.raycaster.intersectObjects(this.targets, true);

    if (intersects.length === 0) return null;
    return getClosestCornerSnap(intersects[0], 35);
  }

  private onPointerDown = (e: PointerEvent): void => {
    if (!this.isActive || e.button !== 0) return;

    const snap = this.getRaycastSnap(e);
    if (!snap) return;

    if (!this.isMeasuring) {
      // Primer clic: Fijar Origen
      this.isMeasuring = true;
      this.startPoint = snap.point.clone();
      this.currentPoint = snap.point.clone();
      this.lineMesh.visible = true;
    } else if (this.startPoint) {
      // Segundo clic: Confirmar Medición
      this.currentPoint = snap.point.clone();
      this.updateLine(this.startPoint, this.currentPoint);
      this.isMeasuring = false;
    }
    this.emitData();
    this.onRequestRender?.();
  };

  private onPointerMove = (e: PointerEvent): void => {
    if (!this.isActive) return;

    const snap = this.getRaycastSnap(e);
    if (snap) {
      this.snapMarker.position.copy(snap.point);
      this.snapMarker.visible = true;
      (this.snapMarker.material as THREE.MeshBasicMaterial).color.setHex(
        snap.snapped ? 0x10b981 : 0xf59e0b
      );

      if (this.isMeasuring && this.startPoint) {
        this.currentPoint = snap.point.clone();
        this.updateLine(this.startPoint, this.currentPoint);
      }
      this.emitData();
      this.onRequestRender?.();
    } else {
      this.snapMarker.visible = false;
      this.onRequestRender?.();
    }
  };

  private updateLine(start: THREE.Vector3, end: THREE.Vector3): void {
    const pos = this.lineGeometry.attributes.position as THREE.BufferAttribute;
    pos.setXYZ(0, start.x, start.y, start.z);
    pos.setXYZ(1, end.x, end.y, end.z);
    pos.needsUpdate = true;
    this.lineMesh.computeLineDistances();
    this.lineMesh.visible = true;
  }

  private emitData(): void {
    if (!this.onUpdate) return;
    if (!this.isActive) {
      this.onUpdate(null);
      return;
    }

    const s = this.startPoint;
    const e = this.currentPoint || this.startPoint;
    const dist = s && e ? s.distanceTo(e) : 0;
    const dx = s && e ? Math.abs(e.x - s.x) : 0;
    const dy = s && e ? Math.abs(e.y - s.y) : 0;
    const dz = s && e ? Math.abs(e.z - s.z) : 0;

    this.onUpdate({
      distance: Math.round(dist * 10) / 10,
      dx: Math.round(dx * 10) / 10,
      dy: Math.round(dy * 10) / 10,
      dz: Math.round(dz * 10) / 10,
      start: s,
      end: e,
      isMeasuring: this.isMeasuring,
      guidesCount: this.guides.length
    });
  }

  public dispose(): void {
    this.domElement.removeEventListener('pointerdown', this.onPointerDown);
    this.domElement.removeEventListener('pointermove', this.onPointerMove);
    this.lineGeometry.dispose();
    (this.lineMesh.material as THREE.Material).dispose();
    this.snapMarker.geometry.dispose();
    (this.snapMarker.material as THREE.Material).dispose();
    this.scene.remove(this.toolGroup);
  }
}
