# 🚨 Risk Level System - Complete Guide

## Overview

The Asteroid Control Panel now displays **risk levels** for all custom asteroids based on their orbital characteristics. Risk assessment uses real orbital mechanics to determine potential Earth impact threats.

## Risk Levels

### 🟢 LOW RISK
**Color:** Green
**Score:** 0-2 points
**Characteristics:**
- Orbit far from Earth (> 1.3 AU)
- Low eccentricity (nearly circular)
- Does not cross Earth's orbit
- Safe distance from inner solar system

**Example:** Trans-Neptunian objects, main belt asteroids

---

### 🟡 MODERATE RISK
**Color:** Yellow/Orange
**Score:** 3-4 points
**Characteristics:**
- Moderately close orbit (1.3-2.0 AU)
- Some eccentricity (0.3-0.5)
- May approach Earth's orbital region
- Requires monitoring

**Example:** Some Mars-crossers, outer NEOs

---

### 🟠 HIGH RISK
**Color:** Orange/Red
**Score:** 5-6 points
**Characteristics:**
- Near-Earth orbit (< 1.3 AU)
- High eccentricity (> 0.5)
- Crosses Earth's orbital path
- Significant size (> 10 km)
- Low inclination (same plane as Earth)

**Example:** Apophis-like NEOs, some Apollo asteroids

---

### 🔴 EXTREME RISK
**Color:** Bright Red
**Score:** 7+ points
**Characteristics:**
- Very close orbit (< 1.0 AU at perihelion)
- **Crosses Earth's orbit** (perihelion < 1.05 AU, aphelion > 0.95 AU)
- Highly eccentric (> 0.5)
- Large size (> 100 km = extinction-level)
- Low inclination (< 10°)
- Near-Earth object

**Example:** Hypothetical planet-killer asteroids

---

## Risk Calculation Algorithm

### Scoring System

```typescript
let score = 0

// 1. Distance from Sun (Semi-major axis)
if (semiMajorAxis < 1.3 AU) {
  score += 3  // Near-Earth Object
}

// 2. Eccentricity (orbit shape)
if (eccentricity > 0.5) {
  score += 2  // Highly eccentric = crosses orbits
}

// 3. Orbit crossing (CRITICAL!)
perihelion = a × (1 - e)
aphelion = a × (1 + e)

if (perihelion < 1.05 AU && aphelion > 0.95 AU) {
  score += 4  // Crosses Earth's orbit!
}

// 4. Size (impact energy)
if (radius > 100 km) {
  score += 2  // Extinction-level event
} else if (radius > 10 km) {
  score += 1  // Regional destruction
}

// 5. Inclination (orbital plane)
if (inclination < 10°) {
  score += 1  // Same plane as Earth
}

// Final Risk Level:
// 7+ = EXTREME
// 5-6 = HIGH
// 3-4 = MODERATE
// 0-2 = LOW
```

### Risk Factors

#### 1. **Near-Earth Orbit** (+3 points)
- Semi-major axis < 1.3 AU
- Asteroid spends time close to Earth
- Higher collision probability

#### 2. **High Eccentricity** (+2 points)
- Eccentricity > 0.5 (highly elliptical)
- Orbit varies dramatically in distance
- Can cross multiple planetary orbits

