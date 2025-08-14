// WanderLog PWA - Main Application Logic
// Version: 1.0.0

class WanderLogApp {
  constructor() {
    this.currentView = 'home';
    this.places = this.loadPlaces();
    this.favorites = this.loadFavorites();
    this.isOnline = navigator.onLine;
    
    this.init();
  }

  async init() {
    console.log('Initializing WanderLog PWA v1.2.0');
    
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

    // Search functionality
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.handleSearch(e.target.value);
      });
    }

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
  }

  renderTripsView() {
    // Trip view content is handled by TripUI class
    console.log('Rendering trips view');
    
    // Initialize TripUI if not already done
    if (!window.tripUI) {
      window.tripUI = new TripUI();
    }
  }

  renderExploreView() {
    const exploreResults = document.getElementById('exploreResults');
    if (!exploreResults) return;

    // Sample places data (in a real app, this would come from an API)
    const samplePlaces = [
      {
        id: 1,
        name: 'Central Park',
        description: 'Large public park in Manhattan',
        rating: 4.5,
        category: 'Park'
      },
      {
        id: 2,
        name: 'Times Square',
        description: 'Famous commercial intersection',
        rating: 4.2,
        category: 'Landmark'
      },
      {
        id: 3,
        name: 'Brooklyn Bridge',
        description: 'Historic suspension bridge',
        rating: 4.7,
        category: 'Bridge'
      }
    ];

    exploreResults.innerHTML = samplePlaces.map(place => `
      <div class="place-item" data-place-id="${place.id}">
        <h3>${place.name}</h3>
        <p>${place.description}</p>
        <div class="place-rating">
          ${'★'.repeat(Math.floor(place.rating))} ${place.rating} • ${place.category}
        </div>
        <button class="btn secondary-btn" onclick="app.addToFavorites(${place.id})">
          Add to Favorites
        </button>
      </div>
    `).join('');

    console.log('Rendered explore view with sample places');
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
