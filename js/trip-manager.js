// WanderLog Trip Management Module
// Version: 1.2.0

class TripManager {
  constructor() {
    this.trips = this.loadTrips();
    this.currentTrip = null;
    this.placesData = this.initializePlacesData();
  }

  // Load trips from localStorage
  loadTrips() {
    try {
      const trips = localStorage.getItem('wanderlog_trips');
      return trips ? JSON.parse(trips) : [];
    } catch (error) {
      console.error('Error loading trips:', error);
      return [];
    }
  }

  // Save trips to localStorage
  saveTrips() {
    try {
      localStorage.setItem('wanderlog_trips', JSON.stringify(this.trips));
      return true;
    } catch (error) {
      console.error('Error saving trips:', error);
      return false;
    }
  }

  // Create a new trip
  createTrip(tripData) {
    const trip = {
      id: Date.now(),
      name: tripData.name,
      startDate: tripData.startDate,
      endDate: tripData.endDate,
      places: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.trips.push(trip);
    this.saveTrips();
    return trip;
  }

  // Update existing trip
  updateTrip(tripId, updates) {
    const tripIndex = this.trips.findIndex(trip => trip.id === tripId);
    if (tripIndex !== -1) {
      this.trips[tripIndex] = {
        ...this.trips[tripIndex],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      this.saveTrips();
      return this.trips[tripIndex];
    }
    return null;
  }

  // Delete trip
  deleteTrip(tripId) {
    const tripIndex = this.trips.findIndex(trip => trip.id === tripId);
    if (tripIndex !== -1) {
      this.trips.splice(tripIndex, 1);
      this.saveTrips();
      return true;
    }
    return false;
  }

  // Get trip by ID
  getTrip(tripId) {
    return this.trips.find(trip => trip.id === tripId) || null;
  }

  // Get all trips
  getAllTrips() {
    return this.trips;
  }

  // Add place to trip
  async addPlaceToTrip(tripId, placeInfo) {
    const trip = this.getTrip(tripId);
    if (!trip) return null;

    // Get detailed place information
    const placeDetails = await this.getPlaceDetails(placeInfo);
    
    const place = {
      id: Date.now(),
      ...placeDetails,
      addedAt: new Date().toISOString()
    };

    trip.places.push(place);
    this.updateTrip(tripId, { places: trip.places });
    return place;
  }

  // Remove place from trip
  removePlaceFromTrip(tripId, placeId) {
    const trip = this.getTrip(tripId);
    if (!trip) return false;

    const placeIndex = trip.places.findIndex(place => place.id === placeId);
    if (placeIndex !== -1) {
      trip.places.splice(placeIndex, 1);
      this.updateTrip(tripId, { places: trip.places });
      return true;
    }
    return false;
  }

  // Refresh attractions for a specific place
  async refreshPlaceAttractions(tripId, placeId) {
    const trip = this.getTrip(tripId);
    if (!trip) return null;

    const place = trip.places.find(p => p.id === placeId);
    if (!place) return null;

    try {
      // Fetch fresh attractions data
      const updatedAttractions = await this.getAttractions(place);
      
      // Update the place with new attractions
      place.attractions = updatedAttractions;
      place.lastUpdated = new Date().toISOString();
      
      // Save the updated trip
      this.updateTrip(tripId, { places: trip.places });
      
      return place;
    } catch (error) {
      console.error('Error refreshing attractions:', error);
      return null;
    }
  }

  // Get place details with attractions
  async getPlaceDetails(placeInfo) {
    // Handle custom places
    if (placeInfo.isCustom) {
      return {
        city: placeInfo.city,
        state: placeInfo.state,
        description: placeInfo.description || `Custom destination in ${placeInfo.state}`,
        attractions: placeInfo.attractions || [],
        category: 'Custom',
        isCustom: true
      };
    }

    const basePlace = this.placesData.find(place => 
      place.city === placeInfo.city && place.state === placeInfo.state
    );

    if (basePlace) {
      const attractions = await this.getAttractions(basePlace);
      return {
        ...basePlace,
        ...placeInfo,
        attractions: attractions,
        description: basePlace.description || await this.getPlaceDescription(basePlace)
      };
    }

    // If not found in local data, create basic entry and try to fetch dynamic data
    const dynamicAttractions = await this.fetchDynamicAttractions(placeInfo);
    return {
      city: placeInfo.city,
      state: placeInfo.state,
      description: placeInfo.description || `Beautiful destination in ${placeInfo.state}`,
      attractions: dynamicAttractions,
      category: 'General'
    };
  }

  // Get attractions for a place (now with dynamic fetching capability)
  async getAttractions(place) {
    // First try to get from local static data
    const staticAttractions = this.getStaticAttractions(place.city);
    
    // Then try to fetch dynamic attractions
    const dynamicAttractions = await this.fetchDynamicAttractions(place);
    
    // Combine and deduplicate
    const allAttractions = [...staticAttractions, ...dynamicAttractions];
    const uniqueAttractions = [...new Set(allAttractions)];
    
    return uniqueAttractions.slice(0, 8); // Limit to 8 attractions for UI
  }

  // Static attractions data (fallback)
  getStaticAttractions(cityName) {
    const attractionsMap = {
      'Delhi': [
        'Red Fort', 'India Gate', 'Qutub Minar', 'Lotus Temple', 'Humayun\'s Tomb'
      ],
      'Mumbai': [
        'Gateway of India', 'Marine Drive', 'Elephanta Caves', 'Chhatrapati Shivaji Terminus', 'Bollywood Studios'
      ],
      'Bangalore': [
        'Lalbagh Botanical Garden', 'Bangalore Palace', 'Tipu Sultan\'s Summer Palace', 'Cubbon Park', 'ISKCON Temple'
      ],
      'Jaipur': [
        'Amber Fort', 'City Palace', 'Hawa Mahal', 'Jantar Mantar', 'Nahargarh Fort'
      ],
      'Goa': [
        'Baga Beach', 'Calangute Beach', 'Basilica of Bom Jesus', 'Fort Aguada', 'Dudhsagar Falls'
      ],
      'Kerala': [
        'Backwaters', 'Munnar Tea Gardens', 'Periyar Wildlife Sanctuary', 'Fort Kochi', 'Kovalam Beach'
      ],
      'Kochi': [
        'Chinese Fishing Nets', 'Mattancherry Palace', 'Jewish Synagogue', 'Fort Kochi Beach', 'St. Francis Church'
      ],
      'Munnar': [
        'Tea Museum', 'Eravikulam National Park', 'Mattupetty Dam', 'Echo Point', 'Top Station'
      ],
      'Agra': [
        'Taj Mahal', 'Agra Fort', 'Fatehpur Sikri', 'Mehtab Bagh', 'Tomb of Itimad-ud-Daulah'
      ],
      'Varanasi': [
        'Kashi Vishwanath Temple', 'Dashashwamedh Ghat', 'Sarnath', 'Ramnagar Fort', 'Banaras Hindu University'
      ]
    };

    return attractionsMap[cityName] || [
      'Local Markets', 'Traditional Temples', 'Scenic Viewpoints', 'Cultural Centers'
    ];
  }

  // Fetch dynamic attractions from external APIs
  async fetchDynamicAttractions(place) {
    try {
      // Try multiple API sources for comprehensive data
      const attractions = await Promise.allSettled([
        this.fetchFromTripAdvisor(place),
        this.fetchFromWikipedia(place),
        this.fetchFromOpenTripMap(place)
      ]);

      const validAttractions = attractions
        .filter(result => result.status === 'fulfilled' && result.value.length > 0)
        .map(result => result.value)
        .flat();

      return [...new Set(validAttractions)]; // Remove duplicates
    } catch (error) {
      console.warn('Error fetching dynamic attractions:', error);
      return [];
    }
  }

  // Fetch from TripAdvisor-like API (using a mock implementation for now)
  async fetchFromTripAdvisor(place) {
    try {
      // In a real implementation, you would use TripAdvisor's API
      // For now, we'll simulate with a comprehensive attractions database
      const response = await this.simulateTripAdvisorAPI(place);
      return response.attractions || [];
    } catch (error) {
      console.warn('TripAdvisor API error:', error);
      return [];
    }
  }

  // Fetch from Wikipedia API for landmarks and notable places
  async fetchFromWikipedia(place) {
    try {
      // Check if Wikipedia API is enabled
      if (!window.API_CONFIG?.wikipedia.enabled) {
        return [];
      }

      const config = window.API_CONFIG.wikipedia;
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, config.rateLimitDelay));

      const searchQuery = `${place.city} attractions landmarks`;
      const url = `${config.baseUrl}/page/search/${encodeURIComponent(searchQuery)}`;
      
      const response = await fetch(url);
      if (!response.ok) throw new Error('Wikipedia API error');
      
      const data = await response.json();
      return data.pages?.slice(0, 3).map(page => page.title) || [];
    } catch (error) {
      console.warn('Wikipedia API error:', error);
      return [];
    }
  }

