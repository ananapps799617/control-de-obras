// ============================================================
// BLOQUE 1: IMPORTACIÓN DE SDKs OFICIALES DE FIREBASE
// Qué hace: Importa los módulos de Firebase v10 para Auth y Firestore.
// Por qué: Regla RT-01: Conexión a servicios reales directamente.
//          Cumple ORDEN #005: Lectura exclusiva desde variables de entorno.
// ============================================================
import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// ============================================================
// BLOQUE 2: CONFIGURACIÓN DE CREDENCIALES (DESDE .ENV.LOCAL)
// Qué hace: Obtiene las claves exclusivamente desde import.meta.env.
// Por qué: Elimina fallbacks hardcodeados garantizando higiene de código.
// ============================================================
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || ""
};

// Validar que las credenciales obligatorias estén presentes
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.warn("⚠️ Firebase Warning: Faltan variables de entorno en .env.local.");
}

// ============================================================
// BLOQUE 3: CONTROL DE AISLAMIENTO DE DATOS (TESTING vs PRODUCCIÓN)
// Qué hace: Gestiona el prefijo de colecciones para aislar datos de prueba y blindar producción.
// Por qué: Regla DataGuard AnAnApps v2.0: Protección absoluta de datos reales.
// ============================================================

export const getModoEntorno = () => {
  if (typeof window !== 'undefined' && window.localStorage) {
    const guardado = localStorage.getItem('control_obras_entorno');
    if (guardado === 'produccion' || guardado === 'test') return guardado;
  }
  return (import.meta.env.VITE_APP_ENV === 'produccion') ? 'produccion' : 'test';
};

export const setModoEntorno = (modo) => {
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.setItem('control_obras_entorno', modo);
    window.location.reload();
  }
};

/**
 * Retorna el nombre de la colección con prefijo 'test_' si estamos en modo pruebas
 */
export const getCollectionName = (nombreBase) => {
  const modo = getModoEntorno();
  return modo === 'test' ? `test_${nombreBase}` : nombreBase;
};

// Alias abreviado
export const coleccion = getCollectionName;

// ============================================================
// BLOQUE 4: INICIALIZACIÓN DE SERVICIOS SINGLETON
// ============================================================
export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && 
  firebaseConfig.projectId
);

const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
