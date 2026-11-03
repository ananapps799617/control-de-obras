// ============================================================
// BLOQUE 1: IMPORTACIONES Y DEPENDENCIAS
// Qué hace: Importa React, iconos y tipos para el banner de bienvenida del Dashboard.
// Por qué: Regla 2.2 Manual Maestro: Componentes modulares atómicos.
// ============================================================
import React from 'react';
import { Sparkles, PlusCircle, FileText } from 'lucide-react';
import type { IUsuarioSesion } from '../../../types/auth';

interface DashboardBannerProps {
  usuario?: IUsuarioSesion | null;
  onNavegarTab: (tab: string) => void;
}

// ============================================================
// BLOQUE 2: COMPONENTE BANNER DE BIENVENIDA
// Qué hace: Presenta el saludo ejecutivo, fecha actual y accesos a nuevo proyecto y cotizaciones.
// ============================================================
export default function DashboardBanner({ usuario, onNavegarTab }: DashboardBannerProps) {
  const fechaHoyStr = new Date().toLocaleDateString('es-CO', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div style={{
      background: 'linear-gradient(135deg, #053f5c 0%, #022c43 100%)',
      borderRadius: 'var(--radius-lg, 12px)',
      padding: '24px 28px',
      border: '1px solid rgba(56, 189, 248, 0.2)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: '16px',
      boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)'
    }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <Sparkles size={20} color="#38bdf8" />
          <span style={{ color: '#38bdf8', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Centro de Control • Control de Obras
          </span>
        </div>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 800, margin: '0 0 6px 0', color: '#ffffff' }}>
          ¡Bienvenido, {usuario?.email?.split('@')[0] || 'Administrador'}! 👋
        </h2>
        <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: 0, textTransform: 'capitalize' }}>
          🗓️ {fechaHoyStr}
        </p>
      </div>

      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <button 
          onClick={() => onNavegarTab('proyectos')}
          className="btn btn-primary"
          style={{ padding: '10px 18px', gap: '8px', fontSize: '0.9rem', fontWeight: 600, display: 'flex', alignItems: 'center' }}
        >
          <PlusCircle size={18} /> Nuevo Proyecto
        </button>
        <button 
          onClick={() => onNavegarTab('cotizaciones-oficiales')}
          className="btn btn-secondary"
          style={{ padding: '10px 18px', gap: '8px', fontSize: '0.9rem', background: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center' }}
        >
          <FileText size={18} /> Cotizaciones
        </button>
      </div>
    </div>
  );
}
