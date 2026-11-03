// ============================================================
// BLOQUE 1: SERVICIO CONVERTIDOR A PDF
// Qué hace: Convierte cualquier documento HTML en un archivo PDF descargable.
// Por qué: Requerimiento del Fundador para exportación y envío directo a clientes.
// ============================================================

export const descargarHtmlComoPdf = (htmlContent: string, nombreArchivoPdf: string): Promise<void> => {
  return new Promise((resolve) => {
    try {
      const nombreFinal = nombreArchivoPdf.endsWith('.pdf') ? nombreArchivoPdf : `${nombreArchivoPdf}.pdf`;

      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = '0';

      document.body.appendChild(iframe);

      if (!iframe.contentWindow) return resolve();

      const doc = iframe.contentWindow.document;
      doc.open();
      doc.write(htmlContent);

      const style = doc.createElement('style');
      style.textContent = `
        @page {
          size: A4 portrait;
          margin: 10mm;
        }
        body {
          margin: 0 !important;
          padding: 0 !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        .page-break {
          page-break-after: always;
        }
        button, .no-print {
          display: none !important;
        }
      `;
      doc.head.appendChild(style);
      doc.close();

      iframe.contentWindow.focus();
      setTimeout(() => {
        try {
          iframe.contentWindow?.print();
          setTimeout(() => {
            document.body.removeChild(iframe);
            resolve();
          }, 1000);
        } catch {
          document.body.removeChild(iframe);
          resolve();
        }
      }, 500);
    } catch {
      resolve();
    }
  });
};
