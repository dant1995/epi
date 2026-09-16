import React, { useState } from 'react';
import { X, User, Mail, Phone, Calendar, Globe, FileText, Shield, Copy, Check, Edit3, Save, Loader2, AlertCircle, MapPin, Camera } from 'lucide-react';

const countries = [
  'Argentina', 'Bolivia', 'Brasil', 'Chile', 'Colombia', 'Costa Rica', 'Cuba',
  'Ecuador', 'El Salvador', 'España', 'Guatemala', 'Honduras', 'México',
  'Nicaragua', 'Panamá', 'Paraguay', 'Perú', 'Puerto Rico', 'República Dominicana',
  'Uruguay', 'Venezuela', 'Estados Unidos', 'Canadá', 'Guinea Ecuatorial', 'Otro'
];

export default function ProfileModal({ user, token, onClose, onUpdate }) {
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [copied, setCopied] = useState(false);

  const [phone, setPhone] = useState(user?.phone || '');
  const [dateOfBirth, setDateOfBirth] = useState(user?.date_of_birth || '');
  const [country, setCountry] = useState(user?.country || '');
  const [shippingAddress, setShippingAddress] = useState(user?.shipping_address || '');
  const [docPhoto, setDocPhoto] = useState(null);
  const [docPreview, setDocPreview] = useState(user?.document_photo_url || '');

  const handleCopy = () => {
    navigator.clipboard.writeText(user.referral_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyLink = () => {
    const link = `${window.location.origin}/?ref=${user.referral_code}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setDocPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => setDocPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setError('');
    setSuccess('');
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
        body: JSON.stringify({ phone, date_of_birth: dateOfBirth, country, shipping_address: shippingAddress, document_photo_url: documentPhotoUrl })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al guardar.');

      setSuccess('Perfil actualizado correctamente.');
      setEditing(false);
      if (onUpdate) onUpdate(data.user);
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
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <User size={20} style={{ color: '#818cf8' }} /> Mi Perfil
          </h2>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '8px', color: '#94a3b8', cursor: 'pointer', padding: '0.4rem', display: 'flex' }}>
            <X size={20} />
          </button>
        </div>

        {/* Avatar + Name */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{
            width: '72px', height: '72px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 0.75rem', fontSize: '1.8rem', fontWeight: 800, color: '#fff',
            position: 'relative', overflow: 'hidden'
          }}>
            {docPreview ? (
              <img src={docPreview} alt="Foto" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              user.name ? user.name.charAt(0).toUpperCase() : 'U'
            )}
          </div>
          <h3 style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>{user.name}</h3>
          <span style={{ fontSize: '0.78rem', color: '#64748b' }}>{user.email}</span>
        </div>

        {/* Photo Upload */}
        {editing && (
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#94a3b8', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.4rem' }}>
              <Camera size={14} /> Foto de Perfil
            </label>
            <div style={{
              border: '2px dashed rgba(255,255,255,0.12)', borderRadius: '12px',
              padding: '1rem', textAlign: 'center', cursor: 'pointer',
              background: 'rgba(255,255,255,0.02)', position: 'relative'
            }}>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
              />
              {docPreview ? (
                <img src={docPreview} alt="Vista previa" style={{ maxWidth: '100%', maxHeight: '120px', borderRadius: '8px' }} />
              ) : (
                <>
                  <Camera size={28} style={{ color: '#64748b', marginBottom: '0.4rem' }} />
                  <p style={{ color: '#64748b', fontSize: '0.8rem', margin: 0 }}>
                    Click para subir una imagen
                  </p>
                </>
              )}
            </div>
          </div>
        )}

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

        {success && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)',
            borderRadius: '10px', padding: '0.75rem 1rem', marginBottom: '1rem',
            color: '#34d399', fontSize: '0.85rem'
          }}>
            <Check size={16} /> {success}
          </div>
        )}

        {/* Info Fields */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
          {/* Name */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.7rem 1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <User size={16} style={{ color: '#818cf8', flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>Nombre</div>
              <div style={{ fontSize: '0.88rem', color: '#fff' }}>{user.name}</div>
            </div>
          </div>

          {/* Email */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.7rem 1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <Mail size={16} style={{ color: '#818cf8', flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>Correo</div>
              <div style={{ fontSize: '0.88rem', color: '#fff' }}>{user.email}</div>
            </div>
          </div>

          {/* Phone */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.7rem 1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <Phone size={16} style={{ color: '#818cf8', flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>Teléfono</div>
              {editing ? (
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                  style={{ width: '100%', background: 'transparent', border: 'none', color: '#fff', fontSize: '0.88rem', outline: 'none', padding: 0 }} />
              ) : (
                <div style={{ fontSize: '0.88rem', color: phone ? '#fff' : '#64748b' }}>{phone || 'No registrado'}</div>
              )}
            </div>
          </div>

          {/* Date of Birth */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.7rem 1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <Calendar size={16} style={{ color: '#818cf8', flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>Fecha de Nacimiento</div>
              {editing ? (
                <input type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)}
                  style={{ width: '100%', background: 'transparent', border: 'none', color: '#fff', fontSize: '0.88rem', outline: 'none', padding: 0 }} />
              ) : (
                <div style={{ fontSize: '0.88rem', color: dateOfBirth ? '#fff' : '#64748b' }}>{dateOfBirth || 'No registrado'}</div>
              )}
            </div>
          </div>

          {/* Country */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.7rem 1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <Globe size={16} style={{ color: '#818cf8', flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>País</div>
              {editing ? (
                <select value={country} onChange={(e) => setCountry(e.target.value)}
                  style={{ width: '100%', background: 'transparent', border: 'none', color: '#fff', fontSize: '0.88rem', outline: 'none', padding: 0 }}>
                  <option value="" style={{ background: '#0f172a' }}>Seleccionar...</option>
                  {countries.map(c => <option key={c} value={c} style={{ background: '#0f172a' }}>{c}</option>)}
                </select>
              ) : (
                <div style={{ fontSize: '0.88rem', color: country ? '#fff' : '#64748b' }}>{country || 'No registrado'}</div>
              )}
            </div>
          </div>

          {/* Shipping Address */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.7rem 1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', border: shippingAddress ? '1px solid rgba(16,185,129,0.3)' : '1px solid rgba(255,255,255,0.06)' }}>
            <MapPin size={16} style={{ color: shippingAddress ? '#34d399' : '#818cf8', flexShrink: 0, marginTop: '0.2rem' }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>
                Dirección de Envío {shippingAddress && <span style={{ color: '#34d399' }}>✓ Registrada</span>}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#fbbf24', marginBottom: '0.3rem' }}>
                Necesaria para recibir productos físicos (ciclos Ouro+)
              </div>
              {editing ? (
                <textarea
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  placeholder="Calle, número, código postal, ciudad, país..."
                  rows={3}
                  style={{ width: '100%', background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', fontSize: '0.85rem', outline: 'none', padding: '0.5rem', resize: 'vertical', fontFamily: 'inherit' }}
                />
              ) : (
                <div style={{ fontSize: '0.85rem', color: shippingAddress ? '#fff' : '#64748b', whiteSpace: 'pre-wrap' }}>
                  {shippingAddress || 'Sin dirección registrada — complete este campo para recibir productos físicos'}
                </div>
              )}
            </div>
          </div>

          {/* Role */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.7rem 1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <Shield size={16} style={{ color: '#fbbf24', flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>Rol</div>
              <div style={{ fontSize: '0.88rem', color: '#fff', textTransform: 'capitalize' }}>{user.role || 'user'}</div>
            </div>
          </div>

          {/* Referral Code */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.7rem 1rem', background: 'rgba(99,102,241,0.08)', borderRadius: '10px', border: '1px solid rgba(99,102,241,0.2)' }}>
            <Copy size={16} style={{ color: '#818cf8', flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>Código de Referido</div>
              <div style={{ fontSize: '0.88rem', color: '#818cf8', fontWeight: 700 }}>{user.referral_code}</div>
            </div>
            <button onClick={handleCopy} style={{ background: 'rgba(99,102,241,0.15)', border: 'none', borderRadius: '8px', color: '#818cf8', cursor: 'pointer', padding: '0.4rem', display: 'flex' }}>
              {copied ? <Check size={16} /> : <Copy size={16} />}
            </button>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {editing ? (
            <>
              <button onClick={() => setEditing(false)} style={{
                flex: 1, padding: '0.7rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.12)',
                background: 'transparent', color: '#94a3b8', fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer'
              }}>
                Cancelar
              </button>
              <button onClick={handleSave} disabled={loading} style={{
                flex: 1, padding: '0.7rem', borderRadius: '12px', border: 'none',
                background: 'linear-gradient(135deg, #6366f1, #4f46e5)', color: '#fff',
                fontWeight: 700, fontSize: '0.88rem', cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem'
              }}>
                {loading ? <><Loader2 size={16} className="animate-spin" /> Guardando...</> : <><Save size={16} /> Guardar</>}
              </button>
            </>
          ) : (
            <button onClick={() => setEditing(true)} style={{
              flex: 1, padding: '0.7rem', borderRadius: '12px', border: 'none',
              background: 'linear-gradient(135deg, #6366f1, #4f46e5)', color: '#fff',
              fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem'
            }}>
              <Edit3 size={16} /> Editar Perfil
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
