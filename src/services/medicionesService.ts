// ============================================================
// BLOQUE 1: IMPORTACIONES Y DEPENDENCIAS
// Qué hace: Métodos CRUD en Firestore para la colección 'mediciones'.
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

const COLECCION = coleccion('mediciones');

export interface IMedicionZona {
  id?: string;
  proyectoId: string;
  zona: string;
  ancho: number | string;
  alto: number | string;
  profundidad: number | string;
  unidad: string;
  areaM2?: number;
  volumenM3?: number;
  notas?: string;
  creadoEn?: unknown;
  actualizadoEn?: unknown;
}

// ============================================================
// BLOQUE 2: OPERACIONES CRUD MEDICIONES POR PROYECTO
// ============================================================

export const obtenerMedicionesPorProyecto = async (proyectoId: string): Promise<IMedicionZona[]> => {
  if (!isFirebaseConfigured || !proyectoId) return [];
  try {
    const q = query(
      collection(db, COLECCION), 
      where('proyectoId', '==', proyectoId)
    );
    const snapshot = await getDocs(q);
    const lista = snapshot.docs.map(d => ({ id: d.id, ...(d.data() as Omit<IMedicionZona, 'id'>) }));
    return lista.sort((a, b) => ((b.creadoEn as any)?.seconds || 0) - ((a.creadoEn as any)?.seconds || 0));
  } catch (err) {
    console.error("Error al obtener mediciones del proyecto:", err);
    return [];
  }
};

export const crearMedicion = async (datosMedicion: Partial<IMedicionZona>): Promise<string> => {
  if (!isFirebaseConfigured) {
    throw new Error("⚠️ PENDIENTE: Configura tus credenciales reales de Firebase en .env.local");
  }

  if (!datosMedicion.proyectoId) {
    throw new Error("⚠️ Error: Se requiere seleccionar un Proyecto obligatoriamente.");
  }

  const docRef = await addDoc(collection(db, COLECCION), {
    ...datosMedicion,
    ancho: Number(datosMedicion.ancho || 0),
    alto: Number(datosMedicion.alto || 0),
    profundidad: Number(datosMedicion.profundidad || 0),
    areaM2: Number(datosMedicion.areaM2 || 0),
    volumenM3: Number(datosMedicion.volumenM3 || 0),
    creadoEn: serverTimestamp(),
    actualizadoEn: serverTimestamp()
  });
  return docRef.id;
};

export const actualizarMedicion = async (id: string, datosMedicion: Partial<IMedicionZona>): Promise<void> => {
  if (!isFirebaseConfigured || !id) return;
  const docRef = doc(db, COLECCION, id);
  await updateDoc(docRef, {
    ...datosMedicion,
    ancho: Number(datosMedicion.ancho || 0),
    alto: Number(datosMedicion.alto || 0),
    profundidad: Number(datosMedicion.profundidad || 0),
    areaM2: Number(datosMedicion.areaM2 || 0),
    volumenM3: Number(datosMedicion.volumenM3 || 0),
    actualizadoEn: serverTimestamp()
  });
};

export const eliminarMedicion = async (id: string): Promise<void> => {
  if (!isFirebaseConfigured || !id) return;
  const docRef = doc(db, COLECCION, id);
  await deleteDoc(docRef);
};
