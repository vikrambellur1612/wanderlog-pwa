// API Configuration for WanderLog Trip Management
// Version: 1.10.0

/**
 * API Configuration for external travel data sources
 * 
 * To enable dynamic attractions fetching, obtain API keys from:
 * 1. OpenTripMap: https://opentripmap.io/product (Free tier available)
 * 2. TripAdvisor Content API: https://developer-tripadvisor.com/
 * 3. Google Places API: https://developers.google.com/maps/documentation/places/web-service
 */

const API_CONFIG = {
  // OpenTripMap API (Free tier: 1000 requests/day)
  openTripMap: {
    enabled: false, // Set to true after getting API key
    apiKey: 'YOUR_OPENTRIPMAP_API_KEY',
    baseUrl: 'https://api.opentripmap.com/0.1/en/places',
    rateLimitDelay: 1000 // 1 second between requests
  },

  // TripAdvisor Content API (Requires approval)
  tripAdvisor: {
    enabled: false, // Set to true after getting API key
    apiKey: 'YOUR_TRIPADVISOR_API_KEY',
    baseUrl: 'https://api.tripadvisor.com/api/internal/1.0',
    rateLimitDelay: 2000 // 2 seconds between requests
  },

  // Google Places API (Paid service with free tier)
  googlePlaces: {
    enabled: false, // Set to true after getting API key
    apiKey: 'YOUR_GOOGLE_PLACES_API_KEY',
    baseUrl: 'https://maps.googleapis.com/maps/api/place',
    rateLimitDelay: 1000 // 1 second between requests
  },

  // Wikipedia API (Free, no key required)
  wikipedia: {
    enabled: true, // Always enabled as it's free
    baseUrl: 'https://en.wikipedia.org/api/rest_v1',
    rateLimitDelay: 500 // 0.5 seconds between requests
  },

  // General settings
  settings: {
    maxAttractions: 8, // Maximum attractions to show per place
    cacheTimeout: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
    enableOfflineMode: true, // Use cached data when offline
    fallbackToStatic: true // Use static data if APIs fail
  }
};

/**
 * Instructions for setting up API keys:
 * 
 * 1. OpenTripMap (Recommended - Free tier available):
 *    - Visit: https://opentripmap.io/product
 *    - Register for a free account
 *    - Get your API key from the dashboard
 *    - Replace 'YOUR_OPENTRIPMAP_API_KEY' above
 *    - Set enabled: true
 * 
 * 2. TripAdvisor Content API:
 *    - Visit: https://developer-tripadvisor.com/
 *    - Apply for API access (requires approval)
 *    - Once approved, get your API key
 *    - Replace 'YOUR_TRIPADVISOR_API_KEY' above
 *    - Set enabled: true
 * 
 * 3. Google Places API:
 *    - Visit: https://console.cloud.google.com/
 *    - Create a new project or select existing
 *    - Enable Places API
 *    - Create credentials (API key)
 *    - Replace 'YOUR_GOOGLE_PLACES_API_KEY' above
 *    - Set enabled: true
 * 
 * Note: Start with OpenTripMap as it provides good coverage for tourist attractions
 * and has a generous free tier. Wikipedia API is always available for landmark data.
 */

// Export configuration
window.API_CONFIG = API_CONFIG;

// Utility function to check if any external APIs are configured
window.hasExternalAPIs = function() {
  return API_CONFIG.openTripMap.enabled || 
         API_CONFIG.tripAdvisor.enabled || 
         API_CONFIG.googlePlaces.enabled;
};

// Utility function to get API status
window.getAPIStatus = function() {
  return {
    openTripMap: API_CONFIG.openTripMap.enabled,
    tripAdvisor: API_CONFIG.tripAdvisor.enabled,
    googlePlaces: API_CONFIG.googlePlaces.enabled,
    wikipedia: API_CONFIG.wikipedia.enabled,
    hasExternalAPIs: window.hasExternalAPIs()
  };
};
