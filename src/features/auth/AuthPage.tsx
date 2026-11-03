// ============================================================
// BLOQUE 1: IMPORTACIONES Y DEPENDENCIAS
// Qué hace: Importa React, iconos de Lucide y servicios de autenticación tipados.
// Por qué: Reglas de Arquitectura Feature-Driven (Manual Maestro 2.3).
// ============================================================
import React, { useState } from 'react';
import { LogIn, UserPlus, KeyRound, Eye, EyeOff, ShieldCheck, ArrowLeft, CheckCircle2 } from 'lucide-react';
import LogoCastor from '../../components/LogoCastor';
import { loginUsuario, registrarUsuario, recuperarPassword } from '../../services/authService';
import { isFirebaseConfigured } from '../../lib/firebase.js';

interface AuthPageProps {
  onLoginExitoso?: () => void;
}

type ModoAuth = 'login' | 'recuperar';

// ============================================================
// BLOQUE 2: COMPONENTE DE AUTENTICACIÓN CORPORATIVA
// Qué hace: Gestiona Login y Recuperación de Contraseña con Firebase Auth.
// Por qué: Acceso exclusivo para testing cerrado y equipo autorizado.
// ============================================================
export default function AuthPage({ onLoginExitoso }: AuthPageProps) {
  const [modo, setModo] = useState<ModoAuth>('login');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [mostrarPassword, setMostrarPassword] = useState<boolean>(false);
  const [cargando, setCargando] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [exitoMsg, setExitoMsg] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg('');
    setExitoMsg('');

    if (!isFirebaseConfigured) {
      setErrorMsg('⚠️ PENDIENTE: Faltan tus credenciales de Firebase en .env.local para procesar la autenticación real.');
      return;
    }

    setCargando(true);
    try {
      if (modo === 'login') {
        await loginUsuario(email, password);
        if (onLoginExitoso) onLoginExitoso();
      } else if (modo === 'recuperar') {
        await recuperarPassword(email);
        setExitoMsg(`¡Correo de recuperación enviado exitosamente a ${email}! Revisa tu bandeja de entrada o spam.`);
      }
    } catch (err: unknown) {
      const error = err as Error;
      let msg = error.message || 'Ocurrió un error al procesar la solicitud.';
      if (msg.includes('auth/invalid-credential') || msg.includes('auth/wrong-password')) {
        msg = 'Contraseña o correo incorrectos. Puedes usar "¿Olvidaste tu contraseña?" para restablecerla.';
      } else if (msg.includes('auth/user-not-found')) {
        msg = 'No existe una cuenta con este correo.';
      }
      setErrorMsg(msg);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      background: 'radial-gradient(circle at top, #1e293b 0%, #0f172a 100%)'
    }}>
      <div className="card" style={{ width: '100%', maxWidth: '440px', padding: '32px' }}>
        {/* Encabezado Visual con Logo del Castor Constructor */}
        <div style={{ textAlign: 'center', marginBottom: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <LogoCastor size={68} variant="full" />
          <h2 style={{ color: 'var(--text-primary, #f8fafc)', fontSize: '1.25rem', marginTop: '12px', marginBottom: '4px', fontWeight: 600 }}>
            {modo === 'login' ? 'Iniciar Sesión' : 'Recuperar Contraseña'}
          </h2>
          <p style={{ color: 'var(--text-secondary, #94a3b8)', fontSize: '0.85rem' }}>
            {modo === 'login'
              ? 'Ingresa con tu cuenta corporativa autorizada (Testing Cerrado)'
              : 'Ingresa tu correo para recibir el enlace de restablecimiento'}
          </p>
        </div>

        {/* Mensaje de Error */}
        {errorMsg && (
          <div style={{
            background: 'rgba(239,68,68,0.15)',
            border: '1px solid rgba(239,68,68,0.3)',
            color: '#fca5a5',
            padding: '12px',
            borderRadius: '8px',
            fontSize: '0.85rem',
            marginBottom: '16px',
            textAlign: 'center'
          }}>
            {errorMsg}
          </div>
        )}

        {/* Mensaje de Éxito */}
        {exitoMsg && (
          <div style={{
            background: 'rgba(16,185,129,0.15)',
            border: '1px solid rgba(16,185,129,0.3)',
            color: '#6ee7b7',
            padding: '12px',
            borderRadius: '8px',
            fontSize: '0.85rem',
            marginBottom: '16px',
            textAlign: 'center',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            justifyContent: 'center'
          }}>
            <CheckCircle2 size={16} />
            <span>{exitoMsg}</span>
          </div>
        )}

        {/* Formulario Dinámico */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '6px' }}>
              Correo Electrónico
            </label>
            <input
              type="email"
              required
              className="input"
              placeholder="ejemplo@control-obras.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>

          {modo === 'login' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                  Contraseña
                </label>
                <button
                  type="button"
                  onClick={() => { setModo('recuperar'); setErrorMsg(''); setExitoMsg(''); }}
                  style={{ background: 'none', border: 'none', color: '#38bdf8', fontSize: '0.78rem', cursor: 'pointer', padding: 0 }}
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input
                  type={mostrarPassword ? 'text' : 'password'}
                  required
                  className="input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ width: '100%', paddingRight: '42px' }}
                />
                <button
                  type="button"
                  onClick={() => setMostrarPassword(!mostrarPassword)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    background: 'none',
                    border: 'none',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    padding: '4px',
                    display: 'flex'
                  }}
                  title={mostrarPassword ? "Ocultar contraseña" : "Ver contraseña"}
                >
                  {mostrarPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={cargando}
            className="btn btn-primary"
            style={{
              marginTop: '8px',
              padding: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              fontWeight: 600
            }}
          >
            {cargando ? (
              <span>Procesando...</span>
            ) : (
              <>
                {modo === 'login' ? (
                  <>
                    <LogIn size={18} />
                    <span>Ingresar al Sistema</span>
                  </>
                ) : (
                  <>
                    <KeyRound size={18} />
                    <span>Enviar Enlace de Recuperación</span>
                  </>
                )}
              </>
            )}
          </button>
        </form>

        {/* Volver a Login desde Recuperar */}
        {modo === 'recuperar' && (
          <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.85rem' }}>
            <button
              type="button"
              onClick={() => { setModo('login'); setErrorMsg(''); setExitoMsg(''); }}
              style={{
                background: 'none',
                border: 'none',
                color: '#38bdf8',
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <ArrowLeft size={16} />
              <span>Volver a Iniciar Sesión</span>
            </button>
          </div>
        )}

        {/* Footer Institucional */}
        <div style={{
          marginTop: '24px',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          paddingTop: '16px',
          textAlign: 'center',
          fontSize: '0.78rem',
          color: '#64748b',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px'
        }}>
          <ShieldCheck size={14} color="#38bdf8" />
          <span>Acceso Protegido por Firebase Auth & AnAnApps v2.0</span>
        </div>
      </div>
    </div>
  );
}
