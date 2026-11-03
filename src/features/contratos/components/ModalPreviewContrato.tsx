// ============================================================
// BLOQUE 1: IMPORTACIONES Y DEPENDENCIAS
// Qué hace: Modal visor y editor de contrato legal privado según la ley colombiana.
// Por qué: Regla 2.2 Manual Maestro: Componentes modulares atómicos (< 200 líneas).
// ============================================================
import React from 'react';
import { Eye, Edit3, Download, Save } from 'lucide-react';
import ModalForm from '../../../components/ModalForm.jsx';

interface ModalPreviewContratoProps {
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

export default function ModalPreviewContrato({
  abierto,
  onClose,
  htmlCompilado,
  setHtmlCompilado,
  modoVista,
  setModoVista,
  onDescargarPdf,
  onGuardarDrive,
  guardando
}: ModalPreviewContratoProps) {
  return (
    <ModalForm
      abierto={abierto}
      onClose={onClose}
      titulo="Vista Previa del Contrato Legal de Obra"
      maxWidth="900px"
    >
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
            <Edit3 size={14} /> Editar Contrato en Vivo
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
            title="Vista Previa Contrato"
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
