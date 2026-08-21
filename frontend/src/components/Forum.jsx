import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function Forum() {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [commentTexts, setCommentTexts] = useState({}); // প্রতিটি পোস্টের আলাদা কমেন্ট টেক্সট

  const token = localStorage.getItem('token');

  
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
    <div style={{ maxWidth: '700px', margin: '0 auto', padding: '20px', color: '#fff' }}>
      <h2>💬 Community Forum</h2>

      {/* Post Form */}
      <form onSubmit={handlePostSubmit} style={{ marginBottom: '20px' }}>
        <textarea
          value={newPost}
          onChange={(e) => setNewPost(e.target.value)}
          placeholder="Ask a question or share traffic updates with the community..."
          style={{ width: '100%', height: '80px', padding: '10px', borderRadius: '8px', backgroundColor: '#062319', border: '1px solid #1e4d3b', color: '#fff' }}
        />
        <button
          type="submit"
          style={{ marginTop: '8px', padding: '10px 20px', backgroundColor: '#3b82f6', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
        >
          Post Discussion
        </button>
      </form>

      {/* Posts List */}
      {posts.map((post) => (
        <div key={post._id} style={{ backgroundColor: '#0d3326', padding: '16px', borderRadius: '8px', marginBottom: '16px', border: '1px solid #1e5340' }}>
          
          <div style={{ fontWeight: 'bold', color: '#38bdf8', marginBottom: '4px' }}>
            👤 {post.user?.username || post.author || 'Member'}
          </div>
          <p style={{ margin: '0 0 12px 0' }}>{post.content || post.text}</p>

          <hr style={{ borderColor: '#1e5340', margin: '10px 0' }} />

          {/* 💬 */}
          <div style={{ marginLeft: '10px', marginBottom: '10px' }}>
            {post.comments && post.comments.map((comment, index) => (
              <div key={index} style={{ backgroundColor: '#062319', padding: '8px 12px', borderRadius: '6px', marginBottom: '6px', fontSize: '13px' }}>
                <strong style={{ color: '#34d399' }}>{comment.username || 'User'}: </strong>
                <span>{comment.text}</span>
              </div>
            ))}
          </div>

          {/* 💬  */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              placeholder="Write a comment..."
              value={commentTexts[post._id] || ''}
              onChange={(e) => setCommentTexts({ ...commentTexts, [post._id]: e.target.value })}
              style={{ flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid #1e4d3b', backgroundColor: '#062319', color: '#fff' }}
            />
            <button
              onClick={() => handleCommentSubmit(post._id)}
              style={{ padding: '8px 14px', backgroundColor: '#10b981', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              Reply
            </button>
          </div>

        </div>
      ))}
    </div>
  );
}