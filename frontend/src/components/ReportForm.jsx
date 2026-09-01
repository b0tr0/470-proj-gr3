import React, { useState } from 'react';

export default function ReportForm({ formData, setFormData, handleSubmit, loading }) {
  const [location, setLocation] = useState(null);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState(null);
  const watchIdRef = React.useRef(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleToggleLocation = () => {
    // If tracking is already on, tapping again stops it and clears the location
    if (location || watchIdRef.current !== null) {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      setLocation(null);
      setLocating(false);
      setLocationError(null);
      setFormData((prev) => ({
        ...prev,
        lat: undefined,
        lng: undefined
      }));
      return;
    }

    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      return;
    }

    setLocationError(null);
    setLocating(true);

    // watchPosition keeps firing as the user moves, so the attached
    // location stays live rather than freezing at the first fix.
    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({ lat: latitude, lng: longitude });
        setFormData((prev) => ({
          ...prev,
          lat: latitude,
          lng: longitude
        }));
        setLocating(false);
      },
      (err) => {
        setLocationError(err.message || 'Unable to retrieve your location.');
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Stop watching if the component unmounts while tracking is active
  React.useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  return (
    <form style={{ backgroundColor: '#0a3224', padding: '20px', borderRadius: '12px', marginBottom: '20px', border: '1px solid rgba(255,255,255,0.1)' }}>
      <h3 style={{ marginTop: 0, color: '#fff' }}>📢 Submit New Report</h3>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <input
          type="text"
          name="title"
          placeholder="Report Title"
          value={formData.title}
          onChange={handleChange}
          required
          style={{ padding: '10px', borderRadius: '6px', border: '1px solid #1e4d3b', backgroundColor: '#062319', color: '#fff' }}
        />

        <div style={{ display: 'flex', gap: '10px' }}>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #1e4d3b', backgroundColor: '#062319', color: '#fff' }}
          >
            <option value="roadblock">Roadblock</option>
            <option value="accident">Accident</option>
            <option value="construction">Construction</option>
            <option value="traffic">Heavy Traffic</option>
          </select>

          <select
            name="severity"
            value={formData.severity}
            onChange={handleChange}
            style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #1e4d3b', backgroundColor: '#062319', color: '#fff' }}
          >
            <option value="low">Low</option>
            <option value="moderate">Moderate</option>
            <option value="high">High</option>
          </select>
        </div>

        <textarea
          name="description"
          placeholder="Description"
          value={formData.description}
          onChange={handleChange}
          rows="3"
          style={{ padding: '10px', borderRadius: '6px', border: '1px solid #1e4d3b', backgroundColor: '#062319', color: '#fff' }}
        />

        {/* Location Sharing */}
        <div>
          <button
            type="button"
            onClick={handleToggleLocation}
            className={`w-full font-medium text-sm p-2 rounded transition ${
              location
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
            }`}
          >
            {locating
              ? 'Locating...' : location
              ? `Location Attached (tap to remove)` : 'Share My Location'}
          </button>
          {locationError && <p className="text-xs text-red-600">{locationError}</p>}
        </div>

        <input
          type="text"
          name="imageUrl"
          placeholder="Image URL (Optional)"
          value={formData.imageUrl}
          onChange={handleChange}
          style={{ padding: '10px', borderRadius: '6px', border: '1px solid #1e4d3b', backgroundColor: '#062319', color: '#fff' }}
        />

        {/* Submit Buttons */}
        <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
          <button
            type="button"
            disabled={loading}
            onClick={(e) => handleSubmit(e, false)}
            style={{
              flex: 1,
              backgroundColor: '#ef4444',
              color: '#fff',
              padding: '10px',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Submitting...' : '📢 Publish'}
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={(e) => handleSubmit(e, true)}
            style={{
              flex: 1,
              backgroundColor: '#475569',
              color: '#fff',
              padding: '10px',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Submitting...' : '🕵️ Publish Anonymously'}
          </button>
        </div>

      </div>
    </form>
  );
}