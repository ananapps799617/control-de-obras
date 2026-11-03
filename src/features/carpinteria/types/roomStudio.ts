// ============================================================
// ARCHIVO: src/features/carpinteria/types/roomStudio.ts
// QUÉ HACE: Tipos e interfaces del Entorno Realista de Habitación (Studio View).
// POR QUÉ: Permite renderizar pisos, paredes e iluminación arquitectónica.
// ============================================================

export type TipoPisoStudio = 'madera-parquet' | 'porcelanato-claro' | 'cemento-pulido';

export type TipoParedStudio = 'blanco-yeso' | 'gris-microcemento' | 'beige-arena';

export interface RoomEnvironmentOptions {
  activo: boolean;
  tipoPiso: TipoPisoStudio;
  tipoPared: TipoParedStudio;
  mostrarRodapie: boolean;
  dimensionesCuarto: {
    ancho: number;    // ej. 3000 mm
    alto: number;     // ej. 2600 mm
    profundidad: number; // ej. 3000 mm
  };
}
