// ============================================================
// BLOQUE 1: IMPORTACIONES Y DEPENDENCIAS
// Qué hace: Importa React e iconos para los atajos rápidos del Dashboard.
// Por qué: Regla 2.2 Manual Maestro: Componentes modulares atómicos.
// ============================================================
import React from 'react';
import { HardHat, Users, Calculator, Calendar } from 'lucide-react';

interface DashboardQuickActionsProps {
  onNavegarTab: (tab: string) => void;
}

// ============================================================
// BLOQUE 2: COMPONENTE DE ATAJOS RÁPIDOS
// Qué hace: Renderiza botones de acceso directo a Obras, Clientes, Calculadora y Agenda.
// ============================================================
export default function DashboardQuickActions({ onNavegarTab }: DashboardQuickActionsProps) {
  const atajos = [
    {
      titulo: 'Gestor de Obras',
      subtitulo: 'Ver todos los proyectos',
      icono: <HardHat size={20} color="#38bdf8" />,
      bgIcono: 'rgba(56,189,248,0.15)',
      tab: 'proyectos'
    },
    {
      titulo: 'Directorio Clientes',
      subtitulo: 'Crear o editar cliente',
      icono: <Users size={20} color="#34d399" />,
      bgIcono: 'rgba(52,211,153,0.15)',
      tab: 'clientes'
    },
    {
      titulo: 'Calculadora Medidas',
      subtitulo: 'Cálculo rápido de m² y m³',
      icono: <Calculator size={20} color="#fbbf24" />,
      bgIcono: 'rgba(245,158,11,0.15)',
      tab: 'calculadora'
    },
    {
      titulo: 'Agenda de Obra',
      subtitulo: 'Citas y Visitas Técnicas',
      icono: <Calendar size={20} color="#c084fc" />,
      bgIcono: 'rgba(192,132,252,0.15)',
      tab: 'agenda'
    }
  ];

  return (
    <div>
      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '14px', color: 'var(--text-main, #f8fafc)', display: 'flex', alignItems: 'center', gap: '8px' }}>
        ⚡ Atajos Rápidos
      </h3>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: '12px'
      }}>
        {atajos.map((item, idx) => (
          <button 
            key={idx}
            onClick={() => onNavegarTab(item.tab)}
            className="card"
            style={{
              padding: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              cursor: 'pointer',
              border: '1px solid var(--border-color, rgba(255,255,255,0.08))',
              background: 'rgba(255,255,255,0.02)',
              textAlign: 'left',
              transition: 'transform 0.2s, background 0.2s'
            }}
          >
            <div style={{ background: item.bgIcono, padding: '10px', borderRadius: '10px', display: 'flex' }}>
              {item.icono}
            </div>
            <div>
              <strong style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-main, #f8fafc)' }}>
                {item.titulo}
              </strong>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted, #94a3b8)' }}>
                {item.subtitulo}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
