// ============================================================
// ARCHIVO: src/features/carpinteria/components/ModalNuevoHerraje.tsx
// QUÉ HACE: Modal táctil y ergonómico para crear o editar herrajes en Firestore.
// POR QUÉ: Permite personalizar el catálogo de ferretería del taller.
// ============================================================
import React, { useState, useEffect } from 'react';
import { X, Save, Wrench, DollarSign } from 'lucide-react';
import { IHerrajeDB, crearHerrajeFirestore, actualizarHerrajeFirestore } from '../services/herrajesService';
import { CategoriaHerraje } from '../types/herrajes';

interface Props {
  isOpen: boolean;
  herrajeEditar?: IHerrajeDB | null;
  onClose: () => void;
  onSaved: () => void;
}

const CATEGORIAS_HERRAJES: CategoriaHerraje[] = [
  'Tornillería',
  'Bisagras',
  'Correderas',
  'Tiradores',
  'Accesorios Closet',
  'Soportes & Niveladores',
  'Pistones & Neumáticos'
];

export default function ModalNuevoHerraje({ isOpen, herrajeEditar, onClose, onSaved }: Props) {
  const [nombre, setNombre] = useState('');
  const [subcategoria, setSubcategoria] = useState<CategoriaHerraje>('Tornillería');
  const [unidad, setUnidad] = useState<'und' | 'par' | 'set' | 'm' | 'caja'>('und');
  const [precioUnitario, setPrecioUnitario] = useState<number>(0);
  const [proveedorNombre, setProveedorNombre] = useState('');
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (herrajeEditar) {
      setNombre(herrajeEditar.nombre || '');
      setSubcategoria(herrajeEditar.subcategoria || 'Tornillería');
      setUnidad((herrajeEditar.unidad as any) || 'und');
      setPrecioUnitario(herrajeEditar.precioUnitario || 0);
      setProveedorNombre(herrajeEditar.proveedorNombre || '');
    } else {
      setNombre('');
      setSubcategoria('Tornillería');
      setUnidad('und');
      setPrecioUnitario(0);
      setProveedorNombre('');
    }
  }, [herrajeEditar, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) {
      alert('Por favor ingresa el nombre o referencia del herraje.');
      return;
    }

    setGuardando(true);
    try {
      if (herrajeEditar && herrajeEditar.id) {
        await actualizarHerrajeFirestore(herrajeEditar.id, {
          nombre: nombre.trim(),
          subcategoria,
          unidad,
          precioUnitario: Number(precioUnitario),
          proveedorNombre: proveedorNombre.trim()
        });
      } else {
        await crearHerrajeFirestore({
          nombre: nombre.trim(),
          subcategoria,
          unidad,
          precioUnitario: Number(precioUnitario),
          proveedorNombre: proveedorNombre.trim()
        });
      }
      onSaved();
      onClose();
    } catch (err: any) {
      alert('Error al guardar herraje: ' + (err.message || err));
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.75)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '16px'
    }}>
      <div className="card" style={{
        width: '100%',
        maxWidth: '520px',
        maxHeight: '90vh',
        overflowY: 'auto',
        border: '1.5px solid var(--color-primary)',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '12px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
            <Wrench size={20} />
            <span>{herrajeEditar ? 'Editar Herraje / Accesorio' : 'Nuevo Herraje de Carpintería'}</span>
          </h3>
          <button type="button" onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
              Nombre Comercial / Referencia:
            </label>
            <input
              type="text"
              className="input"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej. Bisagra Blum Cierre Lento 35mm Parche"
              required
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                Subcategoría:
              </label>
              <select
                className="input"
                value={subcategoria}
                onChange={(e) => setSubcategoria(e.target.value as any)}
                style={{ width: '100%' }}
              >
                {CATEGORIAS_HERRAJES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                Unidad de Medida:
              </label>
              <select
                className="input"
                value={unidad}
                onChange={(e) => setUnidad(e.target.value as any)}
                style={{ width: '100%' }}
              >
                <option value="und">Unidad (und)</option>
                <option value="par">Par / Juego (par)</option>
                <option value="set">Set Completo (set)</option>
                <option value="m">Metro Lineal (m)</option>
                <option value="caja">Caja x 100 / x 500</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                Precio Unitario ($ COP):
              </label>
              <input
                type="number"
                min="0"
                step="50"
                className="input font-mono-num"
                value={precioUnitario}
                onChange={(e) => setPrecioUnitario(Number(e.target.value))}
                required
                style={{ width: '100%', color: '#f59e0b', fontWeight: 700 }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                Proveedor / Marca:
              </label>
              <input
                type="text"
                className="input"
                value={proveedorNombre}
                onChange={(e) => setProveedorNombre(e.target.value)}
                placeholder="Ej. Blum, Ducasse, Ferretería"
                style={{ width: '100%' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <button type="button" className="btn-secondary" onClick={onClose} disabled={guardando}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary-cyan" disabled={guardando} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Save size={16} />
              <span>{guardando ? 'Guardando...' : 'Guardar en Catálogo'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
