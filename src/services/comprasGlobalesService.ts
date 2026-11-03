// ============================================================
// BLOQUE 1: IMPORTACIONES Y DEPENDENCIAS
// Qué hace: Métodos CRUD en Firestore para la Caja General / Compras Globales y Facturas Multi-Ítem.
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
import { crearGasto, eliminarGastosPorCompraGlobal } from './finanzasService';
import { getFechaHoyLocal } from '../lib/dateUtils.js';
import type { ICompraGlobal, IFormFacturaMultiItem } from '../types/finanzas';

const COLECCION = coleccion('compras_globales');

// ============================================================
// BLOQUE 2: OPERACIONES CRUD COMPRAS GLOBALES
// ============================================================

export const obtenerComprasGlobales = async (): Promise<ICompraGlobal[]> => {
  if (!isFirebaseConfigured) return [];
  try {
    const q = query(collection(db, COLECCION), orderBy('fecha', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...(d.data() as Omit<ICompraGlobal, 'id'>) }));
  } catch (err) {
    console.error("Error al obtener compras globales:", err);
    return [];
  }
};

export const crearCompraGlobal = async (datosCompra: Partial<ICompraGlobal>): Promise<string> => {
  if (!isFirebaseConfigured) {
    throw new Error("⚠️ PENDIENTE: Configura tus credenciales reales de Firebase en .env.local");
  }
  const docRef = await addDoc(collection(db, COLECCION), {
    ...datosCompra,
    monto: Number(datosCompra.monto || 0),
    esImputado: Boolean(datosCompra.proyectoId),
    proyectoId: datosCompra.proyectoId || null,
    creadoEn: serverTimestamp(),
    actualizadoEn: serverTimestamp()
  });
  return docRef.id;
};

export const actualizarCompraGlobal = async (id: string, datosActualizados: Partial<ICompraGlobal>): Promise<void> => {
  if (!isFirebaseConfigured || !id) return;
  const docRef = doc(db, COLECCION, id);
  await updateDoc(docRef, {
    ...datosActualizados,
    monto: Number(datosActualizados.monto || 0),
    actualizadoEn: serverTimestamp()
  });
};

export const actualizarAsignacionProyectoCompra = async (compra: ICompraGlobal, proyectoId?: string, proyectoNombre?: string): Promise<void> => {
  if (!isFirebaseConfigured || !compra || !compra.id) return;
  const docRef = doc(db, COLECCION, compra.id);

  // Limpiar gastos previos en obras
  await eliminarGastosPorCompraGlobal(compra.id);

  if (proyectoId) {
    await crearGasto({
      proyectoId: proyectoId,
      compraGlobalId: compra.id,
      descripcion: `[Compra Imputada] ${compra.descripcion || 'Compra de Insumos/Flete'}`,
      categoria: compra.categoria || 'Materiales',
      monto: Number(compra.monto || 0),
      fecha: compra.fecha || getFechaHoyLocal(),
      proveedor: compra.proveedor || 'Caja General'
    }).catch(err => console.error("Error al registrar gasto en obra:", err));

    await updateDoc(docRef, {
      esImputado: true,
      proyectoId: proyectoId,
      proyectoNombre: proyectoNombre || null,
      actualizadoEn: serverTimestamp()
    });
  } else {
    await updateDoc(docRef, {
      esImputado: false,
      proyectoId: null,
      proyectoNombre: null,
      actualizadoEn: serverTimestamp()
    });
  }
};

export const imputarCompraAProyecto = async (compraId: string, proyectoId: string, montoImputado: number, proyectoNombre?: string): Promise<void> => {
  if (!isFirebaseConfigured || !compraId) return;
  const docRef = doc(db, COLECCION, compraId);

  // Limpiar previos
  await eliminarGastosPorCompraGlobal(compraId);

  await crearGasto({
    proyectoId: proyectoId,
    compraGlobalId: compraId,
    descripcion: `[Compra Imputada] ${proyectoNombre || 'Caja General'}`,
    categoria: 'Materiales',
    monto: Number(montoImputado || 0),
    fecha: getFechaHoyLocal(),
    proveedor: 'Caja General'
  }).catch(err => console.error(err));

  await updateDoc(docRef, {
    esImputado: true,
    proyectoId: proyectoId,
    proyectoNombre: proyectoNombre || '',
    montoImputado: Number(montoImputado || 0),
    actualizadoEn: serverTimestamp()
  });
};

