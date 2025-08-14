// Debug Helper for WanderLog PWA
// This script helps identify issues in production deployments

console.log('🔧 Debug Helper loaded');

// Log all global variables related to our app
function logAppState() {
  console.log('📊 App State Check:', {
    tripUI: typeof window.tripUI,
    TripUI: typeof window.TripUI,
    mapManager: typeof window.mapManager,
    MapManager: typeof window.MapManager,
    app: typeof window.app,
    initializeTripUI: typeof window.initializeTripUI
  });
  
  // Check if DOM elements exist
  const elements = {
    'trip-list': !!document.getElementById('trip-list'),
    'tripsView': !!document.getElementById('tripsView'),
    'app': !!document.getElementById('app'),
    'loadingScreen': !!document.getElementById('loadingScreen')
  };
  
  console.log('🏗️ DOM Elements:', elements);
  
  // Check if trip-list is visible
  const tripList = document.getElementById('trip-list');
  if (tripList) {
    const rect = tripList.getBoundingClientRect();
    console.log('📐 trip-list dimensions:', {
      width: rect.width,
      height: rect.height,
      visible: rect.width > 0 && rect.height > 0,
      display: getComputedStyle(tripList).display,
      visibility: getComputedStyle(tripList).visibility
    });
  }
}

// Log navigation events
function logNavigation() {
  const views = document.querySelectorAll('.view');
  const activeViews = [];
  
  views.forEach(view => {
    if (view.classList.contains('active')) {
      activeViews.push(view.id);
    }
  });
  
  console.log('🧭 Active Views:', activeViews);
}

// Monitor view changes
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
      const target = mutation.target;
      if (target.classList && target.classList.contains('view')) {
        if (target.classList.contains('active')) {
          console.log(`🔄 View activated: ${target.id}`);
          
          // If trips view is activated, check TripUI initialization
          if (target.id === 'tripsView') {
            setTimeout(() => {
              console.log('🔍 TripUI check after trips view activation:', {
                tripUI: !!window.tripUI,
                tripList: !!document.getElementById('trip-list')
              });
              
              // Force initialization if needed
              if (!window.tripUI && document.getElementById('trip-list')) {
                console.log('🚨 Force initializing TripUI...');
                try {
                  if (typeof window.TripUI === 'function') {
                    window.tripUI = new window.TripUI();
                    console.log('✅ TripUI force initialized successfully');
                  } else {
                    console.error('❌ TripUI class not available');
                  }
                } catch (error) {
                  console.error('❌ Error force initializing TripUI:', error);
                }
              }
            }, 500);
          }
        }
      }
    }
  });
});

// Start observing
observer.observe(document.body, {
  attributes: true,
  subtree: true,
  attributeFilter: ['class']
});

// Log initial state after a delay
setTimeout(() => {
  console.log('🎯 Initial App State:');
  logAppState();
  logNavigation();
}, 2000);

// Add manual debug function to window
window.debugWanderLog = function() {
  console.log('🔍 Manual Debug Check:');
  logAppState();
  logNavigation();
  
  // Try to manually initialize TripUI
  if (!window.tripUI && document.getElementById('trip-list')) {
    console.log('🔧 Attempting manual TripUI initialization...');
    try {
      if (typeof window.TripUI === 'function') {
        window.tripUI = new window.TripUI();
        console.log('✅ Manual TripUI initialization successful');
      } else {
        console.error('❌ TripUI class not available for manual initialization');
      }
    } catch (error) {
      console.error('❌ Manual TripUI initialization failed:', error);
    }
  }
};

// Log any errors
window.addEventListener('error', (event) => {
  console.error('🚨 JavaScript Error:', {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    error: event.error
  });
});

// Log unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  console.error('🚨 Unhandled Promise Rejection:', event.reason);
});

console.log('🔧 Debug Helper ready. Use debugWanderLog() in console for manual checks.');
