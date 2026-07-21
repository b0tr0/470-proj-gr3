import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Auth from './pages/Auth';
import Feed from './pages/Feed';
import Fuel from './pages/Fuel';
import HazardMap from './pages/HazardMap';


// Route guarding to check if user info exists
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('userInfo');
  return isAuthenticated ? children : <Navigate to="/" replace />;
};

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <Routes>
          <Route path="/" element={<Auth />} />
          <Route path="/feed" element={<ProtectedRoute><Feed /></ProtectedRoute>} />
          <Route path="/fuel" element={<ProtectedRoute><Fuel /></ProtectedRoute>} />
          <Route path="/hazards" element={<ProtectedRoute><HazardMap /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;