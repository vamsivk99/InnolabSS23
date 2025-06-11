"""
ML API Service - Integrated Machine Learning Microservice
RESTful API for serving ML models and analytics
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
import json
import logging
import traceback
from datetime import datetime
import os
import sys

# Add the ml-services directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from recommendation_engine import EventRecommendationEngine
from analytics_dashboard import EventETLPipeline, EventAnalyticsDashboard
from predictive_analytics import EventDemandPredictor, EventRecommendationOptimizer

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Global ML components
ml_services = {
    'recommendation_engine': None,
    'demand_predictor': None,
    'analytics_dashboard': None,
    'etl_pipeline': None,
    'recommendation_optimizer': None
}

# Configuration
CONFIG = {
    'events_json_path': '/Users/vamsikrishna/Desktop/My Courses/2nd Sem courses/Innolab SS23/bingo-ug/InnolabSS23/Code/admin/file/events.json',
    'db_path': 'event_analytics.db',
    'model_path': 'demand_prediction_model.joblib'
}

def initialize_ml_services():
    """Initialize all ML services"""
    try:
        logger.info("Initializing ML services...")
        
        # Initialize ETL Pipeline
        ml_services['etl_pipeline'] = EventETLPipeline(CONFIG['db_path'])
        
        # Run ETL pipeline if database doesn't exist
        if not os.path.exists(CONFIG['db_path']):
            logger.info("Running initial ETL pipeline...")
            ml_services['etl_pipeline'].run_full_etl_pipeline(CONFIG['events_json_path'])
        
        # Initialize Recommendation Engine
        ml_services['recommendation_engine'] = EventRecommendationEngine()
        ml_services['recommendation_engine'].load_and_prepare_data(CONFIG['events_json_path'])
        ml_services['recommendation_engine'].train_recommendation_models()
        
        # Initialize Demand Predictor
        ml_services['demand_predictor'] = EventDemandPredictor(CONFIG['db_path'])
        
        # Train demand predictor if model doesn't exist
        if not os.path.exists(CONFIG['model_path']):
            logger.info("Training demand prediction models...")
            modeling_df = ml_services['demand_predictor'].prepare_modeling_dataset()
            ml_services['demand_predictor'].train_demand_prediction_models(modeling_df)
        else:
            ml_services['demand_predictor'].load_model(CONFIG['model_path'])
        
        # Initialize Analytics Dashboard
        ml_services['analytics_dashboard'] = EventAnalyticsDashboard(CONFIG['db_path'])
        
        # Initialize Recommendation Optimizer
        ml_services['recommendation_optimizer'] = EventRecommendationOptimizer(
            ml_services['demand_predictor']
        )
        
        logger.info("All ML services initialized successfully")
        
    except Exception as e:
        logger.error(f"Error initializing ML services: {e}")
        raise

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'services': {
            'recommendation_engine': ml_services['recommendation_engine'] is not None,
            'demand_predictor': ml_services['demand_predictor'] is not None,
            'analytics_dashboard': ml_services['analytics_dashboard'] is not None,
            'etl_pipeline': ml_services['etl_pipeline'] is not None,
            'recommendation_optimizer': ml_services['recommendation_optimizer'] is not None
        }
    })

@app.route('/api/recommendations', methods=['POST'])
def get_recommendations():
    """Get personalized event recommendations for a user"""
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        n_recommendations = data.get('n_recommendations', 10)
        
        if not user_id:
            return jsonify({'error': 'user_id is required'}), 400
        
        # Get recommendations
        recommendations = ml_services['recommendation_engine'].get_recommendations(
            user_id, n_recommendations
        )
        
        return jsonify({
            'status': 'success',
            'user_id': user_id,
            'recommendations': recommendations,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Error getting recommendations: {e}")
        return jsonify({
            'error': 'Internal server error',
            'message': str(e)
        }), 500

@app.route('/api/demand/predict', methods=['POST'])
def predict_demand():
    """Predict demand for an event"""
    try:
        data = request.get_json()
        event_features = data.get('event_features')
        
        if not event_features:
            return jsonify({'error': 'event_features is required'}), 400
        
        # Predict demand
        prediction = ml_services['demand_predictor'].predict_event_demand(event_features)
        
        return jsonify({
            'status': 'success',
            'prediction': prediction,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Error predicting demand: {e}")
        return jsonify({
            'error': 'Internal server error',
            'message': str(e)
        }), 500

@app.route('/api/event/optimize', methods=['POST'])
def optimize_event():
    """Optimize event features to improve demand"""
    try:
        data = request.get_json()
        base_event = data.get('base_event')
        target_demand = data.get('target_demand', 20)
        
        if not base_event:
            return jsonify({'error': 'base_event is required'}), 400
        
        # Optimize event
        optimization = ml_services['demand_predictor'].optimize_event_features(
            base_event, target_demand
        )
        
        return jsonify({
            'status': 'success',
            'optimization': optimization,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Error optimizing event: {e}")
        return jsonify({
            'error': 'Internal server error',
            'message': str(e)
        }), 500

@app.route('/api/lineup/optimize', methods=['POST'])
def optimize_lineup():
    """Optimize event lineup for maximum demand"""
    try:
        data = request.get_json()
        events_list = data.get('events_list')
        target_total_demand = data.get('target_total_demand', 200)
        max_events = data.get('max_events', 10)
        
        if not events_list:
            return jsonify({'error': 'events_list is required'}), 400
        
        # Optimize lineup
        optimization = ml_services['recommendation_optimizer'].optimize_event_lineup(
            events_list, target_total_demand, max_events
        )
        
        return jsonify({
            'status': 'success',
            'optimization': optimization,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Error optimizing lineup: {e}")
        return jsonify({
            'error': 'Internal server error',
            'message': str(e)
        }), 500

@app.route('/api/analytics/overview', methods=['GET'])
def get_analytics_overview():
    """Get comprehensive analytics overview"""
    try:
        # Generate analytics report
        report = ml_services['analytics_dashboard'].generate_comprehensive_report()
        
        return jsonify({
            'status': 'success',
            'analytics': report,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Error getting analytics overview: {e}")
        return jsonify({
            'error': 'Internal server error',
            'message': str(e)
        }), 500

@app.route('/api/insights/demand', methods=['GET'])
def get_demand_insights():
    """Get demand prediction insights"""
    try:
        # Generate demand insights
        insights = ml_services['demand_predictor'].generate_demand_insights()
        
        return jsonify({
            'status': 'success',
            'insights': insights,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Error getting demand insights: {e}")
        return jsonify({
            'error': 'Internal server error',
            'message': str(e)
        }), 500

@app.route('/api/model/performance', methods=['GET'])
def get_model_performance():
    """Get ML model performance metrics"""
    try:
        # Get recommendation engine performance
        rec_metrics = ml_services['recommendation_engine'].evaluate_model_performance()
        rec_stats = ml_services['recommendation_engine'].get_model_statistics()
        
        # Get demand predictor performance
        demand_insights = ml_services['demand_predictor'].generate_demand_insights()
        
        performance_data = {
            'recommendation_engine': {
                'metrics': rec_metrics,
                'statistics': rec_stats
            },
            'demand_predictor': {
                'model_performance': demand_insights.get('model_performance', {}),
                'feature_importance': demand_insights.get('top_features', {})
            }
        }
        
        return jsonify({
            'status': 'success',
            'performance': performance_data,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Error getting model performance: {e}")
        return jsonify({
            'error': 'Internal server error',
            'message': str(e)
        }), 500

@app.route('/api/data/refresh', methods=['POST'])
def refresh_data():
    """Refresh data and retrain models"""
    try:
        logger.info("Starting data refresh and model retraining...")
        
        # Run ETL pipeline
        ml_services['etl_pipeline'].run_full_etl_pipeline(CONFIG['events_json_path'])
        
        # Retrain recommendation engine
        ml_services['recommendation_engine'].load_and_prepare_data(CONFIG['events_json_path'])
        ml_services['recommendation_engine'].train_recommendation_models()
        
        # Retrain demand predictor
        modeling_df = ml_services['demand_predictor'].prepare_modeling_dataset()
        ml_services['demand_predictor'].train_demand_prediction_models(modeling_df)
        
        return jsonify({
            'status': 'success',
            'message': 'Data refreshed and models retrained successfully',
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Error refreshing data: {e}")
        return jsonify({
            'error': 'Internal server error',
            'message': str(e)
        }), 500

@app.route('/api/batch/recommendations', methods=['POST'])
def batch_recommendations():
    """Get recommendations for multiple users in batch"""
    try:
        data = request.get_json()
        user_ids = data.get('user_ids', [])
        n_recommendations = data.get('n_recommendations', 5)
        
        if not user_ids:
            return jsonify({'error': 'user_ids list is required'}), 400
        
        batch_results = {}
        for user_id in user_ids:
            try:
                recommendations = ml_services['recommendation_engine'].get_recommendations(
                    user_id, n_recommendations
                )
                batch_results[user_id] = {
                    'status': 'success',
                    'recommendations': recommendations
                }
            except Exception as e:
                batch_results[user_id] = {
                    'status': 'error',
                    'error': str(e)
                }
        
        return jsonify({
            'status': 'success',
            'batch_results': batch_results,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Error in batch recommendations: {e}")
        return jsonify({
            'error': 'Internal server error',
            'message': str(e)
        }), 500

@app.route('/api/similar/events', methods=['POST'])
def find_similar_events():
    """Find similar events based on content similarity"""
    try:
        data = request.get_json()
        event_id = data.get('event_id')
        n_similar = data.get('n_similar', 5)
        
        if event_id is None:
            return jsonify({'error': 'event_id is required'}), 400
        
        # Get content similarity from recommendation engine
        engine = ml_services['recommendation_engine']
        
        # Find event index
        event_idx = engine.events_df[engine.events_df['eventId'] == event_id].index
        if len(event_idx) == 0:
            return jsonify({'error': 'Event not found'}), 404
        
        event_idx = event_idx[0]
        
        # Get similarity scores
        similarities = engine.content_similarity[event_idx]
        
        # Get top similar events (excluding the event itself)
        similar_indices = np.argsort(similarities)[::-1][1:n_similar+1]
        
        similar_events = []
        for idx in similar_indices:
            event_data = engine.events_df.iloc[idx]
            similar_events.append({
                'event_id': event_data['eventId'],
                'title': event_data['title'],
                'category': event_data['category'],
                'similarity_score': similarities[idx]
            })
        
        return jsonify({
            'status': 'success',
            'event_id': event_id,
            'similar_events': similar_events,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Error finding similar events: {e}")
        return jsonify({
            'error': 'Internal server error',
            'message': str(e)
        }), 500

@app.route('/api/trends/analysis', methods=['GET'])
def get_trends_analysis():
    """Get trend analysis and predictions"""
    try:
        # Get analytics data
        report = ml_services['analytics_dashboard'].generate_comprehensive_report()
        
        # Extract trend data
        trends_data = {
            'category_trends': report['trend_analysis']['category_trends'],
            'weekly_registrations': report['trend_analysis']['weekly_registrations'],
            'engagement_trends': report['engagement_metrics']['daily_trends'],
            'category_performance': report['category_performance']['category_metrics']
        }
        
        # Add forecasting insights
        insights = ml_services['demand_predictor'].generate_demand_insights()
        trends_data['demand_patterns'] = insights['category_demand_patterns']
        
        return jsonify({
            'status': 'success',
            'trends': trends_data,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Error getting trends analysis: {e}")
        return jsonify({
            'error': 'Internal server error',
            'message': str(e)
        }), 500

@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors"""
    return jsonify({
        'error': 'Endpoint not found',
        'message': 'The requested API endpoint does not exist'
    }), 404

