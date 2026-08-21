import { useState, useEffect } from 'react';
import API from '../api';

const THRESHOLD = 15;

export default function NotificationSystem() {
  const [notifications, setNotifications] = useState([]);
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => setUserLocation({ lat: 23.84638, lng: 90.42711 }) // Fallback (Dhaka)
      );
    } else {
      setUserLocation({ lat: 23.84638, lng: 90.42711 });
    }
  }, []);

  useEffect(() => {
    if (!userLocation) return;

    const fetchReports = async () => {
      try {
        const res = await API.get('/reports');
        const data = Array.isArray(res.data) ? res.data : res.data?.reports || [];

        const highPriority = data.filter(report => {
          const upvotes = report.upvotes?.length || 0;
          if (upvotes < THRESHOLD) return false;
          if (report.location) {
            const latDiff = Math.abs(report.location.lat - userLocation.lat);
            const lngDiff = Math.abs(report.location.lng - userLocation.lng);
            return latDiff < 0.05 && lngDiff < 0.05;
          }
          return false;
        });
        setNotifications(highPriority);
      } catch (err) {
        console.error('Notification fetch failed:', err);
      }
    };

    fetchReports();
  }, [userLocation]);

  return (
    <div style={{ padding: '0 40px', marginTop: '16px', position: 'relative', zIndex: 10 }}>
      <div style={{ padding: '12px 16px', backgroundColor: '#fff8e1', border: '1px solid #ffe082', borderRadius: '8px', maxWidth: '350px', color: '#111827' }}>
        <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 'bold' }}>
          🔔 Emergency Alerts ({notifications.length})
        </h4>
        
        {notifications.length === 0 ? (
          <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#666' }}>
            No high-priority alerts nearby.
          </p>
        ) : (
          notifications.map(n => (
            <div key={n._id} style={{ borderLeft: '4px solid #ff9800', paddingLeft: '8px', marginTop: '8px' }}>
              <strong style={{ fontSize: '13px' }}>{n.title}</strong>
              <p style={{ margin: 0, fontSize: '11px', color: '#4b5563' }}>
                {n.upvotes?.length || 0} user confirmations — Near your area
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}