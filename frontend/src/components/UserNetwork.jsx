import React from 'react';

const Network = () => {
  return (
    <div style={{ padding: '40px', maxWidth: '1400px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '24px', color: '#0f172a' }}>
        User Network
      </h2>

      {/* Main Grid Section */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
        
        {/* Left Side: Friend List Card */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '28px', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
          <h3 style={{ margin: '0 0 20px 0', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
            👥 User Friend List
          </h3>

          <div style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
            <input 
              type="text" 
              placeholder="Enter user name..." 
              style={{
                flex: 1,
                padding: '12px 16px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.95rem',
                color: '#0f172a',
                backgroundColor: '#f8fafc'
              }}
            />
            <button style={{ backgroundColor: '#ef4444', color: '#fff', border: 'none', padding: '0 20px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>
              Add Friend
            </button>
          </div>

          {/* Friends Item Row */}
          {['Sarah Jenkins', 'Dave Miller', 'Alex Rivera'].map((name, idx) => (
            <div key={idx} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '14px 16px',
              backgroundColor: '#f8fafc',
              borderRadius: '10px',
              marginBottom: '12px',
              border: '1px solid #e2e8f0'
            }}>
              <span style={{ color: '#0f172a', fontWeight: '700', fontSize: '1rem' }}>{name}</span>
              <span style={{ backgroundColor: '#e2e8f0', color: '#334155', padding: '4px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '600' }}>
                {idx === 0 ? 'Commuting' : idx === 1 ? 'Idle' : 'Driving'}
              </span>
            </div>
          ))}
        </div>

        {/* Right Side: Priority Notifications Card */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '28px', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
          <h3 style={{ margin: '0 0 6px 0', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
            🔔 Priority Notifications
          </h3>
          <p style={{ margin: '0 0 20px 0', color: '#64748b', fontSize: '0.88rem' }}>Alerts triggered by proximity & upvote thresholds</p>

          <div style={{ backgroundColor: '#fff1f2', border: '1px solid #fecdd3', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
            <span style={{ color: '#9f1239', fontWeight: '800', fontSize: '0.8rem', display: 'block', marginBottom: '4px' }}>25+ UPVOTES</span>
            <p style={{ margin: 0, color: '#881337', fontWeight: '600', fontSize: '0.95rem' }}>
              High Upvote Alert: Major blockage reported 1.2 miles away near Downtown Connector!
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Network;