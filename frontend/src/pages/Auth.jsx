import React, { useState } from 'react';

import { useNavigate } from 'react-router-dom';

import API from '../api';



export default function Auth() {

  const [isLogin, setIsLogin] = useState(true);

  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();



  const [formData, setFormData] = useState({

    username: '',

    email: '',

    password: '',

    role: 'user'

  });



  const handleChange = (e) => {

    setFormData({ ...formData, [e.target.name]: e.target.value });

  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const payload = isLogin
        ? { email: formData.email, password: formData.password, role: formData.role }
        : formData;

      const { data } = await API.post(endpoint, payload);

      if (isLogin) {
        const token = data.token || data.accessToken;

        const userToStore = {
          ...(data.user || {}),
          email: data.user?.email || formData.email,
          username: data.user?.username || data.user?.name || formData.username,
          role: data.user?.role || data.user?.userType || formData.role
        };

        localStorage.setItem('token', token);
        localStorage.setItem('userInfo', JSON.stringify(userToStore));

        alert('Login successful!');

        const userRole = (userToStore.role || '').toLowerCase();
        if (
          userRole === 'authority' || 
          userRole === 'admin' || 
          userRole === 'moderator' || 
          userRole === 'community moderator'
        ) {
          navigate('/authority-dashboard'); 
        } else {
          navigate('/feed');
        }
      } else {
        alert('Registration successful! Please login now.');
        setIsLogin(true);
      }
    } catch (err) {
      console.error('Authentication error:', err);
      alert(err.response?.data?.message || 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };




  

  return (

    <div style={{ maxWidth: '420px', margin: '50px auto', padding: '24px', backgroundColor: '#0d3326', borderRadius: '12px', color: '#fff', border: '1px solid #1e5340', position: 'relative' }}>

     

      {/* System Active Status Marker */}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '16px' }}>

        <span style={{

          width: '10px',

          height: '10px',

          backgroundColor: '#ef4444',

          borderRadius: '50%',

          display: 'inline-block',

          boxShadow: '0 0 8px #ef4444'

        }}></span>

        <span style={{ fontSize: '12px', color: '#fca5a5', fontWeight: 'bold', letterSpacing: '0.5px' }}>

          SYSTEM ACTIVE

        </span>

      </div>



      <h2 style={{ textAlign: 'center', marginBottom: '20px', marginTop: 0 }}>

        {isLogin ? '🔑 Account Login' : '📝 Create Account'}

      </h2>



      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

       

        {/* User Role Selection */}

        <div>

          <label style={{ fontSize: '13px', color: '#a7f3d0' }}>

            User Type <span style={{ color: '#ef4444' }}>●</span>

          </label>

          <select

            name="role"

            value={formData.role}

            onChange={handleChange}

            style={{ width: '100%', padding: '10px', borderRadius: '6px', backgroundColor: '#062319', color: '#fff', border: '1px solid #1e5340', marginTop: '4px' }}

          >

            <option value="user"> General User</option>

            <option value="moderator"> Community Moderator</option>

            <option value="authority">🛡️ Authority</option>

          </select>

        </div>



        {!isLogin && (

          <div>

            <label style={{ fontSize: '13px', color: '#a7f3d0' }}>

              Username <span style={{ color: '#ef4444' }}>●</span>

            </label>

            <input

              type="text"

              name="username"

              required

              placeholder="Enter username"

              value={formData.username}

              onChange={handleChange}

              style={{ width: '100%', padding: '10px', borderRadius: '6px', backgroundColor: '#062319', color: '#fff', border: '1px solid #1e5340', marginTop: '4px' }}

            />

          </div>

        )}



        <div>

          <label style={{ fontSize: '13px', color: '#a7f3d0' }}>

            Email <span style={{ color: '#ef4444' }}>●</span>

          </label>

          <input

            type="email"

            name="email"

            required

            placeholder="Enter email"

            value={formData.email}

            onChange={handleChange}

            style={{ width: '100%', padding: '10px', borderRadius: '6px', backgroundColor: '#062319', color: '#fff', border: '1px solid #1e5340', marginTop: '4px' }}

          />

        </div>



        <div>

          <label style={{ fontSize: '13px', color: '#a7f3d0' }}>

            Password <span style={{ color: '#ef4444' }}>●</span>

          </label>

          <input

            type="password"

            name="password"

            required

            placeholder="Enter password"

            value={formData.password}

            onChange={handleChange}

            style={{ width: '100%', padding: '10px', borderRadius: '6px', backgroundColor: '#062319', color: '#fff', border: '1px solid #1e5340', marginTop: '4px' }}

          />

        </div>



        <button

          type="submit"

          disabled={loading}

          style={{ padding: '12px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', marginTop: '8px' }}

        >

          {loading ? 'Processing...' : isLogin ? 'Login' : 'Register'}

        </button>

      </form>



      <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '14px' }}>

        <span style={{ color: '#94a3b8' }}>

          {isLogin ? "Don't have an account? " : 'Already have an account? '}

        </span>

        <button

          type="button"

          onClick={() => setIsLogin(!isLogin)}

          style={{ background: 'none', border: 'none', color: '#38bdf8', cursor: 'pointer', fontWeight: 'bold', textDecoration: 'underline' }}

        >

          {isLogin ? 'Register' : 'Login'}

        </button>

      </div>

    </div>

  );

}