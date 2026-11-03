// ============================================================
// BLOQUE 1: IMPORTACIONES Y DEPENDENCIAS
// Qué hace: Banner de seguridad visual e indicador del entorno activo (Testing vs Producción).
// Por qué: Regla DataGuard AnAnApps: Protección y aislamiento absoluto de datos reales.
// ============================================================
import React, { useState, useEffect } from 'react';
import { ShieldCheck, FlaskConical, ArrowRightLeft, ShieldAlert } from 'lucide-react';
import { getModoEntorno, setModoEntorno } from '../lib/firebase.js';

export default function BannerSeguridadEntorno() {
  const [modo, setModo] = useState<'test' | 'produccion'>('test');

  useEffect(() => {
    setModo(getModoEntorno() as 'test' | 'produccion');
  }, []);

  const handleToggle = () => {
    const nuevoModo = modo === 'test' ? 'produccion' : 'test';
    const confirmMsg = nuevoModo === 'produccion'
      ? '⚠️ ATENCIÓN: Vas a cambiar a MODO PRODUCCIÓN REAL.\nTodos los datos que crees, edites o elimines afectarán los registros reales de la empresa.\n\n¿Deseas continuar?'
      : '🧪 Vas a cambiar a MODO TESTING.\nLos datos reales quedarán blindados y operarás sobre colecciones aisladas (test_*).\n\n¿Deseas cambiar?';

    if (window.confirm(confirmMsg)) {
      setModoEntorno(nuevoModo);
    }
  };

  const esTest = modo === 'test';

  return (
    <div style={{
      background: esTest ? 'linear-gradient(90deg, #7c2d12 0%, #c2410c 100%)' : 'linear-gradient(90deg, #064e3b 0%, #047857 100%)',
      color: '#ffffff',
      padding: '6px 16px',
      fontSize: '0.82rem',
      fontWeight: 600,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderBottom: `2px solid ${esTest ? '#fb923c' : '#34d399'}`,
      zIndex: 9999,
      position: 'sticky',
      top: 0
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {esTest ? (
          <>
            <FlaskConical size={16} color="#fed7aa" />
            <span>
              <strong>🧪 ENTORNO DE PRUEBAS ACTIVO:</strong> Colecciones aisladas (<code>test_*</code>). Tus datos reales de producción están 100% protegidos.
            </span>
          </>
        ) : (
          <>
            <ShieldCheck size={16} color="#a7f3d0" />
            <span>
              <strong>🟢 MODO PRODUCCIÓN REAL:</strong> Conectado a la base de datos oficial de la empresa.
            </span>
          </>
        )}
      </div>

      <button
        onClick={handleToggle}
        style={{
          background: 'rgba(255, 255, 255, 0.2)',
          border: '1px solid rgba(255, 255, 255, 0.4)',
          color: '#ffffff',
          padding: '3px 10px',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '0.75rem',
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          transition: 'all 0.2s'
        }}
        title="Alternar entre Entorno de Pruebas y Producción Real"
      >
        <ArrowRightLeft size={12} />
        {esTest ? 'Cambiar a Producción' : 'Cambiar a Testing'}
      </button>
    </div>
  );
}
