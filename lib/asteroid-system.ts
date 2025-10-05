/**
 * 🌠 ASTEROID SYSTEM - Dynamic asteroid simulation and impact detection
 * 
 * Features:
 * - Add/remove asteroids dynamically without affecting NASA planets
 * - Realistic orbital mechanics using Kepler's equations
 * - Impact detection with Earth and other planets
 * - Collision animations and effects
 * - Multiple asteroid tracking
 */

import * as THREE from "three"

export interface CustomAsteroid {
  id: string
  name: string
  color: string
  size: number
  
  // Orbital parameters (Kepler elements)
  semiMajorAxis: number  // a - orbit size
  eccentricity: number   // e - orbit shape (0 = circle, 0.9 = very elliptical)
  inclination: number    // i - tilt from ecliptic (radians)
  longitudeOfAscendingNode: number  // Ω - where orbit crosses ecliptic
  argumentOfPeriapsis: number       // ω - where orbit is closest to sun
  meanAnomalyAtEpoch: number        // M₀ - starting position
  
  // Physical properties
  mass: number           // kg
  velocity: THREE.Vector3
  position: THREE.Vector3
  
  // State
  created: number        // timestamp
  impacted: boolean
  targetPlanet?: string  // Optional: heading toward specific planet
  
  // Visual
  glowColor?: string
  trailEnabled?: boolean
}

export interface AsteroidMesh {
  id: string
  mesh: THREE.Mesh
  trail?: THREE.Line
  glow?: THREE.Mesh
  data: CustomAsteroid
}

export interface ImpactEvent {
  asteroidId: string
  asteroidName: string
  targetPlanet: string
  impactPosition: THREE.Vector3
  impactVelocity: number
  impactEnergy: number  // Joules
  timestamp: number
}

/**
 * Calculate asteroid position using Kepler's equation
 */
export function calculateAsteroidPosition(
  asteroid: CustomAsteroid,
  time: number
): THREE.Vector3 {
  const { 
    semiMajorAxis: a, 
    eccentricity: e, 
    inclination: i,
    longitudeOfAscendingNode: Omega,
    argumentOfPeriapsis: omega,
    meanAnomalyAtEpoch: M0
  } = asteroid

  // Mean motion (radians per second)
  const n = Math.sqrt(1 / Math.pow(a, 3)) * 0.01

  // Current mean anomaly
  const M = M0 + n * time

  // Solve Kepler's equation: E - e*sin(E) = M
  let E = M
  for (let iter = 0; iter < 10; iter++) {
    E = M + e * Math.sin(E)
  }

  // True anomaly
  const nu = 2 * Math.atan2(
    Math.sqrt(1 + e) * Math.sin(E / 2),
    Math.sqrt(1 - e) * Math.cos(E / 2)
  )

  // Distance from sun
  const r = a * (1 - e * Math.cos(E))

  // Position in orbital plane
  const x_orb = r * Math.cos(nu)
  const y_orb = r * Math.sin(nu)

  // Rotate to 3D space
  const cosOmega = Math.cos(Omega)
  const sinOmega = Math.sin(Omega)
  const cosomega = Math.cos(omega)
  const sinomega = Math.sin(omega)
  const cosi = Math.cos(i)
  const sini = Math.sin(i)

  const x = (cosOmega * cosomega - sinOmega * sinomega * cosi) * x_orb +
            (-cosOmega * sinomega - sinOmega * cosomega * cosi) * y_orb
  
  const y = (sinOmega * cosomega + cosOmega * sinomega * cosi) * x_orb +
            (-sinOmega * sinomega + cosOmega * cosomega * cosi) * y_orb
  
  const z = (sinomega * sini) * x_orb + (cosomega * sini) * y_orb

  return new THREE.Vector3(x, y, z)
}

/**
 * Create asteroid mesh with glow effect
 */
