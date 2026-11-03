// ============================================================
// BLOQUE: UTILIDADES DE FECHA Y ZONA HORARIA LOCAL (COLOMBIA UTC-5)
// Qué hace: Obtiene la fecha local en formato YYYY-MM-DD sin desfase UTC de toISOString() y hora formateada.
// Por qué: Requerimiento del Fundador para corregir fecha en horario nocturno y mostrar reloj de Colombia en vivo.
// ============================================================

/**
 * Obtiene la fecha actual en formato YYYY-MM-DD según la hora local del dispositivo (Colombia)
 */
export const getFechaHoyLocal = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Obtiene objeto con fecha y hora formateadas oficialmente para Colombia
 */
export const getFechaHoraColombia = () => {
  const ahora = new Date();
  
  // Fecha: Ej. "Sáb, 25 jul 2026"
  const fechaRaw = ahora.toLocaleDateString('es-CO', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  // Hora 12h: Ej. "11:51:20 PM"
  const horaRaw = ahora.toLocaleTimeString('es-CO', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });

  const fechaStr = fechaRaw.charAt(0).toUpperCase() + fechaRaw.slice(1);

  return {
    fechaStr,
    horaStr: horaRaw.toUpperCase()
  };
};
