// ============================================================
// BLOQUE 1: IMPORTACIONES Y DEPENDENCIAS
// Qué hace: Generador de contratos legales HTML y persistencia en Firestore.
// Por qué: Regla RT-01: Documentos corporativos oficiales bajo la plantilla institucional RH-CT-003.
// ============================================================
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc,
  updateDoc,
  query, 
  where,
  serverTimestamp 
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../lib/firebase.js';
import { coleccion } from '../lib/firebase.js';

const COLECCION = coleccion('contratos_oficiales');

// Plantilla HTML Base basada en 'RH-CT-003_Carpinteria_RenovaHausIMB.docx'
const PLANTILLA_BASE_CONTRATO_HTML = `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Contrato de Fabricación de Muebles a Medida - RenovaHaus-IMB</title>
    <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; background-color: #ffffff; color: #2c2c2e; margin: 0; padding: 40px; line-height: 1.6; }
        .container { max-width: 850px; margin: 0 auto; background-color: #ffffff; padding: 10px; }
        .header { border-bottom: 3px solid #1f538d; padding-bottom: 15px; margin-bottom: 25px; display: flex; justify-content: space-between; align-items: center; }
        .header-logo-brand { display: flex; align-items: center; gap: 15px; }
        .brand-titles h1 { color: #1f538d; margin: 0; font-size: 22px; font-weight: 700; letter-spacing: -0.5px; }
        .brand-titles p { color: #48484a; margin: 3px 0 0 0; font-size: 11px; font-weight: 500; }
        .header-meta { text-align: right; }
        .badge { display: inline-block; padding: 4px 10px; background-color: #1f538d; color: #ffffff; border-radius: 4px; font-size: 11px; font-weight: 700; letter-spacing: 0.5px; margin-bottom: 6px; }
        .meta-text { color: #48484a; font-size: 11px; margin: 2px 0; }
        .meta-text strong { color: #1f538d; }
        
        .contract-title { text-align: center; color: #1f538d; font-size: 18px; font-weight: 800; text-transform: uppercase; margin: 20px 0 15px 0; letter-spacing: 0.5px; }
        .intro-text { text-align: justify; font-size: 12px; margin-bottom: 20px; background-color: #f9f9fb; padding: 16px; border-radius: 6px; border-left: 4px solid #1f538d; }
        
        .clause { margin-bottom: 16px; text-align: justify; font-size: 11.5px; }
        .clause-title { font-weight: 700; color: #1f538d; text-transform: uppercase; }
        .paragrafo { margin-left: 15px; font-style: italic; color: #48484a; margin-top: 4px; }
        
        .table-summary { width: 100%; border-collapse: collapse; margin: 15px 0; }
        .table-summary th, .table-summary td { border: 1px solid #e5e5ea; padding: 8px 12px; font-size: 11.5px; }
        .table-summary th { background-color: #1f538d; color: #ffffff; text-align: left; }
        
        .signatures-container { margin-top: 40px; display: grid; grid-template-columns: 1fr 1fr; gap: 30px; page-break-inside: avoid !important; break-inside: avoid !important; }
        .signature-box { border-top: 2px solid #2c2c2e; padding-top: 10px; font-size: 11.5px; page-break-inside: avoid !important; break-inside: avoid !important; }
        .signature-box strong { color: #1f538d; display: block; margin-bottom: 4px; text-transform: uppercase; }
        .signature-box p { margin: 2px 0; }
    </style>
</head>
<body>
    <div class="container">
        <!-- Encabezado Institucional -->
        <div class="header">
            <div class="header-logo-brand">
                <div class="brand-titles">
                    <h1>RenovaHaus-IMB</h1>
                    <p>Diseño, Arquitectura & Carpintería Arquitectónica</p>
                </div>
            </div>
            <div class="header-meta">
                <div class="badge">CONTRATO PRIVADO DE OBRA</div>
                <div class="meta-text">Contrato: <strong>{{NRO_COT}}</strong></div>
                <div class="meta-text">Fecha: <strong>{{FECHA_CONTRATO}}</strong></div>
            </div>
        </div>

        <div class="contract-title">
            CONTRATO DE FABRICACIÓN, SUMINISTRO E INSTALACIÓN DE CARPINTERÍA ARQUITECTÓNICA Y MUEBLES A MEDIDA
        </div>

        <div class="intro-text">
            Entre los suscritos a saber: Por una parte, <strong>{{CLIENTE}}</strong>, mayor de edad, identificado(a) con C.C. No. <strong>{{CEDULA}}</strong> expedida en <strong>{{CIUDAD_CEDULA}}</strong>, domiciliado(a) en el municipio de <strong>{{MUNICIPIO_CLIENTE}}</strong>, con dirección <strong>{{DIRECCION_RESIDENCIA}}</strong>, teléfono <strong>{{TELEFONO}}</strong> y correo <strong>{{CORREO}}</strong>, quien en adelante se denominará <strong>EL CONTRATANTE</strong>; y por otra parte, <strong>EL REPRESENTANTE LEGAL</strong>, en representación de <strong>LA EMPRESA CONTRATISTA</strong>, quienes en adelante se denominarán <strong>EL CONTRATISTA</strong>, se ha convenido celebrar el presente Contrato de Obra Civil y Mobiliario bajo las siguientes cláusulas:
        </div>

        <!-- Cláusulas -->
        <div class="clause">
            <span class="clause-title">CLÁUSULA PRIMERA — OBJETO:</span>
            EL CONTRATISTA se compromete para con EL CONTRATANTE a realizar la fabricación, transporte e instalación de elementos de carpintería a medida descritos en la cotización oficial vinculada, en el inmueble ubicado en <strong>{{DIRECCION_OBRA}}</strong> del municipio de <strong>{{MUNICIPIO_OBRA}}</strong>.
        </div>

        <div class="clause">
            <span class="clause-title">CLÁUSULA SEGUNDA — VALOR Y FORMA DE PAGO:</span>
            El valor total convenido por la ejecución de la obra es de <strong>{{VALOR_TOTAL}} COP</strong>, pagaderos de la siguiente manera:
            <ul>
                <li><strong>60% Anticipo Inicial:</strong> Para adquisición de materias primas: <strong>{{VALOR_ANTICIPO}} COP</strong>.</li>
                <li><strong>20% Inicio de Armado/Instalación:</strong> Al inicio de labores en obra: <strong>{{VALOR_INSTALACION}} COP</strong>.</li>
                <li><strong>10% Avance Intermedio:</strong> Al alcanzar el 75% de avance: <strong>{{VALOR_AVANCE}} COP</strong>.</li>
                <li><strong>10% Entrega y Liquidación:</strong> Contra entrega a satisfacción: <strong>{{VALOR_CONFORMIDAD}} COP</strong>.</li>
            </ul>
        </div>

        <div class="clause">
            <span class="clause-title">CLÁUSULA TERCERA — PLAZO DE EJECUCIÓN:</span>
            El plazo estimado para la entrega a satisfacción es de <strong>{{DURACION}}</strong>, contados a partir de la recepción efectiva del anticipo inicial.
        </div>

        <div class="clause">
            <span class="clause-title">CLÁUSULA CUARTA — SUMINISTRO DE MATERIALES:</span>
            El suministro de tableros, herrajes y consumibles estará a cargo de: <strong>{{SUMINISTRO_MATERIALES}}</strong>.
        </div>

        <!-- Firmas del Contrato -->
        <div class="signatures-container">
            <div class="signature-box">
                <strong>EL CONTRATANTE</strong>
                <p><strong>Nombre:</strong> {{CLIENTE}}</p>
                <p><strong>C.C.:</strong> {{CEDULA}}</p>
                <p><strong>Correo:</strong> {{CORREO}}</p>
                <p><strong>Celular:</strong> {{TELEFONO}}</p>
            </div>

            <div class="signature-box">
                <strong>EL CONTRATISTA</strong>
                <p><strong>Nombre:</strong> Empresa Constructora / Contratista Principal</p>
                <p><strong>NIT/C.C.:</strong> {{CONTRATISTA_DOCUMENTO}}</p>
                <p><strong>Correo:</strong> contacto@constructora-demo.com</p>
                <p><strong>Celular:</strong> +57 300 000 0000</p>
            </div>
        </div>
    </div>
</body>
</html>`;