export const imputarCompraDivididaPorProyectos = async (compra: ICompraGlobal, desgloseProyectos: Array<{ proyectoId: string; monto: number | string; proyectoNombre?: string }>): Promise<void> => {
  if (!isFirebaseConfigured || !compra || !compra.id || !Array.isArray(desgloseProyectos)) return;

  await eliminarGastosPorCompraGlobal(compra.id);

  for (const item of desgloseProyectos) {
    if (item.proyectoId && Number(item.monto) > 0) {
      await crearGasto({
        proyectoId: item.proyectoId,
        compraGlobalId: compra.id,
        descripcion: `[División Compra] ${compra.descripcion || 'Insumos'}`,
        categoria: compra.categoria || 'Materiales',
        monto: Number(item.monto),
        fecha: compra.fecha || getFechaHoyLocal(),
        proveedor: compra.proveedor || 'Caja General'
      });
    }
  }

  const docRef = doc(db, COLECCION, compra.id);
  await updateDoc(docRef, {
    esImputado: true,
    imputaciones: desgloseProyectos.filter(d => d.proyectoId && Number(d.monto) > 0),
    actualizadoEn: serverTimestamp()
  });
};

export const registrarFacturaMultiItem = async (facturaData: IFormFacturaMultiItem): Promise<string[]> => {
  if (!isFirebaseConfigured) {
    throw new Error("⚠️ PENDIENTE: Configura tus credenciales reales de Firebase en .env.local");
  }
  const idsCreados: string[] = [];

  for (const fila of facturaData.filas) {
    if (fila.descripcion.trim() && Number(fila.monto) > 0) {
      const docRef = await addDoc(collection(db, COLECCION), {
        descripcion: fila.descripcion,
        categoria: fila.categoria || 'Materiales',
        monto: Number(fila.monto),
        fecha: facturaData.fecha,
        proveedor: facturaData.proveedor,
        facturaNumero: facturaData.facturaNumero,
        proyectoId: fila.proyectoId || '',
        esImputado: Boolean(fila.proyectoId),
        creadoEn: serverTimestamp(),
        actualizadoEn: serverTimestamp()
      });
      idsCreados.push(docRef.id);

      // Si tiene proyectoId vinculado, registrarlo en gastos_proyectos
      if (fila.proyectoId) {
        await crearGasto({
          proyectoId: fila.proyectoId,
          compraGlobalId: docRef.id,
          descripcion: `[Factura ${facturaData.facturaNumero || 'Multi-Ítem'}] ${fila.descripcion}`,
          categoria: fila.categoria || 'Materiales',
          monto: Number(fila.monto),
          fecha: facturaData.fecha,
          proveedor: facturaData.proveedor
        }).catch(err => console.error("Error al registrar gasto desde multi-ítem:", err));
      }
    }
  }

  return idsCreados;
};

export const marcarCompraComoImportadaAMateriales = async (compraId: string): Promise<void> => {
  if (!isFirebaseConfigured || !compraId) return;
  const docRef = doc(db, COLECCION, compraId);
  await updateDoc(docRef, {
    importadaAMateriales: true,
    actualizadoEn: serverTimestamp()
  });
};

export const marcarCompraComoImportadaAHerramientas = async (compraId: string): Promise<void> => {
  if (!isFirebaseConfigured || !compraId) return;
  const docRef = doc(db, COLECCION, compraId);
  await updateDoc(docRef, {
    importadaAHerramientas: true,
    actualizadoEn: serverTimestamp()
  });
};

export const eliminarCompraGlobal = async (id: string): Promise<void> => {
  if (!isFirebaseConfigured) return;
  await eliminarGastosPorCompraGlobal(id);
  const docRef = doc(db, COLECCION, id);
  await deleteDoc(docRef);
};
