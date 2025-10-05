/**
 * Test script to verify planetary positions
 * Run with: node test-planet-positions.js
 */

// Since we're in Node.js, we need to import the calculations
// This is a simplified version for testing

// J2000.0 epoch
const J2000_EPOCH = new Date('2000-01-01T12:00:00Z').getTime()

const PLANET_DATA = {
  Mercury: {
    semiMajorAxis: 0.38709927,
    eccentricity: 0.20563593,
    period: 87.9691,
    meanLongitude: 252.25032350,
    longitudeOfPerihelion: 77.45779628,
  },
  Venus: {
    semiMajorAxis: 0.72333566,
    eccentricity: 0.00677672,
    period: 224.701,
    meanLongitude: 181.97909950,
    longitudeOfPerihelion: 131.60246718,
  },
  Earth: {
    semiMajorAxis: 1.00000261,
    eccentricity: 0.01671123,
    period: 365.256,
    meanLongitude: 100.46457166,
    longitudeOfPerihelion: 102.93768193,
  },
  Mars: {
    semiMajorAxis: 1.52371034,
    eccentricity: 0.09339410,
    period: 686.980,
    meanLongitude: -4.55343205,
    longitudeOfPerihelion: -23.94362959,
  },
}

function calculateMeanAnomaly(planetData, currentDate) {
  const daysSinceEpoch = (currentDate.getTime() - J2000_EPOCH) / (1000 * 60 * 60 * 24)
  const n = 360 / planetData.period
  const L = planetData.meanLongitude + n * daysSinceEpoch
  const M = L - planetData.longitudeOfPerihelion
  return ((M % 360) + 360) % 360
}

function solveKeplerEquation(M_deg, e) {
  const M = (M_deg * Math.PI) / 180
  let E = M
  let delta = 1
  let iterations = 0

  while (Math.abs(delta) > 1e-6 && iterations < 100) {
    delta = E - e * Math.sin(E) - M
    E = E - delta / (1 - e * Math.cos(E))
    iterations++
  }

  return E
}

function calculateDistance(a, e, E) {
  return a * (1 - e * Math.cos(E))
}

// Test for current date
const now = new Date()
console.log('🌍 NASA Horizons Position Test')
console.log('=' .repeat(60))
console.log(`Current Date: ${now.toISOString()}`)
console.log(`Days since J2000.0: ${((now.getTime() - J2000_EPOCH) / (1000 * 60 * 60 * 24)).toFixed(1)}`)
console.log('=' .repeat(60))
console.log('')

for (const [planet, data] of Object.entries(PLANET_DATA)) {
  const M = calculateMeanAnomaly(data, now)
  const E = solveKeplerEquation(M, data.eccentricity)
  const r = calculateDistance(data.semiMajorAxis, data.eccentricity, E)
  
  // Calculate true anomaly
  const ν = 2 * Math.atan2(
    Math.sqrt(1 + data.eccentricity) * Math.sin(E / 2),
    Math.sqrt(1 - data.eccentricity) * Math.cos(E / 2)
  )
  const ν_deg = (ν * 180 / Math.PI + 360) % 360

  console.log(`${planet}:`)
  console.log(`  Mean Anomaly:    ${M.toFixed(2)}°`)
  console.log(`  True Anomaly:    ${ν_deg.toFixed(2)}°`)
  console.log(`  Distance:        ${r.toFixed(4)} AU`)
  console.log(`  (Semi-major:     ${data.semiMajorAxis.toFixed(4)} AU)`)
  console.log(`  Eccentricity:    ${data.eccentricity.toFixed(6)}`)
  console.log('')
}

console.log('✅ Calculations complete!')
console.log('')
console.log('To verify these positions:')
console.log('1. Visit: https://ssd.jpl.nasa.gov/horizons/app.html')
console.log('2. Select planet')
console.log(`3. Set date to: ${now.toISOString()}`)
console.log('4. Compare orbital elements')
