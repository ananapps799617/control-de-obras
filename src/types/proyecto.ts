// ============================================================
// BLOQUE 1: CONTRATO DE DATOS DE PROYECTOS Y FASES DE OBRA
// Qué hace: Modela los proyectos, sus estados, presupuestos, avance y carpetas en Firestore ('proyectos').
// Por qué: Regla 3.1 Manual Maestro: Tipado estricto y cero pérdida de datos.
// ============================================================

export type EstadoProyecto = 'Sin Cotizar' | 'Cotizado' | 'Activo' | 'En Progreso' | 'Finalizado' | 'Pausado' | 'Cancelado';

export interface ISubcarpetaDriveInfo {
  nombre: string;
  id: string;
  webViewLink?: string;
}

export interface IFaseProyecto {
  id: string;
  nombre: string;
  completada: boolean;
  orden: number;
  fechaInicio?: string;
  fechaFin?: string;
}

export interface IProyecto {
  id?: string;
  nombre: string;
  codigoObra?: string;
  clienteId?: string;
  clienteNombre?: string;
  codigoCotizacion?: string;
  correlativoCotizacion?: number;
  tipoCotizacion?: string;
  descripcion?: string;
  estado: EstadoProyecto;
  porcentajeAvance?: number;
  lugarObra?: string;
  direccionObra?: string;
  presupuestoTotal?: number;
  gastosTotales?: number;
  driveFolderId?: string;
  driveFolderUrl?: string;
  subcarpetasBase?: ISubcarpetaDriveInfo[];
  fases?: IFaseProyecto[];
  creadoEn?: unknown;
  actualizadoEn?: unknown;
}

export interface IFormProyecto {
  nombre: string;
  codigoObra: string;
  clienteId: string;
  lugarObra: string;
  direccionObra: string;
  tipoCotizacion: string;
  estado: EstadoProyecto;
}
