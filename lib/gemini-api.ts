/**
 * Gemini AI Integration for Impact Analysis
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { MeteorParameters, ImpactResults } from '@/types/impact.types';

const API_KEY = process.env.GEMINI_API_KEY || '';

let genAI: GoogleGenerativeAI | null = null;

// Initialize Gemini API
function getGeminiClient() {
  if (!genAI && API_KEY) {
    genAI = new GoogleGenerativeAI(API_KEY);
  }
  return genAI;
}

export interface ImpactAnalysisRequest {
  parameters: MeteorParameters;
  results: ImpactResults;
  locationName?: string;
}

/**
 * Get detailed impact analysis from Gemini AI
 */
export async function getImpactAnalysis(
  request: ImpactAnalysisRequest
): Promise<string> {
  const client = getGeminiClient();
  
  if (!client) {
    // Return fallback analysis instead of throwing error for better UX
    return generateFallbackAnalysis(request);
  }

  const model = client.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const { parameters, results, locationName } = request;

  // Create a comprehensive prompt for Gemini
  const prompt = `You are an expert about NEOs analyzing a hypothetical asteroid impact scenario. Provide a brief, comprehensive analysis in natural language.

**Impact Scenario:**
- **Asteroid Details:**
  - Diameter: ${parameters.diameter >= 1000 ? `${(parameters.diameter / 1000).toFixed(2)} km` : `${parameters.diameter} meters`}
  - Composition: ${parameters.composition}
  - Velocity: ${parameters.velocity} km/s
  ${parameters.name ? `- Name: ${parameters.name} (NASA asteroid)` : ''}
  ${parameters.isPotentiallyHazardous ? '- Classification: Potentially Hazardous Asteroid (PHA)' : ''}

- **Impact Location:**
  - Coordinates: ${parameters.location.lat.toFixed(4)}°, ${parameters.location.lng.toFixed(4)}°
  ${locationName ? `- Location: ${locationName}` : ''}

- **Calculated Impact Effects:**
  - Impact Type: ${results.impactType === 'airburst' ? 'Atmospheric Airburst' : 'Surface Impact'}
  - Impact Energy: ${results.energyTNT.toFixed(2)} Megatons TNT equivalent
  ${results.impactType === 'surface' && results.craterDiameter > 0 ? `- Crater Diameter: ${(results.craterDiameter / 1000).toFixed(2)} km` : ''}
  - Seismic Magnitude: ${results.seismicMagnitude.toFixed(1)}
  - Thermal Radiation Radius: ${results.thermalRadius.toFixed(1)} km (3rd degree burns)
  - Air Blast Radii:
    * 20 PSI (total destruction): ${results.blastRadius.twentyPsi.toFixed(1)} km
    * 5 PSI (severe damage): ${results.blastRadius.fivePsi.toFixed(1)} km
    * 1 PSI (moderate damage): ${results.blastRadius.onePsi.toFixed(1)} km

**Please provide a brief analysis covering:**

1. **Immediate Impact Effects** (first few seconds to minutes):
   - What happens at ground zero
   - Blast wave propagation
   - Thermal effects and firestorms
   - Initial casualties

2. **Regional Effects** (hours to days):
   - Area affected and population at risk
   - Infrastructure damage
   - Estimated death toll and injuries
   - Secondary effects (fires, building collapse)

3. **Global/Climate Effects** (if applicable for large impacts):
   - Atmospheric effects
   - Climate impact
   - Global temperature changes
   - Long-term consequences

4. **Comparison to Historical Events**:
   - Compare to similar known impacts or nuclear weapons
   - Put the energy scale in perspective

5. **Survival and Mitigation**:
   - Safe distances
   - Immediate actions for people in affected areas
   - Long-term recovery challenges

Please write in short, clear, engaging language suitable for general audiences but scientifically accurate. ).

 Be realistic about casualties but remain educational.`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini API Error:', error);
    // Return fallback analysis instead of throwing for better UX
    return generateFallbackAnalysis(request);
  }
}

/**
 * Generate fallback impact analysis when AI is unavailable
 */
