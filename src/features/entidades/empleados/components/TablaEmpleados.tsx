// ============================================================
// BLOQUE 1: IMPORTACIONES Y DEPENDENCIAS
// Qué hace: Renderiza la tabla de empleados de obra con tarifas, nómina y accesos.
// Por qué: Regla 2.2 Manual Maestro: Componentes modulares atómicos (< 200 líneas).
// ============================================================
import React from 'react';
import { Users, Phone, Mail, FileText, DollarSign, Key, Edit, Trash2 } from 'lucide-react';
import type { IEmpleado } from '../../../../types/empleado';

interface TablaEmpleadosProps {
  empleados: IEmpleado[];
  cargando: boolean;
  busqueda: string;
  onEditar: (emp: IEmpleado) => void;
  onAbrirAcceso: (emp: IEmpleado) => void;
  onEliminar: (id: string, nombre: string) => void;
}

// ============================================================
// BLOQUE 2: COMPONENTE TABLA DE EMPLEADOS
// ============================================================
export default function TablaEmpleados({
  empleados,
  cargando,
  busqueda,
  onEditar,
  onAbrirAcceso,
  onEliminar
}: TablaEmpleadosProps) {
  const empleadosFiltrados = empleados.filter(e => 
    e.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
    e.cargo?.toLowerCase().includes(busqueda.toLowerCase()) ||
    e.cedula?.includes(busqueda) ||
    e.telefono?.includes(busqueda)
  );

  if (cargando) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
        Cargando personal de obra...
      </div>
    );
  }

  if (empleadosFiltrados.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
        {busqueda ? 'No se encontraron colaboradores que coincidan con la búsqueda.' : 'No tienes personal registrado aún.'}
      </div>
    );
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table className="table" style={{ width: '100%' }}>
        <thead>
          <tr>
            <th>Colaborador</th>
            <th>Cargo / Especialidad</th>
            <th>Contacto</th>
            <th>Tarifas ($ COP)</th>
            <th>Observaciones</th>
            <th style={{ textAlign: 'right' }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {empleadosFiltrados.map((emp) => (
            <tr key={emp.id}>
              <td>
                <div style={{ fontWeight: 600, color: '#f8fafc' }}>{emp.nombre}</div>
                {emp.cedula && (
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    C.C: {emp.cedula}
                  </div>
                )}
              </td>
              <td>
                <span className="badge badge-primary" style={{ fontSize: '0.8rem' }}>
                  {emp.cargo}
                </span>
              </td>
              <td>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '0.82rem' }}>
                  {emp.telefono && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#38bdf8' }}>
                      <Phone size={12} /> {emp.telefono}
                    </span>
                  )}
                  {emp.email && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#94a3b8' }}>
                      <Mail size={12} /> {emp.email}
                    </span>
                  )}
                </div>
              </td>
              <td>
                <div style={{ fontSize: '0.82rem', color: '#cbd5e1' }}>
                  {emp.tarifaDiaria && (
                    <div style={{ color: '#34d399', fontWeight: 600 }}>
                      Día: ${Number(emp.tarifaDiaria).toLocaleString()}
                    </div>
                  )}
                  {emp.salarioMensual && (
                    <div style={{ color: '#94a3b8', fontSize: '0.75rem' }}>
                      Mes: ${Number(emp.salarioMensual).toLocaleString()}
                    </div>
                  )}
                  {!emp.tarifaDiaria && !emp.salarioMensual && (
                    <span style={{ color: '#64748b' }}>Sin registrar</span>
                  )}
                </div>
              </td>
              <td style={{ fontSize: '0.82rem', color: '#94a3b8', maxWidth: '200px' }}>
                {emp.observaciones || '—'}
              </td>
              <td style={{ textAlign: 'right' }}>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                  {emp.email && (
                    <button
                      onClick={() => onAbrirAcceso(emp)}
                      className="btn btn-secondary"
                      style={{ padding: '6px 8px', color: '#fbbf24', borderColor: 'rgba(251,191,36,0.3)' }}
                      title="Generar cuenta de acceso a la app"
                    >
                      <Key size={14} />
                    </button>
                  )}
                  <button
                    onClick={() => onEditar(emp)}
                    className="btn btn-secondary"
                    style={{ padding: '6px 8px', color: '#38bdf8' }}
                    title="Editar datos de empleado"
                  >
                    <Edit size={14} />
                  </button>
                  <button
                    onClick={() => onEliminar(emp.id!, emp.nombre)}
                    className="btn btn-secondary"
                    style={{ padding: '6px 8px', color: '#f87171', borderColor: 'rgba(248,113,113,0.3)' }}
                    title="Eliminar empleado"
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
