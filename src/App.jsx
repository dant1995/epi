import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Login from './components/Login';
import Register from './components/Register';
import UserDashboard from './components/UserDashboard';
import AdminDashboard from './components/AdminDashboard';
import CoursesLms from './components/CoursesLms';
import TermsModal from './components/TermsModal';
import CompleteProfileModal from './components/CompleteProfileModal';
import ProfileModal from './components/ProfileModal';
import LandingPage from './components/LandingPage';
import PaymentPending from './components/PaymentPending';
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
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showCompleteProfile, setShowCompleteProfile] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Sincronizar URL con estado
  useEffect(() => {
    const path = window.location.pathname;
    if (activeTab === 'vendas' && path !== '/vendas') {
      window.history.pushState({}, '', '/vendas');
    } else if (activeTab !== 'vendas' && path === '/vendas') {
      window.history.pushState({}, '', '/');
    }
  }, [activeTab]);

  // Manejar retroceso/avance del navegador
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

  // Manejar acceso directo a /terms
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
      if (!currentUser.profile_completed) {
        setShowCompleteProfile(true);
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
    if (user && !user.profile_completed) {
      setShowCompleteProfile(true);
    }
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
          onOpenProfile={() => setShowProfileModal(true)}
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
        ) : currentUser?.account_status === 'pending' ? (
          <PaymentPending
            user={currentUser}
            payment={currentUser?.payment}
            onPaymentDone={handleLogout}
          />
        ) : (
          activeTab === 'admin' ? (
            <AdminDashboard token={token} />
          ) : activeTab === 'courses' ? (
            <CoursesLms token={token} currentUser={currentUser} />
          ) : (
            <UserDashboard token={token} onLogout={handleLogout} onNavigateTab={setActiveTab} />
          )
        )}
      </main>

      {showTermsModal && (
        <TermsModal onClose={() => setShowTermsModal(false)} />
      )}

      {showCompleteProfile && token && currentUser && (
        <CompleteProfileModal
          user={currentUser}
          token={token}
          onComplete={(updatedUser) => {
            setCurrentUser(updatedUser);
            localStorage.setItem('unilevel_user', JSON.stringify(updatedUser));
            setShowCompleteProfile(false);
          }}
        />
      )}

      {showProfileModal && token && currentUser && (
        <ProfileModal
          user={currentUser}
          token={token}
          onClose={() => setShowProfileModal(false)}
          onUpdate={(updatedUser) => {
            setCurrentUser(updatedUser);
            localStorage.setItem('unilevel_user', JSON.stringify(updatedUser));
          }}
        />
      )}

      {!isLandingPage && <Footer />}
    </div>
  );
}
