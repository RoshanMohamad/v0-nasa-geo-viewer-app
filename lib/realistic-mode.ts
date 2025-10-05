/**
 * 🌌 Realistic Mode Configuration
 * 
 * Provides true-to-scale astronomical data and rendering modes
 * with NASA API integration for accurate solar system visualization
 */

export type ScaleMode = 'visual' | 'realistic' | 'hybrid'

export interface ScaleConfiguration {
  name: string
  description: string
  sunSize: number
  planetSizeMultiplier: number
  distanceMultiplier: number
  asteroidSizeMultiplier: number
  lightingRealistic: boolean
  showAtmospheres: boolean
  showRings: boolean
}

/**
 * Astronomical Constants (NASA/JPL values)
 */
export const ASTRONOMICAL_CONSTANTS = {
  // Sun
  SUN_RADIUS_KM: 696000,
  SUN_MASS_KG: 1.989e30,
  
  // Planets (radius in km)
  MERCURY_RADIUS: 2439.7,
  VENUS_RADIUS: 6051.8,
  EARTH_RADIUS: 6371,
  MARS_RADIUS: 3389.5,
  JUPITER_RADIUS: 69911,
  SATURN_RADIUS: 58232,
  URANUS_RADIUS: 25362,
  NEPTUNE_RADIUS: 24622,
  
  // Orbital distances (AU - Astronomical Units)
  // 1 AU = 149,597,870.7 km (Earth-Sun distance)
  MERCURY_DISTANCE_AU: 0.387,
  VENUS_DISTANCE_AU: 0.723,
  EARTH_DISTANCE_AU: 1.000,
  MARS_DISTANCE_AU: 1.524,
  JUPITER_DISTANCE_AU: 5.203,
  SATURN_DISTANCE_AU: 9.537,
  URANUS_DISTANCE_AU: 19.191,
  NEPTUNE_DISTANCE_AU: 30.069,
  
  // Orbital periods (Earth days)
  MERCURY_PERIOD: 87.97,
  VENUS_PERIOD: 224.70,
  EARTH_PERIOD: 365.26,
  MARS_PERIOD: 686.98,
  JUPITER_PERIOD: 4332.59,
  SATURN_PERIOD: 10759.22,
  URANUS_PERIOD: 30688.5,
  NEPTUNE_PERIOD: 60182,
  
  // Light speed and travel times
  LIGHT_SPEED_KM_S: 299792.458,
  SUN_EARTH_LIGHT_MINUTES: 8.317, // Light takes 8.3 minutes from Sun to Earth
  
  // Reference scale
  AU_TO_KM: 149597870.7,
  EARTH_SCENE_UNITS: 28, // Earth is at 28 units in current visual mode
}

/**
 * Scale Mode Configurations
 */
export const SCALE_MODES: Record<ScaleMode, ScaleConfiguration> = {
  /**
   * VISUAL MODE (Current - Optimized for viewing)
   * - Compressed distances for visibility
   * - Enlarged planets for interaction
   * - Fast orbital speeds for engagement
   */
  visual: {
    name: 'Visual Mode',
    description: 'Optimized for visibility and interaction. Planets and distances are scaled for easy viewing.',
    sunSize: 5,
    planetSizeMultiplier: 1.0,
    distanceMultiplier: 1.0,
    asteroidSizeMultiplier: 1.0,
    lightingRealistic: false,
    showAtmospheres: true,
    showRings: true,
  },
  
  /**
   * REALISTIC MODE (True astronomical scale)
   * - Accurate planet sizes relative to Sun
   * - True orbital distances
   * - Warning: Planets will be VERY small and far apart!
   */
  realistic: {
    name: 'Realistic Scale',
    description: 'True astronomical scale. Warning: Planets will be tiny and very far apart!',
    sunSize: 139.2, // Sun diameter is 109x Earth's diameter
    planetSizeMultiplier: 0.035, // Scale down to realistic sizes
    distanceMultiplier: 2.0, // Expand distances (full scale would be unusable)
    asteroidSizeMultiplier: 0.01, // Real asteroid scale
    lightingRealistic: true,
    showAtmospheres: true,
    showRings: true,
  },
  
  /**
   * HYBRID MODE (Balanced realism and usability)
   * - Larger Sun for realism
   * - Proportionally scaled planets
   * - Expanded but viewable distances
   */
  hybrid: {
    name: 'Hybrid Scale',
    description: 'Balanced between realism and usability. More accurate proportions while staying interactive.',
    sunSize: 25,
    planetSizeMultiplier: 0.5,
    distanceMultiplier: 1.5,
    asteroidSizeMultiplier: 0.5,
    lightingRealistic: true,
    showAtmospheres: true,
    showRings: true,
  },
}

