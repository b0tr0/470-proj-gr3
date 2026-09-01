import React, { useState, useEffect, useCallback } from 'react';
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
  const userRole = userInfo.role || userInfo.userType || 'user';

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await API.get('/reports');
      setReports(data || []);
    } catch (error) {
      console.error('Failed to fetch reports:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReports();

    // Listen to real-time SOS broadcast event
    const handleSOSCreated = (event) => {
      const newReport = event.detail;
      if (newReport && (newReport._id || newReport.id)) {
        setReports((prevReports) => {
          // Avoid duplicate entries if already present
          const exists = prevReports.some(
            (r) => (r._id || r.id) === (newReport._id || newReport.id)
          );
          if (exists) return prevReports;
          return [newReport, ...prevReports];
        });
      } else {
        // Fallback: Re-fetch list if payload is generic
        fetchReports();
      }
    };

    window.addEventListener('sosReportCreated', handleSOSCreated);

    return () => {
      window.removeEventListener('sosReportCreated', handleSOSCreated);
    };
  }, [fetchReports]);

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

  // Filter out any expired or deleted reports
  const activeReports = reports.filter((report) => {
    if (report.isDeleted || report.isExpired) return false;
    if (report.expiresAt) {
      return new Date(report.expiresAt).getTime() > Date.now();
    }
    return true;
  });

  return (
    <div style={{
      padding: '24px',
      maxWidth: '800px',
      margin: '0 auto',
      color: 'var(--text-primary)',
      transition: 'color 0.3s ease'
    }}>
      {/* Report Form Component */}
      <ReportForm
        formData={formData}
        setFormData={setFormData}
        handleSubmit={handleSubmit}
      />

      {/* Reports Feed List */}
      <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {loading ? (
          <p style={{ color: 'var(--text-secondary)' }}>Loading reports...</p>
        ) : activeReports.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)' }}>No active reports published yet.</p>
        ) : (
          activeReports.map((report) => (
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