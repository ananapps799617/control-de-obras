// ============================================================
// BLOQUE 1: CONTRATO DE DATOS DE PROVEEDORES
// Qué hace: Modela la estructura de un proveedor en Firestore ('proveedores').
// Por qué: Preservación de esquema con terminología colombiana (NIT, Razón Social).
// ============================================================

export interface IProveedor {
  id?: string;
  razonSocial: string;
  nombre?: string;
  nit?: string;
  rubro?: string;
  contactoNombre?: string;
  municipioDepartamento?: string;
  direccionBarrio?: string;
  telefono?: string;
  email?: string;
  creadoEn?: unknown;
  actualizadoEn?: unknown;
}

export interface IFormProveedor {
  razonSocial: string;
  nit: string;
  rubro: string;
  contactoNombre: string;
  municipioDepartamento: string;
  direccionBarrio: string;
  telefono: string;
  email: string;
}
