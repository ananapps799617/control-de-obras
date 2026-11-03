// ============================================================
// BLOQUE 1: CONTRATO DE DATOS DE EMPLEADOS DE OBRA
// Qué hace: Modela la estructura de personal de obra en Firestore ('empleados').
// Por qué: Tipado estricto para nómina, tarifas y cargos operativos.
// ============================================================

export interface IEmpleado {
  id?: string;
  nombre: string;
  cargo: string;
  cedula?: string;
  telefono?: string;
  email?: string;
  tarifaDiaria?: number | string;
  salarioMensual?: number | string;
  observaciones?: string;
  creadoEn?: unknown;
  actualizadoEn?: unknown;
}

export interface IFormEmpleado {
  nombre: string;
  cargo: string;
  cedula: string;
  telefono: string;
  email: string;
  tarifaDiaria: string;
  salarioMensual: string;
  observaciones: string;
}
