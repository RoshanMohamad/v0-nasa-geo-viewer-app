"use client"

import { useEffect, useRef } from "react"
import * as THREE from "three"
import { OrbitControls } from "three/addons/controls/OrbitControls.js"

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
}: SolarSystemProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const asteroidsRef = useRef<Asteroid[]>([])
  const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster())
  const mouseRef = useRef<THREE.Vector2>(new THREE.Vector2())
  const lastAsteroidConfigRef = useRef<string>("")

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

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    renderer.outputColorSpace = THREE.SRGBColorSpace // Better color accuracy
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.0
    containerRef.current.appendChild(renderer.domElement)
    rendererRef.current = renderer

    const controls = new OrbitControls(camera, renderer.domElement)
    
    // STEP 1: Enable smooth damping for gradual deceleration
    controls.enableDamping = true
    controls.dampingFactor = 0.12  // Higher = smoother, more gradual stops
    
    // STEP 2: Set zoom distance range (step-by-step accessibility)
    controls.minDistance = 0.5  // EXTREME close-up capability
    controls.maxDistance = 800  // Wider overview range
    
    // STEP 3: Configure smooth zoom behavior
    controls.zoomSpeed = 0.6  // Slower = more controlled, step-by-step feel
    controls.enableZoom = true
    
    // STEP 4: Set rotation smoothness
    controls.rotateSpeed = 0.7  // Slower for smooth, controlled rotation
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
    const planetsData = [
      { name: "Mercury", distance: 15, size: 0.8, color: 0x8c7853, speed: 0.04, eccentricity: 0.206, emissive: 0x3d3428 },
      { name: "Venus", distance: 20, size: 1.2, color: 0xffc649, speed: 0.03, eccentricity: 0.007, emissive: 0x664d1e },
      { name: "Earth", distance: 28, size: 1.3, color: 0x4a90e2, speed: 0.02, eccentricity: 0.017, emissive: 0x1a3a5a },
      { name: "Mars", distance: 35, size: 1, color: 0xe27b58, speed: 0.018, eccentricity: 0.093, emissive: 0x5a2f22 },
      { name: "Jupiter", distance: 50, size: 3, color: 0xc88b3a, speed: 0.01, eccentricity: 0.048, emissive: 0x4d3617 },
      { name: "Saturn", distance: 65, size: 2.5, color: 0xfad5a5, speed: 0.008, eccentricity: 0.056, emissive: 0x645542 },
      { name: "Uranus", distance: 78, size: 2, color: 0x4fd0e7, speed: 0.006, eccentricity: 0.046, emissive: 0x1f535c },
      { name: "Neptune", distance: 88, size: 1.9, color: 0x4166f5, speed: 0.005, eccentricity: 0.010, emissive: 0x1a2962 },
    ]

    const planets: Array<{
      mesh: THREE.Mesh
      orbit: THREE.Line
      angle: number
      speed: number
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

      planets.push({
        mesh: planet,
        orbit,
        angle: Math.random() * Math.PI * 2,
        speed: planetData.speed,
        distance: planetData.distance,
        eccentricity: planetData.eccentricity,
        name: planetData.name,
      })
    })

    let lastTime = performance.now()
    const animate = () => {
      requestAnimationFrame(animate)

      const currentTime = performance.now()
      const deltaTime = (currentTime - lastTime) / 1000
      lastTime = currentTime

      if (!isPaused) {
        const sun = sceneRef.current?.children.find((child) => child instanceof THREE.Mesh) as THREE.Mesh
        sun.rotation.y += 0.002 * deltaTime * 60
        const pulseScale = 1 + Math.sin(currentTime * 0.001) * 0.02
        sun.scale.set(pulseScale, pulseScale, pulseScale)

        planets.forEach((planet) => {
          planet.angle += planet.speed * deltaTime * 10
          
          // Calculate elliptical position using Kepler's equation
          // r = a(1 - e²) / (1 + e·cos(θ))
          const a = planet.distance  // semi-major axis
          const e = planet.eccentricity
          const theta = planet.angle
          const r = (a * (1 - e * e)) / (1 + e * Math.cos(theta))
          
          planet.mesh.position.x = r * Math.cos(theta)
          planet.mesh.position.z = r * Math.sin(theta)
          
          // Realistic rotation speeds (showing surface features)
          switch (planet.name) {
            case "Mercury":
              planet.mesh.rotation.y += 0.002 * deltaTime * 60
              break
            case "Venus":
              planet.mesh.rotation.y -= 0.0005 * deltaTime * 60 // Retrograde!
              break
            case "Earth":
              planet.mesh.rotation.y += 0.01 * deltaTime * 60
              // Rotate moon around Earth
              const earthMoon = planet.mesh.children.find(
                (child) => child instanceof THREE.Mesh && child.geometry instanceof THREE.SphereGeometry && (child.geometry as THREE.SphereGeometry).parameters.radius === 0.35
              )
              if (earthMoon) {
                const moonAngle = currentTime * 0.0005
                earthMoon.position.x = Math.cos(moonAngle) * 3
                earthMoon.position.z = Math.sin(moonAngle) * 3
                earthMoon.rotation.y += 0.005 * deltaTime * 60
              }
              break
            case "Mars":
              planet.mesh.rotation.y += 0.009 * deltaTime * 60
              break
            case "Jupiter":
              planet.mesh.rotation.y += 0.024 * deltaTime * 60 // Fast rotation!
              break
            case "Saturn":
              planet.mesh.rotation.y += 0.022 * deltaTime * 60
              break
            case "Uranus":
              planet.mesh.rotation.y -= 0.014 * deltaTime * 60 // Retrograde!
              break
            case "Neptune":
              planet.mesh.rotation.y += 0.015 * deltaTime * 60
              break
            default:
              planet.mesh.rotation.y += 0.01 * deltaTime * 60
          }
        })

        asteroidsRef.current.forEach((asteroid) => {
          if (asteroid.impacted) return

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

      const controls = cameraRef.current ? new OrbitControls(cameraRef.current, rendererRef.current?.domElement) : null
      controls?.update()
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

    return () => {
      window.removeEventListener("resize", handleResize)
      if (containerRef.current && rendererRef.current?.domElement) {
        containerRef.current.removeChild(rendererRef.current.domElement)
      }
      rendererRef.current?.dispose()
    }
  }, []) // Empty dependency array - scene setup only runs once

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
  }, [asteroidConfig, onMeteorPlaced]) // Only depends on asteroidConfig and onMeteorPlaced

  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} className="w-full h-full" />
      <div className="absolute bottom-4 left-4 bg-card/90 backdrop-blur-sm border border-border/50 rounded-lg px-4 py-2 text-sm text-muted-foreground">
        <div className="font-medium mb-1">Interactive Controls:</div>
        <div>• Scroll to zoom (wide range)</div>
        <div>• Drag to rotate view</div>
        <div>• {isPaused ? "Simulation Paused" : "Simulation Running"}</div>
        <div>• Active Asteroids: {asteroidsRef.current.length}</div>
      </div>
    </div>
  )
}
