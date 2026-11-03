// ============================================================
// BLOQUE 1: IMPORTACIONES Y DEPENDENCIAS
// Qué hace: Vista principal para la Agenda de Citas y Cronograma de Obra.
// Por qué: Arquitectura Feature-Driven (Manual Maestro 2.3).
// ============================================================
import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Filter } from 'lucide-react';
import { obtenerProyectos } from '../../services/proyectosService';
import { 
  crearVisitaAgenda, 
  actualizarVisitaAgenda, 
  eliminarVisitaAgenda, 
  obtenerEventosCalendarioCompletos 
} from '../../services/agendaService';
import { getFechaHoyLocal } from '../../lib/dateUtils.js';

import ModalNuevaVisita from './components/ModalNuevaVisita';
import CalendarioMensual from './components/CalendarioMensual';
import TablaCitasPendientes from './components/TablaCitasPendientes';

import type { IProyecto } from '../../types/proyecto';
import type { IFormVisitaAgenda, IEventoAgenda } from '../../types/agenda';

// ============================================================
// BLOQUE 2: COMPONENTE PRINCIPAL DE AGENDA
// ============================================================
export default function AgendaPage() {
  const [proyectos, setProyectos] = useState<IProyecto[]>([]);
  const [eventos, setEventos] = useState<any[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [modalAbierto, setModalAbierto] = useState<boolean>(false);
  const [guardando, setGuardando] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const [fechaActual, setFechaActual] = useState<Date>(new Date());
  const [diaSeleccionado, setDiaSeleccionado] = useState<string>(getFechaHoyLocal());

  const [form, setForm] = useState<IFormVisitaAgenda>({
    proyectoId: '',
    tipoEvento: 'Visita Técnica de Medición',
    concepto: '',
    fecha: getFechaHoyLocal(),
    horaInicio: '09:00',
    horaFin: '11:00',
    lugar: '',
    notas: '',
    estado: 'Pendiente'
  });

  const cargarDatos = async () => {
    setCargando(true);
    try {
      const dataProyectos = await obtenerProyectos();
      setProyectos(dataProyectos);
      const dataEventos = await obtenerEventosCalendarioCompletos(dataProyectos);
      setEventos(dataEventos);
    } catch (err) {
      console.error("Error al cargar agenda:", err);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const handleAbrirCrear = () => {
    setForm({
      proyectoId: '',
      tipoEvento: 'Visita Técnica de Medición',
      concepto: '',
      fecha: diaSeleccionado || getFechaHoyLocal(),
      horaInicio: '09:00',
      horaFin: '11:00',
      lugar: '',
      notas: '',
      estado: 'Pendiente'
    });
    setErrorMsg('');
    setModalAbierto(true);
  };

  const handleGuardar = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg('');
    if (!form.concepto.trim()) return setErrorMsg('El concepto de la cita es obligatorio');

    setGuardando(true);
    try {
      await crearVisitaAgenda(form);
      setModalAbierto(false);
      await cargarDatos();
    } catch (err: unknown) {
      const error = err as Error;
      setErrorMsg(error.message || 'Error al agendar la cita');
    } finally {
      setGuardando(false);
    }
  };

  const handleCompletar = async (id: string) => {
    try {
      await actualizarVisitaAgenda(id, { estado: 'Completada' });
      await cargarDatos();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEliminar = async (id: string, concepto: string) => {
    if (window.confirm(`¿Estás seguro de eliminar la cita "${concepto}"?`)) {
      try {
        await eliminarVisitaAgenda(id);
        await cargarDatos();
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Encabezado */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={24} color="#38bdf8" />
            <span>Agenda & Cronograma de Obra</span>
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '4px' }}>
            Citas de medición técnica, instalaciones e hitos de entrega oficiales
          </p>
        </div>

        <button 
          onClick={handleAbrirCrear}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Plus size={18} />
          <span>+ Agendar Cita</span>
        </button>
      </div>

      {/* Cuadrícula Principal: Calendario a la izquierda, Citas a la derecha */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', alignItems: 'start' }}>
        <CalendarioMensual
          fechaActual={fechaActual}
          setFechaActual={setFechaActual}
          eventos={eventos}
          diaSeleccionado={diaSeleccionado}
          onSeleccionarDia={(dia) => setDiaSeleccionado(dia)}
        />

        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc' }}>
              {diaSeleccionado ? `Citas para el ${diaSeleccionado}` : 'Todas las Citas'}
            </h3>
            {diaSeleccionado && (
              <button
                onClick={() => setDiaSeleccionado('')}
                className="btn btn-secondary"
                style={{ fontSize: '0.75rem', padding: '4px 8px' }}
              >
                Ver Todas
              </button>
            )}
          </div>

          <TablaCitasPendientes
            eventos={eventos}
            cargando={cargando}
            diaSeleccionado={diaSeleccionado}
            onCompletar={handleCompletar}
            onEliminar={handleEliminar}
          />
        </div>
      </div>

      {/* Modal Modular */}
      <ModalNuevaVisita
        abierto={modalAbierto}
        onClose={() => setModalAbierto(false)}
        form={form}
        setForm={setForm}
        proyectos={proyectos}
        onGuardar={handleGuardar}
        guardando={guardando}
        errorMsg={errorMsg}
      />
    </div>
  );
}
