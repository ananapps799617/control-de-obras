// ============================================================
// BLOQUE 1: IMPORTACIONES Y DEPENDENCIAS
// Qué hace: Generador de plantillas HTML y persistencia de cotizaciones oficiales en Firestore.
// Por qué: Regla RT-01: Generación de documentos corporativos bajo la plantilla institucional.
// ============================================================
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where,
  serverTimestamp 
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../lib/firebase.js';
import { coleccion } from '../lib/firebase.js';

const COLECCION = coleccion('cotizaciones_oficiales');

// Plantilla HTML Base institucional
const PLANTILLA_BASE_HTML = `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Cotización Comercial - RenovaHaus-IMB</title>
    <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; background-color: #ffffff; color: #2c2c2e; margin: 0; padding: 30px; line-height: 1.5; }
        .container { max-width: 850px; margin: 0 auto; background-color: #ffffff; padding: 10px; }
        .header { border-bottom: 3px solid #1f538d; padding-bottom: 15px; margin-bottom: 25px; display: flex; justify-content: space-between; align-items: center; }
        .header-logo-brand { display: flex; align-items: center; gap: 15px; }
        .brand-titles h1 { color: #1f538d; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px; }
        .brand-titles p { color: #48484a; margin: 3px 0 0 0; font-size: 12px; font-weight: 500; }
        .header-meta { text-align: right; }
        .badge { display: inline-block; padding: 4px 10px; background-color: #1f538d; color: #ffffff; border-radius: 4px; font-size: 11px; font-weight: 700; letter-spacing: 0.5px; margin-bottom: 6px; }
        .meta-text { color: #48484a; font-size: 12px; margin: 2px 0; }
        .meta-text strong { color: #1f538d; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 25px; }
        .card { background-color: #f2f2f7; padding: 18px; border-radius: 8px; border: 1px solid #e5e5ea; border-left: 5px solid #1f538d; margin-bottom: 25px; }
        .card-white { background-color: #ffffff; }
        .card h3 { margin-top: 0; margin-bottom: 12px; color: #1f538d; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
        .card p { margin: 5px 0; font-size: 12px; color: #48484a; }
        .card p strong { color: #2c2c2e; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; margin-bottom: 15px; background-color: #ffffff; }
        th, td { padding: 10px 12px; text-align: left; font-size: 12px; }
        th { background-color: #1f538d; color: #ffffff; font-weight: 600; text-transform: uppercase; font-size: 11px; letter-spacing: 0.5px; }
        td { border-bottom: 1px solid #e5e5ea; color: #2c2c2e; }
        tr:nth-child(even) td { background-color: #f9f9fb; }
        .total-box { text-align: right; padding: 14px 18px; background-color: #1f538d; border-radius: 6px; font-size: 15px; font-weight: 700; color: #ffffff; letter-spacing: 0.5px; margin-top: 10px; }
        .legal-box { background-color: #ffffff; border: 1px solid #e5e5ea; border-left: 5px solid #1f538d; padding: 18px; border-radius: 8px; margin-bottom: 25px; }
        .legal-box h3 { margin-top: 0; margin-bottom: 10px; color: #1f538d; font-size: 13px; font-weight: 700; text-transform: uppercase; }
        .legal-list { margin: 0; padding-left: 18px; font-size: 11.5px; color: #48484a; line-height: 1.6; }
        .legal-list li { margin-bottom: 8px; }
        .signature-card { background-color: #f2f2f7; border: 1px solid #e5e5ea; border-left: 5px solid #1f538d; padding: 22px; border-radius: 8px; margin-top: 25px; }
        .signature-card h3 { margin-top: 0; margin-bottom: 8px; color: #1f538d; font-size: 13px; font-weight: 700; text-transform: uppercase; }
        .signature-card p.declaration { font-size: 12px; color: #2c2c2e; margin-top: 0; margin-bottom: 35px; font-style: italic; }
        .signature-space { margin-top: 40px; max-width: 400px; }
        .signature-line { border-top: 2px solid #2c2c2e; padding-top: 10px; font-size: 12px; color: #2c2c2e; }
        .signature-line p { margin: 4px 0; font-style: normal; }
    </style>
</head>
<body>
    <div class="container">
        <!-- ENCABEZADO Y LOGO -->
        <div class="header">
            <div class="header-logo-brand">
                <div style="background-color: #1f538d; width: 42px; height: 42px; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #ffffff; font-weight: 800; font-size: 20px;">R</div>
                <div class="brand-titles">
                    <h1>RenovaHaus-IMB</h1>
                    <p>Diseño, Arquitectura & Carpintería Arquitectónica</p>
                </div>
            </div>
            <div class="header-meta">
                <div class="badge">DOCUMENTO OFICIAL</div>
                <div class="meta-text">Cotización: <strong>{{NRO_COT}}</strong></div>
                <div class="meta-text">Fecha: <strong>{{FECHA_COT}}</strong></div>
            </div>
        </div>

        <!-- INFORMACIÓN CLIENTE Y OBRA -->
        <div class="info-grid">
            <div class="card" style="margin-bottom: 0;">
                <h3>Información del Cliente</h3>
                <p><strong>Cliente:</strong> {{CLIENTE}}</p>
                <p><strong>Identificación / NIT:</strong> {{CEDULA}}</p>
                <p><strong>Dirección:</strong> {{DIRECCION_RESIDENCIA}}</p>
                <p><strong>Ciudad:</strong> {{CIUDAD_RESIDENCIA}}</p>
                <p><strong>Teléfono:</strong> {{TELEFONO}}</p>
                <p><strong>Correo:</strong> {{CORREO}}</p>
            </div>
            <div class="card" style="margin-bottom: 0;">
                <h3>Ubicación y Cronograma de Obra</h3>
                <p><strong>Contrato Vinculado:</strong> {{CONTRATO}}</p>
                <p><strong>Dirección Obra:</strong> {{DIRECCION_OBRA}}</p>
                <p><strong>Ciudad / Lugar:</strong> {{LUGAR_EJECUCION}}</p>
                <p><strong>Fecha Estimada Inicio:</strong> {{FECHA_INICIO}}</p>
                <p><strong>Fecha Estimada Entrega:</strong> {{FECHA_ENTREGA}}</p>
                <p><strong>Duración Estimada:</strong> {{DURACION}}</p>
            </div>
        </div>

        <!-- ALCANCE GENERAL -->
        <div class="card card-white" style="margin-top: 20px;">
            <h3>Alcance de la Propuesta Técnica</h3>
            <p>{{ALCANCE}}</p>
        </div>

        <!-- TABLA DE ELEMENTOS Y VALORES -->
        <div class="card card-white">
            <h3>Desglose de Ítems y Presupuesto</h3>
            <table>
                <thead>
                    <tr>
                        <th style="width: 40px; text-align: center;">#</th>
                        <th>Descripción del Ítem / Mobiliario</th>
                        <th style="width: 60px; text-align: center;">Cant.</th>
                        <th style="width: 140px; text-align: right;">Vlr. Unitario</th>
                        <th style="width: 140px; text-align: right;">Total Ítem</th>
                    </tr>
                </thead>
                <tbody>
                    {{ITEMS_TABLE_ROWS}}
                </tbody>
            </table>
            <div class="total-box">
                VALOR TOTAL GENERAL: {{VALOR_TOTAL}}
            </div>
        </div>

        <!-- FORMA DE PAGO -->
        <div class="legal-box">
            <h3>Condiciones y Esquema de Pagos</h3>
            <ul class="legal-list">
                <li><strong>60% Anticipo Inicial:</strong> Para adquisición de materias primas y programación de corte: <strong>{{VALOR_ANTICIPO}}</strong>.</li>
                <li><strong>20% Inicio de Armado/Instalación:</strong> Al inicio de labores de montaje en obra: <strong>{{VALOR_INSTALACION}}</strong>.</li>
                <li><strong>10% Avance Intermedio:</strong> Al alcanzar el 75% de avance de montaje: <strong>{{VALOR_AVANCE}}</strong>.</li>
                <li><strong>10% Entrega y Liquidación:</strong> Contra entrega a satisfacción y firma de acta: <strong>{{VALOR_CONFORMIDAD}}</strong>.</li>
            </ul>
        </div>

        <!-- FIRMA DE ACEPTACIÓN -->
        <div class="signature-card">
            <h3>Aceptación de la Propuesta Comercial</h3>
            <p class="declaration">
                Con la firma del presente documento, el cliente manifiesta su plena conformidad con las especificaciones técnicas, materiales, tiempos de entrega y esquema de pagos estipulados en esta cotización.
            </p>
            <div class="signature-space">
                <div class="signature-line">
                    <p><strong>Firma del Cliente / Aceptante:</strong> ___________________________________</p>
                    <p><strong>Nombre:</strong> {{CLIENTE}}</p>
                    <p><strong>C.C. / NIT:</strong> {{CEDULA}}</p>
                    <p><strong>Fecha de Aprobación:</strong> ____ / ____ / ________</p>
                </div>
            </div>
        </div>
    </div>
</body>
</html>`;

