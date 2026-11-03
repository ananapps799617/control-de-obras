// ============================================================
// BLOQUE 1: CONTRATOS DE DATOS FINANCIEROS Y CONTABLES
// Qué hace: Modela abonos, gastos de obra, compras globales, facturas multi-ítem y balances.
// Por qué: Regla 3.1 Manual Maestro: Tipado estricto y cero pérdida de datos contables.
// ============================================================

export type CategoriaFinanciera = 
  | 'Materiales'
  | 'Mano de Obra'
  | 'Transporte / Fletes'
  | 'Herramientas'
  | 'Subcontratos'
  | 'Viáticos / Alimentación / Hospedaje'
  | 'Administrativos / Servicios'
  | 'Otros';

export interface IAbonoProyecto {
  id?: string;
  proyectoId: string;
  monto: number;
  fecha: string;
  metodoPago?: string;
  referencia?: string;
  notas?: string;
  creadoEn?: unknown;
}

export interface IGastoProyecto {
  id?: string;
  proyectoId: string;
  categoria: CategoriaFinanciera;
  descripcion: string;
  monto: number;
  fecha: string;
  proveedor?: string;
  soporteUrl?: string;
  esCompraGlobal?: boolean;
  compraGlobalId?: string;
  creadoEn?: unknown;
  actualizadoEn?: unknown;
}

export interface IImputacionProyecto {
  proyectoId: string;
  proyectoNombre?: string;
  monto: number;
  fecha: string;
}

export interface ICompraGlobal {
  id?: string;
  descripcion: string;
  categoria: CategoriaFinanciera;
  monto: number;
  fecha: string;
  proveedor?: string;
  facturaNumero?: string;
  proyectoId?: string;
  imputaciones?: IImputacionProyecto[];
  creadoEn?: unknown;
  actualizadoEn?: unknown;
}

export interface IFilaFacturaMultiItem {
  id: string;
  descripcion: string;
  categoria: CategoriaFinanciera;
  monto: number | string;
  proyectoId?: string;
}

export interface IFormFacturaMultiItem {
  proveedor: string;
  facturaNumero: string;
  fecha: string;
  filas: IFilaFacturaMultiItem[];
}
