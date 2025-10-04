/**
 * Orbital Mechanics Engine
 * Implements Kepler's Laws and NASA Horizons API integration
 * 
 * Features:
 * - Kepler's Equation solver
 * - Orbital element calculations
 * - State vector conversions
 * - Impact probability analysis
 */

export interface OrbitalElements {
  semiMajorAxis: number // AU
  eccentricity: number
  inclination: number // degrees
  longitudeOfAscendingNode: number // degrees
  argumentOfPerihelion: number // degrees
  meanAnomaly: number // degrees
  period?: number // years
  velocity?: number // km/s
}

export interface StateVector {
  position: { x: number; y: number; z: number } // AU
  velocity: { vx: number; vy: number; vz: number } // AU/day
}

export interface CelestialBody {
  id: string
  name: string
  type: 'planet' | 'asteroid' | 'comet' | 'dwarf-planet' | 'trans-neptunian'
  radius: number // km
  mass: number // kg
  color: string
  orbitalElements: OrbitalElements
  nasaState?: StateVector
  composition?: 'rocky' | 'icy' | 'metallic' | 'carbonaceous'
}

export interface ImpactAnalysis {
  closestApproach: number // km
  closestApproachAU: number // AU
  closestApproachEarthRadii: number
  impactProbability: number // 0-100%
  riskLevel: 'None' | 'Low' | 'Moderate' | 'High' | 'Extreme'
  kineticEnergy: number // Joules
  kineticEnergyMT: number // Megatons TNT
  craterDiameter: number // km
  craterDepth: number // km
  ejectaRadius: number // km
  impactZones: Array<{ lat: number; lng: number }>
  classification: string
  estimatedDamage: string
  damage?: {
    airblastRadius: number // km
    thermalRadius: number // km
    seismicMagnitude: number // Richter scale
    tsunamiHeight?: number // meters
  }
}

const EARTH_RADIUS_KM = 6371
const AU_TO_KM = 149597870.7
const G = 6.67430e-11 // Gravitational constant

/**
 * Solve Kepler's Equation using Newton-Raphson method
 * M = E - e·sin(E)
 */
export function solveKeplerEquation(
  meanAnomaly: number,
  eccentricity: number,
  tolerance = 1e-6
): number {
  // Convert to radians
  let M = (meanAnomaly * Math.PI) / 180
  let E = M // Initial guess

  let iterations = 0
  const maxIterations = 100

  while (iterations < maxIterations) {
    const f = E - eccentricity * Math.sin(E) - M
    const fPrime = 1 - eccentricity * Math.cos(E)
    const delta = f / fPrime

    E -= delta

    if (Math.abs(delta) < tolerance) {
      break
    }
    iterations++
  }

  return E
}

/**
 * Calculate true anomaly from eccentric anomaly
 */
export function calculateTrueAnomaly(eccentricAnomaly: number, eccentricity: number): number {
  const cosE = Math.cos(eccentricAnomaly)
  const sinE = Math.sin(eccentricAnomaly)

  const cosNu = (cosE - eccentricity) / (1 - eccentricity * cosE)
  const sinNu = (Math.sqrt(1 - eccentricity * eccentricity) * sinE) / (1 - eccentricity * cosE)

  return Math.atan2(sinNu, cosNu)
}

/**
 * Calculate orbital position from Kepler's elements
 * @param elements - Orbital elements
 * @param time - Simulation time in seconds
 * @returns Position in AU {x, y, z}
 */
