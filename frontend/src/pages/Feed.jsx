import React, { useState, useEffect } from 'react';
import API from '../api';
import ExpirationBadge from '../components/ExpirationBadge';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const Feed = () => {
    const user = JSON.parse(localStorage.getItem('userInfo'));
    const [reports, setReports] = useState([]);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('roadblock');
    const [severity, setSeverity] = useState('moderate')
    const [commentText, setCommentText] = useState({});
    const [error, setError] = useState('');
    const [deletingReportId, setDeletingReportId] = useState(null);
    const [deleteReason, setDeleteReason] = useState('other');
    const [location, setLocation] = useState(null);
    const [locating, setLocating] = useState(false);
    const [locationError, setLocationError] = useState('');

    // Fetch all reports for the primary newsfeed
    const fetchReports = async () => {
        try {
            const { data } = await API.get('/reports');
            setReports(data);
        } catch (err) {
            console.error('Error fetching reports:', err);
        }
    };

    useEffect(() => {
        fetchReports();
    }, []);

    // handle posting a new traffic alert (Feature 1)
    const handleCreateReport = async (e, isAnonymous = false) => {
        e.preventDefault();
        setError('');
        if (!title.trim() || !description.trim()) {
            setError('Title and description are required.')
            return;
        }
        try {
            await API.post('/reports', { title, description, category, severity, isAnonymous, location });
            setTitle('');
            setDescription('');
            setSeverity('moderate');
            setLocation(null);
            fetchReports(); // refresh the timeline feed
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to submit report');
        }
    };

    // handle voting updates
    const handleVote = async (id, voteType) => {
        try {
            await API.put(`/reports/${id}/vote`, { voteType });
            fetchReports();
        } catch (err) {
            console.error('Voting error:', err);
        }
    };

    // handle comment submissions
    const handleAddComment = async (e, reportId) => {
        e.preventDefault();
        const text = commentText[reportId];
        if (!text || !text.trim()) return;

        try {
            await API.post(`/reports/${reportId}/comment`, { text });
            setCommentText({ ...commentText, [reportId]: '' });
            fetchReports(); // Refresh feed to display the new comment
        } catch (err) {
            console.error('Error adding comment:', err);
        }
    };

    // moderator Flag action (Feature 2)
    const handleModeratorAction = async (id, flag) => {
        try {
            await API.put(`/reports/${id}/flag`, { flag });
            fetchReports();
        } catch (err) {
            console.error('Moderator action failed:', err);
        }
    };

    // authority verification action (Feature 5)
    const handleAuthorityAction = async (id, status) => {
        try {
            await API.put(`/reports/${id}/verify`, { status });
            fetchReports();
        } catch (err) {
            console.error('Authority action failed:', err);
        }
    };

    const handleDeleteReport = async (id, reason) => {
        try {
            await API.delete(`/reports/${id}`, { data: { reason } });
            setDeletingReportId(null);
            fetchReports();
        } catch (err) {
            console.error('Delete failed:', err);
            setError(err.response?.data?.message || 'Failed to delete report');
        }
    };

    const handlePrivilegedDelete = async (id) => {
        const reason = window.prompt('Reason? (irrelevant / resolved / privacy / other)', 'other');
        if (!reason) return;
        try {
            await API.delete(`/reports/${id}`, { data: { reason } });
            fetchReports();
        } catch (err) {
            console.error('Delete failed:', err);
        }
    };

    const handleToggleLocation = () => {
        if (location) {
            setLocation(null);
            return;
        }

        if (!navigator.geolocation) {
            setLocationError('Geolocation is not supported by your browser.');
            return;
        }

        setLocating(true);
        setLocationError('');

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
                setLocating(false);
            },
            (err) => {
                setLocationError('Unable to retrieve location. Check browser permissions.');
                setLocating(false);
            },
            { enableHighaccuracy: true, timeout: 10000 }
        );
    };

    return (
        <div className="mx-auto max-w-4xl px-4 py-8 grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* LEFT COLUMN: CREATE ALERT FORM */}
            <div className="md:col-span-1">
                <div className="rounded-xl bg-white p-5 shadow-sm border border-gray-200 sticky top-24">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">🚨 Report an Incident</h3>
                    {error && <div className="mb-3 text-xs bg-red-100 p-2 rounded text-red-700">{error}</div>}

                    <form onSubmit={handleCreateReport} className="space-y-3">
                        <div>
                            <label className="text-xs font-semibold text-gray-600 block">Incident Title</label>
                            <input type="text" required placeholder="e.g., Waterlogging on Main Road" value={title}
                                onChange={(e) => setTitle(e.target.value)} className="w-full text-sm mt-1 p-2 border rounded" />
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-gray-600 block">Category</label>
                            <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full text-sm mt-1 p-2 border rounded bg-white">
                                <option value="roadblock">Road Block</option>
                                <option value="accident">Accident</option>
                                <option value="discussion">Discussion Post</option>
                                <option value="other">Other Alert</option>
                            </select>
                        </div>

                        <div>
                            <label className="text-xs font-semibold text-gray-600 block">Severity</label>
                            <select value={severity} onChange={(e) => setSeverity(e.target.value)} className="w-full text-sm mt-1 p-2 border rounded bg-white">
                                <option value="moderate">Moderate</option>
                                <option value="high">High</option>
                                <option value="severe">Severe</option>
                            </select>
                        </div>

                        <div>
                            <label className="text-xs font-semibold text-gray-600 block">Description</label>
                            <textarea required rows="3" placeholder="Provide details..." value={description}
                                onChange={(e) => setDescription(e.target.value)} className="w-full text-sm mt-1 p-2 border rounded resize-none" />
                        </div>
                        <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm p-2 rounded transition">
                            Publish Alert
                        </button>
                        <button
                            type="button"
                            onClick={(e) => handleCreateReport(e, true)}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm p-2 rounded transition"
                        >
                            Publish Anonymously
                        </button>
                    </form>
                </div>
                <button 
                    type="button"
                    onClick={handleToggleLocation}
                    className={`w-full font-medium text-sm p-2 rounded transition ${
                        location
                            ? 'bg-green-600 hover:bg-green-700 text-white'
                            : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                    }`}
                >
                    {locating
                        ? 'Locating...': location
                        ? `Location Attached (tap to remove)`: 'Share My Location'}
                </button>
                {locationError && <p className="text-xs text-red-600">{locationError}</p>}
            </div>

            {/* RIGHT COLUMN: NEWSFEED TIMELINE */}
            <div className="md:col-span-2 space-y-4">
                <h2 className="text-xl font-bold text-gray-800">Live Traffic Feed</h2>

                {reports.length === 0 ? (
                    <p className="text-gray-500 text-sm">No traffic alerts posted yet. The roads look clear!</p>
                ) : (
                    reports.map((report) => (
                        <div key={report._id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-200 space-y-4">

                            {/* Header Info */}
                            <div className="flex justify-between items-start">
                                <div className="flex flex-col items-start gap-1">
                                    <span className="text-xs font-bold uppercase tracking-wider bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                                        {report.category}
                                    </span>

                                <span className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                                    report.severity === ' severe'
                                        ? 'bg-red-100 text-red-700'
                                        : report.severity === ' high'
                                        ? 'bg-orange-100 text-orange-700'
                                        : 'bg-yellow-100 text-yellow-700'
                                }`}>
                                        {report.severity}
                                    </span>
                                

                                <h3 className="text-lg font-bold text-gray-900 mt-1">{report.title}</h3>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                        Posted by <span className="font-semibold">
                                            {report.isAnonymous ? 'Anonymous' : report.postedBy?.username || 'Unknown'}
                                        </span>
                                        {!report.isAnonymous && ` (${report.postedBy?.role})`}
                                        {' • '} {new Date(report.createdAt).toLocaleTimeString()}
                                    </p>
                                </div>

                                {/* Badges for Moderator and Authority Statuses */}
                                <div className="flex flex-col items-end space-y-1">
                                    <ExpirationBadge expiresAt={report.expiresAt} />
                                    {report.authorityStatus !== 'unverified' && (
                                        <span className={`text-xs px-2 py-0.5 rounded font-bold uppercase tracking-wide border ${['verified', 'confirmed'].includes(report.authorityStatus) ? 'bg-green-50 border-green-300 text-green-700' : 'bg-red-50 border-red-300 text-red-700'
                                            }`}>
                                            🏛️ {report.authorityStatus}
                                        </span>
                                    )}
                                    {report.moderatorFlag !== 'none' && (
                                        <span className="text-xs bg-amber-50 border border-amber-300 text-amber-700 px-2 py-0.5 rounded font-bold uppercase tracking-wide">
                                            ⚠️ Flagged: {report.moderatorFlag}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Description Body */}
                            <p className="text-sm text-gray-700 leading-relaxed">{report.description}</p>

                            {/* Shared Location Preview */}
                            {report.location?.lat && report.location?.lng && (
                                <div className="rounded-lg overflow-hidden border mx-auto" 
                                    style={{ height: '460px', width: '50%' }}
                                >      
                                    <MapContainer
                                        key={report._id}
                                        center={[report.location.lat, report.location.lng]}
                                        zoom={15}
                                        scrollWheelZoom={true}
                                        dragging={true}
                                    >
                                        <TileLayer
                                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                            attribution='&copy; OpenStreetMap contributors'
                                        />
                                        <Marker position={[report.location.lat, report.location.lng]}>
                                            <Popup>{report.title}</Popup>
                                        </Marker>
                                    </MapContainer>
                                </div>
                            )}

                            {/* Interactions Section (Voting) */}
                            <div className="flex items-center space-x-4 border-t border-b border-gray-100 py-2">
                                <button onClick={() => handleVote(report._id, 'upvote')} className="flex items-center space-x-1 text-xs font-semibold text-gray-600 hover:text-green-600">
                                    <span>▲ Upvote</span>
                                    <span className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-800">{report.upvotes?.length || 0}</span>
                                </button>
                                <button onClick={() => handleVote(report._id, 'downvote')} className="flex items-center space-x-1 text-xs font-semibold text-gray-600 hover:text-red-600">
                                    <span>▼ Downvote</span>
                                    <span className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-800">{report.downvotes?.length || 0}</span>
                                </button>

                                {(user?._id === report.postedBy?._id || ['moderator', 'authority'].includes(user?.role)) && (
                                    <div className="ml-auto flex items-center space-x-2">
                                        {deletingReportId === report._id ? (
                                            <>
                                                <select value={deleteReason} 
                                                        onChange={(e) => setDeleteReason(e.target.value)} 
                                                        className="text-xs border rounded p-1"
                                                >
                                                    <option value="irrelevant">Irrelevant</option>
                                                    <option value="resolved">Resolved</option>
                                                    <option value="privacy">Privacy Concern</option>
                                                    <option value="other">Other</option>
                                                </select>
                                                <button onClick={() => handleDeleteReport(report._id, deleteReason)} 
                                                        className="text-xs font-semibold text-white bg-red-600 hover:bg-red-700 px-2 py-1 rounded"
                                                > 
                                                        Confirm
                                                </button>
                                                <button onClick={() => setDeletingReportId(null)} 
                                                        className="text-xs font-semibold text-gray-500 hover:text-gray-700"
                                                >
                                                        Cancel
                                                </button>
                                            </>
                                        ) : (
                                            <button onClick={() => {
                                                setDeletingReportId(report._id);
                                                setDeleteReason('other');
                                                }}
                                                className="flex items-center space-x-1 text-xs font-semibold text-red-600 hover:text-red-800"
                                            >  
                                                🗑️ Delete 
                                            </button>
                                        )}
                                    </div>
                                )}                              

                            </div>

                            {/* ROLE CONTEXTUAL CONTROLS PANEL */}
                            {user?.role === 'moderator' && (
                                <div className="bg-amber-50 rounded-lg p-3 border border-amber-200 flex items-center justify-between text-xs">
                                    <span className="font-bold text-amber-800">Mod Tools:</span>
                                    <div className="space-x-2">
                                        <button onClick={() => handleModeratorAction(report._id, 'accident')} className="bg-amber-600 text-white px-2 py-1 rounded font-medium hover:bg-amber-700">Flag Accident</button>
                                        <button onClick={() => handleModeratorAction(report._id, 'false/misleading')} className="bg-red-600 text-white px-2 py-1 rounded font-medium hover:bg-red-700">Flag Misleading</button>
                                        <button onClick={() => handleModeratorAction(report._id, 'none')} className="bg-gray-500 text-white px-2 py-1 rounded font-medium hover:bg-gray-600">Clear</button>
                                    </div>
                                </div>
                            )}

                            {user?.role === 'authority' && (
                                <div className="bg-red-50 rounded-lg p-3 border border-red-200 flex flex-wrap items-center justify-between gap-2 text-xs">
                                    <span className="font-bold text-red-800">Authority Panel:</span>
                                    <div className="space-x-1.5">
                                        <button onClick={() => handleAuthorityAction(report._id, 'verified')} className="bg-green-600 text-white px-2 py-1 rounded font-medium">Verify</button>
                                        <button onClick={() => handleAuthorityAction(report._id, 'confirmed')} className="bg-emerald-700 text-white px-2 py-1 rounded font-medium">Confirm</button>
                                        <button onClick={() => handleAuthorityAction(report._id, 'outdated')} className="bg-slate-600 text-white px-2 py-1 rounded font-medium">Outdated</button>
                                        <button onClick={() => handleAuthorityAction(report._id, 'disputed')} className="bg-amber-600 text-white px-2 py-1 rounded font-medium">Dispute</button>
                                    </div>
                                </div>
                            )}

                            {/* Comments Section */}
                            <div className="space-y-2">
                                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Comments ({report.comments?.length || 0})</h4>
                                <div className="max-h-36 overflow-y-auto space-y-1.5 bg-gray-50 p-2.5 rounded-lg border">
                                    {report.comments?.map((c, i) => (
                                        <div key={i} className="text-xs text-gray-700">
                                            <span className="font-bold text-gray-900">{c.username}:</span> {c.text}
                                        </div>
                                    ))}
                                </div>

                                {/* Submit Comment Field */}
                                <form onSubmit={(e) => handleAddComment(e, report._id)} className="flex items-center space-x-2 mt-2">
                                    <input type="text" placeholder="Add a comment..." value={commentText[report._id] || ''}
                                        onChange={(e) => setCommentText({ ...commentText, [report._id]: e.target.value })}
                                        className="w-full text-xs p-2 border rounded focus:outline-blue-500" />
                                    <button type="submit" className="bg-slate-700 hover:bg-slate-800 text-white text-xs px-3 py-2 rounded font-medium">
                                        Reply
                                    </button>
                                </form>
                            </div>

                        </div>
                    ))
                )}
            </div>

        </div>
    );
};

export default Feed;