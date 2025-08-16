// Global utility function for consistent date formatting (dd-mmm-yy)
window.formatDate = function(dateString) {
  const date = new Date(dateString);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  const day = date.getDate().toString().padStart(2, '0');
  const month = months[date.getMonth()];
  const year = date.getFullYear().toString().slice(-2);
  
  return `${day}-${month}-${year}`;
};

// WanderLog PWA - Main Application Logic
// Version: 1.7.0

class WanderLogApp {
  constructor() {
    this.currentView = 'home';
    this.places = this.loadPlaces();
    this.favorites = this.loadFavorites();
    this.isOnline = navigator.onLine;
    
    this.init();
  }

  async init() {
    console.log('Initializing WanderLog PWA v1.7.0');
    
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setupApp());
    } else {
      this.setupApp();
    }
  }

  setupApp() {
    this.setupEventListeners();
    this.handleUrlShortcuts();
    this.hideLoadingScreen();
    this.renderCurrentView();
    
    console.log('WanderLog app initialized successfully');
  }

  setupEventListeners() {
    // Navigation
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const view = item.getAttribute('data-view');
        this.navigateToView(view);
      });
    });

    // Action cards on home
    const tripsCard = document.getElementById('tripsCard');
    const exploreCard = document.getElementById('exploreCard');
    const logCard = document.getElementById('logCard');
    const favoritesCard = document.getElementById('favoritesCard');

    if (tripsCard) {
      tripsCard.addEventListener('click', () => this.navigateToView('trips'));
    }
    if (exploreCard) {
      exploreCard.addEventListener('click', () => this.navigateToView('explore'));
    }
    if (logCard) {
      logCard.addEventListener('click', () => this.navigateToView('log'));
    }
    if (favoritesCard) {
      favoritesCard.addEventListener('click', () => this.navigateToView('favorites'));
    }

    // Search functionality - removed as per requirements
    // const searchInput = document.getElementById('searchInput');
    // if (searchInput) {
    //   searchInput.addEventListener('input', (e) => {
    //     this.handleSearch(e.target.value);
    //   });
    // }

    // Log form submission
    const logForm = document.getElementById('logForm');
    if (logForm) {
      logForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleLogSubmission();
      });
    }

    // Menu button
    const menuBtn = document.getElementById('menuBtn');
    if (menuBtn) {
      menuBtn.addEventListener('click', () => this.toggleMenu());
    }
  }

  handleUrlShortcuts() {
    const urlParams = new URLSearchParams(window.location.search);
    const shortcut = urlParams.get('shortcut');
    
    if (shortcut && ['trips', 'explore', 'log', 'favorites'].includes(shortcut)) {
      this.navigateToView(shortcut);
    }
  }

  hideLoadingScreen() {
    const loadingScreen = document.getElementById('loadingScreen');
    const app = document.getElementById('app');
    
    if (loadingScreen && app) {
      setTimeout(() => {
        loadingScreen.classList.add('hidden');
        app.classList.remove('hidden');
      }, 1000); // Show loading for 1 second
    }
  }

  navigateToView(viewName) {
    // Update current view
    this.currentView = viewName;
    
    // Hide all views
    const views = document.querySelectorAll('.view');
    views.forEach(view => view.classList.remove('active'));
    
    // Show target view
    const targetView = document.getElementById(`${viewName}View`);
    if (targetView) {
      targetView.classList.add('active');
    }
    
    // Update navigation
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
      item.classList.remove('active');
      if (item.getAttribute('data-view') === viewName) {
        item.classList.add('active');
      }
    });
    
    // Render view content
    this.renderCurrentView();
    
    // Update URL without page reload
    const url = new URL(window.location);
    if (viewName !== 'home') {
      url.searchParams.set('view', viewName);
    } else {
      url.searchParams.delete('view');
    }
    window.history.pushState({}, '', url);
    
    console.log(`Navigated to view: ${viewName}`);
  }

  renderCurrentView() {
    switch (this.currentView) {
      case 'trips':
        this.renderTripsView();
        break;
      case 'explore':
        this.renderExploreView();
        break;
      case 'log':
        this.renderLogView();
        break;
      case 'favorites':
        this.renderFavoritesView();
        break;
      case 'home':
      default:
        this.renderHomeView();
        break;
    }
  }

  renderHomeView() {
    // Home view is mostly static, but we can add dynamic content here
    console.log('Rendering home view');
    
    // Load and display trips on home page
    this.loadHomePageTrips();
    
    // Set up Add Trip button
    const addTripBtn = document.getElementById('addTripBtn');
    if (addTripBtn) {
      addTripBtn.addEventListener('click', this.openAddTripModal.bind(this));
    }
    
    // Ensure TripUI is initialized for home page functionality
    setTimeout(() => {
      if (typeof window.initializeTripUI === 'function') {
        window.initializeTripUI();
      } else if (!window.tripUI && document.getElementById('trip-list')) {
        // Fallback initialization
        if (typeof window.TripUI === 'function') {
          window.tripUI = new window.TripUI();
          console.log('TripUI initialized for home page');
        }
      }
    }, 100);
  }

  // Load trips for home page display
  loadHomePageTrips() {
    // Use TripUI's rendering if available for consistency
    if (window.tripUI && window.tripUI.renderHomePageTrips) {
      window.tripUI.renderHomePageTrips();
      return;
    }
    
    // Fallback to local rendering if TripUI not available
    const upcomingTripsList = document.getElementById('upcomingTripsList');
    const completedTripsList = document.getElementById('completedTripsList');
    
    if (!upcomingTripsList || !completedTripsList) return;

    // Initialize TripManager if not already done or if it's corrupted
    if (!window.tripManager || typeof window.tripManager.getAllTrips !== 'function') {
      if (typeof TripManager === 'function') {
        window.tripManager = new TripManager();
        console.log('TripManager re-initialized in loadHomePageTrips');
      } else {
        console.error('TripManager class not available');
        return;
      }
    }

    const trips = window.tripManager ? window.tripManager.getAllTrips() : [];
    const upcomingTrips = trips.filter(trip => this.getTripStatus(trip) === 'Upcoming');
    const completedTrips = trips.filter(trip => this.getTripStatus(trip) === 'Completed');

    // Render upcoming trips
    if (upcomingTrips.length === 0) {
      upcomingTripsList.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">✈️</div>
          <h3>No upcoming trips</h3>
          <p>Start planning your next adventure!</p>
        </div>
      `;
    } else {
      upcomingTripsList.innerHTML = upcomingTrips.map(trip => this.renderTripCard(trip)).join('');
    }

    // Render completed trips
    if (completedTrips.length === 0) {
      completedTripsList.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">📅</div>
          <h3>No completed trips</h3>
          <p>Your travel memories will appear here</p>
        </div>
      `;
    } else {
      completedTripsList.innerHTML = completedTrips.map(trip => this.renderTripCard(trip)).join('');
    }
  }

  // Render a single trip card
  renderTripCard(trip) {
    const status = this.getTripStatus(trip);
    const startDate = window.formatDate(trip.startDate);
    const endDate = window.formatDate(trip.endDate);
    const placesCount = trip.places ? trip.places.length : 0;

    return `
      <div class="trip-card" onclick="app.viewTripDetails(${trip.id})">
        <div class="trip-card-header">
          <div>
            <div class="trip-title">${trip.name}</div>
            <div class="trip-destination">${placesCount} destinations</div>
          </div>
          <span class="trip-status ${status.toLowerCase()}">${status}</span>
        </div>
        
        <div class="trip-dates">
          <span class="date-label start-date">Start: ${startDate}</span>
          <span class="date-label end-date">End: ${endDate}</span>
        </div>
        
        ${trip.description ? `<div class="trip-description">${trip.description}</div>` : ''}
        
        <div class="trip-actions">
          <button class="trip-action-btn btn-primary" onclick="event.stopPropagation(); app.viewTripDetails(${trip.id})">
            View
          </button>
          <button class="trip-action-btn btn-edit" onclick="event.stopPropagation(); app.editTrip(${trip.id})">
            Edit
          </button>
          <button class="trip-action-btn btn-danger" onclick="event.stopPropagation(); app.deleteTrip(${trip.id})">
            Delete
          </button>
        </div>
      </div>
    `;
  }

  // Open Add Trip Modal
  openAddTripModal() {
    const modal = document.getElementById('addTripModal');
    if (modal) {
      modal.classList.remove('hidden');
      
      // Set up form submission
      const form = document.getElementById('addTripForm');
      const closeBtn = document.getElementById('closeAddTripModal');
      const cancelBtn = document.getElementById('cancelTripBtn');
      
      if (form) {
        form.onsubmit = (e) => {
          e.preventDefault();
          this.createTrip();
        };
      }
      
      if (closeBtn) {
        closeBtn.onclick = () => this.closeAddTripModal();
      }
      
      if (cancelBtn) {
        cancelBtn.onclick = () => this.closeAddTripModal();
      }

      // Close modal when clicking outside
      modal.onclick = (e) => {
        if (e.target === modal) {
          this.closeAddTripModal();
        }
      };
    }
  }

  // Close Add Trip Modal
  closeAddTripModal() {
    const modal = document.getElementById('addTripModal');
    if (modal) {
      modal.classList.add('hidden');
      // Clear form
      const form = document.getElementById('addTripForm');
      if (form) form.reset();
    }
  }

  // Create new trip
  createTrip() {
    // Ensure we wait for modal to be fully rendered
    setTimeout(() => {
      const nameInput = document.getElementById('tripName');
      const startDateInput = document.getElementById('tripStartDate');
      const endDateInput = document.getElementById('tripEndDate');
      const descriptionInput = document.getElementById('tripDescription');

      console.log('Create trip called', { nameInput, startDateInput, endDateInput }); // Debug log

      // Check if modal is visible (indicates DOM is ready)
      const modal = document.getElementById('addTripModal');
      if (!modal || modal.classList.contains('hidden')) {
        console.error('Modal not ready');
        return;
      }

      if (!nameInput || !startDateInput || !endDateInput) {
        console.error('Missing required form elements:', { nameInput, startDateInput, endDateInput });
        this.showToast('Form not ready. Please try again.', 'error');
        return;
      }

      const tripData = {
        name: nameInput.value.trim(),
        startDate: startDateInput.value,
        endDate: endDateInput.value,
        description: descriptionInput ? descriptionInput.value.trim() : ''
      };

      console.log('Trip data:', tripData); // Debug log

      // Validation - only check required fields
      if (!tripData.name) {
        this.showToast('Please enter a trip name', 'error');
        return;
      }

      if (!tripData.startDate || !tripData.endDate) {
        this.showToast('Please select both start and end dates', 'error');
        return;
      }

      if (new Date(tripData.startDate) >= new Date(tripData.endDate)) {
        this.showToast('End date must be after start date', 'error');
        return;
      }

      // Initialize TripManager if not already done
      if (!window.tripManager) {
        if (typeof TripManager === 'function') {
          window.tripManager = new TripManager();
          console.log('TripManager initialized');
        } else {
          console.error('TripManager class not available');
          this.showToast('Error: Trip manager not available', 'error');
          return;
        }
      }

      // Create trip
      try {
        const newTrip = window.tripManager.createTrip(tripData);
        console.log('Trip created:', newTrip);
        this.showToast(`Trip "${tripData.name}" created successfully! Click "View" to add details.`, 'success');
        
        // Close modal
        this.closeAddTripModal();
        
        // Refresh home page trips display (this will use TripUI if available)
        this.loadHomePageTrips();
        
        // Also refresh TripUI trips list if it exists
        if (window.tripUI && window.tripUI.createTripListView) {
          window.tripUI.createTripListView();
        }
        
      } catch (error) {
        console.error('Error creating trip:', error);
        this.showToast('Error creating trip. Please try again.', 'error');
      }
    }, 100); // Small delay to ensure DOM is ready
  }

  // View trip details
  viewTripDetails(tripId) {
    // Navigate to trips view and show trip detail
    this.navigateToView('trips');
    
    // Wait for TripUI to initialize, then view trip detail
    setTimeout(() => {
      if (window.tripUI && window.tripUI.viewTripDetail) {
        window.tripUI.viewTripDetail(tripId);
      }
    }, 200);
  }

  // Edit trip
  editTrip(tripId) {
    // Navigate to trips view and edit trip
    this.navigateToView('trips');
    
    // Wait for TripUI to initialize, then edit trip
    setTimeout(() => {
      if (window.tripUI && window.tripUI.editTrip) {
        window.tripUI.editTrip(tripId);
      }
    }, 200);
  }

  // Delete trip
  deleteTrip(tripId) {
    if (!window.tripManager) {
      this.showToast('Trip manager not available', 'error');
      return;
    }

    const trip = window.tripManager.getTrip(tripId);
    if (!trip) {
      this.showToast('Trip not found', 'error');
      return;
    }

    if (confirm(`Are you sure you want to delete "${trip.name}"? This action cannot be undone.`)) {
      try {
        window.tripManager.deleteTrip(tripId);
        this.showToast(`Trip "${trip.name}" deleted successfully`, 'success');
        
        // Refresh home page trips display (this will use TripUI if available)
        this.loadHomePageTrips();
        
        // Also refresh TripUI trips list if it exists
        if (window.tripUI && window.tripUI.createTripListView) {
          window.tripUI.createTripListView();
        }
        
      } catch (error) {
        console.error('Error deleting trip:', error);
        this.showToast('Error deleting trip. Please try again.', 'error');
      }
    }
  }

  renderTripsView() {
    // Trip view content is handled by TripUI class
    console.log('Rendering trips view');
    
    // Ensure TripUI is initialized when we navigate to trips view
    setTimeout(() => {
      if (typeof window.initializeTripUI === 'function') {
        window.initializeTripUI();
      } else if (!window.tripUI && document.getElementById('trip-list')) {
        // Fallback initialization
        if (typeof window.TripUI === 'function') {
          window.tripUI = new window.TripUI();
          console.log('TripUI initialized via fallback');
        }
      }
    }, 100); // Small delay to ensure DOM is ready
  }

  renderExploreView() {
    // Initialize explore map if TripUI is available
    if (window.tripUI && window.tripUI.initializeExploreMap) {
      window.tripUI.initializeExploreMap();
    }

    // Populate trip dropdown for custom place form
    setTimeout(() => {
      this.populateTripDropdown();
    }, 100);

    console.log('Rendered explore view with interactive map and custom place form');
  }

  // Add custom place functionality
  addCustomPlace() {
    const name = document.getElementById('customPlaceName').value.trim();
    const state = document.getElementById('customPlaceState').value;
    const description = document.getElementById('customPlaceDescription').value.trim();
    const attractionsText = document.getElementById('customPlaceAttractions').value.trim();
    const selectedTripId = document.getElementById('selectTripForPlace').value;

    // Validation
    if (!name) {
      this.showToast('Please enter a place name', 'error');
      return;
    }
    if (!state) {
      this.showToast('Please select a state', 'error');
      return;
    }
    if (!attractionsText) {
      this.showToast('Please add at least one attraction', 'error');
      return;
    }

    // Parse attractions
    const attractions = attractionsText
      .split('\n')
      .map(a => a.trim())
      .filter(a => a.length > 0);

    if (attractions.length === 0) {
      this.showToast('Please add at least one attraction', 'error');
      return;
    }

    // Create custom place object
    const customPlace = {
      city: name,
      state: state,
      description: description || `Custom destination in ${state}`,
      attractions: attractions,
      category: 'Custom',
      isCustom: true
    };

    // Check if user selected a trip to add to
    if (selectedTripId && window.tripUI) {
      // Add to selected trip
      try {
        window.tripUI.tripManager.addPlaceToTrip(parseInt(selectedTripId), customPlace);
        this.showToast(`"${name}" added to your trip!`, 'success');
        
        // Clear the form
        this.clearCustomPlaceForm();
        
        // Refresh home page trip cards to show updated counts
        if (window.tripUI && window.tripUI.renderHomePageTrips) {
          window.tripUI.renderHomePageTrips();
        }
        
        // Navigate back to trip detail
        window.tripUI.viewTripDetail(parseInt(selectedTripId));
        
      } catch (error) {
        console.error('Error adding custom place to trip:', error);
        this.showToast('Error adding place to trip', 'error');
      }
    } else {
      // No trip selected - check if there are any trips available
      const trips = window.tripUI ? window.tripUI.tripManager.getAllTrips() : [];
      
      if (trips.length === 0) {
        // No trips available - show error and redirect to create trip
        this.showErrorToastWithAction(
          'No Trips Available',
          'You need to create a trip first before adding destinations.',
          'Create Trip',
          () => {
            this.navigateToView('home');
            setTimeout(() => {
              const createTripBtn = document.getElementById('createTripBtn');
              if (createTripBtn) {
                createTripBtn.click();
              }
            }, 100);
          }
        );
        return;
      }
      
      // Show trip selection modal
      this.showTripSelectionModal(customPlace);
    }
  }

  // Clear custom place form
  clearCustomPlaceForm() {
    document.getElementById('customPlaceName').value = '';
    document.getElementById('customPlaceState').value = '';
    document.getElementById('customPlaceDescription').value = '';
    document.getElementById('customPlaceAttractions').value = '';
    document.getElementById('selectTripForPlace').value = '';
  }

  // Load custom places from storage
  loadCustomPlaces() {
    try {
      const places = localStorage.getItem('wanderlog_custom_places');
      return places ? JSON.parse(places) : [];
    } catch (error) {
      console.error('Error loading custom places:', error);
      return [];
    }
  }

  renderLogView() {
    // Log view form is static, but we can add validation or dynamic elements
    console.log('Rendering log view');
  }

  renderFavoritesView() {
    const favoritesList = document.getElementById('favoritesList');
    if (!favoritesList) return;

    const favorites = this.loadFavorites();
    
    if (favorites.length === 0) {
      favoritesList.innerHTML = `
        <div class="text-center p-4">
          <p class="text-gray-500">No favorites yet. Start exploring to add places!</p>
          <button class="btn primary-btn" onclick="app.navigateToView('explore')">
            Explore Places
          </button>
        </div>
      `;
    } else {
      favoritesList.innerHTML = favorites.map(place => `
        <div class="place-item" data-place-id="${place.id}">
          <h3>${place.name}</h3>
          <p>${place.description || place.notes}</p>
          <div class="place-rating">
            ${'★'.repeat(Math.floor(place.rating))} ${place.rating}
          </div>
          <button class="btn secondary-btn" onclick="app.removeFromFavorites(${place.id})">
            Remove
          </button>
        </div>
      `).join('');
    }

    console.log(`Rendered favorites view with ${favorites.length} items`);
  }

  handleSearch(query) {
    console.log('Search query:', query);
    
    // In a real app, this would make an API call
    // For now, we'll just filter the sample data
    if (query.length > 2) {
      // Implement search logic here
      console.log('Searching for:', query);
    }
  }

  handleLogSubmission() {
    const placeInput = document.getElementById('placeInput');
    const notesInput = document.getElementById('notesInput');
    const ratingInput = document.getElementById('ratingInput');

    if (!placeInput || !notesInput || !ratingInput) return;

    const logEntry = {
      id: Date.now(),
      place: placeInput.value.trim(),
      notes: notesInput.value.trim(),
      rating: parseInt(ratingInput.value),
      timestamp: new Date().toISOString(),
      synced: this.isOnline
    };

    if (!logEntry.place) {
      this.showToast('Please enter a place name', 'error');
      return;
    }

    // Save the log entry
    this.saveLogEntry(logEntry);
    
    // Add to favorites if rated 4 or higher
    if (logEntry.rating >= 4) {
      this.addToFavorites(logEntry.id, {
        id: logEntry.id,
        name: logEntry.place,
        description: logEntry.notes,
        rating: logEntry.rating
      });
    }

    // Clear form
    placeInput.value = '';
    notesInput.value = '';
    ratingInput.value = '5';

    this.showToast('Entry logged successfully!', 'success');
    
    console.log('Log entry saved:', logEntry);
  }

  saveLogEntry(entry) {
    const entries = this.loadLogEntries();
    entries.push(entry);
    localStorage.setItem('wanderlog_entries', JSON.stringify(entries));
    
    // If offline, mark for sync later
    if (!this.isOnline) {
      this.markForSync(entry);
    }
  }

  loadLogEntries() {
    try {
      const entries = localStorage.getItem('wanderlog_entries');
      return entries ? JSON.parse(entries) : [];
    } catch (error) {
      console.error('Error loading log entries:', error);
      return [];
    }
  }

  addToFavorites(id, placeData = null) {
    const favorites = this.loadFavorites();
    
    // Check if already in favorites
    if (favorites.find(fav => fav.id === id)) {
      this.showToast('Already in favorites', 'info');
      return;
    }

    let favorite;
    if (placeData) {
      favorite = placeData;
    } else {
      // Find place in sample data or log entries
      const entries = this.loadLogEntries();
      const entry = entries.find(e => e.id === id);
      if (entry) {
        favorite = {
          id: entry.id,
          name: entry.place,
          description: entry.notes,
          rating: entry.rating
        };
      }
    }

    if (favorite) {
      favorites.push(favorite);
      localStorage.setItem('wanderlog_favorites', JSON.stringify(favorites));
      this.showToast('Added to favorites!', 'success');
      
      // Re-render if currently viewing favorites
      if (this.currentView === 'favorites') {
        this.renderFavoritesView();
      }
    }
  }

  removeFromFavorites(id) {
    const favorites = this.loadFavorites();
    const updatedFavorites = favorites.filter(fav => fav.id !== id);
    localStorage.setItem('wanderlog_favorites', JSON.stringify(updatedFavorites));
    
    this.showToast('Removed from favorites', 'info');
    this.renderFavoritesView();
  }

  loadFavorites() {
    try {
      const favorites = localStorage.getItem('wanderlog_favorites');
      return favorites ? JSON.parse(favorites) : [];
    } catch (error) {
      console.error('Error loading favorites:', error);
      return [];
    }
  }

  loadPlaces() {
    // In a real app, this would load from an API or local storage
    return [];
  }

  markForSync(data) {
    const syncQueue = this.loadSyncQueue();
    syncQueue.push({
      id: Date.now(),
      data: data,
      action: 'create',
      timestamp: new Date().toISOString()
    });
    localStorage.setItem('wanderlog_sync_queue', JSON.stringify(syncQueue));
  }

  loadSyncQueue() {
    try {
      const queue = localStorage.getItem('wanderlog_sync_queue');
      return queue ? JSON.parse(queue) : [];
    } catch (error) {
      console.error('Error loading sync queue:', error);
      return [];
    }
  }

  toggleMenu() {
    // Implement menu toggle functionality
    console.log('Menu toggle clicked');
    this.showToast('Menu functionality coming soon!', 'info');
  }

  showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type} show`;
    toast.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-between;">
        <span>${message}</span>
        <button onclick="this.parentElement.parentElement.remove()" style="background: none; border: none; font-size: 1.2rem; cursor: pointer; margin-left: 1rem;">&times;</button>
      </div>
    `;
    
    // Toast styles
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: white;
      border-radius: 8px;
      padding: 16px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      border-left: 4px solid ${this.getToastColor(type)};
      z-index: 10000;
      max-width: 300px;
      transform: translateX(100%);
      transition: transform 0.3s ease;
    `;
    
    document.body.appendChild(toast);
    
    // Animate in
    setTimeout(() => {
      toast.style.transform = 'translateX(0)';
    }, 100);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      if (toast.parentNode) {
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => {
          if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
          }
        }, 300);
      }
    }, 5000);
  }

  getToastColor(type) {
    const colors = {
      'success': '#4CAF50',
      'error': '#f44336',
      'warning': '#ff9800',
      'info': '#2196f3'
    };
    return colors[type] || colors.info;
  }

  // Show trip selection modal
  showTripSelectionModal(customPlace) {
    const modal = document.getElementById('tripSelectionModal');
    const tripList = document.getElementById('tripSelectionList');
    
    if (!modal || !tripList) {
      console.error('Trip selection modal elements not found');
      return;
    }

    // Get all trips
    const trips = window.tripUI ? window.tripUI.tripManager.getAllTrips() : [];
    
    // Clear previous content
    tripList.innerHTML = '';
    
    if (trips.length === 0) {
      tripList.innerHTML = `
        <div class="no-trips-message">
          <h4>No Trips Available</h4>
          <p>Create your first trip to start adding destinations!</p>
          <button class="btn-primary" onclick="app.navigateToView('home'); app.closeTripSelectionModal();">
            Create Trip
          </button>
        </div>
      `;
    } else {
      // Render trip options
      trips.forEach(trip => {
        const status = this.getTripStatus(trip);
        const tripElement = document.createElement('div');
        tripElement.className = 'trip-selection-item';
        tripElement.innerHTML = `
          <h4>${trip.name}</h4>
          <p>${trip.places ? trip.places.length : 0} destinations</p>
          <span class="trip-status ${status.toLowerCase()}">${status}</span>
        `;
        
        tripElement.addEventListener('click', () => {
          this.selectTripForPlace(trip.id, customPlace);
        });
        
        tripList.appendChild(tripElement);
      });
    }
    
    // Show modal
    modal.classList.remove('hidden');
    
    // Store the custom place for later use
    this.pendingCustomPlace = customPlace;
  }

  // Close trip selection modal
  closeTripSelectionModal() {
    const modal = document.getElementById('tripSelectionModal');
    if (modal) {
      modal.classList.add('hidden');
    }
    this.pendingCustomPlace = null;
  }

  // Select trip for custom place
  selectTripForPlace(tripId, customPlace) {
    if (!window.tripUI) {
      this.showToast('Trip manager not available', 'error');
      return;
    }

    try {
      window.tripUI.tripManager.addPlaceToTrip(tripId, customPlace);
      this.showToast(`"${customPlace.city}" added to your trip!`, 'success');
      
      // Clear the form
      this.clearCustomPlaceForm();
      
      // Close modal
      this.closeTripSelectionModal();
      
      // Refresh home page trip cards to show updated counts
      if (window.tripUI && window.tripUI.renderHomePageTrips) {
        window.tripUI.renderHomePageTrips();
      }
      
      // Navigate to trip detail
      window.tripUI.viewTripDetail(tripId);
      
    } catch (error) {
      console.error('Error adding custom place to trip:', error);
      this.showToast('Error adding place to trip', 'error');
    }
  }

  // Get trip status
  getTripStatus(trip) {
    if (!trip.endDate) return 'Upcoming';
    
    const endDate = new Date(trip.endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return endDate < today ? 'Completed' : 'Upcoming';
  }

  // Show error toast with action button
  showErrorToastWithAction(title, message, buttonText, buttonAction) {
    // Remove existing error toasts
    const existingToasts = document.querySelectorAll('.error-toast');
    existingToasts.forEach(toast => toast.remove());

    const toast = document.createElement('div');
    toast.className = 'error-toast';
    toast.innerHTML = `
      <h4>${title}</h4>
      <p>${message}</p>
      <div class="toast-actions">
        <button class="btn-small" onclick="this.parentElement.parentElement.remove()">${buttonText}</button>
        <button class="btn-small" onclick="this.parentElement.parentElement.remove()">Dismiss</button>
      </div>
    `;

    // Add click handler for the action button
    const actionBtn = toast.querySelector('.btn-small');
    if (actionBtn && buttonAction) {
      actionBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        buttonAction();
        toast.remove();
      });
    }

    document.body.appendChild(toast);

    // Auto remove after 10 seconds
    setTimeout(() => {
      if (toast.parentNode) {
        toast.classList.add('hide');
        setTimeout(() => {
          if (toast.parentNode) {
            toast.remove();
          }
        }, 300);
      }
    }, 10000);
  }

  // Populate trip dropdown on explore page
  populateTripDropdown() {
    const dropdown = document.getElementById('selectTripForPlace');
    if (!dropdown || !window.tripUI) return;

    // Get all trips
    const trips = window.tripUI.tripManager.getAllTrips();
    
    // Clear existing options (except the first placeholder)
    while (dropdown.children.length > 1) {
      dropdown.removeChild(dropdown.lastChild);
    }
    
    // Add trip options
    trips.forEach(trip => {
      const option = document.createElement('option');
      option.value = trip.id;
      option.textContent = `${trip.name} (${trip.places ? trip.places.length : 0} destinations)`;
      dropdown.appendChild(option);
    });
  }
}

// Initialize the app
const app = new WanderLogApp();

// Make app globally available for inline event handlers
window.app = app;

// Handle browser back/forward buttons
window.addEventListener('popstate', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const view = urlParams.get('view') || 'home';
  app.navigateToView(view);
});

// Handle network status changes
window.addEventListener('online', () => {
  app.isOnline = true;
  console.log('App is online');
});

window.addEventListener('offline', () => {
  app.isOnline = false;
  console.log('App is offline');
});

export default WanderLogApp;
