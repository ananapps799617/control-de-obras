// ============================================================
// ARCHIVO: src/features/carpinteria/components/ResumenDespiece3D.tsx
// QUÉ HACE: Tabla técnica en tiempo real del despiece 3D y transferencia a Taller.
// POR QUÉ: Cero duplicidad y conexión inmediata con corteService y proyectos.
// ============================================================
import React, { useState, useEffect } from 'react';
import { Scissors, Check, FolderDown } from 'lucide-react';
import { CabinetPart, CabinetSpec } from '../types/cabinet3d';
import { TableroLibre } from '../types/freeDesign';
import { transformarPartesAListaCorte, transformarTablerosLibresAListaCorte } from '../services/corteTransformer';
import { guardarListaCorteProyecto, IPiezaCorte } from '../../../services/corteService';
import { obtenerProyectos } from '../../../services/proyectosService';
import { IProyecto } from '../../../types/proyecto';

interface Props {
  spec: CabinetSpec;
  parts: CabinetPart[];
  modoDiseno?: 'parametrico' | 'libre';
  tablerosLibres?: TableroLibre[];
}

export default function ResumenDespiece3D({
  spec,
  parts,
  modoDiseno = 'parametrico',
  tablerosLibres = []
}: Props) {
  const [proyectos, setProyectos] = useState<IProyecto[]>([]);
  const [proyectoSeleccionado, setProyectoSeleccionado] = useState<string>('');
  const [guardando, setGuardando] = useState<boolean>(false);
  const [guardadoExitoso, setGuardadoExitoso] = useState<boolean>(false);

  const listaCortePiezas: IPiezaCorte[] = modoDiseno === 'libre'
    ? transformarTablerosLibresAListaCorte(tablerosLibres)
    : transformarPartesAListaCorte(parts, spec);

  const totalPiezas = modoDiseno === 'libre' ? tablerosLibres.length : parts.length;

  const areaTotalM2 = modoDiseno === 'libre'
    ? tablerosLibres.reduce((acc, t) => acc + (t.largo / 1000) * (t.ancho / 1000), 0)
    : parts.reduce((acc, p) => {
        const w = p.dim.x / 1000;
        const h = p.dim.y / 1000;
        const d = p.dim.z / 1000;
        const areaPieza = p.esVetaVertical ? (h * d) : (w * d);
        return acc + areaPieza;
      }, 0);

  useEffect(() => {
    obtenerProyectos().then(proys => {
      setProyectos(proys || []);
      if (proys && proys.length > 0) {
        setProyectoSeleccionado(proys[0].id || '');
      }
    }).catch(console.error);
  }, []);

  const handleGuardarEnProyecto = async () => {
    if (!proyectoSeleccionado) {
      alert("Por favor selecciona un Proyecto activo.");
      return;
    }
    setGuardando(true);
    setGuardadoExitoso(false);
    try {
      const nombreListaFinal = modoDiseno === 'libre'
        ? 'Despiece 3D - Ensamble Libre'
        : `Despiece 3D - ${spec.nombre}`;

      await guardarListaCorteProyecto(proyectoSeleccionado, {
        nombreLista: nombreListaFinal,
        totalPiezas: listaCortePiezas.length,
        piezas: listaCortePiezas
      });
      setGuardadoExitoso(true);
      setTimeout(() => setGuardadoExitoso(false), 3500);
    } catch (err: any) {
      alert("Error al guardar: " + (err.message || err));
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
            <Scissors size={18} color="var(--color-primary)" />
            <span>Lista de Despiece & Corte Automática ({modoDiseno === 'libre' ? 'Diseño Libre' : 'Paramétrico'})</span>
          </h3>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
            {totalPiezas} piezas calculadas • <strong className="font-mono-num" style={{ color: 'var(--color-primary)' }}>{areaTotalM2.toFixed(2)} m²</strong> de placa aprox.
          </span>
        </div>

        {/* Transferencia a Proyecto */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {proyectos.length > 0 && (
            <select
              className="input"
              value={proyectoSeleccionado}
              onChange={(e) => setProyectoSeleccionado(e.target.value)}
              style={{ fontSize: '0.78rem', padding: '6px 8px', maxWidth: '180px' }}
            >
              {proyectos.map(p => (
                <option key={p.id} value={p.id}>{p.nombre || p.codigoObra || 'Proyecto'}</option>
              ))}
            </select>
          )}

          <button
            type="button"
            className="btn-primary-cyan"
            onClick={handleGuardarEnProyecto}
            disabled={guardando || totalPiezas === 0}
            style={{ fontSize: '0.78rem', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            {guardadoExitoso ? <Check size={14} /> : <FolderDown size={14} />}
            <span>{guardadoExitoso ? '¡Transferido a Obra!' : (guardando ? 'Guardando...' : 'Transferir a Lista de Corte')}</span>
          </button>
        </div>
      </div>

      {/* Tabla de Piezas */}
      <div style={{ overflowX: 'auto', maxHeight: '280px', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '6px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--text-secondary)', textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              <th style={{ padding: '8px 10px' }}>Pieza / Descripción</th>
              <th style={{ padding: '8px 10px', textAlign: 'center' }}>Cant</th>
              <th style={{ padding: '8px 10px', textAlign: 'right' }}>Largo (Veta)</th>
              <th style={{ padding: '8px 10px', textAlign: 'right' }}>Ancho</th>
              <th style={{ padding: '8px 10px' }}>Acabado / Material</th>
              <th style={{ padding: '8px 10px' }}>Cantos (L / A)</th>
            </tr>
          </thead>
          <tbody>
            {listaCortePiezas.map((fila, idx) => (
              <tr key={fila.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                <td style={{ padding: '6px 10px', fontWeight: 600, color: 'var(--text-main)' }}>
                  {fila.descripcion}
                </td>
                <td style={{ padding: '6px 10px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  1
                </td>
                <td className="font-mono-num" style={{ padding: '6px 10px', color: 'var(--color-primary)' }}>
                  {fila.altoVeta} mm
                </td>
                <td className="font-mono-num" style={{ padding: '6px 10px', color: 'var(--color-primary)' }}>
                  {fila.ancho} mm
                </td>
                <td style={{ padding: '6px 10px', fontSize: '0.72rem', color: '#f59e0b' }}>
                  {fila.color || 'ESTÁNDAR'}
                </td>
                <td style={{ padding: '6px 10px', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                  <span>{fila.alto1 || '-'}</span> / <span>{fila.ancho1 || '-'}</span>
                </td>
              </tr>
            ))}
            {listaCortePiezas.length === 0 && (
              <tr>
                <td colSpan={6} style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  No hay piezas en la escena. Agrega tableros en el modo libre o configura un mueble paramétrico.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
