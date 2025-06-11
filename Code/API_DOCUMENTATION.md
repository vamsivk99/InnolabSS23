# API Documentation

## Overview

The Artefacto platform provides comprehensive REST APIs for event management, machine learning services, and analytics. This documentation covers all available endpoints and their usage.

## Base URLs

- **Web Server**: `http://localhost:3000`
- **ML API Service**: `http://localhost:8000`

## Authentication

Most endpoints require Firebase authentication. Include the authentication token in the Authorization header:

```
Authorization: Bearer <firebase-id-token>
```

## ML API Endpoints

### Health Check

**GET** `/health`

Check the health status of the ML service.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-06-11T10:30:00Z",
  "services": {
    "recommendation_engine": "active",
    "analytics_dashboard": "active",
    "predictive_analytics": "active"
  }
}
```

### Analytics Summary

**GET** `/analytics/summary`

Get comprehensive analytics summary for events and user interactions.

**Response:**
```json
{
  "total_events": 295,
  "total_users": 1547,
  "total_interactions": 8234,
  "avg_rating": 4.2,
  "popular_categories": ["Theater", "Music", "Art"],
  "monthly_growth": 12.5
}
```

### Analytics Insights

**GET** `/analytics/insights`

Get ML-driven insights and recommendations for event optimization.

**Response:**
```json
{
  "insights": [
    {
      "type": "trend",
      "message": "Theater events show 25% higher engagement on weekends",
      "confidence": 0.87
    },
    {
      "type": "optimization",
      "message": "Events priced between €15-25 have highest conversion rates",
      "confidence": 0.92
    }
  ],
  "recommendations": [
    "Schedule more theater events on weekends",
    "Optimize pricing strategy for better conversions"
  ]
}
```

### Trending Events

**GET** `/trending-events`

**Query Parameters:**
- `user_id` (optional): User ID for personalized recommendations
- `limit` (optional): Number of events to return (default: 10)
- `category` (optional): Filter by event category

**Response:**
```json
{
  "recommendations": [
    {
      "event_id": "evt_123",
      "title": "Classical Music Concert",
      "category": "Music",
      "predicted_score": 0.89,
      "reasoning": "Based on your music preferences and similar user behavior"
    }
  ],
  "metadata": {
    "algorithm": "hybrid_collaborative_content",
    "confidence": 0.85,
    "processing_time_ms": 45
  }
}
```

### Model Performance

**GET** `/model-performance`

Get current ML model performance metrics.

**Response:**
```json
{
  "recommendation_model": {
    "accuracy": 0.87,
    "precision": 0.82,
    "recall": 0.79,
    "f1_score": 0.80,
    "last_updated": "2025-06-10T14:30:00Z"
  },
  "demand_prediction_model": {
    "mae": 12.5,
    "rmse": 18.3,
    "r2_score": 0.76,
    "last_updated": "2025-06-10T14:30:00Z"
  }
}
```

### Optimization Suggestions

**GET** `/optimization/suggestions`

Get AI-powered suggestions for event optimization.

**Response:**
```json
{
  "suggestions": [
    {
      "category": "pricing",
      "suggestion": "Reduce ticket prices by 10% for events with low predicted demand",
      "expected_impact": "+15% attendance",
      "confidence": 0.78
    },
    {
      "category": "scheduling",
      "suggestion": "Schedule art exhibitions on weekday evenings",
      "expected_impact": "+20% engagement",
      "confidence": 0.85
    }
  ]
}
```

## Web Server API Endpoints

### Event Management

**GET** `/api/events`
Get all events with optional filtering.

**GET** `/api/events/:id`
Get specific event details.

**POST** `/api/events`
Create a new event (Admin only).

**PUT** `/api/events/:id`
Update event details (Admin only).

**DELETE** `/api/events/:id`
Delete an event (Admin only).

### User Management

**GET** `/api/users/profile`
Get current user profile.

**PUT** `/api/users/profile`
Update user profile.

**GET** `/api/users/events`
Get user's registered events.

### Payment Processing

**POST** `/pay`

Process payment for event tickets.

**Request Body:**
```json
{
  "token": "stripe_token_here",
  "amount": 2500,
  "currency": "eur",
  "event_id": "evt_123",
  "user_id": "user_456"
}
```

**Response:**
```json
{
  "success": true,
  "charge_id": "ch_1234567890",
  "receipt_url": "https://pay.stripe.com/receipts/..."
}
```

## Error Handling

All APIs use standard HTTP status codes and return error details in a consistent format:

### Success Responses
- **200 OK**: Request successful
- **201 Created**: Resource created successfully
- **204 No Content**: Request successful, no content to return

### Error Responses
- **400 Bad Request**: Invalid request parameters
- **401 Unauthorized**: Authentication required
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Resource not found
- **429 Too Many Requests**: Rate limit exceeded
- **500 Internal Server Error**: Server error

### Error Response Format
```json
{
  "error": {
    "code": "INVALID_PARAMETERS",
    "message": "The request parameters are invalid",
    "details": {
      "field": "user_id",
      "issue": "User ID is required for personalized recommendations"
    }
  }
}
```

## Rate Limiting

API endpoints are rate-limited to ensure fair usage:

- **ML API**: 100 requests per minute per IP
- **Web API**: 1000 requests per minute per authenticated user
- **Public endpoints**: 50 requests per minute per IP

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1623456789
```

