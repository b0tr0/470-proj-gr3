import React, { useState, useEffect } from 'react';
import ReportCard from '../components/ReportCard';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

const Feed = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    category: 'roadblock',  // Matches Backend Enum
    severity: 'moderate',   // Matches Backend Enum
    description: '',
    imageUrl: ''
  });

  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
  const currentUserId = userInfo._id || userInfo.id;
  const userRole = userInfo.role || 'user';

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/reports`, {
        headers: {
          'Authorization': `Bearer ${userInfo.token || ''}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setReports(data);
      } else {
        console.error('Failed to retrieve active reports');
      }
    } catch (error) {
      console.error('Network error while fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleSubmit = async (e, isAnonymous = false) => {
    e.preventDefault();
    if (!formData.title || !formData.description) {
      alert("Please fill out Title and Description!");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/reports`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userInfo.token || ''}`
        },
        body: JSON.stringify({
          ...formData,
          isAnonymous
        })
      });

      if (response.ok) {
        alert(`Alert ${isAnonymous ? 'Anonymously ' : ''}Published Successfully!`);
        setFormData({ title: '', category: 'roadblock', severity: 'moderate', description: '', imageUrl: '' });
        fetchReports();
      } else {
        const err = await response.json();
        alert(`Error: ${err.message || 'Failed to submit report'}`);
      }
    } catch (error) {
      console.error('Submission error:', error);
      alert('Network error while creating report.');
    }
  };

  const handleDeleteReport = async (reportId) => {
    if (!window.confirm("Are you sure you want to delete this report?")) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/reports/${reportId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userInfo.token || ''}`
        },
        body: JSON.stringify({ reason: 'user_requested' })
      });

      if (response.ok) {
        setReports((prev) => prev.filter((r) => r._id !== reportId));
      } else {
        const err = await response.json();
        alert(err.message || 'Failed to delete report');
      }
    } catch (error) {
      console.error('Delete action failed:', error);
    }
  };

  return (
    <div className="w-full min-h-screen p-4 md:p-8 text-gray-800">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: Report Form */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">🚨 Report an Incident</h2>
          
          <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">Incident Title</label>
              <input
                type="text"
                placeholder="e.g., Waterlogging on Main Road"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full border border-gray-300 p-2.5 rounded-lg text-sm focus:outline-none focus:border-red-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Category</label>
                <select 
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full border border-gray-300 p-2.5 rounded-lg text-sm bg-white"
                >
                  <option value="roadblock">Roadblock</option>
                  <option value="accident">Accident</option>
                  <option value="discussion">Discussion</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Severity</label>
                <select 
                  value={formData.severity}
                  onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                  className="w-full border border-gray-300 p-2.5 rounded-lg text-sm bg-white"
                >
                  <option value="moderate">Moderate</option>
                  <option value="high">High</option>
                  <option value="severe">Severe</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">Image URL (Optional)</label>
              <input
                type="url"
                placeholder="https://example.com/image.jpg"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                className="w-full border border-gray-300 p-2.5 rounded-lg text-sm focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">Description</label>
              <textarea
                placeholder="Provide details..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full border border-gray-300 p-2.5 rounded-lg text-sm h-24 focus:outline-none focus:border-red-500"
                required
              />
            </div>

            <button 
              type="submit" 
              className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-lg transition-colors shadow-sm"
            >
              Publish Alert
            </button>

            <button 
              type="button" 
              onClick={(e) => handleSubmit(e, true)}
              className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-3 rounded-lg transition-colors shadow-sm"
            >
              Publish Anonymously
            </button>
          </form>
        </div>

        {/* RIGHT COLUMN: Live Incident Feed */}
        <div className="lg:col-span-7 space-y-4">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">📢 Live Incident Feed</h2>

          {loading ? (
            <p className="text-gray-200 text-center py-8">Loading reports...</p>
          ) : reports.length === 0 ? (
            <div className="bg-white p-6 rounded-xl shadow-md text-center">
              <p className="text-gray-500 font-medium">No active reports available.</p>
            </div>
          ) : (
            reports.map((report) => (
              <ReportCard
                key={report._id}
                report={report}
                userRole={userRole}
                currentUserId={currentUserId}
                onDelete={handleDeleteReport}
              />
            ))
          )}
        </div>

      </div>
    </div>
  );
};

export default Feed;