import React, { useState, useEffect } from 'react';
import { User, UserPlus, Eye, EyeOff, ShieldCheck, Mail, Briefcase, Key, CheckCircle, Users } from 'lucide-react';
import { crearCuentaEmpleado, obtenerUsuariosEmpleados } from '../services/authService';
import ModalForm from '../components/ModalForm.jsx';

// ============================================================
// BLOQUE 1: COMPONENTE DE PERFIL Y GESTIÓN DE EMPLEADOS
// Qué hace: Visualiza el perfil activo del usuario y permite al Administrador crear cuentas de acceso a empleados.
// Por qué: Requerimiento del Fundador para control de acceso seguro sin registro público.
// ============================================================
export default function PerfilPage({ usuario }) {
  const [empleados, setEmpleados] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [exitoMsg, setExitoMsg] = useState('');

  // Formulario Crear Empleado
  const [form, setForm] = useState({
    nombre: '',
    cargo: 'Oficial de Obra',
    email: '',
    password: ''
  });

  const [mostrarPassword, setMostrarPassword] = useState(false);

  const cargarUsuarios = async () => {
    setCargando(true);
    try {
      const data = await obtenerUsuariosEmpleados();
      setEmpleados(data);
    } catch (err) {
      console.error("Error al cargar empleados:", err);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const handleCrearEmpleado = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setExitoMsg('');

    if (!form.nombre.trim()) return setErrorMsg('El nombre completo es obligatorio');
    if (!form.email.trim()) return setErrorMsg('El correo electrónico es obligatorio');
    if (!form.password || form.password.length < 6) return setErrorMsg('La contraseña debe tener mínimo 6 caracteres');

    setGuardando(true);
    try {
      await crearCuentaEmpleado(form);
      setExitoMsg(`✅ Cuenta creada con éxito para ${form.nombre} (${form.email})`);
      setForm({
        nombre: '',
        cargo: 'Oficial de Obra',
        email: '',
        password: ''
      });
      setModalAbierto(false);
      await cargarUsuarios();
    } catch (err) {
      setErrorMsg(err.message || 'Error al crear cuenta de empleado en Firebase');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div>
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        marginBottom: '20px'
      }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0 }}>Perfil y Cuentas de Empleados</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
            Administración de tu cuenta de acceso y creación de credenciales para tu personal operativo de obra.
          </p>
        </div>
        <button onClick={() => { setErrorMsg(''); setExitoMsg(''); setModalAbierto(true); }} className="btn btn-primary">
          <UserPlus size={18} /> + Crear Cuenta de Empleado
        </button>
      </div>

      {exitoMsg && (
        <div style={{ padding: '12px', background: 'rgba(52, 211, 153, 0.15)', border: '1px solid rgba(52, 211, 153, 0.3)', color: '#6ee7b7', borderRadius: '8px', marginBottom: '20px', fontSize: '0.88rem' }}>
          {exitoMsg}
        </div>
      )}

      {/* TARJETA MI PERFIL ACTIVO */}
      <div className="card" style={{ marginBottom: '24px', background: 'rgba(30,41,59,0.7)', borderLeft: '4px solid #38bdf8' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #0284c7, #38bdf8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#0f172a',
            fontWeight: 800,
            fontSize: '1.4rem'
          }}>
            <User size={30} />
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 style={{ margin: 0, fontSize: '1.15rem' }}>{usuario?.email || 'Administrador'}</h3>
              <span className="badge badge-success">Administrador</span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', margin: '4px 0 0 0' }}>
              UID Firebase: <span style={{ fontFamily: 'var(--font-mono)' }}>{usuario?.uid || 'Consola Real'}</span>
            </p>
          </div>
        </div>
      </div>

      {/* SECCIÓN DIRECTORIO DE EMPLEADOS Y PERSONAL AUTORIZADO */}
      <div className="card" style={{ padding: '20px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Users size={18} /> Cuentas de Acceso para Empleados ({empleados.length})
        </h3>

        {cargando ? (
          <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
            Cargando empleados desde Firestore...
          </div>
        ) : empleados.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
            Aún no has creado cuentas de acceso para empleados. Haz clic en <strong>+ Crear Cuenta de Empleado</strong>.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
            {empleados.map(emp => (
              <div 
                key={emp.id} 
                style={{ 
                  background: 'rgba(15,23,42,0.6)', 
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '8px',
                  padding: '14px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <strong style={{ fontSize: '0.95rem', color: '#ffffff' }}>{emp.nombre}</strong>
                  <span className="badge badge-info" style={{ fontSize: '0.7rem' }}>{emp.cargo}</span>
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                  <Mail size={14} color="var(--color-primary)" /> {emp.email}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                  Rol: <strong style={{ color: '#34d399' }}>{emp.rol || 'Empleado'}</strong>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Crear Cuenta de Empleado */}
      <ModalForm titulo="➕ Crear Cuenta de Acceso a Empleado" abierto={modalAbierto} onClose={() => setModalAbierto(false)}>
        <form onSubmit={handleCrearEmpleado}>
          {errorMsg && <div style={{ padding: '10px', background: 'rgba(239,68,68,0.15)', color: '#fca5a5', borderRadius: '8px', marginBottom: '12px', fontSize: '0.85rem' }}>{errorMsg}</div>}

          <div className="input-group">
            <label className="input-label">Nombre Completo del Empleado *</label>
            <input 
              type="text" 
              className="input-field" 
              required
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              placeholder="Ej. Pedro Gómez"
            />
          </div>

          <div className="input-group">
            <label className="input-label">Cargo / Función en Obra</label>
            <select 
              className="input-field"
              value={form.cargo}
              onChange={(e) => setForm({ ...form, cargo: e.target.value })}
            >
              <option value="Oficial de Carpintería">Oficial de Carpintería / Montaje</option>
              <option value="Ayudante de Obra">Ayudante de Obra</option>
              <option value="Supervisión / Taller">Supervisión / Jefe de Taller</option>
              <option value="Asistente Comercial">Asistente Comercial / Cotizaciones</option>
            </select>
          </div>

          <div className="input-group">
            <label className="input-label">Correo Electrónico de Acceso *</label>
            <input 
              type="email" 
              className="input-field" 
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="pedro.gomez@empresa.com"
            />
          </div>

          <div className="input-group">
            <label className="input-label">Contraseña de Asignación *</label>
            <div style={{ position: 'relative' }}>
              <input 
                type={mostrarPassword ? 'text' : 'password'} 
                className="input-field" 
                required
                minLength={6}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Mínimo 6 caracteres"
                style={{ paddingRight: '40px' }}
              />
              <button
                type="button"
                onClick={() => setMostrarPassword(!mostrarPassword)}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '4px'
                }}
                title={mostrarPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {mostrarPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
              Esta será la clave con la que el empleado iniciará sesión.
            </span>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '20px' }}>
            <button type="button" onClick={() => setModalAbierto(false)} className="btn btn-secondary">Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={guardando}>
              {guardando ? 'Creando en Firebase...' : 'Crear Cuenta'}
            </button>
          </div>
        </form>
      </ModalForm>
    </div>
  );
}
