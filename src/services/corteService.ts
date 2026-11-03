// ============================================================
// BLOQUE 1: IMPORTACIONES Y DEPENDENCIAS
// Qué hace: Métodos CRUD en Firestore para la colección 'listas_corte'.
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

const COLECCION = coleccion('listas_corte');

export interface IPiezaCorte {
  id: number | string;
  descripcion: string;
  cantidad: number | string;
  altoVeta: number | string;
  ancho: number | string;
  alto1?: string;
  alto2?: string;
  ancho1?: string;
  ancho2?: string;
  canto?: string;
  color?: string;
}

export interface IListaCorteProyecto {
  id?: string;
  proyectoId: string;
  nombreLista: string;
  totalPiezas: number;
  piezas: IPiezaCorte[];
  creadoEn?: unknown;
  actualizadoEn?: unknown;
}

// ============================================================
// BLOQUE 2: OPERACIONES DE LISTA DE CORTE
// ============================================================

export const obtenerListaCortePorProyecto = async (proyectoId: string): Promise<IListaCorteProyecto | null> => {
  if (!isFirebaseConfigured || !proyectoId) return null;
  try {
    const q = query(
      collection(db, COLECCION), 
      where('proyectoId', '==', proyectoId)
    );
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    const docData = snapshot.docs[0];
    return { id: docData.id, ...(docData.data() as Omit<IListaCorteProyecto, 'id'>) };
  } catch (err) {
    console.error("Error al obtener lista de corte:", err);
    return null;
  }
};

export const guardarListaCorteProyecto = async (proyectoId: string, datosLista: Partial<IListaCorteProyecto>): Promise<string> => {
  if (!isFirebaseConfigured) {
    throw new Error("⚠️ PENDIENTE: Configura tus credenciales reales de Firebase en .env.local");
  }

  if (!proyectoId) {
    throw new Error("⚠️ Error: Se requiere seleccionar un Proyecto obligatoriamente.");
  }

  const existente = await obtenerListaCortePorProyecto(proyectoId);

  const payload = {
    proyectoId,
    nombreLista: datosLista.nombreLista || 'Lista de Corte Principal',
    totalPiezas: Number(datosLista.totalPiezas || 0),
    piezas: datosLista.piezas || [],
    actualizadoEn: serverTimestamp()
  };

  if (existente && existente.id) {
    const docRef = doc(db, COLECCION, existente.id);
    await updateDoc(docRef, payload);
    return existente.id;
  } else {
    const docRef = await addDoc(collection(db, COLECCION), {
      ...payload,
      creadoEn: serverTimestamp()
    });
    return docRef.id;
  }
};
