import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Users, ChevronRight, UserPlus, Info, ArrowLeft, Award, CheckCircle2, ShieldCheck, X } from 'lucide-react';

export default function NetworkTree({ treeData }) {
  const [currentRoot, setCurrentRoot] = useState(treeData);
  const [history, setHistory] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);

  if (!treeData) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
        No hay estructura de árbol disponible.
      </div>
    );
  }

  const activeNode = currentRoot || treeData;
  const children = activeNode.children || [];

  // 3 posiciones oficiales: 0 = Izquierda, 1 = Centro, 2 = Derecha
  const legLeft = children[0] || null;
  const legCenter = children[1] || null;
  const legRight = children[2] || null;

  const handleZoomIntoNode = (node) => {
    if (!node) return;
    setHistory(prev => [...prev, activeNode]);
    setCurrentRoot(node);
  };

  const handleGoBack = () => {
    if (history.length === 0) return;
    const prevNode = history[history.length - 1];
    setHistory(history.slice(0, -1));
    setCurrentRoot(prevNode);
  };

  const handleResetToTop = () => {
    setHistory([]);
    setCurrentRoot(treeData);
  };

  const getLayerBadge = (layer) => {
    if (layer === 1) return <span className="level-badge level-1">Maestro</span>;
    if (layer === 2) return <span className="level-badge level-2">Líder</span>;
    return <span className="level-badge level-3">Ayudante</span>;
  };

  const renderCard = (node, legPositionLabel, legClass) => {
    if (!node) {
      return (
        <div className="organogram-leg-column">
          <span className={`leg-header-badge ${legClass}`}>{legPositionLabel}</span>
          <div className="organogram-slot-empty">
            <UserPlus size={16} style={{ color: 'var(--text-subtle)', marginBottom: '0.15rem' }} />
            <div style={{ fontSize: '0.6rem', fontWeight: 700, color: 'var(--text-muted)' }}>Vacío</div>
          </div>
        </div>
      );
    }

    const hasSubChildren = node.children && node.children.length > 0;

    return (
      <div className="organogram-leg-column">
        <span className={`leg-header-badge ${legClass}`}>{legPositionLabel}</span>
        
        <div className="organogram-card" onClick={() => setSelectedMember(node)}>
          <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
            <div className="tree-user-info" style={{ width: '100%' }}>
              <div className="tree-avatar">
                {node.name ? node.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="tree-user-details" style={{ flex: 1 }}>
                <h4>{node.name}</h4>
                <p><strong style={{ color: '#fff' }}>{node.referral_code}</strong></p>
                {node.sponsor_name && (
                  <p style={{ fontSize: '0.5rem', color: 'var(--text-subtle)' }}>
                    <strong style={{ color: '#67e8f9' }}>{node.sponsor_name}</strong>
                  </p>
                )}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.35rem', paddingTop: '0.25rem', borderTop: '1px solid var(--border-color)', gap: '0.2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', flexWrap: 'wrap' }}>
              {getLayerBadge(node.layer)}
              {node.is_spillover ? (
                <span className="origin-badge origin-spillover" style={{ fontSize: '0.48rem', padding: '0.04rem 0.22rem' }}>Derrame</span>
              ) : (
                <span className="origin-badge origin-direct" style={{ fontSize: '0.48rem', padding: '0.04rem 0.22rem' }}>Directo</span>
              )}
            </div>

            <button
              className="nav-btn nav-btn-outline"
              style={{ padding: '0.1rem 0.3rem', fontSize: '0.52rem', gap: '0.1rem' }}
              onClick={(e) => {
                e.stopPropagation();
                handleZoomIntoNode(node);
              }}
            >
              Ver <ChevronRight size={9} />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="organogram-container">
      <div className="organogram-inner-scroll">
        {/* BARRA DE NAVEGACIÓN / VOLVER EN ORGANOGRAMA */}
        <div className="organogram-navigation">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            {history.length > 0 && (
              <button className="nav-btn nav-btn-outline" onClick={handleGoBack} style={{ padding: '0.4rem 0.8rem' }}>
                <ArrowLeft size={16} /> Volver
              </button>
            )}
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center' }}>
            Matriz de: <strong style={{ color: '#fff' }}>{activeNode.name}</strong> ({children.length}/3)
          </span>
          </div>

          {history.length > 0 && (
            <button className="nav-btn nav-btn-ghost" onClick={handleResetToTop} style={{ fontSize: '0.85rem' }}>
              Ir al Topo (Usted)
            </button>
          )}
        </div>

        {/* NODO DEL TOPO (RAÍZ / PADRE) */}
        <div className="organogram-root-box" style={{ textAlign: 'center' }}>
          <div className="organogram-card organogram-card-root" onClick={() => setSelectedMember(activeNode)} style={{ textAlign: 'center' }}>
            <div className="tree-user-info" style={{ justifyContent: 'center' }}>
              <div className="tree-avatar" style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent-cyan))', width: 36, height: 36, fontSize: '0.95rem' }}>
                {activeNode.name ? activeNode.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="tree-user-details" style={{ textAlign: 'left' }}>
                <h4 style={{ fontSize: '0.85rem' }}>
                  {activeNode.name}{' '}
                  {history.length === 0 && <span style={{ fontSize: '0.58rem', color: 'var(--accent-cyan)' }}>(Usted)</span>}
                </h4>
                <p style={{ fontSize: '0.62rem' }}>{activeNode.email}</p>
                <p style={{ fontSize: '0.62rem' }}>Code: <strong style={{ color: '#fff' }}>{activeNode.referral_code}</strong></p>
              </div>
            </div>
            <div style={{ marginTop: '0.45rem', display: 'flex', gap: '0.3rem', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap' }}>
              <span className="level-badge level-1" style={{ fontSize: '0.58rem' }}>
                Directa: {children.length}/3
              </span>
              <span className="origin-badge origin-direct" style={{ fontSize: '0.55rem', padding: '0.06rem 0.3rem' }}>
                {children.length >= 3 ? '✅ $US 60' : '⏳ Expansión'}
              </span>
            </div>
          </div>
        </div>

        {/* LÍNEA CONECTORA VERTICAL - raíz a hijos (solo móvil) */}
        <div className="organogram-connector-vertical"></div>

        {/* LÍNEAS CONECTORAS SVG (solo escritorio) */}
        <svg className="organogram-lines-svg" viewBox="0 0 900 44" fill="none" xmlns="http://www.w3.org/2000/svg">
          <line x1="450" y1="0" x2="450" y2="20" stroke="rgba(99, 102, 241, 0.6)" strokeWidth="2" />
          <line x1="150" y1="20" x2="750" y2="20" stroke="rgba(99, 102, 241, 0.6)" strokeWidth="2" />
          <line x1="150" y1="20" x2="150" y2="44" stroke="rgba(99, 102, 241, 0.6)" strokeWidth="2" />
          <line x1="450" y1="20" x2="450" y2="44" stroke="rgba(99, 102, 241, 0.6)" strokeWidth="2" />
          <line x1="750" y1="20" x2="750" y2="44" stroke="rgba(99, 102, 241, 0.6)" strokeWidth="2" />
        </svg>

        {/* GRILLA DE 3 PIERNAS: LADO IZQUIERDO, LADO CENTRAL, LADO DERECHO */}
        <div className="organogram-grid-3legs">
          {renderCard(legLeft, 'Posición 1 (Izquierda)', 'leg-header-left')}
          {renderCard(legCenter, 'Posición 2 (Centro)', 'leg-header-center')}
          {renderCard(legRight, 'Posición 3 (Derecha)', 'leg-header-right')}
        </div>
      </div>

      {/* MODAL DE INFORMACIÓN DETALLADA DEL AFILIADO */}
      {selectedMember && createPortal(
        <div className="modal-overlay" style={{ zIndex: 999999 }} onClick={() => setSelectedMember(null)}>
          <div className="modal-card" style={{ maxWidth: 520 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Info size={20} style={{ color: 'var(--accent-cyan)' }} />
                Detalles del Afiliado Epi
              </h3>
              <button type="button" className="close-modal-btn" onClick={() => setSelectedMember(null)}>
                <X size={22} />
              </button>
            </div>

            <div className="tree-user-info" style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '1rem', borderRadius: '12px' }}>
              <div className="tree-avatar" style={{ width: 48, height: 48, fontSize: '1.2rem' }}>
                {selectedMember.name ? selectedMember.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="tree-user-details">
                <h4 style={{ fontSize: '1.1rem' }}>{selectedMember.name}</h4>
                <p>{selectedMember.email}</p>
              </div>
            </div>

            <div className="member-detail-grid">
              <div className="detail-item">
                <div className="detail-item-label">Código de Indicación</div>
                <div className="detail-item-value" style={{ color: '#818cf8' }}>{selectedMember.referral_code}</div>
              </div>

              <div className="detail-item">
                <div className="detail-item-label">Ciclo Actual</div>
                <div className="detail-item-value" style={{ color: '#fbbf24' }}>
                  {selectedMember.current_cycle || 'Socio Bronce'}
                </div>
              </div>

              <div className="detail-item">
                <div className="detail-item-label">Invitado Por (Patrocinador)</div>
                <div className="detail-item-value">{selectedMember.sponsor_name || 'Sistema Raíz'}</div>
              </div>

              <div className="detail-item">
                <div className="detail-item-label">Asignado En (Posicionamiento)</div>
                <div className="detail-item-value">{selectedMember.placement_name || 'Matriz Directa'}</div>
              </div>

              <div className="detail-item">
                <div className="detail-item-label">Tipo de Vínculo</div>
                <div className="detail-item-value">
                  {selectedMember.is_spillover ? '🌊 Derrame (Spillover)' : '🎯 Indicación Directa'}
                </div>
              </div>

              <div className="detail-item">
                <div className="detail-item-label">Reembolso $US 60</div>
                <div className="detail-item-value" style={{ color: selectedMember.fee_refunded ? '#34d399' : '#fbbf24' }}>
                  {selectedMember.fee_refunded ? '✅ Liberado' : '⏳ Pendiente (Faltan 3 Maestros)'}
                </div>
              </div>
            </div>

            <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button 
                type="button"
                className="nav-btn nav-btn-primary"
                onClick={() => {
                  handleZoomIntoNode(selectedMember);
                  setSelectedMember(null);
                }}
              >
                Ver Matriz de este Afiliado (3 Piernas)
              </button>
              <button type="button" className="nav-btn nav-btn-outline" onClick={() => setSelectedMember(null)}>
                Cerrar
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
