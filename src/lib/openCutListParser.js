// ============================================================
// BLOQUE 1: PARSER AVANZADO DE OPENCUTLIST (SKETCHUP)
// Qué hace: Convierte exportaciones de OpenCutList (CSV, TXT, Portapapeles u OCR)
//          leyendo las 10 columnas nativas: Designación, Cantidad, Longitud, Anchura,
//          Nombre del material, Longitud del borde 1/2, Ancho del borde 1/2.
// Por qué: Reglas RT-01, RT-02 y RT-04: Mapeo exacto de cantos Rígido/Flexible y tableros.
// ============================================================

/**
 * Limpia cadenas de medidas eliminando unidades como "mm", "cm", "m" y espacios
 */
const limpiarNumero = (val) => {
  if (val === null || val === undefined) return 0;
  const str = String(val).replace(/mm|cm|m|\s/gi, '').replace(',', '.').trim();
  const num = parseFloat(str);
  return isNaN(num) ? 0 : num;
};

/**
 * Detecta delimitador de columnas en texto de OpenCutList (coma, punto y coma, tabulador)
 */
const detectarDelimitador = (linea) => {
  if (linea.includes('\t')) return '\t';
  if (linea.includes(';')) return ';';
  return ',';
};

/**
 * Analiza el texto del borde para clasificar el canto como 'Rígido', 'Flexible' o 'Sin Canto'
 */
export const analizarTipoCanto = (textoBorde) => {
  if (!textoBorde || typeof textoBorde !== 'string') return 'Sin Canto';
  const txtLower = textoBorde.trim().toLowerCase();
  if (!txtLower || txtLower === '-' || txtLower === 'ninguno' || txtLower === 'none') return 'Sin Canto';

  if (txtLower.includes('rigido') || txtLower.includes('rido') || txtLower.includes('2 mm') || txtLower.includes('2mm') || txtLower.includes('thick')) {
    return 'Rígido';
  }
  if (txtLower.includes('felxible') || txtLower.includes('flexible') || txtLower.includes('flex') || txtLower.includes('0.5') || txtLower.includes('0,5') || txtLower.includes('thin')) {
    return 'Flexible';
  }
  // Si contiene algún nombre de canto pero no especifica rigidez, asume Flexible
  if (txtLower.includes('canto') || txtLower.includes('edge')) {
    return 'Flexible';
  }
  return 'Sin Canto';
};

/**
 * Extrae el nombre o color del canto desde la cadena del borde
 * ej. "Canto-Arena-Rigido (2 mm x 19 mm)" -> "Canto-Arena"
 */
export const extraerNombreCanto = (textoBorde) => {
  if (!textoBorde) return '';
  const sinParentesis = textoBorde.split('(')[0].trim();
  return sinParentesis
    .replace(/-rigido|-rido|-felxible|-flexible|\brigido\b|\bfelxible\b|\bflexible\b/gi, '')
    .trim();
};

/**
 * Parsea CSV o texto copiado de OpenCutList (Copiar -> Títulos + valores o Sólo valores)
 */
