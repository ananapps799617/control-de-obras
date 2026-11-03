// ============================================================
// ARCHIVO: src/features/carpinteria/types/cabinet3d.ts
// QUÉ HACE: Contratos e interfaces TypeScript del Motor 3D de Carpintería.
// POR QUÉ: Tipado estricto (0 any) y fuente única de verdad (SSOT).
// ============================================================

import { IMelamina } from './melaminas';

export type TipoMueble3D = 'modulo-bajo' | 'alacena' | 'closet-estanteria';

export type ModoVista3D = 'solido' | 'alambre' | 'explosionado';

export type TexturaMelamina = 'roble' | 'cedro' | 'blanco' | 'arena' | 'gris';

export type TipoCanto = 'RIGIDO_2MM' | 'FLEXIBLE_045MM' | 'NINGUNO';

export type TipoSistemaPuertas = 'batiente' | 'elevable-basculante' | 'corrediza';

export interface CabinetSpec {
  id?: string;
  nombre: string;
  tipo: TipoMueble3D;
  // Dimensiones exteriores en mm
  ancho: number;       // 300 - 1800 mm
  alto: number;        // 300 - 2400 mm
  profundidad: number; // 200 - 800 mm
  // Espesores en mm
  espesorEstructura: 15 | 18 | 36;
  espesorFondo: 3 | 6;
  // Opciones de ensamble y modulación
  numeroRepisas: number;          // 0 - 6
  divisionesVerticales: number;   // 0, 1, 2 parantes
  puertas: 0 | 1 | 2;             // 0: Abierto, 1: 1 Hoja, 2: 2 Hojas
  tipoSistemaPuertas?: TipoSistemaPuertas; // 'batiente' (defecto), 'elevable-basculante', 'corrediza'
  numeroCajones: 0 | 1 | 2 | 3 | 4; // 0 a 4 cajones
  aperturaPuertas: boolean;       // true: puertas abiertas en 3D
  aperturaCajones: boolean;       // true: cajones extraídos en 3D
  conZocalo: boolean;             // Módulo bajo con patas/zócalo
  alturaZocalo: number;           // ej. 100 mm
  // Material y Visualización
  acabado: TexturaMelamina;
  melamina?: IMelamina;
  modoVista: ModoVista3D;
  factorExplosion: number;        // 0.0 a 1.0 (0% a 100%)
}

export interface CabinetPart {
  id: string;
  etiqueta: string;
  tipo: 
    | 'LATERAL_IZQ'
    | 'LATERAL_DER'
    | 'SUELO'
    | 'TECHO'
    | 'AMARRE_FRONTAL'
    | 'AMARRE_TRASERO'
    | 'FONDO'
    | 'REPISA'
    | 'PARANTE_VERTICAL'
    | 'PUERTA_IZQ'
    | 'PUERTA_DER'
    | 'PUERTA_ELEVABLE'
    | 'PUERTA_CORREDIZA_EXT'
    | 'PUERTA_CORREDIZA_INT'
    | 'RIEL_CORREDIZO'
    | 'FRENTE_CAJON'
    | 'LATERAL_CAJON_IZQ'
    | 'LATERAL_CAJON_DER'
    | 'CONTRAFRENTE_CAJON'
    | 'TRASERA_CAJON'
    | 'FONDO_CAJON'
    | 'ZOCALO';
  // Dimensiones físicas de la pieza en mm (dx, dy, dz)
  dim: { x: number; y: number; z: number };
  // Posición del centro geométrico en el espacio 3D (mm)
  pos: { x: number; y: number; z: number };
  // Vector de desplazamiento para la vista explosionada
  vecExplosion: { x: number; y: number; z: number };
  // Vector de desplazamiento para apertura interactiva (puertas o cajones)
  animOffset?: { x: number; y: number; z: number };
  // Rotación (para puertas o piezas inclinadas)
  rot?: { x: number; y: number; z: number };
  // Metadatos para despiece
  esVetaVertical: boolean;
  cantoLargo: TipoCanto;
  cantoAncho: TipoCanto;
}
