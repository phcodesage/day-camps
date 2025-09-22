export class ValidationUtils {
  validateRequired(field) {
    if (field.type === 'checkbox' || field.type === 'radio') {
      return field.checked;
    }
    return field.value.trim() !== '';
  }

  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  validatePhone(phone) {
    // Remove all non-digit characters for validation
    const digits = phone.replace(/\D/g, '');
    
    // Accept phone numbers with 10 or 11 digits (US format)
    return digits.length >= 10 && digits.length <= 11;
  }

  validateAge(age) {
    // Accept both numeric ages and grade levels
    const numericAge = parseInt(age);
    if (!isNaN(numericAge)) {
      return numericAge >= 3 && numericAge <= 18;
    }
    
    // Check for grade formats like "3rd grade", "K", "kindergarten"
    const gradePattern = /^(k|kindergarten|\d{1,2}(st|nd|rd|th)?\s*(grade)?|pre-?k)$/i;
    return gradePattern.test(age.trim());
  }

  sanitizeInput(input) {
    // Basic HTML sanitization - remove potentially dangerous characters
    return input
      .replace(/[<>]/g, '') // Remove < and >
      .trim();
  }

  formatPhone(phone) {
    // Format phone number for display
    const digits = phone.replace(/\D/g, '');
    
    if (digits.length === 10) {
      return `(${digits.substr(0, 3)}) ${digits.substr(3, 3)}-${digits.substr(6, 4)}`;
    } else if (digits.length === 11 && digits[0] === '1') {
      return `+1 (${digits.substr(1, 3)}) ${digits.substr(4, 3)}-${digits.substr(7, 4)}`;
    }
    
    return phone; // Return as-is if doesn't match expected formats
  }

  validateDate(dateString) {
    const date = new Date(dateString);
    const today = new Date();
    
    // Check if date is valid and in the future
    return !isNaN(date.getTime()) && date > today;
  }

  // Method to validate the entire form data structure
  validateFormData(formData) {
    const errors = [];

    // Validate parent information
    if (!formData.parentInfo.name) {
      errors.push('Parent/Guardian name is required');
    }

    if (!formData.parentInfo.email || !this.validateEmail(formData.parentInfo.email)) {
      errors.push('Valid email address is required');
    }

    if (!formData.parentInfo.phone || !this.validatePhone(formData.parentInfo.phone)) {
      errors.push('Valid phone number is required');
    }

    // Validate children
    if (!formData.children || formData.children.length === 0) {
      errors.push('At least one child must be registered');
    } else {
      formData.children.forEach((child, index) => {
        if (!child.name) {
          errors.push(`Child ${index + 1} name is required`);
        }

        if (!child.age || !this.validateAge(child.age)) {
          errors.push(`Child ${index + 1} must have a valid age or grade`);
        }

        if (!child.campType) {
          errors.push(`Child ${index + 1} must have a camp type selected`);
        }

        if (!child.selectedDates || child.selectedDates.length === 0) {
          errors.push(`Child ${index + 1} must have at least one date selected`);
        }
      });
    }

    // Validate payment method
    if (!formData.payment || !formData.payment.method) {
      errors.push('Payment method must be selected');
    }

    // Validate agreements
    if (!formData.additionalInfo.photoConsent) {
      errors.push('Photo/video consent must be agreed to');
    }

    if (!formData.additionalInfo.termsAgreement) {
      errors.push('Terms and conditions must be agreed to');
    }

    return {
      isValid: errors.length === 0,
      errors: errors
    };
  }
}