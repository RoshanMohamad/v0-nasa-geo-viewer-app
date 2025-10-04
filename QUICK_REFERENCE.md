# 🚀 Quick Reference Card

## Essential Commands

```bash
# Start development
npm run dev              # or: pnpm dev

# Type checking
npm run type-check

# Build for production
npm run build

# Start production server
npm start
```

## 📂 Important Files

| File | Purpose |
|------|---------|
| `app/page.tsx` | Main application logic |
| `components/solar-system.tsx` | 3D visualization engine |
| `components/control-panel.tsx` | User controls |
| `lib/impact-calculator.ts` | Physics calculations |
| `lib/nasa-neo-api.ts` | NASA API integration |
| `.env.local` | Your NASA API key (create this!) |

## 🔑 Environment Setup

```bash
# 1. Copy template
cp .env.example .env.local

# 2. Get API key at https://api.nasa.gov/

# 3. Add to .env.local
NEXT_PUBLIC_NASA_API_KEY=your_key_here
```

## 🎯 Configuration Modes

### Custom Mode
- Diameter: 0.01 - 10 km
- Velocity: 5 - 70 km/s  
- Angle: 15° - 90°

### Presets
- Chelyabinsk (2013) - Small meteor
- Tunguska (1908) - Forest devastation
- Chicxulub - Dinosaur extinction

### NASA Data
- Real-time asteroid data
- Hazard classifications
- Live approach dates

## 📊 Impact Severity Levels

| Level | Energy (MT) | Description |
|-------|-------------|-------------|
| Minor | < 0.1 | Local damage |
| Moderate | 0.1 - 10 | City-scale event |
| Severe | 10 - 1,000 | Regional devastation |
| Catastrophic | 1,000 - 1M | Continental impact |
| Extinction | > 1M | Global catastrophe |

## 🔧 Troubleshooting

### NASA API not loading?
- Check `.env.local` has your API key
- DEMO_KEY has limits: 30/hour, 50/day
- Check browser console for errors

### TypeScript errors?
```bash
npm run type-check
```

### Performance issues?
- Close other browser tabs
- Update GPU drivers
- Lower browser quality settings

### Build failing?
```bash
rm -rf .next node_modules
npm install
npm run build
```

## 📚 Quick Links

- [Full Setup Guide](SETUP.md)
- [Project Structure](PROJECT_STRUCTURE.md)
- [Contributing](CONTRIBUTING.md)
- [NASA API Docs](https://api.nasa.gov/)

## 💡 Pro Tips

1. **Use Personal API Key** - 1,000 req/hour vs 30/hour
2. **Pause Simulation** - Better performance while adjusting
3. **Try Presets First** - Learn from historical events
4. **Compare Results** - Spawn multiple asteroids
5. **Check Console** - Helpful warnings in dev mode

## 🎨 Customization Quick Guide

### Change Colors/Theme
- Edit `app/globals.css`
- Modify Tailwind classes in components

### Add New Preset
- Edit `components/control-panel.tsx`
- Add entry to `PRESETS` object

### Modify Physics
- Edit `lib/impact-calculator.ts`
- Adjust formulas and constants

### Change 3D Scene
- Edit `components/solar-system.tsx`
- Modify Three.js setup

## 🐛 Common Issues

**Issue**: "NASA data temporarily unavailable"
**Fix**: Use Custom or Presets tab, or get personal API key

**Issue**: 3D scene not loading
**Fix**: Check WebGL support in browser

**Issue**: Build errors about 'three'
**Fix**: `npm install --save-dev @types/three`

**Issue**: Changes not showing
**Fix**: Hard refresh (Ctrl+Shift+R) or clear .next folder

## 📱 Browser Support

✅ Chrome 90+
✅ Firefox 88+
✅ Safari 14+
✅ Edge 90+

Requires: WebGL, JavaScript enabled

---

**Need more help?** Check [SETUP.md](SETUP.md) or [create an issue](../../issues)
