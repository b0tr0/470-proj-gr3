import 'leaflet/dist/leaflet.css';
import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';

// Components
import Navbar from './components/Navbar';
import AIChatbot from './components/AIChatbot';
import NotificationSystem from './components/NotificationSystem';
import Forum from './components/Forum';
import FriendList from './components/FriendList';
import TrendAnalysisChart from './components/TrendAnalysisChart';
import UserNetwork from './components/UserNetwork';
import ProtectedRoute from './components/ProtectedRoute';
import SOSButton from './components/SOSButton';

// Pages
import Auth from './pages/Auth';
import AuthorityDashboard from './pages/AuthorityDashboard';
import Feed from './pages/Feed';
import Fuel from './pages/Fuel';
import HazardMap from './pages/HazardMap';

export default function App() {
  const location = useLocation();
  const isAuthPage = location.pathname === '/';

  return (
    <div style={{ backgroundColor: '#062319', color: '#ffffff', minHeight: '100vh', width: '100vw', overflowX: 'hidden' }}>
      
      {/* Navbar and Notification system */}
      {!isAuthPage && (
        <>
          <div style={{ position: 'sticky', top: 0, zIndex: 9999, width: '100%' }}>
            <Navbar />
          </div>
          <NotificationSystem />
        </>
      )}

      {/* Main Pages */}
      <main style={{ minHeight: '80vh' }}>
        <Routes>
          <Route path="/" element={<Auth />} />
          <Route path="/feed" element={<ProtectedRoute><Feed /></ProtectedRoute>} />
          <Route path="/fuel" element={<ProtectedRoute><Fuel /></ProtectedRoute>} />
          <Route path="/hazard" element={<ProtectedRoute><HazardMap /></ProtectedRoute>} />
          <Route path="/hazards" element={<ProtectedRoute><HazardMap /></ProtectedRoute>} />
          <Route path="/forum" element={<ProtectedRoute><Forum /></ProtectedRoute>} />
          <Route path="/trend" element={<ProtectedRoute><TrendAnalysisChart /></ProtectedRoute>} />
          <Route path="/trends" element={<ProtectedRoute><TrendAnalysisChart /></ProtectedRoute>} />
          <Route path="/network" element={<ProtectedRoute><UserNetwork /></ProtectedRoute>} />
          <Route path="/friends" element={<ProtectedRoute><FriendList /></ProtectedRoute>} />
          <Route path="/authority" element={<ProtectedRoute><AuthorityDashboard /></ProtectedRoute>} />
        </Routes>
      </main>

      {/* Emergency SOS Distress Beacon (Bottommost: 24px) */}
      {!isAuthPage && <SOSButton />}

      {/* AI Assistant Chatbot (Stacked directly above SOS: 96px) */}
      <div style={{ position: 'fixed', bottom: '96px', right: '24px', zIndex: 99999 }}>
        <AIChatbot />
      </div>
    </div>
  );
}