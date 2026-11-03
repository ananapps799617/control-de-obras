// ============================================================
// ARCHIVO: src/features/carpinteria/components/ResumenHerrajes3D.tsx
// QUÉ HACE: Tabla técnica de herrajes calculados con precios de Firestore y exportación a Obra.
// POR QUÉ: Conecta el diseño 3D con el catálogo real del taller y el presupuesto ($ COP).
// ============================================================
import React, { useState, useEffect } from 'react';
import { Wrench, Check, Sparkles, Database } from 'lucide-react';
import { CabinetSpec, CabinetPart } from '../types/cabinet3d';
import { TableroLibre } from '../types/freeDesign';
import { IHerrajeCalculado } from '../types/herrajes';
import { calcularHerrajesParametricos, calcularHerrajesLibres } from '../math/herrajesCalculator';
import { IHerrajeDB, obtenerHerrajesFirestore } from '../services/herrajesService';
import { exportarDisenoAItemProyecto } from '../services/itemObraTransformer';
import { obtenerProyectos } from '../../../services/proyectosService';
import { IProyecto } from '../../../types/proyecto';

interface Props {
  spec: CabinetSpec;
  parts: CabinetPart[];
  modoDiseno?: 'parametrico' | 'libre';
  tablerosLibres?: TableroLibre[];
}

