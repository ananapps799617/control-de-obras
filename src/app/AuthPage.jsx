import React, { useState } from 'react';
import { HardHat, LogIn, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { loginUsuario } from '../services/authService';
import { isFirebaseConfigured } from '../lib/firebase.js';

// ============================================================
// BLOQUE: PANTALLA DE AUTENTICACIÓN FIREBASE
// Qué hace: Permite Iniciar Sesión de forma segura con visibilidad de contraseña.
// Por qué: Regla de seguridad solicitada por el Fundador (Acceso Restringido sin registro público).
// ============================================================
export default function AuthPage({ onLoginExitoso }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!isFirebaseConfigured) {
      setErrorMsg('⚠️ PENDIENTE: Faltan tus credenciales de Firebase en .env.local para procesar la autenticación real.');
      return;
    }

    setCargando(true);
    try {
      await loginUsuario(email, password);
      if (onLoginExitoso) onLoginExitoso();
    } catch (err) {
      setErrorMsg(err.message || 'Error de inicio de sesión. Verifica tus credenciales.');
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
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            background: 'linear-gradient(135deg, #0284c7, #38bdf8)',
            width: '54px',
            height: '54px',
            borderRadius: 'var(--radius-lg)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '12px'
          }}>
            <HardHat size={30} color="#0f172a" />
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700 }}>Control de Obras</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
            Ingresa con tu cuenta corporativa autorizada
          </p>
        </div>

        {errorMsg && (
          <div style={{
            background: 'rgba(239,68,68,0.15)',
            border: '1px solid rgba(239,68,68,0.3)',
            color: '#fca5a5',
            padding: '12px',
            borderRadius: 'var(--radius-md)',
            marginBottom: '16px',
            fontSize: '0.85rem'
          }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label className="input-label">Correo Electrónico</label>
            <input 
              type="email" 
              className="input-field" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu.correo@obra.com"
            />
          </div>

          <div className="input-group">
            <label className="input-label">Contraseña</label>
            <div style={{ position: 'relative' }}>
              <input 
                type={mostrarPassword ? 'text' : 'password'} 
                className="input-field" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{ paddingRight: '40px' }}
              />
              <button
                type="button"
                onClick={() => setMostrarPassword(!mostrarPassword)}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '4px'
                }}
                title={mostrarPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {mostrarPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', marginTop: '16px', minHeight: '46px', gap: '8px' }}
            disabled={cargando}
          >
            {cargando ? 'Procesando...' : (
              <><LogIn size={18} /> Iniciar Sesión</>
            )}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          <ShieldCheck size={14} style={{ verticalAlign: 'middle', marginRight: '4px', color: '#34d399' }} />
          Acceso restringido a personal autorizado por la empresa.
        </div>
      </div>
    </div>
  );
}
