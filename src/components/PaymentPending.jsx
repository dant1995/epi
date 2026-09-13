import React from 'react';
import { ExternalLink, CreditCard, Clock, ArrowRight } from 'lucide-react';

export default function PaymentPending({ user, payment, onPaymentDone }) {
  return (
    <div style={{
      minHeight: '60vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem'
    }}>
      <div className="glass-card" style={{ maxWidth: 520, width: '100%', textAlign: 'center', padding: '2.5rem' }}>
        <div style={{
          width: 64, height: 64, borderRadius: '50%',
          background: 'rgba(251, 191, 36, 0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 1.5rem'
        }}>
          <Clock size={32} style={{ color: '#fbbf24' }} />
        </div>

        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', marginBottom: '0.5rem' }}>
          Tu cuenta está pendiente de activación
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
          Hola <strong style={{ color: '#fff' }}>{user?.name}</strong>, para acceder a la plataforma necesitas completar el pago de la tasa de registro.
        </p>

        <div style={{
          background: 'rgba(255,255,255,0.05)',
          borderRadius: 12, padding: '1.2rem', marginBottom: '1.5rem',
          border: '1px solid rgba(255,255,255,0.1)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Tasa de Registro</span>
            <span style={{ color: '#fff', fontWeight: 700 }}>${payment?.amount || 80}.00 USD</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-muted)' }}>Ciclo inicial</span>
            <span style={{ color: '#fff', fontWeight: 600 }}>Socio Bronce</span>
          </div>
        </div>

        {payment?.checkout_url ? (
          <a
            href={payment.checkout_url}
            target="_blank"
            rel="noopener noreferrer"
            className="nav-btn nav-btn-primary"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
              padding: '0.9rem 1.5rem', fontSize: '1rem', fontWeight: 700,
              textDecoration: 'none', cursor: 'pointer', width: '100%'
            }}
          >
            <CreditCard size={20} />
            Pagar ahora con Hotmart
            <ExternalLink size={16} />
          </a>
        ) : (
          <div style={{ padding: '1rem', background: 'rgba(239,68,68,0.1)', borderRadius: 8, border: '1px solid rgba(239,68,68,0.3)' }}>
            <p style={{ color: '#f87171', fontSize: '0.85rem', margin: 0 }}>
              Link de pago no configurado. Contacta al administrador.
            </p>
          </div>
        )}

        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '1.2rem' }}>
          Una vez que el pago sea confirmado (automático vía Hotmart), tu cuenta se activará y podrás acceder a la plataforma.
        </p>

        {onPaymentDone && (
          <button
            onClick={onPaymentDone}
            className="nav-btn"
            style={{
              marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: '0.4rem', margin: '1rem auto 0', cursor: 'pointer', color: 'var(--text-muted)'
            }}
          >
            Ya pagué — Verificar activación
            <ArrowRight size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
