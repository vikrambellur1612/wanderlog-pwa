// Hotels Data Service - Provides popular hotels for different cities in India
class HotelsDataService {
  constructor() {
    // Popular hotels data for major Indian cities
    this.hotelsData = {
      'Mumbai': [
        { id: 'mum_001', name: 'The Taj Mahal Palace', category: 'Luxury', area: 'Colaba', rating: 4.8, location: { lat: 18.9216, lng: 72.8331 } },
        { id: 'mum_002', name: 'The Oberoi Mumbai', category: 'Luxury', area: 'Nariman Point', rating: 4.7, location: { lat: 18.9267, lng: 72.8233 } },
        { id: 'mum_003', name: 'ITC Grand Central', category: 'Business', area: 'Parel', rating: 4.5, location: { lat: 19.0144, lng: 72.8372 } },
        { id: 'mum_004', name: 'Hotel Marine Plaza', category: 'Mid-Range', area: 'Marine Drive', rating: 4.2, location: { lat: 18.9467, lng: 72.8234 } },
        { id: 'mum_005', name: 'Treebo Trend Nova', category: 'Budget', area: 'Andheri', rating: 4.0, location: { lat: 19.1136, lng: 72.8697 } }
      ],
      'Delhi': [
        { id: 'del_001', name: 'The Imperial New Delhi', category: 'Luxury', area: 'Connaught Place', rating: 4.8, location: { lat: 28.6264, lng: 77.2176 } },
        { id: 'del_002', name: 'ITC Maurya', category: 'Luxury', area: 'Chanakyapuri', rating: 4.7, location: { lat: 28.5933, lng: 77.1833 } },
        { id: 'del_003', name: 'Crowne Plaza New Delhi Rohini', category: 'Business', area: 'Rohini', rating: 4.4, location: { lat: 28.7041, lng: 77.1025 } },
        { id: 'del_004', name: 'Hotel Shivsagar', category: 'Mid-Range', area: 'Karol Bagh', rating: 4.1, location: { lat: 28.6519, lng: 77.1909 } },
        { id: 'del_005', name: 'Zostel Delhi', category: 'Budget', area: 'Mahipalpur', rating: 3.9, location: { lat: 28.5403, lng: 77.1397 } }
      ],
      'Bangalore': [
        { id: 'blr_001', name: 'The Leela Palace Bengaluru', category: 'Luxury', area: 'HAL Airport Road', rating: 4.8, location: { lat: 12.9611, lng: 77.6645 } },
        { id: 'blr_002', name: 'ITC Gardenia', category: 'Luxury', area: 'Residency Road', rating: 4.6, location: { lat: 12.9716, lng: 77.5946 } },
        { id: 'blr_003', name: 'Sheraton Grand Bangalore', category: 'Business', area: 'Brigade Gateway', rating: 4.5, location: { lat: 12.9041, lng: 77.5911 } },
        { id: 'blr_004', name: 'Treebo Trend Bliss', category: 'Mid-Range', area: 'Koramangala', rating: 4.2, location: { lat: 12.9279, lng: 77.6271 } },
        { id: 'blr_005', name: 'Zostel Bangalore', category: 'Budget', area: 'Lavelle Road', rating: 4.0, location: { lat: 12.9716, lng: 77.5946 } }
      ],
      'Chennai': [
        { id: 'che_001', name: 'ITC Grand Chola', category: 'Luxury', area: 'Guindy', rating: 4.7, location: { lat: 13.0067, lng: 80.2206 } },
        { id: 'che_002', name: 'The Leela Palace Chennai', category: 'Luxury', area: 'Adyar', rating: 4.6, location: { lat: 13.0103, lng: 80.2571 } },
        { id: 'che_003', name: 'Hyatt Regency Chennai', category: 'Business', area: 'Teynampet', rating: 4.4, location: { lat: 13.0478, lng: 80.2573 } },
        { id: 'che_004', name: 'Hotel Savera', category: 'Mid-Range', area: 'Mylapore', rating: 4.1, location: { lat: 13.0339, lng: 80.2619 } },
        { id: 'che_005', name: 'FabHotel Regal Inn', category: 'Budget', area: 'T Nagar', rating: 3.8, location: { lat: 13.0418, lng: 80.2341 } }
      ],
      'Hyderabad': [
        { id: 'hyd_001', name: 'Taj Falaknuma Palace', category: 'Luxury', area: 'Falaknuma', rating: 4.9, location: { lat: 17.3281, lng: 78.4719 } },
        { id: 'hyd_002', name: 'ITC Kohenur', category: 'Luxury', area: 'HITEC City', rating: 4.6, location: { lat: 17.4399, lng: 78.3908 } },
        { id: 'hyd_003', name: 'Novotel Hyderabad Convention Centre', category: 'Business', area: 'HITEC City', rating: 4.4, location: { lat: 17.4248, lng: 78.3744 } },
        { id: 'hyd_004', name: 'Hotel Sitara Grand', category: 'Mid-Range', area: 'Banjara Hills', rating: 4.0, location: { lat: 17.4126, lng: 78.4481 } },
        { id: 'hyd_005', name: 'Treebo Trend Daksh', category: 'Budget', area: 'Begumpet', rating: 3.9, location: { lat: 17.4435, lng: 78.4669 } }
      ],
      'Kolkata': [
        { id: 'kol_001', name: 'The Oberoi Grand', category: 'Luxury', area: 'Chowringhee', rating: 4.7, location: { lat: 22.5545, lng: 88.3531 } },
        { id: 'kol_002', name: 'ITC Royal Bengal', category: 'Luxury', area: 'Rajarhat', rating: 4.6, location: { lat: 22.5726, lng: 88.4321 } },
        { id: 'kol_003', name: 'Hyatt Regency Kolkata', category: 'Business', area: 'Salt Lake', rating: 4.3, location: { lat: 22.5726, lng: 88.4321 } },
        { id: 'kol_004', name: 'Hotel Hindusthan International', category: 'Mid-Range', area: 'AJC Bose Road', rating: 4.0, location: { lat: 22.5448, lng: 88.3540 } },
        { id: 'kol_005', name: 'FabHotel Prime Park Street', category: 'Budget', area: 'Park Street', rating: 3.8, location: { lat: 22.5488, lng: 88.3631 } }
      ],
      'Pune': [
        { id: 'pun_001', name: 'JW Marriott Hotel Pune', category: 'Luxury', area: 'Senapati Bapat Road', rating: 4.6, location: { lat: 18.5314, lng: 73.8446 } },
        { id: 'pun_002', name: 'The Westin Pune Koregaon Park', category: 'Luxury', area: 'Koregaon Park', rating: 4.5, location: { lat: 18.5362, lng: 73.8958 } },
        { id: 'pun_003', name: 'Courtyard by Marriott Pune Hinjawadi', category: 'Business', area: 'Hinjawadi', rating: 4.3, location: { lat: 18.5912, lng: 73.7389 } },
        { id: 'pun_004', name: 'Hotel Aurora Towers', category: 'Mid-Range', area: 'Bund Garden Road', rating: 4.0, location: { lat: 18.5274, lng: 73.8857 } },
        { id: 'pun_005', name: 'Zostel Pune', category: 'Budget', area: 'Koregaon Park', rating: 3.9, location: { lat: 18.5362, lng: 73.8958 } }
      ],
      'Goa': [
        { id: 'goa_001', name: 'The Leela Goa', category: 'Luxury', area: 'Cavelossim Beach', rating: 4.8, location: { lat: 15.2993, lng: 74.1240 } },
        { id: 'goa_002', name: 'Taj Exotica Resort & Spa', category: 'Luxury', area: 'Benaulim', rating: 4.7, location: { lat: 15.2647, lng: 73.9370 } },
        { id: 'goa_003', name: 'Holiday Inn Resort Goa', category: 'Business', area: 'Cavelossim', rating: 4.4, location: { lat: 15.2993, lng: 74.1240 } },
        { id: 'goa_004', name: 'Hotel Fidalgo', category: 'Mid-Range', area: 'Panaji', rating: 4.1, location: { lat: 15.4989, lng: 73.8278 } },
        { id: 'goa_005', name: 'Zostel Goa', category: 'Budget', area: 'Anjuna', rating: 4.0, location: { lat: 15.5735, lng: 73.7395 } }
      ],
      'Jaipur': [
        { id: 'jai_001', name: 'Taj Rambagh Palace', category: 'Luxury', area: 'Bhawani Singh Road', rating: 4.9, location: { lat: 26.8881, lng: 75.8045 } },
        { id: 'jai_002', name: 'The Oberoi Rajvilas', category: 'Luxury', area: 'Goner Road', rating: 4.8, location: { lat: 26.8043, lng: 75.8661 } },
        { id: 'jai_003', name: 'ITC Rajputana', category: 'Business', area: 'Palace Road', rating: 4.5, location: { lat: 26.9124, lng: 75.7873 } },
        { id: 'jai_004', name: 'Hotel Pearl Palace', category: 'Mid-Range', area: 'Hari Kishan Somani Marg', rating: 4.2, location: { lat: 26.9207, lng: 75.8045 } },
        { id: 'jai_005', name: 'Zostel Jaipur', category: 'Budget', area: 'MI Road', rating: 3.9, location: { lat: 26.9124, lng: 75.7873 } }
      ],
      'Kochi': [
        { id: 'koc_001', name: 'Taj Malabar Resort & Spa', category: 'Luxury', area: 'Willingdon Island', rating: 4.6, location: { lat: 9.9667, lng: 76.2667 } },
        { id: 'koc_002', name: 'Grand Hyatt Kochi Bolgatty', category: 'Luxury', area: 'Bolgatty Island', rating: 4.5, location: { lat: 9.9844, lng: 76.2661 } },
        { id: 'koc_003', name: 'Crowne Plaza Kochi', category: 'Business', area: 'Kundannoor', rating: 4.3, location: { lat: 9.9312, lng: 76.2673 } },
        { id: 'koc_004', name: 'Hotel Abad Plaza', category: 'Mid-Range', area: 'M.G. Road', rating: 4.0, location: { lat: 9.9312, lng: 76.2673 } },
        { id: 'koc_005', name: 'Backwater Ripples', category: 'Budget', area: 'Kumrakom', rating: 3.8, location: { lat: 9.6180, lng: 76.4312 } }
      ]
    };
  }

