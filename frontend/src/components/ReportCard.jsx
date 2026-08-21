import React, { useState, useEffect } from 'react';
import API from '../api';

export default function ReportCard({ report, currentUserId, userRole, refreshReports }) {
  const [deleting, setDeleting] = useState(false);
  const [timeLeft, setTimeLeft] = useState('');

  // Report Expiration Timer Calculation
  useEffect(() => {
    const calculateTimeLeft = () => {
      const createdTime = new Date(report.createdAt || Date.now()).getTime();
      const durationHours = report.expirationHours || 24; // Default: 24 hours validity
      const expireTime = createdTime + durationHours * 60 * 60 * 1000;
      const difference = expireTime - Date.now();

      if (difference <= 0) {
        setTimeLeft('Expired');
      } else {
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((difference / 1000 / 60) % 60);
        setTimeLeft(`${hours}h ${minutes}m left`);
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 60000); // Refresh every minute
    return () => clearInterval(timer);
  }, [report]);

  // Working Delete Handler
  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this report?')) return;

    try {
      setDeleting(true);
      await API.delete(`/reports/${report._id || report.id}`);
      alert('Report deleted successfully!');
      if (refreshReports) refreshReports();
    } catch (err) {
      console.error('Delete error:', err);
      alert(err.response?.data?.message || 'Failed to delete report.');
    } finally {
      setDeleting(false);
    }
  };

  const isOwner = report.user === currentUserId || report.postedBy === currentUserId;
  const canDelete = isOwner || userRole === 'admin' || userRole === 'moderator' || userRole === 'authority';

  return (
    <div style={{ backgroundColor: '#ffffff', borderRadius: '8px', padding: '16px', color: '#0f172a', position: 'relative', border: '1px solid #e2e8f0' }}>
      
      {/* Expiration Timer & ID Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#64748b', marginBottom: '8px' }}>
        <span>ID: {report.reportId || (report._id ? report._id.slice(-6) : 'N/A')}</span>
        <span style={{ fontWeight: 'bold', color: timeLeft === 'Expired' ? '#ef4444' : '#d97706' }}>
          ⌛ {timeLeft === 'Expired' ? 'Expired' : `Active (${timeLeft})`}
        </span>
      </div>

      <h3 style={{ margin: '0 0 6px 0', fontSize: '1.2rem', color: '#0f172a' }}>
        {report.title || report.category}
      </h3>

      <p style={{ margin: '0 0 12px 0', color: '#334155', fontSize: '0.95rem' }}>
        {report.description || report.content}
      </p>

      {report.imageUrl && (
        <img
          src={report.imageUrl}
          alt="Report"
          style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '6px', marginBottom: '12px' }}
        />
      )}

      {/* Footer with Delete Button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #f1f5f9', fontSize: '13px' }}>
        <span style={{ color: '#475569' }}>
          Posted by: <b>{report.isAnonymous ? 'Anonymous' : (report.username || 'User')}</b>
        </span>

        {canDelete && (
          <button
            onClick={handleDelete}
            disabled={deleting}
            style={{
              backgroundColor: '#ef4444',
              color: '#fff',
              border: 'none',
              padding: '6px 14px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            🗑️ {deleting ? 'Deleting...' : 'Delete'}
          </button>
        )}
      </div>
    </div>
  );
}