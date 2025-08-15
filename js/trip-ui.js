// Trip UI Component
// Version: 1.4.0

class TripUI {
  constructor() {
    this.tripManager = new TripManager();
    this.currentView = 'list'; // 'list' or 'detail'
    this.currentTripId = null;
    this.init();
  }

  init() {
    this.createTripListView();
    this.attachEventListeners();
    
    // Initialize home page trips display
    this.initializeHomePageTrips();
    
    // Initialize map manager
    this.initializeMapManager();
    
    // Initialize attraction details manager
    this.initializeAttractionManager();
  }

  // Initialize home page trips display
  initializeHomePageTrips() {
    this.renderHomePageTrips();
  }

  // Render trips on home page (upcoming and completed)
  renderHomePageTrips() {
    const upcomingContainer = document.getElementById('upcomingTripsList');
    const completedContainer = document.getElementById('completedTripsList');
    
    if (!upcomingContainer || !completedContainer) return;

    const trips = this.tripManager.getAllTrips();
    const currentDate = new Date();
    
    const upcomingTrips = trips.filter(trip => new Date(trip.endDate) >= currentDate);
    const completedTrips = trips.filter(trip => new Date(trip.endDate) < currentDate);

    // Render upcoming trips
    if (upcomingTrips.length === 0) {
      upcomingContainer.innerHTML = this.renderEmptyState(
        '🛫', 
        'No upcoming trips', 
        'Plan your next adventure by creating a new trip!'
      );
    } else {
      upcomingContainer.innerHTML = upcomingTrips.map(trip => 
        this.renderHomeTripCard(trip, 'upcoming')
      ).join('');
    }

    // Render completed trips  
    if (completedTrips.length === 0) {
      completedContainer.innerHTML = this.renderEmptyState(
        '✅', 
        'No completed trips', 
        'Your travel memories will appear here after your trips.'
      );
    } else {
      completedContainer.innerHTML = completedTrips.map(trip => 
        this.renderHomeTripCard(trip, 'completed')
      ).join('');
    }

    console.log(`Rendered home page trips: ${upcomingTrips.length} upcoming, ${completedTrips.length} completed`);
  }

  // Render trip card for home page
  renderHomeTripCard(trip, status) {
    const startDate = new Date(trip.startDate);
    const endDate = new Date(trip.endDate);
    
    // Format dates as dd-mmm-yy
    const formatDate = (date) => {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                     'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const day = date.getDate().toString().padStart(2, '0');
      const month = months[date.getMonth()];
      const year = date.getFullYear().toString().slice(-2);
      return `${day}-${month}-${year}`;
    };
    
    const formattedStartDate = formatDate(startDate);
    const formattedEndDate = formatDate(endDate);
    const placesCount = trip.places ? trip.places.length : 0;
    
    return `
      <div class="trip-card" onclick="tripUI.viewTripDetail(${trip.id})">
        <div class="trip-card-header">
          <div>
            <h3 class="trip-title">${trip.name}</h3>
            <p class="trip-destination">${this.getTripDestination(trip)}</p>
          </div>
          <span class="trip-status ${status}">${status === 'upcoming' ? 'Upcoming' : 'Completed'}</span>
        </div>
        <div class="trip-dates">
          <span class="date-label start-date">Start: ${formattedStartDate}</span>
          <span class="date-label end-date">End: ${formattedEndDate}</span>
        </div>
        <div class="trip-description">${placesCount} ${placesCount === 1 ? 'place' : 'places'} to explore</div>
        <div class="trip-actions">
          <button class="trip-action-btn btn-primary" onclick="event.stopPropagation(); tripUI.viewTripDetail(${trip.id})">
            View Details
          </button>
          <button class="trip-action-btn btn-edit" onclick="event.stopPropagation(); tripUI.editTripFromHome(${trip.id})">
            Edit
          </button>
          <button class="trip-action-btn btn-danger" onclick="event.stopPropagation(); tripUI.deleteTripFromHome(${trip.id})">
            Delete
          </button>
        </div>
      </div>
    `;
  }

  // Get trip destination (first few places)
  getTripDestination(trip) {
    if (!trip.places || trip.places.length === 0) return 'No destinations added yet';
    
    const destinations = trip.places.slice(0, 2).map(place => place.city);
    if (trip.places.length > 2) {
      destinations.push(`+${trip.places.length - 2} more`);
    }
    return destinations.join(', ');
  }

  // Render empty state
  renderEmptyState(icon, title, description) {
    return `
      <div class="empty-state">
        <div class="empty-state-icon">${icon}</div>
        <h3>${title}</h3>
        <p>${description}</p>
      </div>
    `;
  }

  // Initialize map manager
  initializeMapManager() {
    if (window.MapManager) {
      this.mapManager = new window.MapManager();
      this.mapManager.setPlacesData(this.tripManager.placesData);
      // Make it globally accessible for onclick handlers
      window.mapManager = this.mapManager;
    }
  }

  // Initialize attraction details manager
  initializeAttractionManager() {
    if (window.AttractionDetailsManager) {
      this.attractionDetailsManager = new window.AttractionDetailsManager();
      // Make it globally accessible for onclick handlers
      window.attractionDetailsManager = this.attractionDetailsManager;
    }
  }

  // Create main trip list view
  createTripListView() {
    const container = document.getElementById('trip-list');
    if (!container) return;

    // Get all trips
    const trips = this.tripManager.getAllTrips();
    
    // If no trips exist, show empty state with options
    if (trips.length === 0) {
      this.showEmptyTripsState();
      return;
    }

    // Get the most recent upcoming trip
    const currentDate = new Date();
    const upcomingTrips = trips.filter(trip => new Date(trip.endDate) >= currentDate);
    
    // Sort upcoming trips by start date (closest first)
    upcomingTrips.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
    
    const mostRecentUpcoming = upcomingTrips.length > 0 ? upcomingTrips[0] : null;

    if (mostRecentUpcoming) {
      // Show the most recent upcoming trip detail by default
      this.currentTripId = mostRecentUpcoming.id;
      this.currentView = 'detail';
      container.innerHTML = this.createTripDetailView(mostRecentUpcoming);
      
      // Initialize map after view is rendered
      this.initializeTripMap(mostRecentUpcoming);
    } else {
      // Show the most recent completed trip if no upcoming trips
      const completedTrips = trips.filter(trip => new Date(trip.endDate) < currentDate);
      completedTrips.sort((a, b) => new Date(b.endDate) - new Date(a.endDate)); // Most recent first
      
      if (completedTrips.length > 0) {
        this.currentTripId = completedTrips[0].id;
        this.currentView = 'detail';
        container.innerHTML = this.createTripDetailView(completedTrips[0]);
        this.initializeTripMap(completedTrips[0]);
      }
    }
  }

  // Show empty trips state with helpful options
  showEmptyTripsState() {
    const container = document.getElementById('trip-list');
    if (!container) return;
    
    const allTrips = this.tripManager.getAllTrips();
    
    container.innerHTML = `
      <div class="empty-trips-state">
        <div class="empty-state-content">
          <div class="empty-state-icon">✈️</div>
          <h2 class="empty-state-title">No Trips Available</h2>
          <p class="empty-state-description">
            You haven't planned any trips yet. Start your adventure by creating a new trip!
          </p>
          <div class="empty-state-actions">
            <button class="btn-primary" onclick="tripUI.createNewTripFromTripsPage()">
              ✨ Create New Trip
            </button>
            <button class="btn-secondary" onclick="tripUI.backToHome()">
              🏠 Go to Home
            </button>
          </div>
        </div>
        
        ${allTrips.length > 0 ? `
          <div class="trip-selector-section">
            <h3>Or browse your trips:</h3>
            <div class="trip-browser">
              <div class="trip-filter-tabs">
                <button class="filter-tab active" onclick="tripUI.filterTrips('all')">All Trips</button>
                <button class="filter-tab" onclick="tripUI.filterTrips('upcoming')">Upcoming</button>
                <button class="filter-tab" onclick="tripUI.filterTrips('completed')">Completed</button>
              </div>
              <div class="trips-selector-grid" id="tripsSelectorGrid">
                ${this.renderTripsSelector(allTrips)}
              </div>
            </div>
          </div>
        ` : ''}
      </div>
    `;
  }

  // Create new trip from trips page
  createNewTripFromTripsPage() {
    this.showAddTripModal();
  }

  // Render trips selector for empty state
  renderTripsSelector(trips) {
    if (trips.length === 0) {
      return '<p class="no-trips-message">No trips match the selected filter.</p>';
    }
    
    return trips.map(trip => {
      const status = this.getTripStatus(trip);
      const placesCount = trip.places ? trip.places.length : 0;
      return `
        <div class="trip-selector-card" onclick="tripUI.viewTripDetail(${trip.id})">
          <div class="trip-selector-header">
            <h4>${trip.name}</h4>
            <span class="trip-status ${status.toLowerCase()}">${status}</span>
          </div>
          <p class="trip-selector-dates">${new Date(trip.startDate).toLocaleDateString()} - ${new Date(trip.endDate).toLocaleDateString()}</p>
          <p class="trip-selector-places">${placesCount} ${placesCount === 1 ? 'place' : 'places'}</p>
        </div>
      `;
    }).join('');
  }

  // Get trip status
  getTripStatus(trip) {
    const currentDate = new Date();
    const startDate = new Date(trip.startDate);
    const endDate = new Date(trip.endDate);
    
    if (currentDate < startDate) return 'Upcoming';
    if (currentDate > endDate) return 'Completed';
    return 'Ongoing';
  }

  // Filter trips in empty state
  filterTrips(filter) {
    const allTrips = this.tripManager.getAllTrips();
    const currentDate = new Date();
    
    let filteredTrips = allTrips;
    
    if (filter === 'upcoming') {
      filteredTrips = allTrips.filter(trip => new Date(trip.startDate) > currentDate);
    } else if (filter === 'completed') {
      filteredTrips = allTrips.filter(trip => new Date(trip.endDate) < currentDate);
    }
    
    // Update filter tabs
    const tabs = document.querySelectorAll('.filter-tab');
    tabs.forEach(tab => tab.classList.remove('active'));
    event.target.classList.add('active');
    
    // Update trips grid
    const grid = document.getElementById('tripsSelectorGrid');
    if (grid) {
      grid.innerHTML = this.renderTripsSelector(filteredTrips);
    }
  }

  // Redirect to home page for trip creation
  redirectToHomeForTripCreation() {
    // Navigate to home view
    const views = document.querySelectorAll('.view');
    views.forEach(view => view.classList.remove('active'));
    
    const homeView = document.getElementById('homeView');
    if (homeView) {
      homeView.classList.add('active');
    }

    // Update bottom navigation
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => item.classList.remove('active'));
    
    const homeNavItem = document.querySelector('.nav-item[data-view="home"]');
    if (homeNavItem) {
      homeNavItem.classList.add('active');
    }

