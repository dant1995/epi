import React, { useState } from 'react';
import TermsModal from './TermsModal';

export default function Footer() {
  const [showTerms, setShowTerms] = useState(false);

  return (
    <>
      <footer style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'rgba(15, 23, 42, 0.95)',
        backdropFilter: 'blur(12px)',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        padding: '0.75rem 1.5rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 100,
        fontSize: '0.8rem',
        color: 'var(--text-muted)'
      }}>
        <span>© 2026 EPI. Todos los derechos reservados.</span>
        <button
          onClick={() => setShowTerms(true)}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--accent-cyan)',
            cursor: 'pointer',
            fontSize: '0.8rem',
            textDecoration: 'underline',
            textUnderlineOffset: '3px',
            transition: 'color 0.2s'
          }}
          onMouseEnter={e => e.target.style.color = '#67e8f9'}
          onMouseLeave={e => e.target.style.color = 'var(--accent-cyan)'}
        >
          Términos y Condiciones de Uso y Compra
        </button>
      </footer>

      {showTerms && <TermsModal onClose={() => setShowTerms(false)} />}
    </>
  );
}
