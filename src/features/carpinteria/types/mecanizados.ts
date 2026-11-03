// ============================================================
// ARCHIVO: src/features/carpinteria/types/mecanizados.ts
// QUÉ HACE: Definición de tipos para mecanizados, perforaciones y rieles.
// POR QUÉ: Estandariza las cotas de fabricación CNC y ensamble manual (System 32).
// ============================================================

export type TipoMecanizado =
  | 'cazoleta_35mm'
  | 'perforacion_corredera'
  | 'perforacion_repisa'
  | 'perforacion_tornillo_4x50'
  | 'ranura_fondo_3mm'
  | 'tarugo_8x30mm';

export type CaraTablero =
  | 'CARA_A'
  | 'CARA_B'
  | 'CANTO_SUP'
  | 'CANTO_INF'
  | 'CANTO_IZQ'
  | 'CANTO_DER';

export interface MecanizadoPunto {
  id: string;
  tipo: TipoMecanizado;
  cara: CaraTablero;
  u: number;            // Distancia X en la cara (mm)
  v: number;            // Distancia Y en la cara (mm)
  diametro: number;     // Diámetro en mm (35, 5, 8, 4)
  profundidad: number;  // Profundidad en mm
  label: string;        // Descripción para taller (ej. 'Bisagra Superior', 'Riel H1')
}

export interface MecanizadoRailAxis {
  id: string;
  nombre: string;
  cajonIndice: number;
  yLevel: number;       // Altura de montaje desde la base (mm)
  frontOffset: number;  // Offset frontal estándar (37mm)
  length: number;       // Longitud del riel (ej. 450mm)
  holeOffsets: number[]; // Posiciones X de barrenos (ej. [37, 165, 293])
}

export interface PartMachining {
  partId: string;
  partName: string;
  partType: string;
  dimensiones: {
    largo: number;
    ancho: number;
    espesor: number;
  };
  holes: MecanizadoPunto[];
  railAxes: MecanizadoRailAxis[];
}

export type PartMachiningMap = Record<string, PartMachining>;