export default function ResumenHerrajes3D({
  spec,
  parts,
  modoDiseno = 'parametrico',
  tablerosLibres = []
}: Props) {
  const [proyectos, setProyectos] = useState<IProyecto[]>([]);
  const [proyectoSeleccionado, setProyectoSeleccionado] = useState<string>('');
  const [herrajesDB, setHerrajesDB] = useState<IHerrajeDB[]>([]);
  const [nombreItem, setNombreItem] = useState<string>(spec.nombre);
  const [margenGanancia, setMargenGanancia] = useState<number>(35);
  const [guardando, setGuardando] = useState<boolean>(false);
  const [guardadoExitoso, setGuardadoExitoso] = useState<boolean>(false);

  // 1. Cargar Proyectos y Catálogo de Herrajes de Firestore
  useEffect(() => {
    obtenerProyectos().then(proys => {
      setProyectos(proys || []);
      if (proys && proys.length > 0) {
        setProyectoSeleccionado(proys[0].id || '');
      }
    }).catch(console.error);

    obtenerHerrajesFirestore().then(hList => {
      setHerrajesDB(hList);
    }).catch(console.error);
  }, []);

  useEffect(() => {
    setNombreItem(modoDiseno === 'libre' ? 'Mobiliario Diseño Libre' : spec.nombre);
  }, [spec.nombre, modoDiseno]);

  // 2. Calcular herrajes base
  const herrajesBase: IHerrajeCalculado[] = modoDiseno === 'libre'
    ? calcularHerrajesLibres(tablerosLibres)
    : calcularHerrajesParametricos(spec, parts);

  // 3. Sincronizar precios con el catálogo de Firestore si existe coincidencia
  const herrajes: IHerrajeCalculado[] = herrajesBase.map(h => {
    const matchDB = herrajesDB.find(dbH => 
      dbH.nombre.toLowerCase().includes(h.nombre.toLowerCase()) ||
      h.nombre.toLowerCase().includes(dbH.nombre.toLowerCase()) ||
      (dbH.subcategoria && dbH.subcategoria === h.categoria)
    );

    if (matchDB && matchDB.precioUnitario > 0) {
      return {
        ...h,
        nombre: matchDB.nombre,
        precioUnitario: matchDB.precioUnitario,
        subtotal: Math.round(h.cantidad * matchDB.precioUnitario),
        origen: 'automatico'
      };
    }
    return h;
  });

  const totalHerrajesCOP = herrajes.reduce((acc, h) => acc + h.subtotal, 0);

  const handleCrearItemObra = async () => {
    if (!proyectoSeleccionado) {
      alert("Por favor selecciona un Proyecto activo.");
      return;
    }
    setGuardando(true);
    setGuardadoExitoso(false);
    try {
      await exportarDisenoAItemProyecto(
        proyectoSeleccionado,
        nombreItem,
        spec,
        parts,
        herrajes,
        margenGanancia,
        modoDiseno,
        tablerosLibres
      );
      setGuardadoExitoso(true);
      setTimeout(() => setGuardadoExitoso(false), 3500);
    } catch (err: any) {
      alert("Error al exportar ítem: " + (err.message || err));
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
              <Wrench size={18} color="#f59e0b" />
              <span>Herrajes, Tornillería & Accesorios Calculados</span>
            </h3>
            {herrajesDB.length > 0 && (
              <span className="badge-cyan" style={{ fontSize: '0.68rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Database size={10} /> {herrajesDB.length} en BD
              </span>
            )}
          </div>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
            {herrajes.length} accesorios • Total Ferretería: <strong className="font-mono-num" style={{ color: '#f59e0b' }}>${totalHerrajesCOP.toLocaleString('es-CO')} COP</strong>
          </span>
        </div>

        {/* Panel de Conversión a Ítem Compuesto */}
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
          {proyectos.length > 0 && (
            <select
              className="input"
              value={proyectoSeleccionado}
              onChange={(e) => setProyectoSeleccionado(e.target.value)}
              style={{ fontSize: '0.78rem', padding: '6px 8px', maxWidth: '170px' }}
            >
              {proyectos.map(p => (
                <option key={p.id} value={p.id}>{p.nombre || p.codigoObra || 'Proyecto'}</option>
              ))}
            </select>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Margen:</span>
            <select
              className="input font-mono-num"
              value={margenGanancia}
              onChange={(e) => setMargenGanancia(Number(e.target.value))}
              style={{ fontSize: '0.75rem', padding: '6px 6px', width: '70px' }}
            >
              <option value={25}>25%</option>
              <option value={35}>35%</option>
              <option value={45}>45%</option>
              <option value={55}>55%</option>
            </select>
          </div>

          <button
            type="button"
            className="btn-primary-wood"
            onClick={handleCrearItemObra}
            disabled={guardando || herrajes.length === 0}
            style={{ fontSize: '0.78rem', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '6px', background: '#f59e0b', color: '#0f172a', fontWeight: 700 }}
          >
            {guardadoExitoso ? <Check size={14} /> : <Sparkles size={14} />}
            <span>{guardadoExitoso ? '¡Ítem Creado en Obra!' : (guardando ? 'Compilando...' : 'Crear Ítem en Proyecto')}</span>
          </button>
        </div>
      </div>

      {/* Tabla de Herrajes */}
      <div style={{ overflowX: 'auto', maxHeight: '280px', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '6px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--text-secondary)', textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              <th style={{ padding: '8px 10px' }}>Accesorio / Herraje</th>
              <th style={{ padding: '8px 10px' }}>Categoría</th>
              <th style={{ padding: '8px 10px', textAlign: 'center' }}>Cantidad</th>
              <th style={{ padding: '8px 10px', textAlign: 'right' }}>Precio Unit ($)</th>
              <th style={{ padding: '8px 10px', textAlign: 'right' }}>Subtotal ($ COP)</th>
            </tr>
          </thead>
          <tbody>
            {herrajes.map((h) => (
              <tr key={h.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                <td style={{ padding: '6px 10px', fontWeight: 600, color: 'var(--text-main)' }}>
                  {h.nombre}
                </td>
                <td style={{ padding: '6px 10px', color: 'var(--text-secondary)', fontSize: '0.72rem' }}>
                  {h.categoria}
                </td>
                <td className="font-mono-num" style={{ padding: '6px 10px', textAlign: 'center', color: '#f59e0b' }}>
                  {h.cantidad} {h.unidad}
                </td>
                <td className="font-mono-num" style={{ padding: '6px 10px', color: 'var(--text-secondary)' }}>
                  ${h.precioUnitario.toLocaleString('es-CO')}
                </td>
                <td className="font-mono-num" style={{ padding: '6px 10px', color: '#10b981', fontWeight: 600 }}>
                  ${h.subtotal.toLocaleString('es-CO')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
