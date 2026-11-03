// ============================================================
// BLOQUE 1: IMPORTACIONES Y DEPENDENCIAS
// Qué hace: Importa React, iconos y tipos para las tarjetas de KPIs del Dashboard.
// Por qué: Regla 2.2 Manual Maestro: Componentes modulares atómicos.
// ============================================================
import React from 'react';
import { HardHat, Users, Scale, Calendar, CheckCircle2, TrendingUp, Clock } from 'lucide-react';
import type { IProyecto } from '../../../types/proyecto';
import type { ICliente } from '../../../types/cliente';
import type { IDataBalanceEmpresa, IEventoAgenda } from '../../../types/dashboard';

interface DashboardKpisProps {
  proyectos: IProyecto[];
  clientes: ICliente[];
  dataBalance: IDataBalanceEmpresa | null;
  eventosAgenda: IEventoAgenda[];
  onNavegarTab: (tab: string) => void;
}

// ============================================================
// BLOQUE 2: COMPONENTE DE CUADRÍCULA DE KPIS
// Qué hace: Visualiza métricas de obras activas, clientes, balance y agenda.
// ============================================================
export default function DashboardKpis({
  proyectos,
  clientes,
  dataBalance,
  eventosAgenda,
  onNavegarTab
}: DashboardKpisProps) {
  const proyectosActivos = proyectos.filter(p => p.estado === 'En Progreso' || (p as unknown as { estado: string }).estado === 'Activo').length;
  const esBalancePositivo = dataBalance?.esPositivo !== false;

  return (
    <>
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
            <div className="kpi-value">{clientes.length}</div>
            <div className="kpi-subtext" style={{ color: '#34d399' }}>
              <TrendingUp size={12} /> <span>Base activa</span>
            </div>
          </div>
          <div className="kpi-icon-box" style={{ background: 'rgba(52, 211, 153, 0.12)' }}>
            <Users size={20} color="#34d399" />
          </div>
        </div>

        {/* KPI 3: Balance General & Flujo de Caja */}
        <div 
          className="card kpi-card-item" 
          onClick={() => onNavegarTab('balance')}
          style={{ 
            borderLeft: `4px solid ${esBalancePositivo ? '#34d399' : '#f87171'}`,
            cursor: 'pointer',
            background: esBalancePositivo ? 'rgba(52, 211, 153, 0.03)' : 'rgba(248, 113, 113, 0.03)'
          }}
          title="Haz clic para abrir el Balance General completo"
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <span className="kpi-label" style={{ color: esBalancePositivo ? '#34d399' : '#f87171' }}>
              ⚖️ Balance General
            </span>
            <div className="kpi-value-money" style={{ color: esBalancePositivo ? '#34d399' : '#f87171', fontSize: '1.1rem' }}>
              {dataBalance?.esPositivo ? '+' : ''}${Number(dataBalance?.balanceNeto || 0).toLocaleString()} COP
            </div>
            <div className="kpi-subtext kpi-subtext-balance" style={{ color: 'var(--text-muted, #94a3b8)', gap: '6px', fontSize: '0.7rem' }}>
              <span style={{ color: '#34d399', fontWeight: 600, whiteSpace: 'nowrap' }}>
                🟢 Abonos: ${(Number(dataBalance?.totalIngresosAbonos || 0) / 1000000).toFixed(1)}M
              </span>
              <span style={{ color: '#f87171', fontWeight: 600, whiteSpace: 'nowrap' }}>
                🔴 Gastos: ${(Number(dataBalance?.totalEgresos || 0) / 1000000).toFixed(1)}M
              </span>
            </div>
          </div>
          <div className="kpi-icon-box" style={{ background: esBalancePositivo ? 'rgba(52, 211, 153, 0.12)' : 'rgba(248, 113, 113, 0.12)' }}>
            <Scale size={20} color={esBalancePositivo ? '#34d399' : '#f87171'} />
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
          background: var(--bg-surface, #1e293b);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          min-width: 0;
          overflow: hidden;
        }

        .kpi-label {
          font-size: 0.72rem;
          color: var(--text-muted, #94a3b8);
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
          color: var(--text-main, #f8fafc);
          line-height: 1.1;
          margin: 4px 0;
        }

        .kpi-value-money {
          font-family: var(--font-mono);
          font-variant-numeric: tabular-nums;
          letter-spacing: -0.02em;
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
    </>
  );
}