## SDK and Client Libraries

### JavaScript SDK

```javascript
// Initialize the API client
const artefactoAPI = new ArtefactoAPI({
  baseURL: 'http://localhost:8000',
  authToken: 'your-firebase-token'
});

// Get recommendations
const recommendations = await artefactoAPI.getTrendingEvents({
  userId: 'user123',
  limit: 5
});

// Get analytics
const analytics = await artefactoAPI.getAnalyticsSummary();
```

### Python SDK

```python
from artefacto_client import ArtefactoClient

# Initialize client
client = ArtefactoClient(
    base_url='http://localhost:8000',
    auth_token='your-firebase-token'
)

# Get recommendations
recommendations = client.get_trending_events(
    user_id='user123',
    limit=5
)

# Get analytics
analytics = client.get_analytics_summary()
```

## Webhooks

The platform supports webhooks for real-time event notifications:

### Event Types
- `event.created`: New event created
- `event.updated`: Event details updated
- `user.registered`: User registered for event
- `payment.completed`: Payment processed successfully

### Webhook Payload
```json
{
  "event_type": "event.created",
  "timestamp": "2025-06-11T10:30:00Z",
  "data": {
    "event_id": "evt_123",
    "title": "New Concert",
    "category": "Music"
  }
}
```

## Testing

### API Testing

Use the provided test script to verify API functionality:

```bash
cd ml-services
python test_api.py
```

### Sample Requests

**cURL Examples:**

```bash
# Health check
curl -X GET http://localhost:8000/health

# Get recommendations
curl -X GET "http://localhost:8000/trending-events?user_id=user123&limit=5"

# Get analytics
curl -X GET http://localhost:8000/analytics/summary
```

**Postman Collection:**

Import the provided Postman collection for comprehensive API testing:
- Collection includes all endpoints
- Pre-configured authentication
- Sample requests and responses

## Monitoring and Logging

### API Metrics
- Response times
- Error rates
- Request volumes
- Popular endpoints

### Logging Format
```
[2025-06-11 10:30:00] INFO: GET /trending-events - 200 - 45ms
[2025-06-11 10:30:05] ERROR: GET /analytics/summary - 500 - Database connection failed
```

## Versioning

The API uses semantic versioning:
- **v1.0.0**: Initial release
- **v1.1.0**: Added optimization suggestions
- **v1.2.0**: Enhanced recommendation algorithms

Version is specified in the URL path:
```
http://localhost:8000/v1/trending-events
```

## Support

For API support:
1. Check this documentation
2. Review error logs
3. Test with provided examples
4. Contact development team

---

*This API documentation provides comprehensive coverage of all available endpoints and their proper usage for the Artefacto platform.*
