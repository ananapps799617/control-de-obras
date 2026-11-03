// ============================================================
// BLOQUE 1: IMPORTACIONES Y DEPENDENCIAS
// Qué hace: Vista principal para la Caja General, Compras Globales y Facturas Multi-Ítem.
// Por qué: Arquitectura Feature-Driven y Regla 2.2 Manual Maestro.
// ============================================================
import React, { useState, useEffect } from 'react';
import { ShoppingBag, Plus, FileText } from 'lucide-react';
import { obtenerProyectos } from '../../../services/proyectosService';
import { obtenerProveedores } from '../../../services/proveedoresService';
import { obtenerMateriales } from '../../../services/materialesService';
import { obtenerHerramientas } from '../../../services/herramientasService';
import {
  obtenerComprasGlobales,
  crearCompraGlobal,
  actualizarCompraGlobal,
  eliminarCompraGlobal,
  imputarCompraAProyecto,
  registrarFacturaMultiItem
} from '../../../services/comprasGlobalesService';
import { getFechaHoyLocal } from '../../../lib/dateUtils.js';

import ComprasGlobalesStats from '../../../components/comprasGlobales/ComprasGlobalesStats.jsx';
import TablaComprasGlobalesMain from '../../../components/comprasGlobales/TablaComprasGlobalesMain.jsx';
import ModalCompraUnica from '../../../components/comprasGlobales/ModalCompraUnica.jsx';
import ModalDividirCompra from '../../../components/comprasGlobales/ModalDividirCompra.jsx';
import ModalFacturaMultiItem from '../../../components/comprasGlobales/ModalFacturaMultiItem.jsx';

import type { IProyecto } from '../../../types/proyecto';
import type { IProveedor } from '../../../types/proveedor';
import type { ICompraGlobal } from '../../../types/finanzas';

