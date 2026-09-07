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
        Nenhuma estrutura de árvore disponível.
      </div>
    );
  }

  const activeNode = currentRoot || treeData;
  const children = activeNode.children || [];

  // 3 posições oficiais: 0 = Esquerda, 1 = Centro, 2 = Direita
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
            <UserPlus size={24} style={{ color: 'var(--text-subtle)', marginBottom: '0.4rem' }} />
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)' }}>Vaga Disponível</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', marginTop: '0.2rem' }}>
              Espaço livre para novo indicado ou derrame
            </div>
          </div>
        </div>
      );
    }

    const hasSubChildren = node.children && node.children.length > 0;

    return (
      <div className="organogram-leg-column">
        <span className={`leg-header-badge ${legClass}`}>{legPositionLabel}</span>
        
        <div className="organogram-card" onClick={() => setSelectedMember(node)}>
          <div style={{ display: 'flex', alignItems: 'center', justifyBetween: 'space-between', width: '100%' }}>
            <div className="tree-user-info" style={{ width: '100%' }}>
              <div className="tree-avatar">
                {node.name ? node.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="tree-user-details" style={{ flex: 1 }}>
                <h4>{node.name}</h4>
                <p>Code: <strong style={{ color: '#fff' }}>{node.referral_code}</strong></p>
                {node.sponsor_name && (
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>
                    Convidante: <strong style={{ color: '#67e8f9' }}>{node.sponsor_name}</strong>
                  </p>
                )}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.75rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border-color)' }}>
            <div>
              {getLayerBadge(node.layer)}
              {node.is_spillover ? (
                <span className="origin-badge origin-spillover" style={{ marginLeft: '0.4rem' }}>🌊 Derrame</span>
              ) : (
                <span className="origin-badge origin-direct" style={{ marginLeft: '0.4rem' }}>🎯 Direto</span>
              )}
            </div>

            <button
              className="nav-btn nav-btn-outline"
              style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}
              onClick={(e) => {
                e.stopPropagation();
                handleZoomIntoNode(node);
              }}
              title="Expandir as 3 pernas deste membro"
            >
              Ver Árvore <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="organogram-container">
      {/* BARRA DE NAVEGAÇÃO / VOLTAR NO ORGANOGRAMA */}
      <div className="organogram-navigation">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          {history.length > 0 && (
            <button className="nav-btn nav-btn-outline" onClick={handleGoBack} style={{ padding: '0.4rem 0.8rem' }}>
              <ArrowLeft size={16} /> Voltar
            </button>
          )}
          <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            Visualizando a Matriz de: <strong style={{ color: '#fff' }}>{activeNode.name}</strong> ({children.length}/3 Posições Ocupadas)
          </span>
        </div>

        {history.length > 0 && (
          <button className="nav-btn nav-btn-ghost" onClick={handleResetToTop} style={{ fontSize: '0.85rem' }}>
            Ir ao Topo (Você)
          </button>
        )}
      </div>

      {/* NÓ DO TOPO (RAIZ / PAI) */}
      <div className="organogram-root-box">
        <div className="organogram-card organogram-card-root" onClick={() => setSelectedMember(activeNode)}>
          <div className="tree-user-info">
            <div className="tree-avatar" style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent-cyan))', width: 44, height: 44, fontSize: '1.1rem' }}>
              {activeNode.name ? activeNode.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="tree-user-details">
              <h4 style={{ fontSize: '1.1rem' }}>
                {activeNode.name}{' '}
                {history.length === 0 && <span style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)' }}>(Você - Topo)</span>}
              </h4>
              <p>{activeNode.email} • Code: <strong style={{ color: '#fff' }}>{activeNode.referral_code}</strong></p>
            </div>
          </div>
          <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <span className="level-badge level-1" style={{ fontSize: '0.8rem' }}>
              Matriz Direta: {children.length} / 3 Ocupadas
            </span>
            <span className="origin-badge origin-direct">
              {children.length >= 3 ? '✅ 1ª Linha Concluída ($US 60)' : '⏳ Em Expansão'}
            </span>
          </div>
        </div>
      </div>

      {/* LINHAS CONECTORAS SVG */}
      <svg className="organogram-lines-svg" viewBox="0 0 900 44" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Linha vertical vinda do topo */}
        <line x1="450" y1="0" x2="450" y2="20" stroke="rgba(99, 102, 241, 0.6)" strokeWidth="2" />
        {/* Linha horizontal dividindo nas 3 colunas */}
        <line x1="150" y1="20" x2="750" y2="20" stroke="rgba(99, 102, 241, 0.6)" strokeWidth="2" />
        {/* Linhas verticais descendo para cada perna */}
        <line x1="150" y1="20" x2="150" y2="44" stroke="rgba(99, 102, 241, 0.6)" strokeWidth="2" />
        <line x1="450" y1="20" x2="450" y2="44" stroke="rgba(99, 102, 241, 0.6)" strokeWidth="2" />
        <line x1="750" y1="20" x2="750" y2="44" stroke="rgba(99, 102, 241, 0.6)" strokeWidth="2" />
      </svg>

      {/* GRADE DAS 3 PERNAS: LADO ESQUERDO, LADO CENTRAL, LADO DIREITO */}
      <div className="organogram-grid-3legs">
        {renderCard(legLeft, 'Posição 1 (Esquerda)', 'leg-header-left')}
        {renderCard(legCenter, 'Posição 2 (Centro)', 'leg-header-center')}
        {renderCard(legRight, 'Posição 3 (Direita)', 'leg-header-right')}
      </div>

      {/* MODAL DE INFORMAÇÕES DETALHADAS DO AFILIADO */}
      {selectedMember && createPortal(
        <div className="modal-overlay" style={{ zIndex: 999999 }} onClick={() => setSelectedMember(null)}>
          <div className="modal-card" style={{ maxWidth: 520 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Info size={20} style={{ color: 'var(--accent-cyan)' }} />
                Detalhes do Afiliado Epi
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
                <div className="detail-item-label">Código de Indicação</div>
                <div className="detail-item-value" style={{ color: '#818cf8' }}>{selectedMember.referral_code}</div>
              </div>

              <div className="detail-item">
                <div className="detail-item-label">Ciclo Atual</div>
                <div className="detail-item-value" style={{ color: '#fbbf24' }}>
                  {selectedMember.current_cycle || 'Socio Bronce'}
                </div>
              </div>

              <div className="detail-item">
                <div className="detail-item-label">Convidado Por (Patrocinador)</div>
                <div className="detail-item-value">{selectedMember.sponsor_name || 'Sistema Raiz'}</div>
              </div>

              <div className="detail-item">
                <div className="detail-item-label">Alocado Em (Posicionamento)</div>
                <div className="detail-item-value">{selectedMember.placement_name || 'Matriz Direta'}</div>
              </div>

              <div className="detail-item">
                <div className="detail-item-label">Tipo de Vínculo</div>
                <div className="detail-item-value">
                  {selectedMember.is_spillover ? '🌊 Derrame (Spillover)' : '🎯 Indicação Direta'}
                </div>
              </div>

              <div className="detail-item">
                <div className="detail-item-label">Reembolso $US 60</div>
                <div className="detail-item-value" style={{ color: selectedMember.fee_refunded ? '#34d399' : '#fbbf24' }}>
                  {selectedMember.fee_refunded ? '✅ Liberado' : '⏳ Pendente (Falta 3 Maestros)'}
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
                Ver Matriz deste Afiliado (3 Pernas)
              </button>
              <button type="button" className="nav-btn nav-btn-outline" onClick={() => setSelectedMember(null)}>
                Fechar
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
