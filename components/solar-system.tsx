"use client"

import { useEffect, useRef, useState } from "react"
import * as THREE from "three"
import { OrbitControls } from "three/addons/controls/OrbitControls.js"
import gsap from "gsap"
import { calculateOrbitalPosition, type CelestialBody } from "@/lib/orbital-mechanics"

interface SolarSystemProps {
  onPlanetHover?: (planet: string | null) => void
  asteroidConfig?: {
    size: number
    speed: number
    angle: number
    active: boolean
    startPosition?: string
  }
  onImpact?: (data: { location: { lat: number; lng: number }; energy: number; asteroidId: string }) => void
  onMeteorPlaced?: (data: {
    position: THREE.Vector3
    velocity: number
    orbitRadius: number
    timeToImpact: number | null
    asteroidId: string
  }) => void
  isPaused?: boolean
  onSpawnAsteroid?: () => void
  asteroidSpawnCounter?: number
  focusPlanet?: string | null
  customObjects?: CelestialBody[]  // New: custom asteroids/comets/objects
  simulationTime?: number  // New: simulation time for orbital calculations
  onObjectClick?: (object: CelestialBody) => void  // New: handle custom object clicks
}

interface Asteroid {
  id: string
  mesh: THREE.Mesh
  trajectory: THREE.Line
  velocity: THREE.Vector3
  position: THREE.Vector3
  size: number
  impacted: boolean
}

