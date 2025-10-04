/**
 * NASA NEO (Near-Earth Object) API Integration
 * Fetches real asteroid data from NASA's public API
 * 
 * API Documentation: https://api.nasa.gov/
 * Get your free API key at: https://api.nasa.gov/
 * 
 * Note: DEMO_KEY has rate limits (30 requests/hour, 50/day)
 * For production, set NEXT_PUBLIC_NASA_API_KEY in your .env.local file
 */

export interface NeoData {
  id: string
  name: string
  diameter: {
    min: number // km
    max: number // km
    estimated: number // km
  }
  velocity: number // km/s
  missDistance: number // km
  isPotentiallyHazardous: boolean
  closeApproachDate: string
  absoluteMagnitude: number
}

/**
 * Fetch Near-Earth Objects from NASA API
 * @param startDate - Optional start date (YYYY-MM-DD format)
 * @param endDate - Optional end date (YYYY-MM-DD format)
 * @returns Array of near-Earth objects
 */
export async function fetchNearEarthObjects(startDate?: string, endDate?: string): Promise<NeoData[]> {
  try {
    // Use environment variable if available, otherwise fallback to DEMO_KEY
    // DEMO_KEY has limited rate limits - get your own key at https://api.nasa.gov/
    const API_KEY = process.env.NEXT_PUBLIC_NASA_API_KEY || "DEMO_KEY"

    // Warn developers if using DEMO_KEY in development
    if (API_KEY === "DEMO_KEY" && process.env.NODE_ENV === "development") {
      console.warn(
        "[NASA API] Using DEMO_KEY with limited rate limits. Get a free API key at https://api.nasa.gov/ and set NEXT_PUBLIC_NASA_API_KEY in .env.local"
      )
    }

    // Default to current week if no dates provided
    const start = startDate || new Date().toISOString().split("T")[0]
    const end = endDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]

    const url = `https://api.nasa.gov/neo/rest/v1/feed?start_date=${start}&end_date=${end}&api_key=${API_KEY}`

    const response = await fetch(url)

    if (!response.ok) {
      if (process.env.NODE_ENV === "development") {
        console.warn(`[NASA API] Failed to fetch NEO data: ${response.status} ${response.statusText}`)
      }
      return []
    }

    const data = await response.json()

    // Parse and transform the data
    const asteroids: NeoData[] = []

    Object.values(data.near_earth_objects).forEach((dateGroup: any) => {
      dateGroup.forEach((neo: any) => {
        const closeApproach = neo.close_approach_data[0]
        const diameterData = neo.estimated_diameter.kilometers

        asteroids.push({
          id: neo.id,
          name: neo.name.replace(/[()]/g, ""),
          diameter: {
            min: diameterData.estimated_diameter_min,
            max: diameterData.estimated_diameter_max,
            estimated: (diameterData.estimated_diameter_min + diameterData.estimated_diameter_max) / 2,
          },
          velocity: Number.parseFloat(closeApproach.relative_velocity.kilometers_per_second),
          missDistance: Number.parseFloat(closeApproach.miss_distance.kilometers),
          isPotentiallyHazardous: neo.is_potentially_hazardous_asteroid,
          closeApproachDate: closeApproach.close_approach_date,
          absoluteMagnitude: neo.absolute_magnitude_h,
        })
      })
    })

    // Sort by close approach date
    asteroids.sort((a, b) => new Date(a.closeApproachDate).getTime() - new Date(b.closeApproachDate).getTime())

    return asteroids
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("[NASA API] Error fetching Near-Earth Objects:", error)
    }
    return []
  }
}

/**
 * Get specific asteroid details by ID
 * @param asteroidId - NASA asteroid identifier
 * @returns Detailed asteroid data or null if not found
 */
export async function fetchAsteroidById(asteroidId: string): Promise<NeoData | null> {
  try {
    const API_KEY = process.env.NEXT_PUBLIC_NASA_API_KEY || "DEMO_KEY"
    const url = `https://api.nasa.gov/neo/rest/v1/neo/${asteroidId}?api_key=${API_KEY}`

    const response = await fetch(url)

    if (!response.ok) {
      if (process.env.NODE_ENV === "development") {
        console.warn(`[NASA API] Failed to fetch asteroid ${asteroidId}: ${response.status}`)
      }
      return null
    }

    const neo = await response.json()
    const closeApproach = neo.close_approach_data[0]
    const diameterData = neo.estimated_diameter.kilometers

    return {
      id: neo.id,
      name: neo.name.replace(/[()]/g, ""),
      diameter: {
        min: diameterData.estimated_diameter_min,
        max: diameterData.estimated_diameter_max,
        estimated: (diameterData.estimated_diameter_min + diameterData.estimated_diameter_max) / 2,
      },
      velocity: Number.parseFloat(closeApproach.relative_velocity.kilometers_per_second),
      missDistance: Number.parseFloat(closeApproach.miss_distance.kilometers),
      isPotentiallyHazardous: neo.is_potentially_hazardous_asteroid,
      closeApproachDate: closeApproach.close_approach_date,
      absoluteMagnitude: neo.absolute_magnitude_h,
    }
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error(`[NASA API] Error fetching asteroid ${asteroidId}:`, error)
    }
    return null
  }
}
