import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('userInfo'));

  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    navigate('/');
  };

  if (!user) return null;

  return (
    <nav className="bg-slate-800 text-white shadow-md">
      <div className="mx-auto max-w-6xl px-4 flex h-16 items-center justify-between">
        <Link to="/feed" className="text-xl font-bold tracking-wide text-blue-400">🚨 TrafficAlert</Link>
        
        <div className="flex items-center space-x-6">
          <Link to="/feed" className="hover:text-blue-300 transition">Newsfeed</Link>
          <Link to="/fuel" className="hover:text-blue-300 transition">⛽ Fuel Map</Link>
          <Link to="/hazards" className="hover:text-blue-300 transition">🚧 Hazard Map</Link>

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
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;