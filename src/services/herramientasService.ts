// ============================================================
// BLOQUE 1: IMPORTACIONES Y DEPENDENCIAS
// Qué hace: Métodos CRUD en Firestore para la colección 'herramientas_taller'.
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

const COLECCION = coleccion('herramientas_taller');

export interface IHerramienta {
  id?: string;
  nombre: string;
  categoria?: string;
  cantidad: number;
  precioEstimado?: number;
  estado?: string;
  ubicacion?: string;
  creadoEn?: unknown;
  actualizadoEn?: unknown;
}

// ============================================================
// BLOQUE 2: OPERACIONES CRUD HERRAMIENTAS
// ============================================================

export const obtenerHerramientas = async (): Promise<IHerramienta[]> => {
  if (!isFirebaseConfigured) return [];
  try {
    const q = query(collection(db, COLECCION), orderBy('nombre', 'asc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...(d.data() as Omit<IHerramienta, 'id'>) }));
  } catch (err) {
    console.error("Error al obtener herramientas:", err);
    return [];
  }
};

export const crearHerramienta = async (datosHerramienta: Partial<IHerramienta>): Promise<string> => {
  if (!isFirebaseConfigured) {
    throw new Error("⚠️ PENDIENTE: Configura tus credenciales reales de Firebase en .env.local");
  }

  const docRef = await addDoc(collection(db, COLECCION), {
    ...datosHerramienta,
    cantidad: Number(datosHerramienta.cantidad || 1),
    precioEstimado: Number(datosHerramienta.precioEstimado || 0),
    estado: datosHerramienta.estado || '🟢 Operativo / Listo',
    categoria: datosHerramienta.categoria || 'Herramienta Eléctrica',
    ubicacion: datosHerramienta.ubicacion || 'Taller Principal',
    creadoEn: serverTimestamp(),
    actualizadoEn: serverTimestamp()
  });
  return docRef.id;
};

export const actualizarHerramienta = async (id: string, datosHerramienta: Partial<IHerramienta>): Promise<void> => {
  if (!isFirebaseConfigured || !id) return;
  const docRef = doc(db, COLECCION, id);
  await updateDoc(docRef, {
    ...datosHerramienta,
    cantidad: Number(datosHerramienta.cantidad || 1),
    precioEstimado: Number(datosHerramienta.precioEstimado || 0),
    actualizadoEn: serverTimestamp()
  });
};

export const eliminarHerramienta = async (id: string): Promise<void> => {
  if (!isFirebaseConfigured || !id) return;
  const docRef = doc(db, COLECCION, id);
  await deleteDoc(docRef);
};
