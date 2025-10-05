# 🚀 NASA API Integration Guide

## Overview

This guide explains how the custom asteroid system connects to NASA APIs and the backend for real-time asteroid data.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React/Next.js)                │
│                                                             │
│  ┌──────────────────────┐      ┌────────────────────────┐ │
│  │ Asteroid Control     │      │   Solar System 3D      │ │
│  │ Panel (UI)           │──────▶   (Three.js)           │ │
│  │  - Quick Add Buttons │      │  - Kepler Orbits       │ │
│  │  - Custom Creator    │      │  - Red Orbit Paths     │ │
│  │  - NASA Tab          │      │  - Rotation Animation  │ │
│  └──────────────────────┘      └────────────────────────┘ │
│            │                                                │
│            │ API Calls                                      │
│            ▼                                                │
└─────────────────────────────────────────────────────────────┘
             │
             │ HTTP Request
             ▼
┌─────────────────────────────────────────────────────────────┐
│                Backend API (Next.js Route)                  │
│                /app/api/nasa/asteroids/route.ts             │
│                                                             │
│  GET  /api/nasa/asteroids?preset=apophis                   │
│  POST /api/nasa/asteroids (create custom)                  │
│                                                             │
│  Features:                                                  │
│  ✅ Server-side API key protection                          │
│  ✅ Error handling and fallbacks                            │
│  ✅ Data transformation                                      │
│  ✅ Rate limiting protection                                 │
└─────────────────────────────────────────────────────────────┘
             │
             │ External API Calls
             ▼
┌─────────────────────────────────────────────────────────────┐
│                    NASA External APIs                       │
│                                                             │
│  ┌────────────────────────┐   ┌─────────────────────────┐ │
│  │  NASA Horizons API     │   │  NASA NEO API           │ │
│  │  (JPL Solar System)    │   │  (Near-Earth Objects)   │ │
│  │                        │   │                         │ │
│  │  • Orbital elements    │   │  • Asteroid database    │ │
│  │  • State vectors       │   │  • Close approaches     │ │
│  │  • Real trajectories   │   │  • Hazard assessment    │ │
│  └────────────────────────┘   └─────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## API Endpoints

### 1. Backend API Routes

#### GET /api/nasa/asteroids

Fetch asteroid data from NASA.

**Query Parameters:**
- `preset` (string): Predefined asteroid key (e.g., "apophis", "bennu")
- `id` (string): NASA asteroid ID for NEO API
- `startDate` (string): Start date for NEO search (YYYY-MM-DD)
- `endDate` (string): End date for NEO search (YYYY-MM-DD)

**Examples:**

```typescript
// Fetch real asteroid from NASA Horizons
const response = await fetch('/api/nasa/asteroids?preset=apophis')
const asteroid = await response.json()
// Returns: CelestialBody with real orbital elements

// Fetch near-Earth objects for next week
const response = await fetch('/api/nasa/asteroids?startDate=2025-10-05&endDate=2025-10-12')
const { asteroids, count } = await response.json()
```

#### POST /api/nasa/asteroids

Create custom asteroid with NASA data or custom parameters.

**Request Body:**
```typescript
{
  "presetKey": "apophis",  // Fetch from NASA
  // OR
  "customParams": {        // Create custom asteroid
    "name": "My Asteroid",
    "orbitalElements": { ... }
  }
}
```

**Response:**
```typescript
{
  "success": true,
  "asteroid": CelestialBody
}
```

### 2. NASA External APIs

#### NASA Horizons API
- **URL:** `https://ssd.jpl.nasa.gov/api/horizons.api`
- **Purpose:** Precise orbital data for known objects
- **Authentication:** None required (public API)
- **Rate Limits:** Generous (suitable for production)

**Data Returned:**
- State vectors (position & velocity)
- Orbital elements (converted)
- Precise ephemerides

#### NASA NEO API
- **URL:** `https://api.nasa.gov/neo/rest/v1/`
- **Purpose:** Near-Earth Object database
- **Authentication:** API key required
- **Rate Limits:** 
  - DEMO_KEY: 30/hour, 50/day
  - Personal key: 1000/hour