  // Get hotels for a specific city
  getHotelsForCity(cityName) {
    const normalizedCity = this.normalizeLocationName(cityName);
    return this.hotelsData[normalizedCity] || [];
  }

  // Normalize location names to match our data
  normalizeLocationName(location) {
    const locationMap = {
      'mumbai': 'Mumbai',
      'bombay': 'Mumbai',
      'delhi': 'Delhi',
      'new delhi': 'Delhi',
      'bangalore': 'Bangalore',
      'bengaluru': 'Bangalore',
      'chennai': 'Chennai',
      'madras': 'Chennai',
      'hyderabad': 'Hyderabad',
      'kolkata': 'Kolkata',
      'calcutta': 'Kolkata',
      'pune': 'Pune',
      'poona': 'Pune',
      'goa': 'Goa',
      'panaji': 'Goa',
      'jaipur': 'Jaipur',
      'kochi': 'Kochi',
      'cochin': 'Kochi'
    };
    
    return locationMap[location.toLowerCase()] || location;
  }

  // Get hotel by ID
  getHotelById(hotelId) {
    for (const city in this.hotelsData) {
      const hotel = this.hotelsData[city].find(h => h.id === hotelId);
      if (hotel) {
        return hotel;
      }
    }
    return null;
  }

  // Get hotels by category
  getHotelsByCategory(cityName, category) {
    const hotels = this.getHotelsForCity(cityName);
    return hotels.filter(hotel => hotel.category === category);
  }

