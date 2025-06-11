/**
 * ML Integration Service - Frontend Integration for ML API
 * Connects customer interface with ML microservices
 */

class MLIntegrationService {
    constructor() {
        this.apiBaseUrl = 'http://localhost:5000';
        this.userId = this.getUserId();
        this.isMLEnabled = true;
        
        // Initialize ML services on page load
        this.initializeMLServices();
    }

    /**
     * Get current user ID from localStorage or session
     */
    getUserId() {
        // Check if user is authenticated
        const userAuth = localStorage.getItem('userAuth');
        if (userAuth && userAuth !== 'false') {
            try {
                const userData = JSON.parse(userAuth);
                return userData.uid || userData.userId || 'anonymous_' + Date.now();
            } catch (e) {
                return 'anonymous_' + Date.now();
            }
        }
        return 'anonymous_' + Date.now();
    }

    /**
     * Initialize ML services and check health
     */
    async initializeMLServices() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/health`);
            if (response.ok) {
                const health = await response.json();
                console.log('ML Services Status:', health);
                this.isMLEnabled = health.status === 'healthy';
            }
        } catch (error) {
            console.warn('ML Services not available:', error);
            this.isMLEnabled = false;
        }
    }

    /**
     * Get personalized event recommendations
     */
    async getRecommendations(limit = 6, category = null) {
        if (!this.isMLEnabled) return null;
        
        try {
            const params = new URLSearchParams({
                user_id: this.userId,
                num_recommendations: limit
            });
            
            if (category && category !== 'All') {
                params.append('category', category);
            }

            const response = await fetch(`${this.apiBaseUrl}/recommendations?${params}`);
            
            if (response.ok) {
                const data = await response.json();
                return data.recommendations;
            }
        } catch (error) {
            console.error('Error fetching recommendations:', error);
        }
        return null;
    }

    /**
     * Get similar events based on an event
     */
    async getSimilarEvents(eventId, limit = 4) {
        if (!this.isMLEnabled) return null;
        
        try {
            const response = await fetch(`${this.apiBaseUrl}/similar-events?event_id=${eventId}&num_recommendations=${limit}`);
            
            if (response.ok) {
                const data = await response.json();
                return data.similar_events;
            }
        } catch (error) {
            console.error('Error fetching similar events:', error);
        }
        return null;
    }

    /**
     * Track user interaction with events
     */
    async trackInteraction(eventId, interactionType = 'view', rating = null) {
        if (!this.isMLEnabled) return;
        
        try {
            const payload = {
                user_id: this.userId,
                event_id: eventId,
                interaction_type: interactionType,
                timestamp: new Date().toISOString()
            };
            
            if (rating !== null) {
                payload.rating = rating;
            }

            await fetch(`${this.apiBaseUrl}/track-interaction`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });
        } catch (error) {
            console.error('Error tracking interaction:', error);
        }
    }

    /**
     * Get event demand prediction
     */
    async getEventDemandPrediction(eventData) {
        if (!this.isMLEnabled) return null;
        
        try {
            const response = await fetch(`${this.apiBaseUrl}/predict-demand`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(eventData)
            });
            
            if (response.ok) {
                const data = await response.json();
                return data;
            }
        } catch (error) {
            console.error('Error predicting demand:', error);
        }
        return null;
    }

    /**
     * Get trending events based on analytics
     */
    async getTrendingEvents() {
        if (!this.isMLEnabled) return null;
        
        try {
            const response = await fetch(`${this.apiBaseUrl}/trending-events`);
            
            if (response.ok) {
                const data = await response.json();
                return data.trending_events;
            }
        } catch (error) {
            console.error('Error fetching trending events:', error);
        }
        return null;
    }

    /**
     * Get user analytics dashboard data
     */
    async getUserAnalytics() {
        if (!this.isMLEnabled) return null;
        
        try {
            const response = await fetch(`${this.apiBaseUrl}/user-analytics?user_id=${this.userId}`);
            
            if (response.ok) {
                const data = await response.json();
                return data;
            }
        } catch (error) {
            console.error('Error fetching user analytics:', error);
        }
        return null;
    }

    /**
     * Search events with ML-enhanced results
     */
    async searchEventsML(query, filters = {}) {
        if (!this.isMLEnabled) return null;
        
        try {
            const params = new URLSearchParams({
                user_id: this.userId,
                query: query
            });
            
            Object.keys(filters).forEach(key => {
                if (filters[key] && filters[key] !== 'All') {
                    params.append(key, filters[key]);
                }
            });

            const response = await fetch(`${this.apiBaseUrl}/search-events?${params}`);
            
            if (response.ok) {
                const data = await response.json();
                return data.results;
            }
        } catch (error) {
            console.error('Error in ML search:', error);
        }
        return null;
    }

    /**
     * Get event optimization suggestions for admins
     */
    async getEventOptimizationSuggestions(eventData) {
        if (!this.isMLEnabled) return null;
        
        try {
            const response = await fetch(`${this.apiBaseUrl}/optimize-event`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(eventData)
            });
            
            if (response.ok) {
                const data = await response.json();
                return data.optimization_suggestions;
            }
        } catch (error) {
            console.error('Error getting optimization suggestions:', error);
        }
        return null;
    }

    /**
     * Submit user feedback for model improvement
     */
    async submitFeedback(eventId, feedbackType, rating, comments = '') {
        if (!this.isMLEnabled) return;
        
        try {
            const payload = {
                user_id: this.userId,
                event_id: eventId,
                feedback_type: feedbackType,
                rating: rating,
                comments: comments,
                timestamp: new Date().toISOString()
            };

            await fetch(`${this.apiBaseUrl}/submit-feedback`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });
        } catch (error) {
            console.error('Error submitting feedback:', error);
        }
    }
}

// Initialize global ML service
window.mlService = new MLIntegrationService();

// Helper functions for UI integration
function addMLRecommendationsToPage() {
    if (!window.mlService.isMLEnabled) return;
    
    // Add recommendation section to the page
    const recommendationSection = document.createElement('div');
    recommendationSection.id = 'ml-recommendations';
    recommendationSection.className = 'ml-section';
    recommendationSection.innerHTML = `
        <div class="container" style="margin-top: 40px;">
            <div class="row">
                <div class="col-md-12">
                    <h3 class="section-title">
                        <i class="fa fa-magic" style="margin-right: 10px; color: #ff6b6b;"></i>
                        Recommended for You
                        <span class="ml-badge">ML-Powered</span>
                    </h3>
                    <div id="recommendation-list" class="row">
                        <div class="col-md-12 text-center">
                            <i class="fa fa-spinner fa-spin" style="font-size: 24px; color: #007bff;"></i>
                            <p style="margin-top: 10px;">Loading personalized recommendations...</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Insert after slider content
    const sliderContent = document.getElementById('sliderContent');
    if (sliderContent && sliderContent.nextSibling) {
        sliderContent.parentNode.insertBefore(recommendationSection, sliderContent.nextSibling);
    }
    
