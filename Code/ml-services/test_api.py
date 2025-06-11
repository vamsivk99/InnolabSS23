#!/usr/bin/env python3

print("Starting ML API Service...")
print("Testing basic functionality...")

try:
    from flask import Flask, jsonify
    from flask_cors import CORS
    print("✓ Flask imports successful")
    
    app = Flask(__name__)
    CORS(app)
    print("✓ Flask app created")
    
    @app.route('/test')
    def test():
        return jsonify({"message": "API is working!"})
    
    print("✓ Route defined")
    print("Starting server on port 8000...")
    app.run(host='0.0.0.0', port=8000, debug=False)
    
except Exception as e:
    print(f"✗ Error: {e}")
    import traceback
    traceback.print_exc()
