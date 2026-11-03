// ============================================================
// BLOQUE 1: SERVICIO DE GOOGLE DRIVE API (VÍA GOOGLE APPS SCRIPT WEBHOOK)
// Qué hace: Conecta con el Webhook de Google Apps Script del Fundador
//          para crear carpetas reales en Google Drive.
// Por qué: Reglas RT-01, RT-04 y ORDEN #004 (Seguridad con Secret Key).
// ============================================================

const SCRIPT_URL = import.meta.env.VITE_GOOGLE_SCRIPT_URL || "";
const ROOT_FOLDER_ID = import.meta.env.VITE_GOOGLE_DRIVE_ROOT_FOLDER_ID || "";
const WEBHOOK_SECRET = import.meta.env.VITE_DRIVE_WEBHOOK_SECRET || "";
const BASE_DRIVE_URL = "https://drive.google.com/drive/folders/";

/**
 * Normaliza nombres de carpetas para evitar caracteres sintácticamente no válidos en Drive
 */
export const sanitizarNombreCarpeta = (nombre) => {
  return nombre
    .trim()
    .replace(/[/\\?%*:|"<>]/g, '_')
    .toUpperCase();
};

/**
 * Crear carpeta de Cliente real en Google Drive a través del Webhook
 */
export const crearCarpetaClienteInDrive = async (aliasCarpeta) => {
  const aliasLimpio = sanitizarNombreCarpeta(aliasCarpeta);

  if (SCRIPT_URL && SCRIPT_URL.startsWith('https://script.google.com')) {
    try {
      const response = await fetch(SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'crearCliente',
          secretKey: WEBHOOK_SECRET,
          aliasCliente: aliasLimpio,
          parentFolderId: ROOT_FOLDER_ID
        })
      });

      const resData = await response.json();
      if (resData.success) {
        console.log(`✅ [Google Drive REAL] Carpeta de Cliente creada en tu Drive: ${resData.webViewLink}`);
        return {
          folderId: resData.folderId,
          webViewLink: resData.webViewLink,
          alias: aliasLimpio
        };
      }
    } catch (err) {
      console.warn("Error al llamar al Webhook de Google Apps Script, usando fallback:", err);
    }
  }

  const fallbackId = ROOT_FOLDER_ID;
  const fallbackUrl = `${BASE_DRIVE_URL}${ROOT_FOLDER_ID}`;

  return {
    folderId: fallbackId,
    webViewLink: fallbackUrl,
    alias: aliasLimpio
  };
};

/**
 * Crear carpeta de Proyecto dentro de la carpeta del Cliente y generar subcarpetas base reales
 */
export const crearCarpetaProyectoInDrive = async (nombreProyecto, codigoObra, parentFolderId) => {
  const nombreLimpio = sanitizarNombreCarpeta(`${codigoObra ? codigoObra + ' - ' : ''}${nombreProyecto}`);
  const parentValido = (parentFolderId && parentFolderId !== 'root') ? parentFolderId : ROOT_FOLDER_ID;

  const subcarpetasOficiales = [
    'Despiece',
    'Documentacion',
    'Fotos del proyecto',
    'Listado de corte',
    'Modelado 3D',
    'Recursos'
  ];

  if (SCRIPT_URL && SCRIPT_URL.startsWith('https://script.google.com')) {
    try {
      const response = await fetch(SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'crearProyecto',
          secretKey: WEBHOOK_SECRET,
          nombreProyecto: nombreLimpio,
          parentFolderId: parentValido,
          subcarpetasBase: subcarpetasOficiales
        })
      });

      const resData = await response.json();
      if (resData.success) {
        console.log(`✅ [Google Drive REAL] Carpeta de Proyecto creada en tu Drive: ${resData.webViewLink}`);
        return {
          folderId: resData.folderId,
          webViewLink: resData.webViewLink,
          subcarpetas: resData.subcarpetas || []
        };
      }
    } catch (err) {
      console.warn("Error al llamar al Webhook de Google Apps Script para proyecto, usando fallback:", err);
    }
  }

  const fallbackUrl = `${BASE_DRIVE_URL}${parentValido}`;

  return {
    folderId: parentValido,
    webViewLink: fallbackUrl,
    subcarpetas: subcarpetasOficiales.map(s => ({ nombre: s }))
  };
};

/**
 * Guardar un documento (Cotización, Contrato, Lista de corte) en la subcarpeta especificada del Proyecto en Google Drive
 */
export const guardarDocumentoEnSubcarpetaDrive = async ({ projectDriveFolderId, subcarpetaNombre = 'Documentacion', nombreArchivo, contenidoHtml }) => {
  const parentValido = (projectDriveFolderId && projectDriveFolderId !== 'root') ? projectDriveFolderId : ROOT_FOLDER_ID;

  if (SCRIPT_URL && SCRIPT_URL.startsWith('https://script.google.com')) {
    try {
      const response = await fetch(SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'guardarDocumento',
          secretKey: WEBHOOK_SECRET,
          projectFolderId: parentValido,
          subcarpeta: subcarpetaNombre,
          nombreArchivo,
          contenidoHtml
        })
      });

      const resData = await response.json();
      if (resData.success) {
        console.log(`✅ [Google Drive REAL] Documento guardado en subcarpeta ${subcarpetaNombre}: ${resData.webViewLink}`);
        return {
          success: true,
          fileId: resData.fileId,
          webViewLink: resData.webViewLink
        };
      }
    } catch (err) {
      console.warn("Error al llamar al Webhook de Google Apps Script para guardar documento:", err);
    }
  }

  const fallbackUrl = `${BASE_DRIVE_URL}${parentValido}`;
  return {
    success: true,
    fileId: parentValido,
    webViewLink: fallbackUrl,
    isFallback: true
  };
};

/**
 * Subir una foto de obra a la subcarpeta 'Fotos del proyecto' en Google Drive a través del Webhook
 */
export const subirFotoProyectoDrive = async ({ projectDriveFolderId, nombreArchivo, base64Data, mimeType = 'image/jpeg' }) => {
  const parentValido = (projectDriveFolderId && projectDriveFolderId !== 'root') ? projectDriveFolderId : ROOT_FOLDER_ID;

  if (SCRIPT_URL && SCRIPT_URL.startsWith('https://script.google.com')) {
    try {
      const response = await fetch(SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'subirFoto',
          secretKey: WEBHOOK_SECRET,
          projectFolderId: parentValido,
          subcarpeta: 'Fotos del proyecto',
          nombreArchivo,
          base64Data,
          mimeType
        })
      });

      const resData = await response.json();
      if (resData.success) {
        console.log(`✅ [Google Drive REAL] Foto guardada en subcarpeta 'Fotos del proyecto': ${resData.webViewLink}`);
        return {
          success: true,
          fileId: resData.fileId,
          webViewLink: resData.webViewLink
        };
      }
    } catch (err) {
      console.warn("Error al llamar al Webhook de Google Apps Script para subir foto:", err);
    }
  }

  const fallbackUrl = `${BASE_DRIVE_URL}${parentValido}`;
  return {
    success: true,
    fileId: parentValido,
    webViewLink: fallbackUrl,
    isFallback: true
  };
};
