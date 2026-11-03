import React from 'react';
import { Edit3 } from 'lucide-react';

// ============================================================
// BLOQUE 1: DASHBOARD DE INDICADORES FINANCIEROS
// Qué hace: Muestra las 5 tarjetas KPI del proyecto seleccionado.
// Por qué: Extraído de FinanzasPage.jsx para reducir su tamaño.
// ============================================================
export default function FinanzasDashboard({
  valorProyecto,
  esValorCotizado,
  totalAbonos,
  totalGastos,
  gastosManoObra,
  gastosMateriales,
  saldoPorCobrar,
  diferenciaNetaCaja,
  abonos,
  onEditarValor
}) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '24px' }}>

      {/* 1. Valor del Proyecto */}
      <div className="card" style={{ background: 'rgba(15,23,42,0.6)', borderLeft: '4px solid #38bdf8' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>VALOR CONTRATADO</span>
          <button
            onClick={onEditarValor}
            style={{ background: 'none', border: 'none', color: '#38bdf8', cursor: 'pointer', padding: '2px' }}
            title="Editar Valor Proyecto"
          >
            <Edit3 size={14} />
          </button>
        </div>
        <strong style={{ fontSize: '1.25rem', color: '#38bdf8', fontFamily: 'var(--font-mono)', marginTop: '4px', display: 'block' }}>
          ${Number(valorProyecto || 0).toLocaleString()} COP
        </strong>
        <span style={{ fontSize: '0.72rem', color: esValorCotizado ? '#38bdf8' : 'var(--text-muted)', fontWeight: esValorCotizado ? 600 : 400 }}>
          {esValorCotizado ? '⚡ Autocargado de Cotización Oficial' : 'Presupuesto Oficial Obra'}
        </span>
      </div>

      {/* 2. Abonos Recibidos */}
      <div className="card" style={{ background: 'rgba(15,23,42,0.6)', borderLeft: '4px solid #34d399' }}>
        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>ABONOS CLIENTE</span>
        <strong style={{ fontSize: '1.25rem', color: '#34d399', fontFamily: 'var(--font-mono)', marginTop: '4px', display: 'block' }}>
          ${Number(totalAbonos).toLocaleString()} COP
        </strong>
        <span style={{ fontSize: '0.72rem', color: '#34d399' }}>{abonos.length} ingresos registrados</span>
      </div>

      {/* 3. Gastos Totales de Obra */}
      <div className="card" style={{ background: 'rgba(15,23,42,0.6)', borderLeft: '4px solid #fb923c' }}>
        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>GASTOS TOTALES OBRA</span>
        <strong style={{ fontSize: '1.25rem', color: '#fb923c', fontFamily: 'var(--font-mono)', marginTop: '4px', display: 'block' }}>
          ${Number(totalGastos).toLocaleString()} COP
        </strong>
        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
          👷 M.O: ${Number(gastosManoObra).toLocaleString()} | 📦 Mat: ${Number(gastosMateriales).toLocaleString()}
        </span>
      </div>

      {/* 4. Saldo Pendiente por Cobrar */}
      <div className="card" style={{ background: 'rgba(15,23,42,0.6)', borderLeft: '4px solid #c084fc' }}>
        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>SALDO POR COBRAR</span>
        <strong style={{ fontSize: '1.25rem', color: '#c084fc', fontFamily: 'var(--font-mono)', marginTop: '4px', display: 'block' }}>
          ${Number(saldoPorCobrar).toLocaleString()} COP
        </strong>
        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Pendiente por cliente</span>
      </div>

      {/* 5. Diferencia Neta / Liquidez en Caja */}
      <div className="card" style={{
        background: diferenciaNetaCaja >= 0 ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
        borderLeft: `4px solid ${diferenciaNetaCaja >= 0 ? '#4ade80' : '#f87171'}`,
        border: `1px solid ${diferenciaNetaCaja >= 0 ? 'rgba(74, 222, 128, 0.3)' : 'rgba(248, 113, 113, 0.3)'}`
      }}>
        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>CAJA OBRA (ABONOS - GASTOS)</span>
        <strong style={{
          fontSize: '1.25rem',
          color: diferenciaNetaCaja >= 0 ? '#4ade80' : '#f87171',
          fontFamily: 'var(--font-mono)',
          marginTop: '4px',
          display: 'block'
        }}>
          {diferenciaNetaCaja >= 0 ? '+' : ''}${Number(diferenciaNetaCaja).toLocaleString()} COP
        </strong>
        <span style={{ fontSize: '0.72rem', color: diferenciaNetaCaja >= 0 ? '#4ade80' : '#f87171', fontWeight: 600 }}>
          {diferenciaNetaCaja >= 0 ? '🟢 Liquidez Positiva en Obra' : '🔴 Alerta: Gastos superan los abonos'}
        </span>
      </div>
    </div>
  );
}
