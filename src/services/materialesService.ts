// ============================================================
// BLOQUE 1: IMPORTACIONES Y DEPENDENCIAS
// Qué hace: Importa métodos CRUD Firestore para la colección 'materiales'.
// Por qué: Gestión de inventarios/materiales de obra en Firestore (Manual Maestro 2.3 & 3.1).
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

const COLECCION = coleccion('materiales');

export interface IMaterial {
  id?: string;
  nombre: string;
  categoria?: string;
  unidad?: string;
  precioUnitario: number;
  proveedorId?: string;
  proveedorNombre?: string;
  creadoEn?: unknown;
  actualizadoEn?: unknown;
}

// ============================================================
// BLOQUE 2: OPERACIONES CRUD MATERIALES
// ============================================================

export const obtenerMateriales = async (): Promise<IMaterial[]> => {
  if (!isFirebaseConfigured) return [];
  const q = query(collection(db, COLECCION), orderBy('creadoEn', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...(d.data() as Omit<IMaterial, 'id'>) }));
};

export const crearMaterial = async (datosMaterial: Partial<IMaterial>): Promise<string> => {
  if (!isFirebaseConfigured) {
    throw new Error("⚠️ PENDIENTE: Configura tus credenciales reales de Firebase en .env.local");
  }
  const docRef = await addDoc(collection(db, COLECCION), {
    ...datosMaterial,
    precioUnitario: Number(datosMaterial.precioUnitario || 0),
    proveedorId: datosMaterial.proveedorId || '',
    creadoEn: serverTimestamp(),
    actualizadoEn: serverTimestamp()
  });
  return docRef.id;
};

export const actualizarMaterial = async (id: string, datosActualizados: Partial<IMaterial>): Promise<void> => {
  if (!isFirebaseConfigured) return;
  const docRef = doc(db, COLECCION, id);
  await updateDoc(docRef, {
    ...datosActualizados,
    precioUnitario: Number(datosActualizados.precioUnitario || 0),
    actualizadoEn: serverTimestamp()
  });
};

export const eliminarMaterial = async (id: string): Promise<void> => {
  if (!isFirebaseConfigured) return;
  const docRef = doc(db, COLECCION, id);
  await deleteDoc(docRef);
};
