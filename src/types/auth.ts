// ============================================================
// BLOQUE 1: CONTRATOS DE DATOS DE AUTENTICACIÓN, ROLES Y PROFESIONES
// Qué hace: Modela credenciales de acceso, formularios, roles RBAC y profesiones de usuario.
// Por qué: Regla 3.1 Manual Maestro & Plan de Implementación Orden #011.
// ============================================================

export type RolUsuario = 'Administrador' | 'Director' | 'Empleado' | 'Operativo' | 'Carpintero';

export type ProfesionUsuario = 
  | 'Carpintero' 
  | 'Ebanista' 
  | 'Contratista' 
  | 'Arquitecto' 
  | 'Maestro de Obra' 
  | 'Diseñador de Interiores' 
  | 'General';

export interface IUsuarioSesion {
  uid: string;
  email: string | null;
  displayName?: string | null;
  rol?: RolUsuario;
  profesion?: ProfesionUsuario | string;
}

export interface IFormCrearEmpleado {
  nombre: string;
  cargo: string;
  email: string;
  password: string;
  profesion?: ProfesionUsuario | string;
}

export interface IUsuarioEmpleadoDoc {
  id?: string;
  uid: string;
  email: string;
  nombre: string;
  cargo: string;
  rol: RolUsuario;
  profesion?: ProfesionUsuario | string;
  creadoEn?: unknown;
}
