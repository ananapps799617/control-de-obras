// ============================================================
// BLOQUE 1: IMPORTACIONES Y DEPENDENCIAS DE FIREBASE AUTH & FIRESTORE
// Qué hace: Importa los métodos de Firebase Authentication v10 y Firestore.
// Por qué: Proporciona autenticación real segura con tipado estricto (Manual Maestro 2.3 & 3.1).
// ============================================================
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendPasswordResetEmail,
  signOut, 
  onAuthStateChanged,
  getAuth,
  User,
  NextOrObserver
} from 'firebase/auth';
import { initializeApp, deleteApp } from 'firebase/app';
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc,
  getDoc,
  setDoc,
  query, 
  where,
  orderBy, 
  serverTimestamp 
} from 'firebase/firestore';
import { auth, db, firebaseConfig, isFirebaseConfigured, coleccion } from '../lib/firebase.js';
import type { IFormCrearEmpleado, IUsuarioEmpleadoDoc, ProfesionUsuario } from '../types/auth';

// ============================================================
// BLOQUE 2: MÉTODOS DE AUTENTICACIÓN Y SESIÓN
// ============================================================

export const loginUsuario = async (email: string, password: string): Promise<User> => {
  if (!isFirebaseConfigured) {
    throw new Error("⚠️ PENDIENTE: Debes agregar tus credenciales reales de Firebase en .env.local");
  }
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
};

export const registrarUsuario = async (email: string, password: string): Promise<User> => {
  if (!isFirebaseConfigured) {
    throw new Error("⚠️ PENDIENTE: Debes agregar tus credenciales reales de Firebase en .env.local");
  }
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  return userCredential.user;
};

export const recuperarPassword = async (email: string): Promise<void> => {
  if (!isFirebaseConfigured) {
    throw new Error("⚠️ PENDIENTE: Debes agregar tus credenciales reales de Firebase en .env.local");
  }
  await sendPasswordResetEmail(auth, email);
};

export const logoutUsuario = async (): Promise<void> => {
  if (!isFirebaseConfigured) return;
  await signOut(auth);
};

export const suscribirEstadoAuth = (callback: NextOrObserver<User | null>): (() => void) => {
  if (!isFirebaseConfigured) {
    if (typeof callback === 'function') callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
};

// ============================================================
// BLOQUE 3: PERFIL DE USUARIO Y CONTROL DE ACCESO (RBAC)
// ============================================================

/**
 * Obtiene el perfil completo de Firestore para el usuario autenticado
 */
export const obtenerPerfilUsuario = async (uid: string): Promise<IUsuarioEmpleadoDoc | null> => {
  if (!isFirebaseConfigured || !uid) return null;
  try {
    const docRef = doc(db, 'usuarios', uid);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return { id: snap.id, ...(snap.data() as Omit<IUsuarioEmpleadoDoc, 'id'>) };
    }
    
    // Buscar por campo uid si no coincide con el doc ID
    const q = query(collection(db, 'usuarios'), where('uid', '==', uid));
    const querySnap = await getDocs(q);
    if (!querySnap.empty) {
      const d = querySnap.docs[0];
      return { id: d.id, ...(d.data() as Omit<IUsuarioEmpleadoDoc, 'id'>) };
    }
    return null;
  } catch (err) {
    console.error("Error al obtener perfil:", err);
    return null;
  }
};

/**
 * Actualiza la profesión o datos del perfil del usuario
 */
export const actualizarPerfilUsuario = async (uid: string, datos: Partial<IUsuarioEmpleadoDoc>): Promise<void> => {
  if (!isFirebaseConfigured || !uid) return;
  try {
    const docRef = doc(db, 'usuarios', uid);
    await setDoc(docRef, {
      ...datos,
      actualizadoEn: serverTimestamp()
    }, { merge: true });
  } catch (err) {
    console.error("Error al actualizar perfil:", err);
    throw err;
  }
};

/**
 * Determina si el usuario tiene acceso a la Suite Exclusiva de Carpintería
 */
export const tieneAccesoCarpinteria = (perfil: { rol?: string; cargo?: string; profesion?: string } | null | undefined): boolean => {
  if (!perfil) return false;
  const rol = (perfil.rol || '').toLowerCase();
  const cargo = (perfil.cargo || '').toLowerCase();
  const profesion = (perfil.profesion || '').toLowerCase();

  return (
    rol.includes('admin') ||
    rol.includes('carpinter') ||
    cargo.includes('carpinter') ||
    profesion.includes('carpinter') ||
    profesion.includes('ebanist')
  );
};

// ============================================================
// BLOQUE 4: GESTIÓN DE ACCESOS Y CUENTAS DE EMPLEADOS
// ============================================================

export const crearCuentaEmpleado = async ({ email, password, nombre, cargo, profesion }: IFormCrearEmpleado): Promise<string> => {
  if (!isFirebaseConfigured) {
    throw new Error("⚠️ PENDIENTE: Configura tus credenciales reales de Firebase en .env.local");
  }

  const appSecundaria = initializeApp(firebaseConfig, "secundaria");
  const authSecundaria = getAuth(appSecundaria);

  try {
    const userCredential = await createUserWithEmailAndPassword(authSecundaria, email, password);
    const uid = userCredential.user.uid;

    await setDoc(doc(db, 'usuarios', uid), {
      uid,
      email,
      nombre,
      cargo: cargo || 'Empleado / Operativo',
      profesion: profesion || 'General',
      rol: 'Empleado',
      creadoEn: serverTimestamp()
    });

    await signOut(authSecundaria);
    await deleteApp(appSecundaria);
    return uid;
  } catch (err) {
    await deleteApp(appSecundaria).catch(() => {});
    throw err;
  }
};

export const obtenerUsuariosEmpleados = async (): Promise<IUsuarioEmpleadoDoc[]> => {
  if (!isFirebaseConfigured) return [];
  try {
    const q = query(collection(db, 'usuarios'), orderBy('creadoEn', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...(d.data() as Omit<IUsuarioEmpleadoDoc, 'id'>) }));
  } catch (err) {
    console.error("Error al obtener usuarios:", err);
    return [];
  }
};
