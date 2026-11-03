import React from 'react';
import { DollarSign, CheckCircle2, Split } from 'lucide-react';

// ============================================================
// BLOQUE 1: COMPONENTE STATS COMPRAS GLOBALES
// Qué hace: Muestra los 3 indicadores clave de Caja General y compras globales.
// Por qué: Extraído de ComprasGlobalesPage.jsx para modularidad.
// ============================================================
export default function ComprasGlobalesStats({ totalGastado, totalImputado, totalPendiente }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
      
      {/* 1. Total Gastado en Caja General */}
      <div className="card" style={{ background: 'rgba(15,23,42,0.6)', borderLeft: '4px solid #8b5cf6' }}>
        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
          <DollarSign size={14} color="#8b5cf6" /> TOTAL COMPRAS (CAJA GENERAL)
        </span>
        <strong style={{ fontSize: '1.35rem', color: '#c084fc', fontFamily: 'var(--font-mono)', marginTop: '6px', display: 'block' }}>
          ${Number(totalGastado || 0).toLocaleString()} COP
        </strong>
        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
          Egresos y facturas libres
        </span>
      </div>

      {/* 2. Total Imputado a Obras */}
      <div className="card" style={{ background: 'rgba(15,23,42,0.6)', borderLeft: '4px solid #34d399' }}>
        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
          <CheckCircle2 size={14} color="#34d399" /> IMPUTADO A OBRAS
        </span>
        <strong style={{ fontSize: '1.35rem', color: '#34d399', fontFamily: 'var(--font-mono)', marginTop: '6px', display: 'block' }}>
          ${Number(totalImputado || 0).toLocaleString()} COP
        </strong>
        <span style={{ fontSize: '0.72rem', color: '#34d399' }}>
          Cargado a presupuestos de proyectos
        </span>
      </div>

      {/* 3. Pendiente de Imputación */}
      <div className="card" style={{ background: 'rgba(15,23,42,0.6)', borderLeft: '4px solid #fb923c' }}>
        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Split size={14} color="#fb923c" /> PENDIENTE DE IMPUTAR
        </span>
        <strong style={{ fontSize: '1.35rem', color: '#fb923c', fontFamily: 'var(--font-mono)', marginTop: '6px', display: 'block' }}>
          ${Number(totalPendiente || 0).toLocaleString()} COP
        </strong>
        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
          Sin asignar a ninguna obra
        </span>
      </div>

    </div>
  );
}
