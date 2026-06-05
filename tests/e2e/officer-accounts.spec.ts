import { test, expect, Page } from '@playwright/test'

/**
 * E2E Tests for Officer Accounts (Borrower) Module
 *
 * Tests the loan officer's ability to:
 * - View accounts list page
 * - Navigate to the create account page
 * - Fill out the multi-step create account form
 * - Submit the form and verify account creation
 * - View the created account in the list
 *
 * Uses tenant officer credentials:
 * - Email: officer@defbank.com
 * - Password: Just1234!
 */

const TENANT_OFFICER = {
  email: 'officer@defbank.com',
  password: 'Just1234!',
}

// Generate unique suffix per test run to avoid duplicate conflicts
const uniqueId = Date.now()
const firstNames = ['Patrick', 'Katherine', 'Joseph', 'Maria', 'Carlos', 'Angela', 'Marco', 'Sofia']
const lastNames = ['Santos', 'Dela Cruz', 'Reyes', 'Garcia', 'Torres', 'Mendoza', 'Lim', 'Tan']
const randomFirst = firstNames[Math.floor(Math.random() * firstNames.length)]
const randomLast = lastNames[Math.floor(Math.random() * lastNames.length)]
const shortId = String(uniqueId).slice(-6)
const TEST_BORROWER = {
  firstName: randomFirst,
  middleName: 'M',
  lastName: randomLast,
  email: `${randomFirst.toLowerCase()}${shortId}@example.com`,
  contactNumber: '09171234567',
  address: '456 Rizal Avenue, Quezon City',
  employer: 'Pacific Holdings Inc',
  monthlyIncome: '50000',
}

async function loginAsTenantOfficer(page: Page) {
  await page.goto('/login')
  await page.waitForSelector('#email-input', { timeout: 10000 })
  await page.locator('#email-input').fill(TENANT_OFFICER.email)
  await page.locator('#password-input').fill(TENANT_OFFICER.password)
  await page.locator('button[type="submit"]').click()
  await page.waitForURL(/\/officer\/(dashboard|applications)/, { timeout: 20000 })
}

async function navigateToAccounts(page: Page) {
  const accountsLink = page.locator('a:has-text("Accounts"), [href*="/officer/accounts"]').first()
  if (await accountsLink.isVisible({ timeout: 5000 })) {
    await accountsLink.click()
  } else {
    await page.goto('/officer/accounts')
  }
  await page.waitForSelector('.accounts-page, h1:has-text("Accounts")', { timeout: 10000 })
}

interface BorrowerData {
  firstName: string
  middleName: string
  lastName: string
  email: string
  contactNumber: string
  address: string
  employer: string
  monthlyIncome: string
}

async function createAccount(page: Page, borrower: BorrowerData) {
  await page.goto('/officer/accounts/new')
  await page.waitForSelector('h1:has-text("Create Account")', { timeout: 10000 })

  // Step 1: Personal Info
  await page.getByLabel('First Name').fill(borrower.firstName)
  await page.getByLabel('Middle Name').fill(borrower.middleName)
  await page.getByLabel('Last Name').fill(borrower.lastName)
  await page.getByLabel('Email Address').fill(borrower.email)
  await page.getByLabel('Contact Number').fill(borrower.contactNumber)
  await page.locator('button:has-text("Next")').click()

  // Step 2: Address
  await expect(page.locator('h2:has-text("Address")')).toBeVisible({ timeout: 5000 })
  await page.getByLabel('Current Address', { exact: true }).fill(borrower.address)
  await page.locator('button:has-text("Next")').click()

  // Step 3: Employment
  await expect(page.locator('h2:has-text("Employment")')).toBeVisible({ timeout: 5000 })
  await page.getByLabel('Employer / Business Name').fill(borrower.employer)
  const incomeField = page.getByLabel('Monthly Income')
  await incomeField.clear()
  await incomeField.fill(borrower.monthlyIncome)
  await page.locator('button:has-text("Next")').click()

  // Step 4: Financial History (skip)
  await expect(page.locator('h2:has-text("Financial History")')).toBeVisible({ timeout: 5000 })
  await page.locator('button:has-text("Next")').click()

  // Step 5: References (submit)
  await expect(page.locator('h2:has-text("References")')).toBeVisible({ timeout: 5000 })
  await page.locator('button:has-text("Create Account")').click()

  await page.waitForURL('**/officer/accounts', { timeout: 20000 })
}

