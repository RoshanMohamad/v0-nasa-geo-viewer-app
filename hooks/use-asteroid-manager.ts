"use client"

/**
 * 🎯 USE ASTEROID MANAGER - React hook for managing custom asteroids
 * 
 * This hook provides state management and integration for the asteroid system
 */

import { useState, useCallback, useRef, useEffect } from "react"
import * as THREE from "three"
import {
  CustomAsteroid,
  AsteroidMesh,
  ImpactEvent,
  calculateAsteroidPosition,
  createAsteroidMesh,
  createAsteroidGlow,
  createAsteroidTrail,
  checkCollision,
  calculateImpactEnergy,
  createImpactExplosion,
  updateExplosion,
  createShockwave,
  updateShockwave,
  predictTrajectory,
  calculateTimeToImpact,
} from "@/lib/asteroid-system"

interface Planet {
  name: string
  position: THREE.Vector3
  size: number
}

export function useAsteroidManager(
  scene: THREE.Scene | null,
  planets: Planet[],
  simulationTime: number
) {
  const [customAsteroids, setCustomAsteroids] = useState<CustomAsteroid[]>([])
  const [impactEvents, setImpactEvents] = useState<ImpactEvent[]>([])
  const [impactPredictions, setImpactPredictions] = useState<Array<{
    asteroidId: string
    planetName: string
    timeToImpact: number
  }>>([])
  
  const asteroidMeshesRef = useRef<Map<string, AsteroidMesh>>(new Map())
  const explosionsRef = useRef<THREE.Points[]>([])
  const shockwavesRef = useRef<THREE.Mesh[]>([])
  const trailPointsRef = useRef<Map<string, THREE.Vector3[]>>(new Map())

  // Add new asteroid
  const addAsteroid = useCallback((asteroid: CustomAsteroid) => {
    console.log('🌠 Adding asteroid:', asteroid.name, 'at orbit:', asteroid.semiMajorAxis)
    
    // CRITICAL FIX: Calculate initial position IMMEDIATELY
    const initialPosition = calculateAsteroidPosition(asteroid, simulationTime)
    asteroid.position.copy(initialPosition)
    
    console.log('  Initial position:', initialPosition.x.toFixed(2), initialPosition.y.toFixed(2), initialPosition.z.toFixed(2))
    
    setCustomAsteroids(prev => [...prev, asteroid])
    
    if (!scene) {
      console.error('  ❌ Scene is null! Cannot add asteroid to 3D scene')
      return
    }
    
    // Create mesh
    const mesh = createAsteroidMesh(asteroid)
    
    // CRITICAL FIX: Set position immediately!
    mesh.position.copy(initialPosition)
    
    // Force visibility
    mesh.visible = true
    mesh.frustumCulled = false
    
    const glow = createAsteroidGlow(asteroid)
    // Make glow more visible
    const glowMaterial = glow.material as THREE.MeshBasicMaterial
    glowMaterial.opacity = 0.6
    glow.scale.set(2, 2, 2)
    mesh.add(glow)
    
    // Initialize trail points with starting position
    const trailPoints: THREE.Vector3[] = [initialPosition.clone()]
    trailPointsRef.current.set(asteroid.id, trailPoints)
    
    // Create trail
    const trail = createAsteroidTrail(asteroid, trailPoints)
    trail.visible = true
    
    scene.add(mesh)
    scene.add(trail)
    
    console.log('  ✅ Mesh added at:', mesh.position.x.toFixed(2), mesh.position.y.toFixed(2), mesh.position.z.toFixed(2))
    console.log('  ✅ Total scene children:', scene.children.length)
    
    asteroidMeshesRef.current.set(asteroid.id, {
      id: asteroid.id,
      mesh,
      trail,
      glow,
      data: asteroid,
    })
  }, [scene, simulationTime])

  // Remove asteroid
  const removeAsteroid = useCallback((asteroidId: string) => {
    setCustomAsteroids(prev => prev.filter(a => a.id !== asteroidId))
    
    if (scene) {
      const asteroidMesh = asteroidMeshesRef.current.get(asteroidId)
      if (asteroidMesh) {
        scene.remove(asteroidMesh.mesh)
        if (asteroidMesh.trail) scene.remove(asteroidMesh.trail)
        if (asteroidMesh.glow) asteroidMesh.glow.geometry.dispose()
        asteroidMesh.mesh.geometry.dispose()
        ;(asteroidMesh.mesh.material as THREE.Material).dispose()
        asteroidMeshesRef.current.delete(asteroidId)
      }
      
      trailPointsRef.current.delete(asteroidId)
    }
  }, [scene])

  // Update asteroid positions and check for collisions
  const updateAsteroids = useCallback((deltaTime: number) => {
    if (!scene) return

    customAsteroids.forEach(asteroid => {
      if (asteroid.impacted) return

      // Calculate new position using Kepler's equations
      const newPosition = calculateAsteroidPosition(asteroid, simulationTime)
      
      // Update asteroid data
      asteroid.position.copy(newPosition)
      
      // Calculate velocity (approximate from position change)
      const asteroidMesh = asteroidMeshesRef.current.get(asteroid.id)
      if (asteroidMesh) {
        const oldPos = asteroidMesh.mesh.position.clone()
        asteroidMesh.mesh.position.copy(newPosition)
        
        // Update velocity
        asteroid.velocity.copy(newPosition.clone().sub(oldPos).divideScalar(deltaTime))
        
        // Update trail
        const trailPoints = trailPointsRef.current.get(asteroid.id) || []
        trailPoints.push(newPosition.clone())
        
        // Keep last 50 points
        if (trailPoints.length > 50) {
          trailPoints.shift()
        }
        
        // Update trail geometry
        if (asteroidMesh.trail && asteroid.trailEnabled) {
          asteroidMesh.trail.geometry.setFromPoints(trailPoints)
        }
      }

      // Check collisions with planets
      planets.forEach(planet => {
        if (checkCollision(newPosition, asteroid.size, planet.position, planet.size)) {
          // IMPACT!
          asteroid.impacted = true
          
          const impactEnergy = calculateImpactEnergy(asteroid.mass, asteroid.velocity)
          
          const impactEvent: ImpactEvent = {
            asteroidId: asteroid.id,
            asteroidName: asteroid.name,
            targetPlanet: planet.name,
            impactPosition: newPosition.clone(),
            impactVelocity: asteroid.velocity.length(),
            impactEnergy,
            timestamp: Date.now(),
          }
          
          setImpactEvents(prev => [...prev, impactEvent])
          
          // Create explosion effect
          const explosion = createImpactExplosion(
            newPosition,
            asteroid.color,
            asteroid.size * 2
          )
          scene.add(explosion)
          explosionsRef.current.push(explosion)
          
          // Create shockwave
          const shockwave = createShockwave(
            planet.position,
            planet.size,
            asteroid.color
          )
          scene.add(shockwave)
          shockwavesRef.current.push(shockwave)
          
          // Remove asteroid after short delay
          setTimeout(() => {
            removeAsteroid(asteroid.id)
          }, 500)
        }
      })
    })

    // Update explosions
    explosionsRef.current = explosionsRef.current.filter(explosion => {
      const finished = updateExplosion(explosion, deltaTime)
      if (finished) {
        scene.remove(explosion)
        explosion.geometry.dispose()
        ;(explosion.material as THREE.Material).dispose()
        return false
      }
      return true
    })

    // Update shockwaves
    shockwavesRef.current = shockwavesRef.current.filter(shockwave => {
      const planet = planets.find(p => p.position.equals(shockwave.position))
      if (!planet) return false
      
      const finished = updateShockwave(shockwave, planet.size, deltaTime)
      if (finished) {
        scene.remove(shockwave)
        shockwave.geometry.dispose()
        ;(shockwave.material as THREE.Material).dispose()
        return false
      }
      return true
    })
  }, [customAsteroids, planets, simulationTime, scene, removeAsteroid])

  // Predict future impacts
  const updateImpactPredictions = useCallback(() => {
    const predictions: Array<{
      asteroidId: string
      planetName: string
      timeToImpact: number
    }> = []

    customAsteroids.forEach(asteroid => {
      if (asteroid.impacted) return

      planets.forEach(planet => {
        const timeToImpact = calculateTimeToImpact(
          asteroid,
          planet.position,
          planet.size,
          simulationTime,
          5000 // Check next 5000 time units
        )

        if (timeToImpact !== null) {
          predictions.push({
            asteroidId: asteroid.id,
            planetName: planet.name,
            timeToImpact,
          })
        }
      })
    })

    setImpactPredictions(predictions)
  }, [customAsteroids, planets, simulationTime])

  // Update predictions periodically
  useEffect(() => {
    const interval = setInterval(updateImpactPredictions, 1000)
    return () => clearInterval(interval)
  }, [updateImpactPredictions])

  // Get trajectory for visualization
  const getAsteroidTrajectory = useCallback((asteroidId: string, duration: number = 1000) => {
    const asteroid = customAsteroids.find(a => a.id === asteroidId)
    if (!asteroid) return []

    return predictTrajectory(asteroid, simulationTime, duration, 50)
  }, [customAsteroids, simulationTime])

  return {
    // State
    customAsteroids,
    impactEvents,
    impactPredictions,
    
    // Actions
    addAsteroid,
    removeAsteroid,
    updateAsteroids,
    getAsteroidTrajectory,
    
    // Data
    asteroidCount: customAsteroids.length,
    impactCount: impactEvents.length,
  }
}
