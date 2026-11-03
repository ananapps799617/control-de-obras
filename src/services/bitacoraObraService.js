// ============================================================
// BLOQUE 1: SERVICIO DE BITÁCORA DIARIA DE OBRA (FIRESTORE)
// Qué hace: Almacenamiento y consulta de reportes diarios de campo
//          (asistencia, clima, avances, bloqueos y evidencias).
// Por qué: Cumple RT-01, RT-02 y RT-04 para trazabilidad diaria de obras.
// ============================================================

import { db, isFirebaseConfigured } from '../lib/firebase.js';
import { coleccion } from '../lib/firebase.js';
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  where,
  serverTimestamp
} from 'firebase/firestore';

const COLECCION_NAME = 'proyectos_bitacora_diaria';

/**
 * Obtener todos los reportes diarios registrados para un proyecto específico
 */
export const obtenerBitacorasProyecto = async (proyectoId) => {
  if (!isFirebaseConfigured || !proyectoId) return [];

  try {
    const q = query(
      collection(db, COLECCION_NAME),
      where('proyectoId', '==', proyectoId)
    );

    const snapshot = await getDocs(q);
    const lista = snapshot.docs.map(d => ({
      id: d.id,
      ...d.data()
    }));

    // Ordenar por fecha desc (las entradas más recientes primero)
    return lista.sort((a, b) => new Date(b.fecha || b.creadoEn || 0) - new Date(a.fecha || a.creadoEn || 0));
  } catch (error) {
    console.error("Error al obtener la bitácora diaria del proyecto:", error);
    return [];
  }
};

/**
 * Registrar un nuevo reporte de bitácora diaria
 */
export const guardarEntradaBitacora = async (datosBitacora) => {
  if (!isFirebaseConfigured) {
    throw new Error("Firebase no está configurado.");
  }

  try {
    const payload = {
      proyectoId: datosBitacora.proyectoId || '',
      codigoProyecto: datosBitacora.codigoProyecto || '',
      nombreProyecto: datosBitacora.nombreProyecto || '',
      fecha: datosBitacora.fecha || new Date().toISOString().split('T')[0],
      clima: datosBitacora.clima || 'Soleado',
      asistencia: {
        maestros: Number(datosBitacora.asistencia?.maestros) || 0,
        oficiales: Number(datosBitacora.asistencia?.oficiales) || 0,
        ayudantes: Number(datosBitacora.asistencia?.ayudantes) || 0,
        total: (Number(datosBitacora.asistencia?.maestros) || 0) + 
               (Number(datosBitacora.asistencia?.oficiales) || 0) + 
               (Number(datosBitacora.asistencia?.ayudantes) || 0)
      },
      actividades: datosBitacora.actividades || '',
      bloqueos: datosBitacora.bloqueos || '',
      fotosEvidencia: datosBitacora.fotosEvidencia || [],
      registradoPor: datosBitacora.registradoPor || 'Encargado de Obra',
      creadoEn: new Date().toISOString(),
      timestampServer: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, COLECCION_NAME), payload);
    console.log("✅ [Bitácora Diaria] Registro guardado en Firestore con ID:", docRef.id);
    return { id: docRef.id, ...payload };
  } catch (error) {
    console.error("Error al guardar entrada de bitácora diaria:", error);
    throw error;
  }
};

/**
 * Eliminar un reporte de la bitácora diaria
 */
export const eliminarEntradaBitacora = async (bitacoraId) => {
  if (!isFirebaseConfigured || !bitacoraId) return false;

  try {
    await deleteDoc(doc(db, COLECCION_NAME, bitacoraId));
    console.log("🗑️ [Bitácora Diaria] Entrada eliminada:", bitacoraId);
    return true;
  } catch (error) {
    console.error("Error al eliminar entrada de bitácora diaria:", error);
    throw error;
  }
};