export function SolarSystem({
  onPlanetHover,
  asteroidConfig,
  onImpact,
  onMeteorPlaced,
  isPaused = false,
  onSpawnAsteroid,
  asteroidSpawnCounter = 0,
  focusPlanet = null,
  customObjects = [],
  simulationTime = 0,
  onObjectClick,
}: SolarSystemProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const asteroidsRef = useRef<Asteroid[]>([])
  const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster())
  const mouseRef = useRef<THREE.Vector2>(new THREE.Vector2())
  const lastAsteroidConfigRef = useRef<string>("")
  const controlsRef = useRef<OrbitControls | null>(null)
  const [webglError, setWebglError] = useState<string | null>(null)
  const planetsRef = useRef<Array<{
    mesh: THREE.Mesh
    orbit: THREE.Line
    angle: number
    meanAngularVelocity: number
    distance: number
    eccentricity: number
    name: string
  }>>([])
  const simulationTimeRef = useRef(0)
  const isPausedRef = useRef(isPaused)
  const textureLoaderRef = useRef<THREE.TextureLoader | null>(null)
  const enhanceTextureRef = useRef<((texture: THREE.Texture) => THREE.Texture) | null>(null)

  // Keep refs in sync with props
  useEffect(() => {
    simulationTimeRef.current = simulationTime
  }, [simulationTime])

  useEffect(() => {
    isPausedRef.current = isPaused
  }, [isPaused])

  const G = 0.5
  const sunMass = 1000

  const calculateGravity = (position: THREE.Vector3): THREE.Vector3 => {
    const direction = new THREE.Vector3(0, 0, 0).sub(position)
    const distance = direction.length()
    if (distance < 5) return new THREE.Vector3(0, 0, 0)

    const forceMagnitude = (G * sunMass) / (distance * distance)
    return direction.normalize().multiplyScalar(forceMagnitude)
  }

  useEffect(() => {
    if (!containerRef.current) return

    const scene = new THREE.Scene()
    sceneRef.current = scene

    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      2000,
    )
    camera.position.set(0, 50, 100)
    cameraRef.current = camera

    // WebGL context creation with error handling
    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({ 
        antialias: true, 
        alpha: true,
        failIfMajorPerformanceCaveat: false // Allow fallback to software rendering
      })
      
      // Test if WebGL is actually working
      const gl = renderer.getContext()
      if (!gl) {
        throw new Error('WebGL context could not be created')
      }
      
    } catch (error) {
      console.error('WebGL Error:', error)
      setWebglError(
        'Your browser or device does not support WebGL, which is required for 3D graphics. ' +
        'Please try: 1) Updating your browser, 2) Enabling hardware acceleration in browser settings, ' +
        '3) Updating your graphics drivers, or 4) Using a different browser (Chrome, Firefox, Edge).'
      )
      return
    }

    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    renderer.outputColorSpace = THREE.SRGBColorSpace // Better color accuracy
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.0
    
    try {
      containerRef.current.appendChild(renderer.domElement)
    } catch (error) {
      console.error('Failed to append renderer:', error)
      setWebglError('Failed to initialize 3D viewer. Please refresh the page.')
      renderer.dispose()
      return
    }
    
    rendererRef.current = renderer

    const controls = new OrbitControls(camera, renderer.domElement)
    controlsRef.current = controls
    
    // STEP 1: Enable smooth damping for gradual deceleration
    controls.enableDamping = true
    controls.dampingFactor = 0.05  // Lower = smoother, more responsive (0.05 is ideal)
    
    // STEP 2: Set zoom distance range (step-by-step accessibility)
    controls.minDistance = 0.5  // EXTREME close-up capability
    controls.maxDistance = 800  // Wider overview range
    
    // STEP 3: Configure smooth zoom behavior
    controls.zoomSpeed = 1.0  // Standard speed for smooth zooming
    controls.enableZoom = true
    
    // STEP 4: Set rotation smoothness
    controls.rotateSpeed = 0.5  // Smooth, controlled rotation
    controls.maxPolarAngle = Math.PI
    
    // STEP 5: Configure panning smoothness
    controls.enablePan = true
    controls.panSpeed = 0.8  // Smooth, controlled panning
    controls.screenSpacePanning = false  // Consistent behavior
    
    // STEP 6: Disable auto-rotation for user control
    controls.autoRotate = false
    controls.autoRotateSpeed = 0
    
    // STEP 7: Configure touch controls for smooth mobile experience
    controls.touches.ONE = THREE.TOUCH.ROTATE  // One finger rotates
    controls.touches.TWO = THREE.TOUCH.DOLLY_PAN  // Two fingers zoom/pan
    
    // STEP 8: Additional smoothness settings
    controls.zoomToCursor = true  // Zoom toward cursor position
    controls.target.set(0, 0, 0)  // Always center on sun

    const ambientLight = new THREE.AmbientLight(0x222222, 0.3)
    scene.add(ambientLight)

    const pointLight = new THREE.PointLight(0xffffff, 3, 400)
    pointLight.position.set(0, 0, 0)
    pointLight.castShadow = true
    scene.add(pointLight)

    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.4)
    scene.add(hemiLight)

    // Loading manager for texture progress
    const loadingManager = new THREE.LoadingManager()
    loadingManager.onLoad = () => {
      console.log('✅ All textures loaded successfully!')
    }
    loadingManager.onError = (url) => {
      console.error('❌ Error loading:', url)
    }

    // Load texture loader with quality settings
    const textureLoader = new THREE.TextureLoader(loadingManager)
    const maxAnisotropy = renderer.capabilities.getMaxAnisotropy()
    
    // Store in ref for use in animate function
    textureLoaderRef.current = textureLoader

    // Helper function to improve texture quality - ULTRA PERFECTION MODE
    const enhanceTexture = (texture: THREE.Texture) => {
      texture.anisotropy = maxAnisotropy // Maximum filtering (usually 16x)
      texture.minFilter = THREE.LinearMipmapLinearFilter  // Trilinear filtering
      texture.magFilter = THREE.LinearFilter  // Smooth magnification
      texture.colorSpace = THREE.SRGBColorSpace  // Accurate colors
      texture.wrapS = THREE.RepeatWrapping  // Seamless horizontal wrapping
      texture.wrapT = THREE.ClampToEdgeWrapping  // No pole artifacts
      texture.generateMipmaps = true  // Auto-generate quality mipmaps
      texture.needsUpdate = true  // Force texture update
      // Advanced settings for ultra quality
      texture.premultiplyAlpha = false  // Better transparency handling
      texture.flipY = true  // Correct texture orientation
      return texture
    }
    
    // Store in ref for use in animate function
    enhanceTextureRef.current = enhanceTexture

    // Add realistic starfield background (8K Milky Way)
    const starGeometry = new THREE.SphereGeometry(500, 64, 64)
    const starTexture = enhanceTexture(textureLoader.load('/textures/8k_stars_milky_way.jpg'))
    const starMaterial = new THREE.MeshBasicMaterial({
      map: starTexture,
      side: THREE.BackSide,
    })
    const starfield = new THREE.Mesh(starGeometry, starMaterial)
    scene.add(starfield)

    // Realistic Sun with 8K texture and high detail geometry
    const sunGeometry = new THREE.SphereGeometry(5, 256, 256)  // Ultra-high detail for close-up viewing
    const sunTexture = enhanceTexture(textureLoader.load('/textures/8k_sun.jpg'))
    const sunMaterial = new THREE.MeshBasicMaterial({
      map: sunTexture,
    })
    const sun = new THREE.Mesh(sunGeometry, sunMaterial)
    scene.add(sun)

    const glowLayers = [
      { size: 6.5, opacity: 0.4, color: 0xfdb813 },
      { size: 8, opacity: 0.2, color: 0xff9500 },
      { size: 10, opacity: 0.1, color: 0xff6b00 },
    ]

    glowLayers.forEach((layer) => {
      const glowGeometry = new THREE.SphereGeometry(layer.size, 32, 32)
      const glowMaterial = new THREE.MeshBasicMaterial({
        color: layer.color,
        transparent: true,
        opacity: layer.opacity,
        side: THREE.BackSide,
      })
      const glow = new THREE.Mesh(glowGeometry, glowMaterial)
      scene.add(glow)
    })

    // Real orbital periods (Earth days) and eccentricity from NASA
    // Eccentricity: 0 = perfect circle, >0 = ellipse (how oval-shaped)
    // Using Kepler's 3rd Law: T² ∝ a³ (orbital period squared is proportional to semi-major axis cubed)
    const planetsData = [
      { name: "Mercury", distance: 15, size: 0.8, color: 0x8c7853, eccentricity: 0.206, emissive: 0x3d3428 },
      { name: "Venus", distance: 20, size: 1.2, color: 0xffc649, eccentricity: 0.007, emissive: 0x664d1e },
      { name: "Earth", distance: 28, size: 1.3, color: 0x4a90e2, eccentricity: 0.017, emissive: 0x1a3a5a },
      { name: "Mars", distance: 35, size: 1, color: 0xe27b58, eccentricity: 0.093, emissive: 0x5a2f22 },
      { name: "Jupiter", distance: 50, size: 3, color: 0xc88b3a, eccentricity: 0.048, emissive: 0x4d3617 },
      { name: "Saturn", distance: 65, size: 2.5, color: 0xfad5a5, eccentricity: 0.056, emissive: 0x645542 },
      { name: "Uranus", distance: 78, size: 2, color: 0x4fd0e7, eccentricity: 0.046, emissive: 0x1f535c },
      { name: "Neptune", distance: 88, size: 1.9, color: 0x4166f5, eccentricity: 0.010, emissive: 0x1a2962 },
    ]

    const planets: Array<{
      mesh: THREE.Mesh
      orbit: THREE.Line
      angle: number
      meanAngularVelocity: number
      distance: number
      eccentricity: number
      name: string
    }> = []

    planetsData.forEach((planetData) => {
      // Higher detail geometry for better zoom quality (128 segments instead of 64)
      const geometry = new THREE.SphereGeometry(planetData.size, 256, 256)  // Ultra-high detail (65,536 triangles!)
      let material: THREE.MeshStandardMaterial

      // Load realistic textures for each planet
      switch (planetData.name) {
        case "Mercury":
          material = new THREE.MeshStandardMaterial({
            map: enhanceTexture(textureLoader.load('/textures/2k_mercury.jpg')),
            roughness: 0.9,
            metalness: 0.1,
          })
          break
        case "Venus":
          material = new THREE.MeshStandardMaterial({
            map: enhanceTexture(textureLoader.load('/textures/2k_venus_atmosphere.jpg')),
            roughness: 0.6,
            metalness: 0.0,
          })
          break
        case "Earth":
          material = new THREE.MeshStandardMaterial({
            map: enhanceTexture(textureLoader.load('/textures/8k_earth_daymap.jpg')),
            roughness: 0.8,
            metalness: 0.2,
          })
          break
        case "Mars":
          material = new THREE.MeshStandardMaterial({
            map: enhanceTexture(textureLoader.load('/textures/2k_mars.jpg')),
            roughness: 0.9,
            metalness: 0.1,
          })
          break
        case "Jupiter":
          material = new THREE.MeshStandardMaterial({
            map: enhanceTexture(textureLoader.load('/textures/2k_jupiter.jpg')),
            roughness: 0.6,
            metalness: 0.1,
          })
          break
        case "Saturn":
          material = new THREE.MeshStandardMaterial({
            map: enhanceTexture(textureLoader.load('/textures/2k_saturn.jpg')),
            roughness: 0.7,
            metalness: 0.1,
          })
          break
        case "Uranus":
          material = new THREE.MeshStandardMaterial({
            map: enhanceTexture(textureLoader.load('/textures/2k_uranus.jpg')),
            roughness: 0.5,
            metalness: 0.2,
          })
          break
        case "Neptune":
          material = new THREE.MeshStandardMaterial({
            map: enhanceTexture(textureLoader.load('/textures/2k_neptune.jpg')),
            roughness: 0.5,
            metalness: 0.2,
          })
          break
        default:
          material = new THREE.MeshStandardMaterial({
            color: planetData.color,
            emissive: planetData.emissive,
            emissiveIntensity: 0.2,
            roughness: 0.7,
            metalness: 0.1,
          })
      }

      const planet = new THREE.Mesh(geometry, material)
      scene.add(planet)

      // Add Earth's atmosphere and Moon
      if (planetData.name === "Earth") {
        const atmosphereGeometry = new THREE.SphereGeometry(planetData.size * 1.1, 32, 32)
        const atmosphereMaterial = new THREE.MeshBasicMaterial({
          color: 0x4a90e2,
          transparent: true,
          opacity: 0.15,
          side: THREE.BackSide,
        })
        const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial)
        planet.add(atmosphere)

        // Add Earth's Moon with higher detail
        const moonGeometry = new THREE.SphereGeometry(0.35, 128, 128)  // Ultra-high detail for Moon close-ups
        const moonMaterial = new THREE.MeshStandardMaterial({
          map: enhanceTexture(textureLoader.load('/textures/2k_moon.jpg')),
          roughness: 0.9,
        })
        const moon = new THREE.Mesh(moonGeometry, moonMaterial)
        moon.position.set(3, 0, 0)
        planet.add(moon)
      }

      // Add Saturn's Rings
      if (planetData.name === "Saturn") {
        const ringGeometry = new THREE.RingGeometry(planetData.size * 1.2, planetData.size * 2.3, 64)
        const ringTexture = enhanceTexture(textureLoader.load('/textures/2k_saturn_ring_alpha.png'))
        const ringMaterial = new THREE.MeshBasicMaterial({
          map: ringTexture,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.9,
          alphaTest: 0.05,
          depthWrite: false,
        })
        const rings = new THREE.Mesh(ringGeometry, ringMaterial)
        rings.rotation.x = Math.PI / 2.2
        planet.add(rings)
      }

      // Create elliptical orbit path using Kepler's equation
      // r = a(1 - e²) / (1 + e·cos(θ))
      const orbitGeometry = new THREE.BufferGeometry()
      const orbitPoints = []
      const a = planetData.distance  // semi-major axis
      const e = planetData.eccentricity
      
      for (let i = 0; i <= 256; i++) {  // More points for smooth ellipse
        const theta = (i / 256) * Math.PI * 2
        const r = (a * (1 - e * e)) / (1 + e * Math.cos(theta))
        orbitPoints.push(r * Math.cos(theta), 0, r * Math.sin(theta))
      }
      
      orbitGeometry.setAttribute("position", new THREE.Float32BufferAttribute(orbitPoints, 3))
      const orbitMaterial = new THREE.LineBasicMaterial({
        color: 0x666666,
        transparent: true,
        opacity: 0.4,
      })
      const orbit = new THREE.Line(orbitGeometry, orbitMaterial)
      scene.add(orbit)

      // Kepler's 3rd Law: T² = k·a³
      // Mean angular velocity = 2π/T, so ω ∝ 1/√(a³) = a^(-3/2)
      // Normalize to Earth's orbit (distance = 28)
      const meanAngularVelocity = 0.02 * Math.pow(28 / planetData.distance, 1.5)

      planets.push({
        mesh: planet,
        orbit,
        angle: Math.random() * Math.PI * 2,
        meanAngularVelocity,  // Kepler's 3rd Law
        distance: planetData.distance,
        eccentricity: planetData.eccentricity,
        name: planetData.name,
      })
    })

    // Store planets in ref for camera animations
    planetsRef.current = planets

    const animate = () => {
      requestAnimationFrame(animate)

      if (!isPausedRef.current) {
        const currentSimTime = simulationTimeRef.current
        
        const sun = sceneRef.current?.children.find((child) => child instanceof THREE.Mesh) as THREE.Mesh
        // Sun's rotation period: ~27 days = 2,332,800 seconds
        // Angular velocity = 2π / 2,332,800 = 0.00000269 rad/s
        // At 1x speed (real-time): Sun rotates very slowly (realistic)
        // At higher speeds: Sun rotation speeds up proportionally
        sun.rotation.y = currentSimTime * 0.00000269
        const pulseScale = 1 + Math.sin(currentSimTime * 0.00001) * 0.02
        sun.scale.set(pulseScale, pulseScale, pulseScale)

        planets.forEach((planet) => {
          // Kepler's 2nd Law: Equal areas in equal times
          // Angular velocity varies with distance: dθ/dt ∝ 1/r²
          // Calculate current distance from sun
          const a = planet.distance  // semi-major axis
          const e = planet.eccentricity
          const theta = planet.angle
          const r = (a * (1 - e * e)) / (1 + e * Math.cos(theta))
          
          // Kepler's 2nd Law: angular velocity = mean_angular_velocity × (a/r)²
          // This makes planets move FASTER when close to sun, SLOWER when far
          const angularVelocity = planet.meanAngularVelocity * Math.pow(a / r, 2)
          planet.angle = currentSimTime * angularVelocity * 0.01
          
          // Update position on elliptical orbit (Kepler's 1st Law)
          planet.mesh.position.x = r * Math.cos(theta)
          planet.mesh.position.z = r * Math.sin(theta)
          
          // Realistic rotation speeds (actual real-world periods) - synced with simulationTime
          // Rotation speeds in rad/s based on actual planetary rotation periods
          switch (planet.name) {
            case "Mercury":
              // Mercury: 58.6 days = 5,063,040 sec → ω = 2π/5063040 = 0.00000124 rad/s
              planet.mesh.rotation.y = currentSimTime * 0.00000124
              break
            case "Venus":
              // Venus: 243 days (retrograde) = 20,995,200 sec → ω = -2π/20995200 = -0.000000299 rad/s
              planet.mesh.rotation.y = -currentSimTime * 0.000000299
              break
            case "Earth":
              // Earth: 24 hours = 86,400 sec → ω = 2π/86400 = 0.0000727 rad/s
              planet.mesh.rotation.y = currentSimTime * 0.0000727
              // Rotate moon around Earth
              const earthMoon = planet.mesh.children.find(
                (child) => child instanceof THREE.Mesh && child.geometry instanceof THREE.SphereGeometry && (child.geometry as THREE.SphereGeometry).parameters.radius === 0.35
              )
              if (earthMoon) {
                // Moon orbit: 27.3 days = 2,358,720 sec → ω = 2π/2358720 = 0.00000266 rad/s
                const moonAngle = currentSimTime * 0.00000266
                earthMoon.position.x = Math.cos(moonAngle) * 3
                earthMoon.position.z = Math.sin(moonAngle) * 3
                // Moon rotation (tidally locked, same as orbit)
                earthMoon.rotation.y = currentSimTime * 0.00000266
              }
              break
            case "Mars":
              // Mars: 24.6 hours = 88,560 sec → ω = 2π/88560 = 0.0000709 rad/s
              planet.mesh.rotation.y = currentSimTime * 0.0000709
              break
            case "Jupiter":
              // Jupiter: 9.9 hours = 35,640 sec → ω = 2π/35640 = 0.000176 rad/s (fastest!)
              planet.mesh.rotation.y = currentSimTime * 0.000176
              break
            case "Saturn":
              // Saturn: 10.7 hours = 38,520 sec → ω = 2π/38520 = 0.000163 rad/s
              planet.mesh.rotation.y = currentSimTime * 0.000163
              break
            case "Uranus":
              // Uranus: 17.2 hours (retrograde) = 61,920 sec → ω = -2π/61920 = -0.000101 rad/s
              planet.mesh.rotation.y = -currentSimTime * 0.000101
              break
            case "Neptune":
              // Neptune: 16.1 hours = 57,960 sec → ω = 2π/57960 = 0.000108 rad/s
              planet.mesh.rotation.y = currentSimTime * 0.000108
              break
            default:
              planet.mesh.rotation.y = currentSimTime * 0.0000727
          }
        })

        // Render custom objects (asteroids, comets, dwarf planets) using orbital mechanics
        customObjects.forEach((obj) => {
          // Find or create mesh for this custom object
          let customMesh = scene.children.find(
            (child) => child.userData.customObjectId === obj.id
          ) as THREE.Mesh | undefined

          if (!customMesh) {
            // Create new mesh for custom object with enhanced visuals
            const size = Math.max(0.5, obj.radius / 1000) // Convert km to scene units, minimum 0.5 for visibility
            
            // Create geometry based on object type for realistic appearance
            let geometry: THREE.BufferGeometry
            
            if (obj.type === 'asteroid') {
              // Irregular asteroid shape using deformed icosahedron
              geometry = new THREE.IcosahedronGeometry(size, 2)
              // Add random deformation for irregular surface
              const positions = geometry.attributes.position
              for (let i = 0; i < positions.count; i++) {
                const vertex = new THREE.Vector3(
                  positions.getX(i),
                  positions.getY(i),
                  positions.getZ(i)
                )
                const randomScale = 0.7 + Math.random() * 0.6 // 70% to 130% of original
                vertex.multiplyScalar(randomScale)
                positions.setXYZ(i, vertex.x, vertex.y, vertex.z)
              }
              geometry.computeVertexNormals() // Recalculate normals for lighting
            } else if (obj.type === 'comet') {
              // Slightly elongated shape for comet nucleus
              geometry = new THREE.SphereGeometry(size, 32, 32)
              geometry.scale(1.2, 0.8, 1.0) // Elongated along X-axis
            } else if (obj.type === 'dwarf-planet' || obj.type === 'trans-neptunian') {
              // High-detail sphere for dwarf planets
              geometry = new THREE.SphereGeometry(size, 64, 64)
            } else {
              // Default sphere
              geometry = new THREE.SphereGeometry(size, 32, 32)
            }
            
            // Color based on composition (use object's color if available)
            let color = obj.color ? parseInt(obj.color.replace('#', '0x')) : 0x888888
            let emissive = 0x333333
            let orbitColor = 0xff6600 // Orange for asteroids
            
            // Load textures based on object type for realistic appearance
            let material: THREE.MeshStandardMaterial
            
            // Check if texture loader is available
            const hasTextureLoader = textureLoaderRef.current && enhanceTextureRef.current
            
            if (obj.type === 'asteroid') {
              // Rocky asteroid with moon-like texture + custom color tint
              if (hasTextureLoader) {
                const asteroidTexture = enhanceTextureRef.current!(textureLoaderRef.current!.load('/textures/2k_moon.jpg'))
                material = new THREE.MeshStandardMaterial({
                  map: asteroidTexture,
                  color: color, // Tint the texture with custom color
                  roughness: 0.95,
                  metalness: obj.composition === 'metallic' ? 0.6 : 0.1,
                  bumpMap: asteroidTexture, // Use same texture for bump mapping
                  bumpScale: 0.05, // Subtle surface detail
                })
              } else {
                // Fallback without texture
                material = new THREE.MeshStandardMaterial({
                  color,
                  roughness: 0.95,
                  metalness: obj.composition === 'metallic' ? 0.6 : 0.1,
                })
              }
              emissive = 0xff6600
              orbitColor = 0xff6600
            } else if (obj.type === 'comet') {
              // Icy comet with high reflectivity
              if (hasTextureLoader) {
                const cometTexture = enhanceTextureRef.current!(textureLoaderRef.current!.load('/textures/2k_moon.jpg'))
                material = new THREE.MeshStandardMaterial({
                  map: cometTexture,
                  color: 0xaaccff, // Icy blue tint
                  roughness: 0.3, // More reflective (icy)
                  metalness: 0.1,
                  emissive: 0x0099ff,
                  emissiveIntensity: 0.4, // Brighter glow
                  bumpMap: cometTexture,
                  bumpScale: 0.03,
                })
              } else {
                // Fallback without texture
                material = new THREE.MeshStandardMaterial({
                  color: 0xaaccff,
                  roughness: 0.3,
                  metalness: 0.1,
                  emissive: 0x0099ff,
                  emissiveIntensity: 0.4,
                })
              }
              emissive = 0x0099ff
              orbitColor = 0x00ccff
            } else if (obj.type === 'dwarf-planet') {
              // Dwarf planet with rocky texture
              if (hasTextureLoader) {
                const dwarfTexture = enhanceTextureRef.current!(textureLoaderRef.current!.load('/textures/2k_mercury.jpg'))
                material = new THREE.MeshStandardMaterial({
                  map: dwarfTexture,
                  color: color,
                  roughness: 0.85,
                  metalness: 0.15,
                  bumpMap: dwarfTexture,
                  bumpScale: 0.04,
                })
              } else {
                // Fallback without texture
                material = new THREE.MeshStandardMaterial({
                  color,
                  roughness: 0.85,
                  metalness: 0.15,
                })
              }
              emissive = 0x886644
              orbitColor = 0xffaa44
            } else if (obj.type === 'trans-neptunian') {
              // Distant icy object
              if (hasTextureLoader) {
                const tnoTexture = enhanceTextureRef.current!(textureLoaderRef.current!.load('/textures/2k_moon.jpg'))
                material = new THREE.MeshStandardMaterial({
                  map: tnoTexture,
                  color: 0xccddff, // Icy purple-blue tint
                  roughness: 0.5,
                  metalness: 0.05,
                  emissive: 0x6666ff,
                  emissiveIntensity: 0.2,
                  bumpMap: tnoTexture,
                  bumpScale: 0.02,
                })
              } else {
                // Fallback without texture
                material = new THREE.MeshStandardMaterial({
                  color: 0xccddff,
                  roughness: 0.5,
                  metalness: 0.05,
                  emissive: 0x6666ff,
                  emissiveIntensity: 0.2,
                })
              }
              emissive = 0x6666ff
              orbitColor = 0x9966ff
            } else {
              // Fallback material
              material = new THREE.MeshStandardMaterial({
                color,
                emissive,
                emissiveIntensity: 0.3,
                roughness: 0.8,
                metalness: 0.2,
              })
            }
            
            customMesh = new THREE.Mesh(geometry, material)
            customMesh.userData.customObjectId = obj.id
            customMesh.userData.customObject = obj
            customMesh.castShadow = true
            customMesh.receiveShadow = true
            scene.add(customMesh)
            
            // Add comet tail particle system for comets
            if (obj.type === 'comet') {
              const particleCount = 500
              const particlesGeometry = new THREE.BufferGeometry()
              const particlePositions = new Float32Array(particleCount * 3)
              const particleColors = new Float32Array(particleCount * 3)
              
              // Create tail particles trailing behind
              for (let i = 0; i < particleCount; i++) {
                const distance = (i / particleCount) * size * 15 // Tail length
                const spread = (i / particleCount) * size * 2 // Tail spread
                
                particlePositions[i * 3] = -distance + (Math.random() - 0.5) * spread
                particlePositions[i * 3 + 1] = (Math.random() - 0.5) * spread
                particlePositions[i * 3 + 2] = (Math.random() - 0.5) * spread
                
                // Fade from cyan to transparent
                const alpha = 1 - (i / particleCount)
                particleColors[i * 3] = 0.5 // R
                particleColors[i * 3 + 1] = 0.8 + alpha * 0.2 // G
                particleColors[i * 3 + 2] = 1.0 // B
              }
              
              particlesGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3))
              particlesGeometry.setAttribute('color', new THREE.BufferAttribute(particleColors, 3))
              
              const particlesMaterial = new THREE.PointsMaterial({
                size: size * 0.3,
                vertexColors: true,
                transparent: true,
                opacity: 0.6,
                blending: THREE.AdditiveBlending,
                depthWrite: false,
              })
              
              const cometTail = new THREE.Points(particlesGeometry, particlesMaterial)
              cometTail.userData.cometTailId = obj.id
              customMesh.add(cometTail) // Attach tail to comet
              
              console.log(`✨ Added particle tail for comet ${obj.name}`)
            }
            
            console.log(`✅ Created enhanced mesh for ${obj.name} (ID: ${obj.id})`)

            // Create elliptical orbit path for custom object
            // Using Kepler's equation: r = a(1 - e²) / (1 + e·cos(θ))
            const orbitGeometry = new THREE.BufferGeometry()
            const orbitPoints = []
            const a = obj.orbitalElements.semiMajorAxis * 28 // Convert AU to scene units (Earth at 28)
            const e = obj.orbitalElements.eccentricity
            const inc = obj.orbitalElements.inclination * (Math.PI / 180) // Convert degrees to radians
            const omega = obj.orbitalElements.longitudeOfAscendingNode * (Math.PI / 180)
            const w = obj.orbitalElements.argumentOfPerihelion * (Math.PI / 180)
            
            for (let i = 0; i <= 256; i++) {
              const theta = (i / 256) * Math.PI * 2
              const r = (a * (1 - e * e)) / (1 + e * Math.cos(theta))
              
              // Calculate position in orbital plane
              const xOrbital = r * Math.cos(theta)
              const yOrbital = r * Math.sin(theta)
              
              // Apply orbital rotations (3D orientation)
              // 1. Rotate by argument of perihelion (ω)
              const x1 = xOrbital * Math.cos(w) - yOrbital * Math.sin(w)
              const y1 = xOrbital * Math.sin(w) + yOrbital * Math.cos(w)
              
              // 2. Apply inclination (tilt orbit plane)
              const x2 = x1
              const y2 = y1 * Math.cos(inc)
              const z2 = y1 * Math.sin(inc)
              
              // 3. Rotate by longitude of ascending node (Ω)
              const x3 = x2 * Math.cos(omega) - y2 * Math.sin(omega)
              const y3 = x2 * Math.sin(omega) + y2 * Math.cos(omega)
              const z3 = z2
              
              orbitPoints.push(x3, z3, y3) // Swizzle for Three.js coordinate system (Y-up)
            }
            
            orbitGeometry.setAttribute("position", new THREE.Float32BufferAttribute(orbitPoints, 3))
            const orbitMaterial = new THREE.LineBasicMaterial({
              color: orbitColor,
              transparent: true,
              opacity: 0.6,
              linewidth: 2,
            })
            const orbitLine = new THREE.Line(orbitGeometry, orbitMaterial)
            orbitLine.userData.customOrbitId = obj.id
            scene.add(orbitLine)
            
            console.log(`✅ Created orbit path for ${obj.name}`)
          }

          // Calculate orbital position using Kepler's equations
          // CRITICAL: Convert from AU to scene units (Earth is at 28 scene units = 1 AU)
          const position = calculateOrbitalPosition(obj.orbitalElements, currentSimTime)
          const scaleAUToScene = 28 // Earth is at distance 28 in scene units
          customMesh.position.set(
            position.x * scaleAUToScene, 
            position.z * scaleAUToScene,  // Swap Y and Z for Three.js Y-up coordinate system
            position.y * scaleAUToScene
          )
          
          // Enhanced rotation based on object type
          if (obj.type === 'asteroid') {
            // Tumbling asteroid rotation (irregular)
            customMesh.rotation.x = currentSimTime * 0.02 + Math.sin(currentSimTime * 0.01) * 0.1
            customMesh.rotation.y = currentSimTime * 0.015
            customMesh.rotation.z = currentSimTime * 0.008
          } else if (obj.type === 'comet') {
            // Slow rotation for comet nucleus
            customMesh.rotation.x = currentSimTime * 0.005
            customMesh.rotation.y = currentSimTime * 0.008
            
            // Animate comet tail to point away from sun
            const cometTail = customMesh.children.find(
              (child) => child.userData.cometTailId === obj.id
            ) as THREE.Points | undefined
            
            if (cometTail) {
              // Calculate direction away from sun
              const directionToSun = new THREE.Vector3(0, 0, 0).sub(customMesh.position).normalize()
              const directionAway = directionToSun.multiplyScalar(-1)
              
              // Orient tail away from sun
              cometTail.quaternion.setFromUnitVectors(
                new THREE.Vector3(-1, 0, 0), // Default tail direction
                directionAway
              )
              
              // Pulsing tail effect based on distance to sun
              const distanceToSun = customMesh.position.length()
              const tailBrightness = Math.max(0.3, 1.5 - distanceToSun / 50)
              const material = cometTail.material as THREE.PointsMaterial
              material.opacity = tailBrightness * 0.6
            }
          } else {
            // Standard rotation for dwarf planets and TNOs
            customMesh.rotation.y = currentSimTime * 0.01
          }
        })

        // Remove meshes and orbits for deleted custom objects
        const activeObjectIds = new Set(customObjects.map(obj => obj.id))
        const meshesToRemove = scene.children.filter(
          (child) => (child.userData.customObjectId || child.userData.customOrbitId) && 
                     !activeObjectIds.has(child.userData.customObjectId || child.userData.customOrbitId)
        )
        meshesToRemove.forEach((mesh) => scene.remove(mesh))

        // Note: Asteroids still use real-time deltaTime for physics simulation
        // This is intentional as they follow Newtonian physics, not orbital mechanics
        asteroidsRef.current.forEach((asteroid) => {
          if (asteroid.impacted) return

          const deltaTime = 1 / 60 // Fixed timestep for consistent physics
          const gravity = calculateGravity(asteroid.position)
          asteroid.velocity.add(gravity.multiplyScalar(deltaTime))

          asteroid.position.add(asteroid.velocity.clone().multiplyScalar(deltaTime * 10))
          asteroid.mesh.position.copy(asteroid.position)

          asteroid.mesh.rotation.x += 0.02
          asteroid.mesh.rotation.y += 0.03

          const earthPlanet = planets.find((p) => p.name === "Earth")
          if (earthPlanet) {
            const distanceToEarth = asteroid.position.distanceTo(earthPlanet.mesh.position)
            const earthRadius = (earthPlanet.mesh.geometry as THREE.SphereGeometry).parameters.radius
            if (distanceToEarth < earthRadius + asteroid.size) {
              asteroid.impacted = true
              if (onImpact) {
                const impactLat = Math.random() * 180 - 90
                const impactLng = Math.random() * 360 - 180
                const energy = Math.pow(asteroid.size, 3) * asteroid.velocity.length() * 100
                onImpact({ location: { lat: impactLat, lng: impactLng }, energy, asteroidId: asteroid.id })
              }
              scene.remove(asteroid.mesh)
              scene.remove(asteroid.trajectory)
            }
          }

          if (asteroid.position.length() > 200 || asteroid.position.length() < 5) {
            asteroid.impacted = true
            scene.remove(asteroid.mesh)
            scene.remove(asteroid.trajectory)
          }
        })

        asteroidsRef.current = asteroidsRef.current.filter((a) => !a.impacted)
      }

      // Update controls - CRITICAL: Use the stored reference, don't create new instance!
      if (controlsRef.current) {
        controlsRef.current.update()
      }
      
      if (sceneRef.current && cameraRef.current) {
        rendererRef.current?.render(sceneRef.current, cameraRef.current)
      }
    }
    animate()

    const handleResize = () => {
      if (!containerRef.current || !cameraRef.current) return
      cameraRef.current.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight
      cameraRef.current.updateProjectionMatrix()
      rendererRef.current?.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight)
    }
    window.addEventListener("resize", handleResize)

    // Handle clicks on custom objects for impact analysis
    const handleClick = (event: MouseEvent) => {
      if (!containerRef.current || !cameraRef.current) return

      const rect = containerRef.current.getBoundingClientRect()
      mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

      raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current)
      
      // Check for intersections with custom objects
      const customMeshes = scene.children.filter(
        (child) => child.userData.customObjectId
      )
      const intersects = raycasterRef.current.intersectObjects(customMeshes)

      if (intersects.length > 0 && onObjectClick) {
        const clickedMesh = intersects[0].object
        const customObject = clickedMesh.userData.customObject as CelestialBody
        if (customObject) {
          onObjectClick(customObject)
        }
      }
    }
    
    containerRef.current.addEventListener("click", handleClick)

    return () => {
      window.removeEventListener("resize", handleResize)
      if (containerRef.current) {
        containerRef.current.removeEventListener("click", handleClick)
        if (rendererRef.current?.domElement) {
          containerRef.current.removeChild(rendererRef.current.domElement)
        }
      }
      controlsRef.current?.dispose()
      rendererRef.current?.dispose()
      // Kill any active GSAP animations
      if (cameraRef.current?.position) {
        gsap.killTweensOf(cameraRef.current.position)
      }
      if (controlsRef.current?.target) {
        gsap.killTweensOf(controlsRef.current.target)
      }
    }
  }, []) // Empty dependency array - scene setup only runs once

  // GSAP Camera Animation - Smooth fly-to effect when focusing on planets
  useEffect(() => {
    if (!cameraRef.current || !controlsRef.current || !focusPlanet) return

    const planet = planetsRef.current.find(p => p.name === focusPlanet)
    if (!planet) return

    // Calculate optimal camera position (behind and above the planet)
    const planetPos = planet.mesh.position
    const planetSize = (planet.mesh.geometry as THREE.SphereGeometry).parameters.radius
    const distance = planetSize * 5 // Distance multiplier for good viewing angle

    // Camera target: slightly in front of planet in its orbital direction
    const targetPos = new THREE.Vector3(planetPos.x, planetPos.y, planetPos.z)

    // Camera position: behind and above
    const angle = planet.angle - Math.PI / 4 // Behind the planet
    const cameraPos = new THREE.Vector3(
      planetPos.x + Math.cos(angle) * distance,
      planetPos.y + distance * 0.7, // Elevated view
      planetPos.z + Math.sin(angle) * distance
    )

    // Kill any existing animations
    gsap.killTweensOf(cameraRef.current.position)
    gsap.killTweensOf(controlsRef.current.target)

    // Smooth camera movement using GSAP with easing
    const duration = 2 // 2 seconds for cinematic feel

    gsap.to(cameraRef.current.position, {
      x: cameraPos.x,
      y: cameraPos.y,
      z: cameraPos.z,
      duration: duration,
      ease: "power2.inOut", // Smooth acceleration and deceleration
      onUpdate: () => {
        cameraRef.current?.updateProjectionMatrix()
      }
    })

    gsap.to(controlsRef.current.target, {
      x: targetPos.x,
      y: targetPos.y,
      z: targetPos.z,
      duration: duration,
      ease: "power2.inOut",
      onUpdate: () => {
        controlsRef.current?.update()
      }
    })

  }, [focusPlanet])

  useEffect(() => {
    if (!asteroidConfig?.active || !sceneRef.current) return

    const configKey = `${asteroidConfig.size}-${asteroidConfig.speed}-${asteroidConfig.angle}-${asteroidConfig.startPosition}-${Date.now()}`

    // Prevent duplicate asteroid creation
    if (configKey === lastAsteroidConfigRef.current) return
    lastAsteroidConfigRef.current = configKey

    const scene = sceneRef.current
    const asteroidId = `asteroid-${Date.now()}-${Math.random()}`

    const getStartPosition = (positionName: string): THREE.Vector3 => {
      const positions: { [key: string]: THREE.Vector3 } = {
        "Near Mars": new THREE.Vector3(35, 5, 35),
        "Near Jupiter": new THREE.Vector3(50, 8, 50),
        "Near Saturn": new THREE.Vector3(65, 10, 65),
        "Asteroid Belt": new THREE.Vector3(42, 3, 42),
        "Outer System": new THREE.Vector3(100, 15, 100),
        Random: new THREE.Vector3(Math.random() * 100 - 50, Math.random() * 20 - 10, Math.random() * 100 - 50),
      }
      return positions[positionName] || positions["Near Mars"]
    }

    const startPos = asteroidConfig.startPosition
      ? getStartPosition(asteroidConfig.startPosition)
      : new THREE.Vector3(100, 10, 100)

    const asteroidGeometry = new THREE.SphereGeometry(asteroidConfig.size, 32, 32)
    const asteroidMaterial = new THREE.MeshStandardMaterial({
      color: 0x8b4513,
      emissive: 0xff4400,
      emissiveIntensity: 0.2,
      roughness: 0.9,
      metalness: 0.2,
    })
    const asteroidMesh = new THREE.Mesh(asteroidGeometry, asteroidMaterial)
    asteroidMesh.position.copy(startPos)
    scene.add(asteroidMesh)

    const angleRad = (asteroidConfig.angle * Math.PI) / 180
    const initialVelocity = new THREE.Vector3(
      -Math.cos(angleRad) * asteroidConfig.speed * 0.1,
      -0.05,
      -Math.sin(angleRad) * asteroidConfig.speed * 0.1,
    )

    const predictTrajectory = (startPos: THREE.Vector3, startVel: THREE.Vector3, steps = 200): THREE.Vector3[] => {
      const points: THREE.Vector3[] = []
      const pos = startPos.clone()
      const vel = startVel.clone()
      const dt = 0.1

      for (let i = 0; i < steps; i++) {
        points.push(pos.clone())
        const gravity = calculateGravity(pos)
        vel.add(gravity.multiplyScalar(dt))
        pos.add(vel.clone().multiplyScalar(dt))

        if (pos.length() < 5 || pos.length() > 200) break
      }

      return points
    }

    const trajectoryPoints = predictTrajectory(startPos, initialVelocity)
    const trajectoryGeometry = new THREE.BufferGeometry()
    const positions = new Float32Array(trajectoryPoints.length * 3)
    trajectoryPoints.forEach((point, i) => {
      positions[i * 3] = point.x
      positions[i * 3 + 1] = point.y
      positions[i * 3 + 2] = point.z
    })
    trajectoryGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3))
    const trajectoryMaterial = new THREE.LineBasicMaterial({
      color: 0xff6b35,
      transparent: true,
      opacity: 0.6,
      linewidth: 2,
    })
    const trajectoryLine = new THREE.Line(trajectoryGeometry, trajectoryMaterial)
    scene.add(trajectoryLine)

    const asteroid: Asteroid = {
      id: asteroidId,
      mesh: asteroidMesh,
      trajectory: trajectoryLine,
      velocity: initialVelocity,
      position: startPos.clone(),
      size: asteroidConfig.size,
      impacted: false,
    }

    asteroidsRef.current.push(asteroid)

    if (onMeteorPlaced) {
      onMeteorPlaced({
        position: startPos,
        velocity: asteroidConfig.speed,
        orbitRadius: startPos.length(),
        timeToImpact: null,
        asteroidId,
      })
    }
  }, [asteroidSpawnCounter]) // Only spawn when counter changes

  return (
    <div className="relative w-full h-full">
      {webglError ? (
        <div className="absolute inset-0 flex items-center justify-center bg-background/95 backdrop-blur-sm">
          <div className="max-w-md p-8 bg-card border border-border rounded-lg shadow-lg">
            <div className="flex items-start gap-3 mb-4">
              <svg 
                className="w-6 h-6 text-destructive flex-shrink-0 mt-1" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
                />
              </svg>
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">WebGL Not Available</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {webglError}
                </p>
              </div>
            </div>
            <div className="mt-6 space-y-2 text-xs text-muted-foreground">
              <p className="font-semibold">Common solutions:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Enable hardware acceleration in your browser</li>
                <li>Update your graphics drivers</li>
                <li>Try a different browser (Chrome, Firefox, Edge)</li>
                <li>Check if WebGL is blocked by browser extensions</li>
              </ul>
              <div className="mt-4 pt-4 border-t border-border">
                <a 
                  href="https://get.webgl.org/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Test WebGL support →
                </a>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div ref={containerRef} className="w-full h-full" />
          <div className="absolute bottom-4 left-4 bg-card/90 backdrop-blur-sm border border-border/50 rounded-lg px-4 py-2 text-sm text-muted-foreground">
            <div className="font-medium mb-1">Interactive Controls:</div>
            <div>• Scroll to zoom (wide range)</div>
            <div>• Drag to rotate view</div>
            <div>• {isPaused ? "Simulation Paused" : "Simulation Running"}</div>
            <div>• Active Asteroids: {asteroidsRef.current.length}</div>
          </div>
        </>
      )}
    </div>
  )
}
