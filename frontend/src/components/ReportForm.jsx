import React, { useState } from 'react';

export default function ReportForm({ onSubmitReport }) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('jam');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !location.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    onSubmitReport({
      title,
      category,
      description,
      location,
      imageUrl,
      timestamp: 'Just now',
    });

    setTitle('');
    setDescription('');
    setLocation('');
    setImageUrl('');
    setError('');
  };

  return (
    <div className="card report-form-card">
      <h2 className="card-title" style={{ marginBottom: '1rem' }}>
        🚨 Report Incident
      </h2>

      {error && <div className="alert-banner error">{error}</div>}

      <form onSubmit={handleSubmit} className="form-stack">
        <div className="form-group">
          <label className="form-label">Incident Type</label>
          <select 
            value={category} 
            onChange={(e) => setCategory(e.target.value)}
            className="form-select"
          >
            <option value="jam">🚗 Heavy Traffic / Jam</option>
            <option value="accident">💥 Road Accident</option>
            <option value="hazard">⚠️ Road Hazard / Closure</option>
            <option value="info">ℹ️ General Update</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Title / Headline</label>
          <input 
            type="text" 
            placeholder="e.g., Express Bridge blocked"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Location</label>
          <input 
            type="text" 
            placeholder="e.g., Highway 101, Exit 4"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="form-input"
          />
        </div>

        {/* Feature 18: Image URL Attachment Input */}
        <div className="form-group">
          <label className="form-label">Image URL (Optional)</label>
          <input 
            type="url" 
            placeholder="https://example.com/image.jpg"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea 
            rows="3"
            placeholder="Provide details about lane delays or alternative routes..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="form-textarea"
          ></textarea>
        </div>

        <button type="submit" className="btn btn-primary btn-full">
          Publish Alert
        </button>
      </form>
    </div>
  );
}