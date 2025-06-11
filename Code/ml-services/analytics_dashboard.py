"""
Event Analytics Dashboard & ETL Pipeline
Comprehensive data processing and analytics for event management system
"""

import pandas as pd
import numpy as np
import json
import sqlite3
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Tuple, Optional, Any
import plotly.graph_objects as go
import plotly.express as px
from plotly.subplots import make_subplots
import warnings
warnings.filterwarnings('ignore')

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class EventETLPipeline:
    """
    ETL Pipeline for event data processing
    Demonstrates data engineering skills: Extract, Transform, Load
    """
    
    def __init__(self, db_path: str = "event_analytics.db"):
        self.db_path = db_path
        self.connection = None
        self._setup_database()
        logger.info("ETL Pipeline initialized")
    
    def _setup_database(self):
        """Initialize SQLite database with proper schema"""
        try:
            self.connection = sqlite3.connect(self.db_path)
            cursor = self.connection.cursor()
            
            # Events table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS events (
                    event_id INTEGER PRIMARY KEY,
                    title TEXT NOT NULL,
                    category TEXT,
                    description TEXT,
                    from_date TEXT,
                    to_date TEXT,
                    ticket_link TEXT,
                    event_cost REAL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    popularity_score REAL DEFAULT 0.0
                )
            """)
            
            # User interactions table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS user_interactions (
                    interaction_id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id TEXT NOT NULL,
                    event_id INTEGER,
                    interaction_type TEXT,
                    rating REAL,
                    timestamp TIMESTAMP,
                    session_duration INTEGER,
                    FOREIGN KEY (event_id) REFERENCES events (event_id)
                )
            """)
            
            # User profiles table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS user_profiles (
                    user_id TEXT PRIMARY KEY,
                    name TEXT,
                    email TEXT,
                    preferences TEXT,
                    location TEXT,
                    age_group TEXT,
                    registration_date TIMESTAMP,
                    total_events_attended INTEGER DEFAULT 0
                )
            """)
            
            # Analytics summary table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS analytics_summary (
                    summary_date DATE PRIMARY KEY,
                    total_events INTEGER,
                    total_users INTEGER,
                    total_interactions INTEGER,
                    avg_rating REAL,
                    top_category TEXT,
                    active_users INTEGER,
                    conversion_rate REAL
                )
            """)
            
            self.connection.commit()
            logger.info("Database schema initialized successfully")
            
        except Exception as e:
            logger.error(f"Error setting up database: {e}")
            raise
    
    def extract_events_data(self, json_file_path: str) -> pd.DataFrame:
        """Extract events data from JSON file"""
        try:
            with open(json_file_path, 'r', encoding='utf-8') as f:
                events_data = json.load(f)
            
            df = pd.DataFrame(events_data)
            logger.info(f"Extracted {len(df)} events from {json_file_path}")
            return df
            
        except Exception as e:
            logger.error(f"Error extracting events data: {e}")
            raise
    
    def transform_events_data(self, df: pd.DataFrame) -> pd.DataFrame:
        """Transform and clean events data"""
        try:
            # Data cleaning
            df_clean = df.copy()
            
            # Handle missing values
            df_clean['title'] = df_clean['title'].fillna('Unknown Event')
            df_clean['category'] = df_clean['category'].fillna('Other')
            df_clean['description'] = df_clean['description'].fillna('')
            df_clean['event_cost'] = pd.to_numeric(df_clean['event_cost'], errors='coerce').fillna(0.0)
            
            # Create event_id if not present
            if 'event_id' not in df_clean.columns:
                df_clean['event_id'] = range(len(df_clean))
            
            # Parse dates
            df_clean['from_date_parsed'] = pd.to_datetime(df_clean['fromDate'], errors='coerce')
            df_clean['to_date_parsed'] = pd.to_datetime(df_clean['toDate'], errors='coerce')
            
            # Calculate event duration
            df_clean['event_duration_days'] = (
                df_clean['to_date_parsed'] - df_clean['from_date_parsed']
            ).dt.days
            
            # Extract features for analysis
            df_clean['title_length'] = df_clean['title'].str.len()
            df_clean['description_length'] = df_clean['description'].str.len()
            df_clean['has_cost'] = df_clean['event_cost'] > 0
            
            # Calculate popularity score based on multiple factors
            df_clean['popularity_score'] = self._calculate_popularity_score(df_clean)
            
            # Select relevant columns for database
            columns_to_keep = [
                'event_id', 'title', 'category', 'description',
                'fromDate', 'toDate', 'ticketLink', 'event_cost', 'popularity_score'
            ]
            
            df_transformed = df_clean[columns_to_keep].rename(columns={
                'fromDate': 'from_date',
                'toDate': 'to_date',
                'ticketLink': 'ticket_link'
            })
            
            logger.info(f"Transformed {len(df_transformed)} events successfully")
            return df_transformed
            
        except Exception as e:
            logger.error(f"Error transforming events data: {e}")
            raise
    
    def _calculate_popularity_score(self, df: pd.DataFrame) -> pd.Series:
        """Calculate popularity score based on various factors"""
        # Category frequency score
        category_counts = df['category'].value_counts()
        category_score = df['category'].map(category_counts) / category_counts.max()
        
        # Title length score (longer titles might be more descriptive)
        title_score = (df['title'].str.len() / df['title'].str.len().max()).fillna(0)
        
        # Description score
        desc_score = (df['description'].str.len() / df['description'].str.len().max()).fillna(0)
        
        # Has cost penalty (free events might be more popular)
        cost_score = 1 - (df['event_cost'] > 0).astype(int) * 0.2
        
        # Combined score
        popularity = (
            0.4 * category_score +
            0.2 * title_score +
            0.2 * desc_score +
            0.2 * cost_score
        )
        
        return popularity
    
    def load_events_to_database(self, df: pd.DataFrame):
        """Load transformed events data to database"""
        try:
            df.to_sql('events', self.connection, if_exists='replace', index=False)
            self.connection.commit()
            logger.info(f"Loaded {len(df)} events to database")
            
        except Exception as e:
            logger.error(f"Error loading events to database: {e}")
            raise
    
    def generate_synthetic_user_data(self, n_users: int = 100):
        """Generate synthetic user profiles and interactions for demo"""
        try:
            np.random.seed(42)
            
            # Generate user profiles
            user_profiles = []
            for i in range(n_users):
                user_id = f"user_{i:03d}"
                preferences = np.random.choice(
                    ['Music Concerts', 'Art Exhibitions', 'Dance Performances', 'Street Show', 'Theater'],
                    size=np.random.randint(1, 4),
                    replace=False
                ).tolist()
                
                user_profiles.append({
                    'user_id': user_id,
                    'name': f'User {i}',
                    'email': f'user{i}@example.com',
                    'preferences': json.dumps(preferences),
                    'location': np.random.choice(['Nuremberg', 'Erlangen', 'Munich', 'Berlin']),
                    'age_group': np.random.choice(['18-25', '26-35', '36-45', '46-55', '55+']),
                    'registration_date': datetime.now() - timedelta(days=np.random.randint(1, 365)),
                    'total_events_attended': np.random.randint(0, 20)
                })
            
            # Load user profiles to database
            users_df = pd.DataFrame(user_profiles)
            users_df.to_sql('user_profiles', self.connection, if_exists='replace', index=False)
            
            # Generate user interactions
            interactions = []
            events_df = pd.read_sql("SELECT event_id, category FROM events", self.connection)
            
            for user_profile in user_profiles:
                user_id = user_profile['user_id']
                user_preferences = json.loads(user_profile['preferences'])
                
                # Number of interactions for this user
                n_interactions = np.random.poisson(15)
                
                for _ in range(n_interactions):
                    # Select event (bias towards user preferences)
                    if np.random.random() < 0.7:  # 70% chance to interact with preferred categories
                        preferred_events = events_df[events_df['category'].isin(user_preferences)]
                        if len(preferred_events) > 0:
                            event_id = np.random.choice(preferred_events['event_id'])
                        else:
                            event_id = np.random.choice(events_df['event_id'])
                    else:
                        event_id = np.random.choice(events_df['event_id'])
                    
                    # Generate interaction details
                    interaction_type = np.random.choice(
                        ['view', 'like', 'share', 'book', 'review'],
                        p=[0.5, 0.2, 0.1, 0.15, 0.05]
                    )
                    
                    # Rating (higher for preferred categories)
                    event_category = events_df[events_df['event_id'] == event_id]['category'].iloc[0]
                    if event_category in user_preferences:
                        rating = np.random.normal(4.2, 0.8)
                    else:
                        rating = np.random.normal(3.0, 1.0)
                    
                    rating = max(1, min(5, rating))
                    
                    interactions.append({
                        'user_id': user_id,
                        'event_id': event_id,
                        'interaction_type': interaction_type,
                        'rating': round(rating, 1),
                        'timestamp': datetime.now() - timedelta(
                            days=np.random.randint(1, 90),
                            hours=np.random.randint(0, 24),
                            minutes=np.random.randint(0, 60)
                        ),
                        'session_duration': np.random.randint(30, 1800)  # 30 seconds to 30 minutes
                    })
            
            # Load interactions to database
            interactions_df = pd.DataFrame(interactions)
            interactions_df.to_sql('user_interactions', self.connection, if_exists='replace', index=False)
            
            logger.info(f"Generated {len(user_profiles)} users and {len(interactions)} interactions")
            
        except Exception as e:
            logger.error(f"Error generating synthetic user data: {e}")
            raise
    
    def run_full_etl_pipeline(self, events_json_path: str):
        """Run complete ETL pipeline"""
        try:
            logger.info("Starting ETL pipeline...")
            
            # Extract
            raw_events_df = self.extract_events_data(events_json_path)
            
            # Transform
            clean_events_df = self.transform_events_data(raw_events_df)
            
            # Load
            self.load_events_to_database(clean_events_df)
            
            # Generate synthetic user data for demo
            self.generate_synthetic_user_data()
            
            # Update analytics summary
            self.update_analytics_summary()
            
            logger.info("ETL pipeline completed successfully")
            
        except Exception as e:
            logger.error(f"ETL pipeline failed: {e}")
            raise
    
    def update_analytics_summary(self):
        """Update daily analytics summary"""
        try:
            cursor = self.connection.cursor()
            
            # Calculate daily metrics
            today = datetime.now().date()
            
            # Total events
            cursor.execute("SELECT COUNT(*) FROM events")
            total_events = cursor.fetchone()[0]
            
            # Total users
            cursor.execute("SELECT COUNT(*) FROM user_profiles")
            total_users = cursor.fetchone()[0]
            
            # Total interactions
            cursor.execute("SELECT COUNT(*) FROM user_interactions")
            total_interactions = cursor.fetchone()[0]
            
            # Average rating
            cursor.execute("SELECT AVG(rating) FROM user_interactions WHERE rating > 0")
            avg_rating = cursor.fetchone()[0] or 0
            
            # Top category
            cursor.execute("""
                SELECT category, COUNT(*) as count 
                FROM events 
                GROUP BY category 
                ORDER BY count DESC 
                LIMIT 1
            """)
            top_category_result = cursor.fetchone()
            top_category = top_category_result[0] if top_category_result else "Unknown"
            
            # Active users (users with interactions in last 30 days)
            cursor.execute("""
                SELECT COUNT(DISTINCT user_id) 
                FROM user_interactions 
                WHERE timestamp >= datetime('now', '-30 days')
            """)
            active_users = cursor.fetchone()[0]
            
            # Conversion rate (bookings / views)
            cursor.execute("SELECT COUNT(*) FROM user_interactions WHERE interaction_type = 'book'")
            bookings = cursor.fetchone()[0]
            cursor.execute("SELECT COUNT(*) FROM user_interactions WHERE interaction_type = 'view'")
            views = cursor.fetchone()[0]
            conversion_rate = (bookings / views) if views > 0 else 0
            
            # Insert or update summary
            cursor.execute("""
                INSERT OR REPLACE INTO analytics_summary 
                (summary_date, total_events, total_users, total_interactions, 
                 avg_rating, top_category, active_users, conversion_rate)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (today, total_events, total_users, total_interactions,
                  avg_rating, top_category, active_users, conversion_rate))
            
            self.connection.commit()
            logger.info("Analytics summary updated")
            
        except Exception as e:
            logger.error(f"Error updating analytics summary: {e}")
            raise
    
    def close_connection(self):
        """Close database connection"""
        if self.connection:
            self.connection.close()


class EventAnalyticsDashboard:
    """
    Comprehensive analytics dashboard for event data
    Demonstrates data analysis and visualization skills
    """
    
    def __init__(self, db_path: str = "event_analytics.db"):
        self.db_path = db_path
        self.connection = sqlite3.connect(db_path)
        logger.info("Analytics Dashboard initialized")
    
    def generate_comprehensive_report(self) -> Dict[str, Any]:
        """Generate comprehensive analytics report"""
        try:
            report = {
                'overview_metrics': self._get_overview_metrics(),
                'event_analytics': self._get_event_analytics(),
                'user_analytics': self._get_user_analytics(),
                'engagement_metrics': self._get_engagement_metrics(),
                'trend_analysis': self._get_trend_analysis(),
                'category_performance': self._get_category_performance(),
                'recommendation_insights': self._get_recommendation_insights()
            }
            
            logger.info("Comprehensive analytics report generated")
            return report
            
        except Exception as e:
            logger.error(f"Error generating analytics report: {e}")
            raise
    
    def _get_overview_metrics(self) -> Dict[str, Any]:
        """Get high-level overview metrics"""
        cursor = self.connection.cursor()
        
        metrics = {}
        
        # Basic counts
        cursor.execute("SELECT COUNT(*) FROM events")
        metrics['total_events'] = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM user_profiles")
        metrics['total_users'] = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM user_interactions")
        metrics['total_interactions'] = cursor.fetchone()[0]
        
        # Average rating
        cursor.execute("SELECT AVG(rating) FROM user_interactions WHERE rating > 0")
        metrics['avg_rating'] = round(cursor.fetchone()[0] or 0, 2)
        
        # Active users (last 30 days)
        cursor.execute("""
            SELECT COUNT(DISTINCT user_id) 
            FROM user_interactions 
            WHERE timestamp >= datetime('now', '-30 days')
        """)
        metrics['active_users_30d'] = cursor.fetchone()[0]
        
        # Conversion metrics
        cursor.execute("SELECT COUNT(*) FROM user_interactions WHERE interaction_type = 'book'")
        bookings = cursor.fetchone()[0]
        cursor.execute("SELECT COUNT(*) FROM user_interactions WHERE interaction_type = 'view'")
        views = cursor.fetchone()[0]
        metrics['conversion_rate'] = round((bookings / views * 100) if views > 0 else 0, 2)
        
        return metrics
    
    def _get_event_analytics(self) -> Dict[str, Any]:
        """Get event-specific analytics"""
        
        # Event distribution by category
        category_dist = pd.read_sql("""
            SELECT category, COUNT(*) as count, AVG(popularity_score) as avg_popularity
            FROM events 
            GROUP BY category 
            ORDER BY count DESC
        """, self.connection)
        
        # Top events by interactions
        top_events = pd.read_sql("""
            SELECT e.title, e.category, COUNT(*) as interaction_count,
                   AVG(ui.rating) as avg_rating
            FROM events e
            LEFT JOIN user_interactions ui ON e.event_id = ui.event_id
            WHERE ui.event_id IS NOT NULL
            GROUP BY e.event_id
            ORDER BY interaction_count DESC
            LIMIT 10
        """, self.connection)
        
        # Event cost analysis
        cost_analysis = pd.read_sql("""
            SELECT 
                CASE 
                    WHEN event_cost = 0 THEN 'Free'
                    WHEN event_cost <= 20 THEN 'Low (€1-20)'
                    WHEN event_cost <= 50 THEN 'Medium (€21-50)'
                    ELSE 'High (€50+)'
                END as cost_category,
                COUNT(*) as event_count,
                AVG(popularity_score) as avg_popularity
            FROM events
            GROUP BY cost_category
        """, self.connection)
        
        return {
            'category_distribution': category_dist.to_dict('records'),
            'top_events': top_events.to_dict('records'),
            'cost_analysis': cost_analysis.to_dict('records')
        }
    
    def _get_user_analytics(self) -> Dict[str, Any]:
        """Get user behavior analytics"""
        
        # User demographics
        demographics = pd.read_sql("""
            SELECT age_group, location, COUNT(*) as count
            FROM user_profiles
            GROUP BY age_group, location
            ORDER BY count DESC
        """, self.connection)
        
        # User engagement levels
        engagement = pd.read_sql("""
            SELECT 
                CASE 
                    WHEN interaction_count = 0 THEN 'Inactive'
                    WHEN interaction_count <= 5 THEN 'Low'
                    WHEN interaction_count <= 15 THEN 'Medium'
                    ELSE 'High'
                END as engagement_level,
                COUNT(*) as user_count
            FROM (
                SELECT up.user_id, COUNT(*) as interaction_count
                FROM user_profiles up
                LEFT JOIN user_interactions ui ON up.user_id = ui.user_id
                GROUP BY up.user_id
            ) engagement_data
            GROUP BY engagement_level
        """, self.connection)
        
        # User preferences analysis
        preferences_data = pd.read_sql("SELECT preferences FROM user_profiles", self.connection)
        preference_counts = {}
        for prefs_json in preferences_data['preferences']:
            try:
                prefs = json.loads(prefs_json)
                for pref in prefs:
                    preference_counts[pref] = preference_counts.get(pref, 0) + 1
            except:
                continue
        
        return {
            'demographics': demographics.to_dict('records'),
            'engagement_levels': engagement.to_dict('records'),
            'preference_distribution': preference_counts
        }
    
    def _get_engagement_metrics(self) -> Dict[str, Any]:
        """Get detailed engagement metrics"""
        
        # Interaction type distribution
        interaction_types = pd.read_sql("""
            SELECT interaction_type, COUNT(*) as count,
                   AVG(session_duration) as avg_session_duration
            FROM user_interactions
            GROUP BY interaction_type
            ORDER BY count DESC
        """, self.connection)
        
        # Daily interaction trends
        daily_trends = pd.read_sql("""
            SELECT DATE(timestamp) as date, COUNT(*) as daily_interactions
            FROM user_interactions
            WHERE timestamp >= datetime('now', '-30 days')
            GROUP BY DATE(timestamp)
            ORDER BY date
        """, self.connection)
        
        # Rating distribution
        rating_dist = pd.read_sql("""
            SELECT 
                CASE 
                    WHEN rating < 2 THEN '1-2 (Poor)'
                    WHEN rating < 3 THEN '2-3 (Fair)'
                    WHEN rating < 4 THEN '3-4 (Good)'
                    ELSE '4-5 (Excellent)'
                END as rating_category,
                COUNT(*) as count
            FROM user_interactions
            WHERE rating > 0
            GROUP BY rating_category
        """, self.connection)
        
        return {
            'interaction_types': interaction_types.to_dict('records'),
            'daily_trends': daily_trends.to_dict('records'),
            'rating_distribution': rating_dist.to_dict('records')
        }
    
    def _get_trend_analysis(self) -> Dict[str, Any]:
        """Get trend analysis over time"""
        
        # Weekly registration trends
        weekly_registrations = pd.read_sql("""
            SELECT 
                strftime('%Y-%W', registration_date) as week,
                COUNT(*) as new_registrations
            FROM user_profiles
            WHERE registration_date >= datetime('now', '-12 weeks')
            GROUP BY week
            ORDER BY week
        """, self.connection)
        
        # Category popularity trends
        category_trends = pd.read_sql("""
            SELECT 
                e.category,
                DATE(ui.timestamp) as date,
                COUNT(*) as daily_interactions
            FROM user_interactions ui
            JOIN events e ON ui.event_id = e.event_id
            WHERE ui.timestamp >= datetime('now', '-30 days')
            GROUP BY e.category, DATE(ui.timestamp)
            ORDER BY date, e.category
        """, self.connection)
        
        return {
            'weekly_registrations': weekly_registrations.to_dict('records'),
            'category_trends': category_trends.to_dict('records')
        }
    
    def _get_category_performance(self) -> Dict[str, Any]:
        """Get detailed category performance metrics"""
        
        category_performance = pd.read_sql("""
            SELECT 
                e.category,
                COUNT(DISTINCT e.event_id) as total_events,
                COUNT(*) as total_interactions,
                COUNT(DISTINCT ui.user_id) as unique_users,
                AVG(ui.rating) as avg_rating,
                AVG(e.popularity_score) as avg_popularity,
                SUM(CASE WHEN ui.interaction_type = 'book' THEN 1 ELSE 0 END) as bookings,
                SUM(CASE WHEN ui.interaction_type = 'view' THEN 1 ELSE 0 END) as views
            FROM events e
            LEFT JOIN user_interactions ui ON e.event_id = ui.event_id
            GROUP BY e.category
            ORDER BY total_interactions DESC
        """, self.connection)
        
        # Calculate conversion rate for each category
        category_performance['conversion_rate'] = (
            category_performance['bookings'] / category_performance['views'] * 100
        ).fillna(0).round(2)
        
        return {
            'category_metrics': category_performance.to_dict('records')
        }
    
    def _get_recommendation_insights(self) -> Dict[str, Any]:
        """Get insights for recommendation system optimization"""
        
        # User-item interaction matrix sparsity
        cursor = self.connection.cursor()
        cursor.execute("SELECT COUNT(DISTINCT user_id) FROM user_interactions")
        unique_users = cursor.fetchone()[0]
        cursor.execute("SELECT COUNT(DISTINCT event_id) FROM user_interactions")
        unique_events = cursor.fetchone()[0]
        cursor.execute("SELECT COUNT(*) FROM user_interactions")
        total_interactions = cursor.fetchone()[0]
        
        sparsity = 1 - (total_interactions / (unique_users * unique_events))
        
        # Cold start problems
        cursor.execute("SELECT COUNT(*) FROM user_profiles WHERE user_id NOT IN (SELECT DISTINCT user_id FROM user_interactions)")
        users_no_interactions = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM events WHERE event_id NOT IN (SELECT DISTINCT event_id FROM user_interactions)")
        events_no_interactions = cursor.fetchone()[0]
        
        # Popular items coverage
        popular_events = pd.read_sql("""
            SELECT event_id, COUNT(*) as interaction_count
            FROM user_interactions
            GROUP BY event_id
            ORDER BY interaction_count DESC
            LIMIT 20
        """, self.connection)
        
        return {
            'matrix_sparsity': round(sparsity, 4),
            'cold_start_users': users_no_interactions,
            'cold_start_events': events_no_interactions,
            'popular_events': popular_events.to_dict('records')
        }
    
    def create_visualizations(self, report: Dict[str, Any]) -> Dict[str, str]:
        """Create visualization plots and return HTML strings"""
        
        visualizations = {}
        
        try:
            # 1. Category Distribution Pie Chart
            category_data = report['event_analytics']['category_distribution']
            fig1 = px.pie(
                values=[item['count'] for item in category_data],
                names=[item['category'] for item in category_data],
                title="Event Distribution by Category"
            )
            visualizations['category_pie'] = fig1.to_html(div_id="category_pie")
            
            # 2. User Engagement Bar Chart
            engagement_data = report['user_analytics']['engagement_levels']
            fig2 = px.bar(
                x=[item['engagement_level'] for item in engagement_data],
                y=[item['user_count'] for item in engagement_data],
                title="User Engagement Levels"
            )
            visualizations['engagement_bar'] = fig2.to_html(div_id="engagement_bar")
            
            # 3. Daily Interactions Trend
            daily_data = report['engagement_metrics']['daily_trends']
            fig3 = px.line(
                x=[item['date'] for item in daily_data],
                y=[item['daily_interactions'] for item in daily_data],
                title="Daily Interaction Trends (Last 30 Days)"
            )
            visualizations['daily_trend'] = fig3.to_html(div_id="daily_trend")
            
            # 4. Rating Distribution
            rating_data = report['engagement_metrics']['rating_distribution']
            fig4 = px.bar(
                x=[item['rating_category'] for item in rating_data],
                y=[item['count'] for item in rating_data],
                title="User Rating Distribution"
            )
            visualizations['rating_dist'] = fig4.to_html(div_id="rating_dist")
            
            # 5. Category Performance Heatmap
            category_perf = report['category_performance']['category_metrics']
            
            categories = [item['category'] for item in category_perf]
            metrics = ['total_events', 'total_interactions', 'unique_users', 'avg_rating']
            
            # Normalize data for heatmap
            heatmap_data = []
            for metric in metrics:
                values = [item[metric] for item in category_perf]
                max_val = max(values) if values else 1
                normalized = [v/max_val for v in values]
                heatmap_data.append(normalized)
            
            fig5 = go.Figure(data=go.Heatmap(
                z=heatmap_data,
                x=categories,
                y=metrics,
                colorscale='Viridis'
            ))
            fig5.update_layout(title="Category Performance Heatmap (Normalized)")
            visualizations['category_heatmap'] = fig5.to_html(div_id="category_heatmap")
            
            logger.info("Visualizations created successfully")
            
        except Exception as e:
            logger.error(f"Error creating visualizations: {e}")
        
        return visualizations
    
    def export_report_to_html(self, report: Dict[str, Any], output_file: str = "event_analytics_report.html"):
        """Export comprehensive report to HTML file"""
        
        visualizations = self.create_visualizations(report)
        
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <title>Event Analytics Dashboard</title>
            <style>
                body {{ font-family: Arial, sans-serif; margin: 20px; }}
                .metric-card {{ background: #f5f5f5; padding: 15px; margin: 10px; border-radius: 8px; }}
                .section {{ margin-bottom: 30px; }}
                h1, h2 {{ color: #2c3e50; }}
                table {{ border-collapse: collapse; width: 100%; }}
                th, td {{ border: 1px solid #ddd; padding: 8px; text-align: left; }}
                th {{ background-color: #3498db; color: white; }}
            </style>
        </head>
        <body>
            <h1>Event Analytics Dashboard</h1>
            <p>Generated on: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}</p>
            
            <div class="section">
                <h2>Overview Metrics</h2>
                <div style="display: flex; flex-wrap: wrap;">
                    <div class="metric-card">
                        <h3>Total Events</h3>
                        <p style="font-size: 24px; color: #3498db;">{report['overview_metrics']['total_events']}</p>
                    </div>
                    <div class="metric-card">
                        <h3>Total Users</h3>
                        <p style="font-size: 24px; color: #e74c3c;">{report['overview_metrics']['total_users']}</p>
                    </div>
                    <div class="metric-card">
                        <h3>Total Interactions</h3>
                        <p style="font-size: 24px; color: #27ae60;">{report['overview_metrics']['total_interactions']}</p>
                    </div>
                    <div class="metric-card">
                        <h3>Average Rating</h3>
                        <p style="font-size: 24px; color: #f39c12;">{report['overview_metrics']['avg_rating']}/5.0</p>
                    </div>
                    <div class="metric-card">
                        <h3>Conversion Rate</h3>
                        <p style="font-size: 24px; color: #9b59b6;">{report['overview_metrics']['conversion_rate']}%</p>
                    </div>
                </div>
            </div>
            
            <div class="section">
                <h2>Event Analytics</h2>
                {visualizations.get('category_pie', '')}
                {visualizations.get('category_heatmap', '')}
            </div>
            
            <div class="section">
                <h2>👥 User Analytics</h2>
                {visualizations.get('engagement_bar', '')}
            </div>
            
            <div class="section">
                <h2>📱 Engagement Metrics</h2>
                {visualizations.get('daily_trend', '')}
                {visualizations.get('rating_dist', '')}
            </div>
            
            <div class="section">
                <h2>Recommendation System Insights</h2>
                <div class="metric-card">
                    <h3>Matrix Sparsity</h3>
                    <p>{report['recommendation_insights']['matrix_sparsity']} (lower is better for collaborative filtering)</p>
                </div>
                <div class="metric-card">
                    <h3>Cold Start Problems</h3>
                    <p>Users without interactions: {report['recommendation_insights']['cold_start_users']}</p>
                    <p>Events without interactions: {report['recommendation_insights']['cold_start_events']}</p>
                </div>
            </div>
            
            <div class="section">
                <h2>Data Quality Report</h2>
                <p>This analytics dashboard demonstrates:</p>
                <ul>
                    <li>ETL Pipeline: Data extraction, transformation, and loading</li>
                    <li>Data Warehousing: Structured storage with proper schema</li>
                    <li>Analytics: Comprehensive metrics and KPIs</li>
                    <li>Visualization: Interactive charts and graphs</li>
                    <li>Machine Learning Insights: Recommendation system analysis</li>
                    <li>Business Intelligence: Actionable insights for decision making</li>
                </ul>
            </div>
        </body>
        </html>
        """
        
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(html_content)
        
        logger.info(f"Report exported to {output_file}")
    
    def close_connection(self):
        """Close database connection"""
        if self.connection:
            self.connection.close()


def main():
    """Main function to demonstrate the complete analytics pipeline"""
    
    # File paths
    events_json_path = "/Users/vamsikrishna/Desktop/My Courses/2nd Sem courses/Innolab SS23/bingo-ug/InnolabSS23/Code/admin/file/events.json"
    
    try:
        print("Starting Event Analytics Pipeline...")
        
        # 1. ETL Pipeline
        print("\nRunning ETL Pipeline...")
        etl = EventETLPipeline()
        etl.run_full_etl_pipeline(events_json_path)
        
        # 2. Analytics Dashboard
        print("\nGenerating Analytics Dashboard...")
        dashboard = EventAnalyticsDashboard()
        report = dashboard.generate_comprehensive_report()
        
        # 3. Display key metrics
        print("\n✨ Key Metrics Summary:")
        print("=" * 40)
        overview = report['overview_metrics']
        print(f"📅 Total Events: {overview['total_events']}")
        print(f"👥 Total Users: {overview['total_users']}")
        print(f"🔄 Total Interactions: {overview['total_interactions']}")
        print(f"Average Rating: {overview['avg_rating']}/5.0")
        print(f"💰 Conversion Rate: {overview['conversion_rate']}%")
        print(f"Active Users (30d): {overview['active_users_30d']}")
        
        # 4. Export HTML report
        print("\n📄 Exporting Analytics Report...")
        dashboard.export_report_to_html(report)
        
        # 5. Display recommendation insights
        print("\nML Recommendation Insights:")
        print("=" * 40)
        rec_insights = report['recommendation_insights']
        print(f"Matrix Sparsity: {rec_insights['matrix_sparsity']}")
        print(f"Cold Start Users: {rec_insights['cold_start_users']}")
        print(f"Cold Start Events: {rec_insights['cold_start_events']}")
        
        # 6. Category performance
        print("\nTop Performing Categories:")
        print("=" * 40)
        categories = report['category_performance']['category_metrics'][:5]
        for i, cat in enumerate(categories, 1):
            print(f"{i}. {cat['category']}: {cat['total_interactions']} interactions, "
                  f"{cat['avg_rating']:.1f}★ rating")
        
        # Close connections
        etl.close_connection()
        dashboard.close_connection()
        
        print("\nAnalytics Pipeline Completed Successfully!")
        print("📄 HTML Report: event_analytics_report.html")
        print("💾 Database: event_analytics.db")
        
    except Exception as e:
        print(f"Error in analytics pipeline: {e}")


if __name__ == "__main__":
    main()
