// Manual Test Script for Netlify Debugging
// Add this script temporarily to index.html to test functionality

console.log('🔬 Manual Test Script loaded');

// Wait for page to fully load
window.addEventListener('load', () => {
  console.log('📊 Page Load Test Results:');
  
  // Test 1: Check if all scripts are loaded
  const scriptTests = {
    'TripManager': typeof window.TripManager,
    'TripUI': typeof window.TripUI,
    'MapManager': typeof window.MapManager,
    'app': typeof window.app
  };
  
  console.log('1. Script Loading Test:', scriptTests);
  
  // Test 2: Check DOM elements
  const elementTests = {
    'trip-list': !!document.getElementById('trip-list'),
    'tripsView': !!document.getElementById('tripsView'),
    'app': !!document.getElementById('app'),
    'tripsCard': !!document.getElementById('tripsCard')
  };
  
  console.log('2. DOM Elements Test:', elementTests);
  
  // Test 3: Navigate to trips view and test initialization
  setTimeout(() => {
    console.log('3. Testing trips navigation...');
    
    if (window.app && typeof window.app.navigateToView === 'function') {
      window.app.navigateToView('trips');
      
      setTimeout(() => {
        console.log('4. After navigation test:', {
          currentView: window.app?.currentView,
          tripUI: !!window.tripUI,
          tripListVisible: document.getElementById('tripsView')?.classList.contains('active'),
          tripListContent: document.getElementById('trip-list')?.innerHTML ? 'Has content' : 'Empty'
        });
        
        // Test 5: Try manual TripUI initialization
        if (!window.tripUI && document.getElementById('trip-list')) {
          console.log('5. Attempting manual TripUI initialization...');
          try {
            window.tripUI = new window.TripUI();
            console.log('✅ Manual TripUI initialization successful');
          } catch (error) {
            console.error('❌ Manual TripUI initialization failed:', error);
          }
        }
      }, 1000);
    } else {
      console.error('❌ App navigation function not available');
    }
  }, 2000);
});

// Add a global test function
window.testWanderLog = function() {
  console.log('🧪 Running manual WanderLog test...');
  
  // Force navigate to trips
  if (window.app) {
    window.app.navigateToView('trips');
    
    setTimeout(() => {
      // Check if TripUI exists
      if (window.tripUI) {
        console.log('✅ TripUI is initialized');
      } else {
        console.log('❌ TripUI not initialized, attempting manual init...');
        if (window.initializeTripUI) {
          window.initializeTripUI();
        } else if (window.TripUI) {
          window.tripUI = new window.TripUI();
        }
      }
    }, 500);
  }
};

console.log('🔬 Manual test functions ready. Use testWanderLog() in console.');
