import React, { useState } from 'react';

const UserNetwork = () => {
  const [friends, setFriends] = useState([
    { name: 'Sarah Jenkins', status: 'Commuting' },
    { name: 'Dave Miller', status: 'Idle' },
    { name: 'Alex Rivera', status: 'Driving' }
  ]);
  const [friendName, setFriendName] = useState('');
  const [friendStatus, setFriendStatus] = useState('Commuting');

  const handleAddFriend = (e) => {
    e.preventDefault();
    if (friendName.trim() !== '') {
      setFriends([...friends, { name: friendName, status: friendStatus }]);
      setFriendName('');
      setFriendStatus('Commuting');
    }
  };

  return (
    <div style={{ backgroundColor: '#062319', minHeight: '100vh', padding: '24px', fontFamily: 'sans-serif' }}>
      <h1 style={{ fontSize: '20px', fontWeight: 'bold', color: '#ccfbf1', marginBottom: '24px' }}>
        User Network
      </h1>

      {/* Main Container - Side by Side */}
      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start', gap: '20px' }}>

        {/* 1. User Friend List Card */}
        <div style={{ width: '250px', backgroundColor: '#ffffff', padding: '16px', borderRadius: '16px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <span style={{ fontSize: '16px' }}>👥</span>
            <h2 style={{ margin: 0, fontSize: '14px', fontWeight: 'bold', color: '#111827' }}>User Friend List</h2>
          </div>

          {/* Form */}
          <form onSubmit={handleAddFriend} style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', gap: '6px' }}>
              <input
                type="text"
                placeholder="Enter Name"
                value={friendName}
                onChange={(e) => setFriendName(e.target.value)}
                style={{
                  width: '60%',
                  padding: '6px 8px',
                  fontSize: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  outline: 'none'
                }}
              />
              <select
                value={friendStatus}
                onChange={(e) => setFriendStatus(e.target.value)}
                style={{
                  width: '40%',
                  padding: '6px 4px',
                  fontSize: '11px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  backgroundColor: '#ffffff'
                }}
              >
                <option value="Commuting">Commuting</option>
                <option value="Idle">Idle</option>
                <option value="Driving">Driving</option>
              </select>
            </div>

            <button
              type="submit"
              style={{
                width: '100%',
                padding: '8px',
                fontSize: '12px',
                fontWeight: '600',
                color: '#ffffff',
                backgroundColor: '#ef4444',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              Add Friend
            </button>
          </form>

          {/* Friends List Items */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {friends.map((friend, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 12px',
                  backgroundColor: '#f8fafc',
                  borderRadius: '12px',
                  border: '1px solid #f1f5f9'
                }}
              >
                <span style={{ fontSize: '12px', fontWeight: '600', color: '#1e293b' }}>
                  {friend.name}
                </span>
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: '500',
                    color: '#64748b',
                    backgroundColor: '#e2e8f0',
                    padding: '3px 10px',
                    borderRadius: '9999px',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {friend.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 2. Priority Notifications Card */}
        <div style={{ width: '240px', backgroundColor: '#ffffff', padding: '16px', borderRadius: '16px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
            <span style={{ fontSize: '16px' }}>🔔</span>
            <div>
              <h2 style={{ margin: 0, fontSize: '14px', fontWeight: 'bold', color: '#111827' }}>
                Priority Notifications
              </h2>
              <p style={{ margin: '4px 0 0 0', fontSize: '10px', color: '#94a3b8' }}>
                Alerts triggered by proximity & upvote thresholds
              </p>
            </div>
          </div>

          <div style={{ marginTop: '12px', padding: '10px', backgroundColor: '#fef2f2', border: '1px solid #fee2e2', borderRadius: '12px' }}>
            <span style={{ fontSize: '9px', fontWeight: 'bold', color: '#b91c1c', letterSpacing: '0.5px', display: 'block', marginBottom: '4px' }}>
              25+ UPVOTES
            </span>
            <p style={{ margin: 0, fontSize: '10px', color: '#991b1b', lineHeight: '1.4' }}>
              High Upvote Alert: Major blockage reported 1.2 miles away near Downtown Connector!
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default UserNetwork;