  // Search hotels by name
  searchHotels(cityName, searchTerm) {
    const hotels = this.getHotelsForCity(cityName);
    return hotels.filter(hotel => 
      hotel.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  // Get all available cities
  getAvailableCities() {
    return Object.keys(this.hotelsData);
  }

  // Search hotels by name across all cities
  searchHotelsByName(query) {
    if (!query || query.length < 2) {
      return [];
    }
    
    const searchTerm = query.toLowerCase().trim();
    const results = [];
    
    // Search through all cities
    Object.keys(this.hotelsData).forEach(city => {
      const cityHotels = this.hotelsData[city];
      cityHotels.forEach(hotel => {
        if (hotel.name.toLowerCase().includes(searchTerm)) {
          results.push({
            ...hotel,
            city: city // Add city information to the result
          });
        }
      });
    });
    
    // Sort by relevance (exact matches first, then partial matches)
    results.sort((a, b) => {
      const aName = a.name.toLowerCase();
      const bName = b.name.toLowerCase();
      
      // Exact matches first
      if (aName === searchTerm && bName !== searchTerm) return -1;
      if (bName === searchTerm && aName !== searchTerm) return 1;
      
      // Starts with query next
      if (aName.startsWith(searchTerm) && !bName.startsWith(searchTerm)) return -1;
      if (bName.startsWith(searchTerm) && !aName.startsWith(searchTerm)) return 1;
      
      // Then by rating (highest first)
      return b.rating - a.rating;
    });
    
    return results.slice(0, 10); // Return top 10 results
  }

  // Search hotels by name within a specific location
  searchHotelsInLocation(location, query) {
    if (!query || query.length < 2) {
      return [];
    }
    
    const searchTerm = query.toLowerCase().trim();
    const results = [];
    
    // Search in the specified location city
    if (this.hotelsData[location.city]) {
      const cityHotels = this.hotelsData[location.city];
      cityHotels.forEach(hotel => {
        if (hotel.name.toLowerCase().includes(searchTerm)) {
          results.push({
            ...hotel,
            city: location.city,
            // Add mock additional details for demonstration
            address: this.generateMockAddress(hotel, location.city),
            phone: this.generateMockPhone(),
            email: this.generateMockEmail(hotel.name),
            amenities: this.generateMockAmenities(hotel.category)
          });
        }
      });
    }
    
    // If no results in specified location, search other cities
    if (results.length === 0) {
      Object.keys(this.hotelsData).forEach(city => {
        if (city !== location.city) {
          const cityHotels = this.hotelsData[city];
          cityHotels.forEach(hotel => {
            if (hotel.name.toLowerCase().includes(searchTerm)) {
              results.push({
                ...hotel,
                city: city,
                address: this.generateMockAddress(hotel, city),
                phone: this.generateMockPhone(),
                email: this.generateMockEmail(hotel.name),
                amenities: this.generateMockAmenities(hotel.category),
                isFromOtherCity: true
              });
            }
          });
        }
      });
    }
    
    // Sort by relevance
    results.sort((a, b) => {
      const aName = a.name.toLowerCase();
      const bName = b.name.toLowerCase();
      
      // Exact matches first
      if (aName === searchTerm && bName !== searchTerm) return -1;
      if (bName === searchTerm && aName !== searchTerm) return 1;
      
      // Starts with query next
      if (aName.startsWith(searchTerm) && !bName.startsWith(searchTerm)) return -1;
      if (bName.startsWith(searchTerm) && !aName.startsWith(searchTerm)) return 1;
      
      // Prefer same city
      if (!a.isFromOtherCity && b.isFromOtherCity) return -1;
      if (a.isFromOtherCity && !b.isFromOtherCity) return 1;
      
      // Then by rating
      return b.rating - a.rating;
    });
    
    return results.slice(0, 8); // Return top 8 results
  }

  // Generate mock address for demonstration
  generateMockAddress(hotel, city) {
    const areas = {
      'Mumbai': ['Bandra West', 'Juhu', 'Andheri East', 'Powai', 'Lower Parel', 'Worli'],
      'Delhi': ['Connaught Place', 'Karol Bagh', 'Nehru Place', 'Rajouri Garden', 'Janakpuri'],
      'Bangalore': ['MG Road', 'Brigade Road', 'Whitefield', 'Koramangala', 'Indiranagar'],
      'Chennai': ['T. Nagar', 'Anna Nagar', 'Adyar', 'Velachery', 'OMR'],
      'Hyderabad': ['Banjara Hills', 'Jubilee Hills', 'HITEC City', 'Gachibowli', 'Secunderabad'],
      'Pune': ['Koregaon Park', 'Baner', 'Wakad', 'Hinjewadi', 'Camp'],
      'Kolkata': ['Park Street', 'Salt Lake', 'Ballygunge', 'Rajarhat', 'Howrah'],
      'Ahmedabad': ['Satellite', 'Vastrapur', 'SG Highway', 'Navrangpura', 'Prahlad Nagar'],
      'Jaipur': ['Civil Lines', 'MI Road', 'Malviya Nagar', 'Vaishali Nagar', 'Ajmer Road'],
      'Goa': ['Panaji', 'Calangute', 'Baga', 'Anjuna', 'Candolim']
    };
    
    const cityAreas = areas[city] || [hotel.area];
    const randomArea = cityAreas[Math.floor(Math.random() * cityAreas.length)];
    const streetNumber = Math.floor(Math.random() * 999) + 1;
    
    return `${streetNumber}, ${randomArea}, ${city}`;
  }

  // Generate mock phone number
  generateMockPhone() {
    const prefix = '+91 ';
    const numbers = ['98', '99', '97', '96', '95', '94'];
    const randomPrefix = numbers[Math.floor(Math.random() * numbers.length)];
    const remaining = Math.floor(Math.random() * 90000000) + 10000000;
    return `${prefix}${randomPrefix}${remaining}`;
  }

  // Generate mock email
  generateMockEmail(hotelName) {
    const domain = 'hotel.com';
    const cleanName = hotelName.toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .replace(/hotel|resort|palace|grand|royal/g, '')
      .substring(0, 10);
    return `reservations@${cleanName}${domain}`;
  }

  // Generate mock amenities based on category
  generateMockAmenities(category) {
    const allAmenities = [
      'Free WiFi', 'Swimming Pool', 'Spa & Wellness', 'Fitness Center', 
      'Restaurant', 'Room Service', 'Bar/Lounge', 'Business Center',
      'Concierge', 'Laundry Service', 'Airport Shuttle', 'Parking',
      'Air Conditioning', 'Conference Rooms', 'Banquet Hall'
    ];
    
    let amenityCount;
    switch (category) {
      case 'Luxury':
        amenityCount = 10 + Math.floor(Math.random() * 5);
        break;
      case 'Business':
        amenityCount = 8 + Math.floor(Math.random() * 4);
        break;
      case 'Mid-Range':
        amenityCount = 6 + Math.floor(Math.random() * 3);
        break;
      default:
        amenityCount = 4 + Math.floor(Math.random() * 3);
    }
    
    const shuffled = [...allAmenities].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, amenityCount);
  }

  // Get hotel suggestions for autocomplete
  getHotelSuggestions(query, maxResults = 5) {
    if (!query || query.length < 1) {
      return [];
    }
    
    const searchTerm = query.toLowerCase().trim();
    const suggestions = [];
    
    Object.keys(this.hotelsData).forEach(city => {
      const cityHotels = this.hotelsData[city];
      cityHotels.forEach(hotel => {
        if (hotel.name.toLowerCase().includes(searchTerm)) {
          suggestions.push({
            name: hotel.name,
            city: city,
            fullText: `${hotel.name} - ${city}`
          });
        }
      });
    });
    
    return suggestions
      .sort((a, b) => a.name.localeCompare(b.name))
      .slice(0, maxResults);
  }
}

// Initialize the service
window.hotelsDataService = new HotelsDataService();
