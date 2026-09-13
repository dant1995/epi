import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { TrendingUp, DollarSign, Users, Gift, Send, Download, Settings, RefreshCw, Mail, CheckCircle2 } from 'lucide-react';

const COLORS = ['#818cf8', '#34d399', '#fbbf24', '#f472b6', '#38bdf8'];

export default function AdminMetrics({ token }) {
  const [metrics, setMetrics] = useState(null);
  const [commissions, setCommissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');

  // Broadcast state
  const [broadcastSubject, setBroadcastSubject] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastLoading, setBroadcastLoading] = useState(false);
  const [broadcastResult, setBroadcastResult] = useState('');

  // Settings state
  const [settingsCycles, setSettingsCycles] = useState([]);
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsResult, setSettingsResult] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [metricsRes, commRes, cyclesRes] = await Promise.all([
        fetch('/api/admin/metrics', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/admin/commissions', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/admin/cycles', { headers: { Authorization: `Bearer ${token}` } })
      ]);
      if (metricsRes.ok) setMetrics(await metricsRes.json());
      if (commRes.ok) { const d = await commRes.json(); setCommissions(d.commissions || []); }
      if (cyclesRes.ok) { const d = await cyclesRes.json(); setSettingsCycles(d.cycles || []); }
    } catch (err) { console.error('Erro ao carregar métricas:', err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [token]);

  const handleBroadcast = async (e) => {
    e.preventDefault();
    setBroadcastLoading(true);
    setBroadcastResult('');
    try {
      const res = await fetch('/api/admin/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ subject: broadcastSubject, message: broadcastMessage })
      });
      const data = await res.json();
      setBroadcastResult(data.message || data.error);
      if (res.ok) { setBroadcastSubject(''); setBroadcastMessage(''); }
    } catch (err) { setBroadcastResult('Erro ao enviar.'); }
    finally { setBroadcastLoading(false); }
  };

  const handleSaveSettings = async () => {
    setSettingsLoading(true);
    setSettingsResult('');
    try {
      const res = await fetch('/api/admin/cycles/bulk', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ cycles: settingsCycles })
      });
      const data = await res.json();
      setSettingsResult(data.message || data.error);
    } catch (err) { setSettingsResult('Erro ao salvar.'); }
    finally { setSettingsLoading(false); }
  };

  const handleBackup = () => {
    window.open(`/api/admin/backup?token=${token}`, '_blank');
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}><RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto', display: 'block' }} /> Cargando métricas...</div>;

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: <TrendingUp size={16} /> },
    { id: 'commissions', label: 'Comissões', icon: <Gift size={16} /> },
    { id: 'broadcast', label: 'Email Massa', icon: <Mail size={16} /> },
    { id: 'settings', label: 'Configurações', icon: <Settings size={16} /> },
    { id: 'backup', label: 'Backup', icon: <Download size={16} /> }
  ];

  return (
    <div>
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        {tabs.map(t => (
          <button key={t.id} className={`nav-btn ${activeTab === t.id ? 'nav-btn-primary' : 'nav-btn-ghost'}`}
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
            onClick={() => setActiveTab(t.id)}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* DASHBOARD */}
      {activeTab === 'dashboard' && metrics && (
        <>
          <div className="stats-grid" style={{ marginBottom: '1.5rem' }}>
            <div className="stat-card stat-card-indigo">
              <div className="stat-header"><span className="stat-title">Total Afiliados</span><div className="stat-icon stat-icon-indigo"><Users size={20} /></div></div>
              <div className="stat-value">{metrics.overview.totalUsers}</div>
              <div className="stat-subtext">{metrics.overview.activeUsers} activos / {metrics.overview.pendingUsers} pendientes</div>
            </div>
            <div className="stat-card stat-card-emerald">
              <div className="stat-header"><span className="stat-title">Receita Total</span><div className="stat-icon stat-icon-emerald"><DollarSign size={20} /></div></div>
              <div className="stat-value">$US {metrics.financial.totalRevenue}</div>
              <div className="stat-subtext">Comissões pagas: ${metrics.financial.totalCommissions}</div>
            </div>
            <div className="stat-card stat-card-purple" style={{ borderLeftColor: '#fbbf24' }}>
              <div className="stat-header"><span className="stat-title">Saques Pendentes</span><div className="stat-icon" style={{ background: 'rgba(251,191,36,0.2)', color: '#fbbf24' }}><DollarSign size={20} /></div></div>
              <div className="stat-value" style={{ color: '#fbbf24' }}>$US {metrics.financial.pendingWithdrawals}</div>
              <div className="stat-subtext">Reembolsos pagos: ${metrics.financial.totalRefunds}</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <div className="glass-card" style={{ padding: '1.5rem' }}>
              <h3 style={{ color: '#fff', fontSize: '0.95rem', marginBottom: '1rem', fontWeight: 700 }}>📈 Crescimento Mensal</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={metrics.monthlyGrowth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: '#fff' }} />
                  <Bar dataKey="newUsers" name="Novos Afiliados" fill="#818cf8" radius={[4,4,0,0]} />
                  <Bar dataKey="revenue" name="Receita ($)" fill="#34d399" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="glass-card" style={{ padding: '1.5rem' }}>
              <h3 style={{ color: '#fff', fontSize: '0.95rem', marginBottom: '1rem', fontWeight: 700 }}>🎯 Distribuição por Ciclo</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={metrics.cycleDistribution} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, count }) => `${name}: ${count}`}>
                    {metrics.cycleDistribution.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: '#fff' }} />
                  <Legend wrapperStyle={{ color: '#94a3b8', fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}

      {/* COMISSÕES */}
      {activeTab === 'commissions' && (
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <h3 style={{ color: '#fff', fontSize: '1rem', marginBottom: '1rem', fontWeight: 700 }}>💰 Relatório de Comissões por Afiliado</h3>
          {commissions.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>Nenhum dado de comissões disponível.</p>
          ) : (
            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr><th>#</th><th>Nome</th><th>Email</th><th>Indicações</th><th>Total Ganho</th></tr>
                </thead>
                <tbody>
                  {commissions.map((c, i) => (
                    <tr key={c.id}>
                      <td style={{ color: 'var(--text-muted)' }}>{i + 1}</td>
                      <td style={{ fontWeight: 700 }}>{c.name}</td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{c.email}</td>
                      <td><span className="origin-badge origin-direct">{c.referralCount} indicados</span></td>
                      <td style={{ fontWeight: 800, color: c.totalEarned > 0 ? '#34d399' : 'var(--text-muted)' }}>$US {c.totalEarned.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* BROADCAST */}
      {activeTab === 'broadcast' && (
        <div className="glass-card" style={{ padding: '1.5rem', maxWidth: 600 }}>
          <h3 style={{ color: '#fff', fontSize: '1rem', marginBottom: '1rem', fontWeight: 700 }}>📧 Envio de Email em Massa</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>Envia um comunicado para todos os afiliados activos.</p>
          {broadcastResult && (
            <div className="sponsor-badge sponsor-badge-valid" style={{ marginBottom: '1rem' }}><CheckCircle2 size={16} /><span>{broadcastResult}</span></div>
          )}
          <form onSubmit={handleBroadcast}>
            <div className="form-group">
              <label className="form-label">Assunto</label>
              <input type="text" className="form-input" value={broadcastSubject} onChange={e => setBroadcastSubject(e.target.value)} required placeholder="Ex: Novidade importante!" />
            </div>
            <div className="form-group">
              <label className="form-label">Mensagem</label>
              <textarea className="form-input" rows={6} value={broadcastMessage} onChange={e => setBroadcastMessage(e.target.value)} required placeholder="Escreva sua mensagem aqui..." />
            </div>
            <button type="submit" className="nav-btn nav-btn-primary" disabled={broadcastLoading} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Send size={16} /> {broadcastLoading ? 'Enviando...' : 'Enviar para todos'}
            </button>
          </form>
        </div>
      )}

      {/* CONFIGURAÇÕES */}
      {activeTab === 'settings' && (
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <h3 style={{ color: '#fff', fontSize: '1rem', marginBottom: '1rem', fontWeight: 700 }}>⚙️ Configurações dos Ciclos</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>Altere preços, bônus e reembolsos de todos os ciclos.</p>
          {settingsResult && (
            <div className="sponsor-badge sponsor-badge-valid" style={{ marginBottom: '1rem' }}><CheckCircle2 size={16} /><span>{settingsResult}</span></div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {settingsCycles.map((c, i) => (
              <div key={c.id} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 10, padding: '1rem', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <strong style={{ color: COLORS[i % COLORS.length] }}>{c.display_name}</strong>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Ordem: {c.order_index}</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Preço ($)</label>
                    <input type="number" step="0.01" className="form-input" value={c.price} onChange={e => { const v = [...settingsCycles]; v[i] = { ...v[i], price: parseFloat(e.target.value) || 0 }; setSettingsCycles(v); }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Bônus/Indicação ($)</label>
                    <input type="number" step="0.01" className="form-input" value={c.bonus_per_referral} onChange={e => { const v = [...settingsCycles]; v[i] = { ...v[i], bonus_per_referral: parseFloat(e.target.value) || 0 }; setSettingsCycles(v); }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Reembolso ($)</label>
                    <input type="number" step="0.01" className="form-input" value={c.refund_amount} onChange={e => { const v = [...settingsCycles]; v[i] = { ...v[i], refund_amount: parseFloat(e.target.value) || 0 }; setSettingsCycles(v); }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button className="nav-btn nav-btn-primary" onClick={handleSaveSettings} disabled={settingsLoading} style={{ marginTop: '1rem', cursor: 'pointer' }}>
            {settingsLoading ? 'Guardando...' : 'Guardar Configurações'}
          </button>
        </div>
      )}

      {/* BACKUP */}
      {activeTab === 'backup' && (
        <div className="glass-card" style={{ padding: '1.5rem', maxWidth: 500 }}>
          <h3 style={{ color: '#fff', fontSize: '1rem', marginBottom: '1rem', fontWeight: 700 }}>💾 Backup / Exportação de Dados</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
            Exporta todos os dados do banco em formato JSON. Inclui: usuários, transações, saques, ciclos, cursos, produtos, envios e carteiras.
          </p>
          <button className="nav-btn nav-btn-primary" onClick={handleBackup} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Download size={18} /> Baixar Backup JSON
          </button>
        </div>
      )}
    </div>
  );
}
