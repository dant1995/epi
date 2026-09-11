import React, { useState } from 'react';
import TermsModal from './TermsModal';

export default function Footer() {
  const [showTerms, setShowTerms] = useState(false);

  return (
    <>
      <footer className="app-footer">
        <span>© 2026 EPI. Todos los derechos reservados.</span>
        <button
          onClick={() => setShowTerms(true)}
          className="footer-terms-btn"
        >
          Términos y Condiciones de Uso y Compra
        </button>
      </footer>

      {showTerms && <TermsModal onClose={() => setShowTerms(false)} />}
    </>
  );
}
