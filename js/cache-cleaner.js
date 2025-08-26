// Cache Cleaner Utility for WanderLog PWA
// Version: 1.11.0

class CacheCleaner {
  constructor() {
    this.debug = true; // Enable detailed logging
  }

  /**
   * Completely wipe all application data and caches
   * This is a nuclear option for development/testing
   */
  async nukeAllData() {
    console.log('🧹 Starting complete cache and data cleanup...');
    
    try {
      // 1. Clear all localStorage
      await this.clearLocalStorage();
      
      // 2. Clear all sessionStorage
      await this.clearSessionStorage();
      
      // 3. Clear all IndexedDB databases
      await this.clearIndexedDB();
      
      // 4. Clear all Service Worker caches
      await this.clearServiceWorkerCaches();
      
      // 5. Unregister service workers
      await this.unregisterServiceWorkers();
      
      // 6. Clear browser caches (if supported)
      await this.clearBrowserCaches();
      
      // 7. Force reload to ensure clean state
      console.log('✅ All data cleared successfully! Reloading app...');
      window.location.reload(true);
      
    } catch (error) {
      console.error('❌ Error during cache cleanup:', error);
    }
  }

  /**
   * Clear localStorage completely
   */
  async clearLocalStorage() {
    try {
      const itemCount = localStorage.length;
      localStorage.clear();
      console.log(`🗄️ Cleared ${itemCount} localStorage items`);
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }

  /**
   * Clear sessionStorage completely
   */
  async clearSessionStorage() {
    try {
      const itemCount = sessionStorage.length;
      sessionStorage.clear();
      console.log(`📝 Cleared ${itemCount} sessionStorage items`);
    } catch (error) {
      console.error('Error clearing sessionStorage:', error);
    }
  }

  /**
   * Clear all IndexedDB databases
   */
  async clearIndexedDB() {
    try {
      if ('indexedDB' in window) {
        // Get all databases (this is experimental API)
        if (indexedDB.databases) {
          const databases = await indexedDB.databases();
          console.log(`🗃️ Found ${databases.length} IndexedDB databases`);
          
          for (const db of databases) {
            if (db.name) {
              await this.deleteDatabase(db.name);
            }
          }
        } else {
          // Fallback: try to delete common database names
          const commonDbNames = ['wanderlog-db', 'trips-db', 'cache-db', 'keyval-store'];
          for (const dbName of commonDbNames) {
            await this.deleteDatabase(dbName);
          }
        }
      }
      console.log('🗃️ IndexedDB cleanup completed');
    } catch (error) {
      console.error('Error clearing IndexedDB:', error);
    }
  }

  /**
   * Delete a specific IndexedDB database
   */
  async deleteDatabase(name) {
    return new Promise((resolve, reject) => {
      const deleteReq = indexedDB.deleteDatabase(name);
      deleteReq.onsuccess = () => {
        console.log(`   - Deleted database: ${name}`);
        resolve();
      };
      deleteReq.onerror = () => {
        console.warn(`   - Could not delete database: ${name}`);
        resolve(); // Don't reject, just continue
      };
    });
  }

  /**
   * Clear all Service Worker caches
   */
  async clearServiceWorkerCaches() {
    try {
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        console.log(`💾 Found ${cacheNames.length} service worker caches`);
        
        for (const cacheName of cacheNames) {
          await caches.delete(cacheName);
          console.log(`   - Deleted cache: ${cacheName}`);
        }
        
        console.log('💾 All service worker caches cleared');
      }
    } catch (error) {
      console.error('Error clearing service worker caches:', error);
    }
  }

  /**
   * Unregister all service workers
   */
  async unregisterServiceWorkers() {
    try {
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        console.log(`⚙️ Found ${registrations.length} service worker registrations`);
        
        for (const registration of registrations) {
          await registration.unregister();
          console.log('   - Unregistered service worker');
        }
        
        console.log('⚙️ All service workers unregistered');
      }
    } catch (error) {
      console.error('Error unregistering service workers:', error);
    }
  }

  /**
   * Clear browser caches (if supported)
   */
  async clearBrowserCaches() {
    try {
      // Clear any additional browser-specific caches
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        const estimate = await navigator.storage.estimate();
        console.log(`💽 Storage before cleanup: ${(estimate.usage / 1024 / 1024).toFixed(2)} MB`);
      }
      
      // Force garbage collection if available (Chrome DevTools)
      if (window.gc && typeof window.gc === 'function') {
        window.gc();
        console.log('🗑️ Forced garbage collection');
      }
      
    } catch (error) {
      console.error('Error clearing browser caches:', error);
    }
  }

  /**
   * Get current storage usage information
   */
  async getStorageInfo() {
    const info = {
      localStorage: localStorage.length,
      sessionStorage: sessionStorage.length,
      indexedDB: 'Unknown',
      caches: 0,
      serviceWorkers: 0
    };

    try {
      // Get cache count
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        info.caches = cacheNames.length;
      }

      // Get service worker count
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        info.serviceWorkers = registrations.length;
      }

      // Get storage estimate
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        const estimate = await navigator.storage.estimate();
        info.storageUsage = `${(estimate.usage / 1024 / 1024).toFixed(2)} MB`;
        info.storageQuota = `${(estimate.quota / 1024 / 1024 / 1024).toFixed(2)} GB`;
      }

    } catch (error) {
      console.error('Error getting storage info:', error);
    }

    return info;
  }

  /**
   * Add UI button to developer console for easy access
   */
  addDevButton() {
    // Add to window for console access
    window.clearAllCache = () => this.nukeAllData();
    window.getStorageInfo = () => this.getStorageInfo();
    
    console.log(`
🧹 WanderLog Cache Cleaner v1.11.0 Ready!

Available commands:
- clearAllCache()     : Nuclear option - clear everything
- getStorageInfo()    : Check current storage usage

⚠️ WARNING: clearAllCache() will delete ALL app data and reload the page!
    `);
  }
}

// Initialize the cache cleaner
const cacheCleaner = new CacheCleaner();
cacheCleaner.addDevButton();

// Auto-initialize on script load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    cacheCleaner.addDevButton();
  });
} else {
  cacheCleaner.addDevButton();
}

// Export for use in other modules
window.CacheCleaner = CacheCleaner;
window.cacheCleaner = cacheCleaner;
