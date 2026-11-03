// ============================================================
// BLOQUE 1: IMPORTACIONES Y DEPENDENCIAS
// Qué hace: Servicio CRUD para la agenda de visitas de obra y sincronización con cotizaciones.
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
import { obtenerCotizacionesPorProyecto } from './cotizacionesService.js';
import type { IEventoAgenda, IFormVisitaAgenda } from '../types/agenda';
import type { IProyecto } from '../types/proyecto';

const COLECCION = coleccion('agenda_visitas');

// ============================================================
// BLOQUE 2: OPERACIONES CRUD VISITAS Y CITAS
// ============================================================

export const obtenerVisitasAgenda = async (): Promise<IEventoAgenda[]> => {
  if (!isFirebaseConfigured) return [];
  try {
    const q = query(collection(db, COLECCION), orderBy('fecha', 'asc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...(d.data() as Omit<IEventoAgenda, 'id'>) }));
  } catch (err) {
    console.error("Error al obtener visitas de la agenda:", err);
    return [];
  }
};

export const crearVisitaAgenda = async (datosVisita: Partial<IEventoAgenda>): Promise<string> => {
  if (!isFirebaseConfigured) {
    throw new Error("⚠️ PENDIENTE: Configura tus credenciales reales de Firebase en .env.local");
  }

  const docRef = await addDoc(collection(db, COLECCION), {
    ...datosVisita,
    estado: datosVisita.estado || 'Pendiente',
    tipoEvento: datosVisita.tipoEvento || 'Visita Técnica de Medición',
    creadoEn: serverTimestamp(),
    actualizadoEn: serverTimestamp()
  });
  return docRef.id;
};

export const actualizarVisitaAgenda = async (id: string, datosActualizados: Partial<IEventoAgenda>): Promise<void> => {
  if (!isFirebaseConfigured || !id) return;
  const docRef = doc(db, COLECCION, id);
  await updateDoc(docRef, {
    ...datosActualizados,
    actualizadoEn: serverTimestamp()
  });
};

export const eliminarVisitaAgenda = async (id: string): Promise<void> => {
  if (!isFirebaseConfigured || !id) return;
  const docRef = doc(db, COLECCION, id);
  await deleteDoc(docRef);
};

// ============================================================
// BLOQUE 3: FUSIÓN DE CITAS E HITOS DE COTIZACIONES OFICIALES
// ============================================================

export const obtenerEventosCalendarioCompletos = async (proyectos: IProyecto[] = []): Promise<any[]> => {
  if (!isFirebaseConfigured) return [];
  try {
    const visitas = await obtenerVisitasAgenda();
    const eventosFinales: any[] = visitas.map(v => ({
      ...v,
      origen: 'usuario',
      color: v.tipoEvento === 'Instalación en Obra' ? '#34d399' : v.tipoEvento === 'Reunión con Cliente' ? '#38bdf8' : '#fb923c'
    }));

    // Recorrer cada proyecto para extraer sus cotizaciones e hitos de inicio / entrega
    for (const p of proyectos) {
      if (p.id) {
        const cotizaciones: any[] = await obtenerCotizacionesPorProyecto(p.id);
        if (cotizaciones.length > 0) {
          const cotiz = cotizaciones.sort((a, b) => (b.creadoEn?.seconds || 0) - (a.creadoEn?.seconds || 0))[0];
          if (cotiz && cotiz.datosFormulario) {
            const { fechaInicio, fechaEntrega, duracionEstimada } = cotiz.datosFormulario;

            if (fechaInicio) {
              eventosFinales.push({
                id: `inicio-${cotiz.id}`,
                proyectoId: p.id,
                proyectoNombre: p.nombre,
                fecha: fechaInicio,
                horaInicio: '08:00',
                horaFin: '17:00',
                concepto: `🚀 Inicio de Obra: ${p.nombre}`,
                tipoEvento: 'Inicio de Obra (Cotización)',
                notas: `Cronograma cotizado (${duracionEstimada || '15 días hábiles'})`,
                origen: 'cotizacion',
                color: '#c084fc'
              });
            }

            if (fechaEntrega) {
              eventosFinales.push({
                id: `entrega-${cotiz.id}`,
                proyectoId: p.id,
                proyectoNombre: p.nombre,
                fecha: fechaEntrega,
                horaInicio: '08:00',
                horaFin: '17:00',
                concepto: `🏁 Entrega de Obra: ${p.nombre}`,
                tipoEvento: 'Entrega de Obra (Cotización)',
                notas: `Fecha límite de entrega pactada`,
                origen: 'cotizacion',
                color: '#f43f5e'
              });
            }
          }
        }
      }
    }

    return eventosFinales.sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());
  } catch (err) {
    console.error("Error al compilar eventos del calendario:", err);
    return [];
  }
};

/**
 * Obtener eventos e hitos programados para Hoy y Mañana
 */
export const obtenerEventosProximosHoyManana = async (proyectos: IProyecto[] = []): Promise<{ hoy: any[]; manana: any[]; total: number }> => {
  try {
    const todosEventos = await obtenerEventosCalendarioCompletos(proyectos);
    const hoyDate = new Date();
    const hoyStr = hoyDate.toISOString().split('T')[0];

    const mananaDate = new Date(hoyDate);
    mananaDate.setDate(mananaDate.getDate() + 1);
    const mananaStr = mananaDate.toISOString().split('T')[0];

    const eventosHoy = todosEventos.filter(ev => ev.fecha === hoyStr && ev.estado !== 'Completada');
    const eventosManana = todosEventos.filter(ev => ev.fecha === mananaStr && ev.estado !== 'Completada');

    return {
      hoy: eventosHoy,
      manana: eventosManana,
      total: eventosHoy.length + eventosManana.length
    };
  } catch (err) {
    console.error("Error al filtrar eventos próximos:", err);
    return { hoy: [], manana: [], total: 0 };
  }
};
