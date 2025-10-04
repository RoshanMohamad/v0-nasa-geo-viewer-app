# GSAP Camera Animations - Implementation Guide

## 🎬 Overview

This document describes the **GSAP (GreenSock Animation Platform)** integration for smooth, cinematic camera animations in the Solar System viewer. The implementation provides professional-quality camera movements when focusing on planets.

## ✨ Features Implemented

### 1. **Smooth Camera Fly-To Animation**
- **Technology**: GSAP with `power2.inOut` easing
- **Duration**: 2 seconds for cinematic feel
- **Behavior**: Camera smoothly moves from current position to focus on selected planet

### 2. **Planet Focus Selector**
- Interactive UI with all 9 celestial bodies (Sun + 8 planets)
- Color-coded planet buttons
- One-click focus with automatic camera animation
- Reset view functionality

### 3. **Intelligent Camera Positioning**
```typescript
// Optimal viewing angle: behind and above the planet
const distance = planetSize * 5
const angle = planet.angle - Math.PI / 4
const cameraPos = new THREE.Vector3(
  planetPos.x + Math.cos(angle) * distance,
  planetPos.y + distance * 0.7, // Elevated view
  planetPos.z + Math.sin(angle) * distance
)
```

## 🔧 Technical Implementation

### Libraries Used

```json
{
  "three": "Latest version for 3D rendering",
  "gsap": "^3.x for smooth animations",
  "OrbitControls": "Three.js addon for camera control"
}
```

### Key Components

#### 1. **SolarSystem Component** (`components/solar-system.tsx`)

**New Props:**
```typescript
interface SolarSystemProps {
  // ... existing props
  focusPlanet?: string | null  // Planet to animate camera to
}
```

**GSAP Animation Logic:**
```typescript
useEffect(() => {
  if (!cameraRef.current || !controlsRef.current || !focusPlanet) return

  const planet = planetsRef.current.find(p => p.name === focusPlanet)
  if (!planet) return

  // Kill existing animations to prevent conflicts
  gsap.killTweensOf(cameraRef.current.position)
  gsap.killTweensOf(controlsRef.current.target)

  // Animate camera position
  gsap.to(cameraRef.current.position, {
    x: cameraPos.x,
    y: cameraPos.y,
    z: cameraPos.z,
    duration: 2,
    ease: "power2.inOut",
    onUpdate: () => cameraRef.current?.updateProjectionMatrix()
  })

  // Animate camera target (where it's looking)
  gsap.to(controlsRef.current.target, {
    x: targetPos.x,
    y: targetPos.y,
    z: targetPos.z,
    duration: 2,
    ease: "power2.inOut",
    onUpdate: () => controlsRef.current?.update()
  })
}, [focusPlanet])
```

#### 2. **PlanetSelector Component** (`components/planet-selector.tsx`)

**Features:**
- Grid layout (3 columns) for easy access
- Visual feedback (highlighted when selected)
- Color-coded icons matching planet appearance
- Reset view button

**Usage:**
```tsx
<PlanetSelector
  selectedPlanet={focusedPlanet}
  onSelectPlanet={setFocusedPlanet}
/>
```

## 🎯 GSAP Easing Functions

### Available Easing Options

| Easing | Effect | Use Case |
|--------|--------|----------|
| `power2.inOut` | Smooth acceleration & deceleration | ✅ **Currently used** - Professional, cinematic |
| `power3.inOut` | More dramatic curves | High-impact moments |
| `elastic.out` | Bouncy effect | Playful animations |
| `back.inOut` | Slight overshoot | Attention-grabbing |
| `none` | Linear | Constant speed (robotic) |

### Customization Examples

```typescript
// Fast and snappy (0.8 seconds)
gsap.to(camera.position, {
  ...targetPos,
  duration: 0.8,
  ease: "power3.out"
})

// Slow and dramatic (3.5 seconds)
gsap.to(camera.position, {
  ...targetPos,
  duration: 3.5,
  ease: "power4.inOut"
})

// Bouncy landing
gsap.to(camera.position, {
  ...targetPos,
  duration: 1.5,
  ease: "elastic.out(1, 0.3)"
})
```

## 📱 User Experience Flow

### 1. **Default State**
- Camera positioned at: `(0, 50, 100)`
- Looking at origin (Sun)
- All controls enabled

### 2. **Focus on Planet**
- User clicks planet button
- GSAP animates camera over 2 seconds
- Camera settles behind and above the planet
- OrbitControls target updates to planet position

### 3. **Reset View**
- Click "Reset View" or same planet again
- Camera returns to default position
- Controls target resets to Sun

