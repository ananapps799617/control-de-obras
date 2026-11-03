// ============================================================
// BLOQUE 1: CONTRATO DE DATOS DE CLIENTES
// Qué hace: Modela la estructura completa de un cliente en Firestore ('clientes').
// Por qué: Regla 3.1 Manual Maestro: Tipado estricto y cero pérdida de datos.
// ============================================================

export type TipoCliente = 'Persona Natural' | 'Empresa / Razón Social';

export interface ICliente {
  id?: string;
  tipoCliente?: TipoCliente;
  nombre: string;
  aliasCarpeta?: string;
  numeroDocumento?: string;
  lugarExpedicion?: string;
  lugarResidencia?: string;
  direccionResidencia?: string;
  telefono?: string;
  email?: string;
  driveFolderId?: string;
  driveFolderUrl?: string;
  notas?: string;
  creadoEn?: unknown;
  actualizadoEn?: unknown;
}

export interface IFormCliente {
  tipoCliente: TipoCliente;
  nombre: string;
  aliasCarpeta: string;
  numeroDocumento: string;
  lugarExpedicion: string;
  lugarResidencia: string;
  direccionResidencia: string;
  telefono: string;
  email: string;
}
