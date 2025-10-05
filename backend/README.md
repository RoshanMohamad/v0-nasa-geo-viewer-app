# 🐍 Python Backend - Installation & Usage Guide

## 📦 Installation

### 1. Navigate to backend directory
```bash
cd backend
```

### 2. Create virtual environment (optional but recommended)
```bash
python -m venv venv

# Activate on Linux/Mac
source venv/bin/activate

# Activate on Windows PowerShell
.\venv\Scripts\Activate.ps1
```

### 3. Install dependencies
```bash
pip install -r requirements.txt
```

## 🚀 Running the Backend

### Start the server
```bash
python app.py
```

The API will be available at: **http://localhost:5000**

### Check if it's running
```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2025-10-05T12:34:56.789012",
  "version": "1.0.0"
}
```

---

## 🔌 API Endpoints

### 1️⃣ **Asteroids CRUD**

#### Create Asteroid
```bash
POST http://localhost:5000/api/asteroids
Content-Type: application/json

{
  "name": "My Custom Asteroid",
  "type": "asteroid",
  "radius": 10.5,
  "mass": 1.5e15,
  "color": "#FF6B35",
  "composition": "rocky",
  "orbitalElements": {
    "semiMajorAxis": 2.77,
    "eccentricity": 0.3,
    "inclination": 10.5,
    "longitudeOfAscendingNode": 80,
    "argumentOfPerihelion": 73,
    "meanAnomaly": 0
  }
}
```

#### Get All Asteroids
```bash
GET http://localhost:5000/api/asteroids
```

#### Get Single Asteroid
```bash
GET http://localhost:5000/api/asteroids/asteroid-20251005123456789
```

#### Update Asteroid
```bash
PUT http://localhost:5000/api/asteroids/asteroid-20251005123456789
Content-Type: application/json

{
  "name": "Updated Asteroid Name",
  "radius": 15.0
}
```

#### Delete Asteroid
```bash
DELETE http://localhost:5000/api/asteroids/asteroid-20251005123456789
```

#### Search Asteroids
```bash
POST http://localhost:5000/api/asteroids/search
Content-Type: application/json

{
  "name": "Ceres",
  "type": "asteroid",
  "minDistance": 1.0,
  "maxDistance": 5.0
}
```

---

### 2️⃣ **Simulation Sessions**

#### Save Simulation
```bash
POST http://localhost:5000/api/simulations
Content-Type: application/json

{
  "name": "My Epic Simulation",
  "description": "100 asteroids targeting Earth",
  "asteroids": [...],
  "customObjects": [...],
  "settings": {
    "timeSpeed": 1000,
    "simulationDate": "2025-10-05"
  }
}
```

#### Get All Simulations
```bash
GET http://localhost:5000/api/simulations
```

#### Load Simulation
```bash
GET http://localhost:5000/api/simulations/sim-20251005123456789
```

#### Delete Simulation
```bash
DELETE http://localhost:5000/api/simulations/sim-20251005123456789
```

---

### 3️⃣ **NASA Horizons Proxy**

Bypass CORS issues when fetching NASA data:

```bash
GET http://localhost:5000/api/nasa-horizons/Ceres
```

---

### 4️⃣ **Statistics**

Get database statistics:

```bash
GET http://localhost:5000/api/stats
```

Response:
```json
{
  "success": true,
  "data": {
    "totalAsteroids": 42,
    "totalSimulations": 5,
    "typeDistribution": {
      "asteroid": 30,
      "comet": 8,
      "dwarf-planet": 4
    },
    "compositionDistribution": {
      "rocky": 25,
      "icy": 10,
      "metallic": 7
    },
    "databaseSize": 156789
  }
}
```

---

## 📁 Database

The backend uses a **JSON file database** (`asteroids_database.json`) for simplicity.

### Structure:
```json
{
  "asteroids": [
    {
      "id": "asteroid-20251005123456789",
      "name": "My Asteroid",
      "type": "asteroid",
      "radius": 10.5,
      "mass": 1.5e15,
      "color": "#FF6B35",
      "composition": "rocky",
      "orbitalElements": {...},
      "metadata": {
        "created": "2025-10-05T12:34:56.789012",
        "updated": "2025-10-05T12:34:56.789012",
        "source": "custom",
        "author": "user"
      }
    }
  ],
  "simulations": [...],
  "metadata": {
    "created": "2025-10-05T10:00:00.000000",
    "version": "1.0.0"
  }
}
```

