// ============================================================
// ARCHIVO: src/features/carpinteria/pages/HerrajesCarpinteriaPage.tsx
// QUÉ HACE: Vista del Catálogo de Herrajes y Ferretería para Carpintería.
// POR QUÉ: Administra el catálogo de accesorios y precios reales en Firestore.
// ============================================================
import React, { useState, useEffect } from 'react';
import { Wrench, Plus, Sparkles, RefreshCw, Layers } from 'lucide-react';
import { IHerrajeDB, obtenerHerrajesFirestore, sembrarHerrajesBaseFirestore } from '../services/herrajesService';
import HerrajeCardGrid from '../components/HerrajeCardGrid';
import ModalNuevoHerraje from '../components/ModalNuevoHerraje';

export default function HerrajesCarpinteriaPage() {
  const [herrajes, setHerrajes] = useState<IHerrajeDB[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [modalAbierto, setModalAbierto] = useState<boolean>(false);
  const [herrajeEditar, setHerrajeEditar] = useState<IHerrajeDB | null>(null);
  const [sembrando, setSembrando] = useState<boolean>(false);

  const cargarDatos = async () => {
    setCargando(true);
    try {
      const lista = await obtenerHerrajesFirestore();
      setHerrajes(lista);
    } catch (err) {
      console.error('Error al cargar herrajes:', err);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const handleSembrar = async () => {
    setSembrando(true);
    try {
      const creados = await sembrarHerrajesBaseFirestore();
      alert(`Se sembraron ${creados} herrajes base en tu catálogo.`);
      await cargarDatos();
    } catch (err: any) {
      alert('Error al sembrar herrajes: ' + (err.message || err));
    } finally {
      setSembrando(false);
    }
  };

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="badge-wood">🪚 Suite Exclusiva de Carpintería</span>
            <span className="badge-cyan">Catálogo Firestore</span>
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: '8px 0 0 0', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Wrench size={26} color="#f59e0b" />
            <span>Catálogo de Herrajes, Tornillería & Ferretería</span>
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '4px' }}>
            Gestiona los precios en $ COP y especificaciones de bisagras, correderas, tiradores y tornillería para el Diseñador 3D y presupuesto
          </p>
        </div>

        {/* Botones de Acción */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {herrajes.length === 0 && (
            <button
              type="button"
              className="btn-secondary"
              onClick={handleSembrar}
              disabled={sembrando}
              style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Sparkles size={14} color="#10b981" />
              <span>{sembrando ? 'Sembrando...' : '🌱 Cargar Herrajes Base'}</span>
            </button>
          )}

          <button
            type="button"
            className="btn-primary-wood"
            onClick={() => {
              setHerrajeEditar(null);
              setModalAbierto(true);
            }}
            style={{ fontSize: '0.8rem', padding: '8px 14px', display: 'flex', alignItems: 'center', gap: '6px', background: '#f59e0b', color: '#0f172a', fontWeight: 700 }}
          >
            <Plus size={15} />
            <span>+ Nuevo Herraje</span>
          </button>
        </div>
      </div>

      {/* Grid de Herrajes */}
      {cargando ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
          <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 10px auto', color: 'var(--color-primary)' }} />
          <span>Cargando catálogo de herrajes desde Firestore...</span>
        </div>
      ) : (
        <HerrajeCardGrid
          herrajes={herrajes}
          onEditar={(h) => {
            setHerrajeEditar(h);
            setModalAbierto(true);
          }}
          onActualizado={cargarDatos}
        />
      )}

      {/* Modal Crear / Editar */}
      <ModalNuevoHerraje
        isOpen={modalAbierto}
        herrajeEditar={herrajeEditar}
        onClose={() => {
          setModalAbierto(false);
          setHerrajeEditar(null);
        }}
        onSaved={cargarDatos}
      />
    </div>
  );
}
