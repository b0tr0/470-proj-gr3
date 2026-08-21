import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function Fuel() {
  const [fuelStations, setFuelStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    stationName: '',
    locationName: '',
    fuelType: 'Octane',
    queueLength: 'Medium',
    available: true,
  });

  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');

  useEffect(() => {
    fetchFuelData();
  }, []);

  const fetchFuelData = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:5000/api/fuel');
      setFuelStations(res.data || []);
    } catch (err) {
      console.error('Error fetching fuel data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.stationName || !formData.locationName) {
      alert('Please fill in Station Name and Location.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const payload = {
        stationName: formData.stationName,
        locationName: formData.locationName,
        fuelType: formData.fuelType,
        queueLength: formData.queueLength,
        status: formData.available ? 'available' : 'out of fuel',
        reportedBy: userInfo._id || userInfo.id,
        username: userInfo.username || userInfo.name || 'Registered User'
      };

      // Send token in Headers properly
      await axios.post('http://localhost:5000/api/fuel', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert('Fuel status updated successfully!');
      setFormData({
        stationName: '',
        locationName: '',
        fuelType: 'Octane',
        queueLength: 'Medium',
        available: true,
      });
      fetchFuelData();
    } catch (err) {
      console.error('Failed to post fuel update:', err.response?.data || err.message);
      alert(err.response?.data?.message || 'Failed to submit fuel update. Please log in again.');
    }
  };

  const getAuthorName = (item) => {
    if (item.isAnonymous) return 'Anonymous';
    if (item.username && item.username !== 'User') return item.username;
    if (typeof item.reportedBy === 'object' && item.reportedBy !== null) {
      return item.reportedBy.username || item.reportedBy.name;
    }
    return userInfo.username || userInfo.name || 'Registered Member';
  };

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto', color: '#fff' }}>
      <h2 style={{ fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '16px' }}>⛽ Fuel Availability & Station Map</h2>

      <form onSubmit={handleSubmit} style={{ backgroundColor: '#0d3326', padding: '16px', borderRadius: '12px', marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Update Station Status</h3>
        
        <input 
          type="text" 
          placeholder="Station Name (e.g. Padma Oil, Dhanmondi)"
          value={formData.stationName}
          onChange={(e) => setFormData({ ...formData, stationName: e.target.value })}
          style={{ padding: '10px', borderRadius: '6px', border: '1px solid #1e5340', backgroundColor: '#062319', color: '#fff' }}
        />

        <input 
          type="text" 
          placeholder="Location / Area Name"
          value={formData.locationName}
          onChange={(e) => setFormData({ ...formData, locationName: e.target.value })}
          style={{ padding: '10px', borderRadius: '6px', border: '1px solid #1e5340', backgroundColor: '#062319', color: '#fff' }}
        />

        <div style={{ display: 'flex', gap: '12px' }}>
          <select 
            value={formData.fuelType}
            onChange={(e) => setFormData({ ...formData, fuelType: e.target.value })}
            style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #1e5340', backgroundColor: '#062319', color: '#fff' }}
          >
            <option value="Octane">Octane</option>
            <option value="Petrol">Petrol</option>
            <option value="Diesel">Diesel</option>
            <option value="CNG">CNG</option>
          </select>

          <select 
            value={formData.queueLength}
            onChange={(e) => setFormData({ ...formData, queueLength: e.target.value })}
            style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #1e5340', backgroundColor: '#062319', color: '#fff' }}
          >
            <option value="Low">Queue: Low</option>
            <option value="Medium">Queue: Medium</option>
            <option value="Long">Queue: Long</option>
          </select>
        </div>

        <button type="submit" style={{ backgroundColor: '#10b981', color: '#fff', padding: '10px', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
          Submit Fuel Status
        </button>
      </form>

      <h3>Recent Fuel Updates</h3>
      {loading ? <p>Loading updates...</p> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {fuelStations.length === 0 ? <p style={{ color: '#94a3b8' }}>No fuel updates found.</p> : (
            fuelStations.map((item) => (
              <div key={item._id || item.id} style={{ backgroundColor: '#0d3326', padding: '14px', borderRadius: '8px', borderLeft: '4px solid #10b981' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h4 style={{ margin: 0, fontSize: '1.1rem' }}>{item.stationName || item.name || 'Fuel Station'}</h4>
                  <span style={{ fontSize: '12px', color: '#a7f3d0' }}>Queue: {item.queueLength || item.status || 'Medium'}</span>
                </div>
                <p style={{ margin: '4px 0', fontSize: '0.9rem', color: '#cbd5e1' }}>📍 {item.locationName || item.location || 'General Area'} | Type: {item.fuelType || 'General'}</p>
                <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8' }}>
                  Posted by: <strong>{getAuthorName(item)}</strong>
                </p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}