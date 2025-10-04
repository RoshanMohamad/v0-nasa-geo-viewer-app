"use client"

import { useEffect, useRef, useState } from "react"
import * as THREE from "three"
import { OrbitControls } from "three/addons/controls/OrbitControls.js"
import gsap from "gsap"
import { calculateOrbitalPosition, type CelestialBody, calculateImpactProbability, PLANETS } from "@/lib/orbital-mechanics"
import { calculateImpact, type AsteroidData, type ImpactResults } from "@/lib/impact-calculator"

interface SolarSystem3DViewProps {
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
  customObjects?: CelestialBody[]
  simulationTime?: number
  onObjectClick?: (object: CelestialBody) => void
  onImpactAnalysis?: (object: CelestialBody, analysis: any) => void
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

interface ImpactVisualization {
  objectId: string
  earth: THREE.Mesh
  object: THREE.Mesh
  closestApproachLine: THREE.Line
  impactMarkers: THREE.Mesh[]
  craterVisualization?: THREE.Group
  analysisData: any
}

export function SolarSystem3DView({
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
  onImpactAnalysis,
}: SolarSystem3DViewProps) {
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
  const impactVisualizationsRef = useRef<ImpactVisualization[]>([])

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

  /**
   * Kepler's Equation Solver - for accurate elliptical orbit positions
   */
  const solveKeplerEquation = (M: number, e: number, tolerance = 1e-6): number => {
    let E = M
    let delta = 1
    let iterations = 0
    const maxIterations = 100
    
    while (Math.abs(delta) > tolerance && iterations < maxIterations) {
      delta = E - e * Math.sin(E) - M
      E = E - delta / (1 - e * Math.cos(E))
      iterations++
    }
    
    return E
  }

  /**
   * Create 3D crater visualization on Earth's surface
   */
  const createCraterVisualization = (
    earth: THREE.Mesh,
    impactLat: number,
    impactLon: number,
    craterData: {
      craterDiameter: number
      craterDepth: number
      centralPeakHeight: number
      craterZones: {
        centralPeak: number
        terracedRim: number
        ejectaRim: number
        ejectaBlanket: number
        shockwave: number
      }
    }
  ): THREE.Group => {
    const craterGroup = new THREE.Group()
    const earthRadius = (earth.geometry as THREE.SphereGeometry).parameters.radius

    // Convert lat/lon to 3D position on sphere
    const latRad = (impactLat * Math.PI) / 180
    const lonRad = (impactLon * Math.PI) / 180
    
    const x = earthRadius * Math.cos(latRad) * Math.cos(lonRad)
    const y = earthRadius * Math.sin(latRad)
    const z = earthRadius * Math.cos(latRad) * Math.sin(lonRad)

    // Scale crater to Earth size (convert km to scene units)
    const scale = earthRadius / 6371 // Earth radius in km
    
    // Shockwave zone (outermost, transparent red)
    const shockwaveRadius = (craterData.craterZones.shockwave / 6371) * earthRadius
    const shockwaveGeom = new THREE.SphereGeometry(shockwaveRadius, 32, 32)
    const shockwaveMat = new THREE.MeshBasicMaterial({
      color: 0xff0000,
      transparent: true,
      opacity: 0.15,
      side: THREE.DoubleSide,
    })
    const shockwave = new THREE.Mesh(shockwaveGeom, shockwaveMat)
    shockwave.position.set(x, y, z)
    craterGroup.add(shockwave)

    // Ejecta blanket (orange)
    const ejectaRadius = (craterData.craterZones.ejectaBlanket / 6371) * earthRadius
    const ejectaGeom = new THREE.SphereGeometry(ejectaRadius, 32, 32)
    const ejectaMat = new THREE.MeshBasicMaterial({
      color: 0xff8c00,
      transparent: true,
      opacity: 0.3,
      side: THREE.DoubleSide,
    })
    const ejecta = new THREE.Mesh(ejectaGeom, ejectaMat)
    ejecta.position.set(x, y, z)
    craterGroup.add(ejecta)

    // Crater rim (brown/tan)
    const rimRadius = (craterData.craterZones.ejectaRim / 6371) * earthRadius
    const rimGeom = new THREE.SphereGeometry(rimRadius, 32, 32)
    const rimMat = new THREE.MeshBasicMaterial({
      color: 0xcd853f,
      transparent: true,
      opacity: 0.5,
      side: THREE.DoubleSide,
    })
    const rim = new THREE.Mesh(rimGeom, rimMat)
    rim.position.set(x, y, z)
    craterGroup.add(rim)

    // Central impact point (bright marker)
    const impactMarkerGeom = new THREE.SphereGeometry(earthRadius * 0.02, 16, 16)
    const impactMarkerMat = new THREE.MeshBasicMaterial({
      color: 0xff0000,
      emissive: 0xff0000,
      emissiveIntensity: 1,
    })
    const impactMarker = new THREE.Mesh(impactMarkerGeom, impactMarkerMat)
    impactMarker.position.set(x, y, z)
    craterGroup.add(impactMarker)

    // Add pulsing animation to impact marker
    const pulseAnimation = () => {
      if (impactMarker.parent) {
        impactMarker.scale.set(
          1 + Math.sin(Date.now() * 0.005) * 0.3,
          1 + Math.sin(Date.now() * 0.005) * 0.3,
          1 + Math.sin(Date.now() * 0.005) * 0.3
        )
        requestAnimationFrame(pulseAnimation)
      }
    }
    pulseAnimation()

    return craterGroup
  }

  /**
   * Calculate impact probability and visualize on 3D scene
   */
  const analyzeAndVisualizeImpact = (object: CelestialBody, earth: THREE.Mesh) => {
    // Get Earth's orbital elements
    const earthData = PLANETS.find(p => p.name === 'Earth')
    if (!earthData) return

    // Calculate impact analysis
    const analysis = calculateImpactProbability(object, earthData.orbitalElements)

    // Calculate crater data using impact-calculator
    const impactVelocity = object.orbitalElements.velocity || 20 // km/s
    const asteroidDiameter = (object.radius / 1000) * 2 // Convert radius to diameter in km
    
    const asteroidData: AsteroidData = {
      diameter: asteroidDiameter,
      velocity: impactVelocity,
      density: object.composition === 'metallic' ? 7800 : 
               object.composition === 'icy' ? 1000 : 
               object.composition === 'carbonaceous' ? 1400 : 2600, // kg/m³
      angle: 45,
    }

    const impactResults: ImpactResults = calculateImpact(asteroidData)

    // Enhanced crater calculations
    const kineticEnergy = analysis.kineticEnergy
    const energyMegatons = analysis.kineticEnergyMT
    const craterDiameter = analysis.craterDiameter * 1000 // Convert to meters
    const craterDepth = analysis.craterDepth * 1000
    const centralPeakHeight = craterDiameter > 5000 ? craterDepth * 0.4 : 0

    const craterZones = {
      centralPeak: craterDiameter * 0.1,
      terracedRim: craterDiameter * 0.35,
      ejectaRim: craterDiameter * 0.5,
      ejectaBlanket: craterDiameter * 2.5,
      shockwave: craterDiameter * 5,
    }

    const enhancedAnalysis = {
      ...analysis,
      impactVelocity,
      craterDiameter,
      craterDepth,
      centralPeakHeight,
      craterZones,
      impactResults,
    }

    // Remove any existing visualization for this object
    const existingViz = impactVisualizationsRef.current.find(v => v.objectId === object.id)
    if (existingViz && sceneRef.current) {
      sceneRef.current.remove(existingViz.closestApproachLine)
      existingViz.impactMarkers.forEach(m => sceneRef.current?.remove(m))
      if (existingViz.craterVisualization) {
        sceneRef.current.remove(existingViz.craterVisualization)
      }
      impactVisualizationsRef.current = impactVisualizationsRef.current.filter(v => v.objectId !== object.id)
    }

    // Find object mesh
    const objectMesh = sceneRef.current?.children.find(
      (child) => child.userData.customObjectId === object.id
    ) as THREE.Mesh | undefined

    if (!objectMesh || !sceneRef.current) return

    const scene = sceneRef.current

    // Create closest approach visualization line
    const earthPos = earth.position.clone()
    const objectPos = objectMesh.position.clone()
    
    const lineGeometry = new THREE.BufferGeometry().setFromPoints([earthPos, objectPos])
    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0xffcc00,
      transparent: true,
      opacity: 0.7,
      linewidth: 3,
    })
    const closestApproachLine = new THREE.Line(lineGeometry, lineMaterial)
    scene.add(closestApproachLine)

