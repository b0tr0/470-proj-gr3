import React from 'react';

export default function ReportCard({ report, userRole, currentUserId, onDelete }) {
  // Feature 20: Calculate remaining time until expiration
  const calculateRemainingTime = (expiresAt) => {
    const diff = new Date(expiresAt) - new Date();
    if (diff <= 0) return 'Expired';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m remaining`;
  };

  // Feature 13: Permission check matching reportController.js
  const isOwner = report.postedBy?._id === currentUserId;
  const isPrivileged = ['moderator', 'authority'].includes(userRole);
  const canDelete = isOwner || isPrivileged;

  return (
    <div className="bg-white p-4 rounded-lg shadow mb-4 border border-gray-200">
      {/* Header: Report ID and Expiration Badge */}
      <div className="flex justify-between items-center mb-2">
        {/* Feature 6: Report ID */}
        <span className="text-xs font-mono bg-gray-100 text-gray-600 px-2 py-1 rounded">
          ID: {report._id}
        </span>

        {/* Feature 20: Expiration Timer */}
        {report.expiresAt && (
          <span className="text-xs font-semibold bg-amber-100 text-amber-800 px-2 py-1 rounded-full">
            ⏳ {calculateRemainingTime(report.expiresAt)}
          </span>
        )}
      </div>

      {/* Title & Description */}
      <h3 className="text-lg font-bold text-gray-800">{report.title}</h3>
      <p className="text-gray-600 text-sm my-2">{report.description}</p>

      {/* Feature 18: Image URL Display */}
      {report.imageUrl && (
        <div className="my-3">
          <img 
            src={report.imageUrl} 
            alt="Report Attachment" 
            className="w-full max-h-64 object-cover rounded-md border"
            onError={(e) => { e.target.style.display = 'none'; }} // Hide if image broken
          />
        </div>
      )}

      {/* Footer: User Info & Delete Action */}
      <div className="flex justify-between items-center mt-4 pt-2 border-t border-gray-100 text-xs text-gray-500">
        <span>Posted by: {report.postedBy?.username || 'Anonymous'}</span>

        {/* Feature 13: Role-based Deletion Button */}
        {canDelete && (
          <button
            onClick={() => onDelete(report._id)}
            className="bg-red-50 text-red-600 hover:bg-red-100 font-medium px-3 py-1 rounded transition-colors"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
}