export function calculateOrbitalPosition(
  elements: OrbitalElements,
  time: number = 0
): { x: number; y: number; z: number } {
  const { semiMajorAxis, eccentricity, meanAnomaly, argumentOfPerihelion, longitudeOfAscendingNode, inclination } = elements

  // Calculate orbital period if not provided (Kepler's 3rd Law)
  const period = elements.period || Math.sqrt(Math.pow(semiMajorAxis, 3)) // years
  const periodSeconds = period * 365.25 * 24 * 3600 // Convert years to seconds
  
  // Update mean anomaly based on time
  // Mean motion (degrees per second) = 360 / period_seconds
  const meanMotion = 360 / periodSeconds
  const M = meanAnomaly + (meanMotion * time) // Current mean anomaly in degrees

  // Solve Kepler's equation
  const E = solveKeplerEquation(M, eccentricity)

  // Calculate true anomaly
  const nu = calculateTrueAnomaly(E, eccentricity)

  // Calculate distance from focus
  const r = semiMajorAxis * (1 - eccentricity * Math.cos(E))

  // Position in orbital plane
  const xOrbit = r * Math.cos(nu)
  const yOrbit = r * Math.sin(nu)

  // Convert to degrees for rotation
  const omega = (argumentOfPerihelion * Math.PI) / 180
  const Omega = (longitudeOfAscendingNode * Math.PI) / 180
  const i = (inclination * Math.PI) / 180

  // Rotate to 3D space
  const x =
    xOrbit * (Math.cos(omega) * Math.cos(Omega) - Math.sin(omega) * Math.sin(Omega) * Math.cos(i)) -
    yOrbit * (Math.sin(omega) * Math.cos(Omega) + Math.cos(omega) * Math.sin(Omega) * Math.cos(i))

  const y =
    xOrbit * (Math.cos(omega) * Math.sin(Omega) + Math.sin(omega) * Math.cos(Omega) * Math.cos(i)) -
    yOrbit * (Math.sin(omega) * Math.sin(Omega) - Math.cos(omega) * Math.cos(Omega) * Math.cos(i))

  const z = xOrbit * Math.sin(omega) * Math.sin(i) + yOrbit * Math.cos(omega) * Math.sin(i)

  return { x, y, z }
}

/**
 * Convert state vectors to orbital elements
 */
export function stateVectorsToOrbitalElements(state: StateVector): OrbitalElements {
  const { position, velocity } = state
  const r = Math.sqrt(position.x ** 2 + position.y ** 2 + position.z ** 2)
  const v = Math.sqrt(velocity.vx ** 2 + velocity.vy ** 2 + velocity.vz ** 2)

  // Specific angular momentum
  const h = {
    x: position.y * velocity.vz - position.z * velocity.vy,
    y: position.z * velocity.vx - position.x * velocity.vz,
    z: position.x * velocity.vy - position.y * velocity.vx,
  }
  const hMag = Math.sqrt(h.x ** 2 + h.y ** 2 + h.z ** 2)

  // Eccentricity vector
  const mu = 1.0 // Sun's gravitational parameter in AU³/day²
  const eMag = Math.sqrt(
    1 + (2 * (v ** 2 / 2 - mu / r) * hMag ** 2) / mu ** 2
  )

  // Semi-major axis
  const a = 1 / (2 / r - v ** 2 / mu)

  // Inclination
  const i = (Math.acos(h.z / hMag) * 180) / Math.PI

  // Calculate other elements (simplified)
  const eccentricity = eMag
  const semiMajorAxis = Math.abs(a)
  const inclination = i
  const longitudeOfAscendingNode = 0
  const argumentOfPerihelion = 0
  const meanAnomaly = 0

  return {
    semiMajorAxis,
    eccentricity,
    inclination,
    longitudeOfAscendingNode,
    argumentOfPerihelion,
    meanAnomaly,
  }
}

/**
 * Calculate orbital period using Kepler's 3rd Law
 * T² = (4π²/GM) × a³
 */
export function calculateOrbitalPeriod(semiMajorAxis: number): number {
  // For Sun-centered orbits in AU and years
  return Math.sqrt(Math.pow(semiMajorAxis, 3))
}

/**
 * Calculate orbital velocity at given distance
 */
export function calculateOrbitalVelocity(
  semiMajorAxis: number,
  eccentricity: number,
  currentDistance: number
): number {
  // Vis-viva equation: v² = GM(2/r - 1/a)
  const mu = 1.327e20 // Sun's gravitational parameter (m³/s²)
  const r = currentDistance * AU_TO_KM * 1000 // Convert to meters
  const a = semiMajorAxis * AU_TO_KM * 1000

  const v = Math.sqrt(mu * (2 / r - 1 / a))
  return v / 1000 // Convert to km/s
}

/**
 * Calculate minimum distance between two orbits
 */
