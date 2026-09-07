import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Login from './components/Login';
import Register from './components/Register';
import UserDashboard from './components/UserDashboard';
import AdminDashboard from './components/AdminDashboard';
import CoursesLms from './components/CoursesLms';
import SupabaseModal from './components/SupabaseModal';
import TermsModal from './components/TermsModal';
import LandingPage from './components/LandingPage';
import Footer from './components/Footer';
import './styles/main.css';

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('unilevel_token') || null);
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('unilevel_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [activeTab, setActiveTab] = useState(() => {
    const path = window.location.pathname;
    if (path === '/vendas') return 'vendas';
    return token ? 'dashboard' : 'login';
  });
  const [showSupabaseModal, setShowSupabaseModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  // Sync URL with state
  useEffect(() => {
    const path = window.location.pathname;
    if (activeTab === 'vendas' && path !== '/vendas') {
      window.history.pushState({}, '', '/vendas');
    } else if (activeTab !== 'vendas' && path === '/vendas') {
      window.history.pushState({}, '', '/');
    }
  }, [activeTab]);

  // Handle browser back/forward
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      if (path === '/vendas') {
        setActiveTab('vendas');
      } else if (path === '/terms') {
        setShowTermsModal(true);
      } else {
        if (activeTab === 'vendas') {
          setActiveTab(token ? 'dashboard' : 'login');
        }
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [token, activeTab]);

  // Handle /terms direct access
  useEffect(() => {
    if (window.location.pathname === '/terms') {
      setShowTermsModal(true);
      window.history.pushState({}, '', '/');
    }
  }, []);

  useEffect(() => {
    if (token && currentUser) {
      if (activeTab === 'login' || activeTab === 'register') {
        setActiveTab('dashboard');
      }
    } else {
      if (activeTab === 'dashboard' || activeTab === 'admin' || activeTab === 'courses') {
        setActiveTab('login');
      }
    }
  }, [token, currentUser]);

  const handleLoginSuccess = (newToken, user) => {
    setToken(newToken);
    setCurrentUser(user);
    localStorage.setItem('unilevel_token', newToken);
    localStorage.setItem('unilevel_user', JSON.stringify(user));
    setActiveTab('dashboard');
  };

  const handleLogout = () => {
    setToken(null);
    setCurrentUser(null);
    localStorage.removeItem('unilevel_token');
    localStorage.removeItem('unilevel_user');
    setActiveTab('login');
  };

  const handleLandingNavigate = (target) => {
    if (target === 'login') {
      setActiveTab('login');
      window.history.pushState({}, '', '/');
    } else if (target === 'register') {
      setActiveTab('register');
      window.history.pushState({}, '', '/');
    } else if (target === 'terms') {
      setShowTermsModal(true);
    }
  };

  const isLandingPage = activeTab === 'vendas';

  return (
    <div className="app-container">
      {!isLandingPage && (
        <Navbar
          currentUser={currentUser}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onLogout={handleLogout}
          onOpenSupabaseModal={() => setShowSupabaseModal(true)}
        />
      )}

      <main className={isLandingPage ? '' : 'main-content'}>
        {isLandingPage ? (
          <LandingPage onNavigate={handleLandingNavigate} />
        ) : !token ? (
          activeTab === 'register' ? (
            <Register
              onRegisterSuccess={handleLoginSuccess}
              switchToLogin={() => setActiveTab('login')}
            />
          ) : (
            <Login
              onLoginSuccess={handleLoginSuccess}
              switchToRegister={() => setActiveTab('register')}
            />
          )
        ) : (
          activeTab === 'admin' ? (
            <AdminDashboard token={token} />
          ) : activeTab === 'courses' ? (
            <CoursesLms token={token} />
          ) : (
            <UserDashboard token={token} onLogout={handleLogout} onNavigateTab={setActiveTab} />
          )
        )}
      </main>

      {showSupabaseModal && (
        <SupabaseModal onClose={() => setShowSupabaseModal(false)} />
      )}

      {showTermsModal && (
        <TermsModal onClose={() => setShowTermsModal(false)} />
      )}

      {!isLandingPage && <Footer />}
    </div>
  );
}
