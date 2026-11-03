// ============================================================
// BLOQUE 1: IMPORTACIONES Y DEPENDENCIAS
// Qué hace: Métodos CRUD en Firestore para la colección 'items_proyectos'.
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
  where, 
  serverTimestamp 
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../lib/firebase.js';
import { coleccion } from '../lib/firebase.js';

const COLECCION = coleccion('items_proyectos');

export interface IMaterialFilaItem {
  id: string;
  materialId?: string;
  nombre: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface IItemCompuestoProyecto {
  id?: string;
  proyectoId: string;
  nombreItem: string;
  cantidad: number;
  costoMateriales: number;
  porcentajeGanancia: number;
  precioTotalFinal: number;
  materiales: IMaterialFilaItem[];
  creadoEn?: unknown;
  actualizadoEn?: unknown;
}

// ============================================================
// BLOQUE 2: OPERACIONES CRUD ÍTEMS POR PROYECTO
// ============================================================

export const obtenerItemsPorProyecto = async (proyectoId: string): Promise<IItemCompuestoProyecto[]> => {
  if (!isFirebaseConfigured || !proyectoId) return [];
  try {
    const q = query(
      collection(db, COLECCION), 
      where('proyectoId', '==', proyectoId)
    );
    const snapshot = await getDocs(q);
    const lista = snapshot.docs.map(d => ({ id: d.id, ...(d.data() as Omit<IItemCompuestoProyecto, 'id'>) }));
    return lista.sort((a, b) => ((b.creadoEn as any)?.seconds || 0) - ((a.creadoEn as any)?.seconds || 0));
  } catch (err) {
    console.error("Error al obtener ítems del proyecto:", err);
    return [];
  }
};

export const crearItemProyecto = async (datosItem: Partial<IItemCompuestoProyecto>): Promise<string> => {
  if (!isFirebaseConfigured) {
    throw new Error("⚠️ PENDIENTE: Configura tus credenciales reales de Firebase en .env.local");
  }

  if (!datosItem.proyectoId) {
    throw new Error("⚠️ Error: Se requiere seleccionar un Proyecto obligatoriamente.");
  }

  const docRef = await addDoc(collection(db, COLECCION), {
    ...datosItem,
    costoMateriales: Number(datosItem.costoMateriales || 0),
    cantidad: Number(datosItem.cantidad || 1),
    porcentajeGanancia: Number(datosItem.porcentajeGanancia || 0),
    precioTotalFinal: Number(datosItem.precioTotalFinal || 0),
    materiales: datosItem.materiales || [],
    creadoEn: serverTimestamp(),
    actualizadoEn: serverTimestamp()
  });
  return docRef.id;
};

export const actualizarItemProyecto = async (id: string, datosItem: Partial<IItemCompuestoProyecto>): Promise<void> => {
  if (!isFirebaseConfigured || !id) return;
  const docRef = doc(db, COLECCION, id);
  await updateDoc(docRef, {
    ...datosItem,
    costoMateriales: Number(datosItem.costoMateriales || 0),
    cantidad: Number(datosItem.cantidad || 1),
    porcentajeGanancia: Number(datosItem.porcentajeGanancia || 0),
    precioTotalFinal: Number(datosItem.precioTotalFinal || 0),
    materiales: datosItem.materiales || [],
    actualizadoEn: serverTimestamp()
  });
};

export const eliminarItemProyecto = async (id: string): Promise<void> => {
  if (!isFirebaseConfigured || !id) return;
  const docRef = doc(db, COLECCION, id);
  await deleteDoc(docRef);
};
