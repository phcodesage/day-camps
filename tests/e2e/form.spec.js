// @ts-check
import { test, expect } from '@playwright/test';

// Helper to select first N enabled checkboxes matching a locator
async function checkFirstEnabled(locator, count) {
  const boxes = await locator.elementHandles();
  let checked = 0;
  for (const cb of boxes) {
    const disabled = await cb.isDisabled();
    if (!disabled) {
      await cb.check();
      checked++;
      if (checked >= count) break;
    }
  }
  return checked;
}

test('user can complete registration flow and see success modal (API mocked)', async ({ page }) => {
  // Mock the email API to avoid sending real emails during tests
  await page.route('**/api/send-email', async (route) => {
    const request = route.request();
    const postData = request.postDataJSON?.() || {};
    // Basic sanity assertions on payload
    expect(postData).toHaveProperty('form');
    expect(postData).toHaveProperty('pricingInput');
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ ok: true })
    });
  });

  await page.goto('/');

  // Hero renders
  await expect(page.locator('.hero-title')).toBeVisible();

  // Pick some dates (global)
  const dateOptions = page.locator('.date-option');
  await dateOptions.nth(0).click();
  await dateOptions.nth(1).click();

  // Ensure at least one child exists (app adds one on init, but be safe)
  const addChildBtn = page.locator('#add-child');
  const childCards = page.locator('.child-form-card');
  if ((await childCards.count()) === 0) {
    await addChildBtn.click();
  }

  // Fill parent info
  await page.fill('#parent-name', 'Playwright Tester');
  await page.fill('#email', 'phcodesage@gmail.com');
  await page.fill('#phone', '555-111-2222');
  await page.fill('#emergency-contact', 'Emergency Person');
  await page.fill('#emergency-phone', '555-222-3333');

  // Consent checkboxes (styled, label overlay may intercept pointer). Use setChecked.
  await page.locator('input[name="photoConsent"]').setChecked(true, { force: true });
  await page.locator('input[name="termsAgreement"]').setChecked(true, { force: true });

  // Choose camp type (full-day)
  const firstChild = page.locator('.child-form-card').first();
  await firstChild.waitFor({ state: 'visible' });
  await firstChild.scrollIntoViewIfNeeded();
  const childId = await firstChild.getAttribute('id');
  // Target by id for reliability and force the check (styled labels may overlay)
  await page.locator(`#${childId}-full-day`).check({ force: true });

  // Wait until at least one child date checkbox is enabled (global selection propagates)
  await page.waitForSelector(`input[name="${childId}-dates"]:not([disabled])`);
  // Select two enabled dates for child
  const childDateBoxes = page.locator(`input[name="${childId}-dates"]`);
  const selected = await checkFirstEnabled(childDateBoxes, 2);
  expect(selected).toBeGreaterThan(0);

  // Choose a payment method
  await page.locator('input[name="paymentMethod"][value="bank-transfer"]').check();

  // Submit
  await page.click('#submit-registration');

  // Expect success modal
  const modal = page.locator('#success-modal .modal-content');
  await expect(modal).toBeVisible();
});
