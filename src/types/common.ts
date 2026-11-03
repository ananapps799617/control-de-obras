// ============================================================
// BLOQUE 1: TIPOS Y RESPUESTAS GENÉRICAS DEL SISTEMA
// Qué hace: Define interfaces de respuestas de servicios y filtros comunes.
// Por qué: Regla 3.1 Manual Maestro: Tipado estricto sin uso de 'any'.
// ============================================================

export interface IRespuestaOperacion<T = undefined> {
  exito: boolean;
  mensaje: string;
  datos?: T;
  error?: string;
}

export type EstadoOperacion = 'idle' | 'loading' | 'success' | 'error';

export interface IOpcionSelector {
  valor: string;
  etiqueta: string;
  icono?: string;
}
