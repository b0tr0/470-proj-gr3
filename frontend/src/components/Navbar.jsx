import React, { useState, useEffect, useCallback } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import API from '../api';
import TrustBadge from './TrustBadge';
import NotificationDropdown from './NotificationDropdown';

const Navbar = () => {
  const navigate = useNavigate();

  const [theme, setTheme] = useState(() => localStorage.getItem('app-theme') || 'dark');
  const [userInfo, setUserInfo] = useState(() => JSON.parse(localStorage.getItem('userInfo') || '{}'));

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('app-theme', theme);
  }, [theme]);

  // Fetch live user profile, role, and score
  const fetchLiveUser = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const { data } = await API.get('/auth/me');
      if (data) {
        setUserInfo((prev) => {
          const updated = { ...prev, ...data, trustScore: data.trustScore ?? 100 };
          localStorage.setItem('userInfo', JSON.stringify(updated));
          return updated;
        });
      }
    } catch (err) {
      console.error('Failed to sync live trust score:', err);
    }
  }, []);

  useEffect(() => {
    fetchLiveUser();

    // Listen to custom window events triggered after voting
    const handleScoreUpdate = () => fetchLiveUser();
    window.addEventListener('trustScoreUpdated', handleScoreUpdate);
    return () => window.removeEventListener('trustScoreUpdated', handleScoreUpdate);
  }, [fetchLiveUser]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userInfo');
    navigate('/');
  };

  // Strictly check if user is Official Authority or Admin (Excludes Moderator)
  const userRole = (userInfo.role || userInfo.userType || '').toString().toLowerCase().trim();
  const isAuthFlag = Boolean(userInfo.isAuthority);
  const isAuthorityUser = userRole === 'authority' || userRole === 'admin' || isAuthFlag;

  const navItems = [
    { name: 'Feed', path: '/feed' },
    { name: 'Fuel Map', path: '/fuel' },
    { name: 'Hazard Map', path: '/hazard' },
    { name: 'Forum', path: '/forum' },
    { name: 'TrendAnalysisChart', path: '/trend' },
    { name: 'Network', path: '/network' },
  ];

  // Only append Authority panel tab if user is Authority or Admin
  if (isAuthorityUser) {
    navItems.push({ name: 'Authority', path: '/authority' });
  }

  return (
    <header style={{
      backgroundColor: 'var(--bg-secondary)',
      borderBottom: '1px solid var(--border-color)',
      padding: '16px 40px',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      width: '100%',
      boxSizing: 'border-box',
      transition: 'background-color 0.3s ease, border-color 0.3s ease'
    }}>
      <div style={{
        maxWidth: '1500px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%'
      }}>
        <div onClick={() => navigate('/feed')} style={{ cursor: 'pointer', flexShrink: 0 }}>
          <h1 style={{ color: 'var(--text-primary)', fontSize: '1.5rem', fontWeight: '800', margin: 0 }}>
            Traffic<span style={{ color: 'var(--accent-red)' }}>Alert•</span>
          </h1>
        </div>

        <nav style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              style={({ isActive }) => ({
                color: isActive ? '#ffffff' : 'var(--text-primary)',
                textDecoration: 'none',
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '0.95rem',
                fontWeight: '600',
                backgroundColor: isActive ? 'var(--accent-red)' : 'transparent',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap'
              })}
            >
              {item.name}
            </NavLink>
          ))}
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
          {/* Notification Dropdown Component */}
          <NotificationDropdown />

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            style={{
              backgroundColor: 'var(--badge-user-bg)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-color)',
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '0.85rem',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s ease'
            }}
            title="Toggle Light/Dark Theme"
          >
            {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
          </button>

          {/* User Display with Role-Aware Authority / Moderator / Trust Badge */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'var(--badge-user-bg)',
            padding: '6px 14px',
            borderRadius: '20px',
            color: 'var(--text-primary)',
            fontSize: '0.9rem',
            fontWeight: '600',
            border: '1px solid var(--border-color)'
          }}>
            <span>👤</span>
            <span>{userInfo.username || userInfo.name || 'Guest'}</span>
            <TrustBadge score={userInfo.trustScore ?? 100} role={userInfo.role} />
          </div>

          <button
            onClick={handleLogout}
            style={{
              backgroundColor: 'transparent',
              color: 'var(--accent-red)',
              border: '1px solid var(--accent-red)',
              padding: '6px 16px',
              borderRadius: '8px',
              fontSize: '0.9rem',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;