    // Show notification to guide user
    setTimeout(() => {
      this.showNotification('No trips found. Create your first trip to get started!', 'info');
      
      // Optionally auto-open the add trip modal after a short delay
      setTimeout(() => {
        this.showAddTripModal();
      }, 1500);
    }, 500);
  }

  // Render trips list
  renderTripsList() {
    const trips = this.tripManager.getAllTrips();
    
    if (trips.length === 0) {
      return `
        <div class="empty-state">
          <div class="empty-state-icon">🗺️</div>
          <h3 class="empty-state-title">No trips planned yet</h3>
          <p class="empty-state-text">Start planning your next adventure by creating your first trip!</p>
          <button class="btn-primary" onclick="document.getElementById('create-trip-btn').click()">
            Create Your First Trip
          </button>
        </div>
      `;
    }

    return `
      <div class="trips-grid">
        ${trips.map(trip => this.renderTripCard(trip)).join('')}
      </div>
    `;
  }

  // Render individual trip card
  renderTripCard(trip) {
    const startDate = new Date(trip.startDate).toLocaleDateString();
    const endDate = new Date(trip.endDate).toLocaleDateString();
    const placesCount = trip.places.length;
    const placesPreview = trip.places.slice(0, 3);

    return `
      <div class="trip-card" onclick="tripUI.viewTripDetail(${trip.id})">
        <div class="trip-card-header">
          <h3 class="trip-name">${trip.name}</h3>
          <div class="trip-actions">
            <button class="btn-secondary" onclick="event.stopPropagation(); tripUI.editTrip(${trip.id})">
              ✏️
            </button>
            <button class="btn-danger" onclick="event.stopPropagation(); tripUI.deleteTrip(${trip.id})">
              🗑️
            </button>
          </div>
        </div>
        <div class="trip-dates">
          ${startDate} - ${endDate}
        </div>
        <div class="trip-places-count">
          ${placesCount} ${placesCount === 1 ? 'place' : 'places'}
        </div>
        ${placesPreview.length > 0 ? `
          <div class="trip-places-preview">
            <div class="places-preview-list">
              ${placesPreview.map(place => `
                <span class="place-tag">${place.city}, ${place.state}</span>
              `).join('')}
              ${trip.places.length > 3 ? `<span class="place-tag">+${trip.places.length - 3} more</span>` : ''}
            </div>
          </div>
        ` : ''}
      </div>
    `;
  }

  // Create trip modal - Removed as trip creation is now only on home page
  createTripModal() {
    // This modal is no longer used as trip creation is handled on home page
    return '';
  }

  // Create trip detail view
  createTripDetailView(trip) {
    return `
      <div class="trip-detail">
        <div class="trip-detail-header">
          <div class="navigation-buttons">
            <button class="btn-secondary" onclick="tripUI.backToHome()">
              🏠 Back to Home
            </button>
          </div>
          <h1 class="trip-detail-name">${trip.name}</h1>
          <p class="trip-detail-dates">
            ${new Date(trip.startDate).toLocaleDateString()} - ${new Date(trip.endDate).toLocaleDateString()}
          </p>
        </div>
        
        <div class="trip-sections">
          <!-- Places Covered Section -->
          <div class="trip-section">
            <div class="section-header">
              <h2 class="section-title">📍 Places Covered</h2>
              <div class="section-actions">
                <button class="btn-primary" onclick="tripUI.goToExplorePage()">
                  ➕ Add Place (Go to Explore)
                </button>
              </div>
            </div>
            <div id="places-list">
              ${this.renderPlacesList(trip.places)}
            </div>
          </div>

          <!-- Detailed Day by Day Itinerary Section -->
          <div class="trip-section">
            <div class="section-header">
              <h2 class="section-title">📅 Detailed Day by Day Itinerary</h2>
              <div class="section-actions">
                <button class="btn-primary" onclick="tripUI.showAddItineraryModal()">
                  ➕ Add Day
                </button>
              </div>
            </div>
            <div id="itinerary-list">
              ${this.renderItineraryList(trip.itinerary || [])}
            </div>
          </div>

          <!-- Accommodation Section -->
          <div class="trip-section accommodation-section">
            <div class="section-header">
              <h2 class="section-title">🏨 Accommodation</h2>
              <button class="btn-add-accommodation" onclick="openAccommodationModal()">
                <span>+</span> Add Accommodation
              </button>
            </div>
            <div id="accommodationContainer">
              ${this.renderAccommodationList()}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // Render trip map
  renderTripMap() {
    return `<div id="india-map-placeholder">Loading interactive map...</div>`;
  }

  // Create add place form
  createAddPlaceForm() {
    const states = this.tripManager.getStates();
    
    return `
      <div class="add-place-form">
        <div class="place-search-tabs">
          <button class="tab-btn active" id="preset-tab" onclick="tripUI.switchTab('preset')">
            🗺️ Select from List
          </button>
          <button class="tab-btn" id="custom-tab" onclick="tripUI.switchTab('custom')">
            ✏️ Add Custom Place
          </button>
        </div>
        
        <!-- Preset Places Tab -->
        <div id="preset-form" class="tab-content active">
          <div class="place-search">
            <div class="form-group">
              <label class="form-label" for="place-state">State</label>
              <select id="place-state" class="form-select">
                <option value="">Select State</option>
                ${states.map(state => `<option value="${state}">${state}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label class="form-label" for="place-city">City</label>
              <select id="place-city" class="form-select" disabled>
                <option value="">Select City</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">&nbsp;</label>
              <button type="button" class="btn-primary" onclick="tripUI.addPlaceToTrip()" disabled id="add-place-btn">
                Add Place
              </button>
            </div>
          </div>
        </div>
        
        <!-- Custom Place Tab -->
        <div id="custom-form" class="tab-content">
          <div class="custom-place-form">
            <div class="form-row">
              <div class="form-group">
                <label class="form-label" for="custom-place-name">Place Name *</label>
                <input type="text" id="custom-place-name" class="form-input" placeholder="e.g., My Hometown" required>
              </div>
              <div class="form-group">
                <label class="form-label" for="custom-state">State *</label>
                <select id="custom-state" class="form-select">
                  <option value="">Select State</option>
                  ${states.map(state => `<option value="${state}">${state}</option>`).join('')}
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label" for="custom-attractions">Must-Visit Places (one per line)</label>
              <textarea id="custom-attractions" class="form-input" rows="4" placeholder="Local Market&#10;Beautiful Temple&#10;Scenic Viewpoint&#10;Traditional Restaurant"></textarea>
            </div>
            <div class="form-group">
              <button type="button" class="btn-primary" onclick="tripUI.addCustomPlace()" id="add-custom-btn">
                Add Custom Place
              </button>
              <button type="button" class="btn-secondary" onclick="tripUI.clearCustomForm()" style="margin-left: 0.5rem;">
                Clear
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // Render places list
  renderPlacesList(places) {
    if (places.length === 0) {
      return `
        <div class="empty-state">
          <div class="empty-state-icon">📍</div>
          <h3 class="empty-state-title">No places added yet</h3>
          <p class="empty-state-text">Start building your itinerary by adding places to visit!</p>
        </div>
      `;
    }

    return `
      <div class="places-list">
        ${places.map(place => this.renderPlaceItem(place)).join('')}
      </div>
    `;
  }

  // Render individual place item
  renderPlaceItem(place) {
    const customBadge = place.isCustom ? '<span class="place-tag" style="background: #9c27b0; color: white;">Custom</span>' : '';
    
    return `
      <div class="place-item">
        <div class="place-header">
          <div>
            <h3 class="place-name">${place.city} ${customBadge}</h3>
            <p class="place-location">${place.state}, India</p>
          </div>
          <div class="place-actions">
            <button class="btn-edit place-action-btn" onclick="tripUI.editPlace(${place.id})" title="Manage Attractions">
              ✏️ Edit
            </button>
            <button class="btn-danger place-action-btn" onclick="tripUI.removePlace(${place.id})" title="Delete Place">
              🗑️ Delete
            </button>
          </div>
        </div>
        <p class="place-description">${place.description}</p>
        ${this.renderAttractionsSection(place)}
      </div>
    `;
  }

  // Render attractions section with loading states
  renderAttractionsSection(place) {
    if (!place.attractions) {
      return `
        <div class="place-attractions">
          <div class="attractions-loading">
            <span>Loading attractions...</span>
          </div>
        </div>
      `;
    }

    if (place.attractions.length === 0) {
      return `
        <div class="place-attractions">
          <h4 class="attractions-title">Attractions information unavailable</h4>
          <p class="attractions-error">Try refreshing or check your internet connection</p>
        </div>
      `;
    }

    return `
      <div class="place-attractions">
        <h4 class="attractions-title">
          Must-visit attractions:
          <span class="attraction-source">${this.getAttractionsSource(place)}</span>
        </h4>
        <div class="attractions-list ${place.isCustom ? 'static-attractions' : 'dynamic-attractions'}">
          ${place.attractions.map(attraction => `
            <span class="attraction-tag clickable" onclick="window.attractionDetailsManager?.showAttractionDetails('${attraction.replace(/'/g, "\\'")}', ${JSON.stringify(place).replace(/"/g, '&quot;')})" title="Click for details about ${attraction}">
              ${attraction}
              <span class="attraction-icon">🔍</span>
            </span>
          `).join('')}
        </div>
        ${place.attractions.length > 0 ? `
          <p class="attractions-hint">💡 Click on any attraction to see details, photos, and visit information</p>
        ` : ''}
      </div>
    `;
  }

  // Get attractions source indicator
  getAttractionsSource(place) {
    if (place.isCustom) {
      return '(Custom)';
    }
    return '(Live Data)';
  }

  // Attach event listeners
  attachEventListeners() {
    // Use event delegation for dynamically created elements
    document.addEventListener('click', (e) => {
      // Only handle Add Trip button from home page now
      if (e.target.id === 'addTripBtn') {
        // Handle new Add Trip button from home page
        this.showAddTripModal();
      } else if (e.target.id === 'closeAddTripModal' || e.target.id === 'cancelTripBtn') {
        this.hideAddTripModal();
      }
      // Remove create-trip-btn handler as it's no longer used
    });

    document.addEventListener('submit', (e) => {
      if (e.target.id === 'addTripForm') {
        e.preventDefault();
        this.saveAddTripForm();
      }
      // Remove trip-form handler as it's no longer used
    });

    document.addEventListener('change', (e) => {
      if (e.target.id === 'place-state') {
        this.updateCitiesDropdown(e.target.value);
      } else if (e.target.id === 'place-city') {
        this.updateAddPlaceButton();
      }
    });
  }

  // Show add trip modal (new home page modal)
  showAddTripModal() {
    const modal = document.getElementById('addTripModal');
    if (modal) {
      modal.classList.remove('hidden');
      // Set minimum date to today
      const today = new Date().toISOString().split('T')[0];
      document.getElementById('tripStartDate').min = today;
      document.getElementById('tripEndDate').min = today;
    }
  }

  // Hide add trip modal
  hideAddTripModal() {
    const modal = document.getElementById('addTripModal');
    if (modal) {
      modal.classList.add('hidden');
      this.clearAddTripForm();
    }
  }

  // Clear add trip form
  clearAddTripForm() {
    const form = document.getElementById('addTripForm');
    if (form) {
      form.reset();
    }
  }

  // Save add trip form (handles both create and edit)
  async saveAddTripForm() {
    const tripData = {
      name: document.getElementById('tripName').value.trim(),
      startDate: document.getElementById('tripStartDate').value,
      endDate: document.getElementById('tripEndDate').value,
      description: document.getElementById('tripDescription').value.trim() || ''
    };

    // Validation
    if (!tripData.name || !tripData.startDate || !tripData.endDate) {
      alert('Please fill in all required fields');
      return;
    }

    if (new Date(tripData.startDate) > new Date(tripData.endDate)) {
      alert('End date must be after start date');
      return;
    }

    try {
      if (this.currentTripId) {
        // Update existing trip
        this.tripManager.updateTrip(this.currentTripId, tripData);
        this.showNotification('Trip updated successfully!', 'success');
      } else {
        // Create new trip
        this.tripManager.createTrip(tripData);
        this.showNotification('Trip created successfully! Now add destinations to your trip.', 'success');
      }
      
      // Hide modal and refresh display
      this.hideAddTripModal();
      this.renderHomePageTrips();
      
    } catch (error) {
      console.error('Error saving trip:', error);
      alert('Error saving trip. Please try again.');
    }
  }

  // Show notification
  showNotification(message, type = 'info') {
    // Create a simple notification
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === 'success' ? 'var(--primary-color)' : 'var(--gray-700)'};
      color: white;
      padding: var(--spacing-lg);
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-lg);
      z-index: var(--z-toast);
      animation: slideIn 0.3s ease-out;
    `;

    document.body.appendChild(notification);

    // Remove after 3 seconds
    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease-in';
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 3000);
  }

  // Show trip modal
  showTripModal(trip = null) {
    const modal = document.getElementById('addTripModal');
    const modalTitle = modal.querySelector('.modal-header h3');
    const saveBtn = modal.querySelector('.btn-primary');
    
    if (trip) {
      modalTitle.textContent = 'Edit Trip';
      saveBtn.textContent = 'Update Trip';
      this.fillEditTripForm(trip);
      this.currentTripId = trip.id;
    } else {
      modalTitle.textContent = 'Create New Trip';
      saveBtn.textContent = 'Create Trip';
      this.clearAddTripForm();
      this.currentTripId = null;
    }
    
    modal.classList.remove('hidden');
  }

  // Hide trip modal
  hideTripModal() {
    const modal = document.getElementById('addTripModal');
    modal.classList.add('hidden');
    this.clearAddTripForm();
  }

  // Fill edit trip form with existing data
  fillEditTripForm(trip) {
    document.getElementById('tripName').value = trip.name;
    document.getElementById('tripStartDate').value = trip.startDate;
    document.getElementById('tripEndDate').value = trip.endDate;
    document.getElementById('tripDescription').value = trip.description || '';
  }

  // Update cities dropdown based on selected state
  updateCitiesDropdown(state) {
    const citySelect = document.getElementById('place-city');
    const addBtn = document.getElementById('add-place-btn');
    
    citySelect.innerHTML = '<option value="">Select City</option>';
    addBtn.disabled = true;
    
    if (state) {
      const cities = this.tripManager.getCitiesByState(state);
      cities.forEach(city => {
        const option = document.createElement('option');
        option.value = city;
        option.textContent = city;
        citySelect.appendChild(option);
      });
      citySelect.disabled = false;
    } else {
      citySelect.disabled = true;
    }
  }

  // Update add place button state
  updateAddPlaceButton() {
    const state = document.getElementById('place-state').value;
    const city = document.getElementById('place-city').value;
    const addBtn = document.getElementById('add-place-btn');
    
    addBtn.disabled = !state || !city;
  }

  // Show add place form
  showAddPlaceForm() {
    const section = document.getElementById('add-place-section');
    section.style.display = section.style.display === 'none' ? 'block' : 'none';
  }

  // Add place to current trip
  async addPlaceToTrip() {
    const state = document.getElementById('place-state').value;
    const city = document.getElementById('place-city').value;
    
    if (!state || !city) {
      alert('Please select both state and city');
      return;
    }

    try {
      const addBtn = document.getElementById('add-place-btn');
      addBtn.textContent = 'Adding...';
      addBtn.disabled = true;

      await this.tripManager.addPlaceToTrip(this.currentTripId, { state, city });
      
      // Reset form
      document.getElementById('place-state').value = '';
      document.getElementById('place-city').value = '';
      document.getElementById('place-city').disabled = true;
      
      // Hide form and refresh places list
      document.getElementById('add-place-section').style.display = 'none';
      this.refreshPlacesList();
      
      addBtn.textContent = 'Add Place';
    } catch (error) {
      console.error('Error adding place:', error);
      alert('Error adding place. Please try again.');
      document.getElementById('add-place-btn').textContent = 'Add Place';
    }
  }

  // Add custom place to current trip
  async addCustomPlace() {
    const placeName = document.getElementById('custom-place-name').value.trim();
    const state = document.getElementById('custom-state').value;
    const attractionsText = document.getElementById('custom-attractions').value.trim();
    
    if (!placeName) {
      alert('Please enter a place name');
      return;
    }
    
    if (!state) {
      alert('Please select a state');
      return;
    }

    try {
      const addBtn = document.getElementById('add-custom-btn');
      addBtn.textContent = 'Adding...';
      addBtn.disabled = true;

      // Parse attractions from textarea
      const attractions = attractionsText 
        ? attractionsText.split('\n').map(a => a.trim()).filter(a => a.length > 0)
        : [];

      const customPlace = {
        city: placeName,
        state: state,
        description: `Custom destination in ${state}`,
        attractions: attractions,
        category: 'Custom',
        isCustom: true
      };

      await this.tripManager.addPlaceToTrip(this.currentTripId, customPlace);
      
      // Clear form and refresh
      this.clearCustomForm();
      document.getElementById('add-place-section').style.display = 'none';
      this.refreshPlacesList();
      
      addBtn.textContent = 'Add Custom Place';
      addBtn.disabled = false;
    } catch (error) {
      console.error('Error adding custom place:', error);
      alert('Error adding custom place. Please try again.');
      document.getElementById('add-custom-btn').textContent = 'Add Custom Place';
      document.getElementById('add-custom-btn').disabled = false;
    }
  }

  // Helper method to add place from explore page
  async addPlaceFromExplore(placeData) {
    if (!this.currentTripId) {
      console.error('No current trip ID for adding place');
      return false;
    }

    try {
      await this.tripManager.addPlaceToTrip(this.currentTripId, placeData);
      return true;
    } catch (error) {
      console.error('Error adding place from explore:', error);
      return false;
    }
  }

  // Clear custom place form
  clearCustomForm() {
    document.getElementById('custom-place-name').value = '';
    document.getElementById('custom-state').value = '';
    document.getElementById('custom-attractions').value = '';
  }

  // Switch between preset and custom tabs
  switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`${tabName}-tab`).classList.add('active');
    
    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    document.getElementById(`${tabName}-form`).classList.add('active');
  }

  // Edit a specific place - manage attractions only
  editPlace(placeId) {
    const trip = this.tripManager.getTrip(this.currentTripId);
    if (!trip) return;
    
    const place = trip.places.find(p => p.id === placeId);
    if (!place) return;

    this.showEditPlaceModal(place);
  }

  // Show edit place modal for managing attractions
  showEditPlaceModal(place) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'editPlaceModal';
    
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h3>Manage Attractions - ${place.city}, ${place.state}</h3>
          <button class="close-btn" onclick="tripUI.closeEditPlaceModal()">&times;</button>
        </div>
        <div class="modal-body">
          <p class="modal-description">
            Add or remove attractions you want to visit in ${place.city}. 
            This won't change the place name or location.
          </p>
          
          <div class="attractions-management">
            <div class="current-attractions">
              <h4>Current Attractions</h4>
              <div id="currentAttractionsList" class="attractions-list-editable">
                ${place.attractions && place.attractions.length > 0 ? 
                  place.attractions.map((attraction, index) => `
                    <div class="attraction-item-editable">
                      <span>${attraction}</span>
                      <button type="button" class="remove-attraction-btn" onclick="tripUI.removeAttractionFromPlace(${place.id}, ${index})">
                        ×
                      </button>
                    </div>
                  `).join('') : 
                  '<p class="no-attractions">No attractions added yet</p>'
                }
              </div>
            </div>
            
            <div class="add-attraction-section">
              <h4>Add New Attraction</h4>
              <div class="add-attraction-form">
                <input type="text" id="newAttractionInput" placeholder="Enter attraction name..." class="form-input">
                <button type="button" class="btn-primary" onclick="tripUI.addAttractionToPlace(${place.id})">
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn-secondary" onclick="tripUI.closeEditPlaceModal()">Done</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add click handler to close modal when clicking background
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        this.closeEditPlaceModal();
      }
    });
    
    // Focus on input field
    setTimeout(() => {
      const input = document.getElementById('newAttractionInput');
      if (input) input.focus();
    }, 100);
  }

  // Close edit place modal
  closeEditPlaceModal() {
    const modal = document.getElementById('editPlaceModal');
    if (modal) {
      modal.remove();
    }
  }

  // Add attraction to place
  addAttractionToPlace(placeId) {
    const input = document.getElementById('newAttractionInput');
    const attractionName = input.value.trim();
    
    if (!attractionName) {
      alert('Please enter an attraction name');
      return;
    }
    
    const trip = this.tripManager.getTrip(this.currentTripId);
    if (!trip) return;
    
    const place = trip.places.find(p => p.id === placeId);
    if (!place) return;
    
    // Initialize attractions array if it doesn't exist
    if (!place.attractions) {
      place.attractions = [];
    }
    
    // Check for duplicates
    if (place.attractions.includes(attractionName)) {
      alert('This attraction is already in the list');
      return;
    }
    
    // Add attraction
    place.attractions.push(attractionName);
    
    // Update the trip
    this.tripManager.updateTrip(this.currentTripId, trip);
    
    // Clear input
    input.value = '';
    
    // Refresh the attractions list in modal
    this.refreshEditPlaceModal(place);
    
    // Refresh the main places list
    this.refreshPlacesList();
    
    this.showNotification(`Added "${attractionName}" to ${place.city}`, 'success');
  }

  // Remove attraction from place
  removeAttractionFromPlace(placeId, attractionIndex) {
    const trip = this.tripManager.getTrip(this.currentTripId);
    if (!trip) return;
    
    const place = trip.places.find(p => p.id === placeId);
    if (!place || !place.attractions) return;
    
    const attractionName = place.attractions[attractionIndex];
    
    if (confirm(`Remove "${attractionName}" from ${place.city}?`)) {
      place.attractions.splice(attractionIndex, 1);
      
      // Update the trip
      this.tripManager.updateTrip(this.currentTripId, trip);
      
      // Refresh the attractions list in modal
      this.refreshEditPlaceModal(place);
      
      // Refresh the main places list
      this.refreshPlacesList();
      
      this.showNotification(`Removed "${attractionName}" from ${place.city}`, 'success');
    }
  }

  // Refresh edit place modal content
  refreshEditPlaceModal(place) {
    const attractionsList = document.getElementById('currentAttractionsList');
    if (attractionsList) {
      attractionsList.innerHTML = place.attractions && place.attractions.length > 0 ? 
        place.attractions.map((attraction, index) => `
          <div class="attraction-item-editable">
            <span>${attraction}</span>
            <button type="button" class="remove-attraction-btn" onclick="tripUI.removeAttractionFromPlace(${place.id}, ${index})">
              ×
            </button>
          </div>
        `).join('') : 
        '<p class="no-attractions">No attractions added yet</p>';
    }
  }

  // Remove place from trip
  removePlace(placeId) {
    const trip = this.tripManager.getTrip(this.currentTripId);
    if (!trip) return;
    
    const place = trip.places.find(p => p.id === placeId);
    if (!place) return;

    if (confirm(`Are you sure you want to remove "${place.city}" from your trip?`)) {
      this.tripManager.removePlaceFromTrip(this.currentTripId, placeId);
      this.refreshPlacesList();
      this.showNotification(`"${place.city}" removed from trip`, 'success');
    }
  }

  // Show edit place form (placeholder for future implementation)
  showEditPlaceForm() {
    alert('Edit Place functionality coming soon! For now, you can delete and re-add places.');
  }

  // Show delete place form (placeholder for future implementation) 
  showDeletePlaceForm() {
    const trip = this.tripManager.getTrip(this.currentTripId);
    if (!trip || trip.places.length === 0) {
      alert('No places to delete in this trip.');
      return;
    }

    const placeNames = trip.places.map((place, index) => `${index + 1}. ${place.city}, ${place.state}`).join('\n');
    const placeIndex = prompt(`Select place to delete by number:\n\n${placeNames}\n\nEnter number (1-${trip.places.length}):`);
    
    if (placeIndex && !isNaN(placeIndex) && placeIndex >= 1 && placeIndex <= trip.places.length) {
      const place = trip.places[parseInt(placeIndex) - 1];
      this.removePlace(place.id);
    } else if (placeIndex !== null) {
      alert('Invalid selection. Please try again.');
    }
  }

  // View trip detail
  viewTripDetail(tripId) {
    const trip = this.tripManager.getTrip(tripId);
    if (!trip) return;

    this.currentTripId = tripId;
    this.currentView = 'detail';
    
    // Navigate to trips page and show trip detail
    this.navigateToTripsPage(trip);
  }

  // Navigate to trips page and show trip detail
  navigateToTripsPage(trip) {
    // Switch to trips view
    const views = document.querySelectorAll('.view');
    views.forEach(view => view.classList.remove('active'));
    
    const tripsView = document.getElementById('tripsView');
    if (tripsView) {
      tripsView.classList.add('active');
    }

    // Update bottom navigation
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => item.classList.remove('active'));
    
    const tripsNavItem = document.querySelector('.nav-item[data-view="trips"]');
    if (tripsNavItem) {
      tripsNavItem.classList.add('active');
    }

    // Render trip detail in trips view
    const container = document.getElementById('trip-list');
    if (container) {
      container.innerHTML = this.createTripDetailView(trip);
      
      // Initialize map after view is rendered
      this.initializeTripMap(trip);
    }
  }

  // Initialize map for current trip
  initializeTripMap(trip) {
    setTimeout(() => {
      const mapPlaceholder = document.getElementById('india-map-placeholder');
      if (mapPlaceholder && this.mapManager) {
        // Replace placeholder with actual map
        const mapContainer = this.mapManager.createMapContainer();
        mapPlaceholder.parentNode.replaceChild(mapContainer, mapPlaceholder);
        
        // Initialize the map
        this.mapManager.initializeMap();
        
        // Update map with current trip data
        this.mapManager.updateMapWithTrip(trip);
      }
    }, 100);
  }

  // Back to trips list
  backToList() {
    this.currentView = 'list';
    this.currentTripId = null;
    this.createTripListView();
  }

  // Back to home page
  backToHome() {
    this.currentView = 'list';
    this.currentTripId = null;
    
    // Navigate to home view
    const views = document.querySelectorAll('.view');
    views.forEach(view => view.classList.remove('active'));
    
    const homeView = document.getElementById('homeView');
    if (homeView) {
      homeView.classList.add('active');
    }

    // Update bottom navigation
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => item.classList.remove('active'));
    
    const homeNavItem = document.querySelector('.nav-item[data-view="home"]');
    if (homeNavItem) {
      homeNavItem.classList.add('active');
    }
  }

  // Navigate to explore page for adding places
  goToExplorePage() {
    // Store the current trip ID for adding places later
    localStorage.setItem('addPlaceToTripId', this.currentTripId);
    
    // Navigate to explore view
    const views = document.querySelectorAll('.view');
    views.forEach(view => view.classList.remove('active'));
    
    const exploreView = document.getElementById('exploreView');
    if (exploreView) {
      exploreView.classList.add('active');
    }

    // Update bottom navigation
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => item.classList.remove('active'));
    
    const exploreNavItem = document.querySelector('.nav-item[data-view="explore"]');
    if (exploreNavItem) {
      exploreNavItem.classList.add('active');
    }

    // Initialize the map in explore view
    this.initializeExploreMap();
  }

  // Initialize map for explore page
  initializeExploreMap() {
    setTimeout(() => {
      const mapContainer = document.getElementById('explore-map');
      if (mapContainer && this.mapManager) {
        // Clear existing content
        mapContainer.innerHTML = '';
        
        // Create map for explore page
        const exploreMapContainer = this.mapManager.createMapContainer();
        mapContainer.appendChild(exploreMapContainer);
        
        // Initialize the map
        this.mapManager.initializeMap();
        
        // Check if we're adding to a specific trip
        const addToTripId = localStorage.getItem('addPlaceToTripId');
        if (addToTripId) {
          this.showAddToTripBanner();
        }
      }
    }, 100);
  }

  // Show banner when adding place to trip (fly-through banner for 3 seconds)
  showAddToTripBanner() {
    const banner = document.getElementById('add-to-trip-info');
    if (banner) {
      banner.classList.remove('hidden');
      
      // Auto-hide after 3 seconds
      setTimeout(() => {
        if (banner && !banner.classList.contains('hidden')) {
          banner.classList.add('hidden');
        }
      }, 3000);
    }
  }

  // Cancel adding place to trip
  cancelAddPlace() {
    localStorage.removeItem('addPlaceToTripId');
    const banner = document.getElementById('add-to-trip-info');
    if (banner) {
      banner.classList.add('hidden');
    }
  }

  // Edit trip from home page
  editTripFromHome(tripId) {
    const trip = this.tripManager.getTrip(tripId);
    if (trip) {
      this.showTripModal(trip);
    }
  }

  // Delete trip from home page
  deleteTripFromHome(tripId) {
    const trip = this.tripManager.getTrip(tripId);
    if (!trip) return;

    if (confirm(`Are you sure you want to delete "${trip.name}"? This action cannot be undone.`)) {
      this.tripManager.deleteTrip(tripId);
      // Refresh home page trips display
      this.renderHomePageTrips();
      this.showNotification(`"${trip.name}" deleted successfully`, 'success');
    }
  }

  // Edit trip
  editTrip(tripId) {
    const trip = this.tripManager.getTrip(tripId);
    if (trip) {
      this.showTripModal(trip);
    }
  }

  // Delete trip
  deleteTrip(tripId) {
    const trip = this.tripManager.getTrip(tripId);
    if (!trip) return;

    if (confirm(`Are you sure you want to delete "${trip.name}"? This action cannot be undone.`)) {
      this.tripManager.deleteTrip(tripId);
      this.refreshTripsList();
      // Also refresh home page trips
      this.renderHomePageTrips();
    }
  }

  // Refresh trips list
  refreshTripsList() {
    const content = document.getElementById('trips-content');
    if (content) {
      content.innerHTML = this.renderTripsList();
    }
    // Also refresh home page trips
    this.renderHomePageTrips();
  }

  // Refresh places list
  refreshPlacesList() {
    const trip = this.tripManager.getTrip(this.currentTripId);
    if (trip) {
      const placesList = document.getElementById('places-list');
      if (placesList) {
        placesList.innerHTML = this.renderPlacesList(trip.places);
        
        // Start loading attractions for places that don't have them yet
        this.loadMissingAttractions(trip.places);
      }
    }
    
    // Also refresh home page to show updated place counts
    this.renderHomePageTrips();
  }

  // Load attractions for places that are missing them
  async loadMissingAttractions(places) {
    for (const place of places) {
      if (!place.attractions || place.attractions.length === 0) {
        try {
          // Show loading state
          const placeElement = document.querySelector(`[data-place-id="${place.id}"]`);
          if (placeElement) {
            const attractionsSection = placeElement.querySelector('.place-attractions');
            if (attractionsSection) {
              attractionsSection.innerHTML = `
                <div class="attractions-loading">
                  <span>Loading attractions for ${place.city}...</span>
                </div>
              `;
            }
          }

          // Fetch fresh attractions data
          const updatedPlace = await this.tripManager.refreshPlaceAttractions(this.currentTripId, place.id);
          
          if (updatedPlace && updatedPlace.attractions && updatedPlace.attractions.length > 0) {
            // Update the display with successful results
            this.refreshPlacesList();
          } else {
            // Show that we tried but couldn't find dynamic data
            if (placeElement) {
              const attractionsSection = placeElement.querySelector('.place-attractions');
              if (attractionsSection) {
                attractionsSection.innerHTML = `
                  <div class="place-attractions">
                    <h4 class="attractions-title">Popular attractions in ${place.city}:</h4>
                    <div class="attractions-list">
                      <span class="attraction-tag">Local Markets</span>
                      <span class="attraction-tag">Traditional Temples</span>
                      <span class="attraction-tag">Scenic Viewpoints</span>
                      <span class="attraction-tag">Cultural Centers</span>
                    </div>
                    <p class="attractions-note">Dynamic data unavailable - showing general attractions</p>
                  </div>
                `;
              }
            }
          }
        } catch (error) {
          console.error('Error loading attractions:', error);
          // Show basic attractions as fallback
          const placeElement = document.querySelector(`[data-place-id="${place.id}"]`);
          if (placeElement) {
            const attractionsSection = placeElement.querySelector('.place-attractions');
            if (attractionsSection) {
              attractionsSection.innerHTML = `
                <div class="place-attractions">
                  <h4 class="attractions-title">Popular attractions in ${place.city}:</h4>
                  <div class="attractions-list">
                    <span class="attraction-tag">Local Markets</span>
                    <span class="attraction-tag">Historical Sites</span>
                    <span class="attraction-tag">Cultural Centers</span>
                  </div>
                  <p class="attractions-error">Unable to load live attraction data</p>
                </div>
              `;
            }
          }
        }
      }
    }
  }

  // ===== ITINERARY MANAGEMENT METHODS =====

  // Render itinerary list
  renderItineraryList(itinerary) {
    if (!itinerary || itinerary.length === 0) {
      return `
        <div class="empty-state">
          <div class="empty-state-icon">📅</div>
          <h3 class="empty-state-title">No itinerary planned yet</h3>
          <p class="empty-state-text">Start planning your daily activities by adding day-by-day plans!</p>
        </div>
      `;
    }

    return `
      <div class="itinerary-timeline">
        ${itinerary.map(item => this.renderItineraryItem(item)).join('')}
      </div>
    `;
  }

  // Render individual itinerary item
  renderItineraryItem(item) {
    const date = new Date(item.date);
    const dayNumber = Math.floor((date - new Date(this.getCurrentTrip().startDate)) / (1000 * 60 * 60 * 24)) + 1;
    
    const formattedDate = date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    });

    const allAttractions = [
      ...(item.attractions || []).map(name => ({ name, isFromPlace: true })),
      ...(item.customAttractions || []).map(name => ({ name, isFromPlace: false }))
    ];

    return `
      <div class="itinerary-day-card" data-itinerary-id="${item.id}">
        <div class="itinerary-day-header">
          <div class="day-info">
            <div class="day-number">Day ${dayNumber}</div>
            <div class="day-date">${formattedDate}</div>
            <div class="day-location">📍 ${item.place}</div>
          </div>
          <div class="day-actions">
            <button class="btn-edit itinerary-action-btn" onclick="tripUI.editItineraryItem(${item.id})" title="Edit Day">
              ✏️ Edit
            </button>
            <button class="btn-danger itinerary-action-btn" onclick="tripUI.deleteItineraryItem(${item.id})" title="Delete Day">
              🗑️ Delete
            </button>
          </div>
        </div>
        
        <div class="itinerary-day-content">
          ${allAttractions.length > 0 ? `
            <div class="day-attractions">
              <h4 class="attractions-heading">🎯 Places to Visit</h4>
              <div class="attractions-grid">
                ${allAttractions.map(attraction => `
                  <div class="attraction-item ${attraction.isFromPlace ? 'from-place' : 'custom'}">
                    <div class="attraction-name">${attraction.name}</div>
                    ${attraction.isFromPlace ? `
                      <div class="attraction-description">
                        ${this.tripManager.getAttractionDescription(attraction.name, { city: item.place })}
                      </div>
                    ` : `
                      <div class="attraction-type">Custom Attraction</div>
                    `}
                  </div>
                `).join('')}
              </div>
            </div>
          ` : `
            <div class="day-attractions">
              <p class="no-attractions">No attractions planned for this day</p>
            </div>
          `}
          
          ${item.accommodation ? `
            <div class="day-accommodation">
              <h4 class="accommodation-heading">🏨 Accommodation</h4>
              <div class="accommodation-info">
                ${typeof item.accommodation === 'object' ? `
                  <div class="accommodation-details">
                    <strong>${item.accommodation.name}</strong>
                    <p>${item.accommodation.location.city}, ${item.accommodation.location.state}</p>
                    ${item.accommodation.hotelData ? `
                      <div class="hotel-rating">
                        <span class="rating-stars">${'★'.repeat(Math.floor(item.accommodation.hotelData.rating))}</span>
                        <span class="rating-text">${item.accommodation.hotelData.rating}/5</span>
                      </div>
                      <p><em>${item.accommodation.hotelData.category}</em></p>
                    ` : ''}
                    ${item.accommodation.customDetails ? `
                      <p><em>${item.accommodation.customDetails.category}</em></p>
                    ` : ''}
                  </div>
                ` : `
                  <span class="accommodation-location">${item.accommodation}</span>
                `}
              </div>
            </div>
          ` : ''}
          
          ${item.notes ? `
            <div class="day-notes">
              <h4 class="notes-heading">📝 Notes</h4>
              <div class="notes-content">${item.notes}</div>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  // Show add itinerary modal
  // Show itinerary modal (for add or edit)
  showItineraryModal(existingItinerary = null) {
    const trip = this.getCurrentTrip();
    if (!trip) return;
    
    const availableDates = this.tripManager.getAvailableDatesForItinerary(this.currentTripId);
    
    // If editing, add the current date to available dates
    if (existingItinerary) {
      availableDates.push(existingItinerary.date);
      availableDates.sort();
    }
    
    if (availableDates.length === 0 && !existingItinerary) {
      alert('All days in this trip already have itineraries planned!');
      return;
    }

    const modal = this.createItineraryModal(availableDates, trip.places, existingItinerary);
    document.body.appendChild(modal);
  }

  // Show add itinerary modal (backwards compatibility)
  showAddItineraryModal() {
    this.showItineraryModal();
  }

  // Create itinerary modal
  createItineraryModal(availableDates, places, existingItinerary = null) {
    const isEditing = !!existingItinerary;
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'itineraryModal';
    
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h3>${isEditing ? 'Edit Daily Itinerary' : 'Add Daily Itinerary'}</h3>
          <button class="close-btn" onclick="tripUI.closeItineraryModal()">&times;</button>
        </div>
        <div class="modal-body">
          <form id="itineraryForm">
            
            <div class="field-group">
              <label for="itineraryDate">Date</label>
              <select id="itineraryDate" required>
                <option value="">Select date</option>
                ${availableDates.map(date => `
                  <option value="${date.date}" ${existingItinerary && existingItinerary.date === date.date ? 'selected' : ''}>${date.displayDate}</option>
                `).join('')}
              </select>
            </div>
            
            <div class="field-group">
              <label for="itineraryPlace">Place to Visit</label>
              <select id="itineraryPlace" required onchange="tripUI.updateAttractionsList()">
                <option value="">Select place</option>
                ${places.map(place => `
                  <option value="${place.city}" ${existingItinerary && existingItinerary.place === place.city ? 'selected' : ''}>${place.city}, ${place.state}</option>
                `).join('')}
              </select>
            </div>
            
            <div class="field-group">
              <label>Attractions to Visit</label>
              <div class="attractions-tabs">
                <button type="button" class="tab-btn active" onclick="tripUI.switchAttractionTab('place')" id="placeAttractionsTab">
                  Find Places
                </button>
                <button type="button" class="tab-btn" onclick="tripUI.switchAttractionTab('custom')" id="customAttractionsTab">
                  Add Custom
                </button>
              </div>
              
              <div class="tab-content" id="placeAttractionsContent">
                <div id="availableAttractionsList">
                  <p>Please select a place first to see available attractions</p>
                </div>
              </div>
              
              <div class="tab-content hidden" id="customAttractionsContent">
                <div class="custom-input">
                  <input type="text" id="customAttractionInput" placeholder="Enter attraction name...">
                  <button type="button" onclick="tripUI.addCustomAttraction()">Add</button>
                </div>
              </div>
              
              <div class="selected-attractions">
                <h4>Selected Attractions</h4>
                <div class="selected-list" id="unifiedSelectedContainer">
                  <div class="no-selections">No attractions selected yet</div>
                </div>
              </div>
            </div>
            
            <div class="field-group">
              <label for="itineraryAccommodation">Accommodation (Optional)</label>
              <select id="itineraryAccommodation">
                <option value="">Select accommodation location</option>
                ${places.map(place => 
                    `<option value="${place.city}" ${existingItinerary && existingItinerary.accommodation === place.city ? 'selected' : ''}>${place.city}, ${place.state}</option>`
                ).join('')}
              </select>
            </div>
            
            <div class="field-group">
              <label for="itineraryNotes">Notes (Optional)</label>
              <textarea id="itineraryNotes" placeholder="Any special notes for this day..." rows="3">${existingItinerary ? existingItinerary.notes || '' : ''}</textarea>
            </div>
            
          </form>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn-cancel" onclick="tripUI.closeItineraryModal()">Cancel</button>
          <button type="button" class="btn-primary" onclick="tripUI.saveItineraryForm()">${isEditing ? 'Update' : 'Add'} Day Plan</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add click handler to close modal when clicking background
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        this.closeItineraryModal();
      }
    });
    
    // Pre-populate data if editing
    if (existingItinerary) {
      // Use setTimeout to ensure DOM is ready
      setTimeout(() => {
        this.prePopulateItineraryData(existingItinerary);
      }, 100);
    }
    
    return modal;
  }

  // Pre-populate itinerary data for editing
  prePopulateItineraryData(itinerary) {
    // Update attractions list first
    this.updateAttractionsList();
    
    const selectedContainer = document.getElementById('unifiedSelectedContainer');
    const noSelections = selectedContainer.querySelector('.no-selections');
    if (noSelections) noSelections.remove();
    
    // Pre-populate custom attractions
    if (itinerary.customAttractions && itinerary.customAttractions.length > 0) {
      itinerary.customAttractions.forEach(attraction => {
        const attractionItem = document.createElement('div');
        attractionItem.className = 'selected-item custom-item';
        attractionItem.dataset.attractionName = attraction;
        attractionItem.dataset.attractionType = 'custom';
        attractionItem.innerHTML = `
          <div class="selected-item-content">
            <div class="selected-attraction-name custom-attraction-name">${attraction}</div>
            <div class="selected-attraction-desc">Custom attraction</div>
            <div class="attraction-source">Custom</div>
          </div>
          <button type="button" class="remove-btn" onclick="tripUI.removeSelectedAttraction(this)">
            <i class="fas fa-times"></i>
          </button>
        `;
        selectedContainer.appendChild(attractionItem);
      });
    }
    
    // Pre-populate selected attractions
    setTimeout(() => {
      if (itinerary.attractions && itinerary.attractions.length > 0) {
        const availableCards = document.querySelectorAll('#availableAttractionsList .attraction-card');
        
        itinerary.attractions.forEach(attractionName => {
          const card = Array.from(availableCards).find(card => {
            const attraction = JSON.parse(card.dataset.attraction);
            return attraction.name === attractionName;
          });
          
          if (card) {
            this.addSelectedAttraction(card);
          }
        });
      }
    }, 200);
  }

  // Update attractions list based on selected place
  updateAttractionsList() {
    const placeSelect = document.getElementById('itineraryPlace');
    const availableList = document.getElementById('availableAttractionsList');
    const placeTab = document.getElementById('placeAttractionsTab');
    const dateSelect = document.getElementById('itineraryDate');
    
    if (!placeSelect.value) {
      availableList.innerHTML = '<p class="select-place-first">Please select a place first to see available attractions</p>';
      placeTab.textContent = 'Find Places';
      return;
    }

    const attractions = this.tripManager.getPlaceAttractions(this.currentTripId, placeSelect.value);
    placeTab.textContent = `Find Places (${attractions.length})`;
    
    if (attractions.length === 0) {
      availableList.innerHTML = '<p class="no-attractions-available">No attractions available for this place</p>';
      return;
    }

    // Get already selected attractions from other days to mask them
    const currentTrip = this.tripManager.getTrip(this.currentTripId);
    const selectedAttractionsOtherDays = new Set();
    const currentDate = dateSelect.value;
    
    if (currentTrip && currentTrip.itinerary) {
      currentTrip.itinerary.forEach(dayPlan => {
        if (dayPlan.date !== currentDate && dayPlan.selectedAttractions) {
          dayPlan.selectedAttractions.forEach(attraction => {
            selectedAttractionsOtherDays.add(attraction);
          });
        }
      });
    }

    availableList.innerHTML = `
      <div class="attractions-header">
        <h4>Available Attractions</h4>
        <div class="select-actions">
          <button type="button" class="btn-small" onclick="tripUI.selectAllAttractions()">
            Add All Available
          </button>
        </div>
      </div>
      <div class="attractions-grid">
        ${attractions.map((attraction, index) => {
          const isAlreadySelected = selectedAttractionsOtherDays.has(attraction.name);
          
          // Check if this attraction is selected in current modal session
          const selectedContainer = document.getElementById('unifiedSelectedContainer');
          let isSelectedInSession = false;
          if (selectedContainer) {
            const sessionItems = selectedContainer.querySelectorAll('.selected-item[data-attraction-type="existing"]');
            isSelectedInSession = Array.from(sessionItems).some(item => 
              item.dataset.attractionName === attraction.name
            );
          }
          
          let cardClass = 'attraction-card';
          let onClickHandler = 'onclick="tripUI.addSelectedAttraction(this)"';
          let iconClass = 'fas fa-plus';
          let statusLabel = '';
          
          if (isAlreadySelected) {
            cardClass += ' disabled';
            onClickHandler = '';
            iconClass = 'fas fa-check';
            statusLabel = '<div class="already-selected-label">Already selected for another day</div>';
          } else if (isSelectedInSession) {
            cardClass += ' selected-in-session';
            onClickHandler = '';
            iconClass = 'fas fa-check';
            statusLabel = '<div class="session-selected-label">Selected for this day</div>';
          }
          
          return `
            <div class="${cardClass}" data-attraction='${JSON.stringify(attraction)}' ${onClickHandler}>
              <div class="attraction-card-content">
                <div class="attraction-name">${attraction.name}</div>
                <div class="attraction-desc">${attraction.description}</div>
                ${statusLabel}
              </div>
              <div class="attraction-add-btn">
                <i class="${iconClass}"></i>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  // Switch between attraction tabs
  switchAttractionTab(tabType) {
    const placeTab = document.getElementById('placeAttractionsTab');
    const customTab = document.getElementById('customAttractionsTab');
    const placeContent = document.getElementById('placeAttractionsContent');
    const customContent = document.getElementById('customAttractionsContent');
    
    if (tabType === 'place') {
      placeTab.classList.add('active');
      customTab.classList.remove('active');
      placeContent.classList.remove('hidden');
      customContent.classList.add('hidden');
    } else {
      customTab.classList.add('active');
      placeTab.classList.remove('active');
      customContent.classList.remove('hidden');
      placeContent.classList.add('hidden');
    }
  }

  // Add custom attraction
  addCustomAttraction() {
    const nameInput = document.getElementById('customAttractionInput');
    const selectedContainer = document.getElementById('unifiedSelectedContainer');
    const noSelections = selectedContainer.querySelector('.no-selections');
    
    if (!nameInput.value.trim()) return;
    
    // Remove no selections message
    if (noSelections) {
      noSelections.remove();
    }
    
    // Check if already selected
    if (selectedContainer.querySelector(`[data-attraction-name="${nameInput.value.trim()}"]`)) {
      alert('This attraction is already selected!');
      nameInput.value = '';
      return;
    }
    
    const attractionItem = document.createElement('div');
    attractionItem.className = 'selected-item custom-item';
    attractionItem.dataset.attractionName = nameInput.value.trim();
    attractionItem.dataset.attractionType = 'custom';
    attractionItem.innerHTML = `
      <div class="selected-item-content">
        <div class="selected-attraction-name custom-attraction-name">${nameInput.value.trim()}</div>
        <div class="selected-attraction-desc">Custom attraction</div>
        <div class="attraction-source">Custom</div>
      </div>
      <button type="button" class="remove-btn" onclick="tripUI.removeSelectedAttraction(this)">
        <i class="fas fa-times"></i>
      </button>
    `;
    
    selectedContainer.appendChild(attractionItem);
    nameInput.value = '';
  }
  
  // Add selected attraction
  addSelectedAttraction(card) {
    const attraction = JSON.parse(card.dataset.attraction);
    const selectedContainer = document.getElementById('unifiedSelectedContainer');
    const noSelections = selectedContainer.querySelector('.no-selections');
    
    // Remove no selections message
    if (noSelections) {
      noSelections.remove();
    }
    
    // Check if already selected
    if (selectedContainer.querySelector(`[data-attraction-name="${attraction.name}"]`)) {
      return; // Already selected
    }
    
    // Create selected item
    const selectedItem = document.createElement('div');
    selectedItem.className = 'selected-item';
    selectedItem.dataset.attractionName = attraction.name;
    selectedItem.dataset.attractionType = 'existing';
    selectedItem.innerHTML = `
      <div class="selected-item-content">
        <div class="selected-attraction-name">${attraction.name}</div>
        <div class="selected-attraction-desc">${attraction.description}</div>
        <div class="attraction-source">From ${document.getElementById('itineraryPlace').selectedOptions[0]?.text || 'Selected Place'}</div>
      </div>
      <button type="button" class="remove-btn" onclick="tripUI.removeSelectedAttraction(this)">
        <i class="fas fa-times"></i>
      </button>
    `;
    
    selectedContainer.appendChild(selectedItem);
    
    // Refresh the attractions list to update visual states
    this.updateAttractionsList();
  }
  
  // Remove selected attraction
  removeSelectedAttraction(button) {
    const selectedItem = button.closest('.selected-item');
    const attractionName = selectedItem.dataset.attractionName;
    const attractionType = selectedItem.dataset.attractionType;
    const selectedContainer = document.getElementById('unifiedSelectedContainer');
    const availableList = document.getElementById('availableAttractionsList');
    
    // Remove from selected list
    selectedItem.remove();
    
    // Refresh the attractions list to update visual states if it's an existing attraction
    if (attractionType === 'existing') {
      this.updateAttractionsList();
    }
    
    // Show no selections message if empty
    if (selectedContainer.children.length === 0) {
      selectedContainer.innerHTML = '<div class="no-selections">No attractions selected yet</div>';
    }
  }

  // Select/Deselect all attractions
  selectAllAttractions() {
    const availableCards = document.querySelectorAll('#availableAttractionsList .attraction-card:not(.disabled):not(.selected-in-session)');
    availableCards.forEach(card => this.addSelectedAttraction(card));
  }

  // Save itinerary form
  async saveItineraryForm() {
    const form = document.getElementById('itineraryForm');
    const saveButton = form.closest('.modal').querySelector('.btn-primary');
    const isEditing = saveButton.dataset.editing === 'true';
    const itineraryId = saveButton.dataset.itineraryId;
    
    const date = document.getElementById('itineraryDate').value;
    const place = document.getElementById('itineraryPlace').value;
    const accommodation = document.getElementById('itineraryAccommodation').value;
    const notes = document.getElementById('itineraryNotes').value;
    
    if (!date || !place) {
      alert('Please select both date and place');
      return;
    }

    // Get selected attractions (both existing and custom)
    const allSelectedItems = Array.from(document.querySelectorAll('#unifiedSelectedContainer .selected-item'));
    const selectedAttractions = allSelectedItems
      .filter(item => item.dataset.attractionType === 'existing')
      .map(item => item.dataset.attractionName);
    
    const customAttractions = allSelectedItems
      .filter(item => item.dataset.attractionType === 'custom')
      .map(item => item.dataset.attractionName);

    const itineraryData = {
      date,
      place,
      attractions: selectedAttractions,
      customAttractions,
      accommodation: accommodation || null,
      notes: notes.trim() || ''
    };

    try {
      let result;
      if (isEditing) {
        result = this.tripManager.updateDailyItinerary(this.currentTripId, itineraryId, itineraryData);
        if (result) {
          this.closeItineraryModal();
          this.refreshItineraryList();
          this.showNotification(`Daily itinerary updated for ${place}!`, 'success');
        } else {
          throw new Error('Failed to update itinerary');
        }
      } else {
        result = this.tripManager.addDailyItinerary(this.currentTripId, itineraryData);
        if (result) {
          this.closeItineraryModal();
          this.refreshItineraryList();
          this.showNotification(`Daily itinerary added for ${place}!`, 'success');
        } else {
          throw new Error('Failed to add itinerary');
        }
      }
    } catch (error) {
      console.error('Error saving itinerary:', error);
      alert('Error saving itinerary. Please try again.');
    }
  }

  // Close itinerary modal
  closeItineraryModal() {
    const modal = document.getElementById('itineraryModal');
    if (modal) {
      modal.remove();
    }
  }

  // Refresh itinerary list
  refreshItineraryList() {
    const trip = this.getCurrentTrip();
    if (trip) {
      const itineraryList = document.getElementById('itinerary-list');
      if (itineraryList) {
        itineraryList.innerHTML = this.renderItineraryList(trip.itinerary || []);
      }
    }
  }

  // Edit itinerary item
  editItineraryItem(itineraryId) {
    const trip = this.getCurrentTrip();
    if (!trip) return;
    
    const itinerary = trip.itinerary.find(item => item.id === itineraryId);
    if (!itinerary) return;
    
    // Show the itinerary modal with pre-filled data
    this.showItineraryModal(itinerary);
  }

  // ===== ACCOMMODATION FUNCTIONS =====

  // Render accommodation list
  renderAccommodationList() {
    const trip = this.getCurrentTrip();
    if (!trip) return this.renderEmptyAccommodations();

    const accommodations = this.tripManager.getAccommodations(this.currentTripId);
    if (!accommodations || accommodations.length === 0) {
      return this.renderEmptyAccommodations();
    }

    return `
      <div class="accommodation-list">
        ${accommodations.map(accommodation => this.renderAccommodationCard(accommodation)).join('')}
      </div>
    `;
  }

  // Render empty accommodations state
  renderEmptyAccommodations() {
    return `
      <div class="empty-accommodations">
        <div class="icon">🏨</div>
        <h4>No accommodations added yet</h4>
        <p>Add hotels, resorts, or other accommodations for your trip</p>
        <button class="btn-add-accommodation" onclick="openAccommodationModal()">
          <span>+</span> Add Your First Accommodation
        </button>
      </div>
    `;
  }

  // Render accommodation card
  renderAccommodationCard(accommodation) {
    const checkInDate = new Date(accommodation.checkIn).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
    const checkOutDate = new Date(accommodation.checkOut).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short', 
      day: 'numeric'
    });

    const isHotel = accommodation.type === 'hotel' && accommodation.hotelData;
    const isCustom = accommodation.type === 'custom' && accommodation.customDetails;

    return `
      <div class="accommodation-card">
        <div class="accommodation-header">
          <h4>${accommodation.name}</h4>
          <span class="accommodation-type">${isHotel ? 'Hotel' : 'Custom'}</span>
        </div>
        
        <div class="accommodation-details">
          ${isHotel ? `
            <p><strong>Location:</strong> ${accommodation.hotelData.area}, ${accommodation.location.city}</p>
            <div class="hotel-rating">
              <span class="rating-stars">${'★'.repeat(Math.floor(accommodation.hotelData.rating))}</span>
              <span class="rating-text">${accommodation.hotelData.rating}/5</span>
            </div>
            <p><strong>Category:</strong> ${accommodation.hotelData.category}</p>
          ` : ''}
          
          ${isCustom ? `
            <p><strong>Location:</strong> ${accommodation.location.city}, ${accommodation.location.state}</p>
            <p><strong>Category:</strong> ${accommodation.customDetails.category}</p>
            ${accommodation.customDetails.address ? `<p><strong>Address:</strong> ${accommodation.customDetails.address}</p>` : ''}
          ` : ''}
          
          ${accommodation.notes ? `<p><strong>Notes:</strong> ${accommodation.notes}</p>` : ''}
        </div>

        <div class="accommodation-dates">
          <strong>Stay Duration:</strong> ${checkInDate} → ${checkOutDate}
        </div>

        <div class="accommodation-actions">
          <button class="btn-secondary" onclick="editAccommodation(${accommodation.id})">
            ✏️ Edit
          </button>
          <button class="btn-secondary" onclick="removeAccommodation(${accommodation.id})">
            🗑️ Remove
          </button>
        </div>
      </div>
    `;
  }

  // Refresh accommodation list
  refreshAccommodationList() {
    const container = document.getElementById('accommodationContainer');
    if (container) {
      container.innerHTML = this.renderAccommodationList();
    }
  }

  // Delete itinerary item
  deleteItineraryItem(itineraryId) {
    const trip = this.getCurrentTrip();
    if (!trip) return;
    
    const itinerary = trip.itinerary.find(item => item.id === itineraryId);
    if (!itinerary) return;
    
    const date = new Date(itinerary.date).toLocaleDateString();
    
    if (confirm(`Are you sure you want to delete the itinerary for ${date} in ${itinerary.place}?`)) {
      if (this.tripManager.deleteDailyItinerary(this.currentTripId, itineraryId)) {
        this.refreshItineraryList();
        this.showNotification('Day plan deleted!', 'success');
      }
    }
  }

  // Get current trip data
  getCurrentTrip() {
    if (this.currentTripId) {
      return this.tripManager.getTrip(this.currentTripId);
    }
    return null;
  }
}

