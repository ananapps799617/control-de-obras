// ============================================================
// BLOQUE 1: IMPORTACIONES Y DEPENDENCIAS
// Qué hace: Formulario modal para registrar o editar clientes.
// Por qué: Regla 2.2 Manual Maestro: Componentes modulares atómicos (< 200 líneas).
// ============================================================
import React from 'react';
import { User, Building, MapPin, Phone, Mail, Navigation } from 'lucide-react';
import ModalForm from '../../../../components/ModalForm.jsx';
import type { IFormCliente } from '../../../../types/cliente';

interface ModalNuevoClienteProps {
  abierto: boolean;
  onClose: () => void;
  form: IFormCliente;
  setForm: React.Dispatch<React.SetStateAction<IFormCliente>>;
  onGuardar: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  guardando: boolean;
  errorMsg: string;
}

// ============================================================
// BLOQUE 2: COMPONENTE MODAL DE CLIENTE
// ============================================================
export default function ModalNuevoCliente({
  abierto,
  onClose,
  form,
  setForm,
  onGuardar,
  guardando,
  errorMsg
}: ModalNuevoClienteProps) {
  return (
    <ModalForm
      abierto={abierto}
      onClose={onClose}
      titulo="Registrar Nuevo Cliente"
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
        {/* Selector Tipo de Cliente */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            className={`btn ${form.tipoCliente === 'Persona Natural' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setForm({ ...form, tipoCliente: 'Persona Natural' })}
            style={{ flex: 1, gap: '6px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <User size={16} /> Persona Natural
          </button>
          <button
            type="button"
            className={`btn ${form.tipoCliente === 'Empresa / Razón Social' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setForm({ ...form, tipoCliente: 'Empresa / Razón Social' })}
            style={{ flex: 1, gap: '6px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <Building size={16} /> Empresa
          </button>
        </div>

        {/* Nombre o Razón Social */}
        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '4px' }}>
            {form.tipoCliente === 'Persona Natural' ? 'Nombre Completo del Cliente *' : 'Razón Social de la Empresa *'}
          </label>
          <input
            type="text"
            required
            className="input"
            placeholder={form.tipoCliente === 'Persona Natural' ? 'Ej: Juan Carlos Rodríguez' : 'Ej: Inversiones Arquitectura SAS'}
            value={form.nombre}
            onChange={(e) => {
              const val = e.target.value;
              setForm(prev => ({
                ...prev,
                nombre: val,
                aliasCarpeta: prev.aliasCarpeta === prev.nombre ? val.replace(/\s+/g, '_') : prev.aliasCarpeta
              }));
            }}
            style={{ width: '100%' }}
          />
        </div>

        {/* Alias de Carpeta Drive */}
        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '4px' }}>
            📁 Nombre de la Carpeta en Google Drive *
          </label>
          <input
            type="text"
            required
            className="input"
            placeholder="Ej: Juan_Rodriguez"
            value={form.aliasCarpeta}
            onChange={(e) => setForm({ ...form, aliasCarpeta: e.target.value })}
            style={{ width: '100%' }}
          />
        </div>

        {/* Fila Documento y Expedición */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '4px' }}>
              {form.tipoCliente === 'Persona Natural' ? 'Cédula de Ciudadanía' : 'NIT'}
            </label>
            <input
              type="text"
              className="input"
              placeholder="Ej: 1.020.304.506"
              value={form.numeroDocumento}
              onChange={(e) => setForm({ ...form, numeroDocumento: e.target.value })}
              style={{ width: '100%' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '4px' }}>
              Lugar de Expedición
            </label>
            <input
              type="text"
              className="input"
              placeholder="Ej: Bogotá D.C."
              value={form.lugarExpedicion}
              onChange={(e) => setForm({ ...form, lugarExpedicion: e.target.value })}
              style={{ width: '100%' }}
            />
          </div>
        </div>

        {/* Fila Residencia y Dirección */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '4px' }}>
              Ciudad de Residencia
            </label>
            <input
              type="text"
              className="input"
              placeholder="Ej: Medellín"
              value={form.lugarResidencia}
              onChange={(e) => setForm({ ...form, lugarResidencia: e.target.value })}
              style={{ width: '100%' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '4px' }}>
              Dirección de Residencia
            </label>
            <input
              type="text"
              className="input"
              placeholder="Ej: Calle 45 # 12-34"
              value={form.direccionResidencia}
              onChange={(e) => setForm({ ...form, direccionResidencia: e.target.value })}
              style={{ width: '100%' }}
            />
          </div>
        </div>

        {/* Fila Contacto (Teléfono y Email) */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '4px' }}>
              Teléfono / WhatsApp
            </label>
            <input
              type="tel"
              className="input"
              placeholder="Ej: 300 123 4567"
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
              placeholder="cliente@correo.com"
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
            {guardando ? 'Guardando...' : 'Guardar Cliente'}
          </button>
        </div>
      </form>
    </ModalForm>
  );
}
