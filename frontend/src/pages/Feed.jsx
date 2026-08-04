import React, { useState } from 'react';

const IncidentReport = () => {
  const [formData, setFormData] = useState({
    title: '',
    category: 'Road Block',
    severity: 'Moderate',
    description: ''
  });

  const handleSubmit = (e, isAnonymous = false) => {
    e.preventDefault();
    if (!formData.title) {
      alert("Please fill out the Incident Title!");
      return;
    }
    
    alert(`Alert ${isAnonymous ? 'Anonymously ' : ''}Published Successfully!`);
    // ফর্ম ক্লিয়ার করা
    setFormData({ title: '', category: 'Road Block', severity: 'Moderate', description: '' });
  };

  return (
    <div className="bg-white p-6 rounded-2xl max-w-md shadow-lg text-gray-800">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">🚨 Report an Incident</h2>
      
      <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-gray-600 mb-1">Incident Title</label>
          <input
            type="text"
            placeholder="e.g., Waterlogging on Main Road"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full border border-gray-300 p-2 rounded-lg text-sm focus:outline-none focus:border-red-500"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-600 mb-1">Category</label>
          <select 
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full border border-gray-300 p-2 rounded-lg text-sm"
          >
            <option>Road Block</option>
            <option>Accident</option>
            <option>Heavy Traffic</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-600 mb-1">Severity</label>
          <select 
            value={formData.severity}
            onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
            className="w-full border border-gray-300 p-2 rounded-lg text-sm"
          >
            <option>Low</option>
            <option>Moderate</option>
            <option>Severe</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-600 mb-1">Description</label>
          <textarea
            placeholder="Provide details..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full border border-gray-300 p-2 rounded-lg text-sm h-20"
          />
        </div>

        <button 
          type="submit" 
          className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2.5 rounded-lg transition"
        >
          Publish Alert
        </button>

        <button 
          type="button" 
          onClick={(e) => handleSubmit(e, true)}
          className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-2.5 rounded-lg transition"
        >
          Publish Anonymously
        </button>
      </form>
    </div>
  );
};

export default IncidentReport;