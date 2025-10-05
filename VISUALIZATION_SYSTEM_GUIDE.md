# Impact Analysis - Graphical Visualization System

## Overview
The impact analysis page now features comprehensive 3D graphical visualizations showing orbital mechanics and surface impact scenarios in real-time using Three.js WebGL rendering.

## Visualization Components

### 1. Orbital Intersection - Top View
**File:** `components/orbital-intersection-viewer.tsx`

#### Features
- **Top-down perspective** of the solar system showing Sun, Earth, and asteroid orbits
- **Real-time orbital animation** with accurate Kepler mechanics
- **Color-coded orbits:**
  - 🔵 **Blue**: Earth's orbit (circular, 1.0 AU)
  - 🔴 **Red**: Asteroid orbit (elliptical, custom parameters)
  - 🟡 **Yellow markers**: Intersection points where orbits cross

#### Orbital Calculations
Uses authentic orbital mechanics:
```typescript
r = (a * (1 - e²)) / (1 + e * cos(θ))
```

3D transformation with inclination and nodes:
```typescript
x = x_orb * (cos(Ω) * cos(ω) - sin(Ω) * sin(ω) * cos(i)) - y_orb * (...)
y = y_orb * sin(ω) * sin(i) + x_orb * cos(ω) * sin(i)
z = x_orb * (sin(Ω) * cos(ω) + cos(Ω) * sin(ω) * cos(i)) - y_orb * (...)
```

Where:
- `a` = semi-major axis (AU)
- `e` = eccentricity
- `i` = inclination (radians)
- `Ω` = longitude of ascending node (radians)
- `ω` = argument of perihelion (radians)
- `θ` = true anomaly (radians)

#### Interactive Controls
- **Left-click + drag**: Rotate view
- **Right-click + drag**: Pan view
- **Scroll wheel**: Zoom in/out
- **Auto-rotation**: Bodies orbit in real-time

#### Visual Elements
1. **Sun** - Central yellow sphere with glow effect
2. **Earth** - Blue sphere orbiting at 1 AU
3. **Asteroid** - Red sphere following elliptical orbit
4. **Orbit paths** - Continuous lines showing full orbital trajectories
5. **Labels** - Sprite-based text showing object names
6. **Grid** - Reference grid for scale
7. **Axes** - RGB axes (X=red, Y=green, Z=blue)
8. **Stars** - Background starfield (1000 points)

#### Intersection Detection
Automatically calculates and marks points where the asteroid orbit crosses Earth's orbital plane:
```typescript
distance = sqrt(x² + z²)
if (|distance - 1.0| < 0.05) {
  // Mark intersection point
}
```

---

### 2. Surface Impact - Side View
**File:** `components/surface-impact-viewer.tsx`

#### Features
- **Side-view perspective** showing asteroid approaching Earth's surface
- **Realistic crater formation** based on impact physics
- **Ejecta field** with scattered debris
- **Impact trajectory** with velocity vector
- **Explosion animation** with pulsing shockwaves

#### Visual Elements

##### 1. **Terrain**
- Procedurally generated ground plane with random elevation noise
- Brown rocky material (color: 0x8B7355)
- Size: Scales to max(ejecta radius × 4, crater diameter × 5, 500 km)

##### 2. **Impact Crater**
- **Geometry**: Inverted cylinder (bowl shape)
- **Dimensions**:
  - Top radius: 30% of crater diameter
  - Bottom radius: 100% of crater diameter
  - Depth: From impact analysis calculations
- **Material**: Dark brown (0x654321) with rough surface

##### 3. **Crater Rim**
- Raised torus (ring) around crater edge
- Height: 10% of crater depth
- Radius: Matches crater diameter
- Lighter brown color (0x9B7653)

##### 4. **Ejecta Field**
- 200 randomly scattered rocks
- Sizes: 5-25 meters
- Distribution: From crater rim to ejecta radius
- Dodecahedron geometry for irregular shape
- Random rotation for natural appearance

##### 5. **Asteroid**
- **Geometry**: Icosahedron (irregular sphere)
- **Position**: Incoming at 45° angle above impact site
- **Animation**: Continuous rotation (x: 0.005, y: 0.003 rad/frame)
- **Material**: Dark gray (0x444444) rocky surface

