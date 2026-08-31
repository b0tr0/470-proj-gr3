import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import API from '../api';

import markerIconPng from 'leaflet/dist/images/marker-icon.png';
const customIcon = new L.Icon({
  iconUrl: markerIconPng,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

export default function ReportCard({ report, currentUserId, userRole, refreshReports }) {
  const [deleting, setDeleting] = useState(false);
  const [timeLeft, setTimeLeft] = useState('');

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

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this report?')) return;

    try {
      setDeleting(true);
      await API.delete(`/reports/${report._id || report.id}`);
      alert('Report deleted successfully!');
      if (refreshReports) refreshReports();
    } catch (err) {
      console.error('Delete error:', err);
      alert(err.response?.data?.message || 'Failed to delete report.');
    } finally {
      setDeleting(false);
    }
  };

  const isOwner = report.user === currentUserId || report.postedBy === currentUserId;
  const canDelete = isOwner || userRole === 'admin' || userRole === 'moderator' || userRole === 'authority';

  const reportLat = report.lat || (report.location && report.location.lat) || 23.8103;
  const reportLng = report.lng || (report.location && report.location.lng) || 90.4125;

  return (
    <div style={{ backgroundColor: '#ffffff', borderRadius: '8px', padding: '16px', color: '#0f172a', position: 'relative', border: '1px solid #e2e8f0' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#64748b', marginBottom: '8px' }}>
        <span>ID: {report.reportId || (report._id ? report._id.slice(-6) : 'N/A')}</span>
        <span style={{ fontWeight: 'bold', color: timeLeft === 'Expired' ? '#ef4444' : '#d97706' }}>
          ⌛ {timeLeft === 'Expired' ? 'Expired' : `Active (${timeLeft})`}
        </span>
      </div>

      <h3 style={{ margin: '0 0 6px 0', fontSize: '1.2rem', color: '#0f172a' }}>
        {report.title || report.category}
      </h3>

      <p style={{ margin: '0 0 12px 0', color: '#334155', fontSize: '0.95rem' }}>
        {report.description || report.content}
      </p>

      {/* Incident Map Location View */}
      <div style={{ height: '160px', width: '100%', borderRadius: '6px', overflow: 'hidden', marginBottom: '12px' }}>
        <MapContainer center={[reportLat, reportLng]} zoom={13} style={{ height: '100%', width: '100%' }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <Marker position={[reportLat, reportLng]} icon={customIcon}>
            <Popup>{report.title || 'Report Location'}</Popup>
          </Marker>
        </MapContainer>
      </div>

      {report.imageUrl && (
        <img
          src={report.imageUrl}
          alt="Report"
          style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '6px', marginBottom: '12px' }}
        />
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #f1f5f9', fontSize: '13px' }}>
        <span style={{ color: '#475569' }}>
          Posted by: <b>{report.isAnonymous ? 'Anonymous' : (report.username || 'User')}</b>
        </span>

        {canDelete && (
          <button
            onClick={handleDelete}
            disabled={deleting}
            style={{
              backgroundColor: '#ef4444',
              color: '#fff',
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
            🗑️ {deleting ? 'Deleting...' : 'Delete'}
          </button>
        )}
      </div>
    </div>
  );
}