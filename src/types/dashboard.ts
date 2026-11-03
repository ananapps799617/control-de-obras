// ============================================================
// BLOQUE 1: CONTRATO DE DATOS PARA EL DASHBOARD Y MÉTRICAS
// Qué hace: Modela los datos de balance consolidado y estadísticas generales.
// Por qué: Regla 3.1 Manual Maestro: Tipado estricto para indicadores financieros.
// ============================================================

export interface IDataBalanceEmpresa {
  balanceNeto?: number;
  esPositivo?: boolean;
  totalIngresosAbonos?: number;
  totalEgresos?: number;
  totalCompras?: number;
  totalGastosOperativos?: number;
}

export interface IEventoAgenda {
  id?: string;
  titulo: string;
  fecha: string;
  hora?: string;
  clienteNombre?: string;
  lugar?: string;
  tipo?: string;
}

export interface ICotizacionResumen {
  id?: string;
  totalGeneral?: number;
  presupuesto?: number;
  clienteNombre?: string;
  estado?: string;
}