// ============================================================
// BLOQUE 2: GENERADOR DE NOMBRE DE ARCHIVO Y COMPILADOR HTML
// ============================================================

export const generarNombreArchivoContrato = (codigoCotizacion: string, nombreCliente: string): string => {
  const codigo = (codigoCotizacion || 'RH-CT-003-0001').replace(/-/g, '_').replace('COT', 'CT');
  const cliente = (nombreCliente || 'Cliente')
    .trim()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9 ]/g, "")
    .replace(/\s+/g, '_');
  return `${codigo}_${cliente}.html`;
};

export const compilarHtmlContrato = (datos: any): string => {
  const {
    codigoCotizacion,
    fechaContrato,
    clienteNombre,
    clienteDocumento,
    ciudadExpedicion,
    ciudadResidencia,
    direccionResidencia,
    telefono,
    correo,
    direccionObra,
    ciudadObra,
    fechaInicio,
    fechaEntrega,
    duracionEstimada,
    suministroMateriales,
    valorTotal
  } = datos;

  const totalNum = Number(valorTotal || 0);
  const anticipo60 = totalNum * 0.60;
  const instalacion20 = totalNum * 0.20;
  const avance10 = totalNum * 0.10;
  const conformidad10 = totalNum * 0.10;

  return PLANTILLA_BASE_CONTRATO_HTML
    .replace(/{{NRO_COT}}/g, codigoCotizacion || 'RH-COT-001-0001')
    .replace(/{{FECHA_CONTRATO}}/g, fechaContrato || new Date().toISOString().split('T')[0])
    .replace(/{{CLIENTE}}/g, clienteNombre || 'Cliente no especificado')
    .replace(/{{CEDULA}}/g, clienteDocumento || 'S/N')
    .replace(/{{CIUDAD_CEDULA}}/g, ciudadExpedicion || ciudadResidencia || 'Bogotá D.C.')
    .replace(/{{MUNICIPIO_CLIENTE}}/g, ciudadResidencia || 'Bogotá D.C.')
    .replace(/{{DIRECCION_RESIDENCIA}}/g, direccionResidencia || 'No especificada')
    .replace(/{{TELEFONO}}/g, telefono || 'No especificado')
    .replace(/{{CORREO}}/g, correo || 'No especificado')
    .replace(/{{DIRECCION_OBRA}}/g, direccionObra || 'En sitio de obra')
    .replace(/{{MUNICIPIO_OBRA}}/g, ciudadObra || 'Colombia')
    .replace(/{{FECHA_INICIO}}/g, fechaInicio || 'Por definir')
    .replace(/{{FECHA_ENTREGA}}/g, fechaEntrega || 'Por definir')
    .replace(/{{DURACION}}/g, duracionEstimada || '15 días hábiles')
    .replace(/{{SUMINISTRO_MATERIALES}}/g, suministroMateriales === 'CLIENTE' ? 'El CONTRATANTE (Cliente)' : 'El CONTRATISTA')
    .replace(/{{VALOR_TOTAL}}/g, `$${totalNum.toLocaleString()}`)
    .replace(/{{VALOR_ANTICIPO}}/g, `$${anticipo60.toLocaleString()}`)
    .replace(/{{VALOR_INSTALACION}}/g, `$${instalacion20.toLocaleString()}`)
    .replace(/{{VALOR_AVANCE}}/g, `$${avance10.toLocaleString()}`)
    .replace(/{{VALOR_CONFORMIDAD}}/g, `$${conformidad10.toLocaleString()}`);
};