### 4. **Switch Between Planets**
- Previous animation is killed instantly
- New animation starts smoothly
- No jarring transitions

## 🚀 Performance Optimizations

### 1. **Animation Cleanup**
```typescript
// Prevent memory leaks
useEffect(() => {
  return () => {
    gsap.killTweensOf(cameraRef.current?.position)
    gsap.killTweensOf(controlsRef.current?.target)
  }
}, [])
```

### 2. **Efficient Updates**
- Only updates when `focusPlanet` changes
- Uses refs to avoid re-renders
- Kills previous tweens before starting new ones

### 3. **Smooth Integration with OrbitControls**
```typescript
// Update camera projection on every frame
onUpdate: () => {
  cameraRef.current?.updateProjectionMatrix()
  controlsRef.current?.update()
}
```

## 🎨 Planet Configuration

```typescript
const PLANETS = [
  { name: "Sun", color: "text-yellow-500" },
  { name: "Mercury", color: "text-gray-400" },
  { name: "Venus", color: "text-orange-300" },
  { name: "Earth", color: "text-blue-500" },
  { name: "Mars", color: "text-red-500" },
  { name: "Jupiter", color: "text-orange-400" },
  { name: "Saturn", color: "text-yellow-300" },
  { name: "Uranus", color: "text-cyan-400" },
  { name: "Neptune", color: "text-blue-600" },
]
```

## 🔮 Future Enhancements

### Potential Additions:

1. **Path Animation**
   ```typescript
   // Animate along a curve instead of straight line
   const path = new THREE.CatmullRomCurve3([startPos, midPoint, endPos])
   ```

2. **Camera Shake on Impact**
   ```typescript
   gsap.to(camera.position, {
     x: "+=2",
     y: "+=1",
     yoyo: true,
     repeat: 5,
     duration: 0.1,
     ease: "power2.inOut"
   })
   ```

3. **Zoom Level Animation**
   ```typescript
   gsap.to(camera, {
     fov: 45, // Zoom in
     duration: 1,
     onUpdate: () => camera.updateProjectionMatrix()
   })
   ```

4. **Orbit Path Following**
   ```typescript
   // Camera follows planet along its orbit
   const orbitPath = calculateOrbitPath(planet)
   gsap.to(camera.position, {
     motionPath: orbitPath,
     duration: 10,
     repeat: -1
   })
   ```

## 🎬 Animation Timeline (Advanced)

For complex sequences:

```typescript
const tl = gsap.timeline()

tl.to(camera.position, { y: 100, duration: 1 })
  .to(camera.position, { x: 50, duration: 1 }, "-=0.5") // Overlap
  .to(controls.target, { y: 10, duration: 0.5 })
  .to(camera, { fov: 30, duration: 1 }, "<") // Start with previous
```

## 📊 Comparison: Before vs After

| Feature | Before | After (GSAP) |
|---------|--------|--------------|
| Camera movement | Instant jump | ✅ Smooth 2s animation |
| User control | Manual only | ✅ One-click focus |
| Easing | None | ✅ Professional easing |
| Planet viewing | Difficult | ✅ Optimal angle auto |
| UX quality | Basic | ✅ Cinematic |

## 🔗 Integration with Other Features

### Works With:
- ✅ Kepler's Laws (planets keep moving during animation)
- ✅ Asteroid trajectories (visible while camera moves)
- ✅ OrbitControls (user can still manually adjust during/after)
- ✅ Pause/Resume (animation respects pause state)
- ✅ WebGL error handling (graceful fallback)

### Doesn't Interfere With:
- ✅ Zoom controls (smooth damping preserved)
- ✅ Rotation (user can override anytime)
- ✅ Impact calculations (runs in parallel)

## 📚 Resources

- **GSAP Docs**: https://greensock.com/docs/
- **Three.js Camera**: https://threejs.org/docs/#api/en/cameras/PerspectiveCamera
- **OrbitControls**: https://threejs.org/docs/#examples/en/controls/OrbitControls
- **Easing Visualizer**: https://greensock.com/ease-visualizer/

## 🏆 Best Practices

1. **Always kill previous tweens** before starting new ones
2. **Use refs** for Three.js objects to avoid re-renders
3. **Update camera/controls** in `onUpdate` callbacks
4. **Cleanup on unmount** to prevent memory leaks
5. **Choose appropriate duration** (1-3s for UX balance)
6. **Use power2.inOut** for professional feel

---

**Result**: The solar system now has **professional-grade camera animations** that rival commercial space simulators! 🚀✨
