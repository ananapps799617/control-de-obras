// ============================================================
// BLOQUE 1: IMPORTACIONES Y DEPENDENCIAS
// Qué hace: Renderiza la tabla completa de proyectos con avances, estados y accesos directos.
// Por qué: Regla 2.2 Manual Maestro: Componentes modulares atómicos (< 250 líneas).
// ============================================================
import React from 'react';
import { HardHat, Calendar, Eye, FileText, Camera, FolderOpen, Trash2, FileCheck, MapPin } from 'lucide-react';
import type { IProyecto, EstadoProyecto } from '../../../types/proyecto';
import type { ICliente } from '../../../types/cliente';

interface TablaProyectosProps {
  proyectos: IProyecto[];
  clientes: ICliente[];
  cargando: boolean;
  busqueda: string;
  onCambiarEstado: (id: string, estado: EstadoProyecto) => void;
  onCambiarAvance: (id: string, avance: number) => void;
  onAbrirGantt: (p: IProyecto) => void;
  onAbrirPortal: (p: IProyecto) => void;
  onAbrirBitacora: (p: IProyecto) => void;
  onAbrirFotos: (p: IProyecto) => void;
  onVerCotizacion: (id: string) => void;
  onVerContrato: (id: string) => void;
  onEliminar: (id: string, nombre: string) => void;
}

// ============================================================
// BLOQUE 2: COMPONENTE TABLA DE PROYECTOS
// ============================================================
export default function TablaProyectos({
  proyectos,
  clientes,
  cargando,
  busqueda,
  onCambiarEstado,
  onCambiarAvance,
  onAbrirGantt,
  onAbrirPortal,
  onAbrirBitacora,
  onAbrirFotos,
  onVerCotizacion,
  onVerContrato,
  onEliminar
}: TablaProyectosProps) {
  const proyectosFiltrados = proyectos.filter(p => 
    p.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
    p.codigoObra?.toLowerCase().includes(busqueda.toLowerCase()) ||
    p.codigoCotizacion?.toLowerCase().includes(busqueda.toLowerCase()) ||
    p.lugarObra?.toLowerCase().includes(busqueda.toLowerCase())
  );

  if (cargando) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
        Cargando proyectos en tiempo real...
      </div>
    );
  }

  if (proyectosFiltrados.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
        {busqueda ? 'No se encontraron proyectos con ese criterio de búsqueda.' : 'No tienes proyectos registrados aún.'}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {proyectosFiltrados.map((proyecto) => {
        const clienteAsociado = clientes.find(c => c.id === proyecto.clienteId);
        const avance = (proyecto.estado === 'Finalizado' || (proyecto.porcentajeAvance || 0) >= 100) ? 100 : (proyecto.porcentajeAvance || 0);

        return (
          <div 
            key={proyecto.id}
            style={{
              padding: '16px 20px',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid var(--border-color, rgba(255,255,255,0.08))',
              borderRadius: 'var(--radius-md, 8px)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}
          >
            {/* Fila Superior: Título, Códigos y Controles de Estado */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  background: 'rgba(56,189,248,0.12)',
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <HardHat size={22} color="#38bdf8" />
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc' }}>
                    {proyecto.nombre}
                  </h4>
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '2px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <span>Código: <strong style={{ color: '#cbd5e1' }}>{proyecto.codigoObra || 'N/A'}</strong></span>
                    <span>•</span>
                    <span>Cliente: <strong style={{ color: '#38bdf8' }}>{clienteAsociado?.nombre || 'General'}</strong></span>
                    {proyecto.lugarObra && (
                      <>
                        <span>•</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                          <MapPin size={12} /> {proyecto.lugarObra}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Selector de Estado y Avance */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <select
                  value={proyecto.estado}
                  onChange={(e) => onCambiarEstado(proyecto.id!, e.target.value as EstadoProyecto)}
                  className="input"
                  style={{ fontSize: '0.8rem', padding: '4px 8px', fontWeight: 600 }}
                >
                  <option value="Sin Cotizar">Sin Cotizar</option>
                  <option value="Cotizado">Cotizado</option>
                  <option value="Activo">Activo</option>
                  <option value="En Progreso">En Progreso</option>
                  <option value="Finalizado">Finalizado</option>
                  <option value="Pausado">Pausado</option>
                </select>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={avance}
                    onChange={(e) => onCambiarAvance(proyecto.id!, Number(e.target.value))}
                    style={{ width: '80px', cursor: 'pointer' }}
                    title={`Avance: ${avance}%`}
                  />
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: avance >= 100 ? '#22c55e' : '#38bdf8', minWidth: '35px' }}>
                    {avance}%
                  </span>
                </div>
              </div>
            </div>

            {/* Fila Inferior: Botonera Modular de Herramientas de Obra */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '10px', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => onAbrirGantt(proyecto)}
                  className="btn btn-secondary"
                  style={{ padding: '4px 10px', fontSize: '0.78rem', gap: '4px', color: '#38bdf8', borderColor: 'rgba(56, 189, 248, 0.3)' }}
                >
                  <Calendar size={13} /> Fases / Gantt
                </button>
                <button
                  onClick={() => onAbrirPortal(proyecto)}
                  className="btn btn-secondary"
                  style={{ padding: '4px 10px', fontSize: '0.78rem', gap: '4px', color: '#c084fc', borderColor: 'rgba(192, 132, 252, 0.3)' }}
                >
                  <Eye size={13} /> Portal Cliente
                </button>
                <button
                  onClick={() => onAbrirBitacora(proyecto)}
                  className="btn btn-secondary"
                  style={{ padding: '4px 10px', fontSize: '0.78rem', gap: '4px', color: '#34d399', borderColor: 'rgba(52, 211, 153, 0.3)' }}
                >
                  <FileText size={13} /> Bitácora
                </button>
                <button
                  onClick={() => onAbrirFotos(proyecto)}
                  className="btn btn-secondary"
                  style={{ padding: '4px 10px', fontSize: '0.78rem', gap: '4px', color: '#fbbf24', borderColor: 'rgba(251, 191, 36, 0.3)' }}
                >
                  <Camera size={13} /> Fotos
                </button>
                <button
                  onClick={() => onVerCotizacion(proyecto.id!)}
                  className="btn btn-secondary"
                  style={{ padding: '4px 10px', fontSize: '0.78rem', gap: '4px' }}
                >
                  <FileText size={13} color="#94a3b8" /> Cotización
                </button>
                <button
                  onClick={() => onVerContrato(proyecto.id!)}
                  className="btn btn-secondary"
                  style={{ padding: '4px 10px', fontSize: '0.78rem', gap: '4px' }}
                >
                  <FileCheck size={13} color="#94a3b8" /> Contrato
                </button>
              </div>

              <div style={{ display: 'flex', gap: '6px' }}>
                {proyecto.driveFolderUrl && (
                  <a
                    href={proyecto.driveFolderUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-secondary"
                    style={{ padding: '4px 10px', fontSize: '0.78rem', gap: '4px' }}
                  >
                    <FolderOpen size={13} color="#38bdf8" /> Drive
                  </a>
                )}
                <button
                  onClick={() => onEliminar(proyecto.id!, proyecto.nombre)}
                  className="btn btn-secondary"
                  style={{ padding: '4px 8px', color: '#f87171', borderColor: 'rgba(248,113,113,0.3)' }}
                  title="Eliminar proyecto"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
