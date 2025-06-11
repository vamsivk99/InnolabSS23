"""
Event Recommendation Engine
Combines collaborative filtering, content-based filtering, and popularity-based recommendations
"""

import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.decomposition import TruncatedSVD
from sklearn.preprocessing import StandardScaler
import json
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Tuple, Optional
import warnings
warnings.filterwarnings('ignore')

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class EventRecommendationEngine:
    """
    Hybrid recommendation system combining:
    1. Collaborative Filtering (Matrix Factorization)
    2. Content-Based Filtering (TF-IDF + Cosine Similarity)
    3. Popularity-Based Recommendations
    4. Real-time personalization
    """
    
    def __init__(self):
        self.content_vectorizer = TfidfVectorizer(
            max_features=1000,
            stop_words='english',
            ngram_range=(1, 2)
        )
        self.svd_model = TruncatedSVD(n_components=min(50, 30), random_state=42)
        self.scaler = StandardScaler()
        
        # Model components
        self.user_item_matrix = None
        self.content_features = None
        self.event_features_df = None
        self.user_profiles = {}
        self.popularity_scores = {}
        
        logger.info("Recommendation Engine initialized")
    
    def load_and_prepare_data(self, events_file_path: str, user_interactions_path: Optional[str] = None):
        """Load events data and prepare for ML training"""
        try:
            # Load events data
            with open(events_file_path, 'r', encoding='utf-8') as f:
                events_data = json.load(f)
            
            # Convert to DataFrame
            self.events_df = pd.DataFrame(events_data)
            
            # Data preprocessing
            self._preprocess_events_data()
            
            # Generate synthetic user interactions for demo (in real-world, this comes from user behavior)
            if user_interactions_path is None:
                self._generate_synthetic_interactions()
            else:
                self._load_user_interactions(user_interactions_path)
            
            logger.info(f"Loaded {len(self.events_df)} events and prepared data for ML training")
            
        except Exception as e:
            logger.error(f"Error loading data: {e}")
            raise
    
    def _preprocess_events_data(self):
        """Clean and prepare events data for ML"""
        # Handle missing values
        self.events_df['description'] = self.events_df['description'].fillna('')
        self.events_df['category'] = self.events_df['category'].fillna('Other')
        self.events_df['title'] = self.events_df['title'].fillna('Unknown Event')
        
        # Create content features for content-based filtering
        self.events_df['content_features'] = (
            self.events_df['title'].astype(str) + ' ' +
            self.events_df['description'].astype(str) + ' ' +
            self.events_df['category'].astype(str)
        )
        
        # Create unique event IDs if not present
        if 'eventId' not in self.events_df.columns:
            self.events_df['eventId'] = range(len(self.events_df))
        
        # Calculate popularity scores
        self._calculate_popularity_scores()
        
        logger.info("Events data preprocessing completed")
    
    def _calculate_popularity_scores(self):
        """Calculate popularity scores based on various factors"""
        # In real-world: views, bookings, ratings, etc.
        # For demo: based on category frequency and recency
        
        category_counts = self.events_df['category'].value_counts()
        self.events_df['category_popularity'] = self.events_df['category'].map(category_counts)
        
        # Normalize popularity scores
        self.events_df['popularity_score'] = (
            self.events_df['category_popularity'] / self.events_df['category_popularity'].max()
        )
        
        self.popularity_scores = dict(zip(
            self.events_df['eventId'],
            self.events_df['popularity_score']
        ))
    
    def _generate_synthetic_interactions(self):
        """Generate realistic user interactions for demo purposes"""
        np.random.seed(42)
        
        # Create synthetic users with different preferences
        user_personas = {
            'user_001': ['Music Concerts', 'Konzert'],
            'user_002': ['Art Exhibitions', 'Ausstellung'],
            'user_003': ['Dance Performances', 'Ballett'],
            'user_004': ['Street Show', 'Theater'],
            'user_005': ['Music Concerts', 'Art Exhibitions'],
        }
        
        interactions = []
        
        for user_id, preferences in user_personas.items():
            # Get events matching user preferences
            user_events = self.events_df[
                self.events_df['category'].isin(preferences)
            ]['eventId'].tolist()
            
            # Add some random events for diversity
            random_events = np.random.choice(
                self.events_df['eventId'].tolist(),
                size=min(5, len(self.events_df)),
                replace=False
            )
            
            all_user_events = list(set(user_events + list(random_events)))
            
            for event_id in all_user_events[:10]:  # Limit interactions per user
                # Generate ratings (1-5 scale)
                if event_id in user_events:
                    rating = np.random.normal(4.2, 0.8)  # Higher for preferred categories
                else:
                    rating = np.random.normal(3.0, 1.0)  # Lower for random events
                
                rating = max(1, min(5, rating))  # Clamp to 1-5 range
                
                interactions.append({
                    'user_id': user_id,
                    'event_id': event_id,
                    'rating': round(rating, 1),
                    'interaction_type': 'view',
                    'timestamp': datetime.now() - timedelta(days=np.random.randint(1, 30))
                })
        
        self.interactions_df = pd.DataFrame(interactions)
        logger.info(f"Generated {len(interactions)} synthetic user interactions")
    
    def train_recommendation_models(self):
        """Train all recommendation models"""
        logger.info("Training recommendation models...")
        
        # 1. Train Content-Based Model
        self._train_content_based_model()
        
        # 2. Train Collaborative Filtering Model
        self._train_collaborative_filtering_model()
        
        # 3. Build user profiles
        self._build_user_profiles()
        
        logger.info("All recommendation models trained successfully")
    
    def _train_content_based_model(self):
        """Train content-based recommendation model using TF-IDF"""
        try:
            # Fit TF-IDF vectorizer on event content
            self.content_features = self.content_vectorizer.fit_transform(
                self.events_df['content_features']
            )
            
            # Calculate content similarity matrix
            self.content_similarity = cosine_similarity(self.content_features)
            
            logger.info("Content-based model trained successfully")
            
        except Exception as e:
            logger.error(f"Error training content-based model: {e}")
            raise
    
    def _train_collaborative_filtering_model(self):
        """Train collaborative filtering model using Matrix Factorization"""
        try:
            # Create user-item matrix
            self.user_item_matrix = self.interactions_df.pivot_table(
                index='user_id',
                columns='event_id',
                values='rating',
                fill_value=0
            )
            
            # Apply SVD for matrix factorization
            if len(self.user_item_matrix) > 0:
                user_item_scaled = self.scaler.fit_transform(self.user_item_matrix)
                # Adjust n_components based on matrix dimensions
                n_components = min(self.svd_model.n_components, 
                                 min(user_item_scaled.shape) - 1)
                if n_components > 0:
                    self.svd_model.n_components = n_components
                    self.user_factors = self.svd_model.fit_transform(user_item_scaled)
                    self.item_factors = self.svd_model.components_.T
                else:
                    logger.warning("Not enough data for SVD, using simplified collaborative filtering")
                    self.user_factors = user_item_scaled
                    self.item_factors = user_item_scaled.T
            
            logger.info("Collaborative filtering model trained successfully")
            
        except Exception as e:
            logger.error(f"Error training collaborative filtering model: {e}")
            raise
    
    def _build_user_profiles(self):
        """Build user preference profiles from interaction history"""
        for user_id in self.interactions_df['user_id'].unique():
            user_interactions = self.interactions_df[
                self.interactions_df['user_id'] == user_id
            ]
            
            # Get user's highly rated events
            liked_events = user_interactions[
                user_interactions['rating'] >= 4.0
            ]['event_id'].tolist()
            
            # Extract categories from liked events
            liked_categories = self.events_df[
                self.events_df['eventId'].isin(liked_events)
            ]['category'].value_counts().to_dict()
            
            self.user_profiles[user_id] = {
                'preferred_categories': liked_categories,
                'avg_rating': user_interactions['rating'].mean(),
                'total_interactions': len(user_interactions)
            }
        
        logger.info(f"Built profiles for {len(self.user_profiles)} users")
    
    def get_recommendations(self, user_id: str, n_recommendations: int = 10) -> List[Dict]:
        """
        Generate hybrid recommendations for a user
        
        Args:
            user_id: User identifier
            n_recommendations: Number of recommendations to return
            
        Returns:
            List of recommended events with scores
        """
        try:
            # Get recommendations from each method
            content_recs = self._get_content_based_recommendations(user_id, n_recommendations * 2)
            collab_recs = self._get_collaborative_recommendations(user_id, n_recommendations * 2)
            popular_recs = self._get_popularity_recommendations(n_recommendations)
            
            # Combine and weight recommendations
            final_recommendations = self._combine_recommendations(
                content_recs, collab_recs, popular_recs, n_recommendations
            )
            
            return final_recommendations
            
        except Exception as e:
            logger.error(f"Error generating recommendations for user {user_id}: {e}")
            return self._get_fallback_recommendations(n_recommendations)
    
    def _get_content_based_recommendations(self, user_id: str, n_recs: int) -> List[Dict]:
        """Get content-based recommendations"""
        if user_id not in self.user_profiles:
            return []
        
        user_profile = self.user_profiles[user_id]
        preferred_categories = user_profile['preferred_categories']
        
        # Score events based on category preferences
        scores = []
        for idx, row in self.events_df.iterrows():
            event_id = row['eventId']
            category = row['category']
            
            # Base score from category preference
            category_score = preferred_categories.get(category, 0) / sum(preferred_categories.values())
            
            # Add content similarity if user has interaction history
            content_score = self._calculate_content_similarity_score(user_id, event_id)
            
            total_score = 0.7 * category_score + 0.3 * content_score
            
            scores.append({
                'event_id': event_id,
                'score': total_score,
                'method': 'content_based'
            })
        
        # Sort and return top recommendations
        scores.sort(key=lambda x: x['score'], reverse=True)
        return scores[:n_recs]
    
    def _calculate_content_similarity_score(self, user_id: str, event_id: int) -> float:
        """Calculate content similarity score for an event"""
        try:
            # Get user's liked events
            user_interactions = self.interactions_df[
                (self.interactions_df['user_id'] == user_id) & 
                (self.interactions_df['rating'] >= 4.0)
            ]
            
            if len(user_interactions) == 0:
                return 0.0
            
            liked_event_ids = user_interactions['event_id'].tolist()
            
            # Find event index in DataFrame
            event_idx = self.events_df[self.events_df['eventId'] == event_id].index
            if len(event_idx) == 0:
                return 0.0
            
            event_idx = event_idx[0]
            
            # Calculate average similarity to liked events
            similarities = []
            for liked_event_id in liked_event_ids:
                liked_idx = self.events_df[self.events_df['eventId'] == liked_event_id].index
                if len(liked_idx) > 0:
                    similarity = self.content_similarity[event_idx][liked_idx[0]]
                    similarities.append(similarity)
            
            return np.mean(similarities) if similarities else 0.0
            
        except Exception as e:
            logger.error(f"Error calculating content similarity: {e}")
            return 0.0
    
    def _get_collaborative_recommendations(self, user_id: str, n_recs: int) -> List[Dict]:
        """Get collaborative filtering recommendations"""
        if (self.user_item_matrix is None or 
            user_id not in self.user_item_matrix.index):
            return []
        
        try:
            # Get user index
            user_idx = list(self.user_item_matrix.index).index(user_id)
            
            # Get user factors
            user_vector = self.user_factors[user_idx]
            
            # Calculate scores for all items
            scores = np.dot(user_vector, self.item_factors.T)
            
            # Get event IDs and scores
            event_ids = self.user_item_matrix.columns.tolist()
            
            recommendations = []
            for i, score in enumerate(scores):
                recommendations.append({
                    'event_id': event_ids[i],
                    'score': score,
                    'method': 'collaborative'
                })
            
            # Sort and return top recommendations
            recommendations.sort(key=lambda x: x['score'], reverse=True)
            return recommendations[:n_recs]
            
        except Exception as e:
            logger.error(f"Error in collaborative filtering: {e}")
            return []
    
    def _get_popularity_recommendations(self, n_recs: int) -> List[Dict]:
        """Get popularity-based recommendations"""
        popular_events = sorted(
            self.popularity_scores.items(),
            key=lambda x: x[1],
            reverse=True
        )
        
        return [
            {
                'event_id': event_id,
                'score': score,
                'method': 'popularity'
            }
            for event_id, score in popular_events[:n_recs]
        ]
    
    def _combine_recommendations(self, content_recs: List[Dict], 
                                collab_recs: List[Dict], 
                                popular_recs: List[Dict], 
                                n_final: int) -> List[Dict]:
        """Combine recommendations from different methods with weighted scoring"""
        
        # Weights for different methods
        weights = {
            'content_based': 0.4,
            'collaborative': 0.4,
            'popularity': 0.2
        }
        
        # Combine all recommendations
        combined_scores = {}
        
        for recs_list in [content_recs, collab_recs, popular_recs]:
            for rec in recs_list:
                event_id = rec['event_id']
                method = rec['method']
                score = rec['score']
                
                if event_id not in combined_scores:
                    combined_scores[event_id] = 0
                
                combined_scores[event_id] += weights[method] * score
        
        # Sort by combined score
        final_recs = sorted(
            combined_scores.items(),
            key=lambda x: x[1],
            reverse=True
        )
        
        # Add event details
        recommendations = []
        for event_id, score in final_recs[:n_final]:
            event_details = self.events_df[
                self.events_df['eventId'] == event_id
            ].iloc[0].to_dict()
            
            recommendations.append({
                'event_id': event_id,
                'title': event_details.get('title', 'Unknown'),
                'category': event_details.get('category', 'Other'),
                'description': event_details.get('description', ''),
                'recommendation_score': score,
                'confidence': min(1.0, score / max(combined_scores.values()) if combined_scores else 0)
            })
        
        return recommendations
    
    def _get_fallback_recommendations(self, n_recs: int) -> List[Dict]:
        """Fallback recommendations when other methods fail"""
        return self._get_popularity_recommendations(n_recs)
    
    def evaluate_model_performance(self) -> Dict[str, float]:
        """Evaluate recommendation model performance"""
        try:
            # Split data into train/test
            test_interactions = self.interactions_df.sample(frac=0.2, random_state=42)
            
            metrics = {
                'precision_at_5': 0.0,
                'recall_at_5': 0.0,
                'coverage': 0.0,
                'diversity': 0.0
            }
            
            # Calculate precision and recall for each user
            precisions = []
            recalls = []
            
            for user_id in test_interactions['user_id'].unique():
                user_test = test_interactions[test_interactions['user_id'] == user_id]
                relevant_items = set(user_test[user_test['rating'] >= 4.0]['event_id'])
                
                if len(relevant_items) == 0:
                    continue
                
                # Get recommendations
                recommendations = self.get_recommendations(user_id, 5)
                recommended_items = set([rec['event_id'] for rec in recommendations])
                
                # Calculate precision and recall
                hits = len(relevant_items.intersection(recommended_items))
                precision = hits / len(recommended_items) if recommended_items else 0
                recall = hits / len(relevant_items) if relevant_items else 0
                
                precisions.append(precision)
                recalls.append(recall)
            
            metrics['precision_at_5'] = np.mean(precisions) if precisions else 0
            metrics['recall_at_5'] = np.mean(recalls) if recalls else 0
            
            # Calculate coverage (% of items that can be recommended)
            all_recommended = set()
            for user_id in self.user_profiles.keys():
                recs = self.get_recommendations(user_id, 10)
                all_recommended.update([rec['event_id'] for rec in recs])
            
            metrics['coverage'] = len(all_recommended) / len(self.events_df)
            
            # Calculate diversity (average dissimilarity of recommended items)
            diversity_scores = []
            for user_id in list(self.user_profiles.keys())[:5]:  # Sample users
                recs = self.get_recommendations(user_id, 5)
                rec_indices = []
                for rec in recs:
                    event_idx = self.events_df[self.events_df['eventId'] == rec['event_id']].index
                    if len(event_idx) > 0:
                        rec_indices.append(event_idx[0])
                
                if len(rec_indices) > 1:
                    similarities = []
                    for i in range(len(rec_indices)):
                        for j in range(i+1, len(rec_indices)):
                            sim = self.content_similarity[rec_indices[i]][rec_indices[j]]
                            similarities.append(sim)
                    
                    diversity = 1 - np.mean(similarities) if similarities else 0
                    diversity_scores.append(diversity)
            
            metrics['diversity'] = np.mean(diversity_scores) if diversity_scores else 0
            
            logger.info(f"Model evaluation completed: {metrics}")
            return metrics
            
        except Exception as e:
            logger.error(f"Error evaluating model: {e}")
            return {'error': str(e)}
    
    def get_model_statistics(self) -> Dict:
        """Get comprehensive model statistics for reporting"""
        stats = {
            'data_stats': {
                'total_events': len(self.events_df),
                'total_users': len(self.user_profiles),
                'total_interactions': len(self.interactions_df),
                'avg_interactions_per_user': len(self.interactions_df) / len(self.user_profiles) if self.user_profiles else 0,
                'unique_categories': self.events_df['category'].nunique(),
                'category_distribution': self.events_df['category'].value_counts().to_dict()
            },
            'model_stats': {
                'content_features_dim': self.content_features.shape[1] if self.content_features is not None else 0,
                'svd_components': self.svd_model.n_components,
                'user_factors_shape': self.user_factors.shape if hasattr(self, 'user_factors') else None,
                'item_factors_shape': self.item_factors.shape if hasattr(self, 'item_factors') else None
            },
            'recommendation_coverage': {
                'users_with_profiles': len(self.user_profiles),
                'events_with_popularity_scores': len(self.popularity_scores)
            }
        }
        
        return stats