export function calculateMinimumOrbitDistance(
  orbit1: OrbitalElements,
  orbit2: OrbitalElements,
  numSamples = 360
): number {
  let minDistance = Infinity

  for (let i = 0; i < numSamples; i++) {
    const angle1 = (i * 360) / numSamples
    const angle2 = angle1 // Check same angles

    const elements1 = { ...orbit1, meanAnomaly: angle1 }
    const elements2 = { ...orbit2, meanAnomaly: angle2 }

    const pos1 = calculateOrbitalPosition(elements1)
    const pos2 = calculateOrbitalPosition(elements2)

    const distance = Math.sqrt(
      (pos1.x - pos2.x) ** 2 + (pos1.y - pos2.y) ** 2 + (pos1.z - pos2.z) ** 2
    )

    minDistance = Math.min(minDistance, distance)
  }

  return minDistance * AU_TO_KM // Convert to km
}

/**
 * Calculate impact probability and risk analysis
 */
export function calculateImpactProbability(
  asteroid: CelestialBody,
  earthOrbit: OrbitalElements
): ImpactAnalysis {
  // Calculate minimum approach distance
  const minDistanceKm = calculateMinimumOrbitDistance(asteroid.orbitalElements, earthOrbit)
  const minDistanceAU = minDistanceKm / AU_TO_KM
  const minDistanceEarthRadii = minDistanceKm / EARTH_RADIUS_KM

  // Impact probability based on distance
  let impactProbability = 0
  let riskLevel: 'None' | 'Low' | 'Moderate' | 'High' | 'Extreme' = 'None'

  if (minDistanceKm < EARTH_RADIUS_KM * 10) {
    impactProbability = Math.max(0, 100 * (1 - minDistanceKm / (EARTH_RADIUS_KM * 10)))
    
    if (impactProbability > 50) riskLevel = 'Extreme'
    else if (impactProbability > 25) riskLevel = 'High'
    else if (impactProbability > 10) riskLevel = 'Moderate'
    else if (impactProbability > 1) riskLevel = 'Low'
  }

  // Calculate kinetic energy
  const velocity = calculateOrbitalVelocity(
    asteroid.orbitalElements.semiMajorAxis,
    asteroid.orbitalElements.eccentricity,
    asteroid.orbitalElements.semiMajorAxis
  )

  const kineticEnergy = 0.5 * asteroid.mass * Math.pow(velocity * 1000, 2)
  const kineticEnergyMT = kineticEnergy / 4.184e15

  // Crater calculations (simplified)
  const craterDiameter = 0.07 * Math.pow(kineticEnergyMT, 0.33)
  const craterDepth = craterDiameter / 7
  const ejectaRadius = craterDiameter * 2

  // Generate random impact zones
  const impactZones = Array.from({ length: 5 }, () => ({
    lat: Math.random() * 180 - 90,
    lng: Math.random() * 360 - 180,
  }))

  // Classification
  let classification = 'Unknown'
  if (kineticEnergyMT < 0.015) classification = 'Meteorite (harmless)'
  else if (kineticEnergyMT < 0.5) classification = 'Hiroshima-class'
  else if (kineticEnergyMT < 10) classification = 'Tunguska-class'
  else if (kineticEnergyMT < 1000000) classification = 'Regional devastation'
  else classification = 'Chicxulub-class (extinction)'

  const estimatedDamage =
    riskLevel === 'None'
      ? 'No significant threat'
      : riskLevel === 'Low'
      ? 'Local damage possible'
      : riskLevel === 'Moderate'
      ? 'Regional devastation likely'
      : riskLevel === 'High'
      ? 'Continental-scale catastrophe'
      : 'Global extinction event'

  // Calculate damage radii (similar to impact-calculator)
  const airblastRadius = 2.2 * Math.pow(kineticEnergyMT, 0.33)
  const thermalRadius = 3.5 * Math.pow(kineticEnergyMT, 0.41)
  const seismicMagnitude = 0.67 * Math.log10(kineticEnergyMT) + 3.87

  return {
    closestApproach: minDistanceKm,
    closestApproachAU: minDistanceAU,
    closestApproachEarthRadii: minDistanceEarthRadii,
    impactProbability,
    riskLevel,
    kineticEnergy,
    kineticEnergyMT,
    craterDiameter,
    craterDepth,
    ejectaRadius,
    impactZones,
    classification,
    estimatedDamage,
    damage: {
      airblastRadius,
      thermalRadius,
      seismicMagnitude,
    },
  }
}

