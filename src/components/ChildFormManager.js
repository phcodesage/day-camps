export class ChildFormManager {
  constructor() {
    this.childCount = 0;
    this.children = [];
    this.container = document.getElementById('children-container');
  }

  addChild() {
    this.childCount++;
    const childId = `child-${this.childCount}`;
    
    const childForm = this.createChildForm(childId, this.childCount);
    this.container.appendChild(childForm);
    
    this.children.push({
      id: childId,
      element: childForm
    });

    this.updateRemoveButtons();
  }

  createChildForm(childId, childNumber) {
    const div = document.createElement('div');
    div.className = 'child-form-card';
    div.id = childId;
    
    div.innerHTML = `
      <div class="child-form-header">
        <span class="child-number">👶 Child ${childNumber}</span>
        ${this.children.length > 0 ? `<button type="button" class="remove-child-btn" data-child="${childId}">×</button>` : ''}
      </div>
      
      <div class="form-row">
        <div class="form-field">
          <label for="${childId}-name">Child's Full Name *</label>
          <input type="text" id="${childId}-name" name="${childId}-name" required>
        </div>
        <div class="form-field">
          <label for="${childId}-age">Age/Grade *</label>
          <input type="text" id="${childId}-age" name="${childId}-age" required placeholder="e.g. 8 years or 3rd grade">
        </div>
      </div>
      
      <div class="form-row">
        <div class="form-field">
          <label for="${childId}-dietary">Dietary Restrictions/Allergies</label>
          <textarea id="${childId}-dietary" name="${childId}-dietary" rows="2" placeholder="Please list any dietary restrictions or allergies..."></textarea>
        </div>
        <div class="form-field">
          <label for="${childId}-special">Special Needs/Accommodations</label>
          <textarea id="${childId}-special" name="${childId}-special" rows="2" placeholder="Any special needs or accommodations..."></textarea>
        </div>
      </div>
      
      <div class="form-field">
        <label for="${childId}-medical">Medical Information</label>
        <textarea id="${childId}-medical" name="${childId}-medical" rows="2" placeholder="Any relevant medical information, medications, etc..."></textarea>
      </div>
      
      <div class="form-field camp-type-field">
        <label>Camp Type *</label>
        <div class="camp-type-selection">
          <div class="camp-type-option">
            <input type="radio" id="${childId}-half-day" name="${childId}-camp-type" value="half-day" required>
            <label for="${childId}-half-day" class="camp-type-card">
              <div class="camp-type-name">🌅 Half Day</div>
              <div class="camp-type-price">$90/day</div>
            </label>
          </div>
          <div class="camp-type-option">
            <input type="radio" id="${childId}-full-day" name="${childId}-camp-type" value="full-day" required>
            <label for="${childId}-full-day" class="camp-type-card">
              <div class="camp-type-name">🌞 Full Day</div>
              <div class="camp-type-price">$150/day</div>
            </label>
          </div>
        </div>
      </div>
      
      <div class="child-dates">
        <h4>📅 Available Dates for this Child</h4>
        <div class="child-dates-grid">
          <div class="child-date-option">
            <input type="checkbox" id="${childId}-date-2025-10-06" name="${childId}-dates" value="2025-10-06" disabled>
            <label for="${childId}-date-2025-10-06">Oct 6</label>
          </div>
          <div class="child-date-option">
            <input type="checkbox" id="${childId}-date-2025-10-09" name="${childId}-dates" value="2025-10-09" disabled>
            <label for="${childId}-date-2025-10-09">Oct 9</label>
          </div>
          <div class="child-date-option">
            <input type="checkbox" id="${childId}-date-2025-10-10" name="${childId}-dates" value="2025-10-10" disabled>
            <label for="${childId}-date-2025-10-10">Oct 10</label>
          </div>
          <div class="child-date-option">
            <input type="checkbox" id="${childId}-date-2025-10-13" name="${childId}-dates" value="2025-10-13" disabled>
            <label for="${childId}-date-2025-10-13">Oct 13</label>
          </div>
          <div class="child-date-option">
            <input type="checkbox" id="${childId}-date-2025-10-20" name="${childId}-dates" value="2025-10-20" disabled>
            <label for="${childId}-date-2025-10-20">Oct 20</label>
          </div>
          <div class="child-date-option">
            <input type="checkbox" id="${childId}-date-2025-11-04" name="${childId}-dates" value="2025-11-04" disabled>
            <label for="${childId}-date-2025-11-04">Nov 4</label>
          </div>
          <div class="child-date-option">
            <input type="checkbox" id="${childId}-date-2025-11-11" name="${childId}-dates" value="2025-11-11" disabled>
            <label for="${childId}-date-2025-11-11">Nov 11</label>
          </div>
          <div class="child-date-option">
            <input type="checkbox" id="${childId}-date-2025-12-15" name="${childId}-dates" value="2025-12-15" disabled>
            <label for="${childId}-date-2025-12-15">Dec 15</label>
          </div>
          <div class="child-date-option">
            <input type="checkbox" id="${childId}-date-2025-12-24" name="${childId}-dates" value="2025-12-24" disabled>
            <label for="${childId}-date-2025-12-24">Dec 24</label>
          </div>
          <div class="child-date-option">
            <input type="checkbox" id="${childId}-date-2025-12-25" name="${childId}-dates" value="2025-12-25" disabled>
            <label for="${childId}-date-2025-12-25">Dec 25</label>
          </div>
          <div class="child-date-option">
            <input type="checkbox" id="${childId}-date-2025-12-26" name="${childId}-dates" value="2025-12-26" disabled>
            <label for="${childId}-date-2025-12-26">Dec 26</label>
          </div>
          <div class="child-date-option">
            <input type="checkbox" id="${childId}-date-2025-12-29" name="${childId}-dates" value="2025-12-29" disabled>
            <label for="${childId}-date-2025-12-29">Dec 29</label>
          </div>
          <div class="child-date-option">
            <input type="checkbox" id="${childId}-date-2025-12-30" name="${childId}-dates" value="2025-12-30" disabled>
            <label for="${childId}-date-2025-12-30">Dec 30</label>
          </div>
          <div class="child-date-option">
            <input type="checkbox" id="${childId}-date-2025-12-31" name="${childId}-dates" value="2025-12-31" disabled>
            <label for="${childId}-date-2025-12-31">Dec 31</label>
          </div>
        </div>
      </div>
    `;

    // Attach event listeners for this child form
    this.attachChildEventListeners(div, childId);

    return div;
  }

  attachChildEventListeners(element, childId) {
    // Remove child button
    const removeBtn = element.querySelector('.remove-child-btn');
    if (removeBtn) {
      removeBtn.addEventListener('click', () => this.removeChild(childId));
    }

    // Camp type and dates change events for pricing updates
    const inputs = element.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
      input.addEventListener('change', () => {
        // Dispatch event for pricing update
        document.dispatchEvent(new CustomEvent('childDataChanged'));
      });
    });
  }

  removeChild(childId) {
    const childIndex = this.children.findIndex(child => child.id === childId);
    if (childIndex > -1) {
      // Remove the DOM element
      const element = document.getElementById(childId);
      if (element) {
        element.remove();
      }

      // Remove from children array
      this.children.splice(childIndex, 1);

      // Update child numbers
      this.updateChildNumbers();
      this.updateRemoveButtons();

      // Dispatch event for pricing update
      document.dispatchEvent(new CustomEvent('childRemoved'));
    }
  }

  updateChildNumbers() {
    this.children.forEach((child, index) => {
      const numberElement = child.element.querySelector('.child-number');
      if (numberElement) {
        numberElement.textContent = `👶 Child ${index + 1}`;
      }
    });
  }

  updateRemoveButtons() {
    // Always show remove button if there's more than one child
    this.children.forEach((child, index) => {
      const removeBtn = child.element.querySelector('.remove-child-btn');
      if (this.children.length > 1) {
        if (!removeBtn) {
          // Add remove button if it doesn't exist
          const header = child.element.querySelector('.child-form-header');
          const button = document.createElement('button');
          button.type = 'button';
          button.className = 'remove-child-btn';
          button.dataset.child = child.id;
          button.textContent = '×';
          button.addEventListener('click', () => this.removeChild(child.id));
          header.appendChild(button);
        }
      } else {
        if (removeBtn) {
          removeBtn.remove();
        }
      }
    });
  }

  getAllChildren() {
    const children = [];
    
    this.children.forEach(child => {
      const element = child.element;
      const childId = child.id;
      
      const name = element.querySelector(`#${childId}-name`)?.value || '';
      const age = element.querySelector(`#${childId}-age`)?.value || '';
      const campType = element.querySelector(`input[name="${childId}-camp-type"]:checked`)?.value || '';
      
      // Get selected dates for this child
      const dateCheckboxes = element.querySelectorAll(`input[name="${childId}-dates"]:checked`);
      const selectedDates = Array.from(dateCheckboxes).map(checkbox => checkbox.value);
      
      const dietary = element.querySelector(`#${childId}-dietary`)?.value || '';
      const special = element.querySelector(`#${childId}-special`)?.value || '';
      const medical = element.querySelector(`#${childId}-medical`)?.value || '';

      children.push({
        id: childId,
        name,
        age,
        campType,
        selectedDates,
        dietary,
        special,
        medical
      });
    });

    return children;
  }

  // Method to populate children data (for loading saved data)
  populateChildren(childrenData) {
    // Clear existing children
    this.children.forEach(child => {
      child.element.remove();
    });
    this.children = [];
    this.childCount = 0;

    // Add children based on saved data
    childrenData.forEach(childData => {
      this.addChild();
      const currentChild = this.children[this.children.length - 1];
      const element = currentChild.element;
      const childId = currentChild.id;

      // Populate form fields
      element.querySelector(`#${childId}-name`).value = childData.name || '';
      element.querySelector(`#${childId}-age`).value = childData.age || '';
      
      if (childData.campType) {
        const campTypeInput = element.querySelector(`input[name="${childId}-camp-type"][value="${childData.campType}"]`);
        if (campTypeInput) campTypeInput.checked = true;
      }

      element.querySelector(`#${childId}-dietary`).value = childData.dietary || '';
      element.querySelector(`#${childId}-special`).value = childData.special || '';
      element.querySelector(`#${childId}-medical`).value = childData.medical || '';

      // Select dates
      if (childData.selectedDates) {
        childData.selectedDates.forEach(date => {
          const dateCheckbox = element.querySelector(`input[name="${childId}-dates"][value="${date}"]`);
          if (dateCheckbox && !dateCheckbox.disabled) {
            dateCheckbox.checked = true;
          }
        });
      }
    });

    // If no children data, add at least one child
    if (childrenData.length === 0) {
      this.addChild();
    }
  }
}