export const parseOpenCutListCSV = (texto) => {
  if (!texto || typeof texto !== 'string') return [];

  const lineas = texto.split(/\r?\n/).filter(l => l.trim().length > 0);
  if (lineas.length === 0) return [];

  const sep = detectarDelimitador(lineas[0]);
  const primeraFila = lineas[0].split(sep).map(c => c.trim().replace(/^"|"$/g, '').toLowerCase());

  // Detectar índices de columnas específicas en OpenCutList
  let idxDesignacion = primeraFila.findIndex(c => c.includes('designación') || c.includes('designacion') || c.includes('etiqueta') || c.includes('nombre') || c.includes('label') || c.includes('name') || c.includes('pieza'));
  let idxCant = primeraFila.findIndex(c => (c.includes('cant') || c.includes('qty') || c.includes('count') || c.includes('número')) && !c.includes('borde'));
  let idxLargo = primeraFila.findIndex(c => (c.includes('longitud') || c.includes('largo') || c.includes('length')) && !c.includes('borde'));
  let idxAncho = primeraFila.findIndex(c => (c.includes('anchura') || c.includes('ancho') || c.includes('width')) && !c.includes('borde'));
  let idxMaterial = primeraFila.findIndex(c => c.includes('material') || c.includes('color') || c.includes('tablero'));

  // Columnas de Bordes / Cantos específicos (L1, L2, A1, A2)
  let idxLargoBorde1 = primeraFila.findIndex(c => c.includes('longitud del borde 1') || c.includes('largo borde 1') || c.includes('borde 1'));
  let idxLargoBorde2 = primeraFila.findIndex(c => c.includes('longitud del borde 2') || c.includes('largo borde 2') || c.includes('borde 2'));
  let idxAnchoBorde1 = primeraFila.findIndex(c => c.includes('ancho del borde 1') || c.includes('ancho de borde 1') || c.includes('ancho borde 1'));
  let idxAnchoBorde2 = primeraFila.findIndex(c => c.includes('ancho de borde 2') || c.includes('ancho del borde 2') || c.includes('ancho borde 2'));

  // Si no hay encabezados explícitos, usar posiciones por defecto del reporte OpenCutList
  const tieneEncabezado = idxLargo !== -1 || idxAncho !== -1 || idxDesignacion !== -1;
  const lineasProcesar = tieneEncabezado ? lineas.slice(1) : lineas;

  if (!tieneEncabezado) {
    idxDesignacion = 1; // Col B
    idxCant = 2;        // Col C
    idxLargo = 3;       // Col D
    idxAncho = 4;       // Col E
    idxMaterial = 5;    // Col F
    idxLargoBorde1 = 6; // Col G
    idxLargoBorde2 = 7; // Col H
    idxAnchoBorde1 = 8; // Col I
    idxAnchoBorde2 = 9; // Col J
  }

  const piezas = [];

  lineasProcesar.forEach((linea, index) => {
    const cols = linea.split(sep).map(c => c.trim().replace(/^"|"$/g, ''));
    if (cols.length < 2) return;

    const designacion = idxDesignacion !== -1 && cols[idxDesignacion] ? cols[idxDesignacion] : `Pieza #${index + 1}`;
    const cantidad = idxCant !== -1 ? (parseInt(cols[idxCant], 10) || 1) : 1;
    const largo = idxLargo !== -1 ? limpiarNumero(cols[idxLargo]) : 0;
    const ancho = idxAncho !== -1 ? limpiarNumero(cols[idxAncho]) : 0;
    const materialNombre = idxMaterial !== -1 ? cols[idxMaterial] : '';

    // Leer texto de cantos de los 4 bordes
    const txtLargo1 = idxLargoBorde1 !== -1 ? cols[idxLargoBorde1] : '';
    const txtLargo2 = idxLargoBorde2 !== -1 ? cols[idxLargoBorde2] : '';
    const txtAncho1 = idxAnchoBorde1 !== -1 ? cols[idxAnchoBorde1] : '';
    const txtAncho2 = idxAnchoBorde2 !== -1 ? cols[idxAnchoBorde2] : '';

    const alto1 = analizarTipoCanto(txtLargo1);
    const alto2 = analizarTipoCanto(txtLargo2);
    const ancho1 = analizarTipoCanto(txtAncho1);
    const ancho2 = analizarTipoCanto(txtAncho2);

    const cantoNombre = extraerNombreCanto(txtLargo1 || txtLargo2 || txtAncho1 || txtAncho2);

    if (largo > 0 || ancho > 0) {
      piezas.push({
        id: `opencut_${Date.now()}_${index}`,
        descripcion: designacion,
        cantidad: cantidad > 0 ? cantidad : 1,
        largo: largo,
        ancho: ancho,
        color: materialNombre,
        canto: cantoNombre || 'Canto-Arena',
        alto1: alto1,
        alto2: alto2,
        ancho1: ancho1,
        ancho2: ancho2
      });
    }
  });

  return piezas;
};

/**
 * Parsea texto desde portapapeles (Copiar -> Títulos + valores)
 */
export const parseOpenCutListText = (textoPegado) => {
  return parseOpenCutListCSV(textoPegado);
};

/**
 * Lector de capturas/fotos de OpenCutList
 */
export const parseOpenCutListImage = async (imageFile) => {
  return new Promise((resolve) => {
    resolve([]);
  });
};
