// ============================================================
// BLOQUE 1: IMPORTACIONES Y DEPENDENCIAS
// Qué hace: Vista principal para la formalización y descarga de contratos de obra bajo la ley colombiana.
// Por qué: Arquitectura Feature-Driven y Regla 2.2 Manual Maestro.
// ============================================================
import React, { useState, useEffect } from 'react';
import { FileCheck, Eye, Folder, CheckCircle } from 'lucide-react';
import { obtenerProyectos } from '../../services/proyectosService';
import { obtenerClientes } from '../../services/clientesService';
import { 
  generarNombreArchivoContrato, 
  compilarHtmlContrato, 
  guardarContratoOficial, 
  obtenerContratoGuardadoPorProyecto 
} from '../../services/contratosService';
import { obtenerCotizacionGuardadaPorProyecto } from '../../services/cotizacionesService';
import { descargarHtmlComoPdf } from '../../services/pdfConverterService';
import { guardarDocumentoEnSubcarpetaDrive } from '../../services/driveService.js';

import FormularioContrato from './components/FormularioContrato';
import ModalPreviewContrato from './components/ModalPreviewContrato';

import type { IProyecto } from '../../types/proyecto';
import type { ICliente } from '../../types/cliente';

// ============================================================
// BLOQUE 2: COMPONENTE PRINCIPAL DE CONTRATOS
// ============================================================
export default function ContratosPage() {
  const [proyectos, setProyectos] = useState<IProyecto[]>([]);
  const [clientes, setClientes] = useState<ICliente[]>([]);
  const [proyectoSeleccionado, setProyectoSeleccionado] = useState<string>('');

  const [cargando, setCargando] = useState<boolean>(false);
  const [guardando, setGuardando] = useState<boolean>(false);
  const [mensajeExito, setMensajeExito] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Modal Preview
  const [modalPreviewAbierto, setModalPreviewAbierto] = useState<boolean>(false);
  const [htmlCompilado, setHtmlCompilado] = useState<string>('');
  const [modoVista, setModoVista] = useState<'preview' | 'editor'>('preview');

  // Formulario
  const [form, setForm] = useState<any>({
    codigoCotizacion: 'RH-COT-001-0001',
    fechaContrato: new Date().toISOString().split('T')[0],
    clienteNombre: '',
    clienteDocumento: '',
    ciudadExpedicion: '',
    ciudadResidencia: '',
    direccionResidencia: '',
    telefono: '',
    correo: '',
    direccionObra: '',
    ciudadObra: '',
    fechaInicio: new Date().toISOString().split('T')[0],
    fechaEntrega: '',
    duracionEstimada: '15 días hábiles',
    suministroMateriales: 'CONTRATISTA',
    valorTotal: 0
  });

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

      const [contratoGuardado, cotizData] = await Promise.all([
        obtenerContratoGuardadoPorProyecto(proyectoSeleccionado),
        obtenerCotizacionGuardadaPorProyecto(proyectoSeleccionado)
      ]);

      if (contratoGuardado && contratoGuardado.datosFormulario) {
        setForm(contratoGuardado.datosFormulario);
      } else {
        setForm({
          codigoCotizacion: proy?.codigoCotizacion || 'RH-COT-001-0001',
          fechaContrato: new Date().toISOString().split('T')[0],
          clienteNombre: cli?.nombre || '',
          clienteDocumento: cli?.numeroDocumento || '',
          ciudadExpedicion: cli?.lugarExpedicion || cli?.lugarResidencia || 'Bogotá D.C.',
          ciudadResidencia: cli?.lugarResidencia || 'Bogotá D.C.',
          direccionResidencia: cli?.direccionResidencia || '',
          telefono: cli?.telefono || '',
          correo: cli?.email || '',
          direccionObra: proy?.direccionObra || cli?.direccionResidencia || '',
          ciudadObra: proy?.lugarObra || cli?.lugarResidencia || 'Bogotá D.C.',
          fechaInicio: cotizData?.datosFormulario?.fechaInicio || new Date().toISOString().split('T')[0],
          fechaEntrega: cotizData?.datosFormulario?.fechaEntrega || '',
          duracionEstimada: cotizData?.datosFormulario?.duracionEstimada || '15 días hábiles',
          suministroMateriales: cotizData?.datosFormulario?.suministroMateriales || 'CONTRATISTA',
          valorTotal: cotizData?.totalGeneral || 0
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

  const handlePrevisualizar = () => {
    const html = compilarHtmlContrato(form);
    setHtmlCompilado(html);
    setModoVista('preview');
    setModalPreviewAbierto(true);
  };

  const handleDescargarPdf = () => {
    const nombreArchivo = generarNombreArchivoContrato(form.codigoCotizacion, form.clienteNombre);
    descargarHtmlComoPdf(htmlCompilado, nombreArchivo.replace('.html', '.pdf'));
  };

  const handleGuardarDrive = async () => {
    setGuardando(true);
    setMensajeExito('');
    setErrorMsg('');
    try {
      const proy = proyectos.find(p => p.id === proyectoSeleccionado);
      const nombreArchivo = generarNombreArchivoContrato(form.codigoCotizacion, form.clienteNombre);

      await guardarContratoOficial({
        proyectoId: proyectoSeleccionado,
        codigoCotizacion: form.codigoCotizacion,
        clienteNombre: form.clienteNombre,
        valorTotalContrato: Number(form.valorTotal || 0),
        datosFormulario: form
      });

      if (proy?.driveFolderId) {
        await guardarDocumentoEnSubcarpetaDrive({
          projectDriveFolderId: proy.driveFolderId,
          subcarpetaNombre: '02. CONTRATOS Y FACTURAS',
          nombreArchivo,
          contenidoHtml: htmlCompilado
        });
      }

      setMensajeExito('✅ Contrato guardado con éxito y sincronizado con Google Drive');
      setModalPreviewAbierto(false);
    } catch (err: unknown) {
      const error = err as Error;
      setErrorMsg(error.message || 'Error al guardar contrato');
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
            <FileCheck size={24} color="#38bdf8" />
            <span>Generador de Contratos Legales de Obra</span>
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '4px' }}>
            Cláusulas institucionales según la ley colombiana con exportación PDF y respaldo en Google Drive
          </p>
        </div>

        <button 
          onClick={handlePrevisualizar}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}
        >
          <Eye size={18} />
          <span>👁️ Ver Contrato Oficial</span>
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
            Proyecto de Obra:
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

      {/* Formulario Modular */}
      <FormularioContrato form={form} setForm={setForm} />

      {/* Modal Visor / Editor */}
      <ModalPreviewContrato
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