  // Fetch from OpenTripMap API for POI data
  async fetchFromOpenTripMap(place) {
    try {
      // Check if API is configured
      if (!window.API_CONFIG?.openTripMap.enabled) {
        return this.simulateOpenTripMapAPI(place);
      }

      const config = window.API_CONFIG.openTripMap;
      const apiKey = config.apiKey;
      
      if (!apiKey || apiKey === 'YOUR_OPENTRIPMAP_API_KEY') {
        console.warn('OpenTripMap API key not configured, using simulated data');
        return this.simulateOpenTripMapAPI(place);
      }

      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, config.rateLimitDelay));

      const url = `${config.baseUrl}/geoname?name=${encodeURIComponent(place.city)}&apikey=${apiKey}`;
      const response = await fetch(url);
      
      if (!response.ok) throw new Error('OpenTripMap API error');
      
      const locationData = await response.json();
      if (!locationData.lat || !locationData.lon) return [];

      // Get attractions near the city
      const attractionsUrl = `${config.baseUrl}/radius?radius=10000&lon=${locationData.lon}&lat=${locationData.lat}&kinds=historic,museums,architecture,cultural&limit=5&apikey=${apiKey}`;
      const attractionsResponse = await fetch(attractionsUrl);
      
      if (!attractionsResponse.ok) throw new Error('OpenTripMap attractions API error');
      
