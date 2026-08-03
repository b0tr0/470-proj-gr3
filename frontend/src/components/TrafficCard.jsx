import React from 'react';

export function TrafficCard({ title, location, status, time }) {
  // Determine badge style based on status
  const badgeClass = status.toLowerCase() === 'accident' || status.toLowerCase() === 'closure' 
    ? 'badge-danger' 
    : 'badge-warning';

  return (
    <div className="traffic-card">
      <div className="card-header">
        <h3>{title}</h3>
        <span className={`badge ${badgeClass}`}>{status}</span>
      </div>
      <p className="card-location">📍 {location}</p>
      <span className="card-time">Updated {time}</span>
    </div>
  );
}
export default TrafficCard;