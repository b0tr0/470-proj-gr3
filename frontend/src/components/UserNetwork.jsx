import React, { useState } from 'react';

const Network = () => {
  const [friendName, setFriendName] = useState("");
  const [friends, setFriends] = useState([
    { id: 1, name: "Sarah Jenkins", status: "Commuting" },
    { id: 2, name: "Dave Miller", status: "Idle" },
    { id: 3, name: "Alex Rivera", status: "Driving" }
  ]);

  const handleAddFriend = (e) => {
    e.preventDefault();
    if (!friendName.trim()) return;

    const newFriend = {
      id: Date.now(),
      name: friendName,
      status: "Active"
    };

    setFriends([...friends, newFriend]);
    setFriendName(""); 
  };

  return (
    <div className="p-6 bg-emerald-950 min-h-screen text-black flex justify-center gap-6">
      <div className="bg-white p-5 rounded-2xl w-80 shadow-lg">
        <h3 className="font-bold text-lg mb-4 text-gray-800">👤 User Friend List</h3>
        
        <form onSubmit={handleAddFriend} className="flex gap-2 mb-4">
          <input
            type="text"
            placeholder="Enter name"
            value={friendName}
            onChange={(e) => setFriendName(e.target.value)}
            className="border border-gray-300 p-2 rounded-lg text-sm w-full outline-none focus:border-red-500"
          />
          <button type="submit" className="bg-red-500 hover:bg-red-600 text-white font-medium px-4 py-2 rounded-lg text-sm whitespace-nowrap transition">
            Add Friend
          </button>
        </form>

        <div className="space-y-3">
          {friends.map((friend) => (
            <div key={friend.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-xl border border-gray-100">
              <span className="font-semibold text-gray-700 text-sm">{friend.name}</span>
              <span className="text-xs bg-slate-200 text-slate-700 px-2.5 py-1 rounded-full font-medium">
                {friend.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Network;