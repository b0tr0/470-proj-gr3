import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';

// Base Components
import Navbar from './components/Navbar';

// Base Pages
import Auth from './pages/Auth';
import Feed from './pages/Feed';
import Fuel from './pages/Fuel';
import HazardMap from './pages/HazardMap';
import AuthorityDashboard from './pages/AuthorityDashboard';

// Components used as Pages / Widgets
import AIChatbot from './components/AIChatbot';
import Forum from './components/Forum';
import NotificationSystem from './components/NotificationSystem';
import ReportForm from './components/ReportForm';
import TrendAnalysisChart from './components/TrendAnalysisChart';
import UserNetwork from './components/UserNetwork';

// Temporary bypass for testing
const ProtectedRoute = ({ children }) => {
  return children;
};

// Layout Component to conditionally show Navbar & Notifications
const MainLayout = ({ children }) => {
  const location = useLocation();
  const isAuthPage = location.pathname === '/';

  return (
    <div className="min-h-screen bg-gray-100 relative">
      {/* Auth PAGE FIX */}
      {!isAuthPage && <Navbar />}
      {!isAuthPage && <NotificationSystem />}

      {children}

      {/* AI Chatbot Widget */}
      <AIChatbot />
    </div>
  );
};

function App() {
  return (
    <Router>
      <MainLayout>
        <Routes>
          {/* Public Auth Route */}
          <Route path="/" element={<Auth />} />

          {/* Core App Routes */}
          <Route path="/feed" element={<ProtectedRoute><Feed /></ProtectedRoute>} />
          <Route path="/fuel" element={<ProtectedRoute><Fuel /></ProtectedRoute>} />
          <Route path="/hazards" element={<ProtectedRoute><HazardMap /></ProtectedRoute>} />
          <Route path="/forum" element={<ProtectedRoute><Forum /></ProtectedRoute>} />
          <Route path="/trend" element={<ProtectedRoute><TrendAnalysisChart /></ProtectedRoute>} />
          <Route path="/network" element={<ProtectedRoute><UserNetwork /></ProtectedRoute>} />
          
          {/* Authority Routes */}
          <Route path="/authority" element={<ProtectedRoute><AuthorityDashboard /></ProtectedRoute>} />
          <Route path="/authority-dashboard" element={<ProtectedRoute><AuthorityDashboard /></ProtectedRoute>} />

          <Route path="/report" element={<ProtectedRoute><ReportForm /></ProtectedRoute>} />

          {/* Fallback Route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </MainLayout>
    </Router>
  );
}

export default App;