// ===== GLOBAL ACCOMMODATION MODAL FUNCTIONS =====

// Open accommodation modal
function openAccommodationModal(accommodationId = null) {
  const modal = document.getElementById('accommodationModal');
  if (!modal) return;
  
  // Reset form
  document.getElementById('accommodationForm').reset();
  
  // Reset global states
  selectedHotelData = null;
  confirmedHotelData = null;
  
  // Set modal title
  const title = document.getElementById('accommodationModalTitle');
  title.textContent = accommodationId ? 'Edit Accommodation' : 'Add Accommodation';
  
  // Populate location dropdown with trip places
  populateAccommodationLocations();
  
  // Set date restrictions based on trip dates
  setAccommodationDateRestrictions();
  
  // Reset hotel search interface
  resetHotelSearch();
  
  // If editing, populate form with existing data
  if (accommodationId && window.tripUI) {
    populateAccommodationForm(accommodationId);
  }
  
  modal.classList.remove('hidden');
}

// Close accommodation modal
function closeAccommodationModal() {
  const modal = document.getElementById('accommodationModal');
  if (modal) {
    modal.classList.add('hidden');
  }
}

// Populate location dropdown
function populateAccommodationLocations() {
  if (!window.tripUI) return;
  
  const trip = window.tripUI.getCurrentTrip();
  if (!trip) return;
  
  const locationSelect = document.getElementById('accommodationLocation');
  locationSelect.innerHTML = '<option value="">Select location...</option>';
  
  // Add trip places to dropdown
  trip.places.forEach(place => {
    const option = document.createElement('option');
    option.value = JSON.stringify({ city: place.city, state: place.state });
    option.textContent = `${place.city}, ${place.state}`;
    locationSelect.appendChild(option);
  });
}

