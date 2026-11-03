// ============================================================
// BLOQUE 1: IMPORTACIONES Y DEPENDENCIAS
// Qué hace: Modal para agendar visitas técnicas, mediciones e instalaciones.
// Por qué: Regla 2.2 Manual Maestro: Componentes modulares atómicos (< 200 líneas).
// ============================================================
import React from 'react';
import ModalForm from '../../../components/ModalForm.jsx';
import type { IFormVisitaAgenda, TipoEventoAgenda, EstadoEventoAgenda } from '../../../types/agenda';
import type { IProyecto } from '../../../types/proyecto';

interface ModalNuevaVisitaProps {
  abierto: boolean;
  onClose: () => void;
  form: IFormVisitaAgenda;
  setForm: React.Dispatch<React.SetStateAction<IFormVisitaAgenda>>;
  proyectos: IProyecto[];
  onGuardar: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  guardando: boolean;
  errorMsg: string;
}

// ============================================================
// BLOQUE 2: COMPONENTE MODAL DE NUEVA VISITA
// ============================================================
export default function ModalNuevaVisita({
  abierto,
  onClose,
  form,
  setForm,
  proyectos,
  onGuardar,
  guardando,
  errorMsg
}: ModalNuevaVisitaProps) {
  return (
    <ModalForm
      abierto={abierto}
      onClose={onClose}
      titulo="Agendar Nueva Cita / Visita de Obra"
      maxWidth="560px"
    >
      {errorMsg && (
        <div style={{
          background: 'rgba(239,68,68,0.15)',
          border: '1px solid rgba(239,68,68,0.3)',
          color: '#fca5a5',
          padding: '10px 14px',
          borderRadius: '8px',
          fontSize: '0.85rem',
          marginBottom: '16px'
        }}>
          {errorMsg}
        </div>
      )}

      <form onSubmit={onGuardar} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '4px' }}>
            Concepto / Asunto de la Cita *
          </label>
          <input
            type="text"
            required
            className="input"
            placeholder="Ej: Medición de Cocina y Toma de Niveles"
            value={form.concepto}
            onChange={(e) => setForm({ ...form, concepto: e.target.value })}
            style={{ width: '100%' }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '4px' }}>
              Tipo de Evento
            </label>
            <select
              className="input"
              value={form.tipoEvento}
              onChange={(e) => setForm({ ...form, tipoEvento: e.target.value as TipoEventoAgenda })}
              style={{ width: '100%' }}
            >
              <option value="Visita Técnica de Medición">📐 Visita de Medición</option>
              <option value="Instalación en Obra">🔨 Instalación en Obra</option>
              <option value="Reunión con Cliente">🤝 Reunión con Cliente</option>
              <option value="Otro">📌 Otro</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '4px' }}>
              Proyecto Vinculado
            </label>
            <select
              className="input"
              value={form.proyectoId}
              onChange={(e) => setForm({ ...form, proyectoId: e.target.value })}
              style={{ width: '100%' }}
            >
              <option value="">-- General / Sin Proyecto --</option>
              {proyectos.map(p => (
                <option key={p.id} value={p.id}>{p.nombre}</option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '4px' }}>Fecha *</label>
            <input
              type="date"
              required
              className="input"
              value={form.fecha}
              onChange={(e) => setForm({ ...form, fecha: e.target.value })}
              style={{ width: '100%' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '4px' }}>Hora Inicio</label>
            <input
              type="time"
              className="input"
              value={form.horaInicio}
              onChange={(e) => setForm({ ...form, horaInicio: e.target.value })}
              style={{ width: '100%' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '4px' }}>Hora Fin</label>
            <input
              type="time"
              className="input"
              value={form.horaFin}
              onChange={(e) => setForm({ ...form, horaFin: e.target.value })}
              style={{ width: '100%' }}
            />
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '4px' }}>
            Lugar / Dirección de la Cita
          </label>
          <input
            type="text"
            className="input"
            placeholder="Ej: Cra 15 # 93-40 Apto 402"
            value={form.lugar}
            onChange={(e) => setForm({ ...form, lugar: e.target.value })}
            style={{ width: '100%' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '4px' }}>
            Notas / Requerimientos
          </label>
          <input
            type="text"
            className="input"
            placeholder="Ej: Llevar flexómetro, distanciómetro y muestras de melamina"
            value={form.notas}
            onChange={(e) => setForm({ ...form, notas: e.target.value })}
            style={{ width: '100%' }}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" disabled={guardando} className="btn btn-primary">
            {guardando ? 'Agendando...' : 'Guardar Cita'}
          </button>
        </div>
      </form>
    </ModalForm>
  );
}
