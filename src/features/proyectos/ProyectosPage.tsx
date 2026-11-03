// ============================================================
// BLOQUE 1: IMPORTACIONES Y DEPENDENCIAS
// Qué hace: Vista principal para la gestión integral de obras, carpetas Drive y vinculaciones.
// Por qué: Arquitectura Feature-Driven y Regla 2.2 Manual Maestro (< 250 líneas).
// ============================================================
import React, { useState, useEffect } from 'react';
import { Plus, Search, HardHat } from 'lucide-react';
import { 
  obtenerProyectos, 
  crearProyecto, 
  eliminarProyecto, 
  obtenerSiguienteCodigoCotizacion, 
  actualizarAvanceProyecto, 
  actualizarEstadoProyecto 
} from '../../services/proyectosService';
import { obtenerClientes } from '../../services/clientesService';
import { obtenerCotizacionGuardadaPorProyecto } from '../../services/cotizacionesService';
import { obtenerContratoGuardadoPorProyecto } from '../../services/contratosService';

import ModalNuevoProyecto from './components/ModalNuevoProyecto';
import ModalCotizacionView from './components/ModalCotizacionView';
import ModalContratoView from './components/ModalContratoView';
import TablaProyectos from './components/TablaProyectos';

import ModalFotosProyecto from '../../components/proyectos/ModalFotosProyecto.jsx';
import ModalBitacoraDiaria from '../../components/proyectos/ModalBitacoraDiaria.jsx';
import ModalCronogramaGantt from '../../components/proyectos/ModalCronogramaGantt.jsx';
import ModalPortalCliente from '../../components/proyectos/ModalPortalCliente.jsx';

import type { IProyecto, IFormProyecto, EstadoProyecto } from '../../types/proyecto';
import type { ICliente } from '../../types/cliente';

