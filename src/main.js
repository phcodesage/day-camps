import './styles/style.css';
import './styles/components.css';
import { PricingCalculator } from './components/PricingCalculator.js';
import { DateSelector } from './components/DateSelector.js';
import { ChildFormManager } from './components/ChildFormManager.js';
import { FormHandler } from './utils/formHandler.js';

class DayCampRegistration {
  constructor() {
    this.pricingCalculator = new PricingCalculator();
    this.dateSelector = new DateSelector();
    this.childFormManager = new ChildFormManager();
    this.formHandler = new FormHandler();
    this.selectedCampType = null; // 'half-day' | 'full-day'

    this.init();
  }

  init() {
    this.setupEventListeners();
    this.loadSavedData();
    
    // Add initial child form
    this.childFormManager.addChild();
    // If a camp type was selected from saved data or future default, apply to the first child
    if (this.selectedCampType) {
      this.applyCampTypeToAll(this.selectedCampType);
    }
    
    // Initialize components
    this.dateSelector.init();
    this.pricingCalculator.init();
  }

  setupEventListeners() {
    // Add child button
    const addChildBtn = document.getElementById('add-child');
    addChildBtn?.addEventListener('click', () => {
      this.childFormManager.addChild();
      // Apply selected camp type to newly added child
      if (this.selectedCampType) {
        this.applyCampTypeToAll(this.selectedCampType);
      }
      this.updatePricing();
    });

    // Form submission
    const form = document.getElementById('camp-registration-form');
    form?.addEventListener('submit', (e) => this.handleFormSubmit(e));

    // Save draft
    const saveDraftBtn = document.getElementById('save-draft');
    saveDraftBtn?.addEventListener('click', () => this.saveDraft());

    // Auto-save on form changes
    form?.addEventListener('input', () => {
      this.autoSave();
      this.updatePricing();
    });

    // Date selection changes
    document.addEventListener('dateSelectionChanged', () => {
      this.updatePricing();
    });

    // Child removed event
    document.addEventListener('childRemoved', () => {
      this.updatePricing();
    });

    // Any child field changes (including camp type) -> update pricing
    document.addEventListener('childDataChanged', () => {
      this.updatePricing();
    });

    // Success modal
    const closeSuccessBtn = document.getElementById('close-success');
    closeSuccessBtn?.addEventListener('click', () => {
      document.getElementById('success-modal').style.display = 'none';
    });

    // Animate hero section on load
    this.animateHero();

    // Make the camp cards clickable and sync with child radios
    this.setupCampCardSelection();
  }

  handleFormSubmit(e) {
    e.preventDefault();
    
    if (this.formHandler.validateForm()) {
      const formData = this.formHandler.collectFormData();
      
      // Simulate form submission
      this.showSuccessModal();
      this.clearSavedData();
      
      // Log the form data for development
      console.log('Form submitted:', formData);
    }
  }

  updatePricing() {
    const children = this.childFormManager.getAllChildren();
    const selectedDates = this.dateSelector.getSelectedDates();
    
    this.pricingCalculator.calculatePricing(children, selectedDates);
  }

  saveDraft() {
    const formData = this.formHandler.collectFormData();
    this.formHandler.saveToLocalStorage(formData);
    
    // Show save confirmation
    this.showNotification('Draft saved successfully! 💾');
  }

  autoSave() {
    // Debounced auto-save
    clearTimeout(this.autoSaveTimeout);
    this.autoSaveTimeout = setTimeout(() => {
      const formData = this.formHandler.collectFormData();
      this.formHandler.saveToLocalStorage(formData);
    }, 1000);
  }

  loadSavedData() {
    const savedData = this.formHandler.loadFromLocalStorage();
    if (savedData) {
      this.formHandler.populateForm(savedData);
      this.showNotification('Previous draft loaded 📋');
    }
  }

  clearSavedData() {
    this.formHandler.clearLocalStorage();
  }

  showSuccessModal() {
    const modal = document.getElementById('success-modal');
    modal.style.display = 'flex';
  }

  showNotification(message) {
    // Create a simple notification
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.classList.add('show');
    }, 100);

    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => document.body.removeChild(notification), 300);
    }, 3000);
  }

  animateHero() {
    const heroTitle = document.querySelector('.hero-title');
    const heroSubtitle = document.querySelector('.hero-subtitle');
    const featureBadges = document.querySelectorAll('.feature-badge');

    // Animate title
    setTimeout(() => {
      heroTitle.style.opacity = '1';
      heroTitle.style.transform = 'translateY(0)';
    }, 300);

    // Animate subtitle
    setTimeout(() => {
      heroSubtitle.style.opacity = '1';
      heroSubtitle.style.transform = 'translateY(0)';
    }, 600);

    // Animate badges
    featureBadges.forEach((badge, index) => {
      setTimeout(() => {
        badge.style.opacity = '1';
        badge.style.transform = 'translateY(0) scale(1)';
      }, 900 + (index * 150));
    });
  }

  setupCampCardSelection() {
    const cards = Array.from(document.querySelectorAll('#camp-options .camp-card[data-camp-type]'));
    if (!cards.length) return;

    const setSelected = (type) => {
      this.selectedCampType = type;
      cards.forEach(card => {
        const isSelected = card.getAttribute('data-camp-type') === type;
        card.classList.toggle('selected', isSelected);
        card.setAttribute('aria-pressed', isSelected ? 'true' : 'false');
      });
      this.applyCampTypeToAll(type);
      this.updatePricing();
    };

    // Attach handlers
    cards.forEach(card => {
      card.addEventListener('click', () => setSelected(card.getAttribute('data-camp-type')));
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          setSelected(card.getAttribute('data-camp-type'));
        }
      });
    });
  }

  applyCampTypeToAll(type) {
    // Iterate through child forms and set the corresponding radio
    const children = this.childFormManager.children || [];
    children.forEach(child => {
      const el = child.element;
      if (!el) return;
      const childId = child.id;
      const input = el.querySelector(`input[name="${childId}-camp-type"][value="${type}"]`);
      if (input) {
        if (!input.checked) {
          input.checked = true;
          // Dispatch change event so listeners update pricing
          input.dispatchEvent(new Event('change', { bubbles: true }));
        }
      }
    });
  }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
  new DayCampRegistration();
});