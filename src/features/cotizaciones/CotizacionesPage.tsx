// ============================================================
// BLOQUE 1: IMPORTACIONES Y DEPENDENCIAS
// Qué hace: Vista principal para confeccionar, previsualizar y exportar cotizaciones oficiales.
// Por qué: Arquitectura Feature-Driven y Regla 2.2 Manual Maestro.
// ============================================================
import React, { useState, useEffect } from 'react';
import { FileText, Eye, Save, Folder, CheckCircle } from 'lucide-react';
import { obtenerProyectos, actualizarEstadoProyecto } from '../../services/proyectosService';
import { obtenerClientes } from '../../services/clientesService';
import { obtenerItemsPorProyecto } from '../../services/itemsService';
import { 
  generarNombreArchivoCotizacion, 
  compilarHtmlCotizacion, 
  guardarCotizacionOficial, 
  obtenerCotizacionGuardadaPorProyecto,
  calcularDiasLaborales
} from '../../services/cotizacionesService';
import { descargarHtmlComoPdf } from '../../services/pdfConverterService';
import { guardarDocumentoEnSubcarpetaDrive } from '../../services/driveService.js';

import FormularioCotizacion from './components/FormularioCotizacion';
import TablaItemsCotizacion from './components/TablaItemsCotizacion';
import ModalPreviewCotizacion from './components/ModalPreviewCotizacion';

import type { IProyecto } from '../../types/proyecto';
import type { ICliente } from '../../types/cliente';

