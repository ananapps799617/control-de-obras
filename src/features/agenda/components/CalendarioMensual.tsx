// ============================================================
// BLOQUE 1: IMPORTACIONES Y DEPENDENCIAS
// Qué hace: Renderiza el calendario mensual interactivo con eventos de obra e hitos.
// Por qué: Regla 2.2 Manual Maestro: Componentes modulares atómicos (< 200 líneas).
// ============================================================
import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { IEventoAgenda } from '../../../types/agenda';

interface CalendarioMensualProps {
  fechaActual: Date;
  setFechaActual: React.Dispatch<React.SetStateAction<Date>>;
  eventos: any[];
  onSeleccionarDia: (diaStr: string) => void;
  diaSeleccionado: string;
}

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const DIAS_SEMANA = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

// ============================================================
// BLOQUE 2: COMPONENTE CALENDARIO MENSUAL
// ============================================================
export default function CalendarioMensual({
  fechaActual,
  setFechaActual,
  eventos,
  onSeleccionarDia,
  diaSeleccionado
}: CalendarioMensualProps) {
  const anio = fechaActual.getFullYear();
  const mes = fechaActual.getMonth();

  const primerDiaMes = new Date(anio, mes, 1).getDay();
  const diasEnMes = new Date(anio, mes + 1, 0).getDate();

  const handleMesAnterior = () => {
    setFechaActual(new Date(anio, mes - 1, 1));
  };

  const handleMesSiguiente = () => {
    setFechaActual(new Date(anio, mes + 1, 1));
  };

  // Construir matriz de días
  const celdas: Array<{ dia: number | null; fechaStr: string; eventosDia: any[] }> = [];

  for (let i = 0; i < primerDiaMes; i++) {
    celdas.push({ dia: null, fechaStr: '', eventosDia: [] });
  }

  for (let d = 1; d <= diasEnMes; d++) {
    const dStr = String(d).padStart(2, '0');
    const mStr = String(mes + 1).padStart(2, '0');
    const fechaStr = `${anio}-${mStr}-${dStr}`;
    const evs = eventos.filter(e => e.fecha === fechaStr);
    celdas.push({ dia: d, fechaStr, eventosDia: evs });
  }

  return (
    <div className="card" style={{ padding: '20px' }}>
      {/* Controles de Navegación del Mes */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: '#f8fafc' }}>
          {MESES[mes]} {anio}
        </h3>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button onClick={handleMesAnterior} className="btn btn-secondary" style={{ padding: '6px 10px' }}>
            <ChevronLeft size={16} />
          </button>
          <button onClick={handleMesSiguiente} className="btn btn-secondary" style={{ padding: '6px 10px' }}>
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Días de la semana */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', textAlign: 'center', fontWeight: 600, fontSize: '0.8rem', color: '#94a3b8', marginBottom: '8px' }}>
        {DIAS_SEMANA.map((d, i) => (
          <div key={i} style={{ padding: '4px 0' }}>{d}</div>
        ))}
      </div>

      {/* Celdas del Calendario */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
        {celdas.map((celda, idx) => {
          if (!celda.dia) {
            return <div key={idx} style={{ minHeight: '65px', background: 'transparent' }} />;
          }

          const esSeleccionado = celda.fechaStr === diaSeleccionado;
          const tieneEventos = celda.eventosDia.length > 0;

          return (
            <div
              key={idx}
              onClick={() => onSeleccionarDia(celda.fechaStr)}
              style={{
                minHeight: '65px',
                padding: '6px',
                borderRadius: '6px',
                background: esSeleccionado ? 'rgba(56, 189, 248, 0.15)' : 'rgba(255,255,255,0.02)',
                border: `1px solid ${esSeleccionado ? '#38bdf8' : 'rgba(255,255,255,0.06)'}`,
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'all 0.15s ease'
              }}
            >
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: esSeleccionado ? '#38bdf8' : '#f8fafc' }}>
                {celda.dia}
              </span>

              {tieneEventos && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '4px' }}>
                  {celda.eventosDia.slice(0, 2).map((ev: any, evIdx: number) => (
                    <div
                      key={evIdx}
                      style={{
                        fontSize: '0.68rem',
                        padding: '1px 4px',
                        borderRadius: '3px',
                        background: ev.color || '#38bdf8',
                        color: '#0f172a',
                        fontWeight: 700,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                      title={ev.concepto}
                    >
                      {ev.concepto}
                    </div>
                  ))}
                  {celda.eventosDia.length > 2 && (
                    <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>
                      +{celda.eventosDia.length - 2} más
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
