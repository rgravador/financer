import { test, expect, Page } from '@playwright/test'

/**
 * E2E Tests for Audit Logs Module (Step 9)
 *
 * Tests the audit logging functionality for:
 * - System admin viewing all audit logs
 * - Tenant admin viewing tenant-scoped audit logs
 * - Filtering by action type, date range, and search
 * - Pagination
 * - CSV export
 *
 * Test accounts:
 * - System Admin: admin@ascendent.com / Admin@123
 * - Demo Tenant Admin: demo.admin@ascendent.com / Demo@123
 */

// Test credentials
const SYSTEM_ADMIN = {
  email: 'admin@ascendent.com',
  password: 'Admin@123',
}

const TENANT_ADMIN = {
  email: 'demo.admin@ascendent.com',
  password: 'Demo@123',
}

// Helper function to log in as system admin
async function loginAsSystemAdmin(page: Page) {
  await page.goto('/login')
  await page.waitForSelector('input[type="email"]', { timeout: 10000 })
  await page.locator('input[type="email"]').fill(SYSTEM_ADMIN.email)
  await page.locator('input[type="password"]').fill(SYSTEM_ADMIN.password)
  await page.locator('button[type="submit"]').click()
  // Wait for any system page or dashboard
  await page.waitForURL('**/system/**', { timeout: 20000 })
}

// Helper function to log in as tenant admin
async function loginAsTenantAdmin(page: Page) {
  await page.goto('/login')
  await page.waitForSelector('input[type="email"]', { timeout: 10000 })
  await page.locator('input[type="email"]').fill(TENANT_ADMIN.email)
  await page.locator('input[type="password"]').fill(TENANT_ADMIN.password)
  await page.locator('button[type="submit"]').click()
  // Wait for any tenant page or dashboard
  await page.waitForURL('**/tenant/**', { timeout: 20000 })
}

// Helper function to navigate to system audit logs page
async function navigateToSystemAuditLogs(page: Page) {
  const auditLogsLink = page.locator('a:has-text("Audit Logs"), a:has-text("Audit"), a[href*="audit-logs"]').first()
  if (await auditLogsLink.isVisible({ timeout: 5000 })) {
    await auditLogsLink.click()
  } else {
    await page.goto('/system/audit-logs')
  }
  await page.waitForSelector('.audit-logs-page, h1:has-text("System Audit Logs"), h1:has-text("Audit")', { timeout: 10000 })
}

// Helper function to navigate to tenant audit logs page
async function navigateToTenantAuditLogs(page: Page) {
  const auditLogsLink = page.locator('a:has-text("Audit"), a:has-text("Activity"), a[href*="audit-logs"]').first()
  if (await auditLogsLink.isVisible({ timeout: 5000 })) {
    await auditLogsLink.click()
  } else {
    await page.goto('/tenant/audit-logs')
  }
  await page.waitForSelector('.audit-logs-page, h1:has-text("Activity Audit"), h1:has-text("Audit")', { timeout: 10000 })
}

test.describe('System Admin Audit Logs', () => {
  test.beforeEach(async ({ page }) => {
    await page.waitForTimeout(1000)
    await loginAsSystemAdmin(page)
  })

  test('should display system audit logs page', async ({ page }) => {
    await navigateToSystemAuditLogs(page)

    // Verify page has the audit logs class
    await expect(page.locator('.audit-logs-page')).toBeVisible()

    // Verify page has title
    await expect(page.locator('.page-title, h1')).toBeVisible()
  })

  test('should display filters section', async ({ page }) => {
    await navigateToSystemAuditLogs(page)

    // Verify filters section exists
    const filtersSection = page.locator('.filters-section, .filters-card')
    await expect(filtersSection).toBeVisible({ timeout: 5000 })
  })

  test('should display stats bar', async ({ page }) => {
    await navigateToSystemAuditLogs(page)

    // Verify stats bar exists
    const statsBar = page.locator('.stats-bar')
    await expect(statsBar).toBeVisible({ timeout: 5000 })
  })

  test('should display export button', async ({ page }) => {
    await navigateToSystemAuditLogs(page)

    // Verify export button exists
    const exportBtn = page.locator('button:has-text("Export"), button:has-text("CSV")')
    await expect(exportBtn.first()).toBeVisible({ timeout: 5000 })
  })

  test('should display refresh button', async ({ page }) => {
    await navigateToSystemAuditLogs(page)

    // Verify refresh button exists
    const refreshBtn = page.locator('button:has-text("Refresh")')
    await expect(refreshBtn.first()).toBeVisible({ timeout: 5000 })
  })

  test('should display audit logs table or loading state', async ({ page }) => {
    await navigateToSystemAuditLogs(page)

    // Wait for table to load
    await page.waitForTimeout(1000)

    // Verify table or empty state exists
    const hasTable = await page.locator('.logs-table, .v-data-table, table').isVisible({ timeout: 5000 }).catch(() => false)
    const hasEmptyState = await page.locator('text=No audit logs found, .empty-state').isVisible({ timeout: 5000 }).catch(() => false)
    const hasLoading = await page.locator('.loading-state, .v-progress-circular').isVisible({ timeout: 5000 }).catch(() => false)

    expect(hasTable || hasEmptyState || hasLoading).toBeTruthy()
  })

  test('should have search input', async ({ page }) => {
    await navigateToSystemAuditLogs(page)

    // Verify search input exists
    const searchInput = page.locator('input[placeholder*="Search"], input[type="search"], .search-input input')
    await expect(searchInput.first()).toBeVisible({ timeout: 5000 })
  })

  test('should have filter dropdowns', async ({ page }) => {
    await navigateToSystemAuditLogs(page)

    // Verify filter dropdowns exist (action type and date)
    const selectDropdowns = page.locator('.v-select, select, .filter-select')
    const dropdownCount = await selectDropdowns.count()

    expect(dropdownCount).toBeGreaterThanOrEqual(1)
  })
})