// ============================================================
// BLOQUE 2: COMPONENTE PRINCIPAL DE COTIZACIONES
// ============================================================
export default function CotizacionesPage() {
  const [proyectos, setProyectos] = useState<IProyecto[]>([]);
  const [clientes, setClientes] = useState<ICliente[]>([]);
  const [proyectoSeleccionado, setProyectoSeleccionado] = useState<string>('');

  const [cargando, setCargando] = useState<boolean>(false);
  const [guardando, setGuardando] = useState<boolean>(false);
  const [mensajeExito, setMensajeExito] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Modal Vista Previa & Editor en Vivo
  const [modalPreviewAbierto, setModalPreviewAbierto] = useState<boolean>(false);
  const [htmlCompilado, setHtmlCompilado] = useState<string>('');
  const [modoVista, setModoVista] = useState<'preview' | 'editor'>('preview');

  // Formulario
  const [form, setForm] = useState<any>({
    codigoCotizacion: 'RH-COT-001-0001',
    fechaCotizacion: new Date().toISOString().split('T')[0],
    clienteNombre: '',
    clienteDocumento: '',
    direccionResidencia: '',
    ciudadResidencia: '',
    telefono: '',
    correo: '',
    direccionObra: '',
    ciudadObra: '',
    fechaInicio: new Date().toISOString().split('T')[0],
    fechaEntrega: '',
    duracionEstimada: 'Por definir',
    alcanceProyecto: 'Fabricación, suministro, transporte e instalación de carpintería y muebles a medida según especificaciones técnicas.',
    suministroMateriales: 'CONTRATISTA',
    items: []
  });

  // Calcular duración en días hábiles
  useEffect(() => {
    if (form.fechaInicio && form.fechaEntrega) {
      const dias = calcularDiasLaborales(form.fechaInicio, form.fechaEntrega);
      setForm((prev: any) => ({
        ...prev,
        duracionEstimada: dias > 0 ? `${dias} días hábiles (Lunes a Viernes)` : 'Por definir'
      }));
    }
  }, [form.fechaInicio, form.fechaEntrega]);

  const cargarProyectosYClientes = async () => {
    try {
      const [proyData, cliData] = await Promise.all([
        obtenerProyectos(),
        obtenerClientes()
      ]);
      setProyectos(proyData);
      setClientes(cliData);
      if (proyData.length > 0 && !proyectoSeleccionado) {
        setProyectoSeleccionado(proyData[0].id || '');
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    cargarProyectosYClientes();
  }, []);

  const cargarDatosProyecto = async () => {
    if (!proyectoSeleccionado) return;
    setCargando(true);
    try {
      const proy = proyectos.find(p => p.id === proyectoSeleccionado);
      const cli = clientes.find(c => c.id === proy?.clienteId);

      const [cotizGuardada, itemsData] = await Promise.all([
        obtenerCotizacionGuardadaPorProyecto(proyectoSeleccionado),
        obtenerItemsPorProyecto(proyectoSeleccionado).catch(() => [])
      ]);

      if (cotizGuardada && cotizGuardada.datosFormulario) {
        setForm(cotizGuardada.datosFormulario);
      } else {
        const itemsFormateados = (itemsData || []).map((it: any) => ({
          id: it.id || String(Date.now()),
          descripcion: it.nombre || it.descripcion || 'Ítem de Obra',
          cantidad: Number(it.cantidad || 1),
          precioUnitario: Number(it.precioUnitario || it.total || 0),
          total: Number(it.total || 0)
        }));

        setForm({
          codigoCotizacion: proy?.codigoCotizacion || 'RH-COT-001-0001',
          fechaCotizacion: new Date().toISOString().split('T')[0],
          clienteNombre: cli?.nombre || '',
          clienteDocumento: cli?.numeroDocumento || '',
          direccionResidencia: cli?.direccionResidencia || '',
          ciudadResidencia: cli?.lugarResidencia || 'Bogotá D.C.',
          telefono: cli?.telefono || '',
          correo: cli?.email || '',
          direccionObra: proy?.direccionObra || cli?.direccionResidencia || '',
          ciudadObra: proy?.lugarObra || cli?.lugarResidencia || 'Bogotá D.C.',
          fechaInicio: new Date().toISOString().split('T')[0],
          fechaEntrega: '',
          duracionEstimada: '15 días hábiles',
          alcanceProyecto: 'Fabricación, transporte e instalación de carpintería y muebles a medida según especificaciones técnicas.',
          suministroMateriales: 'CONTRATISTA',
          items: itemsFormateados
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatosProyecto();
  }, [proyectoSeleccionado]);

  // Manejo de ítems
  const handleAgregarItem = () => {
    setForm((prev: any) => ({
      ...prev,
      items: [
        ...prev.items,
        { id: String(Date.now()), descripcion: '', cantidad: 1, precioUnitario: 0, total: 0 }
      ]
    }));
  };

  const handleActualizarItem = (id: string, campo: string, valor: any) => {
    setForm((prev: any) => {
      const nuevosItems = prev.items.map((it: any) => {
        if (it.id === id) {
          const itemAct = { ...it, [campo]: valor };
          if (campo === 'cantidad' || campo === 'precioUnitario') {
            const cant = campo === 'cantidad' ? Number(valor) : Number(it.cantidad || 1);
            const precio = campo === 'precioUnitario' ? Number(valor) : Number(it.precioUnitario || 0);
            itemAct.total = cant * precio;
          }
          return itemAct;
        }
        return it;
      });
      return { ...prev, items: nuevosItems };
    });
  };

  const handleEliminarItem = (id: string) => {
    setForm((prev: any) => ({
      ...prev,
      items: prev.items.filter((it: any) => it.id !== id)
    }));
  };

  const totalGeneral = form.items.reduce((acc: number, it: any) => acc + (Number(it.total) || 0), 0);

  const handlePrevisualizar = () => {
    const html = compilarHtmlCotizacion({
      ...form,
      valorTotal: totalGeneral
    });
    setHtmlCompilado(html);
    setModoVista('preview');
    setModalPreviewAbierto(true);
  };

  const handleDescargarPdf = () => {
    const nombreArchivo = generarNombreArchivoCotizacion(form.codigoCotizacion, form.clienteNombre, 'Cotizacion');
    descargarHtmlComoPdf(htmlCompilado, nombreArchivo.replace('.html', '.pdf'));
  };

  const handleGuardarDrive = async () => {
    setGuardando(true);
    setMensajeExito('');
    setErrorMsg('');
    try {
      const proy = proyectos.find(p => p.id === proyectoSeleccionado);
      const nombreArchivo = generarNombreArchivoCotizacion(form.codigoCotizacion, form.clienteNombre, proy?.nombre || 'Obra');

      await guardarCotizacionOficial({
        proyectoId: proyectoSeleccionado,
        codigoCotizacion: form.codigoCotizacion,
        clienteNombre: form.clienteNombre,
        totalGeneral,
        datosFormulario: form,
        items: form.items
      });

      if (proy?.driveFolderId) {
        await guardarDocumentoEnSubcarpetaDrive({
          projectDriveFolderId: proy.driveFolderId,
          subcarpetaNombre: '01. COTIZACIONES Y DISEÑOS',
          nombreArchivo,
          contenidoHtml: htmlCompilado
        });
      }

      await actualizarEstadoProyecto(proyectoSeleccionado, 'Cotizado');
      setMensajeExito('✅ Cotización guardada con éxito y sincronizada con Google Drive');
      setModalPreviewAbierto(false);
    } catch (err: unknown) {
      const error = err as Error;
      setErrorMsg(error.message || 'Error al guardar cotización');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Encabezado */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={24} color="#38bdf8" />
            <span>Generador de Cotizaciones Oficiales</span>
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '4px' }}>
            Plantilla institucional corporativa con exportación PDF y respaldo en Google Drive
          </p>
        </div>

        <button 
          onClick={handlePrevisualizar}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}
        >
          <Eye size={18} />
          <span>👁️ Ver Documento Oficial</span>
        </button>
      </div>

      {mensajeExito && (
        <div style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)', color: '#86efac', padding: '12px 16px', borderRadius: '8px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle size={18} />
          <span>{mensajeExito}</span>
        </div>
      )}

      {/* Selector de Proyecto */}
      <div className="card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Folder size={22} color="#38bdf8" />
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc' }}>
            Obra a Cotizar:
          </h3>
        </div>
        <select
          className="input"
          value={proyectoSeleccionado}
          onChange={(e) => setProyectoSeleccionado(e.target.value)}
          style={{ minWidth: '260px', fontWeight: 600 }}
        >
          {proyectos.map(p => (
            <option key={p.id} value={p.id}>
              {p.nombre} ({p.codigoObra || 'N/A'})
            </option>
          ))}
        </select>
      </div>

      {/* Formulario y Tabla de Ítems */}
      <FormularioCotizacion form={form} setForm={setForm} />
      <TablaItemsCotizacion
        items={form.items}
        onAgregarItem={handleAgregarItem}
        onActualizarItem={handleActualizarItem}
        onEliminarItem={handleEliminarItem}
        totalGeneral={totalGeneral}
      />

      {/* Modal Visor / Editor */}
      <ModalPreviewCotizacion
        abierto={modalPreviewAbierto}
        onClose={() => setModalPreviewAbierto(false)}
        htmlCompilado={htmlCompilado}
        setHtmlCompilado={setHtmlCompilado}
        modoVista={modoVista}
        setModoVista={setModoVista}
        onDescargarPdf={handleDescargarPdf}
        onGuardarDrive={handleGuardarDrive}
        guardando={guardando}
      />
    </div>
  );
}
