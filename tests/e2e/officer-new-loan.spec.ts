import { test, expect, Page } from '@playwright/test'
import path from 'path'

/**
 * E2E Tests for Officer — Create New Loan Application
 *
 * Tests the full 5-step loan application creation flow:
 * 1. Select Loan Type
 * 2. Select Borrower (+ optional co-borrower)
 * 3. Enter Loan Details (amount, term, interest rate)
 * 4. Upload Required Documents
 * 5. Review & Submit (or Save as Draft)
 *
 * Uses tenant officer credentials:
 * - Email: officer@defbank.com
 * - Password: Just1234!
 *
 * Uses test file for document upload:
 * - /Users/rgravador/Documents/white-byd-for-rent.png
 */

const TENANT_OFFICER = {
  email: 'officer@defbank.com',
  password: 'Just1234!',
}

const TEST_FILE_PATH = '/Users/rgravador/Documents/white-byd-for-rent.png'

async function loginAsTenantOfficer(page: Page) {
  await page.goto('/login')
  await page.waitForSelector('#email-input', { timeout: 10000 })
  await page.locator('#email-input').fill(TENANT_OFFICER.email)
  await page.locator('#password-input').fill(TENANT_OFFICER.password)
  await page.locator('button[type="submit"]').click()
  // Officer redirects to dashboard after login
  await page.waitForURL(/\/officer\/(dashboard|applications)/, { timeout: 20000 })
}

async function navigateToNewApplication(page: Page) {
  await page.goto('/officer/applications/new')
  await page.waitForSelector('.application-stepper', { timeout: 15000 })
}

async function clickNext(page: Page) {
  const nextBtn = page.locator('.navigation-footer button:has-text("Next")')
  await expect(nextBtn).toBeEnabled({ timeout: 5000 })
  await nextBtn.click()
  await page.waitForTimeout(500)
}

async function clickPrevious(page: Page) {
  const prevBtn = page.locator('.navigation-footer button:has-text("Previous")')
  await expect(prevBtn).toBeEnabled({ timeout: 5000 })
  await prevBtn.click()
  await page.waitForTimeout(500)
}

