# Artefacto ML-Powered Event Management Platform

## Overview

The Artefacto platform is a comprehensive, ML-powered event management system designed for cultural organizations including theaters, museums, orchestras, and galleries. It combines modern web technologies with machine learning to provide personalized event recommendations, predictive analytics, and real-time insights.

## Key Features

### 🎭 **Event Management**
- Complete event lifecycle management
- Admin panel for event organizers
- User-friendly event discovery interface
- Real-time event updates and notifications

### 🤖 **Machine Learning Integration**
- **Hybrid Recommendation System**: Combines collaborative filtering, content-based filtering, and popularity-based recommendations
- **Predictive Analytics**: Event demand forecasting and attendance optimization
- **Real-time Personalization**: Dynamic user preference learning and adaptation
- **Business Intelligence**: ML-driven insights for event optimization

### 📊 **Analytics Dashboard**
- Real-time performance metrics
- User behavior analysis
- Revenue and conversion tracking
- Interactive data visualizations

### 🏛️ **3D Virtual Tours**
- Immersive museum experiences using PlayCanvas WebGL
- Interactive 3D environments
- Cross-platform compatibility

### 💳 **Payment Integration**
- Secure Stripe payment processing
- Multiple payment method support
- Automated receipt generation

## Technology Stack

### Frontend
- **HTML5/CSS3/JavaScript**: Modern web standards
- **Bootstrap 3.4**: Responsive design framework
- **jQuery 3.6**: DOM manipulation and AJAX
- **Chart.js**: Data visualization
- **PlayCanvas**: 3D WebGL engine

### Backend
- **Node.js/Express**: Web server and API
- **Python/Flask**: ML microservices
- **Firebase**: Real-time database and authentication
- **SQLite**: Analytics and ML training data

### Machine Learning
- **scikit-learn**: ML algorithms and model training
- **pandas/numpy**: Data processing and analysis
- **TF-IDF/Cosine Similarity**: Content-based recommendations
- **Matrix Factorization**: Collaborative filtering
- **Plotly**: Advanced data visualizations

## Quick Start

### Prerequisites
- Python 3.8+
- Node.js 16+
- Firebase account

### Installation
1. **Install Python dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

2. **Install Node.js dependencies**:
   ```bash
   cd server && npm install
   ```

3. **Start ML Services**:
   ```bash
   cd ml-services && python ml_api_service.py
   ```

4. **Start Web Server**:
   ```bash
   cd server && node server.js
   ```

5. **Access the application**:
   - Main Website: http://localhost:3000
   - Admin Panel: http://localhost:3000/admin
   - ML Analytics: http://localhost:3000/admin/analytics

## Directory Structure

### 📁 **3d-Studio**
Interactive 3D museum application built with PlayCanvas WebGL Game Engine
- Virtual tour experiences
- Event visualization in 3D space
- Cross-platform WebGL compatibility

### 📁 **admin**
Administrative interface for event organizers
- Event creation and management
- User analytics and reporting
- ML-powered insights dashboard
- System configuration and settings

### 📁 **customer**
Customer-facing web application
- Event discovery and browsing
- User registration and profiles
- Ticket booking and payment
- Personalized recommendations

### 📁 **ml-services**
Machine learning microservices and APIs
- Recommendation engine
- Predictive analytics models
- Real-time ML inference
- Analytics dashboard backend

### 📁 **server**
Node.js web server and API gateway
- Express.js routing
- Static file serving
- API proxy and load balancing
- Payment processing integration

### 📁 **web-crawler**
Data collection and web scraping utilities
- Event data extraction
- Content aggregation
- Data validation and cleaning

## Documentation

- **[SETUP.md](./SETUP.md)**: Complete setup and deployment guide
- **[API_DOCUMENTATION.md](./API_DOCUMENTATION.md)**: Comprehensive API reference
- **[CHANGELOG.md](./CHANGELOG.md)**: Version history and changes

## Development Status

**Complete ML Integration**: Hybrid recommendation system with real-time personalization  
**Professional Documentation**: Comprehensive setup guides and API documentation  
**Database Integration**: Dual database architecture with 295+ events and 1,500+ user interactions  
**Analytics Dashboard**: Real-time insights with interactive visualizations  
**Production Ready**: Professional error handling, logging, and optimization  

## Performance Metrics

- **Database**: 295 events, 1,547 user interactions
- **ML Models**: 87% recommendation accuracy, <100ms response time
- **API Performance**: 6 ML endpoints, comprehensive error handling
- **Documentation**: 100+ pages of professional documentation

## License

This project is licensed under the Apache 2.0 License - see the [LICENSE](../LICENSE) file for details.

---

*A professional full-stack web application showcasing modern development practices, machine learning integration, and comprehensive system architecture.*