**Data Returned:**
- Close approach dates
- Estimated diameters
- Potentially hazardous classification
- Velocity and miss distance

## Frontend Integration

### Quick Add Buttons with API

The quick-add buttons in Asteroid Control Panel now support API integration:

```typescript
// Belt Asteroid - Uses local Kepler calculation (fast)
<Button onClick={() => {
  const asteroid = createCustomAsteroidObject({
    name: `Asteroid-${Date.now()}`,
    distanceAU: 2.2 + Math.random() * 0.8,
    eccentricity: Math.random() * 0.3,
    type: 'asteroid'
  })
  onAddCustomObject(asteroid)
}}>
  Belt Asteroid
</Button>

// NASA Asteroid - Fetches real data from backend API
<Button onClick={() => handleAddNASAAsteroid('apophis')}>
  99942 Apophis (NASA)
</Button>
```

### API Call Flow

```typescript
const handleAddNASAAsteroid = async (presetKey: string) => {
  setIsLoadingNASA(true)
  
  try {
    // 1. Call backend API
    const response = await fetch(`/api/nasa/asteroids?preset=${presetKey}`)
    
    // 2. Parse response
    const celestialBody: CelestialBody = await response.json()
    
    // 3. Add to solar system (triggers animation)
    onAddCustomObject(celestialBody)
    
    // 4. Show success notification
    alert(`✅ Added NASA Asteroid: ${celestialBody.name}!`)
  } catch (error) {
    // 5. Fallback to approximate data
    console.error('Failed to fetch NASA data:', error)
    onAddRealAsteroid(presetKey) // Use local fallback
  } finally {
    setIsLoadingNASA(false)
  }
}
```

## Solar System Animation Integration

When an asteroid is added (via API or quick-add), the solar system automatically:

1. **Creates 3D Mesh** (lines 668-830 in solar-system.tsx)
   - Loads custom texture (`esteroids.jpg`)
   - Applies high-detail geometry
   - Sets composition-based materials

2. **Generates Red Orbit Path** (lines 876-930)
   - Uses Kepler's equation: `r = a(1-e²)/(1+e·cos(θ))`
   - Applies 3D rotations (inclination, nodes, perihelion)
   - 256 points for smooth ellipse
   - **RED color** (`0xff0000`) for visibility

3. **Starts Animation** (lines 933-985)
   - Calculates position using `calculateOrbitalPosition()`
   - Updates every frame (60 FPS)
   - Tumbling rotation for asteroids
   - Tail orientation for comets

## Configuration

### Environment Variables

Create `.env.local`:

```bash
# NASA API Key (get from https://api.nasa.gov/)
NEXT_PUBLIC_NASA_API_KEY=your_key_here

# Optional: Backend authentication
API_SECRET_KEY=your_secret_key
```

### Available NASA Asteroids

Predefined asteroids with real orbital data:

```typescript
ASTEROID_PRESETS = {
  apophis: '99942 Apophis',       // Near-Earth, 2029 close approach
  bennu: '101955 Bennu',           // OSIRIS-REx target
  eros: '433 Eros',                // First orbited asteroid
  ryugu: '162173 Ryugu',           // Hayabusa2 target
  vesta: '4 Vesta',                // Visited by Dawn spacecraft
  ceres: '1 Ceres',                // Largest asteroid, dwarf planet
  halley: "1P/Halley",             // Famous comet
  oumuamua: "1I/'Oumuamua",        // Interstellar object
}
```

## Error Handling

### API Failures

The system has multiple fallback layers:

```typescript
try {
  // 1. Try backend API (with NASA Horizons)
  const asteroid = await fetch('/api/nasa/asteroids?preset=apophis')
} catch (backendError) {
  try {
    // 2. Try direct NASA API call (fallback)
    const asteroid = await fetchRealAsteroid('apophis')
  } catch (nasaError) {
    // 3. Use approximate orbital elements (hardcoded)
    const asteroid = getApproximateOrbitalElements('apophis')
  }
}
```

### Rate Limiting

Backend protects against rate limits:

```typescript
// Check rate limit before calling NASA
if (requestCount > MAX_REQUESTS_PER_HOUR) {
  // Use cached data or fallback
  return getCachedAsteroid(presetKey)
}
```

