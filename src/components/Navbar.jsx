import React, { useState } from 'react';
import { Network, UserCheck, Shield, LogOut, Database, User, GraduationCap, Menu, X } from 'lucide-react';

export default function Navbar({ currentUser, activeTab, setActiveTab, onLogout, onOpenSupabaseModal }) {
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
            className="nav-btn nav-btn-outline"
            onClick={() => { onOpenSupabaseModal(); setMobileOpen(false); }}
            title="Ver instrucción y script de Base de Datos Supabase"
          >
            <Database size={16} /> Supabase SQL
          </button>

          <div className="user-menu-badge">
            <div className="user-avatar">
              {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div style={{ lineHeight: 1.2 }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>{currentUser.name}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{currentUser.referral_code}</div>
            </div>
          </div>

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
          <button
            className="nav-btn nav-btn-outline"
            onClick={() => { onOpenSupabaseModal(); setMobileOpen(false); }}
          >
            <Database size={16} /> SQL Supabase
          </button>
        </div>
      )}
    </nav>
  );
}
