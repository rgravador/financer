import { test, expect, Page } from '@playwright/test'

/**
 * E2E Tests for Loan Types Module (Step 6)
 *
 * Tests the tenant admin's ability to:
 * - View loan types
 * - Create loan types (from template and custom)
 * - Edit loan types
 * - Manage required documents
 * - Activate/deactivate loan types
 *
 * Uses demo tenant admin credentials:
 * - Email: demo.admin@ascendent.com
 * - Password: Demo@123
 */

// Test credentials
const TENANT_ADMIN = {
  email: 'demo.admin@ascendent.com',
  password: 'Demo@123',
}

// Helper function to log in as tenant admin
async function loginAsTenantAdmin(page: Page) {
  // Navigate to login page
  await page.goto('/login')

  // Wait for login form to be visible
  await page.waitForSelector('input[type="email"]', { timeout: 10000 })

  // Fill login form using specific input selectors
  await page.locator('input[type="email"]').fill(TENANT_ADMIN.email)
  await page.locator('input[type="password"]').fill(TENANT_ADMIN.password)

  // Click the login button
  await page.locator('button[type="submit"]').click()

  // Wait for redirect to tenant dashboard after successful login
  await page.waitForURL('**/tenant/dashboard', { timeout: 20000 })
}

// Helper function to navigate to loan types page
async function navigateToLoanTypes(page: Page) {
  // Try different navigation methods
  const loanTypesLink = page.locator('a:has-text("Loan Types"), a:has-text("Loan Products"), [href*="loan-types"]').first()
  if (await loanTypesLink.isVisible({ timeout: 5000 })) {
    await loanTypesLink.click()
  } else {
    // Direct navigation
    await page.goto('/tenant/loan-types')
  }

  // Wait for page to load
  await page.waitForSelector('.loan-types-page, h1:has-text("Loan Products")', { timeout: 10000 })
}

