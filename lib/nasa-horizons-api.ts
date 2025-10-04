/**
 * NASA Horizons API Integration
 * Fetches real-time asteroid orbital data from NASA JPL Horizons system
 * 
 * API Documentation: https://ssd-api.jpl.nasa.gov/doc/horizons.html
 */

import type { StateVector, OrbitalElements, CelestialBody } from './orbital-mechanics'
import { stateVectorsToOrbitalElements } from './orbital-mechanics'

const HORIZONS_API_BASE = 'https://ssd.jpl.nasa.gov/api/horizons.api'

export interface HorizonsParams {
  designation: string // e.g., '99942' for Apophis, '433' for Eros
  center: string // '@sun' for heliocentric, '@399' for geocentric
  startTime?: string // ISO date
  stopTime?: string // ISO date
  stepSize?: string // e.g., '1d' for 1 day
}

export interface AsteroidPreset {
  name: string
  designation: string
  description: string
  composition: 'rocky' | 'icy' | 'metallic' | 'carbonaceous'
  estimatedMass: number // kg
  estimatedRadius: number // km
  color: string
}

/**
 * Famous asteroids with known orbital data
 */
export const ASTEROID_PRESETS: Record<string, AsteroidPreset> = {
  apophis: {
    name: '99942 Apophis',
    designation: '99942',
    description: 'Near-Earth asteroid, close approach in 2029',
    composition: 'rocky',
    estimatedMass: 6.1e10,
    estimatedRadius: 0.185,
    color: '#FF6B35',
  },
  bennu: {
    name: '101955 Bennu',
    designation: '101955',
    description: 'Target of OSIRIS-REx mission',
    composition: 'carbonaceous',
    estimatedMass: 7.8e10,
    estimatedRadius: 0.245,
    color: '#2C3E50',
  },
  eros: {
    name: '433 Eros',
    designation: '433',
    description: 'First asteroid orbited by spacecraft',
    composition: 'rocky',
    estimatedMass: 6.687e15,
    estimatedRadius: 8.42,
    color: '#CD853F',
  },
  ryugu: {
    name: '162173 Ryugu',
    designation: '162173',
    description: 'Target of Hayabusa2 mission',
    composition: 'carbonaceous',
    estimatedMass: 4.5e11,
    estimatedRadius: 0.45,
    color: '#34495E',
  },
  vesta: {
    name: '4 Vesta',
    designation: '4',
    description: 'Second-largest asteroid, visited by Dawn',
    composition: 'rocky',
    estimatedMass: 2.59e20,
    estimatedRadius: 262.7,
    color: '#95A5A6',
  },
  ceres: {
    name: '1 Ceres',
    designation: '1',
    description: 'Largest object in asteroid belt, dwarf planet',
    composition: 'icy',
    estimatedMass: 9.38e20,
    estimatedRadius: 473,
    color: '#BDC3C7',
  },
  halley: {
    name: "1P/Halley",
    designation: '1P',
    description: "Halley's Comet - famous periodic comet",
    composition: 'icy',
    estimatedMass: 2.2e14,
    estimatedRadius: 5.5,
    color: '#3498DB',
  },
  oumuamua: {
    name: "1I/'Oumuamua",
    designation: '1I',
    description: 'First interstellar object detected',
    composition: 'rocky',
    estimatedMass: 4e8,
    estimatedRadius: 0.115,
    color: '#E74C3C',
  },
}

/**
 * Custom asteroid/comet presets for simulation
 */
export const CUSTOM_PRESETS = {
  'halleys-comet': {
    name: "Halley's Comet",
    semiMajorAxis: 17.8,
    eccentricity: 0.967,
    inclination: 162.3,
    argumentOfPerihelion: 111.3,
    longitudeOfAscendingNode: 58.4,
    mass: 2.2e14,
    radius: 5.5,
    composition: 'icy' as const,
    type: 'comet' as const,
  },
  'pluto': {
    name: 'Pluto',
    semiMajorAxis: 39.48,
    eccentricity: 0.249,
    inclination: 17.2,
    argumentOfPerihelion: 113.8,
    longitudeOfAscendingNode: 110.3,
    mass: 1.303e22,
    radius: 1188.3,
    composition: 'icy' as const,
    type: 'dwarf-planet' as const,
  },
  'the-collider': {
    name: 'The Collider (Fictional)',
    semiMajorAxis: 1.0,
    eccentricity: 0.8,
    inclination: 15,
    argumentOfPerihelion: 90,
    longitudeOfAscendingNode: 0,
    mass: 1e15,
    radius: 10,
    composition: 'rocky' as const,
    type: 'asteroid' as const,
  },
}

