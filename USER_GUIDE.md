# 🚀 Complete User Guide - Solar System & Asteroid Impact Simulator

## 📋 Table of Contents
- [Getting Started](#getting-started)
- [Quick Actions](#quick-actions)
- [Main Features](#main-features)
- [Advanced Features](#advanced-features)
- [Keyboard Shortcuts](#keyboard-shortcuts)
- [Tips & Tricks](#tips--tricks)

---

## 🎯 Getting Started

### First Time Setup
1. **Launch the app** - Open your browser to `http://localhost:3000`
2. **Take the tour** - Click "Help" button or wait for automatic onboarding
3. **Try Quick Actions** - Use the Quick Actions panel (top-left) for instant access

### Interface Overview
```
┌─────────────────────────────────────────────────────┐
│ Header: Logo | All Features | Help | About | Settings │
├─────────────────────────────────────────────────────┤
│                                                      │
│  [Left Panel]    3D Solar System View    [Right Panel]│
│  - Quick Actions                         - Time Controls│
│  - Asteroids                             - Planet Focus│
│                                          - Realistic Mode│
│                                                      │
│  [Toggle]                                [Toggle]   │
└─────────────────────────────────────────────────────┘
```

---

## ⚡ Quick Actions

### Simulation Controls
- **▶️ Start** - Begin asteroid simulation
- **⏸️ Pause/Resume** - Pause or continue simulation
- **🔄 Reset** - Reset to initial state

### Quick Load Options

#### Historical Presets
1. **🌠 Chelyabinsk (2013)**
   - Size: 20m diameter
   - Impact: 1,500 people injured
   - Energy: ~0.5 MT

2. **💥 Tunguska (1908)**
   - Size: 60m diameter  
   - Impact: 2,000 km² devastation
   - Energy: ~10-15 MT

3. **🌑 Barringer Crater**
   - Size: 50m diameter
   - Created famous Arizona crater
   - Energy: ~10 MT

4. **🦕 Chicxulub (Dinosaur Extinction)**
   - Size: 10 km diameter
   - Mass extinction event
   - Energy: ~100 million MT

5. **☄️ Apophis (Future)**
   - Size: 370m diameter
   - Close approach in 2029
   - Hypothetical impact scenario

#### NASA Real Data
- Load actual Near-Earth Objects
- Real orbital parameters
- Live approach data
- Hazard classifications

---

## 🎮 Main Features

### 1. 🎯 Impact Simulator

**Location:** Left Panel → Quick Tab

**How to Use:**
1. Select **Custom** tab for manual control
2. Adjust parameters:
   - **Diameter**: 0.01 - 10 km (slider)
   - **Velocity**: 5 - 70 km/s
   - **Impact Angle**: 15° - 90°
   - **Starting Position**: Various locations
3. Click **Start Simulation**
4. Watch 3D trajectory
5. See impact results automatically

**What You Get:**
- ⚡ Energy release (Megatons TNT)
- 🌑 Crater dimensions (diameter & depth)
- 💥 Damage zones (airblast, thermal, seismic)
- 📊 Historical comparisons
- 🎯 Severity classification

---

### 2. 🗺️ Map-Based Impact Analysis

**Location:** Quick Actions → Map Impact OR `/impact-analysis` page

**How to Use:**
1. Click **Map Impact** button
2. Click anywhere on Earth
3. Adjust impact parameters:
   - Diameter (meters)
   - Velocity (km/s)
   - Impact angle (degrees)
   - Composition (iron/stony/carbonaceous/comet)
4. View instant results:
   - Impact type (surface/airburst)
   - Crater size
   - Energy release
   - Damage radii on map

**Visualizations:**
- 📍 Impact marker on map
- ⭕ Damage zone circles
- 📊 Results panel with metrics
- 🌍 Auto-zoom to affected area

---

### 3. 🛰️ NASA Asteroid Database

**Location:** Left Panel → Custom Tab

**Available Data Sources:**

#### Quick NASA Presets:
- **Apophis** - Famous close-approach asteroid
- **Bennu** - Sample return mission target  
- **1999 AN10** - Historical close approach
- **Custom NASA ID** - Enter any asteroid ID

**Data Included:**
- ✅ Real orbital elements
- ✅ Size and mass
- ✅ Composition
- ✅ Velocity
- ✅ Close approach dates
- ✅ Hazard classification

**How to Load:**
1. Go to Custom tab
2. Select NASA preset from dropdown
3. Click **Load from NASA**
4. Wait for data fetch
5. Asteroid appears with red orbit

---

### 4. ⏱️ Time & Simulation Controls

**Location:** Right Panel → Time Controls

**Features:**
- **Pause/Resume** - Stop/continue orbital motion
- **Speed Control** - 1x to 100,000x speed
  - 1x - Real-time (very slow)
  - 1,000x - Visible planetary motion
  - 10,000x - Quick orbits
  - 100,000x - Maximum speed
- **Date Display** - Current simulation date/time
- **Reset** - Return to current date

**Pro Tip:** Use 1,000x for best balance of speed and accuracy

---

### 5. 📸 Camera & View Controls

**Location:** Right Panel → Planet Focus

**Options:**
- 🌍 **Earth** - Focus on our planet
- 🔴 **Mars** - Red planet view
- 🪐 **Jupiter** - Giant planet
- 🌟 **All Planets** - Full solar system

**Camera Controls (3D View):**
- 🖱️ **Left-click + drag** - Rotate view
- 🖱️ **Right-click + drag** - Pan camera
- 🎚️ **Scroll wheel** - Zoom in/out
- 🖱️ **Double-click** - Reset view

---

### 6. 👁️ Realistic Mode

**Location:** Right Panel → Realistic Mode Toggle

**Modes:**

#### Visual Mode (Default)
- Planets visible and beautiful
- Easy to see all objects
- Great for exploration
- Sizes exaggerated for visibility

#### Realistic Mode
- True-to-scale distances
- Scientifically accurate
- Planets appear as tiny dots
- Educational and accurate

**Time Scales:**
- **Real-time** - Actual speed (very slow)
- **Fast** - 1,000x speed
- **Very Fast** - 10,000x speed  
- **Extreme** - 100,000x speed

---

## 🚀 Advanced Features

### 1. 📊 Impact Analysis Page

**Access:** `/impact-analysis` or click any asteroid → Analyze Impact

**Features:**
- 📈 **Risk Level Assessment**
  - LOW / MODERATE / HIGH / EXTREME
  - Based on orbital parameters
  - Risk factors listed

- 📊 **4 Analysis Tabs:**
  1. **Visualization** - 3D orbital paths & impacts
  2. **Statistics** - Numerical data
  3. **Damage Assessment** - Impact effects
  4. **Historical Comparison** - Compare to known events

- 🎨 **3D Visualizations:**
  - Orbital intersection (top view)
  - Surface impact (side view)
  - 3D impact scenario

---

### 2. 🌌 Custom Asteroid Creation

**Location:** Left Panel → Custom Tab → Create Custom

**Parameters:**
- **Orbital Elements:**
  - Semi-major axis (AU)
  - Eccentricity (0-1)
  - Inclination (degrees)
  - Longitude of ascending node
  - Argument of periapsis
  - Mean anomaly

- **Physical Properties:**
  - Size (radius in km)
  - Mass (kg)
  - Color
  - Composition
  - Name

**Use Cases:**
- Research hypothetical scenarios
- Test orbital mechanics
- Educational demonstrations
- What-if analysis

---

### 3. 🔄 Multiple Asteroid Comparison

**How to Use:**
1. Add first asteroid (any method)
2. Click **+ Add Asteroid** in simulation
3. Repeat for more asteroids
4. Compare trajectories in 3D
5. View all in Orbit Path Viewer

**Orbit Path Viewer:**
- 2D top-down view
- All orbits visible
- Earth orbit for reference
- Toggle individual asteroids
- Focus on specific objects

---

### 4. 📋 Object Management

**Location:** Left Panel → Manage Tab

**Features:**
- 📝 List all custom objects
- 👁️ View details for each
- ⚠️ Analyze impact potential
- 🗑️ Remove objects
- 📊 Quick stats

**Actions per Object:**
- **View** - See full orbital data
- **Analyze** - Impact probability analysis
- **Remove** - Delete from simulation

---

## ⌨️ Keyboard Shortcuts

### General
- `?` - Show keyboard shortcuts
- `Escape` - Close modals/panels
- `Space` - Pause/Resume simulation

### Camera (3D View)
- `Arrow Keys` - Pan camera
- `+/-` - Zoom in/out
- `Home` - Reset camera
- `1-8` - Focus on planet (1=Mercury, 8=Neptune)

### Simulation
- `R` - Reset simulation
- `S` - Start/Stop simulation
- `[` - Decrease time speed
- `]` - Increase time speed

### Panels
- `L` - Toggle left panel
- `R` - Toggle right panel
- `H` - Show help/onboarding
- `F` - Open feature hub

---

## 💡 Tips & Tricks

### Getting the Best Results

#### For Realistic Impacts:
1. Use historical presets first
2. Adjust parameters gradually
3. Consider impact angle (45° is most common)
4. Ocean impacts create tsunamis
5. Larger asteroids = exponential damage

#### For NASA Data:
1. Get your own API key (free, instant)
2. Use real asteroid IDs for accuracy
3. Check hazard classification
4. Compare multiple approaches
5. Verify with JPL Horizons data

#### For Performance:
1. Limit to 5-10 asteroids at once
2. Use lower time speeds for precision
3. Close unused modals/panels
4. Reset simulation when finished
5. Clear browser cache if slow

### Understanding Results

#### Energy Calculations:
- **Joules** - Raw energy
- **Megatons TNT** - Comparable to nuclear weapons
- **1 MT** = 1 million tons of TNT
- Chelyabinsk ≈ 0.5 MT
- Hiroshima ≈ 0.015 MT
- Chicxulub ≈ 100 million MT

#### Crater Formation:
- **Diameter** - Width of crater
- **Depth** - How deep (usually 1/7 of diameter)
- **Angle affects size** - Shallow impacts = elliptical craters
- **Composition matters** - Iron creates deeper craters

#### Damage Zones:
- **20 psi** - Total destruction
- **5 psi** - Severe structural damage
- **1 psi** - Window breakage
- **Thermal** - Burns & fires
- **Seismic** - Earthquake effects

### Common Scenarios

#### "Want to see dinosaur extinction?"
1. Click **All Features** → Presets → Chicxulub
2. Watch 10km asteroid approach
3. See extinction-level results

#### "How dangerous is Apophis?"
1. Load NASA Data → Apophis
2. Click **Analyze Impact**
3. See LOW risk level
4. View close approach data

#### "Impact my hometown?"
1. Click **Map Impact** button
2. Find your location on map
3. Click to select
4. Adjust asteroid size
5. See local damage prediction

---

## 🆘 Troubleshooting

### Common Issues

**Problem:** Simulation not starting
- ✅ Check if parameters are set
- ✅ Click Start button
- ✅ Refresh page if stuck

**Problem:** NASA data not loading
- ✅ Check internet connection
- ✅ Verify API key in `.env.local`
- ✅ Try different asteroid
- ✅ Wait a moment and retry

**Problem:** 3D view is slow
- ✅ Reduce number of asteroids
- ✅ Lower time speed
- ✅ Close other browser tabs
- ✅ Use lower quality settings

**Problem:** Map not showing
- ✅ Allow location services
- ✅ Check internet connection
- ✅ Refresh the page
- ✅ Try different browser

---

## 🎓 Educational Use

### For Teachers:
- Use historical presets for lessons
- Compare real vs hypothetical impacts  
- Demonstrate orbital mechanics
- Show cause-and-effect relationships
- Export data for analysis

### For Students:
- Experiment with parameters
- Test hypotheses
- Document results
- Compare outcomes
- Research real events

### For Researchers:
- Custom orbital elements
- Multiple scenario comparison
- Export detailed data
- Integration with NASA databases
- Accurate physics models

---

## 📚 Additional Resources

### Documentation:
- [README.md](README.md) - Project overview
- [SETUP.md](SETUP.md) - Installation guide
- [API Documentation](SYSTEM_ARCHITECTURE.md) - Technical details
- [Contributing Guide](CONTRIBUTING.md) - How to contribute

### External Links:
- [NASA NEO API](https://api.nasa.gov/) - Get API key
- [JPL Horizons](https://ssd.jpl.nasa.gov/horizons/) - Orbital data
- [Impact Calculator](https://impact.ese.ic.ac.uk/ImpactEarth/) - Reference
- [NEO Stats](https://cneos.jpl.nasa.gov/) - Current asteroids

---

## 🤝 Support & Feedback

### Get Help:
- 🐛 **Bug Reports** - [GitHub Issues](../../issues)
- 💬 **Discussions** - [GitHub Discussions](../../discussions)  
- 📧 **Email** - Contact via GitHub profile
- 📖 **Documentation** - See links above

### Share Feedback:
- ⭐ Star the repository
- 🔀 Fork and contribute
- 💡 Suggest features
- 📝 Improve documentation

---

**Made with ❤️ for space enthusiasts, educators, and curious minds**

*Last Updated: October 2025*