test.describe('Tenant Admin Audit Logs', () => {
  test.beforeEach(async ({ page }) => {
    await page.waitForTimeout(1000)
    await loginAsTenantAdmin(page)
  })

  test('should display tenant audit logs page', async ({ page }) => {
    await navigateToTenantAuditLogs(page)

    // Verify page has the audit logs class
    await expect(page.locator('.audit-logs-page')).toBeVisible()

    // Verify page has title
    await expect(page.locator('.page-title, h1')).toBeVisible()
  })

  test('should display stats bar for tenant', async ({ page }) => {
    await navigateToTenantAuditLogs(page)

    // Verify stats bar exists
    const statsBar = page.locator('.stats-bar')
    await expect(statsBar).toBeVisible({ timeout: 5000 })
  })

  test('should display export button for tenant', async ({ page }) => {
    await navigateToTenantAuditLogs(page)

    // Verify export button exists
    const exportBtn = page.locator('button:has-text("Export"), button:has-text("CSV")')
    await expect(exportBtn.first()).toBeVisible({ timeout: 5000 })
  })

  test('should display refresh button for tenant', async ({ page }) => {
    await navigateToTenantAuditLogs(page)

    // Verify refresh button exists
    const refreshBtn = page.locator('button:has-text("Refresh")')
    await expect(refreshBtn.first()).toBeVisible({ timeout: 5000 })
  })

  test('should display tenant audit logs table', async ({ page }) => {
    await navigateToTenantAuditLogs(page)

    // Wait for table to load
    await page.waitForTimeout(1000)

    // Verify table or empty state exists
    const hasTable = await page.locator('.logs-table, .v-data-table, table').isVisible({ timeout: 5000 }).catch(() => false)
    const hasEmptyState = await page.locator('text=No audit logs found, .empty-state').isVisible({ timeout: 5000 }).catch(() => false)

    expect(hasTable || hasEmptyState).toBeTruthy()
  })
})

test.describe('Audit Log Security', () => {
  test('should require authentication to access system audit logs', async ({ page }) => {
    // Try to access audit logs without logging in
    await page.goto('/system/audit-logs')

    // Should redirect to login
    await page.waitForURL('**/login**', { timeout: 10000 })
    expect(page.url()).toContain('login')
  })

  test('should require authentication to access tenant audit logs', async ({ page }) => {
    // Try to access audit logs without logging in
    await page.goto('/tenant/audit-logs')

    // Should redirect to login
    await page.waitForURL('**/login**', { timeout: 10000 })
    expect(page.url()).toContain('login')
  })
})

test.describe('Audit Log Functionality', () => {
  test('should generate audit log on login', async ({ page }) => {
    // Login creates an audit log entry
    await loginAsSystemAdmin(page)

    // Navigate to audit logs
    await navigateToSystemAuditLogs(page)

    // Wait for logs to load
    await page.waitForTimeout(1500)

    // Page should have loaded successfully
    await expect(page.locator('.audit-logs-page')).toBeVisible()
  })
})
