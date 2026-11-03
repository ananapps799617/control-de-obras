// ============================================================
// BLOQUE 1: IMPORTACIONES Y DEPENDENCIAS
// Qué hace: Gestión de inventario de herramientas, maquinaria y consumibles de taller.
// Por qué: Arquitectura Feature-Driven y Regla 2.2 Manual Maestro.
// ============================================================
import React, { useState, useEffect } from 'react';
import { Wrench, Plus, Trash2, Edit, Search } from 'lucide-react';
import { obtenerHerramientas, crearHerramienta, actualizarHerramienta, eliminarHerramienta, IHerramienta } from '../../../services/herramientasService';
import ModalForm from '../../../components/ModalForm.jsx';

// ============================================================
// BLOQUE 2: COMPONENTE PRINCIPAL — INVENTARIO DE HERRAMIENTAS
// ============================================================
export default function HerramientasPage() {
  const [herramientas, setHerramientas] = useState<IHerramienta[]>([]);
  const [busqueda, setBusqueda] = useState<string>('');
  const [filtroEstado, setFiltroEstado] = useState<string>('TODOS');
  const [modalAbierto, setModalAbierto] = useState<boolean>(false);
  const [herramientaEditando, setHerramientaEditando] = useState<IHerramienta | null>(null);
  const [cargando, setCargando] = useState<boolean>(true);
  const [guardando, setGuardando] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const [form, setForm] = useState<any>({
    nombre: '',
    categoria: 'Herramienta Eléctrica',
    cantidad: 1,
    precioEstimado: '',
    estado: '🟢 Operativo / Listo',
    ubicacion: 'Taller Principal'
  });

  const cargarDatos = async () => {
    setCargando(true);
    try {
      const data = await obtenerHerramientas();
      setHerramientas(data);
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
    setHerramientaEditando(null);
    setForm({
      nombre: '',
      categoria: 'Herramienta Eléctrica',
      cantidad: 1,
      precioEstimado: '',
      estado: '🟢 Operativo / Listo',
      ubicacion: 'Taller Principal'
    });
    setErrorMsg('');
    setModalAbierto(true);
  };

  const handleAbrirEditar = (h: IHerramienta) => {
    setHerramientaEditando(h);
    setForm({
      nombre: h.nombre,
      categoria: h.categoria || 'Herramienta Eléctrica',
      cantidad: h.cantidad || 1,
      precioEstimado: h.precioEstimado || '',
      estado: h.estado || '🟢 Operativo / Listo',
      ubicacion: h.ubicacion || 'Taller Principal'
    });
    setErrorMsg('');
    setModalAbierto(true);
  };

  const handleGuardar = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form.nombre.trim()) return setErrorMsg('El nombre es obligatorio');
    setGuardando(true);
    try {
      const payload = {
        nombre: form.nombre,
        categoria: form.categoria,
        cantidad: Number(form.cantidad || 1),
        precioEstimado: Number(form.precioEstimado || 0),
        estado: form.estado,
        ubicacion: form.ubicacion
      };

      if (herramientaEditando && herramientaEditando.id) {
        await actualizarHerramienta(herramientaEditando.id, payload);
      } else {
        await crearHerramienta(payload);
      }
      setModalAbierto(false);
      await cargarDatos();
    } catch (err: unknown) {
      const error = err as Error;
      setErrorMsg(error.message || 'Error al guardar herramienta');
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminar = async (id?: string, nombre?: string) => {
    if (!id) return;
    if (window.confirm(`¿Eliminar la herramienta "${nombre}"?`)) {
      await eliminarHerramienta(id);
      await cargarDatos();
    }
  };

  const herramientasFiltradas = herramientas.filter(h => {
    const coincideTexto = (h.nombre || '').toLowerCase().includes(busqueda.toLowerCase()) ||
                          (h.categoria || '').toLowerCase().includes(busqueda.toLowerCase());
    const coincideEstado = filtroEstado === 'TODOS' || h.estado === filtroEstado;
    return coincideTexto && coincideEstado;
  });

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Encabezado */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Wrench size={24} color="#38bdf8" />
            <span>Inventario de Herramientas & Equipos</span>
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '4px' }}>
            Control de activos fijos de taller, brocas, fresas, discos y estado de mantenimiento
          </p>
        </div>

        <button onClick={handleAbrirCrear} className="btn btn-primary" style={{ gap: '8px' }}>
          <Plus size={18} /> + Nueva Herramienta
        </button>
      </div>

      {/* Filtros y Buscador */}
      <div className="card" style={{ padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: '220px' }}>
          <Search size={18} color="#94a3b8" />
          <input
            type="text"
            className="input"
            placeholder="Buscar por nombre o tipo..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            style={{ width: '100%', background: 'transparent', border: 'none' }}
          />
        </div>
        <select
          className="input"
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
          style={{ minWidth: '180px', fontSize: '0.82rem' }}
        >
          <option value="TODOS">Todos los Estados</option>
          <option value="🟢 Operativo / Listo">🟢 Operativo / Listo</option>
          <option value="🟡 En Mantenimiento">🟡 En Mantenimiento</option>
          <option value="🔴 Requiere Reemplazo">🔴 Requiere Reemplazo</option>
        </select>
      </div>

      {/* Tabla de Herramientas */}
      <div className="card" style={{ padding: '16px', overflowX: 'auto' }}>
        <table className="table" style={{ width: '100%', fontSize: '0.85rem' }}>
          <thead>
            <tr>
              <th>Nombre de la Herramienta / Equipo</th>
              <th>Categoría</th>
              <th style={{ textAlign: 'center' }}>Cant.</th>
              <th>Estado Operativo</th>
              <th>Ubicación</th>
              <th style={{ width: '90px', textAlign: 'center' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {cargando ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '30px' }}>Cargando inventario...</td></tr>
            ) : herramientasFiltradas.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>No se encontraron herramientas.</td></tr>
            ) : (
              herramientasFiltradas.map(h => (
                <tr key={h.id}>
                  <td><strong>{h.nombre}</strong></td>
                  <td><span className="badge badge-secondary">{h.categoria}</span></td>
                  <td style={{ textAlign: 'center', fontWeight: 600 }}>{h.cantidad}</td>
                  <td><span className="badge badge-primary">{h.estado}</span></td>
                  <td style={{ color: '#94a3b8' }}>{h.ubicacion || 'Taller'}</td>
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '6px' }}>
                      <button onClick={() => handleAbrirEditar(h)} className="btn btn-secondary" style={{ padding: '4px 6px' }}>
                        <Edit size={13} />
                      </button>
                      <button onClick={() => handleEliminar(h.id, h.nombre)} className="btn btn-secondary" style={{ padding: '4px 6px', color: '#f87171' }}>
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Form */}
      <ModalForm
        abierto={modalAbierto}
        onClose={() => setModalAbierto(false)}
        titulo={herramientaEditando ? 'Editar Herramienta' : 'Nueva Herramienta / Equipo'}
        maxWidth="500px"
      >
        {errorMsg && (
          <div style={{ background: 'rgba(239,68,68,0.15)', color: '#fca5a5', padding: '10px 14px', borderRadius: '8px', marginBottom: '14px', fontSize: '0.85rem' }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleGuardar} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', color: '#94a3b8', marginBottom: '4px' }}>Nombre del Equipo / Herramienta *</label>
            <input type="text" required className="input" placeholder="Ej: Ruteadora Makita 1/2" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} style={{ width: '100%' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', color: '#94a3b8', marginBottom: '4px' }}>Categoría</label>
              <select className="input" value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })} style={{ width: '100%' }}>
                <option value="Herramienta Eléctrica">Herramienta Eléctrica</option>
                <option value="Herramienta Manual">Herramienta Manual</option>
                <option value="Consumible Taller">Consumible Taller</option>
                <option value="Equipo de Medición">Equipo de Medición</option>
                <option value="Maquinaria">Maquinaria</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', color: '#94a3b8', marginBottom: '4px' }}>Cantidad</label>
              <input type="number" min="1" className="input" value={form.cantidad} onChange={(e) => setForm({ ...form, cantidad: e.target.value })} style={{ width: '100%' }} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', color: '#94a3b8', marginBottom: '4px' }}>Estado Operativo</label>
              <select className="input" value={form.estado} onChange={(e) => setForm({ ...form, estado: e.target.value })} style={{ width: '100%' }}>
                <option value="🟢 Operativo / Listo">🟢 Operativo / Listo</option>
                <option value="🟡 En Mantenimiento">🟡 En Mantenimiento</option>
                <option value="🔴 Requiere Reemplazo">🔴 Requiere Reemplazo</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', color: '#94a3b8', marginBottom: '4px' }}>Ubicación</label>
              <input type="text" className="input" placeholder="Taller Principal" value={form.ubicacion} onChange={(e) => setForm({ ...form, ubicacion: e.target.value })} style={{ width: '100%' }} />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setModalAbierto(false)}>Cancelar</button>
            <button type="submit" disabled={guardando} className="btn btn-primary">
              {guardando ? 'Guardando...' : 'Guardar Herramienta'}
            </button>
          </div>
        </form>
      </ModalForm>
    </div>
  );
}
