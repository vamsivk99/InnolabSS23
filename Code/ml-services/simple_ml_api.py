#!/usr/bin/env python3
"""
Simple ML API Service for Event Management System
Provides analytics and recommendation endpoints
"""

from flask import Flask, jsonify, request
from flask_cors import CORS
import json
import sqlite3
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

@app.route('/api/analytics/overview', methods=['GET'])
def get_analytics_overview():
    """Get overview analytics metrics"""
    try:
        conn = sqlite3.connect('event_analytics.db')
        cursor = conn.cursor()
        
        # Get overview metrics
        cursor.execute('SELECT COUNT(*) FROM events')
        total_events = cursor.fetchone()[0]
        
        cursor.execute('SELECT COUNT(DISTINCT user_id) FROM user_interactions')
        total_users = cursor.fetchone()[0]
        
        cursor.execute('SELECT COUNT(*) FROM user_interactions')
        total_interactions = cursor.fetchone()[0]
        
        cursor.execute('SELECT AVG(rating) FROM user_interactions WHERE rating IS NOT NULL')
        avg_rating = cursor.fetchone()[0] or 0
        
        # Get top categories
        cursor.execute('''
            SELECT e.category, COUNT(*) as interaction_count
            FROM events e
            JOIN user_interactions ui ON e.event_id = ui.event_id
            GROUP BY e.category
            ORDER BY interaction_count DESC
            LIMIT 5
        ''')
        top_categories = [{'category': row[0], 'count': row[1]} for row in cursor.fetchall()]
        
        conn.close()
        
        return jsonify({
            'success': True,
            'data': {
                'total_events': total_events,
                'total_users': total_users,
                'total_interactions': total_interactions,
                'avg_rating': round(avg_rating, 2),
                'top_categories': top_categories
            }
        })
    except Exception as e:
        logger.error(f"Error getting analytics overview: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/recommendations/<user_id>', methods=['GET'])
def get_recommendations(user_id):
    """Get event recommendations for a user"""
    try:
        # Load events data
        events_file = '/Users/vamsikrishna/Desktop/My Courses/2nd Sem courses/Innolab SS23/bingo-ug/InnolabSS23/Code/admin/file/events.json'
        with open(events_file, 'r', encoding='utf-8') as f:
            events = json.load(f)
        
        # Simple recommendation: return top 5 events by category popularity
        conn = sqlite3.connect('event_analytics.db')
        cursor = conn.cursor()
        
        # Get user's preferred categories if they exist
        cursor.execute('''
            SELECT e.category, COUNT(*) as interaction_count
            FROM events e
            JOIN user_interactions ui ON e.event_id = ui.event_id
            WHERE ui.user_id = ? AND ui.rating >= 4.0
            GROUP BY e.category
            ORDER BY interaction_count DESC
            LIMIT 3
        ''', (user_id,))
        
        preferred_categories = [row[0] for row in cursor.fetchall()]
        conn.close()
        
        # Filter events by preferred categories or return popular ones
        recommendations = []
        if preferred_categories:
            for event in events:
                if event.get('category') in preferred_categories:
                    recommendations.append(event)
                if len(recommendations) >= 5:
                    break
        
        # Fill remaining slots with popular events
        if len(recommendations) < 5:
            for event in events:
                if event not in recommendations:
                    recommendations.append(event)
                if len(recommendations) >= 5:
                    break
        
        return jsonify({
            'success': True,
            'data': {
                'user_id': user_id,
                'recommendations': recommendations[:5],
                'preferred_categories': preferred_categories
            }
        })
    except Exception as e:
        logger.error(f"Error getting recommendations for user {user_id}: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/events/popular', methods=['GET'])
def get_popular_events():
    """Get most popular events based on interactions"""
    try:
        conn = sqlite3.connect('event_analytics.db')
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT e.title, e.category, COUNT(*) as interaction_count, AVG(ui.rating) as avg_rating
            FROM events e
            JOIN user_interactions ui ON e.event_id = ui.event_id
            GROUP BY e.event_id
            ORDER BY interaction_count DESC
            LIMIT 10
        ''')
        
        popular_events = []
        for row in cursor.fetchall():
            popular_events.append({
                'title': row[0],
                'category': row[1],
                'interaction_count': row[2],
                'avg_rating': round(row[3], 2) if row[3] else 0
            })
        
        conn.close()
        
        return jsonify({
            'success': True,
            'data': popular_events
        })
    except Exception as e:
        logger.error(f"Error getting popular events: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'success': True,
        'message': 'ML API Service is running',
        'endpoints': [
            '/api/analytics/overview',
            '/api/recommendations/<user_id>',
            '/api/events/popular',
            '/api/health'
        ]
    })

if __name__ == '__main__':
    logger.info("Starting Simple ML API Service on port 8000...")
    app.run(host='0.0.0.0', port=8000, debug=True)
