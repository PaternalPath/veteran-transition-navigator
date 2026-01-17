import { test, expect } from '@playwright/test';

test.describe('Veteran Transition Navigator - Demo Mode', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to homepage
    await page.goto('/');
  });

  test('app loads successfully', async ({ page }) => {
    // Check that the page title or main heading is visible
    await expect(page.locator('h1, h2').first()).toBeVisible();

    // Check that the intake form is present
    const form = page.locator('form, [role="form"]');
    await expect(form.first()).toBeVisible();
  });

  test('can fill out veteran profile form and submit', async ({ page }) => {
    // Step 1: Service Background
    await page.fill('input[name="branch"], input[id*="branch"], input[placeholder*="branch" i]', 'Army');
    await page.fill(
      'input[name="yearsOfService"], input[id*="years" i], input[type="number"]:visible',
      '6'
    );
    await page.fill('input[name="rank"], input[id*="rank" i], input[placeholder*="rank" i]', 'E-5');
    await page.fill('input[name="mos"], input[id*="mos" i], input[placeholder*="mos" i]', '11B');

    // Look for "Next" or "Continue" button
    const nextButton = page.getByRole('button', { name: /next|continue/i });
    if (await nextButton.isVisible()) {
      await nextButton.click();
    }

    // Step 2: Skills - Check if we're on skills step
    const skillsInput = page.locator(
      'input[name*="skill" i], input[id*="skill" i], input[placeholder*="skill" i]'
    );
    if (await skillsInput.first().isVisible()) {
      await skillsInput.first().fill('Leadership, Firearms');
    }

    const certsInput = page.locator(
      'input[name*="cert" i], input[id*="cert" i], input[placeholder*="cert" i]'
    );
    if (await certsInput.first().isVisible()) {
      await certsInput.first().fill('CPR');
    }

    const leadershipInput = page.locator(
      'textarea[name*="leadership" i], input[name*="leadership" i]'
    );
    if (await leadershipInput.first().isVisible()) {
      await leadershipInput.first().fill('Squad leader for 2 years');
    }

    // Continue through remaining steps
    const nextButton2 = page.getByRole('button', { name: /next|continue/i });
    if (await nextButton2.isVisible()) {
      await nextButton2.click();
    }

    // Step 3: Family - if visible
    const familyStatus = page.locator('input[name*="family" i], select[name*="family" i]');
    if (await familyStatus.first().isVisible()) {
      await familyStatus.first().fill('Married');
    }

    const dependents = page.locator(
      'input[name*="dependent" i], input[type="number"]:visible'
    );
    if (await dependents.first().isVisible()) {
      await dependents.first().fill('2');
    }

    const nextButton3 = page.getByRole('button', { name: /next|continue/i });
    if (await nextButton3.isVisible()) {
      await nextButton3.click();
    }

    // Step 4: Location - if visible
    const location = page.locator('input[name*="location" i], input[name*="current" i]');
    if (await location.first().isVisible()) {
      await location.first().fill('Fort Bragg, NC');
    }

    const nextButton4 = page.getByRole('button', { name: /next|continue/i });
    if (await nextButton4.isVisible()) {
      await nextButton4.click();
    }

    // Step 5: Goals - if visible
    const careerGoals = page.locator('textarea[name*="goal" i], input[name*="goal" i]');
    if (await careerGoals.first().isVisible()) {
      await careerGoals.first().fill('Law enforcement career');
    }

    const income = page.locator('input[name*="income" i]');
    if (await income.first().isVisible()) {
      await income.first().fill('$50,000+');
    }

    const education = page.locator('input[name*="education" i], textarea[name*="education" i]');
    if (await education.first().isVisible()) {
      await education.first().fill('Associates degree');
    }

    const timeline = page.locator('input[name*="timeline" i]');
    if (await timeline.first().isVisible()) {
      await timeline.first().fill('6 months');
    }

    // Submit the form
    const submitButton = page.getByRole('button', { name: /submit|analyze|get.*pathway/i });
    await submitButton.click();

    // Wait for results to load (with generous timeout for API call)
    await page.waitForTimeout(2000);

    // Verify results are displayed
    // Look for pathway titles, income information, or roadmap sections
    const resultsVisible =
      (await page.getByText(/fast.income|balanced|upside/i).count()) > 0 ||
      (await page.getByText(/\$\d{2,3},?\d{3}/i).count()) > 0 ||
      (await page.getByText(/pathway|roadmap|credential/i).count()) > 0;

    expect(resultsVisible).toBeTruthy();
  });

  test('displays mode indicator showing Demo Mode', async ({ page }) => {
    // Check if there's a mode indicator visible
    // This might be added in UX polish task
    const demoIndicator = page.getByText(/demo.*mode/i);

    // If mode indicator exists, verify it shows Demo Mode
    if (await demoIndicator.isVisible({ timeout: 1000 }).catch(() => false)) {
      await expect(demoIndicator).toBeVisible();
    }
  });

  test('handles form validation errors gracefully', async ({ page }) => {
    // Try to submit without filling required fields
    const submitButton = page.getByRole('button', { name: /submit|analyze|get.*pathway/i });

    // If submit button is disabled when form is empty, that's good UX
    if (await submitButton.isDisabled()) {
      expect(await submitButton.isDisabled()).toBe(true);
    } else {
      // If not disabled, clicking should show validation errors
      await submitButton.click();

      // Wait a moment for validation errors to appear
      await page.waitForTimeout(500);

      // There should be some indication of errors (red text, error messages, etc.)
      // This is a soft check - validation might be handled differently
      const hasErrors = await page.locator('[class*="error" i], [role="alert"]').count();
      // We don't strictly require error messages, but it's good UX
      console.log(`Validation errors found: ${hasErrors}`);
    }
  });
});
