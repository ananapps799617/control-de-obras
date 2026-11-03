// ============================================================
// BLOQUE 1: IMPORTACIONES Y DEPENDENCIAS
// Qué hace: Importa métodos CRUD Firestore para la colección 'clientes'.
// Por qué: Regla RT-01 y tipado estricto (Manual Maestro 2.3 & 3.1).
// ============================================================
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../lib/firebase.js';
import { coleccion } from '../lib/firebase.js';
import { crearCarpetaClienteInDrive } from './driveService.js';
import type { ICliente } from '../types/cliente';

const COLECCION = coleccion('clientes');

// ============================================================
// BLOQUE 2: OPERACIONES CRUD CLIENTES
// Qué hace: Crear, Leer, Actualizar y Eliminar clientes en Firebase.
// ============================================================

/**
 * Obtener todos los clientes ordenados por fecha de creación
 */
export const obtenerClientes = async (): Promise<ICliente[]> => {
  if (!isFirebaseConfigured) {
    console.warn("⚠️ PENDIENTE: Firestore no está configurado con credenciales reales.");
    return [];
  }
  const q = query(collection(db, COLECCION), orderBy('creadoEn', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...(d.data() as Omit<ICliente, 'id'>) }));
};

/**
 * Crear un nuevo cliente en Firestore con su carpeta de Google Drive asociada
 */
export const crearCliente = async (datosCliente: Partial<ICliente>): Promise<string> => {
  if (!isFirebaseConfigured) {
    throw new Error("⚠️ PENDIENTE: Configura tus credenciales reales de Firebase en .env.local");
  }

  // Crear la carpeta en Google Drive usando el Alias
  const driveInfo = await crearCarpetaClienteInDrive(datosCliente.aliasCarpeta || datosCliente.nombre || 'Cliente_Sin_Nombre');

  const docRef = await addDoc(collection(db, COLECCION), {
    ...datosCliente,
    aliasCarpeta: driveInfo.alias,
    driveFolderId: driveInfo.folderId,
    driveFolderUrl: driveInfo.webViewLink,
    creadoEn: serverTimestamp(),
    actualizadoEn: serverTimestamp()
  });
  return docRef.id;
};

/**
 * Actualizar cliente existente
 */
export const actualizarCliente = async (id: string, datosActualizados: Partial<ICliente>): Promise<void> => {
  if (!isFirebaseConfigured) return;
  const docRef = doc(db, COLECCION, id);
  await updateDoc(docRef, {
    ...datosActualizados,
    actualizadoEn: serverTimestamp()
  });
};

/**
 * Eliminar cliente
 */
export const eliminarCliente = async (id: string): Promise<void> => {
  if (!isFirebaseConfigured) return;
  const docRef = doc(db, COLECCION, id);
  await deleteDoc(docRef);
};
