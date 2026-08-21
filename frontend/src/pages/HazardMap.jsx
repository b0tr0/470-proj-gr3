import { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '../leafletSetup';

// Default Marker Icon Fix
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export default function HazardMap() {
  const [hazardType, setHazardType] = useState('pothole');
  const [severity, setSeverity] = useState('moderate');
  const [description, setDescription] = useState('');
  const [position, setPosition] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
          <strong>New Hazard</strong><br />
          Type: {hazardType}<br />
          Severity: {severity}<br />
          Description: {description}
        </Popup>
      </Marker>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!position) {
      alert('Please click on the map to drop a pin first.');
      return;
    }

    const storedUser = localStorage.getItem('userInfo');
    const userInfo = storedUser ? JSON.parse(storedUser) : {};
    const userId = userInfo?._id || userInfo?.id || null;
    const token = localStorage.getItem('token');

    setIsSubmitting(true);
    try {
      const response = await fetch('http://localhost:5000/api/hazards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: `${hazardType.toUpperCase()} (${severity})`,
          type: hazardType,
          category: hazardType,
          severity: severity,
          description: description,
          userId: userId,
          reportedBy: userId,
          location: { lat: position.lat, lng: position.lng }
        })
      });

      if (response.ok) {
        alert('Hazard reported successfully!');
        setDescription('');
        setPosition(null);
      } else {
        const errData = await response.json();
        alert(errData.message || 'Failed to submit hazard.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Server error.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', gap: '20px', padding: '20px' }}>
      <div style={{ width: '60%', height: '500px', zIndex: 1, border: '1px solid #ccc', borderRadius: '8px', overflow: 'hidden' }}>
        <MapContainer center={[23.84638, 90.4271]} zoom={13} style={{ height: '100%', width: '100%' }}>
          <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <LocationMarker />
        </MapContainer>
      </div>
      <div style={{ width: '40%', background: 'white', padding: '20px', borderRadius: '10px', color: '#0f172a' }}>
        <h3 style={{ marginTop: 0 }}>Report a Road Hazard</h3>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <label style={{ fontSize: '14px', fontWeight: 'bold' }}>Type:</label>
          <select value={hazardType} onChange={(e) => setHazardType(e.target.value)} style={{ padding: '8px', borderRadius: '6px' }}>
            <option value="pothole">Pothole</option>
            <option value="checkpoint">Police Checkpoint</option>
            <option value="poor_road">Road Damage</option>
            <option value="extortion">Extortion</option>
            <option value="other">Other</option>
          </select>

          <label style={{ fontSize: '14px', fontWeight: 'bold' }}>Severity:</label>
          <select value={severity} onChange={(e) => setSeverity(e.target.value)} style={{ padding: '8px', borderRadius: '6px' }}>
            <option value="moderate">Moderate</option>
            <option value="high">High</option>
            <option value="severe">Severe</option>
          </select>

          <label style={{ fontSize: '14px', fontWeight: 'bold' }}>Description:</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the hazard..." rows="4" style={{ padding: '8px', borderRadius: '6px' }} />
        </form>
      </div>
    </div>
  );
}