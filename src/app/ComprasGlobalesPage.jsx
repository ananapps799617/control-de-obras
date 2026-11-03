import React, { useState, useEffect } from 'react';
import { ShoppingBag, Plus, FileText } from 'lucide-react';
import { obtenerProyectos } from '../services/proyectosService';
import { obtenerProveedores } from '../services/proveedoresService';
import { obtenerMateriales } from '../services/materialesService';
import { obtenerHerramientas } from '../services/herramientasService';
import {
  obtenerComprasGlobales,
  crearCompraGlobal,
  actualizarCompraGlobal,
  actualizarAsignacionProyectoCompra,
  imputarCompraDivididaPorProyectos,
  eliminarCompraGlobal
} from '../services/comprasGlobalesService';
import { getFechaHoyLocal } from '../lib/dateUtils.js';

// ============================================================
// BLOQUE 1: SUBCOMPONENTES DE COMPRAS GLOBALES (REFACTORIZACIÓN RT-02)
// Qué hace: Módulos modularizados para estadísticas, tablas y formulación.
// Por qué: Regla RT-04 y ORDEN #003 (Archivos ≤300 líneas).
// ============================================================
import ComprasGlobalesStats from '../components/comprasGlobales/ComprasGlobalesStats.jsx';
import TablaComprasGlobalesMain from '../components/comprasGlobales/TablaComprasGlobalesMain.jsx';
import ModalCompraUnica from '../components/comprasGlobales/ModalCompraUnica.jsx';
import ModalDividirCompra from '../components/comprasGlobales/ModalDividirCompra.jsx';
import ModalFacturaMultiItem from '../components/comprasGlobales/ModalFacturaMultiItem.jsx';

