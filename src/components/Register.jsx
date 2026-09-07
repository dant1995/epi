import React, { useState, useEffect } from 'react';
import { User, Mail, Lock, UserCheck, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export default function Register({ onRegisterSuccess, switchToLogin }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [sponsorIdentifier, setSponsorIdentifier] = useState('');
  
  // Estados de Validação do Patrocinador
  const [sponsorStatus, setSponsorStatus] = useState({
    loading: false,
    valid: false,
    sponsor: null,
    message: ''
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Capturar parâmetro ?ref=CODIGO da URL automaticamente
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const refParam = params.get('ref');
    if (refParam) {
      setSponsorIdentifier(refParam);
      validateSponsor(refParam, true);
    } else {
      setSponsorIdentifier('ADMIN100');
      validateSponsor('ADMIN100', false);
    }
  }, []);

  // Função de Validação do Patrocinador via API
  const validateSponsor = async (identifier, isUrlParam = false) => {
    if (!identifier || identifier.trim() === '') {
      setSponsorStatus({
        loading: false,
        valid: false,
        sponsor: null,
        message: 'O campo do patrocinador é obrigatório.'
      });
      return;
    }

    setSponsorStatus(prev => ({ ...prev, loading: true, message: '' }));

    try {
      const res = await fetch(`/api/sponsor/validate/${encodeURIComponent(identifier.trim())}`);
      const data = await res.json();

      if (res.ok && data.valid) {
        setSponsorStatus({
          loading: false,
          valid: true,
          sponsor: data.sponsor,
          message: `Patrocinador confirmado: ${data.sponsor.name} (${data.sponsor.referral_code})`
        });
      } else {
        if (isUrlParam && identifier.trim() !== 'ADMIN100') {
          // Fallback para ADMIN100 se o parâmetro da URL for inválido
          setSponsorIdentifier('ADMIN100');
          validateSponsor('ADMIN100', false);
        } else {
          setSponsorStatus({
            loading: false,
            valid: false,
            sponsor: null,
            message: data.message || 'Patrocinador não encontrado.'
          });
        }
      }
    } catch (err) {
      setSponsorStatus({
        loading: false,
        valid: false,
        sponsor: null,
        message: 'Erro ao conectar ao servidor para validar o patrocinador.'
      });
    }
  };


  // Handler de mudança no campo do Patrocinador com debounce
  const handleSponsorChange = (e) => {
    const value = e.target.value;
    setSponsorIdentifier(value);
    
    if (value.trim().length >= 3) {
      validateSponsor(value);
    } else {
      setSponsorStatus({
        loading: false,
        valid: false,
        sponsor: null,
        message: 'Digite ao menos 3 caracteres do código ou e-mail.'
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!sponsorStatus.valid) {
      setError('Por favor, informe um patrocinador válido antes de continuar.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          password,
          sponsorIdentifier: sponsorIdentifier.trim()
        })
      });

      let data;
      try {
        const text = await res.text();
        data = text ? JSON.parse(text) : {};
      } catch {
        throw new Error(`Resposta inválida do servidor (HTTP ${res.status}). Verifique se o backend está rodando na porta 3001.`);
      }

      if (!res.ok) {
        throw new Error(data.error || 'Erro ao efetuar o cadastro.');
      }

      onRegisterSuccess(data.token, data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="glass-card auth-card">
        <div className="auth-header">
          <h2>Cadastro de Afiliado</h2>
          <p>Entre para a rede e comece a construir sua equipe</p>
        </div>

        {error && (
          <div className="sponsor-badge sponsor-badge-invalid" style={{ marginBottom: '1rem' }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Nome Completo</label>
            <div className="input-wrapper">
              <User className="input-icon" size={18} />
              <input
                type="text"
                className="form-input"
                placeholder="Ex: João da Silva"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Endereço de E-mail</label>
            <div className="input-wrapper">
              <Mail className="input-icon" size={18} />
              <input
                type="email"
                className="form-input"
                placeholder="seu.email@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Senha de Acesso</label>
            <div className="input-wrapper">
              <Lock className="input-icon" size={18} />
              <input
                type="password"
                className="form-input"
                placeholder="Crie uma senha segura"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
          </div>

          {/* CAMPO OBRIGATÓRIO DE PATROCINADOR COM VALIDAÇÃO EM TEMPO REAL */}
          <div className="form-group" style={{ marginTop: '1.5rem' }}>
            <label className="form-label" style={{ color: '#67e8f9', fontWeight: 700 }}>
              Quem te indicou? (Código ou E-mail do Patrocinador)*
            </label>
            <div className="input-wrapper">
              <UserCheck className="input-icon" size={18} style={{ color: 'var(--accent-cyan)' }} />
              <input
                type="text"
                className="form-input"
                style={{ borderColor: sponsorStatus.valid ? 'var(--accent-emerald)' : 'var(--border-color)' }}
                placeholder="Ex: ADMIN100 ou carlos@email.com"
                value={sponsorIdentifier}
                onChange={handleSponsorChange}
                required
              />
            </div>

            {/* Badge Dinâmica de Status do Patrocinador */}
            {sponsorStatus.loading ? (
              <div className="sponsor-badge sponsor-badge-loading">
                <Loader2 size={16} className="animate-spin" />
                <span>Verificando patrocinador no sistema...</span>
              </div>
            ) : sponsorStatus.valid ? (
              <div className="sponsor-badge sponsor-badge-valid">
                <CheckCircle2 size={18} />
                <span>{sponsorStatus.message}</span>
              </div>
            ) : sponsorIdentifier ? (
              <div className="sponsor-badge sponsor-badge-invalid">
                <AlertCircle size={18} />
                <span>{sponsorStatus.message}</span>
              </div>
            ) : null}
          </div>

          <button 
            type="submit" 
            className="btn-submit" 
            disabled={loading || !sponsorStatus.valid}
          >
            {loading ? 'Criando Conta...' : 'Concluir Cadastro na Rede'}
          </button>
        </form>

        <div className="auth-footer">
          Já possui um cadastro?{' '}
          <a href="#login" onClick={(e) => { e.preventDefault(); switchToLogin(); }}>
            Acesse seu painel
          </a>
        </div>
      </div>
    </div>
  );
}
