// WanderLog Map Manager
// Version: 1.4.0 - Interactive India Map with trip visualization

class MapManager {
  constructor() {
    this.selectedStates = new Set();
    this.tripPlaces = new Map(); // Map of place coordinates
    this.stateCoordinates = this.initializeStateCoordinates();
    this.placesData = null; // Will be injected from TripManager
  }

  // Initialize the India map
  initializeMap() {
    this.createMapContainer();
    this.loadIndiaMapSVG();
    this.setupMapInteractions();
  }

  // Create map container
  createMapContainer() {
    const mapContainer = document.createElement('div');
    mapContainer.id = 'india-map-container';
    mapContainer.className = 'india-map-container';
    mapContainer.innerHTML = `
      <div class="map-header">
        <h3>🗺️ India Trip Map</h3>
        <p>Click on states to explore destinations</p>
      </div>
      <div id="india-map-svg" class="india-map-svg"></div>
      <div class="map-legend">
        <div class="legend-item">
          <span class="legend-color selected"></span>
          <span>States with selected places</span>
        </div>
        <div class="legend-item">
          <span class="legend-color available"></span>
          <span>Available destinations</span>
        </div>
      </div>
    `;
    
    return mapContainer;
  }

  // Load India map interface (clickable labels + dropdown)
  loadIndiaMapSVG() {
    const mapSvg = document.getElementById('india-map-svg');
    
    // Define top tourist destination states
    const topTouristStates = [
      { name: 'Rajasthan', emoji: '🏰', description: 'Royal palaces & deserts' },
      { name: 'Kerala', emoji: '🌴', description: 'Backwaters & spices' },
      { name: 'Goa', emoji: '🏖️', description: 'Beaches & nightlife' },
      { name: 'Himachal Pradesh', emoji: '🏔️', description: 'Mountains & adventure' },
      { name: 'Maharashtra', emoji: '🏙️', description: 'Mumbai & Ajanta caves' },
      { name: 'Karnataka', emoji: '🕌', description: 'Bangalore & Mysore' },
      { name: 'Tamil Nadu', emoji: '🛕', description: 'Temples & culture' },
      { name: 'Uttar Pradesh', emoji: '🕌', description: 'Taj Mahal & Varanasi' },
      { name: 'Delhi', emoji: '🏛️', description: 'Capital & heritage' },
      { name: 'West Bengal', emoji: '🎭', description: 'Kolkata & culture' },
      { name: 'Gujarat', emoji: '🦁', description: 'Gir & Rann of Kutch' },
      { name: 'Punjab', emoji: '⛩️', description: 'Golden Temple & culture' }
    ];

    // All other states/UTs for dropdown
    const otherStates = [
      'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
      'Haryana', 'Jharkhand', 'Ladakh', 'Madhya Pradesh', 'Manipur', 'Meghalaya',
      'Mizoram', 'Nagaland', 'Odisha', 'Sikkim', 'Telangana', 'Tripura', 'Uttarakhand',
      'Jammu and Kashmir', 'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli',
      'Daman and Diu', 'Lakshadweep', 'Puducherry'
    ];
    
    // Create the interface
    mapSvg.innerHTML = `
      <div class="india-destinations-interface">
        <!-- Top Tourist Destinations -->
        <div class="top-destinations-section">
          <h3 class="section-title">🌟 Top Tourist Destinations</h3>
          <div class="destinations-grid">
            ${topTouristStates.map(state => `
              <div class="destination-card" data-state="${state.name}" onclick="window.mapManager.handleStateClick('${state.name}')">
                <div class="destination-emoji">${state.emoji}</div>
                <div class="destination-info">
                  <h4 class="destination-name">${state.name}</h4>
                  <p class="destination-description">${state.description}</p>
                </div>
                <div class="destination-arrow">→</div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Other States Dropdown -->
        <div class="other-states-section">
          <h3 class="section-title">🗺️ Explore Other States & UTs</h3>
          <div class="dropdown-container">
            <select id="states-dropdown" class="states-dropdown" onchange="window.mapManager.handleDropdownSelection(this.value)">
              <option value="">Select a state or union territory...</option>
              ${otherStates.map(state => `
                <option value="${state}">${state}</option>
              `).join('')}
            </select>
            <div class="dropdown-icon">▼</div>
          </div>
        </div>

        <!-- Trip Visualization -->
        <div class="trip-visualization-section">
          <h3 class="section-title">📍 Your Trip Locations</h3>
          <div id="trip-map-visualization" class="trip-map-visualization">
            <p class="empty-trip-message">Add places to your trip to see them visualized here</p>
          </div>
        </div>
      </div>
    `;
  }

  // Setup map interactions
  setupMapInteractions() {
    // Interactions are now handled through onclick attributes in the HTML
    // No need for additional event listeners since we're using clickable cards and dropdown
    console.log('Map interactions setup complete - using direct onclick handlers');
  }

  // Handle state click - show places modal
  handleStateClick(stateName) {
    console.log(`State clicked: ${stateName}`);
    
    // Get places for this state
    const placesInState = this.getPlacesForState(stateName);
    
    if (placesInState.length > 0) {
      this.showPlacesModal(stateName, placesInState);
    } else {
      this.showNoPlacesMessage(stateName);
    }
  }

  // Handle dropdown selection
  handleDropdownSelection(stateName) {
    if (stateName) {
      this.handleStateClick(stateName);
      // Reset dropdown
      document.getElementById('states-dropdown').value = '';
    }
  }

  // Get places for a specific state
  getPlacesForState(stateName) {
    if (!this.placesData) return [];
    
    // Normalize state name for comparison
    const normalizedStateName = this.normalizeStateName(stateName);
    
    return this.placesData.filter(place => 
      this.normalizeStateName(place.state) === normalizedStateName
    );
  }

  // Normalize state names for comparison
  normalizeStateName(stateName) {
    return stateName
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .replace('&', 'and')
      .trim();
  }

  // Show places selection modal
  showPlacesModal(stateName, places) {
    // Get current trip to check for existing places
    const currentTrip = window.tripUI?.getCurrentTrip();
    const existingPlaces = currentTrip ? currentTrip.places || [] : [];

    const modal = document.createElement('div');
    modal.className = 'places-modal-overlay';
    modal.innerHTML = `
      <div class="places-modal">
        <div class="places-modal-header">
          <h3>🗺️ Places in ${stateName}</h3>
          <button class="close-modal" onclick="this.closest('.places-modal-overlay').remove()">×</button>
        </div>
        <div class="places-modal-content">
          <p class="places-modal-description">Select destinations to add to your trip:</p>
          <div class="places-grid">
            ${places.map(place => {
              const isInTrip = existingPlaces.some(ep => 
                ep.city === place.city && ep.state === place.state
              );
              
              return `
                <div class="place-card ${isInTrip ? 'already-selected' : ''}" 
                     data-city="${place.city}" data-state="${place.state}">
                  <div class="place-info">
                    <h4>${place.city}</h4>
                    <p class="place-category">${place.category}</p>
                    <p class="place-description">${place.description}</p>
                  </div>
                  <button class="select-place-btn ${isInTrip ? 'disabled' : ''}" 
                          ${isInTrip ? 'disabled' : ''}
                          onclick="window.mapManager.selectPlaceFromMap('${place.city}', '${place.state}')">
                    ${isInTrip ? '✅ Already in Trip' : '+ Add to Trip'}
                  </button>
                </div>
              `;
            }).join('')}
          </div>
        </div>
        <div class="places-modal-footer">
          <p class="selection-info">
            ${existingPlaces.filter(p => places.some(place => place.city === p.city && place.state === p.state)).length} 
            of ${places.length} places already in trip
          </p>
          <button class="close-modal secondary" 
                  onclick="this.closest('.places-modal-overlay').remove()">
            Done Selecting
          </button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add click outside to close
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });
    
    // Add escape key listener
    const escapeHandler = (e) => {
      if (e.key === 'Escape') {
        modal.remove();
        document.removeEventListener('keydown', escapeHandler);
      }
    };
    document.addEventListener('keydown', escapeHandler);
  }

  // Select place from map
  selectPlaceFromMap(city, state) {
    // Get current trip to check for duplicates
    const currentTrip = window.tripUI?.getCurrentTrip();
    
    if (currentTrip) {
      // Check if place already exists in trip
      const existingPlace = currentTrip.places.find(p => 
        p.city === city && p.state === state
      );
      
      if (existingPlace) {
        this.showPlaceAlreadyExistsMessage(city, state);
        return;
      }
      
      // Add place to trip
      this.addPlaceToCurrentTrip(city, state);
    } else {
      console.error('No current trip found');
    }
  }

  // Add place to current trip
  async addPlaceToCurrentTrip(city, state) {
    try {
      // Show loading state
      this.showPlaceAddingState(city);
      
      // Add place using trip manager
      if (window.tripUI && window.tripUI.tripManager) {
        await window.tripUI.tripManager.addPlaceToTrip(
          window.tripUI.currentTripId, 
          { city, state }
        );
        
        // Refresh the places list
        window.tripUI.refreshPlacesList();
        
        // Update map with new trip data
        const updatedTrip = window.tripUI.getCurrentTrip();
        this.updateMapWithTrip(updatedTrip);
        
        // Update the modal to reflect the change
        this.markPlaceAsSelected(city, state);
        
        // Show success message
        this.showPlaceAddedMessage(city, state);
      }
    } catch (error) {
      console.error('Error adding place to trip:', error);
      this.showPlaceAddError(city, state);
    }
  }

  // Mark place as selected in modal
  markPlaceAsSelected(city, state) {
    const placeCards = document.querySelectorAll('.place-card');
    placeCards.forEach(card => {
      const cardCity = card.getAttribute('data-city');
      const cardState = card.getAttribute('data-state');
      
      if (cardCity === city && cardState === state) {
        const button = card.querySelector('.select-place-btn');
        if (button) {
          button.textContent = '✅ Already in Trip';
          button.disabled = true;
          button.style.background = '#6c757d';
          button.style.cursor = 'not-allowed';
          
          // Add visual indicator
          card.style.opacity = '0.7';
          card.style.border = '2px solid #28a745';
        }
      }
    });
  }

  // Show place already exists message
  showPlaceAlreadyExistsMessage(city, state) {
    this.showTemporaryMessage(`${city}, ${state} is already in your trip!`, 'info');
  }

  // Show place adding state
  showPlaceAddingState(city) {
    this.showTemporaryMessage(`Adding ${city} to your trip...`, 'loading');
  }

  // Show place added success message
  showPlaceAddedMessage(city, state) {
    this.showTemporaryMessage(`✅ ${city}, ${state} added to your trip!`, 'success');
  }

  // Show place add error
  showPlaceAddError(city, state) {
    this.showTemporaryMessage(`❌ Failed to add ${city}, ${state}. Please try again.`, 'error');
  }

  // Show temporary message
  showTemporaryMessage(message, type) {
    // Remove existing message
    const existingMessage = document.querySelector('.temp-message');
    if (existingMessage) existingMessage.remove();
    
    // Create new message
    const messageDiv = document.createElement('div');
    messageDiv.className = `temp-message temp-message-${type}`;
    messageDiv.textContent = message;
    
    // Style the message
    Object.assign(messageDiv.style, {
      position: 'fixed',
      top: '20px',
      right: '20px',
      padding: '12px 20px',
      borderRadius: '8px',
      color: 'white',
      fontWeight: '500',
      zIndex: '9999',
      animation: 'slideInRight 0.3s ease',
      maxWidth: '300px',
      wordWrap: 'break-word'
    });
    
    // Set background color based on type
    switch(type) {
      case 'success':
        messageDiv.style.background = '#28a745';
        break;
      case 'error':
        messageDiv.style.background = '#dc3545';
        break;
      case 'info':
        messageDiv.style.background = '#17a2b8';
        break;
      case 'loading':
        messageDiv.style.background = '#6c757d';
        break;
      default:
        messageDiv.style.background = '#6c757d';
    }
    
    document.body.appendChild(messageDiv);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
      if (messageDiv.parentNode) {
        messageDiv.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => messageDiv.remove(), 300);
      }
    }, 3000);
  }

  // Show tooltip on state hover
  showStateTooltip(event, stateName) {
    const tooltip = document.createElement('div');
    tooltip.className = 'state-tooltip';
    tooltip.textContent = stateName;
    tooltip.style.left = event.pageX + 10 + 'px';
    tooltip.style.top = event.pageY - 30 + 'px';
    document.body.appendChild(tooltip);
  }

  // Hide tooltip
  hideStateTooltip() {
    const tooltip = document.querySelector('.state-tooltip');
    if (tooltip) tooltip.remove();
  }

  // Show message when no places available
  showNoPlacesMessage(stateName) {
    const modal = document.createElement('div');
    modal.className = 'places-modal-overlay';
    modal.innerHTML = `
      <div class="places-modal">
        <div class="places-modal-header">
          <h3>🗺️ ${stateName}</h3>
          <button class="close-modal" onclick="this.closest('.places-modal-overlay').remove()">×</button>
        </div>
        <div class="places-modal-content">
          <div class="no-places-message">
            <p>📍 No destinations currently available for ${stateName}</p>
            <p>We're working on adding more places! You can still add custom destinations.</p>
            <button class="add-custom-place-btn" onclick="window.tripUI?.showAddPlaceForm(); this.closest('.places-modal-overlay').remove();">
              Add Custom Place
            </button>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add click outside to close
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });
  }

  // Update map with trip places
  updateMapWithTrip(trip) {
    if (!trip || !trip.places) return;
    
    // Update trip visualization
    this.updateTripVisualization(trip.places);
    
    // Update destination cards to show selected states
    this.updateDestinationCards(trip.places);
  }

  // Update trip visualization section
  updateTripVisualization(places) {
    const visualization = document.getElementById('trip-map-visualization');
    if (!visualization) return;

    if (places.length === 0) {
      visualization.innerHTML = '<p class="empty-trip-message">Add places to your trip to see them visualized here</p>';
      return;
    }

    // Group places by state
    const stateGroups = {};
    places.forEach(place => {
      if (!stateGroups[place.state]) {
        stateGroups[place.state] = [];
      }
      stateGroups[place.state].push(place);
    });

    visualization.innerHTML = `
      <div class="trip-states-grid">
        ${Object.entries(stateGroups).map(([state, statePlaces]) => `
          <div class="trip-state-card">
            <h4 class="trip-state-name">${state}</h4>
            <div class="trip-places-list">
              ${statePlaces.map(place => `
                <span class="trip-place-tag">${place.city}</span>
              `).join('')}
            </div>
            <div class="trip-state-count">${statePlaces.length} place${statePlaces.length > 1 ? 's' : ''}</div>
          </div>
        `).join('')}
      </div>
      <div class="trip-summary">
        <p><strong>${places.length}</strong> destinations across <strong>${Object.keys(stateGroups).length}</strong> states</p>
      </div>
    `;
  }

  // Update destination cards to highlight selected states
  updateDestinationCards(places) {
    const selectedStates = new Set(places.map(place => place.state));
    
    const destinationCards = document.querySelectorAll('.destination-card');
    destinationCards.forEach(card => {
      const stateName = card.getAttribute('data-state');
      const stateCount = places.filter(place => place.state === stateName).length;
      
      if (selectedStates.has(stateName)) {
        card.classList.add('selected-destination');
        
        // Add or update counter
        let counter = card.querySelector('.destination-counter');
        if (!counter) {
          counter = document.createElement('div');
          counter.className = 'destination-counter';
          card.appendChild(counter);
        }
        counter.textContent = `${stateCount} place${stateCount > 1 ? 's' : ''}`;
      } else {
        card.classList.remove('selected-destination');
        const counter = card.querySelector('.destination-counter');
        if (counter) counter.remove();
      }
    });
  }

  // Clear map highlights (legacy method - now handled by updateDestinationCards)
  clearMapHighlights() {
    // This method is no longer needed with the new card-based interface
    // Highlighting is now handled by updateDestinationCards method
    console.log('Clear map highlights - handled by destination cards');
  }

  // Set places data from TripManager
  setPlacesData(placesData) {
    this.placesData = placesData;
  }

  // Initialize state coordinates (for future features)
  initializeStateCoordinates() {
    return {
      'jammu and kashmir': { lat: 34.0, lng: 76.0 },
      'ladakh': { lat: 34.2, lng: 78.0 },
      'himachal pradesh': { lat: 31.1, lng: 77.2 },
      'punjab': { lat: 31.1, lng: 75.3 },
      'haryana': { lat: 29.1, lng: 76.0 },
      'delhi': { lat: 28.6, lng: 77.2 },
      'uttarakhand': { lat: 30.1, lng: 79.0 },
      'uttar pradesh': { lat: 26.8, lng: 80.9 },
      'rajasthan': { lat: 27.0, lng: 74.2 },
      'gujarat': { lat: 23.0, lng: 72.6 },
      'maharashtra': { lat: 19.8, lng: 75.3 },
      'goa': { lat: 15.3, lng: 74.1 },
      'madhya pradesh': { lat: 22.3, lng: 78.7 },
      'chhattisgarh': { lat: 21.3, lng: 81.6 },
      'bihar': { lat: 25.1, lng: 85.3 },
      'jharkhand': { lat: 23.6, lng: 85.3 },
      'odisha': { lat: 20.9, lng: 85.1 },
      'west bengal': { lat: 22.6, lng: 88.4 },
      'assam': { lat: 26.2, lng: 92.9 },
      'arunachal pradesh': { lat: 28.2, lng: 94.7 },
      'manipur': { lat: 24.7, lng: 93.9 },
      'meghalaya': { lat: 25.5, lng: 91.4 },
      'mizoram': { lat: 23.2, lng: 92.9 },
      'nagaland': { lat: 26.2, lng: 94.6 },
      'sikkim': { lat: 27.5, lng: 88.5 },
      'tripura': { lat: 23.9, lng: 91.4 },
      'karnataka': { lat: 15.3, lng: 75.7 },
      'kerala': { lat: 10.9, lng: 76.2 },
      'tamil nadu': { lat: 11.1, lng: 78.7 },
      'andhra pradesh': { lat: 15.9, lng: 79.7 },
      'telangana': { lat: 18.1, lng: 79.0 }
    };
  }
}

// Export for use in main app
window.MapManager = MapManager;
