// ============================================================
// BLOQUE 1: IMPORTACIONES Y DEPENDENCIAS
// Qué hace: Renderiza la tabla de proveedores con búsqueda, edición y eliminación.
// Por qué: Regla 2.2 Manual Maestro: Componentes modulares atómicos (< 200 líneas).
// ============================================================
import React from 'react';
import { Truck, Phone, Mail, MapPin, Edit, Trash2 } from 'lucide-react';
import type { IProveedor } from '../../../../types/proveedor';

interface TablaProveedoresProps {
  proveedores: IProveedor[];
  cargando: boolean;
  busqueda: string;
  onEditar: (prov: IProveedor) => void;
  onEliminar: (id: string, nombre: string) => void;
}

// ============================================================
// BLOQUE 2: COMPONENTE TABLA DE PROVEEDORES
// ============================================================
export default function TablaProveedores({
  proveedores,
  cargando,
  busqueda,
  onEditar,
  onEliminar
}: TablaProveedoresProps) {
  const proveedoresFiltrados = proveedores.filter(p => 
    (p.razonSocial || p.nombre || '').toLowerCase().includes(busqueda.toLowerCase()) ||
    (p.rubro || '').toLowerCase().includes(busqueda.toLowerCase()) ||
    (p.nit || '').includes(busqueda) ||
    (p.contactoNombre || '').toLowerCase().includes(busqueda.toLowerCase())
  );

  if (cargando) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
        Cargando proveedores...
      </div>
    );
  }

  if (proveedoresFiltrados.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
        {busqueda ? 'No se encontraron proveedores que coincidan con la búsqueda.' : 'No tienes proveedores registrados aún.'}
      </div>
    );
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table className="table" style={{ width: '100%' }}>
        <thead>
          <tr>
            <th>Proveedor / Razón Social</th>
            <th>Rubro</th>
            <th>Contacto</th>
            <th>Ubicación</th>
            <th style={{ textAlign: 'right' }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {proveedoresFiltrados.map((prov) => (
            <tr key={prov.id}>
              <td>
                <div style={{ fontWeight: 600, color: '#f8fafc' }}>{prov.razonSocial || prov.nombre}</div>
                {prov.nit && (
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    NIT: {prov.nit}
                  </div>
                )}
              </td>
              <td>
                <span className="badge badge-secondary" style={{ fontSize: '0.8rem' }}>
                  {prov.rubro || 'General'}
                </span>
              </td>
              <td>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '0.82rem' }}>
                  {prov.contactoNombre && (
                    <span style={{ fontWeight: 500, color: '#cbd5e1' }}>{prov.contactoNombre}</span>
                  )}
                  {prov.telefono && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#38bdf8' }}>
                      <Phone size={12} /> {prov.telefono}
                    </span>
                  )}
                  {prov.email && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#94a3b8' }}>
                      <Mail size={12} /> {prov.email}
                    </span>
                  )}
                </div>
              </td>
              <td>
                <div style={{ fontSize: '0.82rem', color: '#cbd5e1' }}>
                  {prov.municipioDepartamento || prov.direccionBarrio ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MapPin size={12} color="#94a3b8" />
                      {prov.municipioDepartamento} {prov.direccionBarrio && `• ${prov.direccionBarrio}`}
                    </span>
                  ) : (
                    <span style={{ color: '#64748b' }}>No registrada</span>
                  )}
                </div>
              </td>
              <td style={{ textAlign: 'right' }}>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                  <button
                    onClick={() => onEditar(prov)}
                    className="btn btn-secondary"
                    style={{ padding: '6px 8px', color: '#38bdf8' }}
                    title="Editar proveedor"
                  >
                    <Edit size={14} />
                  </button>
                  <button
                    onClick={() => onEliminar(prov.id!, prov.razonSocial || prov.nombre || 'Proveedor')}
                    className="btn btn-secondary"
                    style={{ padding: '6px 8px', color: '#f87171', borderColor: 'rgba(248,113,113,0.3)' }}
                    title="Eliminar proveedor"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
