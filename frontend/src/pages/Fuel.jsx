import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default leafet marker icon missing issue
import markerIconPng from 'leaflet/dist/images/marker-icon.png';
const customIcon = new L.Icon({
  iconUrl: markerIconPng,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

// Component to handle clicking on map to pick location coordinates
function LocationPicker({ position, setPosition }) {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });
  return position ? <Marker position={position} icon={customIcon} /> : null;
}

export default function Fuel() {
  const [fuelStations, setFuelStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPos, setSelectedPos] = useState({ lat: 23.8103, lng: 90.4125 }); // Default: Dhaka
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
        lat: selectedPos.lat,
        lng: selectedPos.lng,
        reportedBy: userInfo._id || userInfo.id,
        username: userInfo.username || userInfo.name || 'Registered User'
      };

      await axios.post('http://localhost:5000/api/fuel', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert('Fuel status updated successfully with Map Location!');
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

      {/* Input Form with Map Location Selector */}
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

        {/* Map Click Picker for Location */}
        <div>
          <label style={{ fontSize: '13px', color: '#a7f3d0' }}>📌 Click on map to pinpoint exact station location:</label>
          <div style={{ height: '200px', width: '100%', marginTop: '6px', borderRadius: '8px', overflow: 'hidden' }}>
            <MapContainer center={[selectedPos.lat, selectedPos.lng]} zoom={12} style={{ height: '100%', width: '100%' }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <LocationPicker position={selectedPos} setPosition={setSelectedPos} />
            </MapContainer>
          </div>
        </div>

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

      {/* Main Map Showing All Fuel Stations */}
      <h3 style={{ marginBottom: '12px' }}>🗺️ Live Stations Map</h3>
      <div style={{ height: '350px', width: '100%', borderRadius: '12px', overflow: 'hidden', marginBottom: '24px' }}>
        <MapContainer center={[23.8103, 90.4125]} zoom={11} style={{ height: '100%', width: '100%' }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {fuelStations.map((station) => (
            <Marker 
              key={station._id || station.id} 
              position={[station.lat || 23.8103, station.lng || 90.4125]} 
              icon={customIcon}
            >
              <Popup>
                <div style={{ color: '#000' }}>
                  <strong>{station.stationName || 'Fuel Station'}</strong><br />
                  📍 {station.locationName}<br />
                  ⛽ Type: {station.fuelType}<br />
                  ⏳ Queue: {station.queueLength}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

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