// ============================================================
// BLOQUE 1: IMPORTACIONES Y DEPENDENCIAS
// Qué hace: Modal con visor HTML y editor en vivo del documento de cotización oficial.
// Por qué: Regla 2.2 Manual Maestro: Componentes modulares atómicos (< 200 líneas).
// ============================================================
import React from 'react';
import { Eye, Edit3, Download, Save } from 'lucide-react';
import ModalForm from '../../../components/ModalForm.jsx';

interface ModalPreviewCotizacionProps {
  abierto: boolean;
  onClose: () => void;
  htmlCompilado: string;
  setHtmlCompilado: React.Dispatch<React.SetStateAction<string>>;
  modoVista: 'preview' | 'editor';
  setModoVista: React.Dispatch<React.SetStateAction<'preview' | 'editor'>>;
  onDescargarPdf: () => void;
  onGuardarDrive: () => void;
  guardando: boolean;
}

export default function ModalPreviewCotizacion({
  abierto,
  onClose,
  htmlCompilado,
  setHtmlCompilado,
  modoVista,
  setModoVista,
  onDescargarPdf,
  onGuardarDrive,
  guardando
}: ModalPreviewCotizacionProps) {
  return (
    <ModalForm
      abierto={abierto}
      onClose={onClose}
      titulo="Vista Previa del Documento Oficial de Cotización"
      maxWidth="900px"
    >
      {/* Botonera de Alternancia (Visor vs Editor de Código) */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            type="button"
            className={`btn ${modoVista === 'preview' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setModoVista('preview')}
            style={{ fontSize: '0.82rem', padding: '6px 12px', gap: '4px' }}
          >
            <Eye size={14} /> Vista Previa Visual
          </button>
          <button
            type="button"
            className={`btn ${modoVista === 'editor' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setModoVista('editor')}
            style={{ fontSize: '0.82rem', padding: '6px 12px', gap: '4px' }}
          >
            <Edit3 size={14} /> Editar HTML en Vivo
          </button>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            onClick={onDescargarPdf}
            className="btn btn-secondary"
            style={{ fontSize: '0.82rem', padding: '6px 12px', gap: '6px', color: '#38bdf8' }}
          >
            <Download size={14} /> Descargar PDF
          </button>
          <button
            type="button"
            onClick={onGuardarDrive}
            disabled={guardando}
            className="btn btn-primary"
            style={{ fontSize: '0.82rem', padding: '6px 12px', gap: '6px' }}
          >
            <Save size={14} /> {guardando ? 'Guardando en Drive...' : '📁 Guardar en Drive'}
          </button>
        </div>
      </div>

      {/* Visor o Editor */}
      {modoVista === 'preview' ? (
        <div style={{
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '8px',
          overflow: 'hidden',
          background: '#ffffff',
          height: '600px'
        }}>
          <iframe
            srcDoc={htmlCompilado}
            title="Vista Previa Cotización"
            style={{ width: '100%', height: '100%', border: 'none' }}
          />
        </div>
      ) : (
        <div style={{ height: '600px', display: 'flex', flexDirection: 'column' }}>
          <textarea
            value={htmlCompilado}
            onChange={(e) => setHtmlCompilado(e.target.value)}
            style={{
              width: '100%',
              height: '100%',
              fontFamily: 'monospace',
              fontSize: '0.85rem',
              padding: '14px',
              borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.1)',
              background: '#090d16',
              color: '#38bdf8',
              resize: 'none',
              outline: 'none'
            }}
          />
        </div>
      )}
    </ModalForm>
  );
}