export default function ComprasGlobalesPage() {
  const [compras, setCompras] = useState([]);
  const [proyectos, setProyectos] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [materiales, setMateriales] = useState([]);
  const [herramientas, setHerramientas] = useState([]);
  const [cargando, setCargando] = useState(true);

  // Modales y Estados de Formulario
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modalDividirAbierto, setModalDividirAbierto] = useState(false);
  const [modalMultiItemAbierto, setModalMultiItemAbierto] = useState(false);
  const [compraEditando, setCompraEditando] = useState(null);
  const [compraADividir, setCompraADividir] = useState(null);
  const [desgloseFilas, setDesgloseFilas] = useState([]);
  const [guardando, setGuardando] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Filtros de Tabla y Auditoría por Proveedor
  const [filtroProveedor, setFiltroProveedor] = useState('');
  const [busquedaText, setBusquedaText] = useState('');

  // Formulario Factura Multi-Ítem (Masivo)
  const [formMultiItem, setFormMultiItem] = useState({
    fecha: getFechaHoyLocal(),
    proveedorId: '',
    beneficiario: '',
    numeroFactura: '',
    proyectoId: '',
    items: [
      { id: 1, concepto: '', categoria: 'Materiales', cantidad: 1, unidad: 'Unidad', precioUnitario: '', subtotal: '' },
      { id: 2, concepto: '', categoria: 'Materiales', cantidad: 1, unidad: 'Unidad', precioUnitario: '', subtotal: '' }
    ]
  });

  // Formulario Registrar / Editar Compra Única
  const [form, setForm] = useState({
    concepto: '',
    materialId: '',
    herramientaId: '',
    categoria: 'Materiales',
    unidad: 'Unidad',
    cantidad: 1,
    precioUnitario: '',
    monto: 0,
    fecha: getFechaHoyLocal(),
    beneficiario: '',
    proveedorId: '',
    proyectoId: ''
  });

  const sortAZ = (arr, key = 'nombre') => {
    return [...arr].sort((a, b) => {
      const valA = (a[key] || a.razonSocial || a.concepto || '').trim();
      const valB = (b[key] || b.razonSocial || b.concepto || '').trim();
      return valA.localeCompare(valB, 'es', { sensitivity: 'base' });
    });
  };

  const cargarCatalogos = async () => {
    setCargando(true);
    try {
      const [dataProyectos, dataProveedores, dataMateriales, dataHerramientas, dataCompras] = await Promise.all([
        obtenerProyectos(),
        obtenerProveedores(),
        obtenerMateriales(),
        obtenerHerramientas(),
        obtenerComprasGlobales()
      ]);
      setProyectos(sortAZ(dataProyectos, 'nombre'));
      setProveedores(sortAZ(dataProveedores, 'razonSocial'));
      setMateriales(sortAZ(dataMateriales, 'nombre'));
      setHerramientas(sortAZ(dataHerramientas, 'nombre'));
      setCompras(sortAZ(dataCompras, 'concepto'));
    } catch (err) {
      console.error("Error al cargar catálogos en Compras Globales:", err);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarCatalogos();
  }, []);

  const handleAbrirCrear = () => {
    setCompraEditando(null);
    setForm({
      concepto: '',
      materialId: '',
      herramientaId: '',
      categoria: 'Materiales',
      unidad: 'Unidad',
      cantidad: 1,
      precioUnitario: '',
      monto: 0,
      fecha: getFechaHoyLocal(),
      beneficiario: '',
      proveedorId: '',
      proyectoId: ''
    });
    setErrorMsg('');
    setModalAbierto(true);
  };

  const handleAbrirMultiItem = () => {
    setFormMultiItem({
      fecha: getFechaHoyLocal(),
      proveedorId: '',
      beneficiario: '',
      numeroFactura: '',
      proyectoId: '',
      items: [
        { id: 1, concepto: '', categoria: 'Materiales', cantidad: 1, unidad: 'Unidad', precioUnitario: '', subtotal: '' },
        { id: 2, concepto: '', categoria: 'Materiales', cantidad: 1, unidad: 'Unidad', precioUnitario: '', subtotal: '' }
      ]
    });
    setErrorMsg('');
    setModalMultiItemAbierto(true);
  };

  const handleAbrirEditar = (compra) => {
    setCompraEditando(compra);
    setForm({
      concepto: compra.concepto || '',
      materialId: compra.materialId || '',
      herramientaId: compra.herramientaId || '',
      categoria: compra.categoria || 'Materiales',
      unidad: compra.unidad || 'Unidad',
      cantidad: compra.cantidad || 1,
      precioUnitario: compra.precioUnitario || '',
      monto: compra.monto || 0,
      fecha: compra.fecha || getFechaHoyLocal(),
      beneficiario: compra.beneficiario || '',
      proveedorId: compra.proveedorId || '',
      proyectoId: compra.proyectoId || ''
    });
    setErrorMsg('');
    setModalAbierto(true);
  };

  const handleAbrirDividir = (compra) => {
    setCompraADividir(compra);
    setDesgloseFilas([
      { proyectoId: '', cantidad: Math.max(1, Math.floor((compra.cantidad || 1) / 2)) },
      { proyectoId: '', cantidad: Math.max(1, Math.ceil((compra.cantidad || 1) / 2)) }
    ]);
    setErrorMsg('');
    setModalDividirAbierto(true);
  };

  const handleGuardar = async (e) => {
    e.preventDefault();
    if (!form.concepto.trim()) {
      setErrorMsg("El concepto o descripción de la compra es obligatorio.");
      return;
    }
    if (Number(form.monto) <= 0) {
      setErrorMsg("El monto total debe ser mayor a 0.");
      return;
    }

    setGuardando(true);
    setErrorMsg('');
    try {
      if (compraEditando) {
        await actualizarCompraGlobal(compraEditando.id, form);
      } else {
        await crearCompraGlobal(form);
      }
      setModalAbierto(false);
      await cargarCatalogos();
    } catch (err) {
      setErrorMsg("Error al guardar la compra: " + err.message);
    } finally {
      setGuardando(false);
    }
  };

  const handleGuardarFacturaMultiItem = async (e) => {
    e.preventDefault();
    const itemsValidos = formMultiItem.items.filter(it => it.concepto.trim() !== '' && Number(it.subtotal) > 0);

    if (itemsValidos.length === 0) {
      setErrorMsg("Debes ingresar al menos 1 ítem válido con concepto y subtotal.");
      return;
    }
    if (!formMultiItem.beneficiario.trim()) {
      setErrorMsg("El nombre del proveedor o establecimiento comercial es obligatorio.");
      return;
    }

    setGuardando(true);
    setErrorMsg('');
    try {
      for (const item of itemsValidos) {
        const payloadCompra = {
          concepto: `${item.concepto.trim()}${formMultiItem.numeroFactura ? ' (Fac: ' + formMultiItem.numeroFactura + ')' : ''}`,
          categoria: item.categoria || 'Materiales',
          unidad: item.unidad || 'Unidad',
          cantidad: Number(item.cantidad) || 1,
          precioUnitario: Number(item.precioUnitario) || (Number(item.subtotal) / (Number(item.cantidad) || 1)),
          monto: Number(item.subtotal),
          fecha: formMultiItem.fecha || getFechaHoyLocal(),
          beneficiario: formMultiItem.beneficiario.trim(),
          proveedorId: formMultiItem.proveedorId || '',
          proyectoId: formMultiItem.proyectoId || ''
        };
        await crearCompraGlobal(payloadCompra);
      }

      setModalMultiItemAbierto(false);
      await cargarCatalogos();
    } catch (err) {
      setErrorMsg("Error al guardar la factura masiva: " + err.message);
    } finally {
      setGuardando(false);
    }
  };

  const handleAgregarFilaMultiItem = () => {
    const nextId = formMultiItem.items.length + 1;
    setFormMultiItem({
      ...formMultiItem,
      items: [
        ...formMultiItem.items,
        { id: nextId, concepto: '', categoria: 'Materiales', cantidad: 1, unidad: 'Unidad', precioUnitario: '', subtotal: '' }
      ]
    });
  };

  const handleCambioFilaMultiItem = (id, campo, valor) => {
    const nuevosItems = formMultiItem.items.map(it => {
      if (it.id === id) {
        const updated = { ...it, [campo]: valor };
        if (campo === 'cantidad' || campo === 'precioUnitario') {
          const cant = Number(campo === 'cantidad' ? valor : it.cantidad) || 0;
          const pu = Number(campo === 'precioUnitario' ? valor : it.precioUnitario) || 0;
          if (cant > 0 && pu > 0) {
            updated.subtotal = cant * pu;
          }
        }
        return updated;
      }
      return it;
    });
    setFormMultiItem({ ...formMultiItem, items: nuevosItems });
  };

  const handleEliminarFilaMultiItem = (id) => {
    if (formMultiItem.items.length <= 1) return;
    setFormMultiItem({
      ...formMultiItem,
      items: formMultiItem.items.filter(it => it.id !== id)
    });
  };

  const handleGuardarDividido = async (e) => {
    e.preventDefault();
    if (!compraADividir) return;

    const filasValidas = desgloseFilas.filter(f => f.proyectoId && Number(f.cantidad) > 0);
    if (filasValidas.length === 0) {
      setErrorMsg("Debes seleccionar al menos 1 proyecto y asignar una cantidad válida.");
      return;
    }

    setGuardando(true);
    setErrorMsg('');
    try {
      await imputarCompraDivididaPorProyectos(compraADividir, filasValidas);
      setModalDividirAbierto(false);
      await cargarCatalogos();
    } catch (err) {
      setErrorMsg("Error al dividir compra: " + err.message);
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminar = async (compraId) => {
    if (!window.confirm("¿Estás seguro de eliminar este registro de compra global?")) return;
    try {
      await eliminarCompraGlobal(compraId);
      await cargarCatalogos();
    } catch (err) {
      alert("Error al eliminar compra: " + err.message);
    }
  };

  // Filtrado de Compras
  const proveedoresUnicos = Array.from(
    new Set(compras.map(c => (c.beneficiario || c.proveedorNombre || '').trim()).filter(Boolean))
  ).sort();

  const comprasFiltradas = compras.filter(c => {
    const matchProv = !filtroProveedor || (c.beneficiario || c.proveedorNombre || '').trim().toLowerCase() === filtroProveedor.trim().toLowerCase();
    const txt = busquedaText.trim().toLowerCase();
    const matchTxt = !txt || 
      (c.concepto || '').toLowerCase().includes(txt) ||
      (c.beneficiario || '').toLowerCase().includes(txt) ||
      (c.categoria || '').toLowerCase().includes(txt);
    return matchProv && matchTxt;
  });

  // Métricas
  const totalCajaGeneral = compras.reduce((acc, curr) => acc + (Number(curr.monto) || 0), 0);
  const totalImputadoObras = compras.filter(c => c.proyectoId).reduce((acc, curr) => acc + (Number(curr.monto) || 0), 0);
  const totalGastosLibres = totalCajaGeneral - totalImputadoObras;
  const totalAcumuladoFiltro = comprasFiltradas.reduce((acc, curr) => acc + (Number(curr.monto) || 0), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* HEADER PRINCIPAL */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ShoppingBag color="#c084fc" size={28} /> Compras Globales & Caja General
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', margin: '4px 0 0 0' }}>
            Registro global e independiente de facturas, compras de insumos, herramientas y transferencias.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button onClick={handleAbrirCrear} className="btn btn-primary" style={{ background: 'linear-gradient(135deg, #a855f7, #c084fc)', gap: '6px' }}>
            <Plus size={18} /> 🛒 + Compra Única
          </button>
          <button onClick={handleAbrirMultiItem} className="btn btn-primary" style={{ background: 'linear-gradient(135deg, #059669, #10b981)', gap: '6px' }}>
            <FileText size={18} /> 🧾 + Factura Multi-Ítem (Masivo)
          </button>
        </div>
      </div>

      {/* DASHBOARD DE MÉTRICAS GLOBALES */}
      <ComprasGlobalesStats
        totalGastado={totalCajaGeneral}
        totalImputado={totalImputadoObras}
        totalPendiente={totalGastosLibres}
      />

      {cargando ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
          Cargando compras globales de Caja General...
        </div>
      ) : (
        <>
          {/* BARRA DE FILTROS */}
          <div className="card" style={{ padding: '16px', marginBottom: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px', marginBottom: '12px' }}>
              <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px', fontWeight: 600 }}>
                  🔍 FILTRAR POR PROVEEDOR / NEGOCIO:
                </label>
                <select 
                  className="input-field"
                  value={filtroProveedor}
                  onChange={(e) => setFiltroProveedor(e.target.value)}
                  style={{ fontSize: '0.84rem', fontWeight: 600, color: filtroProveedor ? '#34d399' : 'var(--text-main)' }}
                >
                  <option value="">-- Todos los Proveedores ({proveedoresUnicos.length}) --</option>
                  {proveedoresUnicos.map((p, idx) => (
                    <option key={idx} value={p}>🏢 {p}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px', fontWeight: 600 }}>
                  🔎 BUSCAR POR ÍTEM O CONCEPTO:
                </label>
                <input 
                  type="text"
                  className="input-field"
                  placeholder="Buscar insumo, número de factura..."
                  value={busquedaText}
                  onChange={(e) => setBusquedaText(e.target.value)}
                  style={{ fontSize: '0.84rem' }}
                />
              </div>
            </div>

            {(filtroProveedor || busquedaText) && (
              <div style={{ background: 'rgba(52, 211, 153, 0.12)', border: '1px solid rgba(52, 211, 153, 0.4)', borderRadius: '8px', padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.82rem', color: '#6ee7b7', fontWeight: 600 }}>
                  📊 AUDITORÍA: {comprasFiltradas.length} compras encontradas
                </span>
                <strong style={{ fontSize: '1.1rem', color: '#34d399', fontFamily: 'var(--font-mono)' }}>
                  ${Number(totalAcumuladoFiltro).toLocaleString()} COP
                </strong>
              </div>
            )}
          </div>

          {/* TABLA PRINCIPAL */}
          <TablaComprasGlobalesMain
            compras={comprasFiltradas}
            onImputarDirecto={handleAbrirEditar}
            onAbrirDividir={handleAbrirDividir}
            onAbrirEditar={handleAbrirEditar}
            onEliminar={handleEliminar}
          />
        </>
      )}

      {/* MODAL COMPRA ÚNICA */}
      <ModalCompraUnica
        modalAbierto={modalAbierto}
        onClose={() => setModalAbierto(false)}
        compraEditando={compraEditando}
        form={form}
        setForm={setForm}
        handleGuardar={handleGuardar}
        guardando={guardando}
        errorMsg={errorMsg}
        proveedores={proveedores}
        proyectos={proyectos}
      />

      {/* MODAL DIVIDIR COMPRA */}
      <ModalDividirCompra
        modalDividirAbierto={modalDividirAbierto}
        onClose={() => setModalDividirAbierto(false)}
        compraADividir={compraADividir}
        desgloseFilas={desgloseFilas}
        setDesgloseFilas={setDesgloseFilas}
        handleGuardarDividido={handleGuardarDividido}
        guardando={guardando}
        errorMsg={errorMsg}
        proyectos={proyectos}
      />

      {/* MODAL FACTURA MULTI-ÍTEM */}
      <ModalFacturaMultiItem
        modalMultiItemAbierto={modalMultiItemAbierto}
        onClose={() => setModalMultiItemAbierto(false)}
        formMultiItem={formMultiItem}
        setFormMultiItem={setFormMultiItem}
        handleGuardarFacturaMultiItem={handleGuardarFacturaMultiItem}
        handleAgregarFilaMultiItem={handleAgregarFilaMultiItem}
        handleCambioFilaMultiItem={handleCambioFilaMultiItem}
        handleEliminarFilaMultiItem={handleEliminarFilaMultiItem}
        guardando={guardando}
        errorMsg={errorMsg}
        proveedores={proveedores}
        proyectos={proyectos}
      />

    </div>
  );
}
