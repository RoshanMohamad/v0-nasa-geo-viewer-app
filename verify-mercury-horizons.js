/**
 * Verify Mercury's position against NASA Horizons API
 * This script fetches real-time data from JPL Horizons and compares with our calculations
 */

// Get today's date
const now = new Date();
const today = now.toISOString().split('T')[0]; // YYYY-MM-DD
const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];

console.log('🔍 Fetching Mercury position from NASA JPL Horizons...');
console.log(`📅 Date: ${today}\n`);

// NASA Horizons API endpoint
const params = new URLSearchParams({
  format: 'text',
  COMMAND: '199', // Mercury NAIF ID
  OBJ_DATA: 'YES',
  MAKE_EPHEM: 'YES',
  EPHEM_TYPE: 'VECTORS',
  CENTER: '500@0', // Sun center
  START_TIME: `'${today}'`,
  STOP_TIME: `'${tomorrow}'`,
  STEP_SIZE: '1d',
  VEC_TABLE: '2', // Position and velocity
  REF_PLANE: 'ECLIPTIC',
  REF_SYSTEM: 'J2000',
  VEC_CORR: 'NONE',
  OUT_UNITS: 'AU-D',
  CSV_FORMAT: 'NO',
});

const url = `https://ssd.jpl.nasa.gov/api/horizons.api?${params.toString()}`;

fetch(url)
  .then(response => response.text())
  .then(data => {
    console.log('✅ NASA Horizons Response Received\n');
    console.log('=' .repeat(80));
    console.log(data);
    console.log('=' .repeat(80));
    
    // Parse position data from response
    const lines = data.split('\n');
    let inData = false;
    
    for (const line of lines) {
      if (line.includes('$$SOE')) {
        inData = true;
        continue;
      }
      if (line.includes('$$EOE')) {
        inData = false;
        break;
      }
      if (inData && line.trim()) {
        console.log('\n📊 Position Vector (AU):');
        console.log(line);
      }
    }
    
    // Now calculate using our formulas
    console.log('\n\n🧮 Our Calculation:');
    console.log('=' .repeat(80));
    
    const data_mercury = {
      semiMajorAxis: 0.38709927,
      eccentricity: 0.20563593,
      meanLongitude: 252.25032350,
      longitudeOfPerihelion: 77.45779628,
      period: 87.9691
    };
    
    const J2000 = new Date('2000-01-01T12:00:00Z').getTime();
    const daysSince = (now.getTime() - J2000) / (1000 * 60 * 60 * 24);
    
    const n = 360 / data_mercury.period;
    const L = data_mercury.meanLongitude + n * daysSince;
    const M = L - data_mercury.longitudeOfPerihelion;
    const M_normalized = ((M % 360) + 360) % 360;
    
    console.log(`Days since J2000.0: ${daysSince.toFixed(2)}`);
    console.log(`Mean motion: ${n.toFixed(6)} deg/day`);
    console.log(`Mean anomaly: ${M_normalized.toFixed(2)}°`);
    
    // Solve Kepler's equation
    const M_rad = M_normalized * Math.PI / 180;
    let E = M_rad;
    for (let i = 0; i < 10; i++) {
      E = E - (E - data_mercury.eccentricity * Math.sin(E) - M_rad) / 
               (1 - data_mercury.eccentricity * Math.cos(E));
    }
    
    const r = data_mercury.semiMajorAxis * (1 - data_mercury.eccentricity * Math.cos(E));
    
    const num = Math.sqrt(1 + data_mercury.eccentricity) * Math.sin(E / 2);
    const den = Math.sqrt(1 - data_mercury.eccentricity) * Math.cos(E / 2);
    const v = 2 * Math.atan2(num, den);
    
    console.log(`Eccentric anomaly: ${(E * 180 / Math.PI).toFixed(2)}°`);
    console.log(`True anomaly: ${(v * 180 / Math.PI).toFixed(2)}°`);
    console.log(`Distance: ${r.toFixed(4)} AU`);
    
    console.log('\n💡 Compare the position vectors above!');
  })
  .catch(error => {
    console.error('❌ Error fetching Horizons data:', error);
    console.log('\n⚠️  Alternative: Check manually at:');
    console.log('https://ssd.jpl.nasa.gov/horizons/app.html');
    console.log('Settings:');
    console.log('  - Target Body: Mercury [199]');
    console.log('  - Coordinate Center: Sun [500@0]');
    console.log('  - Time Specification: Current date');
    console.log('  - Table Settings: Vector Table');
    console.log('  - Reference Frame: ICRF/J2000.0');
  });