export function createAsteroidMesh(
  asteroid: CustomAsteroid,
  textureLoader?: THREE.TextureLoader
): THREE.Mesh {
  const geometry = new THREE.SphereGeometry(asteroid.size, 32, 32)
  
  // Create rocky material with bright glow
  const material = new THREE.MeshStandardMaterial({
    color: asteroid.color,
    roughness: 0.9,
    metalness: 0.1,
    emissive: asteroid.glowColor || asteroid.color,
    emissiveIntensity: 0.8, // BRIGHTER (was 0.2) - makes it glow!
  })

  const mesh = new THREE.Mesh(geometry, material)
  mesh.castShadow = true
  mesh.receiveShadow = true
  mesh.visible = true // Force visible
  mesh.frustumCulled = false // Never cull from view
  mesh.name = `asteroid_${asteroid.id}`
  
  return mesh
}

/**
 * Create glow sphere around asteroid
 */
export function createAsteroidGlow(
  asteroid: CustomAsteroid
): THREE.Mesh {
  const glowGeometry = new THREE.SphereGeometry(asteroid.size * 1.5, 32, 32)
  const glowMaterial = new THREE.MeshBasicMaterial({
    color: asteroid.glowColor || asteroid.color,
    transparent: true,
    opacity: 0.3,
    side: THREE.BackSide,
  })
  
  const glow = new THREE.Mesh(glowGeometry, glowMaterial)
  glow.name = `glow_${asteroid.id}`
  
  return glow
}

/**
 * Create trail line for asteroid path
 */
export function createAsteroidTrail(
  asteroid: CustomAsteroid,
  points: THREE.Vector3[]
): THREE.Line {
  const geometry = new THREE.BufferGeometry().setFromPoints(points)
  const material = new THREE.LineBasicMaterial({
    color: asteroid.color,
    opacity: 0.5,
    transparent: true,
    linewidth: 2,
  })
  
  const trail = new THREE.Line(geometry, material)
  trail.name = `trail_${asteroid.id}`
  
  return trail
}

/**
 * Check collision between asteroid and planet
 */
export function checkCollision(
  asteroidPos: THREE.Vector3,
  asteroidSize: number,
  planetPos: THREE.Vector3,
  planetSize: number
): boolean {
  const distance = asteroidPos.distanceTo(planetPos)
  const collisionThreshold = asteroidSize + planetSize
  
  return distance < collisionThreshold
}

/**
 * Calculate impact energy (kinetic energy formula)
 */
export function calculateImpactEnergy(
  mass: number,
  velocity: THREE.Vector3
): number {
  const speed = velocity.length()
  // KE = 1/2 * m * v²
  return 0.5 * mass * speed * speed
}

/**
 * Create impact explosion effect
 */
export function createImpactExplosion(
  position: THREE.Vector3,
  color: string,
  scale: number = 1
): THREE.Points {
  const particleCount = 1000
  const geometry = new THREE.BufferGeometry()
  const positions = new Float32Array(particleCount * 3)
  const velocities = new Float32Array(particleCount * 3)
  
  for (let i = 0; i < particleCount * 3; i += 3) {
    // Start at impact point
    positions[i] = position.x
    positions[i + 1] = position.y
    positions[i + 2] = position.z
    
    // Random outward velocities
    const theta = Math.random() * Math.PI * 2
    const phi = Math.random() * Math.PI
    const speed = (Math.random() * 0.5 + 0.5) * scale
    
    velocities[i] = Math.sin(phi) * Math.cos(theta) * speed
    velocities[i + 1] = Math.sin(phi) * Math.sin(theta) * speed
    velocities[i + 2] = Math.cos(phi) * speed
  }
  
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3))
  
  const material = new THREE.PointsMaterial({
    color: color,
    size: 0.5 * scale,
    transparent: true,
    opacity: 1,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  })
  
  const explosion = new THREE.Points(geometry, material)
  explosion.name = 'impact_explosion'
  
  return explosion
}

/**
 * Update explosion particles (call in animation loop)
 */
export function updateExplosion(
  explosion: THREE.Points,
  deltaTime: number
): boolean {
  const positions = explosion.geometry.attributes.position.array as Float32Array
  const velocities = explosion.geometry.attributes.velocity.array as Float32Array
  const material = explosion.material as THREE.PointsMaterial
  
  // Update positions
  for (let i = 0; i < positions.length; i += 3) {
    positions[i] += velocities[i] * deltaTime * 60
    positions[i + 1] += velocities[i + 1] * deltaTime * 60
    positions[i + 2] += velocities[i + 2] * deltaTime * 60
  }
  
  explosion.geometry.attributes.position.needsUpdate = true
  
  // Fade out
  material.opacity -= deltaTime * 0.5
  
  // Return true if animation is complete
  return material.opacity <= 0
}

