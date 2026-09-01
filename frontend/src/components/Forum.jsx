import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TrustBadge from '../components/TrustBadge';

export default function Forum() {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [commentTexts, setCommentTexts] = useState({});

  const token = localStorage.getItem('token');
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
  const currentUserId = userInfo._id || userInfo.id;
  const userRole = (userInfo.role || userInfo.userType || '').toString().toLowerCase().trim();
  const isPrivileged = ['authority', 'moderator', 'community moderator', 'admin'].includes(userRole);

  const fetchPosts = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/forum');
      setPosts(res.data || []);
    } catch (err) {
      console.error('Error fetching forum posts:', err);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    if (!newPost.trim()) return;

    try {
      await axios.post(
        'http://localhost:5000/api/forum',
        { content: newPost },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewPost('');
      fetchPosts();
    } catch (err) {
      console.error('Error creating post:', err);
    }
  };

  // Upvote / Downvote Handler
  const handleVote = async (postId, actionType) => {
    if (!token) {
      alert('Please log in to vote on discussions.');
      return;
    }

    try {
      await axios.put(
        `http://localhost:5000/api/forum/${postId}/vote`,
        { type: actionType },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      window.dispatchEvent(new Event('trustScoreUpdated'));
      fetchPosts();
    } catch (err) {
      console.error('Voting error:', err.response?.data || err.message);
      alert(err.response?.data?.message || 'Failed to register vote.');
    }
  };

  // Delete Handler for Author, Authority, or Moderator
  const handleDeletePost = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this discussion?')) return;

    try {
      await axios.delete(`http://localhost:5000/api/forum/${postId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Post deleted successfully.');
      setPosts((prev) => prev.filter((p) => p._id !== postId));
    } catch (err) {
      console.error('Delete error:', err);
      alert(err.response?.data?.message || 'Failed to delete post.');
    }
  };

  const handleCommentSubmit = async (postId) => {
    const text = commentTexts[postId];
    if (!text || !text.trim()) return;

    try {
      await axios.post(
        `http://localhost:5000/api/forum/${postId}/comment`,
        { text },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCommentTexts({ ...commentTexts, [postId]: '' });
      fetchPosts();
    } catch (err) {
      console.error('Error adding comment:', err);
    }
  };

  return (
    <div style={{
      maxWidth: '720px',
      margin: '0 auto',
      padding: '24px',
      color: 'var(--text-primary)',
      transition: 'color 0.3s ease'
    }}>
      <h2 style={{ color: 'var(--text-primary)', marginBottom: '18px' }}>💬 Community Forum</h2>

      {/* Post Creation Box */}
      <form onSubmit={handlePostSubmit} style={{
        backgroundColor: 'var(--bg-card)',
        padding: '18px',
        borderRadius: '12px',
        border: '1px solid var(--border-color)',
        marginBottom: '24px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
      }}>
        <textarea
          value={newPost}
          onChange={(e) => setNewPost(e.target.value)}
          placeholder="Ask a question or share traffic updates with the community..."
          rows="3"
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: '8px',
            backgroundColor: 'var(--input-bg)',
            border: '1.5px solid var(--input-border)',
            color: 'var(--input-text)',
            fontSize: '0.95rem',
            boxSizing: 'border-box'
          }}
        />
        <button
          type="submit"
          style={{
            marginTop: '10px',
            padding: '10px 22px',
            backgroundColor: '#2563eb',
            color: '#ffffff',
            border: 'none',
            borderRadius: '6px',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          Post Discussion
        </button>
      </form>

      {/* Posts List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {posts.map((post) => {
          const upvotesLen = Array.isArray(post.upvotes) ? post.upvotes.length : 0;
          const downvotesLen = Array.isArray(post.downvotes) ? post.downvotes.length : 0;
          const totalVotes = post.votes !== undefined ? post.votes : (upvotesLen - downvotesLen);

          const authorObj = post.user || post.postedBy || {};
          const postAuthorId = authorObj._id || post.user || post.postedBy;
          const isAuthor = currentUserId && String(postAuthorId) === String(currentUserId);
          const canDelete = isAuthor || isPrivileged;

          return (
            <div key={post._id} style={{
              backgroundColor: 'var(--bg-card)',
              padding: '18px',
              borderRadius: '10px',
              border: '1px solid var(--border-color)',
              boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
              transition: 'all 0.3s ease'
            }}>
              {/* Header: Author + Trust/Authority Badge + Delete */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontWeight: 'bold', color: '#0284c7', fontSize: '14px' }}>
                    👤 {authorObj.username || post.author || 'Member'}
                  </span>
                  <TrustBadge score={authorObj.trustScore ?? 100} role={authorObj.role} />
                </div>

                {canDelete && (
                  <button
                    onClick={() => handleDeletePost(post._id)}
                    style={{
                      backgroundColor: 'transparent',
                      color: 'var(--accent-red)',
                      border: '1px solid var(--accent-red)',
                      padding: '3px 8px',
                      borderRadius: '5px',
                      fontSize: '11px',
                      fontWeight: 'bold',
                      cursor: 'pointer'
                    }}
                    title="Delete Post"
                  >
                    🗑 Delete
                  </button>
                )}
              </div>

              <p style={{ margin: '0 0 14px 0', fontSize: '0.95rem', color: 'var(--text-primary)', lineHeight: '1.5' }}>
                {post.content || post.text}
              </p>

              {/* Voting Bar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                <button
                  type="button"
                  onClick={() => handleVote(post._id, 'upvote')}
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
                  title="Upvote post"
                >
                  ▲ Upvote
                </button>

                <span style={{
                  fontSize: '13px',
                  fontWeight: 'bold',
                  color: totalVotes > 0 ? '#10b981' : totalVotes < 0 ? '#ef4444' : 'var(--text-secondary)'
                }}>
                  {totalVotes} {Math.abs(totalVotes) === 1 ? 'vote' : 'votes'}
                </span>

                <button
                  type="button"
                  onClick={() => handleVote(post._id, 'downvote')}
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
                  title="Downvote post"
                >
                  ▼ Downvote
                </button>
              </div>

              <hr style={{ borderColor: 'var(--border-color)', margin: '12px 0' }} />

              {/* Comments Section */}
              <div style={{ marginLeft: '6px', marginBottom: '12px' }}>
                {post.comments && post.comments.map((comment, index) => (
                  <div key={index} style={{
                    backgroundColor: 'var(--input-bg)',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    marginBottom: '6px',
                    fontSize: '13px',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)'
                  }}>
                    <strong style={{ color: '#10b981' }}>{comment.username || 'User'}: </strong>
                    <span>{comment.text}</span>
                  </div>
                ))}
              </div>

              {/* Comment Input */}
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  placeholder="Write a comment..."
                  value={commentTexts[post._id] || ''}
                  onChange={(e) => setCommentTexts({ ...commentTexts, [post._id]: e.target.value })}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1.5px solid var(--input-border)',
                    backgroundColor: 'var(--input-bg)',
                    color: 'var(--input-text)'
                  }}
                />
                <button
                  onClick={() => handleCommentSubmit(post._id)}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#10b981',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: '13px'
                  }}
                >
                  Reply
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}