##### 6. **Impact Trajectory**
- Red dashed line showing approach path
- 20-segment curve from high altitude to ground zero
- Arrow helper showing velocity vector direction

##### 7. **Explosion Effect**
- Orange sphere at impact point (0xff6600)
- **Pulsing animation**: Scales between 1.0× and 1.5× continuously
- Semi-transparent (opacity: 0.6)

##### 8. **Shockwave Rings**
- 3 concentric rings expanding from impact
- Orange/yellow gradient (0xffaa00)
- **Expanding animation**: Scales 1.0× to 2.0×, then resets
- Fading opacity as they expand

##### 9. **Labels**
- **Crater size**: Yellow text showing diameter in km
- **Asteroid name**: Red text above asteroid
- **Impact velocity**: Orange text along trajectory (km/s)

#### Physics-Based Calculations

All dimensions are calculated from real impact physics:

```typescript
// Crater diameter (km)
D = 1.8 × ρ^(-1/3) × L^(0.78) × (1 + v²)^(1/3)

// Crater depth (km)
d = D / 5

// Ejecta radius (km)
R_ejecta = 3 × D
```

Where:
- `ρ` = impactor density (kg/m³)
- `L` = impactor diameter (m)
- `v` = impact velocity (km/s)

#### Camera Positioning
- **Distance**: Adaptive based on crater size
  - `viewDistance = max(crater × 3, asteroid × 10, 100)`
- **Position**: (0.7×d, 0.5×d, 0.7×d) for optimal side view
- **LookAt**: Center of impact (0, 0, 0)

#### Lighting
- **Ambient**: Soft white light (0.4 intensity) for overall illumination
- **Directional**: Sun-like light from (100, 200, 100)
  - Shadow casting enabled
  - PCF soft shadows (2048×2048 map)
- **Sky**: Gradient background (sky blue to light blue)

---

## Integration in Impact Analysis Page

### Location
`app/impact-analysis/page.tsx` - Visualization Tab

### Layout
Two-column grid on large screens:
```tsx
<div className="grid lg:grid-cols-2 gap-6">
  <Card> {/* Orbital Intersection */} </Card>
  <Card> {/* Surface Impact */} </Card>
</div>
```

### Data Flow
```typescript
// Get object from URL params
const object: CelestialBody = JSON.parse(decodeURIComponent(searchParams.get('object')))

// Calculate impact analysis
const analysis: ImpactAnalysis = calculateImpactProbability(object, earthOrbit)

// Pass to visualizations
<OrbitalIntersectionViewer
  asteroidOrbit={object.orbitalElements}
  asteroidName={object.name}
  viewType="top"
/>

<SurfaceImpactViewer
  asteroidRadius={object.radius}
  impactVelocity={object.orbitalElements.velocity || 20}
  craterDiameter={analysis.craterDiameter}
  craterDepth={analysis.craterDepth}
  ejectaRadius={analysis.ejectaRadius}
  asteroidName={object.name}
/>
```

### Performance Optimization
- **Adaptive detail**: Geometry complexity scales with object size
- **Efficient rendering**: 60 FPS target with requestAnimationFrame
- **Resource cleanup**: Proper disposal of Three.js resources on unmount
- **Responsive**: Automatic canvas resize on window changes

---

## User Interaction Guide

### Orbital Intersection Viewer
1. **Observe orbit paths**: Red (asteroid) vs Blue (Earth)
2. **Find crossings**: Look for yellow markers
3. **Rotate view**: Drag to see different angles
4. **Zoom**: Scroll to focus on intersection points
5. **Watch animation**: Objects orbit in real-time

### Surface Impact Viewer
1. **Assess crater size**: Yellow label shows diameter
2. **View ejecta spread**: Brown rocks scattered around
3. **Check impact angle**: Red trajectory line
4. **Observe shockwave**: Expanding orange rings
5. **Rotate scene**: Drag to see from different perspectives

---

## Technical Specifications

### Dependencies
```json
{
  "three": "^0.160.0",
  "three/examples/jsm/controls/OrbitControls": "Camera controls"
}
```

### Browser Requirements
- WebGL 2.0 support
- Hardware acceleration recommended
- Minimum 2GB VRAM for smooth performance

### Canvas Properties
- **Pixel ratio**: Matches device (Retina support)
- **Antialiasing**: Enabled for smooth edges
- **Alpha**: Enabled for transparency
- **Shadow maps**: Enabled (surface view only)

