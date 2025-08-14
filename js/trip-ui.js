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
  }

  // Create main trip list view
  createTripListView() {
    const container = document.getElementById('trip-list');
    if (!container) return;

    container.innerHTML = `
      <div class="trip-container">
        <div class="trip-header">
          <h2 class="trip-title">My Trips</h2>
          <button class="btn-primary" id="create-trip-btn">
            ✈️ Create New Trip
          </button>
        </div>
        <div id="trips-content">
          ${this.renderTripsList()}
        </div>
      </div>
      ${this.createTripModal()}
    `;
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

  // Create trip modal
  createTripModal() {
    return `
      <div class="modal-overlay" id="trip-modal">
        <div class="modal">
          <div class="modal-header">
            <h3 class="modal-title" id="modal-title">Create New Trip</h3>
            <button class="modal-close" id="close-modal">×</button>
          </div>
          <form id="trip-form">
            <div class="form-group">
              <label class="form-label" for="trip-name">Trip Name *</label>
              <input type="text" id="trip-name" class="form-input" placeholder="e.g., Amazing India Tour" required>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label" for="start-date">Start Date *</label>
                <input type="date" id="start-date" class="form-input" required>
              </div>
              <div class="form-group">
                <label class="form-label" for="end-date">End Date *</label>
                <input type="date" id="end-date" class="form-input" required>
              </div>
            </div>
            <div class="form-actions">
              <button type="button" class="btn-secondary" id="cancel-trip">Cancel</button>
              <button type="submit" class="btn-primary" id="save-trip">Create Trip</button>
            </div>
          </form>
        </div>
      </div>
    `;
  }

  // Create trip detail view
  createTripDetailView(trip) {
    return `
      <div class="trip-detail">
        <div class="trip-detail-header">
          <button class="btn-secondary" onclick="tripUI.backToList()" style="margin-bottom: 1rem;">
            ← Back to Trips
          </button>
          <h1 class="trip-detail-name">${trip.name}</h1>
          <p class="trip-detail-dates">
            ${new Date(trip.startDate).toLocaleDateString()} - ${new Date(trip.endDate).toLocaleDateString()}
          </p>
        </div>
        
        <div class="trip-sections">
          <div class="trip-section">
            <div class="section-header">
              <h2 class="section-title">Places to Visit</h2>
              <button class="btn-primary" onclick="tripUI.showAddPlaceForm()">
                📍 Add Place
              </button>
            </div>
            <div id="add-place-section" style="display: none;">
              ${this.createAddPlaceForm()}
            </div>
            <div id="places-list">
              ${this.renderPlacesList(trip.places)}
            </div>
          </div>
        </div>
      </div>
    `;
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
          <button class="btn-danger" onclick="tripUI.removePlace(${place.id})">
            Remove
          </button>
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
            <span class="attraction-tag">${attraction}</span>
          `).join('')}
        </div>
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
      if (e.target.id === 'create-trip-btn') {
        this.showTripModal();
      } else if (e.target.id === 'close-modal' || e.target.id === 'cancel-trip') {
        this.hideTripModal();
      }
    });

    document.addEventListener('submit', (e) => {
      if (e.target.id === 'trip-form') {
        e.preventDefault();
        this.saveTripForm();
      }
    });

    document.addEventListener('change', (e) => {
      if (e.target.id === 'place-state') {
        this.updateCitiesDropdown(e.target.value);
      } else if (e.target.id === 'place-city') {
        this.updateAddPlaceButton();
      }
    });
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
      } else {
        this.tripManager.createTrip(tripData);
      }
      
      this.hideTripModal();
      this.refreshTripsList();
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

  // Remove place from trip
  removePlace(placeId) {
    if (confirm('Are you sure you want to remove this place from your trip?')) {
      this.tripManager.removePlaceFromTrip(this.currentTripId, placeId);
      this.refreshPlacesList();
    }
  }

  // View trip detail
  viewTripDetail(tripId) {
    const trip = this.tripManager.getTrip(tripId);
    if (!trip) return;

    this.currentTripId = tripId;
    this.currentView = 'detail';
    
    const container = document.getElementById('trip-list');
    container.innerHTML = this.createTripDetailView(trip);
  }

  // Back to trips list
  backToList() {
    this.currentView = 'list';
    this.currentTripId = null;
    this.createTripListView();
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
    }
  }

  // Refresh trips list
  refreshTripsList() {
    const content = document.getElementById('trips-content');
    if (content) {
      content.innerHTML = this.renderTripsList();
    }
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
}

// Initialize trip UI when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('trip-list')) {
    window.tripUI = new TripUI();
  }
});

// Export for global access
window.TripUI = TripUI;
