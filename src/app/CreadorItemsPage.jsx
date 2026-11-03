import React, { useState, useEffect } from 'react';
import { Box, Plus, Folder, Upload, FileText, Clipboard, Camera } from 'lucide-react';
import { obtenerProyectos } from '../services/proyectosService';
import { obtenerMateriales } from '../services/materialesService';
import { obtenerItemsPorProyecto, crearItemProyecto, actualizarItemProyecto, eliminarItemProyecto } from '../services/itemsService';
import { obtenerListaCortePorProyecto, guardarListaCorteProyecto } from '../services/corteService';
import { parseOpenCutListCSV, parseOpenCutListText } from '../lib/openCutListParser.js';
import ModalForm from '../components/ModalForm.jsx';

// ============================================================
// BLOQUE 1: SUBCOMPONENTES DEL CREADOR DE ÍTEMS
// ============================================================
import ListaItemsProyecto from '../components/creadorItems/ListaItemsProyecto.jsx';

// ============================================================
// BLOQUE 2: COMPONENTE CREADOR DE ÍTEMS (COMPUESTOS & ESPECIALES)
// Qué hace: Combina insumos del catálogo o crea Ítems Especiales/Servicios Directos sin catálogo.
// Por qué: Requerimiento del Fundador para costear trabajos únicos (ej. Porcelanato, Adecuaciones, Mano de Obra).
// ============================================================
export default function CreadorItemsPage() {
  const [proyectos, setProyectos] = useState([]);
  const [materiales, setMateriales] = useState([]);
  const [proyectoSeleccionado, setProyectoSeleccionado] = useState('');

  const [items, setItems] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [piezasDesplegadas, setPiezasDesplegadas] = useState({});

  const [form, setForm] = useState({
    nombreItem: '',
    tipoCategoria: 'Mueble / Carpintería',
    esItemEspecial: false,
    descripcionEspecial: '',
    costoDirectoEspecial: '',
    porcentajeGanancia: 20,
    materialesAsignados: [
      { id: Date.now(), materialId: '', cantidad: 1, precioUnitario: 0, unidad: '', subtotal: 0 }
    ],
    piezasDespieceMueble: [
      { 
        id: Date.now(), 
        descripcion: 'Lateral Izquierdo', 
        cantidad: 1, 
        altoVeta: '', 
        ancho: '', 
        alto1: 'Sin Canto', 
        alto2: 'Sin Canto', 
        ancho1: 'Sin Canto', 
        ancho2: 'Sin Canto', 
        canto: 'PVC 0.45mm', 
        color: 'Roble Cava' 
      }
    ]
  });

  const cargarCatalogos = async () => {
    try {
      const [dataProyectos, dataMateriales] = await Promise.all([
        obtenerProyectos(),
        obtenerMateriales()
      ]);
      setProyectos(dataProyectos);
      setMateriales(dataMateriales);

      if (dataProyectos.length > 0 && !proyectoSeleccionado) {
        setProyectoSeleccionado(dataProyectos[0].id);
      }
    } catch (err) {
      console.error("Error al cargar catálogos:", err);
    }
  };

  useEffect(() => {
    cargarCatalogos();
  }, []);

  const cargarItemsProyecto = async () => {
    if (!proyectoSeleccionado) return;
    setCargando(true);
    try {
      const data = await obtenerItemsPorProyecto(proyectoSeleccionado);
      setItems(data);
    } catch (err) {
      console.error(err);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarItemsProyecto();
  }, [proyectoSeleccionado]);

  const toggleVerPiezasMueble = (itemId) => {
    setPiezasDesplegadas(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  const calcularTotalesCantoMueble = (piezas) => {
    let totalFlexibleM = 0;
    let totalRigidoM = 0;

    if (!piezas || !Array.isArray(piezas)) {
      return { totalFlexibleM: '0.00', totalRigidoM: '0.00' };
    }

    piezas.forEach(p => {
      const cant = parseInt(p.cantidad) || 0;
      if (cant <= 0) return;

      const altoM = parseFloat(p.altoVeta) > 20 ? parseFloat(p.altoVeta) / 1000 : parseFloat(p.altoVeta) || 0;
      const anchoM = parseFloat(p.ancho) > 20 ? parseFloat(p.ancho) / 1000 : parseFloat(p.ancho) || 0;

      if (p.alto1 === 'Flexible') totalFlexibleM += altoM * cant;
      if (p.alto1 === 'Rígido')   totalRigidoM   += altoM * cant;

      if (p.alto2 === 'Flexible') totalFlexibleM += altoM * cant;
      if (p.alto2 === 'Rígido')   totalRigidoM   += altoM * cant;

      if (p.ancho1 === 'Flexible') totalFlexibleM += anchoM * cant;
      if (p.ancho1 === 'Rígido')   totalRigidoM   += anchoM * cant;

      if (p.ancho2 === 'Flexible') totalFlexibleM += anchoM * cant;
      if (p.ancho2 === 'Rígido')   totalRigidoM   += anchoM * cant;
    });

    return {
      totalFlexibleM: totalFlexibleM.toFixed(2),
      totalRigidoM: totalRigidoM.toFixed(2)
    };
  };

  const calcularCostoBase = () => {
    if (form.esItemEspecial) {
      return parseFloat(form.costoDirectoEspecial) || 0;
    }
    return form.materialesAsignados.reduce((acc, m) => acc + (parseFloat(m.subtotal) || 0), 0);
  };

  const calcularValorGanancia = () => {
    const costo = calcularCostoBase();
    const pct = parseFloat(form.porcentajeGanancia) || 0;
    return (costo * pct) / 100;
  };

  const calcularPrecioTotalFinal = () => {
    return calcularCostoBase() + calcularValorGanancia();
  };

  const handleAgregarFilaMaterial = () => {
    setForm({
      ...form,
      materialesAsignados: [
        ...form.materialesAsignados,
        { id: Date.now(), materialId: '', cantidad: 1, precioUnitario: 0, unidad: '', subtotal: 0 }
      ]
    });
  };

  const handleEliminarFilaMaterial = (idFila) => {
    if (form.materialesAsignados.length === 1) return;
    setForm({
      ...form,
      materialesAsignados: form.materialesAsignados.filter(f => f.id !== idFila)
    });
  };

  const handleCambioFilaMaterial = (idFila, campo, valor) => {
    setForm({
      ...form,
      materialesAsignados: form.materialesAsignados.map(f => {
        if (f.id === idFila) {
          const modificado = { ...f, [campo]: valor };
          if (campo === 'materialId') {
            const matEncontrado = materiales.find(m => m.id === valor);
            if (matEncontrado) {
              modificado.precioUnitario = Number(matEncontrado.precioUnitario || 0);
              modificado.unidad = matEncontrado.unidad || 'Unidad';
              modificado.materialNombre = matEncontrado.nombre;
            }
          }
          const cant = parseFloat(modificado.cantidad) || 0;
          const precio = parseFloat(modificado.precioUnitario) || 0;
          modificado.subtotal = cant * precio;
          return modificado;
        }
        return f;
      })
    });
  };

  const handleAgregarPiezaMueble = () => {
    const primeraPieza = form.piezasDespieceMueble.length > 0 
      ? form.piezasDespieceMueble[0] 
      : {};

    const nuevaPieza = {
      id: Date.now() + Math.random(),
      descripcion: `Pieza ${form.piezasDespieceMueble.length + 1}`,
      cantidad: 1,
      altoVeta: '',
      ancho: '',
      alto1: 'Sin Canto',
      alto2: 'Sin Canto',
      ancho1: 'Sin Canto',
      ancho2: 'Sin Canto',
      canto: primeraPieza.canto || 'PVC 0.45mm',
      color: primeraPieza.color || 'Roble Cava'
    };

    setForm({
      ...form,
      piezasDespieceMueble: [nuevaPieza, ...form.piezasDespieceMueble]
    });
  };

  const handleEliminarPiezaMueble = (idPieza) => {
    if (form.piezasDespieceMueble.length === 1) return;
    setForm({
      ...form,
      piezasDespieceMueble: form.piezasDespieceMueble.filter(p => p.id !== idPieza)
    });
  };

  const handleCambioPiezaMueble = (idPieza, campo, valor) => {
    setForm({
      ...form,
      piezasDespieceMueble: form.piezasDespieceMueble.map(p => {
        if (p.id === idPieza) {
          return { ...p, [campo]: valor };
        }
        return p;
      })
    });
  };

  const handleImportarArchivoOpenCutList = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const contenido = evt.target.result;
      const piezasParseadas = parseOpenCutListCSV(contenido);
      if (piezasParseadas.length > 0) {
        const piezasFormateadas = piezasParseadas.map(p => ({
          id: Date.now() + Math.random(),
          descripcion: p.descripcion,
          cantidad: p.cantidad,
          altoVeta: p.largo || '',
          ancho: p.ancho || '',
          alto1: p.alto1 || 'Sin Canto',
          alto2: p.alto2 || 'Sin Canto',
          ancho1: p.ancho1 || 'Sin Canto',
          ancho2: p.ancho2 || 'Sin Canto',
          color: p.color || '',
          canto: p.canto || 'Canto-Arena'
        }));
        setForm(prev => ({
          ...prev,
          piezasDespieceMueble: [...piezasFormateadas, ...prev.piezasDespieceMueble]
        }));
        alert(`✅ Se importaron ${piezasParseadas.length} piezas desde OpenCutList con sus cantos (Rígido/Flexible) y colores.`);
      } else {
        alert("⚠️ No se pudieron extraer piezas del archivo. Verifica que contenga columnas de medidas (Longitud, Anchura, Cantidad).");
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handlePegarOpenCutList = async () => {
    try {
      let texto = '';
      if (navigator.clipboard && navigator.clipboard.readText) {
        texto = await navigator.clipboard.readText();
      } else {
        texto = window.prompt("Pega aquí el contenido copiado desde OpenCutList (Copiar → Títulos + valores):");
      }
      if (!texto) return;

      const piezasParseadas = parseOpenCutListText(texto);
      if (piezasParseadas.length > 0) {
        const piezasFormateadas = piezasParseadas.map(p => ({
          id: Date.now() + Math.random(),
          descripcion: p.descripcion,
          cantidad: p.cantidad,
          altoVeta: p.largo || '',
          ancho: p.ancho || '',
          alto1: p.alto1 || 'Sin Canto',
          alto2: p.alto2 || 'Sin Canto',
          ancho1: p.ancho1 || 'Sin Canto',
          ancho2: p.ancho2 || 'Sin Canto',
          color: p.color || '',
          canto: p.canto || 'Canto-Arena'
        }));
        setForm(prev => ({
          ...prev,
          piezasDespieceMueble: [...piezasFormateadas, ...prev.piezasDespieceMueble]
        }));
        alert(`✅ Se importaron ${piezasParseadas.length} piezas pegadas desde OpenCutList.`);
      } else {
        alert("⚠️ No se detectaron piezas válidas en el texto pegado.");
      }
    } catch (err) {
      console.error(err);
      const texto = window.prompt("Pega aquí el contenido copiado desde OpenCutList (Copiar → Títulos + valores):");
      if (texto) {
        const piezasParseadas = parseOpenCutListText(texto);
        if (piezasParseadas.length > 0) {
          const piezasFormateadas = piezasParseadas.map(p => ({
            id: Date.now() + Math.random(),
            descripcion: p.descripcion,
            cantidad: p.cantidad,
            altoVeta: p.largo || '',
            ancho: p.ancho || '',
            alto1: p.alto1 || 'Sin Canto',
            alto2: p.alto2 || 'Sin Canto',
            ancho1: p.ancho1 || 'Sin Canto',
            ancho2: p.ancho2 || 'Sin Canto',
            color: p.color || '',
            canto: p.canto || 'Canto-Arena'
          }));
          setForm(prev => ({
            ...prev,
            piezasDespieceMueble: [...piezasFormateadas, ...prev.piezasDespieceMueble]
          }));
          alert(`✅ Se importaron ${piezasParseadas.length} piezas pegadas desde OpenCutList.`);
        }
      }
    }
  };

  const handleImportarFotoOpenCutList = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const promptTexto = window.prompt("📷 Escáner de Captura de OpenCutList: Si la captura contiene texto o tabla de medidas, confirma o pega las filas aquí:");
    if (promptTexto) {
      const piezasParseadas = parseOpenCutListCSV(promptTexto);
      if (piezasParseadas.length > 0) {
        const piezasFormateadas = piezasParseadas.map(p => ({
          id: Date.now() + Math.random(),
          descripcion: p.descripcion,
          cantidad: p.cantidad,
          altoVeta: p.largo || '',
          ancho: p.ancho || '',
          alto1: p.alto1 || 'Sin Canto',
          alto2: p.alto2 || 'Sin Canto',
          ancho1: p.ancho1 || 'Sin Canto',
          ancho2: p.ancho2 || 'Sin Canto',
          color: p.color || '',
          canto: p.canto || 'Canto-Arena'
        }));
        setForm(prev => ({
          ...prev,
          piezasDespieceMueble: [...piezasFormateadas, ...prev.piezasDespieceMueble]
        }));
        alert(`✅ Se procesaron ${piezasParseadas.length} piezas desde la captura.`);
      }
    }
    e.target.value = '';
  };

  const handleAbrirModalNuevo = () => {
    setEditandoId(null);
    setForm({
      nombreItem: '',
      tipoCategoria: 'Mueble / Carpintería',
      esItemEspecial: false,
      descripcionEspecial: '',
      costoDirectoEspecial: '',
      porcentajeGanancia: 20,
      materialesAsignados: [
        { id: Date.now(), materialId: '', cantidad: 1, precioUnitario: 0, unidad: '', subtotal: 0 }
      ],
      piezasDespieceMueble: [
        { 
          id: Date.now(), 
          descripcion: 'Lateral Izquierdo', 
          cantidad: 1, 
          altoVeta: '', 
          ancho: '', 
          alto1: 'Sin Canto', 
          alto2: 'Sin Canto', 
          ancho1: 'Sin Canto', 
          ancho2: 'Sin Canto', 
          canto: 'PVC 0.45mm', 
          color: 'Roble Cava' 
        }
      ]
    });
    setErrorMsg('');
    setModalAbierto(true);
  };

  const handleAbrirModalEditar = (item) => {
    setEditandoId(item.id);
    const esEspecial = Boolean(item.esItemEspecial);

    setForm({
      nombreItem: item.nombreItem || '',
      tipoCategoria: item.tipoCategoria || 'Mueble / Carpintería',
      esItemEspecial: esEspecial,
      descripcionEspecial: item.descripcionEspecial || '',
      costoDirectoEspecial: item.costoMateriales ? String(item.costoMateriales) : '',
      porcentajeGanancia: item.porcentajeGanancia || 20,
      materialesAsignados: item.materialesDespiece && item.materialesDespiece.length > 0 
        ? item.materialesDespiece.map(m => ({ ...m, id: m.id || Date.now() + Math.random() })) 
        : [{ id: Date.now(), materialId: '', cantidad: 1, precioUnitario: 0, unidad: '', subtotal: 0 }],
      piezasDespieceMueble: item.piezasDespieceMueble && item.piezasDespieceMueble.length > 0
        ? item.piezasDespieceMueble.map(p => ({ ...p, id: p.id || Date.now() + Math.random() }))
        : [{ id: Date.now(), descripcion: 'Lateral Izquierdo', cantidad: 1, altoVeta: '', ancho: '', alto1: 'Sin Canto', alto2: 'Sin Canto', ancho1: 'Sin Canto', ancho2: 'Sin Canto', canto: 'PVC 0.45mm', color: 'Roble Cava' }]
    });
    setErrorMsg('');
    setModalAbierto(true);
  };

  const handleGuardar = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!proyectoSeleccionado) {
      return setErrorMsg('⚠️ Debes seleccionar un Proyecto obligatoriamente.');
    }
    if (!form.nombreItem.trim()) {
      return setErrorMsg('El nombre del ítem es obligatorio.');
    }

    const costoBase = calcularCostoBase();
    if (costoBase <= 0) {
      return setErrorMsg(form.esItemEspecial 
        ? 'Ingresa un Costo Base Directo válido para el trabajo especial.' 
        : 'Selecciona al menos un material e ingresa una cantidad válida.');
    }

    const gananciaCalculada = calcularValorGanancia();
    const precioFinal = calcularPrecioTotalFinal();
    const totalesCanto = calcularTotalesCantoMueble(form.piezasDespieceMueble);

    const payload = {
      proyectoId: proyectoSeleccionado,
      nombreItem: form.nombreItem,
      tipoCategoria: form.esItemEspecial ? 'Ítem Especial / Servicio' : form.tipoCategoria,
      esItemEspecial: Boolean(form.esItemEspecial),
      descripcionEspecial: form.esItemEspecial ? form.descripcionEspecial : '',
      porcentajeGanancia: parseFloat(form.porcentajeGanancia) || 0,
      costoMateriales: costoBase,
      valorGanancia: gananciaCalculada,
      precioTotalFinal: precioFinal,
      materialesDespiece: form.esItemEspecial ? [] : form.materialesAsignados.map(m => ({
        id: m.id,
        materialId: m.materialId,
        materialNombre: m.materialNombre || 'Material',
        unidad: m.unidad || 'Unidad',
        precioUnitario: parseFloat(m.precioUnitario) || 0,
        cantidad: parseFloat(m.cantidad) || 0,
        subtotal: parseFloat(m.subtotal) || 0
      })),
      piezasDespieceMueble: (!form.esItemEspecial && form.tipoCategoria === 'Mueble / Carpintería') ? form.piezasDespieceMueble : [],
      cantoFlexibleM: (!form.esItemEspecial && form.tipoCategoria === 'Mueble / Carpintería') ? parseFloat(totalesCanto.totalFlexibleM) : 0,
      cantoRigidoM: (!form.esItemEspecial && form.tipoCategoria === 'Mueble / Carpintería') ? parseFloat(totalesCanto.totalRigidoM) : 0
    };

    setGuardando(true);
    try {
      if (editandoId) {
        await actualizarItemProyecto(editandoId, payload);
      } else {
        await crearItemProyecto(payload);
      }
      setModalAbierto(false);
      await cargarItemsProyecto();
    } catch (err) {
      setErrorMsg(err.message || 'Error al guardar el ítem');
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminarItem = async (id) => {
    if (window.confirm('¿Seguro que deseas eliminar este ítem del proyecto?')) {
      await eliminarItemProyecto(id);
      await cargarItemsProyecto();
    }
  };

  const handleExportarAListaCorte = async (itemMueble) => {
    if (!itemMueble.piezasDespieceMueble || itemMueble.piezasDespieceMueble.length === 0) {
      return alert('Este mueble no tiene piezas registradas en su despiece.');
    }

    try {
      const listaExistente = await obtenerListaCortePorProyecto(proyectoSeleccionado);
      const piezasAnteriores = listaExistente?.piezas || [];

      const piezasNuevas = itemMueble.piezasDespieceMueble.map(p => ({
        id: Date.now() + Math.random(),
        descripcion: `[${itemMueble.nombreItem}] ${p.descripcion || 'Pieza'}`,
        cantidad: parseInt(p.cantidad) || 1,
        altoVeta: p.altoVeta || '',
        ancho: p.ancho || '',
        alto1: p.alto1 || 'Sin Canto',
        alto2: p.alto2 || 'Sin Canto',
        ancho1: p.ancho1 || 'Sin Canto',
        ancho2: p.ancho2 || 'Sin Canto',
        canto: p.canto || 'PVC 0.45mm',
        color: p.color || 'Roble Cava'
      }));

      const piezasUnificadas = [...piezasAnteriores, ...piezasNuevas];

      await guardarListaCorteProyecto(proyectoSeleccionado, {
        nombreLista: `Lista de Corte del Proyecto`,
        totalPiezas: piezasUnificadas.length,
        piezas: piezasUnificadas
      });

      alert(`✅ ¡Éxito! Se exportaron ${piezasNuevas.length} piezas del mueble "${itemMueble.nombreItem}" a la Lista de Corte.`);
    } catch (err) {
      console.error("Error al exportar piezas a la lista de corte:", err);
      alert("⚠️ Error al exportar las piezas a la lista de corte.");
    }
  };

  const proyectoActual = proyectos.find(p => p.id === proyectoSeleccionado);
  const cantosFormModal = calcularTotalesCantoMueble(form.piezasDespieceMueble);

  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0 }}>Creador de Ítems Compuestos & Especiales</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
            Costea muebles con despiece de cantos o registra trabajos especiales de obra civil / servicios directos.
          </p>
        </div>
        <button onClick={handleAbrirModalNuevo} className="btn btn-primary" disabled={!proyectoSeleccionado}>
          <Plus size={18} /> Crear Nuevo Ítem
        </button>
      </div>

      {/* Selector de Proyecto Obligatorio */}
      <div className="card" style={{ marginBottom: '24px', background: 'rgba(30,41,59,0.7)', border: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <Folder size={20} color="var(--color-primary)" />
          <div style={{ flex: 1, minWidth: '220px' }}>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
              PROYECTO SELECCIONADO (OBLIGATORIO) *
            </label>
            <select className="input-field" value={proyectoSeleccionado} onChange={(e) => setProyectoSeleccionado(e.target.value)} style={{ fontWeight: 600, color: 'var(--color-primary)' }}>
              <option value="">-- Selecciona el Proyecto de Obra --</option>
              {proyectos.map(p => (
                <option key={p.id} value={p.id}>{p.nombre} ({p.codigoCotizacion || p.tipoCotizacion || 'Sin Código'})</option>
              ))}
            </select>
          </div>
          {proyectoActual && (
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span className="badge badge-success">📄 {proyectoActual.codigoCotizacion || proyectoActual.tipoCotizacion}</span>
              <span className="badge badge-info">🏢 {proyectoActual.lugarObra || 'Proyecto Activo'}</span>
            </div>
          )}
        </div>
      </div>

      {!proyectoSeleccionado ? (
        <div className="card" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
          Por favor selecciona un <strong>Proyecto de Obra</strong> para ver y crear sus ítems.
        </div>
      ) : cargando ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
          Cargando ítems del proyecto desde Firestore...
        </div>
      ) : (
        /* Subcomponente ListaItemsProyecto */
        <ListaItemsProyecto
          items={items}
          piezasDesplegadas={piezasDesplegadas}
          onTogglePiezas={toggleVerPiezasMueble}
          onEditar={handleAbrirModalEditar}
          onEliminar={handleEliminarItem}
          onExportarListaCorte={handleExportarAListaCorte}
          calcularTotalesCantoMueble={calcularTotalesCantoMueble}
        />
      )}

      {/* Modal Crear / Editar Ítem */}
      <ModalForm titulo={editandoId ? "✏️ Editar Ítem" : "📦 Crear Nuevo Ítem"} abierto={modalAbierto} onClose={() => setModalAbierto(false)} maxWidth="920px">
        <form onSubmit={handleGuardar}>
          {errorMsg && <div style={{ padding: '10px', background: 'rgba(239,68,68,0.15)', color: '#fca5a5', borderRadius: '8px', marginBottom: '12px', fontSize: '0.85rem' }}>{errorMsg}</div>}
          <div className="input-group">
            <label className="input-label">Nombre del Ítem *</label>
            <input type="text" className="input-field" required value={form.nombreItem} onChange={(e) => setForm({ ...form, nombreItem: e.target.value })} placeholder="Ej. Cocina Integral / Adecuación de Baño" />
          </div>
          <div className="input-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem', color: '#c084fc', fontWeight: 600 }}>
              <input type="checkbox" checked={form.esItemEspecial} onChange={(e) => setForm({ ...form, esItemEspecial: e.target.checked })} />
              ✨ ¿Es un Ítem Especial / Servicio Directo (Sin Insumos de Catálogo)?
            </label>
          </div>
          {form.esItemEspecial ? (
            <>
              <div className="input-group">
                <label className="input-label">Descripción / Alcance del Servicio *</label>
                <textarea className="input-field" style={{ minHeight: '80px' }} value={form.descripcionEspecial} onChange={(e) => setForm({ ...form, descripcionEspecial: e.target.value })} placeholder="Ej. Mano de obra para instalación de porcelanato 60x60..." />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="input-group">
                  <label className="input-label">Costo Directo Estimado ($ COP) *</label>
                  <input type="number" className="input-field" value={form.costoDirectoEspecial} onChange={(e) => setForm({ ...form, costoDirectoEspecial: e.target.value })} placeholder="Ej. 1500000" />
                </div>
                <div className="input-group">
                  <label className="input-label">% Margen de Ganancia *</label>
                  <input type="number" className="input-field" value={form.porcentajeGanancia} onChange={(e) => setForm({ ...form, porcentajeGanancia: e.target.value })} placeholder="20" />
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="input-group">
                <label className="input-label">Categoría del Ítem *</label>
                <select className="input-field" value={form.tipoCategoria} onChange={(e) => setForm({ ...form, tipoCategoria: e.target.value })}>
                  <option value="Mueble / Carpintería">🪚 Mueble / Carpintería (Con Despiece)</option>
                  <option value="Obra Civil / Insumos">🏗️ Obra Civil / Insumos Varios</option>
                  <option value="Electricidad / Iluminación">⚡ Electricidad / Iluminación</option>
                  <option value="Plomería / Grifería">🚰 Plomería / Grifería</option>
                </select>
              </div>
              <div className="input-group">
                <label className="input-label">Insumos del Catálogo Asignados</label>
                {form.materialesAsignados.map((fila) => (
                  <div key={fila.id} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                    <select className="input-field" value={fila.materialId} onChange={(e) => handleCambioFilaMaterial(fila.id, 'materialId', e.target.value)}>
                      <option value="">-- Seleccionar Material --</option>
                      {materiales.map(m => (<option key={m.id} value={m.id}>{m.nombre} (${Number(m.precioUnitario).toLocaleString()}/{m.unidad})</option>))}
                    </select>
                    <input type="number" className="input-field" style={{ width: '80px' }} value={fila.cantidad} onChange={(e) => handleCambioFilaMaterial(fila.id, 'cantidad', e.target.value)} placeholder="Cant." />
                    <button type="button" onClick={() => handleEliminarFilaMaterial(fila.id)} className="btn btn-secondary" style={{ color: '#f87171' }}>✕</button>
                  </div>
                ))}
                <button type="button" onClick={handleAgregarFilaMaterial} className="btn btn-secondary" style={{ fontSize: '0.8rem' }}>+ Agregar Material</button>
              </div>
              <div className="input-group">
                <label className="input-label">% Margen de Ganancia *</label>
                <input type="number" className="input-field" value={form.porcentajeGanancia} onChange={(e) => setForm({ ...form, porcentajeGanancia: e.target.value })} />
              </div>

              {/* SECCIÓN RESTAURADA Y OPTIMIZADA: TABLA INTERACTIVA DE DESPIECE */}
              {form.tipoCategoria === 'Mueble / Carpintería' && !form.esItemEspecial && (
                <div style={{ marginTop: '16px', background: 'rgba(251, 191, 36, 0.05)', border: '1px solid rgba(251, 191, 36, 0.25)', padding: '14px', borderRadius: 'var(--radius-md)' }}>
                  
                  {/* BARRA DE HERRAMIENTAS DE IMPORTACIÓN DE OPENCUTLIST (SKETCHUP) */}
                  <div style={{ background: 'rgba(15, 23, 42, 0.7)', border: '1px dashed rgba(251, 191, 36, 0.4)', padding: '10px 14px', borderRadius: '8px', marginBottom: '14px' }}>
                    <div style={{ fontSize: '0.83rem', fontWeight: 700, color: '#fbbf24', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Upload size={16} /> 🚀 IMPORTAR DESPIECE DESDE OPENCUTLIST (SKETCHUP)
                    </div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                      <label className="btn btn-secondary" style={{ padding: '5px 10px', fontSize: '0.78rem', gap: '5px', background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.35)', cursor: 'pointer', fontWeight: 600 }}>
                        <FileText size={14} /> 📄 Cargar CSV / Excel
                        <input type="file" accept=".csv,.txt,.xlsx" style={{ display: 'none' }} onChange={handleImportarArchivoOpenCutList} />
                      </label>

                      <button type="button" onClick={handlePegarOpenCutList} className="btn btn-secondary" style={{ padding: '5px 10px', fontSize: '0.78rem', gap: '5px', background: 'rgba(192, 132, 252, 0.15)', color: '#c084fc', border: '1px solid rgba(192, 132, 252, 0.35)', fontWeight: 600 }}>
                        <Clipboard size={14} /> 📋 Pegar Portapapeles
                      </button>

                      <label className="btn btn-secondary" style={{ padding: '5px 10px', fontSize: '0.78rem', gap: '5px', background: 'rgba(52, 211, 153, 0.15)', color: '#34d399', border: '1px solid rgba(52, 211, 153, 0.35)', cursor: 'pointer', fontWeight: 600 }}>
                        <Camera size={14} /> 📸 Escanear Foto / Captura
                        <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImportarFotoOpenCutList} />
                      </label>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <label style={{ fontSize: '0.9rem', color: '#fbbf24', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                      🪚 Tabla de Despiece del Mueble (Para Lista de Corte)
                    </label>
                    <button 
                      type="button" 
                      onClick={handleAgregarPiezaMueble} 
                      className="btn btn-secondary" 
                      style={{ fontSize: '0.8rem', padding: '6px 12px', background: 'rgba(251,191,36,0.15)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.3)', fontWeight: 600 }}
                    >
                      ➕ Agregar Pieza (Arriba)
                    </button>
                  </div>

                  <div className="scroll-x-touch" style={{ maxHeight: '340px', overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', textAlign: 'left' }}>
                      <thead>
                        <tr style={{ background: 'rgba(15, 23, 42, 0.95)', color: '#fbbf24', borderBottom: '1px solid var(--border-color)', position: 'sticky', top: 0, zIndex: 2 }}>
                          <th style={{ padding: '8px 6px', width: '30px', textAlign: 'center' }}>#</th>
                          <th style={{ padding: '8px 6px', minWidth: '150px' }}>Pieza / Descripción</th>
                          <th style={{ padding: '8px 6px', width: '65px' }}>Cant.</th>
                          <th style={{ padding: '8px 6px', width: '90px' }}>Largo (mm)</th>
                          <th style={{ padding: '8px 6px', width: '90px' }}>Ancho (mm)</th>
                          <th style={{ padding: '8px 6px', width: '95px' }}>Alto 1 (L1)</th>
                          <th style={{ padding: '8px 6px', width: '95px' }}>Alto 2 (L2)</th>
                          <th style={{ padding: '8px 6px', width: '95px' }}>Ancho 1 (A1)</th>
                          <th style={{ padding: '8px 6px', width: '95px' }}>Ancho 2 (A2)</th>
                          <th style={{ padding: '8px 6px', width: '40px', textAlign: 'center' }}>✕</th>
                        </tr>
                      </thead>
                      <tbody>
                        {form.piezasDespieceMueble.map((pieza, idx) => (
                          <tr key={pieza.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: idx % 2 === 0 ? 'rgba(30, 41, 59, 0.4)' : 'rgba(15, 23, 42, 0.4)' }}>
                            <td style={{ padding: '4px 6px', textAlign: 'center', fontWeight: 700, color: '#fbbf24' }}>{idx + 1}</td>
                            <td style={{ padding: '4px 6px' }}>
                              <input 
                                type="text" 
                                className="input-field" 
                                style={{ minHeight: '34px', fontSize: '0.82rem', padding: '0 6px' }} 
                                value={pieza.descripcion} 
                                onChange={(e) => handleCambioPiezaMueble(pieza.id, 'descripcion', e.target.value)} 
                                placeholder="Ej. Puerta / Lateral" 
                              />
                            </td>
                            <td style={{ padding: '4px 6px' }}>
                              <input 
                                type="number" 
                                className="input-field" 
                                style={{ minHeight: '34px', fontSize: '0.82rem', padding: '0 4px', textAlign: 'center' }} 
                                value={pieza.cantidad} 
                                onChange={(e) => handleCambioPiezaMueble(pieza.id, 'cantidad', e.target.value)} 
                              />
                            </td>
                            <td style={{ padding: '4px 6px' }}>
                              <input 
                                type="number" 
                                className="input-field" 
                                style={{ minHeight: '34px', fontSize: '0.82rem', padding: '0 4px' }} 
                                value={pieza.altoVeta} 
                                onChange={(e) => handleCambioPiezaMueble(pieza.id, 'altoVeta', e.target.value)} 
                                placeholder="Largo mm" 
                              />
                            </td>
                            <td style={{ padding: '4px 6px' }}>
                              <input 
                                type="number" 
                                className="input-field" 
                                style={{ minHeight: '34px', fontSize: '0.82rem', padding: '0 4px' }} 
                                value={pieza.ancho} 
                                onChange={(e) => handleCambioPiezaMueble(pieza.id, 'ancho', e.target.value)} 
                                placeholder="Ancho mm" 
                              />
                            </td>
                            <td style={{ padding: '4px 6px' }}>
                              <select className="input-field" style={{ minHeight: '34px', fontSize: '0.75rem', padding: '0 4px' }} value={pieza.alto1} onChange={(e) => handleCambioPiezaMueble(pieza.id, 'alto1', e.target.value)}>
                                <option value="Sin Canto">Sin Canto</option>
                                <option value="Flexible">Flexible</option>
                                <option value="Rígido">Rígido</option>
                              </select>
                            </td>
                            <td style={{ padding: '4px 6px' }}>
                              <select className="input-field" style={{ minHeight: '34px', fontSize: '0.75rem', padding: '0 4px' }} value={pieza.alto2} onChange={(e) => handleCambioPiezaMueble(pieza.id, 'alto2', e.target.value)}>
                                <option value="Sin Canto">Sin Canto</option>
                                <option value="Flexible">Flexible</option>
                                <option value="Rígido">Rígido</option>
                              </select>
                            </td>
                            <td style={{ padding: '4px 6px' }}>
                              <select className="input-field" style={{ minHeight: '34px', fontSize: '0.75rem', padding: '0 4px' }} value={pieza.ancho1} onChange={(e) => handleCambioPiezaMueble(pieza.id, 'ancho1', e.target.value)}>
                                <option value="Sin Canto">Sin Canto</option>
                                <option value="Flexible">Flexible</option>
                                <option value="Rígido">Rígido</option>
                              </select>
                            </td>
                            <td style={{ padding: '4px 6px' }}>
                              <select className="input-field" style={{ minHeight: '34px', fontSize: '0.75rem', padding: '0 4px' }} value={pieza.ancho2} onChange={(e) => handleCambioPiezaMueble(pieza.id, 'ancho2', e.target.value)}>
                                <option value="Sin Canto">Sin Canto</option>
                                <option value="Flexible">Flexible</option>
                                <option value="Rígido">Rígido</option>
                              </select>
                            </td>
                            <td style={{ padding: '4px 6px', textAlign: 'center' }}>
                              <button 
                                type="button" 
                                onClick={() => handleEliminarPiezaMueble(pieza.id)} 
                                className="btn btn-danger" 
                                style={{ minHeight: '30px', width: '30px', padding: 0 }}
                                title="Eliminar Pieza"
                              >
                                ✕
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div style={{ display: 'flex', gap: '16px', marginTop: '10px', color: '#fbbf24', fontSize: '0.82rem', fontWeight: 600, justifyContent: 'flex-end' }}>
                    <span>📏 Canto Delgado (Flexible): <strong>{cantosFormModal.totalFlexibleM} m</strong></span>
                    <span>📏 Canto Rígido: <strong>{cantosFormModal.totalRigidoM} m</strong></span>
                  </div>
                </div>
              )}
            </>
          )}

          <div style={{ background: 'rgba(15,23,42,0.8)', padding: '12px', borderRadius: '8px', marginTop: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              <span>Costo Base:</span>
              <strong>${Number(calcularCostoBase()).toLocaleString()} COP</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#38bdf8' }}>
              <span>Ganancia ({form.porcentajeGanancia}%):</span>
              <strong>+${Number(calcularValorGanancia()).toLocaleString()} COP</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', fontWeight: 700, color: '#34d399', marginTop: '6px', paddingTop: '6px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              <span>Precio Final Venta:</span>
              <strong>${Number(calcularPrecioTotalFinal()).toLocaleString()} COP</strong>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '20px' }}>
            <button type="button" onClick={() => setModalAbierto(false)} className="btn btn-secondary">Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={guardando}>{guardando ? 'Guardando...' : 'Guardar Ítem'}</button>
          </div>
        </form>
      </ModalForm>
    </div>
  );
}