    // Load recommendations
    loadMLRecommendations();
}

async function loadMLRecommendations() {
    try {
        const recommendations = await window.mlService.getRecommendations(6);
        if (recommendations && recommendations.length > 0) {
            displayRecommendations(recommendations);
        } else {
            hideRecommendationSection();
        }
    } catch (error) {
        console.error('Error loading ML recommendations:', error);
        hideRecommendationSection();
    }
}

function displayRecommendations(recommendations) {
    const listContainer = document.getElementById('recommendation-list');
    if (!listContainer) return;
    
    let html = '';
    recommendations.forEach(rec => {
        const event = rec.event_data;
        const score = Math.round(rec.recommendation_score * 100);
        
        const date = event.fromDate ? getDayAndMonth(event.fromDate) : { day: 0, month: "X" };
        const image = event.eventPicture || getRandomImageUrl();
        
        html += `
            <div class="col-md-4 col-sm-12 col-lg-4" onclick="goToEventDescriptionML('${event.eventId}')">
                <div class="website-artefacto-group121 ml-recommendation-card" style="justify-content: center; position: relative;">
                    <div class="ml-score-badge">${score}% Match</div>
                    <div class="website-artefacto-group103">
                        <img src="${image}" alt="Event Image" class="website-artefacto-rectangle124" />
                    </div>
                    <span class="website-artefacto-text087">
                        <span>${event.title}</span>
                    </span>
                    <div class="website-artefacto-text089">
                        <div class="website-artefacto-group112">
                            <span class="website-artefacto-text096">
                                <span>${date.month}</span>
                            </span>
                            <span class="website-artefacto-text098"><span>${date.day}</span></span>
                        </div>
                        <span>
                            <span>${event.description}</span>
                            <br />
                            <span>${event.fromDate} - ${event.toDate}</span>
                            <br />
                        </span>
                    </div>
                    <div class="ml-recommendation-reason">
                        <small><i class="fa fa-lightbulb-o"></i> ${rec.reason || 'Based on your preferences'}</small>
                    </div>
                </div>
            </div>
        `;
    });
    
    listContainer.innerHTML = html;
}