/**
 * Generate random asteroid with realistic parameters
 */
export function generateRandomAsteroid(
  targetPlanet?: string,
  distance?: number
): CustomAsteroid {
  const id = `asteroid_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  
  // Random but realistic orbital parameters
  const semiMajorAxis = distance || (Math.random() * 30 + 15) // 15-45 units
  const eccentricity = Math.random() * 0.6 + 0.1 // 0.1-0.7 (elliptical)
  const inclination = (Math.random() - 0.5) * Math.PI / 4 // ±45°
  
  return {
    id,
    name: `Asteroid ${id.substr(-4)}`,
    color: `#${Math.floor(Math.random() * 0x888888 + 0x777777).toString(16)}`,
    size: Math.random() * 1.0 + 0.8, // 0.8-1.8 units (BIGGER for visibility!)
    
    semiMajorAxis,
    eccentricity,
    inclination,
    longitudeOfAscendingNode: Math.random() * Math.PI * 2,
    argumentOfPeriapsis: Math.random() * Math.PI * 2,
    meanAnomalyAtEpoch: Math.random() * Math.PI * 2,
    
    mass: Math.random() * 1e14 + 1e13, // 10^13 to 10^14 kg
    velocity: new THREE.Vector3(),
    position: new THREE.Vector3(),
    
    created: Date.now(),
    impacted: false,
    targetPlanet,
    
    glowColor: '#ff6600',
    trailEnabled: true,
  }
}

/**
 * Create impact shockwave effect
 */
export function createShockwave(
  position: THREE.Vector3,
  planetSize: number,
  color: string
): THREE.Mesh {
  const geometry = new THREE.RingGeometry(planetSize, planetSize * 1.1, 64)
  const material = new THREE.MeshBasicMaterial({
    color: color,
    transparent: true,
    opacity: 0.8,
    side: THREE.DoubleSide,
  })
  
  const shockwave = new THREE.Mesh(geometry, material)
  shockwave.position.copy(position)
  shockwave.name = 'shockwave'
  
  return shockwave
}

/**
 * Update shockwave expansion (call in animation loop)
 */
export function updateShockwave(
  shockwave: THREE.Mesh,
  planetSize: number,
  deltaTime: number
): boolean {
  const geometry = shockwave.geometry as THREE.RingGeometry
  const material = shockwave.material as THREE.MeshBasicMaterial
  
  // Expand ring
  const currentOuter = geometry.parameters.outerRadius
  const newOuter = currentOuter + deltaTime * planetSize * 2
  const newInner = currentOuter
  
  // Update geometry
  shockwave.geometry.dispose()
  shockwave.geometry = new THREE.RingGeometry(newInner, newOuter, 64)
  
  // Fade out
  material.opacity -= deltaTime * 0.5
  
  // Return true if animation complete
  return material.opacity <= 0 || newOuter > planetSize * 5
}

/**
 * Calculate trajectory prediction points
 */
export function predictTrajectory(
  asteroid: CustomAsteroid,
  startTime: number,
  duration: number,
  steps: number = 100
): THREE.Vector3[] {
  const points: THREE.Vector3[] = []
  const timeStep = duration / steps
  
  for (let i = 0; i <= steps; i++) {
    const time = startTime + i * timeStep
    const position = calculateAsteroidPosition(asteroid, time)
    points.push(position)
  }
  
  return points
}

/**
 * Calculate time to impact (if on collision course)
 */
export function calculateTimeToImpact(
  asteroid: CustomAsteroid,
  planetPos: THREE.Vector3,
  planetSize: number,
  startTime: number,
  maxTime: number = 10000
): number | null {
  const timeStep = 100 // Check every 100 time units
  
  for (let time = startTime; time < startTime + maxTime; time += timeStep) {
    const asteroidPos = calculateAsteroidPosition(asteroid, time)
    const distance = asteroidPos.distanceTo(planetPos)
    
    if (distance < asteroid.size + planetSize) {
      return time - startTime
    }
  }
  
  return null // No impact detected
}
