import React, { useState, useEffect } from 'react';
import { User, Mail, Lock, UserCheck, CheckCircle2, AlertCircle, Loader2, Phone } from 'lucide-react';

export default function Register({ onRegisterSuccess, switchToLogin }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [sponsorIdentifier, setSponsorIdentifier] = useState('');
  
  // Estados de Validación del Patrocinador
  const [sponsorStatus, setSponsorStatus] = useState({
    loading: false,
    valid: false,
    sponsor: null,
    message: ''
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Capturar parámetro ?ref=CODIGO de la URL automáticamente
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

  // Función de Validación del Patrocinador vía API
  const validateSponsor = async (identifier, isUrlParam = false) => {
    if (!identifier || identifier.trim() === '') {
      setSponsorStatus({
        loading: false,
        valid: false,
        sponsor: null,
        message: 'El campo del patrocinador es obligatorio.'
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
          // Respaldo para ADMIN100 si el parámetro de la URL no es válido
          setSponsorIdentifier('ADMIN100');
          validateSponsor('ADMIN100', false);
        } else {
          setSponsorStatus({
            loading: false,
            valid: false,
            sponsor: null,
            message: data.message || 'Patrocinador no encontrado.'
          });
        }
      }
    } catch (err) {
      setSponsorStatus({
        loading: false,
        valid: false,
        sponsor: null,
        message: 'Error al conectar con el servidor para validar el patrocinador.'
      });
    }
  };


  // Handler de cambio en el campo del Patrocinador con debounce
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
        message: 'Ingrese al menos 3 caracteres del código o correo electrónico.'
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!sponsorStatus.valid) {
      setError('Por favor, ingrese un patrocinador válido antes de continuar.');
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
          phone,
          password,
          sponsorIdentifier: sponsorIdentifier.trim()
        })
      });

      let data;
      try {
        const text = await res.text();
        data = text ? JSON.parse(text) : {};
      } catch {
        throw new Error(`Respuesta inválida del servidor (HTTP ${res.status}). Verifique si el backend está ejecutándose en el puerto 3001.`);
      }

      if (!res.ok) {
        throw new Error(data.error || 'Error al realizar el registro.');
      }

      onRegisterSuccess(data.token, {
        ...data.user,
        account_status: data.account_status,
        payment: data.payment
      });
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
          <h2>Registro de Afiliado</h2>
          <p>Únete a la red y comienza a construir tu equipo</p>
        </div>

        {error && (
          <div className="sponsor-badge sponsor-badge-invalid" style={{ marginBottom: '1rem' }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Nombre Completo</label>
            <div className="input-wrapper">
              <User className="input-icon" size={18} />
              <input
                type="text"
                className="form-input"
                placeholder="Ej: Juan Pérez"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Correo Electrónico</label>
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
            <label className="form-label">Teléfono / WhatsApp</label>
            <div className="input-wrapper">
              <Phone className="input-icon" size={18} />
              <input
                type="tel"
                className="form-input"
                placeholder="Ej: +54 11 1234-5678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Contraseña de Acceso (mín. 6 caracteres)</label>
            <div className="input-wrapper">
              <Lock className="input-icon" size={18} />
              <input
                type="password"
                className="form-input"
                placeholder="Crea una contraseña segura"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
          </div>

          {/* CAMPO OBLIGATORIO DE PATROCINADOR CON VALIDACIÓN EN TIEMPO REAL */}
          <div className="form-group" style={{ marginTop: '1.5rem' }}>
            <label className="form-label" style={{ color: '#67e8f9', fontWeight: 700 }}>
              ¿Quién te refirió? (Código o Correo Electrónico del Patrocinador)*
            </label>
            <div className="input-wrapper">
              <UserCheck className="input-icon" size={18} style={{ color: 'var(--accent-cyan)' }} />
              <input
                type="text"
                className="form-input"
                style={{ borderColor: sponsorStatus.valid ? 'var(--accent-emerald)' : 'var(--border-color)' }}
                placeholder="Ej: ADMIN100 o carlos@email.com"
                value={sponsorIdentifier}
                onChange={handleSponsorChange}
                required
              />
            </div>

            {/* Badge Dinámica de Estado del Patrocinador */}
            {sponsorStatus.loading ? (
              <div className="sponsor-badge sponsor-badge-loading">
                <Loader2 size={16} className="animate-spin" />
                <span>Verificando patrocinador en el sistema...</span>
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
            {loading ? 'Creando Cuenta...' : 'Completar Registro en la Red'}
          </button>
        </form>

        <div className="auth-footer">
          ¿Ya tienes una cuenta?{' '}
          <a href="#login" onClick={(e) => { e.preventDefault(); switchToLogin(); }}>
            Accede a tu panel
          </a>
        </div>
      </div>
    </div>
  );
}
