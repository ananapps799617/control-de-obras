// ============================================================
// BLOQUE 1: IMPORTACIONES Y DEPENDENCIAS
// Qué hace: Métodos CRUD en Firestore para la colección 'gastos_indirectos_proyectos'.
// Por qué: Regla RT-01 y tipado estricto (Manual Maestro 2.3 & 3.1).
// ============================================================
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  query, 
  where, 
  serverTimestamp 
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../lib/firebase.js';
import { coleccion } from '../lib/firebase.js';

const COLECCION = coleccion('gastos_indirectos_proyectos');

export interface IGastosObraProyecto {
  id?: string;
  proyectoId: string;
  diasLaborales: number;
  totalPagarPersonal: number;
  valorTransporte: number;
  valorAlimentacion: number;
  valorHospedaje: number;
  valorImprevistos: number;
  totalGastosObra: number;
  personalFilas: any[];
  actualizadoEn?: unknown;
}

// ============================================================
// BLOQUE 2: OPERACIONES CRUD GASTOS DE OBRA POR PROYECTO
// ============================================================

export const obtenerGastosPorProyecto = async (proyectoId: string): Promise<IGastosObraProyecto | null> => {
  if (!isFirebaseConfigured || !proyectoId) return null;
  try {
    const q = query(
      collection(db, COLECCION), 
      where('proyectoId', '==', proyectoId)
    );
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    const docData = snapshot.docs[0];
    return { id: docData.id, ...(docData.data() as Omit<IGastosObraProyecto, 'id'>) };
  } catch (err) {
    console.error("Error al obtener gastos de obra:", err);
    return null;
  }
};

export const guardarGastosProyecto = async (proyectoId: string, datosGastos: Partial<IGastosObraProyecto>): Promise<string> => {
  if (!isFirebaseConfigured) {
    throw new Error("⚠️ PENDIENTE: Configura tus credenciales reales de Firebase en .env.local");
  }

  if (!proyectoId) {
    throw new Error("⚠️ Error: Se requiere seleccionar un Proyecto obligatoriamente.");
  }

  const existente = await obtenerGastosPorProyecto(proyectoId);

  const payload = {
    proyectoId,
    diasLaborales: Number(datosGastos.diasLaborales || 0),
    totalPagarPersonal: Number(datosGastos.totalPagarPersonal || 0),
    valorTransporte: Number(datosGastos.valorTransporte || 0),
    valorAlimentacion: Number(datosGastos.valorAlimentacion || 0),
    valorHospedaje: Number(datosGastos.valorHospedaje || 0),
    valorImprevistos: Number(datosGastos.valorImprevistos || 0),
    totalGastosObra: Number(datosGastos.totalGastosObra || 0),
    personalFilas: datosGastos.personalFilas || [],
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
