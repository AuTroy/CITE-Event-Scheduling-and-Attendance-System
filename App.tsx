import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Auth from './pages/Auth';
import StudentDashboard from './pages/StudentDashboard';
import FacultyDashboard from './pages/FacultyDashboard';
import { User, UserType } from './types';
import { MockAPI } from './services/mockBackend';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState<'landing' | 'auth' | 'dashboard'>('landing');

  useEffect(() => {
    // Check for persisted session
    const currentUser = MockAPI.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      setCurrentPage('dashboard');
    }
  }, []);

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    MockAPI.logout();
    setUser(null);
    setCurrentPage('landing');
  };

  const renderContent = () => {
    if (currentPage === 'landing') {
      return <Landing onGetStarted={() => setCurrentPage('auth')} />;
    }
    
    if (currentPage === 'auth') {
      return <Auth onLoginSuccess={handleLogin} />;
    }

    if (currentPage === 'dashboard' && user) {
      if (user.role === UserType.STUDENT) {
        return <StudentDashboard user={user} />;
      } else {
        return <FacultyDashboard user={user} />;
      }
    }

    return null;
  };

  return (
    <Layout user={user} onLogout={handleLogout}>
      {renderContent()}
    </Layout>
  );
};

export default App;