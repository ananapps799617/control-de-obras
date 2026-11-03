// ============================================================
// BLOQUE 1: IMPORTACIONES Y CONTRATOS
// Qué hace: Importa React, iconos y tipos para el modal de nuevo empleado.
// Por qué: Regla 2.2 Manual Maestro: Descomposición en subcomponentes modulares (< 200 líneas).
// ============================================================
import React, { useState } from 'react';
import { Eye, EyeOff, ShieldCheck } from 'lucide-react';
import ModalForm from '../../../components/ModalForm.jsx';
import type { IFormCrearEmpleado } from '../../../types/auth';

interface ModalCrearEmpleadoProps {
  abierto: boolean;
  onCerrar: () => void;
  onCrear: (form: IFormCrearEmpleado) => Promise<void>;
  guardando: boolean;
  errorMsg: string;
}

// ============================================================
// BLOQUE 2: COMPONENTE MODAL DE CREACIÓN DE EMPLEADO
// Qué hace: Formulario modal con validación y alternador de visibilidad de clave.
// ============================================================
export default function ModalCrearEmpleado({
  abierto,
  onCerrar,
  onCrear,
  guardando,
  errorMsg
}: ModalCrearEmpleadoProps) {
  const [form, setForm] = useState<IFormCrearEmpleado>({
    nombre: '',
    cargo: 'Oficial de Obra',
    email: '',
    password: ''
  });
  const [mostrarPassword, setMostrarPassword] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await onCrear(form);
    setForm({ nombre: '', cargo: 'Oficial de Obra', email: '', password: '' });
  };

  return (
    <ModalForm
      abierto={abierto}
      onClose={onCerrar}
      titulo="Crear Nueva Cuenta de Empleado"
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

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '4px' }}>
            Nombre Completo *
          </label>
          <input
            type="text"
            required
            className="input"
            placeholder="Ej: Carlos Pérez"
            value={form.nombre}
            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            style={{ width: '100%' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '4px' }}>
            Cargo / Rol en Obra
          </label>
          <select
            className="input"
            value={form.cargo}
            onChange={(e) => setForm({ ...form, cargo: e.target.value })}
            style={{ width: '100%' }}
          >
            <option value="Oficial de Obra">Oficial de Obra</option>
            <option value="Ayudante / Auxiliar">Ayudante / Auxiliar</option>
            <option value="Maestro de Obra">Maestro de Obra</option>
            <option value="Carpintero / Armador">Carpintero / Armador</option>
            <option value="Pintor / Acabados">Pintor / Acabados</option>
            <option value="Electricista / Plomero">Electricista / Plomero</option>
            <option value="Administrador">Administrador</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '4px' }}>
            Correo Electrónico de Acceso *
          </label>
          <input
            type="email"
            required
            className="input"
            placeholder="carlos@tuempresa.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            style={{ width: '100%' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '4px' }}>
            Contraseña Inicial *
          </label>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <input
              type={mostrarPassword ? 'text' : 'password'}
              required
              minLength={6}
              className="input"
              placeholder="Mínimo 6 caracteres"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              style={{ width: '100%', paddingRight: '40px' }}
            />
            <button
              type="button"
              onClick={() => setMostrarPassword(!mostrarPassword)}
              style={{
                position: 'absolute',
                right: '8px',
                background: 'none',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer'
              }}
            >
              {mostrarPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <div style={{
          fontSize: '0.78rem',
          color: '#64748b',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          marginTop: '4px'
        }}>
          <ShieldCheck size={14} color="#38bdf8" />
          <span>La cuenta se creará en Firebase Authentication de forma segura.</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
          <button type="button" className="btn btn-secondary" onClick={onCerrar}>
            Cancelar
          </button>
          <button type="submit" disabled={guardando} className="btn btn-primary">
            {guardando ? 'Creando cuenta...' : 'Crear Empleado'}
          </button>
        </div>
      </form>
    </ModalForm>
  );
}
