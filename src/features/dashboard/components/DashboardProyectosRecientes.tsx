// ============================================================
// BLOQUE 1: IMPORTACIONES Y DEPENDENCIAS
// Qué hace: Importa React, iconos, tipos y modales de proyectos.
// Por qué: Regla 2.2 Manual Maestro: Componentes modulares atómicos (< 250 líneas).
// ============================================================
import React, { useState } from 'react';
import { HardHat, ArrowRight, Calendar, Eye, FileText, Camera, FolderOpen } from 'lucide-react';
import ModalFotosProyecto from '../../../components/proyectos/ModalFotosProyecto.jsx';
import ModalBitacoraDiaria from '../../../components/proyectos/ModalBitacoraDiaria.jsx';
import ModalCronogramaGantt from '../../../components/proyectos/ModalCronogramaGantt.jsx';
import ModalPortalCliente from '../../../components/proyectos/ModalPortalCliente.jsx';
import type { IProyecto } from '../../../types/proyecto';
import type { ICliente } from '../../../types/cliente';

interface DashboardProyectosRecientesProps {
  proyectos: IProyecto[];
  clientes: ICliente[];
  cargando: boolean;
  onNavegarTab: (tab: string) => void;
}

// ============================================================
// BLOQUE 2: COMPONENTE DE ESTADO DE OBRAS Y PROYECTOS RECIENTES
// Qué hace: Lista los proyectos en curso con barra de progreso y accesos a fotos, bitácora y portal.
// ============================================================
export default function DashboardProyectosRecientes({
  proyectos,
  clientes,
  cargando,
  onNavegarTab
}: DashboardProyectosRecientesProps) {
  const [proyectoFotos, setProyectoFotos] = useState<IProyecto | null>(null);
  const [proyectoBitacora, setProyectoBitacora] = useState<IProyecto | null>(null);
  const [proyectoGantt, setProyectoGantt] = useState<IProyecto | null>(null);
  const [proyectoPortal, setProyectoPortal] = useState<IProyecto | null>(null);

  return (
    <div className="card" style={{ padding: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: 'var(--text-main, #f8fafc)' }}>
            🏗️ Estado de Obras y Proyectos Recientes
          </h3>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted, #94a3b8)' }}>
            Proyectos registrados en la plataforma y sus accesos directos
          </span>
        </div>
        <button 
          onClick={() => onNavegarTab('proyectos')} 
          className="btn btn-secondary"
          style={{ padding: '6px 12px', fontSize: '0.82rem', gap: '6px', display: 'flex', alignItems: 'center' }}
        >
          Ver Todos <ArrowRight size={14} />
        </button>
      </div>

      {cargando ? (
        <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted, #94a3b8)' }}>
          Cargando proyectos en tiempo real...
        </div>
      ) : proyectos.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '36px', 
          background: 'rgba(255,255,255,0.02)', 
          borderRadius: 'var(--radius-md, 8px)',
          border: '1px dashed var(--border-color, rgba(255,255,255,0.1))' 
        }}>
          <HardHat size={36} color="var(--text-muted, #94a3b8)" style={{ marginBottom: '10px' }} />
          <p style={{ color: 'var(--text-muted, #94a3b8)', margin: '0 0 12px 0', fontSize: '0.9rem' }}>
            No tienes proyectos registrados aún.
          </p>
          <button onClick={() => onNavegarTab('proyectos')} className="btn btn-primary" style={{ fontSize: '0.85rem' }}>
            ➕ Crear Primer Proyecto
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {proyectos.slice(0, 5).map((proyecto) => {
            const rawProj = proyecto as unknown as { codigoObra?: string; codigoCotizacion?: string; porcentajeAvance?: number; driveFolderUrl?: string };
            const avance = (proyecto.estado === 'Finalizado' || (rawProj.porcentajeAvance || 0) >= 100) ? 100 : (rawProj.porcentajeAvance || 0);

            return (
              <div 
                key={proyecto.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 16px',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid var(--border-color, rgba(255,255,255,0.08))',
                  borderRadius: 'var(--radius-md, 8px)',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    background: 'rgba(56,189,248,0.1)',
                    width: '38px',
                    height: '38px',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <HardHat size={20} color="#38bdf8" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main, #f8fafc)' }}>
                      {proyecto.nombre}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted, #94a3b8)' }}>
                      Código: <strong>{rawProj.codigoObra || 'N/A'}</strong> | Cotización: <code>{rawProj.codigoCotizacion || 'RH-COT-001'}</code>
                    </div>

                    {/* Barra Mini de Avance (%) */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                      <div style={{
                        width: '100px',
                        height: '6px',
                        background: 'rgba(255,255,255,0.08)',
                        borderRadius: '3px',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          width: `${avance}%`,
                          height: '100%',
                          background: avance >= 100 ? '#22c55e' : avance >= 75 ? '#34d399' : avance >= 25 ? '#38bdf8' : '#f59e0b',
                          borderRadius: '3px'
                        }} />
                      </div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: avance >= 100 ? '#22c55e' : '#38bdf8' }}>
                        {avance}%
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  {/* Badge de Estado del Proyecto */}
                  <span className="badge badge-primary" style={{ fontSize: '0.75rem' }}>
                    {proyecto.estado}
                  </span>

                  {/* Botón de Cronograma Gantt */}
                  <button
                    onClick={() => setProyectoGantt(proyecto)}
                    className="btn btn-secondary"
                    style={{ padding: '4px 10px', fontSize: '0.78rem', gap: '4px', color: '#38bdf8', borderColor: 'rgba(56, 189, 248, 0.4)', display: 'flex', alignItems: 'center' }}
                    title="Cronograma de Fases y Diagrama Gantt de Obra"
                  >
                    <Calendar size={14} /> Cronograma
                  </button>

                  {/* Botón de Portal Cliente */}
                  <button
                    onClick={() => setProyectoPortal(proyecto)}
                    className="btn btn-secondary"
                    style={{ padding: '4px 10px', fontSize: '0.78rem', gap: '4px', color: '#c084fc', borderColor: 'rgba(192, 132, 252, 0.4)', display: 'flex', alignItems: 'center' }}
                    title="Portal de Transparencia Compartible para el Cliente"
                  >
                    <Eye size={14} /> Portal Cliente
                  </button>

                  {/* Botón de Bitácora Diaria */}
                  <button
                    onClick={() => setProyectoBitacora(proyecto)}
                    className="btn btn-secondary"
                    style={{ padding: '4px 10px', fontSize: '0.78rem', gap: '4px', color: '#34d399', borderColor: 'rgba(52, 211, 153, 0.4)', display: 'flex', alignItems: 'center' }}
                    title="Bitácora Diaria de Campo"
                  >
                    <FileText size={14} /> Bitácora
                  </button>

                  {/* Botón de Fotos de Obra */}
                  <button
                    onClick={() => setProyectoFotos(proyecto)}
                    className="btn btn-secondary"
                    style={{ padding: '4px 10px', fontSize: '0.78rem', gap: '4px', color: '#fbbf24', borderColor: 'rgba(251, 191, 36, 0.4)', display: 'flex', alignItems: 'center' }}
                    title="Fotos de Obra"
                  >
                    <Camera size={14} /> Fotos
                  </button>

                  {/* Botón de Abrir Google Drive */}
                  {rawProj.driveFolderUrl && (
                    <a
                      href={rawProj.driveFolderUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-secondary"
                      style={{ padding: '4px 10px', fontSize: '0.78rem', gap: '4px', display: 'flex', alignItems: 'center' }}
                      title="Abrir carpeta oficial en Google Drive"
                    >
                      <FolderOpen size={14} color="#38bdf8" /> Drive
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modales de Proyectos */}
      {proyectoGantt && (
        <ModalCronogramaGantt
          proyecto={proyectoGantt}
          onClose={() => setProyectoGantt(null)}
        />
      )}

      {proyectoPortal && (
        <ModalPortalCliente
          proyecto={proyectoPortal}
          cliente={clientes.find(c => c.id === proyectoPortal.clienteId)}
          onClose={() => setProyectoPortal(null)}
        />
      )}

      {proyectoBitacora && (
        <ModalBitacoraDiaria
          proyecto={proyectoBitacora}
          onClose={() => setProyectoBitacora(null)}
        />
      )}

      {proyectoFotos && (
        <ModalFotosProyecto
          proyecto={proyectoFotos}
          onClose={() => setProyectoFotos(null)}
        />
      )}
    </div>
  );
}
