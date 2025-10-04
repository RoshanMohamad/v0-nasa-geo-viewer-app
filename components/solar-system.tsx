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
    containerRef.current.appendChild(renderer.domElement)
    rendererRef.current = renderer

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.03
    controls.minDistance = 10
    controls.maxDistance = 500
    controls.maxPolarAngle = Math.PI
    controls.enablePan = true
    controls.panSpeed = 0.8
    controls.rotateSpeed = 0.6
    controls.zoomSpeed = 1.2

    const ambientLight = new THREE.AmbientLight(0x222222, 0.3)
    scene.add(ambientLight)

    const pointLight = new THREE.PointLight(0xffffff, 3, 400)
    pointLight.position.set(0, 0, 0)
    pointLight.castShadow = true
    scene.add(pointLight)

    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.4)
    scene.add(hemiLight)

    const sunGeometry = new THREE.SphereGeometry(5, 64, 64)
    const sunMaterial = new THREE.MeshBasicMaterial({
      color: 0xfdb813,
      emissive: 0xfdb813,
      emissiveIntensity: 1,
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
      { name: "Mercury", distance: 15, size: 0.8, color: 0x8c7853, speed: 0.04, emissive: 0x3d3428 },
      { name: "Venus", distance: 20, size: 1.2, color: 0xffc649, speed: 0.03, emissive: 0x664d1e },
      { name: "Earth", distance: 28, size: 1.3, color: 0x4a90e2, speed: 0.02, emissive: 0x1a3a5a },
      { name: "Mars", distance: 35, size: 1, color: 0xe27b58, speed: 0.018, emissive: 0x5a2f22 },
      { name: "Jupiter", distance: 50, size: 3, color: 0xc88b3a, speed: 0.01, emissive: 0x4d3617 },
      { name: "Saturn", distance: 65, size: 2.5, color: 0xfad5a5, speed: 0.008, emissive: 0x645542 },
      { name: "Uranus", distance: 78, size: 2, color: 0x4fd0e7, speed: 0.006, emissive: 0x1f535c },
      { name: "Neptune", distance: 88, size: 1.9, color: 0x4166f5, speed: 0.005, emissive: 0x1a2962 },
    ]

    const planets: Array<{
      mesh: THREE.Mesh
      orbit: THREE.Line
      angle: number
      speed: number
      distance: number
      name: string
    }> = []

    planetsData.forEach((planetData) => {
      const geometry = new THREE.SphereGeometry(planetData.size, 64, 64)
      const material = new THREE.MeshStandardMaterial({
        color: planetData.color,
        emissive: planetData.emissive,
        emissiveIntensity: 0.2,
        roughness: 0.7,
        metalness: 0.1,
      })
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
      }

      const orbitGeometry = new THREE.BufferGeometry()
      const orbitPoints = []
      for (let i = 0; i <= 128; i++) {
        const angle = (i / 128) * Math.PI * 2
        orbitPoints.push(Math.cos(angle) * planetData.distance, 0, Math.sin(angle) * planetData.distance)
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
          planet.mesh.position.x = Math.cos(planet.angle) * planet.distance
          planet.mesh.position.z = Math.sin(planet.angle) * planet.distance
          planet.mesh.rotation.y += 0.01
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
            if (distanceToEarth < earthPlanet.mesh.geometry.parameters.radius + asteroid.size) {
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
      rendererRef.current?.render(sceneRef.current, cameraRef.current)
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
