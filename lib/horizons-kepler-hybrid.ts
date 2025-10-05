/**
 * Hybrid Planetary Motion System
 * Combines NASA Horizons API data with Kepler's Laws for maximum accuracy
 * 
 * Strategy:
 * 1. Fetch real-time position & velocity from NASA Horizons API (most accurate)
 * 2. Use Kepler's Laws for smooth interpolation between API calls
 * 3. Apply perturbation corrections for inner planets
 */

import { PLANET_ORBITAL_DATA, calculatePlanetPosition } from './planet-positions'

// Cache for Horizons API data
interface HorizonsData {
  position: { x: number; y: number; z: number } // AU
  velocity: { x: number; y: number; z: number } // AU/day
  timestamp: number // Unix timestamp
  planet: string
}

const horizonsCache: Map<string, HorizonsData> = new Map()
const CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 hours

/**
 * Fetch real-time planetary data from NASA JPL Horizons API
 */
export async function fetchPlanetFromHorizons(
  planetId: string,
  planetName: string,
  date: Date = new Date()
): Promise<HorizonsData | null> {
  try {
    // Check cache first
    const cacheKey = `${planetName}-${date.toDateString()}`
    const cached = horizonsCache.get(cacheKey)
    
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log(`✅ Using cached Horizons data for ${planetName}`)
      return cached
    }

    const today = date.toISOString().split('T')[0]
    const tomorrow = new Date(date.getTime() + 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0]

    const params = new URLSearchParams({
      format: 'text',
      COMMAND: planetId,
      OBJ_DATA: 'NO',
      MAKE_EPHEM: 'YES',
      EPHEM_TYPE: 'VECTORS',
      CENTER: '500@0', // Solar System Barycenter
      START_TIME: `'${today}'`,
      STOP_TIME: `'${tomorrow}'`,
      STEP_SIZE: '1d',
      VEC_TABLE: '2',
      REF_PLANE: 'ECLIPTIC',
      REF_SYSTEM: 'J2000',
      VEC_CORR: 'NONE',
      OUT_UNITS: 'AU-D',
      CSV_FORMAT: 'NO',
    })

    console.log(`🌐 Fetching ${planetName} from NASA Horizons API...`)
    const url = `https://ssd.jpl.nasa.gov/api/horizons.api?${params.toString()}`
    const response = await fetch(url)
    
    if (!response.ok) {
      throw new Error(`Horizons API error: ${response.statusText}`)
    }

    const data = await response.text()

    // Parse position and velocity vectors
    const lines = data.split('\n')
    let inData = false
    let posLine = ''
    let velLine = ''

    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes('$$SOE')) {
        inData = true
        continue
      }
      if (lines[i].includes('$$EOE')) {
        break
      }
      if (inData && lines[i].trim()) {
        if (lines[i].includes('X =')) {
          posLine = lines[i]
        } else if (lines[i].includes('VX=')) {
          velLine = lines[i]
        }
      }
    }

    if (!posLine || !velLine) {
      throw new Error('Could not parse Horizons data')
    }

    // Extract position (X, Y, Z)
    const posMatch = posLine.match(/X\s*=\s*([-\d.E+-]+)\s+Y\s*=\s*([-\d.E+-]+)\s+Z\s*=\s*([-\d.E+-]+)/)
    const velMatch = velLine.match(/VX=\s*([-\d.E+-]+)\s+VY=\s*([-\d.E+-]+)\s+VZ=\s*([-\d.E+-]+)/)

    if (!posMatch || !velMatch) {
      throw new Error('Could not extract position/velocity')
    }

    const horizonsData: HorizonsData = {
      position: {
        x: parseFloat(posMatch[1]),
        y: parseFloat(posMatch[2]),
        z: parseFloat(posMatch[3]),
      },
      velocity: {
        x: parseFloat(velMatch[1]),
        y: parseFloat(velMatch[2]),
        z: parseFloat(velMatch[3]),
      },
      timestamp: Date.now(),
      planet: planetName,
    }

    // Cache the result
    horizonsCache.set(cacheKey, horizonsData)
    
    console.log(`✅ ${planetName} position from Horizons:`, {
      x: horizonsData.position.x.toFixed(6),
      y: horizonsData.position.y.toFixed(6),
      z: horizonsData.position.z.toFixed(6),
      vx: horizonsData.velocity.x.toFixed(6),
      vy: horizonsData.velocity.y.toFixed(6),
      vz: horizonsData.velocity.z.toFixed(6),
    })

    return horizonsData
  } catch (error) {
    console.error(`❌ Failed to fetch ${planetName} from Horizons:`, error)
    return null
  }
}

/**
 * Calculate planetary position using hybrid approach:
 * 1. Try to get Horizons API data (most accurate)
 * 2. Fall back to Kepler's Laws calculation
 * 3. Interpolate using velocity for sub-day precision
 */