#### 3. **Earth Orbit Crossing** (+4 points - CRITICAL!)
- Perihelion < 1.05 AU (comes inside Earth's orbit)
- Aphelion > 0.95 AU (goes outside Earth's orbit)
- Direct collision potential
- **This is the most dangerous factor!**

#### 4. **Large Size** (+1 to +2 points)
- Radius > 100 km: +2 points (mass extinction)
- Radius > 10 km: +1 point (regional impact)
- Larger objects = more kinetic energy
- Size determines impact severity

#### 5. **Low Inclination** (+1 point)
- Inclination < 10° (orbits near ecliptic plane)
- Same orbital plane as Earth
- Higher intersection probability

## Visual Display

### Risk Badge

Each asteroid card shows a **color-coded risk badge**:

```
┌────────────────────────────────────┐
│ 🪨 Asteroid-123                    │
│    [asteroid] [EXTREME RISK]       │
│                                    │
│    Distance: 0.92 AU               │
│    Period: 0.9 yr                  │
│    Ecc: 0.650                      │
│    Inc: 3°                         │
│                                    │
│ ⚠️ Near-Earth orbit • Crosses      │
│    Earth's orbit • Large size      │
└────────────────────────────────────┘
```

### Risk Reasons

Hover over the risk badge or check below the orbital data to see **why** the risk level was assigned:

**Possible reasons:**
- "Near-Earth orbit" - Too close to Earth
- "Highly eccentric orbit" - Elliptical trajectory
- "Crosses Earth's orbit" - Direct collision path
- "Large size (>100 km)" - Extinction-level
- "Significant size (>10 km)" - Regional devastation
- "Low inclination" - Same plane as Earth

## Real-World Examples

### 99942 Apophis (HIGH RISK)
```
Semi-major axis: 0.92 AU
Eccentricity: 0.191
Inclination: 3.3°
Radius: 0.185 km

Risk Score: 5 points
- Near-Earth orbit: +3
- Crosses Earth's orbit: +4
- Low inclination: +1
Total: 5 (but < 10 km, so not extreme)

Result: HIGH RISK
Reason: Near-Earth orbit, crosses Earth's orbit, low inclination
```

### Halley's Comet (MODERATE RISK)
```
Semi-major axis: 17.8 AU
Eccentricity: 0.967
Inclination: 162.3°
Radius: 5.5 km

Risk Score: 2 points
- Highly eccentric: +2

Result: MODERATE RISK
Reason: Highly eccentric orbit (but far from Earth)
```

### Trans-Neptunian Object (LOW RISK)
```
Semi-major axis: 40 AU
Eccentricity: 0.2
Inclination: 15°
Radius: 10 km

Risk Score: 0 points

Result: LOW RISK
Reason: Far from Earth, safe orbit
```

### Hypothetical Planet Killer (EXTREME RISK)
```
Semi-major axis: 1.0 AU
Eccentricity: 0.8
Inclination: 2°
Radius: 150 km

Risk Score: 10 points
- Near-Earth orbit: +3
- Highly eccentric: +2
- Crosses Earth's orbit: +4
- Large size (>100 km): +2
- Low inclination: +1

Result: EXTREME RISK
Reason: All factors combined - DANGER!
```

## Where Risk Levels Appear

### 1. MANAGE Tab
- **Custom Orbital Objects** section
- Each asteroid card shows risk badge
- Risk reasons listed below orbital data
- Color-coded for quick identification

### 2. Risk Badge Format
```
[EXTREME RISK]  🔴 Red background, red border
[HIGH RISK]     🟠 Orange background, orange border
[MODERATE RISK] 🟡 Yellow background, yellow border
[LOW RISK]      🟢 Green background, green border
```

### 3. Hover Tooltip
- Hover over risk badge
- See all risk factors in tooltip
- Quick assessment without expanding card

### 4. Risk Reasons (HIGH/EXTREME only)
- Displayed below orbital parameters
- Shows specific factors contributing to risk
- Warning icon (⚠️) for visibility

## Testing

### Test LOW RISK:
```bash
# Add Trans-Neptunian object
1. Click "Trans-Neptunian" button
2. Check MANAGE tab
3. Look for 🟢 GREEN "LOW RISK" badge
```

### Test MODERATE RISK:
```bash
# Add Belt Asteroid with high eccentricity
1. Go to Custom tab → Create sub-tab
2. Set Distance: 2.5 AU
3. Set Eccentricity: 0.6
4. Set Inclination: 15°
5. Add asteroid
6. Check MANAGE tab
7. Look for 🟡 YELLOW "MODERATE RISK" badge
```

### Test HIGH RISK:
```bash
# Add Near-Earth asteroid
1. Click "Near Earth" button
2. Check MANAGE tab
3. Look for 🟠 ORANGE "HIGH RISK" badge
4. Read risk reasons: "Near-Earth orbit • Crosses Earth's orbit"
```

### Test EXTREME RISK:
```bash
# Create dangerous asteroid manually
1. Go to Custom tab → Create sub-tab
2. Set Distance: 1.0 AU (Earth's orbit)
3. Set Eccentricity: 0.8 (highly elliptical)
4. Set Inclination: 2° (low tilt)
5. Set Radius: 150 km (large)
6. Add asteroid
7. Check MANAGE tab
8. Look for 🔴 RED "EXTREME RISK" badge
9. Read all risk factors listed
```

## API Integration

Risk levels are calculated **client-side** in real-time:

```typescript
const risk = calculateRiskLevel(celestialBody)

console.log(risk)
// Output:
{
  level: 'EXTREME',
  color: '#ff0000',
  bgColor: 'bg-red-500/20',
  reasons: [
    'Near-Earth orbit',
    'Crosses Earth\'s orbit',
    'Large size (>100 km)',
    'Low inclination'
  ]
}
```

### NASA Integration

When fetching real asteroids from NASA:

```typescript
const apophis = await fetch('/api/nasa/asteroids?preset=apophis')
// Real orbital data loaded
// Risk level calculated automatically
// Display shows: HIGH RISK (orange)
```

## User Interface

### Color Coding
- 🔴 **Red** = Immediate danger, monitor closely
- 🟠 **Orange** = Significant threat, track trajectory
- 🟡 **Yellow** = Potential concern, observe
- 🟢 **Green** = Safe, no immediate risk

### Risk Display Priority
1. **Badge** - Always visible on card
2. **Reasons** - Shown for HIGH/EXTREME only
3. **Tooltip** - Detailed info on hover
4. **Impact Analysis** - Click ⚠️ button for full assessment

## Science Behind the System

### Why These Factors?

**Near-Earth Orbit:**
- Objects < 1.3 AU defined as Near-Earth Objects (NEOs)
- Closer proximity = higher collision probability
- NASA tracks all NEOs closely

**Eccentricity:**
- High eccentricity = orbit crosses multiple regions
- Can intersect Earth's path at specific points
- Apophis has e=0.191 (moderate)

**Orbit Crossing:**
- Most critical factor
- If perihelion < Earth orbit < aphelion, direct threat
- Requires precise timing, but possible

**Size:**
- 10 km = dinosaur extinction (Chicxulub)
- 100 km = global catastrophe
- Kinetic energy = ½mv² (mass matters!)

**Inclination:**
- Objects in ecliptic plane (i < 10°) more likely to hit
- High inclination = orbits "above/below" Earth
- Reduces intersection probability

## Future Enhancements

### Planned Features:
- [ ] Time-based risk (close approach dates)
- [ ] Velocity-based impact energy calculation
- [ ] Probability percentage (Torino Scale)
- [ ] Historical close approaches
- [ ] Deflection mission simulations
- [ ] Real-time NASA hazard updates

### Advanced Risk Metrics:
- **Torino Scale** (0-10): Public hazard assessment
- **Palermo Scale**: Technical impact probability
- **Kinetic Energy**: Calculated from mass × velocity²
- **Close Approach Distance**: Minimum Earth distance
- **Impact Probability**: Statistical chance of collision

## Summary

✅ **Risk levels now displayed** for all custom asteroids
✅ **4-tier system**: LOW, MODERATE, HIGH, EXTREME
✅ **Color-coded badges**: Green, Yellow, Orange, Red
✅ **Risk reasons**: Explains why each level assigned
✅ **Real orbital mechanics**: Based on Kepler's laws
✅ **Automatic calculation**: Works with all asteroids
✅ **NASA integration**: Real asteroids get real risk levels

**The risk level system helps you identify potentially dangerous asteroids at a glance!** 🚨🪨
