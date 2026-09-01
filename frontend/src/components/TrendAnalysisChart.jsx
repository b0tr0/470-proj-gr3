import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function TrendAnalysis() {
  const [hazards, setHazards] = useState([]);
  const [selectedYear, setSelectedYear] = useState('2026');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:5000/api/hazards')
      .then((res) => res.json())
      .then((data) => {
        let parsed = [];
        if (Array.isArray(data)) parsed = data;
        else if (data.hazards) parsed = data.hazards;
        else if (data.data) parsed = data.data;
        setHazards(parsed);
      })
      .catch((err) => console.error('Error fetching hazards for chart:', err))
      .finally(() => setLoading(false));
  }, []);

  const yearFilteredHazards = hazards.filter((item) => {
    if (!item.createdAt) return true; 
    const year = new Date(item.createdAt).getFullYear().toString();
    return year === selectedYear;
  });

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  const chartData = months.map((month, index) => {
    const monthlyData = yearFilteredHazards.filter((item) => {
      if (!item.createdAt) return false;
      return new Date(item.createdAt).getMonth() === index;
    });

    const roadDamage = monthlyData.filter(
      (h) => (h.type || '').toLowerCase() === 'pothole' || (h.type || '').toLowerCase() === 'poor_road'
    ).length;

    const otherHazards = monthlyData.filter(
      (h) => (h.type || '').toLowerCase() === 'checkpoint' || (h.type || '').toLowerCase() === 'extortion'
    ).length;

    return {
      month,
      'Road Damage': roadDamage,
      'Other Hazards': otherHazards,
    };
  });

  const totalRoadDamage = chartData.reduce((acc, curr) => acc + curr['Road Damage'], 0);
  const totalOther = chartData.reduce((acc, curr) => acc + curr['Other Hazards'], 0);

  if (loading) {
    return <div style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '40px' }}>Loading Trend Analysis...</div>;
  }

  return (
    <div style={{
      maxWidth: '900px',
      margin: '30px auto',
      padding: '24px',
      backgroundColor: 'var(--bg-card)',
      border: '1px solid var(--border-color)',
      borderRadius: '12px',
      color: 'var(--text-primary)',
      boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
      transition: 'all 0.3s ease'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '22px', fontWeight: 'bold', color: 'var(--text-primary)', margin: 0 }}>
          📈 Incident Trend Analysis
        </h2>
        <select 
          value={selectedYear} 
          onChange={(e) => setSelectedYear(e.target.value)}
          style={{
            padding: '8px 16px',
            borderRadius: '6px',
            backgroundColor: 'var(--input-bg)',
            color: 'var(--input-text)',
            border: '1.5px solid var(--input-border)',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          <option value="2026">2026</option>
          <option value="2025">2025</option>
          <option value="2024">2024</option>
        </select>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
        <div style={{ backgroundColor: '#ffe4e6', borderLeft: '6px solid #e11d48', padding: '16px', borderRadius: '8px', color: '#881337' }}>
          <span style={{ fontSize: '14px', fontWeight: 'bold' }}>Road Damage ({selectedYear})</span>
          <h3 style={{ fontSize: '28px', fontWeight: 'bold', marginTop: '4px', marginBottom: 0 }}>{totalRoadDamage}</h3>
        </div>
        <div style={{ backgroundColor: '#e0f2fe', borderLeft: '6px solid #0284c7', padding: '16px', borderRadius: '8px', color: '#0c4a6e' }}>
          <span style={{ fontSize: '14px', fontWeight: 'bold' }}>Checkpoints / Extortion ({selectedYear})</span>
          <h3 style={{ fontSize: '28px', fontWeight: 'bold', marginTop: '4px', marginBottom: 0 }}>{totalOther}</h3>
        </div>
      </div>

      <div style={{
        width: '100%',
        height: '320px',
        backgroundColor: 'var(--input-bg)',
        padding: '16px 8px 8px 8px',
        borderRadius: '8px',
        border: '1px solid var(--border-color)',
        boxSizing: 'border-box'
      }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(150,150,150,0.15)" />
            <XAxis dataKey="month" stroke="var(--text-secondary)" />
            <YAxis stroke="var(--text-secondary)" allowDecimals={false} />
            <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-primary)', borderRadius: '8px' }} />
            <Legend wrapperStyle={{ paddingTop: '10px' }} />
            <Bar dataKey="Road Damage" fill="#ef4444" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Other Hazards" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}