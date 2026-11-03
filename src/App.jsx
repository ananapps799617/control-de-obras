import React, { useState, useEffect, lazy, Suspense } from 'react';
import Navigation from './components/Navigation.jsx';
import BannerNotificacionesAgenda from './components/BannerNotificacionesAgenda.jsx';
import BannerSeguridadEntorno from './components/BannerSeguridadEntorno.tsx';
import { suscribirEstadoAuth, logoutUsuario } from './services/authService.ts';
import { isFirebaseConfigured } from './lib/firebase.js';

// ============================================================
// BLOQUE 0: CARGA DIFERIDA DE PÁGINAS (LAZY LOADING)
// Qué hace: Importa dinámicamente cada vista solo cuando se activa la pestaña.
// Por qué: Reduce el tamaño de descarga inicial en móviles y mejora el rendimiento.
// ============================================================
const DashboardPage = lazy(() => import('./features/dashboard/DashboardPage.tsx'));
const ClientesPage = lazy(() => import('./features/entidades/clientes/ClientesPage.tsx'));
const EmpleadosPage = lazy(() => import('./features/entidades/empleados/EmpleadosPage.tsx'));
const PerfilPage = lazy(() => import('./features/auth/PerfilPage.tsx'));
const MaterialesPage = lazy(() => import('./features/inventario/materiales/MaterialesPage.tsx'));
const ProveedoresPage = lazy(() => import('./features/entidades/proveedores/ProveedoresPage.tsx'));
const ProyectosPage = lazy(() => import('./features/proyectos/ProyectosPage.tsx'));
const CalculadoraMedidasPage = lazy(() => import('./features/taller/calculadora-medidas/CalculadoraMedidasPage.tsx'));
const CreadorItemsPage = lazy(() => import('./features/taller/creador-items/CreadorItemsPage.tsx'));
const CalculadoraGastosObraPage = lazy(() => import('./features/taller/calculadora-gastos/CalculadoraGastosObraPage.tsx'));
const HerramientasPage = lazy(() => import('./features/inventario/herramientas/HerramientasPage.tsx'));
const ListaCortePage = lazy(() => import('./features/taller/corte/ListaCortePage.tsx'));
const AgendaPage = lazy(() => import('./features/agenda/AgendaPage.tsx'));
const FinanzasPage = lazy(() => import('./features/finanzas/FinanzasPage.tsx'));
const ComprasGlobalesPage = lazy(() => import('./features/finanzas/compras/ComprasGlobalesPage.tsx'));
const BalancePage = lazy(() => import('./features/finanzas/BalancePage.tsx'));
const CotizacionesPage = lazy(() => import('./features/cotizaciones/CotizacionesPage.tsx'));
const ContratosPage = lazy(() => import('./features/contratos/ContratosPage.tsx'));
const Disenador3DPage = lazy(() => import('./features/carpinteria/Disenador3DPage.tsx'));
const HerrajesCarpinteriaPage = lazy(() => import('./features/carpinteria/pages/HerrajesCarpinteriaPage.tsx'));
const AuthPage = lazy(() => import('./features/auth/AuthPage.tsx'));

// Componente fallback mientras se descarga el chunk de la sección
function FallbackSeccion() {
  return (
    <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--color-primary-light)', fontWeight: 500 }}>
      Cargando sección...
    </div>
  );
}

