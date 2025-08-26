// Mobile Date Input Fixes for WanderLog PWA
// Version: 1.0.0

// Mobile-specific date input handling
class MobileDateHandler {
  constructor() {
    this.isMobile = this.detectMobile();
    this.init();
  }

  detectMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  init() {
    if (this.isMobile) {
      this.setupMobileDateFixes();
    }
  }

  setupMobileDateFixes() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.applyMobileFixes());
    } else {
      this.applyMobileFixes();
    }

    // Also apply fixes when modals are opened
    document.addEventListener('click', (e) => {
      if (e.target.id === 'addTripBtn' || e.target.closest('#addTripBtn')) {
        setTimeout(() => this.fixTripModalDates(), 100);
      }
    });

    // Apply fixes when accommodation modal is opened
    window.addEventListener('accommodationModalOpened', () => {
      setTimeout(() => this.fixAccommodationModalDates(), 100);
    });
  }

  applyMobileFixes() {
    // Fix all existing date inputs on page
    const dateInputs = document.querySelectorAll('input[type="date"]');
    dateInputs.forEach(input => this.setupDateInput(input));
  }

  setupDateInput(input) {
    if (!this.isMobile) return;

    // Add mobile-specific attributes
    input.setAttribute('pattern', '\\d{4}-\\d{2}-\\d{2}');
    input.setAttribute('placeholder', 'YYYY-MM-DD');

    // Ensure proper validation on mobile
    input.addEventListener('input', (e) => {
      this.validateDateInput(e.target);
    });

    input.addEventListener('change', (e) => {
      this.validateDateInput(e.target);
    });

    // Force revalidation when min/max attributes change
    const observer = new MutationObserver(() => {
      this.validateDateInput(input);
    });
    
    observer.observe(input, {
      attributes: true,
      attributeFilter: ['min', 'max']
    });
  }

  validateDateInput(input) {
    if (!input.value) return;

    const inputDate = new Date(input.value);
    const minDate = input.min ? new Date(input.min) : null;
    const maxDate = input.max ? new Date(input.max) : null;

    let isValid = true;
    let errorMessage = '';

    if (minDate && inputDate < minDate) {
      isValid = false;
      errorMessage = `Date cannot be before ${this.formatDate(minDate)}`;
    }

    if (maxDate && inputDate > maxDate) {
      isValid = false;
      errorMessage = `Date cannot be after ${this.formatDate(maxDate)}`;
    }

    if (!isValid) {
      input.style.borderColor = '#e53e3e';
      input.style.backgroundColor = '#fee';
      
      // Show error message
      this.showDateError(input, errorMessage);
      
      // Clear the invalid value after a short delay
      setTimeout(() => {
        input.value = '';
        input.style.borderColor = '';
        input.style.backgroundColor = '';
        this.hideDateError(input);
      }, 2000);
    } else {
      input.style.borderColor = '';
      input.style.backgroundColor = '';
      this.hideDateError(input);
    }
  }

  formatDate(date) {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  showDateError(input, message) {
    // Remove existing error
    this.hideDateError(input);
    
    const error = document.createElement('div');
    error.className = 'mobile-date-error';
    error.textContent = message;
    error.style.cssText = `
      color: #e53e3e;
      font-size: 12px;
      margin-top: 4px;
      padding: 4px;
      background: #fee;
      border: 1px solid #fcc;
      border-radius: 4px;
    `;
    
    input.parentNode.insertBefore(error, input.nextSibling);
  }

  hideDateError(input) {
    const error = input.parentNode.querySelector('.mobile-date-error');
    if (error) {
      error.remove();
    }
  }

  fixTripModalDates() {
    const tripStartDate = document.getElementById('tripStartDate');
    const tripEndDate = document.getElementById('tripEndDate');

    if (tripStartDate) this.setupDateInput(tripStartDate);
    if (tripEndDate) this.setupDateInput(tripEndDate);
  }

  fixAccommodationModalDates() {
    const checkInInput = document.getElementById('accommodationCheckIn');
    const checkOutInput = document.getElementById('accommodationCheckOut');

    if (checkInInput) this.setupDateInput(checkInInput);
    if (checkOutInput) this.setupDateInput(checkOutInput);
  }
}

// Auto-initialize on script load
const mobileDateHandler = new MobileDateHandler();

// Make it globally available
window.mobileDateHandler = mobileDateHandler;

// Add event trigger for accommodation modal
const originalOpenAccommodationModal = window.openAccommodationModal;
if (originalOpenAccommodationModal) {
  window.openAccommodationModal = function(...args) {
    originalOpenAccommodationModal.apply(this, args);
    // Trigger event for mobile date handler
    window.dispatchEvent(new CustomEvent('accommodationModalOpened'));
  };
}
