import React, { useState } from 'react';

const AuthorityDashboard = () => {
  const [reports, setReports] = useState([
    { id: 1, title: "Severe Collision", reportedBy: "Alex Chen", votes: 24, status: "Verified" },
    { id: 2, title: "Waterlogging", reportedBy: "Sam Miller", votes: 8, status: "Pending" }
  ]);

  const handleStatusChange = (id, newStatus) => {
    setReports(prev =>
      prev.map(item => item.id === id ? { ...item, status: newStatus } : item)
    );
  };

  return (
    <div className="p-6 bg-emerald-950 text-white min-h-screen flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-1">Authority Monitoring Dashboard</h1>
      <p className="text-gray-300 mb-6 text-sm">Review, verify, and resolve community-reported traffic incidents.</p>

      <div className="bg-white text-black p-6 rounded-2xl w-full max-w-2xl shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b text-gray-700">
                <th className="py-2 px-3">Reported By</th>
                <th className="py-2 px-3">Community Votes</th>
                <th className="py-2 px-3">Status</th>
                <th className="py-2 px-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report) => (
                <tr key={report.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-3 font-medium">{report.reportedBy}</td>
                  <td className="py-3 px-3 font-bold text-amber-600">👍 {report.votes}</td>
                  <td className="py-3 px-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      report.status === 'Verified' ? 'bg-emerald-100 text-emerald-800' :
                      report.status === 'Resolved' ? 'bg-blue-100 text-blue-800' :
                      report.status === 'Dismissed' ? 'bg-gray-200 text-gray-700' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                      {report.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    {report.status === "Pending" && (
                      <div className="flex justify-center gap-2">
                        <button 
                          onClick={() => handleStatusChange(report.id, "Verified")}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-3 py-1.5 rounded-md font-semibold transition"
                        >
                          Verify
                        </button>
                        <button 
                          onClick={() => handleStatusChange(report.id, "Dismissed")}
                          className="bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-1.5 rounded-md font-semibold transition"
                        >
                          Dismiss
                        </button>
                      </div>
                    )}
                    {report.status === "Verified" && (
                      <button 
                        onClick={() => handleStatusChange(report.id, "Resolved")}
                        className="bg-sky-600 hover:bg-sky-700 text-white text-xs px-3 py-1.5 rounded-md font-semibold transition"
                      >
                        Mark Resolved
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AuthorityDashboard;