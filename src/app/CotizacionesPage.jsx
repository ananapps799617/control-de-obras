import React, { useState, useEffect } from 'react';
import { FileText, Download, Eye, Save, Folder, Plus, Trash2, CheckCircle, RefreshCw, Edit3 } from 'lucide-react';
import { obtenerProyectos, actualizarEstadoProyecto } from '../services/proyectosService';
import { obtenerClientes } from '../services/clientesService';
import { obtenerItemsPorProyecto } from '../services/itemsService';
import { obtenerGastosPorProyecto } from '../services/gastosService';
import { 
  generarNombreArchivoCotizacion, 
  compilarHtmlCotizacion, 
  guardarCotizacionOficial, 
  obtenerCotizacionesPorProyecto,
  obtenerCotizacionGuardadaPorProyecto,
  calcularDiasLaborales
} from '../services/cotizacionesService';
import { descargarHtmlComoPdf } from '../services/pdfConverterService';
import { guardarDocumentoEnSubcarpetaDrive } from '../services/driveService.js';
import ModalForm from '../components/ModalForm.jsx';

// ============================================================
// BLOQUE 1: COMPONENTE SECCIÓN 4 — COTIZACIÓN OFICIAL HTML
// Qué hace: Autopopula datos de cliente y obra, compila HTML profesional y descarga el archivo oficial.
// Por qué: Requerimiento del Fundador para generación de cotizaciones bajo la plantilla institucional.
// ============================================================
export default function CotizacionesPage() {
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

  // Formulario completo de Cotización
  const [form, setForm] = useState({
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
    suministroMateriales: 'CONTRATISTA', // 'CONTRATISTA' o 'CLIENTE'
    items: []
  });

  // Calcular automáticamente la duración en días laborales (Lunes a Viernes) al cambiar las fechas del calendario
  useEffect(() => {
    if (form.fechaInicio && form.fechaEntrega) {
      const duracionCalculada = calcularDiasLaborales(form.fechaInicio, form.fechaEntrega);
      setForm(prev => ({ ...prev, duracionEstimada: duracionCalculada }));
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

  // Autopoblar o Recuperar Cotización Guardada previamente en Firestore
  const autopoblarDatosProyecto = async () => {
    if (!proyectoSeleccionado) return;
    setCargando(true);
    setErrorMsg('');
    try {
      const proyectoActual = proyectos.find(p => p.id === proyectoSeleccionado);
      if (!proyectoActual) return;

      // 1. Primero verificar si ya existe una Cotización Guardada en Firestore para este proyecto
      const cotizacionGuardada = await obtenerCotizacionGuardadaPorProyecto(proyectoSeleccionado);

      if (cotizacionGuardada && cotizacionGuardada.datosFormulario) {
        // Cargar exactamente el formulario guardado (sin perder fechas, días laborales ni ajustes)
        setForm(cotizacionGuardada.datosFormulario);
        setMensajeExito(`✅ Cotización oficial cargada desde Firestore (Guardada anteriormente).`);
        setTimeout(() => setMensajeExito(''), 4000);
        return;
      }

      // 2. Si NO existe cotización guardada, autopoblar desde Clientes e Ítems Compuestos
      let clienteAsociado = clientes.find(c => c.id === proyectoActual.clienteId);
      
      // 2. Cargar Ítems Compuestos y Gastos Indirectos (Mano de obra, transporte, extras) de esta obra
      const [itemsCompuestos, gastosObra] = await Promise.all([
        obtenerItemsPorProyecto(proyectoSeleccionado),
        obtenerGastosPorProyecto(proyectoSeleccionado)
      ]);

      const itemsCotizacion = [];

      // A. Agregar Ítems creados (Muebles, obra civil, ítems especiales)
      if (itemsCompuestos && itemsCompuestos.length > 0) {
        itemsCompuestos.forEach(it => {
          itemsCotizacion.push({
            id: it.id,
            nombreItem: it.nombreItem,
            cantidad: 1,
            precioUnitario: Number(it.precioTotalFinal || 0)
          });
        });
      } else {
        itemsCotizacion.push({
          id: Date.now(),
          nombreItem: 'Fabricación e Instalación de Muebles / Carpintería',
          cantidad: 1,
          precioUnitario: 3500000
        });
      }

      // B. Agregar Gastos Indirectos (Mano de obra, Transporte/Fletes, Viáticos, Extras) si fueron calculados
      if (gastosObra) {
        if (Number(gastosObra.totalManoObra || 0) > 0) {
          itemsCotizacion.push({
            id: 'mo-' + Date.now(),
            nombreItem: `👷 Mano de Obra e Instalación Especializada (${gastosObra.diasTrabajoMO || 1} días de instalación)`,
            cantidad: 1,
            precioUnitario: Number(gastosObra.totalManoObra)
          });
        }

        if (Number(gastosObra.totalTransporte || 0) > 0) {
          itemsCotizacion.push({
            id: 'tr-' + Date.now(),
            nombreItem: `🚚 Transporte, Fletes y Acarreos de Obra`,
            cantidad: 1,
            precioUnitario: Number(gastosObra.totalTransporte)
          });
        }

        if (Number(gastosObra.totalViaticos || 0) > 0) {
          itemsCotizacion.push({
            id: 'vt-' + Date.now(),
            nombreItem: `🍱 Viáticos y Alimentación de Personal de Obra`,
            cantidad: 1,
            precioUnitario: Number(gastosObra.totalViaticos)
          });
        }

        if (Number(gastosObra.totalConsumibles || 0) > 0) {
          itemsCotizacion.push({
            id: 'cs-' + Date.now(),
            nombreItem: `🛠️ Herramienta Menor, Consumibles y EPP`,
            cantidad: 1,
            precioUnitario: Number(gastosObra.totalConsumibles)
          });
        }

        if (Number(gastosObra.gastosExtrasVarios || 0) > 0) {
          itemsCotizacion.push({
            id: 'ex-' + Date.now(),
            nombreItem: `📦 ${gastosObra.descripcionGastosExtras || 'Gastos Extras y Logística de Obra'}`,
            cantidad: 1,
            precioUnitario: Number(gastosObra.gastosExtrasVarios)
          });
        }

        if (Number(gastosObra.montoImprevistos || 0) > 0) {
          itemsCotizacion.push({
            id: 'imp-' + Date.now(),
            nombreItem: `🛡️ Imprevistos de Obra (${gastosObra.porcentajeImprevistos}%)`,
            cantidad: 1,
            precioUnitario: Number(gastosObra.montoImprevistos)
          });
        }
      }

      setForm({
        codigoCotizacion: proyectoActual.codigoCotizacion || proyectoActual.tipoCotizacion || 'RH-COT-001-0001',
        fechaCotizacion: new Date().toISOString().split('T')[0],
        clienteNombre: clienteAsociado ? (clienteAsociado.razonSocial || clienteAsociado.nombre) : (proyectoActual.nombreCliente || ''),
        clienteDocumento: clienteAsociado ? (clienteAsociado.nit || clienteAsociado.numeroDocumento) : '',
        direccionResidencia: clienteAsociado ? (clienteAsociado.direccionResidencia || clienteAsociado.direccionBarrio || '') : '',
        ciudadResidencia: clienteAsociado ? (clienteAsociado.lugarResidencia || clienteAsociado.municipioDepartamento || '') : 'Bogotá D.C.',
        telefono: clienteAsociado ? (clienteAsociado.telefono || '') : '',
        correo: clienteAsociado ? (clienteAsociado.correo || '') : '',
        direccionObra: proyectoActual.direccionObra || 'En sitio de obra',
        ciudadObra: proyectoActual.lugarObra || 'Colombia',
        fechaInicio: new Date().toISOString().split('T')[0],
        fechaEntrega: '',
        duracionEstimada: 'Por definir',
        alcanceProyecto: `Suministro, transporte e instalación para la obra: ${proyectoActual.nombre}.`,
        suministroMateriales: 'CONTRATISTA',
        items: itemsCotizacion
      });
    } catch (err) {
      console.error("Error al autopoblar proyecto:", err);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    autopoblarDatosProyecto();
  }, [proyectoSeleccionado, clientes, proyectos]);

  const handleAgregarItemCotizacion = () => {
    setForm({
      ...form,
      items: [
        ...form.items,
        { id: Date.now(), nombreItem: 'Nuevo Trabajo / Mueble', cantidad: 1, precioUnitario: 0 }
      ]
    });
  };

  const handleEliminarItem = (idItem) => {
    setForm({
      ...form,
      items: form.items.filter(it => it.id !== idItem)
    });
  };

  const handleCambioItem = (idItem, campo, valor) => {
    setForm({
      ...form,
      items: form.items.map(it => {
        if (it.id === idItem) {
          return { ...it, [campo]: valor };
        }
        return it;
      })
    });
  };

  const valorTotalCotizacion = form.items.reduce((acc, it) => acc + (Number(it.cantidad || 1) * Number(it.precioUnitario || 0)), 0);

  // Generar nombre de archivo exacto
  const nombreArchivoOficial = generarNombreArchivoCotizacion(form.codigoCotizacion, form.clienteNombre);

  // Compilar HTML final
  const compilarCotizacionActual = () => {
    return compilarHtmlCotizacion({
      ...form,
      valorTotal: valorTotalCotizacion
    });
  };

  const handleAbrirVistaPrevia = () => {
    const html = compilarCotizacionActual();
    setHtmlCompilado(html);
    setModalPreviewAbierto(true);
  };

  const handleDescargarHtml = () => {
    const html = compilarCotizacionActual();
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

  // Convertir y exportar únicamente este documento a PDF listo para el cliente
  const handleExportarPdf = () => {
    const html = compilarCotizacionActual();
    const nombrePdf = nombreArchivoOficial.replace('.html', '.pdf');
    descargarHtmlComoPdf(html, nombrePdf);
  };

  // Guardar la Cotización Oficial directamente en la subcarpeta 'Documentacion' de Google Drive del cliente
  const handleGuardarEnDrive = async () => {
    if (!proyectoSeleccionado) return alert("Selecciona un proyecto obligatoriamente.");
    const proyectoActual = proyectos.find(p => p.id === proyectoSeleccionado);
    setGuardando(true);
    try {
      const html = compilarCotizacionActual();
      const resDrive = await guardarDocumentoEnSubcarpetaDrive({
        projectDriveFolderId: proyectoActual?.driveFolderId,
        subcarpetaNombre: 'Documentacion',
        nombreArchivo: nombreArchivoOficial,
        contenidoHtml: html
      });

      if (resDrive.isFallback) {
        setMensajeExito(`☁️ Cotización asociada a la carpeta Documentación del Proyecto. Abre tu Google Drive: ${resDrive.webViewLink}`);
      } else {
        setMensajeExito(`✅ ¡Cotización guardada exitosamente en la subcarpeta Documentación de Google Drive!`);
      }
      setTimeout(() => setMensajeExito(''), 6000);
    } catch (err) {
      console.error(err);
      setErrorMsg("Error al enviar documento a Google Drive.");
    } finally {
      setGuardando(false);
    }
  };

  const handleGuardarEnFirestore = async () => {
    if (!proyectoSeleccionado) return;
    setGuardando(true);
    try {
      const html = compilarCotizacionActual();
      await guardarCotizacionOficial({
        proyectoId: proyectoSeleccionado,
        codigoCotizacion: form.codigoCotizacion,
        clienteNombre: form.clienteNombre,
        nombreArchivo: nombreArchivoOficial,
        valorTotal: valorTotalCotizacion,
        fechaEmision: form.fechaCotizacion,
        datosFormulario: form, // Preservar 100% el estado del formulario
        contenidoHtml: html
      });

      // Cambiar automáticamente el estado del proyecto a 'Cotizado' en Firestore
      await actualizarEstadoProyecto(proyectoSeleccionado, 'Cotizado');
      await cargarProyectosYClientes();

      setMensajeExito(`✨ ¡Cotización oficial guardada en Firestore y estado del proyecto actualizado a "Cotizado"! (${nombreArchivoOficial})`);
      setTimeout(() => setMensajeExito(''), 6000);
    } catch (err) {
      setErrorMsg(err.message || 'Error al guardar cotización');
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
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0 }}>Cotizaciones Oficiales HTML</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
            Generador corporativo de cotizaciones para clientes bajo la plantilla oficial de RenovaHaus-IMB.
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
                📄 {proyectoActual.codigoCotizacion || proyectoActual.tipoCotizacion}
              </span>
              <button 
                onClick={autopoblarDatosProyecto}
                className="btn btn-secondary"
                style={{ padding: '6px 10px', fontSize: '0.8rem', gap: '4px' }}
                title="Re-sincronizar datos de Cliente e Ítems desde Firestore"
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
          Selecciona un <strong>Proyecto de Obra</strong> para autopoblar la cotización oficial.
        </div>
      ) : cargando ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
          Cargando y autopoblando información del cliente y obra...
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* BARRA DE ACCIONES Y NOMBRE DE ARCHIVO ESTIMADO */}
          <div style={{ 
            display: 'flex', 
            justify: 'space-between', 
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
                NOMBRE DEL ARCHIVO A GENERAR:
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
                <FileText size={16} /> Convertir a PDF
              </button>
              <button onClick={handleGuardarEnDrive} className="btn btn-secondary" style={{ fontSize: '0.85rem', gap: '6px', background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', border: '1px solid rgba(56,189,248,0.4)' }} disabled={guardando}>
                <Folder size={16} /> ☁️ Guardar en Drive (Documentación)
              </button>
              <button onClick={handleGuardarEnFirestore} className="btn btn-primary" style={{ fontSize: '0.85rem', gap: '6px' }} disabled={guardando}>
                <Save size={16} /> {guardando ? 'Guardando...' : 'Guardar en Firebase'}
              </button>
            </div>
          </div>

          {/* FORMULARIO EDITABLE AUTOPOBLADO */}
          <div className="card" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px', color: 'var(--color-primary)' }}>
              📝 Datos Autopoblados para la Cotización
            </h3>

            {/* Fila 1: Cliente & Documento */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: '12px', marginBottom: '12px' }}>
              <div>
                <label className="input-label">Nombre del Cliente *</label>
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
                <label className="input-label">Código Cotización *</label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={form.codigoCotizacion}
                  onChange={(e) => setForm({ ...form, codigoCotizacion: e.target.value })}
                  style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}
                />
              </div>
            </div>

            {/* Fila 2: Ubicación & Contacto */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '12px', marginBottom: '12px' }}>
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
                <label className="input-label">Ciudad Residencia</label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={form.ciudadResidencia}
                  onChange={(e) => setForm({ ...form, ciudadResidencia: e.target.value })}
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

            {/* Fila 3: Datos de Obra & Alcance del Proyecto */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: '12px', marginBottom: '12px' }}>
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
                <label className="input-label">Ciudad / Municipio Obra</label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={form.ciudadObra}
                  onChange={(e) => setForm({ ...form, ciudadObra: e.target.value })}
                />
              </div>
              <div>
                <label className="input-label">Suministro de Materiales</label>
                <select 
                  className="input-field"
                  value={form.suministroMateriales}
                  onChange={(e) => setForm({ ...form, suministroMateriales: e.target.value })}
                >
                  <option value="CONTRATISTA">El CONTRATISTA (RenovaHaus-IMB)</option>
                  <option value="CLIENTE">El CONTRATANTE (Cliente)</option>
                </select>
              </div>
            </div>

            {/* Campo Alcance del Proyecto Personalizable */}
            <div className="input-group" style={{ marginBottom: '16px' }}>
              <label className="input-label" style={{ color: '#38bdf8', fontWeight: 700 }}>
                📋 Alcance del Proyecto (Personalizable para este Proyecto) *
              </label>
              <textarea 
                className="input-field"
                rows="3"
                value={form.alcanceProyecto}
                onChange={(e) => setForm({ ...form, alcanceProyecto: e.target.value })}
                placeholder="Ej. Fabricación, suministro, transporte e instalación de muebles de cocina en RH 15mm con mesón en cuarzo y herrajes de cierre lento."
                style={{ resize: 'vertical' }}
              />
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                Especifica detalladamente los alcances y límites del trabajo para esta cotización comercial.
              </span>
            </div>

            {/* Fila 4: Sección 5 — Cronograma Estimado (Calendarios y Días Laborales Lunes a Viernes) */}
            <div style={{ 
              background: 'rgba(15,23,42,0.6)', 
              border: '1px solid rgba(56, 189, 248, 0.2)', 
              padding: '14px', 
              borderRadius: '8px',
              marginBottom: '16px'
            }}>
              <h4 style={{ margin: '0 0 10px 0', fontSize: '0.9rem', color: '#38bdf8' }}>
                📅 Sección 5. Cronograma Estimado de Obra (Calendario)
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.2fr', gap: '12px', alignItems: 'center' }}>
                <div>
                  <label className="input-label">Fecha Estimada de Inicio *</label>
                  <input 
                    type="date" 
                    className="input-field" 
                    value={form.fechaInicio}
                    onChange={(e) => setForm({ ...form, fechaInicio: e.target.value })}
                    style={{ fontWeight: 600 }}
                  />
                </div>
                <div>
                  <label className="input-label">Fecha Estimada de Entrega *</label>
                  <input 
                    type="date" 
                    className="input-field" 
                    value={form.fechaEntrega}
                    onChange={(e) => setForm({ ...form, fechaEntrega: e.target.value })}
                    style={{ fontWeight: 600 }}
                  />
                </div>
                <div>
                  <label className="input-label">Duración Estimada (Calculada en vivo)</label>
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
                    ⏱️ {form.duracionEstimada || 'Selecciona ambas fechas'}
                  </div>
                </div>
              </div>
            </div>

            {/* Tabla de Ítems del Presupuesto */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h4 style={{ margin: 0, fontSize: '0.95rem', color: '#38bdf8' }}>📊 Ítems del Presupuesto</h4>
                <button type="button" onClick={handleAgregarItemCotizacion} className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '0.8rem', gap: '4px' }}>
                  <Plus size={14} /> + Agregar Ítem
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {form.items.map((it, idx) => (
                  <div key={it.id} style={{ display: 'grid', gridTemplateColumns: '0.4fr 3fr 1fr 1.5fr 0.3fr', gap: '8px', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center' }}>#{idx + 1}</span>
                    <input 
                      type="text" 
                      className="input-field" 
                      style={{ fontSize: '0.82rem', padding: '6px' }}
                      value={it.nombreItem}
                      onChange={(e) => handleCambioItem(it.id, 'nombreItem', e.target.value)}
                      placeholder="Descripción del Trabajo / Mueble"
                    />
                    <input 
                      type="number" 
                      className="input-field" 
                      style={{ fontSize: '0.82rem', padding: '6px', textAlign: 'center' }}
                      value={it.cantidad}
                      onChange={(e) => handleCambioItem(it.id, 'cantidad', e.target.value)}
                    />
                    <input 
                      type="number" 
                      className="input-field" 
                      style={{ fontSize: '0.82rem', padding: '6px', textAlign: 'right', fontWeight: 600, color: '#38bdf8' }}
                      value={it.precioUnitario}
                      onChange={(e) => handleCambioItem(it.id, 'precioUnitario', e.target.value)}
                    />
                    <button type="button" onClick={() => handleEliminarItem(it.id)} style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer' }}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Total Destacado */}
              <div style={{ marginTop: '16px', textAlign: 'right', background: 'rgba(31,83,141,0.3)', border: '1px solid #1f538d', padding: '12px 16px', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>VALOR TOTAL DEL PRESUPUESTO: </span>
                <strong style={{ fontSize: '1.25rem', color: '#38bdf8', fontFamily: 'var(--font-mono)' }}>
                  ${Number(valorTotalCotizacion).toLocaleString()} COP
                </strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Vista Previa y Editor HTML de la Cotización */}
      <ModalForm titulo={`📄 Documento Oficial: ${nombreArchivoOficial}`} abierto={modalPreviewAbierto} onClose={() => setModalPreviewAbierto(false)}>
        {/* Selector de Pestaña: Vista Previa vs Editor HTML */}
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
            <Edit3 size={14} /> ✏️ Editar HTML en Vivo (Antes de PDF / Drive)
          </button>
        </div>

        {modoVistaModal === 'preview' ? (
          <div style={{ maxHeight: '70vh', overflowY: 'auto', background: '#fff', padding: '10px', borderRadius: '8px' }}>
            <iframe 
              srcDoc={htmlCompilado} 
              title="Vista Previa Cotización"
              style={{ width: '100%', height: '580px', border: 'none' }}
            />
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{ fontSize: '0.78rem', color: '#c084fc', fontWeight: 600 }}>
              ✏️ Edita directamente el código HTML (Ajusta textos o saltos de página antes de generar PDF o subir a Drive):
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
            <FileText size={16} /> Convertir a PDF
          </button>
          <button type="button" onClick={handleGuardarEnDrive} className="btn btn-secondary" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', border: '1px solid rgba(56,189,248,0.4)', gap: '6px' }}>
            <Folder size={16} /> ☁️ Guardar en Drive
          </button>
        </div>
      </ModalForm>
    </div>
  );
}
