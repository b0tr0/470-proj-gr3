import React, { useState, useEffect } from 'react';

export default function ReportForm({ formData, setFormData, handleSubmit }) {
  const [hasDraft, setHasDraft] = useState(false);
  const [draftSavedMessage, setDraftSavedMessage] = useState('');

  // 1. Identify the current logged-in user
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
  const userId = userInfo._id || userInfo.id || userInfo.email || 'guest';
  
  // Dynamic user-specific storage key
  const DRAFT_KEY = `traffic_report_draft_${userId}`;

  // 2. Check on mount / user change if THIS specific user has a saved draft
  useEffect(() => {
    const saved = localStorage.getItem(DRAFT_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.title || parsed.description) {
          setHasDraft(true);
        }
      } catch (e) {
        console.error('Failed to parse user draft:', e);
      }
    } else {
      setHasDraft(false);
    }
  }, [DRAFT_KEY]);

  // Save current form inputs into this user's storage slot
  const handleSaveDraft = (e) => {
    e.preventDefault();
    if (!formData.title && !formData.description) {
      alert('Cannot save an empty draft. Please enter at least a title or description.');
      return;
    }

    localStorage.setItem(DRAFT_KEY, JSON.stringify(formData));
    setHasDraft(true);
    setDraftSavedMessage('Draft saved to your account!');
    setTimeout(() => setDraftSavedMessage(''), 3000);
  };

  // Restore saved draft for this user
  const handleLoadDraft = (e) => {
    e.preventDefault();
    const saved = localStorage.getItem(DRAFT_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      setFormData(parsed);
      setDraftSavedMessage('Draft restored!');
      setTimeout(() => setDraftSavedMessage(''), 3000);
    }
  };

  // Discard only this user's draft
  const handleDiscardDraft = (e) => {
    e.preventDefault();
    localStorage.removeItem(DRAFT_KEY);
    setHasDraft(false);
    setDraftSavedMessage('Draft removed.');
    setTimeout(() => setDraftSavedMessage(''), 3000);
  };

  return (
    <form
      style={{
        backgroundColor: 'var(--bg-card)',
        padding: '24px',
        borderRadius: '12px',
        border: '1px solid var(--border-color)',
        boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        transition: 'all 0.3s ease'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-primary)' }}>
          📢 Submit New Report
        </h3>

        {/* User-Scoped Draft Actions */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {hasDraft && (
            <>
              <button
                type="button"
                onClick={handleLoadDraft}
                style={{
                  backgroundColor: '#0284c7',
                  color: '#ffffff',
                  border: 'none',
                  padding: '5px 10px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
                title="Restore your saved draft"
              >
                📂 Load Draft
              </button>

              <button
                type="button"
                onClick={handleDiscardDraft}
                style={{
                  backgroundColor: 'transparent',
                  color: '#ef4444',
                  border: '1px solid #ef4444',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  cursor: 'pointer'
                }}
                title="Delete your draft"
              >
                🗑️ Discard
              </button>
            </>
          )}

          <button
            type="button"
            onClick={handleSaveDraft}
            style={{
              backgroundColor: 'var(--input-bg)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-color)',
              padding: '5px 12px',
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            💾 Save Draft
          </button>
        </div>
      </div>

      {draftSavedMessage && (
        <div style={{
          backgroundColor: '#dcfce7',
          color: '#15803d',
          padding: '6px 12px',
          borderRadius: '6px',
          fontSize: '12px',
          fontWeight: '600'
        }}>
          {draftSavedMessage}
        </div>
      )}

      <input
        type="text"
        placeholder="Report Title"
        value={formData.title}
        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
      />

      <div style={{ display: 'flex', gap: '12px' }}>
        <select
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          style={{ flex: 1 }}
        >
          <option value="roadblock">Roadblock</option>
          <option value="accident">Accident</option>
          <option value="violation">Traffic Violation</option>
          <option value="hazard">Road Hazard</option>
        </select>

        <select
          value={formData.severity}
          onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
          style={{ flex: 1 }}
        >
          <option value="moderate">Moderate</option>
          <option value="high">High</option>
          <option value="severe">Severe</option>
        </select>
      </div>

      <textarea
        placeholder="Description"
        rows="4"
        value={formData.description}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
      />

      <input
        type="text"
        placeholder="Image URL (Optional)"
        value={formData.imageUrl}
        onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
      />

      <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
        <button
          type="button"
          onClick={(e) => {
            handleSubmit(e, false);
            localStorage.removeItem(DRAFT_KEY);
            setHasDraft(false);
          }}
          style={{
            flex: 1,
            padding: '12px',
            backgroundColor: '#ef4444',
            color: '#ffffff',
            border: 'none',
            borderRadius: '6px',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          📢 Publish Normal
        </button>

        <button
          type="button"
          onClick={(e) => {
            handleSubmit(e, true);
            localStorage.removeItem(DRAFT_KEY);
            setHasDraft(false);
          }}
          style={{
            flex: 1,
            padding: '12px',
            backgroundColor: '#475569',
            color: '#ffffff',
            border: 'none',
            borderRadius: '6px',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          Publish Anonymously
        </button>
      </div>
    </form>
  );
}