// ============================================================
// BLOQUE 2: COMPONENTE PRINCIPAL — COMPRAS GLOBALES Y CAJA GENERAL
// ============================================================
export default function ComprasGlobalesPage() {
  const [compras, setCompras] = useState<ICompraGlobal[]>([]);
  const [proyectos, setProyectos] = useState<IProyecto[]>([]);
  const [proveedores, setProveedores] = useState<IProveedor[]>([]);
  const [materiales, setMateriales] = useState<any[]>([]);
  const [herramientas, setHerramientas] = useState<any[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);

  // Modales
  const [modalAbierto, setModalAbierto] = useState<boolean>(false);
  const [modalDividirAbierto, setModalDividirAbierto] = useState<boolean>(false);
  const [modalMultiItemAbierto, setModalMultiItemAbierto] = useState<boolean>(false);
  const [compraEditando, setCompraEditando] = useState<ICompraGlobal | null>(null);
  const [compraADividir, setCompraADividir] = useState<ICompraGlobal | null>(null);
  const [desgloseFilas, setDesgloseFilas] = useState<any[]>([]);
  const [guardando, setGuardando] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Filtros
  const [filtroProveedor, setFiltroProveedor] = useState<string>('');
  const [busquedaText, setBusquedaText] = useState<string>('');

  // Formulario Factura Multi-Ítem
  const [formMultiItem, setFormMultiItem] = useState<any>({
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

  const [form, setForm] = useState<any>({
    fecha: getFechaHoyLocal(),
    beneficiario: '',
    categoria: 'Materiales',
    concepto: '',
    monto: '',
    proyectoId: '',
    facturaNumero: '',
    observaciones: ''
  });

  const cargarDatos = async () => {
    setCargando(true);
    try {
      const [comprasData, proyData, provData, matData, herrData] = await Promise.all([
        obtenerComprasGlobales(),
        obtenerProyectos(),
        obtenerProveedores(),
        obtenerMateriales().catch(() => []),
        obtenerHerramientas().catch(() => [])
      ]);
      setCompras(comprasData);
      setProyectos(proyData);
      setProveedores(provData);
      setMateriales(matData);
      setHerramientas(herrData);
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
    setCompraEditando(null);
    setForm({
      fecha: getFechaHoyLocal(),
      beneficiario: '',
      categoria: 'Materiales',
      concepto: '',
      monto: '',
      proyectoId: '',
      facturaNumero: '',
      observaciones: ''
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

  const handleGuardarCompra = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg('');
    if (!form.concepto.trim()) return setErrorMsg('El concepto es obligatorio');
    if (!form.monto || Number(form.monto) <= 0) return setErrorMsg('Ingresa un monto válido');

    setGuardando(true);
    try {
      if (compraEditando && compraEditando.id) {
        await actualizarCompraGlobal(compraEditando.id, {
          ...form,
          descripcion: form.concepto,
          proveedor: form.beneficiario,
          monto: Number(form.monto)
        });
      } else {
        await crearCompraGlobal({
          ...form,
          descripcion: form.concepto,
          proveedor: form.beneficiario,
          monto: Number(form.monto)
        });
      }
      setModalAbierto(false);
      await cargarDatos();
    } catch (err: unknown) {
      const error = err as Error;
      setErrorMsg(error.message || 'Error al guardar la compra');
    } finally {
      setGuardando(false);
    }
  };

  const handleGuardarFacturaMultiItem = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg('');
    const filasValidas = formMultiItem.items.filter((it: any) => it.concepto.trim() !== '' && Number(it.subtotal) > 0);
    if (filasValidas.length === 0) return setErrorMsg('Agrega al menos un ítem con concepto y subtotal');

    setGuardando(true);
    try {
      await registrarFacturaMultiItem({
        proveedor: formMultiItem.beneficiario || formMultiItem.proveedorId || 'Proveedor General',
        facturaNumero: formMultiItem.numeroFactura || '',
        fecha: formMultiItem.fecha || getFechaHoyLocal(),
        filas: filasValidas.map((it: any) => ({
          id: String(it.id),
          descripcion: it.concepto,
          categoria: it.categoria || 'Materiales',
          monto: Number(it.subtotal),
          proyectoId: formMultiItem.proyectoId || ''
        }))
      });
      setModalMultiItemAbierto(false);
      await cargarDatos();
    } catch (err: unknown) {
      const error = err as Error;
      setErrorMsg(error.message || 'Error al procesar la factura multi-ítem');
    } finally {
      setGuardando(false);
    }
  };

  const handleAgregarFilaMultiItem = () => {
    setFormMultiItem((prev: any) => ({
      ...prev,
      items: [
        ...prev.items,
        { id: Date.now(), concepto: '', categoria: 'Materiales', cantidad: 1, unidad: 'Unidad', precioUnitario: '', subtotal: '' }
      ]
    }));
  };

  const handleCambioFilaMultiItem = (id: number, campo: string, valor: any) => {
    setFormMultiItem((prev: any) => {
      const nuevosItems = prev.items.map((it: any) => {
        if (it.id === id) {
          const actual = { ...it, [campo]: valor };
          if (campo === 'cantidad' || campo === 'precioUnitario') {
            const c = campo === 'cantidad' ? Number(valor) : Number(it.cantidad || 1);
            const p = campo === 'precioUnitario' ? Number(valor) : Number(it.precioUnitario || 0);
            actual.subtotal = c > 0 && p > 0 ? c * p : actual.subtotal;
          }
          return actual;
        }
        return it;
      });
      return { ...prev, items: nuevosItems };
    });
  };

  const handleEliminarFilaMultiItem = (id: number) => {
    setFormMultiItem((prev: any) => ({
      ...prev,
      items: prev.items.filter((it: any) => it.id !== id)
    }));
  };

  const handleImputarDirecto = async (compraId: string, proyectoId: string) => {
    const compra = compras.find(c => c.id === compraId);
    if (!compra) return;
    const proy = proyectos.find(p => p.id === proyectoId);
    await imputarCompraAProyecto(compraId, proyectoId, compra.monto, proy?.nombre);
    await cargarDatos();
  };

  const handleEliminar = async (id: string) => {
    if (window.confirm('¿Estás seguro de eliminar este registro de compra?')) {
      try {
        await eliminarCompraGlobal(id);
        await cargarDatos();
      } catch (err) {
        console.error(err);
      }
    }
  };

  // KPIs
  const totalGastado = compras.reduce((acc, c) => acc + (Number(c.monto) || 0), 0);
  const totalImputado = compras.filter(c => c.proyectoId).reduce((acc, c) => acc + (Number(c.monto) || 0), 0);
  const totalPendiente = totalGastado - totalImputado;

  // Filtrado
  const comprasFiltradas = compras.filter(c => {
    const matchBusq = !busquedaText || 
      (c.descripcion || (c as any).concepto || '').toLowerCase().includes(busquedaText.toLowerCase()) ||
      (c.proveedor || (c as any).beneficiario || '').toLowerCase().includes(busquedaText.toLowerCase());
    const matchProv = !filtroProveedor || (c.proveedor || (c as any).beneficiario) === filtroProveedor;
    return matchBusq && matchProv;
  });

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Encabezado con Botonera Dual */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShoppingBag size={24} color="#38bdf8" />
            <span>Caja General & Compras Globales</span>
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '4px' }}>
            Registro de egresos, compras de mostrador y facturas multi-ítem para imputación a proyectos
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button 
            onClick={handleAbrirCrear}
            className="btn btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}
          >
            <Plus size={16} /> 🛒 + Compra Única
          </button>
          <button 
            onClick={handleAbrirMultiItem}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}
          >
            <FileText size={16} /> 🧾 + Factura Multi-Ítem
          </button>
        </div>
      </div>

      {/* Estadísticas de Compras */}
      <ComprasGlobalesStats 
        totalGastado={totalGastado}
        totalImputado={totalImputado}
        totalPendiente={totalPendiente}
      />

      {/* Filtros de Búsqueda */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Buscar por concepto o proveedor..."
          className="input"
          value={busquedaText}
          onChange={(e) => setBusquedaText(e.target.value)}
          style={{ flex: 1, minWidth: '240px' }}
        />
        <select
          className="input"
          value={filtroProveedor}
          onChange={(e) => setFiltroProveedor(e.target.value)}
          style={{ minWidth: '200px' }}
        >
          <option value="">-- Todos los Proveedores --</option>
          {proveedores.map(p => (
            <option key={p.id} value={p.razonSocial || p.nombre}>
              {p.razonSocial || p.nombre}
            </option>
          ))}
        </select>
      </div>

      {/* Tabla Principal */}
      <div className="card" style={{ padding: '20px' }}>
        <TablaComprasGlobalesMain
          compras={comprasFiltradas as any}
          onImputarDirecto={handleImputarDirecto}
          onAbrirDividir={(c: any) => {
            setCompraADividir(c);
            setDesgloseFilas([{ proyectoId: '', monto: String(c.monto) }]);
            setModalDividirAbierto(true);
          }}
          onAbrirEditar={(c: any) => {
            setCompraEditando(c);
            setForm({
              fecha: c.fecha,
              beneficiario: c.proveedor || c.beneficiario || '',
              categoria: c.categoria || 'Materiales',
              concepto: c.descripcion || c.concepto || '',
              monto: String(c.monto),
              proyectoId: c.proyectoId || '',
              facturaNumero: c.facturaNumero || '',
              observaciones: c.observaciones || ''
            });
            setErrorMsg('');
            setModalAbierto(true);
          }}
          onEliminar={handleEliminar}
        />
      </div>

      {/* Modales */}
      <ModalCompraUnica
        modalAbierto={modalAbierto}
        onClose={() => setModalAbierto(false)}
        compraEditando={compraEditando}
        form={form}
        setForm={setForm}
        handleGuardar={handleGuardarCompra}
        guardando={guardando}
        errorMsg={errorMsg}
        proveedores={proveedores}
        proyectos={proyectos}
      />

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
