import React, { useState, useEffect } from 'react';
import API from '../api';
import TrustBadge from './TrustBadge';

export default function ReportCard({ report, currentUserId, userRole, refreshReports }) {
  const [deleting, setDeleting] = useState(false);
  const [voting, setVoting] = useState(false);
  const [timeLeft, setTimeLeft] = useState('');

  const isVerified = report.authorityStatus === 'verified' || report.isVerified;

  // Report Expiration Timer Calculation
  useEffect(() => {
    const calculateTimeLeft = () => {
      let expireTime;
      if (report.expiresAt) {
        expireTime = new Date(report.expiresAt).getTime();
      } else {
        const createdTime = new Date(report.createdAt || Date.now()).getTime();
        const durationHours = report.expirationHours || 24;
        expireTime = createdTime + durationHours * 60 * 60 * 1000;
      }

      const difference = expireTime - Date.now();

      if (difference <= 0) {
        setTimeLeft('Expired');
      } else {
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((difference / 1000 / 60) % 60);
        setTimeLeft(`${hours}h ${minutes}m left`);
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 60000);
    return () => clearInterval(timer);
  }, [report]);

  // Vote Handler (Single Request)
  const handleVote = async (actionType) => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please log in to vote on incident reports.');
      return;
    }

    try {
      setVoting(true);
      await API.put(`/reports/${report._id || report.id}/vote`, { type: actionType });
      
      // Dispatch score update for immediate Navbar badge sync
      window.dispatchEvent(new Event('trustScoreUpdated'));

      if (refreshReports) refreshReports();
    } catch (err) {
      console.error('Vote error:', err);
      alert(err.response?.data?.message || 'Failed to register vote.');
    } finally {
      setVoting(false);
    }
  };

  // Delete Handler
  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this report?')) return;

    try {
      setDeleting(true);
      await API.delete(`/reports/${report._id || report.id}`);
      alert('Report deleted successfully!');
      if (refreshReports) refreshReports();
    } catch (err) {
      console.error('Delete error:', err);
      alert(err.response?.data?.message || 'Failed to delete report.');
    } finally {
      setDeleting(false);
    }
  };

  const isOwner = (report.user === currentUserId) || 
                  (report.postedBy?._id === currentUserId) || 
                  (report.postedBy === currentUserId);
  const normalizedUserRole = (userRole || '').toString().toLowerCase().trim();
  const isPrivileged = ['admin', 'moderator', 'community moderator', 'authority'].includes(normalizedUserRole);
  const canDelete = isOwner || isPrivileged;

  // Calculate total votes cleanly
  const upvotesLen = Array.isArray(report.upvotes) ? report.upvotes.length : 0;
  const downvotesLen = Array.isArray(report.downvotes) ? report.downvotes.length : 0;
  const totalVotes = report.votes !== undefined ? report.votes : (upvotesLen - downvotesLen);

  const authorName = report.isAnonymous
    ? 'Anonymous'
    : (report.postedBy?.username || report.username || 'Registered User');

  const authorTrustScore = report.postedBy?.trustScore ?? 100;
  const authorRole = report.postedBy?.role;

  return (
    <div style={{
      backgroundColor: 'var(--bg-card)',
      borderRadius: '10px',
      padding: '18px',
      color: 'var(--text-primary)',
      position: 'relative',
      border: isVerified ? '2px solid #10b981' : '1px solid var(--border-color)',
      borderLeft: isVerified ? '6px solid #10b981' : '1px solid var(--border-color)',
      boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
      transition: 'all 0.3s ease'
    }}>
      {/* Header: ID, Verified Badge & Expiration Timer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span>ID: {report.reportId || (report._id ? report._id.slice(-6) : 'N/A')}</span>
          {isVerified && (
            <span style={{
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              color: '#10b981',
              border: '1px solid #10b981',
              borderRadius: '12px',
              padding: '2px 8px',
              fontSize: '11px',
              fontWeight: 'bold',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              ✓ Verified by Authority
            </span>
          )}
        </div>
        <span style={{ fontWeight: 'bold', color: timeLeft === 'Expired' ? 'var(--accent-red)' : '#d97706' }}>
          ⌛ {timeLeft === 'Expired' ? 'Expired' : `Active (${timeLeft})`}
        </span>
      </div>

      <h3 style={{ margin: '0 0 6px 0', fontSize: '1.2rem', color: 'var(--text-primary)' }}>
        {report.title || report.category}
      </h3>

      <p style={{ margin: '0 0 12px 0', color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.5' }}>
        {report.description || report.content}
      </p>

      {report.imageUrl && (
        <img
          src={report.imageUrl}
          alt="Report"
          style={{ maxWidth: '100%', maxHeight: '220px', borderRadius: '8px', marginBottom: '12px', objectFit: 'cover' }}
        />
      )}

      {/* Voting Bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
        <button
          type="button"
          disabled={voting}
          onClick={() => handleVote('upvote')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            backgroundColor: 'var(--input-bg)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-color)',
            padding: '4px 10px',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
          title="Upvote report"
        >
          ▲ Upvote
        </button>

        <span style={{
          fontSize: '13px',
          fontWeight: 'bold',
          color: totalVotes > 0 ? '#10b981' : totalVotes < 0 ? 'var(--accent-red)' : 'var(--text-secondary)'
        }}>
          {totalVotes} {Math.abs(totalVotes) === 1 ? 'vote' : 'votes'}
        </span>

        <button
          type="button"
          disabled={voting}
          onClick={() => handleVote('downvote')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            backgroundColor: 'var(--input-bg)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-color)',
            padding: '4px 10px',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
          title="Downvote report"
        >
          ▼ Downvote
        </button>
      </div>

      {/* Footer with Author Badge and Delete Button */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: '8px',
        paddingTop: '10px',
        borderTop: '1px solid var(--border-color)',
        fontSize: '13px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: 'var(--text-secondary)' }}>
            Posted by: <strong style={{ color: 'var(--text-primary)' }}>{authorName}</strong>
          </span>
          {!report.isAnonymous && <TrustBadge score={authorTrustScore} role={authorRole} />}
        </div>

        {canDelete && (
          <button
            onClick={handleDelete}
            disabled={deleting}
            style={{
              backgroundColor: 'var(--accent-red)',
              color: '#ffffff',
              border: 'none',
              padding: '6px 14px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '12px'
            }}
          >
            🗑️ {deleting ? 'Deleting...' : 'Delete'}
          </button>
        )}
      </div>
    </div>
  );
}