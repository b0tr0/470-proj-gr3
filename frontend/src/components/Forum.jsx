import { useState } from 'react';

export function Forum() {
  const [posts, setPosts] = useState([
    {
      id: 1,
      author: 'Sarah Jenkins',
      title: 'Road blockage near Downtown Main St.',
      content: 'Construction crews have blocked the left lane due to water pipe repairs.',
      votes: 14,
      userVote: null,
      comments: [
        { id: 101, author: 'Mark T.', content: 'Thanks for the heads up!' }
      ]
    }
  ]);

  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [commentText, setCommentText] = useState({});

  const handleVote = (postId, direction) => {
    setPosts(prev => prev.map(post => {
      if (post.id !== postId) return post;

      let voteDiff = 0;
      let nextVote = direction;

      if (post.userVote === direction) {
        nextVote = null;
        voteDiff = direction === 'up' ? -1 : 1;
      } else {
        const prevValue = post.userVote === 'up' ? 1 : post.userVote === 'down' ? -1 : 0;
        const newValue = direction === 'up' ? 1 : -1;
        voteDiff = newValue - prevValue;
      }

      return { ...post, votes: post.votes + voteDiff, userVote: nextVote };
    }));
  };

  const handleAddPost = (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    const newPost = {
      id: Date.now(),
      author: 'CurrentUser',
      title: newTitle,
      content: newContent,
      votes: 0,
      userVote: null,
      comments: []
    };

    setPosts([newPost, ...posts]);
    setNewTitle('');
    setNewContent('');
  };

  const handleAddComment = (postId) => {
    const text = commentText[postId];
    if (!text?.trim()) return;

    setPosts(prev => prev.map(post => {
      if (post.id !== postId) return post;
      return {
        ...post,
        comments: [...post.comments, { id: Date.now(), author: 'CurrentUser', content: text }]
      };
    }));

    setCommentText({ ...commentText, [postId]: '' });
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h2>Community Discussion Forum</h2>

      <form onSubmit={handleAddPost} style={{ marginBottom: '30px', padding: '15px', border: '1px solid #ddd', borderRadius: '8px' }}>
        <h3>Create a Post</h3>
        <input 
          type="text" 
          placeholder="Title" 
          value={newTitle} 
          onChange={(e) => setNewTitle(e.target.value)}
          style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
        />
        <textarea 
          placeholder="What's happening?" 
          value={newContent} 
          onChange={(e) => setNewContent(e.target.value)}
          style={{ width: '100%', padding: '8px', height: '80px', marginBottom: '10px' }}
        />
        <button type="submit" style={{ padding: '8px 16px', background: '#0070f3', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Post</button>
      </form>

      {posts.map(post => (
        <div key={post.id} style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '15px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', gap: '15px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <button 
                onClick={() => handleVote(post.id, 'up')}
                style={{ color: post.userVote === 'up' ? 'green' : 'black', cursor: 'pointer', border: 'none', background: 'none' }}
              >
                ▲
              </button>
              <span>{post.votes}</span>
              <button 
                onClick={() => handleVote(post.id, 'down')}
                style={{ color: post.userVote === 'down' ? 'red' : 'black', cursor: 'pointer', border: 'none', background: 'none' }}
              >
                ▼
              </button>
            </div>

            <div style={{ flex: 1 }}>
              <h4 style={{ margin: '0 0 5px 0' }}>{post.title}</h4>
              <small style={{ color: '#666' }}>Posted by {post.author}</small>
              <p>{post.content}</p>

              <div style={{ marginTop: '15px', background: '#f9f9f9', padding: '10px', borderRadius: '6px' }}>
                <h5>Comments ({post.comments.length})</h5>
                {post.comments.map(c => (
                  <p key={c.id} style={{ fontSize: '14px', margin: '5px 0' }}>
                    <strong>{c.author}:</strong> {c.content}
                  </p>
                ))}

                <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                  <input 
                    type="text" 
                    placeholder="Write a comment..." 
                    value={commentText[post.id] || ''}
                    onChange={(e) => setCommentText({ ...commentText, [post.id]: e.target.value })}
                    style={{ flex: 1, padding: '6px' }}
                  />
                  <button onClick={() => handleAddComment(post.id)} style={{ padding: '6px 12px' }}>Comment</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
export default Forum;