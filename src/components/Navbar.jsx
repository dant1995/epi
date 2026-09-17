import React, { useState } from 'react';
import { Network, UserCheck, Shield, LogOut, Database, User, GraduationCap, Menu, X } from 'lucide-react';

export default function Navbar({ currentUser, activeTab, setActiveTab, onLogout, onOpenSupabaseModal, onOpenProfile }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleNav = (tab) => {
    setActiveTab(tab);
    setMobileOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="logo-brand">
        <img src="/logo-epi.jpeg" alt="Epi Logo" style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover' }} />
        <span style={{ fontSize: '1.4rem', fontWeight: 800 }}>Epi</span>
        <button
          className="navbar-toggle"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Menu"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {currentUser ? (
        <div className={`nav-links ${mobileOpen ? 'nav-links-open' : ''}`}>
          <button
            className={`nav-btn ${activeTab === 'dashboard' ? 'nav-btn-primary' : 'nav-btn-ghost'}`}
            onClick={() => handleNav('dashboard')}
          >
            <UserCheck size={16} /> Mi Panel
          </button>

          <button
            className={`nav-btn ${activeTab === 'courses' ? 'nav-btn-primary' : 'nav-btn-ghost'}`}
            onClick={() => handleNav('courses')}
          >
            <GraduationCap size={16} /> Cursos LMS
          </button>

          {currentUser.role === 'admin' && (
            <button
              className={`nav-btn ${activeTab === 'admin' ? 'nav-btn-primary' : 'nav-btn-ghost'}`}
              onClick={() => handleNav('admin')}
            >
              <Shield size={16} /> Panel Admin
            </button>
          )}

          <button
            className="user-menu-badge"
            onClick={() => { if (onOpenProfile) onOpenProfile(); setMobileOpen(false); }}
            style={{ cursor: 'pointer', background: 'none', border: 'none', padding: '0.3rem 0.5rem', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'background 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}
          >
            <div className="user-avatar" style={{ overflow: 'hidden' }}>
              {currentUser.document_photo_url ? (
                <img src={currentUser.document_photo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'
              )}
            </div>
            <div style={{ lineHeight: 1.2 }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>{currentUser.name}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{currentUser.referral_code}</div>
            </div>
          </button>

          <button className="nav-btn nav-btn-ghost" onClick={() => { onLogout(); setMobileOpen(false); }} title="Salir del sistema">
            <LogOut size={16} /> Salir
          </button>
        </div>
      ) : (
        <div className={`nav-links ${mobileOpen ? 'nav-links-open' : ''}`}>
          <button
            className={`nav-btn ${activeTab === 'login' ? 'nav-btn-primary' : 'nav-btn-ghost'}`}
            onClick={() => handleNav('login')}
          >
            Iniciar sesión
          </button>
          <button
            className={`nav-btn ${activeTab === 'register' ? 'nav-btn-primary' : 'nav-btn-outline'}`}
            onClick={() => handleNav('register')}
          >
            Registrarse
          </button>
        </div>
      )}
    </nav>
  );
}
