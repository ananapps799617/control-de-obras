// ============================================================
// BLOQUE 1: IMPORTACIONES Y DEPENDENCIAS
// Qué hace: Hoja de trabajo unificada para despiece masivo de tableros, vetas y cantos por proyecto.
// Por qué: Arquitectura Feature-Driven y Regla 2.2 Manual Maestro.
// ============================================================
import React, { useState, useEffect } from 'react';
import { Scissors, Plus, Trash2, Save, Folder, CheckCircle } from 'lucide-react';
import { obtenerProyectos } from '../../../services/proyectosService';
import { obtenerListaCortePorProyecto, guardarListaCorteProyecto, IPiezaCorte } from '../../../services/corteService';
import type { IProyecto } from '../../../types/proyecto';

// ============================================================
// BLOQUE 2: COMPONENTE PRINCIPAL — LISTA DE CORTE UNIFICADA
// ============================================================
export default function ListaCortePage() {
  const [proyectos, setProyectos] = useState<IProyecto[]>([]);
  const [proyectoSeleccionado, setProyectoSeleccionado] = useState<string>('');

  const [piezas, setPiezas] = useState<IPiezaCorte[]>([]);
  const [cargando, setCargando] = useState<boolean>(false);
  const [guardando, setGuardando] = useState<boolean>(false);
  const [mensajeExito, setMensajeExito] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  const cargarProyectos = async () => {
    try {
      const dataProyectos = await obtenerProyectos();
      setProyectos(dataProyectos);
      if (dataProyectos.length > 0 && !proyectoSeleccionado) {
        setProyectoSeleccionado(dataProyectos[0].id || '');
      }
    } catch (err) {
      console.error("Error al cargar proyectos:", err);
    }
  };

  useEffect(() => {
    cargarProyectos();
  }, []);

  const cargarListaProyecto = async () => {
    if (!proyectoSeleccionado) return;
    setCargando(true);
    setErrorMsg('');
    setMensajeExito('');
    try {
      const listaData = await obtenerListaCortePorProyecto(proyectoSeleccionado);
      if (listaData && listaData.piezas && listaData.piezas.length > 0) {
        setPiezas(listaData.piezas);
      } else {
        setPiezas([
          { id: Date.now(), descripcion: 'Lateral Izquierdo', cantidad: 1, altoVeta: '', ancho: '', alto1: 'Sin Canto', alto2: 'Sin Canto', ancho1: 'Sin Canto', ancho2: 'Sin Canto', canto: 'PVC 0.45mm', color: 'Roble Cava' },
          { id: Date.now() + 1, descripcion: 'Lateral Derecho', cantidad: 1, altoVeta: '', ancho: '', alto1: 'Sin Canto', alto2: 'Sin Canto', ancho1: 'Sin Canto', ancho2: 'Sin Canto', canto: 'PVC 0.45mm', color: 'Roble Cava' },
          { id: Date.now() + 2, descripcion: 'Techo / Piso', cantidad: 2, altoVeta: '', ancho: '', alto1: 'Sin Canto', alto2: 'Sin Canto', ancho1: 'Sin Canto', ancho2: 'Sin Canto', canto: 'PVC 0.45mm', color: 'Roble Cava' }
        ]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarListaProyecto();
  }, [proyectoSeleccionado]);

  const handleAgregarPieza = () => {
    setPiezas(prev => [
      ...prev,
      {
        id: Date.now(),
        descripcion: `Pieza #${prev.length + 1}`,
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
    ]);
  };

  const handleActualizarPieza = (id: number | string, campo: keyof IPiezaCorte, valor: any) => {
    setPiezas(prev => prev.map(p => p.id === id ? { ...p, [campo]: valor } : p));
  };

  const handleEliminarPieza = (id: number | string) => {
    setPiezas(prev => prev.filter(p => p.id !== id));
  };

  const handleGuardar = async () => {
    if (!proyectoSeleccionado) return setErrorMsg('Selecciona un proyecto obligatoriamente');
    setGuardando(true);
    setErrorMsg('');
    setMensajeExito('');
    try {
      await guardarListaCorteProyecto(proyectoSeleccionado, {
        nombreLista: 'Lista de Corte Principal',
        totalPiezas: piezas.reduce((acc, p) => acc + (Number(p.cantidad) || 0), 0),
        piezas
      });
      setMensajeExito('✅ Lista de corte guardada exitosamente');
    } catch (err: unknown) {
      const error = err as Error;
      setErrorMsg(error.message || 'Error al guardar lista de corte');
    } finally {
      setGuardando(false);
    }
  };

  const totalPiezas = piezas.reduce((acc, p) => acc + (Number(p.cantidad) || 0), 0);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Encabezado */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Scissors size={24} color="#38bdf8" />
            <span>Despiece y Lista de Corte de Tableros</span>
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '4px' }}>
            Hoja de cálculo directa para taller: dimensiones, orientación de veta, enchape de cantos y espesores
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={handleAgregarPieza} className="btn btn-secondary" style={{ gap: '6px' }}>
            <Plus size={16} /> + Agregar Pieza
          </button>
          <button onClick={handleGuardar} disabled={guardando} className="btn btn-primary" style={{ gap: '6px' }}>
            <Save size={16} /> {guardando ? 'Guardando...' : '💾 Guardar Lista'}
          </button>
        </div>
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
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
          <span className="badge badge-primary" style={{ fontSize: '0.85rem' }}>
            Total Piezas: {totalPiezas}
          </span>
        </div>
      </div>

      {/* Tabla Directa de Despiece */}
      <div className="card" style={{ padding: '16px', overflowX: 'auto' }}>
        <table className="table" style={{ width: '100%', fontSize: '0.82rem' }}>
          <thead>
            <tr>
              <th style={{ width: '30px' }}>#</th>
              <th>Descripción de Pieza</th>
              <th style={{ width: '70px' }}>Cant.</th>
              <th style={{ width: '100px' }}>Largo (Veta mm)</th>
              <th style={{ width: '100px' }}>Ancho (mm)</th>
              <th style={{ width: '110px' }}>Largo 1 (Canto)</th>
              <th style={{ width: '110px' }}>Largo 2 (Canto)</th>
              <th style={{ width: '110px' }}>Ancho 1 (Canto)</th>
              <th style={{ width: '110px' }}>Ancho 2 (Canto)</th>
              <th style={{ width: '120px' }}>Material / Color</th>
              <th style={{ width: '50px', textAlign: 'center' }}></th>
            </tr>
          </thead>
          <tbody>
            {piezas.map((p, idx) => (
              <tr key={p.id}>
                <td style={{ color: '#94a3b8' }}>{idx + 1}</td>
                <td>
                  <input
                    type="text"
                    className="input"
                    value={p.descripcion}
                    onChange={(e) => handleActualizarPieza(p.id, 'descripcion', e.target.value)}
                    style={{ width: '100%', padding: '4px 8px' }}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    min="1"
                    className="input font-mono-num"
                    value={p.cantidad}
                    onChange={(e) => handleActualizarPieza(p.id, 'cantidad', e.target.value)}
                    style={{ width: '100%', padding: '4px 8px', fontFamily: 'var(--font-mono)' }}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    placeholder="mm"
                    className="input font-mono-num"
                    value={p.altoVeta}
                    onChange={(e) => handleActualizarPieza(p.id, 'altoVeta', e.target.value)}
                    style={{ width: '100%', padding: '4px 8px', fontWeight: 600, color: '#38bdf8', fontFamily: 'var(--font-mono)' }}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    placeholder="mm"
                    className="input font-mono-num"
                    value={p.ancho}
                    onChange={(e) => handleActualizarPieza(p.id, 'ancho', e.target.value)}
                    style={{ width: '100%', padding: '4px 8px', fontWeight: 600, color: '#38bdf8', fontFamily: 'var(--font-mono)' }}
                  />
                </td>
                <td>
                  <select
                    className="input"
                    value={p.alto1}
                    onChange={(e) => handleActualizarPieza(p.id, 'alto1', e.target.value)}
                    style={{ width: '100%', padding: '4px 6px', fontSize: '0.75rem' }}
                  >
                    <option value="Sin Canto">Sin Canto</option>
                    <option value="Delgado 0.45mm">Delgado</option>
                    <option value="Grueso 2.0mm">Grueso</option>
                  </select>
                </td>
                <td>
                  <select
                    className="input"
                    value={p.alto2}
                    onChange={(e) => handleActualizarPieza(p.id, 'alto2', e.target.value)}
                    style={{ width: '100%', padding: '4px 6px', fontSize: '0.75rem' }}
                  >
                    <option value="Sin Canto">Sin Canto</option>
                    <option value="Delgado 0.45mm">Delgado</option>
                    <option value="Grueso 2.0mm">Grueso</option>
                  </select>
                </td>
                <td>
                  <select
                    className="input"
                    value={p.ancho1}
                    onChange={(e) => handleActualizarPieza(p.id, 'ancho1', e.target.value)}
                    style={{ width: '100%', padding: '4px 6px', fontSize: '0.75rem' }}
                  >
                    <option value="Sin Canto">Sin Canto</option>
                    <option value="Delgado 0.45mm">Delgado</option>
                    <option value="Grueso 2.0mm">Grueso</option>
                  </select>
                </td>
                <td>
                  <select
                    className="input"
                    value={p.ancho2}
                    onChange={(e) => handleActualizarPieza(p.id, 'ancho2', e.target.value)}
                    style={{ width: '100%', padding: '4px 6px', fontSize: '0.75rem' }}
                  >
                    <option value="Sin Canto">Sin Canto</option>
                    <option value="Delgado 0.45mm">Delgado</option>
                    <option value="Grueso 2.0mm">Grueso</option>
                  </select>
                </td>
                <td>
                  <input
                    type="text"
                    className="input"
                    value={p.color || ''}
                    onChange={(e) => handleActualizarPieza(p.id, 'color', e.target.value)}
                    style={{ width: '100%', padding: '4px 8px' }}
                  />
                </td>
                <td style={{ textAlign: 'center' }}>
                  <button onClick={() => handleEliminarPieza(p.id)} className="btn btn-secondary" style={{ padding: '4px 6px', color: '#f87171' }}>
                    <Trash2 size={13} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