// ============================================================
// BLOQUE 3: PERSISTENCIA EN FIRESTORE
// ============================================================

export const guardarContratoOficial = async (datosContrato: any): Promise<string> => {
  if (!isFirebaseConfigured) {
    throw new Error("⚠️ PENDIENTE: Configura tus credenciales reales de Firebase en .env.local");
  }

  if (datosContrato.proyectoId) {
    const existentes = await obtenerContratosPorProyecto(datosContrato.proyectoId);
    if (existentes && existentes.length > 0) {
      const docExistente = existentes[0];
      const docRef = doc(db, COLECCION, docExistente.id);
      await updateDoc(docRef, {
        ...datosContrato,
        actualizadoEn: serverTimestamp()
      });
      return docExistente.id;
    }
  }

  const docRef = await addDoc(collection(db, COLECCION), {
    ...datosContrato,
    creadoEn: serverTimestamp(),
    actualizadoEn: serverTimestamp()
  });
  return docRef.id;
};

export const obtenerContratosPorProyecto = async (proyectoId: string): Promise<any[]> => {
  if (!isFirebaseConfigured || !proyectoId) return [];
  try {
    const q = query(
      collection(db, COLECCION), 
      where('proyectoId', '==', proyectoId)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.error("Error al obtener contratos:", err);
    return [];
  }
};

export const obtenerContratoGuardadoPorProyecto = async (proyectoId: string): Promise<any | null> => {
  if (!isFirebaseConfigured || !proyectoId) return null;
  try {
    const contratos = await obtenerContratosPorProyecto(proyectoId);
    if (contratos.length === 0) return null;
    return contratos.sort((a, b) => (b.creadoEn?.seconds || 0) - (a.creadoEn?.seconds || 0))[0];
  } catch (err) {
    console.error("Error al obtener contrato guardado:", err);
    return null;
  }
};
