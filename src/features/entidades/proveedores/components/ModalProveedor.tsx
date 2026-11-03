// ============================================================
// BLOQUE 1: IMPORTACIONES Y DEPENDENCIAS
// Qué hace: Formulario modal para registrar o editar proveedores.
// Por qué: Regla 2.2 Manual Maestro: Componentes modulares atómicos (< 200 líneas).
// ============================================================
import React from 'react';
import ModalForm from '../../../../components/ModalForm.jsx';
import type { IFormProveedor, IProveedor } from '../../../../types/proveedor';

interface ModalProveedorProps {
  abierto: boolean;
  onClose: () => void;
  form: IFormProveedor;
  setForm: React.Dispatch<React.SetStateAction<IFormProveedor>>;
  onGuardar: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  guardando: boolean;
  errorMsg: string;
  proveedorEditando: IProveedor | null;
}

// ============================================================
// BLOQUE 2: COMPONENTE MODAL DE PROVEEDOR
// ============================================================
export default function ModalProveedor({
  abierto,
  onClose,
  form,
  setForm,
  onGuardar,
  guardando,
  errorMsg,
  proveedorEditando
}: ModalProveedorProps) {
  return (
    <ModalForm
      abierto={abierto}
      onClose={onClose}
      titulo={proveedorEditando ? "Editar Proveedor" : "Registrar Nuevo Proveedor"}
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
            Razón Social / Nombre Comercial *
          </label>
          <input
            type="text"
            required
            className="input"
            placeholder="Ej: Distribuidora Maderera Los Andes SAS"
            value={form.razonSocial}
            onChange={(e) => setForm({ ...form, razonSocial: e.target.value })}
            style={{ width: '100%' }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '4px' }}>
              NIT / Cédula
            </label>
            <input
              type="text"
              className="input"
              placeholder="Ej: 900.123.456-7"
              value={form.nit}
              onChange={(e) => setForm({ ...form, nit: e.target.value })}
              style={{ width: '100%' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '4px' }}>
              Rubro / Especialidad
            </label>
            <input
              type="text"
              className="input"
              placeholder="Ej: Melaminas, Herrajes, Pinturas"
              value={form.rubro}
              onChange={(e) => setForm({ ...form, rubro: e.target.value })}
              style={{ width: '100%' }}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '4px' }}>
              Nombre de Contacto / Asesor
            </label>
            <input
              type="text"
              className="input"
              placeholder="Ej: Andrés Sánchez"
              value={form.contactoNombre}
              onChange={(e) => setForm({ ...form, contactoNombre: e.target.value })}
              style={{ width: '100%' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '4px' }}>
              Municipio / Departamento
            </label>
            <input
              type="text"
              className="input"
              placeholder="Ej: Bogotá D.C."
              value={form.municipioDepartamento}
              onChange={(e) => setForm({ ...form, municipioDepartamento: e.target.value })}
              style={{ width: '100%' }}
            />
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '4px' }}>
            Dirección / Barrio
          </label>
          <input
            type="text"
            className="input"
            placeholder="Ej: Av. Caracas # 45-20 Sur"
            value={form.direccionBarrio}
            onChange={(e) => setForm({ ...form, direccionBarrio: e.target.value })}
            style={{ width: '100%' }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '4px' }}>
              Teléfono / WhatsApp
            </label>
            <input
              type="tel"
              className="input"
              placeholder="Ej: 310 987 6543"
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
              placeholder="ventas@proveedor.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              style={{ width: '100%' }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" disabled={guardando} className="btn btn-primary">
            {guardando ? 'Guardando...' : proveedorEditando ? 'Actualizar Proveedor' : 'Guardar Proveedor'}
          </button>
        </div>
      </form>
    </ModalForm>
  );
}
