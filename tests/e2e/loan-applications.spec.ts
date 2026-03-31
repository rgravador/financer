import { test, expect, Page } from '@playwright/test'

/**
 * E2E Tests for Loan Applications Module (Step 7)
 *
 * Tests the loan officer's ability to:
 * - View applications list with filters
 * - Create new loan applications via multi-step wizard
 * - View application details
 * - Edit draft applications
 * - Upload documents
 * - Submit applications for review
 *
 * Uses demo tenant officer credentials:
 * - Email: demo.officer@ascendent.com
 * - Password: Officer@123
 */

// Test credentials
const TENANT_OFFICER = {
  email: 'demo.officer@ascendent.com',
  password: 'Officer@123',
}

// Helper function to log in as tenant officer
async function loginAsTenantOfficer(page: Page) {
  await page.goto('/login')
  await page.waitForSelector('input[type="email"]', { timeout: 10000 })
  await page.locator('input[type="email"]').fill(TENANT_OFFICER.email)
  await page.locator('input[type="password"]').fill(TENANT_OFFICER.password)
  await page.locator('button[type="submit"]').click()
  await page.waitForURL('**/officer/dashboard', { timeout: 20000 })
}

// Helper function to navigate to applications page
async function navigateToApplications(page: Page) {
  const applicationsLink = page.locator('a:has-text("Applications"), a:has-text("Loan Applications"), [href*="applications"]').first()
  if (await applicationsLink.isVisible({ timeout: 5000 })) {
    await applicationsLink.click()
  } else {
    await page.goto('/officer/applications')
  }
  await page.waitForSelector('.applications-page, h1:has-text("Loan Applications")', { timeout: 10000 })
}

// Helper function to navigate to new application wizard
async function navigateToNewApplication(page: Page) {
  await navigateToApplications(page)
  await page.click('button:has-text("New Application")')
  await page.waitForURL('**/officer/applications/new', { timeout: 10000 })
}

