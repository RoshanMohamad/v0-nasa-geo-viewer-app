# WebGL Troubleshooting Guide

## Overview
The Solar System & Asteroid Impact Simulator requires WebGL (Web Graphics Library) for 3D rendering. This guide helps resolve WebGL-related issues.

## ✅ Fixes Applied

### 1. **Enhanced Error Handling**
- Added try-catch blocks around WebGL context creation
- Graceful fallback with user-friendly error messages
- Prevents app crashes when WebGL is unavailable

### 2. **Context Creation Options**
```typescript
failIfMajorPerformanceCaveat: false
```
- Allows fallback to software rendering
- Improves compatibility on older/low-end devices

### 3. **User-Friendly Error UI**
- Clear explanation of the issue
- Step-by-step troubleshooting instructions
- Link to WebGL test site

## 🔧 Common Solutions

### For Users:

#### 1. **Enable Hardware Acceleration**

**Chrome/Edge:**
1. Go to `chrome://settings/system`
2. Enable "Use hardware acceleration when available"
3. Restart browser

**Firefox:**
1. Go to `about:preferences`
2. Search for "performance"
3. Uncheck "Use recommended performance settings"
4. Enable "Use hardware acceleration when available"
5. Restart browser

#### 2. **Update Graphics Drivers**
- **NVIDIA**: https://www.nvidia.com/Download/index.aspx
- **AMD**: https://www.amd.com/en/support
- **Intel**: https://www.intel.com/content/www/us/en/download-center/home.html

#### 3. **Browser Extensions**
- Disable extensions that might block WebGL (ad blockers, privacy tools)
- Try opening in incognito/private mode

#### 4. **Browser Compatibility**
Recommended browsers:
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Edge 90+
- ✅ Safari 14+
- ⚠️ Internet Explorer (NOT supported)

#### 5. **Test WebGL**
Visit: https://get.webgl.org/
- If you see a spinning cube, WebGL works
- If not, follow the troubleshooting steps on that page

### For Developers:

#### Debugging WebGL Issues

```javascript
// Check WebGL support
const canvas = document.createElement('canvas');
const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
if (!gl) {
  console.error('WebGL not supported');
}

// Check WebGL version
const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
console.log('Vendor:', gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL));
console.log('Renderer:', gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL));
```

#### Common Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| "WebGL context lost" | GPU driver crash | Reload page, update drivers |
| "Too many active contexts" | Too many WebGL apps open | Close other tabs |
| "Out of memory" | GPU memory exhausted | Reduce texture quality, close tabs |
| "Context creation failed" | WebGL disabled/blocked | Enable in browser settings |

#### Performance Optimization

If WebGL works but performance is poor:

```typescript
// Reduce pixel ratio for better performance
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))

// Reduce shadow quality
renderer.shadowMap.type = THREE.BasicShadowMap

// Lower geometry detail
const geometry = new THREE.SphereGeometry(radius, 32, 32) // Instead of 256
```

## 🔍 Diagnostic Steps

### 1. Check Browser Console
Look for specific WebGL errors:
- `F12` → Console tab
- Look for red error messages
- Share these for better support

### 2. Check GPU Blacklist
Some GPUs are blacklisted due to driver issues:
- Chrome: `chrome://gpu`
- Firefox: `about:support` → Graphics section

### 3. Force WebGL (Advanced)
**Chrome:**
```
chrome://flags/#ignore-gpu-blacklist
```
Enable "Override software rendering list"
⚠️ Use with caution - may cause instability

## 📱 Mobile Devices

### iOS (Safari)
- Requires iOS 8+
- Some older iPads may have limited WebGL support
- Try updating to latest iOS version

### Android
- Requires Android 5.0+
- Chrome Mobile recommended
- Some budget devices have limited GPU capabilities

## 🆘 Still Not Working?

### Create an Issue
Include this information:
1. Browser version (Chrome 120.0.6099.216)
2. Operating System (Windows 11, macOS 14, etc.)
3. GPU info from `chrome://gpu`
4. Console error messages (F12 → Console)
5. Screenshot of error page

### Temporary Workaround
While WebGL issues are resolved, you can:
- Try a different device
- Use a cloud-based browser (like Chrome Remote Desktop)
- Access from a device with better GPU support

## 📚 Additional Resources

- [Three.js Documentation](https://threejs.org/docs/)
- [WebGL Fundamentals](https://webglfundamentals.org/)
- [Khronos WebGL Wiki](https://www.khronos.org/webgl/wiki/)
- [Can I Use WebGL](https://caniuse.com/webgl)

---

**Note**: 99% of modern devices support WebGL. If you're experiencing issues, it's usually a configuration problem that can be fixed with the steps above.
