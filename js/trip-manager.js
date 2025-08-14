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
    let allAttractions = [];
    
    if (dynamicAttractions.length > 0) {
      // Prioritize dynamic data but mix in some static data
      allAttractions = [...dynamicAttractions, ...staticAttractions.slice(0, 2)];
    } else {
      // Use static data as primary source
      allAttractions = staticAttractions;
    }
    
    const uniqueAttractions = [...new Set(allAttractions)];
    const finalAttractions = uniqueAttractions.slice(0, 8); // Limit to 8 attractions for UI
    
    console.log(`Final attractions for ${place.city}:`, finalAttractions);
    return finalAttractions;
  }

  // Static attractions data (fallback) - Comprehensive coverage for all Indian states
  getStaticAttractions(cityName) {
    const attractionsMap = {
      // Major Metropolitan Cities
      'Delhi': [
        'Red Fort Complex', 'India Gate Memorial', 'Qutub Minar Complex', 'Lotus Temple', 'Humayun\'s Tomb Garden', 'Chandni Chowk Market', 'Jama Masjid', 'National Museum'
      ],
      'New Delhi': [
        'Rashtrapati Bhavan', 'Parliament House', 'Connaught Place', 'National Gallery', 'Rajpath', 'Khan Market'
      ],
      'Old Delhi': [
        'Red Fort', 'Chandni Chowk', 'Jama Masjid', 'Raj Ghat', 'Spice Market', 'Paranthe Wali Gali'
      ],
      'Mumbai': [
        'Gateway of India', 'Marine Drive Promenade', 'Elephanta Caves', 'Chhatrapati Shivaji Terminus', 'Crawford Market', 'Hanging Gardens', 'Juhu Beach', 'Sanjay Gandhi National Park'
      ],
      'Bangalore': [
        'Lalbagh Botanical Garden', 'Bangalore Palace', 'Tipu Sultan\'s Summer Palace', 'Cubbon Park', 'ISKCON Temple', 'UB City Mall', 'Wonderla', 'Nandi Hills'
      ],
      'Chennai': [
        'Marina Beach', 'Kapaleeshwarar Temple', 'Fort St. George', 'Government Museum', 'San Thome Cathedral', 'Parthasarathy Temple'
      ],
      'Kolkata': [
        'Victoria Memorial', 'Howrah Bridge', 'Dakshineswar Temple', 'Indian Museum', 'Park Street', 'Eden Gardens', 'Kalighat Temple'
      ],
      'Hyderabad': [
        'Charminar', 'Golconda Fort', 'Ramoji Film City', 'Hussain Sagar Lake', 'Salar Jung Museum', 'Birla Mandir', 'Laad Bazaar'
      ],

      // Rajasthan - Desert State
      'Jaipur': [
        'Amber Fort Palace', 'City Palace Complex', 'Hawa Mahal', 'Jantar Mantar Observatory', 'Nahargarh Fort', 'Jaigarh Fort', 'Albert Hall Museum', 'Birla Mandir'
      ],
      'Jodhpur': [
        'Mehrangarh Fort', 'Umaid Bhawan Palace', 'Jaswant Thada', 'Mandore Gardens', 'Clock Tower Market', 'Rao Jodha Desert Rock Park'
      ],
      'Jaisalmer': [
        'Jaisalmer Fort', 'Sam Sand Dunes', 'Patwon Ki Haveli', 'Gadisar Lake', 'Desert Safari', 'Nathmal Ki Haveli', 'Kuldhara Village'
      ],
      'Udaipur': [
        'City Palace Udaipur', 'Lake Pichola', 'Jag Mandir', 'Saheliyon Ki Bari', 'Fateh Sagar Lake', 'Monsoon Palace', 'Jagdish Temple'
      ],
      'Pushkar': [
        'Pushkar Lake', 'Brahma Temple', 'Camel Fair Ground', 'Savitri Temple', 'Rose Garden', 'Pushkar Bazaar'
      ],
      'Mount Abu': [
        'Dilwara Temples', 'Nakki Lake', 'Guru Shikhar', 'Mount Abu Wildlife Sanctuary', 'Sunset Point', 'Toad Rock'
      ],
      'Bikaner': [
        'Junagarh Fort', 'Karni Mata Temple', 'National Camel Research Centre', 'Lalgarh Palace', 'Ganga Singh Museum'
      ],
      'Ajmer': [
        'Ajmer Sharif Dargah', 'Ana Sagar Lake', 'Adhai Din Ka Jhonpra', 'Taragarh Fort', 'Akbari Fort Museum'
      ],
      'Chittorgarh': [
        'Chittorgarh Fort', 'Vijay Stambh', 'Kirti Stambh', 'Rana Kumbha Palace', 'Padmini Palace', 'Meera Temple'
      ],
      'Ranthambore': [
        'Ranthambore National Park', 'Ranthambore Fort', 'Tiger Safari', 'Padam Talao', 'Malik Talao'
      ],

      // Kerala - God's Own Country
      'Kochi': [
        'Chinese Fishing Nets', 'Mattancherry Palace', 'Jewish Synagogue', 'Fort Kochi Beach', 'St. Francis Church', 'Kerala Folklore Museum', 'Marine Drive'
      ],
      'Munnar': [
        'Tea Museum', 'Eravikulam National Park', 'Mattupetty Dam', 'Echo Point', 'Top Station Viewpoint', 'Kundala Lake', 'Rose Garden'
      ],
      'Alleppey': [
        'Backwater Cruises', 'Houseboat Experience', 'Alappuzha Beach', 'Krishnapuram Palace', 'Marari Beach', 'Kumarakom Bird Sanctuary'
      ],
      'Thekkady': [
        'Periyar Wildlife Sanctuary', 'Periyar Lake', 'Elephant Rides', 'Spice Plantations', 'Bamboo Rafting', 'Martial Arts Shows'
      ],
      'Thiruvananthapuram': [
        'Padmanabhaswamy Temple', 'Kovalam Beach', 'Napier Museum', 'Kuthiramalika Palace', 'Agasthyakoodam Peak'
      ],
      'Kozhikode': [
        'Kozhikode Beach', 'Mananchira Square', 'Pazhassi Raja Museum', 'Tali Temple', 'Sweet Meat Street'
      ],
      'Thrissur': [
        'Vadakkunnathan Temple', 'Thrissur Pooram', 'Archaeological Museum', 'Athirapally Falls', 'Bible Tower'
      ],
      'Kumarakom': [
        'Kumarakom Bird Sanctuary', 'Vembanad Lake', 'Backwater Resorts', 'Bay Island Driftwood Museum', 'Pathiramanal Island'
      ],
      'Varkala': [
        'Varkala Beach', 'Janardhana Swamy Temple', 'Sivagiri Mutt', 'Varkala Cliff', 'Papanasam Beach'
      ],
      'Wayanad': [
        'Edakkal Caves', 'Wayanad Wildlife Sanctuary', 'Chembra Peak', 'Soochipara Falls', 'Banasura Sagar Dam'
      ],

      // Karnataka
      'Mysore': [
        'Mysore Palace', 'Chamundi Hills', 'St. Philomena\'s Church', 'Jaganmohan Palace', 'Brindavan Gardens', 'Devaraja Market'
      ],
      'Hampi': [
        'Virupaksha Temple', 'Lotus Mahal', 'Elephant Stables', 'Vittala Temple', 'Hemakuta Hills', 'Royal Enclosure'
      ],
      'Coorg': [
        'Abbey Falls', 'Raja\'s Seat', 'Dubare Elephant Camp', 'Talakaveri', 'Namdroling Monastery', 'Coffee Plantations'
      ],
      'Mangalore': [
        'Tannirbhavi Beach', 'Kadri Manjunath Temple', 'St. Aloysius Chapel', 'Pilikula Nisargadhama', 'Sultan Battery'
      ],
      'Udupi': [
        'Sri Krishna Temple', 'Malpe Beach', 'St. Mary\'s Island', 'Anegudde Vinayaka Temple', 'Kaup Beach'
      ],
      'Chikmagalur': [
        'Mullayanagiri Peak', 'Baba Budangiri', 'Coffee Museum', 'Hebbe Falls', 'Z Point', 'Kemmangundi'
      ],
      'Badami': [
        'Badami Cave Temples', 'Agastya Lake', 'Banashankari Temple', 'Archaeological Museum', 'Bhutanatha Temples'
      ],
      'Belur': [
        'Chennakeshava Temple', 'Hoysala Architecture', 'Yagachi Dam', 'Doddagaddavalli Temple'
      ],
      'Halebidu': [
        'Hoysaleswara Temple', 'Kedareshwara Temple', 'Archaeological Museum', 'Basadi Halli'
      ],

      // Goa - Beach Paradise
      'Panaji': [
        'Church of Our Lady', 'Goa State Museum', 'Dona Paula', 'Miramar Beach', 'Fontainhas Latin Quarter'
      ],
      'Calangute': [
        'Calangute Beach', 'Water Sports', 'Beach Shacks', 'Saturday Night Market', 'St. Alex Church'
      ],
      'Arambol': [
        'Arambol Beach', 'Sweet Lake', 'Paragliding', 'Drum Circle', 'Cliff Walk'
      ],
      'Margao': [
        'Colva Beach', 'Holy Spirit Church', 'Municipal Market', 'Ancestral Goa', 'Benaulim Beach'
      ],
      'Vasco da Gama': [
        'Bogmalo Beach', 'Naval Aviation Museum', 'Japanese Garden', 'Sada Beach'
      ],
      'Old Goa': [
        'Basilica of Bom Jesus', 'Se Cathedral', 'Church of St. Francis', 'Archaeological Museum', 'Convent of St. Monica'
      ],
      'Anjuna': [
        'Anjuna Beach', 'Wednesday Flea Market', 'Curlies Beach Shack', 'Chapora Fort', 'Ozran Beach'
      ],
      'Palolem': [
        'Palolem Beach', 'Butterfly Beach', 'Cabo de Rama Fort', 'Cotigao Wildlife Sanctuary'
      ],

      // Tamil Nadu
      'Madurai': [
        'Meenakshi Amman Temple', 'Gandhi Memorial Museum', 'Thirumalai Nayakkar Palace', 'Alagar Hills', 'Vandiyur Mariamman Teppakulam'
      ],
      'Ooty': [
        'Botanical Gardens', 'Doddabetta Peak', 'Toy Train', 'Ooty Lake', 'Rose Garden', 'Tea Gardens'
      ],
      'Kodaikanal': [
        'Kodai Lake', 'Bryant Park', 'Coaker\'s Walk', 'Pillar Rocks', 'Silver Cascade Falls', 'Kurinji Andavar Temple'
      ],
      'Kanyakumari': [
        'Vivekananda Rock Memorial', 'Thiruvalluvar Statue', 'Kanyakumari Temple', 'Gandhi Memorial', 'Sunset Point'
      ],
      'Pondicherry': [
        'French Quarter', 'Auroville', 'Promenade Beach', 'Sri Aurobindo Ashram', 'Paradise Beach', 'Bharathi Park'
      ],
      'Thanjavur': [
        'Brihadeeswara Temple', 'Thanjavur Palace', 'Art Gallery', 'Saraswathi Mahal Library', 'Sivaganga Garden'
      ],
      'Rameswaram': [
        'Ramanathaswamy Temple', 'Pamban Bridge', 'Dhanushkodi', 'Adam\'s Bridge', 'Gandhamadhana Parvatham'
      ],
      'Coimbatore': [
        'Marudamalai Temple', 'Kovai Kutralam Falls', 'Brookelands Museum', 'VOC Park', 'Perur Pateeswarar Temple'
      ],
      'Mahabalipuram': [
        'Shore Temple', 'Five Rathas', 'Arjuna\'s Penance', 'Tiger Cave', 'Crocodile Bank', 'Mahabalipuram Beach'
      ],

      // Himachal Pradesh - Mountain State
      'Shimla': [
        'The Ridge', 'Mall Road', 'Jakhoo Temple', 'Christ Church', 'Viceregal Lodge', 'Kufri', 'Summer Hill'
      ],
      'Manali': [
        'Rohtang Pass', 'Solang Valley', 'Hadimba Temple', 'Manu Temple', 'Old Manali', 'Vashisht Hot Springs', 'Jogini Falls'
      ],
      'Dharamshala': [
        'Dalai Lama Temple', 'McLeod Ganj', 'Bhagsu Falls', 'Triund Trek', 'Norbulingka Institute', 'St. John Church'
      ],
      'Dalhousie': [
        'Khajjiar', 'Dainkund Peak', 'St. John\'s Church', 'Panchpula', 'Satdhara Falls'
      ],
      'Kasauli': [
        'Christ Church', 'Monkey Point', 'Kasauli Brewery', 'Mall Road', 'Sunset Point'
      ],
      'Kullu': [
        'Raghunath Temple', 'Great Himalayan National Park', 'Bijli Mahadev', 'Naggar Castle', 'Kasol'
      ],
      'Spiti Valley': [
        'Key Monastery', 'Tabo Monastery', 'Pin Valley National Park', 'Chandratal Lake', 'Kaza'
      ],
      'Kinnaur': [
        'Kalpa', 'Sangla Valley', 'Chitkul', 'Recong Peo', 'Nako Lake'
      ],

      // Uttar Pradesh
      'Agra': [
        'Taj Mahal', 'Agra Fort', 'Fatehpur Sikri', 'Mehtab Bagh', 'Tomb of Itimad-ud-Daulah', 'Akbar\'s Tomb', 'Jama Masjid'
      ],
      'Varanasi': [
        'Kashi Vishwanath Temple', 'Dashashwamedh Ghat', 'Sarnath', 'Ramnagar Fort', 'Assi Ghat', 'Manikarnika Ghat', 'BHU'
      ],
      'Lucknow': [
        'Bara Imambara', 'Chota Imambara', 'Rumi Darwaza', 'British Residency', 'Hazratganj Market', 'Ambedkar Park'
      ],
      'Allahabad': [
        'Triveni Sangam', 'Allahabad Fort', 'Khusro Bagh', 'Anand Bhavan', 'Akshayavat'
      ],
      'Mathura': [
        'Krishna Janmabhoomi', 'Dwarkadhish Temple', 'Government Museum', 'Vishram Ghat', 'Kusum Sarovar'
      ],
      'Vrindavan': [
        'Banke Bihari Temple', 'ISKCON Temple', 'Prem Mandir', 'Radha Raman Temple', 'Nidhivan'
      ],
      'Ayodhya': [
        'Ram Janmabhoomi', 'Hanuman Garhi', 'Kanak Bhavan', 'Tulsi Smarak Bhavan', 'Sita Ki Rasoi'
      ],
      'Sarnath': [
        'Dhamek Stupa', 'Sarnath Museum', 'Chaukhandi Stupa', 'Deer Park', 'Thai Temple'
      ],

      // Uttarakhand
      'Rishikesh': [
        'Laxman Jhula', 'Ram Jhula', 'Triveni Ghat', 'Beatles Ashram', 'Neer Garh Waterfall', 'Yoga Centers'
      ],
      'Haridwar': [
        'Har Ki Pauri', 'Chandi Devi Temple', 'Mansa Devi Temple', 'Maya Devi Temple', 'Ganga Aarti'
      ],
      'Dehradun': [
        'Robber\'s Cave', 'Sahastradhara', 'Mindrolling Monastery', 'Forest Research Institute', 'Tapkeshwar Temple'
      ],
      'Nainital': [
        'Naini Lake', 'Naina Devi Temple', 'Mall Road', 'Snow View Point', 'Tiffin Top', 'Bhimtal'
      ],
      'Mussoorie': [
        'Gun Hill', 'Kempty Falls', 'Mall Road', 'Lal Tibba', 'Camel\'s Back Road', 'Cloud\'s End'
      ],
      'Jim Corbett': [
        'Tiger Safari', 'Corbett Falls', 'Garjiya Devi Temple', 'Dhikala Zone', 'Bijrani Zone'
      ],
      'Kedarnath': [
        'Kedarnath Temple', 'Shankaracharya Samadhi', 'Bhairav Temple', 'Gandhi Sarovar', 'Triyuginarayan Temple'
      ],
      'Badrinath': [
        'Badrinath Temple', 'Mana Village', 'Tapt Kund', 'Brahma Kapal', 'Charanpaduka'
      ],
      'Valley of Flowers': [
        'Alpine Flowers', 'Hemkund Sahib', 'Pushpawati River', 'Brahma Kamal', 'Blue Poppy'
      ],
      'Auli': [
        'Skiing Slopes', 'Ropeway', 'Auli Lake', 'Kwani Bugyal', 'Joshimath'
      ],

      // West Bengal
      'Darjeeling': [
        'Tiger Hill', 'Darjeeling Himalayan Railway', 'Happy Valley Tea Estate', 'Peace Pagoda', 'Observatory Hill', 'Mall Road'
      ],
      'Sundarbans': [
        'Royal Bengal Tigers', 'Mangrove Forests', 'Sajnekhali Wildlife Sanctuary', 'Boat Safari', 'Dobanki Watch Tower'
      ],
      'Siliguri': [
        'Mahananda Wildlife Sanctuary', 'ISKCON Temple', 'Salugara Monastery', 'Hong Kong Market'
      ],
      'Durgapur': [
        'Durgapur Barrage', 'Troika Park', 'Bhabani Pathak\'s Tilla', 'Anand Amusement Park'
      ],
      'Kalimpong': [
        'Zang Dhok Palri Phodang', 'Durpin Monastery', 'Deolo Hill', 'Cactus Nursery', 'Pine View Nursery'
      ],
      'Howrah': [
        'Howrah Bridge', 'Belur Math', 'Indian Botanical Garden', 'Santragachhi Jheel'
      ],
      'Digha': [
        'Digha Beach', 'New Digha Beach', 'Marine Aquarium', 'Amarabati Park', 'Udaypur Beach'
      ],

      // Gujarat
      'Ahmedabad': [
        'Sabarmati Ashram', 'Jama Masjid', 'Sidi Saiyyed Mosque', 'Calico Museum', 'Kankaria Lake', 'Adalaj Stepwell'
      ],
      'Dwarka': [
        'Dwarkadhish Temple', 'Rukmini Devi Temple', 'Nageshwar Jyotirlinga', 'Beyt Dwarka', 'Gopi Talav'
      ],
      'Somnath': [
        'Somnath Temple', 'Bhalka Tirth', 'Triveni Sangam', 'Somnath Beach', 'Prabhas Patan Museum'
      ],
      'Rann of Kutch': [
        'White Desert', 'Rann Utsav', 'Kala Dungar', 'Wild Ass Sanctuary', 'Fossil Park'
      ],
      'Surat': [
        'Surat Castle', 'Dutch Garden', 'Dumas Beach', 'Sarthana Nature Park', 'ISKCON Temple'
      ],
      'Vadodara': [
        'Laxmi Vilas Palace', 'Sayaji Baug', 'EME Temple', 'Baroda Museum', 'Sursagar Lake'
      ],
      'Rajkot': [
        'Kaba Gandhi No Delo', 'Watson Museum', 'Jubilee Garden', 'Rotary Dolls Museum', 'Race Course'
      ],
      'Gir National Park': [
        'Asiatic Lions', 'Lion Safari', 'Devalia Safari Park', 'Crocodile Breeding Centre', 'Gir Interpretation Zone'
      ],
      'Saputara': [
        'Lake Garden', 'Sunset Point', 'Ropeway', 'Artist Village', 'Echo Point'
      ],

      // Andhra Pradesh
      'Tirupati': [
        'Tirumala Venkateswara Temple', 'Sri Vari Museum', 'Kapila Theertham', 'Akasa Ganga', 'Papavinasam Theertham'
      ],
      'Vijayawada': [
        'Kanaka Durga Temple', 'Prakasam Barrage', 'Undavalli Caves', 'Bhavani Island', 'Gandhi Hill'
      ],
      'Visakhapatnam': [
        'RK Beach', 'Araku Valley', 'Submarine Museum', 'Kailasagiri Hill', 'Simhachalam Temple'
      ],
      'Amaravati': [
        'Amaravati Stupa', 'Archaeological Museum', 'Dhyana Buddha Statue', 'Undavalli Caves'
      ],
      'Lepakshi': [
        'Veerabhadra Temple', 'Hanging Pillar', 'Nandi Bull', 'Fresco Paintings', 'Kalyana Mandapa'
      ],
      'Horsley Hills': [
        'Environmental Park', 'Mallamma Temple', 'Viewpoints', 'Kalyani Springs', 'Rishi Valley School'
      ],
      'Araku Valley': [
        'Coffee Plantations', 'Tribal Museum', 'Borra Caves', 'Katiki Waterfalls', 'Chaparai Water Cascade'
      ],

      // Telangana
      'Warangal': [
        'Thousand Pillar Temple', 'Warangal Fort', 'Bhadrakali Temple', 'Pakhal Lake', 'Ramappa Temple'
      ],
      'Nizamabad': [
        'Nizamabad Fort', 'Sarangpur Hanuman Temple', 'Archaeological Museum', 'Dichpally Ramalayam'
      ],
      'Khammam': [
        'Khammam Fort', 'Lakaram Lake', 'Nelakondapalli', 'Kinnerasani Wildlife Sanctuary'
      ],
      'Karimnagar': [
        'Elgandal Fort', 'Lower Manair Dam', 'Vemulawada Temple', 'Jagityal'
      ],

      // Assam
      'Guwahati': [
        'Kamakhya Temple', 'Umananda Temple', 'Assam State Museum', 'Nehru Park', 'Fancy Bazaar'
      ],
      'Kaziranga': [
        'One-horned Rhinoceros', 'Elephant Safari', 'Jeep Safari', 'Mihimukh', 'Bagori Range'
      ],
      'Jorhat': [
        'Tocklai Tea Research Centre', 'Gibbon Wildlife Sanctuary', 'Sukapha Samannay Kshetra', 'Thengal Manor'
      ],
      'Majuli': [
        'Satras (Monasteries)', 'Auniati Satra', 'Dakhinpat Satra', 'Garamur Satra', 'Mask Making'
      ],
      'Silchar': [
        'Khaspur', 'Maniharan Tunnel', 'Gandhari Hill', 'Dolu Lake'
      ],
      'Dibrugarh': [
        'Jokai Botanical Garden', 'Barbarua Maidam', 'Jagannath Temple', 'Radha Krishna Temple'
      ],
      'Tezpur': [
        'Agnigarh', 'Da Parbatia', 'Mahabhairab Temple', 'Cole Park', 'Chitralekha Udyan'
      ],

      // Jammu and Kashmir
      'Srinagar': [
        'Dal Lake', 'Mughal Gardens', 'Jamia Masjid', 'Hazratbal Shrine', 'Pari Mahal', 'Chashme Shahi'
      ],
      'Jammu': [
        'Vaishno Devi', 'Raghunath Temple', 'Bahu Fort', 'Amar Mahal Palace', 'Dogra Art Museum'
      ],
      'Gulmarg': [
        'Gondola Ride', 'Skiing', 'Apharwat Peak', 'Golf Course', 'St. Mary\'s Church'
      ],
      'Pahalgam': [
        'Betaab Valley', 'Aru Valley', 'Chandanwari', 'Baisaran', 'Sheshnag Lake'
      ],
      'Sonamarg': [
        'Thajiwas Glacier', 'Zoji La Pass', 'Krishnasar Lake', 'Vishansar Lake', 'Nichinai Pass'
      ],

      // Ladakh
      'Leh': [
        'Leh Palace', 'Shanti Stupa', 'Magnetic Hill', 'Hall of Fame', 'Thiksey Monastery', 'Hemis Monastery'
      ],
      'Kargil': [
        'Kargil War Memorial', 'Mulbekh Monastery', 'Suru Valley', 'Rangdum Monastery'
      ],
      'Nubra Valley': [
        'Sand Dunes', 'Double Humped Camels', 'Diskit Monastery', 'Khardung La Pass', 'Panamik Hot Springs'
      ],

      // Madhya Pradesh
      'Bhopal': [
        'Taj-ul-Masajid', 'Bhojtal Lake', 'Van Vihar National Park', 'Bharat Bhavan', 'State Museum'
      ],
      'Indore': [
        'Rajwada Palace', 'Lal Bagh Palace', 'Kanch Mandir', 'Central Museum', 'Sarafa Bazaar'
      ],
      'Khajuraho': [
        'Kandariya Mahadev Temple', 'Lakshmana Temple', 'Chitragupta Temple', 'Archaeological Museum', 'Light & Sound Show'
      ],
      'Gwalior': [
        'Gwalior Fort', 'Jai Vilas Palace', 'Saas Bahu Temples', 'Teli Ka Mandir', 'Sun Temple'
      ],
      'Ujjain': [
        'Mahakaleshwar Temple', 'Ram Ghat', 'Kal Bhairav Temple', 'Sandipani Ashram', 'Ved Shala'
      ],
      'Sanchi': [
        'Great Stupa', 'Sanchi Museum', 'Gupta Temple', 'Monastery Ruins', 'Lion Capital'
      ],
      'Pachmarhi': [
        'Bee Falls', 'Jata Shankar', 'Pandav Caves', 'Dhoopgarh', 'Mahadeo Hills'
      ],
      'Jabalpur': [
        'Marble Rocks', 'Dhuandhar Falls', 'Madan Mahal Fort', 'Balancing Rock', 'Rani Durgavati Museum'
      ],
      'Bandhavgarh': [
        'Tiger Reserve', 'Bandhavgarh Fort', 'Baghel Museum', 'Climbers Point', 'Three Cave Point'
      ],
      'Kanha': [
        'Tiger Safari', 'Bamni Dadar', 'Kanha Museum', 'Kawardha Palace', 'Mukki Zone'
      ],

      // Bihar
      'Patna': [
        'Golghar', 'Patna Museum', 'Gandhi Maidan', 'Padri Ki Haveli', 'Takht Sri Patna Sahib'
      ],
      'Bodh Gaya': [
        'Mahabodhi Temple', 'Bodhi Tree', 'Great Buddha Statue', 'Archaeological Museum', 'Thai Monastery'
      ],
      'Nalanda': [
        'Nalanda University Ruins', 'Nalanda Museum', 'Hiuen Tsang Memorial', 'Kundalpur Jain Temple'
      ],
      'Rajgir': [
        'Griddhakuta Hill', 'Hot Springs', 'Vishwa Shanti Stupa', 'Ajatashatru Fort', 'Son Bhandar Caves'
      ],
      'Vaishali': [
        'Ashokan Pillar', 'Buddha Stupa', 'Coronation Tank', 'Vaishali Museum', 'Kundalpur'
      ],
      'Pawapuri': [
        'Jal Mandir', 'Samosharan Temple', 'Pawapuri Jain Temple', 'Lotus Pond'
      ],
      'Sasaram': [
        'Tomb of Sher Shah Suri', 'Rohtasgarh Fort', 'Choti Dargah', 'Tarachandi Temple'
      ],

      // Chhattisgarh
      'Raipur': [
        'Mahant Ghasidas Memorial Museum', 'Vivekananda Sarovar', 'Nandan Van Zoo', 'Purkhouti Muktangan'
      ],
      'Jagdalpur': [
        'Chitrakoot Falls', 'Tirathgarh Falls', 'Kanger Valley National Park', 'Anthropological Museum'
      ],
      'Bilaspur': [
        'Ratanpur', 'Khutaghat Dam', 'Achanakmar Wildlife Sanctuary', 'Malhar'
      ],
      'Korba': [
        'Korba Thermal Plant', 'Kendai Falls', 'Amrit Dhara Falls', 'Guru Ghasidas National Park'
      ],
      'Bastar': [
        'Danteshwari Temple', 'Bastar Palace', 'Tribal Handicrafts', 'Iron Craft Villages'
      ],
      'Chitrakoot Falls': [
        'Horseshoe Falls', 'Boat Rides', 'Tribal Villages', 'Natural Pools'
      ],

      // Jharkhand
      'Ranchi': [
        'Rock Garden', 'Tagore Hill', 'Hundru Falls', 'Jonha Falls', 'Jagannath Temple'
      ],
      'Jamshedpur': [
        'Tata Steel Zoological Park', 'Jubilee Park', 'Dimna Lake', 'Dalma Wildlife Sanctuary'
      ],
      'Dhanbad': [
        'Maithon Dam', 'Topchanchi Lake', 'Parasnath Hills', 'Shakti Mandir'
      ],
      'Deoghar': [
        'Baidyanath Temple', 'Nandan Pahar', 'Tapovan', 'Trikuta Parvat'
      ],
      'Hazaribagh': [
        'Hazaribagh National Park', 'Canary Hill', 'Konar Dam', 'Rajrappa Temple'
      ],
      'Netarhat': [
        'Sunrise Point', 'Sunset Point', 'Magnolia Point', 'Pine Forest'
      ],

      // Arunachal Pradesh
      'Itanagar': [
        'Ita Fort', 'Jawaharlal Nehru State Museum', 'Polo Park', 'Ganga Lake'
      ],
      'Tawang': [
        'Tawang Monastery', 'Sela Pass', 'Jaswant Garh War Memorial', 'Pankang Teng Tso Lake'
      ],
      'Ziro': [
        'Ziro Valley', 'Apatani Villages', 'Talley Valley Wildlife Sanctuary', 'Ziro Music Festival'
      ],
      'Bomdila': [
        'Bomdila Monastery', 'Apple Orchards', 'Craft Centre', 'Eagle Nest Wildlife Sanctuary'
      ],
      'Pasighat': [
        'Siang River', 'Daying Ering Wildlife Sanctuary', 'Pangin', 'Komsing'
      ],
      'Namdapha': [
        'Namdapha National Park', 'Miao', 'Deban', 'Four Big Cat Species'
      ],

      // Manipur
      'Imphal': [
        'Kangla Fort', 'Ima Keithel Market', 'War Cemetery', 'Manipur State Museum'
      ],
      'Loktak Lake': [
        'Phumdis (Floating Islands)', 'Sendra Island', 'Keibul Lamjao National Park', 'Fishing Villages'
      ],
      'Kangla': [
        'Kangla Palace', 'Kangla Museum', 'Sacred Groves', 'Ancient Temples'
      ],
      'Moreh': [
        'Indo-Myanmar Border', 'Moreh Market', 'Red Mountain', 'Friendship Gate'
      ],
      'Ukhrul': [
        'Shirui Kashong Peak', 'Khangkhui Cave', 'Shirui Lily', 'Khayang Peak'
      ],

      // Meghalaya
      'Shillong': [
        'Elephant Falls', 'Umiam Lake', 'Don Bosco Museum', 'Ward\'s Lake', 'Police Bazaar'
      ],
      'Cherrapunji': [
        'Seven Sisters Falls', 'Mawsmai Cave', 'Eco Park', 'Living Root Bridges'
      ],
      'Mawlynnong': [
        'Cleanest Village', 'Living Root Bridge', 'Sky Walk', 'Balancing Rock'
      ],
      'Dawki': [
        'Umngot River', 'Crystal Clear Water', 'India-Bangladesh Border', 'Shnongpdeng'
      ],
      'Tura': [
        'Nokrek National Park', 'Tura Peak', 'Pelga Falls', 'Balpakram National Park'
      ],

      // Mizoram
      'Aizawl': [
        'Solomon\'s Temple', 'Mizoram State Museum', 'Durtlang Hills', 'KV Paradise'
      ],
      'Champhai': [
        'Rih Dil Lake', 'Lengteng Wildlife Sanctuary', 'Murlen National Park', 'Ruantlang'
      ],
      'Lunglei': [
        'Zobawk Sports Complex', 'Thorangtlang Wildlife Sanctuary', 'Khawnglung Wildlife Sanctuary'
      ],
      'Serchhip': [
        'Vantawng Falls', 'Thenzawl Golf Resort', 'Chhingpuii Thlan'
      ],

      // Nagaland
      'Kohima': [
        'Kohima War Cemetery', 'State Museum', 'Hornbill Festival Ground', 'Japfu Peak'
      ],
      'Dimapur': [
        'Kachari Ruins', 'Nagaland Science Centre', 'Triple Falls', 'Rangapahar Reserve Forest'
      ],
      'Mokokchung': [
        'Longkhum Village', 'Ungma Village', 'Chuchuyimlang Village', 'Ao Heritage Village'
      ],
      'Wokha': [
        'Mount Tiyi', 'Doyang River', 'Lotha Heritage Village', 'Totsu Cliffs'
      ],

      // Odisha
      'Bhubaneswar': [
        'Lingaraj Temple', 'Udayagiri Caves', 'Dhauli Peace Pagoda', 'Mukteswara Temple', 'Regional Museum'
      ],
      'Puri': [
        'Jagannath Temple', 'Puri Beach', 'Gundicha Temple', 'Sun Temple Konark', 'Chilika Lake'
      ],
      'Konark': [
        'Sun Temple', 'Konark Beach', 'Archaeological Museum', 'Kurma Temple', 'Ramchandi Temple'
      ],
      'Cuttack': [
        'Barabati Fort', 'Cuttack Chandi Temple', 'Netaji Birth Place Museum', 'Odisha State Maritime Museum'
      ],
      'Chilika Lake': [
        'Asia\'s Largest Brackish Water Lagoon', 'Nalabana Bird Sanctuary', 'Kalijai Temple', 'Irrawaddy Dolphins'
      ],
      'Sambalpur': [
        'Hirakud Dam', 'Samaleswari Temple', 'Ushakothi Wildlife Sanctuary', 'Huma Temple'
      ],
      'Gopalpur': [
        'Gopalpur Beach', 'Lighthouse', 'Rushikulya Turtle Rookery', 'Tampara Lake'
      ],

      // Punjab
      'Chandigarh': [
        'Rock Garden', 'Sukhna Lake', 'Rose Garden', 'Capitol Complex', 'Government Museum'
      ],
      'Ludhiana': [
        'Punjab Agricultural University Museum', 'Lodhi Fort', 'Nehru Rose Garden', 'Tiger Safari'
      ],
      'Jalandhar': [
        'Devi Talab Mandir', 'Pushpa Gujral Science City', 'St. Mary\'s Cathedral', 'Rangla Punjab Haveli'
      ],
      'Patiala': [
        'Qila Mubarak', 'Sheesh Mahal', 'National Institute of Sports', 'Baradari Gardens'
      ],
      'Bathinda': [
        'Qila Mubarak', 'Rose Garden', 'Zoological Garden', 'Thermal Plant'
      ],

      // Sikkim
      'Gangtok': [
        'Rumtek Monastery', 'Tsomgo Lake', 'Nathu La Pass', 'Ganesh Tok', 'Hanuman Tok'
      ],
      'Pelling': [
        'Pemayangtse Monastery', 'Khecheopalri Lake', 'Sangachoeling Monastery', 'Rabdentse Ruins'
      ],
      'Lachung': [
        'Yumthang Valley', 'Zero Point', 'Lachung Monastery', 'Hot Springs'
      ],
      'Namchi': [
        'Char Dham', 'Samdruptse Buddha Statue', 'Temi Tea Garden', 'Ralang Monastery'
      ],
      'Yuksom': [
        'Norbugang Coronation Throne', 'Dubdi Monastery', 'Kanchenjunga Base Camp', 'Khangchendzonga National Park'
      ],

      // Tripura
      'Agartala': [
        'Ujjayanta Palace', 'Neermahal', 'Tripura Sundari Temple', 'Heritage Park'
      ],
      'Udaipur': [
        'Tripura Sundari Temple', 'Bhuvaneswari Temple', 'Jagannath Temple', 'Kamalasagar'
      ],
      'Kailashahar': [
        'Unakoti', 'Chabimura', 'Pilak Archaeological Site', 'Jampui Hills'
      ],
      'Ambassa': [
        'Trishna Wildlife Sanctuary', 'Dumboor Lake', 'Rowa Wildlife Sanctuary'
      ],

      // Haryana
      'Gurugram': [
        'Kingdom of Dreams', 'Cyber Hub', 'Ambience Mall', 'Leisure Valley Park'
      ],
      'Faridabad': [
        'Surajkund', 'Badkhal Lake', 'Town Park', 'Anangpur Dam'
      ],
      'Panipat': [
        'Panipat Museum', 'Kabuli Bagh Mosque', 'Devi Temple', 'Ibrahim Lodhi\'s Tomb'
      ],
      'Kurukshetra': [
        'Brahma Sarovar', 'Jyotisar', 'Krishna Museum', 'Sheikh Chilli\'s Tomb'
      ],
      'Ambala': [
        'Sis Ganj Gurudwara', 'Ambala Cantonment', 'Manji Sahib Gurudwara'
      ],
      'Karnal': [
        'Karnal Lake', 'Cantonment Church Tower', 'Kalpana Chawla Planetarium'
      ],

      // Union Territories
      'Port Blair': [
        'Cellular Jail', 'Corbyn\'s Cove Beach', 'Anthropological Museum', 'Chatham Saw Mill'
      ],
      'Havelock Island': [
        'Radhanagar Beach', 'Elephant Beach', 'Kaala Pathar Beach', 'Scuba Diving'
      ],
      'Neil Island': [
        'Bharatpur Beach', 'Laxmanpur Beach', 'Sitapur Beach', 'Natural Bridge'
      ],
      'Kavaratti': [
        'Marine Aquarium', 'Ujra Mosque', 'Water Sports', 'Coral Reefs'
      ],
      'Agatti': [
        'Agatti Airport', 'Lagoon', 'Water Sports', 'Coral Gardens'
      ],
      'Puducherry': [
        'French Quarter', 'Auroville', 'Promenade Beach', 'Sri Aurobindo Ashram'
      ],
      'Karaikal': [
        'Karaikal Beach', 'Karaikal Ammaiyar Temple', 'Danish Fort', 'French War Memorial'
      ],
      'Dadra': [
        'Tribal Cultural Museum', 'Dudhni Lake', 'Vasona Lion Safari', 'Van Vihar'
      ],
      'Daman': [
        'Daman Fort', 'Jampore Beach', 'Church of Bom Jesus', 'Devka Beach'
      ],
      'Diu': [
        'Diu Fort', 'Naida Caves', 'St. Paul\'s Church', 'Gangeshwar Temple'
      ]
    };

    return attractionsMap[cityName] || [
      'Local Markets', 'Traditional Temples', 'Scenic Viewpoints', 'Cultural Centers', 'Historical Sites'
    ];
  }

  // Fetch dynamic attractions from external APIs
  async fetchDynamicAttractions(place) {
    try {
      console.log(`Fetching attractions for ${place.city}, ${place.state}...`);
      
      // Try multiple API sources for comprehensive data
      const attractions = await Promise.allSettled([
        this.fetchFromTripAdvisor(place),
        this.fetchFromWikipedia(place),
        this.fetchFromOpenTripMap(place)
      ]);

      const validAttractions = [];
      
      // Process results from each API
      attractions.forEach((result, index) => {
        const apiNames = ['TripAdvisor', 'Wikipedia', 'OpenTripMap'];
        if (result.status === 'fulfilled' && result.value.length > 0) {
          console.log(`${apiNames[index]} API returned ${result.value.length} attractions for ${place.city}`);
          validAttractions.push(...result.value);
        } else if (result.status === 'rejected') {
          console.warn(`${apiNames[index]} API failed for ${place.city}:`, result.reason);
        }
      });

      // Remove duplicates and limit results
      const uniqueAttractions = [...new Set(validAttractions)];
      
      if (uniqueAttractions.length > 0) {
        console.log(`Successfully fetched ${uniqueAttractions.length} unique attractions for ${place.city}`);
      } else {
        console.log(`No dynamic attractions found for ${place.city}, will use static data`);
      }
      
      return uniqueAttractions;
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

      // Try multiple Wikipedia API approaches
      const searchResults = await this.tryMultipleWikipediaEndpoints(place);
      return searchResults;
    } catch (error) {
      console.warn('Wikipedia API error:', error);
      return [];
    }
  }

  // Try multiple Wikipedia API endpoints for better reliability
  async tryMultipleWikipediaEndpoints(place) {
    const searchQuery = `${place.city} attractions landmarks`;
    
    // Method 1: Try the search API with different endpoint
    try {
      const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(searchQuery)}&format=json&origin=*&srlimit=3`;
      const response = await fetch(searchUrl);
      
      if (response.ok) {
        const data = await response.json();
        if (data.query?.search?.length > 0) {
          return data.query.search.map(page => page.title).slice(0, 3);
        }
      }
    } catch (error) {
      console.warn('Wikipedia search API failed:', error);
    }

    // Method 2: Try the REST API with a different approach
    try {
      const restUrl = `https://en.wikipedia.org/api/rest_v1/page/title/${encodeURIComponent(place.city)}`;
      const response = await fetch(restUrl);
      
      if (response.ok) {
        const data = await response.json();
        if (data.title) {
          return [data.title];
        }
      }
    } catch (error) {
      console.warn('Wikipedia REST API failed:', error);
    }

    // Method 3: Try OpenSearch API
    try {
      const opensearchUrl = `https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(place.city)}&limit=3&format=json&origin=*`;
      const response = await fetch(opensearchUrl);
      
      if (response.ok) {
        const data = await response.json();
        if (data && data[1] && data[1].length > 0) {
          return data[1].slice(0, 3);
        }
      }
    } catch (error) {
      console.warn('Wikipedia OpenSearch API failed:', error);
    }

    // Method 4: Try searching for common attraction types
    try {
      const attractionTypes = ['fort', 'palace', 'temple', 'market', 'museum'];
      const cityAttraction = attractionTypes.find(type => 
        Math.random() > 0.7 // Simulate finding relevant attraction types
      );
      
      if (cityAttraction) {
        const typeSearchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(place.city + ' ' + cityAttraction)}&format=json&origin=*&srlimit=2`;
        const response = await fetch(typeSearchUrl);
        
        if (response.ok) {
          const data = await response.json();
          if (data.query?.search?.length > 0) {
            return data.query.search.map(page => page.title).slice(0, 2);
          }
        }
      }
    } catch (error) {
      console.warn('Wikipedia attraction type search failed:', error);
    }

    // If all methods fail, return empty array
    return [];
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

  // Initialize places data for India - Comprehensive coverage of all states and UTs
  initializePlacesData() {
    return [
      // Andhra Pradesh
      { city: 'Tirupati', state: 'Andhra Pradesh', category: 'Religious', description: 'Abode of Lord Venkateswara' },
      { city: 'Vijayawada', state: 'Andhra Pradesh', category: 'City', description: 'Business capital on Krishna River' },
      { city: 'Visakhapatnam', state: 'Andhra Pradesh', category: 'Coastal', description: 'Port city with beautiful beaches' },
      { city: 'Amaravati', state: 'Andhra Pradesh', category: 'Capital', description: 'Modern capital city' },
      { city: 'Lepakshi', state: 'Andhra Pradesh', category: 'Historical', description: 'Temple town with hanging pillar' },
      { city: 'Horsley Hills', state: 'Andhra Pradesh', category: 'Hill Station', description: 'Cool hill retreat' },
      { city: 'Araku Valley', state: 'Andhra Pradesh', category: 'Hill Station', description: 'Coffee plantations and tribal culture' },

      // Arunachal Pradesh
      { city: 'Itanagar', state: 'Arunachal Pradesh', category: 'Capital', description: 'Capital city with rich tribal heritage' },
      { city: 'Tawang', state: 'Arunachal Pradesh', category: 'Monastery', description: 'Famous Buddhist monastery town' },
      { city: 'Ziro', state: 'Arunachal Pradesh', category: 'Valley', description: 'UNESCO World Heritage site with Apatani culture' },
      { city: 'Bomdila', state: 'Arunachal Pradesh', category: 'Hill Station', description: 'Scenic hill station with monasteries' },
      { city: 'Pasighat', state: 'Arunachal Pradesh', category: 'Nature', description: 'Gateway to Arunachal Pradesh' },
      { city: 'Namdapha', state: 'Arunachal Pradesh', category: 'Wildlife', description: 'National park with diverse wildlife' },

      // Assam
      { city: 'Guwahati', state: 'Assam', category: 'City', description: 'Gateway to Northeast India' },
      { city: 'Kaziranga', state: 'Assam', category: 'Wildlife', description: 'National park famous for one-horned rhinos' },
      { city: 'Jorhat', state: 'Assam', category: 'Tea', description: 'Tea capital of the world' },
      { city: 'Majuli', state: 'Assam', category: 'Island', description: 'World\'s largest river island' },
      { city: 'Silchar', state: 'Assam', category: 'City', description: 'Commercial hub of Barak Valley' },
      { city: 'Dibrugarh', state: 'Assam', category: 'Tea', description: 'Tea city of India' },
      { city: 'Tezpur', state: 'Assam', category: 'Historical', description: 'Cultural capital of Assam' },

      // Bihar
      { city: 'Patna', state: 'Bihar', category: 'Capital', description: 'Ancient city with rich history' },
      { city: 'Bodh Gaya', state: 'Bihar', category: 'Buddhist', description: 'Where Buddha attained enlightenment' },
      { city: 'Nalanda', state: 'Bihar', category: 'Educational', description: 'Ancient university ruins' },
      { city: 'Rajgir', state: 'Bihar', category: 'Religious', description: 'Sacred to both Buddhists and Jains' },
      { city: 'Vaishali', state: 'Bihar', category: 'Historical', description: 'Birthplace of democracy' },
      { city: 'Pawapuri', state: 'Bihar', category: 'Jain', description: 'Where Lord Mahavira attained nirvana' },
      { city: 'Sasaram', state: 'Bihar', category: 'Historical', description: 'Tomb of Sher Shah Suri' },

      // Chhattisgarh
      { city: 'Raipur', state: 'Chhattisgarh', category: 'Capital', description: 'Rice bowl of India' },
      { city: 'Jagdalpur', state: 'Chhattisgarh', category: 'Tribal', description: 'Heart of Bastar tribal region' },
      { city: 'Bilaspur', state: 'Chhattisgarh', category: 'City', description: 'Cultural hub of the state' },
      { city: 'Korba', state: 'Chhattisgarh', category: 'Industrial', description: 'Power capital of India' },
      { city: 'Bastar', state: 'Chhattisgarh', category: 'Tribal', description: 'Rich tribal culture and crafts' },
      { city: 'Chitrakoot Falls', state: 'Chhattisgarh', category: 'Waterfall', description: 'Niagara of India' },

      // Delhi
      { city: 'New Delhi', state: 'Delhi', category: 'Capital', description: 'National capital with government buildings' },
      { city: 'Old Delhi', state: 'Delhi', category: 'Historical', description: 'Mughal-era walled city' },

      // Goa
      { city: 'Panaji', state: 'Goa', category: 'Capital', description: 'Capital city with Portuguese heritage' },
      { city: 'Calangute', state: 'Goa', category: 'Beach', description: 'Queen of Beaches' },
      { city: 'Arambol', state: 'Goa', category: 'Beach', description: 'Hippie paradise with pristine beaches' },
      { city: 'Margao', state: 'Goa', category: 'City', description: 'Commercial capital of Goa' },
      { city: 'Vasco da Gama', state: 'Goa', category: 'Port', description: 'Major port city' },
      { city: 'Old Goa', state: 'Goa', category: 'Historical', description: 'UNESCO World Heritage churches' },
      { city: 'Anjuna', state: 'Goa', category: 'Beach', description: 'Famous for flea markets and nightlife' },
      { city: 'Palolem', state: 'Goa', category: 'Beach', description: 'Crescent-shaped paradise beach' },

      // Gujarat
      { city: 'Ahmedabad', state: 'Gujarat', category: 'Cultural', description: 'Textile hub with rich heritage' },
      { city: 'Dwarka', state: 'Gujarat', category: 'Religious', description: 'Krishna\'s kingdom' },
      { city: 'Somnath', state: 'Gujarat', category: 'Religious', description: 'First among 12 Jyotirlingas' },
      { city: 'Rann of Kutch', state: 'Gujarat', category: 'Desert', description: 'White salt desert' },
      { city: 'Surat', state: 'Gujarat', category: 'Diamond', description: 'Diamond capital of the world' },
      { city: 'Vadodara', state: 'Gujarat', category: 'Cultural', description: 'Cultural capital of Gujarat' },
      { city: 'Rajkot', state: 'Gujarat', category: 'Industrial', description: 'Birthplace of Mahatma Gandhi' },
      { city: 'Gir National Park', state: 'Gujarat', category: 'Wildlife', description: 'Home to Asiatic lions' },
      { city: 'Saputara', state: 'Gujarat', category: 'Hill Station', description: 'Only hill station in Gujarat' },

      // Haryana
      { city: 'Gurugram', state: 'Haryana', category: 'Corporate', description: 'Millennium city and IT hub' },
      { city: 'Faridabad', state: 'Haryana', category: 'Industrial', description: 'Industrial city near Delhi' },
      { city: 'Panipat', state: 'Haryana', category: 'Historical', description: 'City of weavers and historical battles' },
      { city: 'Kurukshetra', state: 'Haryana', category: 'Religious', description: 'Land of Bhagavad Gita' },
      { city: 'Ambala', state: 'Haryana', category: 'Cantonment', description: 'Important military cantonment' },
      { city: 'Karnal', state: 'Haryana', category: 'Agricultural', description: 'Rice bowl of India' },

      // Himachal Pradesh
      { city: 'Shimla', state: 'Himachal Pradesh', category: 'Hill Station', description: 'Summer capital of British India' },
      { city: 'Manali', state: 'Himachal Pradesh', category: 'Adventure', description: 'Valley of Gods' },
      { city: 'Dharamshala', state: 'Himachal Pradesh', category: 'Spiritual', description: 'Home of Dalai Lama' },
      { city: 'Dalhousie', state: 'Himachal Pradesh', category: 'Hill Station', description: 'Charming hill station' },
      { city: 'Kasauli', state: 'Himachal Pradesh', category: 'Hill Station', description: 'Peaceful cantonment town' },
      { city: 'Kullu', state: 'Himachal Pradesh', category: 'Valley', description: 'Valley of Gods with apple orchards' },
      { city: 'Spiti Valley', state: 'Himachal Pradesh', category: 'High Altitude', description: 'Cold desert mountain valley' },
      { city: 'Kinnaur', state: 'Himachal Pradesh', category: 'Tribal', description: 'Land of fairies' },

      // Jharkhand
      { city: 'Ranchi', state: 'Jharkhand', category: 'Capital', description: 'City of waterfalls' },
      { city: 'Jamshedpur', state: 'Jharkhand', category: 'Industrial', description: 'Steel city of India' },
      { city: 'Dhanbad', state: 'Jharkhand', category: 'Coal', description: 'Coal capital of India' },
      { city: 'Deoghar', state: 'Jharkhand', category: 'Religious', description: 'Abode of Baba Baidyanath' },
      { city: 'Hazaribagh', state: 'Jharkhand', category: 'Wildlife', description: 'National park and wildlife sanctuary' },
      { city: 'Netarhat', state: 'Jharkhand', category: 'Hill Station', description: 'Queen of Chotanagpur' },

      // Karnataka
      { city: 'Bangalore', state: 'Karnataka', category: 'Metropolitan', description: 'Silicon Valley of India' },
      { city: 'Mysore', state: 'Karnataka', category: 'Royal', description: 'City of palaces and royal heritage' },
      { city: 'Hampi', state: 'Karnataka', category: 'Historical', description: 'UNESCO World Heritage site with Vijayanagara ruins' },
      { city: 'Coorg', state: 'Karnataka', category: 'Hill Station', description: 'Coffee plantation region with scenic beauty' },
      { city: 'Mangalore', state: 'Karnataka', category: 'Coastal', description: 'Major port city' },
      { city: 'Udupi', state: 'Karnataka', category: 'Temple', description: 'Temple town famous for Krishna temple' },
      { city: 'Chikmagalur', state: 'Karnataka', category: 'Coffee', description: 'Coffee land of Karnataka' },
      { city: 'Badami', state: 'Karnataka', category: 'Cave', description: 'Cave temples and rock-cut architecture' },
      { city: 'Belur', state: 'Karnataka', category: 'Temple', description: 'Hoysala architecture marvel' },
      { city: 'Halebidu', state: 'Karnataka', category: 'Temple', description: 'Hoysala temple complex' },

      // Kerala
      { city: 'Kochi', state: 'Kerala', category: 'Coastal', description: 'Queen of Arabian Sea' },
      { city: 'Munnar', state: 'Kerala', category: 'Hill Station', description: 'Tea garden paradise in Western Ghats' },
      { city: 'Alleppey', state: 'Kerala', category: 'Backwaters', description: 'Venice of the East' },
      { city: 'Thekkady', state: 'Kerala', category: 'Wildlife', description: 'Periyar Wildlife Sanctuary' },
      { city: 'Thiruvananthapuram', state: 'Kerala', category: 'Capital', description: 'Capital city with beaches and temples' },
      { city: 'Kozhikode', state: 'Kerala', category: 'Spice', description: 'City of spices' },
      { city: 'Thrissur', state: 'Kerala', category: 'Cultural', description: 'Cultural capital of Kerala' },
      { city: 'Kumarakom', state: 'Kerala', category: 'Backwaters', description: 'Bird sanctuary and backwaters' },
      { city: 'Varkala', state: 'Kerala', category: 'Beach', description: 'Cliff beach with natural springs' },
      { city: 'Wayanad', state: 'Kerala', category: 'Hill Station', description: 'Spice plantations and wildlife' },

      // Madhya Pradesh
      { city: 'Bhopal', state: 'Madhya Pradesh', category: 'Capital', description: 'City of lakes' },
      { city: 'Indore', state: 'Madhya Pradesh', category: 'Commercial', description: 'Commercial capital of MP' },
      { city: 'Khajuraho', state: 'Madhya Pradesh', category: 'UNESCO', description: 'UNESCO World Heritage temples' },
      { city: 'Gwalior', state: 'Madhya Pradesh', category: 'Fort', description: 'Pearl among fortresses' },
      { city: 'Ujjain', state: 'Madhya Pradesh', category: 'Religious', description: 'One of the seven sacred cities' },
      { city: 'Sanchi', state: 'Madhya Pradesh', category: 'Buddhist', description: 'Great Stupa and Buddhist monuments' },
      { city: 'Pachmarhi', state: 'Madhya Pradesh', category: 'Hill Station', description: 'Queen of Satpura' },
      { city: 'Jabalpur', state: 'Madhya Pradesh', category: 'Marble', description: 'Marble Rocks at Bhedaghat' },
      { city: 'Bandhavgarh', state: 'Madhya Pradesh', category: 'Tiger', description: 'Tiger reserve with high density' },
      { city: 'Kanha', state: 'Madhya Pradesh', category: 'Wildlife', description: 'Tiger reserve and national park' },

      // Maharashtra
      { city: 'Mumbai', state: 'Maharashtra', category: 'Metropolitan', description: 'Financial capital and Bollywood hub' },
      { city: 'Pune', state: 'Maharashtra', category: 'City', description: 'Educational and IT hub with pleasant climate' },
      { city: 'Nashik', state: 'Maharashtra', category: 'Religious', description: 'Holy city famous for Kumbh Mela' },
      { city: 'Aurangabad', state: 'Maharashtra', category: 'Historical', description: 'Gateway to Ajanta and Ellora caves' },
      { city: 'Nagpur', state: 'Maharashtra', category: 'Orange', description: 'Orange city and geographical center' },
      { city: 'Lonavala', state: 'Maharashtra', category: 'Hill Station', description: 'Hill station near Mumbai and Pune' },
      { city: 'Mahabaleshwar', state: 'Maharashtra', category: 'Hill Station', description: 'Strawberry capital' },
      { city: 'Alibag', state: 'Maharashtra', category: 'Beach', description: 'Coastal town with beaches and forts' },
      { city: 'Shirdi', state: 'Maharashtra', category: 'Religious', description: 'Home of Sai Baba' },
      { city: 'Kolhapur', state: 'Maharashtra', category: 'Royal', description: 'City of palaces and wrestling' },

      // Manipur
      { city: 'Imphal', state: 'Manipur', category: 'Capital', description: 'City of jewels' },
      { city: 'Loktak Lake', state: 'Manipur', category: 'Lake', description: 'Floating islands and phumdis' },
      { city: 'Kangla', state: 'Manipur', category: 'Historical', description: 'Ancient capital and fort' },
      { city: 'Moreh', state: 'Manipur', category: 'Border', description: 'Indo-Myanmar border town' },
      { city: 'Ukhrul', state: 'Manipur', category: 'Hill', description: 'Land of shirui lily' },

      // Meghalaya
      { city: 'Shillong', state: 'Meghalaya', category: 'Hill Station', description: 'Scotland of the East' },
      { city: 'Cherrapunji', state: 'Meghalaya', category: 'Rainfall', description: 'One of the wettest places on Earth' },
      { city: 'Mawlynnong', state: 'Meghalaya', category: 'Village', description: 'Cleanest village in Asia' },
      { city: 'Dawki', state: 'Meghalaya', category: 'River', description: 'Crystal clear Umngot river' },
      { city: 'Tura', state: 'Meghalaya', category: 'Hill', description: 'Land of the Garos' },

      // Mizoram
      { city: 'Aizawl', state: 'Mizoram', category: 'Capital', description: 'Home of the Mizos' },
      { city: 'Champhai', state: 'Mizoram', category: 'Border', description: 'Rice bowl of Mizoram' },
      { city: 'Lunglei', state: 'Mizoram', category: 'Town', description: 'Bridge of rock' },
      { city: 'Serchhip', state: 'Mizoram', category: 'Town', description: 'Educational hub' },

      // Nagaland
      { city: 'Kohima', state: 'Nagaland', category: 'Capital', description: 'Land of festivals' },
      { city: 'Dimapur', state: 'Nagaland', category: 'Commercial', description: 'Gateway to Nagaland' },
      { city: 'Mokokchung', state: 'Nagaland', category: 'Cultural', description: 'Cultural center of Aos' },
      { city: 'Wokha', state: 'Nagaland', category: 'Town', description: 'Land of Lothas' },

      // Odisha
      { city: 'Bhubaneswar', state: 'Odisha', category: 'Temple', description: 'Temple city of India' },
      { city: 'Puri', state: 'Odisha', category: 'Religious', description: 'Home to Lord Jagannath' },
      { city: 'Konark', state: 'Odisha', category: 'UNESCO', description: 'Sun temple UNESCO World Heritage site' },
      { city: 'Cuttack', state: 'Odisha', category: 'Silver', description: 'Silver city and former capital' },
      { city: 'Chilika Lake', state: 'Odisha', category: 'Lake', description: 'Largest coastal lagoon' },
      { city: 'Sambalpur', state: 'Odisha', category: 'Textile', description: 'Sambalpuri saree center' },
      { city: 'Gopalpur', state: 'Odisha', category: 'Beach', description: 'Serene beach destination' },

      // Punjab
      { city: 'Amritsar', state: 'Punjab', category: 'Religious', description: 'Holy city with Golden Temple' },
      { city: 'Chandigarh', state: 'Punjab', category: 'Planned', description: 'Planned city by Le Corbusier' },
      { city: 'Ludhiana', state: 'Punjab', category: 'Industrial', description: 'Manchester of India' },
      { city: 'Jalandhar', state: 'Punjab', category: 'Sports', description: 'Sports goods manufacturing hub' },
      { city: 'Patiala', state: 'Punjab', category: 'Royal', description: 'Royal heritage and Peg measure' },
      { city: 'Bathinda', state: 'Punjab', category: 'Cotton', description: 'Cotton city of Punjab' },

      // Rajasthan
      { city: 'Jaipur', state: 'Rajasthan', category: 'Royal', description: 'Pink City with magnificent forts and palaces' },
      { city: 'Udaipur', state: 'Rajasthan', category: 'Royal', description: 'City of Lakes with romantic palaces' },
      { city: 'Jodhpur', state: 'Rajasthan', category: 'Royal', description: 'Blue City with massive Mehrangarh Fort' },
      { city: 'Jaisalmer', state: 'Rajasthan', category: 'Desert', description: 'Golden City in the Thar Desert' },
      { city: 'Pushkar', state: 'Rajasthan', category: 'Religious', description: 'Sacred lake and Brahma temple' },
      { city: 'Mount Abu', state: 'Rajasthan', category: 'Hill Station', description: 'Only hill station in Rajasthan' },
      { city: 'Bikaner', state: 'Rajasthan', category: 'Desert', description: 'Camel country with Junagarh Fort' },
      { city: 'Ajmer', state: 'Rajasthan', category: 'Religious', description: 'Dargah of Khwaja Moinuddin Chishti' },
      { city: 'Chittorgarh', state: 'Rajasthan', category: 'Fort', description: 'Largest fort complex in India' },
      { city: 'Ranthambore', state: 'Rajasthan', category: 'Tiger', description: 'Tiger reserve and national park' },

      // Sikkim
      { city: 'Gangtok', state: 'Sikkim', category: 'Capital', description: 'Hill station capital' },
      { city: 'Pelling', state: 'Sikkim', category: 'Hill Station', description: 'Views of Kanchenjunga' },
      { city: 'Lachung', state: 'Sikkim', category: 'Valley', description: 'Gateway to Yumthang Valley' },
      { city: 'Namchi', state: 'Sikkim', category: 'Pilgrimage', description: 'Char Dham and Buddha statue' },
      { city: 'Yuksom', state: 'Sikkim', category: 'Trekking', description: 'First capital and trekking base' },

      // Tamil Nadu
      { city: 'Chennai', state: 'Tamil Nadu', category: 'Metropolitan', description: 'Detroit of India' },
      { city: 'Madurai', state: 'Tamil Nadu', category: 'Temple', description: 'Temple city with Meenakshi Temple' },
      { city: 'Ooty', state: 'Tamil Nadu', category: 'Hill Station', description: 'Queen of Hill Stations' },
      { city: 'Kodaikanal', state: 'Tamil Nadu', category: 'Hill Station', description: 'Princess of Hill Stations' },
      { city: 'Kanyakumari', state: 'Tamil Nadu', category: 'Confluence', description: 'Southernmost tip of India' },
      { city: 'Pondicherry', state: 'Tamil Nadu', category: 'French', description: 'French colonial heritage' },
      { city: 'Thanjavur', state: 'Tamil Nadu', category: 'UNESCO', description: 'Brihadeeswara Temple' },
      { city: 'Rameswaram', state: 'Tamil Nadu', category: 'Religious', description: 'Sacred island pilgrimage' },
      { city: 'Coimbatore', state: 'Tamil Nadu', category: 'Textile', description: 'Manchester of South India' },
      { city: 'Mahabalipuram', state: 'Tamil Nadu', category: 'UNESCO', description: 'Shore temples and rock sculptures' },

      // Telangana
      { city: 'Hyderabad', state: 'Telangana', category: 'Metropolitan', description: 'Cyberabad and City of Pearls' },
      { city: 'Warangal', state: 'Telangana', category: 'Historical', description: 'Kakatiya dynasty capital' },
      { city: 'Nizamabad', state: 'Telangana', category: 'Turmeric', description: 'Turmeric city' },
      { city: 'Khammam', state: 'Telangana', category: 'Coal', description: 'Coal and thermal power hub' },
      { city: 'Karimnagar', state: 'Telangana', category: 'Granary', description: 'Granary of Telangana' },

      // Tripura
      { city: 'Agartala', state: 'Tripura', category: 'Capital', description: 'Capital near Bangladesh border' },
      { city: 'Udaipur', state: 'Tripura', category: 'Lake', description: 'Lake city of Tripura' },
      { city: 'Kailashahar', state: 'Tripura', category: 'Border', description: 'Border town with natural beauty' },
      { city: 'Ambassa', state: 'Tripura', category: 'Town', description: 'Hill station town' },

      // Uttar Pradesh
      { city: 'Agra', state: 'Uttar Pradesh', category: 'Historical', description: 'Home to the iconic Taj Mahal' },
      { city: 'Varanasi', state: 'Uttar Pradesh', category: 'Spiritual', description: 'Oldest living city and spiritual capital' },
      { city: 'Lucknow', state: 'Uttar Pradesh', category: 'Cultural', description: 'City of Nawabs' },
      { city: 'Allahabad', state: 'Uttar Pradesh', category: 'Confluence', description: 'Triveni Sangam and Kumbh Mela' },
      { city: 'Mathura', state: 'Uttar Pradesh', category: 'Religious', description: 'Birthplace of Lord Krishna' },
      { city: 'Vrindavan', state: 'Uttar Pradesh', category: 'Religious', description: 'Krishna\'s playground' },
      { city: 'Ayodhya', state: 'Uttar Pradesh', category: 'Religious', description: 'Birthplace of Lord Rama' },
      { city: 'Sarnath', state: 'Uttar Pradesh', category: 'Buddhist', description: 'Buddha\'s first sermon' },
      { city: 'Rishikesh', state: 'Uttar Pradesh', category: 'Yoga', description: 'Yoga capital of the world' },
      { city: 'Haridwar', state: 'Uttar Pradesh', category: 'Religious', description: 'Gateway to gods' },

      // Uttarakhand
      { city: 'Dehradun', state: 'Uttarakhand', category: 'Capital', description: 'Doon Valley capital' },
      { city: 'Nainital', state: 'Uttarakhand', category: 'Hill Station', description: 'Lake district of India' },
      { city: 'Mussoorie', state: 'Uttarakhand', category: 'Hill Station', description: 'Queen of Hills' },
      { city: 'Rishikesh', state: 'Uttarakhand', category: 'Yoga', description: 'Yoga capital of the world' },
      { city: 'Haridwar', state: 'Uttarakhand', category: 'Religious', description: 'Gateway to Char Dham' },
      { city: 'Jim Corbett', state: 'Uttarakhand', category: 'Tiger', description: 'First national park of India' },
      { city: 'Kedarnath', state: 'Uttarakhand', category: 'Pilgrimage', description: 'One of Char Dham' },
      { city: 'Badrinath', state: 'Uttarakhand', category: 'Pilgrimage', description: 'One of Char Dham' },
      { city: 'Valley of Flowers', state: 'Uttarakhand', category: 'UNESCO', description: 'Alpine flower sanctuary' },
      { city: 'Auli', state: 'Uttarakhand', category: 'Skiing', description: 'Skiing destination' },

      // West Bengal
      { city: 'Kolkata', state: 'West Bengal', category: 'Cultural', description: 'Cultural capital of India' },
      { city: 'Darjeeling', state: 'West Bengal', category: 'Hill Station', description: 'Tea capital with Himalayan views' },
      { city: 'Sundarbans', state: 'West Bengal', category: 'Mangrove', description: 'Royal Bengal Tiger habitat' },
      { city: 'Siliguri', state: 'West Bengal', category: 'Gateway', description: 'Gateway to Northeast' },
      { city: 'Durgapur', state: 'West Bengal', category: 'Steel', description: 'Steel city' },
      { city: 'Kalimpong', state: 'West Bengal', category: 'Hill Station', description: 'Flower town' },
      { city: 'Howrah', state: 'West Bengal', category: 'Industrial', description: 'Industrial twin of Kolkata' },
      { city: 'Digha', state: 'West Bengal', category: 'Beach', description: 'Nearest beach to Kolkata' },

      // Union Territories
      { city: 'Port Blair', state: 'Andaman and Nicobar Islands', category: 'Island', description: 'Tropical paradise islands' },
      { city: 'Havelock Island', state: 'Andaman and Nicobar Islands', category: 'Beach', description: 'Pristine beaches and coral reefs' },
      { city: 'Neil Island', state: 'Andaman and Nicobar Islands', category: 'Beach', description: 'Vegetable bowl of Andaman' },

      { city: 'Chandigarh', state: 'Chandigarh', category: 'Planned', description: 'Planned city by Le Corbusier' },

      { city: 'Dadra', state: 'Dadra and Nagar Haveli and Daman and Diu', category: 'Tribal', description: 'Tribal culture and nature' },
      { city: 'Daman', state: 'Dadra and Nagar Haveli and Daman and Diu', category: 'Beach', description: 'Portuguese heritage and beaches' },
      { city: 'Diu', state: 'Dadra and Nagar Haveli and Daman and Diu', category: 'Island', description: 'Island with forts and beaches' },

      { city: 'Leh', state: 'Ladakh', category: 'High Altitude', description: 'Land of high passes' },
      { city: 'Kargil', state: 'Ladakh', category: 'High Altitude', description: 'Gateway to Ladakh' },
      { city: 'Nubra Valley', state: 'Ladakh', category: 'Cold Desert', description: 'Cold desert with sand dunes' },

      { city: 'Kavaratti', state: 'Lakshadweep', category: 'Coral', description: 'Coral island paradise' },
      { city: 'Agatti', state: 'Lakshadweep', category: 'Lagoon', description: 'Airport island with lagoons' },

      { city: 'Puducherry', state: 'Puducherry', category: 'French', description: 'French colonial heritage' },
      { city: 'Karaikal', state: 'Puducherry', category: 'Port', description: 'Ancient port town' },

      // Jammu and Kashmir (Updated)
      { city: 'Srinagar', state: 'Jammu and Kashmir', category: 'Scenic', description: 'Summer capital with Dal Lake' },
      { city: 'Jammu', state: 'Jammu and Kashmir', category: 'Temple', description: 'City of temples' },
      { city: 'Gulmarg', state: 'Jammu and Kashmir', category: 'Skiing', description: 'Meadow of flowers and skiing' },
      { city: 'Pahalgam', state: 'Jammu and Kashmir', category: 'Valley', description: 'Valley of shepherds' },
      { city: 'Sonamarg', state: 'Jammu and Kashmir', category: 'Glacier', description: 'Meadow of gold' }
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