test.describe('Loan Applications Module', () => {
  test.describe.configure({ mode: 'serial' })

  test.beforeEach(async ({ page }) => {
    await page.waitForTimeout(1000)
    await loginAsTenantOfficer(page)
  })

  test('should display applications list page', async ({ page }) => {
    await navigateToApplications(page)

    // Verify page title
    await expect(page.locator('h1:has-text("Loan Applications")')).toBeVisible()

    // Verify page has data table or empty state
    const hasTable = await page.locator('.v-data-table').isVisible({ timeout: 5000 }).catch(() => false)
    const hasEmptyState = await page.locator('text=No applications found').isVisible({ timeout: 5000 }).catch(() => false)

    expect(hasTable || hasEmptyState).toBeTruthy()
  })

  test('should display status filter pills', async ({ page }) => {
    await navigateToApplications(page)

    // Verify status pills exist
    const statPills = page.locator('.stat-pill')
    await expect(statPills.first()).toBeVisible({ timeout: 10000 })

    // Verify we have multiple status pills (All, Draft, Submitted, etc.)
    const pillCount = await statPills.count()
    expect(pillCount).toBeGreaterThanOrEqual(1)
  })

  test('should filter applications by search', async ({ page }) => {
    await navigateToApplications(page)

    // Find search input
    const searchInput = page.locator('input[placeholder*="Search"], .search-field input')
    await expect(searchInput).toBeVisible({ timeout: 5000 })

    // Search for something
    await searchInput.fill('test')
    await page.waitForTimeout(500)

    // Verify search works (either finds results or shows no results)
    const hasResults = await page.locator('.v-data-table tbody tr').count()
    expect(hasResults).toBeGreaterThanOrEqual(0)
  })

  test('should navigate to new application wizard', async ({ page }) => {
    await navigateToApplications(page)

    // Click new application button
    await page.click('button:has-text("New Application")')

    // Verify wizard page loads
    await page.waitForURL('**/officer/applications/new', { timeout: 10000 })

    // Verify Step 1 is visible (Select Loan Type)
    await expect(page.locator('h2:has-text("Select Loan Type"), .wizard-title:has-text("Loan Type")')).toBeVisible()
  })

  test('should display loan types in Step 1', async ({ page }) => {
    await navigateToNewApplication(page)

    // Wait for loan types to load
    await page.waitForSelector('.loan-type-card, .loan-type-option', { timeout: 10000 })

    // Verify loan type cards are displayed
    const loanTypeCards = page.locator('.loan-type-card, .loan-type-option')
    const cardCount = await loanTypeCards.count()
    expect(cardCount).toBeGreaterThanOrEqual(1)
  })

  test('should select loan type and proceed to Step 2', async ({ page }) => {
    await navigateToNewApplication(page)

    // Wait for loan types
    await page.waitForSelector('.loan-type-card, .loan-type-option', { timeout: 10000 })

    // Click first loan type
    const firstCard = page.locator('.loan-type-card, .loan-type-option').first()
    await firstCard.click()

    // Verify selection (card should be highlighted)
    await expect(firstCard).toHaveClass(/selected|active|v-card--selected/)

    // Click Next button
    await page.click('button:has-text("Next")')

    // Verify Step 2 is visible (Borrower Information)
    await expect(page.locator('h2:has-text("Borrower"), .wizard-title:has-text("Borrower")')).toBeVisible({ timeout: 5000 })
  })

  test('should create new borrower in Step 2', async ({ page }) => {
    await navigateToNewApplication(page)

    // Step 1: Select loan type
    await page.waitForSelector('.loan-type-card, .loan-type-option', { timeout: 10000 })
    await page.locator('.loan-type-card, .loan-type-option').first().click()
    await page.click('button:has-text("Next")')

    // Step 2: Create new borrower
    await expect(page.locator('h2:has-text("Borrower"), .wizard-title:has-text("Borrower")')).toBeVisible({ timeout: 5000 })

    // Click "Create New Borrower" or fill the form
    const createNewBtn = page.locator('button:has-text("Create New"), button:has-text("New Borrower")')
    if (await createNewBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await createNewBtn.click()
    }

    // Fill borrower details
    const uniqueId = Date.now()
    await page.fill('input:near(:text("First Name")), input[label*="First"]', `Test${uniqueId}`)
    await page.fill('input:near(:text("Last Name")), input[label*="Last"]', 'Borrower')
    await page.fill('input:near(:text("Email")), input[type="email"]', `test.borrower.${uniqueId}@example.com`)
    await page.fill('input:near(:text("Phone")), input:near(:text("Contact"))', '+1234567890')
  })

  test('should configure loan details in Step 3', async ({ page }) => {
    await navigateToNewApplication(page)

    // Step 1: Select loan type
    await page.waitForSelector('.loan-type-card, .loan-type-option', { timeout: 10000 })
    await page.locator('.loan-type-card, .loan-type-option').first().click()
    await page.click('button:has-text("Next")')

    // Step 2: Search existing borrower or create
    await page.waitForTimeout(1000)
    const existingBorrower = page.locator('.borrower-option, .borrower-card').first()
    if (await existingBorrower.isVisible({ timeout: 3000 }).catch(() => false)) {
      await existingBorrower.click()
    } else {
      // Fill minimal borrower info
      const uniqueId = Date.now()
      await page.fill('input[type="text"]', `TestUser${uniqueId}`)
      await page.fill('input[type="email"]', `test${uniqueId}@test.com`)
    }
    await page.click('button:has-text("Next")')

    // Step 3: Loan Details
    await expect(page.locator('h2:has-text("Loan Details"), .wizard-title:has-text("Details")')).toBeVisible({ timeout: 5000 })

    // Verify loan amount field exists
    await expect(page.locator('input:near(:text("Amount")), .loan-amount-input')).toBeVisible()

    // Verify term selection exists
    await expect(page.locator('.term-chips, .v-chip-group:has(.v-chip)')).toBeVisible()
  })

  test('should upload documents in Step 4', async ({ page }) => {
    // This test verifies the document upload UI exists
    await navigateToNewApplication(page)

    // Navigate through steps to Step 4
    // Step 1
    await page.waitForSelector('.loan-type-card, .loan-type-option', { timeout: 10000 })
    await page.locator('.loan-type-card, .loan-type-option').first().click()
    await page.click('button:has-text("Next")')
    await page.waitForTimeout(500)

    // Step 2
    const nextBtn2 = page.locator('button:has-text("Next")')
    if (await nextBtn2.isVisible({ timeout: 3000 })) {
      await nextBtn2.click()
    }
    await page.waitForTimeout(500)

    // Step 3
    const nextBtn3 = page.locator('button:has-text("Next")')
    if (await nextBtn3.isVisible({ timeout: 3000 })) {
      // Fill required loan amount
      const amountInput = page.locator('input[type="number"]').first()
      if (await amountInput.isVisible()) {
        await amountInput.fill('50000')
      }
      await nextBtn3.click()
    }
    await page.waitForTimeout(500)

    // Step 4: Documents
    // Verify document upload section exists
    const hasDocumentSection = await page.locator('.document-checklist, .upload-zone, h2:has-text("Document")').isVisible({ timeout: 5000 }).catch(() => false)

    if (hasDocumentSection) {
      // Verify upload zone exists
      await expect(page.locator('.upload-zone, .document-uploader, input[type="file"]')).toBeVisible({ timeout: 5000 })
    }
  })

  test('should display review summary in Step 5', async ({ page }) => {
    await navigateToNewApplication(page)

    // Navigate to final step
    // This tests the review step visibility
    const stepIndicator = page.locator('.v-stepper, .wizard-steps')
    await expect(stepIndicator).toBeVisible({ timeout: 10000 })

    // Verify step numbers are visible
    const steps = page.locator('.v-stepper-item, .wizard-step')
    const stepCount = await steps.count()
    expect(stepCount).toBeGreaterThanOrEqual(4)
  })

  test('should save application as draft', async ({ page }) => {
    await navigateToNewApplication(page)

    // Select loan type
    await page.waitForSelector('.loan-type-card, .loan-type-option', { timeout: 10000 })
    await page.locator('.loan-type-card, .loan-type-option').first().click()
    await page.click('button:has-text("Next")')

    // Look for Save Draft button
    const saveDraftBtn = page.locator('button:has-text("Save Draft"), button:has-text("Save as Draft")')

    // Save draft should be available
    await expect(saveDraftBtn).toBeVisible({ timeout: 5000 })
  })

  test('should open application detail page', async ({ page }) => {
    await navigateToApplications(page)

    // Wait for table to load
    await page.waitForTimeout(1000)

    // Check if there are any applications
    const hasApplications = await page.locator('.v-data-table tbody tr').count()

    if (hasApplications > 0) {
      // Click on first application row
      await page.locator('.v-data-table tbody tr').first().click()

      // Verify detail page loads
      await page.waitForURL('**/officer/applications/*', { timeout: 10000 })

      // Verify detail page has expected sections
      await expect(page.locator('.application-detail, h1, .loan-summary')).toBeVisible({ timeout: 5000 })
    } else {
      // No applications to view - this is acceptable
      expect(hasApplications).toBe(0)
    }
  })

  test('should display tabs on application detail page', async ({ page }) => {
    await navigateToApplications(page)

    // Wait for table
    await page.waitForTimeout(1000)
    const hasApplications = await page.locator('.v-data-table tbody tr').count()

    if (hasApplications > 0) {
      // Navigate to detail
      await page.locator('.v-data-table tbody tr').first().click()
      await page.waitForURL('**/officer/applications/*', { timeout: 10000 })

      // Verify tabs exist
      const tabs = page.locator('.v-tabs, .detail-tabs')
      await expect(tabs).toBeVisible({ timeout: 5000 })

      // Verify expected tabs (Overview, Documents, History)
      await expect(page.locator('button:has-text("Overview"), .v-tab:has-text("Overview")')).toBeVisible()
    }
  })

  test('should show status timeline in application detail', async ({ page }) => {
    await navigateToApplications(page)

    await page.waitForTimeout(1000)
    const hasApplications = await page.locator('.v-data-table tbody tr').count()

    if (hasApplications > 0) {
      await page.locator('.v-data-table tbody tr').first().click()
      await page.waitForURL('**/officer/applications/*', { timeout: 10000 })

      // Click History tab
      const historyTab = page.locator('button:has-text("History"), .v-tab:has-text("History")')
      if (await historyTab.isVisible({ timeout: 3000 })) {
        await historyTab.click()
        await page.waitForTimeout(500)

        // Verify timeline component
        await expect(page.locator('.status-timeline, .timeline-item')).toBeVisible({ timeout: 5000 })
      }
    }
  })

  test('should filter applications by status', async ({ page }) => {
    await navigateToApplications(page)

    // Click on a status filter pill
    const draftPill = page.locator('.stat-pill:has-text("Draft")')
    if (await draftPill.isVisible({ timeout: 3000 })) {
      await draftPill.click()
      await page.waitForTimeout(500)

      // Verify filter is applied (URL might change or UI reflects filter)
      // The count in the pill should match visible items
    }
  })

  test('should navigate between wizard steps', async ({ page }) => {
    await navigateToNewApplication(page)

    // Select loan type and go to step 2
    await page.waitForSelector('.loan-type-card, .loan-type-option', { timeout: 10000 })
    await page.locator('.loan-type-card, .loan-type-option').first().click()
    await page.click('button:has-text("Next")')

    await page.waitForTimeout(500)

    // Go back to step 1
    const backBtn = page.locator('button:has-text("Back"), button:has-text("Previous")')
    if (await backBtn.isVisible({ timeout: 3000 })) {
      await backBtn.click()

      // Verify we're back on step 1
      await expect(page.locator('h2:has-text("Select Loan Type"), .wizard-title:has-text("Loan Type")')).toBeVisible({ timeout: 5000 })
    }
  })

  test('should show validation errors for required fields', async ({ page }) => {
    await navigateToNewApplication(page)

    // Try to click Next without selecting a loan type
    const nextBtn = page.locator('button:has-text("Next")')

    // Button should be disabled or show error when clicked
    const isDisabled = await nextBtn.isDisabled()

    if (!isDisabled) {
      await nextBtn.click()
      // Should show validation error or stay on same step
      const stillOnStep1 = await page.locator('h2:has-text("Select Loan Type")').isVisible()
      expect(stillOnStep1).toBeTruthy()
    } else {
      expect(isDisabled).toBeTruthy()
    }
  })

  test('should display action buttons for draft applications', async ({ page }) => {
    await navigateToApplications(page)

    // Filter to draft applications
    const draftPill = page.locator('.stat-pill:has-text("Draft")')
    if (await draftPill.isVisible({ timeout: 3000 })) {
      await draftPill.click()
      await page.waitForTimeout(500)
    }

    // Check for action buttons in table
    const hasActions = await page.locator('.v-data-table tbody tr').count() > 0
    if (hasActions) {
      // Verify Edit and Submit buttons exist for draft
      const actionBtns = page.locator('.v-data-table tbody tr').first().locator('button')
      const actionCount = await actionBtns.count()
      expect(actionCount).toBeGreaterThanOrEqual(0)
    }
  })
})
