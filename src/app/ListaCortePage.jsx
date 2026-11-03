import React, { useState, useEffect } from 'react';
import { Scissors, Plus, Trash2, Save, Folder, CheckCircle, RefreshCw } from 'lucide-react';
import { obtenerProyectos } from '../services/proyectosService';
import { obtenerListaCortePorProyecto, guardarListaCorteProyecto } from '../services/corteService';

// ============================================================
// BLOQUE 1: COMPONENTE TABLA DIRECTA UNIFICADA DE CORTE
// Qué hace: Hoja de trabajo directa para despiece de tableros (sin modales) por proyecto.
// Por qué: Optimizado para habilitar listas masivas de 50 a 70 piezas en taller.
// ============================================================
export default function ListaCortePage() {
  const [proyectos, setProyectos] = useState([]);
  const [proyectoSeleccionado, setProyectoSeleccionado] = useState('');

  const [piezas, setPiezas] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [mensajeExito, setMensajeExito] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const cargarProyectos = async () => {
    try {
      const dataProyectos = await obtenerProyectos();
      setProyectos(dataProyectos);
      if (dataProyectos.length > 0 && !proyectoSeleccionado) {
        setProyectoSeleccionado(dataProyectos[0].id);
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
        // Inicializar con 3 filas vacías de ejemplo si la lista está vacía
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

  // Agregar fila instantáneamente directamente a la tabla
  const handleAgregarPiezaDirecta = () => {
    const ultimoColor = piezas.length > 0 ? piezas[piezas.length - 1].color : 'Roble Cava';
    const ultimoCanto = piezas.length > 0 ? piezas[piezas.length - 1].canto : 'PVC 0.45mm';

    setPiezas([
      ...piezas,
      {
        id: Date.now(),
        descripcion: `Pieza ${piezas.length + 1}`,
        cantidad: 1,
        altoVeta: '',
        ancho: '',
        alto1: 'Sin Canto',
        alto2: 'Sin Canto',
        ancho1: 'Sin Canto',
        ancho2: 'Sin Canto',
        canto: ultimoCanto,
        color: ultimoColor
      }
    ]);
  };

  const handleEliminarPiezaDirecta = (idPieza) => {
    setPiezas(piezas.filter(p => p.id !== idPieza));
  };

  const handleCambioFilaPieza = (idPieza, campo, valor) => {
    setPiezas(piezas.map(p => {
      if (p.id === idPieza) {
        return { ...p, [campo]: valor };
      }
      return p;
    }));
  };

  // Calcular en tiempo real la sumatoria de metros de canto Flexible y Rígido evaluando CADA LADO INDIVIDUALMENTE
  const calcularTotalesCanto = () => {
    let totalFlexibleM = 0;
    let totalRigidoM = 0;

    piezas.forEach(p => {
      const cant = parseInt(p.cantidad) || 0;
      if (cant <= 0) return;

      // Convertir mm a metros si la medida es mayor a 20 (ej: 2100 mm -> 2.10 m)
      const altoM = parseFloat(p.altoVeta) > 20 ? parseFloat(p.altoVeta) / 1000 : parseFloat(p.altoVeta) || 0;
      const anchoM = parseFloat(p.ancho) > 20 ? parseFloat(p.ancho) / 1000 : parseFloat(p.ancho) || 0;

      // 1. Lado Alto 1
      if (p.alto1 === 'Flexible') totalFlexibleM += altoM * cant;
      if (p.alto1 === 'Rígido')   totalRigidoM   += altoM * cant;

      // 2. Lado Alto 2
      if (p.alto2 === 'Flexible') totalFlexibleM += altoM * cant;
      if (p.alto2 === 'Rígido')   totalRigidoM   += altoM * cant;

      // 3. Lado Ancho 1
      if (p.ancho1 === 'Flexible') totalFlexibleM += anchoM * cant;
      if (p.ancho1 === 'Rígido')   totalRigidoM   += anchoM * cant;

      // 4. Lado Ancho 2
      if (p.ancho2 === 'Flexible') totalFlexibleM += anchoM * cant;
      if (p.ancho2 === 'Rígido')   totalRigidoM   += anchoM * cant;
    });

    return {
      totalFlexibleM: totalFlexibleM.toFixed(2),
      totalRigidoM: totalRigidoM.toFixed(2)
    };
  };

  const totalesCanto = calcularTotalesCanto();

  const handleGuardarListaCompleta = async () => {
    setErrorMsg('');
    setMensajeExito('');

    if (!proyectoSeleccionado) {
      return setErrorMsg('⚠️ Debes seleccionar un Proyecto obligatoriamente.');
    }
    if (piezas.length === 0) {
      return setErrorMsg('La lista de corte está vacía. Haz clic en "+ Agregar Pieza".');
    }

    const totalPiezasCant = piezas.reduce((acc, p) => acc + (parseInt(p.cantidad) || 0), 0);

    const payload = {
      nombreLista: 'Lista de Corte Principal',
      totalPiezas: totalPiezasCant,
      totalCantoFlexible: parseFloat(totalesCanto.totalFlexibleM),
      totalCantoRigido: parseFloat(totalesCanto.totalRigidoM),
      piezas: piezas.map(p => ({
        id: p.id,
        descripcion: p.descripcion || 'Pieza',
        cantidad: parseInt(p.cantidad) || 1,
        altoVeta: p.altoVeta || '',
        ancho: p.ancho || '',
        alto1: p.alto1 || 'Sin Canto',
        alto2: p.alto2 || 'Sin Canto',
        ancho1: p.ancho1 || 'Sin Canto',
        ancho2: p.ancho2 || 'Sin Canto',
        canto: p.canto || '',
        color: p.color || ''
      }))
    };

    setGuardando(true);
    try {
      await guardarListaCorteProyecto(proyectoSeleccionado, payload);
      setMensajeExito(`✅ ¡Lista de Corte guardada en Firestore! (Flexible: ${totalesCanto.totalFlexibleM} m.l. | Rígido: ${totalesCanto.totalRigidoM} m.l.)`);
      setTimeout(() => setMensajeExito(''), 5000);
    } catch (err) {
      setErrorMsg(err.message || 'Error al guardar la lista de corte en Firebase');
    } finally {
      setGuardando(false);
    }
  };

  const totalUnidadesCorte = piezas.reduce((acc, p) => acc + (parseInt(p.cantidad) || 0), 0);
  const proyectoActual = proyectos.find(p => p.id === proyectoSeleccionado);

  const getCantoBadgeStyle = (valorCanto) => {
    switch (valorCanto) {
      case 'Flexible': return { background: 'rgba(52, 211, 153, 0.2)', color: '#34d399', border: '1px solid rgba(52, 211, 153, 0.4)' };
      case 'Rígido': return { background: 'rgba(251, 146, 60, 0.2)', color: '#fb923c', border: '1px solid rgba(251, 146, 60, 0.4)' };
      default: return { background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)' };
    }
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
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0 }}>Generador de Lista de Corte</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
            Hoja de despiece técnico directo por proyecto para taller.
          </p>
        </div>
      </div>

      {/* Selector de Proyecto Obligatorio */}
      <div className="card" style={{ marginBottom: '20px', background: 'rgba(30,41,59,0.7)', border: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <Folder size={20} color="var(--color-primary)" />
          <div style={{ flex: 1, minWidth: '220px' }}>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
              PROYECTO SELECCIONADO (OBLIGATORIO) *
            </label>
            <select 
              className="input-field" 
              value={proyectoSeleccionado}
              onChange={(e) => setProyectoSeleccionado(e.target.value)}
              style={{ fontWeight: 600, color: 'var(--color-primary)' }}
            >
              <option value="">-- Selecciona el Proyecto de Obra --</option>
              {proyectos.map(p => (
                <option key={p.id} value={p.id}>
                  {p.nombre} ({p.codigoCotizacion || p.tipoCotizacion || 'Sin Código'})
                </option>
              ))}
            </select>
          </div>

          {proyectoActual && (
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span className="badge badge-success">
                📄 {proyectoActual.codigoCotizacion || proyectoActual.tipoCotizacion}
              </span>
              <span className="badge badge-info">
                📍 {proyectoActual.lugarObra || 'Proyecto Activo'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Mensajes de Estado */}
      {mensajeExito && (
        <div style={{ padding: '12px 16px', background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)', color: '#4ade80', borderRadius: '8px', marginBottom: '16px', fontWeight: 600 }}>
          {mensajeExito}
        </div>
      )}
      {errorMsg && (
        <div style={{ padding: '12px 16px', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5', borderRadius: '8px', marginBottom: '16px', fontSize: '0.88rem' }}>
          {errorMsg}
        </div>
      )}

      {/* Barra de Métricas y Acciones Directas de la Tabla */}
      {proyectoSeleccionado && (
        <div style={{ 
          display: 'flex', 
          justify: 'space-between', 
          alignItems: 'center', 
          gap: '12px', 
          flexWrap: 'wrap',
          marginBottom: '14px',
          background: 'rgba(15,23,42,0.8)',
          padding: '14px 18px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid rgba(56, 189, 248, 0.2)'
        }}>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <button 
              onClick={handleAgregarPiezaDirecta} 
              className="btn btn-secondary"
              style={{ fontSize: '0.88rem', gap: '6px', minHeight: '38px' }}
            >
              <Plus size={16} /> + Agregar Pieza
            </button>

            {/* Badges de Canto Calculados Lado por Lado en Tiempo Real */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center', marginLeft: '6px' }}>
              <span style={{ 
                background: 'rgba(52, 211, 153, 0.15)', 
                border: '1px solid rgba(52, 211, 153, 0.4)', 
                color: '#34d399', 
                padding: '6px 12px', 
                borderRadius: '20px', 
                fontSize: '0.82rem',
                fontWeight: 600
              }}>
                🎗️ Canto Flexible: <strong>{totalesCanto.totalFlexibleM} m.l.</strong>
              </span>

              <span style={{ 
                background: 'rgba(251, 146, 60, 0.15)', 
                border: '1px solid rgba(251, 146, 60, 0.4)', 
                color: '#fb923c', 
                padding: '6px 12px', 
                borderRadius: '20px', 
                fontSize: '0.82rem',
                fontWeight: 600
              }}>
                🎗️ Canto Rígido: <strong>{totalesCanto.totalRigidoM} m.l.</strong>
              </span>

              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginLeft: '4px' }}>
                ({totalUnidadesCorte} unid / {piezas.length} filas)
              </span>
            </div>
          </div>

          <button 
            onClick={handleGuardarListaCompleta} 
            className="btn btn-primary"
            style={{ fontSize: '0.88rem', gap: '8px', minHeight: '38px' }}
            disabled={guardando || cargando}
          >
            <Save size={16} /> {guardando ? 'Guardando en Firebase...' : '💾 Guardar Lista de Corte'}
          </button>
        </div>
      )}

      {/* Tabla Directa de Trabajo (Sin Modales) */}
      {!proyectoSeleccionado ? (
        <div className="card" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
          Selecciona un <strong>Proyecto de Obra</strong> para desplegar la tabla de corte.
        </div>
      ) : cargando ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
          Cargando tabla de corte desde Firestore...
        </div>
      ) : (
        <div className="card" style={{ padding: '16px', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', textAlign: 'left', minWidth: '950px' }}>
            <thead>
              <tr style={{ background: '#0f172a', color: 'var(--color-primary)', borderBottom: '2px solid rgba(56, 189, 248, 0.3)' }}>
                <th style={{ padding: '10px 8px', width: '38px', textAlign: 'center' }}>#</th>
                <th style={{ padding: '10px 8px', width: '200px' }}>Descripción *</th>
                <th style={{ padding: '10px 8px', width: '60px', textAlign: 'center' }}>Cant.</th>
                <th style={{ padding: '10px 8px', width: '90px' }}>Alto (Veta) *</th>
                <th style={{ padding: '10px 8px', width: '90px' }}>Ancho *</th>
                <th style={{ padding: '10px 8px', width: '100px' }}>Alto 1 (Top)</th>
                <th style={{ padding: '10px 8px', width: '100px' }}>Alto 2 (Bottom)</th>
                <th style={{ padding: '10px 8px', width: '100px' }}>Ancho 1 (Left)</th>
                <th style={{ padding: '10px 8px', width: '100px' }}>Ancho 2 (Right)</th>
                <th style={{ padding: '10px 8px', width: '120px' }}>Canto</th>
                <th style={{ padding: '10px 8px', width: '130px' }}>Color</th>
                <th style={{ padding: '10px 8px', width: '40px', textAlign: 'center' }}></th>
              </tr>
            </thead>
            <tbody>
              {piezas.map((p, idx) => (
                <tr key={p.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)' }}>
                  <td style={{ padding: '6px 4px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                    {idx + 1}
                  </td>

                  {/* Descripción */}
                  <td style={{ padding: '6px 4px' }}>
                    <input 
                      type="text" 
                      className="input-field" 
                      style={{ padding: '6px 8px', fontSize: '0.82rem', fontWeight: 600 }}
                      value={p.descripcion}
                      onChange={(e) => handleCambioFilaPieza(p.id, 'descripcion', e.target.value)}
                      placeholder="Lateral / Puerta"
                    />
                  </td>

                  {/* Cantidad */}
                  <td style={{ padding: '6px 4px' }}>
                    <input 
                      type="number" 
                      className="input-field" 
                      style={{ padding: '6px 4px', fontSize: '0.82rem', textAlign: 'center', fontWeight: 700, color: '#38bdf8' }}
                      value={p.cantidad}
                      onChange={(e) => handleCambioFilaPieza(p.id, 'cantidad', e.target.value)}
                    />
                  </td>

                  {/* Alto Veta */}
                  <td style={{ padding: '6px 4px' }}>
                    <input 
                      type="text" 
                      className="input-field" 
                      style={{ padding: '6px 8px', fontSize: '0.82rem', fontFamily: 'var(--font-mono)' }}
                      value={p.altoVeta}
                      onChange={(e) => handleCambioFilaPieza(p.id, 'altoVeta', e.target.value)}
                      placeholder="2100"
                    />
                  </td>

                  {/* Ancho */}
                  <td style={{ padding: '6px 4px' }}>
                    <input 
                      type="text" 
                      className="input-field" 
                      style={{ padding: '6px 8px', fontSize: '0.82rem', fontFamily: 'var(--font-mono)' }}
                      value={p.ancho}
                      onChange={(e) => handleCambioFilaPieza(p.id, 'ancho', e.target.value)}
                      placeholder="550"
                    />
                  </td>

                  {/* Alto 1 */}
                  <td style={{ padding: '6px 4px' }}>
                    <select 
                      className="input-field"
                      style={{ padding: '6px 4px', fontSize: '0.78rem', ...getCantoBadgeStyle(p.alto1) }}
                      value={p.alto1 || 'Sin Canto'}
                      onChange={(e) => handleCambioFilaPieza(p.id, 'alto1', e.target.value)}
                    >
                      <option value="Sin Canto">- Sin Canto</option>
                      <option value="Flexible">Flexible</option>
                      <option value="Rígido">Rígido</option>
                    </select>
                  </td>

                  {/* Alto 2 */}
                  <td style={{ padding: '6px 4px' }}>
                    <select 
                      className="input-field"
                      style={{ padding: '6px 4px', fontSize: '0.78rem', ...getCantoBadgeStyle(p.alto2) }}
                      value={p.alto2 || 'Sin Canto'}
                      onChange={(e) => handleCambioFilaPieza(p.id, 'alto2', e.target.value)}
                    >
                      <option value="Sin Canto">- Sin Canto</option>
                      <option value="Flexible">Flexible</option>
                      <option value="Rígido">Rígido</option>
                    </select>
                  </td>

                  {/* Ancho 1 */}
                  <td style={{ padding: '6px 4px' }}>
                    <select 
                      className="input-field"
                      style={{ padding: '6px 4px', fontSize: '0.78rem', ...getCantoBadgeStyle(p.ancho1) }}
                      value={p.ancho1 || 'Sin Canto'}
                      onChange={(e) => handleCambioFilaPieza(p.id, 'ancho1', e.target.value)}
                    >
                      <option value="Sin Canto">- Sin Canto</option>
                      <option value="Flexible">Flexible</option>
                      <option value="Rígido">Rígido</option>
                    </select>
                  </td>

                  {/* Ancho 2 */}
                  <td style={{ padding: '6px 4px' }}>
                    <select 
                      className="input-field"
                      style={{ padding: '6px 4px', fontSize: '0.78rem', ...getCantoBadgeStyle(p.ancho2) }}
                      value={p.ancho2 || 'Sin Canto'}
                      onChange={(e) => handleCambioFilaPieza(p.id, 'ancho2', e.target.value)}
                    >
                      <option value="Sin Canto">- Sin Canto</option>
                      <option value="Flexible">Flexible</option>
                      <option value="Rígido">Rígido</option>
                    </select>
                  </td>

                  {/* Canto */}
                  <td style={{ padding: '6px 4px' }}>
                    <input 
                      type="text" 
                      className="input-field" 
                      style={{ padding: '6px 8px', fontSize: '0.82rem' }}
                      value={p.canto}
                      onChange={(e) => handleCambioFilaPieza(p.id, 'canto', e.target.value)}
                      placeholder="PVC 0.45mm"
                    />
                  </td>

                  {/* Color */}
                  <td style={{ padding: '6px 4px' }}>
                    <input 
                      type="text" 
                      className="input-field" 
                      style={{ padding: '6px 8px', fontSize: '0.82rem' }}
                      value={p.color}
                      onChange={(e) => handleCambioFilaPieza(p.id, 'color', e.target.value)}
                      placeholder="Roble Cava"
                    />
                  </td>

                  {/* Eliminar Fila */}
                  <td style={{ padding: '6px 4px', textAlign: 'center' }}>
                    <button 
                      onClick={() => handleEliminarPiezaDirecta(p.id)}
                      style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', padding: '4px' }}
                      title="Eliminar Pieza"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pie de Tabla con botón para añadir más piezas */}
          <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'between', gap: '12px' }}>
            <button 
              onClick={handleAgregarPiezaDirecta} 
              className="btn btn-secondary"
              style={{ fontSize: '0.85rem', gap: '6px' }}
            >
              <Plus size={16} /> + Agregar Otra Pieza a la Tabla
            </button>

            <button 
              onClick={handleGuardarListaCompleta} 
              className="btn btn-primary"
              style={{ fontSize: '0.88rem', gap: '8px', marginLeft: 'auto' }}
              disabled={guardando}
            >
              <Save size={16} /> {guardando ? 'Guardando...' : '💾 Guardar Cambios en Firestore'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