// Set date restrictions based on trip dates
function setAccommodationDateRestrictions() {
  if (!window.tripUI) return;
  
  const trip = window.tripUI.getCurrentTrip();
  if (!trip) return;
  
  const checkInInput = document.getElementById('accommodationCheckIn');
  const checkOutInput = document.getElementById('accommodationCheckOut');
  
  checkInInput.min = trip.startDate;
  checkInInput.max = trip.endDate;
  checkOutInput.min = trip.startDate;
  checkOutInput.max = trip.endDate;
}

// Handle accommodation modal events
document.addEventListener('DOMContentLoaded', function() {
  const searchInput = document.getElementById('hotelSearchInput');
  const fetchBtn = document.getElementById('fetchHotelDetailsBtn');
  
  if (fetchBtn && searchInput) {
    fetchBtn.addEventListener('click', function() {
      performHotelFetch();
    });
    
    searchInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        performHotelFetch();
      }
    });
  }
  
  // Handle confirmation buttons
  const confirmBtn = document.getElementById('confirmHotelBtn');
  const changeBtn = document.getElementById('changeHotelBtn');
  const editBtn = document.getElementById('editHotelBtn');
  
  if (confirmBtn) {
    confirmBtn.addEventListener('click', function() {
      confirmHotelSelection();
    });
  }
  
  if (changeBtn) {
    changeBtn.addEventListener('click', function() {
      backToSearch();
    });
  }
  
  if (editBtn) {
    editBtn.addEventListener('click', function() {
      editHotelSelection();
    });
  }
  
  // Handle check-in date change to set minimum check-out date
  const checkInInput = document.getElementById('accommodationCheckIn');
  const checkOutInput = document.getElementById('accommodationCheckOut');
  
  if (checkInInput && checkOutInput) {
    checkInInput.addEventListener('change', function() {
      const checkInDate = new Date(this.value);
      checkInDate.setDate(checkInDate.getDate() + 1); // Minimum 1 night stay
      checkOutInput.min = checkInDate.toISOString().split('T')[0];
      
      // Clear check-out if it's before new minimum
      if (checkOutInput.value && new Date(checkOutInput.value) <= new Date(this.value)) {
        checkOutInput.value = '';
      }
    });
  }
});