/**
 * Fetch asteroid data from NASA Horizons API
 */
export async function fetchHorizonsData(params: HorizonsParams): Promise<StateVector | null> {
  const { designation, center = '@sun', startTime, stopTime, stepSize = '1d' } = params

  const now = new Date()
  const start = startTime || now.toISOString().split('T')[0]
  const stop = stopTime || new Date(now.getTime() + 86400000).toISOString().split('T')[0]

  const queryParams = new URLSearchParams({
    format: 'json',
    COMMAND: designation,
    CENTER: center,
    START_TIME: start,
    STOP_TIME: stop,
    STEP_SIZE: stepSize,
    OBJ_DATA: 'YES',
    MAKE_EPHEM: 'YES',
    TABLE_TYPE: 'VECTORS',
  })

  try {
    const response = await fetch(`${HORIZONS_API_BASE}?${queryParams}`)
    
    if (!response.ok) {
      console.error('Horizons API error:', response.statusText)
      return null
    }

    const data = await response.json()
    
    // Parse the result (Horizons API returns text data in 'result' field)
    if (!data.result) {
      console.error('No result in Horizons response')
      return null
    }

    // Parse state vectors from the text result
    const stateVector = parseHorizonsVectors(data.result)
    return stateVector
  } catch (error) {
    console.error('Error fetching Horizons data:', error)
    return null
  }
}

/**
 * Parse state vectors from Horizons API text response
 */
function parseHorizonsVectors(text: string): StateVector | null {
  try {
    // Horizons format: Lines contain X, Y, Z, VX, VY, VZ
    const lines = text.split('\n')
    let foundData = false
    
    for (const line of lines) {
      // Look for data lines (typically start with a date)
      if (line.includes('$$SOE')) {
        foundData = true
        continue
      }
      if (line.includes('$$EOE')) {
        break
      }
      
      if (foundData && line.trim()) {
        // Parse position and velocity
        const values = line.trim().split(/\s+/)
        
        if (values.length >= 6) {
          return {
            position: {
              x: parseFloat(values[0]),
              y: parseFloat(values[1]),
              z: parseFloat(values[2]),
            },
            velocity: {
              vx: parseFloat(values[3]),
              vy: parseFloat(values[4]),
              vz: parseFloat(values[5]),
            },
          }
        }
      }
    }
  } catch (error) {
    console.error('Error parsing Horizons vectors:', error)
  }
  
  return null
}

/**
 * Fetch real asteroid and convert to CelestialBody
 */
export async function fetchRealAsteroid(
  presetKey: keyof typeof ASTEROID_PRESETS
): Promise<CelestialBody | null> {
  const preset = ASTEROID_PRESETS[presetKey]
  if (!preset) return null

  // Fetch state vectors from Horizons
  const stateVector = await fetchHorizonsData({
    designation: preset.designation,
    center: '@sun',
  })

  let orbitalElements: OrbitalElements
  
  if (stateVector) {
    // Convert state vectors to orbital elements
    orbitalElements = stateVectorsToOrbitalElements(stateVector)
  } else {
    // Fallback to approximate orbital elements
    console.warn(`Could not fetch ${preset.name} from Horizons, using approximate data`)
    orbitalElements = getApproximateOrbitalElements(presetKey)
  }

  const celestialBody: CelestialBody = {
    id: `asteroid-${presetKey}`,
    name: preset.name,
    type: 'asteroid',
    radius: preset.estimatedRadius,
    mass: preset.estimatedMass,
    color: preset.color,
    composition: preset.composition,
    orbitalElements,
    nasaState: stateVector || undefined,
  }

  return celestialBody
}