// Controlador de Errores Institucional para evitar pantallas azules vacías
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary atrapó un error de renderizado:", error, errorInfo);
  }
  handleRecargarConLimpiezaCache = () => {
    this.setState({ hasError: false });
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
          padding: '40px 20px',
          textAlign: 'center',
          background: 'rgba(15,23,42,0.9)',
          borderRadius: '12px',
          border: '1px solid rgba(56,189,248,0.3)',
          margin: '20px',
          color: '#ffffff'
        }}>
          <h3 style={{ color: '#38bdf8', marginBottom: '8px' }}>🌐 Actualizando Vista de la Aplicación</h3>
          <p style={{ color: '#94a3b8', fontSize: '0.88rem', marginBottom: '16px' }}>
            Se detectó una actualización de versión en el servidor.
          </p>
          <button 
            onClick={this.handleRecargarConLimpiezaCache} 
            className="btn btn-primary"
            style={{ fontSize: '0.88rem' }}
          >
            🔄 Recargar Sección
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// ============================================================
// BLOQUE 1: COMPONENTE PRINCIPAL APP (Sidebar Layout)
// Qué hace: Orquesta la sesión, navegación lateral y vistas por secciones.
// Por qué: Ensamblado principal de la aplicación con soporte Lazy Loading.
// ============================================================
export default function App() {
  const [usuario, setUsuario] = useState(null);
  const [cargandoAuth, setCargandoAuth] = useState(true);
  const [tabActiva, setTabActiva] = useState('dashboard');

  useEffect(() => {
    const desuscribir = suscribirEstadoAuth((usr) => {
      setUsuario(usr);
      setCargandoAuth(false);
    });
    return () => desuscribir();
  }, []);

  const handleLogout = async () => {
    await logoutUsuario();
  };

  if (cargandoAuth) {
    return (
      <div style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center', background: 'var(--bg-dark)' }}>
        <div style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Cargando Control de Obras...</div>
      </div>
    );
  }

  if (!usuario && isFirebaseConfigured) {
    return (
      <Suspense fallback={<FallbackSeccion />}>
        <AuthPage />
      </Suspense>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-dark)' }}>
      {/* BANNER FIJO DE SEGURIDAD Y AISLAMIENTO DE DATOS */}
      <BannerSeguridadEntorno />

      <div className="app-container" style={{ display: 'flex', flex: 1, width: '100%' }}>
        <Navigation 
          tabActiva={tabActiva} 
          setTabActiva={setTabActiva} 
          usuario={usuario}
          onLogout={handleLogout}
        />

      <div className="main-content-layout" style={{ flex: 1, width: '100%' }}>
        {/* BARRA SUPERIOR DE ALERTAS Y NOTIFICACIONES */}
        <header style={{
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          padding: '12px 24px 0 24px'
        }}>
          <BannerNotificacionesAgenda onNavegarTab={setTabActiva} />
        </header>

        <main className="content-wrapper" style={{ padding: '16px 24px 24px 24px' }}>
          <ErrorBoundary>
            <Suspense fallback={<FallbackSeccion />}>
              {tabActiva === 'dashboard' && <DashboardPage usuario={usuario} onNavegarTab={setTabActiva} />}
              {tabActiva === 'proyectos' && <ProyectosPage onNavegarTab={setTabActiva} />}
              {tabActiva === 'clientes' && <ClientesPage />}
              {tabActiva === 'empleados' && <EmpleadosPage />}
              {tabActiva === 'perfil' && <PerfilPage usuario={usuario} />}
              {tabActiva === 'materiales' && <MaterialesPage />}
              {tabActiva === 'proveedores' && <ProveedoresPage />}
              {tabActiva === 'calculadora' && <CalculadoraMedidasPage />}
              {tabActiva === 'creador-items' && <CreadorItemsPage />}
              {tabActiva === 'gastos-obra' && <CalculadoraGastosObraPage />}
              {tabActiva === 'herramientas' && <HerramientasPage />}
              {tabActiva === 'lista-corte' && <ListaCortePage />}
              {tabActiva === 'agenda' && <AgendaPage />}
              {tabActiva === 'balance' && <BalancePage />}
              {tabActiva === 'finanzas' && <FinanzasPage />}
              {tabActiva === 'compras-globales' && <ComprasGlobalesPage />}
              {tabActiva === 'cotizaciones-oficiales' && <CotizacionesPage />}
              {tabActiva === 'contratos-oficiales' && <ContratosPage />}
              {tabActiva === 'disenador-3d' && <Disenador3DPage />}
              {tabActiva === 'herrajes-carpinteria' && <HerrajesCarpinteriaPage />}
            </Suspense>
          </ErrorBoundary>
        </main>
      </div>

      <style>{`
        @media (min-width: 768px) {
          .main-content-layout {
            margin-left: 260px;
          }
        }
      `}</style>
      </div>
    </div>
  );
}