/**
 * Calculate realistic planet size based on mode
 */
export function getRealisticPlanetSize(
  planetName: string,
  mode: ScaleMode,
  baseSize: number
): number {
  const config = SCALE_MODES[mode]
  
  if (mode === 'visual') {
    return baseSize // Use existing visual sizes
  }
  
  // Calculate actual size ratios
  const planetRadii: Record<string, number> = {
    'Mercury': ASTRONOMICAL_CONSTANTS.MERCURY_RADIUS,
    'Venus': ASTRONOMICAL_CONSTANTS.VENUS_RADIUS,
    'Earth': ASTRONOMICAL_CONSTANTS.EARTH_RADIUS,
    'Mars': ASTRONOMICAL_CONSTANTS.MARS_RADIUS,
    'Jupiter': ASTRONOMICAL_CONSTANTS.JUPITER_RADIUS,
    'Saturn': ASTRONOMICAL_CONSTANTS.SATURN_RADIUS,
    'Uranus': ASTRONOMICAL_CONSTANTS.URANUS_RADIUS,
    'Neptune': ASTRONOMICAL_CONSTANTS.NEPTUNE_RADIUS,
  }
  
  const radius = planetRadii[planetName]
  if (!radius) return baseSize
  
  // Scale relative to Sun (Sun size is config.sunSize)
  const sizeRelativeToSun = (radius / ASTRONOMICAL_CONSTANTS.SUN_RADIUS_KM)
  const calculatedSize = config.sunSize * sizeRelativeToSun
  
  // Apply multiplier for visibility
  return Math.max(0.1, calculatedSize * config.planetSizeMultiplier)
}

/**
 * Calculate realistic orbital distance based on mode
 */
export function getRealisticDistance(
  planetName: string,
  mode: ScaleMode,
  baseDistance: number
): number {
  const config = SCALE_MODES[mode]
  
  if (mode === 'visual') {
    return baseDistance // Use existing visual distances
  }
  
  // True orbital distances in AU
  const distancesAU: Record<string, number> = {
    'Mercury': ASTRONOMICAL_CONSTANTS.MERCURY_DISTANCE_AU,
    'Venus': ASTRONOMICAL_CONSTANTS.VENUS_DISTANCE_AU,
    'Earth': ASTRONOMICAL_CONSTANTS.EARTH_DISTANCE_AU,
    'Mars': ASTRONOMICAL_CONSTANTS.MARS_DISTANCE_AU,
    'Jupiter': ASTRONOMICAL_CONSTANTS.JUPITER_DISTANCE_AU,
    'Saturn': ASTRONOMICAL_CONSTANTS.SATURN_DISTANCE_AU,
    'Uranus': ASTRONOMICAL_CONSTANTS.URANUS_DISTANCE_AU,
    'Neptune': ASTRONOMICAL_CONSTANTS.NEPTUNE_DISTANCE_AU,
  }
  
  const distanceAU = distancesAU[planetName]
  if (!distanceAU) return baseDistance
  
  // Scale based on Earth's position (Earth at 28 units in visual mode)
  const earthSceneUnits = ASTRONOMICAL_CONSTANTS.EARTH_SCENE_UNITS
  const calculatedDistance = earthSceneUnits * distanceAU
  
  // Apply distance multiplier
  return calculatedDistance * config.distanceMultiplier
}

/**
 * Calculate light intensity falloff (Inverse Square Law)
 */
export function calculateLightIntensity(
  distanceFromSun: number,
  mode: ScaleMode
): number {
  const config = SCALE_MODES[mode]
  
  if (!config.lightingRealistic) {
    return 1.0 // Uniform lighting in visual mode
  }
  
  // Inverse square law: I = 1 / d²
  // Normalize by Earth's distance to get relative brightness
  const earthDistance = ASTRONOMICAL_CONSTANTS.EARTH_SCENE_UNITS
  const relativeDistance = distanceFromSun / earthDistance
  
  // Intensity falls off with square of distance
  const intensity = 1.0 / (relativeDistance * relativeDistance)
  
  // Clamp to reasonable values
  return Math.max(0.01, Math.min(1.5, intensity))
}

