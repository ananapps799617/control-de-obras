// ============================================================
// BLOQUE 1: IMPORTACIONES Y DEPENDENCIAS
// Qué hace: Importa métodos CRUD Firestore para la colección 'proyectos'.
// Por qué: Regla RT-01 y tipado estricto (Manual Maestro 2.3 & 3.1).
// ============================================================
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  getDoc,
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../lib/firebase.js';
import { coleccion } from '../lib/firebase.js';
import { crearCarpetaProyectoInDrive } from './driveService.js';
import type { IProyecto, EstadoProyecto } from '../types/proyecto';

const COLECCION = coleccion('proyectos');

// ============================================================
// BLOQUE 2: OPERACIONES CRUD PROYECTOS Y CÓDIGOS CORRELATIVOS
// Qué hace: Crear, Leer, Actualizar y Eliminar proyectos con correlativos automáticos.
// ============================================================

/**
 * Obtener todos los proyectos ordenados por fecha de creación
 */
export const obtenerProyectos = async (): Promise<IProyecto[]> => {
  if (!isFirebaseConfigured) return [];
  const q = query(collection(db, COLECCION), orderBy('creadoEn', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...(d.data() as Omit<IProyecto, 'id'>) }));
};

/**
 * Obtener el siguiente código de cotización secuencial (RH-COT-001-0001)
 */
export const obtenerSiguienteCodigoCotizacion = async (): Promise<{ correlativo: number; codigoCotizacion: string }> => {
  if (!isFirebaseConfigured) {
    return { correlativo: 1, codigoCotizacion: 'RH-COT-001-0001' };
  }
  try {
    const proyectos = await obtenerProyectos();
    let maxCorrelativo = 0;

    proyectos.forEach(p => {
      if (p.correlativoCotizacion && typeof p.correlativoCotizacion === 'number') {
        if (p.correlativoCotizacion > maxCorrelativo) maxCorrelativo = p.correlativoCotizacion;
      }
    });

    const siguienteNum = maxCorrelativo + 1;
    const numPadded = String(siguienteNum).padStart(4, '0');
    const codigoCotizacion = `RH-COT-001-${numPadded}`;

    return { correlativo: siguienteNum, codigoCotizacion };
  } catch (err) {
    console.error("Error al calcular el código de cotización:", err);
    return { correlativo: 1, codigoCotizacion: 'RH-COT-001-0001' };
  }
};

/**
 * Crear un nuevo proyecto en Firestore y su estructura de carpetas en Google Drive
 */
export const crearProyecto = async (datosProyecto: Partial<IProyecto>): Promise<string> => {
  if (!isFirebaseConfigured) {
    throw new Error("⚠️ PENDIENTE: Configura tus credenciales reales de Firebase en .env.local");
  }

  // Validar selección OBLIGATORIA del Cliente
  if (!datosProyecto.clienteId) {
    throw new Error("⚠️ Error: Debe seleccionar obligatoriamente un Cliente antes de crear el proyecto.");
  }

  // Obtener siguiente código autoincremental de cotización si no se especificó
  let codigoCotiz = datosProyecto.codigoCotizacion;
  let correlativoNum = datosProyecto.correlativoCotizacion;

  if (!codigoCotiz || !correlativoNum) {
    const infoCotiz = await obtenerSiguienteCodigoCotizacion();
    codigoCotiz = infoCotiz.codigoCotizacion;
    correlativoNum = infoCotiz.correlativo;
  }

  // Obtener la carpeta del cliente desde Firestore
  let parentDriveFolderId: string | null = null;
  try {
    const clienteDoc = await getDoc(doc(db, 'clientes', datosProyecto.clienteId));
    if (clienteDoc.exists()) {
      parentDriveFolderId = (clienteDoc.data() as { driveFolderId?: string }).driveFolderId || null;
    }
  } catch (err) {
    console.warn("No se pudo obtener la carpeta del cliente padre:", err);
  }

  // Crear la subcarpeta del Proyecto dentro de la carpeta del Cliente con las 6 subcarpetas base
  const driveInfo = await crearCarpetaProyectoInDrive(
    datosProyecto.nombre || 'Obra_Sin_Nombre', 
    datosProyecto.codigoObra || 'OBRA-001', 
    parentDriveFolderId || 'root'
  );

  const docRef = await addDoc(collection(db, COLECCION), {
    ...datosProyecto,
    codigoCotizacion: codigoCotiz,
    correlativoCotizacion: correlativoNum,
    driveFolderId: driveInfo.folderId,
    driveFolderUrl: driveInfo.webViewLink,
    subcarpetasBase: driveInfo.subcarpetas,
    estado: datosProyecto.estado || 'Sin Cotizar',
    porcentajeAvance: Number(datosProyecto.porcentajeAvance) || 0,
    tipoCotizacion: datosProyecto.tipoCotizacion || codigoCotiz,
    lugarObra: datosProyecto.lugarObra || '',
    direccionObra: datosProyecto.direccionObra || '',
    creadoEn: serverTimestamp(),
    actualizadoEn: serverTimestamp()
  });
  return docRef.id;
};

/**
 * Actualizar proyecto existente
 */
export const actualizarProyecto = async (id: string, datosActualizados: Partial<IProyecto>): Promise<void> => {
  if (!isFirebaseConfigured) return;
  const docRef = doc(db, COLECCION, id);
  await updateDoc(docRef, {
    ...datosActualizados,
    actualizadoEn: serverTimestamp()
  });
};

/**
 * Actualizar estado de proyecto
 */
export const actualizarEstadoProyecto = async (id: string, nuevoEstado: EstadoProyecto): Promise<void> => {
  if (!isFirebaseConfigured || !id) return;
  const docRef = doc(db, COLECCION, id);
  const payload: { estado: EstadoProyecto; actualizadoEn: unknown; porcentajeAvance?: number } = {
    estado: nuevoEstado,
    actualizadoEn: serverTimestamp()
  };
  if (nuevoEstado === 'Finalizado') {
    payload.porcentajeAvance = 100;
  }
  await updateDoc(docRef, payload);
};

/**
 * Actualizar el porcentaje de avance de la obra (0 a 100%)
 */
export const actualizarAvanceProyecto = async (id: string, porcentajeAvance: number | string, nuevoEstado?: EstadoProyecto): Promise<void> => {
  if (!isFirebaseConfigured || !id) return;
  const docRef = doc(db, COLECCION, id);
  const avanceNum = Math.min(100, Math.max(0, Number(porcentajeAvance) || 0));

  const payload: { porcentajeAvance: number; actualizadoEn: unknown; estado?: EstadoProyecto } = {
    porcentajeAvance: avanceNum,
    actualizadoEn: serverTimestamp()
  };

  if (nuevoEstado) {
    payload.estado = nuevoEstado;
  } else if (avanceNum >= 100) {
    payload.estado = 'Finalizado';
  }

  await updateDoc(docRef, payload);
};

/**
 * Eliminar proyecto
 */
export const eliminarProyecto = async (id: string): Promise<void> => {
  if (!isFirebaseConfigured) return;
  const docRef = doc(db, COLECCION, id);
  await deleteDoc(docRef);
};
