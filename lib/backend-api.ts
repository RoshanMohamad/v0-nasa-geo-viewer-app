/**
 * 🐍 Backend API Integration
 * 
 * Connect Next.js frontend to Python Flask backend for asteroid persistence
 */

import type { CelestialBody } from './orbital-mechanics'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

// ============================================================================
// ASTEROID CRUD OPERATIONS
// ============================================================================

export async function saveAsteroidToBackend(asteroid: CelestialBody) {
  try {
    const response = await fetch(`${API_BASE}/asteroids`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(asteroid)
    })
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error('Failed to save asteroid:', error)
    throw error
  }
}

export async function loadAsteroidsFromBackend(): Promise<CelestialBody[]> {
  try {
    const response = await fetch(`${API_BASE}/asteroids`)
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    const data = await response.json()
    return data.success ? data.data : []
  } catch (error) {
    console.error('Failed to load asteroids:', error)
    return []
  }
}

export async function getAsteroidById(id: string): Promise<CelestialBody | null> {
  try {
    const response = await fetch(`${API_BASE}/asteroids/${id}`)
    
    if (!response.ok) {
      if (response.status === 404) return null
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    const data = await response.json()
    return data.success ? data.data : null
  } catch (error) {
    console.error('Failed to get asteroid:', error)
    return null
  }
}

export async function updateAsteroidInBackend(id: string, updates: Partial<CelestialBody>) {
  try {
    const response = await fetch(`${API_BASE}/asteroids/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    })
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error('Failed to update asteroid:', error)
    throw error
  }
}

export async function deleteAsteroidFromBackend(id: string) {
  try {
    const response = await fetch(`${API_BASE}/asteroids/${id}`, {
      method: 'DELETE'
    })
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error('Failed to delete asteroid:', error)
    throw error
  }
}

export async function searchAsteroids(criteria: {
  name?: string
  type?: string
  composition?: string
  minDistance?: number
  maxDistance?: number
}): Promise<CelestialBody[]> {
  try {
    const response = await fetch(`${API_BASE}/asteroids/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(criteria)
    })
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    const data = await response.json()
    return data.success ? data.data : []
  } catch (error) {
    console.error('Failed to search asteroids:', error)
    return []
  }
}

// ============================================================================
// SIMULATION SESSIONS
// ============================================================================

export interface SimulationSession {
  id?: string
  name: string
  description?: string
  asteroids: any[]
  customObjects: CelestialBody[]
  settings?: {
    timeSpeed?: number
    simulationDate?: string
    [key: string]: any
  }
  timestamp?: string
}

export async function saveSimulation(simulation: SimulationSession) {
  try {
    const response = await fetch(`${API_BASE}/simulations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(simulation)
    })
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error('Failed to save simulation:', error)
    throw error
  }
}

export async function loadSimulations(): Promise<SimulationSession[]> {
  try {
    const response = await fetch(`${API_BASE}/simulations`)
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    const data = await response.json()
    return data.success ? data.data : []
  } catch (error) {
    console.error('Failed to load simulations:', error)
    return []
  }
}

export async function loadSimulation(id: string): Promise<SimulationSession | null> {
  try {
    const response = await fetch(`${API_BASE}/simulations/${id}`)
    
    if (!response.ok) {
      if (response.status === 404) return null
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    const data = await response.json()
    return data.success ? data.data : null
  } catch (error) {
    console.error('Failed to load simulation:', error)
    return null
  }
}

export async function deleteSimulation(id: string) {
  try {
    const response = await fetch(`${API_BASE}/simulations/${id}`, {
      method: 'DELETE'
    })
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error('Failed to delete simulation:', error)
    throw error
  }
}

// ============================================================================
// NASA HORIZONS PROXY
// ============================================================================

export async function fetchNASADataViaProxy(target: string) {
  try {
    const response = await fetch(`${API_BASE}/nasa-horizons/${encodeURIComponent(target)}`)
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    const data = await response.json()
    return data.success ? data.data : null
  } catch (error) {
    console.error('Failed to fetch NASA data:', error)
    throw error
  }
}

// ============================================================================
// STATISTICS
// ============================================================================

export async function getBackendStatistics() {
  try {
    const response = await fetch(`${API_BASE}/stats`)
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    const data = await response.json()
    return data.success ? data.data : null
  } catch (error) {
    console.error('Failed to get statistics:', error)
    return null
  }
}

// ============================================================================
// HEALTH CHECK
// ============================================================================

export async function checkBackendHealth(): Promise<boolean> {
  try {
    // Create an AbortController with timeout for better compatibility
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 2000) // 2 second timeout
    
    const response = await fetch(`${API_BASE}/health`, { 
      method: 'GET',
      signal: controller.signal
    })
    
    clearTimeout(timeoutId)
    return response.ok
  } catch (error) {
    console.warn('Backend health check failed:', error)
    return false
  }
}

// ============================================================================
// BATCH OPERATIONS
// ============================================================================

export async function saveMultipleAsteroids(asteroids: CelestialBody[]) {
  const results = await Promise.allSettled(
    asteroids.map(asteroid => saveAsteroidToBackend(asteroid))
  )
  
  const succeeded = results.filter(r => r.status === 'fulfilled').length
  const failed = results.filter(r => r.status === 'rejected').length
  
  return { succeeded, failed, total: asteroids.length }
}

export async function deleteMultipleAsteroids(ids: string[]) {
  const results = await Promise.allSettled(
    ids.map(id => deleteAsteroidFromBackend(id))
  )
  
  const succeeded = results.filter(r => r.status === 'fulfilled').length
  const failed = results.filter(r => r.status === 'rejected').length
  
  return { succeeded, failed, total: ids.length }
}
