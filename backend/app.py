# NASA Geo Viewer - Python Backend with CRUD Operations

from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os
from datetime import datetime
from typing import List, Dict, Optional

app = Flask(__name__)
CORS(app)  # Enable CORS for Next.js frontend

# Database file (JSON-based for simplicity)
DB_FILE = 'asteroids_database.json'

# Initialize database if it doesn't exist
def init_db():
    if not os.path.exists(DB_FILE):
        with open(DB_FILE, 'w') as f:
            json.dump({
                'asteroids': [],
                'simulations': [],
                'metadata': {
                    'created': datetime.now().isoformat(),
                    'version': '1.0.0'
                }
            }, f, indent=2)

# Load database
def load_db() -> Dict:
    with open(DB_FILE, 'r') as f:
        return json.load(f)

# Save database
def save_db(data: Dict):
    with open(DB_FILE, 'w') as f:
        json.dump(data, f, indent=2)

# Generate unique ID
def generate_id() -> str:
    return f"asteroid-{datetime.now().strftime('%Y%m%d%H%M%S%f')}"

# ============================================================================
# CRUD OPERATIONS FOR ASTEROIDS
# ============================================================================

@app.route('/api/asteroids', methods=['GET'])
def get_all_asteroids():
    """Get all saved asteroids"""
    try:
        db = load_db()
        return jsonify({
            'success': True,
            'data': db['asteroids'],
            'count': len(db['asteroids'])
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/asteroids/<asteroid_id>', methods=['GET'])
def get_asteroid(asteroid_id: str):
    """Get a specific asteroid by ID"""
    try:
        db = load_db()
        asteroid = next((a for a in db['asteroids'] if a['id'] == asteroid_id), None)
        
        if asteroid:
            return jsonify({
                'success': True,
                'data': asteroid
            }), 200
        else:
            return jsonify({
                'success': False,
                'error': 'Asteroid not found'
            }), 404
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/asteroids', methods=['POST'])
def create_asteroid():
    """Create a new asteroid"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['name', 'type', 'radius', 'mass', 'orbitalElements']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'success': False,
                    'error': f'Missing required field: {field}'
                }), 400
        
        db = load_db()
        
        # Create new asteroid with metadata
        asteroid = {
            'id': data.get('id', generate_id()),
            'name': data['name'],
            'type': data['type'],
            'radius': data['radius'],
            'mass': data['mass'],
            'color': data.get('color', '#FF6B35'),
            'composition': data.get('composition', 'rocky'),
            'orbitalElements': data['orbitalElements'],
            'metadata': {
                'created': datetime.now().isoformat(),
                'updated': datetime.now().isoformat(),
                'source': data.get('source', 'custom'),
                'author': data.get('author', 'user')
            }
        }
        
        db['asteroids'].append(asteroid)
        save_db(db)
        
        return jsonify({
            'success': True,
            'data': asteroid,
            'message': f'Asteroid "{asteroid["name"]}" created successfully'
        }), 201
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/asteroids/<asteroid_id>', methods=['PUT'])
def update_asteroid(asteroid_id: str):
    """Update an existing asteroid"""
    try:
        data = request.get_json()
        db = load_db()
        
        # Find asteroid index
        asteroid_index = next((i for i, a in enumerate(db['asteroids']) if a['id'] == asteroid_id), None)
        
        if asteroid_index is None:
            return jsonify({
                'success': False,
                'error': 'Asteroid not found'
            }), 404
        
        # Update asteroid (keep metadata.created, update metadata.updated)
        existing = db['asteroids'][asteroid_index]
        updated_asteroid = {
            **existing,
            **data,
            'id': asteroid_id,  # Prevent ID changes
            'metadata': {
                **existing.get('metadata', {}),
                'updated': datetime.now().isoformat()
            }
        }
        
        db['asteroids'][asteroid_index] = updated_asteroid
        save_db(db)
        
        return jsonify({
            'success': True,
            'data': updated_asteroid,
            'message': f'Asteroid "{updated_asteroid["name"]}" updated successfully'
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/asteroids/<asteroid_id>', methods=['DELETE'])
def delete_asteroid(asteroid_id: str):
    """Delete an asteroid"""
    try:
        db = load_db()
        
        # Find and remove asteroid
        original_count = len(db['asteroids'])
        db['asteroids'] = [a for a in db['asteroids'] if a['id'] != asteroid_id]
        
        if len(db['asteroids']) == original_count:
            return jsonify({
                'success': False,
                'error': 'Asteroid not found'
            }), 404
        
        save_db(db)
        
        return jsonify({
            'success': True,
            'message': f'Asteroid deleted successfully'
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/asteroids/search', methods=['POST'])
def search_asteroids():
    """Search asteroids by name, type, or other criteria"""
    try:
        criteria = request.get_json()
        db = load_db()
        
        results = db['asteroids']
        
        # Filter by name (partial match, case-insensitive)
        if 'name' in criteria:
            name_query = criteria['name'].lower()
            results = [a for a in results if name_query in a['name'].lower()]
        
        # Filter by type
        if 'type' in criteria:
            results = [a for a in results if a['type'] == criteria['type']]
        
        # Filter by composition
        if 'composition' in criteria:
            results = [a for a in results if a.get('composition') == criteria['composition']]
        
        # Filter by distance range (AU)
        if 'minDistance' in criteria:
            results = [a for a in results if a['orbitalElements']['semiMajorAxis'] >= criteria['minDistance']]
        
        if 'maxDistance' in criteria:
            results = [a for a in results if a['orbitalElements']['semiMajorAxis'] <= criteria['maxDistance']]
        
        return jsonify({
            'success': True,
            'data': results,
            'count': len(results)
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# ============================================================================
# SIMULATION SESSIONS (Save/Load complete states)
# ============================================================================

@app.route('/api/simulations', methods=['GET'])
def get_all_simulations():
    """Get all saved simulation sessions"""
    try:
        db = load_db()
        return jsonify({
            'success': True,
            'data': db.get('simulations', []),
            'count': len(db.get('simulations', []))
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/simulations', methods=['POST'])
def save_simulation():
    """Save a complete simulation session"""
    try:
        data = request.get_json()
        db = load_db()
        
        simulation = {
            'id': f"sim-{datetime.now().strftime('%Y%m%d%H%M%S%f')}",
            'name': data.get('name', f"Simulation {datetime.now().strftime('%Y-%m-%d %H:%M')}"),
            'description': data.get('description', ''),
            'asteroids': data.get('asteroids', []),
            'customObjects': data.get('customObjects', []),
            'settings': data.get('settings', {}),
            'timestamp': datetime.now().isoformat()
        }
        
        if 'simulations' not in db:
            db['simulations'] = []
        
        db['simulations'].append(simulation)
        save_db(db)
        
        return jsonify({
            'success': True,
            'data': simulation,
            'message': f'Simulation "{simulation["name"]}" saved successfully'
        }), 201
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/simulations/<sim_id>', methods=['GET'])
def load_simulation(sim_id: str):
    """Load a saved simulation session"""
    try:
        db = load_db()
        simulation = next((s for s in db.get('simulations', []) if s['id'] == sim_id), None)
        
        if simulation:
            return jsonify({
                'success': True,
                'data': simulation
            }), 200
        else:
            return jsonify({
                'success': False,
                'error': 'Simulation not found'
            }), 404
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/simulations/<sim_id>', methods=['DELETE'])
def delete_simulation(sim_id: str):
    """Delete a simulation session"""
    try:
        db = load_db()
        
        if 'simulations' not in db:
            db['simulations'] = []
        
        original_count = len(db['simulations'])
        db['simulations'] = [s for s in db['simulations'] if s['id'] != sim_id]
        
        if len(db['simulations']) == original_count:
            return jsonify({
                'success': False,
                'error': 'Simulation not found'
            }), 404
        
        save_db(db)
        
        return jsonify({
            'success': True,
            'message': 'Simulation deleted successfully'
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# ============================================================================
# NASA HORIZONS API PROXY (Bypass CORS)
# ============================================================================

@app.route('/api/nasa-horizons/<target>', methods=['GET'])
def nasa_horizons_proxy(target: str):
    """Proxy NASA Horizons API requests to bypass CORS"""
    try:
        import requests
        
        # NASA Horizons API endpoint
        url = f'https://ssd.jpl.nasa.gov/api/horizons.api'
        
        params = {
            'format': 'json',
            'COMMAND': f"'{target}'",
            'OBJ_DATA': 'YES',
            'MAKE_EPHEM': 'YES',
            'EPHEM_TYPE': 'ELEMENTS',
            'CENTER': '500@10',  # Sun
            'START_TIME': '2025-01-01',
            'STOP_TIME': '2025-01-02',
            'STEP_SIZE': '1d'
        }
        
        response = requests.get(url, params=params, timeout=10)
        
        if response.status_code == 200:
            return jsonify({
                'success': True,
                'data': response.json()
            }), 200
        else:
            return jsonify({
                'success': False,
                'error': f'NASA API returned status {response.status_code}'
            }), response.status_code
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# ============================================================================
# STATISTICS & ANALYTICS
# ============================================================================

@app.route('/api/stats', methods=['GET'])
def get_statistics():
    """Get database statistics"""
    try:
        db = load_db()
        
        # Count by type
        type_counts = {}
        for asteroid in db['asteroids']:
            ast_type = asteroid['type']
            type_counts[ast_type] = type_counts.get(ast_type, 0) + 1
        
        # Count by composition
        composition_counts = {}
        for asteroid in db['asteroids']:
            comp = asteroid.get('composition', 'unknown')
            composition_counts[comp] = composition_counts.get(comp, 0) + 1
        
        stats = {
            'totalAsteroids': len(db['asteroids']),
            'totalSimulations': len(db.get('simulations', [])),
            'typeDistribution': type_counts,
            'compositionDistribution': composition_counts,
            'databaseSize': os.path.getsize(DB_FILE) if os.path.exists(DB_FILE) else 0,
            'lastUpdate': db.get('metadata', {}).get('created', 'unknown')
        }
        
        return jsonify({
            'success': True,
            'data': stats
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# ============================================================================
# HEALTH CHECK
# ============================================================================

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'version': '1.0.0'
    }), 200

@app.route('/', methods=['GET'])
def root():
    """Root endpoint with API documentation"""
    return jsonify({
        'name': 'NASA Geo Viewer API',
        'version': '1.0.0',
        'endpoints': {
            'asteroids': {
                'GET /api/asteroids': 'Get all asteroids',
                'GET /api/asteroids/<id>': 'Get asteroid by ID',
                'POST /api/asteroids': 'Create new asteroid',
                'PUT /api/asteroids/<id>': 'Update asteroid',
                'DELETE /api/asteroids/<id>': 'Delete asteroid',
                'POST /api/asteroids/search': 'Search asteroids'
            },
            'simulations': {
                'GET /api/simulations': 'Get all simulations',
                'POST /api/simulations': 'Save simulation',
                'GET /api/simulations/<id>': 'Load simulation',
                'DELETE /api/simulations/<id>': 'Delete simulation'
            },
            'nasa': {
                'GET /api/nasa-horizons/<target>': 'Proxy NASA Horizons API'
            },
            'stats': {
                'GET /api/stats': 'Get database statistics'
            },
            'health': {
                'GET /api/health': 'Health check'
            }
        }
    }), 200

# ============================================================================
# MAIN
# ============================================================================

if __name__ == '__main__':
    # Initialize database
    init_db()
    
    # Run Flask app
    print("🚀 Starting NASA Geo Viewer Backend...")
    print("📊 Database: asteroids_database.json")
    print("🌐 API running on http://localhost:5000")
    print("📖 API docs: http://localhost:5000")
    
    app.run(
        host='0.0.0.0',
        port=5000,
        debug=True
    )
