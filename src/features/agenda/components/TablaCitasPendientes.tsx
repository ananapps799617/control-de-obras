// ============================================================
// BLOQUE 1: IMPORTACIONES Y DEPENDENCIAS
// Qué hace: Lista de citas agendadas filtradas por día o proyecto con acciones.
// Por qué: Regla 2.2 Manual Maestro: Componentes modulares atómicos (< 200 líneas).
// ============================================================
import React from 'react';
import { Clock, MapPin, CheckCircle, Trash2, Calendar, HardHat } from 'lucide-react';
import type { IEventoAgenda } from '../../../types/agenda';

interface TablaCitasPendientesProps {
  eventos: any[];
  cargando: boolean;
  diaSeleccionado: string;
  onCompletar: (id: string) => void;
  onEliminar: (id: string, concepto: string) => void;
}

// ============================================================
// BLOQUE 2: COMPONENTE TABLA DE CITAS PENDIENTES
// ============================================================
export default function TablaCitasPendientes({
  eventos,
  cargando,
  diaSeleccionado,
  onCompletar,
  onEliminar
}: TablaCitasPendientesProps) {
  const eventosFiltrados = diaSeleccionado 
    ? eventos.filter(e => e.fecha === diaSeleccionado)
    : eventos;

  if (cargando) {
    return (
      <div style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>
        Cargando eventos de la agenda...
      </div>
    );
  }

  if (eventosFiltrados.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
        {diaSeleccionado ? `No hay citas agendadas para el día ${diaSeleccionado}.` : 'No hay citas registradas en la agenda.'}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {eventosFiltrados.map((ev: any) => (
        <div
          key={ev.id}
          style={{
            padding: '14px 16px',
            background: 'rgba(255,255,255,0.03)',
            borderLeft: `4px solid ${ev.color || '#38bdf8'}`,
            borderRadius: '6px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '10px'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <strong style={{ color: '#f8fafc', fontSize: '0.95rem' }}>{ev.concepto}</strong>
              <span className="badge badge-secondary" style={{ fontSize: '0.75rem' }}>
                {ev.tipoEvento}
              </span>
            </div>

            <div style={{ display: 'flex', gap: '12px', fontSize: '0.8rem', color: '#94a3b8', marginTop: '4px', flexWrap: 'wrap' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Calendar size={13} color="#38bdf8" /> {ev.fecha}
              </span>
              {ev.horaInicio && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Clock size={13} color="#38bdf8" /> {ev.horaInicio} {ev.horaFin && `- ${ev.horaFin}`}
                </span>
              )}
              {ev.lugar && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <MapPin size={13} color="#94a3b8" /> {ev.lugar}
                </span>
              )}
            </div>

            {ev.notas && (
              <div style={{ fontSize: '0.78rem', color: '#cbd5e1', marginTop: '4px' }}>
                📝 {ev.notas}
              </div>
            )}
          </div>

          {ev.origen === 'usuario' && (
            <div style={{ display: 'flex', gap: '6px' }}>
              {ev.estado !== 'Completada' && (
                <button
                  onClick={() => onCompletar(ev.id)}
                  className="btn btn-secondary"
                  style={{ padding: '6px 10px', fontSize: '0.78rem', color: '#34d399' }}
                  title="Marcar como completada"
                >
                  <CheckCircle size={14} /> Listo
                </button>
              )}
              <button
                onClick={() => onEliminar(ev.id, ev.concepto)}
                className="btn btn-secondary"
                style={{ padding: '6px 8px', color: '#f87171' }}
                title="Eliminar cita"
              >
                <Trash2 size={14} />
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