function hideRecommendationSection() {
    const section = document.getElementById('ml-recommendations');
    if (section) {
        section.style.display = 'none';
    }
}

// Enhanced event description navigation with tracking
function goToEventDescriptionML(eventId) {
    // Track the interaction
    window.mlService.trackInteraction(eventId, 'click');
    
    // Navigate to event description
    goToEventDescription(eventId);
}

// Add trending events section
function addTrendingEventsSection() {
    if (!window.mlService.isMLEnabled) return;
    
    window.mlService.getTrendingEvents().then(trendingEvents => {
        if (trendingEvents && trendingEvents.length > 0) {
            // Add trending badge to existing events
            trendingEvents.forEach(eventId => {
                const eventCards = document.querySelectorAll(`[onclick*="${eventId}"]`);
                eventCards.forEach(card => {
                    const badge = document.createElement('div');
                    badge.className = 'trending-badge';
                    badge.innerHTML = '<i class="fa fa-fire"></i> Trending';
                    card.querySelector('.website-artefacto-group121').appendChild(badge);
                });
            });
        }
    });
}

// Initialize ML features when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Add ML styles
    const mlStyles = document.createElement('style');
    mlStyles.textContent = `
        .ml-section {
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
            padding: 20px 0;
            margin: 20px 0;
            border-radius: 10px;
        }
        
        .section-title {
            color: #2c3e50;
            font-weight: 600;
            margin-bottom: 30px;
            text-align: center;
        }
        
        .ml-badge {
            background: linear-gradient(45deg, #ff6b6b, #ffa500);
            color: white;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 500;
            margin-left: 10px;
        }
        
        .ml-recommendation-card {
            transition: all 0.3s ease;
            border: 2px solid transparent;
        }
        
        .ml-recommendation-card:hover {
            border-color: #007bff;
            box-shadow: 0 8px 25px rgba(0,123,255,0.15);
            transform: translateY(-5px);
        }
        
        .ml-score-badge {
            position: absolute;
            top: 10px;
            right: 10px;
            background: linear-gradient(45deg, #28a745, #20c997);
            color: white;
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 11px;
            font-weight: bold;
            z-index: 10;
        }
        
        .ml-recommendation-reason {
            margin-top: 10px;
            padding: 8px;
            background: rgba(0,123,255,0.1);
            border-radius: 5px;
            color: #007bff;
            font-style: italic;
        }
        
        .trending-badge {
            position: absolute;
            top: 10px;
            left: 10px;
            background: linear-gradient(45deg, #ff4757, #ff6b6b);
            color: white;
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 11px;
            font-weight: bold;
            z-index: 10;
        }
        
        .ml-search-enhancement {
            background: #e3f2fd;
            border: 1px solid #2196f3;
            border-radius: 5px;
            padding: 10px;
            margin: 10px 0;
        }
    `;
    document.head.appendChild(mlStyles);
});
