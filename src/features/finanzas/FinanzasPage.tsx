// ============================================================
// BLOQUE 1: IMPORTACIONES Y DEPENDENCIAS
// Qué hace: Vista principal para la gestión financiera por proyecto (Abonos, Gastos e Imputaciones).
// Por qué: Arquitectura Feature-Driven y Regla 2.2 Manual Maestro.
// ============================================================
import React, { useState, useEffect } from 'react';
import { DollarSign, Plus, Folder, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import { obtenerProyectos } from '../../services/proyectosService';
import { obtenerProveedores } from '../../services/proveedoresService';
import { obtenerCotizacionGuardadaPorProyecto } from '../../services/cotizacionesService';
import {
  obtenerFinanzasProyecto,
  guardarValorProyecto,
  obtenerAbonosPorProyecto,
  crearAbono,
  eliminarAbono,
  obtenerGastosPorProyecto,
  crearGasto,
  actualizarGasto,
  eliminarGasto
} from '../../services/finanzasService';
import {
  obtenerComprasGlobales,
  crearCompraGlobal,
  eliminarCompraGlobal,
  imputarCompraAProyecto
} from '../../services/comprasGlobalesService';
import ModalForm from '../../components/ModalForm.jsx';
import { getFechaHoyLocal } from '../../lib/dateUtils.js';

import FinanzasDashboard from '../../components/finanzas/FinanzasDashboard.jsx';
import TablaGastos from '../../components/finanzas/TablaGastos.jsx';
import TablaAbonos from '../../components/finanzas/TablaAbonos.jsx';
import TablaComprasGlobales from '../../components/finanzas/TablaComprasGlobales.jsx';

import type { IProyecto } from '../../types/proyecto';
import type { IProveedor } from '../../types/proveedor';
import type { IAbonoProyecto, IGastoProyecto, ICompraGlobal, CategoriaFinanciera } from '../../types/finanzas';

// ============================================================
// BLOQUE 2: COMPONENTE PRINCIPAL — FINANZAS DEL PROYECTO
// ============================================================
export default function FinanzasPage() {
  const [proyectos, setProyectos] = useState<IProyecto[]>([]);
  const [proveedores, setProveedores] = useState<IProveedor[]>([]);
  const [proyectoSeleccionado, setProyectoSeleccionado] = useState<string>('');

  const [valorProyecto, setValorProyecto] = useState<number>(0);
  const [esValorCotizado, setEsValorCotizado] = useState<boolean>(false);
  const [abonos, setAbonos] = useState<IAbonoProyecto[]>([]);
  const [gastos, setGastos] = useState<IGastoProyecto[]>([]);
  const [comprasGlobales, setComprasGlobales] = useState<ICompraGlobal[]>([]);
  const [cargando, setCargando] = useState<boolean>(false);
  const [pestanaActiva, setPestanaActiva] = useState<'gastos' | 'abonos' | 'compras'>('gastos');

  const [modalValorAbierto, setModalValorAbierto] = useState<boolean>(false);
  const [modalAbonoAbierto, setModalAbonoAbierto] = useState<boolean>(false);
  const [modalGastoAbierto, setModalGastoAbierto] = useState<boolean>(false);
  const [modalCompraGlobalAbierto, setModalCompraGlobalAbierto] = useState<boolean>(false);
  const [gastoEditando, setGastoEditando] = useState<IGastoProyecto | null>(null);
  const [guardando, setGuardando] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Formularios
  const [formValor, setFormValor] = useState<string>('');
  const [formAbono, setFormAbono] = useState<{ monto: string; fecha: string; metodoPago: string; referencia: string; notas: string }>({
    monto: '',
    fecha: getFechaHoyLocal(),
    metodoPago: 'Transferencia',
    referencia: '',
    notas: ''
  });

  const [formGasto, setFormGasto] = useState<{ categoria: CategoriaFinanciera; concepto: string; descripcion?: string; monto: string; fecha: string; proveedor: string; soporteUrl: string }>({
    categoria: 'Materiales',
    concepto: '',
    descripcion: '',
    monto: '',
    fecha: getFechaHoyLocal(),
    proveedor: '',
    soporteUrl: ''
  });

  const [formCompraGlobal, setFormCompraGlobal] = useState<{ concepto: string; descripcion?: string; categoria: CategoriaFinanciera; monto: string; fecha: string; proveedor: string }>({
    concepto: '',
    descripcion: '',
    categoria: 'Materiales',
    monto: '',
    fecha: getFechaHoyLocal(),
    proveedor: ''
  });

  const cargarProyectosYProveedores = async () => {
    try {
      const [proyData, provData] = await Promise.all([
        obtenerProyectos(),
        obtenerProveedores()
      ]);
      setProyectos(proyData);
      setProveedores(provData);
      if (proyData.length > 0 && !proyectoSeleccionado) {
        setProyectoSeleccionado(proyData[0].id || '');
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    cargarProyectosYProveedores();
  }, []);

  const cargarDatosProyecto = async () => {
    if (!proyectoSeleccionado) return;
    setCargando(true);
    try {
      const [finanzasData, abonosData, gastosData, cotizacionData, comprasData] = await Promise.all([
        obtenerFinanzasProyecto(proyectoSeleccionado),
        obtenerAbonosPorProyecto(proyectoSeleccionado),
        obtenerGastosPorProyecto(proyectoSeleccionado),
        obtenerCotizacionGuardadaPorProyecto(proyectoSeleccionado) as Promise<any>,
        obtenerComprasGlobales()
      ]);

      if (cotizacionData && cotizacionData.totalGeneral) {
        setValorProyecto(Number(cotizacionData.totalGeneral));
        setEsValorCotizado(true);
      } else if (finanzasData && finanzasData.valorProyecto) {
        setValorProyecto(Number(finanzasData.valorProyecto));
        setEsValorCotizado(false);
      } else {
        setValorProyecto(0);
        setEsValorCotizado(false);
      }

      setAbonos(abonosData);
      setGastos(gastosData.map(g => ({ ...g, concepto: (g as any).concepto || g.descripcion })));
      setComprasGlobales(comprasData);
    } catch (err) {
      console.error(err);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatosProyecto();
  }, [proyectoSeleccionado]);

  // Manejadores CRUD
  const handleGuardarValorProyecto = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setGuardando(true);
    try {
      await guardarValorProyecto(proyectoSeleccionado, formValor);
      setValorProyecto(Number(formValor));
      setModalValorAbierto(false);
    } catch (err) {
      console.error(err);
    } finally {
      setGuardando(false);
    }
  };

  const handleCrearAbono = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formAbono.monto || Number(formAbono.monto) <= 0) return setErrorMsg('Ingresa un monto válido');
    setGuardando(true);
    setErrorMsg('');
    try {
      await crearAbono({ ...formAbono, monto: Number(formAbono.monto), proyectoId: proyectoSeleccionado });
      setFormAbono({ monto: '', fecha: getFechaHoyLocal(), metodoPago: 'Transferencia', referencia: '', notas: '' });
      setModalAbonoAbierto(false);
      await cargarDatosProyecto();
    } catch (err) {
      console.error(err);
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminarAbono = async (id: string) => {
    if (window.confirm('¿Eliminar este abono?')) {
      await eliminarAbono(id);
      await cargarDatosProyecto();
    }
  };

  const handleGuardarGasto = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const conceptoFinal = formGasto.concepto || formGasto.descripcion || '';
    if (!conceptoFinal.trim()) return setErrorMsg('El concepto/descripción es obligatorio');
    if (!formGasto.monto || Number(formGasto.monto) <= 0) return setErrorMsg('Ingresa un monto válido');
    setGuardando(true);
    setErrorMsg('');
    try {
      if (gastoEditando && gastoEditando.id) {
        await actualizarGasto(gastoEditando.id, {
          ...formGasto,
          descripcion: conceptoFinal,
          monto: Number(formGasto.monto)
        });
      } else {
        await crearGasto({
          ...formGasto,
          descripcion: conceptoFinal,
          monto: Number(formGasto.monto),
          proyectoId: proyectoSeleccionado
        });
      }
      setModalGastoAbierto(false);
      setGastoEditando(null);
      await cargarDatosProyecto();
    } catch (err) {
      console.error(err);
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminarGasto = async (id: string) => {
    if (window.confirm('¿Eliminar este gasto de obra?')) {
      await eliminarGasto(id);
      await cargarDatosProyecto();
    }
  };

  const handleCrearCompraGlobal = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const conceptoFinal = formCompraGlobal.concepto || formCompraGlobal.descripcion || '';
    if (!conceptoFinal.trim()) return setErrorMsg('El concepto/descripción es obligatorio');
    if (!formCompraGlobal.monto || Number(formCompraGlobal.monto) <= 0) return setErrorMsg('Ingresa un monto válido');
    setGuardando(true);
    setErrorMsg('');
    try {
      await crearCompraGlobal({
        ...formCompraGlobal,
        descripcion: conceptoFinal,
        monto: Number(formCompraGlobal.monto)
      });
      setFormCompraGlobal({ concepto: '', descripcion: '', categoria: 'Materiales', monto: '', fecha: getFechaHoyLocal(), proveedor: '' });
      setModalCompraGlobalAbierto(false);
      await cargarDatosProyecto();
    } catch (err) {
      console.error(err);
    } finally {
      setGuardando(false);
    }
  };

  const handleImputarCompra = async (compraId: string) => {
    const compra = comprasGlobales.find(c => c.id === compraId);
    if (!compra) return;
    const proy = proyectos.find(p => p.id === proyectoSeleccionado);
    await imputarCompraAProyecto(compraId, proyectoSeleccionado, compra.monto, proy?.nombre);
    await cargarDatosProyecto();
  };

  const handleEliminarCompraGlobal = async (id: string) => {
    if (window.confirm('¿Eliminar esta compra de la Caja General?')) {
      await eliminarCompraGlobal(id);
      await cargarDatosProyecto();
    }
  };

  // Totales
  const totalAbonos = abonos.reduce((acc, a) => acc + (Number(a.monto) || 0), 0);
  const totalGastos = gastos.reduce((acc, g) => acc + (Number(g.monto) || 0), 0);
  const totalComprasImputadas = comprasGlobales
    .filter(c => c.proyectoId === proyectoSeleccionado)
    .reduce((acc, c) => acc + (Number(c.monto) || 0), 0);

  const gastosManoObra = gastos.filter(g => g.categoria === 'Mano de Obra').reduce((acc, g) => acc + (Number(g.monto) || 0), 0);
  const gastosMateriales = gastos.filter(g => g.categoria === 'Materiales').reduce((acc, g) => acc + (Number(g.monto) || 0), 0) + totalComprasImputadas;
  const saldoPorCobrar = Math.max(0, valorProyecto - totalAbonos);
  const diferenciaNetaCaja = totalAbonos - (totalGastos + totalComprasImputadas);

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Selector de Proyecto */}
      <div className="card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Folder size={22} color="#38bdf8" />
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc' }}>
            Finanzas del Proyecto:
          </h3>
        </div>
        <select
          className="input"
          value={proyectoSeleccionado}
          onChange={(e) => setProyectoSeleccionado(e.target.value)}
          style={{ minWidth: '260px', fontWeight: 600 }}
        >
          {proyectos.map(p => (
            <option key={p.id} value={p.id}>
              {p.nombre} ({p.codigoObra || 'N/A'})
            </option>
          ))}
        </select>
      </div>

      {/* Dashboard KPI Financiero */}
      <FinanzasDashboard
        valorProyecto={valorProyecto}
        esValorCotizado={esValorCotizado}
        totalAbonos={totalAbonos}
        totalGastos={totalGastos + totalComprasImputadas}
        gastosManoObra={gastosManoObra}
        gastosMateriales={gastosMateriales}
        saldoPorCobrar={saldoPorCobrar}
        diferenciaNetaCaja={diferenciaNetaCaja}
        abonos={abonos}
        onEditarValor={() => { setFormValor(String(valorProyecto)); setModalValorAbierto(true); }}
      />

      {/* Navegación por Pestañas */}
      <div style={{ display: 'flex', gap: '10px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '10px' }}>
        <button
          className={`btn ${pestanaActiva === 'gastos' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setPestanaActiva('gastos')}
          style={{ gap: '6px' }}
        >
          <ArrowDownCircle size={16} /> Gastos Directos ({gastos.length})
        </button>
        <button
          className={`btn ${pestanaActiva === 'abonos' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setPestanaActiva('abonos')}
          style={{ gap: '6px' }}
        >
          <ArrowUpCircle size={16} /> Abonos Recibidos ({abonos.length})
        </button>
        <button
          className={`btn ${pestanaActiva === 'compras' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setPestanaActiva('compras')}
          style={{ gap: '6px' }}
        >
          <DollarSign size={16} /> Compras / Caja General
        </button>
      </div>

      {/* Contenido de Pestaña */}
      <div>
        {pestanaActiva === 'gastos' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '12px' }}>
              <button
                className="btn btn-primary"
                onClick={() => {
                  setGastoEditando(null);
                  setFormGasto({ categoria: 'Materiales', concepto: '', descripcion: '', monto: '', fecha: getFechaHoyLocal(), proveedor: '', soporteUrl: '' });
                  setModalGastoAbierto(true);
                }}
              >
                + Registrar Gasto
              </button>
            </div>
            <TablaGastos
              gastos={gastos as any}
              onEditar={(g: any) => {
                setGastoEditando(g);
                setFormGasto({ categoria: g.categoria, concepto: g.concepto || g.descripcion || '', descripcion: g.descripcion || '', monto: String(g.monto), fecha: g.fecha, proveedor: g.proveedor || g.beneficiario || '', soporteUrl: g.soporteUrl || '' });
                setModalGastoAbierto(true);
              }}
              onEliminar={handleEliminarGasto}
            />
          </div>
        )}

        {pestanaActiva === 'abonos' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '12px' }}>
              <button
                className="btn btn-primary"
                onClick={() => {
                  setFormAbono({ monto: '', fecha: getFechaHoyLocal(), metodoPago: 'Transferencia', referencia: '', notas: '' });
                  setModalAbonoAbierto(true);
                }}
              >
                + Registrar Abono
              </button>
            </div>
            <TablaAbonos
              abonos={abonos}
              onEliminar={handleEliminarAbono}
            />
          </div>
        )}

        {pestanaActiva === 'compras' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '12px' }}>
              <button
                className="btn btn-primary"
                onClick={() => {
                  setFormCompraGlobal({ concepto: '', descripcion: '', categoria: 'Materiales', monto: '', fecha: getFechaHoyLocal(), proveedor: '' });
                  setModalCompraGlobalAbierto(true);
                }}
              >
                + Registrar Compra / Transferencia
              </button>
            </div>
            <TablaComprasGlobales
              comprasGlobales={comprasGlobales as any}
              onImputar={handleImputarCompra}
              onEliminar={handleEliminarCompraGlobal}
            />
          </div>
        )}
      </div>

      {/* Modales */}
      <ModalForm
        abierto={modalValorAbierto}
        onClose={() => setModalValorAbierto(false)}
        titulo="Editar Valor Total del Proyecto"
        maxWidth="440px"
      >
        <form onSubmit={handleGuardarValorProyecto} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '4px' }}>
              Valor Total Contratado ($ COP)
            </label>
            <input
              type="number"
              required
              className="input"
              value={formValor}
              onChange={(e) => setFormValor(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setModalValorAbierto(false)}>Cancelar</button>
            <button type="submit" disabled={guardando} className="btn btn-primary">Guardar</button>
          </div>
        </form>
      </ModalForm>

      <ModalForm
        abierto={modalAbonoAbierto}
        onClose={() => setModalAbonoAbierto(false)}
        titulo="Registrar Abono del Cliente"
        maxWidth="480px"
      >
        <form onSubmit={handleCrearAbono} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '4px' }}>Monto ($ COP) *</label>
            <input
              type="number"
              required
              className="input"
              placeholder="Ej: 5000000"
              value={formAbono.monto}
              onChange={(e) => setFormAbono({ ...formAbono, monto: e.target.value })}
              style={{ width: '100%' }}
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '4px' }}>Fecha</label>
              <input
                type="date"
                required
                className="input"
                value={formAbono.fecha}
                onChange={(e) => setFormAbono({ ...formAbono, fecha: e.target.value })}
                style={{ width: '100%' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '4px' }}>Método de Pago</label>
              <select
                className="input"
                value={formAbono.metodoPago}
                onChange={(e) => setFormAbono({ ...formAbono, metodoPago: e.target.value })}
                style={{ width: '100%' }}
              >
                <option value="Transferencia">Transferencia</option>
                <option value="Efectivo">Efectivo</option>
                <option value="Cheque">Cheque</option>
                <option value="Tarjeta">Tarjeta</option>
              </select>
            </div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '4px' }}>Referencia / Comprobante</label>
            <input
              type="text"
              className="input"
              placeholder="Ej: Transf. Bancolombia #8821"
              value={formAbono.referencia}
              onChange={(e) => setFormAbono({ ...formAbono, referencia: e.target.value })}
              style={{ width: '100%' }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setModalAbonoAbierto(false)}>Cancelar</button>
            <button type="submit" disabled={guardando} className="btn btn-primary">Registrar Abono</button>
          </div>
        </form>
      </ModalForm>

      <ModalForm
        abierto={modalGastoAbierto}
        onClose={() => setModalGastoAbierto(false)}
        titulo={gastoEditando ? "Editar Gasto de Obra" : "Registrar Gasto de Obra"}
        maxWidth="500px"
      >
        <form onSubmit={handleGuardarGasto} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '4px' }}>Descripción del Gasto *</label>
            <input
              type="text"
              required
              className="input"
              placeholder="Ej: Compra de tornillería y bisagras"
              value={formGasto.concepto}
              onChange={(e) => setFormGasto({ ...formGasto, concepto: e.target.value })}
              style={{ width: '100%' }}
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '4px' }}>Categoría</label>
              <select
                className="input"
                value={formGasto.categoria}
                onChange={(e) => setFormGasto({ ...formGasto, categoria: e.target.value as CategoriaFinanciera })}
                style={{ width: '100%' }}
              >
                <option value="Materiales">Materiales</option>
                <option value="Mano de Obra">Mano de Obra</option>
                <option value="Transporte / Fletes">Transporte / Fletes</option>
                <option value="Herramientas">Herramientas</option>
                <option value="Subcontratos">Subcontratos</option>
                <option value="Viáticos / Alimentación / Hospedaje">🍱 Viáticos / Hospedaje</option>
                <option value="Administrativos / Servicios">Administrativos</option>
                <option value="Otros">Otros</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '4px' }}>Monto ($ COP) *</label>
              <input
                type="number"
                required
                className="input"
                placeholder="Ej: 350000"
                value={formGasto.monto}
                onChange={(e) => setFormGasto({ ...formGasto, monto: e.target.value })}
                style={{ width: '100%' }}
              />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '4px' }}>Fecha</label>
              <input
                type="date"
                required
                className="input"
                value={formGasto.fecha}
                onChange={(e) => setFormGasto({ ...formGasto, fecha: e.target.value })}
                style={{ width: '100%' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '4px' }}>Proveedor / Comercial</label>
              <input
                type="text"
                className="input"
                placeholder="Ej: Maderera Los Andes"
                value={formGasto.proveedor}
                onChange={(e) => setFormGasto({ ...formGasto, proveedor: e.target.value })}
                style={{ width: '100%' }}
              />
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setModalGastoAbierto(false)}>Cancelar</button>
            <button type="submit" disabled={guardando} className="btn btn-primary">Guardar Gasto</button>
          </div>
        </form>
      </ModalForm>
    </div>
  );
}
