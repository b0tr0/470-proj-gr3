import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import API from '../api';
import 'leaflet/dist/leaflet.css';


const Fuel = () => {
    const [stations, setStations] = useState([]);
    const [stationName, setStationName] = useState('');
    const [status, setStatus] = useState('available');
    // Default map viewpoint set near Dhaka city coordinates
    const [selectedCoords, setSelectedCoords] = useState([23.8103, 90.4125]);
    const [message, setMessage] = useState('');

    const fetchFuelStatuses = async () => {
        try {
            const { data } = await API.get('/fuel');
            setStations(data);
        } catch (err) {
            console.error('Error fetching fuel data:', err);
        }
    };

    useEffect(() => {
        fetchFuelStatuses();
    }, []);

    // Helper component to capture click events on the map canvas
    const MapClickHandler = () => {
        useMapEvents({
            click: (e) => {
                setSelectedCoords([e.latlng.lat, e.latlng.lng]);
            },
        });
        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');

        // 1. Fallback fallback safety checks for optional coordinates
        const payloadCoords = selectedCoords && selectedCoords.length === 2
            ? [selectedCoords[1], selectedCoords[0]]
            : [];

        try {
            // 2. Transmit the payload explicitly matching the backend schema
            await API.post('/fuel', {
                stationName: stationName.trim(), // Strips accidental spaces
                status: status || 'available',   // Ensures status never falls back to an empty string
                coordinates: payloadCoords
            });

            setStationName('');
            setMessage('Station report dropped successfully!');
            fetchFuelStatuses();
        } catch (err) {
            setMessage(err.response?.data?.message || 'Failed to submit status');
        }
    };

    // Helper function to calculate time relevancy highlights
    const getTimeAgo = (timestamp) => {
        const diffInMinutes = Math.floor((new Date() - new Date(timestamp)) / 60000);
        if (diffInMinutes < 1) return { text: 'Just now', color: 'text-green-600 font-bold' };
        if (diffInMinutes < 60) return { text: `${diffInMinutes}m ago`, color: 'text-green-600 font-bold' };
        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return { text: `${diffInHours}h ago`, color: 'text-amber-600 font-medium' };
        return { text: `${Math.floor(diffInHours / 24)}d ago`, color: 'text-gray-500' };
    };

    return (
        <div className="mx-auto max-w-6xl px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* UPDATE SECTION FORM PANEL */}
            <div className="lg:col-span-1 bg-white p-5 rounded-xl shadow-sm border border-gray-200 h-fit">
                <h3 className="text-lg font-bold text-gray-800 mb-2">⛽ Update Fuel Status</h3>
                <p className="text-xs text-gray-500 mb-4">Click anywhere on the map grid canvas to position your report target pin.</p>

                {message && <div className="mb-3 text-xs bg-blue-50 p-2 rounded border border-blue-200 text-blue-700">{message}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-xs font-semibold text-gray-600 block">Station / Brand Name</label>
                        <input type="text" required placeholder="e.g., Mohakhali Filling Station" value={stationName}
                            onChange={(e) => setStationName(e.target.value)} className="w-full text-sm mt-1 p-2 border rounded" />
                    </div>

                    <div>
                        <label className="text-xs font-semibold text-gray-600 block">Current Status</label>
                        <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full text-sm mt-1 p-2 border rounded bg-white">
                            <option value="available">Available / No Queue</option>
                            <option value="long line">Long Queue Present</option>
                            <option value="out of fuel">Out of Fuel</option>
                        </select>
                    </div>

                    <div className="bg-gray-50 p-2.5 rounded text-xs text-gray-600 border space-y-1">
                        <span className="font-bold text-gray-700 block">Target Coordinates:</span>
                        <div>Latitude: <span className="font-mono font-medium">{selectedCoords[0].toFixed(5)}</span></div>
                        <div>Longitude: <span className="font-mono font-medium">{selectedCoords[1].toFixed(5)}</span></div>
                    </div>

                    <button type="submit" className="w-full bg-slate-800 hover:bg-slate-900 text-white font-medium text-sm p-2 rounded transition">
                        Submit Location Update
                    </button>
                </form>
            </div>

            {/* MAP & LISTING LAYOUT ENVIRONMENT */}
            <div className="lg:col-span-2 space-y-6">
                <div className="bg-white p-2 rounded-xl shadow-sm border border-gray-200">
                    <MapContainer center={[23.8103, 90.4125]} zoom={12} scrollWheelZoom={true}>
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' />

                        <MapClickHandler />

                        {/* Interactive Target Submission Pin Drop */}
                        <Marker position={selectedCoords}>
                            <Popup>Your selected reporting point.</Popup>
                        </Marker>

                        {/* Displaying Live Database Reports */}
                        {stations.map((station) => (
                            <Marker key={station._id} position={[station.coordinates[1], station.coordinates[0]]}>
                                <Popup>
                                    <div className="text-xs space-y-1">
                                        <strong className="text-sm font-bold text-slate-900 block">{station.stationName}</strong>
                                        <div className="capitalize font-semibold">Status: {station.status}</div>
                                        <div className="text-gray-400">By: {station.reportedBy?.username}</div>
                                    </div>
                                </Popup>
                            </Marker>
                        ))}
                    </MapContainer>
                </div>

                {/* TIME RELEVANCY MONITOR TIMELINE CONTAINER */}
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
                    <h4 className="text-sm font-bold text-gray-800 mb-3 uppercase tracking-wider">Recent Station Feeds</h4>
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                        {stations.length === 0 ? (
                            <p className="text-xs text-gray-500">No active station reports available.</p>
                        ) : (
                            stations.map((s) => {
                                const timeAgo = getTimeAgo(s.createdAt);
                                return (
                                    <div key={s._id} className="flex justify-between items-center text-xs p-2.5 bg-gray-50 border rounded-lg">
                                        <div>
                                            <span className="font-bold text-gray-900 block">{s.stationName}</span>
                                            <span className="text-gray-500">Reported by: {s.reportedBy?.username || 'User'}</span>
                                        </div>
                                        <div className="text-right">
                                            <span className={`inline-block px-2 py-0.5 rounded font-bold uppercase mr-3 ${s.status === 'available' ? 'bg-green-100 text-green-800' :
                                                s.status === 'long line' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                                                }`}>{s.status}</span>
                                            <span className={timeAgo.color}>{timeAgo.text}</span>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>

        </div>
    );
};

export default Fuel;