// ============================================================
// BLOQUE 1: CONTRATO DE DATOS DE USUARIO Y AUTENTICACIÓN
// Qué hace: Modela la estructura del perfil de usuario y sesión en Firebase Auth.
// Por qué: Regla 3.1 Manual Maestro: Tipado estricto y seguro para Auth.
// ============================================================

export interface IUsuarioPerfil {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL?: string | null;
  empresa?: string;
  telefono?: string;
  cargo?: string;
  createdAt?: string | number;
  updatedAt?: string | number;
}

export interface ICredencialesLogin {
  email: string;
  password?: string;
}
