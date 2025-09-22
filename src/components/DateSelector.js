export class DateSelector {
  constructor() {
    this.selectedDates = new Set();
    this.dateOptions = [];
  }

  init() {
    this.setupDateOptions();
    this.attachEventListeners();
  }

  setupDateOptions() {
    this.dateOptions = document.querySelectorAll('.date-option');
  }

  attachEventListeners() {
    this.dateOptions.forEach(option => {
      option.addEventListener('click', () => {
        this.toggleDateSelection(option);
      });
    });
  }

  toggleDateSelection(option) {
    const dates = option.dataset.date.split(',');
    
    if (option.classList.contains('selected')) {
      // Deselect
      option.classList.remove('selected');
      dates.forEach(date => {
        this.selectedDates.delete(date);
      });
    } else {
      // Select
      option.classList.add('selected');
      dates.forEach(date => {
        this.selectedDates.add(date);
      });
    }

    this.updateChildDateOptions();
    this.dispatchSelectionChanged();
  }

  updateChildDateOptions() {
    // Update all child date checkboxes based on global selection
    const childDateContainers = document.querySelectorAll('.child-dates-grid');
    
    childDateContainers.forEach(container => {
      const checkboxes = container.querySelectorAll('input[type="checkbox"]');
      
      checkboxes.forEach(checkbox => {
        const dateValue = checkbox.value;
        const isGloballySelected = this.selectedDates.has(dateValue);
        
        checkbox.disabled = !isGloballySelected;
        
        if (!isGloballySelected) {
          checkbox.checked = false;
        }
        
        const option = checkbox.closest('.child-date-option');
        if (option) {
          option.style.opacity = isGloballySelected ? '1' : '0.5';
        }
      });
    });
  }

  getSelectedDates() {
    return Array.from(this.selectedDates);
  }

  dispatchSelectionChanged() {
    document.dispatchEvent(new CustomEvent('dateSelectionChanged', {
      detail: { selectedDates: this.getSelectedDates() }
    }));
  }

  // Method to programmatically select dates (for loading saved data)
  selectDates(dates) {
    dates.forEach(date => {
      this.selectedDates.add(date);
      
      // Find and mark the corresponding date option
      this.dateOptions.forEach(option => {
        const optionDates = option.dataset.date.split(',');
        if (optionDates.includes(date)) {
          option.classList.add('selected');
        }
      });
    });
    
    this.updateChildDateOptions();
  }
}