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

    // Payment method show/hide for details sections
    const updatePaymentDetailsVisibility = () => {
      const method = document.querySelector('input[name="paymentMethod"]:checked')?.value;
      const cardSection = document.getElementById('card-details');
      const bankSection = document.getElementById('bank-details');
      const isCard = method === 'credit-card';
      const isBank = method === 'bank-transfer';
      if (cardSection) cardSection.classList.toggle('hidden', !isCard);
      if (bankSection) bankSection.classList.toggle('hidden', !isBank);
    };
    const paymentRadios = document.querySelectorAll('input[name="paymentMethod"]');
    paymentRadios.forEach(r => r.addEventListener('change', () => {
      updatePaymentDetailsVisibility();
      this.updatePricing();
    }));
    // Initialize visibility on load
    updatePaymentDetailsVisibility();

    // Animate hero section on load
    this.animateHero();

    // Make the camp cards clickable and sync with child radios
    this.setupCampCardSelection();
  }

  async handleFormSubmit(e) {
    e.preventDefault();

    const submitBtn = document.getElementById('submit-registration');
    const formEl = document.getElementById('camp-registration-form');
    const originalText = submitBtn?.textContent;
    const setLoading = (loading) => {
      if (!submitBtn) return;
      submitBtn.disabled = loading;
      submitBtn.classList.toggle('is-loading', !!loading);
      submitBtn.textContent = loading ? 'Submitting…' : originalText || '🎯 Submit Registration';
      if (formEl) formEl.setAttribute('aria-busy', loading ? 'true' : 'false');
    };

    if (!this.formHandler.validateForm()) return;

    try {
      // Guard against double-clicks
      if (submitBtn?.disabled) return;
      setLoading(true);
      const form = this.formHandler.collectFormData();
      const selectedDates = this.dateSelector.getSelectedDates();
      const pricing = this.pricingCalculator.getLastPricing();

      const payload = {
        form,
        pricing,
        pricingInput: { daysCount: selectedDates.length, selectedDates },
        payment: form?.payment || {},
      };

      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) {
        throw new Error(data?.error || `Request failed (${res.status})`);
      }

      this.showSuccessModal();
      this.clearSavedData();
    } catch (err) {
      console.error('Submit error', err);
      this.showNotification(`Submission failed: ${err?.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
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
  const app = new DayCampRegistration();
  // Expose for dev testing only
  if (import.meta?.env?.DEV) {
    window.app = app;
    window.runDemoTest = async function runDemoTest(toEmail = 'phcodesage@gmail.com') {
      const sleep = (ms) => new Promise(r => setTimeout(r, ms));
      const formEl = document.getElementById('camp-registration-form');
      const ensureClick = (el) => { if (el && !el.classList.contains('selected')) el.click(); };

      // 1) Fill parent/guardian info
      document.getElementById('parent-name').value = 'Demo Parent';
      document.getElementById('email').value = toEmail;
      document.getElementById('phone').value = '555-123-4567';
      document.getElementById('emergency-contact').value = 'Demo Contact';
      document.getElementById('emergency-phone').value = '555-987-6543';
      document.getElementById('pickup-authorization').value = 'Demo Aunt, Demo Uncle';
      document.getElementById('special-requests').value = 'No peanuts please';
      const photoConsent = document.querySelector('input[name="photoConsent"]');
      const termsAgreement = document.querySelector('input[name="termsAgreement"]');
      if (photoConsent) photoConsent.checked = true;
      if (termsAgreement) termsAgreement.checked = true;

      // 2) Select a couple of available dates (triggers DateSelector logic)
      const dateOptions = document.querySelectorAll('.date-option');
      ensureClick(dateOptions[0]);
      ensureClick(dateOptions[1]);

      // Allow DateSelector to update child date checkboxes
      await sleep(50);

      // 3) Ensure first child exists and set camp type to full-day
      const childCard = document.querySelector('.child-form-card');
      if (!childCard) {
        app.childFormManager.addChild();
      }
      const firstChild = document.querySelector('.child-form-card');
      const childId = firstChild?.id;
      if (childId) {
        const fullDay = firstChild.querySelector(`input[name="${childId}-camp-type"][value="full-day"]`)
        if (fullDay) {
          fullDay.checked = true;
          fullDay.dispatchEvent(new Event('change', { bubbles: true }));
        }
        // Select available dates for the child (first two enabled)
        const childDateChecks = firstChild.querySelectorAll(`input[name="${childId}-dates"]`);
        let checked = 0;
        childDateChecks.forEach(cb => {
          if (!cb.disabled && checked < 2) {
            cb.checked = true;
            cb.dispatchEvent(new Event('change', { bubbles: true }));
            checked++;
          }
        });
      }

      // 4) Choose a payment method
      const pay = document.querySelector('input[name="paymentMethod"][value="bank-transfer"]')
              || document.querySelector('input[name="paymentMethod"]');
      if (pay) {
        pay.checked = true;
        pay.dispatchEvent(new Event('change', { bubbles: true }));
      }

      // 5) Trigger pricing update and submit
      app.updatePricing();
      await sleep(50);

      const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
      formEl.dispatchEvent(submitEvent);
      return 'Demo test triggered: form submitted';
    };
  }
});