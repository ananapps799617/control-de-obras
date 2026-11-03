// ============================================================
// BLOQUE 1: SERVICIO DE FASES Y CRONOGRAMA GANTT (FIRESTORE)
// Qué hace: Almacenamiento y consulta de etapas y fases de obra
//          con fechas de inicio/fin, avances y colores de barra Gantt.
// Por qué: Cumple RT-01, RT-02 y RT-04 para control de calendario de obras.
// ============================================================

import { db, isFirebaseConfigured } from '../lib/firebase.js';
import { coleccion } from '../lib/firebase.js';
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  serverTimestamp
} from 'firebase/firestore';

const COLECCION_NAME = 'proyectos_fases';

// Fases predeterminadas recomendadas para carpintería/construcción
export const FASES_PREDETERMINADAS = [
  { nombreFase: '1. Diseño y Mediciones', diasEstimados: 3, color: '#38bdf8' },
  { nombreFase: '2. Habilitado y Listas de Corte', diasEstimados: 4, color: '#c084fc' },
  { nombreFase: '3. Ensamble y Estructura', diasEstimados: 7, color: '#fbbf24' },
  { nombreFase: '4. Acabados y Pintura/Barniz', diasEstimados: 5, color: '#f97316' },
  { nombreFase: '5. Transporte e Instalación en Sitio', diasEstimados: 3, color: '#34d399' },
  { nombreFase: '6. Detalle Final y Entrega', diasEstimados: 2, color: '#22c55e' }
];

/**
 * Obtener todas las fases de un proyecto ordenadas por fecha de inicio o secuencia
 */
export const obtenerFasesProyecto = async (proyectoId) => {
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

    return lista.sort((a, b) => new Date(a.fechaInicioPlan || a.creadoEn || 0) - new Date(b.fechaInicioPlan || b.creadoEn || 0));
  } catch (error) {
    console.error("Error al obtener las fases del proyecto:", error);
    return [];
  }
};

/**
 * Inicializar fases predeterminadas para un proyecto si no tiene fases aún
 */
export const inicializarFasesPredeterminadas = async (proyectoId, fechaInicioBase) => {
  if (!isFirebaseConfigured || !proyectoId) return [];

  try {
    const exist = await obtenerFasesProyecto(proyectoId);
    if (exist.length > 0) return exist;

    const fechaBase = fechaInicioBase ? new Date(fechaInicioBase) : new Date();
    let cursorFecha = new Date(fechaBase);

    const creadas = [];
    for (const item of FASES_PREDETERMINADAS) {
      const inicio = new Date(cursorFecha);
      const fin = new Date(cursorFecha);
      fin.setDate(fin.getDate() + item.diasEstimados);

      const fechaInicioPlan = inicio.toISOString().split('T')[0];
      const fechaFinPlan = fin.toISOString().split('T')[0];

      const payload = {
        proyectoId,
        nombreFase: item.nombreFase,
        fechaInicioPlan,
        fechaFinPlan,
        progreso: 0,
        estado: 'Pendiente', // 'Pendiente' | 'En Proceso' | 'Completado'
        color: item.color,
        creadoEn: new Date().toISOString(),
        timestampServer: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, COLECCION_NAME), payload);
      creadas.push({ id: docRef.id, ...payload });

      // Siguiente fase arranca el día fin
      cursorFecha = new Date(fin);
    }

    return creadas;
  } catch (error) {
    console.error("Error al inicializar fases predeterminadas:", error);
    return [];
  }
};

/**
 * Registrar una nueva fase personalizada
 */
export const guardarFaseProyecto = async (datosFase) => {
  if (!isFirebaseConfigured) return null;

  try {
    const payload = {
      proyectoId: datosFase.proyectoId,
      nombreFase: datosFase.nombreFase || 'Nueva Etapa',
      fechaInicioPlan: datosFase.fechaInicioPlan || new Date().toISOString().split('T')[0],
      fechaFinPlan: datosFase.fechaFinPlan || new Date().toISOString().split('T')[0],
      progreso: Number(datosFase.progreso) || 0,
      estado: datosFase.estado || 'Pendiente',
      color: datosFase.color || '#38bdf8',
      creadoEn: new Date().toISOString(),
      timestampServer: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, COLECCION_NAME), payload);
    return { id: docRef.id, ...payload };
  } catch (error) {
    console.error("Error al guardar fase:", error);
    throw error;
  }
};

/**
 * Actualizar avance o fechas de una fase existente
 */
export const actualizarFaseProyecto = async (faseId, datosActualizados) => {
  if (!isFirebaseConfigured || !faseId) return;

  try {
    const docRef = doc(db, COLECCION_NAME, faseId);
    await updateDoc(docRef, {
      ...datosActualizados,
      actualizadoEn: serverTimestamp()
    });
  } catch (error) {
    console.error("Error al actualizar fase:", error);
    throw error;
  }
};

/**
 * Eliminar una fase del proyecto
 */
export const eliminarFaseProyecto = async (faseId) => {
  if (!isFirebaseConfigured || !faseId) return false;

  try {
    await deleteDoc(doc(db, COLECCION_NAME, faseId));
    return true;
  } catch (error) {
    console.error("Error al eliminar fase:", error);
    throw error;
  }
};
