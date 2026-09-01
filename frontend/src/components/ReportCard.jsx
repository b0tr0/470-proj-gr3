import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import API from '../api';
import TrustBadge from './TrustBadge';

import markerIconPng from 'leaflet/dist/images/marker-icon.png';
const customIcon = new L.Icon({
  iconUrl: markerIconPng,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

export default function ReportCard({ report, currentUserId, userRole, refreshReports }) {
  const [deleting, setDeleting] = useState(false);
  const [deleteReason, setDeleteReason] = useState('resolved');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [timeLeft, setTimeLeft] = useState('');
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [votingReport, setVotingReport] = useState(false);
  const [votingCommentId, setVotingCommentId] = useState(null);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const createdTime = new Date(report.createdAt || Date.now()).getTime();
      const durationHours = report.expirationHours || 24;
      const expireTime = createdTime + durationHours * 60 * 60 * 1000;
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

  // Ownership and role checks
  const authorObj = typeof report.postedBy === 'object' && report.postedBy !== null ? report.postedBy : {};
  const postAuthorId = (authorObj._id || report.postedBy || report.user || '').toString();
  const isOwner = Boolean(currentUserId && postAuthorId === currentUserId.toString());
  const userRoleStr = (userRole || '').toString().toLowerCase().trim();
  const isPrivileged = ['authority', 'moderator', 'community moderator', 'admin'].includes(userRoleStr);
  const canDelete = isOwner || isPrivileged;

  // Report Voting
  const upvotesArr = Array.isArray(report.upvotes) ? report.upvotes : [];
  const downvotesArr = Array.isArray(report.downvotes) ? report.downvotes : [];
  const hasUpvoted = Boolean(currentUserId && upvotesArr.some((id) => (id._id || id).toString() === currentUserId.toString()));
  const hasDownvoted = Boolean(currentUserId && downvotesArr.some((id) => (id._id || id).toString() === currentUserId.toString()));
  const netVotes = report.votes !== undefined ? report.votes : (upvotesArr.length - downvotesArr.length);

  const handleVoteReport = async (actionType) => {
    if (!currentUserId) {
      alert('Please log in to vote on report feeds.');
      return;
    }

    try {
      setVotingReport(true);
      await API.put(`/reports/${report._id || report.id}/vote`, { type: actionType });
      if (refreshReports) refreshReports();
    } catch (err) {
      console.error('Report voting error:', err);
      alert(err.response?.data?.message || 'Failed to register vote.');
    } finally {
      setVotingReport(false);
    }
  };

  // Delete Handler with Reason
  const handleDelete = async () => {
    const reportId = report._id || report.id;
    try {
      setDeleting(true);
      if (isPrivileged) {
        await API.delete(`/reports/${reportId}`, { data: { deleteReason } });
      } else {
        await API.delete(`/reports/${reportId}`);
      }
      alert('Report deleted successfully!');
      if (refreshReports) refreshReports();
    } catch (err) {
      console.error('Delete error:', err);
      alert(err.response?.data?.message || 'Failed to delete report.');
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  // Comment Submission
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      setSubmittingComment(true);
      await API.post(`/reports/${report._id || report.id}/comment`, { text: commentText.trim() });
      setCommentText('');
      if (refreshReports) refreshReports();
    } catch (err) {
      console.error('Error adding comment:', err);
      alert(err.response?.data?.message || 'Failed to submit comment.');
    } finally {
      setSubmittingComment(false);
    }
  };

  // Comment Voting
  const handleVoteComment = async (commentId, actionType) => {
    if (!currentUserId) {
      alert('Please log in to vote on comments.');
      return;
    }

    try {
      setVotingCommentId(commentId);
      await API.put(`/reports/${report._id || report.id}/comments/${commentId}/vote`, { type: actionType });
      if (refreshReports) refreshReports();
    } catch (err) {
      console.error('Comment voting error:', err);
      alert(err.response?.data?.message || 'Failed to vote on comment.');
    } finally {
      setVotingCommentId(null);
    }
  };

  const hasLocation = Boolean(
    (report.location && typeof report.location.lat === 'number' && typeof report.location.lng === 'number') ||
    (typeof report.lat === 'number' && typeof report.lng === 'number')
  );
  const reportLat = (report.location && typeof report.location.lat === 'number') ? report.location.lat : report.lat;
  const reportLng = (report.location && typeof report.location.lng === 'number') ? report.location.lng : report.lng;
  const authorName = report.isAnonymous ? 'Anonymous' : (authorObj.username || report.username || 'User');

  return (
    <div style={{
      backgroundColor: 'var(--bg-card, #ffffff)',
      borderRadius: '12px',
      padding: '18px',
      color: 'var(--text-primary, #0f172a)',
      position: 'relative',
      border: '1px solid var(--border-color, #e2e8f0)',
      boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
      transition: 'all 0.3s ease'
    }}>
      {/* Header Info */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: 'var(--text-secondary, #64748b)', marginBottom: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>ID: {report.reportId || (report._id ? report._id.slice(-6) : 'N/A')}</span>
          <span style={{
            textTransform: 'uppercase',
            fontSize: '11px',
            fontWeight: 'bold',
            padding: '2px 8px',
            borderRadius: '12px',
            backgroundColor: report.severity === 'severe' ? '#fee2e2' : report.severity === 'high' ? '#ffedd5' : '#f0fdf4',
            color: report.severity === 'severe' ? '#dc2626' : report.severity === 'high' ? '#c2410c' : '#15803d'
          }}>
            {report.severity || 'moderate'}
          </span>
        </div>
        <span style={{ fontWeight: 'bold', color: timeLeft === 'Expired' ? '#ef4444' : '#d97706' }}>
          ⌛ {timeLeft === 'Expired' ? 'Expired' : `Active (${timeLeft})`}
        </span>
      </div>

      {/* Title & Description */}
      <h3 style={{ margin: '0 0 8px 0', fontSize: '1.25rem', color: 'var(--text-primary, #0f172a)' }}>
        {report.title || report.category}
      </h3>

      <p style={{ margin: '0 0 14px 0', color: 'var(--text-primary, #334155)', fontSize: '0.95rem', lineHeight: '1.5' }}>
        {report.description || report.content}
      </p>

      {/* Incident Map View - Only attached if location sharing was toggled on */}
      {hasLocation && (
        <div style={{ height: '160px', width: '100%', borderRadius: '8px', overflow: 'hidden', marginBottom: '14px', border: '1px solid var(--border-color, #e2e8f0)' }}>
          <MapContainer center={[reportLat, reportLng]} zoom={13} style={{ height: '100%', width: '100%' }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <Marker position={[reportLat, reportLng]} icon={customIcon}>
              <Popup>{report.title || 'Report Location'}</Popup>
            </Marker>
          </MapContainer>
        </div>
      )}

      {report.imageUrl && (
        <img
          src={report.imageUrl}
          alt="Report"
          style={{ maxWidth: '100%', maxHeight: '220px', borderRadius: '8px', marginBottom: '14px', objectFit: 'cover' }}
        />
      )}

      {/* Action Row: Author, Voting, and Delete */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justify: 'space-between',
        alignItems: 'center',
        gap: '12px',
        paddingTop: '12px',
        borderTop: '1px solid var(--border-color, #f1f5f9)',
        fontSize: '13px'
      }}>
        {/* Author Info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: 'var(--text-secondary, #475569)' }}>
            Posted by: <b>{authorName}</b>
          </span>
          {!report.isAnonymous && authorObj.trustScore !== undefined && (
            <TrustBadge score={authorObj.trustScore} role={authorObj.role} />
          )}
        </div>

        {/* Report Upvote / Downvote Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            disabled={votingReport}
            onClick={() => handleVoteReport('upvote')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              backgroundColor: hasUpvoted ? '#10b981' : 'var(--input-bg, #f1f5f9)',
              color: hasUpvoted ? '#ffffff' : 'var(--text-primary, #0f172a)',
              border: '1px solid var(--border-color, #cbd5e1)',
              padding: '5px 12px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            title="Upvote report"
          >
            ▲ Upvote
          </button>

          <span style={{
            fontSize: '13px',
            fontWeight: 'bold',
            color: netVotes > 0 ? '#10b981' : netVotes < 0 ? '#ef4444' : 'var(--text-secondary, #64748b)',
            minWidth: '45px',
            textAlign: 'center'
          }}>
            {netVotes} {Math.abs(netVotes) === 1 ? 'vote' : 'votes'}
          </span>

          <button
            type="button"
            disabled={votingReport}
            onClick={() => handleVoteReport('downvote')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              backgroundColor: hasDownvoted ? '#ef4444' : 'var(--input-bg, #f1f5f9)',
              color: hasDownvoted ? '#ffffff' : 'var(--text-primary, #0f172a)',
              border: '1px solid var(--border-color, #cbd5e1)',
              padding: '5px 12px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            title="Downvote report"
          >
            ▼ Downvote
          </button>
        </div>

        {/* Delete Controls */}
        {canDelete && (
          <div>
            {!showDeleteConfirm ? (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                disabled={deleting}
                style={{
                  backgroundColor: '#ef4444',
                  color: '#ffffff',
                  border: 'none',
                  padding: '6px 14px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                🗑️ Delete
              </button>
            ) : (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: 'var(--input-bg, #f8fafc)',
                padding: '6px 10px',
                borderRadius: '8px',
                border: '1px solid var(--border-color, #cbd5e1)'
              }}>
                {isPrivileged && (
                  <select
                    value={deleteReason}
                    onChange={(e) => setDeleteReason(e.target.value)}
                    style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      margin: 0,
                      width: 'auto'
                    }}
                  >
                    <option value="resolved">Claiming Resolved</option>
                    <option value="irrelevant">Irrelevant / Misleading</option>
                    <option value="privacy">Privacy Concern</option>
                    <option value="other">Other</option>
                  </select>
                )}
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleting}
                  style={{
                    backgroundColor: '#dc2626',
                    color: '#ffffff',
                    border: 'none',
                    padding: '4px 10px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                >
                  {deleting ? 'Deleting...' : 'Confirm'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  style={{
                    backgroundColor: 'transparent',
                    color: 'var(--text-secondary, #64748b)',
                    border: 'none',
                    padding: '4px 8px',
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Comments Section */}
      <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px dashed var(--border-color, #e2e8f0)' }}>
        <h4 style={{ margin: '0 0 10px 0', fontSize: '0.95rem', color: 'var(--text-primary, #0f172a)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          💬 Comments ({report.comments ? report.comments.length : 0})
        </h4>

        {/* Existing Comments List */}
        {report.comments && report.comments.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
            {report.comments.map((comment) => {
              const cUpvotes = Array.isArray(comment.upvotes) ? comment.upvotes : [];
              const cDownvotes = Array.isArray(comment.downvotes) ? comment.downvotes : [];
              const cHasUpvoted = Boolean(currentUserId && cUpvotes.some((id) => (id._id || id).toString() === currentUserId.toString()));
              const cHasDownvoted = Boolean(currentUserId && cDownvotes.some((id) => (id._id || id).toString() === currentUserId.toString()));
              const cNetVotes = comment.votes !== undefined ? comment.votes : (cUpvotes.length - cDownvotes.length);
              const commentId = comment._id || comment.id;

              return (
                <div
                  key={commentId}
                  style={{
                    backgroundColor: 'var(--input-bg, #f8fafc)',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color, #e2e8f0)',
                    display: 'flex',
                    justify: 'space-between',
                    alignItems: 'center',
                    gap: '10px'
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', marginBottom: '3px' }}>
                      <strong style={{ color: '#0284c7' }}>{comment.username || 'User'}</strong>
                      <span style={{ color: 'var(--text-secondary, #94a3b8)', fontSize: '11px' }}>
                        {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-primary, #334155)' }}>
                      {comment.text}
                    </div>
                  </div>

                  {/* Comment Vote Controls */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <button
                      type="button"
                      disabled={votingCommentId === commentId}
                      onClick={() => handleVoteComment(commentId, 'upvote')}
                      style={{
                        backgroundColor: cHasUpvoted ? '#10b981' : 'transparent',
                        color: cHasUpvoted ? '#ffffff' : 'var(--text-primary, #475569)',
                        border: '1px solid var(--border-color, #cbd5e1)',
                        padding: '2px 7px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        cursor: 'pointer',
                        fontWeight: 'bold'
                      }}
                      title="Upvote comment"
                    >
                      ▲
                    </button>
                    <span style={{
                      fontSize: '11px',
                      fontWeight: 'bold',
                      minWidth: '20px',
                      textAlign: 'center',
                      color: cNetVotes > 0 ? '#10b981' : cNetVotes < 0 ? '#ef4444' : 'var(--text-secondary, #64748b)'
                    }}>
                      {cNetVotes}
                    </span>
                    <button
                      type="button"
                      disabled={votingCommentId === commentId}
                      onClick={() => handleVoteComment(commentId, 'downvote')}
                      style={{
                        backgroundColor: cHasDownvoted ? '#ef4444' : 'transparent',
                        color: cHasDownvoted ? '#ffffff' : 'var(--text-primary, #475569)',
                        border: '1px solid var(--border-color, #cbd5e1)',
                        padding: '2px 7px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        cursor: 'pointer',
                        fontWeight: 'bold'
                      }}
                      title="Downvote comment"
                    >
                      ▼
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p style={{ fontSize: '12px', color: 'var(--text-secondary, #64748b)', margin: '0 0 12px 0' }}>
            No comments yet. Be the first to join the conversation!
          </p>
        )}

        {/* Add Comment Form */}
        <form onSubmit={handleCommentSubmit} style={{ display: 'flex', gap: '8px', margin: 0 }}>
          <input
            type="text"
            placeholder="Write a comment..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            style={{
              flex: 1,
              padding: '8px 12px',
              borderRadius: '6px',
              border: '1.5px solid var(--input-border, #cbd5e1)',
              backgroundColor: 'var(--input-bg, #ffffff)',
              color: 'var(--input-text, #0f172a)',
              fontSize: '0.88rem',
              margin: 0
            }}
          />
          <button
            type="submit"
            disabled={submittingComment || !commentText.trim()}
            style={{
              padding: '8px 16px',
              backgroundColor: '#10b981',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              cursor: submittingComment || !commentText.trim() ? 'not-allowed' : 'pointer',
              fontWeight: 'bold',
              fontSize: '12px',
              opacity: !commentText.trim() ? 0.7 : 1
            }}
          >
            {submittingComment ? 'Sending...' : 'Reply'}
          </button>
        </form>
      </div>
    </div>
  );
}