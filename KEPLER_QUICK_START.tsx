// 🚀 QUICK START - Kepler Orbit Asteroids
// Copy this to see how to add custom asteroids with Three.js Kepler orbits

import { createCustomAsteroidObject } from '@/components/asteroid-control-panel'

// ============================================
// EXAMPLE 1: Add Main Belt Asteroid
// ============================================
const beltAsteroid = createCustomAsteroidObject({
  name: 'Ceres-like',
  color: '#888888',
  radius: 470, // km (like Ceres)
  distanceAU: 2.77, // AU (Ceres orbit)
  eccentricity: 0.08, // Nearly circular
  inclination: 10.6, // degrees
  type: 'asteroid'
})

// Result: Orbits at 2.77 AU with period = √(2.77³) = 4.6 years
// Position calculated using Kepler's equation every frame


// ============================================
// EXAMPLE 2: Add Halley's Comet
// ============================================
const halleyComet = createCustomAsteroidObject({
  name: 'Halley-like',
  color: '#66ccff',
  radius: 11, // km (Halley's nucleus)
  distanceAU: 17.8, // AU (semi-major axis)
  eccentricity: 0.967, // Highly elliptical!
  inclination: 162, // degrees (retrograde)
  perihelionArg: 111, // degrees
  type: 'comet'
})

// Result: Highly elliptical orbit with 500-particle tail
// Period = √(17.8³) = 75 years (accurate to real Halley!)
// Tail automatically points away from Sun


// ============================================
// EXAMPLE 3: Add Near-Earth Object (Apophis)
// ============================================
const apophis = createCustomAsteroidObject({
  name: 'Apophis-like',
  color: '#ff3366',
  radius: 0.185, // km (370m diameter)
  distanceAU: 0.922, // AU
  eccentricity: 0.191, // Crosses Earth's orbit
  inclination: 3.33, // degrees
  type: 'asteroid'
})

// Result: Potentially hazardous NEO
// Period = √(0.922³) = 0.89 years
// Use impact analysis to check collision risk!


// ============================================
// EXAMPLE 4: Add Trans-Neptunian Object (Pluto)
// ============================================
const plutoLike = createCustomAsteroidObject({
  name: 'Pluto-like',
  color: '#9966ff',
  radius: 1188, // km (Pluto's radius)
  distanceAU: 39.5, // AU (Pluto's average distance)
  eccentricity: 0.25, // Moderate eccentricity
  inclination: 17, // degrees
  type: 'asteroid'
})

// Result: Distant icy world in Kuiper Belt
// Period = √(39.5³) = 248 years (accurate to Pluto!)
// In realistic mode, will be 1395 scene units from Sun


// ============================================
// HOW THE ORBIT IS CALCULATED
// ============================================

/**
 * Position Update (Every Frame):
 * 
 * 1. Mean Motion: n = 2π / T (radians per second)
 * 2. Mean Anomaly: M = M₀ + n·t (current angle)
 * 3. Solve Kepler's Equation: E - e·sin(E) = M
 *    Using Newton-Raphson iteration:
 *    - E₁ = E₀ - (E₀ - e·sin(E₀) - M) / (1 - e·cos(E₀))
 *    - Repeat until |E₁ - E₀| < 1e-6
 * 4. True Anomaly: ν = 2·atan2(√(1+e)·sin(E/2), √(1-e)·cos(E/2))
 * 5. Distance: r = a(1 - e·cos(E))
 * 6. Position in orbital plane:
 *    - x = r·cos(ν)
 *    - y = r·sin(ν)
 * 7. Apply 3D rotations:
 *    - Rotate by argument of perihelion (ω)
 *    - Apply inclination (i)
 *    - Rotate by longitude of ascending node (Ω)
 * 8. Convert AU to scene units: multiply by 28 (Earth = 28 units)
 * 9. Update Three.js mesh position
 */


// ============================================
// ORBIT PATH RENDERING
// ============================================

/**
 * Elliptical Orbit (256 points):
 * 
 * for θ = 0 to 2π:
 *   r = a(1 - e²) / (1 + e·cos(θ))
 *   x = r·cos(θ)
 *   y = r·sin(θ)
 *   Apply 3D rotations (ω, i, Ω)
 *   Add point to orbit line
 * 
 * Result: Smooth ellipse visible in scene
 */


// ============================================
// KEPLER'S 3RD LAW VERIFICATION
// ============================================

// Test: Belt Asteroid at 2.5 AU
const a = 2.5 // AU
const T = Math.sqrt(Math.pow(a, 3)) // years
console.log(`Period: ${T.toFixed(2)} years`) // 3.95 years ✅

// Test: Neptune at 30 AU
const a_neptune = 30 // AU
const T_neptune = Math.sqrt(Math.pow(a_neptune, 3)) // years
console.log(`Neptune period: ${T_neptune.toFixed(1)} years`) // 164.3 years ✅


// ============================================
// VISUAL FEATURES
// ============================================

/**
 * Asteroids:
 * - Irregular icosahedron geometry (deformed)
 * - Moon-like texture with color tint
 * - Tumbling rotation (all 3 axes)
 * - Rocky/metallic material
 * - Orange orbit line
 * 
 * Comets:
 * - Elongated nucleus (1.2:0.8:1.0)
 * - 500 cyan particle tail
 * - Tail points away from Sun (updated each frame)
 * - Pulsing brightness (closer to Sun = brighter)
 * - Icy reflective material
 * - Cyan orbit line
 */


// ============================================
// USAGE IN YOUR APP
// ============================================

// Method 1: Use Quick Add Buttons
// Click "Belt Asteroid" in Asteroid Control Panel → Instant asteroid!

// Method 2: Programmatic
const myAsteroid = createCustomAsteroidObject({
  name: 'My Custom Asteroid',
  distanceAU: 3.0,
  eccentricity: 0.2,
  type: 'asteroid'
})
onAddCustomObject(myAsteroid)

// Method 3: Custom Tab
// Set all parameters manually for precise control


// ============================================
// REALISTIC MODE
// ============================================

/**
 * Visual Mode (default):
 * - Belt asteroid at 2.5 AU → 70 scene units
 * - Easy to see, good overview
 * 
 * Hybrid Mode:
 * - Belt asteroid at 2.5 AU → 105 scene units
 * - 1.5x more spread out
 * 
 * Realistic Mode:
 * - Belt asteroid at 2.5 AU → 140 scene units
 * - True astronomical scale
 * - Neptune at 1684 units (30x farther!)
 * - Camera auto-zooms to (0, 300, 800)
 */


// ============================================
// TIME SCALES
// ============================================

/**
 * Available speeds:
 * - 1x: Real-time (barely visible motion)
 * - 100x: 1 day per second
 * - 1000x: ~10 days per second
 * - 10000x: ~100 days per second (3 months/sec)
 * - 100000x: ~1000 days per second (2.7 years/sec)
 * - 31536000x: 1 year per second (see Neptune orbit in 164 sec!)
 */


// ============================================
// 🎯 THAT'S IT!
// ============================================

/**
 * You now have:
 * ✅ Kepler orbital mechanics integrated
 * ✅ One-click asteroid generation
 * ✅ Realistic elliptical orbits
 * ✅ Comet tails with particles
 * ✅ Impact analysis
 * ✅ Realistic mode support
 * ✅ Time control
 * 
 * Start the app and try it:
 * pnpm dev
 * 
 * Click "Belt Asteroid" and watch it orbit! 🚀
 */
