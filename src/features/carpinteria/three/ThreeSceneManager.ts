// ============================================================
// ARCHIVO: src/features/carpinteria/three/ThreeSceneManager.ts
// QUÉ HACE: Gestor de Escena WebGL Three.js con TapeMeasure, Gizmo, Cotas 3D, Room Studio y Render 4K.
// POR QUÉ: Cero consumo de GPU cuando la escena está estática (PWA 60 FPS).
// ============================================================
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';
import { disposeThreeNode } from './memoryManager';
import { TapeMeasureTool } from './TapeMeasureTool';
import { createDimensionLinesGroup, BoundingBox3D } from './dimensionLinesFactory';
import { captureHighResRender, RenderOptions } from './renderSnapshotService';
import { exportToGLTF, exportToOBJ } from './export3DService';
import { createRoomStudioGroup } from './roomStudioMeshFactory';
import { RoomEnvironmentOptions } from '../types/roomStudio';

export class ThreeSceneManager {
  private container: HTMLElement;
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private controls: OrbitControls;
  private raycaster = new THREE.Raycaster();
  private mouse = new THREE.Vector2();
  private currentMeshGroup: THREE.Group | null = null;
  private dimensionLinesGroup: THREE.Group | null = null;
  private roomStudioGroup: THREE.Group | null = null;
  private floorGrid: THREE.GridHelper | null = null;
  private animationFrameId: number | null = null;
  private isDisposed = false;
  private onSelectBoardCb?: (id: string | null) => void;
  private onTransformBoardCb?: (id: string, pos: { x: number; y: number; z: number }) => void;
  private pointerDownPos = { x: 0, y: 0 };

  public tapeTool: TapeMeasureTool;
  public transformControls: TransformControls;
  public gizmoActivo = true;

  constructor(container: HTMLElement) {
    this.container = container;
    const width = container.clientWidth || 600;
    const height = container.clientHeight || 450;

    // 1. Configuración de Escena
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0f172a);

    // 2. Cámara Perspectiva
    this.camera = new THREE.PerspectiveCamera(45, width / height, 10, 10000);
    this.camera.position.set(1200, 900, 1400);

    // 3. Renderer WebGL
    this.renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      powerPreference: 'high-performance',
      preserveDrawingBuffer: true 
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.container.appendChild(this.renderer.domElement);

    // 4. OrbitControls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.maxDistance = 5000;
    this.controls.minDistance = 200;
    this.controls.addEventListener('change', () => this.requestRender());

    // 5. TransformControls (Gizmo 3D)
    this.transformControls = new TransformControls(this.camera, this.renderer.domElement);
    this.transformControls.size = 0.75;
    this.transformControls.setTranslationSnap(10);
    this.transformControls.setRotationSnap(Math.PI / 2);
    
    this.transformControls.addEventListener('dragging-changed', (event: any) => {
      this.controls.enabled = !event.value;
    });

    this.transformControls.addEventListener('change', () => this.requestRender());

    this.transformControls.addEventListener('objectChange', () => {
      const obj = this.transformControls.object;
      if (obj && obj.userData?.boardId && this.onTransformBoardCb) {
        this.onTransformBoardCb(obj.userData.boardId, {
          x: Math.round(obj.position.x),
          y: Math.round(obj.position.y),
          z: Math.round(obj.position.z)
        });
      }
    });

    const gizmoHelper = (this.transformControls as any).getHelper ? (this.transformControls as any).getHelper() : this.transformControls;
    this.scene.add(gizmoHelper);

    // 6. Iluminación
    this.setupLighting();

    // 7. Cuadrícula de Suelo (en Y = -375mm)
    this.setupFloorGrid();

    // 8. Herramienta Cinta Métrica
    this.tapeTool = new TapeMeasureTool(this.scene, this.camera, this.renderer.domElement);
    this.tapeTool.onRequestRender = () => this.requestRender();

    // 9. Raycasting Events
    this.setupRaycasting();