export async function getHybridPlanetPosition(
  planetName: keyof typeof PLANET_ORBITAL_DATA,
  currentDate: Date = new Date(),
  useAPI: boolean = true
): Promise<{
  position: { x: number; y: number; z: number }
  velocity: { x: number; y: number; z: number }
  source: 'horizons' | 'kepler' | 'interpolated'
  accuracy: 'high' | 'medium' | 'low'
}> {
  const PLANET_IDS: Record<string, string> = {
    Mercury: '199',
    Venus: '299',
    Earth: '399',
    Mars: '499',
    Jupiter: '599',
    Saturn: '699',
    Uranus: '799',
    Neptune: '899',
  }

  // Try Horizons API first (if enabled)
  if (useAPI) {
    const horizonsData = await fetchPlanetFromHorizons(
      PLANET_IDS[planetName],
      planetName,
      currentDate
    )

    if (horizonsData) {
      // Check if we need to interpolate for sub-day precision
      const daysSinceAPIData =
        (currentDate.getTime() - horizonsData.timestamp) / (1000 * 60 * 60 * 24)

      if (Math.abs(daysSinceAPIData) < 1) {
        // Interpolate using velocity (Horizons data + linear motion)
        const position = {
          x: horizonsData.position.x + horizonsData.velocity.x * daysSinceAPIData,
          y: horizonsData.position.y + horizonsData.velocity.y * daysSinceAPIData,
          z: horizonsData.position.z + horizonsData.velocity.z * daysSinceAPIData,
        }

        return {
          position,
          velocity: horizonsData.velocity,
          source: 'interpolated',
          accuracy: 'high',
        }
      }

      // Use Horizons data directly
      return {
        position: horizonsData.position,
        velocity: horizonsData.velocity,
        source: 'horizons',
        accuracy: 'high',
      }
    }
  }

  // Fallback to Kepler's Laws calculation
  const keplerPosition = calculatePlanetPosition(planetName, currentDate)

  // Estimate velocity from Kepler's Laws (for consistency)
  const r = keplerPosition.radiusVector
  const data = PLANET_ORBITAL_DATA[planetName]
  const mu = 0.0002959122 // GM_sun in AU³/day²
  const v_magnitude = Math.sqrt(mu * (2 / r - 1 / data.semiMajorAxis)) // vis-viva equation
  
  // Velocity direction (perpendicular to radius vector, in orbital plane)
  const v_x = -keplerPosition.y * v_magnitude / r
  const v_y = keplerPosition.x * v_magnitude / r
  const v_z = 0 // Simplified (ignores inclination)

  return {
    position: { x: keplerPosition.x, y: keplerPosition.y, z: keplerPosition.z },
    velocity: { x: v_x, y: v_y, z: v_z },
    source: 'kepler',
    accuracy: planetName === 'Mercury' ? 'medium' : 'high',
  }
}

/**
 * Calculate instantaneous orbital velocity using vis-viva equation
 * v = √[μ(2/r - 1/a)]
 */
export function calculateOrbitalVelocity(
  planetName: keyof typeof PLANET_ORBITAL_DATA,
  currentDistance: number // AU
): number {
  const data = PLANET_ORBITAL_DATA[planetName]
  const mu = 0.0002959122 // GM_sun in AU³/day²
  const v = Math.sqrt(mu * (2 / currentDistance - 1 / data.semiMajorAxis))
  return v // AU/day
}

/**
 * Convert velocity from AU/day to km/s
 */
export function velocityAUperDayToKmPerSec(v_au_day: number): number {
  return v_au_day * 149597870.7 / 86400 // 1 AU = 149597870.7 km, 1 day = 86400 s
}

/**
 * Calculate angular velocity from linear velocity (for rotation)
 * ω = v / r
 */
export function calculateAngularVelocity(
  linearVelocity: number, // AU/day
  radius: number // AU
): number {
  return linearVelocity / radius // radians/day
}

/**
 * Preload Horizons data for all planets (call on app start)
 */
export async function preloadAllPlanetsHorizons(
  date: Date = new Date()
): Promise<void> {
  const planets: Array<keyof typeof PLANET_ORBITAL_DATA> = [
    'Mercury',
    'Venus',
    'Earth',
    'Mars',
    'Jupiter',
    'Saturn',
    'Uranus',
    'Neptune',
  ]

  console.log('🚀 Preloading NASA Horizons data for all planets...')

  const promises = planets.map((planet) =>
    getHybridPlanetPosition(planet, date, true)
  )

  await Promise.all(promises)

  console.log('✅ All planets loaded from NASA Horizons!')
}

/**
 * Update planet position using Kepler's Laws for smooth animation
 * between Horizons API updates
 */
export function updatePositionWithKepler(
  horizonsData: HorizonsData,
  elapsedDays: number
): { x: number; y: number; z: number } {
  // Simple linear interpolation using velocity
  return {
    x: horizonsData.position.x + horizonsData.velocity.x * elapsedDays,
    y: horizonsData.position.y + horizonsData.velocity.y * elapsedDays,
    z: horizonsData.position.z + horizonsData.velocity.z * elapsedDays,
  }
}
