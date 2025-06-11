# Setup and Deployment Guide

This guide provides detailed instructions for setting up and deploying the Artefacto ML-Powered Event Management Platform.

## Prerequisites

### System Requirements
- **Python**: 3.8 or higher
- **Node.js**: 16.0 or higher
- **npm**: 8.0 or higher
- **Operating System**: macOS, Linux, or Windows
- **Memory**: Minimum 4GB RAM (8GB recommended)
- **Storage**: At least 1GB free space

### Required Accounts
- **Firebase Account**: For database and authentication
- **Stripe Account**: For payment processing (optional for development)

## Installation Steps

### 1. Environment Setup

```bash
# Navigate to the project directory
cd InnolabSS23/Code

# Create Python virtual environment (recommended)
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install Python dependencies
pip install -r requirements.txt

# Install Node.js dependencies
cd server
npm install
cd ..
```

### 2. Firebase Configuration

1. Create a new Firebase project at https://console.firebase.google.com/
2. Enable Authentication and Realtime Database
3. Update Firebase configuration in the following files:
   - `admin/js/firebase.js`
   - `customer/database/firebase.js`
   - `3d-Studio/files/assets/150769365/1/firebase-setup.js`

### 3. Database Setup

The platform uses two databases:

#### Firebase Realtime Database
- Stores events, users, and real-time data
- Automatically configured with Firebase setup

#### SQLite Analytics Database
```bash
cd ml-services
python -c "from analytics_dashboard import EventETLPipeline; etl = EventETLPipeline(); print('Database initialized')"
```

### 4. Service Startup

#### Method 1: Manual Startup (Development)

**Terminal 1 - ML Services:**
```bash
cd ml-services
python ml_api_service.py
```

**Terminal 2 - Web Server:**
```bash
cd server
node server.js
```

#### Method 2: Using Startup Script
```bash
cd ml-services
chmod +x start_ml_services.sh
./start_ml_services.sh
```

### 5. Verification

Once both services are running, verify the setup:

1. **Main Website**: http://localhost:3000
2. **Admin Panel**: http://localhost:3000/admin
3. **ML Analytics**: http://localhost:3000/admin/analytics
4. **ML API Health**: http://localhost:8000/health

## Configuration Options

### Environment Variables

Create a `.env` file in the root directory:

```bash
# Stripe Configuration (Optional)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key

# ML Service Configuration
ML_API_PORT=8000
WEB_SERVER_PORT=3000

# Database Configuration
FIREBASE_DATABASE_URL=https://your-project.firebaseio.com
ANALYTICS_DB_PATH=ml-services/event_analytics.db
```

### Firebase Security Rules

Configure Firebase security rules for production:

```json
{
  "rules": {
    "events": {
      ".read": true,
      ".write": "auth != null"
    },
    "users": {
      "$uid": {
        ".read": "$uid === auth.uid",
        ".write": "$uid === auth.uid"
      }
    }
  }
}
```

## Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Check which process is using the port
lsof -i :3000
lsof -i :8000

# Kill the process if needed
kill -9 <PID>
```

#### Python Dependencies Issues
```bash
# Upgrade pip and try again
pip install --upgrade pip
pip install -r requirements.txt --force-reinstall
```

#### Firebase Connection Issues
- Verify Firebase configuration keys
- Check network connectivity
- Ensure Firebase project is active

#### ML API Not Responding
```bash
# Check ML service logs
cd ml-services
tail -f ml_api.log
```

### Development Mode vs Production

#### Development Mode
- Uses local SQLite database
- Debug logging enabled
- Hot reload for development
- Mock data for testing

#### Production Mode
- Optimized database queries
- Error logging only
- Compressed static assets
- Real user data

## Performance Optimization

### Database Optimization
- Index frequently queried fields
- Implement database connection pooling
- Use pagination for large datasets

### ML Model Optimization
- Cache trained models
- Implement model versioning
- Use batch processing for recommendations

### Frontend Optimization
- Enable gzip compression
- Minify CSS/JavaScript
- Implement CDN for static assets

## Security Considerations

### Authentication
- Implement proper session management
- Use HTTPS in production
- Validate all user inputs

### API Security
- Implement rate limiting
- Use API authentication tokens
- Validate all API requests

### Database Security
- Use parameterized queries
- Implement proper access controls
- Regular security updates

## Deployment Options

### Local Development Server
- Perfect for development and testing
- Easy debugging and iteration
- Full feature access

### Cloud Deployment (Recommended)
- **Frontend**: Netlify, Vercel, or Firebase Hosting
- **Backend**: Heroku, DigitalOcean, or AWS
- **Database**: Firebase or MongoDB Atlas
- **ML Services**: Google Cloud Run or AWS Lambda

### Docker Deployment
```dockerfile
# Example Dockerfile for ML services
FROM python:3.9-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY ml-services/ .
EXPOSE 8000
CMD ["python", "ml_api_service.py"]
```

## Monitoring and Maintenance

### Health Checks
- Monitor API response times
- Check database connectivity
- Validate ML model performance

### Logging
- Application logs in `ml-services/ml_api.log`
- Error tracking for production issues
- Performance metrics collection

### Updates
- Regular dependency updates
- Security patch management
- Feature rollout procedures

## Support

For technical support or questions:
1. Check this documentation first
2. Review error logs
3. Consult the main README.md
4. Create an issue in the repository

## Next Steps

After successful setup:
1. Customize the Firebase configuration
2. Add your own event data
3. Configure Stripe for payments
4. Customize the UI/UX
5. Deploy to production

---

*This setup guide ensures a smooth deployment experience and professional operation of the Artefacto platform.*