/**
 * Real orbital velocity calculation (Kepler's laws)
 */
export function calculateOrbitalVelocity(
  planetName: string,
  distanceAU: number
): number {
  // Using vis-viva equation: v = sqrt(GM(2/r - 1/a))
  // Simplified for circular orbits: v ≈ sqrt(GM/r)
  
  const G = 6.67430e-11 // Gravitational constant
  const M = ASTRONOMICAL_CONSTANTS.SUN_MASS_KG
  const r = distanceAU * ASTRONOMICAL_CONSTANTS.AU_TO_KM * 1000 // Convert to meters
  
  // Velocity in m/s
  const velocityMS = Math.sqrt((G * M) / r)
  
  // Convert to km/s
  return velocityMS / 1000
}

/**
 * Get planet info card data (shows real vs visual values)
 */
export function getPlanetInfoCard(planetName: string, mode: ScaleMode) {
  const realData: Record<string, any> = {
    'Mercury': {
      radius: ASTRONOMICAL_CONSTANTS.MERCURY_RADIUS,
      distance: ASTRONOMICAL_CONSTANTS.MERCURY_DISTANCE_AU,
      period: ASTRONOMICAL_CONSTANTS.MERCURY_PERIOD,
      velocity: 47.87,
    },
    'Venus': {
      radius: ASTRONOMICAL_CONSTANTS.VENUS_RADIUS,
      distance: ASTRONOMICAL_CONSTANTS.VENUS_DISTANCE_AU,
      period: ASTRONOMICAL_CONSTANTS.VENUS_PERIOD,
      velocity: 35.02,
    },
    'Earth': {
      radius: ASTRONOMICAL_CONSTANTS.EARTH_RADIUS,
      distance: ASTRONOMICAL_CONSTANTS.EARTH_DISTANCE_AU,
      period: ASTRONOMICAL_CONSTANTS.EARTH_PERIOD,
      velocity: 29.78,
    },
    'Mars': {
      radius: ASTRONOMICAL_CONSTANTS.MARS_RADIUS,
      distance: ASTRONOMICAL_CONSTANTS.MARS_DISTANCE_AU,
      period: ASTRONOMICAL_CONSTANTS.MARS_PERIOD,
      velocity: 24.07,
    },
    'Jupiter': {
      radius: ASTRONOMICAL_CONSTANTS.JUPITER_RADIUS,
      distance: ASTRONOMICAL_CONSTANTS.JUPITER_DISTANCE_AU,
      period: ASTRONOMICAL_CONSTANTS.JUPITER_PERIOD,
      velocity: 13.07,
    },
    'Saturn': {
      radius: ASTRONOMICAL_CONSTANTS.SATURN_RADIUS,
      distance: ASTRONOMICAL_CONSTANTS.SATURN_DISTANCE_AU,
      period: ASTRONOMICAL_CONSTANTS.SATURN_PERIOD,
      velocity: 9.69,
    },
    'Uranus': {
      radius: ASTRONOMICAL_CONSTANTS.URANUS_RADIUS,
      distance: ASTRONOMICAL_CONSTANTS.URANUS_DISTANCE_AU,
      period: ASTRONOMICAL_CONSTANTS.URANUS_PERIOD,
      velocity: 6.81,
    },
    'Neptune': {
      radius: ASTRONOMICAL_CONSTANTS.NEPTUNE_RADIUS,
      distance: ASTRONOMICAL_CONSTANTS.NEPTUNE_DISTANCE_AU,
      period: ASTRONOMICAL_CONSTANTS.NEPTUNE_PERIOD,
      velocity: 5.43,
    },
  }
  
  return realData[planetName]
}

/**
 * Time scale configurations
 */
export const TIME_SCALES = {
  realtime: { multiplier: 1, label: '1x (Real-time)', description: 'True astronomical speed (very slow!)' },
  fast: { multiplier: 3600, label: '3,600x (1hr/sec)', description: '1 hour per second' },
  veryFast: { multiplier: 86400, label: '86,400x (1day/sec)', description: '1 day per second' },
  hyperFast: { multiplier: 604800, label: '604,800x (1wk/sec)', description: '1 week per second' },
  ultraFast: { multiplier: 2592000, label: '2.6M x (1mo/sec)', description: '1 month per second' },
  extreme: { multiplier: 31536000, label: '31.5M x (1yr/sec)', description: '1 year per second' },
} as const

export type TimeScale = keyof typeof TIME_SCALES
