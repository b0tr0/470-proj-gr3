import { useState } from 'react';

export function FriendList() {
  const [friends, setFriends] = useState([
    { id: 1, name: 'Alice Smith', status: 'Accepted' },
    { id: 2, name: 'Bob Johnson', status: 'Pending' }
  ]);
  const [searchQuery, setSearchQuery] = useState('');

  const handleAddFriend = () => {
    if (!searchQuery.trim()) return;
    setFriends([...friends, { id: Date.now(), name: searchQuery, status: 'Pending' }]);
    setSearchQuery('');
  };

  const handleAccept = (id) => {
    setFriends(friends.map(f => f.id === id ? { ...f, status: 'Accepted' } : f));
  };

  const handleRemove = (id) => {
    setFriends(friends.filter(f => f.id !== id));
  };

  return (
    <div style={{ maxWidth: '500px', margin: '0 auto', padding: '20px' }}>
      <h3>Friends List</h3>
      
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <input 
          type="text" 
          placeholder="Search user by name..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ flex: 1, padding: '8px' }}
        />
        <button onClick={handleAddFriend} style={{ padding: '8px 16px', cursor: 'pointer' }}>Add Friend</button>
      </div>

      <ul style={{ listStyle: 'none', padding: 0 }}>
        {friends.map(friend => (
          <li key={friend.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', borderBottom: '1px solid #eee' }}>
            <div>
              <strong>{friend.name}</strong>
              <span style={{ fontSize: '12px', marginLeft: '10px', color: friend.status === 'Accepted' ? 'green' : 'orange' }}>
                ({friend.status})
              </span>
            </div>
            <div>
              {friend.status === 'Pending' && (
                <button onClick={() => handleAccept(friend.id)} style={{ marginRight: '5px', padding: '4px 8px', cursor: 'pointer' }}>Accept</button>
              )}
              <button onClick={() => handleRemove(friend.id)} style={{ padding: '4px 8px', color: 'red', cursor: 'pointer' }}>Remove</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
export default FriendList;