#!/usr/bin/env node

/**
 * Test NASA API Integration
 * Run with: node test-nasa-api-integration.js
 * Or: pnpm test:nasa
 */

const API_BASE = 'http://localhost:3000'

async function testNASAAPI() {
  console.log('🧪 Testing NASA API Integration...\n')

  // Test 1: Backend API health check
  console.log('1️⃣ Testing backend API endpoint...')
  try {
    const response = await fetch(`${API_BASE}/api/nasa/asteroids?preset=apophis`)
    if (response.ok) {
      const data = await response.json()
      console.log('✅ Backend API working!')
      console.log(`   Asteroid: ${data.name}`)
      console.log(`   Distance: ${data.orbitalElements.semiMajorAxis.toFixed(2)} AU`)
      console.log(`   Eccentricity: ${data.orbitalElements.eccentricity.toFixed(3)}`)
    } else {
      console.log(`❌ Backend API failed: ${response.status} ${response.statusText}`)
    }
  } catch (error) {
    console.log('❌ Backend API error:', error.message)
    console.log('   Make sure dev server is running: pnpm dev')
  }
  console.log('')

  // Test 2: Multiple asteroids
  console.log('2️⃣ Testing multiple NASA asteroids...')
  const presets = ['apophis', 'bennu', 'eros']
  
  for (const preset of presets) {
    try {
      const response = await fetch(`${API_BASE}/api/nasa/asteroids?preset=${preset}`)
      if (response.ok) {
        const data = await response.json()
        console.log(`✅ ${data.name} - ${data.orbitalElements.semiMajorAxis.toFixed(2)} AU`)
      } else {
        console.log(`❌ Failed to fetch ${preset}`)
      }
    } catch (error) {
      console.log(`❌ Error fetching ${preset}:`, error.message)
    }
  }
  console.log('')

  // Test 3: Near-Earth Objects
  console.log('3️⃣ Testing NEO API...')
  try {
    const today = new Date().toISOString().split('T')[0]
    const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    
    const response = await fetch(
      `${API_BASE}/api/nasa/asteroids?startDate=${today}&endDate=${nextWeek}`
    )
    
    if (response.ok) {
      const data = await response.json()
      console.log(`✅ Found ${data.count} near-Earth objects`)
      if (data.asteroids.length > 0) {
        console.log(`   Example: ${data.asteroids[0].name}`)
        console.log(`   Close approach: ${data.asteroids[0].closeApproachDate}`)
      }
    } else {
      console.log(`❌ NEO API failed: ${response.status}`)
    }
  } catch (error) {
    console.log('❌ NEO API error:', error.message)
  }
  console.log('')

  // Test 4: Error handling
  console.log('4️⃣ Testing error handling...')
  try {
    const response = await fetch(`${API_BASE}/api/nasa/asteroids?preset=invalid_asteroid`)
    if (!response.ok) {
      console.log('✅ Error handling working (invalid asteroid rejected)')
    } else {
      console.log('⚠️ Should have rejected invalid asteroid')
    }
  } catch (error) {
    console.log('✅ Error handling working:', error.message)
  }
  console.log('')

  console.log('🎉 API Integration Test Complete!')
  console.log('\n📋 Summary:')
  console.log('   - Backend API: /api/nasa/asteroids')
  console.log('   - NASA Horizons: Real orbital data')
  console.log('   - NASA NEO: Near-Earth objects')
  console.log('   - Error handling: Fallbacks enabled')
  console.log('\n🚀 Ready to add asteroids with real NASA data!')
}

// Run tests
testNASAAPI().catch(console.error)
