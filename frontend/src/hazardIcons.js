import L from 'leaflet';

const iconConfig = {
  pothole: { emoji: '🕳️', color: '#78716c' },
  checkpoint: { emoji: '🚓', color: '#2563eb' },
  extortion: { emoji: '💰', color: '#dc2626' },
  poor_road: { emoji: '🛣️', color: '#d97706' },
  other: { emoji: '⚠️', color: '#6b7280' }
};

export const getHazardIcon = (type) => {
  const config = iconConfig[type] || iconConfig.other;
  return L.divIcon({
    html: `<div style="background:${config.color};width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:15px;border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.4);">${config.emoji}</div>`,
    className: '',
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14]
  });
};

export const hazardTypeLabels = {
    pothole: 'Pothole',
    checkpoint: 'Police Checkpoint',
    extortion: 'Extortion',
    poor_road: 'Poor Road Condition',
    other: 'Other Hazard'
}