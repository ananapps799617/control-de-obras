import React, { useState, useEffect } from 'react';
import { Plus, Search, Package, DollarSign, Layers, Trash2, Edit, Truck, CheckCircle2 } from 'lucide-react';
import { obtenerMateriales, crearMaterial, actualizarMaterial, eliminarMaterial } from '../services/materialesService';
import { obtenerProveedores } from '../services/proveedoresService';
import { obtenerComprasGlobales, marcarCompraComoImportadaAMateriales } from '../services/comprasGlobalesService';
import ModalForm from '../components/ModalForm.jsx';

// ============================================================
// BLOQUE 1: COMPONENTE VISTA DE MATERIALES E INSUMOS CON EDICIÓN
// Qué hace: Registra, busca, edita y elimina materiales de obra con precios COP y proveedores.
// Por qué: Reglas RT-01, RT-02 y especificaciones del Fundador.
// ============================================================
export default function MaterialesPage() {
  const [materiales, setMateriales] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [comprasGlobales, setComprasGlobales] = useState([]);
  const [modalImportarAbierto, setModalImportarAbierto] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [modalAbierto, setModalAbierto] = useState(false);
  const [materialEditando, setMaterialEditando] = useState(null);
  const [compraOrigenId, setCompraOrigenId] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [form, setForm] = useState({
    nombre: '',
    codigo: '',
    unidad: 'Unidad',
    precioUnitario: '',
    proveedorId: ''
  });

  const cargarDatos = async () => {
    setCargando(true);
    try {
      const [dataMateriales, dataProveedores, dataCompras] = await Promise.all([
        obtenerMateriales(),
        obtenerProveedores(),
        obtenerComprasGlobales()
      ]);

      const sortAZ = (arr, key = 'nombre') => [...arr].sort((a, b) => (a[key] || '').trim().localeCompare((b[key] || '').trim(), 'es', { sensitivity: 'base' }));

      setMateriales(sortAZ(dataMateriales, 'nombre'));
      setProveedores(sortAZ(dataProveedores, 'razonSocial'));
      setComprasGlobales(sortAZ(dataCompras, 'concepto'));
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
    setCompraOrigenId(null);
    setForm({
      nombre: '',
      codigo: '',
      unidad: 'Unidad',
      precioUnitario: '',
      proveedorId: ''
    });
    setErrorMsg('');
    setModalAbierto(true);
  };

  const handleAbrirEditar = (material) => {
    setMaterialEditando(material);
    setCompraOrigenId(null);
    setForm({
      nombre: material.nombre || '',
      codigo: material.codigo || '',
      unidad: material.unidad || 'Unidad',
      precioUnitario: material.precioUnitario !== undefined ? String(material.precioUnitario) : '',
      proveedorId: material.proveedorId || ''
    });
    setErrorMsg('');
    setModalAbierto(true);
  };

  const handleGuardar = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!form.nombre.trim()) return setErrorMsg('El nombre del material es obligatorio');

    setGuardando(true);
    try {
      if (materialEditando) {
        await actualizarMaterial(materialEditando.id, form);
      } else {
        await crearMaterial(form);
        if (compraOrigenId) {
          await marcarCompraComoImportadaAMateriales(compraOrigenId);
        }
      }

      setForm({ nombre: '', codigo: '', unidad: 'Unidad', precioUnitario: '', proveedorId: '' });
      setMaterialEditando(null);
      setCompraOrigenId(null);
      setModalAbierto(false);
      await cargarDatos();
    } catch (err) {
      setErrorMsg(err.message || 'Error al guardar en Firebase');
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminar = async (id) => {
    if (window.confirm('¿Seguro que deseas eliminar este material?')) {
      await eliminarMaterial(id);
      await cargarDatos();
    }
  };

  const filtrados = materiales.filter(m => 
    m.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
    m.codigo?.toLowerCase().includes(busqueda.toLowerCase())
  );

  // Filtro Inteligente Anti-Duplicados: Excluye compras ya importadas, de rubros no materiales (Viáticos, Transporte) o que coincidan con materiales existentes
  const comprasImportables = comprasGlobales.filter(c => {
    if (c.importadoAMateriales) return false;
    // Solo compras con categoría 'Materiales' son elegibles para el catálogo de materiales
    if (c.categoria && c.categoria !== 'Materiales') return false;
    const conceptoNorm = (c.concepto || '').trim().toLowerCase();
    const existeEnCatalogo = materiales.some(m => (m.nombre || '').trim().toLowerCase() === conceptoNorm);
    return !existeEnCatalogo;
  });

  const handleImportarCompraAMaterial = (compra) => {
    const cant = Number(compra.cantidad) || 1;
    const pu = Number(compra.precioUnitario) || (Number(compra.monto) / cant);

    setMaterialEditando(null);
    setCompraOrigenId(compra.id);
    setForm({
      nombre: compra.concepto || 'Insumo Comprado',
      codigo: `MAT-IMP-${Math.floor(1000 + Math.random() * 9000)}`,
      unidad: compra.unidad || 'Unidad',
      precioUnitario: String(pu),
      proveedorId: compra.proveedorId || ''
    });
    setModalImportarAbierto(false);
    setModalAbierto(true);
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
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0 }}>Catálogo de Materiales e Insumos</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
            Base de datos unificada de materias primas con precios por proveedor para creador de ítems y presupuesto.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button onClick={() => setModalImportarAbierto(true)} className="btn btn-secondary" style={{ background: 'rgba(139,92,246,0.15)', color: '#c084fc', border: '1px solid rgba(139,92,246,0.4)', gap: '6px' }}>
            <Truck size={18} /> 📥 Importar desde Compras
          </button>
          <button onClick={handleAbrirCrear} className="btn btn-primary">
            <Plus size={18} /> Crear Material / Insumo
          </button>
        </div>
      </div>

      <div style={{ position: 'relative', marginBottom: '20px' }}>
        <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '14px' }} />
        <input 
          type="text" 
          placeholder="Buscar por código o nombre del material..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="input-field"
          style={{ paddingLeft: '42px' }}
        />
      </div>

      {cargando ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
          Cargando catálogo desde Firestore...
        </div>
      ) : filtrados.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
          No se encontraron materiales registrados. Haz clic en <strong>Nuevo Material</strong> para comenzar.
        </div>
      ) : (
        <div className="grid-cards">
          {filtrados.map(m => {
            const proveedorAsignado = proveedores.find(p => p.id === m.proveedorId);
            return (
              <div key={m.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 600, margin: 0 }}>{m.nombre}</h3>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '6px' }}>
                      {m.codigo && (
                        <span className="badge badge-info">CÓD: {m.codigo}</span>
                      )}
                      {proveedorAsignado && (
                        <span className="badge badge-warning">
                          🚚 {proveedorAsignado.razonSocial || proveedorAsignado.nombre}
                        </span>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button 
                      onClick={() => handleAbrirEditar(m)} 
                      className="btn btn-secondary"
                      style={{ minHeight: '34px', padding: '0 10px', fontSize: '0.8rem', gap: '4px' }}
                      title="Editar Material"
                    >
                      <Edit size={15} color="#38bdf8" /> Editar
                    </button>
                    <button 
                      onClick={() => handleEliminar(m.id)} 
                      className="btn btn-danger"
                      style={{ minHeight: '34px', width: '34px', padding: 0 }}
                      title="Eliminar"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div style={{ 
                  background: 'rgba(15,23,42,0.5)', 
                  padding: '10px 14px', 
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center' 
                }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>PRECIO UNITARIO</span>
                    <strong style={{ color: '#34d399', fontSize: '1.1rem', fontFamily: 'var(--font-mono)' }}>
                      ${Number(m.precioUnitario || 0).toLocaleString()} COP / {m.unidad}
                    </strong>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ModalForm 
        titulo={materialEditando ? `Editar Material (${materialEditando.nombre})` : "Registrar Nuevo Material / Insumo"} 
        abierto={modalAbierto} 
        onClose={() => {
          setModalAbierto(false);
          setMaterialEditando(null);
        }}
      >
        <form onSubmit={handleGuardar}>
          {errorMsg && (
            <div style={{ padding: '10px', background: 'rgba(239,68,68,0.15)', color: '#fca5a5', borderRadius: '8px', marginBottom: '12px', fontSize: '0.85rem' }}>
              {errorMsg}
            </div>
          )}

          <div className="input-group">
            <label className="input-label">Nombre del Material / Insumo *</label>
            <input 
              type="text" 
              className="input-field" 
              required
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              placeholder="Ej. Cemento Portland 50kg / Varilla 1/2''"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="input-group">
              <label className="input-label">Código SKU / Referencia</label>
              <input 
                type="text" 
                className="input-field" 
                value={form.codigo}
                onChange={(e) => setForm({ ...form, codigo: e.target.value })}
                placeholder="Ej. CEM-50KG"
              />
            </div>
            <div className="input-group">
              <label className="input-label">Unidad de Medida</label>
              <select 
                className="input-field"
                value={form.unidad}
                onChange={(e) => setForm({ ...form, unidad: e.target.value })}
              >
                <option value="Saco / Bulto">Saco / Bulto</option>
                <option value="Unidad">Unidad (ud)</option>
                <option value="m²">Metro cuadrado (m²)</option>
                <option value="m³">Metro cúbico (m³)</option>
                <option value="m.l.">Metro lineal (m.l.)</option>
                <option value="Kg">Kilogramo (kg)</option>
                <option value="Ton">Tonelada (ton)</option>
                <option value="Galón">Galón (gl)</option>
                <option value="Cuñete">Cuñete</option>
                <option value="Viaje">Viaje (M3)</option>
              </select>
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Precio Unitario ($ COP) *</label>
            <input 
              type="number" 
              className="input-field" 
              required
              value={form.precioUnitario}
              onChange={(e) => setForm({ ...form, precioUnitario: e.target.value })}
              placeholder="Ej. 38000"
            />
          </div>

          <div className="input-group">
            <label className="input-label">Proveedor Asignado (Opcional)</label>
            <select 
              className="input-field"
              value={form.proveedorId}
              onChange={(e) => setForm({ ...form, proveedorId: e.target.value })}
            >
              <option value="">-- Seleccionar Proveedor Habitual --</option>
              {proveedores.map(p => (
                <option key={p.id} value={p.id}>{p.razonSocial || p.nombre}</option>
              ))}
            </select>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Permitirá generar automáticamente la Lista de Compras por Proveedor en el futuro.
            </span>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '20px' }}>
            <button 
              type="button" 
              onClick={() => {
                setModalAbierto(false);
                setMaterialEditando(null);
              }} 
              className="btn btn-secondary"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={guardando}
            >
              {guardando ? 'Guardando en Firebase...' : (materialEditando ? 'Guardar Cambios' : 'Guardar Material')}
            </button>
          </div>
        </form>
      </ModalForm>

      {/* Modal Seleccionar Compra para Importar a Materiales */}
      <ModalForm titulo="📥 Importar Insumo desde Registro de Compras" abierto={modalImportarAbierto} onClose={() => setModalImportarAbierto(false)}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '60vh', overflowY: 'auto' }}>
          {comprasImportables.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>
              No hay compras nuevas pendientes por importar. (Los insumos importados o existentes ya fueron filtrados).
            </div>
          ) : (
            comprasImportables.map(c => {
              const cant = Number(c.cantidad) || 1;
              const pu = Number(c.precioUnitario) || (Number(c.monto) / cant);

              return (
                <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(15,23,42,0.6)', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div>
                    <strong style={{ fontSize: '0.9rem', color: '#c084fc', display: 'block' }}>{c.concepto}</strong>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      📅 {c.fecha} • 📏 {c.unidad || 'Unid'} • P.Unit: <strong style={{ color: '#34d399' }}>${Number(pu).toLocaleString()} COP</strong> (Cant: {cant})
                    </span>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => handleImportarCompraAMaterial(c)}
                    className="btn btn-primary"
                    style={{ padding: '6px 12px', fontSize: '0.78rem', background: '#8b5cf6' }}
                  >
                    📥 Convertir en Material
                  </button>
                </div>
              );
            })
          )}
        </div>
      </ModalForm>
    </div>
  );
}