    // Create impact markers at Earth and object positions
    const impactMarkers: THREE.Mesh[] = []
    
    const markerGeometry = new THREE.SphereGeometry(0.5, 16, 16)
    const markerMaterial = new THREE.MeshBasicMaterial({
      color: 0xffcc00,
      emissive: 0xffcc00,
      emissiveIntensity: 1,
    })
    
    const earthMarker = new THREE.Mesh(markerGeometry, markerMaterial)
    earthMarker.position.copy(earthPos)
    scene.add(earthMarker)
    impactMarkers.push(earthMarker)
    
    const objectMarker = new THREE.Mesh(markerGeometry, markerMaterial)
    objectMarker.position.copy(objectPos)
    scene.add(objectMarker)
    impactMarkers.push(objectMarker)

    // Create crater visualization if impact probability is significant
    let craterViz: THREE.Group | undefined
    if (analysis.impactProbability > 0.01) {
      // Generate random impact location
      const impactLat = (Math.random() * 180 - 90)
      const impactLon = (Math.random() * 360 - 180)
      
      craterViz = createCraterVisualization(earth, impactLat, impactLon, {
        craterDiameter,
        craterDepth,
        centralPeakHeight,
        craterZones,
      })
      scene.add(craterViz)
    }

    // Store visualization
    const visualization: ImpactVisualization = {
      objectId: object.id,
      earth,
      object: objectMesh,
      closestApproachLine,
      impactMarkers,
      craterVisualization: craterViz,
      analysisData: enhancedAnalysis,
    }

