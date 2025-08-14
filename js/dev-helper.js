// Development helper script to clear service workers and cache
// This should only be used during development

if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
  console.log('🔧 Development mode detected');
  
  // Clear any existing service workers
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(function(registrations) {
      for(let registration of registrations) {
        console.log('🗑️ Unregistering service worker:', registration.scope);
        registration.unregister();
      }
    });
  }
  
  // Clear caches
  if ('caches' in window) {
    caches.keys().then(function(names) {
      for(let name of names) {
        console.log('🗑️ Deleting cache:', name);
        caches.delete(name);
      }
    });
  }
  
  console.log('✅ Development environment cleaned');
}