function generateFallbackAnalysis(request: ImpactAnalysisRequest): string {
  const { parameters, results, locationName } = request;
  
  // Calculate severity based on energy
  let severity: string = 'minor';
  if (results.energyTNT > 100000) severity = 'extinction';
  else if (results.energyTNT > 10000) severity = 'catastrophic';
  else if (results.energyTNT > 1000) severity = 'severe';
  else if (results.energyTNT > 100) severity = 'moderate';
  
  return `## Impact Analysis: ${parameters.name || 'Asteroid'}

### 🎯 Impact Parameters
- **Diameter**: ${parameters.diameter >= 1000 ? `${(parameters.diameter / 1000).toFixed(2)} km` : `${parameters.diameter} meters`}
- **Velocity**: ${parameters.velocity} km/s
- **Composition**: ${parameters.composition}
- **Location**: ${locationName || `${parameters.location.lat.toFixed(2)}°, ${parameters.location.lng.toFixed(2)}°`}

### 💥 Immediate Impact Effects
The ${parameters.diameter >= 1000 ? 'massive' : parameters.diameter >= 100 ? 'large' : 'moderate'} ${parameters.composition} asteroid will release approximately **${results.energyTNT.toFixed(2)} megatons TNT** equivalent energy upon impact.

${results.impactType === 'surface' ? `A crater approximately **${(results.craterDiameter / 1000).toFixed(2)} km in diameter** and **${(results.craterDiameter / 7).toFixed(2)} km deep** will be formed at the impact site.` : 'The asteroid will break apart in the atmosphere, creating an airburst event.'}

### 🌍 Regional Devastation

**Thermal Radiation Zone**: ${results.thermalRadius.toFixed(1)} km radius
- Third-degree burns to exposed skin
- Widespread fires and ignition of flammable materials

**Blast Wave Damage Zones**:
- **Total Destruction** (20 PSI): ${results.blastRadius.twentyPsi.toFixed(1)} km radius - All structures destroyed
- **Severe Damage** (5 PSI): ${results.blastRadius.fivePsi.toFixed(1)} km radius - Buildings collapse, severe injuries
- **Moderate Damage** (1 PSI): ${results.blastRadius.onePsi.toFixed(1)} km radius - Windows shatter, minor injuries

**Seismic Effects**: Magnitude ${results.seismicMagnitude.toFixed(1)} earthquake

### 🌐 Global Impact Potential
${results.energyTNT > 100000 ? 
  'An impact of this magnitude would have **global consequences**, potentially affecting climate patterns and causing widespread environmental damage for years.' :
  results.energyTNT > 1000 ?
  'Regional devastation with potential continental effects. Ash and debris could affect climate patterns for months.' :
  'Impact effects would be primarily regional, though significant destruction would occur within the blast radius.'}

### ⚠️ Risk Assessment
**Severity Level**: ${severity.toUpperCase()}

${severity === 'extinction' ? '🔴 EXTINCTION-LEVEL EVENT - Global catastrophe threatening human civilization' :
  severity === 'catastrophic' ? '🔴 CATASTROPHIC - Continental-scale devastation' :
  severity === 'severe' ? '🟠 SEVERE - Regional destruction with thousands of casualties' :
  severity === 'moderate' ? '🟡 MODERATE - Significant local damage' :
  '🟢 MINOR - Limited local effects'}

### 🛡️ Mitigation & Safety

**Safe Distance**: Beyond ${results.blastRadius.onePsi.toFixed(0)} km from impact site

**Immediate Actions**:
1. Seek shelter in reinforced structures
2. Stay away from windows
3. Prepare for seismic shaking
4. Have emergency supplies ready

**Long-term Recovery**: ${results.energyTNT > 1000 ? 'Decades of reconstruction required' : results.energyTNT > 100 ? 'Years of recovery expected' : 'Months to years for full recovery'}

---
*Note: This is a scientific simulation. For AI-powered detailed analysis, configure GEMINI_API_KEY.*`;
}

/**
 * Get location name from coordinates using reverse geocoding
 */
export async function getLocationName(lat: number, lng: number): Promise<string> {
  try {
    // Using a free reverse geocoding API (no API key required)
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10`,
      {
        headers: {
          'User-Agent': 'Meteor Impact Calculator',
        },
      }
    );

    if (!response.ok) {
      return 'Unknown location';
    }

    const data = await response.json();
    
    // Build location name from available data
    const parts = [];
    if (data.address?.city) parts.push(data.address.city);
    else if (data.address?.town) parts.push(data.address.town);
    else if (data.address?.village) parts.push(data.address.village);
    
    if (data.address?.state) parts.push(data.address.state);
    if (data.address?.country) parts.push(data.address.country);
    
    return parts.length > 0 ? parts.join(', ') : 'Ocean/Remote area';
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return 'Unknown location';
  }
}
