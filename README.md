# NASA GeoViewer App 🌍☄️

*Interactive Solar System & Asteroid Impact Simulator*

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/roshansm/v0-nasa-geo-viewer-app)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.app-black?style=for-the-badge)](https://v0.app/chat/projects/1anl3OE6Rps)

## ✨ Features

### 🎯 Easy-to-Use Interface (NEW!)
- **Feature Hub** - Discover all 20+ features in organized categories
- **Quick Actions Panel** - One-click access to common tasks
- **Interactive Onboarding** - Step-by-step guided tour for new users
- **Keyboard Shortcuts** - Power user controls
- **Comprehensive Documentation** - Detailed user guide included

### 🎯 Interactive 3D Solar System
- Real-time planetary orbits with accurate scaling
- Smooth camera controls and navigation
- Beautiful space-themed visualization

### ☄️ Asteroid Impact Simulation
- Scientifically accurate physics calculations
- Multiple asteroid spawn points
- Real-time trajectory visualization
- Pause/resume simulation controls

### 🔬 Impact Analysis
- **Energy calculations** - Kinetic energy in megatons TNT
- **Crater formation** - Diameter and depth estimates
- **Damage assessment** - Airblast, thermal, and seismic effects
- **Severity classification** - From minor to extinction-level events
- **Historical comparisons** - Compare to known impact events

### 🛰️ NASA Data Integration
- Real Near-Earth Objects (NEO) from NASA's database
- Live asteroid approach data
- Potentially Hazardous Asteroid (PHA) indicators
- Velocity and size measurements

### 🎮 Three Configuration Modes

1. **Custom** - Adjust parameters manually
   - Diameter: 0.01 - 10 km
   - Velocity: 5 - 70 km/s
   - Impact angle: 15° - 90°
   - Starting position options

2. **Presets** - Historical impact events
   - Chelyabinsk (2013)
   - Tunguska (1908)
   - Barringer Crater
   - Chicxulub (Dinosaur extinction)
   - Apophis (Hypothetical)

3. **NASA Data** - Real asteroids from space
   - Upcoming close approaches
   - Real measurements and velocities
   - Hazard classifications

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- pnpm (recommended) or npm

### Installation

```bash
# Install dependencies
pnpm install

# Copy environment template
cp .env.example .env.local

# Add your NASA API key to .env.local
# Get one free at: https://api.nasa.gov/

# Run development server
pnpm dev

# Open http://localhost:3000
```

### Get NASA API Key
1. Visit https://api.nasa.gov/
2. Fill out the form (takes 30 seconds)
3. Receive key instantly via email
4. Add to `.env.local`

**Note**: The app works with `DEMO_KEY` but has limits (30 req/hour). A personal key gives 1,000 req/hour.

## 📚 Documentation

- **[Quick Reference Card](QUICK_REFERENCE.md)** - Essential shortcuts and workflows
- **[Complete User Guide](USER_GUIDE.md)** - Comprehensive manual for all features
- **[Enhanced UX Summary](ENHANCED_UX_SUMMARY.md)** - New features overview
- **[Setup Guide](SETUP.md)** - Detailed installation and configuration
- **[Project Structure](PROJECT_STRUCTURE.md)** - Code organization
- **[Contributing](CONTRIBUTING.md)** - How to contribute
- **[Session Summary](SESSION_SUMMARY.md)** - Recent improvements and fixes

## 🔧 Recent Fixes

✅ **Fixed infinite loop error** - Resolved "Maximum update depth exceeded" issue
✅ **Fixed zoom controls** - Smooth, responsive camera zoom and rotation now working perfectly

See [BUGFIX_INFINITE_LOOP.md](BUGFIX_INFINITE_LOOP.md) and [BUGFIX_ZOOM_CONTROLS.md](BUGFIX_ZOOM_CONTROLS.md) for technical details.

## 🛠️ Technology Stack

- **Framework**: Next.js 14 (React 18)
- **Language**: TypeScript
- **3D Graphics**: Three.js
- **Styling**: Tailwind CSS v4
- **UI Components**: Radix UI + shadcn/ui
- **API**: NASA NEO Web Service

## 🎯 Usage

### First-Time Users

1. **Launch & Learn**
   - Open the app
   - Complete the interactive onboarding tour
   - Click "All Features" to explore capabilities

2. **Quick Start Options**
   - **Historical Impact**: Quick Actions → Presets → Chicxulub
   - **Real Asteroid**: Quick Actions → NASA Data → Apophis
   - **Map Impact**: Quick Actions → Map Impact → Click location

### Running a Simulation

1. **Choose Configuration Mode**
   - Select Custom, Presets, or NASA Data tab

2. **Adjust Parameters** (if using Custom)
   - Set asteroid size, speed, and angle
   - Choose starting position

3. **Start Simulation**
   - Click "Start Simulation"
   - Watch the asteroid trajectory in 3D

4. **View Impact Results**
   - See detailed impact analysis
   - Compare to historical events
   - Understand severity level

5. **Advanced Controls**
   - Pause/Resume simulation
   - Spawn multiple asteroids
   - Reset to try different scenarios

## 🌟 Key Highlights

- **Real Physics**: Based on actual impact mechanics
- **NASA Integration**: Real asteroid data from space agency
- **Educational**: Learn about asteroid impacts interactively
- **Beautiful UI**: Modern, responsive design with dark mode
- **Performance**: Optimized 3D rendering

## 📊 Scientific Basis

The impact calculations are based on:
- Collins et al. (2005) - Earth Impact Effects Program
- Holsapple & Housen (2007) - Crater scaling laws  
- Glasstone & Dolan (1977) - Effects of Nuclear Weapons

## 🔧 Available Scripts

```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Run production build
pnpm lint         # Run ESLint
pnpm type-check   # Check TypeScript types
```

## 🌐 Deployment

Your project is live at:
**[https://vercel.com/roshansm/v0-nasa-geo-viewer-app](https://vercel.com/roshansm/v0-nasa-geo-viewer-app)**

Continue building on:
**[https://v0.app/chat/projects/1anl3OE6Rps](https://v0.app/chat/projects/1anl3OE6Rps)**

### Deploy Your Own

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/RoshanMohamad/v0-nasa-geo-viewer-app)

Remember to add your `NEXT_PUBLIC_NASA_API_KEY` in Vercel's environment variables!

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details.

## 📝 License

This project is open source and available for educational purposes.

## 🙏 Acknowledgments

- NASA for providing free access to Near-Earth Object data
- v0.app for the initial project scaffolding
- The scientific community for impact physics research

## 📞 Support

- **Issues**: [GitHub Issues](../../issues)
- **Discussions**: [GitHub Discussions](../../discussions)
- **Documentation**: See [SETUP.md](SETUP.md) and [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md)

---

**⚠️ Educational Note**: This simulator uses simplified physics models. Real asteroid impacts involve complex atmospheric interactions and geological factors not fully represented here.

Made with ❤️ for space enthusiasts and educators
