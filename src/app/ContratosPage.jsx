import React, { useState, useEffect } from 'react';
import { FileCheck, Download, Eye, Save, Folder, RefreshCw, Edit3 } from 'lucide-react';
import { obtenerProyectos, actualizarEstadoProyecto } from '../services/proyectosService';
import { obtenerClientes } from '../services/clientesService';
import { obtenerCotizacionGuardadaPorProyecto, calcularDiasLaborales } from '../services/cotizacionesService';
import { 
  generarNombreArchivoContrato, 
  compilarHtmlContrato, 
  guardarContratoOficial, 
  obtenerContratoGuardadoPorProyecto 
} from '../services/contratosService';
import { descargarHtmlComoPdf } from '../services/pdfConverterService';
import { guardarDocumentoEnSubcarpetaDrive } from '../services/driveService.js';
import ModalForm from '../components/ModalForm.jsx';

// ============================================================
// BLOQUE 1: COMPONENTE SECCIÓN 4 — CONTRATO OFICIAL HTML (RH-CT-003)
// Qué hace: Autopopula datos del cliente, obra y cotización, compila el contrato legal y genera el archivo oficial.
// Por qué: Requerimiento del Fundador para legalización de obras de carpintería y muebles a medida.
// ============================================================
export default function ContratosPage() {
  const [proyectos, setProyectos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [proyectoSeleccionado, setProyectoSeleccionado] = useState('');

  const [cargando, setCargando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [mensajeExito, setMensajeExito] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Modal Vista Previa HTML & Editor en Vivo
  const [modalPreviewAbierto, setModalPreviewAbierto] = useState(false);
  const [htmlCompilado, setHtmlCompilado] = useState('');
  const [modoVistaModal, setModoVistaModal] = useState('preview'); // 'preview' o 'editor'

  // Formulario completo de Contrato
  const [form, setForm] = useState({
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
    duracionEstimada: 'Por definir',
    suministroMateriales: 'CONTRATISTA',
    valorTotal: 0
  });

  // Recalcular días laborales en vivo al cambiar fechas
  useEffect(() => {
    if (form.fechaInicio && form.fechaEntrega) {
      const duracion = calcularDiasLaborales(form.fechaInicio, form.fechaEntrega);
      setForm(prev => ({ ...prev, duracionEstimada: duracion }));
    }
  }, [form.fechaInicio, form.fechaEntrega]);

  const cargarProyectosYClientes = async () => {
    try {
      const [dataProyectos, dataClientes] = await Promise.all([
        obtenerProyectos(),
        obtenerClientes()
      ]);
      setProyectos(dataProyectos);
      setClientes(dataClientes);

      if (dataProyectos.length > 0 && !proyectoSeleccionado) {
        setProyectoSeleccionado(dataProyectos[0].id);
      }
    } catch (err) {
      console.error("Error al cargar catalogos:", err);
    }
  };

  useEffect(() => {
    cargarProyectosYClientes();
  }, []);

  // Autopoblar o Recuperar Contrato Guardado previamente en Firestore
  const autopoblarDatosContrato = async () => {
    if (!proyectoSeleccionado) return;
    setCargando(true);
    setErrorMsg('');
    try {
      const proyectoActual = proyectos.find(p => p.id === proyectoSeleccionado);
      if (!proyectoActual) return;

      // 1. Primero verificar si ya existe un Contrato Guardado en Firestore
      const contratoGuardado = await obtenerContratoGuardadoPorProyecto(proyectoSeleccionado);
      if (contratoGuardado && contratoGuardado.datosFormulario) {
        setForm(contratoGuardado.datosFormulario);
        setMensajeExito(`✅ Contrato oficial (RH-CT-003) cargado desde Firestore (Guardado previamente).`);
        setTimeout(() => setMensajeExito(''), 4000);
        return;
      }

      // 2. Si NO existe contrato guardado, traer datos de Cliente, Proyecto y Cotización
      let clienteAsociado = clientes.find(c => c.id === proyectoActual.clienteId);
      const cotizacionAsociada = await obtenerCotizacionGuardadaPorProyecto(proyectoSeleccionado);

      setForm({
        codigoCotizacion: proyectoActual.codigoCotizacion || proyectoActual.tipoCotizacion || 'RH-COT-001-0001',
        fechaContrato: new Date().toISOString().split('T')[0],
        clienteNombre: clienteAsociado ? (clienteAsociado.razonSocial || clienteAsociado.nombre) : (proyectoActual.nombreCliente || ''),
        clienteDocumento: clienteAsociado ? (clienteAsociado.nit || clienteAsociado.numeroDocumento) : '',
        ciudadExpedicion: clienteAsociado ? (clienteAsociado.lugarExpedicion || clienteAsociado.lugarResidencia || 'Bogotá D.C.') : 'Bogotá D.C.',
        ciudadResidencia: clienteAsociado ? (clienteAsociado.lugarResidencia || clienteAsociado.municipioDepartamento || 'Bogotá D.C.') : 'Bogotá D.C.',
        direccionResidencia: clienteAsociado ? (clienteAsociado.direccionResidencia || clienteAsociado.direccionBarrio || '') : '',
        telefono: clienteAsociado ? (clienteAsociado.telefono || '') : '',
        correo: clienteAsociado ? (clienteAsociado.correo || '') : '',
        direccionObra: proyectoActual.direccionObra || 'En sitio de obra',
        ciudadObra: proyectoActual.lugarObra || 'Colombia',
        fechaInicio: cotizacionAsociada?.datosFormulario?.fechaInicio || new Date().toISOString().split('T')[0],
        fechaEntrega: cotizacionAsociada?.datosFormulario?.fechaEntrega || '',
        duracionEstimada: cotizacionAsociada?.datosFormulario?.duracionEstimada || '15 días hábiles',
        suministroMateriales: cotizacionAsociada?.datosFormulario?.suministroMateriales || 'CONTRATISTA',
        valorTotal: cotizacionAsociada ? cotizacionAsociada.valorTotal : 3500000
      });
    } catch (err) {
      console.error("Error al autopoblar contrato:", err);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    autopoblarDatosContrato();
  }, [proyectoSeleccionado, clientes, proyectos]);

  const nombreArchivoOficial = generarNombreArchivoContrato(form.codigoCotizacion, form.clienteNombre);

  const compilarContratoActual = () => {
    return compilarHtmlContrato(form);
  };

  const handleAbrirVistaPrevia = () => {
    const html = compilarContratoActual();
    setHtmlCompilado(html);
    setModalPreviewAbierto(true);
  };

  const handleDescargarHtml = () => {
    const html = compilarContratoActual();
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = nombreArchivoOficial;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportarPdf = () => {
    const html = compilarContratoActual();
    const nombrePdf = nombreArchivoOficial.replace('.html', '.pdf');
    descargarHtmlComoPdf(html, nombrePdf);
  };

  const handleGuardarEnDrive = async () => {
    if (!proyectoSeleccionado) return alert("Selecciona un proyecto obligatoriamente.");
    const proyectoActual = proyectos.find(p => p.id === proyectoSeleccionado);
    setGuardando(true);
    try {
      const html = compilarContratoActual();
      const resDrive = await guardarDocumentoEnSubcarpetaDrive({
        projectDriveFolderId: proyectoActual?.driveFolderId,
        subcarpetaNombre: 'Documentacion',
        nombreArchivo: nombreArchivoOficial,
        contenidoHtml: html
      });

      if (resDrive.isFallback) {
        setMensajeExito(`☁️ Contrato asociado a la carpeta Documentación del Proyecto. Abre tu Google Drive: ${resDrive.webViewLink}`);
      } else {
        setMensajeExito(`✅ ¡Contrato legal guardado exitosamente en la subcarpeta Documentación de Google Drive!`);
      }
      setTimeout(() => setMensajeExito(''), 6000);
    } catch (err) {
      console.error(err);
      setErrorMsg("Error al enviar contrato a Google Drive.");
    } finally {
      setGuardando(false);
    }
  };

  const handleGuardarEnFirestore = async () => {
    if (!proyectoSeleccionado) return;
    setGuardando(true);
    try {
      const html = compilarContratoActual();
      await guardarContratoOficial({
        proyectoId: proyectoSeleccionado,
        codigoCotizacion: form.codigoCotizacion,
        clienteNombre: form.clienteNombre,
        nombreArchivo: nombreArchivoOficial,
        valorTotal: form.valorTotal,
        fechaEmision: form.fechaContrato,
        datosFormulario: form,
        contenidoHtml: html
      });

      // Cambiar automáticamente el estado del proyecto a 'Activo' en Firestore
      await actualizarEstadoProyecto(proyectoSeleccionado, 'Activo');
      await cargarProyectosYClientes();

      setMensajeExito(`✨ ¡Contrato oficial (RH-CT-003) guardado en Firestore y estado del proyecto actualizado a "Activo"! (${nombreArchivoOficial})`);
      setTimeout(() => setMensajeExito(''), 6000);
    } catch (err) {
      setErrorMsg(err.message || 'Error al guardar contrato');
    } finally {
      setGuardando(false);
    }
  };

  const proyectoActual = proyectos.find(p => p.id === proyectoSeleccionado);

  return (
    <div>
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        marginBottom: '20px'
      }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0 }}>Contratos Oficiales de Obra (RH-CT-003)</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
            Generación y legalización de contratos de carpintería y muebles a medida bajo la plantilla institucional de RenovaHaus-IMB.
          </p>
        </div>
      </div>

      {/* Selector de Proyecto Obligatorio */}
      <div className="card" style={{ marginBottom: '20px', background: 'rgba(30,41,59,0.7)', border: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <Folder size={20} color="var(--color-primary)" />
          <div style={{ flex: 1, minWidth: '220px' }}>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
              PROYECTO SELECCIONADO (OBLIGATORIO) *
            </label>
            <select 
              className="input-field" 
              value={proyectoSeleccionado}
              onChange={(e) => setProyectoSeleccionado(e.target.value)}
              style={{ fontWeight: 600, color: 'var(--color-primary)' }}
            >
              <option value="">-- Selecciona el Proyecto de Obra --</option>
              {proyectos.map(p => (
                <option key={p.id} value={p.id}>
                  {p.nombre} ({p.codigoCotizacion || p.tipoCotizacion || 'Sin Código'})
                </option>
              ))}
            </select>
          </div>

          {proyectoActual && (
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span className="badge badge-success">
                📄 RH-CT-003 ({proyectoActual.codigoCotizacion || proyectoActual.tipoCotizacion})
              </span>
              <button 
                onClick={autopoblarDatosContrato}
                className="btn btn-secondary"
                style={{ padding: '6px 10px', fontSize: '0.8rem', gap: '4px' }}
                title="Re-sincronizar datos"
              >
                <RefreshCw size={14} /> Re-sincronizar
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mensajes de Estado */}
      {mensajeExito && (
        <div style={{ padding: '12px 16px', background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)', color: '#4ade80', borderRadius: '8px', marginBottom: '16px', fontWeight: 600 }}>
          {mensajeExito}
        </div>
      )}
      {errorMsg && (
        <div style={{ padding: '12px 16px', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5', borderRadius: '8px', marginBottom: '16px', fontSize: '0.88rem' }}>
          {errorMsg}
        </div>
      )}

      {!proyectoSeleccionado ? (
        <div className="card" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
          Selecciona un <strong>Proyecto de Obra</strong> para compilar el Contrato Legal RH-CT-003.
        </div>
      ) : cargando ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
          Cargando y autopoblando contrato legal...
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* BARRA DE ACCIONES Y NOMBRE DE ARCHIVO ESTIMADO */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            gap: '12px', 
            flexWrap: 'wrap',
            background: 'rgba(15,23,42,0.8)',
            padding: '14px 18px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid rgba(56, 189, 248, 0.3)'
          }}>
            <div>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block' }}>
                NOMBRE DEL CONTRATO A GENERAR:
              </span>
              <strong style={{ fontSize: '0.95rem', color: 'var(--color-primary)', fontFamily: 'var(--font-mono)' }}>
                📄 {nombreArchivoOficial}
              </strong>
            </div>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button onClick={handleAbrirVistaPrevia} className="btn btn-secondary" style={{ fontSize: '0.85rem', gap: '6px' }}>
                <Eye size={16} /> Vista Previa
              </button>
              <button onClick={handleExportarPdf} className="btn btn-primary" style={{ fontSize: '0.85rem', gap: '6px', background: 'linear-gradient(135deg, #ef4444, #dc2626)', borderColor: '#dc2626' }}>
                <FileCheck size={16} /> Convertir a PDF
              </button>
              <button onClick={handleGuardarEnDrive} className="btn btn-secondary" style={{ fontSize: '0.85rem', gap: '6px', background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', border: '1px solid rgba(56,189,248,0.4)' }} disabled={guardando}>
                <Folder size={16} /> ☁️ Guardar en Drive (Documentación)
              </button>
              <button onClick={handleGuardarEnFirestore} className="btn btn-primary" style={{ fontSize: '0.85rem', gap: '6px' }} disabled={guardando}>
                <Save size={16} /> {guardando ? 'Guardando...' : 'Guardar en Firebase'}
              </button>
            </div>
          </div>

          {/* FORMULARIO DE CONTRATO AUTOPOBLADO Y EDITABLE */}
          <div className="card" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px', color: 'var(--color-primary)' }}>
              📝 Cláusulas y Datos Legalizables del Contrato (RH-CT-003)
            </h3>

            {/* Fila 1: Datos de Partes */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: '12px', marginBottom: '12px' }}>
              <div>
                <label className="input-label">Nombre Completo Contratante *</label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={form.clienteNombre}
                  onChange={(e) => setForm({ ...form, clienteNombre: e.target.value })}
                />
              </div>
              <div>
                <label className="input-label">Cédula / NIT *</label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={form.clienteDocumento}
                  onChange={(e) => setForm({ ...form, clienteDocumento: e.target.value })}
                />
              </div>
              <div>
                <label className="input-label">Lugar de Expedición C.C. *</label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={form.ciudadExpedicion}
                  onChange={(e) => setForm({ ...form, ciudadExpedicion: e.target.value })}
                />
              </div>
            </div>

            {/* Fila 2: Residencia y Contacto */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '12px', marginBottom: '12px' }}>
              <div>
                <label className="input-label">Municipio Residencia</label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={form.ciudadResidencia}
                  onChange={(e) => setForm({ ...form, ciudadResidencia: e.target.value })}
                />
              </div>
              <div>
                <label className="input-label">Dirección Residencia</label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={form.direccionResidencia}
                  onChange={(e) => setForm({ ...form, direccionResidencia: e.target.value })}
                />
              </div>
              <div>
                <label className="input-label">Teléfono / Celular</label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={form.telefono}
                  onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                />
              </div>
              <div>
                <label className="input-label">Correo Electrónico</label>
                <input 
                  type="email" 
                  className="input-field" 
                  value={form.correo}
                  onChange={(e) => setForm({ ...form, correo: e.target.value })}
                />
              </div>
            </div>

            {/* Fila 3: Ubicación Obra & Valor */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              <div>
                <label className="input-label">Dirección de la Obra</label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={form.direccionObra}
                  onChange={(e) => setForm({ ...form, direccionObra: e.target.value })}
                />
              </div>
              <div>
                <label className="input-label">Municipio de la Obra</label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={form.ciudadObra}
                  onChange={(e) => setForm({ ...form, ciudadObra: e.target.value })}
                />
              </div>
              <div>
                <label className="input-label">Valor Total del Contrato (COP) *</label>
                <input 
                  type="number" 
                  className="input-field" 
                  value={form.valorTotal}
                  onChange={(e) => setForm({ ...form, valorTotal: Number(e.target.value) })}
                  style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#38bdf8' }}
                />
              </div>
            </div>

            {/* Fila 4: Cronograma y Fechas del Contrato */}
            <div style={{ 
              background: 'rgba(15,23,42,0.6)', 
              border: '1px solid rgba(56, 189, 248, 0.2)', 
              padding: '14px', 
              borderRadius: '8px',
              marginBottom: '16px'
            }}>
              <h4 style={{ margin: '0 0 10px 0', fontSize: '0.9rem', color: '#38bdf8' }}>
                📅 Cronograma y Días Laborales del Contrato
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.2fr', gap: '12px', alignItems: 'center' }}>
                <div>
                  <label className="input-label">Fecha de Inicio de Obra *</label>
                  <input 
                    type="date" 
                    className="input-field" 
                    value={form.fechaInicio}
                    onChange={(e) => setForm({ ...form, fechaInicio: e.target.value })}
                  />
                </div>
                <div>
                  <label className="input-label">Fecha de Entrega de Obra *</label>
                  <input 
                    type="date" 
                    className="input-field" 
                    value={form.fechaEntrega}
                    onChange={(e) => setForm({ ...form, fechaEntrega: e.target.value })}
                  />
                </div>
                <div>
                  <label className="input-label">Duración Estimada en Días Hábiles</label>
                  <div style={{ 
                    background: 'rgba(56, 189, 248, 0.15)', 
                    border: '1px solid rgba(56, 189, 248, 0.4)', 
                    color: '#38bdf8', 
                    padding: '8px 12px', 
                    borderRadius: '6px', 
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    fontFamily: 'var(--font-mono)'
                  }}>
                    ⏱️ {form.duracionEstimada || 'Selecciona fechas'}
                  </div>
                </div>
              </div>
            </div>

            {/* Cuadro Resumen de Pagos del Contrato */}
            <div style={{ background: 'rgba(31,83,141,0.2)', border: '1px solid #1f538d', padding: '14px', borderRadius: '8px' }}>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '0.9rem', color: '#38bdf8' }}>💳 Plan de Pagos según Cláusula Séptima:</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '8px', fontSize: '0.82rem' }}>
                <div>🔹 <strong>60% Anticipo:</strong> ${(Number(form.valorTotal) * 0.60).toLocaleString()} COP</div>
                <div>🔹 <strong>20% Instalación:</strong> ${(Number(form.valorTotal) * 0.20).toLocaleString()} COP</div>
                <div>🔹 <strong>10% Avance:</strong> ${(Number(form.valorTotal) * 0.10).toLocaleString()} COP</div>
                <div>🔹 <strong>10% Entrega:</strong> ${(Number(form.valorTotal) * 0.10).toLocaleString()} COP</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Vista Previa y Editor HTML del Contrato */}
      <ModalForm titulo={`📄 Contrato Oficial (RH-CT-003): ${nombreArchivoOficial}`} abierto={modalPreviewAbierto} onClose={() => setModalPreviewAbierto(false)}>
        {/* Selector de Pestañas: Vista Previa vs Editor HTML */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
          <button 
            type="button" 
            onClick={() => setModoVistaModal('preview')} 
            className={`btn ${modoVistaModal === 'preview' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '6px 12px', fontSize: '0.82rem', gap: '6px' }}
          >
            <Eye size={14} /> 👁️ Vista Previa Renderizada
          </button>
          <button 
            type="button" 
            onClick={() => setModoVistaModal('editor')} 
            className={`btn ${modoVistaModal === 'editor' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '6px 12px', fontSize: '0.82rem', gap: '6px', background: modoVistaModal === 'editor' ? '#8b5cf6' : undefined }}
          >
            <Edit3 size={14} /> ✏️ Editar HTML & Firmas en Vivo (Antes de PDF / Drive)
          </button>
        </div>

        {modoVistaModal === 'preview' ? (
          <div style={{ maxHeight: '70vh', overflowY: 'auto', background: '#fff', padding: '10px', borderRadius: '8px' }}>
            <iframe 
              srcDoc={htmlCompilado} 
              title="Vista Previa Contrato"
              style={{ width: '100%', height: '580px', border: 'none' }}
            />
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{ fontSize: '0.78rem', color: '#c084fc', fontWeight: 600 }}>
              ✏️ Edita directamente las cláusulas, textos o acomoda el bloque de firmas antes de generar PDF o subir a Drive:
            </span>
            <textarea 
              className="input-field" 
              rows="22"
              value={htmlCompilado}
              onChange={(e) => setHtmlCompilado(e.target.value)}
              style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', whiteSpace: 'pre', resize: 'vertical' }}
            />
          </div>
        )}

        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '16px', flexWrap: 'wrap' }}>
          <button type="button" onClick={() => setModalPreviewAbierto(false)} className="btn btn-secondary">Cerrar</button>
          <button type="button" onClick={handleExportarPdf} className="btn btn-primary" style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)', gap: '6px' }}>
            <FileCheck size={16} /> Convertir a PDF
          </button>
          <button type="button" onClick={handleGuardarEnDrive} className="btn btn-secondary" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', border: '1px solid rgba(56,189,248,0.4)', gap: '6px' }}>
            <Folder size={16} /> ☁️ Guardar en Drive
          </button>
        </div>
      </ModalForm>
    </div>
  );
}
