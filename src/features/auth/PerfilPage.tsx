// ============================================================
// BLOQUE 1: IMPORTACIONES Y DEPENDENCIAS
// Qué hace: Vista de perfil del usuario, selector de profesión RBAC y gestión de equipo.
// Por qué: Arquitectura Feature-Driven (Manual Maestro 2.3 & Orden #011).
// ============================================================
import React, { useState, useEffect } from 'react';
import { User, UserPlus, Mail, Briefcase, Key, CheckCircle, Users, Hammer, ShieldCheck } from 'lucide-react';
import { 
  crearCuentaEmpleado, 
  obtenerUsuariosEmpleados, 
  obtenerPerfilUsuario, 
  actualizarPerfilUsuario,
  tieneAccesoCarpinteria 
} from '../../services/authService';
import ModalCrearEmpleado from './components/ModalCrearEmpleado';
import type { IUsuarioSesion, IFormCrearEmpleado, IUsuarioEmpleadoDoc, ProfesionUsuario } from '../../types/auth';

interface PerfilPageProps {
  usuario?: IUsuarioSesion | null;
  onPerfilActualizado?: () => void;
}

export default function PerfilPage({ usuario, onPerfilActualizado }: PerfilPageProps) {
  const [empleados, setEmpleados] = useState<IUsuarioEmpleadoDoc[]>([]);
  const [perfilActual, setPerfilActual] = useState<IUsuarioEmpleadoDoc | null>(null);
  const [profesionSeleccionada, setProfesionSeleccionada] = useState<string>('Carpintero');
  const [cargando, setCargando] = useState<boolean>(true);
  const [guardandoProfesion, setGuardandoProfesion] = useState<boolean>(false);
  const [modalAbierto, setModalAbierto] = useState<boolean>(false);
  const [guardando, setGuardando] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [exitoMsg, setExitoMsg] = useState<string>('');

  const cargarDatos = async () => {
    setCargando(true);
    try {
      const [listaEmpleados, perfil] = await Promise.all([
        obtenerUsuariosEmpleados(),
        usuario?.uid ? obtenerPerfilUsuario(usuario.uid) : Promise.resolve(null)
      ]);
      setEmpleados(listaEmpleados);
      if (perfil) {
        setPerfilActual(perfil);
        if (perfil.profesion) {
          setProfesionSeleccionada(perfil.profesion);
        }
      }
    } catch (err) {
      console.error("Error al cargar perfil:", err);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, [usuario]);

  const handleCambiarProfesion = async (nuevaProfesion: string) => {
    setProfesionSeleccionada(nuevaProfesion);
    if (!usuario?.uid) return;

    setGuardandoProfesion(true);
    setExitoMsg('');
    setErrorMsg('');
    try {
      await actualizarPerfilUsuario(usuario.uid, {
        profesion: nuevaProfesion as ProfesionUsuario
      });
      setExitoMsg(`✅ Profesión actualizada a: ${nuevaProfesion}`);
      if (onPerfilActualizado) onPerfilActualizado();
    } catch (err) {
      setErrorMsg('Error al guardar la profesión en Firestore');
    } finally {
      setGuardandoProfesion(false);
    }
  };

  const handleCrearEmpleado = async (form: IFormCrearEmpleado) => {
    setErrorMsg('');
    setExitoMsg('');

    if (!form.nombre.trim()) return setErrorMsg('El nombre completo es obligatorio');
    if (!form.email.trim()) return setErrorMsg('El correo electrónico es obligatorio');
    if (!form.password || form.password.length < 6) return setErrorMsg('La contraseña debe tener mínimo 6 caracteres');

    setGuardando(true);
    try {
      await crearCuentaEmpleado(form);
      setExitoMsg(`✅ Cuenta creada con éxito para ${form.nombre} (${form.email})`);
      setModalAbierto(false);
      await cargarDatos();
    } catch (err: unknown) {
      const error = err as Error;
      setErrorMsg(error.message || 'Error al crear la cuenta del empleado.');
    } finally {
      setGuardando(false);
    }
  };

  const esCarpintero = tieneAccesoCarpinteria({
    rol: usuario?.rol || perfilActual?.rol,
    cargo: perfilActual?.cargo,
    profesion: profesionSeleccionada
  });

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '40px' }}>
      {/* Encabezado del Módulo */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>
            Mi Perfil y Accesos del Equipo
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginTop: '4px' }}>
            Configura tu especialidad técnica y administra las credenciales de tu equipo
          </p>
        </div>
        <button
          onClick={() => { setModalAbierto(true); setErrorMsg(''); }}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <UserPlus size={18} />
          <span>+ Crear Cuenta Empleado</span>
        </button>
      </div>

      {/* Alertas */}
      {exitoMsg && (
        <div style={{
          background: 'rgba(16,185,129,0.15)',
          border: '1px solid rgba(16,185,129,0.35)',
          color: '#34d399',
          padding: '12px 16px',
          borderRadius: 'var(--radius-sm)',
          fontSize: '0.9rem',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <CheckCircle size={18} />
          <span>{exitoMsg}</span>
        </div>
      )}

      {/* Grid de Perfil Activo & Selector de Profesión */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        
        {/* Tarjeta 1: Información de Usuario */}
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
            <div style={{
              background: 'linear-gradient(135deg, #0284c7, #38bdf8)',
              width: '52px',
              height: '52px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <User size={26} color="#0f172a" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, margin: 0, color: 'var(--text-main)' }}>
                {perfilActual?.nombre || usuario?.displayName || 'Administrador Principal'}
              </h3>
              <span className="badge-cyan" style={{ marginTop: '4px' }}>
                <ShieldCheck size={12} /> {usuario?.rol || perfilActual?.rol || 'Administrador'}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Mail size={16} color="var(--color-primary)" />
              <span style={{ color: 'var(--text-main)' }}>{usuario?.email || 'No autenticado'}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Key size={16} color="var(--text-muted)" />
              <span className="font-mono-num" style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>UID: {usuario?.uid || 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Tarjeta 2: Selector de Profesión / Especialidad Técnica (RBAC) */}
        <div className="card" style={{ padding: '24px', border: esCarpintero ? '1px solid rgba(245,158,11,0.4)' : '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <Hammer size={22} color={esCarpintero ? '#fbbf24' : 'var(--color-primary)'} />
            <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>
              Profesión y Especialidad Técnica
            </h4>
          </div>

          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '14px', lineHeight: 1.4 }}>
            Tu especialidad activa personaliza las herramientas disponibles en el menú de navegación:
          </p>

          <select
            className="input font-mono-num"
            value={profesionSeleccionada}
            onChange={(e) => handleCambiarProfesion(e.target.value)}
            disabled={guardandoProfesion}
            style={{ width: '100%', padding: '8px 12px', fontWeight: 600, fontSize: '0.88rem', color: esCarpintero ? '#fbbf24' : 'var(--text-main)' }}
          >
            <option value="Carpintero">🪚 Carpintero / Fabricante de Muebles</option>
            <option value="Contratista">🏗️ Contratista / Constructor General</option>
            <option value="Arquitecto">📐 Arquitecto / Diseñador de Interiores</option>
            <option value="Maestro de Obra">👷 Maestro de Obra / Supervisor</option>
            <option value="General">🏢 Operativo General</option>
          </select>

          {esCarpintero ? (
            <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span className="badge-wood">
                ✨ Suite de Carpintería & 3D Activada
              </span>
            </div>
          ) : (
            <p style={{ marginTop: '10px', fontSize: '0.75rem', color: 'var(--text-muted)', margin: '10px 0 0 0' }}>
              💡 Selecciona <strong>"Carpintero"</strong> si deseas activar las herramientas de diseño 3D y corte.
            </p>
          )}
        </div>
      </div>

      {/* Tabla de Empleados con Acceso */}
      <div className="card" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '16px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Users size={20} color="var(--color-primary)" />
          <span>Cuentas de Acceso Otorgadas ({empleados.length})</span>
        </h3>

        {cargando ? (
          <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '20px' }}>Cargando colaboradores...</p>
        ) : empleados.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px' }}>
            No has creado cuentas de empleado aún. Utiliza el botón superior para autorizar a tu equipo.
          </p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table" style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Cargo</th>
                  <th>Correo de Acceso</th>
                  <th>Rol</th>
                </tr>
              </thead>
              <tbody>
                {empleados.map((emp) => (
                  <tr key={emp.id || emp.uid}>
                    <td style={{ fontWeight: 500, color: 'var(--text-main)' }}>{emp.nombre}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Briefcase size={14} color="var(--text-muted)" />
                        {emp.cargo}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>{emp.email}</td>
                    <td>
                      <span className="badge badge-secondary">{emp.rol}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Crear Empleado */}
      <ModalCrearEmpleado
        abierto={modalAbierto}
        onCerrar={() => setModalAbierto(false)}
        onCrear={handleCrearEmpleado}
        guardando={guardando}
        errorMsg={errorMsg}
      />
    </div>
  );
}
