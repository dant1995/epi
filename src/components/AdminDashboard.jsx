import React, { useState, useEffect } from 'react';
import { Shield, Download, Search, Users, UserCheck, Layers, RefreshCw, DollarSign, Award, UserPlus, CheckCircle2, AlertCircle, ChevronUp, ChevronDown, Key, ShieldCheck, Lock, X, Wallet, Power, Send, Clock, BookOpen, Plus, Trash2, Edit, Video, Eye, EyeOff, PlayCircle } from 'lucide-react';

export default function AdminDashboard({ token }) {
  const [users, setUsers] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [adminCourses, setAdminCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Form Retrátil de Cadastro Manual acima da tabela
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState({
    name: '',
    email: '',
    password: '123456',
    sponsorIdentifier: 'ADMIN100',
    targetLeg: 'auto'
  });
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState('');
  const [addSuccess, setAddSuccess] = useState('');

  // Modal de Redefinição de Senha e Notificação
  const [resetModalUser, setResetModalUser] = useState(null);
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [resetModalLoading, setResetModalLoading] = useState(false);
  const [resetModalError, setResetModalError] = useState('');
  const [resetModalSuccess, setResetModalSuccess] = useState('');
  const [actionMessage, setActionMessage] = useState('');
  const [withdrawActionMessage, setWithdrawActionMessage] = useState('');
  const [adminCycles, setAdminCycles] = useState([]);
  const [adminShipments, setAdminShipments] = useState([]);

  // Estados da Gestão de Cursos LMS
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [courseForm, setCourseForm] = useState({ id: null, title: '', description: '', thumbnail_url: '', is_published: true });
  const [courseModalLoading, setCourseModalLoading] = useState(false);

  const [manageCourseDetails, setManageCourseDetails] = useState(null);
  const [showModuleModal, setShowModuleModal] = useState(false);
  const [moduleForm, setModuleForm] = useState({ course_id: null, title: '', order_index: 1 });

  const [showLessonModal, setShowLessonModal] = useState(false);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [quizForm, setQuizForm] = useState({ module_id: null, title: '', passing_score: 70 });
  const [questionForm, setQuestionForm] = useState({ quiz_id: null, question_text: '', correct_option_index: 0, options: ['', '', '', ''] });
  const [lessonForm, setLessonForm] = useState({ module_id: null, title: '', description: '', video_url: '', duration: '10:00', order_index: 1 });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const [usersRes, withdrawRes, coursesRes, cyclesRes, shipmentsRes] = await Promise.all([
        fetch('/api/admin/users', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/admin/withdrawals', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/admin/courses', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/admin/cycles', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/admin/shipments', { headers: { Authorization: `Bearer ${token}` } })
      ]);

      if (!usersRes.ok) throw new Error('Falha ao carregar lista de usuários para administração.');

      const data = await usersRes.json();
      const withdrawData = withdrawRes.ok ? await withdrawRes.json() : { withdrawals: [] };
      const coursesData = coursesRes.ok ? await coursesRes.json() : { courses: [] };
      const cyclesData = cyclesRes.ok ? await cyclesRes.json() : { cycles: [] };
      const shipmentsData = shipmentsRes.ok ? await shipmentsRes.json() : { shipments: [] };

      setUsers(data.users);
      setWithdrawals(withdrawData.withdrawals || []);
      setAdminCourses(coursesData.courses || []);
      setAdminCycles(cyclesData.cycles || []);
      setAdminShipments(shipmentsData.shipments || []);

      if (data.users && data.users.length > 0 && !addForm.sponsorIdentifier) {
        setAddForm(prev => ({ ...prev, sponsorIdentifier: data.users[0].referral_code }));
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [token]);

  const fetchCourseStructure = async (courseId) => {
    try {
      const res = await fetch(`/api/courses/${courseId}`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        setManageCourseDetails(data.course);
      }
    } catch (err) {
      console.error('Erro ao carregar estrutura do curso:', err);
    }
  };

  const handleExportCSV = () => {
    window.open(`/api/admin/export?token=${token}`, '_blank');
  };

  const handleSaveCourse = async (e) => {
    e.preventDefault();
    setCourseModalLoading(true);
    try {
      const isEdit = Boolean(courseForm.id);
      const url = isEdit ? `/api/admin/courses/${courseForm.id}` : '/api/admin/courses';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(courseForm)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao salvar curso.');

      setActionMessage(data.message);
      setShowCourseModal(false);
      fetchUsers();
      setTimeout(() => setActionMessage(''), 3500);
    } catch (err) {
      alert(err.message);
    } finally {
      setCourseModalLoading(false);
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm('Tem certeza que deseja excluir este curso e todo o seu conteúdo?')) return;
    try {
      const res = await fetch(`/api/admin/courses/${courseId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setActionMessage(data.message);
      if (manageCourseDetails?.id === courseId) setManageCourseDetails(null);
      fetchUsers();
      setTimeout(() => setActionMessage(''), 3500);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleSaveModule = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/modules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(moduleForm)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setShowModuleModal(false);
      fetchCourseStructure(moduleForm.course_id);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteModule = async (moduleId) => {
    if (!window.confirm('Excluir este módulo e todas as suas aulas?')) return;
    try {
      const res = await fetch(`/api/admin/modules/${moduleId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) fetchCourseStructure(manageCourseDetails.id);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleSaveQuiz = async (e) => {
    e.preventDefault();
    if (!quizForm.module_id) {
      alert('ERRO: Módulo não definido!');
      return;
    }
    try {
      const res = await fetch('/api/admin/quizzes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(quizForm)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setShowQuizModal(false);
      setQuizForm({ module_id: null, title: '', passing_score: 70 });
      if (manageCourseDetails?.id) fetchCourseStructure(manageCourseDetails.id);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleSaveLesson = async (e) => {
    e.preventDefault();
    console.log('DEBUG lessonForm:', lessonForm);
    if (!lessonForm.module_id) {
      alert('ERRO: Módulo não definido!');
      return;
    }
    if (!lessonForm.title) {
        alert('ERRO: Título não definido!');
        return;
    }
    if (!lessonForm.video_url) {
        alert('ERRO: Link do vídeo não definido!');
        return;
    }
    try {
      const res = await fetch('/api/admin/lessons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(lessonForm)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setShowLessonModal(false);
      setLessonForm({ module_id: null, title: '', description: '', video_url: '', duration: '10:00', order_index: 1 });
      fetchCourseStructure(manageCourseDetails.id);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteLesson = async (lessonId) => {
    if (!window.confirm('Excluir esta vídeo-aula?')) return;
    try {
      const res = await fetch(`/api/admin/lessons/${lessonId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) fetchCourseStructure(manageCourseDetails.id);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleSaveQuestion = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/admin/quizzes/${questionForm.quiz_id}/questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(questionForm)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setShowQuestionModal(false);
      fetchCourseStructure(manageCourseDetails.id);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteQuiz = async (quizId) => {
    if (!window.confirm('Excluir este teste/exame permanentemente?')) return;
    try {
      const res = await fetch(`/api/admin/quizzes/${quizId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) fetchCourseStructure(manageCourseDetails.id);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleAddUserSubmit = async (e) => {
    e.preventDefault();
    setAddError('');
    setAddSuccess('');
    setAddLoading(true);

    try {
      const res = await fetch('/api/admin/register-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(addForm)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erro ao realizar o cadastro manual.');
      }

      setAddSuccess(data.message);
      setAddForm({ name: '', email: '', password: '123456', sponsorIdentifier: users[0]?.referral_code || 'ADMIN100', targetLeg: 'auto' });
      fetchUsers(); // Recarregar tabela da matriz
      setTimeout(() => {
        setAddSuccess('');
      }, 3000);
    } catch (err) {
      setAddError(err.message);
    } finally {
      setAddLoading(false);
    }
  };

  const handleToggleRole = async (userToToggle) => {
    const targetRole = userToToggle.role === 'admin' ? 'user' : 'admin';
    const actionLabel = targetRole === 'admin' ? 'promover a Administrador' : 'alterar para Usuário comum';

    if (!window.confirm(`Tem certeza que deseja ${actionLabel} o usuário "${userToToggle.name}"?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/users/${userToToggle.id}/role`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ role: targetRole })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao alterar o perfil do usuário.');

      setActionMessage(data.message);
      fetchUsers();
      setTimeout(() => setActionMessage(''), 3500);
    } catch (err) {
      alert(`Erro: ${err.message}`);
    }
  };

  const handleToggleActive = async (userToToggle) => {
    const newStatus = userToToggle.is_active === false;
    const label = newStatus ? 'ATIVAR' : 'DESATIVAR';

    if (!window.confirm(`Deseja realmente ${label} o usuário "${userToToggle.name}"?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/users/${userToToggle.id}/active`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ isActive: newStatus })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao alterar status de ativação.');

      setActionMessage(data.message);
      fetchUsers();
      setTimeout(() => setActionMessage(''), 3500);
    } catch (err) {
      alert(`Erro: ${err.message}`);
    }
  };

  const handleProcessWithdrawal = async (withdrawalId, action) => {
    const label = action === 'approve' ? 'APROVAR e pagar' : 'REJEITAR e devolver o saldo para';

    if (!window.confirm(`Tem certeza que deseja ${label} esta solicitação de saque PIX?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/withdrawals/${withdrawalId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ action })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao processar saque.');

      setWithdrawActionMessage(data.message);
      fetchUsers();
      setTimeout(() => setWithdrawActionMessage(''), 3500);
    } catch (err) {
      alert(`Erro: ${err.message}`);
    }
  };

  const handleUpdateShipmentStatus = async (shipmentId, status) => {
    if (!window.confirm(`Alterar status do envio para "${status}"?`)) return;
    try {
      const res = await fetch(`/api/admin/shipments/${shipmentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setActionMessage(data.message);
      fetchUsers();
      setTimeout(() => setActionMessage(''), 3500);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleAdminResetPassword = async (e) => {
    e.preventDefault();
    if (!resetModalUser) return;
    setResetModalError('');
    setResetModalSuccess('');
    setResetModalLoading(true);

    try {
      const res = await fetch(`/api/admin/users/${resetModalUser.id}/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ newPassword: newPasswordInput })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao redefinir senha.');

      setResetModalSuccess(data.message);
      setTimeout(() => {
        setResetModalUser(null);
        setNewPasswordInput('');
        setResetModalSuccess('');
      }, 1500);
    } catch (err) {
      setResetModalError(err.message);
    } finally {
      setResetModalLoading(false);
    }
  };

  const filteredUsers = users.filter(u => {
    const term = searchTerm.toLowerCase();
    return (
      u.name.toLowerCase().includes(term) ||
      u.email.toLowerCase().includes(term) ||
      u.referral_code.toLowerCase().includes(term) ||
      (u.sponsor_name && u.sponsor_name.toLowerCase().includes(term))
    );
  });

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
        <RefreshCw size={32} className="animate-spin" style={{ margin: '0 auto 1rem', display: 'block' }} />
        Carregando visão global da Matriz Epi...
      </div>
    );
  }

  const totalUsersCount = users.length;
  const totalRefundedCount = users.filter(u => u.fee_refunded).length;
  const pendingWithdrawalsCount = withdrawals.filter(w => w.status === 'pending').length;

  return (
    <div>
      {/* CABEÇALHO DO PAINEL ADMIN COM AÇÕES DE EXPORTAÇÃO E ADICIONAR MEMBRO */}
      <div className="card-header" style={{ marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Shield size={26} style={{ color: 'var(--primary)' }} />
            Administração da Matriz Epi 3x3
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
            Acompanhamento de posições, carteira de saques PIX, ativação mensal e gestão de Cursos LMS
          </p>
        </div>

        <div className="admin-header-actions">
          <button 
            type="button" 
            className="nav-btn nav-btn-primary" 
            style={{ cursor: 'pointer' }} 
            onClick={() => setShowAddForm(!showAddForm)}
          >
            <UserPlus size={18} /> 
            {showAddForm ? 'Ocultar Formulário' : 'Adicionar Novo Membro'}
            {showAddForm ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          <button type="button" className="btn-export" style={{ cursor: 'pointer' }} onClick={handleExportCSV}>
            <Download size={18} /> Exportar CSV
          </button>
        </div>
      </div>

      {actionMessage && (
        <div className="sponsor-badge sponsor-badge-valid" style={{ marginBottom: '1.5rem', animation: 'fadeIn 0.3s' }}>
          <CheckCircle2 size={18} />
          <span>{actionMessage}</span>
        </div>
      )}

      {withdrawActionMessage && (
        <div className="sponsor-badge sponsor-badge-valid" style={{ marginBottom: '1.5rem', animation: 'fadeIn 0.3s' }}>
          <CheckCircle2 size={18} />
          <span>{withdrawActionMessage}</span>
        </div>
      )}

      {/* MÉTRICAS GLOBAIS */}
      <div className="stats-grid">
        <div className="stat-card stat-card-indigo">
          <div className="stat-header">
            <span className="stat-title">Total de Afiliados</span>
            <div className="stat-icon stat-icon-indigo"><Users size={20} /></div>
          </div>
          <div className="stat-value">{totalUsersCount}</div>
          <div className="stat-subtext">Cadastros ativos na plataforma Epi</div>
        </div>

        <div className="stat-card stat-card-emerald">
          <div className="stat-header">
            <span className="stat-title">Reembolsos de $US 60 Liberados</span>
            <div className="stat-icon stat-icon-emerald"><DollarSign size={20} /></div>
          </div>
          <div className="stat-value">{totalRefundedCount}</div>
          <div className="stat-subtext">Membros com 3 Maestros completos</div>
        </div>

        <div className="stat-card stat-card-purple" style={{ borderLeftColor: '#fbbf24' }}>
          <div className="stat-header">
            <span className="stat-title">Saques PIX Pendentes</span>
            <div className="stat-icon" style={{ background: 'rgba(251, 191, 36, 0.2)', color: '#fbbf24' }}><Wallet size={20} /></div>
          </div>
          <div className="stat-value" style={{ color: '#fbbf24' }}>{pendingWithdrawalsCount}</div>
          <div className="stat-subtext">Solicitações aguardando transferência</div>
        </div>
      </div>

      {/* SEÇÃO DE GESTÃO DO MÓDULO DE CURSOS E AULAS (LMS) */}
      <div className="glass-card" style={{ marginBottom: '1.5rem', border: '1px solid var(--primary-glow)' }}>
        <div className="card-header">
          <div className="card-title">
            <BookOpen size={22} style={{ color: 'var(--accent-cyan)' }} />
            <span>Gestão do Módulo de Cursos & Área de Membros (LMS)</span>
          </div>

          <button
            type="button"
            className="nav-btn nav-btn-primary"
            style={{ cursor: 'pointer', gap: '0.4rem' }}
            onClick={() => {
              setCourseForm({ id: null, title: '', description: '', thumbnail_url: '', is_published: true });
              setShowCourseModal(true);
            }}
          >
            <Plus size={18} /> Criar Novo Curso
          </button>
        </div>

        {adminCourses.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
            Nenhum curso cadastrado no sistema. Clique em "+ Criar Novo Curso" para começar.
          </div>
        ) : (
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Título do Curso</th>
                  <th>Módulos</th>
                  <th>Aulas</th>
                  <th>Visibilidade</th>
                  <th style={{ textAlign: 'center' }}>Ações de Gestão</th>
                </tr>
              </thead>
              <tbody>
                {adminCourses.map((c) => (
                  <tr key={c.id}>
                    <td style={{ color: 'var(--text-subtle)' }}>#{c.id}</td>
                    <td style={{ fontWeight: 700 }}>{c.title}</td>
                    <td><span className="level-badge level-1">{c.modules_count || 0} módulos</span></td>
                    <td><span className="level-badge level-2">{c.lessons_count || 0} aulas</span></td>
                    <td>
                      {c.is_published !== false ? (
                        <span className="origin-badge origin-direct">👁️ Publicado</span>
                      ) : (
                        <span className="origin-badge origin-spillover" style={{ color: '#f43f5e', borderColor: 'rgba(244, 63, 94, 0.4)' }}>
                          🔒 Rascunho
                        </span>
                      )}
                    </td>
                    <td style={{ whiteSpace: 'nowrap', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'center' }}>
                        <button
                          type="button"
                          className="demo-pill"
                          style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', borderColor: 'rgba(56, 189, 248, 0.3)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}
                          onClick={() => fetchCourseStructure(c.id)}
                          title="Gerenciar Módulos e Vídeo-Aulas"
                        >
                          <Video size={12} /> Aulas
                        </button>
                        <button
                          type="button"
                          className="demo-pill"
                          style={{ background: 'rgba(251, 191, 36, 0.15)', color: '#fbbf24', borderColor: 'rgba(251, 191, 36, 0.3)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}
                          onClick={() => {
                            setCourseForm({ id: c.id, title: c.title, description: c.description || '', thumbnail_url: c.thumbnail_url || '', is_published: c.is_published !== false });
                            setShowCourseModal(true);
                          }}
                          title="Editar Curso"
                        >
                          <Edit size={12} /> Editar
                        </button>
                        <button
                          type="button"
                          className="demo-pill"
                          style={{ background: 'rgba(244, 63, 94, 0.15)', color: '#f43f5e', borderColor: 'rgba(244, 63, 94, 0.3)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}
                          onClick={() => handleDeleteCourse(c.id)}
                          title="Excluir Curso"
                        >
                          <Trash2 size={12} /> Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* INSPETOR DE MÓDULOS E AULAS DO CURSO SELECIONADO PELO ADMIN */}
        {manageCourseDetails && (
          <div style={{ marginTop: '1.5rem', background: '#0f172a', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--accent-cyan)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
              <h3 style={{ color: '#fff', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Video size={20} style={{ color: 'var(--accent-cyan)' }} />
                Gerenciando Conteúdo: "{manageCourseDetails.title}"
              </h3>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  type="button"
                  className="nav-btn nav-btn-primary"
                  style={{ cursor: 'pointer', padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                  onClick={() => {
                    setModuleForm({ course_id: manageCourseDetails.id, title: '', order_index: (manageCourseDetails.modules?.length || 0) + 1 });
                    setShowModuleModal(true);
                  }}
                >
                  <Plus size={14} /> Adicionar Módulo
                </button>
                <button type="button" className="nav-btn nav-btn-ghost" onClick={() => setManageCourseDetails(null)}>
                  Fechar ×
                </button>
              </div>
            </div>

            {(!manageCourseDetails.modules || manageCourseDetails.modules.length === 0) ? (
              <div style={{ color: 'var(--text-muted)', fontSize: '0.88rem', textAlign: 'center', padding: '1.5rem 0' }}>
                Nenhum módulo cadastrado. Clique em "+ Adicionar Módulo" acima.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {manageCourseDetails.modules.map((m) => (
                  <div key={m.id} style={{ background: '#1e293b', padding: '1rem', borderRadius: '8px', border: '1px solid #334155' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <h4 style={{ color: '#67e8f9', fontSize: '0.95rem', fontWeight: 700 }}>
                        📁 {m.title}
                      </h4>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          type="button"
                          className="demo-pill"
                          style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', borderColor: 'rgba(16, 185, 129, 0.4)', cursor: 'pointer' }}
                          onClick={() => {
                            setLessonForm({ module_id: m.id, title: '', description: '', video_url: '', duration: '10:00', order_index: (m.lessons?.length || 0) + 1 });
                            setShowLessonModal(true);
                          }}
                        >
                          + Adicionar Aula
                        </button>
                        <button
                          type="button"
                          className="demo-pill"
                          style={{ background: 'rgba(251, 191, 36, 0.2)', color: '#fbbf24', borderColor: 'rgba(251, 191, 36, 0.4)', cursor: 'pointer' }}
                          onClick={() => {
                            setQuizForm({ module_id: m.id, title: '', passing_score: 70 });
                            setShowQuizModal(true);
                          }}
                        >
                          + Adicionar Quiz
                        </button>
                        <button
                          type="button"
                          className="demo-pill"
                          style={{ background: 'rgba(244, 63, 94, 0.2)', color: '#f43f5e', borderColor: 'rgba(244, 63, 94, 0.4)', cursor: 'pointer' }}
                          onClick={() => handleDeleteModule(m.id)}
                        >
                          Excluir Módulo
                        </button>
                      </div>
                    </div>

                    {/* AULAS E QUIZZES DO MÓDULO */}
                    {(!m.lessons || m.lessons.length === 0) && (!m.quizzes || m.quizzes.length === 0) ? (
                      <div style={{ color: 'var(--text-subtle)', fontSize: '0.8rem', fontStyle: 'italic', paddingLeft: '0.5rem' }}>
                        Nenhum conteúdo cadastrado neste módulo.
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                        {m.lessons?.map((l) => (
                          <div key={l.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(15,23,42,0.6)', padding: '0.5rem 0.75rem', borderRadius: '6px' }}>
                            <div style={{ fontSize: '0.85rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <PlayCircle size={14} style={{ color: 'var(--accent-cyan)' }} />
                              <strong>{l.title}</strong>
                            </div>
                            <button
                              type="button"
                              className="nav-btn nav-btn-ghost"
                              style={{ padding: '0.1rem 0.4rem', color: '#f43f5e' }}
                              onClick={() => handleDeleteLesson(l.id)}
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        ))}
                        {m.quizzes?.map((q) => (
                          <div key={q.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(251,191,36,0.1)', padding: '0.5rem 0.75rem', borderRadius: '6px' }}>
                            <div style={{ fontSize: '0.85rem', color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <Award size={14} />
                              <strong>Quiz: {q.title}</strong>
                            </div>
                            <div style={{ display: 'flex', gap: '0.2rem' }}>
                              <button
                                type="button"
                                className="nav-btn nav-btn-ghost"
                                style={{ padding: '0.1rem 0.4rem', color: '#22d3ee' }}
                                onClick={() => {
                                  setQuestionForm({ quiz_id: q.id, question_text: '', correct_option_index: 0, options: ['', '', '', ''] });
                                  setShowQuestionModal(true);
                                }}
                              >
                                <Plus size={13} />
                              </button>
                              <button
                                type="button"
                                className="nav-btn nav-btn-ghost"
                                style={{ padding: '0.1rem 0.4rem', color: '#f43f5e' }}
                                onClick={() => handleDeleteQuiz(q.id)}
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* SEÇÃO DE GESTÃO DE SAQUES PIX PENDENTES E HISTÓRICO */}
      <div className="glass-card" style={{ marginBottom: '1.5rem', border: '1px solid var(--primary-glow)' }}>
        <div className="card-header">
          <div className="card-title">
            <Wallet size={22} style={{ color: '#fbbf24' }} />
            <span>Gerenciamento de Saques PIX Solicitados ({withdrawals.length})</span>
          </div>
        </div>

        {withdrawals.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
            Nenhuma solicitação de saque PIX registrada até o momento.
          </div>
        ) : (
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Afiliado</th>
                  <th>E-mail</th>
                  <th>Valor ($US)</th>
                  <th>Chave PIX</th>
                  <th>Data</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'center' }}>Ação Admin</th>
                </tr>
              </thead>
              <tbody>
                {withdrawals.map((w) => (
                  <tr key={w.id}>
                    <td style={{ color: 'var(--text-subtle)' }}>#{w.id}</td>
                    <td style={{ fontWeight: 700 }}>{w.user_name}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{w.user_email}</td>
                    <td style={{ fontWeight: 800, color: '#38bdf8' }}>$US {parseFloat(w.amount).toFixed(2)}</td>
                    <td style={{ color: '#67e8f9', fontFamily: 'monospace', fontWeight: 600 }}>{w.pix_key}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      {new Date(w.created_at).toLocaleDateString('pt-BR')} {new Date(w.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td>
                      {w.status === 'approved' ? (
                        <span className="origin-badge origin-direct">✅ Pago (Aprovado)</span>
                      ) : w.status === 'rejected' ? (
                        <span className="origin-badge origin-spillover" style={{ color: '#f43f5e', borderColor: 'rgba(244, 63, 94, 0.4)' }}>
                          ❌ Rejeitado (Estornado)
                        </span>
                      ) : (
                        <span className="origin-badge origin-spillover" style={{ color: '#fbbf24', borderColor: 'rgba(251, 191, 36, 0.4)' }}>
                          ⏳ Pendente de Análise
                        </span>
                      )}
                    </td>
                    <td style={{ whiteSpace: 'nowrap', textAlign: 'center' }}>
                      {w.status === 'pending' ? (
                        <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center' }}>
                          <button
                            type="button"
                            className="demo-pill"
                            style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', borderColor: 'rgba(16, 185, 129, 0.4)', cursor: 'pointer' }}
                            onClick={() => handleProcessWithdrawal(w.id, 'approve')}
                            title="Aprovar Saque e Confirmar Pagamento"
                          >
                            ✅ Aprovar
                          </button>
                          <button
                            type="button"
                            className="demo-pill"
                            style={{ background: 'rgba(244, 63, 94, 0.2)', color: '#f43f5e', borderColor: 'rgba(244, 63, 94, 0.4)', cursor: 'pointer' }}
                            onClick={() => handleProcessWithdrawal(w.id, 'reject')}
                            title="Rejeitar Saque e Estornar Saldo"
                          >
                            ❌ Rejeitar
                          </button>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-subtle)', fontSize: '0.8rem' }}>— Processado</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* SEÇÃO DE GESTÃO DE CICLOS */}
      <div className="glass-card" style={{ marginBottom: '1.5rem', border: '1px solid var(--primary-glow)' }}>
        <div className="card-header">
          <div className="card-title">
            <Layers size={22} style={{ color: '#a855f7' }} />
            <span>Gestão de Ciclos ({adminCycles.length})</span>
          </div>
        </div>
        {adminCycles.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Nenhum ciclo cadastrado.</div>
        ) : (
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nome</th>
                  <th>Slug</th>
                  <th>Preço ($US)</th>
                  <th>Bônus/Indicação</th>
                  <th>Reembolso</th>
                  <th>Ordem</th>
                  <th>Ativo</th>
                </tr>
              </thead>
              <tbody>
                {adminCycles.map((c) => (
                  <tr key={c.id}>
                    <td style={{ color: 'var(--text-subtle)' }}>#{c.id}</td>
                    <td style={{ fontWeight: 700 }}>{c.display_name}</td>
                    <td style={{ color: 'var(--text-muted)', fontFamily: 'monospace' }}>{c.slug}</td>
                    <td style={{ fontWeight: 800, color: '#38bdf8' }}>$US {c.price}</td>
                    <td style={{ color: '#34d399' }}>$US {c.bonus_per_referral}</td>
                    <td style={{ color: '#fbbf24' }}>$US {c.refund_amount}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{c.order_index}</td>
                    <td>
                      {c.is_active ? (
                        <span className="origin-badge origin-direct">✅ Ativo</span>
                      ) : (
                        <span className="origin-badge origin-spillover" style={{ color: '#f43f5e', borderColor: 'rgba(244,63,94,0.4)' }}>🔒 Inativo</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* SEÇÃO DE GESTÃO DE ENVIOS DE PRODUTOS */}
      <div className="glass-card" style={{ marginBottom: '1.5rem', border: '1px solid var(--primary-glow)' }}>
        <div className="card-header">
          <div className="card-title">
            <Send size={22} style={{ color: '#38bdf8' }} />
            <span>Envios de Produtos Físicos ({adminShipments.length})</span>
          </div>
        </div>
        {adminShipments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Nenhum envio registrado. Envios são criados automaticamente ao atingir ciclo Ouro+.</div>
        ) : (
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Usuário</th>
                  <th>Produto</th>
                  <th>Ciclo</th>
                  <th>Endereço</th>
                  <th>Status</th>
                  <th>Data</th>
                  <th style={{ textAlign: 'center' }}>Ação</th>
                </tr>
              </thead>
              <tbody>
                {adminShipments.map((s) => (
                  <tr key={s.id}>
                    <td style={{ color: 'var(--text-subtle)' }}>#{s.id}</td>
                    <td style={{ fontWeight: 700 }}>{s.user_name || s.user_email}</td>
                    <td>{s.product_name}</td>
                    <td><span className="level-badge level-1">{s.cycle_name}</span></td>
                    <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)', maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {s.shipping_address || '—'}
                    </td>
                    <td>
                      {s.status === 'delivered' ? (
                        <span className="origin-badge origin-direct">✅ Entregue</span>
                      ) : s.status === 'shipped' ? (
                        <span className="origin-badge" style={{ color: '#38bdf8', borderColor: 'rgba(56,189,248,0.4)' }}>📦 Enviado</span>
                      ) : s.status === 'cancelled' ? (
                        <span className="origin-badge origin-spillover" style={{ color: '#f43f5e', borderColor: 'rgba(244,63,94,0.4)' }}>❌ Cancelado</span>
                      ) : (
                        <span className="origin-badge origin-spillover" style={{ color: '#fbbf24', borderColor: 'rgba(251,191,36,0.4)' }}>⏳ Pendente</span>
                      )}
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{new Date(s.created_at).toLocaleDateString('pt-BR')}</td>
                    <td style={{ whiteSpace: 'nowrap', textAlign: 'center' }}>
                      {s.status === 'pending' && (
                        <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'center' }}>
                          <button type="button" className="demo-pill" style={{ background: 'rgba(56,189,248,0.15)', color: '#38bdf8', borderColor: 'rgba(56,189,248,0.3)', cursor: 'pointer' }} onClick={() => handleUpdateShipmentStatus(s.id, 'shipped')}>📦 Enviar</button>
                          <button type="button" className="demo-pill" style={{ background: 'rgba(244,63,94,0.15)', color: '#f43f5e', borderColor: 'rgba(244,63,94,0.4)', cursor: 'pointer' }} onClick={() => handleUpdateShipmentStatus(s.id, 'cancelled')}>❌</button>
                        </div>
                      )}
                      {s.status === 'shipped' && (
                        <button type="button" className="demo-pill" style={{ background: 'rgba(16,185,129,0.15)', color: '#34d399', borderColor: 'rgba(16,185,129,0.3)', cursor: 'pointer' }} onClick={() => handleUpdateShipmentStatus(s.id, 'delivered')}>✅ Entregue</button>
                      )}
                      {(s.status === 'delivered' || s.status === 'cancelled') && (
                        <span style={{ color: 'var(--text-subtle)', fontSize: '0.8rem' }}>—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* PAINEL RETRÁTIL DE CADASTRO MANUAL ACIMA DA TABELA */}
      {showAddForm && (
        <div className="glass-card" style={{ marginBottom: '1.5rem', border: '1px solid var(--primary-glow)', background: 'linear-gradient(135deg, rgba(26, 37, 60, 0.95), rgba(15, 23, 42, 0.95))' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
            <h3 style={{ color: '#fff', display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '1.15rem' }}>
              <UserPlus size={22} style={{ color: 'var(--accent-cyan)' }} />
              Cadastrar Novo Membro na Matriz Epi (Escolha de Perna)
            </h3>
            <button type="button" className="nav-btn nav-btn-ghost" onClick={() => setShowAddForm(false)}>
              Fechar ×
            </button>
          </div>

          {addError && (
            <div className="sponsor-badge sponsor-badge-invalid" style={{ marginBottom: '1rem' }}>
              <AlertCircle size={18} />
              <span>{addError}</span>
            </div>
          )}

          {addSuccess && (
            <div className="sponsor-badge sponsor-badge-valid" style={{ marginBottom: '1rem' }}>
              <CheckCircle2 size={18} />
              <span>{addSuccess}</span>
            </div>
          )}

          <form onSubmit={handleAddUserSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Nome Completo</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ex: Mariana Castro"
                  style={{ paddingLeft: '1rem' }}
                  value={addForm.name}
                  onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Endereço de E-mail</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="mariana@exemplo.com"
                  style={{ paddingLeft: '1rem' }}
                  value={addForm.email}
                  onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Senha Temporária</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="123456"
                  style={{ paddingLeft: '1rem' }}
                  value={addForm.password}
                  onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
                  required
                />
              </div>

              {/* SELETOR DE PATROCINADOR (SPONSOR) */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ color: '#67e8f9', fontWeight: 700 }}>
                  Patrocinador (Sponsor)
                </label>
                <select
                  className="form-input"
                  style={{ paddingLeft: '1rem', background: '#0f172a', color: '#fff', cursor: 'pointer' }}
                  value={addForm.sponsorIdentifier}
                  onChange={(e) => setAddForm({ ...addForm, sponsorIdentifier: e.target.value })}
                  required
                >
                  {users.map((u) => (
                    <option key={u.id} value={u.referral_code}>
                      {u.name} (Code: {u.referral_code}) — Maestros: {u.maestros_count}/3
                    </option>
                  ))}
                </select>
              </div>

              {/* SELETOR DA PERNA / POSIÇÃO DA ÁRVORE */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ color: '#34d399', fontWeight: 700 }}>
                  Posição / Perna da Matriz
                </label>
                <select
                  className="form-input"
                  style={{ paddingLeft: '1rem', background: '#0f172a', color: '#fff', cursor: 'pointer', borderColor: 'var(--accent-emerald)' }}
                  value={addForm.targetLeg}
                  onChange={(e) => setAddForm({ ...addForm, targetLeg: e.target.value })}
                  required
                >
                  <option value="auto">🤖 Automático (Derrame Sequencial)</option>
                  <option value="left">👈 Posição 1 — Perna Esquerda</option>
                  <option value="center">🎯 Posição 2 — Perna Central</option>
                  <option value="right">👉 Posição 3 — Perna Direita</option>
                </select>
              </div>
            </div>

            <div style={{ fontSize: '0.8rem', color: 'var(--text-subtle)', marginTop: '0.85rem' }}>
              * Ao selecionar uma perna específica (Esquerda, Centro ou Direita), o membro é alocado diretamente naquela posição. Se a posição direta do líder já estiver ocupada, o sistema alocará na sub-árvore daquela perna escolhida.
            </div>

            <div style={{ marginTop: '1.25rem', display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button type="button" className="nav-btn nav-btn-outline" onClick={() => setShowAddForm(false)}>
                Cancelar
              </button>
              <button type="submit" className="nav-btn nav-btn-primary" disabled={addLoading}>
                {addLoading ? 'Cadastrando na Matriz...' : 'Confirmar e Inserir Membro'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TABELA ADMIN */}
      <div className="glass-card">
        <div className="card-header">
          <div className="card-title">
            <Users size={20} style={{ color: 'var(--accent-cyan)' }} />
            <span>Matriz Global de Afiliados ({filteredUsers.length})</span>
          </div>

          <div className="search-bar" style={{ margin: 0 }}>
            <Search size={16} style={{ color: 'var(--text-subtle)' }} />
            <input
              type="text"
              placeholder="Buscar por nome, e-mail ou código..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nome</th>
                <th>E-mail</th>
                <th>Perfil</th>
                <th>Status Conta</th>
                <th>Patrocinador</th>
                <th>Alocado em</th>
                <th>Perna</th>
                <th>Reembolso $US 60</th>
                <th>Maestros</th>
                <th>Total 39</th>
                <th style={{ textAlign: 'center' }}>Ações de Gestão</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => (
                <tr key={u.id}>
                  <td style={{ color: 'var(--text-subtle)', fontWeight: 600 }}>#{u.id}</td>
                  <td style={{ fontWeight: 700 }}>{u.name}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{u.email}</td>
                  <td>
                    {u.role === 'admin' ? (
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                        padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 700,
                        background: 'rgba(56, 189, 248, 0.2)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.4)'
                      }}>
                        <ShieldCheck size={13} /> Admin
                      </span>
                    ) : (
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                        padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 600,
                        background: 'rgba(148, 163, 184, 0.1)', color: '#94a3b8', border: '1px solid rgba(148, 163, 184, 0.2)'
                      }}>
                        Usuário
                      </span>
                    )}
                  </td>
                  <td>
                    {u.is_active !== false ? (
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                        padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 700,
                        background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.4)'
                      }}>
                        Ativo
                      </span>
                    ) : (
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                        padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 700,
                        background: 'rgba(244, 63, 94, 0.2)', color: '#f43f5e', border: '1px solid rgba(244, 63, 94, 0.4)'
                      }}>
                        Inativo
                      </span>
                    )}
                  </td>
                  <td>{u.sponsor_name || 'Nenhum'}</td>
                  <td>{u.placement_name || 'Nenhum'}</td>
                  <td>
                    {u.position ? (
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                        padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 700,
                        background: u.position === 1 ? 'rgba(99,102,241,0.2)' : u.position === 2 ? 'rgba(52,211,153,0.2)' : 'rgba(251,191,36,0.2)',
                        color: u.position === 1 ? '#818cf8' : u.position === 2 ? '#34d399' : '#fbbf24',
                        border: `1px solid ${u.position === 1 ? 'rgba(99,102,241,0.4)' : u.position === 2 ? 'rgba(52,211,153,0.4)' : 'rgba(251,191,36,0.4)'}`
                      }}>
                        {u.position === 1 ? '👈 P.1' : u.position === 2 ? '🎯 P.2' : '👉 P.3'}
                      </span>
                    ) : <span style={{ color: 'var(--text-subtle)' }}>— Raiz</span>}
                  </td>
                  <td>
                    {u.fee_refunded ? (
                      <span className="origin-badge origin-direct">✅ $US 60</span>
                    ) : (
                      <span className="origin-badge origin-spillover" style={{ color: '#fbbf24', borderColor: 'rgba(251,191,36,0.3)' }}>
                        ⏳ Pendente
                      </span>
                    )}
                  </td>
                  <td><span className="level-badge level-1">{u.maestros_count} / 3</span></td>
                  <td>
                    <strong style={{ color: '#fbbf24' }}>{u.total_matrix} / 39</strong>
                  </td>
                  <td style={{ whiteSpace: 'nowrap', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'center' }}>
                      <button
                        type="button"
                        className="demo-pill"
                        style={{
                          background: u.is_active !== false ? 'rgba(244, 63, 94, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                          color: u.is_active !== false ? '#f43f5e' : '#34d399',
                          borderColor: u.is_active !== false ? 'rgba(244, 63, 94, 0.3)' : 'rgba(16, 185, 129, 0.3)',
                          cursor: 'pointer',
                          display: 'inline-flex', alignItems: 'center', gap: '0.2rem'
                        }}
                        onClick={() => handleToggleActive(u)}
                        title={u.is_active !== false ? 'Desativar Afiliado' : 'Ativar Afiliado'}
                      >
                        <Power size={11} /> {u.is_active !== false ? 'Desativar' : 'Ativar'}
                      </button>

                      <button
                        type="button"
                        className="demo-pill"
                        style={{
                          background: u.role === 'admin' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                          color: u.role === 'admin' ? '#f87171' : '#34d399',
                          borderColor: u.role === 'admin' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.3)',
                          cursor: 'pointer'
                        }}
                        onClick={() => handleToggleRole(u)}
                        title={u.role === 'admin' ? 'Rebaixar para Usuário' : 'Promover a Administrador'}
                      >
                        {u.role === 'admin' ? 'User' : 'Admin'}
                      </button>

                      <button
                        type="button"
                        className="demo-pill"
                        style={{
                          background: 'rgba(251, 191, 36, 0.15)',
                          color: '#fbbf24',
                          borderColor: 'rgba(251, 191, 36, 0.3)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.2rem',
                          cursor: 'pointer'
                        }}
                        onClick={() => {
                          setResetModalUser(u);
                          setNewPasswordInput('123456');
                          setResetModalError('');
                          setResetModalSuccess('');
                        }}
                        title="Redefinir Senha do Afiliado"
                      >
                        <Key size={11} /> Senha
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL DE CRIAR / EDITAR CURSO */}
      {showCourseModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem'
        }}>
          <div className="glass-card" style={{ maxWidth: '500px', width: '100%', border: '1px solid var(--primary-glow)', background: '#0f172a' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
              <h3 style={{ color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.15rem' }}>
                <BookOpen size={20} style={{ color: 'var(--accent-cyan)' }} />
                {courseForm.id ? 'Editar Curso' : 'Criar Novo Curso'}
              </h3>
              <button type="button" className="nav-btn nav-btn-ghost" onClick={() => setShowCourseModal(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveCourse}>
              <div className="form-group">
                <label className="form-label">Título do Curso</label>
                <input
                  type="text"
                  className="form-input"
                  style={{ paddingLeft: '1rem' }}
                  placeholder="Ex: Formação MMN & Liderança 3x3"
                  value={courseForm.title}
                  onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Descrição</label>
                <textarea
                  className="form-input"
                  style={{ paddingLeft: '1rem', minHeight: '80px', fontFamily: 'inherit' }}
                  placeholder="Apresentação do curso..."
                  value={courseForm.description}
                  onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">URL da Capa (Thumbnail)</label>
                <input
                  type="url"
                  className="form-input"
                  style={{ paddingLeft: '1rem' }}
                  placeholder="https://images.unsplash.com/..."
                  value={courseForm.thumbnail_url}
                  onChange={(e) => setCourseForm({ ...courseForm, thumbnail_url: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={courseForm.is_published}
                    onChange={(e) => setCourseForm({ ...courseForm, is_published: e.target.checked })}
                  />
                  <span>Publicar no catálogo dos afiliados</span>
                </label>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                <button type="button" className="nav-btn nav-btn-outline" onClick={() => setShowCourseModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="nav-btn nav-btn-primary" disabled={courseModalLoading}>
                  {courseModalLoading ? 'Salvação...' : 'Salvar Curso'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE ADICIONAR MÓDULO */}
      {showModuleModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem'
        }}>
          <div className="glass-card" style={{ maxWidth: '420px', width: '100%', border: '1px solid var(--primary-glow)', background: '#0f172a' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
              <h3 style={{ color: '#fff', fontSize: '1.1rem' }}>Novo Módulo</h3>
              <button type="button" className="nav-btn nav-btn-ghost" onClick={() => setShowModuleModal(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveModule}>
              <div className="form-group">
                <label className="form-label">Título do Módulo</label>
                <input
                  type="text"
                  className="form-input"
                  style={{ paddingLeft: '1rem' }}
                  placeholder="Ex: Módulo 1: Fundamentos"
                  value={moduleForm.title}
                  onChange={(e) => setModuleForm({ ...moduleForm, title: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Ordem de Exibição</label>
                <input
                  type="number"
                  className="form-input"
                  style={{ paddingLeft: '1rem' }}
                  value={moduleForm.order_index}
                  onChange={(e) => setModuleForm({ ...moduleForm, order_index: parseInt(e.target.value, 10) || 1 })}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                <button type="button" className="nav-btn nav-btn-outline" onClick={() => setShowModuleModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="nav-btn nav-btn-primary">
                  Adicionar Módulo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE ADICIONAR PERGUNTA */}
      {showQuestionModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem'
        }}>
          <div className="glass-card" style={{ maxWidth: '500px', width: '100%', border: '1px solid var(--primary-glow)', background: '#0f172a' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
              <h3 style={{ color: '#fff', fontSize: '1.1rem' }}>Adicionar Pergunta</h3>
              <button type="button" className="nav-btn nav-btn-ghost" onClick={() => setShowQuestionModal(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveQuestion}>
              <div className="form-group">
                <label className="form-label">Pergunta</label>
                <input
                  type="text"
                  className="form-input"
                  style={{ paddingLeft: '1rem' }}
                  value={questionForm.question_text}
                  onChange={(e) => setQuestionForm({ ...questionForm, question_text: e.target.value })}
                  required
                />
              </div>

              {questionForm.options.map((opt, idx) => (
                <div key={idx} className="form-group">
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input
                      type="radio"
                      name="correct"
                      checked={questionForm.correct_option_index === idx}
                      onChange={() => setQuestionForm({ ...questionForm, correct_option_index: idx })}
                    />
                    Opção {idx + 1}
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    value={opt}
                    onChange={(e) => {
                      const newOptions = [...questionForm.options];
                      newOptions[idx] = e.target.value;
                      setQuestionForm({ ...questionForm, options: newOptions });
                    }}
                    required
                  />
                </div>
              ))}

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                <button type="button" className="nav-btn nav-btn-outline" onClick={() => setShowQuestionModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="nav-btn nav-btn-primary">
                  Salvar Pergunta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showQuizModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem'
        }}>
          <div className="glass-card" style={{ maxWidth: '420px', width: '100%', border: '1px solid var(--primary-glow)', background: '#0f172a' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
              <h3 style={{ color: '#fff', fontSize: '1.1rem' }}>Novo Quiz</h3>
              <button type="button" className="nav-btn nav-btn-ghost" onClick={() => setShowQuizModal(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveQuiz}>
              <div className="form-group">
                <label className="form-label">Título do Quiz</label>
                <input
                  type="text"
                  className="form-input"
                  style={{ paddingLeft: '1rem' }}
                  placeholder="Ex: Quiz Módulo 1"
                  value={quizForm.title}
                  onChange={(e) => setQuizForm({ ...quizForm, title: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Pontuação Mínima para Aprovação (%)</label>
                <input
                  type="number"
                  className="form-input"
                  style={{ paddingLeft: '1rem' }}
                  value={quizForm.passing_score}
                  onChange={(e) => setQuizForm({ ...quizForm, passing_score: parseInt(e.target.value, 10) || 70 })}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                <button type="button" className="nav-btn nav-btn-outline" onClick={() => setShowQuizModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="nav-btn nav-btn-primary">
                  Adicionar Quiz
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showLessonModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem'
        }}>
          <div className="glass-card" style={{ maxWidth: '480px', width: '100%', border: '1px solid var(--primary-glow)', background: '#0f172a' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
              <h3 style={{ color: '#fff', fontSize: '1.1rem' }}>Cadastrar Vídeo-Aula</h3>
              <button type="button" className="nav-btn nav-btn-ghost" onClick={() => setShowLessonModal(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveLesson}>
              <div className="form-group">
                <label className="form-label">Título da Aula</label>
                <input
                  type="text"
                  className="form-input"
                  style={{ paddingLeft: '1rem' }}
                  placeholder="Ex: Aula 1: Como usar a Matriz"
                  value={lessonForm.title}
                  onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Link do Vídeo (YouTube, Vimeo, MP4)</label>
                <input
                  type="url"
                  className="form-input"
                  style={{ paddingLeft: '1rem' }}
                  placeholder="https://www.youtube.com/embed/..."
                  value={lessonForm.video_url}
                  onChange={(e) => setLessonForm({ ...lessonForm, video_url: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Duração (Ex: 12:45)</label>
                  <input
                    type="text"
                    className="form-input"
                    style={{ paddingLeft: '1rem' }}
                    placeholder="12:45"
                    value={lessonForm.duration}
                    onChange={(e) => setLessonForm({ ...lessonForm, duration: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Ordem</label>
                  <input
                    type="number"
                    className="form-input"
                    style={{ paddingLeft: '1rem' }}
                    value={lessonForm.order_index}
                    onChange={(e) => setLessonForm({ ...lessonForm, order_index: parseInt(e.target.value, 10) || 1 })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Descrição da Aula</label>
                <textarea
                  className="form-input"
                  style={{ paddingLeft: '1rem', minHeight: '60px', fontFamily: 'inherit' }}
                  placeholder="Resumo do conteúdo..."
                  value={lessonForm.description}
                  onChange={(e) => setLessonForm({ ...lessonForm, description: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                <button type="button" className="nav-btn nav-btn-outline" onClick={() => setShowLessonModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="nav-btn nav-btn-primary">
                  Cadastrar Aula
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE REDEFINIÇÃO DE SENHA PELO ADMIN */}
      {resetModalUser && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem'
        }}>
          <div className="glass-card" style={{ maxWidth: '440px', width: '100%', border: '1px solid var(--primary-glow)', background: '#0f172a' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
              <h3 style={{ color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem' }}>
                <Key size={20} style={{ color: '#fbbf24' }} />
                Redefinir Senha de Afiliado
              </h3>
              <button type="button" className="nav-btn nav-btn-ghost" onClick={() => setResetModalUser(null)}>
                <X size={18} />
              </button>
            </div>

            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.2rem' }}>
              Defina uma nova senha de acesso para <strong>{resetModalUser.name}</strong> ({resetModalUser.email}).
            </p>

            {resetModalError && (
              <div className="sponsor-badge sponsor-badge-invalid" style={{ marginBottom: '1rem' }}>
                <AlertCircle size={16} />
                <span>{resetModalError}</span>
              </div>
            )}

            {resetModalSuccess && (
              <div className="sponsor-badge sponsor-badge-valid" style={{ marginBottom: '1rem' }}>
                <CheckCircle2 size={16} />
                <span>{resetModalSuccess}</span>
              </div>
            )}

            <form onSubmit={handleAdminResetPassword}>
              <div className="form-group">
                <label className="form-label">Nova Senha</label>
                <div className="input-wrapper">
                  <Lock className="input-icon" size={18} />
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Digite a nova senha..."
                    value={newPasswordInput}
                    onChange={(e) => setNewPasswordInput(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                <button type="button" className="nav-btn nav-btn-outline" onClick={() => setResetModalUser(null)}>
                  Cancelar
                </button>
                <button type="submit" className="nav-btn nav-btn-primary" disabled={resetModalLoading}>
                  {resetModalLoading ? 'Salvando...' : 'Salvar Nova Senha'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}



