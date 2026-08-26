import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'general'
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        // LOGIN: Sends email/username & password (no role required)
        const { data } = await API.post('/auth/login', {
          email: formData.email,
          password: formData.password
        });

        localStorage.setItem('token', data.token);
        localStorage.setItem('userInfo', JSON.stringify(data));

        alert('Logged in successfully!');
        const userRole = (data.role || '').toLowerCase().trim();
        if (userRole === 'authority' || userRole === 'admin') {
          navigate('/authority');
        } else {
          navigate('/feed');
        }
      } else {
        // REGISTER: Sends username, email, password, and chosen role
        const { data } = await API.post('/auth/register', formData);

        localStorage.setItem('token', data.token);
        localStorage.setItem('userInfo', JSON.stringify(data));

        alert('Account created successfully!');
        const userRole = (data.role || '').toLowerCase().trim();
        if (userRole === 'authority' || userRole === 'admin') {
          navigate('/authority');
        } else {
          navigate('/feed');
        }
      }
    } catch (err) {
      console.error('Auth error:', err);
      alert(err.response?.data?.message || 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      maxWidth: '440px',
      margin: '60px auto',
      padding: '32px',
      backgroundColor: 'var(--bg-card, #0f291e)',
      borderRadius: '12px',
      border: '1px solid var(--border-color, #1b4d3e)',
      boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
      color: 'var(--text-primary, #ffffff)'
    }}>
      <h2 style={{ textAlign: 'center', marginBottom: '24px' }}>
        {isLogin ? '🔐 Login' : '📝 Create Account'}
      </h2>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Role Selection: ONLY visible when Creating an Account */}
        {!isLogin && (
          <div>
            <label style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--text-secondary, #94a3b8)' }}>
              User Type <span style={{ color: 'var(--accent-red, #ef4444)' }}>*</span>
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '10px 12px',
                marginTop: '6px',
                borderRadius: '6px',
                border: '1.5px solid var(--input-border, #134e40)',
                backgroundColor: 'var(--input-bg, #041f17)',
                color: 'var(--input-text, #ffffff)',
                boxSizing: 'border-box'
              }}
            >
              <option value="general">General User</option>
              <option value="moderator">Community Moderator</option>
              <option value="authority">Official Authority</option>
            </select>
          </div>
        )}

        {/* Username: ONLY visible when Creating an Account */}
        {!isLogin && (
          <div>
            <label style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--text-secondary, #94a3b8)' }}>
              Username <span style={{ color: 'var(--accent-red, #ef4444)' }}>*</span>
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Enter your username"
              required={!isLogin}
              style={{
                width: '100%',
                padding: '10px 12px',
                marginTop: '6px',
                borderRadius: '6px',
                border: '1.5px solid var(--input-border, #134e40)',
                backgroundColor: 'var(--input-bg, #041f17)',
                color: 'var(--input-text, #ffffff)',
                boxSizing: 'border-box'
              }}
            />
          </div>
        )}

        <div>
          <label style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--text-secondary, #94a3b8)' }}>
            {isLogin ? 'Email or Username' : 'Email Address'} <span style={{ color: 'var(--accent-red, #ef4444)' }}>*</span>
          </label>
          <input
            type={isLogin ? 'text' : 'email'}
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder={isLogin ? 'Enter email or username' : 'Enter email'}
            required
            style={{
              width: '100%',
              padding: '10px 12px',
              marginTop: '6px',
              borderRadius: '6px',
              border: '1.5px solid var(--input-border, #134e40)',
              backgroundColor: 'var(--input-bg, #041f17)',
              color: 'var(--input-text, #ffffff)',
              boxSizing: 'border-box'
            }}
          />
        </div>

        <div>
          <label style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--text-secondary, #94a3b8)' }}>
            Password <span style={{ color: 'var(--accent-red, #ef4444)' }}>*</span>
          </label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter password"
            required
            style={{
              width: '100%',
              padding: '10px 12px',
              marginTop: '6px',
              borderRadius: '6px',
              border: '1.5px solid var(--input-border, #134e40)',
              backgroundColor: 'var(--input-bg, #041f17)',
              color: 'var(--input-text, #ffffff)',
              boxSizing: 'border-box'
            }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            backgroundColor: '#2563eb',
            color: '#ffffff',
            padding: '12px',
            border: 'none',
            borderRadius: '6px',
            fontWeight: 'bold',
            fontSize: '1rem',
            cursor: 'pointer',
            marginTop: '8px'
          }}
        >
          {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Create Account'}
        </button>
      </form>

      <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: 'var(--text-secondary, #94a3b8)' }}>
        {isLogin ? "Don't have an account? " : "Already have an account? "}
        <span
          onClick={() => setIsLogin(!isLogin)}
          style={{ color: '#38bdf8', fontWeight: 'bold', cursor: 'pointer', textDecoration: 'underline' }}
        >
          {isLogin ? 'Create Account' : 'Login'}
        </span>
      </p>
    </div>
  );
}