import React, { useState } from 'react';

export default function ReportCard({ report, userRole, onVote, onUpdateStatus, onDelete }) {
  const [commentText, setCommentText] = useState('');

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    
    // Pass comment up to parent if callback exists
    if (report.onAddComment) {
      report.onAddComment(report.id, commentText);
    }
    setCommentText('');
  };

  return (
    <div className={`card report-card type-${report.category || 'info'}`}>
      {/* Card Header & Badges */}
      <div className="report-header">
        <div>
          <span className={`badge badge-category cat-${report.category}`}>
            {report.category ? report.category.toUpperCase() : 'GENERAL'}
          </span>
          <h3 className="report-title">{report.title}</h3>
          <p className="report-subtext">
            📍 {report.location || 'Unknown Location'} • Posted by{' '}
            <span className="author-name">{report.author || 'Anonymous'}</span> •{' '}
            {report.timestamp || 'Recently'}
          </p>
        </div>

        <div className="report-badges">
          {report.status && (
            <span className={`badge badge-authority status-${report.status.toLowerCase()}`}>
              ✓ {report.status}
            </span>
          )}
          {report.flagged && (
            <span className="badge badge-flagged">⚠️ Flagged</span>
          )}
        </div>
      </div>

      {/* Description Body */}
      <p className="report-description">{report.description}</p>

      {/* Voting & General Actions */}
      <div className="report-actions">
        <div className="vote-buttons">
          <button 
            className="btn-vote" 
            onClick={() => onVote && onVote(report.id, 'up')}
            title="Upvote report"
          >
            ▲ <span className="vote-counter">{report.upvotes || 0}</span>
          </button>
          <button 
            className="btn-vote" 
            onClick={() => onVote && onVote(report.id, 'down')}
            title="Downvote report"
          >
            ▼ <span className="vote-counter">{report.downvotes || 0}</span>
          </button>
        </div>

        {/* Quick Delete button available for Mod/Auth */}
        {(userRole === 'moderator' || userRole === 'authority') && (
          <button 
            className="btn-delete" 
            onClick={() => onDelete && onDelete(report.id)}
          >
            🗑️ Delete
          </button>
        )}
      </div>

      {/* Dynamic Role-Based Panel: Moderator */}
      {userRole === 'moderator' && (
        <div className="panel mod-panel" style={{ marginTop: '1rem' }}>
          <span className="panel-title mod-title">🛡️ Moderator Actions</span>
          <div className="panel-actions">
            <button className="btn-mod-warning">
              ⚠️ Flag Content
            </button>
            <button 
              className="btn-mod-danger" 
              onClick={() => onDelete && onDelete(report.id)}
            >
               Remove Post
            </button>
          </div>
        </div>
      )}

      {/* Dynamic Role-Based Panel: Authority */}
      {userRole === 'authority' && (
        <div className="panel authority-panel" style={{ marginTop: '1rem' }}>
          <span className="panel-title authority-title">🚔 Authority Actions</span>
          <div className="panel-actions">
            <button 
              className="btn-auth-success"
              onClick={() => onUpdateStatus && onUpdateStatus(report.id, 'Verified')}
            >
              ✓ Verify Incident
            </button>
            <button 
              className="btn-auth-warning"
              onClick={() => onUpdateStatus && onUpdateStatus(report.id, 'Resolved')}
            >
              Mark Resolved
            </button>
          </div>
        </div>
      )}

      {/* Comments Section */}
      <div className="comments-section" style={{ marginTop: '1.25rem' }}>
        <span className="comments-header">
          💬 Comments ({report.comments ? report.comments.length : 0})
        </span>
        
        {report.comments && report.comments.length > 0 && (
          <div className="comments-list" style={{ margin: '0.5rem 0' }}>
            {report.comments.map((c, idx) => (
              <div key={idx} className="comment-item" style={{ fontSize: '0.85rem', padding: '0.25rem 0' }}>
                <strong className="comment-author">{c.author || 'User'}: </strong>
                <span>{c.text}</span>
              </div>
            ))}
          </div>
        )}

        <form onSubmit={handleCommentSubmit} className="comment-form" style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
          <input 
            type="text" 
            placeholder="Write a comment..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            className="form-input comment-input"
            style={{ flex: 1 }}
          />
          <button type="submit" className="btn btn-secondary-sm">
            Post
          </button>
        </form>
      </div>
    </div>
  );
}