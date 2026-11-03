// ============================================================
// BLOQUE 1: IMPORTACIONES Y DEPENDENCIAS
// Qué hace: Formulario modal para registrar o editar empleados de obra y tarifas.
// Por qué: Regla 2.2 Manual Maestro: Componentes modulares atómicos (< 200 líneas).
// ============================================================
import React from 'react';
import ModalForm from '../../../../components/ModalForm.jsx';
import type { IFormEmpleado, IEmpleado } from '../../../../types/empleado';

interface ModalEmpleadoProps {
  abierto: boolean;
  onClose: () => void;
  form: IFormEmpleado;
  setForm: React.Dispatch<React.SetStateAction<IFormEmpleado>>;
  onGuardar: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  guardando: boolean;
  errorMsg: string;
  empleadoEditando: IEmpleado | null;
}

// ============================================================
// BLOQUE 2: COMPONENTE MODAL DE EMPLEADO
// ============================================================
export default function ModalEmpleado({
  abierto,
  onClose,
  form,
  setForm,
  onGuardar,
  guardando,
  errorMsg,
  empleadoEditando
}: ModalEmpleadoProps) {
  return (
    <ModalForm
      abierto={abierto}
      onClose={onClose}
      titulo={empleadoEditando ? "Editar Empleado de Obra" : "Registrar Empleado de Obra"}
      maxWidth="600px"
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
            Nombre Completo *
          </label>
          <input
            type="text"
            required
            className="input"
            placeholder="Ej: Pedro José Martínez"
            value={form.nombre}
            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            style={{ width: '100%' }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '4px' }}>
              Cargo / Especialidad
            </label>
            <select
              className="input"
              value={form.cargo}
              onChange={(e) => setForm({ ...form, cargo: e.target.value })}
              style={{ width: '100%' }}
            >
              <option value="Oficial de Carpintería">Oficial de Carpintería</option>
              <option value="Armador / Instalador">Armador / Instalador</option>
              <option value="Ayudante de Taller">Ayudante de Taller</option>
              <option value="Maestro de Obra">Maestro de Obra</option>
              <option value="Pintor / Lacador">Pintor / Lacador</option>
              <option value="Operador CNC / Corte">Operador CNC / Corte</option>
              <option value="Oficial de Albañilería">Oficial de Albañilería</option>
              <option value="Electricista / Plomero">Electricista / Plomero</option>
              <option value="Administrador">Administrador</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '4px' }}>
              Cédula de Ciudadanía
            </label>
            <input
              type="text"
              className="input"
              placeholder="Ej: 1.015.890.123"
              value={form.cedula}
              onChange={(e) => setForm({ ...form, cedula: e.target.value })}
              style={{ width: '100%' }}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '4px' }}>
              Teléfono / WhatsApp
            </label>
            <input
              type="tel"
              className="input"
              placeholder="Ej: 312 456 7890"
              value={form.telefono}
              onChange={(e) => setForm({ ...form, telefono: e.target.value })}
              style={{ width: '100%' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '4px' }}>
              Correo Electrónico
            </label>
            <input
              type="email"
              className="input"
              placeholder="empleado@correo.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              style={{ width: '100%' }}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '4px' }}>
              Tarifa Diaria ($ COP)
            </label>
            <input
              type="number"
              className="input"
              placeholder="Ej: 80000"
              value={form.tarifaDiaria}
              onChange={(e) => setForm({ ...form, tarifaDiaria: e.target.value })}
              style={{ width: '100%' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '4px' }}>
              Salario Mensual ($ COP)
            </label>
            <input
              type="number"
              className="input"
              placeholder="Ej: 1800000"
              value={form.salarioMensual}
              onChange={(e) => setForm({ ...form, salarioMensual: e.target.value })}
              style={{ width: '100%' }}
            />
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '4px' }}>
            Observaciones / Habilidades
          </label>
          <input
            type="text"
            className="input"
            placeholder="Ej: Experto en ensamble de muebles de cocina y ruteado"
            value={form.observaciones}
            onChange={(e) => setForm({ ...form, observaciones: e.target.value })}
            style={{ width: '100%' }}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" disabled={guardando} className="btn btn-primary">
            {guardando ? 'Guardando...' : empleadoEditando ? 'Actualizar Empleado' : 'Guardar Empleado'}
          </button>
        </div>
      </form>
    </ModalForm>
  );
}
