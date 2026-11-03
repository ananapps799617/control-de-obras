// ============================================================
// BLOQUE 1: IMPORTACIONES Y DEPENDENCIAS
// Qué hace: Importa React, hooks, servicios de datos y subcomponentes modulares del Dashboard.
// Por qué: Arquitectura Feature-Driven y Regla 2.2 Manual Maestro (Límite < 250 líneas).
// ============================================================
import React, { useState, useEffect } from 'react';
import { obtenerProyectos } from '../../services/proyectosService';
import { obtenerClientes } from '../../services/clientesService';
import { obtenerCotizaciones } from '../../services/cotizacionesService';
import { obtenerVisitasAgenda } from '../../services/agendaService';
import { obtenerBalanceEmpresa } from '../../services/balanceService';

import DashboardBanner from './components/DashboardBanner';
import DashboardKpis from './components/DashboardKpis';
import DashboardQuickActions from './components/DashboardQuickActions';
import DashboardProyectosRecientes from './components/DashboardProyectosRecientes';

import type { IProyecto } from '../../types/proyecto';
import type { ICliente } from '../../types/cliente';
import type { IDataBalanceEmpresa, IEventoAgenda, ICotizacionResumen } from '../../types/dashboard';
import type { IUsuarioSesion } from '../../types/auth';

interface DashboardPageProps {
  usuario?: IUsuarioSesion | null;
  onNavegarTab: (tab: string) => void;
}

// ============================================================
// BLOQUE 2: COMPONENTE PRINCIPAL DEL DASHBOARD (Centro de Control)
// Qué hace: Orquesta la carga de datos en paralelo y renderiza los bloques modulares.
// ============================================================
export default function DashboardPage({ usuario, onNavegarTab }: DashboardPageProps) {
  const [proyectos, setProyectos] = useState<IProyecto[]>([]);
  const [clientes, setClientes] = useState<ICliente[]>([]);
  const [cotizaciones, setCotizaciones] = useState<ICotizacionResumen[]>([]);
  const [eventosAgenda, setEventosAgenda] = useState<IEventoAgenda[]>([]);
  const [dataBalance, setDataBalance] = useState<IDataBalanceEmpresa | null>(null);
  const [cargando, setCargando] = useState<boolean>(true);

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
      setProyectos(proyData as IProyecto[]);
      setClientes(cliData as ICliente[]);
      setCotizaciones(cotData as ICotizacionResumen[]);
      setEventosAgenda(agendaData as IEventoAgenda[]);
      setDataBalance(balanceRes as IDataBalanceEmpresa | null);
    } catch (err) {
      console.error("Error al cargar datos del dashboard:", err);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatosDashboard();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* 1. Banner Superior de Bienvenida */}
      <DashboardBanner usuario={usuario} onNavegarTab={onNavegarTab} />

      {/* 2. Cuadrícula de Tarjetas KPI */}
      <DashboardKpis
        proyectos={proyectos}
        clientes={clientes}
        dataBalance={dataBalance}
        eventosAgenda={eventosAgenda}
        onNavegarTab={onNavegarTab}
      />

      {/* 3. Atajos Rápidos de Acción */}
      <DashboardQuickActions onNavegarTab={onNavegarTab} />

      {/* 4. Resumen de Obras y Proyectos Recientes */}
      <DashboardProyectosRecientes
        proyectos={proyectos}
        clientes={clientes}
        cargando={cargando}
        onNavegarTab={onNavegarTab}
      />
    </div>
  );
}