// ============================================================
// BLOQUE 2: COMPONENTE PRINCIPAL DE PROYECTOS
// ============================================================
export default function ProyectosPage() {
  const [proyectos, setProyectos] = useState<IProyecto[]>([]);
  const [clientes, setClientes] = useState<ICliente[]>([]);
  const [busqueda, setBusqueda] = useState<string>('');
  const [cargando, setCargando] = useState<boolean>(true);
  const [guardando, setGuardando] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Modales
  const [modalAbierto, setModalAbierto] = useState<boolean>(false);
  const [modalCotizAbierto, setModalCotizAbierto] = useState<boolean>(false);
  const [cotizacionModalData, setCotizacionModalData] = useState<unknown>(null);
  const [modalContratoDocAbierto, setModalContratoDocAbierto] = useState<boolean>(false);
  const [contratoModalData, setContratoModalData] = useState<unknown>(null);

  const [proyectoFotos, setProyectoFotos] = useState<IProyecto | null>(null);
  const [proyectoBitacora, setProyectoBitacora] = useState<IProyecto | null>(null);
  const [proyectoGantt, setProyectoGantt] = useState<IProyecto | null>(null);
  const [proyectoPortal, setProyectoPortal] = useState<IProyecto | null>(null);

  const [form, setForm] = useState<IFormProyecto>({
    nombre: '',
    codigoObra: '',
    clienteId: '',
    lugarObra: '',
    direccionObra: '',
    tipoCotizacion: 'RH-COT-001-0001',
    estado: 'Sin Cotizar'
  });

  const cargarDatos = async () => {
    setCargando(true);
    try {
      const [proyData, cliData] = await Promise.all([
        obtenerProyectos(),
        obtenerClientes()
      ]);
      setProyectos(proyData);
      setClientes(cliData);
    } catch (err) {
      console.error("Error al cargar proyectos:", err);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const handleAbrirCrear = async () => {
    try {
      const { codigoCotizacion } = await obtenerSiguienteCodigoCotizacion();
      const numSig = proyectos.length + 1;
      setForm({
        nombre: '',
        codigoObra: `OBRA-${String(numSig).padStart(3, '0')}`,
        clienteId: '',
        lugarObra: '',
        direccionObra: '',
        tipoCotizacion: codigoCotizacion,
        estado: 'Sin Cotizar'
      });
      setErrorMsg('');
      setModalAbierto(true);
    } catch (err) {
      console.error(err);
    }
  };

  const handleGuardar = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg('');
    if (!form.nombre.trim()) return setErrorMsg('El nombre de la obra es obligatorio');
    if (!form.clienteId) return setErrorMsg('Debe seleccionar obligatoriamente un cliente');

    setGuardando(true);
    try {
      await crearProyecto(form);
      setModalAbierto(false);
      await cargarDatos();
    } catch (err: unknown) {
      const error = err as Error;
      setErrorMsg(error.message || 'Error al crear el proyecto');
    } finally {
      setGuardando(false);
    }
  };

  const handleCambiarEstado = async (id: string, nuevoEstado: EstadoProyecto) => {
    try {
      await actualizarEstadoProyecto(id, nuevoEstado);
      setProyectos(prev => prev.map(p => p.id === id ? { ...p, estado: nuevoEstado } : p));
    } catch (err) {
      console.error("Error al actualizar estado:", err);
    }
  };

  const handleCambiarAvance = async (id: string, avance: number) => {
    try {
      await actualizarAvanceProyecto(id, avance);
      setProyectos(prev => prev.map(p => p.id === id ? { ...p, porcentajeAvance: avance } : p));
    } catch (err) {
      console.error("Error al actualizar avance:", err);
    }
  };

  const handleVerCotizacion = async (proyectoId: string) => {
    try {
      const cotiz = await obtenerCotizacionGuardadaPorProyecto(proyectoId);
      if (cotiz) {
        setCotizacionModalData(cotiz);
        setModalCotizAbierto(true);
      } else {
        alert("Este proyecto no cuenta con una cotización oficial guardada aún.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleVerContrato = async (proyectoId: string) => {
    try {
      const cont = await obtenerContratoGuardadoPorProyecto(proyectoId);
      if (cont) {
        setContratoModalData(cont);
        setModalContratoDocAbierto(true);
      } else {
        alert("Este proyecto no cuenta con un contrato legal guardado aún.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleEliminar = async (id: string, nombre: string) => {
    if (window.confirm(`¿Estás seguro de eliminar el proyecto "${nombre}"?`)) {
      try {
        await eliminarProyecto(id);
        await cargarDatos();
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
      {/* Encabezado */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <HardHat size={24} color="#38bdf8" />
            <span>Gestor de Obras y Proyectos</span>
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '4px' }}>
            Control de obras, avances, fases Gantt, bitácoras y sincronización con Google Drive
          </p>
        </div>
        <button 
          onClick={handleAbrirCrear}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Plus size={18} />
          <span>+ Nuevo Proyecto</span>
        </button>
      </div>

      {/* Barra de Búsqueda */}
      <div className="card" style={{ padding: '12px 16px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Search size={18} color="#94a3b8" />
        <input 
          type="text" 
          placeholder="Buscar por nombre de obra, código, cliente o ubicación..." 
          value={busqueda} 
          onChange={(e) => setBusqueda(e.target.value)}
          style={{ border: 'none', background: 'transparent', width: '100%', color: '#f8fafc', outline: 'none' }}
        />
      </div>

      {/* Tabla Modular */}
      <TablaProyectos
        proyectos={proyectos}
        clientes={clientes}
        cargando={cargando}
        busqueda={busqueda}
        onCambiarEstado={handleCambiarEstado}
        onCambiarAvance={handleCambiarAvance}
        onAbrirGantt={setProyectoGantt}
        onAbrirPortal={setProyectoPortal}
        onAbrirBitacora={setProyectoBitacora}
        onAbrirFotos={setProyectoFotos}
        onVerCotizacion={handleVerCotizacion}
        onVerContrato={handleVerContrato}
        onEliminar={handleEliminar}
      />

      {/* Modales Modulares */}
      <ModalNuevoProyecto
        abierto={modalAbierto}
        onClose={() => setModalAbierto(false)}
        form={form}
        setForm={setForm}
        clientes={clientes}
        onGuardar={handleGuardar}
        guardando={guardando}
        errorMsg={errorMsg}
      />

      <ModalCotizacionView
        abierto={modalCotizAbierto}
        onClose={() => setModalCotizAbierto(false)}
        cotizacion={cotizacionModalData as any}
      />

      <ModalContratoView
        abierto={modalContratoDocAbierto}
        onClose={() => setModalContratoDocAbierto(false)}
        contrato={contratoModalData as any}
      />

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
