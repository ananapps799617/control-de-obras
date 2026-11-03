// ============================================================
// BLOQUE 1: IMPORTACIONES Y DEPENDENCIAS
// Qué hace: Renderiza la tabla de clientes con filtros, badges y botón de Google Drive.
// Por qué: Regla 2.2 Manual Maestro: Componentes modulares atómicos (< 200 líneas).
// ============================================================
import React from 'react';
import { User, Building, Phone, Mail, MapPin, Trash2, Navigation } from 'lucide-react';
import type { ICliente } from '../../../../types/cliente';

interface TablaClientesProps {
  clientes: ICliente[];
  cargando: boolean;
  busqueda: string;
  onEliminar: (id: string, nombre: string) => void;
}

// ============================================================
// BLOQUE 2: COMPONENTE TABLA DE CLIENTES
// ============================================================
export default function TablaClientes({
  clientes,
  cargando,
  busqueda,
  onEliminar
}: TablaClientesProps) {
  const clientesFiltrados = clientes.filter(c => 
    c.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
    c.email?.toLowerCase().includes(busqueda.toLowerCase()) ||
    c.telefono?.includes(busqueda) ||
    c.numeroDocumento?.includes(busqueda)
  );

  if (cargando) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
        Cargando directorio de clientes...
      </div>
    );
  }

  if (clientesFiltrados.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
        {busqueda ? 'No se encontraron clientes que coincidan con la búsqueda.' : 'No tienes clientes registrados aún.'}
      </div>
    );
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table className="table" style={{ width: '100%' }}>
        <thead>
          <tr>
            <th>Tipo</th>
            <th>Cliente / Razón Social</th>
            <th>Documento / NIT</th>
            <th>Contacto</th>
            <th>Ubicación</th>
            <th style={{ textAlign: 'right' }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {clientesFiltrados.map((cliente) => (
            <tr key={cliente.id}>
              <td>
                <span className={`badge ${cliente.tipoCliente === 'Empresa / Razón Social' ? 'badge-primary' : 'badge-secondary'}`}>
                  {cliente.tipoCliente === 'Empresa / Razón Social' ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Building size={12} /> Empresa
                    </span>
                  ) : (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <User size={12} /> Natural
                    </span>
                  )}
                </span>
              </td>
              <td>
                <div style={{ fontWeight: 600, color: '#f8fafc' }}>{cliente.nombre}</div>
                {cliente.aliasCarpeta && (
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    📁 {cliente.aliasCarpeta}
                  </div>
                )}
              </td>
              <td style={{ color: '#cbd5e1', fontSize: '0.85rem' }}>
                {cliente.numeroDocumento || 'Sin registrar'}
                {cliente.lugarExpedicion && (
                  <span style={{ display: 'block', fontSize: '0.72rem', color: '#64748b' }}>
                    Exp: {cliente.lugarExpedicion}
                  </span>
                )}
              </td>
              <td>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '0.82rem' }}>
                  {cliente.telefono && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#38bdf8' }}>
                      <Phone size={12} /> {cliente.telefono}
                    </span>
                  )}
                  {cliente.email && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#94a3b8' }}>
                      <Mail size={12} /> {cliente.email}
                    </span>
                  )}
                </div>
              </td>
              <td>
                <div style={{ fontSize: '0.82rem', color: '#cbd5e1' }}>
                  {cliente.lugarResidencia || cliente.direccionResidencia ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MapPin size={12} color="#94a3b8" />
                      {cliente.lugarResidencia} {cliente.direccionResidencia && `• ${cliente.direccionResidencia}`}
                    </span>
                  ) : (
                    <span style={{ color: '#64748b' }}>No registrada</span>
                  )}
                </div>
              </td>
              <td style={{ textAlign: 'right' }}>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                  {cliente.driveFolderUrl && (
                    <a
                      href={cliente.driveFolderUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-secondary"
                      style={{ padding: '6px 8px', fontSize: '0.75rem', gap: '4px' }}
                      title="Abrir carpeta en Google Drive"
                    >
                      <Navigation size={12} color="#38bdf8" /> Drive
                    </a>
                  )}
                  <button
                    onClick={() => onEliminar(cliente.id!, cliente.nombre)}
                    className="btn btn-secondary"
                    style={{ padding: '6px 8px', color: '#f87171', borderColor: 'rgba(248,113,113,0.3)' }}
                    title="Eliminar cliente"
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
