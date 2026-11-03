// ============================================================
// BLOQUE 1: IMPORTACIONES Y DEPENDENCIAS
// Qué hace: Modal para registrar o configurar un nuevo proyecto de obra.
// Por qué: Regla 2.2 Manual Maestro: Componentes modulares atómicos (< 200 líneas).
// ============================================================
import React from 'react';
import { HardHat } from 'lucide-react';
import ModalForm from '../../../components/ModalForm.jsx';
import type { IFormProyecto, EstadoProyecto } from '../../../types/proyecto';
import type { ICliente } from '../../../types/cliente';

interface ModalNuevoProyectoProps {
  abierto: boolean;
  onClose: () => void;
  form: IFormProyecto;
  setForm: React.Dispatch<React.SetStateAction<IFormProyecto>>;
  clientes: ICliente[];
  onGuardar: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  guardando: boolean;
  errorMsg: string;
}

// ============================================================
// BLOQUE 2: COMPONENTE MODAL DE NUEVO PROYECTO
// ============================================================
export default function ModalNuevoProyecto({
  abierto,
  onClose,
  form,
  setForm,
  clientes,
  onGuardar,
  guardando,
  errorMsg
}: ModalNuevoProyectoProps) {
  return (
    <ModalForm
      abierto={abierto}
      onClose={onClose}
      titulo="Registrar Nuevo Proyecto de Obra"
      maxWidth="620px"
    >
      {errorMsg && (
        <div style={{
          background: 'rgba(239,68,68,0.15)',
          border: '1px solid rgba(239,68,68,0.3)',
          color: '#fca5a5',
          padding: '10px 14px',
          borderRadius: '8px',
          fontSize: '0.85rem',
          marginBottom: '16px'
        }}>
          {errorMsg}
        </div>
      )}

      <form onSubmit={onGuardar} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '4px' }}>
            Nombre del Proyecto / Obra *
          </label>
          <input
            type="text"
            required
            className="input"
            placeholder="Ej: Remodelación Apartamento 502"
            value={form.nombre}
            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            style={{ width: '100%' }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '4px' }}>
              Código de Obra *
            </label>
            <input
              type="text"
              required
              className="input"
              placeholder="Ej: OBRA-001"
              value={form.codigoObra}
              onChange={(e) => setForm({ ...form, codigoObra: e.target.value })}
              style={{ width: '100%' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '4px' }}>
              Cliente Vinculado *
            </label>
            <select
              required
              className="input"
              value={form.clienteId}
              onChange={(e) => setForm({ ...form, clienteId: e.target.value })}
              style={{ width: '100%' }}
            >
              <option value="">-- Seleccione un Cliente --</option>
              {clientes.map(c => (
                <option key={c.id} value={c.id}>
                  {c.nombre} {c.tipoCliente ? `(${c.tipoCliente})` : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '4px' }}>
              Ciudad / Municipio
            </label>
            <input
              type="text"
              className="input"
              placeholder="Ej: Bogotá D.C."
              value={form.lugarObra}
              onChange={(e) => setForm({ ...form, lugarObra: e.target.value })}
              style={{ width: '100%' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '4px' }}>
              Dirección de la Obra
            </label>
            <input
              type="text"
              className="input"
              placeholder="Ej: Calle 100 # 15-20"
              value={form.direccionObra}
              onChange={(e) => setForm({ ...form, direccionObra: e.target.value })}
              style={{ width: '100%' }}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '4px' }}>
              Código de Cotización Inicial
            </label>
            <input
              type="text"
              className="input"
              placeholder="Ej: RH-COT-001-0001"
              value={form.tipoCotizacion}
              onChange={(e) => setForm({ ...form, tipoCotizacion: e.target.value })}
              style={{ width: '100%' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '4px' }}>
              Estado Inicial
            </label>
            <select
              className="input"
              value={form.estado}
              onChange={(e) => setForm({ ...form, estado: e.target.value as EstadoProyecto })}
              style={{ width: '100%' }}
            >
              <option value="Sin Cotizar">Sin Cotizar</option>
              <option value="Cotizado">Cotizado</option>
              <option value="Activo">Activo</option>
              <option value="Finalizado">Finalizado</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" disabled={guardando} className="btn btn-primary">
            {guardando ? 'Creando Obra y Carpetas...' : 'Crear Proyecto'}
          </button>
        </div>
      </form>
    </ModalForm>
  );
}
