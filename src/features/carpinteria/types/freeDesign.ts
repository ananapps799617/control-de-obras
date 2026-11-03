// ============================================================
// ARCHIVO: src/features/carpinteria/types/freeDesign.ts
// QUÉ HACE: Tipos e interfaces del Modo Diseño Libre 3D (Estilo SketchUp).
// POR QUÉ: Tipado estricto para manipulación pieza a pieza y snap magnético.
// ============================================================
import { IMelamina } from './melaminas';
import { TipoCanto } from './cabinet3d';

export type OrientacionTablero = 'vertical-lateral' | 'horizontal-base' | 'frontal-fondo';

export interface TableroLibre {
  id: string;
  nombre: string;
  // Dimensiones físicas de la placa en mm
  largo: number;          // Dimensión en el eje principal (mm)
  ancho: number;          // Dimensión secundaria (mm)
  espesor: 15 | 18 | 36;  // Grosor de tablero (mm)
  // Posición del centro geométrico en el espacio 3D (mm)
  pos: { x: number; y: number; z: number };
  // Orientación en el espacio
  orientacion: OrientacionTablero;
  // Acabado y cantos
  melamina: IMelamina;
  cantoLargo: TipoCanto;
  cantoAncho: TipoCanto;
  esVetaVertical: boolean;
}

export interface FreeDesignState {
  modoDiseno: 'parametrico' | 'libre';
  tableros: TableroLibre[];
  tableroSeleccionadoId: string | null;
  snapActivado: boolean;
  distanciaSnap: number; // Tolerancia de imantación en mm (ej. 25 mm)
}