@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors"""
    return jsonify({
        'error': 'Internal server error',
        'message': 'An unexpected error occurred'
    }), 500

def create_api_documentation():
    """Create API documentation"""
    docs = {
        'title': 'Event ML API Service',
        'version': '1.0.0',
        'description': 'RESTful API for event management machine learning services',
        'endpoints': {
            'GET /health': 'Health check for all ML services',
            'POST /api/recommendations': 'Get personalized event recommendations',
            'POST /api/demand/predict': 'Predict event demand',
            'POST /api/event/optimize': 'Optimize event features for better demand',
            'POST /api/lineup/optimize': 'Optimize event lineup for maximum demand',
            'GET /api/analytics/overview': 'Get comprehensive analytics overview',
            'GET /api/insights/demand': 'Get demand prediction insights',
            'GET /api/model/performance': 'Get ML model performance metrics',
            'POST /api/data/refresh': 'Refresh data and retrain models',
            'POST /api/batch/recommendations': 'Get batch recommendations for multiple users',
            'POST /api/similar/events': 'Find similar events',
            'GET /api/trends/analysis': 'Get trend analysis and predictions'
        },
        'examples': {
            'recommendations': {
                'method': 'POST',
                'url': '/api/recommendations',
                'payload': {
                    'user_id': 'user_001',
                    'n_recommendations': 5
                }
            },
            'demand_prediction': {
                'method': 'POST',
                'url': '/api/demand/predict',
                'payload': {
                    'event_features': {
                        'title': 'Summer Jazz Concert',
                        'category': 'Music Concerts',
                        'event_cost': 25.0,
                        'event_month': 7
                    }
                }
            }
        }
    }
    
    return docs

@app.route('/api/docs', methods=['GET'])
def get_api_docs():
    """Get API documentation"""
    docs = create_api_documentation()
    return jsonify(docs)

if __name__ == '__main__':
    try:
        print("Starting Event ML API Service...")
        
        # Initialize ML services
        initialize_ml_services()
        
        print("ML services initialized successfully")
        print("📚 API Documentation available at: http://localhost:5000/api/docs")
        print("🏥 Health check available at: http://localhost:5000/health")
        print("🌐 Starting Flask server...")
        
        # Start Flask app
        app.run(debug=True, host='0.0.0.0', port=5000)
        
    except Exception as e:
        print(f"Error starting ML API service: {e}")
        traceback.print_exc()
