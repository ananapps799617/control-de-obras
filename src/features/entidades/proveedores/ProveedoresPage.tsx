// ============================================================
// BLOQUE 1: IMPORTACIONES Y DEPENDENCIAS
// Qué hace: Vista principal para administración de proveedores y compras de insumos.
// Por qué: Arquitectura Feature-Driven (Manual Maestro 2.3).
// ============================================================
import React, { useState, useEffect } from 'react';
import { Plus, Search, Truck } from 'lucide-react';
import { obtenerProveedores, crearProveedor, actualizarProveedor, eliminarProveedor } from '../../../services/proveedoresService';
import ModalProveedor from './components/ModalProveedor';
import TablaProveedores from './components/TablaProveedores';
import type { IProveedor, IFormProveedor } from '../../../types/proveedor';

// ============================================================
// BLOQUE 2: COMPONENTE PRINCIPAL DE PROVEEDORES
// ============================================================
export default function ProveedoresPage() {
  const [proveedores, setProveedores] = useState<IProveedor[]>([]);
  const [busqueda, setBusqueda] = useState<string>('');
  const [modalAbierto, setModalAbierto] = useState<boolean>(false);
  const [proveedorEditando, setProveedorEditando] = useState<IProveedor | null>(null);
  const [cargando, setCargando] = useState<boolean>(true);
  const [guardando, setGuardando] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const [form, setForm] = useState<IFormProveedor>({
    razonSocial: '',
    nit: '',
    rubro: '',
    contactoNombre: '',
    municipioDepartamento: '',
    direccionBarrio: '',
    telefono: '',
    email: ''
  });

  const cargarDatos = async () => {
    setCargando(true);
    try {
      const data = await obtenerProveedores();
      const sortAZ = (arr: IProveedor[]) => [...arr].sort((a, b) => (a.razonSocial || a.nombre || '').trim().localeCompare((b.razonSocial || b.nombre || '').trim(), 'es', { sensitivity: 'base' }));
      setProveedores(sortAZ(data));
    } catch (err) {
      console.error(err);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const handleAbrirCrear = () => {
    setProveedorEditando(null);
    setForm({
      razonSocial: '',
      nit: '',
      rubro: '',
      contactoNombre: '',
      municipioDepartamento: '',
      direccionBarrio: '',
      telefono: '',
      email: ''
    });
    setErrorMsg('');
    setModalAbierto(true);
  };

  const handleAbrirEditar = (prov: IProveedor) => {
    setProveedorEditando(prov);
    setForm({
      razonSocial: prov.razonSocial || prov.nombre || '',
      nit: prov.nit || '',
      rubro: prov.rubro || '',
      contactoNombre: prov.contactoNombre || '',
      municipioDepartamento: prov.municipioDepartamento || '',
      direccionBarrio: prov.direccionBarrio || '',
      telefono: prov.telefono || '',
      email: prov.email || ''
    });
    setErrorMsg('');
    setModalAbierto(true);
  };

  const handleGuardar = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg('');
    if (!form.razonSocial.trim()) return setErrorMsg('La Razón Social o Nombre es obligatorio');

    setGuardando(true);
    try {
      if (proveedorEditando && proveedorEditando.id) {
        await actualizarProveedor(proveedorEditando.id, form);
      } else {
        await crearProveedor(form);
      }
      setModalAbierto(false);
      await cargarDatos();
    } catch (err: unknown) {
      const error = err as Error;
      setErrorMsg(error.message || 'Error al guardar el proveedor');
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminar = async (id: string, nombre: string) => {
    if (window.confirm(`¿Estás seguro de eliminar el proveedor "${nombre}"?`)) {
      try {
        await eliminarProveedor(id);
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
            <Truck size={24} color="#38bdf8" />
            <span>Directorio de Proveedores</span>
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '4px' }}>
            Control de casas comerciales, madereras, herrajes e insumos
          </p>
        </div>
        <button 
          onClick={handleAbrirCrear}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Plus size={18} />
          <span>+ Nuevo Proveedor</span>
        </button>
      </div>

      {/* Barra de Búsqueda */}
      <div className="card" style={{ padding: '12px 16px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Search size={18} color="#94a3b8" />
        <input 
          type="text" 
          placeholder="Buscar por razón social, rubro, contacto o NIT..." 
          value={busqueda} 
          onChange={(e) => setBusqueda(e.target.value)}
          style={{ border: 'none', background: 'transparent', width: '100%', color: '#f8fafc', outline: 'none' }}
        />
      </div>

      {/* Tabla Modular */}
      <div className="card" style={{ padding: '20px' }}>
        <TablaProveedores
          proveedores={proveedores}
          cargando={cargando}
          busqueda={busqueda}
          onEditar={handleAbrirEditar}
          onEliminar={handleEliminar}
        />
      </div>

      {/* Modal Modular */}
      <ModalProveedor
        abierto={modalAbierto}
        onClose={() => setModalAbierto(false)}
        form={form}
        setForm={setForm}
        onGuardar={handleGuardar}
        guardando={guardando}
        errorMsg={errorMsg}
        proveedorEditando={proveedorEditando}
      />
    </div>
  );
}