      const attractionsData = await attractionsResponse.json();
      return attractionsData.features?.map(feature => feature.properties.name).filter(name => name) || [];
    } catch (error) {
      console.warn('OpenTripMap API error:', error);
      return this.simulateOpenTripMapAPI(place);
    }
  }

  // Simulate TripAdvisor API with comprehensive data
  async simulateTripAdvisorAPI(place) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const attractionsDatabase = {
      'Delhi': [
        'Red Fort Complex', 'India Gate Memorial', 'Qutub Minar Complex', 'Lotus Temple', 'Humayun\'s Tomb Garden',
        'Chandni Chowk Market', 'Jama Masjid', 'National Museum', 'Rajghat', 'Akshardham Temple'
      ],
      'Mumbai': [
        'Gateway of India', 'Marine Drive Promenade', 'Elephanta Caves', 'Chhatrapati Shivaji Terminus',
        'Crawford Market', 'Hanging Gardens', 'Juhu Beach', 'Sanjay Gandhi National Park'
      ],
      'Bangalore': [
        'Lalbagh Botanical Garden', 'Bangalore Palace', 'Cubbon Park', 'ISKCON Temple Bangalore',
        'UB City Mall', 'Wonderla Amusement Park', 'Nandi Hills', 'Bull Temple'
      ],
      'Jaipur': [
        'Amber Fort Palace', 'City Palace Complex', 'Hawa Mahal', 'Jantar Mantar Observatory',
        'Nahargarh Fort', 'Jaigarh Fort', 'Albert Hall Museum', 'Birla Mandir'
      ],
      'Goa': [
        'Baga Beach', 'Calangute Beach', 'Basilica of Bom Jesus', 'Fort Aguada',
        'Dudhsagar Waterfalls', 'Anjuna Beach', 'Old Goa Churches', 'Spice Plantations'
      ],
      'Kochi': [
        'Chinese Fishing Nets', 'Mattancherry Palace', 'Jewish Synagogue', 'Fort Kochi Beach',
        'St. Francis Church', 'Kerala Folklore Museum', 'Marine Drive Kochi'
      ],
      'Munnar': [
        'Tea Museum', 'Eravikulam National Park', 'Mattupetty Dam', 'Echo Point',
        'Top Station Viewpoint', 'Kundala Lake', 'Rose Garden', 'Photo Point'
      ],
      'Agra': [
        'Taj Mahal', 'Agra Fort', 'Fatehpur Sikri', 'Mehtab Bagh', 'Tomb of Itimad-ud-Daulah',
        'Akbar\'s Tomb', 'Jama Masjid Agra', 'Chini Ka Rauza'
      ]
    };

    const attractions = attractionsDatabase[place.city] || 
      attractionsDatabase[place.city.split(' ')[0]] || // Try first word if full name not found
      [];

    return { attractions: attractions.slice(0, 6) };
  }

  // Simulate OpenTripMap API
  async simulateOpenTripMapAPI(place) {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const poiDatabase = {
      'Delhi': ['National Gallery of Modern Art', 'Raj Ghat Gandhi Memorial'],
      'Mumbai': ['Prince of Wales Museum', 'Dhobi Ghat'],
      'Bangalore': ['Government Museum', 'Vidhana Soudha'],
      'Jaipur': ['Amber Palace Museum', 'Central Museum'],
      'Goa': ['Museum of Christian Art', 'Naval Aviation Museum'],
      'Kochi': ['Hill Palace Museum', 'Indo-Portuguese Museum'],
      'Munnar': ['Carmelagiri Elephant Park', 'Spice Gardens'],
      'Agra': ['Archaeological Museum', 'Wildlife SOS']
    };

    return poiDatabase[place.city] || [];
  }

  // Get place description (simulated - in real app would use external API)
  async getPlaceDescription(place) {
    const descriptions = {
      'Delhi': 'India\'s capital territory, Delhi is a massive metropolitan area in the country\'s north. Known for its rich history, diverse culture, and architectural marvels.',
      'Mumbai': 'The financial capital of India, Mumbai is known for its bustling markets, Bollywood film industry, and colonial-era architecture.',
      'Bangalore': 'Known as the Silicon Valley of India, Bangalore offers a perfect blend of modernity and tradition with its pleasant climate and vibrant culture.',
      'Jaipur': 'The Pink City of Rajasthan, famous for its royal palaces, magnificent forts, and vibrant bazaars.',
      'Goa': 'A tropical paradise known for its pristine beaches, Portuguese architecture, and vibrant nightlife.',
      'Kerala': 'God\'s Own Country, famous for its backwaters, hill stations, and Ayurvedic treatments.'
    };

    return descriptions[place.city] || `A beautiful destination in ${place.state}, India.`;
  }

  // Initialize places data for India
  initializePlacesData() {
    return [
      // Delhi
      { city: 'Delhi', state: 'Delhi', category: 'Capital', description: 'National capital with rich Mughal and British history' },
      
      // Maharashtra
      { city: 'Mumbai', state: 'Maharashtra', category: 'Metropolitan', description: 'Financial capital and Bollywood hub' },
      { city: 'Pune', state: 'Maharashtra', category: 'City', description: 'Educational and IT hub with pleasant climate' },
      { city: 'Nashik', state: 'Maharashtra', category: 'Religious', description: 'Holy city famous for Kumbh Mela' },
      { city: 'Aurangabad', state: 'Maharashtra', category: 'Historical', description: 'Gateway to Ajanta and Ellora caves' },
      
      // Karnataka
      { city: 'Bangalore', state: 'Karnataka', category: 'Metropolitan', description: 'Silicon Valley of India' },
      { city: 'Mysore', state: 'Karnataka', category: 'Royal', description: 'City of palaces and royal heritage' },
      { city: 'Hampi', state: 'Karnataka', category: 'Historical', description: 'UNESCO World Heritage site with Vijayanagara ruins' },
      { city: 'Coorg', state: 'Karnataka', category: 'Hill Station', description: 'Coffee plantation region with scenic beauty' },
      
      // Rajasthan
      { city: 'Jaipur', state: 'Rajasthan', category: 'Royal', description: 'Pink City with magnificent forts and palaces' },
      { city: 'Udaipur', state: 'Rajasthan', category: 'Royal', description: 'City of Lakes with romantic palaces' },
      { city: 'Jodhpur', state: 'Rajasthan', category: 'Royal', description: 'Blue City with massive Mehrangarh Fort' },
      { city: 'Jaisalmer', state: 'Rajasthan', category: 'Desert', description: 'Golden City in the Thar Desert' },
      
      // Kerala
      { city: 'Kochi', state: 'Kerala', category: 'Coastal', description: 'Queen of Arabian Sea' },
      { city: 'Munnar', state: 'Kerala', category: 'Hill Station', description: 'Tea garden paradise in Western Ghats' },
      { city: 'Alleppey', state: 'Kerala', category: 'Backwaters', description: 'Venice of the East' },
      { city: 'Thekkady', state: 'Kerala', category: 'Wildlife', description: 'Periyar Wildlife Sanctuary' },
      
      // Goa
      { city: 'Panaji', state: 'Goa', category: 'Beach', description: 'Capital city with Portuguese heritage' },
      { city: 'Calangute', state: 'Goa', category: 'Beach', description: 'Queen of Beaches' },
      { city: 'Arambol', state: 'Goa', category: 'Beach', description: 'Hippie paradise with pristine beaches' },
      
      // Tamil Nadu
      { city: 'Chennai', state: 'Tamil Nadu', category: 'Metropolitan', description: 'Detroit of India' },
      { city: 'Madurai', state: 'Tamil Nadu', category: 'Temple', description: 'Temple city with Meenakshi Temple' },
      { city: 'Ooty', state: 'Tamil Nadu', category: 'Hill Station', description: 'Queen of Hill Stations' },
      { city: 'Kodaikanal', state: 'Tamil Nadu', category: 'Hill Station', description: 'Princess of Hill Stations' },
      
      // West Bengal
      { city: 'Kolkata', state: 'West Bengal', category: 'Cultural', description: 'Cultural capital of India' },
      { city: 'Darjeeling', state: 'West Bengal', category: 'Hill Station', description: 'Tea capital with Himalayan views' },
      
      // Uttar Pradesh
      { city: 'Agra', state: 'Uttar Pradesh', category: 'Historical', description: 'Home to the iconic Taj Mahal' },
      { city: 'Varanasi', state: 'Uttar Pradesh', category: 'Spiritual', description: 'Oldest living city and spiritual capital' },
      { city: 'Lucknow', state: 'Uttar Pradesh', category: 'Cultural', description: 'City of Nawabs' },
      
      // Himachal Pradesh
      { city: 'Shimla', state: 'Himachal Pradesh', category: 'Hill Station', description: 'Summer capital of British India' },
      { city: 'Manali', state: 'Himachal Pradesh', category: 'Adventure', description: 'Valley of Gods' },
      { city: 'Dharamshala', state: 'Himachal Pradesh', category: 'Spiritual', description: 'Home of Dalai Lama' },
      
      // Jammu & Kashmir
      { city: 'Srinagar', state: 'Jammu & Kashmir', category: 'Scenic', description: 'Summer capital with Dal Lake' },
      { city: 'Leh', state: 'Jammu & Kashmir', category: 'Adventure', description: 'Land of high passes' },
      
      // Gujarat
      { city: 'Ahmedabad', state: 'Gujarat', category: 'Cultural', description: 'Textile hub with rich heritage' },
      { city: 'Dwarka', state: 'Gujarat', category: 'Religious', description: 'Krishna\'s kingdom' },
      { city: 'Rann of Kutch', state: 'Gujarat', category: 'Desert', description: 'White salt desert' },
      
      // Andhra Pradesh & Telangana
      { city: 'Hyderabad', state: 'Telangana', category: 'Metropolitan', description: 'Cyberabad and City of Pearls' },
      { city: 'Tirupati', state: 'Andhra Pradesh', category: 'Religious', description: 'Abode of Lord Venkateswara' },
      
      // Punjab
      { city: 'Amritsar', state: 'Punjab', category: 'Religious', description: 'Holy city with Golden Temple' },
      
      // Odisha
      { city: 'Puri', state: 'Odisha', category: 'Religious', description: 'Home to Lord Jagannath' },
      { city: 'Bhubaneswar', state: 'Odisha', category: 'Temple', description: 'Temple city of India' }
    ];
  }

  // Get states for dropdown
  getStates() {
    const states = [...new Set(this.placesData.map(place => place.state))];
    return states.sort();
  }

  // Get cities by state
  getCitiesByState(state) {
    return this.placesData
      .filter(place => place.state === state)
      .map(place => place.city)
      .sort();
  }

  // Get place info by city and state
  getPlaceByLocation(city, state) {
    return this.placesData.find(place => 
      place.city === city && place.state === state
    );
  }

  // Search places
  searchPlaces(query) {
    const searchTerm = query.toLowerCase();
    return this.placesData.filter(place => 
      place.city.toLowerCase().includes(searchTerm) ||
      place.state.toLowerCase().includes(searchTerm) ||
      place.category.toLowerCase().includes(searchTerm)
    );
  }
}

// Export for use in main app
window.TripManager = TripManager;