// Global state for selected hotel
let selectedHotelData = null;
let confirmedHotelData = null;

// Perform hotel fetch based on location and name
async function performHotelFetch() {
  const searchInput = document.getElementById('hotelSearchInput');
  const locationSelect = document.getElementById('accommodationLocation');
  const query = searchInput.value.trim();
  const locationValue = locationSelect.value;
  
  if (!query || query.length < 2) {
    showSearchError('Please enter at least 2 characters for hotel name');
    return;
  }
  
  if (!locationValue) {
    showSearchError('Please select a location first');
    return;
  }
  
  // Show loading state
  showFetchLoading();
  
  // Parse location
  const location = JSON.parse(locationValue);
  
  try {
    // Only use web search - no internal database fallback
    let searchResult;
    
    if (window.webHotelSearchService) {
      // Try web search only
      searchResult = await window.webHotelSearchService.searchHotelDetails(query, location);
    } else {
      throw new Error('Web hotel search service not available');
    }
    
    displayEnhancedFetchResults(searchResult, query, location);
    
  } catch (error) {
    console.error('Hotel search error:', error);
    showSearchError('Error searching for hotels online. Please try again or enter details manually.');
    showManualEntryOption(query, location);
  }
}

// Show fetch loading state
function showFetchLoading() {
  const resultsContainer = document.getElementById('hotelSearchResults');
  const resultsList = document.getElementById('hotelResultsList');
  const manualSection = document.getElementById('manualEntrySection');
  
  // Hide manual entry section
  manualSection.classList.add('hidden');
  
  resultsList.innerHTML = `
    <div class="search-loading">
      <div style="text-align: center; padding: 20px; color: #666;">
        🔍 Searching hotels online...
        <div style="margin-top: 8px; font-size: 0.875rem;">
          This may take a few seconds
        </div>
      </div>
    </div>
  `;
  
  resultsContainer.classList.remove('hidden');
}

