// ============================================================
// BLOQUE 1: IMPORTACIONES Y DEPENDENCIAS
// Qué hace: Catálogo de materiales e insumos de taller con precios y proveedores.
// Por qué: Arquitectura Feature-Driven y Regla 2.2 Manual Maestro.
// ============================================================
import React, { useState, useEffect } from 'react';
import { Plus, Search, Package, Trash2, Edit } from 'lucide-react';
import { obtenerMateriales, crearMaterial, actualizarMaterial, eliminarMaterial, IMaterial } from '../../../services/materialesService';
import { obtenerProveedores } from '../../../services/proveedoresService';
import ModalForm from '../../../components/ModalForm.jsx';
import type { IProveedor } from '../../../types/proveedor';

// ============================================================
// BLOQUE 2: COMPONENTE PRINCIPAL — CATÁLOGO DE MATERIALES
// ============================================================
export default function MaterialesPage() {
  const [materiales, setMateriales] = useState<IMaterial[]>([]);
  const [proveedores, setProveedores] = useState<IProveedor[]>([]);
  const [busqueda, setBusqueda] = useState<string>('');
  const [modalAbierto, setModalAbierto] = useState<boolean>(false);
  const [materialEditando, setMaterialEditando] = useState<IMaterial | null>(null);
  const [cargando, setCargando] = useState<boolean>(true);
  const [guardando, setGuardando] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const [form, setForm] = useState<any>({
    nombre: '',
    categoria: 'Tableros / Melaminas',
    unidad: 'Unidad',
    precioUnitario: '',
    proveedorId: ''
  });

  const cargarDatos = async () => {
    setCargando(true);
    try {
      const [dataMateriales, dataProveedores] = await Promise.all([
        obtenerMateriales(),
        obtenerProveedores()
      ]);
      setMateriales(dataMateriales);
      setProveedores(dataProveedores);
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
    setMaterialEditando(null);
    setForm({
      nombre: '',
      categoria: 'Tableros / Melaminas',
      unidad: 'Unidad',
      precioUnitario: '',
      proveedorId: ''
    });
    setErrorMsg('');
    setModalAbierto(true);
  };

  const handleAbrirEditar = (m: IMaterial) => {
    setMaterialEditando(m);
    setForm({
      nombre: m.nombre,
      categoria: m.categoria || 'Tableros / Melaminas',
      unidad: m.unidad || 'Unidad',
      precioUnitario: m.precioUnitario,
      proveedorId: m.proveedorId || ''
    });
    setErrorMsg('');
    setModalAbierto(true);
  };

  const handleGuardar = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form.nombre.trim()) return setErrorMsg('El nombre es obligatorio');
    setGuardando(true);
    try {
      const prov = proveedores.find(p => p.id === form.proveedorId);
      const payload = {
        nombre: form.nombre,
        categoria: form.categoria,
        unidad: form.unidad,
        precioUnitario: Number(form.precioUnitario || 0),
        proveedorId: form.proveedorId,
        proveedorNombre: prov?.razonSocial || ''
      };

      if (materialEditando && materialEditando.id) {
        await actualizarMaterial(materialEditando.id, payload);
      } else {
        await crearMaterial(payload);
      }
      setModalAbierto(false);
      await cargarDatos();
    } catch (err: unknown) {
      const error = err as Error;
      setErrorMsg(error.message || 'Error al guardar material');
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminar = async (id?: string, nombre?: string) => {
    if (!id) return;
    if (window.confirm(`¿Eliminar el material "${nombre}"?`)) {
      await eliminarMaterial(id);
      await cargarDatos();
    }
  };

  const materialesFiltrados = materiales.filter(m =>
    (m.nombre || '').toLowerCase().includes(busqueda.toLowerCase()) ||
    (m.categoria || '').toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Encabezado */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Package size={24} color="#38bdf8" />
            <span>Catálogo de Materiales & Insumos</span>
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '4px' }}>
            Precios unitarios en COP y proveedores asociados para costeo de ítems
          </p>
        </div>

        <button onClick={handleAbrirCrear} className="btn btn-primary" style={{ gap: '8px' }}>
          <Plus size={18} /> + Nuevo Material
        </button>
      </div>

      {/* Buscador */}
      <div className="card" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Search size={18} color="#94a3b8" />
        <input
          type="text"
          className="input"
          placeholder="Buscar material por nombre o categoría..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          style={{ width: '100%', background: 'transparent', border: 'none' }}
        />
      </div>

      {/* Tabla de Materiales */}
      <div className="card" style={{ padding: '16px', overflowX: 'auto' }}>
        <table className="table" style={{ width: '100%', fontSize: '0.85rem' }}>
          <thead>
            <tr>
              <th>Nombre del Material</th>
              <th>Categoría</th>
              <th>Unidad</th>
              <th>Proveedor</th>
              <th style={{ textAlign: 'right' }}>Precio Unitario ($ COP)</th>
              <th style={{ width: '90px', textAlign: 'center' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {cargando ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '30px' }}>Cargando materiales...</td></tr>
            ) : materialesFiltrados.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>No se encontraron materiales.</td></tr>
            ) : (
              materialesFiltrados.map(m => (
                <tr key={m.id}>
                  <td><strong>{m.nombre}</strong></td>
                  <td><span className="badge badge-secondary">{m.categoria || 'General'}</span></td>
                  <td>{m.unidad || 'Unidad'}</td>
                  <td style={{ color: '#94a3b8' }}>{m.proveedorNombre || 'N/A'}</td>
                  <td style={{ textAlign: 'right', fontWeight: 700, color: '#38bdf8' }}>
                    ${Number(m.precioUnitario || 0).toLocaleString()}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '6px' }}>
                      <button onClick={() => handleAbrirEditar(m)} className="btn btn-secondary" style={{ padding: '4px 6px' }}>
                        <Edit size={13} />
                      </button>
                      <button onClick={() => handleEliminar(m.id, m.nombre)} className="btn btn-secondary" style={{ padding: '4px 6px', color: '#f87171' }}>
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
        titulo={materialEditando ? 'Editar Material' : 'Nuevo Material'}
        maxWidth="500px"
      >
        {errorMsg && (
          <div style={{ background: 'rgba(239,68,68,0.15)', color: '#fca5a5', padding: '10px 14px', borderRadius: '8px', marginBottom: '14px', fontSize: '0.85rem' }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleGuardar} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', color: '#94a3b8', marginBottom: '4px' }}>Nombre del Insumo *</label>
            <input type="text" required className="input" placeholder="Ej: Tablero Roble Cava 15mm" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} style={{ width: '100%' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', color: '#94a3b8', marginBottom: '4px' }}>Categoría</label>
              <select className="input" value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })} style={{ width: '100%' }}>
                <option value="Tableros / Melaminas">Tableros / Melaminas</option>
                <option value="Herrajes">Herrajes</option>
                <option value="Cantos / Tapas">Cantos / Tapas</option>
                <option value="Pegamentos / Químicos">Pegamentos / Químicos</option>
                <option value="Tornillería / Fijación">Tornillería / Fijación</option>
                <option value="Otro">Otro</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', color: '#94a3b8', marginBottom: '4px' }}>Unidad de Medida</label>
              <input type="text" className="input" placeholder="Ej: Pliego, m, Und" value={form.unidad} onChange={(e) => setForm({ ...form, unidad: e.target.value })} style={{ width: '100%' }} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', color: '#94a3b8', marginBottom: '4px' }}>Precio Unitario ($ COP) *</label>
              <input type="number" required className="input" placeholder="0" value={form.precioUnitario} onChange={(e) => setForm({ ...form, precioUnitario: e.target.value })} style={{ width: '100%', fontWeight: 700, color: '#38bdf8' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', color: '#94a3b8', marginBottom: '4px' }}>Proveedor Principal</label>
              <select className="input" value={form.proveedorId} onChange={(e) => setForm({ ...form, proveedorId: e.target.value })} style={{ width: '100%' }}>
                <option value="">-- Sin Proveedor --</option>
                {proveedores.map(p => (
                  <option key={p.id} value={p.id}>{p.razonSocial}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setModalAbierto(false)}>Cancelar</button>
            <button type="submit" disabled={guardando} className="btn btn-primary">
              {guardando ? 'Guardando...' : 'Guardar Material'}
            </button>
          </div>
        </form>
      </ModalForm>
    </div>
  );
}
