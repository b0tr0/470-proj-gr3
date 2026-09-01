import React, { useState } from 'react';
import API from '../api';

export default function SOSButton() {
  const [showConfirm, setShowConfirm] = useState(false);
  const [sending, setSending] = useState(false);
  const [note, setNote] = useState('');
  const [statusMsg, setStatusMsg] = useState('');

  const handleSendSOS = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please log in before sending an SOS emergency alert.');
      return;
    }

    setSending(true);
    setStatusMsg('Acquiring high-accuracy GPS coordinates...');

    if (!navigator.geolocation) {
      sendSOSRequest(null, null);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        sendSOSRequest(pos.coords.latitude, pos.coords.longitude);
      },
      (err) => {
        console.warn('Geolocation failed or denied, sending without coordinates:', err);
        sendSOSRequest(null, null);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const sendSOSRequest = async (lat, lng) => {
    setStatusMsg('Broadcasting SOS to authorities and emergency contacts...');
    try {
      const { data } = await API.post('/sos', {
        lat,
        lng,
        emergencyNote: note || 'Immediate road assistance requested.'
      });

      // 1. Dispatch custom event with the created report data to update Feed in real-time
      const newSOSReport = data.report || data;
      window.dispatchEvent(
        new CustomEvent('sosReportCreated', { detail: newSOSReport })
      );

      // 2. Dispatch trust score update event
      window.dispatchEvent(new Event('trustScoreUpdated'));

      alert(`🚨 SOS ALERT DISPATCHED!\n\n${data.totalNotified ?? 1} contacts/authorities have been notified with your coordinates.`);
      setShowConfirm(false);
      setNote('');
      setStatusMsg('');
    } catch (err) {
      console.error('SOS Error:', err);
      alert(err.response?.data?.message || 'Failed to dispatch SOS alert.');
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      {/* Floating Emergency SOS Action Button (Bottommost: 24px) */}
      <button
        type="button"
        onClick={() => setShowConfirm(true)}
        style={{
          position: 'fixed',
          bottom: '96px',
          right: '24px',
          zIndex: 99998,
          backgroundColor: '#ef4444',
          color: '#ffffff',
          border: '3px solid #ffffff',
          borderRadius: '50%',
          width: '60px',
          height: '60px',
          fontSize: '15px',
          fontWeight: '900',
          cursor: 'pointer',
          boxShadow: '0 4px 20px rgba(239, 68, 68, 0.6)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          animation: 'pulse 1.8s infinite'
        }}
        title="Emergency SOS Distress Beacon"
      >
        <span>🆘</span>
        <span style={{ fontSize: '10px', letterSpacing: '1px' }}>SOS</span>
      </button>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.65)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          backdropFilter: 'blur(3px)'
        }}>
          <div style={{
            backgroundColor: 'var(--bg-card)',
            color: 'var(--text-primary)',
            padding: '24px',
            borderRadius: '14px',
            maxWidth: '420px',
            width: '90%',
            border: '2px solid #ef4444',
            boxShadow: '0 12px 32px rgba(0,0,0,0.3)'
          }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>🚨</span> Confirm Emergency SOS
            </h3>

            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5', margin: '0 0 14px 0' }}>
              This will broadcast your live coordinates to your friends, road traffic authorities, and nearby drivers.
            </p>

            <textarea
              placeholder="Optional: Brief situation note (e.g. Accident on Flyover, Engine failure, Medical emergency)..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows="3"
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '8px',
                backgroundColor: 'var(--input-bg)',
                border: '1px solid var(--border-color)',
                color: 'var(--input-text, var(--text-primary))',
                fontSize: '13px',
                boxSizing: 'border-box',
                marginBottom: '14px'
              }}
            />

            {statusMsg && (
              <p style={{ fontSize: '12px', color: '#d97706', fontWeight: 'bold', margin: '0 0 12px 0' }}>
                ⏳ {statusMsg}
              </p>
            )}

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                disabled={sending}
                onClick={() => { setShowConfirm(false); setStatusMsg(''); }}
                style={{
                  padding: '8px 16px',
                  backgroundColor: 'transparent',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={sending}
                onClick={handleSendSOS}
                style={{
                  padding: '8px 20px',
                  backgroundColor: '#ef4444',
                  border: 'none',
                  color: '#ffffff',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  boxShadow: '0 2px 8px rgba(239, 68, 68, 0.4)'
                }}
              >
                {sending ? 'Broadcasting...' : 'Confirm & Broadcast SOS'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Button Pulse Animation */}
      <style>{`
        @keyframes pulse {
          0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
          70% { transform: scale(1.06); box-shadow: 0 0 0 14px rgba(239, 68, 68, 0); }
          100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }
      `}</style>
    </>
  );
}