// ============================================================
// BLOQUE 2: UTILIDADES DE NOMBRES Y FECHAS
// ============================================================

export const calcularDiasLaborales = (fechaInicioStr: string, fechaFinStr: string): number => {
  if (!fechaInicioStr || !fechaFinStr) return 0;
  try {
    const inicio = new Date(fechaInicioStr + 'T00:00:00');
    const fin = new Date(fechaFinStr + 'T00:00:00');
    if (isNaN(inicio.getTime()) || isNaN(fin.getTime()) || inicio > fin) return 0;

    let contador = 0;
    const cur = new Date(inicio);
    while (cur <= fin) {
      const diaSemana = cur.getDay(); // 0: Dom, 6: Sáb
      if (diaSemana !== 0 && diaSemana !== 6) {
        contador++;
      }
      cur.setDate(cur.getDate() + 1);
    }
    return contador;
  } catch {
    return 0;
  }
};

export const generarNombreArchivoCotizacion = (codigoCotizacion: string, clienteNombre: string, nombreProyecto: string): string => {
  const sanitize = (str: string) => (str || '')
    .trim()
    .replace(/[<>:"/\\|?*]+/g, '')
    .replace(/\s+/g, '_');
  return `${sanitize(codigoCotizacion || 'COTIZACION')}_${sanitize(clienteNombre || 'CLIENTE')}_${sanitize(nombreProyecto || 'OBRA')}.html`;
};

// ============================================================
// BLOQUE 3: COMPILADOR HTML DE COTIZACIÓN
// ============================================================

export const compilarHtmlCotizacion = (datos: any): string => {
  const {
    codigoCotizacion,
    fechaCotizacion,
    clienteNombre,
    clienteDocumento,
    direccionResidencia,
    ciudadResidencia,
    telefono,
    correo,
    direccionObra,
    ciudadObra,
    fechaInicio,
    fechaEntrega,
    duracionEstimada,
    alcanceProyecto,
    suministroMateriales,
    items,
    valorTotal
  } = datos;

  const rowsHtml = (items || []).map((item: any, idx: number) => `
    <tr>
      <td style="text-align: center;">${idx + 1}</td>
      <td><strong>${item.nombreItem || item.descripcion}</strong></td>
      <td style="text-align: center;">${item.cantidad || 1}</td>
      <td style="text-align: right;">$${Number(item.precioUnitario || item.precioTotalFinal || 0).toLocaleString()} COP</td>
      <td style="text-align: right; font-weight: 700;">$${Number((item.cantidad || 1) * (item.precioUnitario || item.precioTotalFinal || 0)).toLocaleString()} COP</td>
    </tr>
  `).join('');

  const totalNum = Number(valorTotal || 0);
  const anticipo60 = totalNum * 0.60;
  const instalacion20 = totalNum * 0.20;
  const avance10 = totalNum * 0.10;
  const conformidad10 = totalNum * 0.10;

  return PLANTILLA_BASE_HTML
    .replace(/{{NRO_COT}}/g, codigoCotizacion || 'RH-COT-001-0001')
    .replace(/{{FECHA_COT}}/g, fechaCotizacion || new Date().toISOString().split('T')[0])
    .replace(/{{CLIENTE}}/g, clienteNombre || 'Cliente no especificado')
    .replace(/{{CEDULA}}/g, clienteDocumento || 'S/N')
    .replace(/{{DIRECCION_RESIDENCIA}}/g, direccionResidencia || 'No especificada')
    .replace(/{{CIUDAD_RESIDENCIA}}/g, ciudadResidencia || 'Colombia')
    .replace(/{{TELEFONO}}/g, telefono || 'No especificado')
    .replace(/{{CORREO}}/g, correo || 'No especificado')
    .replace(/{{CONTRATO}}/g, codigoCotizacion || 'RH-COT-001-0001')
    .replace(/{{DIRECCION_OBRA}}/g, direccionObra || 'En sitio')
    .replace(/{{LUGAR_EJECUCION}}/g, ciudadObra || 'Colombia')
    .replace(/{{FECHA_INICIO}}/g, fechaInicio || 'Por definir')
    .replace(/{{FECHA_ENTREGA}}/g, fechaEntrega || 'Por definir')
    .replace(/{{ALCANCE}}/g, alcanceProyecto || 'Fabricación, transporte e instalación de carpintería y elementos de obra.')
    .replace(/{{ITEMS_TABLE_ROWS}}/g, rowsHtml)
    .replace(/{{VALOR_TOTAL}}/g, `$${totalNum.toLocaleString()} COP`)
    .replace(/{{MAT_CLIENTE}}/g, suministroMateriales === 'CLIENTE' ? 'X' : '&nbsp;&nbsp;')
    .replace(/{{MAT_CONTRATISTA}}/g, suministroMateriales === 'CONTRATISTA' ? 'X' : '&nbsp;&nbsp;')
    .replace(/{{DURACION}}/g, duracionEstimada || '15 días hábiles')
    .replace(/{{VALOR_ANTICIPO}}/g, `$${anticipo60.toLocaleString()} COP`)
    .replace(/{{VALOR_INSTALACION}}/g, `$${instalacion20.toLocaleString()} COP`)
    .replace(/{{VALOR_AVANCE}}/g, `$${avance10.toLocaleString()} COP`)
    .replace(/{{VALOR_CONFORMIDAD}}/g, `$${conformidad10.toLocaleString()} COP`);
};

// ============================================================
// BLOQUE 4: PERSISTENCIA EN FIRESTORE
// ============================================================

export const guardarCotizacionOficial = async (datosCotizacion: any): Promise<string> => {
  if (!isFirebaseConfigured) {
    throw new Error("⚠️ PENDIENTE: Configura tus credenciales reales de Firebase en .env.local");
  }

  if (datosCotizacion.proyectoId) {
    const existentes = await obtenerCotizacionesPorProyecto(datosCotizacion.proyectoId);
    if (existentes && existentes.length > 0) {
      const docExistente = existentes[0];
      const docRef = doc(db, COLECCION, docExistente.id);
      await updateDoc(docRef, {
        ...datosCotizacion,
        actualizadoEn: serverTimestamp()
      });
      return docExistente.id;
    }
  }

  const docRef = await addDoc(collection(db, COLECCION), {
    ...datosCotizacion,
    creadoEn: serverTimestamp(),
    actualizadoEn: serverTimestamp()
  });
  return docRef.id;
};

export const obtenerCotizacionesPorProyecto = async (proyectoId: string): Promise<any[]> => {
  if (!isFirebaseConfigured || !proyectoId) return [];
  try {
    const q = query(
      collection(db, COLECCION), 
      where('proyectoId', '==', proyectoId)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.error("Error al obtener cotizaciones:", err);
    return [];
  }
};

export const obtenerCotizacionGuardadaPorProyecto = async (proyectoId: string): Promise<any | null> => {
  if (!isFirebaseConfigured || !proyectoId) return null;
  try {
    const cotizaciones = await obtenerCotizacionesPorProyecto(proyectoId);
    if (cotizaciones.length === 0) return null;
    return cotizaciones.sort((a, b) => (b.creadoEn?.seconds || 0) - (a.creadoEn?.seconds || 0))[0];
  } catch (err) {
    console.error("Error al obtener cotización guardada:", err);
    return null;
  }
};

export const obtenerCotizaciones = async (): Promise<any[]> => {
  if (!isFirebaseConfigured) return [];
  try {
    const snapshot = await getDocs(collection(db, COLECCION));
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.error("Error al obtener todas las cotizaciones:", err);
    return [];
  }
};
