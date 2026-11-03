// ============================================================
// BLOQUE 1: IMPORTACIONES Y DEPENDENCIAS
// Qué hace: Métodos CRUD en Firestore para finanzas, abonos y gastos de obra.
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
import type { IAbonoProyecto, IGastoProyecto } from '../types/finanzas';

const COLECCION_FINANZAS = coleccion('finanzas_proyectos');
const COLECCION_ABONOS = coleccion('abonos_proyectos');
const COLECCION_GASTOS = coleccion('gastos_proyectos');

// ============================================================
// BLOQUE 2: VALOR TOTAL CONTRATADO DEL PROYECTO
// ============================================================

export const obtenerFinanzasProyecto = async (proyectoId: string): Promise<{ id: string; valorProyecto?: number } | null> => {
  if (!isFirebaseConfigured || !proyectoId) return null;
  try {
    const q = query(
      collection(db, COLECCION_FINANZAS), 
      where('proyectoId', '==', proyectoId)
    );
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    const docData = snapshot.docs[0];
    return { id: docData.id, ...(docData.data() as { valorProyecto?: number }) };
  } catch (err) {
    console.error("Error al obtener finanzas del proyecto:", err);
    return null;
  }
};

export const guardarValorProyecto = async (proyectoId: string, valorTotal: number | string): Promise<void> => {
  if (!isFirebaseConfigured) return;
  const existente = await obtenerFinanzasProyecto(proyectoId);
  const payload = {
    proyectoId,
    valorProyecto: Number(valorTotal || 0),
    actualizadoEn: serverTimestamp()
  };

  if (existente && existente.id) {
    const docRef = doc(db, COLECCION_FINANZAS, existente.id);
    await updateDoc(docRef, payload);
  } else {
    await addDoc(collection(db, COLECCION_FINANZAS), {
      ...payload,
      creadoEn: serverTimestamp()
    });
  }
};

// ============================================================
// BLOQUE 3: GESTIÓN DE ABONOS / INGRESOS POR PROYECTO
// ============================================================

export const obtenerAbonosPorProyecto = async (proyectoId: string): Promise<IAbonoProyecto[]> => {
  if (!isFirebaseConfigured || !proyectoId) return [];
  try {
    const q = query(
      collection(db, COLECCION_ABONOS),
      where('proyectoId', '==', proyectoId)
    );
    const snapshot = await getDocs(q);
    const abonos = snapshot.docs.map(d => ({ id: d.id, ...(d.data() as Omit<IAbonoProyecto, 'id'>) }));
    return abonos.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
  } catch (err) {
    console.error("Error al obtener abonos:", err);
    return [];
  }
};

export const crearAbono = async (datosAbono: Partial<IAbonoProyecto>): Promise<string> => {
  if (!isFirebaseConfigured) {
    throw new Error("⚠️ PENDIENTE: Configura tus credenciales reales de Firebase en .env.local");
  }
  const docRef = await addDoc(collection(db, COLECCION_ABONOS), {
    ...datosAbono,
    monto: Number(datosAbono.monto || 0),
    creadoEn: serverTimestamp()
  });
  return docRef.id;
};

export const eliminarAbono = async (id: string): Promise<void> => {
  if (!isFirebaseConfigured) return;
  const docRef = doc(db, COLECCION_ABONOS, id);
  await deleteDoc(docRef);
};

// ============================================================
// BLOQUE 4: GESTIÓN DE GASTOS DIRECTOS POR PROYECTO
// ============================================================

export const obtenerGastosPorProyecto = async (proyectoId: string): Promise<IGastoProyecto[]> => {
  if (!isFirebaseConfigured || !proyectoId) return [];
  try {
    const q = query(
      collection(db, COLECCION_GASTOS),
      where('proyectoId', '==', proyectoId)
    );
    const snapshot = await getDocs(q);
    const gastos = snapshot.docs.map(d => ({ id: d.id, ...(d.data() as Omit<IGastoProyecto, 'id'>) }));
    return gastos.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
  } catch (err) {
    console.error("Error al obtener gastos del proyecto:", err);
    return [];
  }
};

export const crearGasto = async (datosGasto: Partial<IGastoProyecto>): Promise<string> => {
  if (!isFirebaseConfigured) {
    throw new Error("⚠️ PENDIENTE: Configura tus credenciales reales de Firebase en .env.local");
  }
  const docRef = await addDoc(collection(db, COLECCION_GASTOS), {
    ...datosGasto,
    monto: Number(datosGasto.monto || 0),
    creadoEn: serverTimestamp(),
    actualizadoEn: serverTimestamp()
  });
  return docRef.id;
};

export const actualizarGasto = async (id: string, datosActualizados: Partial<IGastoProyecto>): Promise<void> => {
  if (!isFirebaseConfigured) return;
  const docRef = doc(db, COLECCION_GASTOS, id);
  await updateDoc(docRef, {
    ...datosActualizados,
    monto: Number(datosActualizados.monto || 0),
    actualizadoEn: serverTimestamp()
  });
};

export const eliminarGasto = async (id: string): Promise<void> => {
  if (!isFirebaseConfigured) return;
  const docRef = doc(db, COLECCION_GASTOS, id);
  await deleteDoc(docRef);
};

export const eliminarGastosPorCompraGlobal = async (compraId: string): Promise<void> => {
  if (!isFirebaseConfigured || !compraId) return;
  try {
    const q = query(
      collection(db, COLECCION_GASTOS),
      where('compraGlobalId', '==', compraId)
    );
    const snapshot = await getDocs(q);
    const promesas = snapshot.docs.map(d => deleteDoc(doc(db, COLECCION_GASTOS, d.id)));
    await Promise.all(promesas);
  } catch (err) {
    console.error("Error al eliminar gastos vinculados a compra global:", err);
  }
};
