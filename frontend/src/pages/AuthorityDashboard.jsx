import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';

export default function AuthorityDashboard() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const navigate = useNavigate();

  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
  const userRole = (userInfo.role || userInfo.userType || '').toString().toLowerCase().trim();
  const isAuthFlag = Boolean(userInfo.isAuthority);

  useEffect(() => {
    // Only Official Authority and Admin are authorized (Moderators blocked)
    const isAuthorized = userRole === 'authority' || userRole === 'admin' || isAuthFlag;

    if (!isAuthorized) {
      alert('Access Denied: This page is strictly reserved for Official Authority accounts.');
      navigate('/feed', { replace: true });
    } else {
      setAuthorized(true);
      fetchAuthorityReports();
    }
  }, [userRole, isAuthFlag, navigate]);

  const fetchAuthorityReports = async () => {
    try {
      setLoading(true);
      const res = await API.get('/reports');
      setReports(res.data || []);
    } catch (err) {
      console.error('Error fetching reports for authority:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (reportId) => {
    try {
      await API.put(`/reports/${reportId}/verify`, {
        status: 'verified'
      });

      setReports((prev) =>
        prev.map((r) =>
          r._id === reportId || r.id === reportId
            ? { ...r, isVerified: true, authorityStatus: 'verified' }
            : r
        )
      );
      alert('Report successfully verified!');
    } catch (err) {
      console.error('Failed to verify report:', err);
      alert(err.response?.data?.message || 'Failed to verify report.');
    }
  };

  const handleResolve = async (reportId) => {
    try {
      await API.put(`/reports/${reportId}/resolve`, {
        status: 'resolved'
      });

      setReports((prev) =>
        prev.filter((r) => r._id !== reportId && r.id !== reportId)
      );
      alert('Report marked as Resolved!');
    } catch (err) {
      console.error('Failed to resolve report:', err);
      alert(err.response?.data?.message || 'Failed to resolve report.');
    }
  };

  if (!authorized) return null;

  return (
    <div style={{
      padding: '24px',
      maxWidth: '1000px',
      margin: '0 auto',
      color: 'var(--text-primary)',
      transition: 'color 0.3s ease'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ color: 'var(--text-primary)', margin: 0 }}>👮 Authority Control Panel</h2>
        <span style={{
          backgroundColor: '#10b981',
          color: '#ffffff',
          padding: '6px 14px',
          borderRadius: '20px',
          fontSize: '12px',
          fontWeight: 'bold'
        }}>
          Role: {(userRole || 'AUTHORITY').toUpperCase()}
        </span>
      </div>

      {loading ? (
        <p style={{ color: 'var(--text-secondary)' }}>Loading active incidents...</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {reports.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)' }}>No pending incident reports available.</p>
          ) : (
            reports.map((report) => {
              const isVerified = report.authorityStatus === 'verified' || report.isVerified;
              const isResolved = report.authorityStatus === 'resolved';

              return (
                <div
                  key={report._id || report.id}
                  style={{
                    backgroundColor: 'var(--bg-card)',
                    padding: '18px',
                    borderRadius: '10px',
                    border: '1px solid var(--border-color)',
                    borderLeft: isVerified ? '5px solid #10b981' : isResolved ? '5px solid #3b82f6' : '5px solid #f59e0b',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <div>
                    <h4 style={{ margin: 0, fontSize: '1.15rem', color: 'var(--text-primary)' }}>
                      {report.title || 'Incident Report'}
                    </h4>
                    <p style={{ margin: '6px 0', fontSize: '0.92rem', color: 'var(--text-secondary)' }}>
                      {report.description}
                    </p>
                    <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                      Status:{' '}
                      <strong style={{ color: isVerified ? '#10b981' : isResolved ? '#3b82f6' : '#f59e0b', textTransform: 'capitalize' }}>
                        {report.authorityStatus || (isVerified ? 'Verified' : 'Pending')}
                      </strong>
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    {!isVerified && (
                      <button
                        onClick={() => handleVerify(report._id || report.id)}
                        style={{
                          backgroundColor: '#10b981',
                          color: '#ffffff',
                          border: 'none',
                          padding: '8px 14px',
                          borderRadius: '6px',
                          fontWeight: 'bold',
                          cursor: 'pointer',
                          fontSize: '13px'
                        }}
                      >
                        ✓ Verify
                      </button>
                    )}
                    <button
                      onClick={() => handleResolve(report._id || report.id)}
                      style={{
                        backgroundColor: 'var(--accent-red)',
                        color: '#ffffff',
                        border: 'none',
                        padding: '8px 14px',
                        borderRadius: '6px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        fontSize: '13px'
                      }}
                    >
                      ✕ Mark Resolved
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}