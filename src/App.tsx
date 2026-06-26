import { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Admin from './pages/Admin';

function AppContent() {
  const location = useLocation();
  const [adminPage, setAdminPage] = useState('dashboard');

  // Parse hash for admin navigation
  useEffect(() => {
    if (location.pathname.startsWith('/admin')) {
      const hash = window.location.hash.replace('#', '') || 'dashboard';
      setAdminPage(hash);
    }
  }, [location.pathname, location.hash]);

  // Listen for hash changes
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '') || 'dashboard';
      setAdminPage(hash);
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/admin/*" element={<Admin currentPage={adminPage} />} />
    </Routes>
  );
}

export default AppContent;
