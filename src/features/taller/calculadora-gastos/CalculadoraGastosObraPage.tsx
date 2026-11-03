// ============================================================
// BLOQUE 1: IMPORTACIONES Y DEPENDENCIAS
// Qué hace: Calculadora técnica de costos indirectos: mano de obra, transporte, viáticos e imprevistos.
// Por qué: Arquitectura Feature-Driven y Regla 2.2 Manual Maestro.
// ============================================================
import React, { useState, useEffect } from 'react';
import { Truck, HardHat, Save, Folder, CheckCircle, Calculator, Coffee, Wrench } from 'lucide-react';
import { obtenerProyectos } from '../../../services/proyectosService';
import { obtenerGastosPorProyecto, guardarGastosProyecto } from '../../../services/gastosService';
import type { IProyecto } from '../../../types/proyecto';

// ============================================================
// BLOQUE 2: COMPONENTE PRINCIPAL — CALCULADORA DE GASTOS DE OBRA
// ============================================================
export default function CalculadoraGastosObraPage() {
  const [proyectos, setProyectos] = useState<IProyecto[]>([]);
  const [proyectoSeleccionado, setProyectoSeleccionado] = useState<string>('');

  const [cargando, setCargando] = useState<boolean>(false);
  const [guardando, setGuardando] = useState<boolean>(false);
  const [mensajeExito, setMensajeExito] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  const [form, setForm] = useState<any>({
    numOficiales: 1,
    numAyudantes: 1,
    diasTrabajoMO: 3,
    tarifaDiaOficial: 120000,
    tarifaDiaAyudante: 80000,
    fleteAcarreoTaller: 150000,
    fleteMateriales: 80000,
    combustiblePeajes: 50000,
    diasViaticos: 3,
    costoDiaViatico: 35000,
    totalConsumibles: 60000,
    porcentajeImprevistos: 5,
    gastosExtrasVarios: 100000,
    descripcionGastosExtras: 'Peajes, amarres y flete urbano de acarreos.'
  });

  const cargarProyectos = async () => {
    try {
      const dataProyectos = await obtenerProyectos();
      setProyectos(dataProyectos);
      if (dataProyectos.length > 0 && !proyectoSeleccionado) {
        setProyectoSeleccionado(dataProyectos[0].id || '');
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    cargarProyectos();
  }, []);

  const cargarGastos = async () => {
    if (!proyectoSeleccionado) return;
    setCargando(true);
    setErrorMsg('');
    setMensajeExito('');
    try {
      const data = await obtenerGastosPorProyecto(proyectoSeleccionado);
      if (data && (data as any).formDetallado) {
        setForm((data as any).formDetallado);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarGastos();
  }, [proyectoSeleccionado]);

  // Cálculos dinámicos
  const totalManoObra = (
    (Number(form.numOficiales || 0) * Number(form.tarifaDiaOficial || 0) * Number(form.diasTrabajoMO || 0)) +
    (Number(form.numAyudantes || 0) * Number(form.tarifaDiaAyudante || 0) * Number(form.diasTrabajoMO || 0))
  );

  const totalTransporte = (
    Number(form.fleteAcarreoTaller || 0) +
    Number(form.fleteMateriales || 0) +
    Number(form.combustiblePeajes || 0)
  );

  const totalViaticos = (
    (Number(form.numOficiales || 0) + Number(form.numAyudantes || 0)) *
    Number(form.diasViaticos || 0) *
    Number(form.costoDiaViatico || 0)
  );

  const totalConsumibles = Number(form.totalConsumibles || 0);
  const totalExtras = Number(form.gastosExtrasVarios || 0);

  const subtotalCostos = totalManoObra + totalTransporte + totalViaticos + totalConsumibles + totalExtras;
  const valorImprevistos = subtotalCostos * (Number(form.porcentajeImprevistos || 0) / 100);
  const granTotalGastosObra = subtotalCostos + valorImprevistos;

  const handleGuardar = async () => {
    if (!proyectoSeleccionado) return setErrorMsg('Selecciona un proyecto obligatoriamente');
    setGuardando(true);
    setErrorMsg('');
    setMensajeExito('');
    try {
      await guardarGastosProyecto(proyectoSeleccionado, {
        proyectoId: proyectoSeleccionado,
        diasLaborales: Number(form.diasTrabajoMO || 0),
        totalPagarPersonal: totalManoObra,
        valorTransporte: totalTransporte,
        valorAlimentacion: totalViaticos,
        valorImprevistos,
        totalGastosObra: granTotalGastosObra,
        ...({ formDetallado: form } as any)
      });
      setMensajeExito('✅ Gastos indirectos de obra guardados exitosamente');
    } catch (err: unknown) {
      const error = err as Error;
      setErrorMsg(error.message || 'Error al guardar gastos');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Encabezado */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calculator size={24} color="#38bdf8" />
            <span>Calculadora de Gastos Indirectos y Mano de Obra</span>
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '4px' }}>
            Cuantificación de mano de obra en taller y obra, acarreos, viáticos e imprevistos
          </p>
        </div>

        <button onClick={handleGuardar} disabled={guardando} className="btn btn-primary" style={{ gap: '6px' }}>
          <Save size={16} /> {guardando ? 'Guardando...' : '💾 Guardar Gastos'}
        </button>
      </div>

      {mensajeExito && (
        <div style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)', color: '#86efac', padding: '12px 16px', borderRadius: '8px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle size={18} />
          <span>{mensajeExito}</span>
        </div>
      )}

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

      {/* Tarjetas de Secciones de Costeo */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
        {/* Mano de Obra */}
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <HardHat size={20} color="#38bdf8" />
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc' }}>Mano de Obra</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Oficiales</label>
                <input type="number" className="input" value={form.numOficiales} onChange={(e) => setForm({ ...form, numOficiales: e.target.value })} style={{ width: '100%' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Tarifa Día Oficial</label>
                <input type="number" className="input" value={form.tarifaDiaOficial} onChange={(e) => setForm({ ...form, tarifaDiaOficial: e.target.value })} style={{ width: '100%' }} />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Ayudantes</label>
                <input type="number" className="input" value={form.numAyudantes} onChange={(e) => setForm({ ...form, numAyudantes: e.target.value })} style={{ width: '100%' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Tarifa Día Ayudante</label>
                <input type="number" className="input" value={form.tarifaDiaAyudante} onChange={(e) => setForm({ ...form, tarifaDiaAyudante: e.target.value })} style={{ width: '100%' }} />
              </div>
            </div>
            <div>
              <label style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Días Estimados de Trabajo</label>
              <input type="number" className="input" value={form.diasTrabajoMO} onChange={(e) => setForm({ ...form, diasTrabajoMO: e.target.value })} style={{ width: '100%' }} />
            </div>
            <div style={{ textAlign: 'right', fontWeight: 700, color: '#38bdf8', marginTop: '6px' }}>
              Subtotal MO: ${totalManoObra.toLocaleString()} COP
            </div>
          </div>
        </div>

        {/* Fletes y Logística */}
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <Truck size={20} color="#38bdf8" />
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc' }}>Fletes y Logística</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div>
              <label style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Acarreo de Taller a Obra ($ COP)</label>
              <input type="number" className="input" value={form.fleteAcarreoTaller} onChange={(e) => setForm({ ...form, fleteAcarreoTaller: e.target.value })} style={{ width: '100%' }} />
            </div>
            <div>
              <label style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Flete de Compra de Materiales ($ COP)</label>
              <input type="number" className="input" value={form.fleteMateriales} onChange={(e) => setForm({ ...form, fleteMateriales: e.target.value })} style={{ width: '100%' }} />
            </div>
            <div>
              <label style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Combustible y Peajes ($ COP)</label>
              <input type="number" className="input" value={form.combustiblePeajes} onChange={(e) => setForm({ ...form, combustiblePeajes: e.target.value })} style={{ width: '100%' }} />
            </div>
            <div style={{ textAlign: 'right', fontWeight: 700, color: '#38bdf8', marginTop: '6px' }}>
              Subtotal Logística: ${totalTransporte.toLocaleString()} COP
            </div>
          </div>
        </div>

        {/* Viáticos y Consumibles */}
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <Coffee size={20} color="#38bdf8" />
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc' }}>Viáticos e Imprevistos</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Días Viáticos</label>
                <input type="number" className="input" value={form.diasViaticos} onChange={(e) => setForm({ ...form, diasViaticos: e.target.value })} style={{ width: '100%' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Costo/Día Persona</label>
                <input type="number" className="input" value={form.costoDiaViatico} onChange={(e) => setForm({ ...form, costoDiaViatico: e.target.value })} style={{ width: '100%' }} />
              </div>
            </div>
            <div>
              <label style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Consumibles de Taller/Obra ($ COP)</label>
              <input type="number" className="input" value={form.totalConsumibles} onChange={(e) => setForm({ ...form, totalConsumibles: e.target.value })} style={{ width: '100%' }} />
            </div>
            <div>
              <label style={{ fontSize: '0.78rem', color: '#94a3b8' }}>% Imprevistos (%)</label>
              <input type="number" className="input" value={form.porcentajeImprevistos} onChange={(e) => setForm({ ...form, porcentajeImprevistos: e.target.value })} style={{ width: '100%' }} />
            </div>
            <div style={{ textAlign: 'right', fontWeight: 700, color: '#38bdf8', marginTop: '6px' }}>
              Subtotal Viáticos + Cons.: ${(totalViaticos + totalConsumibles + valorImprevistos).toLocaleString()} COP
            </div>
          </div>
        </div>
      </div>

      {/* Resumen Total */}
      <div className="card" style={{ padding: '20px', background: 'rgba(56,189,248,0.06)', border: '1px solid rgba(56,189,248,0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <span style={{ fontSize: '0.9rem', color: '#94a3b8' }}>TOTAL GASTOS INDIRECTOS ESTIMADOS DE LA OBRA:</span>
          <p style={{ margin: '2px 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>
            MO (${totalManoObra.toLocaleString()}) + Logística (${totalTransporte.toLocaleString()}) + Viáticos/Consumibles (${(totalViaticos + totalConsumibles).toLocaleString()}) + Imprevistos (${valorImprevistos.toLocaleString()})
          </p>
        </div>
        <strong style={{ fontSize: '1.4rem', color: '#38bdf8' }}>
          ${granTotalGastosObra.toLocaleString()} COP
        </strong>
      </div>
    </div>
  );
}
