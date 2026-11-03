// ============================================================
// BLOQUE 1: IMPORTACIONES Y DEPENDENCIAS
// Qué hace: Importa métodos CRUD Firestore para la colección 'empleados'.
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
import type { IEmpleado } from '../types/empleado';

const COLECCION = coleccion('empleados');

// ============================================================
// BLOQUE 2: OPERACIONES CRUD EMPLEADOS DE OBRA
// Qué hace: Gestiona personal operativo, nómina y tarifas.
// ============================================================

/**
 * Obtener todos los empleados ordenados por fecha de creación
 */
export const obtenerEmpleados = async (): Promise<IEmpleado[]> => {
  if (!isFirebaseConfigured) return [];
  try {
    const q = query(collection(db, COLECCION), orderBy('creadoEn', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...(d.data() as Omit<IEmpleado, 'id'>) }));
  } catch (err) {
    console.error("Error al obtener empleados:", err);
    return [];
  }
};

/**
 * Crear un nuevo empleado de obra
 */
export const crearEmpleado = async (datosEmpleado: Partial<IEmpleado>): Promise<string> => {
  if (!isFirebaseConfigured) {
    throw new Error("⚠️ PENDIENTE: Configura tus credenciales reales de Firebase en .env.local");
  }
  const docRef = await addDoc(collection(db, COLECCION), {
    ...datosEmpleado,
    creadoEn: serverTimestamp(),
    actualizadoEn: serverTimestamp()
  });
  return docRef.id;
};

/**
 * Actualizar empleado existente
 */
export const actualizarEmpleado = async (id: string, datosActualizados: Partial<IEmpleado>): Promise<void> => {
  if (!isFirebaseConfigured) return;
  const docRef = doc(db, COLECCION, id);
  await updateDoc(docRef, {
    ...datosActualizados,
    actualizadoEn: serverTimestamp()
  });
};

/**
 * Eliminar empleado
 */
export const eliminarEmpleado = async (id: string): Promise<void> => {
  if (!isFirebaseConfigured) return;
  const docRef = doc(db, COLECCION, id);
  await deleteDoc(docRef);
};
