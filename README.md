# Artefacto: ML-Powered Event Management Platform

A comprehensive event discovery and management platform for the cultural sector, featuring machine learning-powered recommendations, predictive analytics, and intelligent event optimization.

## Overview

Artefacto is a full-stack web application designed for cultural organizations including theaters, museums, orchestras, and galleries. The platform combines traditional event management with cutting-edge machine learning capabilities to provide personalized experiences and data-driven insights.

### Key Features

- **Event Discovery & Management**: Browse, filter, and manage cultural events
- **ML-Powered Recommendations**: Hybrid recommendation system using collaborative filtering and content-based algorithms
- **Predictive Analytics**: Event demand forecasting and attendance optimization
- **Real-time Analytics Dashboard**: Comprehensive insights into user behavior and event performance
- **Admin Panel**: Full-featured administration interface for event organizers
- **3D Virtual Tours**: Interactive museum experiences using PlayCanvas WebGL
- **Payment Integration**: Secure ticket purchasing with Stripe integration
- **Responsive Design**: Mobile-first design for optimal user experience

## Technology Stack

### Frontend
- **HTML5/CSS3/JavaScript**: Modern responsive web design
- **Bootstrap 3.4.1**: UI framework for consistent styling
- **jQuery 3.6.4**: DOM manipulation and AJAX requests
- **Chart.js**: Data visualization for analytics dashboard
- **PlayCanvas**: 3D engine for virtual museum tours

### Backend
- **Node.js/Express**: Web server and API routing
- **Python/Flask**: ML microservices and analytics API
- **Firebase**: Real-time database and authentication
- **SQLite**: Local analytics database
- **Stripe**: Payment processing

### Machine Learning
- **scikit-learn**: ML algorithms and model training
- **pandas/numpy**: Data processing and analysis
- **Plotly**: Advanced data visualizations
- **TF-IDF/Cosine Similarity**: Content-based recommendations
- **Matrix Factorization**: Collaborative filtering

## Quick Start

### Prerequisites
- Python 3.8+
- Node.js 16+
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd InnolabSS23/Code
   ```

2. **Install Python dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Install Node.js dependencies**
   ```bash
   cd server
   npm install
   cd ..
   ```

4. **Start ML Services**
   ```bash
   cd ml-services
   python ml_api_service.py
   ```

5. **Start Web Server**
   ```bash
   cd server
   node server.js
   ```

6. **Access the application**
   - Main Website: http://localhost:3000
   - Admin Panel: http://localhost:3000/admin
   - ML Analytics: http://localhost:3000/admin/analytics
   - ML API: http://localhost:8000

## Project Structure

```
Code/
├── admin/                  # Administration interface
├── customer/              # Customer-facing website
├── ml-services/          # Machine learning microservices
│   ├── ml_api_service.py    # Main ML API server
│   ├── recommendation_engine.py  # Hybrid recommendation system
│   ├── analytics_dashboard.py   # Data analytics and ETL
│   └── predictive_analytics.py  # Demand forecasting
├── server/               # Node.js web server
├── 3d-Studio/           # 3D virtual museum tours
├── web-crawler/         # Event data collection
└── requirements.txt     # Python dependencies
```

## ML Services API

The platform includes comprehensive ML capabilities accessible via REST API:

### Endpoints

- `GET /health` - Service health check
- `GET /analytics/summary` - Event performance metrics
- `GET /analytics/insights` - ML-driven insights
- `GET /trending-events` - Popularity-based recommendations
- `GET /model-performance` - ML model accuracy metrics
- `GET /optimization/suggestions` - Event optimization recommendations

### Example Usage

```javascript
// Get personalized recommendations
fetch('http://localhost:8000/trending-events')
  .then(response => response.json())
  .then(data => console.log(data.recommendations));
```

## Features Deep Dive

### Machine Learning Capabilities

1. **Hybrid Recommendation Engine**
   - Collaborative filtering using matrix factorization
   - Content-based filtering with TF-IDF similarity
   - Popularity-based recommendations
   - Real-time personalization

2. **Predictive Analytics**
   - Event demand forecasting
   - Attendance optimization
   - Revenue prediction
   - Seasonal trend analysis

3. **Analytics Dashboard**
   - Real-time event performance tracking
   - User behavior analysis
   - Revenue analytics
   - Conversion rate optimization

### Database Schema

The platform uses Firebase for real-time data and SQLite for ML analytics:

- **Events**: Event details, scheduling, pricing
- **Users**: User profiles, preferences, history
- **Interactions**: User-event interactions for ML training
- **Analytics**: Aggregated metrics and insights

## Development

### Running Tests

```bash
# Test ML API endpoints
cd ml-services
python test_api.py

# Test recommendation engine
python -c "from recommendation_engine import EventRecommendationEngine; engine = EventRecommendationEngine(); print('Tests passed')"
```

### Configuration

Key configuration files:
- `server/server.js` - Web server configuration 
- `ml-services/ml_api_service.py` - ML service configuration
- Firebase configuration in various `firebase.js` files

## Deployment

### Production Setup

1. **Environment Variables**
   ```bash
   export STRIPE_SECRET_KEY=your_stripe_key
   export FIREBASE_CONFIG=your_firebase_config
   ```

2. **Database Setup**
   - Configure Firebase project
   - Initialize SQLite analytics database
   - Run data migration scripts

3. **Service Deployment**
   - Deploy Node.js server (Port 3000)
   - Deploy ML services (Port 8000)
   - Configure reverse proxy/load balancer

## Contributing

This project demonstrates full-stack development skills including:
- Frontend development with modern web technologies
- Backend API development and microservices architecture
- Machine learning implementation and deployment
- Database design and data engineering
- DevOps and deployment strategies

## License

This project is licensed under the Apache 2.0 License.

## Contact

For questions or collaboration opportunities, please reach out through GitHub.
