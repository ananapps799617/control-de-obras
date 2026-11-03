// ============================================================
// BLOQUE 1: IMPORTACIONES Y DEPENDENCIAS
// Qué hace: Formulario con datos del cliente, obra, cronograma y alcance para la cotización.
// Por qué: Regla 2.2 Manual Maestro: Componentes modulares atómicos (< 200 líneas).
// ============================================================
import React from 'react';
import type { ICliente } from '../../../types/cliente';

interface FormularioCotizacionProps {
  form: any;
  setForm: React.Dispatch<React.SetStateAction<any>>;
}

export default function FormularioCotizacion({
  form,
  setForm
}: FormularioCotizacionProps) {
  return (
    <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc' }}>
        Datos Comerciales y Cronograma de Obra
      </h3>

      {/* Fila 1: Código y Fechas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '4px' }}>
            Código de Cotización
          </label>
          <input
            type="text"
            className="input"
            value={form.codigoCotizacion}
            onChange={(e) => setForm({ ...form, codigoCotizacion: e.target.value })}
            style={{ width: '100%' }}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '4px' }}>
            Fecha de Emisión
          </label>
          <input
            type="date"
            className="input"
            value={form.fechaCotizacion}
            onChange={(e) => setForm({ ...form, fechaCotizacion: e.target.value })}
            style={{ width: '100%' }}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '4px' }}>
            Fecha Estimada Inicio
          </label>
          <input
            type="date"
            className="input"
            value={form.fechaInicio}
            onChange={(e) => setForm({ ...form, fechaInicio: e.target.value })}
            style={{ width: '100%' }}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '4px' }}>
            Fecha Estimada Entrega
          </label>
          <input
            type="date"
            className="input"
            value={form.fechaEntrega}
            onChange={(e) => setForm({ ...form, fechaEntrega: e.target.value })}
            style={{ width: '100%' }}
          />
        </div>
      </div>

      {/* Fila 2: Duración y Suministro */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '4px' }}>
            Duración Estimada (Calculada)
          </label>
          <input
            type="text"
            className="input"
            value={form.duracionEstimada}
            onChange={(e) => setForm({ ...form, duracionEstimada: e.target.value })}
            style={{ width: '100%' }}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '4px' }}>
            Suministro de Materiales
          </label>
          <select
            className="input"
            value={form.suministroMateriales}
            onChange={(e) => setForm({ ...form, suministroMateriales: e.target.value })}
            style={{ width: '100%' }}
          >
            <option value="CONTRATISTA">El CONTRATISTA (RenovaHaus-IMB)</option>
            <option value="CLIENTE">El CONTRATANTE (Cliente)</option>
          </select>
        </div>
      </div>

      {/* Fila 3: Ubicación */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '4px' }}>
            Ciudad / Municipio de la Obra
          </label>
          <input
            type="text"
            className="input"
            value={form.ciudadObra}
            onChange={(e) => setForm({ ...form, ciudadObra: e.target.value })}
            style={{ width: '100%' }}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '4px' }}>
            Dirección de la Obra
          </label>
          <input
            type="text"
            className="input"
            value={form.direccionObra}
            onChange={(e) => setForm({ ...form, direccionObra: e.target.value })}
            style={{ width: '100%' }}
          />
        </div>
      </div>

      {/* Alcance del Proyecto */}
      <div>
        <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '4px' }}>
          Alcance de la Propuesta Técnica
        </label>
        <textarea
          rows={3}
          className="input"
          value={form.alcanceProyecto}
          onChange={(e) => setForm({ ...form, alcanceProyecto: e.target.value })}
          style={{ width: '100%', resize: 'vertical' }}
        />
      </div>
    </div>
  );
}
