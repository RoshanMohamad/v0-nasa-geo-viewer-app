"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function DualViewPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="container mx-auto">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => router.push('/')}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Solar System
          </Button>
        </div>
        
        <Card className="p-8">
          <h1 className="text-3xl font-bold mb-4">Dual View Mode</h1>
          <p className="text-muted-foreground">
            This page is currently under development. Check back soon for dual-view solar system visualization!
          </p>
        </Card>
      </div>
    </div>
  )
}