    this.requestRender();
  }

  private setupLighting(): void {
    const ambientLight = new THREE.AmbientLight(0xf8fafc, 0.65);
    this.scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 0.9);
    dirLight1.position.set(1500, 2000, 1500);
    dirLight1.castShadow = true;
    dirLight1.shadow.mapSize.width = 1024;
    dirLight1.shadow.mapSize.height = 1024;
    this.scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x38bdf8, 0.35);
    dirLight2.position.set(-1500, 1000, -1000);
    this.scene.add(dirLight2);
  }

  private setupFloorGrid(): void {
    this.floorGrid = new THREE.GridHelper(3000, 30, 0x38bdf8, 0x1e293b);
    this.floorGrid.position.y = -375;
    this.scene.add(this.floorGrid);
  }

  private setupRaycasting(): void {
    const dom = this.renderer.domElement;
    dom.addEventListener('pointerdown', (e) => {
      this.pointerDownPos = { x: e.clientX, y: e.clientY };
    });

    dom.addEventListener('pointerup', (e) => {
      if (this.tapeTool.isActive || (this.transformControls as any).dragging) return;

      const dist = Math.hypot(e.clientX - this.pointerDownPos.x, e.clientY - this.pointerDownPos.y);
      if (dist > 5) return;

      if (!this.onSelectBoardCb || !this.currentMeshGroup) return;

      const rect = dom.getBoundingClientRect();
      this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      this.raycaster.setFromCamera(this.mouse, this.camera);
      const intersects = this.raycaster.intersectObjects(this.currentMeshGroup.children, true);

      if (intersects.length > 0) {
        let picked: THREE.Object3D | null = intersects[0].object;
        while (picked && !picked.userData?.boardId && picked.parent && picked !== this.currentMeshGroup) {
          picked = picked.parent;
        }
        const boardId = picked?.userData?.boardId || null;
        this.onSelectBoardCb(boardId);
      } else {
        this.onSelectBoardCb(null);
      }
    });
  }

  public setOnSelectBoard(cb: (id: string | null) => void): void {
    this.onSelectBoardCb = cb;
  }

  public setOnTransformBoard(cb: (id: string, pos: { x: number; y: number; z: number }) => void): void {
    this.onTransformBoardCb = cb;
  }

  public attachGizmo(boardId: string | null): void {
    if (!this.gizmoActivo || !boardId || !this.currentMeshGroup) {
      this.transformControls.detach();
      this.requestRender();
      return;
    }

    let targetMesh: THREE.Object3D | null = null;
    this.currentMeshGroup.traverse((obj) => {
      if (obj.userData?.boardId === boardId) {
        targetMesh = obj;
      }
    });

    if (targetMesh) {
      this.transformControls.attach(targetMesh);
    } else {
      this.transformControls.detach();
    }
    this.requestRender();
  }

  public setGizmoMode(mode: 'translate' | 'rotate'): void {
    this.transformControls.setMode(mode);
    this.requestRender();
  }

  public setDimensionLines(box: BoundingBox3D | null): void {
    if (this.dimensionLinesGroup) {
      disposeThreeNode(this.dimensionLinesGroup);
      this.scene.remove(this.dimensionLinesGroup);
      this.dimensionLinesGroup = null;
    }

    if (box) {
      this.dimensionLinesGroup = createDimensionLinesGroup(box);
      this.scene.add(this.dimensionLinesGroup);
    }
    this.requestRender();
  }

  public setRoomEnvironment(
    options: RoomEnvironmentOptions | null,
    dimensions?: { width: number; height: number; depth: number }
  ): void {
    if (this.roomStudioGroup) {
      disposeThreeNode(this.roomStudioGroup);
      this.scene.remove(this.roomStudioGroup);
      this.roomStudioGroup = null;
    }

    if (dimensions && this.floorGrid) {
      this.floorGrid.position.y = -dimensions.height / 2;
    }

    if (options && options.activo) {
      this.roomStudioGroup = createRoomStudioGroup(options, dimensions);
      this.scene.add(this.roomStudioGroup);
      if (this.floorGrid) this.floorGrid.visible = false;
    } else {
      if (this.floorGrid) this.floorGrid.visible = true;
    }
    this.requestRender();
  }

  public captureRender(options: RenderOptions): Promise<string> {
    return captureHighResRender(this.renderer, this.scene, this.camera, options);
  }

  public async exportModelGLTF(filename = 'mueble_carpinteria_3d', binary = true): Promise<void> {
    if (!this.currentMeshGroup) return;
    await exportToGLTF(this.currentMeshGroup, filename, binary);
  }

  public exportModelOBJ(filename = 'mueble_carpinteria_3d'): void {
    if (!this.currentMeshGroup) return;
    exportToOBJ(this.currentMeshGroup, filename);
  }

  public toggleTapeMeasure(enabled: boolean): void {
    if (enabled) {
      this.transformControls.detach();
      this.controls.enabled = false;
      this.tapeTool.activate();
    } else {
      this.tapeTool.deactivate();
      this.controls.enabled = true;
    }
    this.requestRender();
  }

  public setMuebleGroup(group: THREE.Group): void {
    if (this.currentMeshGroup) {
      disposeThreeNode(this.currentMeshGroup);
    }
    this.currentMeshGroup = group;
    this.scene.add(group);
    this.tapeTool.setTargets([group]);
    this.requestRender();
  }

  public resetCamera(): void {
    this.camera.position.set(1200, 900, 1400);
    this.controls.target.set(0, 0, 0);
    this.controls.update();
    this.requestRender();
  }

  public handleResize(): void {
    if (!this.container || this.isDisposed) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    if (width === 0 || height === 0) return;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
    this.requestRender();
  }

  public requestRender(): void {
    if (this.isDisposed) return;
    if (this.animationFrameId === null) {
      this.animationFrameId = requestAnimationFrame(() => {
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
        this.animationFrameId = null;
      });
    }
  }

  public dispose(): void {
    this.isDisposed = true;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }
    this.controls.dispose();
    this.transformControls.dispose();
    this.tapeTool.dispose();
    if (this.currentMeshGroup) {
      disposeThreeNode(this.currentMeshGroup);
    }
    if (this.dimensionLinesGroup) {
      disposeThreeNode(this.dimensionLinesGroup);
    }
    if (this.roomStudioGroup) {
      disposeThreeNode(this.roomStudioGroup);
    }
    disposeThreeNode(this.scene);
    this.renderer.dispose();
    if (this.renderer.domElement && this.renderer.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    }
  }
}
