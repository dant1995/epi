import React, { useState } from 'react';
import { Mail, Lock, LogIn, Sparkles, AlertCircle, Key, CheckCircle2, X } from 'lucide-react';

export default function Login({ onLoginSuccess, switchToRegister }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Estado del Modal "Olvidé mi contraseña"
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState('');
  const [resetSuccess, setResetSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      let data;
      try {
        const text = await res.text();
        data = text ? JSON.parse(text) : {};
      } catch {
        throw new Error(`Respuesta inválida del servidor (HTTP ${res.status}). Verifica que el backend esté ejecutándose en el puerto 3001.`);
      }

      if (!res.ok) {
        throw new Error(data.error || 'Error al iniciar sesión');
      }

      onLoginSuccess(data.token, data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setResetError('');
    setResetSuccess('');
    setResetLoading(true);

    if (newPassword.length < 6) {
      setResetError('La contraseña debe tener al menos 6 caracteres.');
      setResetLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail, newPassword })
      });

      let data;
      try {
        const text = await res.text();
        data = text ? JSON.parse(text) : {};
      } catch {
        throw new Error(`Respuesta inválida del servidor (HTTP ${res.status}). Verifica que el backend esté ejecutándose en el puerto 3001.`);
      }

      if (!res.ok) throw new Error(data.error || 'Error al redefinir la contraseña');

      setResetSuccess(data.message);
      setTimeout(() => {
        setEmail(resetEmail);
        setPassword(newPassword);
        setShowForgotModal(false);
        setResetSuccess('');
        setResetEmail('');
        setNewPassword('');
      }, 1800);
    } catch (err) {
      setResetError(err.message);
    } finally {
      setResetLoading(false);
    }
  };

  const fillDemoAccount = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('123456');
  };

  return (
    <div className="auth-wrapper">
      <div className="glass-card auth-card">
        <div className="auth-header">
          <h2>Accede a tu Cuenta</h2>
          <p>Administra tu red de afiliados y acompana tus referidos</p>
        </div>

        <div className="demo-box">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700 }}>
            <Sparkles size={16} style={{ color: 'var(--accent-cyan)' }} />
            <span>Accesos de Demostración (Contraseña: 123456):</span>
          </div>
          <div className="demo-pills">
            <button className="demo-pill" type="button" onClick={() => fillDemoAccount('admin@sistema.com')}>
              Admin Raiz
            </button>
            <button className="demo-pill" type="button" onClick={() => fillDemoAccount('carlos@email.com')}>
              Carlos (Nivel 1)
            </button>
            <button className="demo-pill" type="button" onClick={() => fillDemoAccount('bruno@email.com')}>
              Bruno (Nivel 2)
            </button>
          </div>
        </div>

        {error && (
          <div className="sponsor-badge sponsor-badge-invalid" style={{ marginBottom: '1rem' }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">E-mail</label>
            <div className="input-wrapper">
              <Mail className="input-icon" size={18} />
              <input
                type="email"
                className="form-input"
                placeholder="tu.email@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
              <label className="form-label" style={{ margin: 0 }}>Contraseña</label>
              <a
                href="#forgot-password"
                style={{ fontSize: '0.8rem', color: '#67e8f9', textDecoration: 'none' }}
                onClick={(e) => {
                  e.preventDefault();
                  setResetEmail(email);
                  setResetError('');
                  setResetSuccess('');
                  setShowForgotModal(true);
                }}
              >
                Olvidé mi contraseña
              </a>
            </div>
            <div className="input-wrapper">
              <Lock className="input-icon" size={18} />
              <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? 'Autenticando...' : 'Entrar al Panel'}
          </button>
        </form>

        <div className="auth-footer">
          ¿No tienes cuenta aún?{' '}
          <a href="#register" onClick={(e) => { e.preventDefault(); switchToRegister(); }}>
            Regístrate con un referido
          </a>
        </div>

        <a href="/vendas" className="btn-vendas">
          Conoce nuestros planes
        </a>
      </div>

      {/* MODAL DE RECUPERACIÓN DE CONTRASEÑA POR EL USUARIO */}
      {showForgotModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem'
        }}>
          <div className="glass-card" style={{ maxWidth: '420px', width: '100%', border: '1px solid var(--primary-glow)', background: '#0f172a' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
              <h3 style={{ color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.15rem' }}>
                <Key size={20} style={{ color: '#67e8f9' }} />
                Recuperar Contraseña
              </h3>
              <button type="button" className="nav-btn nav-btn-ghost" onClick={() => setShowForgotModal(false)}>
                <X size={18} />
              </button>
            </div>

            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '1.2rem' }}>
              Ingresa tu correo electrónico registrado y define una nueva contraseña para acceder a tu cuenta Epi.
            </p>

            {resetError && (
              <div className="sponsor-badge sponsor-badge-invalid" style={{ marginBottom: '1rem' }}>
                <AlertCircle size={16} />
                <span>{resetError}</span>
              </div>
            )}

            {resetSuccess && (
              <div className="sponsor-badge sponsor-badge-valid" style={{ marginBottom: '1rem' }}>
                <CheckCircle2 size={16} />
                <span>{resetSuccess}</span>
              </div>
            )}

            <form onSubmit={handleResetPassword}>
              <div className="form-group">
                <label className="form-label">Correo de la Cuenta</label>
                <div className="input-wrapper">
                  <Mail className="input-icon" size={18} />
                  <input
                    type="email"
                    className="form-input"
                    placeholder="tu.email@ejemplo.com"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Nueva Contraseña (mín. 6 caracteres)</label>
                <div className="input-wrapper">
                  <Lock className="input-icon" size={18} />
                  <input
                    type="password"
                    className="form-input"
                    placeholder="Tu nueva contraseña..."
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    minLength={6}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                <button type="button" className="nav-btn nav-btn-outline" onClick={() => setShowForgotModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="nav-btn nav-btn-primary" disabled={resetLoading}>
                  {resetLoading ? 'Redefiniendo...' : 'Confirmar Nueva Contraseña'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
