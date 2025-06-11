"""
Event Demand Forecasting & Predictive Analytics
Machine learning models for event demand prediction and optimization
"""

import pandas as pd
import numpy as np
import json
import sqlite3
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Tuple, Optional, Any
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.linear_model import LinearRegression, Ridge
from sklearn.model_selection import train_test_split, cross_val_score, GridSearchCV
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import joblib
import warnings
warnings.filterwarnings('ignore')

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class EventDemandPredictor:
    """
    ML system for predicting event demand and optimizing event planning
    Includes feature engineering, model selection, and validation
    """
    
    def __init__(self, db_path: str = "event_analytics.db"):
        self.db_path = db_path
        self.connection = sqlite3.connect(db_path)
        
        # ML Models
        self.models = {
            'random_forest': RandomForestRegressor(n_estimators=100, random_state=42),
            'gradient_boosting': GradientBoostingRegressor(n_estimators=100, random_state=42),
            'linear_regression': LinearRegression(),
            'ridge_regression': Ridge(alpha=1.0)
        }
        
        self.best_model = None
        self.scaler = StandardScaler()
        self.label_encoders = {}
        self.feature_importance = {}
        
        logger.info("Event Demand Predictor initialized")
    
    def prepare_modeling_dataset(self) -> pd.DataFrame:
        """Prepare comprehensive dataset for ML modeling"""
        try:
            # Load base data
            events_df = pd.read_sql("SELECT * FROM events", self.connection)
            interactions_df = pd.read_sql("SELECT * FROM user_interactions", self.connection)
            users_df = pd.read_sql("SELECT * FROM user_profiles", self.connection)
            
            # Create target variable: event demand (number of interactions)
            event_demand = interactions_df.groupby('event_id').agg({
                'interaction_id': 'count',
                'rating': ['mean', 'std'],
                'session_duration': 'mean'
            }).round(2)
            
            # Flatten column names
            event_demand.columns = ['total_interactions', 'avg_rating', 'rating_std', 'avg_session_duration']
            event_demand['rating_std'] = event_demand['rating_std'].fillna(0)
            event_demand.reset_index(inplace=True)
            
            # Merge with events data
            modeling_df = events_df.merge(event_demand, on='event_id', how='left')
            
            # Fill missing demand values (events with no interactions)
            modeling_df['total_interactions'] = modeling_df['total_interactions'].fillna(0)
            modeling_df['avg_rating'] = modeling_df['avg_rating'].fillna(0)
            modeling_df['rating_std'] = modeling_df['rating_std'].fillna(0)
            modeling_df['avg_session_duration'] = modeling_df['avg_session_duration'].fillna(0)
            
            # Feature engineering
            modeling_df = self._engineer_features(modeling_df, interactions_df, users_df)
            
            logger.info(f"Prepared modeling dataset with {len(modeling_df)} events and {modeling_df.shape[1]} features")
            return modeling_df
            
        except Exception as e:
            logger.error(f"Error preparing modeling dataset: {e}")
            raise
    
    def _engineer_features(self, events_df: pd.DataFrame, 
                          interactions_df: pd.DataFrame, 
                          users_df: pd.DataFrame) -> pd.DataFrame:
        """Engineer comprehensive features for ML modeling"""
        
        df = events_df.copy()
        
        # 1. Text features
        df['title_length'] = df['title'].str.len()
        df['description_length'] = df['description'].str.len()
        df['has_description'] = (df['description_length'] > 0).astype(int)
        
        # 2. Cost features
        df['is_free'] = (df['event_cost'] == 0).astype(int)
        df['cost_category'] = pd.cut(df['event_cost'], 
                                   bins=[-1, 0, 20, 50, np.inf], 
                                   labels=['Free', 'Low', 'Medium', 'High'])
        
        # 3. Date features (if available)
        try:
            df['from_date_parsed'] = pd.to_datetime(df['from_date'], errors='coerce')
            df['to_date_parsed'] = pd.to_datetime(df['to_date'], errors='coerce')
            
            # Extract temporal features
            df['event_month'] = df['from_date_parsed'].dt.month
            df['event_day_of_week'] = df['from_date_parsed'].dt.dayofweek
            df['event_quarter'] = df['from_date_parsed'].dt.quarter
            df['is_weekend'] = df['event_day_of_week'].isin([5, 6]).astype(int)
            
            # Event duration
            df['event_duration_days'] = (df['to_date_parsed'] - df['from_date_parsed']).dt.days
            df['event_duration_days'] = df['event_duration_days'].fillna(1).clip(lower=1)
            
        except Exception as e:
            logger.warning(f"Could not parse dates for temporal features: {e}")
            # Set default values
            df['event_month'] = 6  # Default to June
            df['event_day_of_week'] = 3  # Default to Wednesday
            df['event_quarter'] = 2
            df['is_weekend'] = 0
            df['event_duration_days'] = 1
        
        # 4. Category features
        category_popularity = df['category'].value_counts(normalize=True)
        df['category_popularity'] = df['category'].map(category_popularity)
        
        # 5. User demographic features (aggregated)
        user_prefs = {}
        for _, user in users_df.iterrows():
            try:
                prefs = json.loads(user['preferences'])
                for pref in prefs:
                    user_prefs[pref] = user_prefs.get(pref, 0) + 1
            except:
                continue
        
        # Map category to user preference count
        df['category_user_interest'] = df['category'].map(user_prefs).fillna(0)
        
        # 6. Historical interaction features
        category_interactions = interactions_df.merge(
            events_df[['event_id', 'category']], on='event_id'
        ).groupby('category')['interaction_id'].count()
        
        df['category_historical_interactions'] = df['category'].map(category_interactions).fillna(0)
        
        # 7. Competition features (similar events)
        df['similar_events_count'] = df.groupby('category')['event_id'].transform('count') - 1
        
        # 8. Popularity and quality indicators
        df['popularity_score'] = df['popularity_score'].fillna(0)
        
        # 9. Interaction type features
        interaction_types = interactions_df.groupby('event_id')['interaction_type'].apply(
            lambda x: x.value_counts().to_dict()
        ).fillna({})
        
        # Create features for different interaction types
        for interaction_type in ['view', 'like', 'share', 'book', 'review']:
            df[f'{interaction_type}_count'] = df['event_id'].map(
                lambda x: interaction_types.get(x, {}).get(interaction_type, 0)
            )
        
        # 10. Engagement quality features
        df['engagement_rate'] = np.where(
            df['view_count'] > 0,
            (df['like_count'] + df['share_count'] + df['book_count']) / df['view_count'],
            0
        )
        
        # 11. Seasonal features
        df['is_summer'] = df['event_month'].isin([6, 7, 8]).astype(int)
        df['is_winter'] = df['event_month'].isin([12, 1, 2]).astype(int)
        
        # Handle infinite and NaN values
        df = df.replace([np.inf, -np.inf], np.nan)
        df = df.fillna(0)
        
        logger.info(f"Engineered {df.shape[1]} features for modeling")
        return df
    
    def select_features_for_modeling(self, df: pd.DataFrame) -> Tuple[pd.DataFrame, List[str]]:
        """Select and prepare features for ML modeling"""
        
        # Define feature categories
        numeric_features = [
            'title_length', 'description_length', 'has_description',
            'event_cost', 'is_free', 'event_month', 'event_day_of_week',
            'event_quarter', 'is_weekend', 'event_duration_days',
            'category_popularity', 'category_user_interest',
            'category_historical_interactions', 'similar_events_count',
            'popularity_score', 'view_count', 'like_count', 'share_count',
            'book_count', 'review_count', 'engagement_rate',
            'is_summer', 'is_winter', 'avg_rating', 'rating_std',
            'avg_session_duration'
        ]
        
        categorical_features = ['category', 'cost_category']
        
        # Select features that exist in the dataframe
        available_numeric = [f for f in numeric_features if f in df.columns]
        available_categorical = [f for f in categorical_features if f in df.columns]
        
        # Encode categorical features
        df_encoded = df.copy()
        for cat_feature in available_categorical:
            if cat_feature not in self.label_encoders:
                self.label_encoders[cat_feature] = LabelEncoder()
                df_encoded[f'{cat_feature}_encoded'] = self.label_encoders[cat_feature].fit_transform(
                    df_encoded[cat_feature].astype(str)
                )
            else:
                # Handle unseen categories
                try:
                    df_encoded[f'{cat_feature}_encoded'] = self.label_encoders[cat_feature].transform(
                        df_encoded[cat_feature].astype(str)
                    )
                except ValueError:
                    # For unseen categories, assign the most common category
                    most_common = self.label_encoders[cat_feature].classes_[0]
                    df_encoded[cat_feature] = df_encoded[cat_feature].map(
                        lambda x: x if x in self.label_encoders[cat_feature].classes_ else most_common
                    )
                    df_encoded[f'{cat_feature}_encoded'] = self.label_encoders[cat_feature].transform(
                        df_encoded[cat_feature].astype(str)
                    )
        
        # Final feature list
        encoded_categorical = [f'{cat}_encoded' for cat in available_categorical]
        final_features = available_numeric + encoded_categorical
        
        # Ensure all features exist
        final_features = [f for f in final_features if f in df_encoded.columns]
        
        logger.info(f"Selected {len(final_features)} features for modeling")
        return df_encoded[final_features], final_features
    
    def train_demand_prediction_models(self, df: pd.DataFrame, target_column: str = 'total_interactions'):
        """Train multiple ML models and select the best one"""
        try:
            # Prepare features
            X, feature_names = self.select_features_for_modeling(df)
            y = df[target_column]
            
            # Split data
            X_train, X_test, y_train, y_test = train_test_split(
                X, y, test_size=0.2, random_state=42, stratify=None
            )
            
            # Scale features
            X_train_scaled = self.scaler.fit_transform(X_train)
            X_test_scaled = self.scaler.transform(X_test)
            
            # Train and evaluate models
            model_results = {}
            
            for model_name, model in self.models.items():
                logger.info(f"Training {model_name}...")
                
                # Train model
                if model_name in ['linear_regression', 'ridge_regression']:
                    model.fit(X_train_scaled, y_train)
                    y_pred = model.predict(X_test_scaled)
                else:
                    model.fit(X_train, y_train)
                    y_pred = model.predict(X_test)
                
                # Evaluate model
                mae = mean_absolute_error(y_test, y_pred)
                mse = mean_squared_error(y_test, y_pred)
                rmse = np.sqrt(mse)
                r2 = r2_score(y_test, y_pred)
                
                # Cross-validation
                if model_name in ['linear_regression', 'ridge_regression']:
                    cv_scores = cross_val_score(model, X_train_scaled, y_train, cv=5, scoring='r2')
                else:
                    cv_scores = cross_val_score(model, X_train, y_train, cv=5, scoring='r2')
                
                model_results[model_name] = {
                    'model': model,
                    'mae': mae,
                    'mse': mse,
                    'rmse': rmse,
                    'r2': r2,
                    'cv_r2_mean': cv_scores.mean(),
                    'cv_r2_std': cv_scores.std(),
                    'predictions': y_pred
                }
                
                logger.info(f"{model_name} - R²: {r2:.3f}, RMSE: {rmse:.3f}, CV R²: {cv_scores.mean():.3f}±{cv_scores.std():.3f}")
            
            # Select best model based on cross-validation R²
            best_model_name = max(model_results.keys(), 
                                key=lambda x: model_results[x]['cv_r2_mean'])
            
            self.best_model = model_results[best_model_name]['model']
            self.model_results = model_results
            self.feature_names = feature_names
            
            # Calculate feature importance for tree-based models
            if hasattr(self.best_model, 'feature_importances_'):
                self.feature_importance = dict(zip(
                    feature_names, 
                    self.best_model.feature_importances_
                ))
                # Sort by importance
                self.feature_importance = dict(sorted(
                    self.feature_importance.items(),
                    key=lambda x: x[1],
                    reverse=True
                ))
            
            logger.info(f"Best model: {best_model_name} with CV R²: {model_results[best_model_name]['cv_r2_mean']:.3f}")
            
            # Save model
            self.save_model()
            
            return model_results
            
        except Exception as e:
            logger.error(f"Error training demand prediction models: {e}")
            raise
    
    def predict_event_demand(self, event_features: Dict[str, Any]) -> Dict[str, float]:
        """Predict demand for a new event"""
        try:
            if self.best_model is None:
                raise ValueError("No trained model available. Please train models first.")
            
            # Convert features to DataFrame
            features_df = pd.DataFrame([event_features])
            
            # Engineer features (simplified version)
            features_df = self._prepare_prediction_features(features_df)
            
            # Select and encode features
            X, _ = self.select_features_for_modeling(features_df)
            
            # Make prediction
            if isinstance(self.best_model, (LinearRegression, Ridge)):
                X_scaled = self.scaler.transform(X)
                prediction = self.best_model.predict(X_scaled)[0]
            else:
                prediction = self.best_model.predict(X)[0]
            
            # Calculate confidence intervals (simplified)
            prediction_std = np.std([model['predictions'] for model in self.model_results.values()])
            
            return {
                'predicted_demand': max(0, prediction),
                'confidence_lower': max(0, prediction - 1.96 * prediction_std),
                'confidence_upper': prediction + 1.96 * prediction_std,
                'prediction_category': self._categorize_demand(prediction)
            }
            
        except Exception as e:
            logger.error(f"Error predicting event demand: {e}")
            raise
    
    def _prepare_prediction_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Prepare features for prediction (simplified feature engineering)"""
        
        # Basic text features
        df['title_length'] = df.get('title', '').astype(str).str.len()
        df['description_length'] = df.get('description', '').astype(str).str.len()
        df['has_description'] = (df['description_length'] > 0).astype(int)
        
        # Cost features
        df['event_cost'] = df.get('event_cost', 0)
        df['is_free'] = (df['event_cost'] == 0).astype(int)
        df['cost_category'] = pd.cut(df['event_cost'], 
                                   bins=[-1, 0, 20, 50, np.inf], 
                                   labels=['Free', 'Low', 'Medium', 'High'])
        
        # Default values for missing features
        default_values = {
            'event_month': 6,
            'event_day_of_week': 3,
            'event_quarter': 2,
            'is_weekend': 0,
            'event_duration_days': 1,
            'category_popularity': 0.2,
            'category_user_interest': 0,
            'category_historical_interactions': 0,
            'similar_events_count': 5,
            'popularity_score': 0.5,
            'view_count': 0,
            'like_count': 0,
            'share_count': 0,
            'book_count': 0,
            'review_count': 0,
            'engagement_rate': 0,
            'is_summer': 0,
            'is_winter': 0,
            'avg_rating': 0,
            'rating_std': 0,
            'avg_session_duration': 0
        }
        
        for feature, default_value in default_values.items():
            if feature not in df.columns:
                df[feature] = default_value
        
        return df
    
    def _categorize_demand(self, prediction: float) -> str:
        """Categorize demand prediction"""
        if prediction < 5:
            return "Low"
        elif prediction < 15:
            return "Medium"
        elif prediction < 30:
            return "High"
        else:
            return "Very High"
    
    def optimize_event_features(self, base_event: Dict[str, Any], 
                               target_demand: float = 20) -> Dict[str, Any]:
        """Optimize event features to achieve target demand"""
        try:
            if self.best_model is None:
                raise ValueError("No trained model available. Please train models first.")
            
            optimization_results = {}
            base_prediction = self.predict_event_demand(base_event)
            
            # Test different feature modifications
            modifications = {
                'make_free': {'event_cost': 0},
                'reduce_cost': {'event_cost': max(0, base_event.get('event_cost', 20) * 0.5)},
                'weekend_timing': {'event_day_of_week': 5, 'is_weekend': 1},
                'summer_timing': {'event_month': 7, 'is_summer': 1},
                'longer_duration': {'event_duration_days': 3},
                'add_description': {'description': 'Detailed event description with engaging content'}
            }
            
            for mod_name, modifications_dict in modifications.items():
                modified_event = base_event.copy()
                modified_event.update(modifications_dict)
                
                prediction = self.predict_event_demand(modified_event)
                improvement = prediction['predicted_demand'] - base_prediction['predicted_demand']
                
                optimization_results[mod_name] = {
                    'predicted_demand': prediction['predicted_demand'],
                    'improvement': improvement,
                    'improvement_percent': (improvement / base_prediction['predicted_demand']) * 100 if base_prediction['predicted_demand'] > 0 else 0,
                    'modifications': modifications_dict
                }
            
            # Sort by improvement
            optimization_results = dict(sorted(
                optimization_results.items(),
                key=lambda x: x[1]['improvement'],
                reverse=True
            ))
            
            return {
                'base_prediction': base_prediction,
                'optimizations': optimization_results
            }
            
        except Exception as e:
            logger.error(f"Error optimizing event features: {e}")
            raise
    
    def generate_demand_insights(self) -> Dict[str, Any]:
        """Generate insights about demand patterns"""
        try:
            if not hasattr(self, 'model_results'):
                raise ValueError("No model results available. Please train models first.")
            
            insights = {}
            
            # Model performance summary
            insights['model_performance'] = {}
            for model_name, results in self.model_results.items():
                insights['model_performance'][model_name] = {
                    'r2_score': results['r2'],
                    'rmse': results['rmse'],
                    'cv_r2_mean': results['cv_r2_mean']
                }
            
            # Feature importance (if available)
            if self.feature_importance:
                insights['top_features'] = dict(list(self.feature_importance.items())[:10])
            
            # Demand patterns from data
            df = pd.read_sql("""
                SELECT e.category, COUNT(ui.interaction_id) as total_interactions,
                       AVG(ui.rating) as avg_rating, e.event_cost
                FROM events e
                LEFT JOIN user_interactions ui ON e.event_id = ui.event_id
                GROUP BY e.category
                ORDER BY total_interactions DESC
            """, self.connection)
            
            insights['category_demand_patterns'] = df.to_dict('records')
            
            # Cost vs demand analysis
            cost_analysis = pd.read_sql("""
                SELECT 
                    CASE 
                        WHEN e.event_cost = 0 THEN 'Free'
                        WHEN e.event_cost <= 20 THEN 'Low (€1-20)'
                        WHEN e.event_cost <= 50 THEN 'Medium (€21-50)'
                        ELSE 'High (€50+)'
                    END as cost_category,
                    AVG(interactions.interaction_count) as avg_demand
                FROM events e
                LEFT JOIN (
                    SELECT event_id, COUNT(*) as interaction_count
                    FROM user_interactions
                    GROUP BY event_id
                ) interactions ON e.event_id = interactions.event_id
                GROUP BY cost_category
            """, self.connection)
            
            insights['cost_demand_relationship'] = cost_analysis.to_dict('records')
            
            return insights
            
        except Exception as e:
            logger.error(f"Error generating demand insights: {e}")
            raise
    
    def save_model(self, filename: str = "demand_prediction_model.joblib"):
        """Save trained model and preprocessing components"""
        try:
            model_package = {
                'best_model': self.best_model,
                'scaler': self.scaler,
                'label_encoders': self.label_encoders,
                'feature_names': getattr(self, 'feature_names', []),
                'feature_importance': self.feature_importance,
                'model_results': getattr(self, 'model_results', {})
            }
            
            joblib.dump(model_package, filename)
            logger.info(f"Model saved to {filename}")
            
        except Exception as e:
            logger.error(f"Error saving model: {e}")
            raise
    
    def load_model(self, filename: str = "demand_prediction_model.joblib"):
        """Load trained model and preprocessing components"""
        try:
            model_package = joblib.load(filename)
            
            self.best_model = model_package['best_model']
            self.scaler = model_package['scaler']
            self.label_encoders = model_package['label_encoders']
            self.feature_names = model_package.get('feature_names', [])
            self.feature_importance = model_package.get('feature_importance', {})
            self.model_results = model_package.get('model_results', {})
            
            logger.info(f"Model loaded from {filename}")
            
        except Exception as e:
            logger.error(f"Error loading model: {e}")
            raise
    
    def close_connection(self):
        """Close database connection"""
        if self.connection:
            self.connection.close()


class EventRecommendationOptimizer:
    """
    Optimization for event recommendations using ML insights
    """
    
    def __init__(self, demand_predictor: EventDemandPredictor):
        self.demand_predictor = demand_predictor
        logger.info("Event Recommendation Optimizer initialized")
    
    def optimize_event_lineup(self, events_list: List[Dict], 
                             target_total_demand: int = 200,
                             max_events: int = 10) -> Dict[str, Any]:
        """Optimize event lineup to maximize total demand"""
        try:
            # Predict demand for each event
            event_predictions = []
            for event in events_list:
                prediction = self.demand_predictor.predict_event_demand(event)
                event_predictions.append({
                    'event': event,
                    'predicted_demand': prediction['predicted_demand'],
                    'confidence': prediction.get('confidence_upper', 0) - prediction.get('confidence_lower', 0)
                })
            
            # Sort by predicted demand
            event_predictions.sort(key=lambda x: x['predicted_demand'], reverse=True)
            
            # Select top events
            selected_events = event_predictions[:max_events]
            total_predicted_demand = sum(ep['predicted_demand'] for ep in selected_events)
            
            # Calculate diversity score
            categories = [ep['event']['category'] for ep in selected_events]
            unique_categories = len(set(categories))
            diversity_score = unique_categories / len(categories) if categories else 0
            
            return {
                'selected_events': selected_events,
                'total_predicted_demand': total_predicted_demand,
                'diversity_score': diversity_score,
                'recommendations': self._generate_lineup_recommendations(selected_events, target_total_demand)
            }
            
        except Exception as e:
            logger.error(f"Error optimizing event lineup: {e}")
            raise
    
    def _generate_lineup_recommendations(self, selected_events: List[Dict], 
                                       target_demand: int) -> List[str]:
        """Generate recommendations for event lineup optimization"""
        recommendations = []
        
        total_demand = sum(ep['predicted_demand'] for ep in selected_events)
        
        if total_demand < target_demand:
            recommendations.append(f"Consider adding more high-demand events to reach target of {target_demand}")
        
        # Check category diversity
        categories = [ep['event']['category'] for ep in selected_events]
        category_counts = pd.Series(categories).value_counts()
        
        if len(category_counts) < 3:
            recommendations.append("Consider adding events from different categories for better diversity")
        
        # Check cost distribution
        costs = [ep['event'].get('event_cost', 0) for ep in selected_events]
        free_events = sum(1 for cost in costs if cost == 0)
        
        if free_events == 0:
            recommendations.append("Consider including some free events to increase accessibility")
        elif free_events == len(costs):
            recommendations.append("Consider including some paid events to generate revenue")
        
        return recommendations


def main():
    """Main function to demonstrate predictive analytics capabilities"""
    
    try:
        print("Starting Event Demand Prediction & Analytics...")
        
        # 1. Initialize predictor
        predictor = EventDemandPredictor()
        
        # 2. Prepare dataset
        print("\nPreparing modeling dataset...")
        modeling_df = predictor.prepare_modeling_dataset()
        
        # 3. Train models
        print("\nTraining demand prediction models...")
        model_results = predictor.train_demand_prediction_models(modeling_df)
        
        # 4. Display model performance
        print("\nModel Performance Results:")
        print("=" * 50)
        for model_name, results in model_results.items():
            print(f"{model_name}:")
            print(f"  R² Score: {results['r2']:.3f}")
            print(f"  RMSE: {results['rmse']:.3f}")
            print(f"  CV R² (mean±std): {results['cv_r2_mean']:.3f}±{results['cv_r2_std']:.3f}")
            print()
        
        # 5. Feature importance
        if predictor.feature_importance:
            print("Top 10 Most Important Features:")
            print("=" * 40)
            for i, (feature, importance) in enumerate(list(predictor.feature_importance.items())[:10], 1):
                print(f"{i:2d}. {feature}: {importance:.3f}")
        
        # 6. Example prediction
        print("\nExample Event Demand Prediction:")
        print("=" * 40)
        sample_event = {
            'title': 'Summer Jazz Concert',
            'category': 'Music Concerts',
            'description': 'Amazing outdoor jazz concert featuring local and international artists',
            'event_cost': 25.0,
            'event_month': 7,
            'event_day_of_week': 5,
            'is_weekend': 1
        }
        
        prediction = predictor.predict_event_demand(sample_event)
        print(f"Event: {sample_event['title']}")
        print(f"Predicted Demand: {prediction['predicted_demand']:.1f} interactions")
        print(f"Demand Category: {prediction['prediction_category']}")
        print(f"Confidence Interval: [{prediction['confidence_lower']:.1f}, {prediction['confidence_upper']:.1f}]")
        
        # 7. Event optimization
        print("\nEvent Optimization Suggestions:")
        print("=" * 40)
        optimization = predictor.optimize_event_features(sample_event)
        
        for opt_name, opt_data in list(optimization['optimizations'].items())[:3]:
            print(f"{opt_name}: +{opt_data['improvement']:.1f} interactions ({opt_data['improvement_percent']:.1f}%)")
        
        # 8. Generate insights
        print("\nDemand Insights:")
        print("=" * 40)
        insights = predictor.generate_demand_insights()
        
        print("Top 3 Performing Categories:")
        for i, cat in enumerate(insights['category_demand_patterns'][:3], 1):
            print(f"{i}. {cat['category']}: {cat['total_interactions']} interactions, {cat['avg_rating']:.1f}★")
        
        # 9. Event lineup optimization
        print("\nEvent Lineup Optimization:")
        print("=" * 40)
        
        # Sample events for lineup optimization
        sample_events = [
            {'title': 'Classical Concert', 'category': 'Music Concerts', 'event_cost': 30},
            {'title': 'Art Gallery Opening', 'category': 'Art Exhibitions', 'event_cost': 0},
            {'title': 'Dance Performance', 'category': 'Dance Performances', 'event_cost': 15},
            {'title': 'Street Art Show', 'category': 'Street Show', 'event_cost': 5},
            {'title': 'Theater Play', 'category': 'Theater', 'event_cost': 40}
        ]
        
        optimizer = EventRecommendationOptimizer(predictor)
        lineup_optimization = optimizer.optimize_event_lineup(sample_events, target_total_demand=100)
        
        print(f"Total Predicted Demand: {lineup_optimization['total_predicted_demand']:.1f}")
        print(f"Diversity Score: {lineup_optimization['diversity_score']:.2f}")
        print("\nRecommendations:")
        for rec in lineup_optimization['recommendations']:
            print(f"• {rec}")
        
        # Close connection
        predictor.close_connection()
        
        print("\nPredictive Analytics Pipeline Completed Successfully!")
        print("Model saved: demand_prediction_model.joblib")
        
    except Exception as e:
        print(f"Error in predictive analytics pipeline: {e}")


if __name__ == "__main__":
    main()