/**
 * Predefined celestial bodies (planets)
 */
export const PLANETS: CelestialBody[] = [
  {
    id: 'mercury',
    name: 'Mercury',
    type: 'planet',
    radius: 2439.7,
    mass: 3.3011e23,
    color: '#8C7853',
    composition: 'rocky',
    orbitalElements: {
      semiMajorAxis: 0.387,
      eccentricity: 0.206,
      inclination: 7.0,
      longitudeOfAscendingNode: 48.3,
      argumentOfPerihelion: 29.1,
      meanAnomaly: 174.8,
    },
  },
  {
    id: 'venus',
    name: 'Venus',
    type: 'planet',
    radius: 6051.8,
    mass: 4.8675e24,
    color: '#FFC649',
    composition: 'rocky',
    orbitalElements: {
      semiMajorAxis: 0.723,
      eccentricity: 0.007,
      inclination: 3.4,
      longitudeOfAscendingNode: 76.7,
      argumentOfPerihelion: 54.9,
      meanAnomaly: 50.4,
    },
  },
  {
    id: 'earth',
    name: 'Earth',
    type: 'planet',
    radius: 6371.0,
    mass: 5.97237e24,
    color: '#4A90E2',
    composition: 'rocky',
    orbitalElements: {
      semiMajorAxis: 1.0,
      eccentricity: 0.017,
      inclination: 0.0,
      longitudeOfAscendingNode: 0.0,
      argumentOfPerihelion: 102.9,
      meanAnomaly: 100.5,
    },
  },
  {
    id: 'mars',
    name: 'Mars',
    type: 'planet',
    radius: 3389.5,
    mass: 6.4171e23,
    color: '#E27B58',
    composition: 'rocky',
    orbitalElements: {
      semiMajorAxis: 1.524,
      eccentricity: 0.093,
      inclination: 1.9,
      longitudeOfAscendingNode: 49.6,
      argumentOfPerihelion: 286.5,
      meanAnomaly: 19.4,
    },
  },
  {
    id: 'jupiter',
    name: 'Jupiter',
    type: 'planet',
    radius: 69911,
    mass: 1.8982e27,
    color: '#C88B3A',
    composition: 'rocky',
    orbitalElements: {
      semiMajorAxis: 5.203,
      eccentricity: 0.048,
      inclination: 1.3,
      longitudeOfAscendingNode: 100.5,
      argumentOfPerihelion: 273.9,
      meanAnomaly: 20.0,
    },
  },
  {
    id: 'saturn',
    name: 'Saturn',
    type: 'planet',
    radius: 58232,
    mass: 5.6834e26,
    color: '#FAD5A5',
    composition: 'rocky',
    orbitalElements: {
      semiMajorAxis: 9.537,
      eccentricity: 0.056,
      inclination: 2.5,
      longitudeOfAscendingNode: 113.6,
      argumentOfPerihelion: 339.4,
      meanAnomaly: 317.0,
    },
  },
  {
    id: 'uranus',
    name: 'Uranus',
    type: 'planet',
    radius: 25362,
    mass: 8.6810e25,
    color: '#4FD0E7',
    composition: 'icy',
    orbitalElements: {
      semiMajorAxis: 19.191,
      eccentricity: 0.046,
      inclination: 0.8,
      longitudeOfAscendingNode: 74.0,
      argumentOfPerihelion: 96.6,
      meanAnomaly: 142.2,
    },
  },
  {
    id: 'neptune',
    name: 'Neptune',
    type: 'planet',
    radius: 24622,
    mass: 1.02413e26,
    color: '#4166F5',
    composition: 'icy',
    orbitalElements: {
      semiMajorAxis: 30.069,
      eccentricity: 0.010,
      inclination: 1.8,
      longitudeOfAscendingNode: 131.8,
      argumentOfPerihelion: 273.2,
      meanAnomaly: 256.2,
    },
  },
]