    impactVisualizationsRef.current.push(visualization)

    // Notify parent component
    if (onImpactAnalysis) {
      onImpactAnalysis(object, enhancedAnalysis)
    }

    // Animate markers
    const animateMarkers = () => {
      impactMarkers.forEach(marker => {
        if (marker.parent) {
          marker.scale.set(
            1 + Math.sin(Date.now() * 0.003) * 0.5,
            1 + Math.sin(Date.now() * 0.003) * 0.5,
            1 + Math.sin(Date.now() * 0.003) * 0.5
          )
        }
      })
      if (impactMarkers[0]?.parent) {
        requestAnimationFrame(animateMarkers)
      }
    }
    animateMarkers()
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

    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({ 
        antialias: true, 
        alpha: true,
        failIfMajorPerformanceCaveat: false
      })
      
      const gl = renderer.getContext()
      if (!gl) {
        throw new Error('WebGL context could not be created')
      }
      
    } catch (error) {
      console.error('WebGL Error:', error)
      setWebglError(
        'Your browser or device does not support WebGL. Please try updating your browser or using a different device.'
      )
      return
    }

    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    renderer.outputColorSpace = THREE.SRGBColorSpace
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
    controls.enableDamping = true
    controls.dampingFactor = 0.05
    controls.minDistance = 0.5
    controls.maxDistance = 800
    controls.zoomSpeed = 1.0
    controls.enableZoom = true
    controls.rotateSpeed = 0.5
    controls.maxPolarAngle = Math.PI
    controls.enablePan = true
    controls.panSpeed = 0.8
    controls.screenSpacePanning = false
    controls.autoRotate = false
    controls.autoRotateSpeed = 0
    controls.touches.ONE = THREE.TOUCH.ROTATE
    controls.touches.TWO = THREE.TOUCH.DOLLY_PAN
    controls.zoomToCursor = true
    controls.target.set(0, 0, 0)

    const ambientLight = new THREE.AmbientLight(0x222222, 0.3)
    scene.add(ambientLight)

    const pointLight = new THREE.PointLight(0xffffff, 3, 400)
    pointLight.position.set(0, 0, 0)
    pointLight.castShadow = true
    scene.add(pointLight)

    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.4)
    scene.add(hemiLight)

    const loadingManager = new THREE.LoadingManager()
    const textureLoader = new THREE.TextureLoader(loadingManager)
    const maxAnisotropy = renderer.capabilities.getMaxAnisotropy()

    const enhanceTexture = (texture: THREE.Texture) => {
      texture.anisotropy = maxAnisotropy
      texture.minFilter = THREE.LinearMipmapLinearFilter
      texture.magFilter = THREE.LinearFilter
      texture.colorSpace = THREE.SRGBColorSpace
      texture.wrapS = THREE.RepeatWrapping
      texture.wrapT = THREE.ClampToEdgeWrapping
      texture.generateMipmaps = true
      texture.needsUpdate = true
      texture.premultiplyAlpha = false
      texture.flipY = true
      return texture
    }

    // Starfield
    const starGeometry = new THREE.SphereGeometry(500, 64, 64)
    const starTexture = enhanceTexture(textureLoader.load('/textures/8k_stars_milky_way.jpg'))
    const starMaterial = new THREE.MeshBasicMaterial({
      map: starTexture,
      side: THREE.BackSide,
    })
    const starfield = new THREE.Mesh(starGeometry, starMaterial)
    scene.add(starfield)

    // Sun
    const sunGeometry = new THREE.SphereGeometry(5, 256, 256)
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

    const planets: typeof planetsRef.current = []

    planetsData.forEach((planetData) => {
      const geometry = new THREE.SphereGeometry(planetData.size, 256, 256)
      let material: THREE.MeshStandardMaterial

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

        const moonGeometry = new THREE.SphereGeometry(0.35, 128, 128)
        const moonMaterial = new THREE.MeshStandardMaterial({
          map: enhanceTexture(textureLoader.load('/textures/2k_moon.jpg')),
          roughness: 0.9,
        })
        const moon = new THREE.Mesh(moonGeometry, moonMaterial)
        moon.position.set(3, 0, 0)
        planet.add(moon)
      }

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

      const orbitGeometry = new THREE.BufferGeometry()
      const orbitPoints = []
      const a = planetData.distance
      const e = planetData.eccentricity
      
      for (let i = 0; i <= 256; i++) {
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

      const meanAngularVelocity = 0.02 * Math.pow(28 / planetData.distance, 1.5)

      planets.push({
        mesh: planet,
        orbit,
        angle: Math.random() * Math.PI * 2,
        meanAngularVelocity,
        distance: planetData.distance,
        eccentricity: planetData.eccentricity,
        name: planetData.name,
      })
    })

    planetsRef.current = planets

    const animate = () => {
      requestAnimationFrame(animate)

      if (!isPausedRef.current) {
        const currentSimTime = simulationTimeRef.current
        
        const sun = sceneRef.current?.children.find((child) => child instanceof THREE.Mesh) as THREE.Mesh
        sun.rotation.y = currentSimTime * 0.00000269
        const pulseScale = 1 + Math.sin(currentSimTime * 0.00001) * 0.02
        sun.scale.set(pulseScale, pulseScale, pulseScale)

        planets.forEach((planet) => {
          const a = planet.distance
          const e = planet.eccentricity
          const theta = planet.angle
          const r = (a * (1 - e * e)) / (1 + e * Math.cos(theta))
          
          const angularVelocity = planet.meanAngularVelocity * Math.pow(a / r, 2)
          planet.angle = currentSimTime * angularVelocity * 0.01
          
          planet.mesh.position.x = r * Math.cos(theta)
          planet.mesh.position.z = r * Math.sin(theta)
          
          switch (planet.name) {
            case "Mercury":
              planet.mesh.rotation.y = currentSimTime * 0.00000124
              break
            case "Venus":
              planet.mesh.rotation.y = -currentSimTime * 0.000000299
              break
            case "Earth":
              planet.mesh.rotation.y = currentSimTime * 0.0000727
              const earthMoon = planet.mesh.children.find(
                (child) => child instanceof THREE.Mesh && (child.geometry as any).parameters?.radius === 0.35
              )
              if (earthMoon) {
                const moonAngle = currentSimTime * 0.00000266
                earthMoon.position.x = Math.cos(moonAngle) * 3
                earthMoon.position.z = Math.sin(moonAngle) * 3
                earthMoon.rotation.y = currentSimTime * 0.00000266
              }
              break
            case "Mars":
              planet.mesh.rotation.y = currentSimTime * 0.0000709
              break
            case "Jupiter":
              planet.mesh.rotation.y = currentSimTime * 0.000176
              break
            case "Saturn":
              planet.mesh.rotation.y = currentSimTime * 0.000163
              break
            case "Uranus":
              planet.mesh.rotation.y = -currentSimTime * 0.000101
              break
            case "Neptune":
              planet.mesh.rotation.y = currentSimTime * 0.000108
              break
            default:
              planet.mesh.rotation.y = currentSimTime * 0.0000727
          }
        })

        // Render custom objects
        if (customObjects.length > 0) {
          console.log('🎯 Rendering custom objects:', customObjects.length)
        }
        customObjects.forEach((obj) => {
          console.log('📦 Object:', obj.name, '| Distance:', obj.orbitalElements.semiMajorAxis.toFixed(2), 'AU')
          
          let customMesh = scene.children.find(
            (child) => child.userData.customObjectId === obj.id
          ) as THREE.Mesh | undefined

          if (!customMesh) {
            // Make objects larger and more visible (min 0.8 instead of 0.3)
            const size = Math.max(0.8, obj.radius / 100)  // Increased from /1000 to /100
            console.log('✨ Creating mesh for', obj.name, '| Size:', size.toFixed(2))
            const geometry = new THREE.SphereGeometry(size, 64, 64)
            
            let color = 0x888888
            let emissive = 0x333333
            let orbitColor = 0xff6600
            if (obj.type === 'asteroid') {
              color = 0x8b7355
              emissive = 0xff6600
              orbitColor = 0xff6600
            } else if (obj.type === 'comet') {
              color = 0x6699cc
              emissive = 0x0099ff
              orbitColor = 0x00ccff
            } else if (obj.type === 'dwarf-planet') {
              color = 0xccaa88
              emissive = 0x886644
              orbitColor = 0xffaa44
            } else if (obj.type === 'trans-neptunian') {
              color = 0x9999cc
              emissive = 0x6666ff
              orbitColor = 0x9966ff
            }

            const material = new THREE.MeshStandardMaterial({
              color,
              emissive,
              emissiveIntensity: 0.8,  // Increased from 0.4 to make more visible
              roughness: 0.7,
              metalness: 0.4,
            })
            
            customMesh = new THREE.Mesh(geometry, material)
            customMesh.userData.customObjectId = obj.id
            customMesh.userData.customObject = obj
            customMesh.castShadow = true
            customMesh.receiveShadow = true
            scene.add(customMesh)

            // Create orbit
            const orbitGeometry = new THREE.BufferGeometry()
            const orbitPoints = []
            const a = obj.orbitalElements.semiMajorAxis * 28
            const e = obj.orbitalElements.eccentricity
            const inc = obj.orbitalElements.inclination * (Math.PI / 180)
            const omega = obj.orbitalElements.longitudeOfAscendingNode * (Math.PI / 180)
            const w = obj.orbitalElements.argumentOfPerihelion * (Math.PI / 180)
            
            for (let i = 0; i <= 256; i++) {
              const theta = (i / 256) * Math.PI * 2
              const r = (a * (1 - e * e)) / (1 + e * Math.cos(theta))
              
              const xOrbital = r * Math.cos(theta)
              const yOrbital = r * Math.sin(theta)
              
              const x1 = xOrbital * Math.cos(w) - yOrbital * Math.sin(w)
              const y1 = xOrbital * Math.sin(w) + yOrbital * Math.cos(w)
              
              const x2 = x1
              const y2 = y1 * Math.cos(inc)
              const z2 = y1 * Math.sin(inc)
              
              const x3 = x2 * Math.cos(omega) - y2 * Math.sin(omega)
              const y3 = x2 * Math.sin(omega) + y2 * Math.cos(omega)
              const z3 = z2
              
              orbitPoints.push(x3, z3, y3)
            }
            
            orbitGeometry.setAttribute("position", new THREE.Float32BufferAttribute(orbitPoints, 3))
            const orbitMaterial = new THREE.LineBasicMaterial({
              color: orbitColor,
              transparent: true,
              opacity: 0.9,  // Increased from 0.6 to 0.9 for better visibility
              linewidth: 3,  // Increased from 2 to 3
            })
            const orbitLine = new THREE.Line(orbitGeometry, orbitMaterial)
            orbitLine.userData.customOrbitId = obj.id
            scene.add(orbitLine)
            console.log('🛰️ Created orbit for', obj.name, '| Color:', orbitColor.toString(16))
          }

          const position = calculateOrbitalPosition(obj.orbitalElements, currentSimTime)
          const scaledPos = { x: position.x * 28, y: position.y * 28, z: position.z * 28 }
          customMesh.position.set(scaledPos.x, scaledPos.y, scaledPos.z)
          
          // Log position every 60 frames (~1 second)
          if (Math.floor(currentSimTime * 60) % 60 === 0) {
            console.log('📍', obj.name, '| Pos:', 
              scaledPos.x.toFixed(1), scaledPos.y.toFixed(1), scaledPos.z.toFixed(1),
              '| Distance from origin:', Math.sqrt(scaledPos.x**2 + scaledPos.y**2 + scaledPos.z**2).toFixed(1)
            )
          }
          
          customMesh.rotation.x = currentSimTime * 0.01
          customMesh.rotation.y = currentSimTime * 0.02
        })

        // Remove deleted objects
        const activeObjectIds = new Set(customObjects.map(obj => obj.id))
        const meshesToRemove = scene.children.filter(
          (child) => (child.userData.customObjectId || child.userData.customOrbitId) && 
                     !activeObjectIds.has(child.userData.customObjectId || child.userData.customOrbitId)
        )
        meshesToRemove.forEach((mesh) => scene.remove(mesh))

        // Update impact visualizations
        impactVisualizationsRef.current.forEach(viz => {
          if (viz.closestApproachLine) {
            const earthPos = viz.earth.position.clone()
            const objectPos = viz.object.position.clone()
            const points = [earthPos, objectPos]
            viz.closestApproachLine.geometry.setFromPoints(points)
          }
        })

        // Asteroids physics
        asteroidsRef.current.forEach((asteroid) => {
          if (asteroid.impacted) return

          const deltaTime = 1 / 60
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

    // Handle clicks on custom objects
    const handleClick = (event: MouseEvent) => {
      if (!containerRef.current || !cameraRef.current || !sceneRef.current) return

      const rect = containerRef.current.getBoundingClientRect()
      mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

      raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current)
      
      const customMeshes = sceneRef.current.children.filter(
        (child) => child.userData.customObjectId
      )
      const intersects = raycasterRef.current.intersectObjects(customMeshes)

      if (intersects.length > 0) {
        const clickedMesh = intersects[0].object
        const customObject = clickedMesh.userData.customObject as CelestialBody
        if (customObject) {
          if (onObjectClick) {
            onObjectClick(customObject)
          }
          // Automatically analyze impact when clicked
          const earth = planetsRef.current.find(p => p.name === 'Earth')
          if (earth) {
            analyzeAndVisualizeImpact(customObject, earth.mesh)
          }
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
      if (cameraRef.current?.position) {
        gsap.killTweensOf(cameraRef.current.position)
      }
      if (controlsRef.current?.target) {
        gsap.killTweensOf(controlsRef.current.target)
      }
    }
  }, [])

  useEffect(() => {
    if (!cameraRef.current || !controlsRef.current || !focusPlanet) return

    const planet = planetsRef.current.find(p => p.name === focusPlanet)
    if (!planet) return

    const planetPos = planet.mesh.position
    const planetSize = (planet.mesh.geometry as THREE.SphereGeometry).parameters.radius
    const distance = planetSize * 5

    const targetPos = new THREE.Vector3(planetPos.x, planetPos.y, planetPos.z)

    const angle = planet.angle - Math.PI / 4
    const cameraPos = new THREE.Vector3(
      planetPos.x + Math.cos(angle) * distance,
      planetPos.y + distance * 0.7,
      planetPos.z + Math.sin(angle) * distance
    )

    gsap.killTweensOf(cameraRef.current.position)
    gsap.killTweensOf(controlsRef.current.target)

    const duration = 2

    gsap.to(cameraRef.current.position, {
      x: cameraPos.x,
      y: cameraPos.y,
      z: cameraPos.z,
      duration: duration,
      ease: "power2.inOut",
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

  return (
    <div className="relative w-full h-full">
      {webglError ? (
        <div className="absolute inset-0 flex items-center justify-center bg-background/95 backdrop-blur-sm">
          <div className="max-w-md p-8 bg-card border border-border rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold text-foreground mb-2">WebGL Not Available</h3>
            <p className="text-sm text-muted-foreground">{webglError}</p>
          </div>
        </div>
      ) : (
        <>
          <div ref={containerRef} className="w-full h-full" />
          <div className="absolute bottom-4 left-4 bg-card/90 backdrop-blur-sm border border-border/50 rounded-lg px-4 py-2 text-sm text-muted-foreground">
            <div className="font-medium mb-1">🌌 3D Solar System</div>
            <div>• Click custom objects for impact analysis</div>
            <div>• Scroll to zoom • Drag to rotate</div>
            <div>• {isPaused ? "⏸ Paused" : "▶ Running"}</div>
            <div>• Custom Objects: {customObjects.length}</div>
            <div>• Active Impacts: {impactVisualizationsRef.current.length}</div>
          </div>
        </>
      )}
    </div>
  )
}
