// ============================================================
// BLOQUE 1: IMPORTACIONES Y DEPENDENCIAS
// Qué hace: Formulario con los datos contractuales y legales de la obra.
// Por qué: Regla 2.2 Manual Maestro: Componentes modulares atómicos (< 200 líneas).
// ============================================================
import React from 'react';

interface FormularioContratoProps {
  form: any;
  setForm: React.Dispatch<React.SetStateAction<any>>;
}

export default function FormularioContrato({
  form,
  setForm
}: FormularioContratoProps) {
  return (
    <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc' }}>
        Cláusulas Legales y Datos del Contrato
      </h3>

      {/* Fila 1: Fechas y Código */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '4px' }}>
            Código de Cotización Vinculada
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
            Fecha de Celebración
          </label>
          <input
            type="date"
            className="input"
            value={form.fechaContrato}
            onChange={(e) => setForm({ ...form, fechaContrato: e.target.value })}
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

      {/* Fila 2: Datos de Identificación y Residencia */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '4px' }}>
            Cédula de Ciudadanía
          </label>
          <input
            type="text"
            className="input"
            value={form.clienteDocumento}
            onChange={(e) => setForm({ ...form, clienteDocumento: e.target.value })}
            style={{ width: '100%' }}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '4px' }}>
            Lugar de Expedición
          </label>
          <input
            type="text"
            className="input"
            value={form.ciudadExpedicion}
            onChange={(e) => setForm({ ...form, ciudadExpedicion: e.target.value })}
            style={{ width: '100%' }}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '4px' }}>
            Municipio de Residencia
          </label>
          <input
            type="text"
            className="input"
            value={form.ciudadResidencia}
            onChange={(e) => setForm({ ...form, ciudadResidencia: e.target.value })}
            style={{ width: '100%' }}
          />
        </div>
      </div>

      {/* Fila 3: Valor Total y Suministro */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '4px' }}>
            Valor Total Contratado ($ COP)
          </label>
          <input
            type="number"
            className="input"
            value={form.valorTotal}
            onChange={(e) => setForm({ ...form, valorTotal: e.target.value })}
            style={{ width: '100%', fontWeight: 700, color: '#38bdf8' }}
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
    </div>
  );
}
