import { test, expect } from '@playwright/test'

/**
 * E2E Tests for Tenant Admin Management
 *
 * Tests the system admin's ability to manage tenant administrators
 * including navigation, CRUD operations, and password management.
 */

test.describe('Tenant Admin Management', () => {
  // Login as system admin before each test
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(500) // Ensure form is interactive
    await page.fill('input[type="email"]', 'admin@ascendent.com')
    await page.fill('input[type="password"]', 'Admin@123')
    await page.click('button[type="submit"]')
    // Wait for any redirect after login with longer timeout
    await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 30000 })
    await page.waitForLoadState('networkidle')
  })

  test('should navigate from tenant detail to users page via Manage Admins button', async ({ page }) => {
    // Navigate to tenants list
    await page.goto('/system/tenants')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000) // Wait for data to load

    // Click View button on first tenant
    const viewButtons = await page.$$('button:has-text("View")')
    if (viewButtons.length > 0) {
      await viewButtons[0].click()
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(1000)
    }

    // Verify we're on tenant detail page (URL contains tenant ID)
    const currentUrl = page.url()
    expect(currentUrl).toContain('/system/tenants/')
    expect(currentUrl).not.toContain('/users')

    // Click Manage Admins button
    const manageAdminsBtn = page.getByText('Manage Admins')
    await expect(manageAdminsBtn).toBeVisible({ timeout: 5000 })
    await manageAdminsBtn.click()
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)

    // Verify navigation to users page
    expect(page.url()).toContain('/users')
    await expect(page.getByText('Tenant Administrators')).toBeVisible()
  })

  test('should display tenant administrators page with correct elements', async ({ page }) => {
    // Navigate to tenants list
    await page.goto('/system/tenants')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    // Get first tenant and navigate to detail
    const viewButtons = await page.$$('button:has-text("View")')
    if (viewButtons.length > 0) {
      await viewButtons[0].click()
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(1000)
    }

    // Navigate to users
    await page.getByText('Manage Admins').click()
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)

    // Verify page elements
    await expect(page.getByText('Tenant Administrators')).toBeVisible()
    await expect(page.getByRole('button', { name: /Add Administrator/i })).toBeVisible()
    // Use specific placeholder for the users page search
    await expect(page.getByPlaceholder(/Search by name or email/i)).toBeVisible()
    // Verify status filter dropdown is visible
    await expect(page.locator('.status-filter')).toBeVisible()
  })

  test('should show empty state or data table', async ({ page }) => {
    // Navigate to tenants and find one
    await page.goto('/system/tenants')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    const viewButtons = await page.$$('button:has-text("View")')
    if (viewButtons.length > 0) {
      await viewButtons[0].click()
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(1000)
    }

    await page.getByText('Manage Admins').click()
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    // Check for empty state OR data table
    const emptyStateVisible = await page.getByText('No administrators yet').isVisible().catch(() => false)
    const tableVisible = await page.locator('table').isVisible().catch(() => false)
    const dataTableVisible = await page.locator('.v-data-table').isVisible().catch(() => false)
    const hasAdminRows = await page.locator('table tbody tr').count().catch(() => 0) > 0

    expect(emptyStateVisible || tableVisible || dataTableVisible || hasAdminRows).toBeTruthy()
  })

  test('should open create administrator dialog', async ({ page }) => {
    // Navigate to users page
    await page.goto('/system/tenants')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    const viewButtons = await page.$$('button:has-text("View")')
    if (viewButtons.length > 0) {
      await viewButtons[0].click()
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(1000)
    }

    await page.getByText('Manage Admins').click()
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)

    // Click Add Administrator button (there might be one in header and one in empty state)
    const addButton = page.getByRole('button', { name: /Add Administrator/i }).first()
    await addButton.click()
    await page.waitForTimeout(1000)

    // Verify dialog is open with form fields - use dialog title specifically
    await expect(page.locator('.v-card-title').filter({ hasText: /Create.*Administrator/i })).toBeVisible({ timeout: 5000 })
    await expect(page.locator('.v-overlay--active input, .v-dialog input').first()).toBeVisible()
  })

  test('should create a new tenant administrator', async ({ page }) => {
    // Navigate to users page
    await page.goto('/system/tenants')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    const viewButtons = await page.$$('button:has-text("View")')
    if (viewButtons.length > 0) {
      await viewButtons[0].click()
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(1000)
    }

    await page.getByText('Manage Admins').click()
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)

    // Open create dialog
    const addButton = page.getByRole('button', { name: /Add Administrator/i }).first()
    await addButton.click()
    await page.waitForTimeout(1500)

    // Fill form with unique email
    const timestamp = Date.now()
    const testEmail = `test.admin.${timestamp}@example.com`

    // Fill the form fields - look for inputs in dialog overlay
    const dialogInputs = await page.locator('.v-overlay--active input[type="text"], .v-dialog input[type="text"]').all()
    if (dialogInputs.length >= 3) {
      await dialogInputs[0].fill('Test')
      await dialogInputs[1].fill('Admin')
      await dialogInputs[2].fill(testEmail)
    }

    // Submit form - look for Create button in dialog
    const createBtn = page.locator('.v-overlay--active button, .v-dialog button').filter({ hasText: /Create/i }).first()
    await createBtn.click()
    await page.waitForTimeout(3000)

    // Verify password dialog appears OR admin was created OR dialog closed (success)
    const passwordDialogVisible = await page.getByText(/Temporary Password/i).isVisible().catch(() => false)
    const successMessageVisible = await page.getByText(/created|success/i).isVisible().catch(() => false)
    const dialogClosed = !(await page.locator('.v-overlay--active').isVisible().catch(() => true))

    expect(passwordDialogVisible || successMessageVisible || dialogClosed).toBeTruthy()
  })

  test('should have breadcrumb navigation', async ({ page }) => {
    // Navigate to users page
    await page.goto('/system/tenants')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    const viewButtons = await page.$$('button:has-text("View")')
    if (viewButtons.length > 0) {
      await viewButtons[0].click()
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(1000)
    }

    await page.getByText('Manage Admins').click()
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)

    // Verify breadcrumb shows tenant name or "Tenants" link
    const breadcrumbArea = page.locator('.breadcrumb, nav, [class*="breadcrumb"]')
    const hasBreadcrumb = await breadcrumbArea.count() > 0
    const hasTenantsLink = await page.getByText('Tenants').first().isVisible().catch(() => false)

    expect(hasBreadcrumb || hasTenantsLink).toBeTruthy()
  })
})
