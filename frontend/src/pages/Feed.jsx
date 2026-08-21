import React, { useState, useEffect } from 'react';
import API from '../api';
import ReportCard from '../components/ReportCard';
import ReportForm from '../components/ReportForm';

const Feed = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    category: 'roadblock',
    severity: 'moderate',
    description: '',
    imageUrl: ''
  });

  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
  const currentUserId = userInfo._id || userInfo.id;
  const userRole = userInfo.role || 'user';

  const fetchReports = async () => {
    try {
      setLoading(true);
      const { data } = await API.get('/reports');
      setReports(data);
    } catch (error) {
      console.error('Failed to fetch reports:', error);
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
      alert('Please fill out Title and Description!');
      return;
    }

    try {
      await API.post('/reports', { ...formData, isAnonymous });
      alert(`Alert ${isAnonymous ? 'Anonymously ' : ''}Published Successfully!`);
      setFormData({
        title: '',
        category: 'roadblock',
        severity: 'moderate',
        description: '',
        imageUrl: ''
      });
      fetchReports();
    } catch (error) {
      console.error('Failed to post report:', error);
      alert('Failed to submit report. Please try again.');
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto', color: '#fff' }}>
      {/* Report Form Component */}
      <ReportForm
        formData={formData}
        setFormData={setFormData}
        handleSubmit={handleSubmit}
      />

      {/* Reports Feed List */}
      <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {loading ? (
          <p style={{ color: '#94a3b8' }}>Loading reports...</p>
        ) : reports.length === 0 ? (
          <p style={{ color: '#94a3b8' }}>No reports published yet.</p>
        ) : (
          reports.map((report) => (
            <ReportCard
              key={report._id || report.id}
              report={report}
              currentUserId={currentUserId}
              userRole={userRole}
              refreshReports={fetchReports}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default Feed;