// Display enhanced fetch results with web search capability
function displayEnhancedFetchResults(searchResult, query, location) {
  const resultsContainer = document.getElementById('hotelSearchResults');
  const resultsList = document.getElementById('hotelResultsList');
  
  if (!searchResult.success) {
    // No results found - show message and manual entry option
    resultsList.innerHTML = `
      <div class="search-info-message">
        🔍 No hotels found online for "${query}" in ${location.city}, ${location.state}.
        <div style="margin-top: 8px; font-size: 0.875rem;">
          This could mean the hotel doesn't have an online presence or the name doesn't match exactly.
        </div>
      </div>
    `;
    
    showManualEntryOption(query, location);
    
  } else if (searchResult.results.length === 1) {
    // Auto-select if only one result
    const hotel = searchResult.results[0];
    selectHotelFromResults(encodeURIComponent(JSON.stringify(hotel)));
    
    // Show success message
    resultsList.innerHTML = `
      <div class="search-success-message">
        ✅ Found "${hotel.name}" online! Hotel details have been loaded automatically.
        <div style="margin-top: 4px; font-size: 0.8rem;">Source: Internet Search</div>
      </div>
    `;
    
    setTimeout(() => {
      resultsContainer.classList.add('hidden');
    }, 2000);
    
  } else {
    // Multiple results - let user choose
    resultsList.innerHTML = `
      <div class="search-success-message">
        Found ${searchResult.results.length} hotels online matching "${query}" in ${location.city}. Please select the correct hotel:
      </div>
      ${searchResult.results.map(hotel => `
        <div class="hotel-result-item" onclick="selectHotelFromResults('${encodeURIComponent(JSON.stringify(hotel))}')">
          <div class="hotel-result-name">${hotel.name}</div>
          <div class="hotel-result-details">
            ${hotel.address}
            <span style="color: #059669; font-weight: 500;"> ✓ Found Online</span>
          </div>
          <div class="hotel-result-rating">
            <span class="rating-stars">${'★'.repeat(Math.floor(hotel.rating))}</span>
            <span>${hotel.rating}/5</span>
            <span style="margin-left: 10px; font-weight: 500;">${hotel.category}</span>
            ${hotel.priceRange ? `<span style="margin-left: 10px; color: #059669;">₹${hotel.priceRange.min}-${hotel.priceRange.max}/night</span>` : ''}
          </div>
        </div>
      `).join('')}
      <div class="manual-entry-option">
        <p style="margin: 0; color: #666; font-size: 0.875rem;">
          Don't see the right hotel? 
        </p>
        <button type="button" onclick="showManualEntryForm('${query}', '${encodeURIComponent(JSON.stringify(location))}')" class="btn-secondary">
          📝 Add Hotel Details Manually
        </button>
      </div>
    `;
  }
  
  resultsContainer.classList.remove('hidden');
}

