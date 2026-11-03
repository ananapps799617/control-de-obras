// ============================================================
// BLOQUE 1: IMPORTACIONES Y DEPENDENCIAS
// Qué hace: Formulario modal para otorgar acceso de login a empleados en Firebase Auth.
// Por qué: Regla 2.2 Manual Maestro: Componentes modulares atómicos (< 200 líneas).
// ============================================================
import React, { useState } from 'react';
import { Eye, EyeOff, ShieldCheck } from 'lucide-react';
import ModalForm from '../../../../components/ModalForm.jsx';
import type { IFormCrearEmpleado } from '../../../../types/auth';
import type { IEmpleado } from '../../../../types/empleado';

interface ModalAccesoEmpleadoProps {
  abierto: boolean;
  onClose: () => void;
  empleado: IEmpleado | null;
  onCrearAcceso: (form: IFormCrearEmpleado) => Promise<void>;
  guardando: boolean;
  errorMsg: string;
}

// ============================================================
// BLOQUE 2: COMPONENTE MODAL DE GENERACIÓN DE ACCESO
// ============================================================
export default function ModalAccesoEmpleado({
  abierto,
  onClose,
  empleado,
  onCrearAcceso,
  guardando,
  errorMsg
}: ModalAccesoEmpleadoProps) {
  const [password, setPassword] = useState<string>('');
  const [mostrarPassword, setMostrarPassword] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!empleado) return;
    await onCrearAcceso({
      nombre: empleado.nombre,
      cargo: empleado.cargo,
      email: empleado.email || '',
      password
    });
    setPassword('');
  };

  return (
    <ModalForm
      abierto={abierto}
      onClose={onClose}
      titulo={`Generar Acceso para ${empleado?.nombre || 'Empleado'}`}
      maxWidth="500px"
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
            Correo Electrónico Autorizado
          </label>
          <input
            type="email"
            disabled
            className="input"
            value={empleado?.email || ''}
            style={{ width: '100%', opacity: 0.8 }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '4px' }}>
            Asignar Contraseña Inicial *
          </label>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <input
              type={mostrarPassword ? 'text' : 'password'}
              required
              minLength={6}
              className="input"
              placeholder="Mínimo 6 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
          <span>El colaborador podrá ingresar a la app con este correo y clave.</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" disabled={guardando} className="btn btn-primary">
            {guardando ? 'Generando acceso...' : 'Habilitar Cuenta'}
          </button>
        </div>
      </form>
    </ModalForm>
  );
}
