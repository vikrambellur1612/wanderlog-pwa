// Service Worker Registration - WanderLog PWA
// Version: 1.4.0

let deferredPrompt;
let updateAvailable = false;

// Service Worker Registration
const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';

if ('serviceWorker' in navigator && isProduction) {
  // Only register service worker in production
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('./sw.js');
      console.log('ServiceWorker registered:', registration.scope);
      
      // Handle updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        console.log('New service worker found, installing...');
        
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            console.log('New service worker installed, showing update notification');
            showUpdateNotification();
          }
        });
      });

      // Check for existing update waiting
      if (registration.waiting) {
        showUpdateNotification();
      }

      // Listen for controller change (when new SW takes control)
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('New service worker took control, reloading page');
        // Add a small delay to prevent rapid reloading
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      });

    } catch (error) {
      console.error('ServiceWorker registration failed:', error);
    }
  });
} else if ('serviceWorker' in navigator && !isProduction) {
  console.log('Service Worker registration skipped in development mode');
}

// PWA Install Prompt Handler
window.addEventListener('beforeinstallprompt', (e) => {
  console.log('Install prompt triggered');
  e.preventDefault();
  deferredPrompt = e;
  showInstallBanner();
});

// Handle successful app installation
window.addEventListener('appinstalled', (e) => {
  console.log('PWA was installed successfully');
  hideInstallBanner();
  deferredPrompt = null;
  
  // Track installation (you can add analytics here)
  if (typeof gtag !== 'undefined') {
    gtag('event', 'pwa_install', {
      'event_category': 'engagement',
      'event_label': 'PWA installed'
    });
  }
});

// Show Install Banner
function showInstallBanner() {
  const installBanner = document.getElementById('installBanner');
  if (installBanner) {
    installBanner.classList.remove('hidden');
    
    // Install button click handler
    const installBtn = document.getElementById('installBtn');
    if (installBtn) {
      installBtn.addEventListener('click', handleInstallClick);
    }
    
    // Dismiss button click handler
    const dismissBtn = document.getElementById('dismissInstallBtn');
    if (dismissBtn) {
      dismissBtn.addEventListener('click', hideInstallBanner);
    }
  }
}

// Hide Install Banner
function hideInstallBanner() {
  const installBanner = document.getElementById('installBanner');
  if (installBanner) {
    installBanner.classList.add('hidden');
  }
}

// Handle Install Button Click
async function handleInstallClick() {
  if (deferredPrompt) {
    try {
      // Show the install prompt
      deferredPrompt.prompt();
      
      // Wait for the user to respond to the prompt
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`User response to install prompt: ${outcome}`);
      
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
      
      // Clear the deferred prompt
      deferredPrompt = null;
      hideInstallBanner();
      
    } catch (error) {
      console.error('Error showing install prompt:', error);
    }
  }
}

// Show Update Notification
function showUpdateNotification() {
  updateAvailable = true;
  const updateNotification = document.getElementById('updateNotification');
  
  if (updateNotification) {
    updateNotification.classList.remove('hidden');
    
    // Update button click handler
    const updateBtn = document.getElementById('updateBtn');
    if (updateBtn) {
      updateBtn.addEventListener('click', handleUpdateClick);
    }
    
    // Dismiss button click handler
    const dismissUpdateBtn = document.getElementById('dismissUpdateBtn');
    if (dismissUpdateBtn) {
      dismissUpdateBtn.addEventListener('click', hideUpdateNotification);
    }
  }
}

// Hide Update Notification
function hideUpdateNotification() {
  const updateNotification = document.getElementById('updateNotification');
  if (updateNotification) {
    updateNotification.classList.add('hidden');
  }
}

// Handle Update Button Click
function handleUpdateClick() {
  if (updateAvailable) {
    // Skip waiting and activate the new service worker
    navigator.serviceWorker.getRegistration().then((registration) => {
      if (registration && registration.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      }
    });
    
    hideUpdateNotification();
  }
}

// Listen for messages from the service worker
navigator.serviceWorker.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SW_UPDATED') {
    console.log('Service worker updated');
    showUpdateNotification();
  }
});

// Network status monitoring
let isOnline = navigator.onLine;

window.addEventListener('online', () => {
  console.log('App is back online');
  isOnline = true;
  showNetworkStatus('online');
  
  // Trigger background sync if available
  if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
    navigator.serviceWorker.ready.then((registration) => {
      return registration.sync.register('background-sync');
    }).catch((error) => {
      console.log('Background sync registration failed:', error);
    });
  }
});

window.addEventListener('offline', () => {
  console.log('App is offline');
  isOnline = false;
  showNetworkStatus('offline');
});

// Show Network Status
function showNetworkStatus(status) {
  // You can implement a toast notification here
  console.log(`Network status: ${status}`);
  
  // Optional: Show a temporary notification to the user
  const notification = document.createElement('div');
  notification.className = `network-status ${status}`;
  notification.textContent = status === 'online' ? 'Back online!' : 'You are offline';
  
  // Add styles for the notification
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    padding: 12px 24px;
    border-radius: 8px;
    color: white;
    font-weight: 500;
    z-index: 10000;
    transition: all 0.3s ease;
    ${status === 'online' ? 'background-color: #4CAF50;' : 'background-color: #FF9800;'}
  `;
  
  document.body.appendChild(notification);
  
  // Remove after 3 seconds
  setTimeout(() => {
    if (notification.parentNode) {
      notification.parentNode.removeChild(notification);
    }
  }, 3000);
}

// Export functions for use in other modules
window.SW_UTILS = {
  isOnline: () => isOnline,
  showInstallBanner,
  hideInstallBanner,
  showUpdateNotification,
  hideUpdateNotification
};