// Show manual entry option when no hotels found
function showManualEntryOption(query, location) {
  const resultsContainer = document.getElementById('hotelSearchResults');
  const resultsList = document.getElementById('hotelResultsList');
  
  resultsList.innerHTML += `
    <div class="manual-entry-option">
      <p style="margin: 0 0 8px 0; color: #666; font-size: 0.875rem;">
        🏨 Hotel not found online? No problem!
      </p>
      <p style="margin: 0 0 12px 0; color: #666; font-size: 0.8rem;">
        You can add the hotel details manually and we'll save them for your trip.
      </p>
      <button type="button" onclick="showManualEntryForm('${query}', '${encodeURIComponent(JSON.stringify(location))}')" class="btn-primary">
        📝 Add Hotel Details Manually
      </button>
    </div>
  `;
}

// Show manual entry form
function showManualEntryForm(hotelName, encodedLocation) {
  const manualSection = document.getElementById('manualEntrySection');
  const resultsContainer = document.getElementById('hotelSearchResults');
  const location = JSON.parse(decodeURIComponent(encodedLocation));
  
  // Pre-fill hotel name
  document.getElementById('manualHotelName').value = hotelName || '';
  
  // Pre-fill location in address if available
  const addressField = document.getElementById('manualHotelAddress');
  if (location.city && location.state) {
    addressField.placeholder = `Enter address in ${location.city}, ${location.state}`;
  }
  
  // Clear other fields
  document.getElementById('manualHotelCategory').value = '';
  document.getElementById('manualHotelAddress').value = '';
  document.getElementById('manualHotelPhone').value = '';
  document.getElementById('manualHotelEmail').value = '';
  document.getElementById('manualHotelWebsite').value = '';
  document.getElementById('manualHotelNotes').value = '';
  
  // Hide search results and show manual form
  resultsContainer.classList.add('hidden');
  manualSection.classList.remove('hidden');
  
  // Set up event handlers
  setupManualEntryHandlers(location);
}

// Set up manual entry event handlers
function setupManualEntryHandlers(location) {
  const confirmBtn = document.getElementById('confirmManualHotelBtn');
  const cancelBtn = document.getElementById('cancelManualEntryBtn');
  
  // Remove existing listeners
  confirmBtn.replaceWith(confirmBtn.cloneNode(true));
  cancelBtn.replaceWith(cancelBtn.cloneNode(true));
  
  // Add new listeners
  document.getElementById('confirmManualHotelBtn').addEventListener('click', () => {
    confirmManualHotelEntry(location);
  });
  
  document.getElementById('cancelManualEntryBtn').addEventListener('click', () => {
    hideManualEntryForm();
  });
}

// Confirm manual hotel entry
function confirmManualHotelEntry(location) {
  const hotelName = document.getElementById('manualHotelName').value.trim();
  const category = document.getElementById('manualHotelCategory').value;
  const address = document.getElementById('manualHotelAddress').value.trim();
  const phone = document.getElementById('manualHotelPhone').value.trim();
  const email = document.getElementById('manualHotelEmail').value.trim();
  const website = document.getElementById('manualHotelWebsite').value.trim();
  const notes = document.getElementById('manualHotelNotes').value.trim();
  
  if (!hotelName) {
    alert('Please enter the hotel name');
    return;
  }
  
  // Create hotel object from manual entry
  const manualHotel = {
    id: 'manual_' + Date.now(),
    name: hotelName,
    city: location.city,
    state: location.state,
    source: 'manual_entry',
    category: category || 'Mid-Range',
    rating: 'N/A',
    address: address || `${location.city}, ${location.state}`,
    phone: phone || 'Not provided',
    email: email || 'Not provided',
    website: website || 'Not provided',
    notes: notes || '',
    amenities: ['Manual Entry - Amenities not specified'],
    description: `Manually added hotel in ${location.city}`,
    lastUpdated: new Date().toISOString(),
    dataConfidence: 'manual'
  };
  
  // Process the manual hotel entry
  selectHotelFromResults(encodeURIComponent(JSON.stringify(manualHotel)));
  
  // Hide manual entry form
  hideManualEntryForm();
  
  // Show confirmation
  showManualEntryConfirmation(hotelName);
}

// Hide manual entry form
function hideManualEntryForm() {
  const manualSection = document.getElementById('manualEntrySection');
  manualSection.classList.add('hidden');
}

// Show confirmation for manual entry
function showManualEntryConfirmation(hotelName) {
  const resultsContainer = document.getElementById('hotelSearchResults');
  const resultsList = document.getElementById('hotelResultsList');
  
  resultsList.innerHTML = `
    <div class="search-success-message">
      ✅ Hotel "${hotelName}" has been added manually! Details have been saved.
      <div style="margin-top: 4px; font-size: 0.8rem;">You can edit these details anytime in your trip.</div>
    </div>
  `;
  
  resultsContainer.classList.remove('hidden');
  
  setTimeout(() => {
    resultsContainer.classList.add('hidden');
  }, 3000);
}

// Display fetch results
function displayFetchResults(results, query, location) {
  const resultsContainer = document.getElementById('hotelSearchResults');
  const resultsList = document.getElementById('hotelResultsList');
  
  if (results.length === 0) {
    resultsList.innerHTML = `
      <div class="no-results-message">
        No hotels found for "${query}" in ${location.city}. Try a different hotel name or check spelling.
      </div>
    `;
  } else if (results.length === 1) {
    // Auto-select if only one result
    selectHotelFromResults(encodeURIComponent(JSON.stringify(results[0])));
    resultsContainer.classList.add('hidden');
  } else {
    resultsList.innerHTML = `
      <p style="margin-bottom: 15px; color: #666; font-size: 0.9rem;">
        Found ${results.length} matches for "${query}". Please select the correct hotel:
      </p>
      ${results.map(hotel => `
        <div class="hotel-result-item" onclick="selectHotelFromResults('${encodeURIComponent(JSON.stringify(hotel))}')">
          <div class="hotel-result-name">${hotel.name}</div>
          <div class="hotel-result-details">
            ${hotel.address}
            ${hotel.isFromOtherCity ? `<span style="color: #e53e3e; font-weight: 500;"> (Different City: ${hotel.city})</span>` : ''}
          </div>
          <div class="hotel-result-rating">
            <span class="rating-stars">${'★'.repeat(Math.floor(hotel.rating))}</span>
            <span>${hotel.rating}/5</span>
            <span style="margin-left: 10px; font-weight: 500;">${hotel.category}</span>
          </div>
        </div>
      `).join('')}
    `;
  }
  
  resultsContainer.classList.remove('hidden');
}

// Select hotel from search results
function selectHotelFromResults(encodedHotelData) {
  const hotel = JSON.parse(decodeURIComponent(encodedHotelData));
  selectedHotelData = hotel;
  
  // Highlight selected item (only if called from search results)
  const resultItems = document.querySelectorAll('.hotel-result-item');
  if (resultItems.length > 0) {
    resultItems.forEach(item => {
      item.classList.remove('selected');
    });
    
    // Simple highlighting based on hotel name
    resultItems.forEach(item => {
      const itemName = item.querySelector('.hotel-result-name')?.textContent;
      if (itemName === hotel.name) {
        item.classList.add('selected');
      }
    });
  }
  
  // Show hotel details for confirmation
  showHotelDetailsForConfirmation(hotel);
}

