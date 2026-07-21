import { useState, useEffect } from 'react';

const formatRemaining = (ms) => {
    if (ms <= 0) return 'Expired';
    const hours = Math.ceil(ms / (60 * 60 * 1000));
    return `Expires in ${hours} hr${hours !== 1 ? 's' : ''}`;
};

const ExpirationBadge = ({ expiresAt }) => {
    const [remaining, setRemaining] = useState(new Date(expiresAt) - new Date());

    useEffect(() => {
        const interval = setInterval(() => {
            setRemaining(new Date(expiresAt) - new Date());
        }, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, [expiresAt]);

    const isUrgent = remaining < 60 * 60 * 1000;

    return (
        <span className={`text-xs px-2 py-0.5 rounded font-medium ${isUrgent ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-500'}`}>
            ⏳ {formatRemaining(remaining)}
        </span>
    );
};

export default ExpirationBadge;