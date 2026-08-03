const baseDurationHours = {
    accident: 6,
    roadblock: 12,
    discussion: 72,
    other: 24
};

const severityMultiplier = {
    severe: 0.5,
    high: 0.75,
    moderate: 1
};

const hazardBaseDurationHours = {
    pothole: 24 * 14, // 14 days
    checkpoint: 24 * 2,
    extortion: 24 * 7,
    poor_road: 24 * 14,
    other: 24 * 7
};

exports.calculateExpiresAt = (category, severity) => {
    const base = baseDurationHours[category] ?? 24;
    const multiplier = severityMultiplier[severity] ?? 1;
    const hours = base * multiplier;
    return new Date(Date.now() + hours * 60 * 60 * 1000);
};

exports.calculateHazardExpiresAt = (category, severity) => {
    const base = hazardBaseDurationHours[category] ?? 24 * 7;
    const multiplier = severityMultiplier[severity] ?? 1;
    const hours = base * multiplier;
    return new Date(Date.now() + hours * 60 * 60 * 1000);
};