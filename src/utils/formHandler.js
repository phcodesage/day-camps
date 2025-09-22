import { ValidationUtils } from './validation.js';

export class FormHandler {
  constructor() {
    this.validator = new ValidationUtils();
    this.storageKey = 'day-camp-registration-draft';
  }

  validateForm() {
    const form = document.getElementById('camp-registration-form');
    let isValid = true;
    
    // Clear previous error messages
    this.clearErrorMessages();

    // Validate required fields
    const requiredFields = form.querySelectorAll('[required]');
    requiredFields.forEach(field => {
      if (!this.validator.validateRequired(field)) {
        this.showFieldError(field, 'This field is required');
        isValid = false;
      }
    });

    // Validate email
    const emailField = document.getElementById('email');
    if (emailField && emailField.value && !this.validator.validateEmail(emailField.value)) {
      this.showFieldError(emailField, 'Please enter a valid email address');
      isValid = false;
    }

    // Validate phone numbers
    const phoneFields = [document.getElementById('phone'), document.getElementById('emergency-phone')];
    phoneFields.forEach(field => {
      if (field && field.value && !this.validator.validatePhone(field.value)) {
        this.showFieldError(field, 'Please enter a valid phone number');
        isValid = false;
      }
    });

    // Validate children have camp types and dates selected
    const childForms = document.querySelectorAll('.child-form-card');
    childForms.forEach((childForm, index) => {
      const childId = childForm.id;
      
      // Check camp type selection
      const campTypeSelected = childForm.querySelector(`input[name="${childId}-camp-type"]:checked`);
      if (!campTypeSelected) {
        this.showFormError(`Please select a camp type for Child ${index + 1}`);
        isValid = false;
      }

      // Check at least one date is selected for the child
      const datesSelected = childForm.querySelectorAll(`input[name="${childId}-dates"]:checked`);
      if (datesSelected.length === 0) {
        this.showFormError(`Please select at least one date for Child ${index + 1}`);
        isValid = false;
      }
    });

    // Validate payment method
    const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked');
    if (!paymentMethod) {
      this.showFormError('Please select a payment method');
      isValid = false;
    }

    // Validate required checkboxes
    const requiredCheckboxes = document.querySelectorAll('input[type="checkbox"][required]');
    requiredCheckboxes.forEach(checkbox => {
      if (!checkbox.checked) {
        this.showFormError('Please accept all required terms and conditions');
        isValid = false;
      }
    });

    return isValid;
  }

  collectFormData() {
    const form = document.getElementById('camp-registration-form');
    const formData = {
      timestamp: new Date().toISOString(),
      parentInfo: {
        name: document.getElementById('parent-name')?.value || '',
        email: document.getElementById('email')?.value || '',
        phone: document.getElementById('phone')?.value || '',
        emergencyContact: document.getElementById('emergency-contact')?.value || '',
        emergencyPhone: document.getElementById('emergency-phone')?.value || ''
      },
      children: this.collectChildrenData(),
      additionalInfo: {
        pickupAuthorization: document.getElementById('pickup-authorization')?.value || '',
        specialRequests: document.getElementById('special-requests')?.value || '',
        photoConsent: document.querySelector('input[name="photoConsent"]')?.checked || false,
        termsAgreement: document.querySelector('input[name="termsAgreement"]')?.checked || false
      },
      payment: {
        method: document.querySelector('input[name="paymentMethod"]:checked')?.value || ''
      }
    };

    return formData;
  }

  collectChildrenData() {
    const children = [];
    const childForms = document.querySelectorAll('.child-form-card');

    childForms.forEach(childForm => {
      const childId = childForm.id;
      
      const selectedDates = [];
      const dateCheckboxes = childForm.querySelectorAll(`input[name="${childId}-dates"]:checked`);
      dateCheckboxes.forEach(checkbox => {
        selectedDates.push(checkbox.value);
      });

      children.push({
        name: childForm.querySelector(`#${childId}-name`)?.value || '',
        age: childForm.querySelector(`#${childId}-age`)?.value || '',
        dietary: childForm.querySelector(`#${childId}-dietary`)?.value || '',
        special: childForm.querySelector(`#${childId}-special`)?.value || '',
        medical: childForm.querySelector(`#${childId}-medical`)?.value || '',
        campType: childForm.querySelector(`input[name="${childId}-camp-type"]:checked`)?.value || '',
        selectedDates
      });
    });

    return children;
  }