// Show hotel details for confirmation
function showHotelDetailsForConfirmation(hotel) {
  // Update hotel name (with safety check)
  const nameElement = document.getElementById('selectedHotelName');
  if (nameElement) nameElement.textContent = hotel.name;
  
  // Handle different data sources and formats
  const locationText = hotel.address || (hotel.area ? `${hotel.area}, ${hotel.city}` : `${hotel.city}, ${hotel.state || ''}`);
  const locationElement = document.getElementById('selectedHotelLocation');
  if (locationElement) locationElement.textContent = locationText;
  
  // Handle rating display (could be number or 'N/A' for manual entries)
  const ratingElement = document.getElementById('selectedHotelRating');
  const ratingTextElement = document.getElementById('selectedHotelRatingText');
  
  if (hotel.rating && hotel.rating !== 'N/A') {
    if (ratingElement) ratingElement.textContent = '★'.repeat(Math.floor(hotel.rating));
    if (ratingTextElement) ratingTextElement.textContent = `${hotel.rating}/5`;
  } else {
    if (ratingElement) ratingElement.textContent = '';
    if (ratingTextElement) ratingTextElement.textContent = hotel.rating === 'N/A' ? 'Rating: Not available' : 'Rating: Not specified';
  }
  
  const categoryElement = document.getElementById('selectedHotelCategory');
  if (categoryElement) categoryElement.textContent = hotel.category || 'Category not specified';
  
  // Show enhanced additional details
  const additionalDetails = document.getElementById('selectedHotelDetails');
  let detailsHtml = '';
  
  // Data source indicator
  if (hotel.source) {
    const sourceLabels = {
      'web_search': '🌐 Found Online',
      'internal': '💾 From Database',
      'manual_entry': '✏️ Manually Added'
    };
    const sourceLabel = sourceLabels[hotel.source] || hotel.source;
    detailsHtml += `<p style="color: #059669; font-weight: 500; margin-bottom: 12px;"><strong>Source:</strong> ${sourceLabel}</p>`;
  }
  
  if (hotel.address) {
    detailsHtml += `<p><strong>Address:</strong> ${hotel.address}</p>`;
  }
  
  if (hotel.phone && hotel.phone !== 'Not provided') {
    detailsHtml += `<p><strong>Phone:</strong> ${hotel.phone}</p>`;
  }
  
  if (hotel.email && hotel.email !== 'Not provided') {
    detailsHtml += `<p><strong>Email:</strong> ${hotel.email}</p>`;
  }
  
  if (hotel.website && hotel.website !== 'Not provided') {
    detailsHtml += `<p><strong>Website:</strong> <a href="${hotel.website.startsWith('http') ? hotel.website : 'https://' + hotel.website}" target="_blank">${hotel.website}</a></p>`;
  }
  
  // Price range for web search results
  if (hotel.priceRange) {
    detailsHtml += `<p><strong>Price Range:</strong> ₹${hotel.priceRange.min} - ₹${hotel.priceRange.max} ${hotel.priceRange.period}</p>`;
  }
  
  if (hotel.description) {
    detailsHtml += `<p><strong>Description:</strong> ${hotel.description}</p>`;
  }
  
  if (hotel.amenities && hotel.amenities.length > 0) {
    const amenitiesText = hotel.amenities.slice(0, 8).join(', ') + (hotel.amenities.length > 8 ? '...' : '');
    detailsHtml += `<p><strong>Amenities:</strong> ${amenitiesText}</p>`;
  }
  
  if (hotel.notes) {
    detailsHtml += `<p><strong>Notes:</strong> ${hotel.notes}</p>`;
  }
  
  const additionalDetailsElement = document.getElementById('selectedHotelDetails');
  if (additionalDetailsElement) additionalDetailsElement.innerHTML = detailsHtml;
  
  const detailsDiv = document.getElementById('hotelDetails');
  if (detailsDiv) detailsDiv.classList.remove('hidden');
  
  // Hide confirmed hotel display if visible
  const confirmedDisplay = document.getElementById('confirmedHotelDisplay');
  if (confirmedDisplay) confirmedDisplay.classList.add('hidden');
}

// Confirm hotel selection
function confirmHotelSelection() {
  if (!selectedHotelData) return;
  
  confirmedHotelData = selectedHotelData;
  
  // Update confirmed hotel display
  const confirmedNameElement = document.getElementById('confirmedHotelName');
  if (confirmedNameElement) confirmedNameElement.textContent = confirmedHotelData.name;
  
  // Create enhanced confirmed details text
  let confirmedDetailsText = '';
  if (confirmedHotelData.address) {
    confirmedDetailsText = confirmedHotelData.address;
  } else if (confirmedHotelData.area) {
    confirmedDetailsText = `${confirmedHotelData.area}, ${confirmedHotelData.city}`;
  } else {
    confirmedDetailsText = `${confirmedHotelData.city}, ${confirmedHotelData.state || ''}`;
  }
  
  // Add rating and category
  if (confirmedHotelData.rating && confirmedHotelData.rating !== 'N/A') {
    confirmedDetailsText += ` • ${confirmedHotelData.rating}/5 ⭐`;
  }
  confirmedDetailsText += ` • ${confirmedHotelData.category}`;
  
  // Add source indicator
  if (confirmedHotelData.source === 'manual_entry') {
    confirmedDetailsText += ' • Manually Added';
  } else if (confirmedHotelData.source === 'web_search') {
    confirmedDetailsText += ' • Found Online';
  }
  
  const confirmedDetailsElement = document.getElementById('confirmedHotelDetails');
  if (confirmedDetailsElement) confirmedDetailsElement.textContent = confirmedDetailsText;
  
  // Show confirmed state and hide others
  const confirmedDisplay = document.getElementById('confirmedHotelDisplay');
  const hotelDetails = document.getElementById('hotelDetails');
  const searchResults = document.getElementById('hotelSearchResults');
  
  if (confirmedDisplay) confirmedDisplay.classList.remove('hidden');
  if (hotelDetails) hotelDetails.classList.add('hidden');
  if (searchResults) searchResults.classList.add('hidden');
  
  // Disable search input and button (with safety checks)
  const hotelSearchInput = document.getElementById('hotelSearchInput');
  const fetchHotelBtn = document.getElementById('fetchHotelDetailsBtn');
  
  if (hotelSearchInput) hotelSearchInput.disabled = true;
  if (fetchHotelBtn) fetchHotelBtn.disabled = true;
}

// Edit hotel selection (back to search)
function editHotelSelection() {
  backToSearch();
}

// Back to search state
function backToSearch() {
  // Reset states
  selectedHotelData = null;
  confirmedHotelData = null;
  
  // Show search interface (with safety checks)
  const hotelSearchInput = document.getElementById('hotelSearchInput');
  const fetchHotelBtn = document.getElementById('fetchHotelDetailsBtn');
  
  if (hotelSearchInput) {
    hotelSearchInput.disabled = false;
    hotelSearchInput.focus();
  }
  if (fetchHotelBtn) fetchHotelBtn.disabled = false;
  
  // Hide confirmation states (with safety checks)
  const hotelDetails = document.getElementById('hotelDetails');
  const confirmedDisplay = document.getElementById('confirmedHotelDisplay');
  
  if (hotelDetails) hotelDetails.classList.add('hidden');
  if (confirmedDisplay) confirmedDisplay.classList.add('hidden');
  
  // Clear search results
  hideSearchResults();
}

// Reset hotel search state
function resetHotelSearch() {
  selectedHotelData = null;
  confirmedHotelData = null;
  
  // Reset form elements
  document.getElementById('hotelSearchInput').value = '';
  document.getElementById('hotelSearchInput').disabled = false;
  document.getElementById('fetchHotelDetailsBtn').disabled = false;
  
  // Hide all hotel-related sections
  hideSearchResults();
  hideHotelDetails();
  document.getElementById('confirmedHotelDisplay').classList.add('hidden');
}

// Hide search results
function hideSearchResults() {
  document.getElementById('hotelSearchResults').classList.add('hidden');
}

// Hide hotel details
function hideHotelDetails() {
  document.getElementById('hotelDetails').classList.add('hidden');
}

// Show search error
function showSearchError(message) {
  const resultsContainer = document.getElementById('hotelSearchResults');
  const resultsList = document.getElementById('hotelResultsList');
  
  resultsList.innerHTML = `
    <div class="search-error" style="color: #e53e3e; text-align: center; padding: 15px;">
      ⚠️ ${message}
    </div>
  `;
  
  resultsContainer.classList.remove('hidden');
}

// Handle accommodation form submission
document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('accommodationForm');
  if (form) {
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      saveAccommodation();
    });
  }
});

// Save accommodation
function saveAccommodation() {
  if (!window.tripUI) return;
  
  const locationValue = document.getElementById('accommodationLocation').value;
  const checkIn = document.getElementById('accommodationCheckIn').value;
  const checkOut = document.getElementById('accommodationCheckOut').value;
  const notes = document.getElementById('accommodationNotes').value;
  
  if (!locationValue || !checkIn || !checkOut) {
    alert('Please fill in all required fields');
    return;
  }
  
  if (!confirmedHotelData) {
    alert('Please fetch and confirm hotel details');
    return;
  }
  
  const location = JSON.parse(locationValue);
  
  let accommodationData = {
    type: 'hotel',
    location: location,
    checkIn: checkIn,
    checkOut: checkOut,
    notes: notes,
    name: confirmedHotelData.name,
    hotelData: confirmedHotelData
  };
  
  const result = window.tripUI.tripManager.addAccommodation(window.tripUI.currentTripId, accommodationData);
  
  if (result) {
    closeAccommodationModal();
    window.tripUI.refreshAccommodationList();
    window.tripUI.refreshItineraryList(); // Refresh itinerary to show accommodation updates
    alert('Accommodation added successfully!');
  } else {
    alert('Failed to add accommodation. Please try again.');
  }
}

// Edit accommodation
function editAccommodation(accommodationId) {
  openAccommodationModal(accommodationId);
}

// Remove accommodation
function removeAccommodation(accommodationId) {
  if (!window.tripUI) return;
  
  if (confirm('Are you sure you want to remove this accommodation?')) {
    const result = window.tripUI.tripManager.removeAccommodation(window.tripUI.currentTripId, accommodationId);
    
    if (result) {
      window.tripUI.refreshAccommodationList();
      window.tripUI.refreshItineraryList(); // Refresh itinerary to remove accommodation updates
      alert('Accommodation removed successfully!');
    } else {
      alert('Failed to remove accommodation. Please try again.');
    }
  }
}

// Populate form for editing
function populateAccommodationForm(accommodationId) {
  const trip = window.tripUI.getCurrentTrip();
  if (!trip) return;
  
  const accommodations = window.tripUI.tripManager.getAccommodations(window.tripUI.currentTripId);
  const accommodation = accommodations.find(acc => acc.id === accommodationId);
  
  if (!accommodation) return;
  
  // Set location
  document.getElementById('accommodationLocation').value = JSON.stringify(accommodation.location);
  
  // Set dates
  document.getElementById('accommodationCheckIn').value = accommodation.checkIn;
  document.getElementById('accommodationCheckOut').value = accommodation.checkOut;
  
  // Set notes
  document.getElementById('accommodationNotes').value = accommodation.notes || '';
  
  // Set hotel details if available
  if (accommodation.hotelData) {
    // Set the search input with hotel name
    document.getElementById('hotelSearchInput').value = accommodation.hotelData.name;
    
    // Set the confirmed hotel data
    confirmedHotelData = accommodation.hotelData;
    selectedHotelData = accommodation.hotelData;
    
    // Show confirmed hotel state
    setTimeout(() => {
      document.getElementById('confirmedHotelName').textContent = accommodation.hotelData.name;
      
      let detailsText = `${accommodation.hotelData.area}, ${accommodation.hotelData.city} • ${accommodation.hotelData.rating}/5 ⭐ • ${accommodation.hotelData.category}`;
      if (accommodation.hotelData.address) {
        detailsText += `\n${accommodation.hotelData.address}`;
      }
      
      document.getElementById('confirmedHotelDetails').textContent = detailsText;
      
      document.getElementById('confirmedHotelDisplay').classList.remove('hidden');
      document.getElementById('hotelSearchInput').disabled = true;
      document.getElementById('fetchHotelDetailsBtn').disabled = true;
    }, 100);
  }
}

// Initialize trip UI when DOM is loaded or when needed
document.addEventListener('DOMContentLoaded', () => {
  // Don't auto-initialize, let the app handle it
  console.log('TripUI module loaded');
});

// Export for global access
window.TripUI = TripUI;

// Function to initialize TripUI when needed
window.initializeTripUI = function() {
  if (!window.tripUI && document.getElementById('trip-list')) {
    console.log('Initializing TripUI...');
    try {
      window.tripUI = new TripUI();
      console.log('TripUI initialized successfully');
    } catch (error) {
      console.error('Error initializing TripUI:', error);
    }
  } else if (!document.getElementById('trip-list')) {
    console.warn('TripUI: trip-list element not found');
  }
};

// Also try to initialize if the element is already present and page is loaded
if (document.readyState === 'complete') {
  setTimeout(() => {
    if (document.getElementById('trip-list') && !window.tripUI) {
      window.initializeTripUI();
    }
  }, 100);
}
