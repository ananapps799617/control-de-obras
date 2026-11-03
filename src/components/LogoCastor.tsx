// ============================================================
// BLOQUE 1: COMPONENTE ATÓMICO VECTORIAL — EL CASTOR CONSTRUCTOR 🦫
// Qué hace: Renderiza el isotipo e imagotipo oficial de Control de Obras en SVG puro.
// Por qué: Manual Maestro de Creación 360° (Capítulo 1: Mascota e Identidad Visual).
// ============================================================
import React from 'react';

export interface LogoCastorProps {
  size?: number | string;
  variant?: 'full' | 'icon' | 'compact';
  className?: string;
}

export const LogoCastor: React.FC<LogoCastorProps> = ({
  size = 40,
  variant = 'full',
  className = ''
}) => {
  return (
    <div 
      className={`logo-castor-container ${className}`} 
      style={{ display: 'inline-flex', alignItems: 'center', gap: '10px' }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1024 1024"
        width={size}
        height={size}
        style={{ flexShrink: 0, borderRadius: '12px' }}
        role="img"
        aria-label="Logo Control de Obras — Castor Constructor"
      >
        <defs>
          <linearGradient id="lcBgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#053F5C" />
            <stop offset="100%" stopColor="#0F172A" />
          </linearGradient>
          <linearGradient id="lcHelmetGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FCD34D" />
            <stop offset="30%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#D97706" />
          </linearGradient>
          <linearGradient id="lcVisorCyan" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#0284C7" stopOpacity="0.8" />
          </linearGradient>
        </defs>

        {/* Base redondeada Azul Petróleo */}
        <rect x="32" y="32" width="960" height="960" rx="200" fill="url(#lcBgGrad)" stroke="#38BDF8" strokeWidth="12" strokeOpacity="0.8" />

        {/* Guías Blueprint Arquitectura */}
        <g stroke="#38BDF8" strokeWidth="2" strokeOpacity="0.18">
          <line x1="120" y1="200" x2="904" y2="200" />
          <line x1="120" y1="560" x2="904" y2="560" />
          <line x1="200" y1="120" x2="200" y2="904" />
          <line x1="560" y1="120" x2="560" y2="904" />
        </g>

        {/* Orejas del Castor */}
        <ellipse cx="382" cy="350" rx="46" ry="44" fill="#B45309" stroke="#F59E0B" strokeWidth="8" />
        <ellipse cx="382" cy="350" rx="24" ry="24" fill="#FED7AA" />
        <ellipse cx="642" cy="350" rx="46" ry="44" fill="#B45309" stroke="#F59E0B" strokeWidth="8" />
        <ellipse cx="642" cy="350" rx="24" ry="24" fill="#FED7AA" />

        {/* Cabeza y Mejillas */}
        <ellipse cx="512" cy="515" rx="180" ry="165" fill="#B45309" stroke="#78350F" strokeWidth="8" />
        <circle cx="405" cy="550" r="92" fill="#D97706" />
        <circle cx="619" cy="550" r="92" fill="#D97706" />

        {/* Casco Constructor Moderno */}
        <path d="M 320 395 C 320 205, 704 205, 704 395 Z" fill="url(#lcHelmetGrad)" stroke="#B45309" strokeWidth="8" />
        <path d="M 488 205 L 536 205 L 546 380 L 476 380 Z" fill="#FDE68A" />
        <rect x="290" y="380" width="444" height="44" rx="22" fill="#D97706" stroke="#FCD34D" strokeWidth="6" />
        <rect x="480" y="290" width="64" height="58" rx="10" fill="#38BDF8" stroke="#FFFFFF" strokeWidth="4" />
        <polygon points="512,302 490,338 534,338" fill="#0F172A" />

        {/* Visor Tech / Gafas de Seguridad */}
        <rect x="365" y="435" rx="20" width="294" height="85" fill="url(#lcVisorCyan)" stroke="#38BDF8" strokeWidth="5" />

        {/* Ojos */}
        <ellipse cx="435" cy="475" rx="24" ry="26" fill="#FFFFFF" />
        <circle cx="440" cy="475" r="14" fill="#0F172A" />
        <circle cx="445" cy="470" r="5" fill="#38BDF8" />
        <ellipse cx="589" cy="475" rx="24" ry="26" fill="#FFFFFF" />
        <circle cx="584" cy="475" r="14" fill="#0F172A" />
        <circle cx="579" cy="470" r="5" fill="#38BDF8" />

        {/* Hocico y Dientes Fuertes de Castor */}
        <ellipse cx="512" cy="580" rx="118" ry="80" fill="#FED7AA" stroke="#B45309" strokeWidth="6" />
        <polygon points="478,525 546,525 512,568" fill="#1E293B" />
        <rect x="486" y="620" width="24" height="48" rx="5" fill="#FFFFFF" stroke="#1E293B" strokeWidth="4" />
        <rect x="514" y="620" width="24" height="48" rx="5" fill="#FFFFFF" stroke="#1E293B" strokeWidth="4" />

        {/* Cubo 3D Isométrico Modular de Madera Tech */}
        <g stroke="#F8FAFC" strokeWidth="5" strokeLinejoin="round">
          <polygon points="512,680 610,728 512,776 414,728" fill="#38BDF8" />
          <polygon points="414,728 512,776 512,875 414,827" fill="#B45309" />
          <polygon points="610,728 512,776 512,875 610,827" fill="#78350F" />
        </g>
      </svg>

      {/* Tipografía de Marca cuando variant="full" */}
      {variant === 'full' && (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ 
            fontFamily: 'var(--font-sans)', 
            fontWeight: 800, 
            fontSize: '1.05rem', 
            color: 'var(--text-main)', 
            letterSpacing: '-0.02em',
            lineHeight: 1.15
          }}>
            Control de Obras
          </span>
          <span style={{ 
            fontFamily: 'var(--font-sans)', 
            fontWeight: 600, 
            fontSize: '0.68rem', 
            color: 'var(--color-primary)', 
            letterSpacing: '0.08em',
            textTransform: 'uppercase'
          }}>
            AnAnApps v2.0
          </span>
        </div>
      )}

      {variant === 'compact' && (
        <span style={{ 
          fontFamily: 'var(--font-sans)', 
          fontWeight: 700, 
          fontSize: '0.95rem', 
          color: 'var(--text-main)' 
        }}>
          Control de Obras
        </span>
      )}
    </div>
  );
};

export default LogoCastor;
