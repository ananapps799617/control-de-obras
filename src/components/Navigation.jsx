import React, { useState } from 'react';
import { 
  LayoutDashboard,
  Users, 
  Package, 
  Truck, 
  HardHat, 
  LogOut, 
  ShieldCheck, 
  UserCheck,
  Database, 
  Wrench, 
  Calculator, 
  Box,
  Scissors,
  DollarSign,
  ShoppingCart,
  FileText,
  FileCheck,
  Calendar,
  ChevronDown, 
  ChevronRight,
  Menu,
  X,
  Scale,
  Hammer
} from 'lucide-react';
import LogoCastor from './LogoCastor';
import { obtenerPerfilUsuario, tieneAccesoCarpinteria } from '../services/authService';

// ============================================================
// BLOQUE: NAVEGACIÓN SIDEBAR LATERAL POR SECCIONES
// Qué hace: Organiza la app en Sección 1 (Bases de Datos), Sección 2 (Herramientas), Sección 3 (Finanzas) y Sección 4 (Documentación).
// Por qué: Requerimiento del Fundador de estructura por categorías de trabajo.
// ============================================================
export default function Navigation({ tabActiva, setTabActiva, usuario, onLogout }) {
  // Estado de Acordeón Exclusivo (1 = Bases de Datos, 2 = Herramientas, 3 = Finanzas, 4 = Documentación)
  const [seccionAbierta, setSeccionAbierta] = useState(1);
  const [sidebarMovilAbierto, setSidebarMovilAbierto] = useState(false);

  const seccion1Items = [
    { id: 'empleados', label: 'Empleados', icon: UserCheck },
    { id: 'materiales', label: 'Catálogo Materiales', icon: Package },
    { id: 'clientes', label: 'Clientes', icon: Users },
    { id: 'herramientas', label: 'Herramientas & Consumibles', icon: Wrench },
    { id: 'proveedores', label: 'Proveedores', icon: Truck },
    { id: 'proyectos', label: 'Proyectos & Obras', icon: HardHat },
  ];

  const seccion2Items = [
    { id: 'agenda', label: 'Agenda y Calendario', icon: Calendar },
    { id: 'calculadora', label: 'Calculadora de Medidas', icon: Calculator },
    { id: 'creador-items', label: 'Creador de Ítems', icon: Box },
    { id: 'lista-corte', label: 'Lista de Corte', icon: Scissors },
    { id: 'gastos-obra', label: 'Mano de Obra & Gastos Extras', icon: Truck },
  ];

  const seccion3Items = [
    { id: 'balance', label: 'Balance General & Flujo de Caja', icon: Scale },
    { id: 'compras-globales', label: 'Compras & Caja General', icon: ShoppingCart },
    { id: 'finanzas', label: 'Presupuesto y Finanzas de Proyectos', icon: DollarSign },
  ];

  const seccion4Items = [
    { id: 'contratos-oficiales', label: 'Contratos de Obra (RH-CT-003)', icon: FileCheck },
    { id: 'cotizaciones-oficiales', label: 'Cotizaciones Oficiales', icon: FileText },
  ];

  // SECCIÓN 5 EXCLUSIVA: TALLER DE CARPINTERÍA (Solo visible para rol/profesión Carpintero)
  const seccionCarpinteriaItems = [
    { id: 'disenador-3d', label: '🧊 Diseñador 3D Paramétrico', icon: Box, badge: '3D' },
    { id: 'herrajes-carpinteria', label: '🔩 Herrajes & Ferretería', icon: Wrench },
    { id: 'lista-corte', label: '✂️ Despiece y Lista de Corte', icon: Scissors },
    { id: 'creador-items', label: '📦 Creador de Muebles / BOM', icon: Box },
    { id: 'calculadora', label: '📐 Medidas de Mobiliario', icon: Calculator },
  ];

  // Estado del perfil del usuario para validar permisos RBAC
  const [perfilUsuario, setPerfilUsuario] = useState(null);

  React.useEffect(() => {
    if (usuario?.uid) {
      obtenerPerfilUsuario(usuario.uid).then(p => setPerfilUsuario(p));
    }
  }, [usuario]);

  const puedeVerCarpinteria = tieneAccesoCarpinteria(perfilUsuario || usuario);

  // Auto-Apertura de la sección activa al cambiar de pestaña
  React.useEffect(() => {
    if (seccion1Items.some(i => i.id === tabActiva)) setSeccionAbierta(1);
    else if (seccion2Items.some(i => i.id === tabActiva)) setSeccionAbierta(2);
    else if (seccion3Items.some(i => i.id === tabActiva)) setSeccionAbierta(3);
    else if (seccion4Items.some(i => i.id === tabActiva)) setSeccionAbierta(4);
    else if (seccionCarpinteriaItems.some(i => i.id === tabActiva)) setSeccionAbierta(5);
  }, [tabActiva]);

  const toggleSeccion = (numSeccion) => {
    setSeccionAbierta(prev => prev === numSeccion ? null : numSeccion);
  };

  const handleSeleccionarTab = (tabId) => {
    setTabActiva(tabId);
    setSidebarMovilAbierto(false);
  };

  return (
    <>
      {/* Botón Flotante Menú Móvil */}
      <div className="mobile-header-top">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button 
            onClick={() => setSidebarMovilAbierto(!sidebarMovilAbierto)} 
            className="btn btn-secondary"
            style={{ padding: '6px 10px', minHeight: '36px' }}
          >
            {sidebarMovilAbierto ? <X size={20} /> : <Menu size={20} />}
          </button>
          <LogoCastor size={28} variant="compact" />
        </div>
        {usuario && (
          <div style={{ display: 'flex', gap: '6px' }}>
            <button 
              onClick={() => handleSeleccionarTab('perfil')} 
              className="btn btn-secondary" 
              style={{ padding: '4px 8px', minHeight: '32px', fontSize: '0.78rem', gap: '4px', borderColor: 'rgba(56, 189, 248, 0.4)', color: '#38bdf8' }}
              title="Mi Perfil"
            >
              👤 Mi Perfil
            </button>
            <button onClick={onLogout} className="btn btn-danger" style={{ padding: '4px 8px', minHeight: '32px' }} title="Cerrar Sesión">
              <LogOut size={14} />
            </button>
          </div>
        )}
      </div>

      {/* Overlay Oscuro para Móvil */}
      {sidebarMovilAbierto && (
        <div 
          onClick={() => setSidebarMovilAbierto(false)} 
          className="sidebar-overlay"
        />
      )}

      {/* Sidebar Lateral (Desktop y Drawer Móvil) */}
      <aside className={`sidebar-container ${sidebarMovilAbierto ? 'sidebar-open' : ''}`}>
        {/* Header del Sidebar con Logo del Castor Constructor */}
        <div className="sidebar-header" style={{ padding: '16px 14px' }}>
          <LogoCastor size={42} variant="full" />
        </div>

        {/* Menú por Secciones */}
        <div className="sidebar-menu">
          {/* BOTÓN FIJO ENCABEZADO: DASHBOARD / INICIO */}
          <div style={{ marginBottom: '4px' }}>
            <button
              onClick={() => handleSeleccionarTab('dashboard')}
              className={`nav-item-btn ${tabActiva === 'dashboard' ? 'active' : ''}`}
              style={{
                fontWeight: 700,
                fontSize: '0.92rem',
                padding: '11px 14px',
                background: tabActiva === 'dashboard' 
                  ? 'linear-gradient(135deg, rgba(56,189,248,0.25), rgba(2,132,199,0.15))' 
                  : 'rgba(255,255,255,0.04)',
                border: tabActiva === 'dashboard' ? '1px solid #38bdf8' : '1px solid rgba(255,255,255,0.08)',
                color: tabActiva === 'dashboard' ? '#38bdf8' : 'var(--text-main)',
                boxShadow: tabActiva === 'dashboard' ? '0 4px 12px rgba(56,189,248,0.15)' : 'none'
              }}
            >
              <LayoutDashboard size={20} color={tabActiva === 'dashboard' ? '#38bdf8' : '#38bdf8'} />
              <span>Dashboard / Inicio</span>
            </button>
          </div>

          {/* SECCIÓN 1: BASES DE DATOS */}
          <div className="sidebar-section">
            <button 
              onClick={() => toggleSeccion(1)} 
              className="section-header-btn"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Database size={16} color="var(--color-primary)" />
                <span className="section-title">SECCIÓN 1: BASES DE DATOS</span>
              </div>
              {seccionAbierta === 1 ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>

            {seccionAbierta === 1 && (
              <div className="section-items">
                {seccion1Items.map(item => {
                  const IconComponent = item.icon;
                  const activo = tabActiva === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSeleccionarTab(item.id)}
                      className={`nav-item-btn ${activo ? 'active' : ''}`}
                    >
                      <IconComponent size={18} color={activo ? '#38bdf8' : 'var(--text-muted)'} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* SECCIÓN 2: HERRAMIENTAS DE OBRA */}
          <div className="sidebar-section">
            <button 
              onClick={() => toggleSeccion(2)} 
              className="section-header-btn"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Wrench size={16} color="#34d399" />
                <span className="section-title" style={{ color: '#34d399' }}>SECCIÓN 2: HERRAMIENTAS</span>
              </div>
              {seccionAbierta === 2 ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>

            {seccionAbierta === 2 && (
              <div className="section-items">
                {seccion2Items.map(item => {
                  const IconComponent = item.icon;
                  const activo = tabActiva === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSeleccionarTab(item.id)}
                      className={`nav-item-btn ${activo ? 'active' : ''}`}
                    >
                      <IconComponent size={18} color={activo ? '#34d399' : 'var(--text-muted)'} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* SECCIÓN 3: FINANZAS DEL PROYECTO */}
          <div className="sidebar-section">
            <button 
              onClick={() => toggleSeccion(3)} 
              className="section-header-btn"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <DollarSign size={16} color="#fb923c" />
                <span className="section-title" style={{ color: '#fb923c' }}>SECCIÓN 3: FINANZAS</span>
              </div>
              {seccionAbierta === 3 ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>

            {seccionAbierta === 3 && (
              <div className="section-items">
                {seccion3Items.map(item => {
                  const IconComponent = item.icon;
                  const activo = tabActiva === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSeleccionarTab(item.id)}
                      className={`nav-item-btn ${activo ? 'active' : ''}`}
                    >
                      <IconComponent size={18} color={activo ? '#fb923c' : 'var(--text-muted)'} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* SECCIÓN 4: DOCUMENTACIÓN DEL PROYECTO */}
          <div className="sidebar-section">
            <button 
              onClick={() => toggleSeccion(4)} 
              className="section-header-btn"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={16} color="#c084fc" />
                <span className="section-title" style={{ color: '#c084fc' }}>SECCIÓN 4: DOCUMENTACIÓN</span>
              </div>
              {seccionAbierta === 4 ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>

            {seccionAbierta === 4 && (
              <div className="section-items">
                {seccion4Items.map(item => {
                  const IconComponent = item.icon;
                  const activo = tabActiva === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSeleccionarTab(item.id)}
                      className={`nav-item-btn ${activo ? 'active' : ''}`}
                    >
                      <IconComponent size={18} color={activo ? '#c084fc' : 'var(--text-muted)'} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* SECCIÓN 5 EXCLUSIVA: TALLER DE CARPINTERÍA (RBAC) */}
          {puedeVerCarpinteria && (
            <div className="sidebar-section" style={{ border: '1px solid rgba(245,158,11,0.25)', borderRadius: 'var(--radius-md)', background: 'rgba(245,158,11,0.03)', marginTop: '6px' }}>
              <button 
                onClick={() => toggleSeccion(5)} 
                className="section-header-btn"
                style={{ padding: '10px 12px' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Hammer size={16} color="#fbbf24" />
                  <span className="section-title" style={{ color: '#fbbf24', fontWeight: 800 }}>🪚 CARPINTERÍA & 3D</span>
                </div>
                {seccionAbierta === 5 ? <ChevronDown size={14} color="#fbbf24" /> : <ChevronRight size={14} color="#fbbf24" />}
              </button>

              {seccionAbierta === 5 && (
                <div className="section-items" style={{ padding: '0 8px 8px 8px' }}>
                  {seccionCarpinteriaItems.map(item => {
                    const IconComponent = item.icon;
                    const activo = tabActiva === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleSeleccionarTab(item.id)}
                        className={`nav-item-btn ${activo ? 'active' : ''}`}
                        style={{
                          background: activo ? 'rgba(245,158,11,0.18)' : 'transparent',
                          borderColor: activo ? '#f59e0b' : 'transparent',
                          color: activo ? '#fbbf24' : 'var(--text-secondary)'
                        }}
                      >
                        <IconComponent size={18} color={activo ? '#fbbf24' : 'var(--text-muted)'} />
                        <span style={{ fontSize: '0.82rem' }}>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer del Sidebar: Perfil & Logout */}
        {usuario && (
          <div className="sidebar-footer">
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: '8px' }}>
              👤 {usuario.email}
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                onClick={() => handleSeleccionarTab('perfil')}
                className="btn btn-secondary"
                style={{ 
                  flex: 1, 
                  minHeight: '36px', 
                  fontSize: '0.82rem', 
                  gap: '6px', 
                  background: tabActiva === 'perfil' ? 'rgba(56,189,248,0.2)' : 'rgba(255,255,255,0.06)',
                  color: tabActiva === 'perfil' ? '#38bdf8' : '#ffffff',
                  borderColor: tabActiva === 'perfil' ? '#38bdf8' : 'rgba(255,255,255,0.1)'
                }}
              >
                👤 Mi Perfil
              </button>
              <button 
                onClick={onLogout} 
                className="btn btn-danger" 
                style={{ padding: '0 12px', minHeight: '36px', fontSize: '0.82rem', gap: '4px' }}
                title="Cerrar Sesión"
              >
                <LogOut size={14} /> Salir
              </button>
            </div>
          </div>
        )}
      </aside>

      {/* Estilos CSS del Sidebar */}
      <style>{`
        .mobile-header-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 16px;
          background: var(--bg-surface);
          border-bottom: 1px solid var(--border-color);
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .sidebar-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(4px);
          z-index: 1000;
        }

        .sidebar-container {
          position: fixed;
          top: 0;
          bottom: 0;
          left: -280px;
          width: 260px;
          background: #0f172a;
          border-right: 1px solid var(--border-color);
          display: flex;
          flex-direction: column;
          z-index: 1001;
          transition: left 0.3s ease;
          box-shadow: 4px 0 20px rgba(0,0,0,0.4);
        }

        .sidebar-open {
          left: 0 !important;
        }

        .sidebar-header {
          padding: 20px 16px;
          display: flex;
          align-items: center;
          gap: 12px;
          border-bottom: 1px solid rgba(255,255,255,0.08);
        }

        .sidebar-menu {
          flex: 1;
          overflow-y: auto;
          padding: 16px 12px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .sidebar-section {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .section-header-btn {
          background: none;
          border: none;
          color: var(--text-muted);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 6px;
          cursor: pointer;
          width: 100%;
          border-radius: 6px;
          transition: background 0.2s;
        }
        .section-header-btn:hover {
          background: rgba(255,255,255,0.05);
        }

        .section-title {
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.05em;
          color: var(--color-primary);
        }

        .section-items {
          display: flex;
          flex-direction: column;
          gap: 4px;
          padding-left: 8px;
        }

        .nav-item-btn {
          background: transparent;
          border: none;
          color: var(--text-muted);
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 12px;
          border-radius: 8px;
          fontSize: 0.88rem;
          cursor: pointer;
          text-align: left;
          width: 100%;
          transition: all 0.2s ease;
        }

        .nav-item-btn:hover {
          background: rgba(255,255,255,0.06);
          color: var(--text-main);
        }

        .nav-item-btn.active {
          background: rgba(56, 189, 248, 0.15);
          color: #38bdf8;
          font-weight: 600;
          border-left: 3px solid #38bdf8;
        }

        .sidebar-footer {
          padding: 16px;
          border-top: 1px solid rgba(255,255,255,0.08);
          background: rgba(15,23,42,0.8);
        }

        @media (min-width: 768px) {
          .mobile-header-top {
            display: none;
          }
          .sidebar-container {
            left: 0;
            position: fixed;
          }
        }
      `}</style>
    </>
  );
}
