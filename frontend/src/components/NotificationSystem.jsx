import { useState, useEffect } from 'react';

const incomingReports = [
  { id: 1, title: 'Severe Collision', lat: 51.507, lng: -0.09, votes: 20 },
  { id: 2, title: 'Minor Pothole', lat: 51.515, lng: -0.10, votes: 3 },
];

const THRESHOLD = 15;

export function NotificationSystem() {
  const [notifications, setNotifications] = useState([]);
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => setUserLocation({ lat: 51.505, lng: -0.09 })
      );
    }
  }, []);

  useEffect(() => {
    if (!userLocation) return;

    const highPriorityAlerts = incomingReports.filter(report => {
      const isHighUpvoted = report.votes >= THRESHOLD;
      const isNearby = Math.abs(report.lat - userLocation.lat) < 0.05 && Math.abs(report.lng - userLocation.lng) < 0.05;
      return isHighUpvoted && isNearby;
    });

    setNotifications(highPriorityAlerts);
  }, [userLocation]);

  return (
    <div style={{ padding: '15px', backgroundColor: '#fff8e1', border: '1px solid #ffe082', borderRadius: '8px', maxWidth: '400px' }}>
      <h4>🔔 Emergency Alerts ({notifications.length})</h4>
      {notifications.length === 0 ? (
        <p style={{ fontSize: '14px', color: '#666' }}>No high-priority alerts nearby.</p>
      ) : (
        notifications.map(n => (
          <div key={n.id} style={{ borderLeft: '4px solid #ff9800', paddingLeft: '8px', margin: '8px 0' }}>
            <strong>{n.title}</strong>
            <p style={{ margin: 0, fontSize: '12px' }}>{n.votes} user confirmations — Near your area</p>
          </div>
        ))
      )}
    </div>
  );
}
export default NotificationSystem;