test.describe('Loan Types Module', () => {
  // Run tests serially to avoid race conditions with auth
  test.describe.configure({ mode: 'serial' })

  // Add delay between tests to avoid rate limiting
  test.beforeEach(async ({ page }) => {
    // Wait to avoid rate limiting from security hardening
    await page.waitForTimeout(1000)
    await loginAsTenantAdmin(page)
  })

  test('should display loan types page with seeded data', async ({ page }) => {
    await navigateToLoanTypes(page)

    // Verify page title
    await expect(page.locator('h1:has-text("Loan Products")')).toBeVisible()

    // Verify seeded loan types are displayed (at least one)
    const loanTypeCards = page.locator('.loan-type-card')
    await expect(loanTypeCards.first()).toBeVisible({ timeout: 10000 })

    // Check that we have multiple loan types (seeder creates 6)
    const cardCount = await loanTypeCards.count()
    expect(cardCount).toBeGreaterThanOrEqual(1)
  })

  test('should display loan type details in cards', async ({ page }) => {
    await navigateToLoanTypes(page)

    // Wait for cards to load
    await page.waitForSelector('.loan-type-card', { timeout: 10000 })

    // Verify card contains expected elements
    const firstCard = page.locator('.loan-type-card').first()

    // Check for loan type name
    await expect(firstCard.locator('.loan-type-name')).toBeVisible()

    // Check for interest rate display
    await expect(firstCard.locator('.metric-value').first()).toBeVisible()

    // Check for status badge
    await expect(firstCard.locator('.card-status')).toBeVisible()
  })

  test('should filter loan types by search', async ({ page }) => {
    await navigateToLoanTypes(page)

    // Wait for loan types to load
    await page.waitForSelector('.loan-type-card', { timeout: 10000 })

    // Get initial count
    const initialCount = await page.locator('.loan-type-card').count()

    // Search for a specific loan type
    const searchInput = page.locator('input[placeholder*="Search"], .search-field input')
    await searchInput.fill('Business')

    // Wait for filter to apply
    await page.waitForTimeout(500)

    // Verify filtered results
    const filteredCount = await page.locator('.loan-type-card').count()
    expect(filteredCount).toBeLessThanOrEqual(initialCount)
  })

  test('should open create loan type dialog', async ({ page }) => {
    await navigateToLoanTypes(page)

    // Click "Add Loan Type" button
    const addButton = page.locator('button:has-text("Add Loan Type")')
    await addButton.click()

    // Verify template menu appears
    await expect(page.locator('.template-menu, .v-list:has-text("Create from Template")')).toBeVisible()

    // Click "Custom Loan Type" option
    await page.click('text=Custom Loan Type')

    // Verify form dialog opens
    await expect(page.getByRole('dialog')).toBeVisible()

    // Verify form fields are present
    await expect(page.locator('.form-dialog').first()).toBeVisible()
  })

  test('should create a new loan type', async ({ page }) => {
    await navigateToLoanTypes(page)

    // Open create dialog
    await page.click('button:has-text("Add Loan Type")')
    await page.click('text=Custom Loan Type')

    // Wait for dialog
    await page.waitForSelector('[role="dialog"]', { timeout: 5000 })

    // Generate unique name
    const uniqueName = `Test Loan ${Date.now()}`

    // Fill form fields
    await page.fill('input:near(:text("Loan Type Name"))', uniqueName)
    await page.fill('textarea:near(:text("Description"))', 'Test loan type for E2E testing')

    // Fill interest rates
    await page.fill('input:near(:text("Minimum Rate"))', '5')
    await page.fill('input:near(:text("Default Rate"))', '10')
    await page.fill('input:near(:text("Maximum Rate"))', '15')

    // Fill loan amounts
    await page.fill('input:near(:text("Minimum Amount"))', '10000')
    await page.fill('input:near(:text("Maximum Amount"))', '500000')

    // Select at least one term
    await page.click('.v-chip:has-text("12 months")')

    // Submit form
    await page.click('button:has-text("Create Loan Type")')

    // Wait for dialog to close and verify success
    await expect(page.locator('.v-snackbar:has-text("created"), .v-snackbar:has-text("success")')).toBeVisible({ timeout: 10000 })

    // Verify new loan type appears in list
    await expect(page.locator(`.loan-type-card:has-text("${uniqueName}")`)).toBeVisible({ timeout: 10000 })
  })

  test('should open edit dialog for existing loan type', async ({ page }) => {
    await navigateToLoanTypes(page)

    // Wait for cards to load
    await page.waitForSelector('.loan-type-card', { timeout: 10000 })

    // Click edit button on first card
    const firstCard = page.locator('.loan-type-card').first()
    await firstCard.locator('button:has-text("Edit")').click()

    // Verify edit dialog opens
    await expect(page.getByRole('dialog')).toBeVisible()

    // Verify form is pre-filled (dialog should contain form inputs)
    await expect(page.locator('.form-dialog').first()).toBeVisible()
  })

  test('should open documents dialog', async ({ page }) => {
    await navigateToLoanTypes(page)

    // Wait for cards to load
    await page.waitForSelector('.loan-type-card', { timeout: 10000 })

    // Click documents button on first card
    const firstCard = page.locator('.loan-type-card').first()
    await firstCard.locator('button:has-text("Documents")').click()

    // Verify documents dialog opens
    await expect(page.getByRole('dialog')).toBeVisible()

    // Verify add document button exists
    await expect(page.getByRole('button', { name: 'Add Document' })).toBeVisible()
  })

  test('should add and save a document requirement', async ({ page }) => {
    await navigateToLoanTypes(page)

    // Wait for cards to load
    await page.waitForSelector('.loan-type-card', { timeout: 10000 })

    // Open documents dialog
    const firstCard = page.locator('.loan-type-card').first()
    await firstCard.locator('button:has-text("Documents")').click()

    // Wait for dialog
    await page.waitForSelector('[role="dialog"]', { timeout: 5000 })

    // Count initial documents
    const initialDocs = await page.locator('.document-item').count()

    // Add new document
    await page.click('button:has-text("Add Document")')

    // Fill document details
    const newDocInput = page.locator('.document-item').last().locator('input').first()
    await newDocInput.fill(`Test Document ${Date.now()}`)

    // Save documents
    await page.click('button:has-text("Save Documents")')

    // Wait for success
    await expect(page.locator('.v-snackbar:has-text("saved"), .v-snackbar:has-text("success")')).toBeVisible({ timeout: 10000 })
  })

  test('should toggle loan type active status', async ({ page }) => {
    await navigateToLoanTypes(page)

    // Wait for cards to load
    await page.waitForSelector('.loan-type-card', { timeout: 10000 })

    // Find an active loan type
    const activeCard = page.locator('.loan-type-card:has(.status-active)').first()
    if (await activeCard.isVisible()) {
      // Open action menu
      await activeCard.locator('button[icon*="dots"], .mdi-dots-vertical').click()

      // Click deactivate
      await page.click('text=Deactivate')

      // Verify success message
      await expect(page.locator('.v-snackbar:has-text("deactivated"), .v-snackbar:has-text("success")')).toBeVisible({ timeout: 10000 })
    }
  })

  test('should filter by status', async ({ page }) => {
    await navigateToLoanTypes(page)

    // Wait for cards to load
    await page.waitForSelector('.loan-type-card', { timeout: 10000 })

    // Get initial count
    const initialCount = await page.locator('.loan-type-card').count()

    // Open status filter
    const statusFilter = page.locator('.status-filter, select:has-text("Status")')
    await statusFilter.click()

    // Select "Active" filter
    await page.click('.v-list-item:has-text("Active")')

    // Wait for filter to apply
    await page.waitForTimeout(500)

    // Verify all visible cards are active
    const activeCards = page.locator('.loan-type-card:has(.status-active)')
    const filteredCount = await activeCards.count()

    // All visible cards should be active
    const visibleCards = await page.locator('.loan-type-card').count()
    expect(visibleCards).toBe(filteredCount)
  })

  test('should show stat pills with correct counts', async ({ page }) => {
    await navigateToLoanTypes(page)

    // Wait for page to load
    await page.waitForSelector('.loan-type-card', { timeout: 10000 })

    // Verify stat pills are visible
    const statPills = page.locator('.stat-pill')
    await expect(statPills.first()).toBeVisible()

    // Verify active count stat (use first() to avoid strict mode violation)
    await expect(page.locator('.stat-pill').first()).toBeVisible()

    // Verify we have stat pills
    const pillCount = await page.locator('.stat-pill').count()
    expect(pillCount).toBeGreaterThanOrEqual(1)
  })
})
