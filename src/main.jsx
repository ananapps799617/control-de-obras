import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

// ============================================================
// BLOQUE 1: COMPONENTE ERROR BOUNDARY PARA CELULARES Y NAVEGADORES
// Qué hace: Captura cualquier error de renderizado o cache en dispositivos móviles
//          y ofrece un botón de 1 clic para recargar la versión fresca.
// Por qué: Previene pantallas en blanco en Safari iOS y Chrome Android.
// ============================================================
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error global en la aplicación:", error, errorInfo);
  }

  handleLimpiarCacheYRecargar = () => {
    if ('caches' in window) {
      caches.keys().then((names) => {
        names.forEach((name) => caches.delete(name));
      });
    }
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations.forEach((reg) => reg.unregister());
      });
    }
    window.location.reload(true);
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          padding: '24px',
          background: '#051923',
          color: '#ffffff',
          textAlign: 'center',
          fontFamily: 'system-ui, sans-serif'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🏗️</div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '8px', color: '#fbbf24' }}>
            Control de Obras Web
          </h2>
          <p style={{ fontSize: '0.9rem', color: '#94a3b8', maxWidth: '360px', marginBottom: '20px' }}>
            Se detectó una versión actualizada o cache pendiente en tu dispositivo móvil.
          </p>
          <button
            onClick={this.handleLimpiarCacheYRecargar}
            style={{
              background: '#00A86B',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              padding: '12px 24px',
              fontSize: '0.95rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0, 168, 107, 0.4)'
            }}
          >
            🔄 Cargar Versión Actualizada
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
