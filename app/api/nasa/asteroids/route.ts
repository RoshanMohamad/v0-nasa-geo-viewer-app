/**
 * NASA Asteroids API Backend Route
 * Handles NASA API calls server-side to protect API keys
 */

import { NextRequest, NextResponse } from 'next/server'
import { fetchNearEarthObjects, fetchAsteroidById } from '@/lib/nasa-neo-api'
import { fetchRealAsteroid, ASTEROID_PRESETS } from '@/lib/nasa-horizons-api'

// GET /api/nasa/asteroids - Fetch near-Earth objects
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const startDate = searchParams.get('startDate') || undefined
    const endDate = searchParams.get('endDate') || undefined
    const asteroidId = searchParams.get('id')
    const presetKey = searchParams.get('preset')

    // Fetch specific asteroid by ID
    if (asteroidId) {
      const asteroid = await fetchAsteroidById(asteroidId)
      if (!asteroid) {
        return NextResponse.json(
          { error: 'Asteroid not found' },
          { status: 404 }
        )
      }
      return NextResponse.json(asteroid)
    }

    // Fetch real asteroid from Horizons API
    if (presetKey) {
      const validPresets = Object.keys(ASTEROID_PRESETS)
      if (!validPresets.includes(presetKey)) {
        return NextResponse.json(
          { error: 'Invalid preset key', validKeys: validPresets },
          { status: 400 }
        )
      }

      console.log(`🛰️ Fetching NASA Horizons data for: ${presetKey}`)
      const celestialBody = await fetchRealAsteroid(presetKey as keyof typeof ASTEROID_PRESETS)
      
      if (!celestialBody) {
        return NextResponse.json(
          { error: 'Failed to fetch asteroid from NASA Horizons' },
          { status: 500 }
        )
      }

      console.log(`✅ Successfully fetched: ${celestialBody.name}`)
      return NextResponse.json(celestialBody)
    }

    // Fetch near-Earth objects for date range
    const asteroids = await fetchNearEarthObjects(startDate, endDate)
    
    return NextResponse.json({
      count: asteroids.length,
      startDate: startDate || 'today',
      endDate: endDate || '+7 days',
      asteroids,
    })
  } catch (error) {
    console.error('NASA API Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch asteroid data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// POST /api/nasa/asteroids - Create custom asteroid with NASA data
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { presetKey, customParams } = body

    if (presetKey) {
      // Fetch real asteroid from NASA
      const celestialBody = await fetchRealAsteroid(presetKey as keyof typeof ASTEROID_PRESETS)
      
      if (!celestialBody) {
        return NextResponse.json(
          { error: 'Failed to create asteroid from NASA data' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        asteroid: celestialBody,
      })
    }

    if (customParams) {
      // Create custom asteroid with provided parameters
      return NextResponse.json({
        success: true,
        asteroid: {
          id: `custom-${Date.now()}`,
          ...customParams,
        },
      })
    }

    return NextResponse.json(
      { error: 'Missing presetKey or customParams' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Create asteroid error:', error)
    return NextResponse.json(
      { error: 'Failed to create asteroid', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
