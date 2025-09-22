export class PricingCalculator {
  constructor() {
    this.prices = {
      halfDay: 90,
      fullDay: 150
    };
    
    this.discounts = {
      multiDay: {
        '3-4': 0.05, // 5% for 3-4 days
        '5+': 0.10   // 10% for 5+ days
      },
      sibling: {
        second: 0.10, // 10% for 2nd child
        third: 0.15   // 15% for 3rd+ child
      }
    };
  }

  init() {
    this.pricingSummary = document.getElementById('pricing-summary');
  }

  calculatePricing(children, selectedDates) {
    if (!children.length || !selectedDates.length) {
      this.showEmptyState();
      return;
    }

    const pricing = this.computePricing(children, selectedDates);
    this.displayPricing(pricing);
  }

  computePricing(children, selectedDates) {
    const daysCount = selectedDates.length;
    const multiDayDiscount = this.getMultiDayDiscount(daysCount);
    
    let totalCost = 0;
    const childrenPricing = [];

    children.forEach((child, index) => {
      const basePrice = child.campType === 'half-day' ? this.prices.halfDay : this.prices.fullDay;
      const baseCost = basePrice * daysCount;
      
      // Apply multi-day discount first
      let costAfterMultiDay = baseCost * (1 - multiDayDiscount);
      
      // Apply sibling discount
      const siblingDiscount = this.getSiblingDiscount(index);
      const finalCost = costAfterMultiDay * (1 - siblingDiscount);
      
      childrenPricing.push({
        name: child.name || `Child ${index + 1}`,
        campType: child.campType,
        basePrice,
        daysCount,
        baseCost,
        multiDayDiscount,
        siblingDiscount,
        finalCost
      });
      
      totalCost += finalCost;
    });

    return {
      children: childrenPricing,
      daysCount,
      multiDayDiscount,
      totalCost,
      savings: children.reduce((acc, child, index) => {
        const basePrice = child.campType === 'half-day' ? this.prices.halfDay : this.prices.fullDay;
        return acc + (basePrice * daysCount);
      }, 0) - totalCost
    };
  }

  getMultiDayDiscount(days) {
    if (days >= 5) return this.discounts.multiDay['5+'];
    if (days >= 3) return this.discounts.multiDay['3-4'];
    return 0;
  }

  getSiblingDiscount(childIndex) {
    if (childIndex === 1) return this.discounts.sibling.second;
    if (childIndex >= 2) return this.discounts.sibling.third;
    return 0;
  }

  displayPricing(pricing) {
    const content = this.pricingSummary.querySelector('.pricing-content');
    
    let html = '';
    
    // Children breakdown
    pricing.children.forEach(child => {
      html += `
        <div class="pricing-item">
          <div class="pricing-label">
            ${child.name} (${child.campType === 'half-day' ? 'Half Day' : 'Full Day'})
            <br><small>${child.daysCount} days × $${child.basePrice}</small>
          </div>
          <div class="pricing-value">$${child.finalCost.toFixed(2)}</div>
        </div>
      `;
    });

    // Show discounts if applicable
    if (pricing.multiDayDiscount > 0 || pricing.children.some(c => c.siblingDiscount > 0)) {
      html += `<div class="discount-info">`;
      
      if (pricing.multiDayDiscount > 0) {
        html += `<div>🎉 Multi-day discount: ${(pricing.multiDayDiscount * 100).toFixed(0)}% off</div>`;
      }
      
      const siblingsWithDiscount = pricing.children.filter(c => c.siblingDiscount > 0);
      if (siblingsWithDiscount.length > 0) {
        html += `<div>👨‍👩‍👧‍👦 Sibling discounts applied</div>`;
      }
      
      html += `<div><strong>Total savings: $${pricing.savings.toFixed(2)}</strong></div>`;
      html += `</div>`;
    }

    // Total
    html += `
      <div class="pricing-item">
        <div class="pricing-label">Total Cost</div>
        <div class="pricing-value">$${pricing.totalCost.toFixed(2)}</div>
      </div>
    `;

    content.innerHTML = html;
  }

  showEmptyState() {
    const content = this.pricingSummary.querySelector('.pricing-content');
    content.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🏕️</div>
        <p>Add children and select dates to see pricing</p>
      </div>
    `;
  }
}