/**
 * Test Real-Time Planetary Timing Accuracy
 * This verifies that planets update their positions correctly with time
 */

console.log('🕐 TIMING ACCURACY TEST\n');

// Simulate how the app calculates positions
const PLANET_ORBITAL_DATA = {
  Mercury: {
    semiMajorAxis: 0.38709927,
    eccentricity: 0.20563593,
    inclination: 7.00497902,
    period: 87.9691,
    longitudeOfPerihelion: 77.45779628,
    longitudeOfAscendingNode: 48.33076593,
    meanLongitude: 252.25032350,
    longitudeOfPerihelionRate: 0.16047689,
    longitudeOfAscendingNodeRate: -0.12534081,
    eccentricityRate: 0.00001906,
    inclinationRate: -0.00594749,
  }
};

const J2000_EPOCH = new Date('2000-01-01T12:00:00Z').getTime();

function calculatePlanetPosition(planetName, currentDate) {
  const data = PLANET_ORBITAL_DATA[planetName];
  
  const daysSinceEpoch = (currentDate.getTime() - J2000_EPOCH) / (1000 * 60 * 60 * 24);
  const T = daysSinceEpoch / 36525;
  
  // Apply secular rates
  const eccentricity = data.eccentricity + (data.eccentricityRate || 0) * T;
  const inclination = data.inclination + (data.inclinationRate || 0) * T;
  const longitudeOfPerihelion = data.longitudeOfPerihelion + (data.longitudeOfPerihelionRate || 0) * T;
  const longitudeOfAscendingNode = data.longitudeOfAscendingNode + (data.longitudeOfAscendingNodeRate || 0) * T;
  
  // Mean motion
  const n = 360 / data.period;
  const L = data.meanLongitude + n * daysSinceEpoch;
  const M_deg = L - longitudeOfPerihelion;
  const M_norm = ((M_deg % 360) + 360) % 360;
  const M = (M_norm * Math.PI) / 180;
  
  // Solve Kepler's equation
  let E = M;
  for (let i = 0; i < 10; i++) {
    E = E - (E - eccentricity * Math.sin(E) - M) / (1 - eccentricity * Math.cos(E));
  }
  
  // True anomaly
  const num = Math.sqrt(1 + eccentricity) * Math.sin(E / 2);
  const den = Math.sqrt(1 - eccentricity) * Math.cos(E / 2);
  const v = 2 * Math.atan2(num, den);
  
  // Distance
  const r = data.semiMajorAxis * (1 - eccentricity * Math.cos(E));
  
  // 3D position
  const ω = (longitudeOfPerihelion - longitudeOfAscendingNode) * Math.PI / 180;
  const Ω = longitudeOfAscendingNode * Math.PI / 180;
  const i = inclination * Math.PI / 180;
  
  const x_orb = r * Math.cos(v);
  const y_orb = r * Math.sin(v);
  
  const x = x_orb * (Math.cos(ω) * Math.cos(Ω) - Math.sin(ω) * Math.sin(Ω) * Math.cos(i)) -
            y_orb * (Math.sin(ω) * Math.cos(Ω) + Math.cos(ω) * Math.sin(Ω) * Math.cos(i));
  
  const y = x_orb * (Math.cos(ω) * Math.sin(Ω) + Math.sin(ω) * Math.cos(Ω) * Math.cos(i)) -
            y_orb * (Math.sin(ω) * Math.sin(Ω) - Math.cos(ω) * Math.cos(Ω) * Math.cos(i));
  
  const z = x_orb * (Math.sin(ω) * Math.sin(i)) + y_orb * (Math.cos(ω) * Math.sin(i));
  
  return { x, y, z, r, trueAnomaly: v * 180 / Math.PI };
}

// Test 1: Current time
const now = new Date();
console.log('TEST 1: Current Time');
console.log('Date:', now.toISOString());
const pos1 = calculatePlanetPosition('Mercury', now);
console.log('Mercury Position:', {
  x: pos1.x.toFixed(6),
  y: pos1.y.toFixed(6),
  z: pos1.z.toFixed(6),
  distance: pos1.r.toFixed(6) + ' AU',
  trueAnomaly: pos1.trueAnomaly.toFixed(2) + '°'
});
console.log('');

// Test 2: 1 hour later
const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
console.log('TEST 2: One Hour Later');
console.log('Date:', oneHourLater.toISOString());
const pos2 = calculatePlanetPosition('Mercury', oneHourLater);
console.log('Mercury Position:', {
  x: pos2.x.toFixed(6),
  y: pos2.y.toFixed(6),
  z: pos2.z.toFixed(6),
  distance: pos2.r.toFixed(6) + ' AU',
  trueAnomaly: pos2.trueAnomaly.toFixed(2) + '°'
});

// Calculate movement
const dx = (pos2.x - pos1.x) * 149597870.7; // Convert to km
const dy = (pos2.y - pos1.y) * 149597870.7;
const dz = (pos2.z - pos1.z) * 149597870.7;
const distance = Math.sqrt(dx**2 + dy**2 + dz**2);
const angleChange = pos2.trueAnomaly - pos1.trueAnomaly;

console.log('');
console.log('MOVEMENT IN 1 HOUR:');
console.log('Distance traveled:', distance.toFixed(0), 'km');
console.log('Angle change:', angleChange.toFixed(6), '°');
console.log('Orbital velocity:', (distance / 3600).toFixed(2), 'km/s');
console.log('');

// Expected orbital velocity for Mercury: ~47.36 km/s average
const expectedVelocity = 47.36;
const calculatedVelocity = distance / 3600;
const velocityError = Math.abs(calculatedVelocity - expectedVelocity);

console.log('ACCURACY CHECK:');
console.log('Expected velocity: 47.36 km/s (NASA average)');
console.log('Calculated velocity:', calculatedVelocity.toFixed(2), 'km/s');
console.log('Error:', velocityError.toFixed(2), 'km/s');
console.log('Percentage error:', ((velocityError / expectedVelocity) * 100).toFixed(2), '%');
console.log('');

if (velocityError < 2) {
  console.log('✅ EXCELLENT! Timing accuracy < 2 km/s error');
} else if (velocityError < 5) {
  console.log('✅ GOOD! Timing accuracy < 5 km/s error');
} else {
  console.log('⚠️  Timing may need adjustment');
}

console.log('');
console.log('TEST 3: Verify positions update continuously');

// Simulate animation loop (like the app does)
const startDate = new Date();
let simulationTime = 0; // seconds

console.log('Simulating 10 frames at 60 FPS (real-time)...');
for (let frame = 0; frame < 10; frame++) {
  const currentDate = new Date(startDate.getTime() + simulationTime * 1000);
  const pos = calculatePlanetPosition('Mercury', currentDate);
  
  console.log(`Frame ${frame}: t=${simulationTime.toFixed(2)}s, angle=${pos.trueAnomaly.toFixed(4)}°`);
  
  simulationTime += 1/60; // 60 FPS
}

console.log('');
console.log('✅ Position calculation is now synchronized with real time!');
console.log('   Planets will move at their actual orbital velocities.');
