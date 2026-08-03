import { useState } from 'react';

const mockData = [
  { month: 'Jan', accidents: 45, blockades: 12 },
  { month: 'Feb', accidents: 52, blockades: 19 },
  { month: 'Mar', accidents: 38, blockades: 8 },
  { month: 'Apr', accidents: 65, blockades: 25 },
  { month: 'May', accidents: 41, blockades: 15 },
  { month: 'Jun', accidents: 58, blockades: 22 },
];

export function TrendAnalysisChart() {
  const [timeframe, setTimeframe] = useState('2026');

  const totalAccidents = mockData.reduce((sum, d) => sum + d.accidents, 0);
  const totalBlockades = mockData.reduce((sum, d) => sum + d.blockades, 0);

  return (
    <div style={{ padding: '20px', border: '1px solid #e0e0e0', borderRadius: '8px', maxWidth: '700px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3>Incident Trend Analysis</h3>
        <select value={timeframe} onChange={(e) => setTimeframe(e.target.value)} style={{ padding: '5px 10px' }}>
          <option value="2026">Year 2026</option>
          <option value="2025">Year 2025</option>
        </select>
      </div>

      <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
        <div style={{ flex: 1, padding: '15px', background: '#ffebee', borderRadius: '6px' }}>
          <small style={{ color: '#c62828' }}>Total Accidents ({timeframe})</small>
          <h2>{totalAccidents}</h2>
        </div>
        <div style={{ flex: 1, padding: '15px', background: '#e3f2fd', borderRadius: '6px' }}>
          <small style={{ color: '#1565c0' }}>Total Blockades ({timeframe})</small>
          <h2>{totalBlockades}</h2>
        </div>
      </div>

      <div style={{ width: '100%', height: '220px', position: 'relative' }}>
        <svg viewBox="0 0 600 200" style={{ width: '100%', height: '100%' }}>
          <line x1="40" y1="20" x2="580" y2="20" stroke="#eee" />
          <line x1="40" y1="90" x2="580" y2="90" stroke="#eee" />
          <line x1="40" y1="160" x2="580" y2="160" stroke="#eee" />

          <polyline fill="none" stroke="#c62828" strokeWidth="3" points="50,110 140,96 230,124 320,70 410,118 500,84" />
          <polyline fill="none" stroke="#1565c0" strokeWidth="3" points="50,176 140,162 230,184 320,150 410,170 500,156" />

          {mockData.map((d, index) => (
            <text key={d.month} x={50 + index * 90} y="190" fontSize="12" fill="#666" textAnchor="middle">
              {d.month}
            </text>
          ))}
        </svg>
      </div>

      <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginTop: '10px' }}>
        <span style={{ color: '#c62828', fontWeight: 'bold' }}>● Accidents</span>
        <span style={{ color: '#1565c0', fontWeight: 'bold' }}>● Blockades</span>
      </div>
    </div>
  );
}
export default TrendAnalysisChart;