  populateForm(formData) {
    if (!formData) return;

    // Populate parent information
    if (formData.parentInfo) {
      const parentFields = {
        'parent-name': formData.parentInfo.name,
        'email': formData.parentInfo.email,
        'phone': formData.parentInfo.phone,
        'emergency-contact': formData.parentInfo.emergencyContact,
        'emergency-phone': formData.parentInfo.emergencyPhone
      };

      Object.entries(parentFields).forEach(([fieldId, value]) => {
        const field = document.getElementById(fieldId);
        if (field && value) field.value = value;
      });
    }

    // Populate additional information
    if (formData.additionalInfo) {
      const additionalFields = {
        'pickup-authorization': formData.additionalInfo.pickupAuthorization,
        'special-requests': formData.additionalInfo.specialRequests
      };

      Object.entries(additionalFields).forEach(([fieldId, value]) => {
        const field = document.getElementById(fieldId);
        if (field && value) field.value = value;
      });

      // Checkboxes
      const photoConsent = document.querySelector('input[name="photoConsent"]');
      const termsAgreement = document.querySelector('input[name="termsAgreement"]');
      
      if (photoConsent) photoConsent.checked = formData.additionalInfo.photoConsent || false;
      if (termsAgreement) termsAgreement.checked = formData.additionalInfo.termsAgreement || false;
    }

    // Populate payment method
    if (formData.payment && formData.payment.method) {
      const paymentInput = document.querySelector(`input[name="paymentMethod"][value="${formData.payment.method}"]`);
      if (paymentInput) paymentInput.checked = true;
    }

    // Populate children data would be handled by ChildFormManager
    // This is called after children are populated
  }

  saveToLocalStorage(formData) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(formData));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }

  loadFromLocalStorage() {
    try {
      const savedData = localStorage.getItem(this.storageKey);
      return savedData ? JSON.parse(savedData) : null;
    } catch (error) {
      console.error('Error loading from localStorage:', error);
      return null;
    }
  }

  clearLocalStorage() {
    try {
      localStorage.removeItem(this.storageKey);
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }

  showFieldError(field, message) {
    field.classList.add('error');
    
    // Remove existing error message
    const existingError = field.parentNode.querySelector('.error-message');
    if (existingError) {
      existingError.remove();
    }

    // Add new error message
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    field.parentNode.appendChild(errorDiv);
  }

  showFormError(message) {
    // Create or update a general error message area
    let errorContainer = document.querySelector('.form-error-messages');
    
    if (!errorContainer) {
      errorContainer = document.createElement('div');
      errorContainer.className = 'form-error-messages';
      
      const form = document.getElementById('camp-registration-form');
      form.insertBefore(errorContainer, form.firstChild);
    }

    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message form-error';
    errorDiv.textContent = message;
    errorDiv.style.cssText = `
      background: #f8d7da;
      color: #721c24;
      padding: 12px;
      border-radius: 4px;
      margin-bottom: 16px;
      border: 1px solid #f5c6cb;
    `;
    
    errorContainer.appendChild(errorDiv);
  }

  clearErrorMessages() {
    // Clear field errors
    const errorFields = document.querySelectorAll('.error');
    errorFields.forEach(field => field.classList.remove('error'));

    const errorMessages = document.querySelectorAll('.error-message');
    errorMessages.forEach(message => message.remove());

    // Clear form errors
    const errorContainer = document.querySelector('.form-error-messages');
    if (errorContainer) {
      errorContainer.innerHTML = '';
    }
  }
}