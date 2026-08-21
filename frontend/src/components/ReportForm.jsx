import React from 'react';

export default function ReportForm({ formData, setFormData, handleSubmit, loading }) {
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

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

        <input
          type="text"
          name="imageUrl"
          placeholder="Image URL (Optional)"
          value={formData.imageUrl}
          onChange={handleChange}
          style={{ padding: '10px', borderRadius: '6px', border: '1px solid #1e4d3b', backgroundColor: '#062319', color: '#fff' }}
        />

        {/* 2 buttons */}
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
            {loading ? 'Submitting...' : '📢 Publish Normal'}
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
            {loading ? 'Submitting...' : ' Publish Anonymously'}
          </button>
        </div>

      </div>
    </form>
  );
}