test.describe('Officer — Create New Loan Application', () => {
  test.describe.configure({ mode: 'serial' })

  test.beforeEach(async ({ page }) => {
    await page.waitForTimeout(1000)
    await loginAsTenantOfficer(page)
  })

  test('should navigate to new application page', async ({ page }) => {
    await navigateToNewApplication(page)

    // Verify stepper is visible with step titles
    await expect(page.getByText('Select Loan Type')).toBeVisible({ timeout: 10000 })
    await expect(page.getByText('Choose the type of loan')).toBeVisible()

    // Verify navigation footer is visible
    await expect(page.locator('.navigation-footer')).toBeVisible()
  })

  test('Step 1: should select a loan type', async ({ page }) => {
    await navigateToNewApplication(page)

    // Wait for loan types to load
    await page.waitForSelector('.loan-type-selector', { timeout: 10000 })

    // Next button should be disabled without selection
    const nextBtn = page.locator('.navigation-footer button:has-text("Next")')
    await expect(nextBtn).toBeDisabled()

    // Click the loan type select dropdown
    await page.locator('.loan-type-selector .v-select').click()
    await page.waitForTimeout(500)

    // Select "Personal Loan" from dropdown
    await page.getByRole('option', { name: /Personal Loan/i }).click()
    await page.waitForTimeout(500)

    // Verify loan type details card appears
    await expect(page.locator('.loan-type-details')).toBeVisible({ timeout: 5000 })

    // Next button should now be enabled
    await expect(nextBtn).toBeEnabled()

    // Click Next to go to Step 2
    await clickNext(page)

    // Verify we're on Step 2
    await expect(page.getByText('Borrower Information')).toBeVisible({ timeout: 5000 })
  })

  test('Step 2: should search and select a borrower', async ({ page }) => {
    await navigateToNewApplication(page)

    // Step 1: Select loan type first
    await page.waitForSelector('.loan-type-selector', { timeout: 10000 })
    await page.locator('.loan-type-selector .v-select').click()
    await page.waitForTimeout(500)
    await page.getByRole('option', { name: /Personal Loan/i }).click()
    await page.waitForTimeout(500)
    await clickNext(page)

    // Step 2: Verify borrower search is visible
    await expect(page.getByText('Borrower Information')).toBeVisible({ timeout: 5000 })
    await expect(page.getByText('Primary Borrower')).toBeVisible()

    // Click borrower search field to open dropdown
    const borrowerInput = page.locator('.borrower-col').first().locator('.borrower-search input')
    await borrowerInput.click()
    await page.waitForTimeout(1000)

    // Recent accounts should appear
    await expect(page.getByText('Recent Accounts').first()).toBeVisible({ timeout: 5000 })

    // Click the first borrower in the dropdown
    const firstBorrower = page.locator('.v-list-item.dropdown-list-item').first()
    await expect(firstBorrower).toBeVisible({ timeout: 5000 })
    await firstBorrower.click()
    await page.waitForTimeout(500)

    // Verify selected borrower card appears
    await expect(page.locator('.selected-borrower-card').first()).toBeVisible({ timeout: 5000 })
    await expect(page.getByText('Selected').first()).toBeVisible()

    // Next should be enabled now
    await clickNext(page)

    // Verify we're on Step 3
    await expect(page.getByText('Loan Details')).toBeVisible({ timeout: 5000 })
  })

  test('Step 3: should fill in loan details', async ({ page }) => {
    await navigateToNewApplication(page)

    // Step 1: Select loan type
    await page.waitForSelector('.loan-type-selector', { timeout: 10000 })
    await page.locator('.loan-type-selector .v-select').click()
    await page.waitForTimeout(500)
    await page.getByRole('option', { name: /Personal Loan/i }).click()
    await page.waitForTimeout(500)
    await clickNext(page)

    // Step 2: Select borrower
    await page.waitForTimeout(500)
    const borrowerInput = page.locator('.borrower-col').first().locator('.borrower-search input')
    await borrowerInput.click()
    await page.waitForTimeout(1000)
    await page.locator('.v-list-item.dropdown-list-item').first().click()
    await page.waitForTimeout(500)
    await clickNext(page)

    // Step 3: Verify loan details form
    await expect(page.getByText('Loan Details')).toBeVisible({ timeout: 5000 })
    await expect(page.getByText('Loan Amount')).toBeVisible()

    // Fill requested amount (Personal Loan: PHP 5,000 - 200,000)
    const amountInput = page.getByLabel('Requested Amount')
    await amountInput.clear()
    await amountInput.fill('50000')

    // Select loan term — click the first available term chip
    const termChip = page.locator('.term-chips .v-chip').first()
    await termChip.click()
    await page.waitForTimeout(300)

    // Interest rate should already have a default value from loan type
    // Verify it's visible
    await expect(page.locator('.rate-slider')).toBeVisible()

    // Add optional officer notes
    const notesField = page.getByLabel('Notes (optional)')
    await notesField.fill('E2E test loan application - automated test')

    // Click Next to go to Step 4
    await clickNext(page)

    // Verify we're on Step 4 (Documents)
    await expect(page.getByText('Required Documents')).toBeVisible({ timeout: 5000 })
  })

  test('Step 4: should upload required documents', async ({ page }) => {
    await navigateToNewApplication(page)

    // Complete steps 1-3 quickly
    // Step 1
    await page.waitForSelector('.loan-type-selector', { timeout: 10000 })
    await page.locator('.loan-type-selector .v-select').click()
    await page.waitForTimeout(500)
    await page.getByRole('option', { name: /Personal Loan/i }).click()
    await page.waitForTimeout(500)
    await clickNext(page)

    // Step 2
    await page.waitForTimeout(500)
    const borrowerInput = page.locator('.borrower-col').first().locator('.borrower-search input')
    await borrowerInput.click()
    await page.waitForTimeout(1000)
    await page.locator('.v-list-item.dropdown-list-item').first().click()
    await page.waitForTimeout(500)
    await clickNext(page)

    // Step 3
    await page.getByLabel('Requested Amount').clear()
    await page.getByLabel('Requested Amount').fill('50000')
    await page.locator('.term-chips .v-chip').first().click()
    await page.waitForTimeout(300)
    await clickNext(page)

    // Step 4: Documents
    await expect(page.getByText('Required Documents')).toBeVisible({ timeout: 5000 })

    // Check if there are required documents
    const uploadButtons = page.locator('.document-item button:has-text("Upload")')
    const uploadCount = await uploadButtons.count()

    if (uploadCount > 0) {
      // Upload the test file for the first required document
      const fileInput = page.locator('.hidden-file-input').first()
      await fileInput.setInputFiles(TEST_FILE_PATH)
      await page.waitForTimeout(2000)

      // Verify upload success — check icon should appear
      await expect(page.locator('.document-item--uploaded').first()).toBeVisible({ timeout: 10000 })
    }

    // Click Next to go to Step 5
    await clickNext(page)

    // Verify we're on Step 5 (Review)
    await expect(page.getByText('Review').first()).toBeVisible({ timeout: 5000 })
  })

  test('Full flow: should save loan application as draft', async ({ page }) => {
    await navigateToNewApplication(page)

    // === Step 1: Select Loan Type ===
    await page.waitForSelector('.loan-type-selector', { timeout: 10000 })
    await page.locator('.loan-type-selector .v-select').click()
    await page.waitForTimeout(500)
    await page.getByRole('option', { name: /Personal Loan/i }).click()
    await page.waitForTimeout(500)
    await clickNext(page)

    // === Step 2: Select Borrower ===
    await expect(page.getByText('Borrower Information')).toBeVisible({ timeout: 5000 })
    const borrowerInput = page.locator('.borrower-col').first().locator('.borrower-search input')
    await borrowerInput.click()
    await page.waitForTimeout(1000)
    await page.locator('.v-list-item.dropdown-list-item').first().click()
    await page.waitForTimeout(500)
    await clickNext(page)

    // === Step 3: Loan Details ===
    await expect(page.getByText('Loan Details')).toBeVisible({ timeout: 5000 })
    await page.getByLabel('Requested Amount').clear()
    await page.getByLabel('Requested Amount').fill('25000')
    await page.locator('.term-chips .v-chip').first().click()
    await page.waitForTimeout(300)
    await page.getByLabel('Notes (optional)').fill('Draft loan — E2E test')
    await clickNext(page)

    // === Step 4: Documents (skip uploads for draft) ===
    await expect(page.getByText('Required Documents')).toBeVisible({ timeout: 5000 })
    await clickNext(page)

    // === Step 5: Review ===
    await expect(page.locator('.step-content')).toBeVisible({ timeout: 5000 })

    // Click "Save as Draft"
    const draftBtn = page.locator('button:has-text("Save as Draft")')
    await expect(draftBtn).toBeVisible({ timeout: 5000 })
    await draftBtn.click()

    // Wait for success and redirect
    await page.waitForURL('**/officer/applications', { timeout: 20000 })

    // Verify we're back on applications list
    await expect(page.getByText('Loan Applications')).toBeVisible({ timeout: 10000 })
  })

  test('Full flow: should submit loan application with documents', async ({ page }) => {
    await navigateToNewApplication(page)

    // === Step 1: Select Loan Type ===
    await page.waitForSelector('.loan-type-selector', { timeout: 10000 })
    await page.locator('.loan-type-selector .v-select').click()
    await page.waitForTimeout(500)
    await page.getByRole('option', { name: /Personal Loan/i }).click()
    await page.waitForTimeout(500)
    await clickNext(page)

    // === Step 2: Select Borrower ===
    await expect(page.getByText('Borrower Information')).toBeVisible({ timeout: 5000 })
    const borrowerInput = page.locator('.borrower-col').first().locator('.borrower-search input')
    await borrowerInput.click()
    await page.waitForTimeout(1000)
    await page.locator('.v-list-item.dropdown-list-item').first().click()
    await page.waitForTimeout(500)
    await clickNext(page)

    // === Step 3: Loan Details ===
    await expect(page.getByText('Loan Details')).toBeVisible({ timeout: 5000 })
    await page.getByLabel('Requested Amount').clear()
    await page.getByLabel('Requested Amount').fill('50000')
    await page.locator('.term-chips .v-chip').first().click()
    await page.waitForTimeout(300)
    await page.getByLabel('Notes (optional)').fill('Full submit — E2E test')
    await clickNext(page)

    // === Step 4: Upload all required documents ===
    await expect(page.getByText('Required Documents')).toBeVisible({ timeout: 5000 })

    // Upload the test file for each required document
    const uploadButtons = page.locator('.document-item:not(.document-item--uploaded) button:has-text("Upload")')
    let remaining = await uploadButtons.count()

    while (remaining > 0) {
      // Click the first Upload button to trigger file input
      const firstUploadBtn = page.locator('.document-item:not(.document-item--uploaded) button:has-text("Upload")').first()
      await firstUploadBtn.click()
      await page.waitForTimeout(300)

      // Set file on the visible file input
      const fileInput = page.locator('.hidden-file-input').first()
      await fileInput.setInputFiles(TEST_FILE_PATH)
      await page.waitForTimeout(2000)

      remaining = await page.locator('.document-item:not(.document-item--uploaded) button:has-text("Upload")').count()
    }

    await clickNext(page)

    // === Step 5: Review & Submit ===
    await expect(page.locator('.step-content')).toBeVisible({ timeout: 5000 })

    const submitBtn = page.locator('button:has-text("Submit Application")')
    await expect(submitBtn).toBeVisible({ timeout: 5000 })
    await submitBtn.click()

    // Wait for redirect to applications list
    await page.waitForURL('**/officer/applications', { timeout: 20000 })

    // Verify success
    await expect(page.getByText('Loan Applications')).toBeVisible({ timeout: 10000 })
  })

  test('should navigate back with Previous button', async ({ page }) => {
    await navigateToNewApplication(page)

    // Step 1
    await page.waitForSelector('.loan-type-selector', { timeout: 10000 })
    await page.locator('.loan-type-selector .v-select').click()
    await page.waitForTimeout(500)
    await page.getByRole('option', { name: /Personal Loan/i }).click()
    await page.waitForTimeout(500)
    await clickNext(page)

    // Now on Step 2
    await expect(page.getByText('Borrower Information')).toBeVisible({ timeout: 5000 })

    // Click Previous to go back to Step 1
    await clickPrevious(page)

    // Verify we're back on Step 1
    await expect(page.getByText('Select Loan Type')).toBeVisible({ timeout: 5000 })
  })

  test('should waive co-borrower', async ({ page }) => {
    await navigateToNewApplication(page)

    // Step 1: Select loan type
    await page.waitForSelector('.loan-type-selector', { timeout: 10000 })
    await page.locator('.loan-type-selector .v-select').click()
    await page.waitForTimeout(500)
    await page.getByRole('option', { name: /Personal Loan/i }).click()
    await page.waitForTimeout(500)
    await clickNext(page)

    // Step 2: Verify co-borrower section
    await expect(page.getByText('Co-Borrower')).toBeVisible({ timeout: 5000 })

    // Toggle waive switch
    const waiveSwitch = page.locator('.co-toggle')
    await waiveSwitch.click()
    await page.waitForTimeout(300)

    // Verify waived notice appears
    await expect(page.getByText('Co-borrower requirement has been waived')).toBeVisible({ timeout: 3000 })
  })
})
