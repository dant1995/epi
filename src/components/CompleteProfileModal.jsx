import React, { useState } from 'react';
import { X, Phone, Calendar, Globe, FileText, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

const countries = [
  'Argentina', 'Bolivia', 'Brasil', 'Chile', 'Colombia', 'Costa Rica', 'Cuba',
  'Ecuador', 'El Salvador', 'España', 'Guatemala', 'Honduras', 'México',
  'Nicaragua', 'Panamá', 'Paraguay', 'Perú', 'Puerto Rico', 'República Dominicana',
  'Uruguay', 'Venezuela', 'Estados Unidos', 'Canadá', 'Guinea Ecuatorial', 'Otro'
];

export default function CompleteProfileModal({ user, token, onComplete }) {
  const [phone, setPhone] = useState(user?.phone || '');
  const [dateOfBirth, setDateOfBirth] = useState(user?.date_of_birth || '');
  const [country, setCountry] = useState(user?.country || '');
  const [docPhoto, setDocPhoto] = useState(null);
  const [docPreview, setDocPreview] = useState(user?.document_photo_url || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setDocPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => setDocPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!phone || !dateOfBirth || !country) {
      setError('Todos los campos son obligatorios.');
      return;
    }

    setLoading(true);

    try {
      let documentPhotoUrl = docPreview || '';

      if (docPhoto) {
        const reader = new FileReader();
        documentPhotoUrl = await new Promise((resolve) => {
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(docPhoto);
        });
      }

      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          phone,
          date_of_birth: dateOfBirth,
          country,
          document_photo_url: documentPhotoUrl
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Error al actualizar el perfil.');
      }

      setSuccess(true);
      setTimeout(() => {
        onComplete(data.user);
      }, 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)',
      backdropFilter: 'blur(8px)', zIndex: 9999,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #1a2540 0%, #0f172a 100%)',
        border: '1px solid rgba(99,102,241,0.3)', borderRadius: '18px',
        width: '100%', maxWidth: '480px', maxHeight: '90vh', overflow: 'auto',
        padding: '2rem'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ color: '#fff', fontSize: '1.3rem', fontWeight: 800, margin: 0 }}>
            Completar Registro
          </h2>
        </div>

        <p style={{ color: '#94a3b8', fontSize: '0.88rem', marginBottom: '1.5rem', lineHeight: 1.6 }}>
          Para acceder a todas las funcionalidades, por favor completá tu perfil con los siguientes datos.
        </p>

        {success ? (
          <div style={{ textAlign: 'center', padding: '2rem 0' }}>
            <CheckCircle2 size={48} style={{ color: '#34d399', marginBottom: '1rem' }} />
            <h3 style={{ color: '#fff', fontSize: '1.1rem' }}>¡Perfil completado!</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '0.5rem' }}>Redirigiendo al panel...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {error && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.3)',
                borderRadius: '10px', padding: '0.75rem 1rem', marginBottom: '1rem',
                color: '#f87171', fontSize: '0.85rem'
              }}>
                <AlertCircle size={16} /> {error}
              </div>
            )}

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                Teléfono / WhatsApp
              </label>
              <div style={{ position: 'relative' }}>
                <Phone size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+54 11 1234-5678"
                  required
                  style={{
                    width: '100%', padding: '0.7rem 0.75rem 0.7rem 2.2rem',
                    borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)',
                    background: 'rgba(255,255,255,0.05)', color: '#fff',
                    fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                Fecha de Nacimiento
              </label>
              <div style={{ position: 'relative' }}>
                <Calendar size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                <input
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  required
                  style={{
                    width: '100%', padding: '0.7rem 0.75rem 0.7rem 2.2rem',
                    borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)',
                    background: 'rgba(255,255,255,0.05)', color: '#fff',
                    fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                País de Residencia
              </label>
              <div style={{ position: 'relative' }}>
                <Globe size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  required
                  style={{
                    width: '100%', padding: '0.7rem 0.75rem 0.7rem 2.2rem',
                    borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)',
                    background: 'rgba(255,255,255,0.05)', color: '#fff',
                    fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box',
                    appearance: 'none'
                  }}
                >
                  <option value="" style={{ background: '#0f172a' }}>Seleccionar país...</option>
                  {countries.map(c => (
                    <option key={c} value={c} style={{ background: '#0f172a' }}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                Foto del Documento (DNI, Pasaporte, etc.)
              </label>
              <div style={{
                border: '2px dashed rgba(255,255,255,0.12)', borderRadius: '12px',
                padding: '1.5rem', textAlign: 'center', cursor: 'pointer',
                background: 'rgba(255,255,255,0.02)', position: 'relative'
              }}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
                />
                {docPreview ? (
                  <img src={docPreview} alt="Documento" style={{ maxWidth: '100%', maxHeight: '150px', borderRadius: '8px' }} />
                ) : (
                  <>
                    <FileText size={32} style={{ color: '#64748b', marginBottom: '0.5rem' }} />
                    <p style={{ color: '#64748b', fontSize: '0.82rem', margin: 0 }}>
                      Click para subir una imagen
                    </p>
                  </>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '0.8rem', borderRadius: '12px', border: 'none',
                background: 'linear-gradient(135deg, #6366f1, #4f46e5)', color: '#fff',
                fontWeight: 700, fontSize: '0.95rem', cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1, display: 'flex', alignItems: 'center',
                justifyContent: 'center', gap: '0.5rem'
              }}
            >
              {loading ? <><Loader2 size={18} className="animate-spin" /> Guardando...</> : 'Completar Registro'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
