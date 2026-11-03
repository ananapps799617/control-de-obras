import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Search, Edit, Trash2, Key, Phone, Mail, FileText, DollarSign, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { obtenerEmpleados, crearEmpleado, actualizarEmpleado, eliminarEmpleado } from '../services/empleadosService';
import { crearCuentaEmpleado } from '../services/authService';
import ModalForm from '../components/ModalForm.jsx';

// ============================================================
// BLOQUE 1: COMPONENTE VISTA BASE DE DATOS DE EMPLEADOS DE OBRA
// Qué hace: Controla el directorio de personal operativo y administrativo, tarifas y generación de accesos.
// Por qué: Requerimiento del Fundador para gestión de nómina y usuarios autorizados.
// ============================================================
export default function EmpleadosPage() {
  const [empleados, setEmpleados] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [exitoMsg, setExitoMsg] = useState('');

  // Modales
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modalAccesoAbierto, setModalAccesoAbierto] = useState(false);
  const [empleadoEditando, setEmpleadoEditando] = useState(null);
  const [empleadoParaAcceso, setEmpleadoParaAcceso] = useState(null);

  // Formulario Empleado (Datos Personales y Tarifas)
  const [form, setForm] = useState({
    nombre: '',
    cargo: 'Oficial de Carpintería',
    cedula: '',
    telefono: '',
    email: '',
    tarifaDiaria: '',
    salarioMensual: '',
    observaciones: ''
  });

  // Formulario Cuenta de Acceso
  const [formAcceso, setFormAcceso] = useState({
    nombre: '',
    cargo: '',
    email: '',
    password: ''
  });

  const [mostrarPassword, setMostrarPassword] = useState(false);

  const cargarDatos = async () => {
    setCargando(true);
    try {
      const data = await obtenerEmpleados();
      setEmpleados(data);
    } catch (err) {
      console.error("Error al cargar empleados:", err);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const handleAbrirCrear = () => {
    setEmpleadoEditando(null);
    setForm({
      nombre: '',
      cargo: 'Oficial de Carpintería',
      cedula: '',
      telefono: '',
      email: '',
      tarifaDiaria: '',
      salarioMensual: '',
      observaciones: ''
    });
    setErrorMsg('');
    setExitoMsg('');
    setModalAbierto(true);
  };

  const handleAbrirEditar = (emp) => {
    setEmpleadoEditando(emp);
    setForm({
      nombre: emp.nombre || '',
      cargo: emp.cargo || 'Oficial de Carpintería',
      cedula: emp.cedula || '',
      telefono: emp.telefono || '',
      email: emp.email || '',
      tarifaDiaria: emp.tarifaDiaria ? String(emp.tarifaDiaria) : '',
      salarioMensual: emp.salarioMensual ? String(emp.salarioMensual) : '',
      observaciones: emp.observaciones || ''
    });
    setErrorMsg('');
    setExitoMsg('');
    setModalAbierto(true);
  };

  const handleGuardarEmpleado = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!form.nombre.trim()) return setErrorMsg('El nombre completo del empleado es obligatorio');

    setGuardando(true);
    try {
      if (empleadoEditando) {
        await actualizarEmpleado(empleadoEditando.id, form);
      } else {
        await crearEmpleado(form);
      }
      setModalAbierto(false);
      setEmpleadoEditando(null);
      await cargarDatos();
    } catch (err) {
      setErrorMsg(err.message || 'Error al guardar el empleado');
    } finally {
      setGuardando(false);
    }
  };

  const handleAbrirCrearAcceso = (emp) => {
    setEmpleadoParaAcceso(emp);
    setFormAcceso({
      nombre: emp.nombre,
      cargo: emp.cargo || 'Oficial de Obra',
      email: emp.email || '',
      password: ''
    });
    setErrorMsg('');
    setExitoMsg('');
    setModalAccesoAbierto(true);
  };

  const handleGuardarAccesoApp = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setExitoMsg('');

    if (!formAcceso.email.trim()) return setErrorMsg('El correo electrónico es obligatorio');
    if (!formAcceso.password || formAcceso.password.length < 6) return setErrorMsg('La contraseña debe tener mínimo 6 caracteres');

    setGuardando(true);
    try {
      await crearCuentaEmpleado(formAcceso);

      // Marcar en la base de datos de empleados que ya tiene acceso creado
      if (empleadoParaAcceso) {
        await actualizarEmpleado(empleadoParaAcceso.id, {
          ...empleadoParaAcceso,
          email: formAcceso.email,
          tieneAccesoApp: true
        });
      }

      setExitoMsg(`✅ Cuenta de acceso creada con éxito para ${formAcceso.nombre}`);
      setModalAccesoAbierto(false);
      setEmpleadoParaAcceso(null);
      await cargarDatos();
    } catch (err) {
      setErrorMsg(err.message || 'Error al crear cuenta de acceso');
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminar = async (id) => {
    if (window.confirm('¿Seguro que deseas eliminar este empleado de la Base de Datos?')) {
      await eliminarEmpleado(id);
      await cargarDatos();
    }
  };

  const filtrados = empleados.filter(e => 
    (e.nombre || '').toLowerCase().includes(busqueda.toLowerCase()) ||
    (e.cargo || '').toLowerCase().includes(busqueda.toLowerCase()) ||
    (e.cedula || '').toLowerCase().includes(busqueda.toLowerCase()) ||
    (e.email || '').toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div>
      {/* CABECERA PRINCIPAL */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        marginBottom: '20px'
      }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Users color="#38bdf8" size={24} /> Base de Datos de Empleados & Personal de Obra
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
            Directorio general de oficiales, ayudantes y administrativos, tarifas de jornal y generación de accesos.
          </p>
        </div>
        <button onClick={handleAbrirCrear} className="btn btn-primary" style={{ gap: '6px' }}>
          <UserPlus size={18} /> + Registrar Nuevo Empleado
        </button>
      </div>

      {exitoMsg && (
        <div style={{ padding: '12px', background: 'rgba(52, 211, 153, 0.15)', border: '1px solid rgba(52, 211, 153, 0.3)', color: '#6ee7b7', borderRadius: '8px', marginBottom: '20px', fontSize: '0.88rem' }}>
          {exitoMsg}
        </div>
      )}

      {/* BARRA DE BÚSQUEDA */}
      <div style={{ position: 'relative', marginBottom: '20px' }}>
        <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '14px' }} />
        <input 
          type="text" 
          placeholder="Buscar empleado por nombre, cargo, cédula o correo..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="input-field"
          style={{ paddingLeft: '42px' }}
        />
      </div>

      {/* LISTA O TARJETAS DE EMPLEADOS */}
      {cargando ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
          Cargando Base de Datos de Empleados desde Firestore...
        </div>
      ) : filtrados.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
          No hay empleados registrados en la Base de Datos. Haz clic en <strong>+ Registrar Nuevo Empleado</strong>.
        </div>
      ) : (
        <div className="grid-cards">
          {filtrados.map(emp => (
            <div key={emp.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px', borderLeft: '4px solid #38bdf8' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>
                    {emp.nombre}
                  </h3>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '6px' }}>
                    <span className="badge badge-warning">{emp.cargo || 'Oficial'}</span>
                    {emp.cedula && <span className="badge badge-info">CC: {emp.cedula}</span>}
                    {emp.tieneAccesoApp ? (
                      <span className="badge badge-success">🟢 Acceso App Creado</span>
                    ) : (
                      <span className="badge badge-secondary">⚪ Sin Acceso App</span>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '4px' }}>
                  <button 
                    onClick={() => handleAbrirEditar(emp)}
                    style={{ background: 'none', border: 'none', color: '#38bdf8', cursor: 'pointer', padding: '4px' }}
                    title="Editar empleado"
                  >
                    <Edit size={16} />
                  </button>
                  <button 
                    onClick={() => handleEliminar(emp.id)}
                    style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', padding: '4px' }}
                    title="Eliminar empleado"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.86rem', color: 'var(--text-muted)' }}>
                {emp.telefono && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Phone size={14} color="var(--color-primary)" /> {emp.telefono}
                  </div>
                )}
                {emp.email && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Mail size={14} color="var(--color-primary)" /> {emp.email}
                  </div>
                )}
                
                <div style={{ display: 'flex', gap: '14px', marginTop: '4px', background: 'rgba(15,23,42,0.6)', padding: '8px 10px', borderRadius: '6px' }}>
                  <div>
                    <span style={{ fontSize: '0.72rem', display: 'block', color: 'var(--text-muted)' }}>Jornal / Día</span>
                    <strong style={{ color: '#34d399', fontFamily: 'var(--font-mono)' }}>
                      ${Number(emp.tarifaDiaria || 0).toLocaleString()} COP
                    </strong>
                  </div>
                  {Number(emp.salarioMensual) > 0 && (
                    <div>
                      <span style={{ fontSize: '0.72rem', display: 'block', color: 'var(--text-muted)' }}>Salario Mes</span>
                      <strong style={{ color: '#38bdf8', fontFamily: 'var(--font-mono)' }}>
                        ${Number(emp.salarioMensual).toLocaleString()} COP
                      </strong>
                    </div>
                  )}
                </div>
              </div>

              {/* Botón para Generar Cuenta de Acceso a la App si no la tiene */}
              {!emp.tieneAccesoApp && (
                <button
                  onClick={() => handleAbrirCrearAcceso(emp)}
                  className="btn btn-secondary"
                  style={{ marginTop: 'auto', fontSize: '0.78rem', gap: '6px', color: '#c084fc', borderColor: 'rgba(192,132,252,0.4)', background: 'rgba(192,132,252,0.1)' }}
                >
                  <Key size={14} /> 🔑 Crear Cuenta de Acceso App
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* MODAL REGISTRAR / EDITAR EMPLEADO */}
      <ModalForm 
        titulo={empleadoEditando ? `✏️ Editar Empleado (${empleadoEditando.nombre})` : "👤 Registrar Nuevo Empleado en Base de Datos"} 
        abierto={modalAbierto} 
        onClose={() => setModalAbierto(false)}
      >
        <form onSubmit={handleGuardarEmpleado}>
          {errorMsg && <div style={{ padding: '10px', background: 'rgba(239,68,68,0.15)', color: '#fca5a5', borderRadius: '8px', marginBottom: '12px', fontSize: '0.85rem' }}>{errorMsg}</div>}

          <div className="input-group">
            <label className="input-label">Nombre Completo del Empleado *</label>
            <input 
              type="text" 
              className="input-field" 
              required
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              placeholder="Ej. Pedro Gómez Molina"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="input-group">
              <label className="input-label">Cargo / Rol en Obra</label>
              <select 
                className="input-field"
                value={form.cargo}
                onChange={(e) => setForm({ ...form, cargo: e.target.value })}
              >
                <option value="Oficial de Carpintería">Oficial de Carpintería / Montaje</option>
                <option value="Ayudante de Obra">Ayudante de Obra</option>
                <option value="Jefe de Taller">Jefe de Taller / Supervisión</option>
                <option value="Maestro de Obra">Maestro General de Obra</option>
                <option value="Asistente Comercial">Asistente Comercial / Cotizaciones</option>
                <option value="Conductor / Acarreos">Conductor / Acarreos</option>
              </select>
            </div>

            <div className="input-group">
              <label className="input-label">Cédula de Ciudadanía (DIAN/CC)</label>
              <input 
                type="text" 
                className="input-field" 
                value={form.cedula}
                onChange={(e) => setForm({ ...form, cedula: e.target.value })}
                placeholder="Ej. 1.098.765.432"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="input-group">
              <label className="input-label">Teléfono de Contacto</label>
              <input 
                type="text" 
                className="input-field" 
                value={form.telefono}
                onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                placeholder="+57 310 123 4567"
              />
            </div>

            <div className="input-group">
              <label className="input-label">Correo Electrónico</label>
              <input 
                type="email" 
                className="input-field" 
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="pedro.gomez@empresa.com"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="input-group">
              <label className="input-label">Tarifa Jornal / Día ($ COP)</label>
              <input 
                type="number" 
                className="input-field" 
                value={form.tarifaDiaria}
                onChange={(e) => setForm({ ...form, tarifaDiaria: e.target.value })}
                placeholder="Ej. 80000"
              />
            </div>

            <div className="input-group">
              <label className="input-label">Salario Mensual ($ COP)</label>
              <input 
                type="number" 
                className="input-field" 
                value={form.salarioMensual}
                onChange={(e) => setForm({ ...form, salarioMensual: e.target.value })}
                placeholder="Ej. 2000000"
              />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Observaciones / Detalles</label>
            <textarea 
              className="input-field" 
              rows="2"
              value={form.observaciones}
              onChange={(e) => setForm({ ...form, observaciones: e.target.value })}
              placeholder="Especialidades, nivel de experiencia, EPS o contacto de emergencia"
            />
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '20px' }}>
            <button type="button" onClick={() => setModalAbierto(false)} className="btn btn-secondary">Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={guardando}>
              {guardando ? 'Guardando...' : 'Guardar Empleado'}
            </button>
          </div>
        </form>
      </ModalForm>

      {/* MODAL CREAR CUENTA DE ACCESO APP PARA EL EMPLEADO */}
      <ModalForm titulo="🔑 Asignar Cuenta de Acceso a la App" abierto={modalAccesoAbierto} onClose={() => setModalAccesoAbierto(false)}>
        <form onSubmit={handleGuardarAccesoApp}>
          {errorMsg && <div style={{ padding: '10px', background: 'rgba(239,68,68,0.15)', color: '#fca5a5', borderRadius: '8px', marginBottom: '12px', fontSize: '0.85rem' }}>{errorMsg}</div>}

          <div className="input-group">
            <label className="input-label">Nombre del Empleado</label>
            <input type="text" className="input-field" readOnly value={formAcceso.nombre} style={{ background: 'rgba(255,255,255,0.05)' }} />
          </div>

          <div className="input-group">
            <label className="input-label">Correo Electrónico de Acceso *</label>
            <input 
              type="email" 
              className="input-field" 
              required
              value={formAcceso.email}
              onChange={(e) => setFormAcceso({ ...formAcceso, email: e.target.value })}
              placeholder="correo@empresa.com"
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
                value={formAcceso.password}
                onChange={(e) => setFormAcceso({ ...formAcceso, password: e.target.value })}
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
              >
                {mostrarPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
              Esta clave permitirá al empleado iniciar sesión en su dispositivo.
            </span>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '20px' }}>
            <button type="button" onClick={() => setModalAccesoAbierto(false)} className="btn btn-secondary">Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={guardando}>
              {guardando ? 'Creando Acceso...' : 'Crear Cuenta de Acceso'}
            </button>
          </div>
        </form>
      </ModalForm>
    </div>
  );
}
