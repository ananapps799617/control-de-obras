import React, { useState, useEffect } from 'react';
import { Bell, Calendar, Clock, MapPin, CheckCircle, X, ShieldAlert, Volume2, Download } from 'lucide-react';
import { obtenerProyectos } from '../services/proyectosService';
import { obtenerEventosProximosHoyManana } from '../services/agendaService';
import { getFechaHoraColombia } from '../lib/dateUtils.js';

// ============================================================
// BLOQUE: COMPONENTE BARRA / CAMPANA DE NOTIFICACIONES, RELOJ COLOMBIA Y PWA
// Qué hace: Muestra Reloj y Fecha oficial de Colombia en vivo (1s), indicador de citas, notificaciones nativas e instalación PWA.
// Por qué: Requerimiento del Fundador para consultar fecha y hora exacta en Colombia a cualquier hora del día/noche.
// ============================================================
export default function BannerNotificacionesAgenda({ onNavegarTab }) {
  const [notifData, setNotifData] = useState({ hoy: [], manana: [], total: 0 });
  const [desplegado, setDesplegado] = useState(false);
  const [permisoNotificacion, setPermisoNotificacion] = useState(typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'default');

  // Estado Reloj & Fecha Colombia en Tiempo Real
  const [tiempoColombia, setTiempoColombia] = useState(getFechaHoraColombia());

  useEffect(() => {
    const clockInterval = setInterval(() => {
      setTiempoColombia(getFechaHoraColombia());
    }, 1000);
    return () => clearInterval(clockInterval);
  }, []);

  // Estado PWA Instalación
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [mostrarInstalarPWA, setMostrarInstalarPWA] = useState(false);

  useEffect(() => {
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setMostrarInstalarPWA(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstalarPWA = async () => {
    if (!deferredPrompt) {
      alert('📲 Para instalar en tu celular Android:\n1. Toca los 3 puntos de Chrome (arriba a la derecha).\n2. Elige "Agregar a la pantalla de inicio" o "Instalar aplicación".');
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setMostrarInstalarPWA(false);
      setDeferredPrompt(null);
    }
  };

  const cargarNotificaciones = async () => {
    try {
      const proyectos = await obtenerProyectos();
      const res = await obtenerEventosProximosHoyManana(proyectos);
      setNotifData(res);

      // Si hay notificaciones y el permiso está concedido, emitir notificación nativa de escritorio
      if (res.hoy.length > 0 && Notification.permission === 'granted') {
        res.hoy.forEach(ev => {
          const keyNotif = `notif_emito_${ev.id}_${ev.fecha}`;
          if (!sessionStorage.getItem(keyNotif)) {
            new Notification(`📅 Cita de Obra Hoy: ${ev.concepto}`, {
              body: `${ev.horaInicio ? `⏰ ${ev.horaInicio} ` : ''}${ev.proyectoNombre ? `• Obra: ${ev.proyectoNombre}` : ''}`,
              icon: '/favicon.ico'
            });
            sessionStorage.setItem(keyNotif, '1');
          }
        });
      }
    } catch (err) {
      console.error("Error al cargar notificaciones de agenda:", err);
    }
  };

  useEffect(() => {
    cargarNotificaciones();
    const interval = setInterval(cargarNotificaciones, 60000); // Polling cada 60s
    return () => clearInterval(interval);
  }, []);

  const solicitarPermisoNotificaciones = async () => {
    if (!('Notification' in window)) {
      alert('⚠️ Tu navegador no soporta Notificaciones de Escritorio nativas.');
      return;
    }
    const perm = await Notification.requestPermission();
    setPermisoNotificacion(perm);
    if (perm === 'granted') {
      alert('🔔 ¡Notificaciones de Escritorio activadas con éxito! Te avisaremos de tus citas e inicios de obra en tu pantalla.');
      cargarNotificaciones();
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', position: 'relative' }}>
      {/* Botón Destacado de Instalación PWA en Celular / PC */}
      <button
        onClick={handleInstalarPWA}
        style={{
          background: 'linear-gradient(135deg, #10b981, #34d399)',
          border: 'none',
          color: '#0f172a',
          padding: '6px 14px',
          borderRadius: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          cursor: 'pointer',
          fontSize: '0.82rem',
          fontWeight: 700,
          boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
        }}
        title="Instalar Control de Obras como App nativa en tu celular o PC"
      >
        <Download size={15} /> 📲 Instalar App
      </button>

      {/* Reloj y Fecha Oficial Colombia (UTC-5) en Tiempo Real */}
      <div 
        style={{
          background: 'rgba(15, 23, 42, 0.75)',
          border: '1px solid rgba(56, 189, 248, 0.3)',
          color: '#38bdf8',
          padding: '5px 12px',
          borderRadius: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '0.78rem',
          fontWeight: 600,
          boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
          backdropFilter: 'blur(8px)'
        }}
        title="Hora y Fecha Oficial de Colombia (UTC-5) en tiempo real"
      >
        <span style={{ fontSize: '0.85rem' }}>🇨🇴</span>
        <Clock size={14} color="#34d399" />
        <span>{tiempoColombia.fechaStr}</span>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>|</span>
        <span style={{ color: '#34d399', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{tiempoColombia.horaStr}</span>
      </div>

      {/* Botón de Campana Flotante / Encabezado */}
      <button 
        onClick={() => setDesplegado(!desplegado)}
        style={{
          background: notifData.total > 0 ? 'rgba(251, 146, 60, 0.15)' : 'rgba(255, 255, 255, 0.05)',
          border: `1px solid ${notifData.total > 0 ? '#fb923c' : 'rgba(255, 255, 255, 0.1)'}`,
          color: notifData.total > 0 ? '#fb923c' : 'var(--text-muted)',
          padding: '6px 12px',
          borderRadius: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          cursor: 'pointer',
          fontSize: '0.82rem',
          fontWeight: 600,
          transition: 'all 0.2s ease'
        }}
        title="Ver compromiso del día y notificaciones"
      >
        <Bell size={16} className={notifData.total > 0 ? 'pulse-icon' : ''} />
        <span>Agenda</span>
        {notifData.total > 0 && (
          <span style={{
            background: '#f43f5e',
            color: '#ffffff',
            borderRadius: '50%',
            padding: '2px 6px',
            fontSize: '0.72rem',
            fontWeight: 800
          }}>
            {notifData.total}
          </span>
        )}
      </button>

      {/* PANEL FLOTANTE DE DESGLOSE DE NOTIFICACIONES */}
      {desplegado && (
        <div style={{
          position: 'absolute',
          top: '42px',
          right: 0,
          width: '330px',
          background: '#0f172a',
          border: '1px solid rgba(56, 189, 248, 0.3)',
          borderRadius: '12px',
          padding: '16px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
          zIndex: 1000,
          color: 'var(--text-main)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '8px' }}>
            <h4 style={{ margin: 0, fontSize: '0.92rem', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Bell size={16} /> Notificaciones de Agenda
            </h4>
            <button onClick={() => setDesplegado(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
              <X size={16} />
            </button>
          </div>

          {/* Botón Activar Notificaciones de Escritorio */}
          {permisoNotificacion !== 'granted' && (
            <button 
              onClick={solicitarPermisoNotificaciones}
              style={{
                width: '100%',
                padding: '8px 10px',
                marginBottom: '12px',
                background: 'rgba(56, 189, 248, 0.15)',
                border: '1px solid #38bdf8',
                color: '#38bdf8',
                borderRadius: '6px',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <Volume2 size={14} /> 🔔 Activar Alertas en PC / Celular
            </button>
          )}

          {/* Contenido de Citas de HOY */}
          <div style={{ marginBottom: '14px' }}>
            <strong style={{ fontSize: '0.8rem', color: '#fb923c', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
              🔴 COMPROMISOS PARA HOY ({notifData.hoy.length})
            </strong>

            {notifData.hoy.length === 0 ? (
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0, fontStyle: 'italic' }}>
                No tienes citas pendientes para el día de hoy.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {notifData.hoy.map(ev => (
                  <div key={ev.id} style={{ background: 'rgba(255,255,255,0.04)', padding: '8px', borderRadius: '6px', borderLeft: `3px solid ${ev.color || '#fb923c'}` }}>
                    <strong style={{ fontSize: '0.82rem', display: 'block', color: '#ffffff' }}>{ev.concepto}</strong>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      ⏰ {ev.horaInicio || 'Todo el día'} • Obra: <strong>{ev.proyectoNombre}</strong>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Contenido de Citas de MAÑANA */}
          <div>
            <strong style={{ fontSize: '0.8rem', color: '#38bdf8', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
              🔵 COMPROMISOS PARA MAÑANA ({notifData.manana.length})
            </strong>

            {notifData.manana.length === 0 ? (
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0, fontStyle: 'italic' }}>
                No tienes citas programadas para mañana.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {notifData.manana.map(ev => (
                  <div key={ev.id} style={{ background: 'rgba(255,255,255,0.04)', padding: '8px', borderRadius: '6px', borderLeft: `3px solid ${ev.color || '#38bdf8'}` }}>
                    <strong style={{ fontSize: '0.82rem', display: 'block', color: '#ffffff' }}>{ev.concepto}</strong>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      ⏰ {ev.horaInicio || 'Todo el día'} • Obra: <strong>{ev.proyectoNombre}</strong>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Enlace para ir al Calendario Completo */}
          {onNavegarTab && (
            <button 
              onClick={() => { setDesplegado(false); onNavegarTab('agenda'); }}
              className="btn btn-secondary"
              style={{ width: '100%', marginTop: '14px', padding: '6px', fontSize: '0.8rem' }}
            >
              📅 Ir a la Agenda Completa
            </button>
          )}
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.15); }
          100% { transform: scale(1); }
        }
        .pulse-icon {
          animation: pulse 1.8s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
}
