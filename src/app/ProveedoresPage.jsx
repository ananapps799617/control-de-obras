import React, { useState, useEffect } from 'react';
import { Plus, Search, Truck, Phone, Mail, MapPin, Trash2, Edit, Navigation } from 'lucide-react';
import { obtenerProveedores, crearProveedor, actualizarProveedor, eliminarProveedor } from '../services/proveedoresService';
import ModalForm from '../components/ModalForm.jsx';

// ============================================================
// BLOQUE 1: COMPONENTE VISTA DE PROVEEDORES CON EDICIÓN
// Qué hace: Registra, busca, edita y elimina proveedores con terminología colombiana.
// Por qué: Reglas RT-01 y RT-02.
// ============================================================
export default function ProveedoresPage() {
  const [proveedores, setProveedores] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [modalAbierto, setModalAbierto] = useState(false);
  const [proveedorEditando, setProveedorEditando] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [form, setForm] = useState({
    razonSocial: '',
    nit: '',
    rubro: '',
    contactoNombre: '',
    municipioDepartamento: '',
    direccionBarrio: '',
    telefono: '',
    email: ''
  });

  const cargarDatos = async () => {
    setCargando(true);
    try {
      const data = await obtenerProveedores();
      const sortAZ = (arr, key = 'razonSocial') => [...arr].sort((a, b) => (a[key] || a.nombre || '').trim().localeCompare((b[key] || b.nombre || '').trim(), 'es', { sensitivity: 'base' }));
      setProveedores(sortAZ(data, 'razonSocial'));
    } catch (err) {
      console.error(err);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const handleAbrirCrear = () => {
    setProveedorEditando(null);
    setForm({
      razonSocial: '',
      nit: '',
      rubro: '',
      contactoNombre: '',
      municipioDepartamento: '',
      direccionBarrio: '',
      telefono: '',
      email: ''
    });
    setErrorMsg('');
    setModalAbierto(true);
  };

  const handleAbrirEditar = (proveedor) => {
    setProveedorEditando(proveedor);
    setForm({
      razonSocial: proveedor.razonSocial || '',
      nit: proveedor.nit || proveedor.rutId || '',
      rubro: proveedor.rubro || '',
      contactoNombre: proveedor.contactoNombre || '',
      municipioDepartamento: proveedor.municipioDepartamento || proveedor.direccion || '',
      direccionBarrio: proveedor.direccionBarrio || '',
      telefono: proveedor.telefono || '',
      email: proveedor.email || ''
    });
    setErrorMsg('');
    setModalAbierto(true);
  };

  const handleGuardar = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!form.razonSocial.trim()) return setErrorMsg('La Razón Social de la Empresa es obligatoria');

    setGuardando(true);
    try {
      if (proveedorEditando) {
        // Actualizar proveedor existente en Firestore
        await actualizarProveedor(proveedorEditando.id, form);
      } else {
        // Crear nuevo proveedor en Firestore
        await crearProveedor(form);
      }

      setForm({ 
        razonSocial: '', 
        nit: '', 
        rubro: '', 
        contactoNombre: '', 
        municipioDepartamento: '',
        direccionBarrio: '',
        telefono: '', 
        email: '' 
      });
      setProveedorEditando(null);
      setModalAbierto(false);
      await cargarDatos();
    } catch (err) {
      setErrorMsg(err.message || 'Error al guardar en Firebase');
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminar = async (id) => {
    if (window.confirm('¿Seguro que deseas eliminar este proveedor de Firestore?')) {
      await eliminarProveedor(id);
      await cargarDatos();
    }
  };

  const filtrados = proveedores.filter(p => 
    p.razonSocial?.toLowerCase().includes(busqueda.toLowerCase()) ||
    p.rubro?.toLowerCase().includes(busqueda.toLowerCase()) ||
    p.nit?.toLowerCase().includes(busqueda.toLowerCase()) ||
    p.rutId?.toLowerCase().includes(busqueda.toLowerCase()) ||
    p.municipioDepartamento?.toLowerCase().includes(busqueda.toLowerCase())
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
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        marginBottom: '20px'
      }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0 }}>Directorio de Proveedores</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
            Proveedores de insumos, materiales y equipos registrados en Colombia.
          </p>
        </div>
        <button onClick={handleAbrirCrear} className="btn btn-primary">
          <Plus size={18} /> Nuevo Proveedor
        </button>
      </div>

      <div style={{ position: 'relative', marginBottom: '20px' }}>
        <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '14px' }} />
        <input 
          type="text" 
          placeholder="Buscar por Razón Social, NIT, Rubro o Ciudad..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="input-field"
          style={{ paddingLeft: '42px' }}
        />
      </div>

      {cargando ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
          Cargando proveedores desde Firestore...
        </div>
      ) : filtrados.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
          No hay proveedores registrados aún. Haz clic en <strong>Nuevo Proveedor</strong> para agregar uno.
        </div>
      ) : (
        <div className="grid-cards">
          {filtrados.map(p => {
            const numeroNit = p.nit || p.rutId;
            const ubicacionTexto = p.municipioDepartamento || p.direccion;
            const waUrl = getWhatsAppUrl(p.telefono);

            return (
              <div key={p.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 600, margin: 0 }}>{p.razonSocial}</h3>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '6px' }}>
                      {numeroNit && <span className="badge badge-info">NIT: {numeroNit}</span>}
                      {p.rubro && <span className="badge badge-warning">{p.rubro}</span>}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button 
                      onClick={() => handleAbrirEditar(p)} 
                      className="btn btn-secondary"
                      style={{ minHeight: '34px', padding: '0 10px', fontSize: '0.8rem', gap: '4px' }}
                      title="Editar Proveedor"
                    >
                      <Edit size={15} color="#38bdf8" /> Editar
                    </button>
                    <button 
                      onClick={() => handleEliminar(p.id)} 
                      className="btn btn-danger"
                      style={{ minHeight: '34px', width: '34px', padding: 0 }}
                      title="Eliminar"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                  {p.contactoNombre && <div>👤 Contacto: <strong>{p.contactoNombre}</strong></div>}
                  {ubicacionTexto && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Navigation size={14} color="var(--color-primary)" /> 
                      <span>Ubicación: <strong>{ubicacionTexto}</strong></span>
                    </div>
                  )}
                  {p.direccionBarrio && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <MapPin size={14} color="var(--color-primary)" /> 
                      <span>Dirección: <strong>{p.direccionBarrio}</strong></span>
                    </div>
                  )}
                  {p.telefono && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Phone size={14} color="var(--color-primary)" /> {p.telefono}
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
                          title="Abrir chat de WhatsApp con el proveedor"
                        >
                          💬 WhatsApp
                        </a>
                      )}
                    </div>
                  )}
                  {p.email && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Mail size={14} color="var(--color-primary)" /> {p.email}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ModalForm 
        titulo={proveedorEditando ? `Editar Proveedor (${proveedorEditando.razonSocial})` : "Registrar Nuevo Proveedor (Colombia)"} 
        abierto={modalAbierto} 
        onClose={() => {
          setModalAbierto(false);
          setProveedorEditando(null);
        }}
      >
        <form onSubmit={handleGuardar}>
          {errorMsg && (
            <div style={{ padding: '10px', background: 'rgba(239,68,68,0.15)', color: '#fca5a5', borderRadius: '8px', marginBottom: '12px', fontSize: '0.85rem' }}>
              {errorMsg}
            </div>
          )}

          <div className="input-group">
            <label className="input-label">Razón Social / Empresa (S.A.S., Ltda., S.A.) *</label>
            <input 
              type="text" 
              className="input-field" 
              required
              value={form.razonSocial}
              onChange={(e) => setForm({ ...form, razonSocial: e.target.value })}
              placeholder="Ej. Materiales y Canteras del Caribe S.A.S."
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="input-group">
              <label className="input-label">NIT (DIAN)</label>
              <input 
                type="text" 
                className="input-field" 
                value={form.nit}
                onChange={(e) => setForm({ ...form, nit: e.target.value })}
                placeholder="Ej. 900.123.456-1"
              />
            </div>
            <div className="input-group">
              <label className="input-label">Rubro / Especialidad en Obra</label>
              <input 
                type="text" 
                className="input-field" 
                value={form.rubro}
                onChange={(e) => setForm({ ...form, rubro: e.target.value })}
                placeholder="Ej. Áridos, Ladrillera, Aceros"
              />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Nombre del Contacto Directo</label>
            <input 
              type="text" 
              className="input-field" 
              value={form.contactoNombre}
              onChange={(e) => setForm({ ...form, contactoNombre: e.target.value })}
              placeholder="Ej. Juan Carlos Pérez"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="input-group">
              <label className="input-label">Municipio / Departamento</label>
              <input 
                type="text" 
                className="input-field" 
                value={form.municipioDepartamento}
                onChange={(e) => setForm({ ...form, municipioDepartamento: e.target.value })}
                placeholder="Ej. Medellín / Antioquia"
              />
            </div>
            <div className="input-group">
              <label className="input-label">Dirección / Barrio / Zona</label>
              <input 
                type="text" 
                className="input-field" 
                value={form.direccionBarrio}
                onChange={(e) => setForm({ ...form, direccionBarrio: e.target.value })}
                placeholder="Ej. Zona Industrial Belén, Cra 65 # 30-10"
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
                placeholder="Ej. +57 310 123 4567"
              />
            </div>
            <div className="input-group">
              <label className="input-label">Correo Electrónico</label>
              <input 
                type="email" 
                className="input-field" 
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="ventas@proveedor.com.co"
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '20px' }}>
            <button 
              type="button" 
              onClick={() => {
                setModalAbierto(false);
                setProveedorEditando(null);
              }} 
              className="btn btn-secondary"
            >
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={guardando}>
              {guardando ? 'Guardando en Firebase...' : (proveedorEditando ? 'Guardar Cambios' : 'Guardar Proveedor')}
            </button>
          </div>
        </form>
      </ModalForm>
    </div>
  );
}
