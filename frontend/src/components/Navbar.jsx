import React from 'react';
<<<<<<< HEAD
import { NavLink, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
=======
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('userInfo'));
>>>>>>> origin/main

  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    navigate('/');
  };

<<<<<<< HEAD
  const userInfo = JSON.parse(localStorage.getItem('userInfo')) || { name: 'demo' };

  const navItems = [
    { name: 'Feed', path: '/feed' },
    { name: 'Fuel Map', path: '/fuel' },
    { name: 'Hazard Map', path: '/hazards' },
    { name: 'Forum', path: '/forum' },
    { name: 'Trends', path: '/trend' },
    { name: 'Network', path: '/network' },
    { name: 'Authority', path: '/authority' },
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
        {/* Logo */}
        <div onClick={() => navigate('/feed')} style={{ cursor: 'pointer', flexShrink: 0 }}>
          <h1 style={{ color: '#ffffff', fontSize: '1.5rem', fontWeight: '800', margin: 0 }}>
            Traffic<span style={{ color: '#ef4444' }}>Alert•</span>
          </h1>
        </div>

        {/* Center Links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
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

        {/* User Profile & Logout */}
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
            <span>{userInfo.name || 'demo'}</span>
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
=======
  if (!user) return null;

  return (
    <nav className="bg-slate-800 text-white shadow-md">
      <div className="mx-auto max-w-6xl px-4 flex h-16 items-center justify-between">
        <Link to="/feed" className="text-xl font-bold tracking-wide text-blue-400">🚨 TrafficAlert</Link>
        
        <div className="flex items-center space-x-6">
          <Link to="/feed" className="hover:text-blue-300 transition">Newsfeed</Link>
          <Link to="/fuel" className="hover:text-blue-300 transition">⛽ Fuel Map</Link>
          
          <div className="flex items-center space-x-3 bg-slate-700 px-3 py-1.5 rounded-lg border border-slate-600">
            <span className="text-sm font-medium">{user.username}</span>
            <span className={`text-xs px-2 py-0.5 rounded font-bold uppercase ${
              user.role === 'authority' ? 'bg-red-500 text-white' : 
              user.role === 'moderator' ? 'bg-amber-500 text-slate-900' : 'bg-blue-500 text-white'
            }`}>
              {user.role}
            </span>
          </div>

          <button onClick={handleLogout} className="rounded bg-slate-600 px-3 py-1 text-sm hover:bg-red-600 transition">
>>>>>>> origin/main
            Logout
          </button>
        </div>
      </div>
<<<<<<< HEAD
    </header>
=======
    </nav>
>>>>>>> origin/main
  );
};

export default Navbar;