import React, { useState, useEffect } from 'react';
import { Plus, Search, User, Phone, Mail, MapPin, Trash2, Building, FileText, Navigation } from 'lucide-react';
import { obtenerClientes, crearCliente, eliminarCliente } from '../services/clientesService';
import ModalForm from '../components/ModalForm.jsx';

// ============================================================
// BLOQUE 1: COMPONENTE VISTA DE CLIENTES DINÁMICO
// Qué hace: Permite listar y crear clientes (Persona Natural vs Empresa).
// Por qué: Adaptación a personas naturales con Cédula, expedición y residencia.
// ============================================================
export default function ClientesPage() {
  const [clientes, setClientes] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [modalAbierto, setModalAbierto] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [form, setForm] = useState({
    tipoCliente: 'Persona Natural',
    nombre: '',
    aliasCarpeta: '',
    numeroDocumento: '',
    lugarExpedicion: '',
    lugarResidencia: '',
    direccionResidencia: '',
    telefono: '',
    email: ''
  });

  const cargarDatos = async () => {
    setCargando(true);
    try {
      const data = await obtenerClientes();
      const sortAZ = (arr, key = 'nombre') => [...arr].sort((a, b) => (a[key] || '').trim().localeCompare((b[key] || '').trim(), 'es', { sensitivity: 'base' }));
      setClientes(sortAZ(data, 'nombre'));
    } catch (err) {
      console.error(err);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const handleGuardar = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!form.nombre.trim()) return setErrorMsg('El nombre o razón social es obligatorio');
    if (!form.aliasCarpeta.trim()) return setErrorMsg('El Alias de Carpeta Drive es obligatorio');

    setGuardando(true);
    try {
      await crearCliente(form);
      setForm({ 
        tipoCliente: 'Persona Natural',
        nombre: '', 
        aliasCarpeta: '', 
        numeroDocumento: '', 
        lugarExpedicion: '',
        lugarResidencia: '',
        direccionResidencia: '',
        telefono: '', 
        email: '' 
      });
      setModalAbierto(false);
      await cargarDatos();
    } catch (err) {
      setErrorMsg(err.message || 'Error al guardar en Firebase');
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminar = async (id) => {
    if (window.confirm('¿Seguro que deseas eliminar este cliente de Firestore?')) {
      await eliminarCliente(id);
      await cargarDatos();
    }
  };

  const filtrados = clientes.filter(c => 
    c.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
    c.numeroDocumento?.toLowerCase().includes(busqueda.toLowerCase()) ||
    c.rutId?.toLowerCase().includes(busqueda.toLowerCase()) ||
    c.lugarResidencia?.toLowerCase().includes(busqueda.toLowerCase())
  );

  const getWhatsAppUrl = (telefono) => {
    if (!telefono) return null;
    const numLimpio = String(telefono).replace(/\D/g, '');
    if (!numLimpio) return null;
    const numFinal = numLimpio.length === 10 ? '57' + numLimpio : numLimpio;
    return `https://wa.me/${numFinal}`;
  };

  return (
    <div>
      {/* Cabecera de la sección */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        marginBottom: '20px'
      }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0 }}>Gestión de Clientes</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
            Directorio de personas naturales y empresas registradas.
          </p>
        </div>
        <button onClick={() => setModalAbierto(true)} className="btn btn-primary">
          <Plus size={18} /> Nuevo Cliente
        </button>
      </div>

      {/* Barra de búsqueda */}
      <div style={{ position: 'relative', marginBottom: '20px' }}>
        <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '14px' }} />
        <input 
          type="text" 
          placeholder="Buscar por nombre, cédula/NIT o residencia..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="input-field"
          style={{ paddingLeft: '42px' }}
        />
      </div>

      {/* Lista de Clientes */}
      {cargando ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
          Cargando clientes desde Firestore...
        </div>
      ) : filtrados.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
          No hay clientes registrados aún o no coinciden con la búsqueda.
        </div>
      ) : (
        <div className="grid-cards">
          {filtrados.map(c => {
            const esPersona = (c.tipoCliente || 'Persona Natural') === 'Persona Natural';
            const numDoc = c.numeroDocumento || c.rutId;
            const waUrl = getWhatsAppUrl(c.telefono);

            return (
              <div key={c.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 600, margin: 0, color: 'var(--text-main)' }}>
                      {c.nombre}
                    </h3>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '6px' }}>
                      <span className={`badge ${esPersona ? 'badge-info' : 'badge-warning'}`}>
                        {esPersona ? '👤 Persona Natural' : '🏢 Empresa'}
                      </span>
                      {numDoc && (
                        <span className="badge badge-secondary" style={{ background: 'rgba(255,255,255,0.08)' }}>
                          {esPersona ? 'CC' : 'NIT/RUT'}: {numDoc}
                        </span>
                      )}
                      {c.aliasCarpeta && (
                        <span className="badge badge-success">📁 Drive: /{c.aliasCarpeta}</span>
                      )}
                    </div>
                  </div>
                  <button 
                    onClick={() => handleEliminar(c.id)} 
                    className="btn btn-danger"
                    style={{ minHeight: '34px', width: '34px', padding: 0 }}
                    title="Eliminar"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                  {esPersona && c.lugarExpedicion && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <FileText size={14} color="var(--color-primary)" /> 
                      <span>Expedición Cédula: <strong>{c.lugarExpedicion}</strong></span>
                    </div>
                  )}
                  {c.lugarResidencia && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Navigation size={14} color="var(--color-primary)" /> 
                      <span>Lugar Residencia: <strong>{c.lugarResidencia}</strong></span>
                    </div>
                  )}
                  {(c.direccionResidencia || c.direccion) && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <MapPin size={14} color="var(--color-primary)" /> 
                      <span>Dirección: <strong>{c.direccionResidencia || c.direccion}</strong></span>
                    </div>
                  )}
                  {c.telefono && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Phone size={14} color="var(--color-primary)" /> {c.telefono}
                      </div>
                      {waUrl && (
                        <a 
                          href={waUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="btn"
                          style={{
                            padding: '3px 9px',
                            minHeight: '28px',
                            fontSize: '0.78rem',
                            gap: '4px',
                            background: 'rgba(37, 211, 102, 0.15)',
                            color: '#25D366',
                            border: '1px solid rgba(37, 211, 102, 0.35)',
                            fontWeight: 600,
                            textDecoration: 'none',
                            borderRadius: 'var(--radius-md)'
                          }}
                          title="Abrir chat de WhatsApp con el cliente"
                        >
                          💬 WhatsApp
                        </a>
                      )}
                    </div>
                  )}
                  {c.email && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Mail size={14} color="var(--color-primary)" /> {c.email}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal para Crear Cliente */}
      <ModalForm 
        titulo="Registrar Nuevo Cliente" 
        abierto={modalAbierto} 
        onClose={() => setModalAbierto(false)}
      >
        <form onSubmit={handleGuardar}>
          {errorMsg && (
            <div style={{ padding: '10px', background: 'rgba(239,68,68,0.15)', color: '#fca5a5', borderRadius: '8px', marginBottom: '12px', fontSize: '0.85rem' }}>
              {errorMsg}
            </div>
          )}

          {/* Selector de Tipo de Cliente */}
          <div className="input-group">
            <label className="input-label">Tipo de Cliente *</label>
            <div style={{ display: 'flex', gap: '12px', marginTop: '4px' }}>
              <button
                type="button"
                className={`btn ${form.tipoCliente === 'Persona Natural' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ flex: 1, minHeight: '40px', fontSize: '0.88rem' }}
                onClick={() => setForm({ ...form, tipoCliente: 'Persona Natural' })}
              >
                👤 Persona Natural
              </button>
              <button
                type="button"
                className={`btn ${form.tipoCliente === 'Empresa' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ flex: 1, minHeight: '40px', fontSize: '0.88rem' }}
                onClick={() => setForm({ ...form, tipoCliente: 'Empresa' })}
              >
                🏢 Empresa
              </button>
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">
              {form.tipoCliente === 'Persona Natural' ? 'Nombre Completo del Cliente *' : 'Razón Social / Nombre de la Empresa *'}
            </label>
            <input 
              type="text" 
              className="input-field" 
              required
              value={form.nombre}
              onChange={(e) => {
                const nombreVal = e.target.value;
                setForm({ 
                  ...form, 
                  nombre: nombreVal,
                  aliasCarpeta: form.aliasCarpeta === '' || form.aliasCarpeta === form.nombre.toUpperCase().replace(/\s+/g, '_')
                    ? nombreVal.toUpperCase().replace(/\s+/g, '_')
                    : form.aliasCarpeta
                });
              }}
              placeholder={form.tipoCliente === 'Persona Natural' ? 'Ej. Juan Carlos Pérez' : 'Ej. Inmobiliaria Sur SpA'}
            />
          </div>

          <div className="input-group">
            <label className="input-label">Alias de Carpeta Drive (para organizar en la nube) *</label>
            <input 
              type="text" 
              className="input-field" 
              required
              value={form.aliasCarpeta}
              onChange={(e) => setForm({ ...form, aliasCarpeta: e.target.value.toUpperCase().replace(/\s+/g, '_') })}
              placeholder="Ej. JUAN_PEREZ"
            />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Se creará la carpeta <code>/{form.aliasCarpeta || 'ALIAS'}</code> en Google Drive.
            </span>
          </div>

          {/* Documento de Identificación Adaptativo */}
          {form.tipoCliente === 'Persona Natural' ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="input-group">
                <label className="input-label">Cédula de Ciudadanía</label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={form.numeroDocumento}
                  onChange={(e) => setForm({ ...form, numeroDocumento: e.target.value })}
                  placeholder="Ej. 1.098.765.432"
                />
              </div>
              <div className="input-group">
                <label className="input-label">Lugar de Expedición</label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={form.lugarExpedicion}
                  onChange={(e) => setForm({ ...form, lugarExpedicion: e.target.value })}
                  placeholder="Ej. Bogotá / Santiago"
                />
              </div>
            </div>
          ) : (
            <div className="input-group">
              <label className="input-label">NIT / RUT de la Empresa</label>
              <input 
                type="text" 
                className="input-field" 
                value={form.numeroDocumento}
                onChange={(e) => setForm({ ...form, numeroDocumento: e.target.value })}
                placeholder="Ej. 900.123.456-1"
              />
            </div>
          )}

          {/* Ubicación de Residencia Separada */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="input-group">
              <label className="input-label">Lugar de Residencia</label>
              <input 
                type="text" 
                className="input-field" 
                value={form.lugarResidencia}
                onChange={(e) => setForm({ ...form, lugarResidencia: e.target.value })}
                placeholder="Ej. Ciudad / Sector"
              />
            </div>
            <div className="input-group">
              <label className="input-label">Dirección de Residencia</label>
              <input 
                type="text" 
                className="input-field" 
                value={form.direccionResidencia}
                onChange={(e) => setForm({ ...form, direccionResidencia: e.target.value })}
                placeholder="Ej. Calle 123 # 45-67"
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
                placeholder="+57 300 123 4567"
              />
            </div>
            <div className="input-group">
              <label className="input-label">Correo Electrónico</label>
              <input 
                type="email" 
                className="input-field" 
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="cliente@correo.com"
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '20px' }}>
            <button 
              type="button" 
              onClick={() => setModalAbierto(false)} 
              className="btn btn-secondary"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={guardando}
            >
              {guardando ? 'Guardando en Firebase...' : 'Guardar Cliente'}
            </button>
          </div>
        </form>
      </ModalForm>
    </div>
  );
}
