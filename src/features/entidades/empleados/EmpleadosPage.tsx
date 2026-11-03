// ============================================================
// BLOQUE 1: IMPORTACIONES Y DEPENDENCIAS
// Qué hace: Vista principal para administración de personal de obra y nómina.
// Por qué: Arquitectura Feature-Driven (Manual Maestro 2.3).
// ============================================================
import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Search, CheckCircle } from 'lucide-react';
import { obtenerEmpleados, crearEmpleado, actualizarEmpleado, eliminarEmpleado } from '../../../services/empleadosService';
import { crearCuentaEmpleado } from '../../../services/authService';
import ModalEmpleado from './components/ModalEmpleado';
import ModalAccesoEmpleado from './components/ModalAccesoEmpleado';
import TablaEmpleados from './components/TablaEmpleados';
import type { IEmpleado, IFormEmpleado } from '../../../types/empleado';
import type { IFormCrearEmpleado } from '../../../types/auth';

// ============================================================
// BLOQUE 2: COMPONENTE PRINCIPAL DE EMPLEADOS
// ============================================================
export default function EmpleadosPage() {
  const [empleados, setEmpleados] = useState<IEmpleado[]>([]);
  const [busqueda, setBusqueda] = useState<string>('');
  const [cargando, setCargando] = useState<boolean>(true);
  const [guardando, setGuardando] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [exitoMsg, setExitoMsg] = useState<string>('');

  // Modales
  const [modalAbierto, setModalAbierto] = useState<boolean>(false);
  const [modalAccesoAbierto, setModalAccesoAbierto] = useState<boolean>(false);
  const [empleadoEditando, setEmpleadoEditando] = useState<IEmpleado | null>(null);
  const [empleadoParaAcceso, setEmpleadoParaAcceso] = useState<IEmpleado | null>(null);

  const [form, setForm] = useState<IFormEmpleado>({
    nombre: '',
    cargo: 'Oficial de Carpintería',
    cedula: '',
    telefono: '',
    email: '',
    tarifaDiaria: '',
    salarioMensual: '',
    observaciones: ''
  });

  const cargarDatos = async () => {
    setCargando(true);
    try {
      const data = await obtenerEmpleados();
      setEmpleados(data);
    } catch (err) {
      console.error("Error al cargar empleados:", err);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const handleAbrirCrear = () => {
    setEmpleadoEditando(null);
    setForm({
      nombre: '',
      cargo: 'Oficial de Carpintería',
      cedula: '',
      telefono: '',
      email: '',
      tarifaDiaria: '',
      salarioMensual: '',
      observaciones: ''
    });
    setErrorMsg('');
    setExitoMsg('');
    setModalAbierto(true);
  };

  const handleAbrirEditar = (emp: IEmpleado) => {
    setEmpleadoEditando(emp);
    setForm({
      nombre: emp.nombre || '',
      cargo: emp.cargo || 'Oficial de Carpintería',
      cedula: emp.cedula || '',
      telefono: emp.telefono || '',
      email: emp.email || '',
      tarifaDiaria: emp.tarifaDiaria ? String(emp.tarifaDiaria) : '',
      salarioMensual: emp.salarioMensual ? String(emp.salarioMensual) : '',
      observaciones: emp.observaciones || ''
    });
    setErrorMsg('');
    setExitoMsg('');
    setModalAbierto(true);
  };

  const handleAbrirAcceso = (emp: IEmpleado) => {
    setEmpleadoParaAcceso(emp);
    setErrorMsg('');
    setExitoMsg('');
    setModalAccesoAbierto(true);
  };

  const handleGuardarEmpleado = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg('');
    if (!form.nombre.trim()) return setErrorMsg('El nombre completo es obligatorio');

    setGuardando(true);
    try {
      if (empleadoEditando && empleadoEditando.id) {
        await actualizarEmpleado(empleadoEditando.id, form);
      } else {
        await crearEmpleado(form);
      }
      setModalAbierto(false);
      await cargarDatos();
    } catch (err: unknown) {
      const error = err as Error;
      setErrorMsg(error.message || 'Error al guardar empleado');
    } finally {
      setGuardando(false);
    }
  };

  const handleCrearAcceso = async (formAcceso: IFormCrearEmpleado) => {
    setErrorMsg('');
    setGuardando(true);
    try {
      await crearCuentaEmpleado(formAcceso);
      setExitoMsg(`✅ Acceso habilitado con éxito para ${formAcceso.nombre}`);
      setModalAccesoAbierto(false);
    } catch (err: unknown) {
      const error = err as Error;
      setErrorMsg(error.message || 'Error al habilitar acceso para el empleado');
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminar = async (id: string, nombre: string) => {
    if (window.confirm(`¿Estás seguro de eliminar al empleado "${nombre}"?`)) {
      try {
        await eliminarEmpleado(id);
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
            <Users size={24} color="#38bdf8" />
            <span>Personal de Obra y Empleados</span>
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '4px' }}>
            Control de tarifas, nómina, roles y generación de accesos corporativos
          </p>
        </div>
        <button 
          onClick={handleAbrirCrear}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <UserPlus size={18} />
          <span>+ Nuevo Empleado</span>
        </button>
      </div>

      {/* Alerta de Éxito */}
      {exitoMsg && (
        <div style={{
          background: 'rgba(34,197,94,0.15)',
          border: '1px solid rgba(34,197,94,0.3)',
          color: '#86efac',
          padding: '12px 16px',
          borderRadius: '8px',
          fontSize: '0.9rem',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <CheckCircle size={18} />
          <span>{exitoMsg}</span>
        </div>
      )}

      {/* Barra de Búsqueda */}
      <div className="card" style={{ padding: '12px 16px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Search size={18} color="#94a3b8" />
        <input 
          type="text" 
          placeholder="Buscar por nombre, cargo, cédula o teléfono..." 
          value={busqueda} 
          onChange={(e) => setBusqueda(e.target.value)}
          style={{ border: 'none', background: 'transparent', width: '100%', color: '#f8fafc', outline: 'none' }}
        />
      </div>

      {/* Tabla Modular */}
      <div className="card" style={{ padding: '20px' }}>
        <TablaEmpleados
          empleados={empleados}
          cargando={cargando}
          busqueda={busqueda}
          onEditar={handleAbrirEditar}
          onAbrirAcceso={handleAbrirAcceso}
          onEliminar={handleEliminar}
        />
      </div>

      {/* Modales Modulares */}
      <ModalEmpleado
        abierto={modalAbierto}
        onClose={() => setModalAbierto(false)}
        form={form}
        setForm={setForm}
        onGuardar={handleGuardarEmpleado}
        guardando={guardando}
        errorMsg={errorMsg}
        empleadoEditando={empleadoEditando}
      />

      <ModalAccesoEmpleado
        abierto={modalAccesoAbierto}
        onClose={() => setModalAccesoAbierto(false)}
        empleado={empleadoParaAcceso}
        onCrearAcceso={handleCrearAcceso}
        guardando={guardando}
        errorMsg={errorMsg}
      />
    </div>
  );
}
