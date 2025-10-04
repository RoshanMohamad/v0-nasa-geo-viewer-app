"use client"

import { Card } from "@/components/ui/card"
import type { ImpactAnalysis } from "@/lib/orbital-mechanics"

interface CraterVisualizationProps {
  analysis: ImpactAnalysis
  asteroidName: string
}

export function CraterVisualization({ analysis, asteroidName }: CraterVisualizationProps) {
  // Calculate crater zones in km
  const craterDiameterKm = (analysis.craterDiameter || 0) / 1000
  const craterDepthKm = (analysis.craterDepth || 0) / 1000
  
  // Simplified zone calculations (you can adjust these based on your analysis)
  const zones = {
    centralPeak: craterDiameterKm * 0.1,
    terracedRim: craterDiameterKm * 0.35,
    ejectaRim: craterDiameterKm * 0.5,
    ejectaBlanket: craterDiameterKm * 2.5,
    shockwave: craterDiameterKm * 5
  }

  return (
    <div className="space-y-4">
      {/* Radial Impact Map - Top-down view */}
      <Card className="p-4 bg-card">
        <h3 className="text-base font-bold text-foreground mb-3">
          Radial Impact Map (Top-Down View)
        </h3>
        <div className="bg-background rounded p-4 mb-3 flex justify-center items-center" style={{ height: '500px' }}>
          <svg width="480" height="480" viewBox="0 0 480 480">
            <defs>
              {/* Gradients for each zone */}
              <radialGradient id="shockwaveGrad">
                <stop offset="0%" stopColor="rgba(255, 0, 0, 0.4)" />
                <stop offset="100%" stopColor="rgba(255, 0, 0, 0.1)" />
              </radialGradient>
              <radialGradient id="ejectaGrad">
                <stop offset="0%" stopColor="rgba(255, 140, 0, 0.5)" />
                <stop offset="100%" stopColor="rgba(255, 140, 0, 0.2)" />
              </radialGradient>
              <radialGradient id="rimGrad">
                <stop offset="0%" stopColor="rgba(205, 133, 63, 0.6)" />
                <stop offset="100%" stopColor="rgba(205, 133, 63, 0.3)" />
              </radialGradient>
              <radialGradient id="peakGrad">
                <stop offset="0%" stopColor="rgba(100, 100, 100, 0.8)" />
                <stop offset="100%" stopColor="rgba(80, 80, 80, 0.5)" />
              </radialGradient>
            </defs>

            {/* Background */}
            <rect x="0" y="0" width="480" height="480" fill="hsl(var(--background))" />
            
            {/* Calculate radii based on crater zones */}
            {(() => {
              const maxRadius = zones.shockwave
              const scaleFactor = 220 / maxRadius
              
              const shockwaveR = zones.shockwave * scaleFactor
              const ejectaR = zones.ejectaBlanket * scaleFactor
              const rimR = zones.ejectaRim * scaleFactor
              const terracedR = zones.terracedRim * scaleFactor
              const peakR = zones.centralPeak * scaleFactor
              
              return (
                <>
                  {/* Shockwave Zone (outermost) */}
                  <circle cx="240" cy="240" r={shockwaveR} fill="url(#shockwaveGrad)" stroke="#ff0000" strokeWidth="3" strokeDasharray="8,4" />
                  <text x="240" y={240 - shockwaveR + 20} fill="#ff6666" fontSize="12" fontWeight="bold" textAnchor="middle">
                    SHOCKWAVE ZONE
                  </text>
                  <text x="240" y={240 - shockwaveR + 35} fill="#ff9999" fontSize="10" textAnchor="middle">
                    {zones.shockwave.toFixed(1)} km radius
                  </text>
                  <text x="240" y={240 - shockwaveR + 50} fill="#ffaaaa" fontSize="9" textAnchor="middle" fontStyle="italic">
                    Seismic damage, broken windows
                  </text>

                  {/* Ejecta Blanket */}
                  <circle cx="240" cy="240" r={ejectaR} fill="url(#ejectaGrad)" stroke="#ff8c00" strokeWidth="3" />
                  <text x="240" y={240 - ejectaR + 20} fill="#ffa500" fontSize="12" fontWeight="bold" textAnchor="middle">
                    EJECTA BLANKET
                  </text>
                  <text x="240" y={240 - ejectaR + 35} fill="#ffb347" fontSize="10" textAnchor="middle">
                    {zones.ejectaBlanket.toFixed(1)} km radius
                  </text>
                  <text x="240" y={240 - ejectaR + 50} fill="#ffc266" fontSize="9" textAnchor="middle" fontStyle="italic">
                    Debris fallout, fires, total destruction
                  </text>

                  {/* Crater Rim */}
                  <circle cx="240" cy="240" r={rimR} fill="url(#rimGrad)" stroke="#cd853f" strokeWidth="3" />
                  <text x="240" y={240 - rimR + 20} fill="#d4a574" fontSize="12" fontWeight="bold" textAnchor="middle">
                    CRATER RIM
                  </text>
                  <text x="240" y={240 - rimR + 35} fill="#deb887" fontSize="10" textAnchor="middle">
                    {zones.ejectaRim.toFixed(2)} km radius
                  </text>

                  {/* Terraced Zone */}
                  <circle cx="240" cy="240" r={terracedR} fill="rgba(139, 115, 85, 0.4)" stroke="#8b7355" strokeWidth="2" strokeDasharray="4,2" />
                  <text x="240" y={240 - terracedR + 15} fill="#a0826d" fontSize="11" fontWeight="bold" textAnchor="middle">
                    TERRACED ZONE
                  </text>

                  {/* Central Peak */}
                  {peakR > 5 && (
                    <>
                      <circle cx="240" cy="240" r={peakR} fill="url(#peakGrad)" stroke="#606060" strokeWidth="2" />
                      <text x="240" y="235" fill="#e0e0e0" fontSize="11" fontWeight="bold" textAnchor="middle">
                        CENTRAL
                      </text>
                      <text x="240" y="248" fill="#e0e0e0" fontSize="11" fontWeight="bold" textAnchor="middle">
                        PEAK
                      </text>
                    </>
                  )}

                  {/* Ground zero marker */}
                  <circle cx="240" cy="240" r="4" fill="#ff0000" stroke="#ffffff" strokeWidth="2" />
                  <text x="240" y="280" fill="hsl(var(--foreground))" fontSize="10" fontWeight="bold" textAnchor="middle">
                    GROUND ZERO
                  </text>

                  {/* Scale indicator */}
                  <line x1="30" y1="450" x2="130" y2="450" stroke="hsl(var(--foreground))" strokeWidth="2" />
                  <line x1="30" y1="445" x2="30" y2="455" stroke="hsl(var(--foreground))" strokeWidth="2" />
                  <line x1="130" y1="445" x2="130" y2="455" stroke="hsl(var(--foreground))" strokeWidth="2" />
                  <text x="80" y="470" fill="hsl(var(--foreground))" fontSize="11" textAnchor="middle">
                    {(100 / scaleFactor).toFixed(0)} km
                  </text>

                  {/* Compass */}
                  <text x="440" y="30" fill="hsl(var(--foreground))" fontSize="14" fontWeight="bold">N</text>
                  <text x="20" y="245" fill="hsl(var(--foreground))" fontSize="14" fontWeight="bold">W</text>
                  <text x="455" y="245" fill="hsl(var(--foreground))" fontSize="14" fontWeight="bold">E</text>
                </>
              )
            })()}
          </svg>
        </div>

        {/* Zone descriptions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="bg-destructive/20 border-l-4 border-destructive p-3 rounded">
            <p className="text-destructive font-bold">🔴 SHOCKWAVE ZONE</p>
            <p className="text-muted-foreground mt-1">
              Seismic waves, broken windows, minor structural damage
            </p>
          </div>
          <div className="bg-orange-500/20 border-l-4 border-orange-500 p-3 rounded">
            <p className="text-orange-500 font-bold">🟠 EJECTA BLANKET</p>
            <p className="text-muted-foreground mt-1">
              Debris fallout, fires, total destruction
            </p>
          </div>
          <div className="bg-yellow-500/20 border-l-4 border-yellow-600 p-3 rounded">
            <p className="text-yellow-600 font-bold">🟡 CRATER RIM</p>
            <p className="text-muted-foreground mt-1">
              Raised rim with terraced walls
            </p>
          </div>
          <div className="bg-muted border-l-4 border-border p-3 rounded">
            <p className="text-foreground font-bold">⚫ CENTRAL PEAK</p>
            <p className="text-muted-foreground mt-1">
              {(analysis.craterDepth || 0) > 1000 
                ? 'Rebounded material from impact'
                : 'Simple crater - no central peak'}
            </p>
          </div>
        </div>
      </Card>

      {/* Cross-section view */}
      <Card className="p-4 bg-card">
        <h3 className="text-base font-bold text-foreground mb-3">
          Impact Crater Structure (Cross-Section)
        </h3>
        <div className="bg-background rounded p-4 mb-3" style={{ height: '300px' }}>
          <svg width="100%" height="100%" viewBox="0 0 600 300">
            <defs>
              <radialGradient id="centralPeakGrad2" cx="50%" cy="50%">
                <stop offset="0%" stopColor="#4a5568" />
                <stop offset="100%" stopColor="#2d3748" />
              </radialGradient>
              <linearGradient id="depthGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#8b4513" />
                <stop offset="50%" stopColor="#654321" />
                <stop offset="100%" stopColor="#3d2817" />
              </linearGradient>
            </defs>

            {/* Ground level */}
            <rect x="0" y="150" width="600" height="150" fill="hsl(var(--muted))" />
            
            {/* Crater bowl */}
            <ellipse cx="300" cy="180" rx="100" ry="30" fill="url(#depthGrad)" />
            <path d="M 200 150 Q 250 190, 300 195 Q 350 190, 400 150" fill="url(#depthGrad)" />
            
            {/* Central peak */}
            {craterDepthKm > 1 && (
              <path d="M 280 185 L 300 160 L 320 185 Z" fill="url(#centralPeakGrad2)" stroke="#1a202c" strokeWidth="1" />
            )}
            
            {/* Labels */}
            <line x1="200" y1="220" x2="400" y2="220" stroke="hsl(var(--foreground))" strokeWidth="1" />
            <text x="300" y="235" fill="hsl(var(--foreground))" fontSize="11" textAnchor="middle" fontWeight="bold">
              Diameter: {craterDiameterKm.toFixed(1)} km
            </text>
            
            <line x1="420" y1="150" x2="420" y2="190" stroke="hsl(var(--foreground))" strokeWidth="1" />
            <text x="440" y="175" fill="hsl(var(--foreground))" fontSize="11" fontWeight="bold">
              Depth: {craterDepthKm.toFixed(2)} km
            </text>
          </svg>
        </div>

        {/* Crater statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
          <div className="bg-muted p-2 rounded">
            <p className="text-muted-foreground">Diameter</p>
            <p className="text-foreground font-bold">{craterDiameterKm.toFixed(2)} km</p>
          </div>
          <div className="bg-muted p-2 rounded">
            <p className="text-muted-foreground">Depth</p>
            <p className="text-foreground font-bold">{craterDepthKm.toFixed(2)} km</p>
          </div>
          <div className="bg-muted p-2 rounded">
            <p className="text-muted-foreground">Ejecta Range</p>
            <p className="text-foreground font-bold">{zones.ejectaBlanket.toFixed(1)} km</p>
          </div>
          <div className="bg-muted p-2 rounded">
            <p className="text-muted-foreground">Shockwave</p>
            <p className="text-foreground font-bold">{zones.shockwave.toFixed(1)} km</p>
          </div>
        </div>
      </Card>
    </div>
  )
}