/**
 * Approximate orbital elements for known asteroids (fallback)
 */
function getApproximateOrbitalElements(
  presetKey: keyof typeof ASTEROID_PRESETS
): OrbitalElements {
  const approximateData: Record<string, OrbitalElements> = {
    apophis: {
      semiMajorAxis: 0.922,
      eccentricity: 0.191,
      inclination: 3.3,
      longitudeOfAscendingNode: 204.4,
      argumentOfPerihelion: 126.4,
      meanAnomaly: 0,
    },
    bennu: {
      semiMajorAxis: 1.126,
      eccentricity: 0.204,
      inclination: 6.0,
      longitudeOfAscendingNode: 2.0,
      argumentOfPerihelion: 66.2,
      meanAnomaly: 0,
    },
    eros: {
      semiMajorAxis: 1.458,
      eccentricity: 0.223,
      inclination: 10.8,
      longitudeOfAscendingNode: 304.3,
      argumentOfPerihelion: 178.8,
      meanAnomaly: 0,
    },
    ryugu: {
      semiMajorAxis: 1.190,
      eccentricity: 0.190,
      inclination: 5.9,
      longitudeOfAscendingNode: 251.6,
      argumentOfPerihelion: 211.4,
      meanAnomaly: 0,
    },
    vesta: {
      semiMajorAxis: 2.362,
      eccentricity: 0.089,
      inclination: 7.1,
      longitudeOfAscendingNode: 103.8,
      argumentOfPerihelion: 151.2,
      meanAnomaly: 0,
    },
    ceres: {
      semiMajorAxis: 2.769,
      eccentricity: 0.076,
      inclination: 10.6,
      longitudeOfAscendingNode: 80.3,
      argumentOfPerihelion: 73.6,
      meanAnomaly: 0,
    },
    halley: {
      semiMajorAxis: 17.8,
      eccentricity: 0.967,
      inclination: 162.3,
      longitudeOfAscendingNode: 58.4,
      argumentOfPerihelion: 111.3,
      meanAnomaly: 0,
    },
    oumuamua: {
      semiMajorAxis: -1.3, // Hyperbolic orbit
      eccentricity: 1.2,
      inclination: 122.7,
      longitudeOfAscendingNode: 24.6,
      argumentOfPerihelion: 241.8,
      meanAnomaly: 0,
    },
  }

  return approximateData[presetKey] || approximateData.apophis
}

/**
 * Create custom celestial body from preset
 */
export function createCustomBody(
  presetKey: keyof typeof CUSTOM_PRESETS,
  meanAnomaly: number = 0
): CelestialBody {
  const preset = CUSTOM_PRESETS[presetKey]

  return {
    id: `custom-${presetKey}`,
    name: preset.name,
    type: preset.type,
    radius: preset.radius,
    mass: preset.mass,
    color: '#FF6B35',
    composition: preset.composition,
    orbitalElements: {
      semiMajorAxis: preset.semiMajorAxis,
      eccentricity: preset.eccentricity,
      inclination: preset.inclination,
      longitudeOfAscendingNode: preset.longitudeOfAscendingNode,
      argumentOfPerihelion: preset.argumentOfPerihelion,
      meanAnomaly,
    },
  }
}

/**
 * Add real asteroid from NASA data (wrapper function)
 * Alias for fetchRealAsteroid for backwards compatibility
 */
export async function addRealAsteroid(
  presetKey: keyof typeof ASTEROID_PRESETS
): Promise<CelestialBody | null> {
  console.log('🚀 Fetching NASA data for:', presetKey)
  const result = await fetchRealAsteroid(presetKey)
  if (result) {
    console.log('✅ Successfully fetched NASA data for:', result.name)
  } else {
    console.warn('⚠️ Failed to fetch NASA data for:', presetKey, '- using fallback data')
  }
  return result
}

/**
 * Fetch NASA Horizons data (wrapper for testing)
 */
export async function fetchNASAHorizonsData(params: HorizonsParams) {
  console.log('🛰️ Calling NASA Horizons API with params:', params)
  return await fetchHorizonsData(params)
}
