// ============================================================
// BLOQUE 1: SERVICIO DE FOTOS DE OBRA POR PROYECTO (FIRESTORE)
// Qué hace: Gestiona el almacenamiento y consulta de registros
//          fotográficos organizados por Etapa (Antes, Proceso, Terminado)
//          con nomenclatura automática [proyecto]-[etapa]-[numero].
// Por qué: Cumple RT-01, RT-02 y RT-04 para trazabilidad fotográfica.
// ============================================================

import { db } from '../lib/firebase.js';
import { coleccion } from '../lib/firebase.js';
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  where,
  orderBy
} from 'firebase/firestore';

const COLLECTION_NAME = 'proyectos_fotos';

/**
 * Helper para generar el nombre de archivo limpio y estandarizado
 * Ejemplo: "Closet Dormitorio" + "antes" + 1 => "closet-dormitorio-antes-1.jpg"
 */
export const generarNombreArchivoFoto = ({ nombreProyecto = '', etapa = 'antes', numero = 1, extension = 'jpg' }) => {
  const baseLimpia = nombreProyecto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Eliminar acentos
    .trim()
    .replace(/[^a-z0-9]+/g, '-') // Reemplazar espacios y caracteres no alfanuméricos por guiones
    .replace(/^-+|-+$/g, '') || 'proyecto';

  const etapaLimpia = etapa.toLowerCase().trim();
  const extLimpia = extension.replace('.', '').toLowerCase() || 'jpg';

  return `${baseLimpia}-${etapaLimpia}-${numero}.${extLimpia}`;
};

/**
 * Obtener todas las fotos registradas para un proyecto específico
 */
export const obtenerFotosProyecto = async (proyectoId) => {
  if (!proyectoId) return [];

  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('proyectoId', '==', proyectoId)
    );

    const snapshot = await getDocs(q);
    const fotos = snapshot.docs.map(d => ({
      id: d.id,
      ...d.data()
    }));

    // Ordenar por fechaSubida desc (las más recientes primero) o por secuencia
    return fotos.sort((a, b) => new Date(b.fechaSubida || 0) - new Date(a.fechaSubida || 0));
  } catch (error) {
    console.error("Error al obtener fotos del proyecto:", error);
    return [];
  }
};

/**
 * Obtener la siguiente secuencia numérica para una etapa dada en un proyecto
 */
export const obtenerSiguienteSecuenciaEtapa = async (proyectoId, etapa) => {
  if (!proyectoId) return 1;

  try {
    const fotos = await obtenerFotosProyecto(proyectoId);
    const fotosEtapa = fotos.filter(f => (f.etapa || '').toLowerCase() === (etapa || '').toLowerCase());
    
    if (fotosEtapa.length === 0) return 1;

    const maxSecuencia = fotosEtapa.reduce((max, f) => {
      const sec = Number(f.secuencia) || 0;
      return sec > max ? sec : max;
    }, 0);

    return maxSecuencia + 1;
  } catch (error) {
    console.warn("Error al calcular secuencia de foto, iniciando en 1:", error);
    return 1;
  }
};

/**
 * Comprime y redimensiona una imagen para thumbnail liviano de Firestore (Max 600px, JPEG quality 0.5 ~ 30-50KB)
 * Evita el error 'Document exceeds maximum size of 1,048,576 bytes' en Firestore.
 */
export const comprimirImagenParaThumbnail = (dataUrl, maxWidth = 600, quality = 0.5) => {
  return new Promise((resolve) => {
    if (!dataUrl || typeof dataUrl !== 'string' || !dataUrl.startsWith('data:image')) {
      return resolve(dataUrl || '');
    }

    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      let width = img.width;
      let height = img.height;

      if (width > maxWidth || height > maxWidth) {
        if (width > height) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        } else {
          width = Math.round((width * maxWidth) / height);
          height = maxWidth;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);

      const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
      resolve(compressedDataUrl);
    };

    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
};

/**
 * Registrar una nueva foto en Firestore (comprimiendo automáticamente el thumbnail)
 */
export const guardarFotoProyecto = async (datosFoto) => {
  try {
    // Comprimir previewUrl para garantizar que ocupe menos de 80 KB en Firestore
    let previewUrlComprimida = datosFoto.previewUrl || '';
    if (previewUrlComprimida && previewUrlComprimida.length > 100000) {
      previewUrlComprimida = await comprimirImagenParaThumbnail(previewUrlComprimida, 600, 0.5);
    }

    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...datosFoto,
      previewUrl: previewUrlComprimida,
      fechaSubida: datosFoto.fechaSubida || new Date().toISOString()
    });

    console.log("✅ [Fotos Obra] Foto registrada en Firestore con ID:", docRef.id);
    return {
      id: docRef.id,
      ...datosFoto,
      previewUrl: previewUrlComprimida
    };
  } catch (error) {
    console.error("Error al guardar registro de foto en Firestore:", error);
    throw error;
  }
};

/**
 * Eliminar una foto de un proyecto
 */
export const eliminarFotoProyecto = async (fotoId) => {
  if (!fotoId) return false;

  try {
    await deleteDoc(doc(db, COLLECTION_NAME, fotoId));
    console.log("🗑️ [Fotos Obra] Foto eliminada con éxito:", fotoId);
    return true;
  } catch (error) {
    console.error("Error al eliminar foto del proyecto:", error);
    throw error;
  }
};
