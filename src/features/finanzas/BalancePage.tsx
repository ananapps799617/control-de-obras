// ============================================================
// BLOQUE 1: IMPORTACIONES Y DEPENDENCIAS
// Qué hace: Vista de Balance General y Flujo de Caja consolidado.
// Por qué: Arquitectura Feature-Driven (Manual Maestro 2.3).
// ============================================================
import React, { useState, useEffect } from 'react';
import { Scale, TrendingUp, TrendingDown, RefreshCw, Folder } from 'lucide-react';
import { obtenerBalanceEmpresa, IBalanceConsolidado } from '../../services/balanceService';

// ============================================================
// BLOQUE 2: COMPONENTE PRINCIPAL DE BALANCE GENERAL
// ============================================================
export default function BalancePage() {
  const [dataBalance, setDataBalance] = useState<IBalanceConsolidado>({
    totalIngresosAbonos: 0,
    totalEgresos: 0,
    balanceNeto: 0,
    esPositivo: true,
    desgloseProyectos: [],
    desgloseCategorias: []
  });

  const [cargando, setCargando] = useState<boolean>(true);

  const cargarBalance = async () => {
    setCargando(true);
    try {
      const res = await obtenerBalanceEmpresa();
      setDataBalance(res);
    } catch (err) {
      console.error("Error al cargar balance general:", err);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarBalance();
  }, []);

  const { totalIngresosAbonos, totalEgresos, balanceNeto, esPositivo, desgloseProyectos, desgloseCategorias } = dataBalance;

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Cabecera Principal */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px'
      }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Scale color="#38bdf8" size={24} /> 
            <span>Balance General & Flujo de Caja</span>
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.88rem', marginTop: '4px' }}>
            Comparativa global en tiempo real de Abonos Recibidos vs Compras & Caja General
          </p>
        </div>

        <button 
          onClick={cargarBalance}
          disabled={cargando}
          className="btn btn-secondary"
          style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}
        >
          <RefreshCw size={15} className={cargando ? 'spin' : ''} />
          <span>{cargando ? 'Actualizando...' : 'Recalcular'}</span>
        </button>
      </div>

      {/* Tarjetas Superiores de Balance */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: '16px'
      }}>
        {/* Tarjeta 1: Total Ingresos */}
        <div className="card" style={{ padding: '20px', borderLeft: '4px solid #34d399' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 600 }}>🟢 TOTAL ABONOS RECIBIDOS</span>
            <TrendingUp color="#34d399" size={20} />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#34d399', margin: '10px 0 4px 0' }}>
            ${Number(totalIngresosAbonos || 0).toLocaleString()} COP
          </div>
          <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Suma de pagos de clientes por proyectos</span>
        </div>

        {/* Tarjeta 2: Total Egresos */}
        <div className="card" style={{ padding: '20px', borderLeft: '4px solid #f87171' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 600 }}>🔴 TOTAL COMPRAS & CAJA GENERAL</span>
            <TrendingDown color="#f87171" size={20} />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#f87171', margin: '10px 0 4px 0' }}>
            ${Number(totalEgresos || 0).toLocaleString()} COP
          </div>
          <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Compras globales y facturas de insumos</span>
        </div>

        {/* Tarjeta 3: Balance Neto */}
        <div className="card" style={{
          padding: '20px',
          borderLeft: `4px solid ${esPositivo ? '#38bdf8' : '#fbbf24'}`,
          background: esPositivo ? 'rgba(56, 189, 248, 0.04)' : 'rgba(251, 191, 36, 0.04)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 600 }}>⚖️ BALANCE NETO</span>
            <Scale color={esPositivo ? '#38bdf8' : '#fbbf24'} size={20} />
          </div>
          <div style={{
            fontSize: '1.6rem',
            fontWeight: 800,
            color: esPositivo ? '#38bdf8' : '#fbbf24',
            margin: '10px 0 4px 0'
          }}>
            {esPositivo ? '+' : ''}${Number(balanceNeto || 0).toLocaleString()} COP
          </div>
          <span style={{ fontSize: '0.78rem', color: esPositivo ? '#34d399' : '#f87171', fontWeight: 600 }}>
            {esPositivo ? '✅ Superávit de Caja Positivo' : '⚠️ Déficit Temporal en Caja'}
          </span>
        </div>
      </div>

      {/* Desglose por Proyectos */}
      <div className="card" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 16px 0', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Folder size={18} color="#38bdf8" />
          <span>Rentabilidad por Proyecto de Obra</span>
        </h3>

        {cargando ? (
          <p style={{ color: '#94a3b8', textAlign: 'center', padding: '30px' }}>Calculando balance de obras...</p>
        ) : desgloseProyectos.length === 0 ? (
          <p style={{ color: '#64748b', textAlign: 'center', padding: '30px' }}>No hay proyectos registrados para desglosar.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table" style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th>Proyecto</th>
                  <th>Cliente</th>
                  <th style={{ textAlign: 'right' }}>Abonos ($ COP)</th>
                  <th style={{ textAlign: 'right' }}>Compras ($ COP)</th>
                  <th style={{ textAlign: 'right' }}>Margen / Balance</th>
                </tr>
              </thead>
              <tbody>
                {desgloseProyectos.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <strong style={{ color: '#f8fafc' }}>{p.nombre}</strong>
                      {p.codigoObra && <span style={{ display: 'block', fontSize: '0.75rem', color: '#64748b' }}>{p.codigoObra}</span>}
                    </td>
                    <td style={{ color: '#cbd5e1' }}>{p.clienteNombre || 'General'}</td>
                    <td style={{ textAlign: 'right', color: '#34d399', fontWeight: 600 }}>
                      ${Number(p.totalAbonos || 0).toLocaleString()}
                    </td>
                    <td style={{ textAlign: 'right', color: '#f87171', fontWeight: 600 }}>
                      ${Number(p.totalCompras || 0).toLocaleString()}
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 700, color: p.balanceProyecto >= 0 ? '#38bdf8' : '#fbbf24' }}>
                      {p.balanceProyecto >= 0 ? '+' : ''}${Number(p.balanceProyecto || 0).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Desglose por Categorías */}
      {desgloseCategorias.length > 0 && (
        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 16px 0', color: '#f8fafc' }}>
            📊 Distribución de Gastos por Categoría
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
            {desgloseCategorias.map((cat, idx) => (
              <div key={idx} style={{
                background: 'rgba(255,255,255,0.03)',
                padding: '12px 16px',
                borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.06)'
              }}>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{cat.categoria}</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc', marginTop: '4px' }}>
                  ${Number(cat.total).toLocaleString()} COP
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