const ADDITIONAL_BORROWERS: BorrowerData[] = [
  {
    firstName: 'Katherine',
    middleName: 'L',
    lastName: 'Reyes',
    email: `katherine.reyes.${shortId}@example.com`,
    contactNumber: '09185551234',
    address: '78 Mabini Street, Pasig City',
    employer: 'Globe Telecom',
    monthlyIncome: '65000',
  },
  {
    firstName: 'Joseph',
    middleName: 'R',
    lastName: 'Santos',
    email: `joseph.santos.${shortId}@example.com`,
    contactNumber: '09279876543',
    address: '15 Bonifacio Avenue, Taguig City',
    employer: 'San Miguel Corporation',
    monthlyIncome: '45000',
  },
  {
    firstName: 'Angela',
    middleName: 'C',
    lastName: 'Torres',
    email: `angela.torres.${shortId}@example.com`,
    contactNumber: '09361234567',
    address: '202 Roxas Boulevard, Manila',
    employer: 'BDO Unibank',
    monthlyIncome: '80000',
  },
]

test.describe('Officer Accounts Module', () => {
  test.describe.configure({ mode: 'serial' })

  test.beforeEach(async ({ page }) => {
    await page.waitForTimeout(1000)
    await loginAsTenantOfficer(page)
  })

  test('should display accounts list page', async ({ page }) => {
    await navigateToAccounts(page)

    await expect(page.locator('h1:has-text("Accounts")')).toBeVisible()

    // Wait for loading to finish
    await page.locator('.loading-container').waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {})

    // Page should show either a data table/grid, cards, or an empty state
    const hasContent = await page.locator('.accounts-grid, .accounts-table-wrapper').isVisible({ timeout: 5000 }).catch(() => false)
    const hasEmpty = await page.locator('.empty-container').isVisible({ timeout: 5000 }).catch(() => false)
    const hasNewAccountBtn = await page.locator('button:has-text("New Account")').isVisible({ timeout: 3000 }).catch(() => false)

    expect(hasContent || hasEmpty || hasNewAccountBtn).toBeTruthy()
  })

  test('should navigate to create account page', async ({ page }) => {
    await navigateToAccounts(page)

    // Click the create / new account button
    await page.locator('button:has-text("New Account"), button:has-text("Create"), a:has-text("New Account")').first().click()
    await page.waitForURL('**/officer/accounts/new', { timeout: 10000 })

    await expect(page.locator('h1:has-text("Create Account")')).toBeVisible()
  })

  test('should complete multi-step create account form', async ({ page }) => {
    await page.goto('/officer/accounts/new')
    await page.waitForSelector('h1:has-text("Create Account")', { timeout: 10000 })

    // ── Step 1: Personal Information ──
    await expect(page.locator('h2:has-text("Personal Information")')).toBeVisible()

    await page.getByLabel('First Name').fill(TEST_BORROWER.firstName)
    await page.getByLabel('Middle Name').fill(TEST_BORROWER.middleName)
    await page.getByLabel('Last Name').fill(TEST_BORROWER.lastName)
    await page.getByLabel('Email Address').fill(TEST_BORROWER.email)
    await page.getByLabel('Contact Number').fill(TEST_BORROWER.contactNumber)

    // Click Next
    await page.locator('button:has-text("Next")').click()

    // ── Step 2: Address & Stability ──
    await expect(page.locator('h2:has-text("Address")')).toBeVisible({ timeout: 5000 })

    await page.getByLabel('Current Address', { exact: true }).fill(TEST_BORROWER.address)

    await page.locator('button:has-text("Next")').click()

    // ── Step 3: Employment & Income ──
    await expect(page.locator('h2:has-text("Employment")')).toBeVisible({ timeout: 5000 })

    // Employment type is pre-selected as "employed" by default
    await page.getByLabel('Employer / Business Name').fill(TEST_BORROWER.employer)

    // Fill monthly income
    const incomeField = page.getByLabel('Monthly Income')
    await incomeField.clear()
    await incomeField.fill(TEST_BORROWER.monthlyIncome)

    await page.locator('button:has-text("Next")').click()

    // ── Step 4: Financial History ──
    await expect(page.locator('h2:has-text("Financial History")')).toBeVisible({ timeout: 5000 })

    // Step 4 is optional, just proceed
    await page.locator('button:has-text("Next")').click()

    // ── Step 5: References & Notes ──
    await expect(page.locator('h2:has-text("References")')).toBeVisible({ timeout: 5000 })

    // Step 5 is optional, submit the form
    await page.locator('button:has-text("Create Account")').click()

    // Wait for success — either snackbar or redirect
    await page.waitForURL('**/officer/accounts', { timeout: 20000 })
  })

  test('should create account for Katherine Reyes', async ({ page }) => {
    await createAccount(page, ADDITIONAL_BORROWERS[0])
    await expect(page.getByRole('heading', { name: 'Accounts' })).toBeVisible({ timeout: 10000 })
  })

  test('should create account for Joseph Santos', async ({ page }) => {
    await createAccount(page, ADDITIONAL_BORROWERS[1])
    await expect(page.getByRole('heading', { name: 'Accounts' })).toBeVisible({ timeout: 10000 })
  })

  test('should create account for Angela Torres', async ({ page }) => {
    await createAccount(page, ADDITIONAL_BORROWERS[2])
    await expect(page.getByRole('heading', { name: 'Accounts' })).toBeVisible({ timeout: 10000 })
  })

  test('should show created account in the list', async ({ page }) => {
    await navigateToAccounts(page)

    // Search for the created borrower
    const searchField = page.locator('.search-field input, input[placeholder*="Search"]').first()
    if (await searchField.isVisible({ timeout: 3000 }).catch(() => false)) {
      await searchField.fill(TEST_BORROWER.lastName)
      // Wait for search debounce
      await page.waitForTimeout(500)
    }

    // Verify the borrower appears in the list
    await expect(page.locator(`text=${TEST_BORROWER.firstName}`).first()).toBeVisible({ timeout: 10000 })
    await expect(page.locator(`text=${TEST_BORROWER.lastName}`).first()).toBeVisible({ timeout: 10000 })
  })

  test('should validate required fields on step 1', async ({ page }) => {
    await page.goto('/officer/accounts/new')
    await page.waitForSelector('h1:has-text("Create Account")', { timeout: 10000 })

    // Try to click Next without filling required fields — button should be disabled
    const nextButton = page.locator('button:has-text("Next")')
    await expect(nextButton).toBeDisabled()

    // Fill only first name — still should be disabled (missing last name, email, contact)
    await page.getByLabel('First Name').fill('OnlyFirst')
    await expect(nextButton).toBeDisabled()
  })

  test('should navigate back from create page', async ({ page }) => {
    await page.goto('/officer/accounts/new')
    await page.waitForSelector('h1:has-text("Create Account")', { timeout: 10000 })

    // Click the back button
    await page.locator('button:has(.mdi-arrow-left), button[aria-label="back"]').first().click()

    // Should return to accounts list
    await page.waitForURL('**/officer/accounts', { timeout: 10000 })
  })

  test('should navigate between steps with Previous button', async ({ page }) => {
    await page.goto('/officer/accounts/new')
    await page.waitForSelector('h1:has-text("Create Account")', { timeout: 10000 })

    // Fill step 1 required fields
    await page.getByLabel('First Name').fill('StepNav')
    await page.getByLabel('Last Name').fill('Test')
    await page.getByLabel('Email Address').fill('stepnav@example.com')
    await page.getByLabel('Contact Number').fill('09170000000')

    // Go to step 2
    await page.locator('button:has-text("Next")').click()
    await expect(page.locator('h2:has-text("Address")')).toBeVisible({ timeout: 5000 })

    // Go back to step 1 — click via JS to avoid sidebar overlay on fixed footer
    await page.locator('button:has-text("Previous")').evaluate((el: HTMLElement) => el.click())
    await expect(page.locator('h2:has-text("Personal Information")')).toBeVisible({ timeout: 5000 })

    // Verify data persisted
    await expect(page.getByLabel('First Name')).toHaveValue('StepNav')
    await expect(page.getByLabel('Last Name')).toHaveValue('Test')
  })
})
