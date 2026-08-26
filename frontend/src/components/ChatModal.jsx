import React, { useState, useEffect, useRef, useCallback } from 'react';
import API from '../api';

export default function ChatModal({ friend, onClose }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const currentUserId = JSON.parse(localStorage.getItem('userInfo') || '{}')._id;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = useCallback(async () => {
    if (!friend?._id) return;
    try {
      const { data } = await API.get(`/chat/conversation/${friend._id}`);
      setMessages(data || []);
    } catch (err) {
      console.error('Failed to load chat history:', err);
    }
  }, [friend?._id]);

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000); // Poll every 3 seconds for new messages
    return () => clearInterval(interval);
  }, [fetchMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim() || loading) return;

    try {
      setLoading(true);
      const { data } = await API.post('/chat/send', {
        recipientId: friend._id,
        text: text.trim()
      });
      setMessages((prev) => [...prev, data]);
      setText('');
      scrollToBottom();
    } catch (err) {
      console.error('Send error:', err);
      alert('Failed to deliver message.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      left: '24px',
      width: '340px',
      height: '460px',
      backgroundColor: 'var(--bg-card)',
      border: '1.5px solid var(--border-color)',
      borderRadius: '14px',
      boxShadow: '0 12px 36px rgba(0,0,0,0.35)',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 10000,
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        padding: '12px 16px',
        backgroundColor: '#0f766e',
        color: '#ffffff',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>💬</span>
          <strong style={{ fontSize: '0.95rem' }}>{friend.username}</strong>
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: '#ffffff',
            fontSize: '16px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          ✕
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div style={{
        flex: 1,
        padding: '14px',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        backgroundColor: 'var(--bg-primary)'
      }}>
        {messages.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '12px', margin: 'auto' }}>
            No messages yet. Say hello!
          </p>
        ) : (
          messages.map((m) => {
            const isMe = (m.sender?._id || m.sender) === currentUserId;
            return (
              <div
                key={m._id}
                style={{
                  alignSelf: isMe ? 'flex-end' : 'flex-start',
                  maxWidth: '75%',
                  backgroundColor: isMe ? '#2563eb' : 'var(--input-bg)',
                  color: isMe ? '#ffffff' : 'var(--text-primary)',
                  padding: '8px 12px',
                  borderRadius: '10px',
                  fontSize: '13px',
                  lineHeight: '1.4',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.1)'
                }}
              >
                <div>{m.text}</div>
                <div style={{
                  fontSize: '9px',
                  color: isMe ? '#bfdbfe' : 'var(--text-secondary)',
                  textAlign: 'right',
                  marginTop: '4px'
                }}>
                  {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input Form */}
      <form onSubmit={handleSend} style={{
        padding: '10px',
        borderTop: '1px solid var(--border-color)',
        display: 'flex',
        gap: '6px',
        backgroundColor: 'var(--bg-card)'
      }}>
        <input
          type="text"
          placeholder="Type a message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          style={{
            flex: 1,
            padding: '8px 12px',
            borderRadius: '8px',
            border: '1px solid var(--border-color)',
            backgroundColor: 'var(--input-bg)',
            color: 'var(--text-primary)',
            fontSize: '13px',
            outline: 'none'
          }}
        />
        <button
          type="submit"
          disabled={loading || !text.trim()}
          style={{
            backgroundColor: '#0f766e',
            color: '#ffffff',
            border: 'none',
            padding: '8px 14px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '13px'
          }}
        >
          Send
        </button>
      </form>
    </div>
  );
}