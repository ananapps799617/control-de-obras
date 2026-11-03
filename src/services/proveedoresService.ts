// ============================================================
// BLOQUE 1: IMPORTACIONES Y DEPENDENCIAS
// Qué hace: Importa métodos CRUD Firestore para la colección 'proveedores'.
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
import type { IProveedor } from '../types/proveedor';

const COLECCION = coleccion('proveedores');

// ============================================================
// BLOQUE 2: OPERACIONES CRUD PROVEEDORES
// Qué hace: Gestiona proveedores en Firebase con terminología colombiana.
// ============================================================

/**
 * Obtener todos los proveedores ordenados por fecha de creación
 */
export const obtenerProveedores = async (): Promise<IProveedor[]> => {
  if (!isFirebaseConfigured) return [];
  try {
    const q = query(collection(db, COLECCION), orderBy('creadoEn', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...(d.data() as Omit<IProveedor, 'id'>) }));
  } catch (err) {
    console.error("Error al obtener proveedores:", err);
    return [];
  }
};

/**
 * Crear un nuevo proveedor
 */
export const crearProveedor = async (datosProveedor: Partial<IProveedor>): Promise<string> => {
  if (!isFirebaseConfigured) {
    throw new Error("⚠️ PENDIENTE: Configura tus credenciales reales de Firebase en .env.local");
  }
  const docRef = await addDoc(collection(db, COLECCION), {
    ...datosProveedor,
    creadoEn: serverTimestamp(),
    actualizadoEn: serverTimestamp()
  });
  return docRef.id;
};

/**
 * Actualizar proveedor existente
 */
export const actualizarProveedor = async (id: string, datosActualizados: Partial<IProveedor>): Promise<void> => {
  if (!isFirebaseConfigured) return;
  const docRef = doc(db, COLECCION, id);
  await updateDoc(docRef, {
    ...datosActualizados,
    actualizadoEn: serverTimestamp()
  });
};

/**
 * Eliminar proveedor
 */
export const eliminarProveedor = async (id: string): Promise<void> => {
  if (!isFirebaseConfigured) return;
  const docRef = doc(db, COLECCION, id);
  await deleteDoc(docRef);
};
