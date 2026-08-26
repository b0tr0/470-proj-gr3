import React, { useState, useEffect, useRef } from 'react';
import API from '../api';

export default function NotificationDropdown() {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const fetchNotifications = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const { data } = await API.get('/notifications');
      setNotifications(data || []);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Poll every 8 seconds so incoming actions show up in real-time
    const interval = setInterval(fetchNotifications, 8000);
    return () => clearInterval(interval);
  }, []);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await API.put(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div ref={dropdownRef} style={{ position: 'relative' }}>
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          fetchNotifications();
        }}
        style={{
          position: 'relative',
          backgroundColor: 'var(--badge-user-bg)',
          color: 'var(--text-primary)',
          border: '1px solid var(--border-color)',
          padding: '6px 12px',
          borderRadius: '20px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '0.85rem',
          fontWeight: 'bold',
        }}
      >
        <span>🔔</span>
        {unreadCount > 0 && (
          <span style={{
            backgroundColor: 'var(--accent-red, #ef4444)',
            color: '#ffffff',
            borderRadius: '10px',
            padding: '1px 6px',
            fontSize: '11px',
            fontWeight: '800'
          }}>
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute',
          right: 0,
          top: '115%',
          width: '320px',
          maxHeight: '400px',
          overflowY: 'auto',
          backgroundColor: 'var(--bg-card, #1e293b)',
          border: '1px solid var(--border-color, #334155)',
          borderRadius: '10px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
          zIndex: 1100,
          padding: '12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color, #334155)', paddingBottom: '8px' }}>
            <strong style={{ fontSize: '13px', color: 'var(--text-primary, #ffffff)' }}>Notifications</strong>
            <span style={{ fontSize: '11px', color: 'var(--text-secondary, #94a3b8)' }}>{unreadCount} new</span>
          </div>

          {notifications.length === 0 ? (
            <p style={{ textAlign: 'center', fontSize: '12px', color: 'var(--text-secondary, #94a3b8)', margin: '16px 0' }}>
              No notifications yet.
            </p>
          ) : (
            notifications.map((n) => (
              <div
                key={n._id}
                onClick={() => !n.isRead && handleMarkAsRead(n._id)}
                style={{
                  padding: '10px',
                  borderRadius: '6px',
                  backgroundColor: n.isRead ? 'transparent' : 'rgba(16, 185, 129, 0.08)',
                  border: n.isRead ? '1px solid var(--border-color, #334155)' : '1px solid #10b981',
                  cursor: n.isRead ? 'default' : 'pointer',
                  transition: 'background 0.2s'
                }}
              >
                <div style={{ fontSize: '12px', fontWeight: 'bold', color: n.isRead ? 'var(--text-primary, #ffffff)' : '#10b981' }}>
                  {n.title}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary, #cbd5e1)', marginTop: '4px', lineHeight: '1.4' }}>
                  {n.message}
                </div>
                <div style={{ fontSize: '10px', color: 'var(--text-secondary, #64748b)', marginTop: '4px' }}>
                  {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}