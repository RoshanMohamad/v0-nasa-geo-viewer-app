# Development Setup Guide

## 🚀 Quick Start

### 1. Prerequisites
Ensure you have the following installed:
- **Node.js** 18.x or higher ([Download](https://nodejs.org/))
- **pnpm** (recommended) or npm

Install pnpm globally:
```bash
npm install -g pnpm
```

### 2. Clone and Install

```bash
# Navigate to your project directory
cd v0-nasa-geo-viewer-app

# Install dependencies
pnpm install

# Or if you prefer npm
npm install
```

### 3. Environment Setup

Create your environment file:
```bash
cp .env.example .env.local
```

Edit `.env.local` and add your NASA API key:
```env
NEXT_PUBLIC_NASA_API_KEY=your_api_key_here
```

**Get your free NASA API key:**
1. Visit https://api.nasa.gov/
2. Fill out the simple form
3. Receive your key instantly via email
4. Copy it to `.env.local`

**Note**: The app works with `DEMO_KEY` but has limited requests (30/hour, 50/day). A personal key gives you 1,000 requests/hour.

### 4. Run Development Server

```bash
pnpm dev
```

The app will be available at http://localhost:3000

### 5. Build for Production

```bash
# Create optimized production build
pnpm build

# Test production build locally
pnpm start
```

## 🛠️ Development Commands

```bash
# Development server with hot reload
pnpm dev

# Type checking
pnpm type-check

# Linting
pnpm lint

# Build for production
pnpm build

# Start production server
pnpm start
```

## 🎨 Customization

### Modify Impact Calculations
Edit `lib/impact-calculator.ts` to adjust physics formulas and severity thresholds.

### Customize 3D Visualization
Edit `components/solar-system.tsx` and `components/earth-globe.tsx` for 3D graphics changes.

### Add New Presets
Edit `components/control-panel.tsx` and add entries to the `PRESETS` object.

### Style Changes
- Global styles: `app/globals.css`
- Tailwind config: `tailwind.config.js`
- Component styles: Inline Tailwind classes

## 🔧 Troubleshooting

### NASA API Not Working
- **Check API key**: Ensure it's correctly set in `.env.local`
- **Rate limits**: You may have exceeded the limit (check console warnings)
- **Network issues**: Try again later or use Custom/Presets tabs

### 3D Visualization Issues
- **Performance**: Lower quality settings in browser
- **WebGL**: Ensure your browser supports WebGL
- **GPU**: Update graphics drivers

### Build Errors
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Type Errors
If you see TypeScript errors related to `three`:
```bash
pnpm add -D @types/three
```

## 📱 Browser Compatibility

**Recommended Browsers:**
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

**Requirements:**
- WebGL support
- JavaScript enabled
- Modern CSS support

## 🔐 Security Notes

- Never commit `.env.local` to version control
- NASA API key is public (client-side) - this is normal
- The DEMO_KEY is rate-limited but safe for development

## 📚 Learning Resources

### Next.js
- [Next.js Documentation](https://nextjs.org/docs)
- [Learn Next.js](https://nextjs.org/learn)

### Three.js
- [Three.js Documentation](https://threejs.org/docs/)
- [Three.js Examples](https://threejs.org/examples/)

### NASA APIs
- [NASA API Portal](https://api.nasa.gov/)
- [NEO API Documentation](https://api.nasa.gov/neo/)

### Impact Physics
- [Impact Calculator](https://impact.ese.ic.ac.uk/ImpactEarth/)
- [Asteroid Impact Physics](https://www.lpi.usra.edu/science/kring/epo_web/impact_cratering/enviropages/Chicxulub/chicxulub.html)

## 💡 Tips

1. **Performance**: The 3D simulation can be GPU-intensive. Close other tabs if experiencing lag.

2. **API Usage**: The NASA data refreshes on page load. Avoid excessive reloads during development.

3. **Physics Accuracy**: The impact calculations use simplified models. Real impacts involve complex atmospheric interactions.

4. **Preset Data**: Historical event data is approximate and based on scientific estimates.

## 🤝 Getting Help

- Check existing [Issues](../../issues)
- Read the [Contributing Guide](CONTRIBUTING.md)
- Review [Project Structure](PROJECT_STRUCTURE.md)
- Create a new issue with detailed information

## 🎯 Next Steps

After setup:
1. Explore the simulation controls
2. Try different asteroid configurations
3. Compare preset historical events
4. Load real NASA asteroid data
5. Experiment with custom parameters

Happy coding! 🚀
