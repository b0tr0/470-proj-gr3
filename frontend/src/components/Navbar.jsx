import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();

  // Clear authentication tokens on user logout
  const handleLogout = () => {
    localStorage.clear(); // Clear all localStorage items cleanly
    navigate('/');
  };

  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');

  // Intercept navigation to prevent non-authority users from accessing restricted tabs
  const handleAuthorityClick = (e, path) => {
    // Check all possible role variations safely
    const userRole = (userInfo.role || userInfo.userType || '').toString().toLowerCase().trim();
    const isAuthFlag = Boolean(userInfo.isAuthority);

    const isAuthorized = userRole === 'authority' || userRole === 'admin' || isAuthFlag;

    if (path === '/authority' && !isAuthorized) {
      e.preventDefault();
      alert('Access Denied: This page is reserved for Authority accounts only.');
    }
  };

  const navItems = [
    { name: 'Feed', path: '/feed' },
    { name: 'Fuel Map', path: '/fuel' },
    { name: 'Hazard Map', path: '/hazard' },
    { name: 'Forum', path: '/forum' },
    { name: 'TrendAnalysisChart', path: '/trend' },
    { name: 'Network', path: '/network' },
    { name: 'Authority', path: '/authority' }
  ];

  return (
    <header style={{
      backgroundColor: '#072415',
      borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
      padding: '16px 40px',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      width: '100%',
      boxSizing: 'border-box'
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
          <h1 style={{ color: '#ffffff', fontSize: '1.5rem', fontWeight: '800', margin: 0 }}>
            Traffic<span style={{ color: '#ef4444' }}>Alert•</span>
          </h1>
        </div>

        <nav style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={(e) => handleAuthorityClick(e, item.path)}
              style={({ isActive }) => ({
                color: '#ffffff',
                textDecoration: 'none',
                padding: '8px 18px',
                borderRadius: '8px',
                fontSize: '0.95rem',
                fontWeight: '600',
                backgroundColor: isActive ? '#ef4444' : 'transparent',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap'
              })}
            >
              {item.name}
            </NavLink>
          ))}
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexShrink: 0 }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            padding: '6px 14px',
            borderRadius: '20px',
            color: '#ffffff',
            fontSize: '0.9rem',
            fontWeight: '600'
          }}>
            <span>👤</span>
            <span>{userInfo.username || userInfo.name || 'Guest'}</span>
          </div>

          <button
            onClick={handleLogout}
            style={{
              backgroundColor: 'transparent',
              color: '#ef4444',
              border: '1px solid #ef4444',
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