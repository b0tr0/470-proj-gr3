import { useState, useEffect } from 'react';
import API from '../api';



export function FriendList() {
  const [friends, setFriends] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchFriends();
  }, []);

  const fetchFriends = async () => {
    try {
      const { data } = await API.get('/friends');
      setFriends(data);
    } catch (err) {
      console.error('Failed to load friends:', err);
    }
  };

  const handleAddFriend = async () => {
    if (!searchQuery.trim()) return;
    try {
      await API.post('/friends/add', { targetUsername: searchQuery });
      fetchFriends();
      setSearchQuery('');
    } catch (err) {
      alert(err.response?.data?.message || 'Error adding friend');
    }
  };

  const handleRemove = async (friendId) => {
    if (!window.confirm('Remove this friend?')) return;
    try {
      await API.delete(`/friends/${friendId}`);
      setFriends(friends.filter(f => f._id !== friendId));
    } catch (err) {
      alert('Failed to remove friend');
    }
  };

  return (
    <div style={{ maxWidth: '500px', margin: '0 auto', padding: '20px' }}>
      <h3>Friends List</h3>
      <LocationShare />
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Search user by username..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ flex: 1, padding: '8px' }}
        />
        <button onClick={handleAddFriend} style={{ padding: '8px 16px', cursor: 'pointer' }}>Add Friend</button>
      </div>

      <ul style={{ listStyle: 'none', padding: 0 }}>
        {friends.map(friend => (
          <li key={friend._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', borderBottom: '1px solid #eee' }}>
            <div>
              <strong>{friend.username}</strong>
            </div>
            <div>
              <button onClick={() => handleRemove(friend._id)} style={{ padding: '4px 8px', color: 'red', cursor: 'pointer' }}>Remove</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
export default FriendList;