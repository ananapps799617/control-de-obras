// ============================================================
// BLOQUE 1: IMPORTACIONES Y DEPENDENCIAS
// Qué hace: Visualizador rápido en modal de un contrato legal vinculado al proyecto.
// Por qué: Regla 2.2 Manual Maestro: Componentes modulares atómicos (< 200 líneas).
// ============================================================
import React from 'react';
import { FileCheck } from 'lucide-react';
import ModalForm from '../../../components/ModalForm.jsx';

interface ModalContratoViewProps {
  abierto: boolean;
  onClose: () => void;
  contrato: {
    numeroContrato?: string;
    clienteNombre?: string;
    valorTotalContrato?: number;
    objetoContrato?: string;
  } | null;
}

export default function ModalContratoView({
  abierto,
  onClose,
  contrato
}: ModalContratoViewProps) {
  if (!contrato) return null;

  return (
    <ModalForm
      abierto={abierto}
      onClose={onClose}
      titulo={`Contrato de Obra ${contrato.numeroContrato || 'Legal'}`}
      maxWidth="680px"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Contratante / Cliente:</span>
            <strong style={{ color: '#f8fafc' }}>{contrato.clienteNombre || 'No especificado'}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Valor Legal del Contrato:</span>
            <strong style={{ color: '#34d399', fontSize: '1.1rem' }}>
              ${Number(contrato.valorTotalContrato || 0).toLocaleString()} COP
            </strong>
          </div>
          {contrato.objetoContrato && (
            <div style={{ marginTop: '8px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '10px' }}>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Objeto:</span>
              <p style={{ fontSize: '0.85rem', color: '#cbd5e1', margin: 0 }}>{contrato.objetoContrato}</p>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </ModalForm>
  );
}
