import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '../leafletSetup';
import API from '../api';

// Default Marker Icon Fix
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Helper for colored hazard marker pins based on severity
const createCustomIcon = (severity) => {
  const color = severity === 'severe' ? '#ef4444' : severity === 'high' ? '#f59e0b' : '#3b82f6';
  return L.divIcon({
    className: 'custom-hazard-pin',
    html: `<div style="
      background-color: ${color};
      width: 22px;
      height: 22px;
      border-radius: 50%;
      border: 3px solid #ffffff;
      box-shadow: 0 2px 6px rgba(0,0,0,0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #ffffff;
      font-size: 11px;
      font-weight: bold;
    ">⚠️</div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12]
  });
};

export default function HazardMap() {
  const [hazards, setHazards] = useState([]);
  const [hazardType, setHazardType] = useState('pothole');
  const [severity, setSeverity] = useState('moderate');
  const [description, setDescription] = useState('');
  const [position, setPosition] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. Fetch all active hazards from backend on load
  const fetchHazards = async () => {
    try {
      const { data } = await API.get('/hazards');
      setHazards(data || []);
    } catch (err) {
      console.error('Failed to load hazards:', err);
    }
  };

  useEffect(() => {
    fetchHazards();
  }, []);

  // Map Click Listener to drop draft pin
  function LocationMarker() {
    const map = useMapEvents({
      click(e) {
        setPosition(e.latlng);
        map.flyTo(e.latlng, map.getZoom());
      }
    });

    return position === null ? null : (
      <Marker position={position}>
        <Popup>
          <strong>📍 Selected Pin</strong><br />
          Type: {hazardType}<br />
          Severity: {severity}<br />
          Description: {description || 'No description yet'}
        </Popup>
      </Marker>
    );
  }

  // Submit hazard and persist pin
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!position) {
      alert('Please click on the map to drop a pin first.');
      return;
    }

    setIsSubmitting(true);
    try {
      const { data } = await API.post('/hazards', {
        type: hazardType,
        severity: severity,
        description: description,
        location: { lat: position.lat, lng: position.lng }
      });

      alert('✅ Hazard reported and pinned successfully!');
      // Append new hazard directly to active map markers
      setHazards((prev) => [data, ...prev]);
      setDescription('');
      setPosition(null);
    } catch (error) {
      console.error('Error submitting hazard:', error);
      alert(error.response?.data?.message || 'Failed to submit hazard.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      gap: '20px',
      padding: '24px',
      maxWidth: '1200px',
      margin: '0 auto',
      color: 'var(--text-primary)',
      transition: 'color 0.3s ease'
    }}>
      {/* Leaflet Map with Existing & New Pins */}
      <div style={{
        width: '60%',
        height: '540px',
        zIndex: 1,
        border: '1px solid var(--border-color)',
        borderRadius: '10px',
        overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
      }}>
        <MapContainer center={[23.84638, 90.4271]} zoom={13} style={{ height: '100%', width: '100%' }}>
          <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          
          {/* Active Persistent Hazard Pins */}
          {hazards.map((h) => {
            if (!h.location?.lat || !h.location?.lng) return null;
            return (
              <Marker
                key={h._id}
                position={[h.location.lat, h.location.lng]}
                icon={createCustomIcon(h.severity)}
              >
                <Popup>
                  <div style={{ color: '#000000', fontSize: '13px' }}>
                    <strong style={{ textTransform: 'capitalize' }}>⚠️ {h.type?.replace('_', ' ')}</strong><br />
                    <span><strong>Severity:</strong> {h.severity}</span><br />
                    <span><strong>Reported By:</strong> {h.reportedBy?.username || 'Community'}</span><br />
                    <p style={{ margin: '6px 0 0 0', fontSize: '12px' }}>{h.description}</p>
                  </div>
                </Popup>
              </Marker>
            );
          })}

          {/* Current Selection Draft Pin */}
          <LocationMarker />
        </MapContainer>
      </div>

      {/* Form */}
      <div style={{
        width: '40%',
        backgroundColor: 'var(--bg-card)',
        padding: '24px',
        borderRadius: '10px',
        color: 'var(--text-primary)',
        border: '1px solid var(--border-color)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        transition: 'all 0.3s ease'
      }}>
        <h3 style={{ marginTop: 0, color: 'var(--text-primary)', fontSize: '1.25rem' }}>
          Report a Road Hazard
        </h3>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <label style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--text-secondary)' }}>Type:</label>
          <select
            value={hazardType}
            onChange={(e) => setHazardType(e.target.value)}
            style={{
              padding: '10px',
              borderRadius: '6px',
              backgroundColor: 'var(--input-bg)',
              color: 'var(--input-text)',
              border: '1.5px solid var(--input-border)'
            }}
          >
            <option value="pothole">Pothole</option>
            <option value="checkpoint">Police Checkpoint</option>
            <option value="poor_road">Road Damage</option>
            <option value="extortion">Extortion</option>
            <option value="other">Other</option>
          </select>

          <label style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--text-secondary)' }}>Severity:</label>
          <select
            value={severity}
            onChange={(e) => setSeverity(e.target.value)}
            style={{
              padding: '10px',
              borderRadius: '6px',
              backgroundColor: 'var(--input-bg)',
              color: 'var(--input-text)',
              border: '1.5px solid var(--input-border)'
            }}
          >
            <option value="moderate">Moderate</option>
            <option value="high">High</option>
            <option value="severe">Severe</option>
          </select>

          <label style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--text-secondary)' }}>Description:</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the hazard..."
            rows="4"
            style={{
              padding: '10px',
              borderRadius: '6px',
              backgroundColor: 'var(--input-bg)',
              color: 'var(--input-text)',
              border: '1.5px solid var(--input-border)'
            }}
          />

          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              backgroundColor: 'var(--accent-red)',
              color: '#ffffff',
              padding: '12px',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 'bold',
              cursor: 'pointer',
              marginTop: '6px'
            }}
          >
            {isSubmitting ? 'Submitting...' : 'Drop Pin & Report'}
          </button>
        </form>
      </div>
    </div>
  );
}