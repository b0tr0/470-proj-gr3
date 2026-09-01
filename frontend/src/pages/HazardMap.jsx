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

  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
  const currentUserId = (userInfo._id || userInfo.id || '').toString();
  const userRoleStr = (userInfo.role || userInfo.userType || '').toString().toLowerCase().trim();
  const isPrivileged = ['authority', 'moderator', 'community moderator', 'admin'].includes(userRoleStr);

  const handleDeleteHazard = async (id) => {
    if (!window.confirm('Are you sure you want to delete this hazard report?')) return;
    try {
      await API.delete(`/hazards/${id}`);
      alert('Hazard report deleted successfully!');
      fetchHazards();
    } catch (err) {
      console.error('Delete hazard error:', err);
      alert(err.response?.data?.message || 'Failed to delete hazard report.');
    }
  };

  const formatHazardExpiry = (expiresAt) => {
    if (!expiresAt) return '60m left';
    const diffMs = new Date(expiresAt) - new Date();
    if (diffMs <= 0) return 'Expired';
    // Clamp to max 1 hour (60 mins) for hazards
    const effectiveMs = Math.min(diffMs, 60 * 60 * 1000);
    const minutes = Math.floor(effectiveMs / 60000);
    if (minutes <= 0) return 'Expiring now';
    return `${minutes}m left`;
  };

  return (
    <div style={{
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '24px',
      color: 'var(--text-primary)',
      transition: 'color 0.3s ease'
    }}>
      <div style={{ display: 'flex', gap: '20px', marginBottom: '24px' }}>
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
              const hazardId = h._id || h.id;
              const authorId = (h.reportedBy?._id || h.reportedBy || '').toString();
              const canDelete = Boolean(currentUserId && authorId === currentUserId) || isPrivileged;

              return (
                <Marker
                  key={hazardId}
                  position={[h.location.lat, h.location.lng]}
                  icon={createCustomIcon(h.severity)}
                >
                  <Popup>
                    <div style={{ color: '#000000', fontSize: '13px' }}>
                      <strong style={{ textTransform: 'capitalize' }}>⚠️ {h.type?.replace('_', ' ')}</strong><br />
                      <span><strong>Severity:</strong> {h.severity}</span><br />
                      <span><strong>Expires:</strong> {formatHazardExpiry(h.expiresAt)}</span><br />
                      <span><strong>Reported By:</strong> {h.reportedBy?.username || 'Community'}</span><br />
                      <p style={{ margin: '6px 0 8px 0', fontSize: '12px' }}>{h.description}</p>
                      {canDelete && (
                        <button
                          type="button"
                          onClick={() => handleDeleteHazard(hazardId)}
                          style={{
                            backgroundColor: '#ef4444',
                            color: '#ffffff',
                            border: 'none',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '11px',
                            fontWeight: 'bold',
                            cursor: 'pointer'
                          }}
                        >
                          🗑️ Delete Hazard
                        </button>
                      )}
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
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '14px' }}>
            ⏱️ Note: Hazard reports remain active on the map for <b>1 hour</b> before automatically expiring.
          </p>
          
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

      {/* Active Hazards List */}
      <div style={{
        backgroundColor: 'var(--bg-card)',
        padding: '20px',
        borderRadius: '10px',
        border: '1px solid var(--border-color)'
      }}>
        <h3 style={{ marginTop: 0, fontSize: '1.1rem', marginBottom: '14px' }}>
          ⚠️ Active Hazards (1h Auto-Expiry)
        </h3>
        {hazards.length === 0 ? (
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>No active road hazards reported.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
            {hazards.map((h) => {
              const hazardId = h._id || h.id;
              const authorId = (h.reportedBy?._id || h.reportedBy || '').toString();
              const canDelete = Boolean(currentUserId && authorId === currentUserId) || isPrivileged;

              return (
                <div key={hazardId} style={{
                  backgroundColor: 'var(--input-bg)',
                  padding: '12px 14px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  flexDirection: 'column',
                  justify: 'space-between',
                  gap: '8px'
                }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong style={{ textTransform: 'capitalize', fontSize: '14px' }}>⚠️ {h.type?.replace('_', ' ')}</strong>
                      <span style={{ fontSize: '11px', color: '#ef4444', fontWeight: 'bold' }}>
                        ⏳ {formatHazardExpiry(h.expiresAt)}
                      </span>
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                      Severity: <span style={{ textTransform: 'capitalize', fontWeight: 'bold' }}>{h.severity}</span> | Author: {h.reportedBy?.username || 'User'}
                    </div>
                    {h.description && (
                      <p style={{ margin: '6px 0 0 0', fontSize: '13px', color: 'var(--text-primary)' }}>{h.description}</p>
                    )}
                  </div>
                  {canDelete && (
                    <div style={{ alignSelf: 'flex-end', marginTop: '6px' }}>
                      <button
                        type="button"
                        onClick={() => handleDeleteHazard(hazardId)}
                        style={{
                          backgroundColor: '#ef4444',
                          color: '#ffffff',
                          border: 'none',
                          padding: '4px 10px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: 'bold',
                          cursor: 'pointer'
                        }}
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}