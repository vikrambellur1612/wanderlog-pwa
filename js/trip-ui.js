// Trip UI Component
// Version: 1.2.0

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
          <button class="trip-action-btn btn-secondary" onclick="event.stopPropagation(); tripUI.editTripFromHome(${trip.id})">
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
    
    // If no trips exist, redirect to home page for trip creation
    if (trips.length === 0) {
      this.redirectToHomeForTripCreation();
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
            <button class="btn-secondary" onclick="tripUI.backToHome()" style="margin-right: 0.5rem;">
              🏠 Back to Home
            </button>
            <button class="btn-secondary" onclick="tripUI.backToList()">
              ← Back to Trips List
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

          <!-- Detailed Day by Day Itinerary Section (Coming Soon) -->
          <div class="trip-section">
            <div class="section-header">
              <h2 class="section-title">📅 Detailed Day by Day Itinerary</h2>
              <p class="section-subtitle">Coming Soon - Plan your daily activities</p>
            </div>
            <div class="coming-soon-placeholder">
              <div class="coming-soon-icon">🚧</div>
              <h3>Feature Under Development</h3>
              <p>Soon you'll be able to create detailed daily itineraries with activities, timings, and notes.</p>
            </div>
          </div>

          <!-- Accommodation Section (Coming Soon) -->
          <div class="trip-section">
            <div class="section-header">
              <h2 class="section-title">🏨 Accommodation</h2>
              <p class="section-subtitle">Coming Soon - Manage your stay details</p>
            </div>
            <div class="coming-soon-placeholder">
              <div class="coming-soon-icon">🚧</div>
              <h3>Feature Under Development</h3>
              <p>Soon you'll be able to add and manage accommodation details for each destination.</p>
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
              <label class="form-label" for="custom-description">Description</label>
              <textarea id="custom-description" class="form-input" rows="3" placeholder="Brief description of the place..."></textarea>
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
            <button class="btn-secondary place-action-btn" onclick="tripUI.editPlace(${place.id})" title="Edit Place">
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

  // Save add trip form (new home page form)
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
      // Create the trip
      const newTrip = this.tripManager.createTrip(tripData);
      
      // Hide modal and refresh display
      this.hideAddTripModal();
      this.renderHomePageTrips();
      
      // Show success message
      this.showNotification('Trip created successfully! Now add destinations to your trip.', 'success');
      
    } catch (error) {
      console.error('Error creating trip:', error);
      alert('Error creating trip. Please try again.');
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
    const modal = document.getElementById('trip-modal');
    const modalTitle = document.getElementById('modal-title');
    const saveBtn = document.getElementById('save-trip');
    
    if (trip) {
      modalTitle.textContent = 'Edit Trip';
      saveBtn.textContent = 'Update Trip';
      this.fillTripForm(trip);
      this.currentTripId = trip.id;
    } else {
      modalTitle.textContent = 'Create New Trip';
      saveBtn.textContent = 'Create Trip';
      this.clearTripForm();
      this.currentTripId = null;
    }
    
    modal.classList.add('active');
  }

  // Hide trip modal
  hideTripModal() {
    const modal = document.getElementById('trip-modal');
    modal.classList.remove('active');
  }

  // Fill trip form with existing data
  fillTripForm(trip) {
    document.getElementById('trip-name').value = trip.name;
    document.getElementById('start-date').value = trip.startDate;
    document.getElementById('end-date').value = trip.endDate;
  }

  // Clear trip form
  clearTripForm() {
    document.getElementById('trip-form').reset();
  }

  // Save trip form
  async saveTripForm() {
    const tripData = {
      name: document.getElementById('trip-name').value,
      startDate: document.getElementById('start-date').value,
      endDate: document.getElementById('end-date').value
    };

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
        this.tripManager.updateTrip(this.currentTripId, tripData);
        this.showNotification('Trip updated successfully!', 'success');
      } else {
        this.tripManager.createTrip(tripData);
        this.showNotification('Trip created successfully!', 'success');
      }
      
      this.hideTripModal();
      this.refreshTripsList();
      // Also refresh home page trips
      this.renderHomePageTrips();
    } catch (error) {
      console.error('Error saving trip:', error);
      alert('Error saving trip. Please try again.');
    }
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
    const description = document.getElementById('custom-description').value.trim();
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
        description: description || `Custom destination in ${state}`,
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
    document.getElementById('custom-description').value = '';
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

  // Edit a specific place
  editPlace(placeId) {
    const trip = this.tripManager.getTrip(this.currentTripId);
    if (!trip) return;
    
    const place = trip.places.find(p => p.id === placeId);
    if (!place) return;

    const newName = prompt(`Edit place name:`, place.city);
    if (newName && newName.trim() !== '' && newName !== place.city) {
      try {
        // Update the place
        place.city = newName.trim();
        this.tripManager.updateTrip(this.currentTripId, trip);
        
        // Refresh the display
        this.refreshPlacesList();
        
        // Show success message
        this.showNotification(`Place updated to "${newName}"`, 'success');
      } catch (error) {
        console.error('Error updating place:', error);
        alert('Error updating place. Please try again.');
      }
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

  // Show banner when adding place to trip
  showAddToTripBanner() {
    const banner = document.getElementById('add-to-trip-info');
    if (banner) {
      banner.classList.remove('hidden');
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

  // Get current trip data
  getCurrentTrip() {
    if (this.currentTripId) {
      return this.tripManager.getTrip(this.currentTripId);
    }
    return null;
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
