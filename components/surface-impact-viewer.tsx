"use client"

import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

interface SurfaceImpactViewerProps {
  asteroidRadius: number // in km
  impactVelocity: number // in km/s
  craterDiameter: number // in km
  craterDepth: number // in km
  ejectaRadius: number // in km
  asteroidName: string
}

export function SurfaceImpactViewer({ 
  asteroidRadius,
  impactVelocity,
  craterDiameter,
  craterDepth,
  ejectaRadius,
  asteroidName
}: SurfaceImpactViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const animationFrameRef = useRef<number>()

  useEffect(() => {
    if (!containerRef.current) return

    // Scene setup
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x87CEEB) // Sky blue
    sceneRef.current = scene

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      60,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      10000
    )
    
    // Position camera for side view of impact
    const viewDistance = Math.max(craterDiameter * 3, asteroidRadius * 10, 100)
    camera.position.set(viewDistance * 0.7, viewDistance * 0.5, viewDistance * 0.7)
    camera.lookAt(0, 0, 0)

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight)
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    containerRef.current.appendChild(renderer.domElement)
    rendererRef.current = renderer

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.05
    controls.minDistance = viewDistance * 0.3
    controls.maxDistance = viewDistance * 3

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4)
    scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
    directionalLight.position.set(100, 200, 100)
    directionalLight.castShadow = true
    directionalLight.shadow.mapSize.width = 2048
    directionalLight.shadow.mapSize.height = 2048
    scene.add(directionalLight)

    // Earth surface (ground plane)
    const groundSize = Math.max(ejectaRadius * 4, craterDiameter * 5, 500)
    const groundGeometry = new THREE.PlaneGeometry(groundSize, groundSize, 100, 100)
    
    // Create terrain with some noise
    const vertices = groundGeometry.attributes.position.array
    for (let i = 0; i < vertices.length; i += 3) {
      vertices[i + 2] = Math.random() * 2 - 1 // Small random elevation
    }
    groundGeometry.attributes.position.needsUpdate = true
    groundGeometry.computeVertexNormals()

    const groundMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x8B7355,
      roughness: 0.9,
      metalness: 0.1
    })
    const ground = new THREE.Mesh(groundGeometry, groundMaterial)
    ground.rotation.x = -Math.PI / 2
    ground.receiveShadow = true
    scene.add(ground)

    // Create crater
    const craterRadiusM = (craterDiameter / 2) * 1000 // Convert to meters for scene scale
    const craterDepthM = craterDepth * 1000
    
    // Crater geometry (inverted cone/bowl shape)
    const craterGeometry = new THREE.CylinderGeometry(
      craterRadiusM * 0.3, // top radius (smaller)
      craterRadiusM, // bottom radius
      craterDepthM,
      64,
      10,
      true
    )
    
    const craterMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x654321,
      roughness: 1.0,
      metalness: 0,
      side: THREE.DoubleSide
    })
    const crater = new THREE.Mesh(craterGeometry, craterMaterial)
    crater.position.y = -craterDepthM / 2
    crater.receiveShadow = true
    crater.castShadow = true
    scene.add(crater)

    // Crater rim (raised edge)
    const rimGeometry = new THREE.TorusGeometry(
      craterRadiusM,
      craterRadiusM * 0.1,
      16,
      64
    )
    const rimMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x9B7653,
      roughness: 0.95
    })
    const rim = new THREE.Mesh(rimGeometry, rimMaterial)
    rim.rotation.x = Math.PI / 2
    rim.position.y = craterDepthM * 0.1
    rim.castShadow = true
    rim.receiveShadow = true
    scene.add(rim)

    // Ejecta field (debris scattered around crater)
    const ejectaRadiusM = ejectaRadius * 1000
    const ejectaGroup = new THREE.Group()
    
    for (let i = 0; i < 200; i++) {
      const angle = Math.random() * Math.PI * 2
      const distance = craterRadiusM + Math.random() * (ejectaRadiusM - craterRadiusM)
      const size = Math.random() * 20 + 5
      
      const rockGeometry = new THREE.DodecahedronGeometry(size, 0)
      const rockMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x7a6a5a,
        roughness: 0.95
      })
      const rock = new THREE.Mesh(rockGeometry, rockMaterial)
      
      rock.position.x = Math.cos(angle) * distance
      rock.position.z = Math.sin(angle) * distance
      rock.position.y = Math.random() * 10
      
      rock.rotation.x = Math.random() * Math.PI
      rock.rotation.y = Math.random() * Math.PI
      rock.rotation.z = Math.random() * Math.PI
      
      rock.castShadow = true
      rock.receiveShadow = true
      
      ejectaGroup.add(rock)
    }
    scene.add(ejectaGroup)

    // Asteroid (incoming)
    const asteroidRadiusM = asteroidRadius * 1000
    const asteroidGeometry = new THREE.IcosahedronGeometry(asteroidRadiusM, 1)
    const asteroidMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x444444,
      roughness: 0.9,
      metalness: 0.1
    })
    const asteroid = new THREE.Mesh(asteroidGeometry, asteroidMaterial)
    asteroid.castShadow = true
    
    // Position asteroid above impact site
    const impactHeight = craterRadiusM * 3
    asteroid.position.set(-craterRadiusM, impactHeight, -craterRadiusM)
    scene.add(asteroid)

    // Impact trajectory line
    const trajectoryPoints = []
    const startHeight = impactHeight * 2
    for (let i = 0; i <= 20; i++) {
      const t = i / 20
      trajectoryPoints.push(
        new THREE.Vector3(
          -craterRadiusM * 1.5 * (1 - t),
          startHeight * (1 - t),
          -craterRadiusM * 1.5 * (1 - t)
        )
      )
    }
    const trajectoryGeometry = new THREE.BufferGeometry().setFromPoints(trajectoryPoints)
    const trajectoryMaterial = new THREE.LineDashedMaterial({ 
      color: 0xff0000,
      linewidth: 2,
      dashSize: 20,
      gapSize: 10,
      opacity: 0.6,
      transparent: true
    })
    const trajectory = new THREE.Line(trajectoryGeometry, trajectoryMaterial)
    trajectory.computeLineDistances()
    scene.add(trajectory)

    // Add velocity vector
    const arrowHelper = new THREE.ArrowHelper(
      new THREE.Vector3(1, -2, 1).normalize(),
      asteroid.position,
      craterRadiusM * 2,
      0xff0000,
      craterRadiusM * 0.3,
      craterRadiusM * 0.2
    )
    scene.add(arrowHelper)

    // Add impact flash/explosion effect
    const explosionGeometry = new THREE.SphereGeometry(craterRadiusM * 0.5, 32, 32)
    const explosionMaterial = new THREE.MeshBasicMaterial({ 
      color: 0xff6600,
      transparent: true,
      opacity: 0.6
    })
    const explosion = new THREE.Mesh(explosionGeometry, explosionMaterial)
    explosion.position.set(0, 0, 0)
    scene.add(explosion)

    // Shockwave rings
    const shockwaveGroup = new THREE.Group()
    for (let i = 0; i < 3; i++) {
      const ringGeometry = new THREE.RingGeometry(
        craterRadiusM * (1 + i * 0.3),
        craterRadiusM * (1.1 + i * 0.3),
        64
      )
      const ringMaterial = new THREE.MeshBasicMaterial({ 
        color: 0xffaa00,
        transparent: true,
        opacity: 0.3 - i * 0.1,
        side: THREE.DoubleSide
      })
      const ring = new THREE.Mesh(ringGeometry, ringMaterial)
      ring.rotation.x = -Math.PI / 2
      ring.position.y = 5
      shockwaveGroup.add(ring)
    }
    scene.add(shockwaveGroup)

    // Add measurement lines and labels
    const createLabel = (text: string, position: THREE.Vector3, color: string) => {
      const canvas = document.createElement('canvas')
      const context = canvas.getContext('2d')!
      canvas.width = 512
      canvas.height = 128
      
      context.fillStyle = color
      context.font = 'Bold 48px Arial'
      context.textAlign = 'center'
      context.fillText(text, 256, 80)
      
      const texture = new THREE.CanvasTexture(canvas)
      const material = new THREE.SpriteMaterial({ map: texture, transparent: true })
      const sprite = new THREE.Sprite(material)
      sprite.scale.set(craterRadiusM * 0.8, craterRadiusM * 0.2, 1)
      sprite.position.copy(position)
      
      return sprite
    }

    // Crater diameter label
    const diameterLabel = createLabel(
      `Crater: ${craterDiameter.toFixed(1)} km`,
      new THREE.Vector3(0, craterDepthM * 0.5, craterRadiusM * 1.3),
      '#ffff00'
    )
    scene.add(diameterLabel)

    // Asteroid name label
    const nameLabel = createLabel(
      asteroidName,
      new THREE.Vector3(asteroid.position.x, asteroid.position.y + asteroidRadiusM * 2, asteroid.position.z),
      '#ff4444'
    )
    scene.add(nameLabel)

    // Velocity label
    const velocityLabel = createLabel(
      `${impactVelocity.toFixed(1)} km/s`,
      new THREE.Vector3(
        asteroid.position.x * 0.7,
        asteroid.position.y * 0.7,
        asteroid.position.z * 0.7
      ),
      '#ff6600'
    )
    scene.add(velocityLabel)

    // Add grid for scale reference
    const gridHelper = new THREE.GridHelper(
      groundSize,
      50,
      0x666666,
      0x333333
    )
    gridHelper.position.y = 0.1
    scene.add(gridHelper)

    // Animation variables
    let explosionScale = 1
    let explosionGrowing = true
    let shockwaveScale = 1

    // Animation loop
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate)

      // Animate explosion pulsing
      if (explosionGrowing) {
        explosionScale += 0.01
        if (explosionScale >= 1.5) explosionGrowing = false
      } else {
        explosionScale -= 0.01
        if (explosionScale <= 1) explosionGrowing = true
      }
      explosion.scale.setScalar(explosionScale)

      // Animate shockwave expanding
      shockwaveScale += 0.01
      if (shockwaveScale > 2) shockwaveScale = 1
      shockwaveGroup.scale.setScalar(shockwaveScale)
      shockwaveGroup.children.forEach((ring, i) => {
        const material = (ring as THREE.Mesh).material as THREE.MeshBasicMaterial
        material.opacity = (0.3 - i * 0.1) * (2 - shockwaveScale)
      })

      // Rotate asteroid slightly
      asteroid.rotation.x += 0.005
      asteroid.rotation.y += 0.003

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
  }, [asteroidRadius, impactVelocity, craterDiameter, craterDepth, ejectaRadius, asteroidName])

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full min-h-[400px] rounded-lg overflow-hidden bg-gradient-to-b from-sky-400 to-sky-200"
      style={{ touchAction: 'none' }}
    />
  )
}
