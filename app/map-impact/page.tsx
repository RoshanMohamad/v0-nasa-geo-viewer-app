"use client"

import dynamic from "next/dynamic"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Map } from "lucide-react"

// Import ImpactSandbox with SSR disabled (Leaflet needs browser)
const ImpactSandbox = dynamic(() => import("@/components/ImpactSandbox"), { ssr: false })

export default function MapImpactPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-blue-950 to-purple-950">
      {/* Header */}
      <div className="border-b border-white/10 bg-black/30 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-[2000px] mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/')}
              className="text-white/80 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div className="h-6 w-px bg-white/20" />
            <div className="flex items-center gap-2">
              <Map className="w-5 h-5 text-green-400" />
              <h1 className="text-xl font-bold text-white">
                Interactive Map Impact Analysis
              </h1>
            </div>
          </div>
          <div className="text-sm text-white/60">
            Click anywhere on Earth to simulate an asteroid impact
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[2000px] mx-auto p-4">
        <div className="mb-4">
          <div className="bg-blue-950/30 border border-blue-500/30 rounded-lg p-4">
            <h2 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
              🎯 How to Use
            </h2>
            <ul className="text-sm text-blue-200 space-y-1">
              <li>1. Click anywhere on the map to set an impact location</li>
              <li>2. Adjust asteroid parameters (diameter, velocity, angle, composition) on the right</li>
              <li>3. See real-time impact results including crater size and damage zones</li>
              <li>4. Colored circles show thermal, airblast, and crater radii</li>
            </ul>
          </div>
        </div>

        {/* Impact Sandbox Component */}
        <ImpactSandbox />
      </div>
    </div>
  )
}
