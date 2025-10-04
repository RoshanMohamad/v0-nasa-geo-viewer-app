/**
 * Impact Calculation Engine
 * Based on real asteroid impact physics and formulas
 */

export interface AsteroidData {
  diameter: number // km
  velocity: number // km/s
  density?: number // kg/m³ (default: 2600 for rocky asteroid)
  angle?: number // degrees from horizontal (default: 45)
}

export interface ImpactResults {
  energy: {
    joules: number
    megatonsTNT: number
  }
  crater: {
    diameter: number // km
    depth: number // km
  }
  damage: {
    airblastRadius: number // km
    thermalRadius: number // km
    seismicMagnitude: number
    tsunamiHeight?: number // meters (if ocean impact)
  }
  comparison: string
  severity: "minor" | "moderate" | "severe" | "catastrophic" | "extinction"
}

/**
 * Calculate asteroid mass in kg
 */
function calculateMass(diameter: number, density: number): number {
  const radius = (diameter * 1000) / 2 // convert km to meters
  const volume = (4 / 3) * Math.PI * Math.pow(radius, 3)
  return volume * density
}

/**
 * Calculate kinetic energy
 */
function calculateKineticEnergy(mass: number, velocity: number): number {
  const velocityMS = velocity * 1000 // convert km/s to m/s
  return 0.5 * mass * Math.pow(velocityMS, 2)
}

/**
 * Convert joules to megatons of TNT
 */
function joulesToMegatons(joules: number): number {
  return joules / 4.184e15
}

/**
 * Calculate crater dimensions using scaling laws
 */
function calculateCrater(energy: number, angle: number): { diameter: number; depth: number } {
  // Simplified crater scaling law
  const energyMT = joulesToMegatons(energy)
  const angleFactor = Math.sin((angle * Math.PI) / 180)

  // Crater diameter in km
  const diameter = 0.07 * Math.pow(energyMT, 0.33) * angleFactor

  // Crater depth (typically 1/5 to 1/10 of diameter)
  const depth = diameter / 7

  return { diameter, depth }
}

/**
 * Calculate damage radii
 */
function calculateDamage(energy: number): {
  airblastRadius: number
  thermalRadius: number
  seismicMagnitude: number
} {
  const energyMT = joulesToMegatons(energy)

  // Airblast radius (overpressure damage) in km
  const airblastRadius = 2.2 * Math.pow(energyMT, 0.33)

  // Thermal radiation radius in km
  const thermalRadius = 3.5 * Math.pow(energyMT, 0.41)

  // Seismic magnitude (Richter scale)
  const seismicMagnitude = 0.67 * Math.log10(energyMT) + 3.87

  return { airblastRadius, thermalRadius, seismicMagnitude }
}

/**
 * Get comparison to known events
 */
function getComparison(energyMT: number): string {
  if (energyMT < 0.001) {
    return "Comparable to a small bomb"
  } else if (energyMT < 0.015) {
    return "Similar to Hiroshima atomic bomb (15 kilotons)"
  } else if (energyMT < 0.5) {
    return "Similar to Chelyabinsk meteor (2013)"
  } else if (energyMT < 10) {
    return "Similar to Tunguska event (1908)"
  } else if (energyMT < 1000) {
    return "Similar to largest nuclear weapons tested"
  } else if (energyMT < 100000) {
    return "Regional devastation event"
  } else if (energyMT < 10000000) {
    return "Similar to Chicxulub impact (dinosaur extinction)"
  } else {
    return "Global extinction level event"
  }
}

/**
 * Determine severity level
 */
function getSeverity(energyMT: number): "minor" | "moderate" | "severe" | "catastrophic" | "extinction" {
  if (energyMT < 0.1) return "minor"
  if (energyMT < 10) return "moderate"
  if (energyMT < 1000) return "severe"
  if (energyMT < 1000000) return "catastrophic"
  return "extinction"
}

/**
 * Main impact calculation function
 */
export function calculateImpact(asteroid: AsteroidData): ImpactResults {
  const density = asteroid.density || 2600 // default rocky asteroid density
  const angle = asteroid.angle || 45 // default 45 degree impact

  // Calculate mass
  const mass = calculateMass(asteroid.diameter, density)

  // Calculate kinetic energy
  const energyJoules = calculateKineticEnergy(mass, asteroid.velocity)
  const energyMT = joulesToMegatons(energyJoules)

  // Calculate crater
  const crater = calculateCrater(energyJoules, angle)

  // Calculate damage
  const damage = calculateDamage(energyJoules)

  // Get comparison and severity
  const comparison = getComparison(energyMT)
  const severity = getSeverity(energyMT)

  return {
    energy: {
      joules: energyJoules,
      megatonsTNT: energyMT,
    },
    crater,
    damage,
    comparison,
    severity,
  }
}

/**
 * Calculate tsunami height for ocean impacts
 */
export function calculateTsunami(asteroid: AsteroidData, waterDepth = 4000): number {
  const density = asteroid.density || 2600
  const mass = calculateMass(asteroid.diameter, density)
  const energy = calculateKineticEnergy(mass, asteroid.velocity)

  // Simplified tsunami height calculation
  const energyMT = joulesToMegatons(energy)
  const height = 0.1 * Math.pow(energyMT, 0.5) * Math.sqrt(waterDepth / 4000)

  return height
}
