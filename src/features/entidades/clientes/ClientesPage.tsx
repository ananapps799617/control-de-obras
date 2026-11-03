// ============================================================
// BLOQUE 1: IMPORTACIONES Y DEPENDENCIAS
// Qué hace: Vista principal para la administración de clientes y carpetas Drive.
// Por qué: Arquitectura Feature-Driven (Manual Maestro 2.3).
// ============================================================
import React, { useState, useEffect } from 'react';
import { Plus, Search, UserCheck } from 'lucide-react';
import { obtenerClientes, crearCliente, eliminarCliente } from '../../../services/clientesService';
import ModalNuevoCliente from './components/ModalNuevoCliente';
import TablaClientes from './components/TablaClientes';
import type { ICliente, IFormCliente } from '../../../types/cliente';

// ============================================================
// BLOQUE 2: COMPONENTE PRINCIPAL DE CLIENTES
// ============================================================
export default function ClientesPage() {
  const [clientes, setClientes] = useState<ICliente[]>([]);
  const [busqueda, setBusqueda] = useState<string>('');
  const [modalAbierto, setModalAbierto] = useState<boolean>(false);
  const [cargando, setCargando] = useState<boolean>(true);
  const [guardando, setGuardando] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const [form, setForm] = useState<IFormCliente>({
    tipoCliente: 'Persona Natural',
    nombre: '',
    aliasCarpeta: '',
    numeroDocumento: '',
    lugarExpedicion: '',
    lugarResidencia: '',
    direccionResidencia: '',
    telefono: '',
    email: ''
  });

  const cargarDatos = async () => {
    setCargando(true);
    try {
      const data = await obtenerClientes();
      const sortAZ = (arr: ICliente[]) => [...arr].sort((a, b) => (a.nombre || '').trim().localeCompare((b.nombre || '').trim(), 'es', { sensitivity: 'base' }));
      setClientes(sortAZ(data));
    } catch (err) {
      console.error("Error al cargar clientes:", err);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const handleGuardar = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg('');
    if (!form.nombre.trim()) return setErrorMsg('El nombre o razón social es obligatorio');
    if (!form.aliasCarpeta.trim()) return setErrorMsg('El Alias de Carpeta Drive es obligatorio');

    setGuardando(true);
    try {
      await crearCliente(form);
      setForm({ 
        tipoCliente: 'Persona Natural',
        nombre: '', 
        aliasCarpeta: '', 
        numeroDocumento: '', 
        lugarExpedicion: '', 
        lugarResidencia: '', 
        direccionResidencia: '', 
        telefono: '', 
        email: '' 
      });
      setModalAbierto(false);
      await cargarDatos();
    } catch (err: unknown) {
      const error = err as Error;
      setErrorMsg(error.message || 'Error al guardar el cliente');
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminar = async (id: string, nombre: string) => {
    if (window.confirm(`¿Estás seguro de eliminar el cliente "${nombre}"? Esta acción no borrará sus proyectos vinculados.`)) {
      try {
        await eliminarCliente(id);
        await cargarDatos();
      } catch (err) {
        console.error("Error al eliminar cliente:", err);
      }
    }
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
      {/* Encabezado */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <UserCheck size={24} color="#38bdf8" />
            <span>Directorio de Clientes</span>
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '4px' }}>
            Administra personas naturales, empresas y sus carpetas de Google Drive vinculadas
          </p>
        </div>
        <button 
          onClick={() => { setModalAbierto(true); setErrorMsg(''); }}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Plus size={18} />
          <span>+ Nuevo Cliente</span>
        </button>
      </div>

      {/* Barra de Búsqueda */}
      <div className="card" style={{ padding: '12px 16px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Search size={18} color="#94a3b8" />
        <input 
          type="text" 
          placeholder="Buscar por nombre, cédula, teléfono o correo..." 
          value={busqueda} 
          onChange={(e) => setBusqueda(e.target.value)}
          style={{ border: 'none', background: 'transparent', width: '100%', color: '#f8fafc', outline: 'none' }}
        />
      </div>

      {/* Tabla Modular */}
      <div className="card" style={{ padding: '20px' }}>
        <TablaClientes
          clientes={clientes}
          cargando={cargando}
          busqueda={busqueda}
          onEliminar={handleEliminar}
        />
      </div>

      {/* Modal Modular */}
      <ModalNuevoCliente
        abierto={modalAbierto}
        onClose={() => setModalAbierto(false)}
        form={form}
        setForm={setForm}
        onGuardar={handleGuardar}
        guardando={guardando}
        errorMsg={errorMsg}
      />
    </div>
  );
}
