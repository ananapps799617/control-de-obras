import React, { useState, useEffect } from 'react';
import { 
  HardHat, 
  Users, 
  FileText, 
  Calendar, 
  PlusCircle, 
  ExternalLink, 
  TrendingUp, 
  TrendingDown,
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Calculator,
  ArrowRight,
  Sparkles,
  FolderOpen,
  Scale,
  Camera,
  Eye
} from 'lucide-react';
import { obtenerProyectos } from '../services/proyectosService';
import { obtenerClientes } from '../services/clientesService';
import { obtenerCotizaciones } from '../services/cotizacionesService';
import { obtenerVisitasAgenda } from '../services/agendaService';
import { obtenerBalanceEmpresa } from '../services/balanceService';
import ModalFotosProyecto from '../components/proyectos/ModalFotosProyecto.jsx';
import ModalBitacoraDiaria from '../components/proyectos/ModalBitacoraDiaria.jsx';
import ModalCronogramaGantt from '../components/proyectos/ModalCronogramaGantt.jsx';
import ModalPortalCliente from '../components/proyectos/ModalPortalCliente.jsx';

// ============================================================
// BLOQUE 1: COMPONENTE DASHBOARD PRINCIPAL (Centro de Control)
// Qué hace: Muestra los indicadores clave (KPIs), accesos rápidos y estado general de obras.
// Por qué: Proporciona una vista ejecutiva al ingresar al sistema.
// ============================================================
export default function DashboardPage({ usuario, onNavegarTab }) {
  const [proyectos, setProyectos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [cotizaciones, setCotizaciones] = useState([]);
  const [eventosAgenda, setEventosAgenda] = useState([]);
  const [dataBalance, setDataBalance] = useState(null);
  const [proyectoFotosSeleccionado, setProyectoFotosSeleccionado] = useState(null);
  const [proyectoBitacoraSeleccionado, setProyectoBitacoraSeleccionado] = useState(null);
  const [proyectoGanttSeleccionado, setProyectoGanttSeleccionado] = useState(null);
  const [proyectoPortalSeleccionado, setProyectoPortalSeleccionado] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarDatosDashboard();
  }, []);

  const cargarDatosDashboard = async () => {
    setCargando(true);
    try {
      const [proyData, cliData, cotData, agendaData, balanceRes] = await Promise.all([
        obtenerProyectos().catch(() => []),
        obtenerClientes().catch(() => []),
        obtenerCotizaciones().catch(() => []),
        obtenerVisitasAgenda().catch(() => []),
        obtenerBalanceEmpresa().catch(() => null)
      ]);
      setProyectos(proyData);
      setClientes(cliData);
      setCotizaciones(cotData);
      setEventosAgenda(agendaData);
      setDataBalance(balanceRes);
    } catch (err) {
      console.error("Error al cargar datos del dashboard:", err);
    } finally {
      setCargando(false);
    }
  };

  // Cálculos de Métricas KPIs
  const proyectosActivos = proyectos.filter(p => p.estado === 'Activo').length;
  const proyectosCotizados = proyectos.filter(p => p.estado === 'Cotizado').length;
  const proyectosSinCotizar = proyectos.filter(p => p.estado === 'Sin Cotizar').length;
  const proyectosFinalizados = proyectos.filter(p => p.estado === 'Finalizado').length;

  const totalClientes = clientes.length;
  const totalCotizaciones = cotizaciones.length;

  // Suma acumulada de cotizaciones en $ COP
  const totalCotizadoCOP = cotizaciones.reduce((acc, curr) => {
    const val = Number(curr.totalGeneral) || Number(curr.presupuesto) || 0;
    return acc + val;
  }, 0);

  // Formateador de moneda en Pesos Colombianos
  const formatCOP = (valor) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0
    }).format(valor || 0);
  };

  const fechaHoyStr = new Date().toLocaleDateString('es-CO', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* ============================================================
          BLOQUE 2: BANNER SUPERIOR DE BIENVENIDA Y BIENVENIDA EXECUTIVE
          ============================================================ */}
      <div style={{
        background: 'linear-gradient(135deg, #053f5c 0%, #022c43 100%)',
        borderRadius: 'var(--radius-lg)',
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
            style={{ padding: '10px 18px', gap: '8px', fontSize: '0.9rem', fontWeight: 600 }}
          >
            <PlusCircle size={18} /> Nuevo Proyecto
          </button>
          <button 
            onClick={() => onNavegarTab('cotizaciones-oficiales')}
            className="btn btn-secondary"
            style={{ padding: '10px 18px', gap: '8px', fontSize: '0.9rem', background: 'rgba(255,255,255,0.08)' }}
          >
            <FileText size={18} /> Cotizaciones
          </button>
        </div>
      </div>

      {/* ============================================================
          BLOQUE 3: CUADRÍCULA DE TARJETAS KPI (MÉTRICAS CLAVE - 2x2 MÓVIL)
          ============================================================ */}
      <div className="dashboard-kpi-grid">
        {/* KPI 1: Proyectos de Obra */}
        <div className="card kpi-card-item" style={{ borderLeft: '4px solid #38bdf8' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <span className="kpi-label">Proyectos Obra</span>
            <div className="kpi-value">{proyectos.length}</div>
            <div className="kpi-subtext" style={{ color: '#38bdf8' }}>
              <CheckCircle2 size={12} /> <span><strong>{proyectosActivos}</strong> activos</span>
            </div>
          </div>
          <div className="kpi-icon-box" style={{ background: 'rgba(56, 189, 248, 0.12)' }}>
            <HardHat size={20} color="#38bdf8" />
          </div>
        </div>

        {/* KPI 2: Clientes Registrados */}
        <div className="card kpi-card-item" style={{ borderLeft: '4px solid #34d399' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <span className="kpi-label">Red Clientes</span>
            <div className="kpi-value">{totalClientes}</div>
            <div className="kpi-subtext" style={{ color: '#34d399' }}>
              <TrendingUp size={12} /> <span>Base activa</span>
            </div>
          </div>
          <div className="kpi-icon-box" style={{ background: 'rgba(52, 211, 153, 0.12)' }}>
            <Users size={20} color="#34d399" />
          </div>
        </div>

        {/* KPI 3: Balance General & Flujo de Caja (Discreto) */}
        <div 
          className="card kpi-card-item" 
          onClick={() => onNavegarTab('balance')}
          style={{ 
            borderLeft: `4px solid ${dataBalance?.esPositivo !== false ? '#34d399' : '#f87171'}`,
            cursor: 'pointer',
            background: dataBalance?.esPositivo !== false ? 'rgba(52, 211, 153, 0.03)' : 'rgba(248, 113, 113, 0.03)'
          }}
          title="Haz clic para abrir el Balance General completo"
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <span className="kpi-label" style={{ color: dataBalance?.esPositivo !== false ? '#34d399' : '#f87171' }}>
              ⚖️ Balance General
            </span>
            <div className="kpi-value-money" style={{ color: dataBalance?.esPositivo !== false ? '#34d399' : '#f87171', fontSize: '1.1rem' }}>
              {dataBalance?.esPositivo ? '+' : ''}${Number(dataBalance?.balanceNeto || 0).toLocaleString()} COP
            </div>
            <div className="kpi-subtext kpi-subtext-balance" style={{ color: 'var(--text-muted)', gap: '6px', fontSize: '0.7rem' }}>
              <span style={{ color: '#34d399', fontWeight: 600, whiteSpace: 'nowrap' }}>🟢 Abonos: ${(Number(dataBalance?.totalIngresosAbonos || 0) / 1000000).toFixed(1)}M</span>
              <span style={{ color: '#f87171', fontWeight: 600, whiteSpace: 'nowrap' }}>🔴 Gastos: ${(Number(dataBalance?.totalEgresos || 0) / 1000000).toFixed(1)}M</span>
            </div>
          </div>
          <div className="kpi-icon-box" style={{ background: dataBalance?.esPositivo !== false ? 'rgba(52, 211, 153, 0.12)' : 'rgba(248, 113, 113, 0.12)' }}>
            <Scale size={20} color={dataBalance?.esPositivo !== false ? '#34d399' : '#f87171'} />
          </div>
        </div>

        {/* KPI 4: Próximos Eventos de Agenda */}
        <div className="card kpi-card-item" style={{ borderLeft: '4px solid #c084fc' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <span className="kpi-label">Agenda Citas</span>
            <div className="kpi-value">{eventosAgenda.length}</div>
            <div className="kpi-subtext" style={{ color: '#c084fc' }}>
              <Clock size={12} /> <span>Eventos</span>
            </div>
          </div>
          <div className="kpi-icon-box" style={{ background: 'rgba(192, 132, 252, 0.12)' }}>
            <Calendar size={20} color="#c084fc" />
          </div>
        </div>
      </div>

      <style>{`
        .dashboard-kpi-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
          width: 100%;
          min-width: 0;
        }

        @media (max-width: 375px) {
          .dashboard-kpi-grid {
            grid-template-columns: 1fr;
          }
        }

        .kpi-card-item {
          padding: 12px 14px;
          background: var(--bg-surface);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          min-width: 0;
          overflow: hidden;
        }

        .kpi-label {
          font-size: 0.72rem;
          color: var(--text-muted);
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.02em;
          display: block;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .kpi-value {
          font-size: 1.4rem;
          font-weight: 800;
          color: var(--text-main);
          line-height: 1.1;
          margin: 4px 0;
        }

        .kpi-value-money {
          font-size: 0.92rem;
          font-weight: 800;
          color: #fb923c;
          line-height: 1.2;
          margin: 4px 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .kpi-subtext {
          font-size: 0.72rem;
          display: flex;
          align-items: center;
          gap: 4px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        @media (max-width: 480px) {
          .kpi-subtext-balance {
            flex-direction: column;
            align-items: flex-start;
            gap: 2px !important;
          }
        }

        .kpi-icon-box {
          padding: 8px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        @media (min-width: 768px) {
          .dashboard-kpi-grid {
            grid-template-columns: repeat(4, 1fr);
            gap: 16px;
          }
          .kpi-card-item {
            padding: 18px 20px;
          }
          .kpi-label {
            font-size: 0.78rem;
          }
          .kpi-value {
            font-size: 1.8rem;
          }
          .kpi-value-money {
            font-size: 1.3rem;
          }
          .kpi-subtext {
            font-size: 0.8rem;
          }
          .kpi-icon-box {
            padding: 12px;
            border-radius: 12px;
          }
        }
      `}</style>

      {/* ============================================================
          BLOQUE 4: ATAJOS RÁPIDOS DE ACCIÓN RÁPIDA (QUICK ACTIONS)
          ============================================================ */}
      <div>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '14px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          ⚡ Atajos Rápidos
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '12px'
        }}>
          <button 
            onClick={() => onNavegarTab('proyectos')}
            className="card"
            style={{
              padding: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              cursor: 'pointer',
              border: '1px solid var(--border-color)',
              background: 'rgba(255,255,255,0.02)',
              textAlign: 'left',
              transition: 'transform 0.2s, background 0.2s'
            }}
          >
            <div style={{ background: 'rgba(56,189,248,0.15)', padding: '10px', borderRadius: '10px' }}>
              <HardHat size={20} color="#38bdf8" />
            </div>
            <div>
              <strong style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-main)' }}>Gestor de Obras</strong>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Ver todos los proyectos</span>
            </div>
          </button>

          <button 
            onClick={() => onNavegarTab('clientes')}
            className="card"
            style={{
              padding: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              cursor: 'pointer',
              border: '1px solid var(--border-color)',
              background: 'rgba(255,255,255,0.02)',
              textAlign: 'left',
              transition: 'transform 0.2s, background 0.2s'
            }}
          >
            <div style={{ background: 'rgba(52,211,153,0.15)', padding: '10px', borderRadius: '10px' }}>
              <Users size={20} color="#34d399" />
            </div>
            <div>
              <strong style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-main)' }}>Directorio Clientes</strong>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Crear o editar cliente</span>
            </div>
          </button>

          <button 
            onClick={() => onNavegarTab('calculadora')}
            className="card"
            style={{
              padding: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              cursor: 'pointer',
              border: '1px solid var(--border-color)',
              background: 'rgba(255,255,255,0.02)',
              textAlign: 'left',
              transition: 'transform 0.2s, background 0.2s'
            }}
          >
            <div style={{ background: 'rgba(245,158,11,0.15)', padding: '10px', borderRadius: '10px' }}>
              <Calculator size={20} color="#fbbf24" />
            </div>
            <div>
              <strong style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-main)' }}>Calculadora Medidas</strong>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Cálculo rápido de m² y m3</span>
            </div>
          </button>

          <button 
            onClick={() => onNavegarTab('agenda')}
            className="card"
            style={{
              padding: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              cursor: 'pointer',
              border: '1px solid var(--border-color)',
              background: 'rgba(255,255,255,0.02)',
              textAlign: 'left',
              transition: 'transform 0.2s, background 0.2s'
            }}
          >
            <div style={{ background: 'rgba(192,132,252,0.15)', padding: '10px', borderRadius: '10px' }}>
              <Calendar size={20} color="#c084fc" />
            </div>
            <div>
              <strong style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-main)' }}>Agenda de Obra</strong>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Citas y Visitas Técnicas</span>
            </div>
          </button>
        </div>
      </div>

      {/* ============================================================
          BLOQUE 5: SECCIÓN RESUMEN DE PROYECTOS RECIENTES / EN CURSO
          ============================================================ */}
      <div className="card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>
              🏗️ Estado de Obras y Proyectos Recientes
            </h3>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Proyectos registrados en la plataforma y sus accesos directos
            </span>
          </div>
          <button 
            onClick={() => onNavegarTab('proyectos')} 
            className="btn btn-secondary"
            style={{ padding: '6px 12px', fontSize: '0.82rem', gap: '6px' }}
          >
            Ver Todos <ArrowRight size={14} />
          </button>
        </div>

        {cargando ? (
          <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
            Cargando proyectos en tiempo real...
          </div>
        ) : proyectos.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '36px', 
            background: 'rgba(255,255,255,0.02)', 
            borderRadius: 'var(--radius-md)',
            border: '1px dashed var(--border-color)' 
          }}>
            <HardHat size={36} color="var(--text-muted)" style={{ marginBottom: '10px' }} />
            <p style={{ color: 'var(--text-muted)', margin: '0 0 12px 0', fontSize: '0.9rem' }}>
              No tienes proyectos registrados aún.
            </p>
            <button onClick={() => onNavegarTab('proyectos')} className="btn btn-primary" style={{ fontSize: '0.85rem' }}>
              ➕ Crear Primer Proyecto
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {proyectos.slice(0, 5).map(proyecto => (
              <div 
                key={proyecto.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 16px',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    background: 'rgba(56,189,248,0.1)',
                    width: '38px',
                    height: '38px',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <HardHat size={20} color="#38bdf8" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)' }}>
                      {proyecto.nombre}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      Código: <strong>{proyecto.codigoObra || 'N/A'}</strong> | Cotización: <code>{proyecto.codigoCotizacion || 'RH-COT-001'}</code>
                    </div>

                    {/* Barra Mini de Avance (%) */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                      <div style={{
                        width: '100px',
                        height: '6px',
                        background: 'rgba(255,255,255,0.08)',
                        borderRadius: '3px',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          width: `${proyecto.estado === 'Finalizado' ? 100 : (proyecto.porcentajeAvance || 0)}%`,
                          height: '100%',
                          background: (proyecto.estado === 'Finalizado' || (proyecto.porcentajeAvance || 0) >= 100) ? '#22c55e' :
                                      (proyecto.porcentajeAvance || 0) >= 75 ? '#34d399' :
                                      (proyecto.porcentajeAvance || 0) >= 25 ? '#38bdf8' : '#f59e0b',
                          borderRadius: '3px'
                        }} />
                      </div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: (proyecto.estado === 'Finalizado' || (proyecto.porcentajeAvance || 0) >= 100) ? '#22c55e' : '#38bdf8' }}>
                        {proyecto.estado === 'Finalizado' ? '100%' : `${proyecto.porcentajeAvance || 0}%`}
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {/* Badge de Estado del Proyecto */}
                  <span style={{
                    padding: '4px 10px',
                    borderRadius: '12px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    background: proyecto.estado === 'Activo' ? 'rgba(52,211,153,0.15)' :
                                proyecto.estado === 'Cotizado' ? 'rgba(56,189,248,0.15)' :
                                proyecto.estado === 'Finalizado' ? 'rgba(192,132,252,0.15)' : 'rgba(245,158,11,0.15)',
                    color: proyecto.estado === 'Activo' ? '#34d399' :
                           proyecto.estado === 'Cotizado' ? '#38bdf8' :
                           proyecto.estado === 'Finalizado' ? '#c084fc' : '#fbbf24',
                    border: `1px solid ${
                      proyecto.estado === 'Activo' ? 'rgba(52,211,153,0.3)' :
                      proyecto.estado === 'Cotizado' ? 'rgba(56,189,248,0.3)' :
                      proyecto.estado === 'Finalizado' ? 'rgba(192,132,252,0.3)' : 'rgba(245,158,11,0.3)'
                    }`
                  }}>
                    {proyecto.estado || 'Sin Cotizar'}
                  </span>

                  {/* Botón de Cronograma Gantt */}
                  <button
                    onClick={() => setProyectoGanttSeleccionado(proyecto)}
                    className="btn btn-secondary"
                    style={{ padding: '4px 10px', fontSize: '0.78rem', gap: '4px', color: '#38bdf8', borderColor: 'rgba(56, 189, 248, 0.4)' }}
                    title="Cronograma de Fases y Diagrama Gantt de Obra"
                  >
                    <Calendar size={14} /> Cronograma
                  </button>

                  {/* Botón de Portal Cliente */}
                  <button
                    onClick={() => setProyectoPortalSeleccionado(proyecto)}
                    className="btn btn-secondary"
                    style={{ padding: '4px 10px', fontSize: '0.78rem', gap: '4px', color: '#c084fc', borderColor: 'rgba(192, 132, 252, 0.4)' }}
                    title="Portal de Transparencia Compartible para el Cliente"
                  >
                    <Eye size={14} /> Portal Cliente
                  </button>

                  {/* Botón de Bitácora Diaria */}
                  <button
                    onClick={() => setProyectoBitacoraSeleccionado(proyecto)}
                    className="btn btn-secondary"
                    style={{ padding: '4px 10px', fontSize: '0.78rem', gap: '4px', color: '#34d399', borderColor: 'rgba(52, 211, 153, 0.4)' }}
                    title="Bitácora Diaria de Campo (Asistencia, Clima, Avances, Bloqueos)"
                  >
                    <FileText size={14} /> Bitácora
                  </button>

                  {/* Botón de Fotos de Obra */}
                  <button
                    onClick={() => setProyectoFotosSeleccionado(proyecto)}
                    className="btn btn-secondary"
                    style={{ padding: '4px 10px', fontSize: '0.78rem', gap: '4px', color: '#fbbf24', borderColor: 'rgba(251, 191, 36, 0.4)' }}
                    title="Fotos de Obra (Antes, Durante, Terminado)"
                  >
                    <Camera size={14} /> Fotos
                  </button>

                  {/* Botón de Abrir Google Drive */}
                  {proyecto.driveFolderUrl && (
                    <a
                      href={proyecto.driveFolderUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-secondary"
                      style={{ padding: '4px 10px', fontSize: '0.78rem', gap: '4px' }}
                      title="Abrir carpeta oficial en Google Drive"
                    >
                      <FolderOpen size={14} color="#38bdf8" /> Drive
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal Cronograma Gantt del Proyecto */}
        {proyectoGanttSeleccionado && (
          <ModalCronogramaGantt
            proyecto={proyectoGanttSeleccionado}
            onClose={() => setProyectoGanttSeleccionado(null)}
          />
        )}

        {/* Modal Portal Cliente del Proyecto */}
        {proyectoPortalSeleccionado && (
          <ModalPortalCliente
            proyecto={proyectoPortalSeleccionado}
            cliente={clientes.find(c => c.id === proyectoPortalSeleccionado.clienteId)}
            onClose={() => setProyectoPortalSeleccionado(null)}
          />
        )}

        {/* Modal Bitácora Diaria del Proyecto */}
        {proyectoBitacoraSeleccionado && (
          <ModalBitacoraDiaria
            proyecto={proyectoBitacoraSeleccionado}
            onClose={() => setProyectoBitacoraSeleccionado(null)}
          />
        )}

        {/* Modal Fotos de Proyecto */}
        {proyectoFotosSeleccionado && (
          <ModalFotosProyecto
            proyecto={proyectoFotosSeleccionado}
            onClose={() => setProyectoFotosSeleccionado(null)}
          />
        )}
      </div>

    </div>
  );
}
