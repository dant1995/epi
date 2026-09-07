import React from 'react';
import { Network, UserCheck, Shield, LogOut, Database, User, GraduationCap } from 'lucide-react';

export default function Navbar({ currentUser, activeTab, setActiveTab, onLogout, onOpenSupabaseModal }) {
  return (
    <nav className="navbar">
      <div className="logo-brand">
        <img src="/logo-epi.jpeg" alt="Epi Logo" style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover' }} />
        <span style={{ fontSize: '1.4rem', fontWeight: 800 }}>Epi</span>
      </div>

      {currentUser ? (
        <div className="nav-links">
          <button 
            className={`nav-btn ${activeTab === 'dashboard' ? 'nav-btn-primary' : 'nav-btn-ghost'}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <UserCheck size={16} /> Meu Painel
          </button>

          <button 
            className={`nav-btn ${activeTab === 'courses' ? 'nav-btn-primary' : 'nav-btn-ghost'}`}
            onClick={() => setActiveTab('courses')}
          >
            <GraduationCap size={16} /> Cursos LMS
          </button>

          {currentUser.role === 'admin' && (
            <button 
              className={`nav-btn ${activeTab === 'admin' ? 'nav-btn-primary' : 'nav-btn-ghost'}`}
              onClick={() => setActiveTab('admin')}
            >
              <Shield size={16} /> Painel Admin
            </button>
          )}

          <button 
            className="nav-btn nav-btn-outline"
            onClick={onOpenSupabaseModal}
            title="Ver instrução e script de Banco Supabase"
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

          <button className="nav-btn nav-btn-ghost" onClick={onLogout} title="Sair do sistema">
            <LogOut size={16} /> Sair
          </button>
        </div>
      ) : (
        <div className="nav-links">
          <button 
            className={`nav-btn ${activeTab === 'login' ? 'nav-btn-primary' : 'nav-btn-ghost'}`}
            onClick={() => setActiveTab('login')}
          >
            Entrar
          </button>
          <button 
            className={`nav-btn ${activeTab === 'register' ? 'nav-btn-primary' : 'nav-btn-outline'}`}
            onClick={() => setActiveTab('register')}
          >
            Cadastrar-se
          </button>
          <button 
            className="nav-btn nav-btn-outline"
            onClick={onOpenSupabaseModal}
          >
            <Database size={16} /> SQL Supabase
          </button>
        </div>
      )}
    </nav>
  );
}
