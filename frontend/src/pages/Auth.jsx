import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Auth = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate Login
    const userData = { email, name: email.split('@')[0] || 'User' };
    localStorage.setItem('userInfo', JSON.stringify(userData));
    navigate('/feed');
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0a2e1d', // Dark Green
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      fontFamily: 'sans-serif'
    }}>
      {/* Header Logo & Title */}
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1 style={{ 
          fontSize: '2.5rem', 
          fontWeight: 'bold', 
          color: '#ffffff', 
          margin: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '4px'
        }}>
          Traffic <span style={{ color: '#ef4444' }}>Alert •</span>
        </h1>
        <p style={{ color: '#94a3b8', marginTop: '8px', fontSize: '0.95rem' }}>
          Real-time updates for your daily commute
        </p>
      </div>

      {/* Main White Auth Box */}
      <div style={{
        backgroundColor: '#ffffff',
        width: '100%',
        maxWidth: '420px',
        borderRadius: '16px',
        padding: '36px 32px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
      }}>
        <h2 style={{ 
          fontSize: '1.5rem', 
          fontWeight: '700', 
          color: '#0f172a', 
          margin: '0 0 6px 0' 
        }}>
          {isSignUp ? 'Create an account' : 'Welcome back'}
        </h2>
        <p style={{ 
          color: '#64748b', 
          fontSize: '0.875rem', 
          margin: '0 0 24px 0' 
        }}>
          {isSignUp ? 'Enter your details to sign up' : 'Please enter your details to sign in'}
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '18px' }}>
            <label style={{ 
              display: 'block', 
              fontSize: '0.85rem', 
              fontWeight: '600', 
              color: '#334155', 
              marginBottom: '6px' 
            }}>
              Email Address
            </label>
            <input
              type="email"
              required
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#ffffff',
                color: '#0f172a',
                fontSize: '0.95rem',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ 
              display: 'block', 
              fontSize: '0.85rem', 
              fontWeight: '600', 
              color: '#334155', 
              marginBottom: '6px' 
            }}>
              Password
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#ffffff',
                color: '#0f172a',
                fontSize: '0.95rem',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <button
            type="submit"
            style={{
              width: '100%',
              backgroundColor: '#0a3d24', // Dark green button like image 1
              color: '#ffffff',
              padding: '12px',
              borderRadius: '8px',
              fontWeight: '600',
              fontSize: '1rem',
              border: 'none',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
          >
            {isSignUp ? 'Sign Up' : 'Sign In'}
          </button>
        </form>

        {/* Bottom Switcher */}
        <div style={{ 
          marginTop: '24px', 
          textAlign: 'center', 
          fontSize: '0.875rem', 
          color: '#64748b',
          borderTop: '1px solid #f1f5f9',
          paddingTop: '16px'
        }}>
          {isSignUp ? (
            <p style={{ margin: 0 }}>
              Already have an account?{' '}
              <span
                onClick={() => setIsSignUp(false)}
                style={{ color: '#ef4444', fontWeight: '600', cursor: 'pointer' }}
              >
                Sign in
              </span>
            </p>
          ) : (
            <p style={{ margin: 0 }}>
              New to TrafficAlert?{' '}
              <span
                onClick={() => setIsSignUp(true)}
                style={{ color: '#ef4444', fontWeight: '600', cursor: 'pointer' }}
              >
                Sign up now
              </span>
            </p>
          )}
        </div>
      </div>

      {/* Footer text */}
      <p style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '30px' }}>
        © 2026 TrafficAlert. All rights reserved.
      </p>
    </div>
  );
};

export default Auth;