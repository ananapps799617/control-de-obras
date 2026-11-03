import React from 'react';
import { AlertTriangle, CheckCircle, Database } from 'lucide-react';
import { isFirebaseConfigured } from '../lib/firebase.js';

// ============================================================
// BLOQUE: BANNER DE VERIFICACIÓN CONSOLA FIREBASE
// Qué hace: Muestra en la UI si la app está conectada en vivo a Firebase.
// Por qué: Transparencia total según Reglas RT-01 y RT-05.
// ============================================================
export default function BannerAlertaFirebase() {
  if (isFirebaseConfigured) {
    return (
      <div style={{
        background: 'rgba(16, 185, 129, 0.1)',
        border: '1px solid rgba(16, 185, 129, 0.3)',
        borderRadius: 'var(--radius-md)',
        padding: '12px 16px',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <CheckCircle color="#34d399" size={20} />
          <div>
            <strong style={{ color: '#34d399', fontSize: '0.9rem' }}>Conexión Real con Firebase Activada</strong>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: 0 }}>
              Los registros guardados aparecerán al instante en tu Firebase Console.
            </p>
          </div>
        </div>
        <a 
          href="https://console.firebase.google.com" 
          target="_blank" 
          rel="noreferrer"
          className="btn btn-secondary"
          style={{ minHeight: '36px', padding: '0 12px', fontSize: '0.8rem' }}
        >
          <Database size={14} /> Abrir Consola
        </a>
      </div>
    );
  }

  return (
    <div style={{
      background: 'rgba(245, 158, 11, 0.12)',
      border: '1px solid rgba(245, 158, 11, 0.4)',
      borderRadius: 'var(--radius-md)',
      padding: '14px 18px',
      marginBottom: '24px',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <AlertTriangle color="#fbbf24" size={22} />
        <strong style={{ color: '#fbbf24', fontSize: '0.95rem' }}>
          ⚠️ PENDIENTE: Faltan tus credenciales de Firebase en .env.local
        </strong>
      </div>
      <p style={{ color: 'var(--text-main)', fontSize: '0.88rem', lineHeight: '1.4' }}>
        Para que los clientes, proyectos, materiales y proveedores se sincronicen directamente con tu propia base de datos en tiempo real, agrega tus claves de Firebase en el archivo <code>.env.local</code>.
      </p>
      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
        Consulta la guía detallada paso a paso en: <code>Documentos_Importantes/01_CONFIGURACION_FIREBASE.md</code>
      </div>
    </div>
  );
}
