// ============================================================
// BLOQUE 1: IMPORTACIONES Y DEPENDENCIAS
// Qué hace: Creador de Ítems Compuestos de carpintería y servicios especiales de obra con despiece.
// Por qué: Arquitectura Feature-Driven y Regla 2.2 Manual Maestro.
// ============================================================
import React, { useState, useEffect } from 'react';
import { Box, Plus, Folder, Upload, FileText, Clipboard } from 'lucide-react';
import { obtenerProyectos } from '../../../services/proyectosService';
import { obtenerMateriales } from '../../../services/materialesService';
import { obtenerItemsPorProyecto, crearItemProyecto, actualizarItemProyecto, eliminarItemProyecto } from '../../../services/itemsService';
import { obtenerListaCortePorProyecto, guardarListaCorteProyecto } from '../../../services/corteService';
import { parseOpenCutListCSV, parseOpenCutListText } from '../../../lib/openCutListParser.js';
import ModalForm from '../../../components/ModalForm.jsx';
import ListaItemsProyecto from '../../../components/creadorItems/ListaItemsProyecto.jsx';

import type { IProyecto } from '../../../types/proyecto';
import type { IMaterial } from '../../../services/materialesService';

// ============================================================
// BLOQUE 2: COMPONENTE PRINCIPAL — CREADOR DE ÍTEMS
// ============================================================
export default function CreadorItemsPage() {
  const [proyectos, setProyectos] = useState<IProyecto[]>([]);
  const [materiales, setMateriales] = useState<IMaterial[]>([]);
  const [proyectoSeleccionado, setProyectoSeleccionado] = useState<string>('');

  const [items, setItems] = useState<any[]>([]);
  const [cargando, setCargando] = useState<boolean>(false);
  const [modalAbierto, setModalAbierto] = useState<boolean>(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [guardando, setGuardando] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [piezasDesplegadas, setPiezasDesplegadas] = useState<Record<string, boolean>>({});

  const [form, setForm] = useState<any>({
    nombreItem: '',
    tipoCategoria: 'Mueble / Carpintería',
    esItemEspecial: false,
    descripcionEspecial: '',
    costoDirectoEspecial: '',
    porcentajeGanancia: 20,
    materialesAsignados: [
      { id: Date.now(), materialId: '', cantidad: 1, precioUnitario: 0, unidad: '', subtotal: 0 }
    ],
    piezasDespieceMueble: [
      { 
        id: Date.now(), 
        descripcion: 'Lateral Izquierdo', 
        cantidad: 1, 
        altoVeta: '', 
        ancho: '', 
        alto1: 'Sin Canto', 
        alto2: 'Sin Canto', 
        ancho1: 'Sin Canto', 
        ancho2: 'Sin Canto', 
        canto: 'PVC 0.45mm', 
        color: 'Roble Cava' 
      }
    ]
  });

  const cargarCatalogos = async () => {
    try {
      const [dataProyectos, dataMateriales] = await Promise.all([
        obtenerProyectos(),
        obtenerMateriales()
      ]);
      setProyectos(dataProyectos);
      setMateriales(dataMateriales);
      if (dataProyectos.length > 0 && !proyectoSeleccionado) {
        setProyectoSeleccionado(dataProyectos[0].id || '');
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    cargarCatalogos();
  }, []);

  const cargarItemsProyecto = async () => {
    if (!proyectoSeleccionado) return;
    setCargando(true);
    try {
      const data = await obtenerItemsPorProyecto(proyectoSeleccionado);
      setItems(data);
    } catch (err) {
      console.error(err);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarItemsProyecto();
  }, [proyectoSeleccionado]);

  const togglePiezas = (itemId: string) => {
    setPiezasDesplegadas(prev => ({ ...prev, [itemId]: !prev[itemId] }));
  };

  const handleAbrirModalNuevo = () => {
    setEditandoId(null);
    setForm({
      nombreItem: '',
      tipoCategoria: 'Mueble / Carpintería',
      esItemEspecial: false,
      descripcionEspecial: '',
      costoDirectoEspecial: '',
      porcentajeGanancia: 20,
      materialesAsignados: [
        { id: Date.now(), materialId: '', cantidad: 1, precioUnitario: 0, unidad: '', subtotal: 0 }
      ],
      piezasDespieceMueble: [
        { id: Date.now(), descripcion: 'Lateral Izquierdo', cantidad: 1, altoVeta: '', ancho: '', alto1: 'Sin Canto', alto2: 'Sin Canto', ancho1: 'Sin Canto', ancho2: 'Sin Canto', canto: 'PVC 0.45mm', color: 'Roble Cava' }
      ]
    });
    setErrorMsg('');
    setModalAbierto(true);
  };

  const handleAbrirModalEditar = (item: any) => {
    setEditandoId(item.id);
    setForm({
      nombreItem: item.nombreItem || '',
      tipoCategoria: item.tipoCategoria || 'Mueble / Carpintería',
      esItemEspecial: Boolean(item.esItemEspecial),
      descripcionEspecial: item.descripcionEspecial || '',
      costoDirectoEspecial: item.costoDirectoEspecial || '',
      porcentajeGanancia: item.porcentajeGanancia || 20,
      materialesAsignados: item.materiales || item.materialesAsignados || [
        { id: Date.now(), materialId: '', cantidad: 1, precioUnitario: 0, unidad: '', subtotal: 0 }
      ],
      piezasDespieceMueble: item.piezasDespieceMueble || []
    });
    setErrorMsg('');
    setModalAbierto(true);
  };

  // Cálculos
  const costoMateriales = form.esItemEspecial 
    ? (Number(form.costoDirectoEspecial) || 0)
    : form.materialesAsignados.reduce((acc: number, m: any) => acc + (Number(m.subtotal) || 0), 0);

  const ganancia = costoMateriales * (Number(form.porcentajeGanancia || 0) / 100);
  const precioTotalFinal = costoMateriales + ganancia;

  const handleGuardar = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form.nombreItem.trim()) return setErrorMsg('El nombre del ítem es obligatorio');
    setGuardando(true);
    try {
      const payload = {
        proyectoId: proyectoSeleccionado,
        nombreItem: form.nombreItem,
        tipoCategoria: form.tipoCategoria,
        esItemEspecial: form.esItemEspecial,
        descripcionEspecial: form.descripcionEspecial,
        costoDirectoEspecial: form.costoDirectoEspecial,
        costoMateriales,
        porcentajeGanancia: Number(form.porcentajeGanancia || 0),
        precioTotalFinal,
        materiales: form.materialesAsignados,
        piezasDespieceMueble: form.piezasDespieceMueble
      };

      if (editandoId) {
        await actualizarItemProyecto(editandoId, payload);
      } else {
        await crearItemProyecto(payload);
      }
      setModalAbierto(false);
      await cargarItemsProyecto();
    } catch (err: unknown) {
      const error = err as Error;
      setErrorMsg(error.message || 'Error al guardar ítem');
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminar = async (id: string, nombreItem: string) => {
    if (window.confirm(`¿Eliminar el ítem "${nombreItem}"?`)) {
      await eliminarItemProyecto(id);
      await cargarItemsProyecto();
    }
  };

  const handleExportarListaCorte = async (item: any) => {
    if (!item.piezasDespieceMueble || item.piezasDespieceMueble.length === 0) {
      return alert('Este ítem no tiene piezas de despiece para exportar');
    }
    try {
      const listaActual = await obtenerListaCortePorProyecto(proyectoSeleccionado);
      const piezasExistentes = listaActual?.piezas || [];
      const nuevasPiezas = item.piezasDespieceMueble.map((p: any) => ({
        ...p,
        id: Date.now() + Math.random(),
        descripcion: `${item.nombreItem} - ${p.descripcion}`
      }));
      await guardarListaCorteProyecto(proyectoSeleccionado, {
        piezas: [...piezasExistentes, ...nuevasPiezas]
      });
      alert(`✅ ${nuevasPiezas.length} piezas exportadas a la Lista de Corte Principal`);
    } catch (err) {
      console.error(err);
      alert('Error al exportar piezas');
    }
  };

  const calcularTotalesCantoMueble = (piezas: any[] = []) => {
    let totalFlexibleM = 0;
    let totalRigidoM = 0;

    (piezas || []).forEach(p => {
      const cant = parseFloat(p.cantidad) || 1;
      const altoM = (parseFloat(p.altoVeta) || 0) / 1000;
      const anchoM = (parseFloat(p.ancho) || 0) / 1000;

      if (p.alto1 === 'Flexible' || p.alto1 === 'Delgado 0.45mm') totalFlexibleM += altoM * cant;
      if (p.alto1 === 'Rígido' || p.alto1 === 'Grueso 2.0mm') totalRigidoM += altoM * cant;

      if (p.alto2 === 'Flexible' || p.alto2 === 'Delgado 0.45mm') totalFlexibleM += altoM * cant;
      if (p.alto2 === 'Rígido' || p.alto2 === 'Grueso 2.0mm') totalRigidoM += altoM * cant;

      if (p.ancho1 === 'Flexible' || p.ancho1 === 'Delgado 0.45mm') totalFlexibleM += anchoM * cant;
      if (p.ancho1 === 'Rígido' || p.ancho1 === 'Grueso 2.0mm') totalRigidoM += anchoM * cant;

      if (p.ancho2 === 'Flexible' || p.ancho2 === 'Delgado 0.45mm') totalFlexibleM += anchoM * cant;
      if (p.ancho2 === 'Rígido' || p.ancho2 === 'Grueso 2.0mm') totalRigidoM += anchoM * cant;
    });

    return {
      totalFlexibleM: totalFlexibleM.toFixed(2),
      totalRigidoM: totalRigidoM.toFixed(2)
    };
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Encabezado */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Box size={24} color="#38bdf8" />
            <span>Creador de Ítems Compuestos & Despiece</span>
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '4px' }}>
            Modelado de muebles a medida, asignación de materiales, despiece y cálculo de rentabilidad
          </p>
        </div>

        <button onClick={handleAbrirModalNuevo} className="btn btn-primary" style={{ gap: '8px' }}>
          <Plus size={18} /> + Crear Nuevo Ítem
        </button>
      </div>

      {/* Selector de Proyecto */}
      <div className="card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Folder size={22} color="#38bdf8" />
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc' }}>
            Proyecto de Obra:
          </h3>
        </div>
        <select
          className="input"
          value={proyectoSeleccionado}
          onChange={(e) => setProyectoSeleccionado(e.target.value)}
          style={{ minWidth: '260px', fontWeight: 600 }}
        >
          {proyectos.map(p => (
            <option key={p.id} value={p.id}>{p.nombre} ({p.codigoObra || 'N/A'})</option>
          ))}
        </select>
      </div>

      {/* Lista de Ítems Creados */}
      <ListaItemsProyecto
        items={items}
        piezasDesplegadas={piezasDesplegadas}
        onTogglePiezas={togglePiezas}
        onEditar={handleAbrirModalEditar}
        onEliminar={handleEliminar}
        onExportarListaCorte={handleExportarListaCorte}
        calcularTotalesCantoMueble={calcularTotalesCantoMueble}
      />

      {/* Modal Form */}
      <ModalForm
        abierto={modalAbierto}
        onClose={() => setModalAbierto(false)}
        titulo={editandoId ? 'Editar Ítem del Proyecto' : 'Crear Nuevo Ítem del Proyecto'}
        maxWidth="720px"
      >
        {errorMsg && (
          <div style={{ background: 'rgba(239,68,68,0.15)', color: '#fca5a5', padding: '10px 14px', borderRadius: '8px', marginBottom: '14px', fontSize: '0.85rem' }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleGuardar} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', color: '#94a3b8', marginBottom: '4px' }}>Nombre del Ítem / Mueble *</label>
              <input
                type="text"
                required
                className="input"
                placeholder="Ej: Cocina Integral Lineal 2.40m"
                value={form.nombreItem}
                onChange={(e) => setForm({ ...form, nombreItem: e.target.value })}
                style={{ width: '100%' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', color: '#94a3b8', marginBottom: '4px' }}>Categoría</label>
              <select className="input" value={form.tipoCategoria} onChange={(e) => setForm({ ...form, tipoCategoria: e.target.value })} style={{ width: '100%' }}>
                <option value="Mueble / Carpintería">Mueble / Carpintería</option>
                <option value="Obra Civil / Enchape">Obra Civil / Enchape</option>
                <option value="Servicio Directo">Servicio Directo</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', color: '#94a3b8', marginBottom: '4px' }}>Costo Directo Insumos ($ COP)</label>
              <input
                type="number"
                className="input"
                value={costoMateriales}
                onChange={(e) => setForm({ ...form, costoDirectoEspecial: e.target.value, esItemEspecial: true })}
                style={{ width: '100%', fontWeight: 600 }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', color: '#94a3b8', marginBottom: '4px' }}>% Margen de Ganancia (%)</label>
              <input
                type="number"
                className="input"
                value={form.porcentajeGanancia}
                onChange={(e) => setForm({ ...form, porcentajeGanancia: e.target.value })}
                style={{ width: '100%' }}
              />
            </div>
          </div>

          <div style={{ padding: '14px', background: 'rgba(56,189,248,0.08)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.9rem', color: '#94a3b8' }}>PRECIO FINAL SUGERIDO DE VENTA:</span>
            <strong style={{ fontSize: '1.25rem', color: '#38bdf8' }}>
              ${precioTotalFinal.toLocaleString()} COP
            </strong>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setModalAbierto(false)}>Cancelar</button>
            <button type="submit" disabled={guardando} className="btn btn-primary">
              {guardando ? 'Guardando...' : 'Guardar Ítem'}
            </button>
          </div>
        </form>
      </ModalForm>
    </div>
  );
}
