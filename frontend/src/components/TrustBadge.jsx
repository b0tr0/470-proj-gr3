import React from 'react';

export default function TrustBadge({ score, role }) {
  const normalizedRole = (role || '').toString().toLowerCase().trim();

  // 1. Authority Badge (No numeric score)
  if (normalizedRole === 'authority') {
    return (
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        backgroundColor: '#1e3a8a',
        color: '#bfdbfe',
        border: '1px solid #3b82f6',
        borderRadius: '12px',
        padding: '2px 8px',
        fontSize: '11px',
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
      }}>
        👮 Official Authority
      </span>
    );
  }

  // 2. Moderator Badge (No numeric score)
  if (normalizedRole === 'moderator' || normalizedRole === 'community moderator') {
    return (
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        backgroundColor: '#581c87',
        color: '#e9d5ff',
        border: '1px solid #a855f7',
        borderRadius: '12px',
        padding: '2px 8px',
        fontSize: '11px',
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
      }}>
        🛡️ Moderator
      </span>
    );
  }

  // 3. General Users (Numeric Trust Score)
  const numericScore = typeof score === 'number' ? score : 100;
  const isHighTrust = numericScore >= 100;

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px',
      backgroundColor: isHighTrust ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
      color: isHighTrust ? '#10b981' : '#ef4444',
      border: `1px solid ${isHighTrust ? '#10b981' : '#ef4444'}`,
      borderRadius: '12px',
      padding: '2px 8px',
      fontSize: '11px',
      fontWeight: 'bold'
    }}>
      <span>{isHighTrust ? '🟢' : '🔴'}</span>
      <span>{numericScore} pts</span>
    </span>
  );
}