// ============================================================
// BLOQUE 1: IMPORTACIONES Y DEPENDENCIAS
// Qué hace: Calculadora de medidas y cubicación rápida (m² y m.l.) por tramos y proyecto.
// Por qué: Arquitectura Feature-Driven y Regla 2.2 Manual Maestro.
// ============================================================
import React, { useState, useEffect } from 'react';
import { Calculator, Plus, Trash2, Edit3, Folder, Ruler } from 'lucide-react';
import { obtenerProyectos } from '../../../services/proyectosService';
import { obtenerMateriales } from '../../../services/materialesService';
import { obtenerMedicionesPorProyecto, crearMedicion, actualizarMedicion, eliminarMedicion } from '../../../services/medicionesService';
import ModalForm from '../../../components/ModalForm.jsx';

import type { IProyecto } from '../../../types/proyecto';
import type { IMaterial } from '../../../services/materialesService';

interface ITramo {
  id: number | string;
  etiqueta: string;
  alto: number | string;
  ancho: number | string;
  subtotal: number;
}

// ============================================================
// BLOQUE 2: COMPONENTE PRINCIPAL — CALCULADORA DE MEDIDAS
// ============================================================
export default function CalculadoraMedidasPage() {
  const [proyectos, setProyectos] = useState<IProyecto[]>([]);
  const [materiales, setMateriales] = useState<IMaterial[]>([]);
  const [proyectoSeleccionado, setProyectoSeleccionado] = useState<string>('');
  
  const [mediciones, setMediciones] = useState<any[]>([]);
  const [cargando, setCargando] = useState<boolean>(false);
  const [modalAbierto, setModalAbierto] = useState<boolean>(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [guardando, setGuardando] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const [form, setForm] = useState<any>({
    nombreZona: '',
    tipoCalculo: 'm²',
    materialId: '',
    tramos: [
      { id: Date.now(), etiqueta: 'Tramo 1', alto: '', ancho: '', subtotal: 0 }
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

  const cargarMediciones = async () => {
    if (!proyectoSeleccionado) return;
    setCargando(true);
    try {
      const data = await obtenerMedicionesPorProyecto(proyectoSeleccionado);
      setMediciones(data);
    } catch (err) {
      console.error(err);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarMediciones();
  }, [proyectoSeleccionado]);

  const calcularSubtotalTramo = (tramo: any, tipoCalculo: string) => {
    const altoNum = parseFloat(tramo.alto) || 0;
    const anchoNum = parseFloat(tramo.ancho) || 0;
    return tipoCalculo === 'm²' ? altoNum * anchoNum : (anchoNum > 0 ? anchoNum : altoNum);
  };

  const calcularTotalAcumulado = () => {
    return form.tramos.reduce((acc: number, t: any) => acc + (calcularSubtotalTramo(t, form.tipoCalculo)), 0);
  };

  const handleAgregarTramo = () => {
    setForm({
      ...form,
      tramos: [
        ...form.tramos,
        { id: Date.now(), etiqueta: `Tramo ${form.tramos.length + 1}`, alto: '', ancho: '', subtotal: 0 }
      ]
    });
  };

  const handleEliminarTramo = (idTramo: number | string) => {
    if (form.tramos.length === 1) return;
    setForm({ ...form, tramos: form.tramos.filter((t: any) => t.id !== idTramo) });
  };

  const handleCambioTramo = (idTramo: number | string, campo: string, valor: any) => {
    setForm({
      ...form,
      tramos: form.tramos.map((t: any) => {
        if (t.id === idTramo) {
          const mod = { ...t, [campo]: valor };
          mod.subtotal = calcularSubtotalTramo(mod, form.tipoCalculo);
          return mod;
        }
        return t;
      })
    });
  };

  const handleAbrirModalNuevo = () => {
    setEditandoId(null);
    setForm({
      nombreZona: '',
      tipoCalculo: 'm²',
      materialId: '',
      tramos: [{ id: Date.now(), etiqueta: 'Tramo 1', alto: '', ancho: '', subtotal: 0 }]
    });
    setErrorMsg('');
    setModalAbierto(true);
  };

  const handleAbrirModalRectificar = (med: any) => {
    setEditandoId(med.id);
    setForm({
      nombreZona: med.nombreZona || med.zona || '',
      tipoCalculo: med.tipoCalculo || 'm²',
      materialId: med.materialId || '',
      tramos: med.tramos || [{ id: Date.now(), etiqueta: 'Tramo 1', alto: med.alto || '', ancho: med.ancho || '', subtotal: 0 }]
    });
    setErrorMsg('');
    setModalAbierto(true);
  };

  const handleGuardar = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form.nombreZona.trim()) return setErrorMsg('El nombre de la zona es obligatorio');
    setGuardando(true);
    try {
      const mat = materiales.find(m => m.id === form.materialId);
      const totalAcumulado = calcularTotalAcumulado();
      const payload = {
        proyectoId: proyectoSeleccionado,
        nombreZona: form.nombreZona,
        zona: form.nombreZona,
        tipoCalculo: form.tipoCalculo,
        materialId: form.materialId,
        materialNombre: mat?.nombre || 'General / Sin Material',
        totalMedida: totalAcumulado,
        areaM2: form.tipoCalculo === 'm²' ? totalAcumulado : 0,
        tramos: form.tramos
      };

      if (editandoId) {
        await actualizarMedicion(editandoId, payload);
      } else {
        await crearMedicion(payload);
      }
      setModalAbierto(false);
      await cargarMediciones();
    } catch (err: unknown) {
      const error = err as Error;
      setErrorMsg(error.message || 'Error al guardar medición');
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminar = async (id: string, nombreZona: string) => {
    if (window.confirm(`¿Eliminar medición de "${nombreZona}"?`)) {
      await eliminarMedicion(id);
      await cargarMediciones();
    }
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Encabezado */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calculator size={24} color="#38bdf8" />
            <span>Calculadora de Medidas y Cubicación</span>
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '4px' }}>
            Cálculo de m² y m.l. por tramos para tableros, mesones, salpicaderos y enchapes
          </p>
        </div>

        <button onClick={handleAbrirModalNuevo} className="btn btn-primary" style={{ gap: '8px' }}>
          <Plus size={18} /> + Nueva Medición de Zona
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

      {/* Lista de Mediciones */}
      <div className="card" style={{ padding: '20px' }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc' }}>
          Zonas Cubizadas ({mediciones.length})
        </h3>

        {mediciones.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
            No hay mediciones registradas para este proyecto.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '14px' }}>
            {mediciones.map((m: any) => (
              <div key={m.id} style={{ padding: '16px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <strong style={{ fontSize: '1rem', color: '#f8fafc' }}>{m.nombreZona || m.zona}</strong>
                  <span className="badge badge-primary">{m.tipoCalculo || 'm²'}</span>
                </div>
                <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '10px' }}>
                  📦 {m.materialNombre || 'Material General'}
                </div>
                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#38bdf8', marginBottom: '12px' }}>
                  {Number(m.totalMedida || m.areaM2 || 0).toFixed(2)} {m.tipoCalculo || 'm²'}
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                  <button onClick={() => handleAbrirModalRectificar(m)} className="btn btn-secondary" style={{ padding: '6px 10px', fontSize: '0.78rem' }}>
                    <Edit3 size={13} /> Rectificar
                  </button>
                  <button onClick={() => handleEliminar(m.id, m.nombreZona || m.zona)} className="btn btn-secondary" style={{ padding: '6px 8px', color: '#f87171' }}>
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Form */}
      <ModalForm
        abierto={modalAbierto}
        onClose={() => setModalAbierto(false)}
        titulo={editandoId ? 'Rectificar Medición de Zona' : 'Nueva Medición de Zona'}
        maxWidth="640px"
      >
        {errorMsg && (
          <div style={{ background: 'rgba(239,68,68,0.15)', color: '#fca5a5', padding: '10px 14px', borderRadius: '8px', marginBottom: '14px', fontSize: '0.85rem' }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleGuardar} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', color: '#94a3b8', marginBottom: '4px' }}>Nombre de la Zona / Mueble *</label>
            <input
              type="text"
              required
              className="input"
              placeholder="Ej: Mesón Cocina Principal"
              value={form.nombreZona}
              onChange={(e) => setForm({ ...form, nombreZona: e.target.value })}
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', color: '#94a3b8', marginBottom: '4px' }}>Tipo de Unidad</label>
              <select className="input" value={form.tipoCalculo} onChange={(e) => setForm({ ...form, tipoCalculo: e.target.value })} style={{ width: '100%' }}>
                <option value="m²">Metros Cuadrados (m²)</option>
                <option value="m.l.">Metros Lineales (m.l.)</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', color: '#94a3b8', marginBottom: '4px' }}>Material Vinculado</label>
              <select className="input" value={form.materialId} onChange={(e) => setForm({ ...form, materialId: e.target.value })} style={{ width: '100%' }}>
                <option value="">-- General / Sin Material --</option>
                {materiales.map(m => (
                  <option key={m.id} value={m.id}>{m.nombre}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Tramos */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label style={{ fontSize: '0.82rem', color: '#94a3b8', fontWeight: 600 }}>Tramos de Medición</label>
              <button type="button" onClick={handleAgregarTramo} className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '4px 8px' }}>
                + Agregar Tramo
              </button>
            </div>

            {form.tramos.map((t: any, idx: number) => (
              <div key={t.id} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
                <input
                  type="text"
                  className="input"
                  value={t.etiqueta}
                  onChange={(e) => handleCambioTramo(t.id, 'etiqueta', e.target.value)}
                  style={{ width: '100%', fontSize: '0.8rem', padding: '6px' }}
                />
                <input
                  type="number"
                  step="0.01"
                  placeholder={form.tipoCalculo === 'm²' ? 'Alto (m)' : 'Largo (m)'}
                  className="input"
                  value={t.alto}
                  onChange={(e) => handleCambioTramo(t.id, 'alto', e.target.value)}
                  style={{ width: '100%', fontSize: '0.8rem', padding: '6px' }}
                />
                {form.tipoCalculo === 'm²' && (
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Ancho (m)"
                    className="input"
                    value={t.ancho}
                    onChange={(e) => handleCambioTramo(t.id, 'ancho', e.target.value)}
                    style={{ width: '100%', fontSize: '0.8rem', padding: '6px' }}
                  />
                )}
                <button type="button" onClick={() => handleEliminarTramo(t.id)} className="btn btn-secondary" style={{ padding: '6px 8px', color: '#f87171' }}>
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>

          <div style={{ padding: '12px', background: 'rgba(56,189,248,0.08)', borderRadius: '6px', textAlign: 'right' }}>
            <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Total Acumulado: </span>
            <strong style={{ fontSize: '1.15rem', color: '#38bdf8' }}>
              {calcularTotalAcumulado().toFixed(2)} {form.tipoCalculo}
            </strong>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setModalAbierto(false)}>Cancelar</button>
            <button type="submit" disabled={guardando} className="btn btn-primary">
              {guardando ? 'Guardando...' : 'Guardar Medición'}
            </button>
          </div>
        </form>
      </ModalForm>
    </div>
  );
}
