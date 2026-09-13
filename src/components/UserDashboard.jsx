import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Layers, Copy, Check, Link, Network, List, RefreshCw, ShieldCheck, DollarSign, Award, ArrowUpRight, Wallet, CreditCard, Send, Clock, CheckCircle2, AlertCircle, X, GraduationCap, BookOpen } from 'lucide-react';
import NetworkTree from './NetworkTree';

export default function UserDashboard({ token, onLogout, onNavigateTab }) {
  const [data, setData] = useState(null);
  const [treeData, setTreeData] = useState(null);
  const [walletData, setWalletData] = useState({ balance: 0, pending_balance: 0, total_earned: 0, withdrawals: [] });
  const [cyclesData, setCyclesData] = useState({});
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // 'list' ou 'tree'

  // Estado do Modal de Saque PIX
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawPixKey, setWithdrawPixKey] = useState('');
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [withdrawError, setWithdrawError] = useState('');
  const [withdrawSuccess, setWithdrawSuccess] = useState('');

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const [dashRes, treeRes, walletRes, cyclesRes, txRes] = await Promise.all([
        fetch('/api/user/dashboard', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/user/tree', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/user/wallet', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/user/cycles', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/user/transactions', { headers: { Authorization: `Bearer ${token}` } })
      ]);

      if (dashRes.status === 401 || dashRes.status === 404) {
        onLogout();
        return;
      }

      if (!dashRes.ok) throw new Error('Falha ao carregar os dados da Matriz Epi.');

      const dashJson = await dashRes.json();
      const treeJson = await treeRes.json();
      const walletJson = walletRes.ok ? await walletRes.json() : { wallet: { balance: 0, pending_balance: 0, total_earned: 0, withdrawals: [] } };
      const cyclesJson = cyclesRes.ok ? await cyclesRes.json() : {};
      const txJson = txRes.ok ? await txRes.json() : { transactions: [] };

      setData(dashJson);
      setTreeData(treeJson.tree);
      if (walletJson.wallet) setWalletData(walletJson.wallet);
      setCyclesData(cyclesJson);
      setTransactions(txJson.transactions || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [token]);

  const handleWithdrawSubmit = async (e) => {
    e.preventDefault();
    setWithdrawError('');
    setWithdrawSuccess('');
    setWithdrawLoading(true);

    try {
      const res = await fetch('/api/user/withdraw', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ amount: withdrawAmount, pixKey: withdrawPixKey })
      });

      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || 'Erro ao solicitar saque.');

      setWithdrawSuccess(resData.message);
      fetchDashboard();
      setTimeout(() => {
        setShowWithdrawModal(false);
        setWithdrawAmount('');
        setWithdrawPixKey('');
        setWithdrawSuccess('');
      }, 1800);
    } catch (err) {
      setWithdrawError(err.message);
    } finally {
      setWithdrawLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
        <RefreshCw size={32} className="animate-spin" style={{ margin: '0 auto 1rem', display: 'block' }} />
        Carregando sua Matriz Epi 3x3...
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--accent-rose)' }}>
        <h3>Ops! Falha na conexão.</h3>
        <p style={{ marginTop: '0.5rem' }}>{error}</p>
        <button className="nav-btn nav-btn-primary" style={{ marginTop: '1.5rem' }} onClick={fetchDashboard}>
          Tentar Novamente
        </button>
      </div>
    );
  }

  const { user, epi_layers, matrix } = data;
  const referralUrl = `${window.location.origin}/?ref=${user.referral_code}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const getCycleBadge = (cycleName) => {
    const name = cycleName || 'Bronze';
    if (name.includes('Bronze')) return <span className="cycle-badge cycle-bronce"><Award size={14} /> Socio Bronze</span>;
    if (name.includes('Prata')) return <span className="cycle-badge cycle-plata"><Award size={14} /> Socio Prata</span>;
    if (name.includes('Ouro')) return <span className="cycle-badge cycle-oro"><Award size={14} /> Socio Ouro</span>;
    if (name.includes('Platino')) return <span className="cycle-badge cycle-platino"><Award size={14} /> Socio Platino</span>;
    return <span className="cycle-badge cycle-diamante"><Award size={14} /> Socio Diamante</span>;
  };

  const getLayerBadge = (layer) => {
    if (layer === 1) return <span className="level-badge level-1">Camada 1: Maestro</span>;
    if (layer === 2) return <span className="level-badge level-2">Camada 2: Líder</span>;
    return <span className="level-badge level-3">Camada 3: Ayudante</span>;
  };

  return (
    <div>
      {/* BANNER DO LINK DE INDICAÇÃO & CICLO CORPORATIVO */}
      <div className="referral-banner">
        <div className="referral-info">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
            {getCycleBadge(user.current_cycle)}
            
            {/* BADGE DE ATIVAÇÃO MENSAL */}
            {user.is_active !== false ? (
              <span className="origin-badge origin-direct" style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', borderColor: 'rgba(16, 185, 129, 0.4)' }}>
                ✅ Conta Ativa (Ativação em dia)
              </span>
            ) : (
              <span className="origin-badge origin-spillover" style={{ background: 'rgba(244, 63, 94, 0.2)', color: '#f43f5e', borderColor: 'rgba(244, 63, 94, 0.4)' }}>
                ⚠️ Conta Inativa (Ativação Pendente)
              </span>
            )}

            <span style={{ fontSize: '0.85rem', color: 'var(--accent-cyan)' }}>
              Patrocinador: <strong>{user.sponsor_name}</strong>
            </span>
          </div>
          <h3>Seu Link de Indicação Epi (Base 3)</h3>
          <p>Convide novos afiliados com seu link direto. As indicações excedentes entram automaticamente por Derrame.</p>
        </div>

        <div className="referral-input-group">
          <Link size={16} style={{ color: 'var(--accent-cyan)', marginRight: '0.5rem' }} />
          <span className="referral-url-text">{referralUrl}</span>
          <button className={`btn-copy ${copied ? 'copied' : ''}`} onClick={handleCopyLink}>
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? 'Copiado!' : 'Copiar Link'}
          </button>
        </div>
      </div>

      {/* BANNER ATALHO PARA ACADEMIA LMS / CURSOS */}
      <div className="glass-card" style={{
        marginBottom: '1.5rem',
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(14, 165, 233, 0.15))',
        border: '1px solid rgba(56, 189, 248, 0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        padding: '1.25rem 1.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: 48, height: 48, borderRadius: '12px',
            background: 'linear-gradient(135deg, #6366f1, #38bdf8)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff'
          }}>
            <GraduationCap size={26} />
          </div>
          <div>
            <h4 style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>
              🎓 Academia & Área de Cursos (LMS)
            </h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.2rem', margin: 0 }}>
              Assista a vídeo-aulas práticas, treinamentos de liderança e materiais de apoio do sistema Epi.
            </p>
          </div>
        </div>
        <button
          type="button"
          className="nav-btn nav-btn-primary"
          style={{ cursor: 'pointer', gap: '0.5rem', flexShrink: 0 }}
          onClick={() => onNavigateTab && onNavigateTab('courses')}
        >
          <BookOpen size={16} /> Acessar Cursos
        </button>
      </div>

      {/* CARTEIRA DIGITAL E SAQUES PIX */}
      <div className="glass-card" style={{ marginBottom: '1.5rem', border: '1px solid var(--primary-glow)' }}>
        <div className="card-header">
          <div className="card-title">
            <Wallet size={22} style={{ color: '#38bdf8' }} />
            <span>Carteira Digital (Wallet & Comissões)</span>
          </div>
          <button
            type="button"
            className="nav-btn nav-btn-primary"
            style={{ cursor: 'pointer', gap: '0.5rem' }}
            onClick={() => {
              setWithdrawAmount(walletData.balance > 0 ? walletData.balance.toString() : '');
              setWithdrawPixKey('');
              setWithdrawError('');
              setWithdrawSuccess('');
              setShowWithdrawModal(true);
            }}
          >
            <Send size={16} /> Solicitar Saque PIX
          </button>
        </div>

        <div className="stats-grid" style={{ marginBottom: '1rem' }}>
          <div className="stat-card stat-card-emerald">
            <div className="stat-header">
              <span className="stat-title">Saldo Disponível</span>
              <div className="stat-icon stat-icon-emerald"><DollarSign size={20} /></div>
            </div>
            <div className="stat-value">$US {walletData.balance.toFixed(2)}</div>
            <div className="stat-subtext">Pronto para solicitação de saque PIX</div>
          </div>

          <div className="stat-card stat-card-purple" style={{ borderLeftColor: '#fbbf24' }}>
            <div className="stat-header">
              <span className="stat-title">Saldo em Processamento</span>
              <div className="stat-icon" style={{ background: 'rgba(251, 191, 36, 0.2)', color: '#fbbf24' }}><Clock size={20} /></div>
            </div>
            <div className="stat-value" style={{ color: '#fbbf24' }}>$US {walletData.pending_balance.toFixed(2)}</div>
            <div className="stat-subtext">Aguardando aprovação do pagamento</div>
          </div>

          <div className="stat-card stat-card-indigo">
            <div className="stat-header">
              <span className="stat-title">Total Já Sacado / Ganho</span>
              <div className="stat-icon stat-icon-indigo"><Award size={20} /></div>
            </div>
            <div className="stat-value">$US {walletData.total_earned.toFixed(2)}</div>
            <div className="stat-subtext">Acumulado histórico de comissões</div>
          </div>
        </div>

        {/* TABELA DE SAQUES DO AFILIADO */}
        {walletData.withdrawals && walletData.withdrawals.length > 0 && (
          <div style={{ marginTop: '1.25rem' }}>
            <h4 style={{ color: '#fff', fontSize: '0.95rem', marginBottom: '0.75rem', fontWeight: 700 }}>
              Histórico de Solicitações de Saque
            </h4>
            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Valor</th>
                    <th>Chave PIX</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {walletData.withdrawals.map((w) => (
                    <tr key={w.id}>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        {new Date(w.created_at).toLocaleDateString('pt-BR')} {new Date(w.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td style={{ fontWeight: 700, color: '#38bdf8' }}>$US {parseFloat(w.amount).toFixed(2)}</td>
                      <td style={{ color: 'var(--text-subtle)', fontFamily: 'monospace' }}>{w.pix_key}</td>
                      <td>
                        {w.status === 'approved' ? (
                          <span className="origin-badge origin-direct">✅ Pago (Aprovado)</span>
                        ) : w.status === 'rejected' ? (
                          <span className="origin-badge origin-spillover" style={{ color: '#f43f5e', borderColor: 'rgba(244, 63, 94, 0.4)' }}>
                            ❌ Rejeitado (Estornado)
                          </span>
                        ) : (
                          <span className="origin-badge origin-spillover" style={{ color: '#fbbf24', borderColor: 'rgba(251, 191, 36, 0.4)' }}>
                            ⏳ Em Análise (Pendente)
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* CARD DE GRÁFICO DA REDE */}
      <div className="glass-card" style={{ marginBottom: '1.5rem' }}>
        <div className="card-header">
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#fff' }}>📊 Resumo da Minha Rede</h3>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '1rem', padding: '0.5rem 0' }}>
          <div style={{ textAlign: 'center', padding: '1rem', background: 'rgba(99,102,241,0.1)', borderRadius: 10 }}>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#818cf8' }}>
              {epi_layers?.maestros?.count || 0}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Maestros</div>
            <div style={{ marginTop: '0.3rem', height: 4, background: 'rgba(255,255,255,0.1)', borderRadius: 4 }}>
              <div style={{ height: '100%', width: `${epi_layers?.maestros?.percent || 0}%`, background: '#818cf8', borderRadius: 4 }}></div>
            </div>
          </div>
          <div style={{ textAlign: 'center', padding: '1rem', background: 'rgba(16,185,129,0.1)', borderRadius: 10 }}>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#34d399' }}>
              {epi_layers?.lideres?.count || 0}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Líderes</div>
            <div style={{ marginTop: '0.3rem', height: 4, background: 'rgba(255,255,255,0.1)', borderRadius: 4 }}>
              <div style={{ height: '100%', width: `${epi_layers?.lideres?.percent || 0}%`, background: '#34d399', borderRadius: 4 }}></div>
            </div>
          </div>
          <div style={{ textAlign: 'center', padding: '1rem', background: 'rgba(251,191,36,0.1)', borderRadius: 10 }}>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fbbf24' }}>
              {epi_layers?.ayudantes?.count || 0}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Ayudantes</div>
            <div style={{ marginTop: '0.3rem', height: 4, background: 'rgba(255,255,255,0.1)', borderRadius: 4 }}>
              <div style={{ height: '100%', width: `${epi_layers?.ayudantes?.percent || 0}%`, background: '#fbbf24', borderRadius: 4 }}></div>
            </div>
          </div>
          <div style={{ textAlign: 'center', padding: '1rem', background: 'rgba(236,72,153,0.1)', borderRadius: 10 }}>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f472b6' }}>
              ${walletData.total_earned?.toFixed(0) || '0'}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Ganado</div>
            <div style={{ marginTop: '0.3rem', height: 4, background: 'rgba(255,255,255,0.1)', borderRadius: 4 }}>
              <div style={{ height: '100%', width: `${Math.min((walletData.total_earned / 500) * 100, 100)}%`, background: '#f472b6', borderRadius: 4 }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* CARD DE PROGRESSÃO DE CICLOS E UPGRADE */}
      <div className="refund-card" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff' }}>
              Progressão de Ciclos — {cyclesData?.current_cycle?.display_name || user.current_cycle}
            </h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.2rem' }}>
              Preço: $US {cyclesData?.current_cycle?.price ?? '—'} | Bônus por indicação: $US {cyclesData?.current_cycle?.bonus_per_referral ?? '—'}
            </p>
          </div>
          {cyclesData?.next_cycle && (
            <button
              className="nav-btn nav-btn-primary"
              style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}
              onClick={async () => {
                if (!window.confirm(`Fazer upgrade para ${cyclesData.next_cycle.display_name} ($US ${cyclesData.next_cycle.price})?`)) return;
                try {
                  const res = await fetch('/api/user/upgrade', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                    body: JSON.stringify({ cycleId: cyclesData.next_cycle.id })
                  });
                  const result = await res.json();
                  if (!res.ok) throw new Error(result.error);
                  alert(result.message);
                  fetchDashboard();
                } catch (err) {
                  alert(err.message);
                }
              }}
            >
              ⬆️ Upgrade para {cyclesData.next_cycle.display_name} ($US {cyclesData.next_cycle.price})
            </button>
          )}
        </div>

        {/* Barra de progressão dos 5 ciclos */}
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {['Bronze', 'Prata', 'Ouro', 'Platino', 'Diamante'].map((name, idx) => {
            const isCurrent = cyclesData?.current_cycle?.name === name;
            const isCompleted = cyclesData?.progress?.some(p => p.cycle_name === name && p.status === 'completed');
            const isFuture = !isCurrent && !isCompleted;
            return (
              <div key={name} style={{ flex: 1, textAlign: 'center' }}>
                <div style={{
                  padding: '0.5rem 0.25rem',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: isCurrent ? 800 : 500,
                  background: isCompleted ? 'rgba(16,185,129,0.2)' : isCurrent ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.05)',
                  color: isCompleted ? '#34d399' : isCurrent ? '#60a5fa' : 'var(--text-muted)',
                  border: `1px solid ${isCurrent ? '#3b82f6' : isCompleted ? '#10b981' : 'transparent'}`
                }}>
                  {isCompleted ? '✅' : isCurrent ? '▶️' : '🔒'} {name}
                </div>
              </div>
            );
          })}
        </div>

        {/* Status de reembolso do ciclo atual */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: 'rgba(15,23,42,0.6)', borderRadius: '8px' }}>
          <div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Reembolso do Ciclo {cyclesData?.current_cycle?.name || 'Bronze'}:
            </span>
            <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff', marginLeft: '0.5rem' }}>
              $US {cyclesData?.current_cycle?.refund_amount ?? '—'}
            </span>
          </div>
          <span style={{ fontSize: '0.85rem', color: user.fee_refunded ? '#34d399' : '#fbbf24' }}>
            {user.fee_refunded ? '✅ Liberado' : `⏳ ${epi_layers.maestros.count}/3 Maestros`}
          </span>
        </div>
      </div>

      {/* EXTRATO FINANCEIRO */}
      {transactions.length > 0 && (
        <div className="glass-card" style={{ border: '1px solid var(--primary-glow)' }}>
          <div className="card-header">
            <DollarSign size={18} style={{ color: 'var(--accent-cyan)' }} />
            <span>Extrato Financeiro</span>
          </div>
          <div className="card-body">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                  <th style={{ textAlign: 'left', padding: '0.5rem' }}>Data</th>
                  <th style={{ textAlign: 'left', padding: '0.5rem' }}>Tipo</th>
                  <th style={{ textAlign: 'left', padding: '0.5rem' }}>Descrição</th>
                  <th style={{ textAlign: 'right', padding: '0.5rem' }}>Valor</th>
                </tr>
              </thead>
              <tbody>
                {transactions.slice(0, 10).map((tx) => (
                  <tr key={tx.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '0.5rem', color: 'var(--text-muted)' }}>{new Date(tx.created_at).toLocaleDateString('pt-BR')}</td>
                    <td style={{ padding: '0.5rem' }}>
                      <span style={{ fontSize: '0.78rem', padding: '0.15rem 0.5rem', borderRadius: '4px',
                        background: tx.type === 'commission_direct' ? 'rgba(16,185,129,0.2)' :
                                    tx.type === 'refund' ? 'rgba(59,130,246,0.2)' :
                                    tx.type === 'upgrade' ? 'rgba(168,85,247,0.2)' :
                                    tx.type === 'cycle_purchase' ? 'rgba(251,191,36,0.2)' :
                                    'rgba(255,255,255,0.1)',
                        color: tx.type === 'commission_direct' ? '#34d399' :
                               tx.type === 'refund' ? '#60a5fa' :
                               tx.type === 'upgrade' ? '#a855f7' :
                               tx.type === 'cycle_purchase' ? '#fbbf24' : '#94a3b8'
                      }}>
                        {tx.type === 'commission_direct' ? '💰 Comissão' :
                         tx.type === 'refund' ? '💸 Reembolso' :
                         tx.type === 'upgrade' ? '⬆️ Upgrade' :
                         tx.type === 'cycle_purchase' ? '🛒 Compra' : tx.type}
                      </span>
                    </td>
                    <td style={{ padding: '0.5rem', color: 'var(--text-muted)' }}>{tx.description}</td>
                    <td style={{ padding: '0.5rem', textAlign: 'right', fontWeight: 700,
                      color: ['commission_direct','refund'].includes(tx.type) ? '#34d399' : '#f43f5e' }}>
                      {['commission_direct','refund'].includes(tx.type) ? '+' : '-'}${tx.amount.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PROGRESSO DAS 3 CAMADAS DA MATRIZ Epi (3, 9, 27 = 39) */}
      <div className="epi-layers-grid">
        <div className="layer-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)' }}>Camada 1: Maestros</span>
            <span className="level-badge level-1">{epi_layers.maestros.count} / 3</span>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', marginTop: '0.5rem' }}>
            {epi_layers.maestros.count} <span style={{ fontSize: '0.9rem', color: 'var(--text-subtle)' }}>membros</span>
          </div>
          <div className="layer-progress-bar">
            <div className="layer-progress-fill fill-maestros" style={{ width: `${epi_layers.maestros.percent}%` }}></div>
          </div>
        </div>

        <div className="layer-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)' }}>Camada 2: Líderes</span>
            <span className="level-badge level-2">{epi_layers.lideres.count} / 9</span>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', marginTop: '0.5rem' }}>
            {epi_layers.lideres.count} <span style={{ fontSize: '0.9rem', color: 'var(--text-subtle)' }}>membros</span>
          </div>
          <div className="layer-progress-bar">
            <div className="layer-progress-fill fill-lideres" style={{ width: `${epi_layers.lideres.percent}%` }}></div>
          </div>
        </div>

        <div className="layer-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)' }}>Camada 3: Ayudantes</span>
            <span className="level-badge level-3">{epi_layers.ayudantes.count} / 27</span>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', marginTop: '0.5rem' }}>
            {epi_layers.ayudantes.count} <span style={{ fontSize: '0.9rem', color: 'var(--text-subtle)' }}>membros</span>
          </div>
          <div className="layer-progress-bar">
            <div className="layer-progress-fill fill-ayudantes" style={{ width: `${epi_layers.ayudantes.percent}%` }}></div>
          </div>
        </div>

        <div className="layer-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-amber)' }}>Progresso da Plataforma</span>
            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#fbbf24' }}>
              {epi_layers.total_platform.count} / 39 ({epi_layers.total_platform.percent}%)
            </span>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fbbf24', marginTop: '0.5rem' }}>
            {epi_layers.total_platform.percent}%
          </div>
          <div className="layer-progress-bar">
            <div className="layer-progress-fill fill-total" style={{ width: `${epi_layers.total_platform.percent}%` }}></div>
          </div>
        </div>
      </div>

      {/* PAINEL DA MATRIZ */}
      <div className="glass-card">
        <div className="card-header">
          <div className="card-title">
            <Users size={22} style={{ color: 'var(--primary)' }} />
            <span>Membros da Matriz Epi ({matrix.length} / 39)</span>
          </div>

          <div className="tabs-container" style={{ marginBottom: 0 }}>
            <button 
              className={`tab-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
            >
              <List size={16} style={{ display: 'inline', marginRight: '0.4rem', verticalAlign: 'middle' }} />
              Tabela de Membros
            </button>
            <button 
              className={`tab-btn ${viewMode === 'tree' ? 'active' : ''}`}
              onClick={() => setViewMode('tree')}
            >
              <Network size={16} style={{ display: 'inline', marginRight: '0.4rem', verticalAlign: 'middle' }} />
              Árvore Matriz 3x3
            </button>
          </div>
        </div>

        {viewMode === 'list' ? (
          <div>
            {matrix.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                <UserPlus size={40} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                <p style={{ fontWeight: 600 }}>Sua matriz 3x3 ainda não possui membros cadastrados.</p>
                <p style={{ fontSize: '0.85rem', marginTop: '0.4rem' }}>
                  Convide seus 3 primeiros convidados com seu link para preencher sua linha de Maestros!
                </p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Camada Epi</th>
                      <th>Nome do Afiliado</th>
                      <th>E-mail</th>
                      <th>Patrocinador</th>
                      <th>Alocado Sob</th>
                      <th>Tipo de Vínculo</th>
                      <th>Data</th>
                    </tr>
                  </thead>
                  <tbody>
                    {matrix.map((item) => (
                      <tr key={item.id}>
                        <td>{getLayerBadge(item.layer)}</td>
                        <td style={{ fontWeight: 700 }}>{item.name}</td>
                        <td style={{ color: 'var(--text-muted)' }}>{item.email}</td>
                        <td>{item.sponsor_name}</td>
                        <td>{item.placement_name}</td>
                        <td>
                          {item.is_spillover ? (
                            <span className="origin-badge origin-spillover">🌊 Derrame</span>
                          ) : (
                            <span className="origin-badge origin-direct">🎯 Direto</span>
                          )}
                        </td>
                        <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                          {new Date(item.created_at).toLocaleDateString('pt-BR')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          <NetworkTree treeData={treeData} />
        )}
      </div>

      {/* MODAL DE SOLICITAÇÃO DE SAQUE PIX */}
      {showWithdrawModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem'
        }}>
          <div className="glass-card" style={{ maxWidth: '440px', width: '100%', border: '1px solid var(--primary-glow)', background: '#0f172a' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
              <h3 style={{ color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.15rem' }}>
                <Send size={20} style={{ color: '#38bdf8' }} />
                Solicitar Saque via PIX
              </h3>
              <button type="button" className="nav-btn nav-btn-ghost" onClick={() => setShowWithdrawModal(false)}>
                <X size={18} />
              </button>
            </div>

            <div style={{ background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: '8px', padding: '0.85rem', marginBottom: '1.2rem', color: '#67e8f9', fontSize: '0.88rem' }}>
              Saldo Disponível: <strong>$US {walletData.balance.toFixed(2)}</strong>
            </div>

            {withdrawError && (
              <div className="sponsor-badge sponsor-badge-invalid" style={{ marginBottom: '1rem' }}>
                <AlertCircle size={16} />
                <span>{withdrawError}</span>
              </div>
            )}

            {withdrawSuccess && (
              <div className="sponsor-badge sponsor-badge-valid" style={{ marginBottom: '1rem' }}>
                <CheckCircle2 size={16} />
                <span>{withdrawSuccess}</span>
              </div>
            )}

            <form onSubmit={handleWithdrawSubmit}>
              <div className="form-group">
                <label className="form-label">Valor a Sacar ($US)</label>
                <div className="input-wrapper">
                  <DollarSign className="input-icon" size={18} />
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    max={walletData.balance}
                    className="form-input"
                    placeholder="Ex: 60.00"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Chave PIX para Recebimento</label>
                <div className="input-wrapper">
                  <CreditCard className="input-icon" size={18} />
                  <input
                    type="text"
                    className="form-input"
                    placeholder="CPF, E-mail, Telefone ou Chave Aleatória"
                    value={withdrawPixKey}
                    onChange={(e) => setWithdrawPixKey(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                <button type="button" className="nav-btn nav-btn-outline" onClick={() => setShowWithdrawModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="nav-btn nav-btn-primary" disabled={withdrawLoading || walletData.balance <= 0}>
                  {withdrawLoading ? 'Enviando Pedido...' : 'Confirmar Saque PIX'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

