import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function AuthorityDashboard() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const navigate = useNavigate();

  // Safely parse user session with fallbacks
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
  
  // Safe extraction of role (handles spaces, uppercase, and alternative keys)
  const userRole = (userInfo.role || userInfo.userType || '').toString().toLowerCase().trim();
  const isAuthFlag = Boolean(userInfo.isAuthority);

  useEffect(() => {
    // SECURITY CHECK: Flexible verification logic
    const isAuthorized = userRole === 'authority' || userRole === 'admin' || isAuthFlag;

    if (!isAuthorized) {
      alert('Access Denied: This page is reserved for Authority accounts only.');
      navigate('/feed', { replace: true });
    } else {
      setAuthorized(true);
      fetchAuthorityReports();
    }
  }, [userRole, isAuthFlag, navigate]);

  // Fetch active reports for verification/resolution
  const fetchAuthorityReports = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/reports', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReports(res.data || []);
    } catch (err) {
      console.error('Error fetching reports for authority:', err);
    } finally {
      setLoading(false);
    }
  };

  // Verify incident report
  const handleVerify = async (reportId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:5000/api/reports/${reportId}`,
        { isVerified: true, status: 'verified' },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setReports((prev) =>
        prev.map((r) =>
          r._id === reportId || r.id === reportId
            ? { ...r, isVerified: true, status: 'verified' }
            : r
        )
      );
      alert('Report successfully verified!');
    } catch (err) {
      console.error('Failed to verify report:', err);
      alert('Unauthorized! Only official authority accounts can verify reports.');
    }
  };

  // Mark incident report as resolved
  const handleResolve = async (reportId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:5000/api/reports/${reportId}`,
        { status: 'resolved' },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setReports((prev) =>
        prev.filter((r) => r._id !== reportId && r.id !== reportId)
      );
      alert('Report marked as Resolved!');
    } catch (err) {
      console.error('Failed to resolve report:', err);
      alert('Unauthorized! Only official authority accounts can resolve reports.');
    }
  };

  if (!authorized) return null; // Block render until authorization check passes

  return (
    <div style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto', color: '#fff' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>👮 Authority Control Panel</h2>
        <span style={{ backgroundColor: '#10b981', color: '#fff', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>
          Role: {(userRole || 'AUTHORITY').toUpperCase()}
        </span>
      </div>

      {loading ? (
        <p>Loading active incidents...</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {reports.length === 0 ? (
            <p style={{ color: '#94a3b8' }}>No pending incident reports available.</p>
          ) : (
            reports.map((report) => (
              <div
                key={report._id || report.id}
                style={{
                  backgroundColor: '#0d3326',
                  padding: '16px',
                  borderRadius: '10px',
                  borderLeft: report.isVerified ? '5px solid #10b981' : '5px solid #f59e0b',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <h4 style={{ margin: 0, fontSize: '1.1rem' }}>{report.title || 'Incident Report'}</h4>
                  <p style={{ margin: '4px 0', fontSize: '0.9rem', color: '#cbd5e1' }}>{report.description}</p>
                  <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                    Status:{' '}
                    <strong style={{ color: report.isVerified ? '#34d399' : '#fbbf24' }}>
                      {report.status || (report.isVerified ? 'Verified' : 'Pending')}
                    </strong>
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  {!report.isVerified && (
                    <button
                      onClick={() => handleVerify(report._id || report.id)}
                      style={{ backgroundColor: '#10b981', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}
                    >
                      ✓ Verify
                    </button>
                  )}
                  <button
                    onClick={() => handleResolve(report._id || report.id)}
                    style={{ backgroundColor: '#ef4444', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}
                  >
                    ✕ Mark Resolved
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}