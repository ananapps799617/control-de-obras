import React, { useState, useEffect } from 'react';
import { Scale, TrendingUp, TrendingDown, DollarSign, ShoppingCart, Folder, ArrowUpRight, ArrowDownRight, RefreshCw, PieChart, ShieldAlert } from 'lucide-react';
import { obtenerBalanceEmpresa } from '../services/balanceService';

// ============================================================
// BLOQUE 1: COMPONENTE BALANCE GENERAL Y FLUJO DE CAJA DE EMPRESA
// Qué hace: Visualiza estado de resultados comparando Abonos de Proyectos vs Compras Generales y diferencia neta (+ / -).
// Por qué: Requerimiento del Fundador para conocer la liquidez real y el margen de ganancia neta.
// ============================================================
export default function BalancePage() {
  const [dataBalance, setDataBalance] = useState({
    totalIngresosAbonos: 0,
    totalEgresos: 0,
    balanceNeto: 0,
    esPositivo: true,
    desgloseProyectos: [],
    desgloseCategorias: []
  });

  const [cargando, setCargando] = useState(true);

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
    <div>
      {/* CABECERA PRINCIPAL */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        marginBottom: '20px'
      }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Scale color="#38bdf8" size={24} /> Balance General & Flujo de Caja
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
            Comparativa global en tiempo real de Abonos Recibidos vs Compras & Caja General y diferencia neta.
          </p>
        </div>

        <button 
          onClick={cargarBalance}
          className="btn btn-secondary"
          style={{ gap: '6px', fontSize: '0.82rem' }}
          disabled={cargando}
        >
          <RefreshCw size={15} className={cargando ? 'pulse-icon' : ''} />
          {cargando ? 'Actualizando...' : 'Recargar Balance'}
        </button>
      </div>

      {cargando ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
          Calculando balance general y estado de resultados de la empresa...
        </div>
      ) : (
        <>
          {/* TABLERO PRINCIPAL DE RESULTADOS ($ COP) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            
            {/* 1. TOTAL INGRESOS POR ABONOS */}
            <div className="card" style={{ background: 'rgba(15,23,42,0.6)', borderLeft: '4px solid #34d399' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>INGRESOS TOTALES (ABONOS PROYECTOS)</span>
                <ArrowUpRight size={18} color="#34d399" />
              </div>
              <strong style={{ fontSize: '1.5rem', color: '#34d399', fontFamily: 'var(--font-mono)', marginTop: '8px', display: 'block' }}>
                ${Number(totalIngresosAbonos).toLocaleString()} COP
              </strong>
              <span style={{ fontSize: '0.74rem', color: '#34d399' }}>Total recibido de clientes en obras</span>
            </div>

            {/* 2. TOTAL EGRESOS POR COMPRAS GLOBALES */}
            <div className="card" style={{ background: 'rgba(15,23,42,0.6)', borderLeft: '4px solid #f87171' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>EGRESOS TOTALES (COMPRAS & CAJA)</span>
                <ArrowDownRight size={18} color="#f87171" />
              </div>
              <strong style={{ fontSize: '1.5rem', color: '#f87171', fontFamily: 'var(--font-mono)', marginTop: '8px', display: 'block' }}>
                ${Number(totalEgresos).toLocaleString()} COP
              </strong>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Materiales, fletes, viáticos, nómina y otros</span>
            </div>

            {/* 3. BALANCE NETO DE EMPRESA (DIFERENCIA + / -) */}
            <div 
              className="card" 
              style={{ 
                background: esPositivo ? 'rgba(34, 197, 94, 0.12)' : 'rgba(239, 68, 68, 0.12)', 
                borderLeft: `4px solid ${esPositivo ? '#34d399' : '#f87171'}`,
                border: `1px solid ${esPositivo ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.78rem', color: esPositivo ? '#34d399' : '#f87171', fontWeight: 700 }}>
                  ⚖️ BALANCE NETO (DIFERENCIA)
                </span>
                {esPositivo ? <TrendingUp size={20} color="#34d399" /> : <TrendingDown size={20} color="#f87171" />}
              </div>

              <strong style={{ fontSize: '1.6rem', color: esPositivo ? '#34d399' : '#f87171', fontFamily: 'var(--font-mono)', marginTop: '8px', display: 'block' }}>
                {esPositivo ? '+' : ''}${Number(balanceNeto).toLocaleString()} COP
              </strong>

              <div style={{ marginTop: '6px' }}>
                <span className={`badge ${esPositivo ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '0.74rem' }}>
                  {esPositivo ? '🟢 SUPERÁVIT: Ingresos mayores a egresos' : '🔴 DÉFICIT: Egresos superan los abonos'}
                </span>
              </div>
            </div>

          </div>

          {/* DESGLOSE POR CATEGORÍA DE EGRESO */}
          <div className="card" style={{ marginBottom: '24px', padding: '16px' }}>
            <h3 style={{ fontSize: '1rem', margin: '0 0 14px 0', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <PieChart size={18} /> Distribuición de Egresos por Categoría
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '10px' }}>
              {desgloseCategorias.map((c, idx) => (
                <div key={idx} style={{ background: 'rgba(255,255,255,0.03)', padding: '10px 12px', borderRadius: '8px', borderLeft: '3px solid #38bdf8' }}>
                  <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', display: 'block' }}>{c.categoria}</span>
                  <strong style={{ fontSize: '1rem', color: 'var(--text-main)', fontFamily: 'var(--font-mono)', marginTop: '2px', display: 'block' }}>
                    ${Number(c.monto).toLocaleString()} COP
                  </strong>
                </div>
              ))}
            </div>
          </div>

          {/* TABLA DE BALANCE COMPARATIVO POR PROYECTO DE OBRA */}
          <div className="card" style={{ padding: '16px', overflowX: 'auto' }}>
            <h3 style={{ fontSize: '1rem', margin: '0 0 14px 0', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Folder size={18} /> Desglose de Balance por Obra / Proyecto
            </h3>

            {desgloseProyectos.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                No hay proyectos registrados para desglosar el balance.
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#0f172a', color: '#38bdf8', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <th style={{ padding: '10px 12px' }}>Proyecto / Obra</th>
                    <th style={{ padding: '10px 12px' }}>Cliente</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right' }}>Total Abonos Recibidos ($ COP)</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right' }}>Total Compras Imputadas ($ COP)</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right' }}>Diferencia Neta Obra ($ COP)</th>
                    <th style={{ padding: '10px 12px', textAlign: 'center' }}>Estado de Liquidez</th>
                  </tr>
                </thead>
                <tbody>
                  {desgloseProyectos.map((p, idx) => {
                    const esPos = p.balanceProyecto >= 0;
                    return (
                      <tr key={p.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)' }}>
                        <td style={{ padding: '10px 12px', fontWeight: 700, color: 'var(--text-main)' }}>
                          {p.nombre} {p.codigoObra && <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>({p.codigoObra})</span>}
                        </td>
                        <td style={{ padding: '10px 12px', color: 'var(--text-muted)' }}>{p.clienteNombre || 'Cliente General'}</td>
                        <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700, color: '#34d399', fontFamily: 'var(--font-mono)' }}>
                          ${Number(p.totalAbonos).toLocaleString()} COP
                        </td>
                        <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700, color: '#f87171', fontFamily: 'var(--font-mono)' }}>
                          ${Number(p.totalCompras).toLocaleString()} COP
                        </td>
                        <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700, color: esPos ? '#34d399' : '#f87171', fontFamily: 'var(--font-mono)' }}>
                          {esPos ? '+' : ''}${Number(p.balanceProyecto).toLocaleString()} COP
                        </td>
                        <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                          <span className={`badge ${esPos ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '0.72rem' }}>
                            {esPos ? '🟢 Cobertura OK' : '🔴 Requiere Abono'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );
}