---

## 🔗 Connecting to Frontend

### Update Next.js API calls

Create a new file: `lib/backend-api.ts`

```typescript
const API_BASE = 'http://localhost:5000/api'

export async function saveAsteroidToBackend(asteroid: CelestialBody) {
  const response = await fetch(`${API_BASE}/asteroids`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(asteroid)
  })
  return response.json()
}

export async function loadAsteroidsFromBackend() {
  const response = await fetch(`${API_BASE}/asteroids`)
  const data = await response.json()
  return data.success ? data.data : []
}

export async function deleteAsteroidFromBackend(id: string) {
  const response = await fetch(`${API_BASE}/asteroids/${id}`, {
    method: 'DELETE'
  })
  return response.json()
}

export async function saveSimulation(simulation: any) {
  const response = await fetch(`${API_BASE}/simulations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(simulation)
  })
  return response.json()
}

export async function loadSimulations() {
  const response = await fetch(`${API_BASE}/simulations`)
  const data = await response.json()
  return data.success ? data.data : []
}
```

### Use in components

```typescript
import { saveAsteroidToBackend, loadAsteroidsFromBackend } from '@/lib/backend-api'

// When adding asteroid
const handleAddCustomObject = async (object: CelestialBody) => {
  // Add to local state
  setCustomObjects(prev => [...prev, object])
  
  // Save to backend
  const result = await saveAsteroidToBackend(object)
  if (result.success) {
    console.log('✅ Saved to backend:', result.data)
  }
}

// Load on mount
useEffect(() => {
  async function loadData() {
    const asteroids = await loadAsteroidsFromBackend()
    setCustomObjects(asteroids)
  }
  loadData()
}, [])
```

---

## 🧪 Testing with cURL

### Create an asteroid
```bash
curl -X POST http://localhost:5000/api/asteroids \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Asteroid",
    "type": "asteroid",
    "radius": 5,
    "mass": 1e14,
    "color": "#00FF00",
    "composition": "rocky",
    "orbitalElements": {
      "semiMajorAxis": 2.5,
      "eccentricity": 0.2,
      "inclination": 5,
      "longitudeOfAscendingNode": 0,
      "argumentOfPerihelion": 0,
      "meanAnomaly": 0
    }
  }'
```

### Get all asteroids
```bash
curl http://localhost:5000/api/asteroids
```

### Search asteroids
```bash
curl -X POST http://localhost:5000/api/asteroids/search \
  -H "Content-Type: application/json" \
  -d '{"type": "asteroid"}'
```

---

## 🔧 Development

### Run in debug mode (auto-reload on changes)
```bash
python app.py
```
Flask runs with `debug=True` by default - it will auto-reload when you edit `app.py`

### Change port
Edit `app.py` line 426:
```python
app.run(host='0.0.0.0', port=8080, debug=True)
```

---

## 📊 Production Deployment (Optional)

For production, use **Gunicorn**:

```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

---

## 🎯 Features

✅ **CRUD Operations** - Create, Read, Update, Delete asteroids  
✅ **Search & Filter** - Search by name, type, composition, distance  
✅ **Simulation Sessions** - Save/load complete simulation states  
✅ **NASA API Proxy** - Bypass CORS restrictions  
✅ **Statistics** - Get insights on your asteroid database  
✅ **JSON Database** - Simple file-based storage (no SQL needed)  
✅ **CORS Enabled** - Works seamlessly with Next.js frontend  
✅ **Auto-generated IDs** - Unique timestamps for each asteroid  
✅ **Metadata Tracking** - Created/updated timestamps, source tracking  

---

## 🚀 Next Steps

1. **Start backend**: `python app.py`
2. **Create `lib/backend-api.ts`** in your Next.js app
3. **Add load/save buttons** to `AsteroidControlPanel`
4. **Test CRUD operations** with the frontend
5. **Optional**: Add user authentication, PostgreSQL, or deploy to cloud

Would you like me to create the frontend integration code next?
