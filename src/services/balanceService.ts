// ============================================================
// BLOQUE 1: IMPORTACIONES Y DEPENDENCIAS
// Qué hace: Consolida ingresos (Abonos) vs egresos (Compras & Gastos) para el Balance General.
// Por qué: Regla RT-01 y tipado estricto (Manual Maestro 2.3 & 3.1).
// ============================================================
import { obtenerProyectos } from './proyectosService';
import { obtenerAbonosPorProyecto } from './finanzasService';
import { obtenerComprasGlobales } from './comprasGlobalesService';
import { isFirebaseConfigured } from '../lib/firebase.js';

export interface IDesgloseProyectoBalance {
  id?: string;
  nombre: string;
  codigoObra?: string;
  clienteNombre?: string;
  totalAbonos: number;
  totalCompras: number;
  balanceProyecto: number;
}

export interface IBalanceConsolidado {
  totalIngresosAbonos: number;
  totalEgresos: number;
  balanceNeto: number;
  esPositivo: boolean;
  desgloseProyectos: IDesgloseProyectoBalance[];
  desgloseCategorias: Array<{ categoria: string; total: number }>;
}

/**
 * Consolida el balance financiero general de la empresa
 */
export const obtenerBalanceEmpresa = async (): Promise<IBalanceConsolidado> => {
  if (!isFirebaseConfigured) {
    return {
      totalIngresosAbonos: 0,
      totalEgresos: 0,
      balanceNeto: 0,
      esPositivo: true,
      desgloseProyectos: [],
      desgloseCategorias: []
    };
  }

  try {
    // 1. Cargar todas las compras de la Caja General (Egresos Reales)
    const compras = await obtenerComprasGlobales();
    const totalEgresos = compras.reduce((acc, c) => acc + (Number(c.monto) || 0), 0);

    // 2. Cargar todos los proyectos y sus abonos (Ingresos Reales)
    const proyectos = await obtenerProyectos();
    let totalIngresosAbonos = 0;
    const desgloseProyectos: IDesgloseProyectoBalance[] = [];

    for (const p of proyectos) {
      const abonosP = p.id ? await obtenerAbonosPorProyecto(p.id) : [];
      const sumaAbonosP = abonosP.reduce((acc, a) => acc + (Number(a.monto) || 0), 0);
      
      // Filtrar compras imputadas a este proyecto específico
      const comprasP = compras.filter(c => c.proyectoId === p.id || (c.imputaciones && c.imputaciones.some(imp => imp.proyectoId === p.id)));
      const sumaComprasP = comprasP.reduce((acc, c) => {
        if (c.imputaciones && c.imputaciones.length > 0) {
          const impOb = c.imputaciones.find(i => i.proyectoId === p.id);
          return acc + (Number(impOb?.monto) || 0);
        }
        return acc + (Number(c.monto) || 0);
      }, 0);

      totalIngresosAbonos += sumaAbonosP;

      desgloseProyectos.push({
        id: p.id,
        nombre: p.nombre,
        codigoObra: p.codigoObra,
        clienteNombre: p.clienteNombre,
        totalAbonos: sumaAbonosP,
        totalCompras: sumaComprasP,
        balanceProyecto: sumaAbonosP - sumaComprasP
      });
    }

    const balanceNeto = totalIngresosAbonos - totalEgresos;

    // 3. Desglose por Categoría de Gastos
    const categoriasMap: Record<string, number> = {};
    compras.forEach(c => {
      const cat = c.categoria || 'Otros';
      categoriasMap[cat] = (categoriasMap[cat] || 0) + (Number(c.monto) || 0);
    });

    const desgloseCategorias = Object.entries(categoriasMap).map(([categoria, total]) => ({
      categoria,
      total
    })).sort((a, b) => b.total - a.total);

    return {
      totalIngresosAbonos,
      totalEgresos,
      balanceNeto,
      esPositivo: balanceNeto >= 0,
      desgloseProyectos,
      desgloseCategorias
    };
  } catch (err) {
    console.error("Error al calcular balance general:", err);
    return {
      totalIngresosAbonos: 0,
      totalEgresos: 0,
      balanceNeto: 0,
      esPositivo: true,
      desgloseProyectos: [],
      desgloseCategorias: []
    };
  }
};
