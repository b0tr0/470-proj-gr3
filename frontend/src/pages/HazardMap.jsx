import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import API from '../api';
import { getHazardIcon, hazardTypeLabels } from '../hazardIcons';

const HazardMap = () => {
    const user = JSON.parse(localStorage.getItem('userInfo'));
    const [hazards, setHazards] = useState([]);
    const [type, setType] = useState('pothole');
    const [severity, setSeverity] = useState('moderate');
    const [description, setDescription] = useState('');
    const [selectedCoords, setSelectedCoords] = useState(null);
    const [message, setMessage] = useState('');

    const fetchHazards = async () => {
        try {
            const { data } = await API.get('/hazards');
            console.log('fetched hazards data:', data, 'length:', data.length);
            setHazards(data);
        } catch (err) {
            console.error('Error fetching hazards:', err);
        }
    };
    
    useEffect(() => {
        fetchHazards();
    }, []);

    const MapClickHandler = () => {
        useMapEvents({
            click: (e) => {
                setSelectedCoords({ lat: e.latlng.lat, lng: e.latlng.lng });
            }
        });
        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');

        if (!selectedCoords) {
            setMessage('Click a spot on the map to mark the hazard location first.');
            return;
        }
        if (!description.trim()) {
            setMessage('Please add a short description.');
            return;
        }

        try {
            await API.post('/hazards', {
                type,
                severity,
                description: description.trim(),
                location: selectedCoords
            });
            setDescription('');
            setSelectedCoords(null);
            setMessage('Hazard marked on the map!');
            fetchHazards();
        } catch (err) {
            setMessage(err.response?.data?.message || 'Failed to submit hazard report');
        }
    };

    const handleVote = async (id, voteType) => {
        try {
            await API.put(`/hazards/${id}/vote`, { voteType });
            fetchHazards();
        } catch (err) {
            console.error('Voting error:', err);
        }
    };

    const handleDelete = async (id) => {
        const confirmed = window.confirm('Remove this hazard marker?');
        if (!confirmed) return;
        try {
            await API.delete(`/hazards/${id}`);
            fetchHazards();
        } catch (err) {
            console.error('Delete failed:', err);
        }
    };
    console.log('hazards state:', hazards);

    return (
        <div className="mx-auto max-w-6xl px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* FORM PANEL */}
            <div className="lg:col-span-1 bg-white p-5 rounded-xl shadow-sm border border-gray-200 h-fit">
                <h3 className="text-lg font-bold text-gray-800 mb-2">⚠️ Report a Road Hazard</h3>
                <p className="text-xs text-gray-500 mb-4">Click anywhere on the map to drop a pin at the hazard's location.</p>

                {message && <div className="mb-3 text-xs bg-blue-50 p-2 rounded border border-blue-200 text-blue-700">{message}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-xs font-semibold text-gray-600 block">Hazard Type</label>
                        <select value={type} onChange={(e) => setType(e.target.value)} className="w-full text-sm mt-1 p-2 border rounded bg-white">
                            <option value="pothole">🕳️ Pothole</option>
                            <option value="checkpoint">🚓 Police Checkpoint</option>
                            <option value="extortion">💰 Extortion</option>
                            <option value="poor_road">🛣️ Poor Road Condition</option>
                            <option value="other">⚠️ Other</option>
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
                        <textarea required rows="3" placeholder="Describe the hazard..." value={description}
                            onChange={(e) => setDescription(e.target.value)} className="w-full text-sm mt-1 p-2 border rounded resize-none" />
                    </div>

                    <div className="bg-gray-50 p-2.5 rounded text-xs text-gray-600 border">
                        {selectedCoords ? (
                            <>
                                <span className="font-bold text-gray-700 block mb-1">Pin location:</span>
                                <div>Lat: <span className="font-mono">{selectedCoords.lat.toFixed(5)}</span></div>
                                <div>Lng: <span className="font-mono">{selectedCoords.lng.toFixed(5)}</span></div>
                            </>
                        ) : (
                            <span className="text-gray-400">No location selected yet — click the map.</span>
                        )}
                    </div>

                    <button type="submit" className="w-full bg-slate-800 hover:bg-slate-900 text-white font-medium text-sm p-2 rounded transition">
                        Mark Hazard
                    </button>
                </form>
            </div>

            {/* MAP */}
            <div className="lg:col-span-2">
                <div className="bg-white p-2 rounded-xl shadow-sm border border-gray-200">
                    <MapContainer center={[23.8103, 90.4125]} zoom={12} scrollWheelZoom={true} style={{ height: '600px', width: '100%' }}>
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; OpenStreetMap contributors'
                        />

                        <MapClickHandler />

                        {selectedCoords && (
                            <Marker position={[selectedCoords.lat, selectedCoords.lng]}>
                                <Popup>New hazard pin — fill out the form to save it.</Popup>
                            </Marker>
                        )}

                        {hazards.map((hazard) => (
                            <Marker
                                key={hazard._id}
                                position={[hazard.location.lat, hazard.location.lng]}
                                icon={getHazardIcon(hazard.type)}
                                eventHandlers={{
                                    mouseover: (e) => {
                                        clearTimeout(e.target._closeTimer);
                                        e.target.openPopup();
                                    },
                                    mouseout: (e) => {
                                        e.target._closeTimer = setTimeout(() => {
                                            e.target.closePopup();
                                        }, 600);
                                    }
                                }}
                            >
                                <Popup>
                                    <div className="text-xs space-y-1">
                                        <strong className="text-sm font-bold text-slate-900 block">
                                            {hazardTypeLabels[hazard.type]}
                                        </strong>
                                        <div className="capitalize font-semibold">Severity: {hazard.severity}</div>
                                        <div>{hazard.description}</div>
                                        <div className="text-gray-400">
                                            By: {hazard.reportedBy?.username || 'Unknown'}
                                        </div>
                                        <div className="flex items-center space-x-2 pt-1">
                                            <button onClick={() => handleVote(hazard._id, 'upvote')} className="text-green-600 font-semibold">
                                                ▲ {hazard.upvotes?.length || 0}
                                            </button>
                                            <button onClick={() => handleVote(hazard._id, 'downvote')} className="text-red-600 font-semibold">
                                                ▼ {hazard.downvotes?.length || 0}
                                            </button>
                                            {(user?._id === hazard.reportedBy?._id || ['moderator', 'authority'].includes(user?.role)) && (
                                                <button onClick={() => handleDelete(hazard._id)} className="text-gray-500 font-semibold ml-auto">
                                                    🗑️ Remove
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </Popup>
                            </Marker>
                        ))}
                    </MapContainer>
                </div>
            </div>

        </div>
    );
};

export default HazardMap;
