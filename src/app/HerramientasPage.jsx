import React, { useState, useEffect } from 'react';
import { Wrench, Plus, Trash2, Edit3, ShieldAlert, CheckCircle, AlertTriangle, XCircle, Search, Hammer, Package, Truck } from 'lucide-react';
import { 
  obtenerHerramientas, 
  crearHerramienta, 
  actualizarHerramienta,
  actualizarEstadoHerramienta, 
  eliminarHerramienta 
} from '../services/herramientasService';
import { obtenerComprasGlobales, marcarCompraComoImportadaAHerramientas } from '../services/comprasGlobalesService';
import ModalForm from '../components/ModalForm.jsx';

// ============================================================
// BLOQUE 1: COMPONENTE GESTIÓN DE HERRAMIENTAS, EQUIPOS Y CONSUMIBLES DE TALLER
// Qué hace: Controla inventario, edición y estado operativo (Brocas, discos, fresas, herramientas, estado: Operativo, En Reparación, Dañado, Perdido).
// Por qué: Requerimiento del Fundador para trazabilidad y cuidado de activos de carpintería y taller.
// ============================================================
export default function HerramientasPage() {
  const [herramientas, setHerramientas] = useState([]);
  const [comprasGlobales, setComprasGlobales] = useState([]);
  const [modalImportarAbierto, setModalImportarAbierto] = useState(false);
  const [compraOrigenId, setCompraOrigenId] = useState(null);
  const [herramientaEditando, setHerramientaEditando] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('TODOS');

  // Formulario Crear / Editar Herramienta
  const [form, setForm] = useState({
    nombre: '',
    categoria: 'Consumible Taller',
    cantidad: 1,
    precioEstimado: '',
    estado: '🟢 Operativo / Listo',
    ubicacion: 'Taller Principal',
    observaciones: ''
  });

  const cargarDatos = async () => {
    setCargando(true);
    try {
      const [dataHerramientas, dataCompras] = await Promise.all([
        obtenerHerramientas(),
        obtenerComprasGlobales()
      ]);

      const sortAZ = (arr, key = 'nombre') => [...arr].sort((a, b) => (a[key] || a.concepto || '').trim().localeCompare((b[key] || b.concepto || '').trim(), 'es', { sensitivity: 'base' }));

      setHerramientas(sortAZ(dataHerramientas, 'nombre'));
      setComprasGlobales(sortAZ(dataCompras, 'concepto'));
    } catch (err) {
      console.error("Error al cargar herramientas:", err);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const handleAbrirModalNuevo = () => {
    setCompraOrigenId(null);
    setHerramientaEditando(null);
    setForm({
      nombre: '',
      categoria: 'Consumible Taller',
      cantidad: 1,
      precioEstimado: '',
      estado: '🟢 Operativo / Listo',
      ubicacion: 'Taller Principal',
      observaciones: ''
    });
    setErrorMsg('');
    setModalAbierto(true);
  };

  const handleAbrirEditar = (herramienta) => {
    setCompraOrigenId(null);
    setHerramientaEditando(herramienta);
    setForm({
      nombre: herramienta.nombre || '',
      categoria: herramienta.categoria || 'Consumible Taller',
      cantidad: herramienta.cantidad || 1,
      precioEstimado: herramienta.precioEstimado !== undefined ? String(herramienta.precioEstimado) : '',
      estado: herramienta.estado || '🟢 Operativo / Listo',
      ubicacion: herramienta.ubicacion || 'Taller Principal',
      observaciones: herramienta.observaciones || ''
    });
    setErrorMsg('');
    setModalAbierto(true);
  };

  const handleGuardar = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!form.nombre.trim()) return setErrorMsg('El nombre de la herramienta o consumible es obligatorio');

    setGuardando(true);
    try {
      if (herramientaEditando) {
        await actualizarHerramienta(herramientaEditando.id, form);
      } else {
        await crearHerramienta(form);
        if (compraOrigenId) {
          await marcarCompraComoImportadaAHerramientas(compraOrigenId);
        }
      }
      setModalAbierto(false);
      setCompraOrigenId(null);
      setHerramientaEditando(null);
      await cargarDatos();
    } catch (err) {
      setErrorMsg(err.message || 'Error al guardar la herramienta');
    } finally {
      setGuardando(false);
    }
  };

  // Filtro Inteligente Anti-Duplicados para Herramientas: Compras categoría "Herramientas / Equipos" no importadas aún
  const comprasImportablesHerramientas = comprasGlobales.filter(c => {
    if (c.importadoAHerramientas) return false;
    if (c.categoria !== 'Herramientas / Equipos') return false;
    const conceptoNorm = (c.concepto || '').trim().toLowerCase();
    const yaExisteEnInventario = herramientas.some(h => (h.nombre || '').trim().toLowerCase() === conceptoNorm);
    return !yaExisteEnInventario;
  });

  const handleImportarCompraAHerramienta = (compra) => {
    const cant = Number(compra.cantidad) || 1;
    const pu = Number(compra.precioUnitario) || (Number(compra.monto) / cant);

    setCompraOrigenId(compra.id);
    setForm({
      nombre: compra.concepto || 'Consumible / Herramienta',
      categoria: 'Consumible Taller',
      cantidad: cant,
      precioEstimado: String(pu),
      estado: '🟢 Operativo / Listo',
      ubicacion: 'Taller Principal',
      observaciones: `Importado desde Compra del ${compra.fecha}`
    });
    setModalImportarAbierto(false);
    setModalAbierto(true);
  };

  const handleCambiarEstado = async (id, nuevoEstado) => {
    const notas = prompt(`Ingrese observaciones sobre el cambio de estado a (${nuevoEstado}):`, '');
    await actualizarEstadoHerramienta(id, nuevoEstado, notas || '');
    await cargarDatos();
  };

  const handleEliminar = async (id) => {
    if (window.confirm('¿Seguro que deseas eliminar este registro del inventario de herramientas?')) {
      await eliminarHerramienta(id);
      await cargarDatos();
    }
  };

  // Filtrado de lista
  const filtradas = herramientas.filter(h => {
    const coincideNombre = h.nombre?.toLowerCase().includes(busqueda.toLowerCase()) || 
                          h.ubicacion?.toLowerCase().includes(busqueda.toLowerCase()) ||
                          h.categoria?.toLowerCase().includes(busqueda.toLowerCase());
    const coincideEstado = (filtroEstado === 'TODOS') || (h.estado === filtroEstado);
    return coincideNombre && coincideEstado;
  });

  // Métricas rápidas
  const totalHerramientasCount = herramientas.reduce((acc, h) => acc + (Number(h.cantidad) || 1), 0);
  const totalOperativas = herramientas.filter(h => h.estado.includes('Operativo')).length;
  const totalReparacion = herramientas.filter(h => h.estado.includes('Reparación')).length;
  const totalDanadas = herramientas.filter(h => h.estado.includes('Dañado') || h.estado.includes('Perdido')).length;

  const getBadgeClass = (estado) => {
    if (estado.includes('Operativo')) return 'badge-success';
    if (estado.includes('Reparación')) return 'badge-warning';
    if (estado.includes('Dañado')) return 'badge-danger';
    return 'badge-secondary';
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
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0 }}>Gestión de Herramientas, Equipos & Consumibles</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
            Control de inventario de brocas, discos, fresas y herramientas de taller con trazabilidad de estado (Reparación, Dañado, Listo).
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button onClick={() => setModalImportarAbierto(true)} className="btn btn-secondary" style={{ background: 'rgba(139,92,246,0.15)', color: '#c084fc', border: '1px solid rgba(139,92,246,0.4)', gap: '6px' }}>
            <Truck size={18} /> 📥 Importar desde Compras
          </button>
          <button onClick={handleAbrirModalNuevo} className="btn btn-primary">
            <Plus size={18} /> Registrar Herramienta / Consumible
          </button>
        </div>
      </div>

      {/* METRICAS RAPIDAS DE HERRAMIENTAS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '20px' }}>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px' }}>
          <Hammer color="#38bdf8" size={26} />
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>TOTAL ACTIVOS / ITEMS</span>
            <h4 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)' }}>{totalHerramientasCount} unidades</h4>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.3)' }}>
          <CheckCircle color="#34d399" size={26} />
          <div>
            <span style={{ fontSize: '0.75rem', color: '#34d399' }}>OPERATIVOS Y LISTOS</span>
            <h4 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: '#34d399' }}>{totalOperativas} tipos</h4>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.3)' }}>
          <Wrench color="#fbbf24" size={26} />
          <div>
            <span style={{ fontSize: '0.75rem', color: '#fbbf24' }}>EN REPARACIÓN / MANT.</span>
            <h4 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: '#fbbf24' }}>{totalReparacion} tipos</h4>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)' }}>
          <AlertTriangle color="#f87171" size={26} />
          <div>
            <span style={{ fontSize: '0.75rem', color: '#f87171' }}>DAÑADOS / DADOS DE BAJA</span>
            <h4 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: '#f87171' }}>{totalDanadas} tipos</h4>
          </div>
        </div>
      </div>

      {/* FILTROS Y BARRA DE BÚSQUEDA */}
      <div className="card" style={{ marginBottom: '20px', padding: '14px' }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: 1, minWidth: '220px', position: 'relative' }}>
            <input 
              type="text" 
              className="input-field" 
              placeholder="Buscar por herramienta, broca, disco, tornillo o ubicación..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              style={{ paddingLeft: '34px' }}
            />
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
          </div>

          <div style={{ display: 'flex', gap: '6px' }}>
            <button 
              onClick={() => setFiltroEstado('TODOS')}
              className={`btn ${filtroEstado === 'TODOS' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '6px 12px', fontSize: '0.8rem' }}
            >
              Todos
            </button>
            <button 
              onClick={() => setFiltroEstado('🟢 Operativo / Listo')}
              className={`btn ${filtroEstado === '🟢 Operativo / Listo' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '6px 12px', fontSize: '0.8rem' }}
            >
              🟢 Operativos
            </button>
            <button 
              onClick={() => setFiltroEstado('🔧 En Reparación / Mantenimiento')}
              className={`btn ${filtroEstado === '🔧 En Reparación / Mantenimiento' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '6px 12px', fontSize: '0.8rem' }}
            >
              🔧 En Reparación
            </button>
            <button 
              onClick={() => setFiltroEstado('⚠️ Dañado / Roto')}
              className={`btn ${filtroEstado === '⚠️ Dañado / Roto' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '6px 12px', fontSize: '0.8rem' }}
            >
              ⚠️ Dañados
            </button>
          </div>
        </div>
      </div>

      {/* TABLA DE HERRAMIENTAS Y CONSUMIBLES */}
      {cargando ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
          Cargando inventario de herramientas desde Firestore...
        </div>
      ) : filtradas.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
          No hay herramientas ni consumibles registrados con este criterio.
        </div>
      ) : (
        <div className="card" style={{ padding: '16px', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#0f172a', color: 'var(--color-primary)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <th style={{ padding: '10px 12px' }}>Herramienta / Consumible *</th>
                <th style={{ padding: '10px 12px' }}>Categoría</th>
                <th style={{ padding: '10px 12px', textAlign: 'center' }}>Cant.</th>
                <th style={{ padding: '10px 12px' }}>Estado Actual</th>
                <th style={{ padding: '10px 12px' }}>Ubicación / Responsable</th>
                <th style={{ padding: '10px 12px' }}>Cambiar Estado</th>
                <th style={{ padding: '10px 12px', width: '40px' }}></th>
              </tr>
            </thead>
            <tbody>
              {filtradas.map((h, idx) => (
                <tr key={h.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)' }}>
                  <td style={{ padding: '10px 12px', fontWeight: 700, color: 'var(--text-main)' }}>
                    {h.nombre}
                    {h.observaciones && (
                      <span style={{ display: 'block', fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 400 }}>
                        📝 {h.observaciones}
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '10px 12px', color: 'var(--text-muted)' }}>{h.categoria}</td>
                  <td style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 700, color: '#38bdf8' }}>{h.cantidad}</td>
                  <td style={{ padding: '10px 12px' }}>
                    <span className={`badge ${getBadgeClass(h.estado)}`}>
                      {h.estado}
                    </span>
                  </td>
                  <td style={{ padding: '10px 12px', color: 'var(--text-muted)' }}>📍 {h.ubicacion || 'Taller Principal'}</td>
                  
                  {/* BOTONES DE CAMBIO RÁPIDO DE ESTADO */}
                  <td style={{ padding: '10px 12px' }}>
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                      <button 
                        onClick={() => handleCambiarEstado(h.id, '🟢 Operativo / Listo')} 
                        style={{ padding: '3px 6px', fontSize: '0.72rem', background: 'rgba(34,197,94,0.2)', color: '#34d399', border: '1px solid rgba(34,197,94,0.4)', borderRadius: '4px', cursor: 'pointer' }}
                        title="Marcar como listo y operativo"
                      >
                        🟢 Operativo
                      </button>
                      <button 
                        onClick={() => handleCambiarEstado(h.id, '🔧 En Reparación / Mantenimiento')} 
                        style={{ padding: '3px 6px', fontSize: '0.72rem', background: 'rgba(245,158,11,0.2)', color: '#fbbf24', border: '1px solid rgba(245,158,11,0.4)', borderRadius: '4px', cursor: 'pointer' }}
                        title="Marcar en mantenimiento o reparación"
                      >
                        🔧 Reparar
                      </button>
                      <button 
                        onClick={() => handleCambiarEstado(h.id, '⚠️ Dañado / Roto')} 
                        style={{ padding: '3px 6px', fontSize: '0.72rem', background: 'rgba(239,68,68,0.2)', color: '#f87171', border: '1px solid rgba(239,68,68,0.4)', borderRadius: '4px', cursor: 'pointer' }}
                        title="Marcar como roto o dañado"
                      >
                        ⚠️ Dañado
                      </button>
                    </div>
                  </td>

                  <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                      <button 
                        onClick={() => handleAbrirEditar(h)} 
                        style={{ background: 'none', border: 'none', color: '#38bdf8', cursor: 'pointer' }}
                        title="Editar herramienta o consumible"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button 
                        onClick={() => handleEliminar(h.id)} 
                        style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer' }}
                        title="Eliminar herramienta"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL PARA CREAR / EDITAR HERRAMIENTA O CONSUMIBLE */}
      <ModalForm 
        titulo={compraOrigenId ? "📥 Convertir Compra en Herramienta / Consumible" : herramientaEditando ? `✏️ Editar Herramienta (${herramientaEditando.nombre})` : "🛠️ Registrar Nueva Herramienta o Consumible"} 
        abierto={modalAbierto} 
        onClose={() => setModalAbierto(false)}
      >
        <form onSubmit={handleGuardar}>
          {errorMsg && <div style={{ padding: '10px', background: 'rgba(239,68,68,0.15)', color: '#fca5a5', borderRadius: '8px', marginBottom: '12px', fontSize: '0.85rem' }}>{errorMsg}</div>}

          <div className="input-group">
            <label className="input-label">Nombre de la Herramienta o Insumo *</label>
            <input 
              type="text" 
              className="input-field" 
              required
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              placeholder="Ej. Broca para Bisagra 35mm / Disco de Corte 10'' / Sierra Circular Makita"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="input-group">
              <label className="input-label">Categoría *</label>
              <select 
                className="input-field"
                value={form.categoria}
                onChange={(e) => setForm({ ...form, categoria: e.target.value })}
              >
                <option value="Consumible Taller">🔩 Consumibles (Brocas, Discos, Fresas, Tornillos)</option>
                <option value="Herramienta Eléctrica">⚡ Herramienta Eléctrica (Taladros, Sierras, Routers)</option>
                <option value="Herramienta Manual">🔨 Herramienta Manual (Formones, Escuadras, Martillos)</option>
                <option value="Maquinaria">🚜 Maquinaria (Enchapadora, Escuadradora)</option>
              </select>
            </div>

            <div className="input-group">
              <label className="input-label">Cantidad Inicial</label>
              <input 
                type="number" 
                className="input-field" 
                value={form.cantidad}
                onChange={(e) => setForm({ ...form, cantidad: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="input-group">
              <label className="input-label">Estado Inicial</label>
              <select 
                className="input-field"
                value={form.estado}
                onChange={(e) => setForm({ ...form, estado: e.target.value })}
              >
                <option value="🟢 Operativo / Listo">🟢 Operativo / Listo</option>
                <option value="🔧 En Reparación / Mantenimiento">🔧 En Reparación / Mantenimiento</option>
                <option value="⚠️ Dañado / Roto">⚠️ Dañado / Roto</option>
                <option value="❌ Perdido / De Baja">❌ Perdido / De Baja</option>
              </select>
            </div>

            <div className="input-group">
              <label className="input-label">Ubicación / Responsable</label>
              <input 
                type="text" 
                className="input-field" 
                value={form.ubicacion}
                onChange={(e) => setForm({ ...form, ubicacion: e.target.value })}
                placeholder="Ej. Taller Principal / Maletín Obra"
              />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Observaciones / Detalles de Compra o Estado</label>
            <textarea 
              className="input-field" 
              rows="2"
              value={form.observaciones}
              onChange={(e) => setForm({ ...form, observaciones: e.target.value })}
              placeholder="Ej. Comprado en Ferretería Central. Incluye estuche y llave de cambio."
            />
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '20px' }}>
            <button type="button" onClick={() => setModalAbierto(false)} className="btn btn-secondary">Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={guardando}>
              {guardando ? 'Guardando...' : 'Registrar Herramienta'}
            </button>
          </div>
        </form>
      </ModalForm>

      {/* Modal Seleccionar Compra de Herramientas para Importar al Inventario */}
      <ModalForm titulo="📥 Importar Herramienta / Consumible desde Registro de Compras" abierto={modalImportarAbierto} onClose={() => setModalImportarAbierto(false)}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '60vh', overflowY: 'auto' }}>
          {comprasImportablesHerramientas.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>
              No hay compras de Herramientas/Equipos pendientes por importar. (Los insumos importados o existentes ya fueron filtrados).
            </div>
          ) : (
            comprasImportablesHerramientas.map(c => {
              const cant = Number(c.cantidad) || 1;
              const pu = Number(c.precioUnitario) || (Number(c.monto) / cant);

              return (
                <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(15,23,42,0.6)', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div>
                    <strong style={{ fontSize: '0.9rem', color: '#fbbf24', display: 'block' }}>🛠️ {c.concepto}</strong>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      📅 {c.fecha} • Cant: {cant} • P.Unit: <strong style={{ color: '#34d399' }}>${Number(pu).toLocaleString()} COP</strong>
                    </span>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => handleImportarCompraAHerramienta(c)}
                    className="btn btn-primary"
                    style={{ padding: '6px 12px', fontSize: '0.78rem', background: '#fbbf24', color: '#0f172a', fontWeight: 700 }}
                  >
                    📥 Convertir en Herramienta
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