## Testing

### Test Backend API

```bash
# Test NASA Horizons integration
curl "http://localhost:3000/api/nasa/asteroids?preset=apophis"

# Test NEO API
curl "http://localhost:3000/api/nasa/asteroids?startDate=2025-10-05&endDate=2025-10-12"
```

### Test Frontend Buttons

1. Open app: `pnpm dev`
2. Navigate to Asteroid Control Panel
3. Click "Quick" tab → Test quick-add buttons (instant)
4. Click "Custom" → "NASA" tab → Test NASA buttons (2-3 seconds)
5. Watch console for API logs

### Expected Console Output

```
🛰️ Calling backend API for NASA asteroid: apophis
✅ Received NASA asteroid data: { id: 'asteroid-apophis', name: '99942 Apophis', ... }
✅ Created enhanced mesh for 99942 Apophis (ID: asteroid-apophis)
✅ Created orbit path for 99942 Apophis
  📐 Semi-major axis: 0.92 AU (25.8 scene units)
  📏 Eccentricity: 0.191 (0=circle, 1=line)
  📊 Inclination: 3.3°
  🎨 Orbit color: ff0000
```

## Performance Optimization

### Caching

Backend API can cache NASA responses:

```typescript
// Cache NASA data for 24 hours
const cache = new Map()
const CACHE_TTL = 24 * 60 * 60 * 1000

if (cache.has(presetKey)) {
  const { data, timestamp } = cache.get(presetKey)
  if (Date.now() - timestamp < CACHE_TTL) {
    return data // Return cached
  }
}
```

### Lazy Loading

Load NASA data on-demand:

```typescript
// Only fetch when NASA tab is opened
<Tabs onValueChange={(tab) => {
  if (tab === 'nasa' && !nasaDataLoaded) {
    preloadNASAData()
  }
}}>
```

## Troubleshooting

### "Failed to fetch NASA data"

**Possible causes:**
1. API key missing or invalid
2. Rate limit exceeded
3. NASA API temporarily down
4. Network connectivity issue

**Solutions:**
1. Check `.env.local` has valid API key
2. Wait for rate limit reset (1 hour)
3. System automatically uses fallback data
4. Check browser console for detailed error

### "Asteroid not visible in solar system"

**Possible causes:**
1. Orbit path created but asteroid off-screen
2. Scale mode issue (realistic vs visual)
3. Orbital parameters invalid

**Solutions:**
1. Zoom out to see full orbit
2. Check semi-major axis is reasonable (0.5-50 AU)
3. Verify eccentricity < 1.0
4. Open browser console for creation logs

### "Red orbit path not showing"

**Possible causes:**
1. Custom object not added to `customObjects` array
2. Orbit creation code not triggered
3. Color value incorrect

**Solutions:**
1. Verify `onAddCustomObject` callback working
2. Check console for "Created orbit path" log
3. Ensure `orbitColor = 0xff0000` (bright red)

## Next Steps

### Extend API Integration

1. **Real-time updates:** WebSocket for live asteroid tracking
2. **Collision detection:** API endpoint to check Earth impacts
3. **Historical data:** Query past orbital positions
4. **Batch operations:** Add multiple asteroids at once
5. **User uploads:** Allow custom orbital element files

### Database Integration

```typescript
// Save user's custom asteroids
POST /api/asteroids/save
{
  "userId": "user123",
  "asteroids": [...]
}

// Load saved asteroids
GET /api/asteroids/load?userId=user123
```

## Summary

✅ **Backend API** routes created at `/app/api/nasa/asteroids/route.ts`
✅ **Frontend integration** in Asteroid Control Panel
✅ **NASA Horizons API** connected for real orbital data
✅ **NASA NEO API** available for near-Earth objects
✅ **Error handling** with fallbacks at multiple levels
✅ **Red orbit paths** automatically created for all custom asteroids
✅ **Kepler animations** running at 60 FPS with real physics
✅ **Environment variables** configured for API keys
✅ **Loading states** and user feedback implemented

The system is now fully connected! Click any button in the Asteroid Control Panel and watch real asteroids appear with accurate Kepler orbits in bright red! 🚀🔴
