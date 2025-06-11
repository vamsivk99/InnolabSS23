#!/bin/bash

# ML Services Startup Script for Artefacto
# This script starts the ML API service and sets up the environment

echo "Starting Artefacto ML Services..."
echo "========================================"

# Set up environment variables
export FLASK_APP=ml_api_service.py
export FLASK_ENV=development
export PYTHONPATH="${PYTHONPATH}:$(pwd)"

# Check Python installation
echo "Checking Python environment..."
if ! command -v python3 &> /dev/null; then
    echo "Error: Python 3 is not installed. Please install Python 3.7 or higher."
    exit 1
fi

python3 --version

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Install required packages
echo "Installing required packages..."
pip install --upgrade pip

# Core ML packages
pip install flask flask-cors pandas numpy scikit-learn matplotlib seaborn plotly

# Additional packages for ML services  
pip install joblib sqlite3 requests

echo "Package installation completed"

# Check if events.json exists
EVENTS_FILE="../admin/file/events.json"
if [ ! -f "$EVENTS_FILE" ]; then
    echo "Warning: events.json not found at $EVENTS_FILE"
    echo "   The ML service will create synthetic data for demonstration"
else
    echo "Events data file found"
fi

# Start the ML API service
echo ""
echo "Starting ML API Service..."
echo "   - API will be available at http://localhost:5000"
echo "   - Health check: http://localhost:5000/health" 
echo "   - API documentation available in the service"
echo ""
echo "ML Features Available:"
echo "   - Hybrid Recommendation Engine (Collaborative + Content-based)"
echo "   - Event Demand Prediction"
echo "   - Real-time Analytics Dashboard"
echo "   - Trending Events Detection"
echo "   - User Behavior Analysis"
echo "   - Event Optimization Suggestions"
echo ""
echo "Starting service... (Press Ctrl+C to stop)"
echo "========================================"

# Run the ML API service
python3 ml_api_service.py