def main():
    """Example usage and testing"""
    # Initialize recommendation engine
    engine = EventRecommendationEngine()
    
    # Load data (using the events.json file from the project)
    events_file = "/Users/vamsikrishna/Desktop/My Courses/2nd Sem courses/Innolab SS23/bingo-ug/InnolabSS23/Code/admin/file/events.json"
    
    try:
        # Load and prepare data
        engine.load_and_prepare_data(events_file)
        
        # Train models
        engine.train_recommendation_models()
        
        # Get recommendations for a sample user
        sample_user = 'user_001'
        recommendations = engine.get_recommendations(sample_user, n_recommendations=5)
        
        print(f"\nTop 5 Recommendations for {sample_user}:")
        print("=" * 60)
        for i, rec in enumerate(recommendations, 1):
            print(f"{i}. {rec['title']}")
            print(f"   Category: {rec['category']}")
            print(f"   Score: {rec['recommendation_score']:.3f}")
            print(f"   Confidence: {rec['confidence']:.1%}")
            print()
        
        # Evaluate model performance
        metrics = engine.evaluate_model_performance()
        print("\n Model Performance Metrics:")
        print("=" * 40)
        for metric, value in metrics.items():
            if isinstance(value, float):
                print(f"{metric}: {value:.3f}")
            else:
                print(f"{metric}: {value}")
        
        # Get model statistics
        stats = engine.get_model_statistics()
        print(f"\n Model Statistics:")
        print("=" * 40)
        print(f"Total Events: {stats['data_stats']['total_events']}")
        print(f"Total Users: {stats['data_stats']['total_users']}")
        print(f"Total Interactions: {stats['data_stats']['total_interactions']}")
        print(f"Content Features Dimension: {stats['model_stats']['content_features_dim']}")
        
    except Exception as e:
        print(f"Error: {e}")


if __name__ == "__main__":
    main()