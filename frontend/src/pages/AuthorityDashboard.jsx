import React from 'react';

const AuthorityDashboard = () => {
  return (
    <div style={{ padding: '40px', maxWidth: '1400px', margin: '0 auto' }}>
      
      {/* Header Title */}
      <div style={{ marginBottom: '28px' }}>
        <h2 style={{ color: '#ffffff', fontSize: '1.8rem', margin: '0 0 8px 0', fontWeight: '800' }}>
          Authority Monitoring Dashboard
        </h2>
        <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.95rem' }}>
          Review, verify, and resolve community-reported traffic incidents.
        </p>
      </div>

      {/* Main Table Card */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        padding: '28px',
        boxShadow: '0 15px 35px rgba(0,0,0,0.3)',
        width: '100%',
        boxSizing: 'border-box',
        overflowX: 'auto'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
              <th style={{ padding: '16px 12px', color: '#0f172a', fontWeight: '800' }}>Incident Info</th>
              <th style={{ padding: '16px 12px', color: '#0f172a', fontWeight: '800' }}>Location</th>
              <th style={{ padding: '16px 12px', color: '#0f172a', fontWeight: '800' }}>Reported By</th>
              <th style={{ padding: '16px 12px', color: '#0f172a', fontWeight: '800' }}>Community Votes</th>
              <th style={{ padding: '16px 12px', color: '#0f172a', fontWeight: '800' }}>Status</th>
              <th style={{ padding: '16px 12px', color: '#0f172a', fontWeight: '800', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            
            {/* Row 1 */}
            <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
              <td style={{ padding: '16px 12px' }}>
                <div style={{ color: '#0f172a', fontWeight: '700', fontSize: '1rem' }}>Traffic Collision</div>
                <div style={{ color: '#64748b', fontSize: '0.85rem' }}>10 mins ago</div>
              </td>
              <td style={{ padding: '16px 12px', color: '#334155', fontWeight: '600' }}>5th Avenue & Broadway</td>
              <td style={{ padding: '16px 12px', color: '#334155', fontWeight: '600' }}>Alex Chen</td>
              <td style={{ padding: '16px 12px', color: '#ef4444', fontWeight: '800' }}>👍 24</td>
              <td style={{ padding: '16px 12px' }}>
                <span style={{ backgroundColor: '#dcfce7', color: '#15803d', padding: '6px 14px', borderRadius: '20px', fontWeight: '700', fontSize: '0.85rem' }}>
                  Verified
                </span>
              </td>
              <td style={{ padding: '16px 12px', textAlign: 'right' }}>
                <button style={{ backgroundColor: '#0284c7', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: '700', cursor: 'pointer' }}>
                  Mark Resolved
                </button>
              </td>
            </tr>

            {/* Row 2 */}
            <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
              <td style={{ padding: '16px 12px' }}>
                <div style={{ color: '#0f172a', fontWeight: '700', fontSize: '1rem' }}>Signal Malfunction</div>
                <div style={{ color: '#64748b', fontSize: '0.85rem' }}>1 hour ago</div>
              </td>
              <td style={{ padding: '16px 12px', color: '#334155', fontWeight: '600' }}>Route 9 Exit 4</td>
              <td style={{ padding: '16px 12px', color: '#334155', fontWeight: '600' }}>Sam Miller</td>
              <td style={{ padding: '16px 12px', color: '#ef4444', fontWeight: '800' }}>👍 8</td>
              <td style={{ padding: '16px 12px' }}>
                <span style={{ backgroundColor: '#fef3c7', color: '#b45309', padding: '6px 14px', borderRadius: '20px', fontWeight: '700', fontSize: '0.85rem' }}>
                  Pending
                </span>
              </td>
              <td style={{ padding: '16px 12px', textAlign: 'right' }}>
                <button style={{ backgroundColor: '#16a34a', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: '700', marginRight: '8px', cursor: 'pointer' }}>
                  Verify
                </button>
                <button style={{ backgroundColor: '#dc2626', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: '700', cursor: 'pointer' }}>
                  Dismiss
                </button>
              </td>
            </tr>

          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AuthorityDashboard;