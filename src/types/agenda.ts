// ============================================================
// BLOQUE 1: CONTRATO DE DATOS DE AGENDA Y CITAS DE OBRA
// Qué hace: Modela citas de medición, visitas técnicas, inicios y entregas de obra en Firestore ('agenda_visitas').
// Por qué: Regla 3.1 Manual Maestro: Tipado estricto.
// ============================================================

export type TipoEventoAgenda = 
  | 'Visita Técnica de Medición'
  | 'Instalación en Obra'
  | 'Reunión con Cliente'
  | 'Inicio de Obra (Cotización)'
  | 'Entrega de Obra (Cotización)'
  | 'Otro';

export type EstadoEventoAgenda = 'Pendiente' | 'Completada' | 'Cancelada';

export interface IEventoAgenda {
  id?: string;
  proyectoId?: string;
  proyectoNombre?: string;
  tipoEvento: TipoEventoAgenda;
  concepto: string;
  fecha: string;
  horaInicio?: string;
  horaFin?: string;
  lugar?: string;
  notas?: string;
  estado: EstadoEventoAgenda;
  esAutomatico?: boolean;
  creadoEn?: unknown;
  actualizadoEn?: unknown;
}

export interface IFormVisitaAgenda {
  proyectoId: string;
  tipoEvento: TipoEventoAgenda;
  concepto: string;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  lugar: string;
  notas: string;
  estado: EstadoEventoAgenda;
}
