import React, { useState, useEffect } from 'react';
import API from '../api';
import TrustBadge from './TrustBadge';
import ChatModal from './ChatModal';

export default function UserNetwork() {
  const [friends, setFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [targetUsername, setTargetUsername] = useState('');
  const [sharingLoc, setSharingLoc] = useState(false);
  const [lastUpdatedLoc, setLastUpdatedLoc] = useState('');
  const [activeChatFriend, setActiveChatFriend] = useState(null);

  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
  const userRole = (userInfo.role || '').toLowerCase().trim();
  const isAuthority = userRole === 'authority';

  const fetchNetwork = async () => {
    try {
      const { data } = await API.get('/friends');
      setFriends(data.friends || []);
      setFriendRequests(data.friendRequests || []);
      if (data.myLocation?.lastLocationUpdate) {
        setLastUpdatedLoc(
          new Date(data.myLocation.lastLocationUpdate).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })
        );
      }
    } catch (err) {
      console.error('Error fetching network:', err);
    }
  };

  useEffect(() => {
    fetchNetwork();
  }, []);

  const handleAddFriend = async (e) => {
    e.preventDefault();
    if (isAuthority) {
      alert('Official authority accounts cannot add personal friends.');
      return;
    }
    if (!targetUsername.trim()) return;

    try {
      const { data } = await API.post('/friends/request', {
        targetUsername: targetUsername.trim(),
      });
      alert(data.message || 'Friend request sent!');
      setTargetUsername('');
      fetchNetwork();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to send friend request.');
    }
  };

  const handleAccept = async (senderId) => {
    try {
      const { data } = await API.post(`/friends/accept/${senderId}`);
      alert(data.message);
      fetchNetwork();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to accept request.');
    }
  };

  const handleReject = async (senderId) => {
    try {
      const { data } = await API.post(`/friends/reject/${senderId}`);
      alert(data.message);
      fetchNetwork();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to decline request.');
    }
  };

  const handleShareLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setSharingLoc(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          await API.put('/friends/location', {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          });
          alert('📍 Location shared with network!');
          fetchNetwork();
        } catch (err) {
          alert('Failed to update location on network.');
        } finally {
          setSharingLoc(false);
        }
      },
      () => {
        alert('Could not access GPS location. Please allow permissions.');
        setSharingLoc(false);
      },
      { enableHighAccuracy: true }
    );
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '30px 20px', color: '#ffffff' }}>
      <h2 style={{ fontSize: '1.6rem', fontWeight: '800', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        🌐 User Network
      </h2>

      {/* Pending Requests Banner */}
      {!isAuthority && friendRequests.length > 0 && (
        <div style={{
          backgroundColor: '#064e3b',
          border: '1px solid #10b981',
          borderRadius: '12px',
          padding: '16px 20px',
          marginBottom: '24px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
        }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '1rem', color: '#a7f3d0' }}>
            📬 Pending Friend Requests ({friendRequests.length})
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {friendRequests.map((reqUser) => (
              <div key={reqUser._id} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: 'rgba(0,0,0,0.2)',
                padding: '10px 14px',
                borderRadius: '8px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontWeight: 'bold' }}>👤 {reqUser.username}</span>
                  <TrustBadge score={reqUser.trustScore ?? 100} role={reqUser.role} />
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => handleAccept(reqUser._id)}
                    style={{
                      backgroundColor: '#10b981',
                      color: '#ffffff',
                      border: 'none',
                      padding: '6px 14px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      fontSize: '12px'
                    }}
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleReject(reqUser._id)}
                    style={{
                      backgroundColor: '#ef4444',
                      color: '#ffffff',
                      border: 'none',
                      padding: '6px 14px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      fontSize: '12px'
                    }}
                  >
                    Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3-Column Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        
        {/* Column 1: Friends List & Add Form */}
        <div style={{
          backgroundColor: '#082f24',
          border: '1px solid #134e40',
          borderRadius: '14px',
          padding: '20px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
        }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            👥 User Friend List
          </h3>

          {isAuthority ? (
            <p style={{ fontSize: '13px', color: '#93c5fd', backgroundColor: '#1e3a8a', padding: '12px', borderRadius: '8px', margin: '0 0 16px 0' }}>
              ℹ️ Official authority accounts cannot send or receive personal friend requests.
            </p>
          ) : (
            <form onSubmit={handleAddFriend} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
              <input
                type="text"
                placeholder="Enter exact username..."
                value={targetUsername}
                onChange={(e) => setTargetUsername(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: '8px',
                  backgroundColor: '#041f17',
                  border: '1.5px solid #10b981',
                  color: '#ffffff',
                  fontSize: '0.95rem',
                  boxSizing: 'border-box',
                  outline: 'none'
                }}
              />

              <button
                type="submit"
                style={{
                  width: '100%',
                  backgroundColor: '#ef4444',
                  color: '#ffffff',
                  border: 'none',
                  padding: '12px',
                  borderRadius: '8px',
                  fontWeight: 'bold',
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
              >
                Add Friend
              </button>
            </form>
          )}

          {/* Friends List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {friends.length === 0 ? (
              <p style={{ fontSize: '13px', color: '#94a3b8', textAlign: 'center', margin: '20px 0' }}>
                {isAuthority ? 'No friend connections available for authority accounts.' : 'No friends added yet. Send a request using a username above!'}
              </p>
            ) : (
              friends.map((friend) => (
                <div key={friend._id} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  backgroundColor: '#041f17',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1px solid #134e40'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: '600', fontSize: '0.95rem' }}>👤 {friend.username}</span>
                    <TrustBadge score={friend.trustScore ?? 100} role={friend.role} />
                  </div>
                  <button
                    onClick={() => setActiveChatFriend(friend)}
                    style={{
                      backgroundColor: '#0f766e',
                      color: '#ffffff',
                      border: 'none',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      fontSize: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    💬 Message
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Column 2: Live Location */}
        <div style={{
          backgroundColor: '#082f24',
          border: '1px solid #134e40',
          borderRadius: '14px',
          padding: '20px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              📍 Live Location
            </h3>
            <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: '1.5' }}>
              Share your current GPS coordinates to receive proximity hazard alerts and emergency broadcasts.
            </p>
            {lastUpdatedLoc && (
              <p style={{ fontSize: '12px', color: '#10b981', marginTop: '12px' }}>
                ✓ Last shared at {lastUpdatedLoc}
              </p>
            )}
          </div>

          <button
            onClick={handleShareLocation}
            disabled={sharingLoc}
            style={{
              backgroundColor: '#0284c7',
              color: '#ffffff',
              border: 'none',
              padding: '12px',
              borderRadius: '8px',
              fontWeight: 'bold',
              cursor: 'pointer',
              marginTop: '20px',
              fontSize: '0.95rem'
            }}
          >
            {sharingLoc ? 'Acquiring GPS Coordinates...' : 'Share Location'}
          </button>
        </div>

        {/* Column 3: Priority Notifications Info */}
        <div style={{
          backgroundColor: '#082f24',
          border: '1px solid #134e40',
          borderRadius: '14px',
          padding: '20px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
        }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            🔔 Priority Notifications
          </h3>
          <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '14px' }}>
            Alerts triggered by proximity, SOS beacons, and direct messages.
          </p>

          <div style={{
            backgroundColor: '#ffffff',
            color: '#0f172a',
            padding: '14px',
            borderRadius: '8px',
            borderLeft: '4px solid #ef4444'
          }}>
            <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#ef4444', textTransform: 'uppercase' }}>
              Network Alerts Active
            </span>
            <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#334155', lineHeight: '1.4' }}>
              Live alerts broadcast directly to your notification dropdown.
            </p>
          </div>
        </div>

      </div>

      {activeChatFriend && (
        <ChatModal
          friend={activeChatFriend}
          onClose={() => setActiveChatFriend(null)}
        />
      )}
    </div>
  );
}