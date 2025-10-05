"use client"

import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

interface OrbitalIntersectionViewerProps {
  asteroidOrbit: {
    semiMajorAxis: number
    eccentricity: number
    inclination: number
    longitudeOfAscendingNode: number
    argumentOfPerihelion: number // Note: using argumentOfPerihelion (not Periapsis)
  }
  asteroidName: string
  viewType: 'top' | 'side'
}

export function OrbitalIntersectionViewer({ 
  asteroidOrbit, 
  asteroidName,
  viewType 
}: OrbitalIntersectionViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const animationFrameRef = useRef<number>()

  useEffect(() => {
    if (!containerRef.current) return

    // Scene setup
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x000510)
    sceneRef.current = scene

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      50,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    )
    
    if (viewType === 'top') {
      camera.position.set(0, 5, 0)
      camera.lookAt(0, 0, 0)
    } else {
      camera.position.set(5, 2, 5)
      camera.lookAt(0, 0, 0)
    }

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight)
    renderer.setPixelRatio(window.devicePixelRatio)
    containerRef.current.appendChild(renderer.domElement)
    rendererRef.current = renderer

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.05
    controls.minDistance = 2
    controls.maxDistance = 20

    // Add stars
    const starsGeometry = new THREE.BufferGeometry()
    const starsMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.02,
      transparent: true,
      opacity: 0.8
    })
    const starsVertices = []
    for (let i = 0; i < 1000; i++) {
      const x = (Math.random() - 0.5) * 50
      const y = (Math.random() - 0.5) * 50
      const z = (Math.random() - 0.5) * 50
      starsVertices.push(x, y, z)
    }
    starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3))
    const stars = new THREE.Points(starsGeometry, starsMaterial)
    scene.add(stars)

    // Add Sun at center
    const sunGeometry = new THREE.SphereGeometry(0.15, 32, 32)
    const sunMaterial = new THREE.MeshBasicMaterial({ 
      color: 0xfdb813
    })
    const sun = new THREE.Mesh(sunGeometry, sunMaterial)
    scene.add(sun)

    // Add sun glow
    const glowGeometry = new THREE.SphereGeometry(0.2, 32, 32)
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: 0xfdb813,
      transparent: true,
      opacity: 0.3
    })
    const glow = new THREE.Mesh(glowGeometry, glowMaterial)
    scene.add(glow)

    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0x404040, 1)
    scene.add(ambientLight)

    // Add point light at sun
    const pointLight = new THREE.PointLight(0xffffff, 2, 100)
    pointLight.position.set(0, 0, 0)
    scene.add(pointLight)

    // Create Earth orbit (circular at 1 AU)
    const earthOrbitPoints = []
    const earthOrbitRadius = 1.0 // 1 AU
    for (let i = 0; i <= 360; i++) {
      const angle = (i * Math.PI) / 180
      earthOrbitPoints.push(
        new THREE.Vector3(
          Math.cos(angle) * earthOrbitRadius,
          0,
          Math.sin(angle) * earthOrbitRadius
        )
      )
    }
    const earthOrbitGeometry = new THREE.BufferGeometry().setFromPoints(earthOrbitPoints)
    const earthOrbitMaterial = new THREE.LineBasicMaterial({ 
      color: 0x4a90e2,
      linewidth: 2,
      opacity: 0.6,
      transparent: true
    })
    const earthOrbitLine = new THREE.Line(earthOrbitGeometry, earthOrbitMaterial)
    scene.add(earthOrbitLine)

    // Add Earth
    const earthGeometry = new THREE.SphereGeometry(0.08, 32, 32)
    const earthMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x2233ff,
      emissive: 0x112244,
      emissiveIntensity: 0.2
    })
    const earth = new THREE.Mesh(earthGeometry, earthMaterial)
    earth.position.set(earthOrbitRadius, 0, 0)
    scene.add(earth)

    // Create asteroid orbit (elliptical)
    const asteroidOrbitPoints = []
    const a = asteroidOrbit.semiMajorAxis
    const e = asteroidOrbit.eccentricity
    const inc = (asteroidOrbit.inclination * Math.PI) / 180
    const omega = (asteroidOrbit.longitudeOfAscendingNode * Math.PI) / 180
    const w = (asteroidOrbit.argumentOfPerihelion * Math.PI) / 180

    for (let i = 0; i <= 360; i++) {
      const theta = (i * Math.PI) / 180
      const r = (a * (1 - e * e)) / (1 + e * Math.cos(theta))
      
      // Calculate position in orbital plane
      const x_orb = r * Math.cos(theta)
      const y_orb = r * Math.sin(theta)
      
      // Rotate to 3D space
      const x = x_orb * (Math.cos(omega) * Math.cos(w) - Math.sin(omega) * Math.sin(w) * Math.cos(inc)) -
                y_orb * (Math.cos(omega) * Math.sin(w) + Math.sin(omega) * Math.cos(w) * Math.cos(inc))
      
      const y = y_orb * Math.sin(w) * Math.sin(inc) + x_orb * Math.cos(w) * Math.sin(inc)
      
      const z = x_orb * (Math.sin(omega) * Math.cos(w) + Math.cos(omega) * Math.sin(w) * Math.cos(inc)) -
                y_orb * (Math.sin(omega) * Math.sin(w) - Math.cos(omega) * Math.cos(w) * Math.cos(inc))
      
      asteroidOrbitPoints.push(new THREE.Vector3(x, y, z))
    }

    const asteroidOrbitGeometry = new THREE.BufferGeometry().setFromPoints(asteroidOrbitPoints)
    const asteroidOrbitMaterial = new THREE.LineBasicMaterial({ 
      color: 0xff0000,
      linewidth: 2,
      opacity: 0.8,
      transparent: true
    })
    const asteroidOrbitLine = new THREE.Line(asteroidOrbitGeometry, asteroidOrbitMaterial)
    scene.add(asteroidOrbitLine)

    // Add asteroid
    const asteroidGeometry = new THREE.SphereGeometry(0.05, 16, 16)
    const asteroidMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xff4444,
      emissive: 0x441111,
      emissiveIntensity: 0.3,
      roughness: 0.8
    })
    const asteroid = new THREE.Mesh(asteroidGeometry, asteroidMaterial)
    
    // Position asteroid at perihelion
    const perihelion = a * (1 - e)
    asteroid.position.set(perihelion, 0, 0)
    scene.add(asteroid)

    // Add orbit intersection markers
    const intersectionPoints: THREE.Vector3[] = []
    for (let i = 0; i < asteroidOrbitPoints.length; i++) {
      const point = asteroidOrbitPoints[i]
      const distance = Math.sqrt(point.x * point.x + point.z * point.z)
      
      // Check if asteroid orbit crosses Earth orbit (1 AU)
      if (Math.abs(distance - earthOrbitRadius) < 0.05) {
        intersectionPoints.push(point)
      }
    }

    // Mark intersection points
    intersectionPoints.forEach((point) => {
      const markerGeometry = new THREE.SphereGeometry(0.04, 16, 16)
      const markerMaterial = new THREE.MeshBasicMaterial({ 
        color: 0xffff00,
        transparent: true,
        opacity: 0.8
      })
      const marker = new THREE.Mesh(markerGeometry, markerMaterial)
      marker.position.copy(point)
      scene.add(marker)

      // Add pulsing glow
      const glowMarkerGeometry = new THREE.SphereGeometry(0.06, 16, 16)
      const glowMarkerMaterial = new THREE.MeshBasicMaterial({
        color: 0xffff00,
        transparent: true,
        opacity: 0.3
      })
      const glowMarker = new THREE.Mesh(glowMarkerGeometry, glowMarkerMaterial)
      glowMarker.position.copy(point)
      scene.add(glowMarker)
    })

    // Add grid
    const gridHelper = new THREE.GridHelper(6, 20, 0x444444, 0x222222)
    scene.add(gridHelper)

    // Add axis helpers
    const axesHelper = new THREE.AxesHelper(2)
    scene.add(axesHelper)

    // Add labels using sprites
    const createTextSprite = (text: string, color: string) => {
      const canvas = document.createElement('canvas')
      const context = canvas.getContext('2d')!
      canvas.width = 256
      canvas.height = 64
      
      context.fillStyle = color
      context.font = 'Bold 32px Arial'
      context.textAlign = 'center'
      context.fillText(text, 128, 40)
      
      const texture = new THREE.CanvasTexture(canvas)
      const material = new THREE.SpriteMaterial({ map: texture, transparent: true })
      const sprite = new THREE.Sprite(material)
      sprite.scale.set(0.5, 0.125, 1)
      
      return sprite
    }

    const earthLabel = createTextSprite('Earth', '#4a90e2')
    earthLabel.position.set(earthOrbitRadius, 0.2, 0)
    scene.add(earthLabel)

    const asteroidLabel = createTextSprite(asteroidName, '#ff4444')
    asteroidLabel.position.set(perihelion, 0.2, 0)
    scene.add(asteroidLabel)

    // Animation variables
    let earthAngle = 0
    let asteroidAngle = 0

    // Animation loop
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate)

      // Rotate Earth
      earthAngle += 0.005
      earth.position.set(
        Math.cos(earthAngle) * earthOrbitRadius,
        0,
        Math.sin(earthAngle) * earthOrbitRadius
      )
      earthLabel.position.set(
        Math.cos(earthAngle) * earthOrbitRadius,
        0.2,
        Math.sin(earthAngle) * earthOrbitRadius
      )

      // Rotate asteroid along its elliptical orbit
      asteroidAngle += 0.003
      const r = (a * (1 - e * e)) / (1 + e * Math.cos(asteroidAngle))
      
      const x_orb = r * Math.cos(asteroidAngle)
      const y_orb = r * Math.sin(asteroidAngle)
      
      const x = x_orb * (Math.cos(omega) * Math.cos(w) - Math.sin(omega) * Math.sin(w) * Math.cos(inc)) -
                y_orb * (Math.cos(omega) * Math.sin(w) + Math.sin(omega) * Math.cos(w) * Math.cos(inc))
      
      const y = y_orb * Math.sin(w) * Math.sin(inc) + x_orb * Math.cos(w) * Math.sin(inc)
      
      const z = x_orb * (Math.sin(omega) * Math.cos(w) + Math.cos(omega) * Math.sin(w) * Math.cos(inc)) -
                y_orb * (Math.sin(omega) * Math.sin(w) - Math.cos(omega) * Math.cos(w) * Math.cos(inc))
      
      asteroid.position.set(x, y, z)
      asteroidLabel.position.set(x, y + 0.2, z)

      // Rotate sun glow
      glow.rotation.y += 0.001

      controls.update()
      renderer.render(scene, camera)
    }

    animate()

    // Handle resize
    const handleResize = () => {
      if (!containerRef.current) return
      
      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight)
    }

    window.addEventListener('resize', handleResize)

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize)
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      if (rendererRef.current && containerRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement)
        rendererRef.current.dispose()
      }
      controls.dispose()
    }
  }, [asteroidOrbit, asteroidName, viewType])

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full min-h-[400px] rounded-lg overflow-hidden"
      style={{ touchAction: 'none' }}
    />
  )
}