### Memory Management
```typescript
// Cleanup on unmount
useEffect(() => {
  return () => {
    cancelAnimationFrame(animationFrameRef.current)
    renderer.dispose()
    controls.dispose()
    // Remove canvas from DOM
  }
}, [dependencies])
```

---

## Visual Examples

### Orbital Intersection Scenarios

#### Low Risk (No Intersection)
```
Earth orbit: ⭕ (1.0 AU circle)
Asteroid:    ⬭ (distant ellipse, no crossing)
Result: No yellow markers
```

#### Moderate Risk (Crossing but Different Phase)
```
Earth orbit: ⭕
Asteroid:    ⬮ (ellipse crosses Earth orbit)
Markers: 🟡 🟡 (2 intersection points)
Note: Timing matters - objects may never be at crossing simultaneously
```

#### High Risk (Close Approach)
```
Earth orbit: ⭕
Asteroid:    ⬯ (highly eccentric, multiple crossings)
Markers: 🟡 🟡 🟡 🟡 (multiple intersection points)
Animation: Shows near-miss or potential collision
```

### Surface Impact Scales

#### Small Asteroid (100m diameter)
```
Crater: ~2 km diameter
Ejecta: ~6 km radius
Visualization: Small, localized damage
```

#### Medium Asteroid (1 km diameter)
```
Crater: ~20 km diameter
Ejecta: ~60 km radius
Visualization: Regional devastation
```

#### Large Asteroid (10 km diameter - Chicxulub-scale)
```
Crater: ~180 km diameter
Ejecta: ~540 km radius
Visualization: Global catastrophe
```

---

## Future Enhancements

### Planned Features
1. **Multiple impact sites**: Show different landing scenarios
2. **Time-lapse mode**: Fast-forward orbital evolution
3. **Comparison view**: Side-by-side asteroid comparisons
4. **VR support**: Immersive 3D exploration
5. **Export options**: Save renders as images/videos
6. **Real-time updates**: Live NASA data integration
7. **Atmospheric entry**: Show trajectory through atmosphere
8. **Tsunami modeling**: For ocean impacts
9. **Climate effects**: Global temperature changes
10. **Orbital deflection**: Simulate mitigation strategies

### Performance Targets
- Load time: < 2 seconds
- Frame rate: 60 FPS minimum
- Memory: < 500 MB
- Mobile support: Tablet optimization

---

## Troubleshooting

### Common Issues

#### Black screen / No render
```typescript
// Check WebGL support
const canvas = document.createElement('canvas')
const gl = canvas.getContext('webgl2')
if (!gl) {
  console.error('WebGL 2.0 not supported')
}
```

#### Low frame rate
- Reduce particle count (stars, ejecta)
- Lower shadow map resolution
- Disable antialiasing on low-end devices

#### Controls not working
- Ensure `touchAction: 'none'` is set on container
- Check for event listener conflicts
- Verify OrbitControls initialization

---

## Code Examples

### Adding Custom Orbit
```typescript
const customOrbit = {
  semiMajorAxis: 2.5,      // AU
  eccentricity: 0.6,       // Highly elliptical
  inclination: 15,         // degrees
  longitudeOfAscendingNode: 45,
  argumentOfPerihelion: 90
}

<OrbitalIntersectionViewer
  asteroidOrbit={customOrbit}
  asteroidName="Custom Asteroid"
  viewType="top"
/>
```

### Modifying Impact Parameters
```typescript
const impactParams = {
  asteroidRadius: 5,        // 5 km
  impactVelocity: 25,       // 25 km/s
  craterDiameter: 90,       // 90 km
  craterDepth: 18,          // 18 km
  ejectaRadius: 270         // 270 km
}

<SurfaceImpactViewer {...impactParams} />
```

---

## Credits & References

### Physics Models
- Kepler's Laws of Planetary Motion
- Collins et al. (2005) - Impact cratering equations
- NASA Horizons System - Orbital elements

### Rendering
- Three.js (WebGL library)
- OrbitControls (Camera manipulation)

### Educational Resources
- JPL Small-Body Database
- Near-Earth Object Program
- Impact Earth! Calculator (Purdue University)

---

**Last Updated:** 2025-10-05  
**Version:** 1.0.0  
**Status:** ✅ Production Ready
