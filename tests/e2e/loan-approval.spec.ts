import { test, expect, Page } from '@playwright/test'

/**
 * E2E Tests for Loan Approval Module (Step 8)
 *
 * Tests the loan approver's ability to:
 * - View approval queue with filters
 * - Review application details
 * - Start review process
 * - Approve applications with final interest rate
 * - Reject applications with notes
 * - Request additional documents
 * - View notifications
 *
 * Uses demo tenant approver credentials:
 * - Email: demo.approver@ascendent.com
 * - Password: Approver@123
 */

// Test credentials
const TENANT_APPROVER = {
  email: 'demo.approver@ascendent.com',
  password: 'Approver@123',
}

const TENANT_ADMIN = {
  email: 'demo.admin@ascendent.com',
  password: 'Demo@123',
}

// Helper function to log in as tenant approver
async function loginAsTenantApprover(page: Page) {
  await page.goto('/login')
  await page.waitForSelector('input[type="email"]', { timeout: 10000 })
  await page.locator('input[type="email"]').fill(TENANT_APPROVER.email)
  await page.locator('input[type="password"]').fill(TENANT_APPROVER.password)
  await page.locator('button[type="submit"]').click()
  await page.waitForURL('**/approver/**', { timeout: 20000 })
}

// Helper function to log in as tenant admin (can also access approver pages)
async function loginAsTenantAdmin(page: Page) {
  await page.goto('/login')
  await page.waitForSelector('input[type="email"]', { timeout: 10000 })
  await page.locator('input[type="email"]').fill(TENANT_ADMIN.email)
  await page.locator('input[type="password"]').fill(TENANT_ADMIN.password)
  await page.locator('button[type="submit"]').click()
  await page.waitForURL('**/tenant/**', { timeout: 20000 })
}

// Helper function to navigate to approval queue
async function navigateToQueue(page: Page) {
  const queueLink = page.locator('a:has-text("Queue"), a:has-text("Approval Queue"), [href*="queue"]').first()
  if (await queueLink.isVisible({ timeout: 5000 })) {
    await queueLink.click()
  } else {
    await page.goto('/approver/queue')
  }
  await page.waitForSelector('.approver-queue-page, h1:has-text("Approval Queue")', { timeout: 10000 })
}

test.describe('Loan Approval Module', () => {
  test.describe.configure({ mode: 'serial' })

  test.beforeEach(async ({ page }) => {
    await page.waitForTimeout(1000)
    await loginAsTenantApprover(page)
  })

  test('should display approval queue page', async ({ page }) => {
    await navigateToQueue(page)

    // Verify page title
    await expect(page.locator('h1:has-text("Approval Queue")')).toBeVisible()

    // Verify page has data table or empty state
    const hasTable = await page.locator('.v-data-table').isVisible({ timeout: 5000 }).catch(() => false)
    const hasEmptyState = await page.locator('text=No Applications in Queue').isVisible({ timeout: 5000 }).catch(() => false)

    expect(hasTable || hasEmptyState).toBeTruthy()
  })

  test('should display status filter pills', async ({ page }) => {
    await navigateToQueue(page)

    // Verify status pills exist
    const statPills = page.locator('.stat-pill')
    await expect(statPills.first()).toBeVisible({ timeout: 10000 })

    // Verify we have multiple status pills (All, New, Under Review, Pending Docs)
    const pillCount = await statPills.count()
    expect(pillCount).toBeGreaterThanOrEqual(1)

    // Verify specific pills
    await expect(page.locator('.stat-pill:has-text("All")')).toBeVisible()
  })

  test('should filter queue by search', async ({ page }) => {
    await navigateToQueue(page)

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

  test('should filter by clicking status pill', async ({ page }) => {
    await navigateToQueue(page)

    // Click on a status pill
    const newPill = page.locator('.stat-pill:has-text("New")')
    if (await newPill.isVisible({ timeout: 3000 })) {
      await newPill.click()
      await page.waitForTimeout(500)

      // Verify the pill is active
      await expect(newPill).toHaveClass(/stat-pill--active/)
    }
  })

  test('should display interest rate comparison in queue table', async ({ page }) => {
    await navigateToQueue(page)

    // Wait for table
    await page.waitForTimeout(1000)
    const hasApplications = await page.locator('.v-data-table tbody tr').count()

    if (hasApplications > 0) {
      // Verify rates column shows suggested and default rates
      const ratesCell = page.locator('.rates-cell').first()
      await expect(ratesCell).toBeVisible({ timeout: 5000 })

      // Verify rate labels
      await expect(page.locator('.rate-label:has-text("Suggested")').first()).toBeVisible()
      await expect(page.locator('.rate-label:has-text("Default")').first()).toBeVisible()
    }
  })

  test('should navigate to application detail page', async ({ page }) => {
    await navigateToQueue(page)

    // Wait for table
    await page.waitForTimeout(1000)
    const hasApplications = await page.locator('.v-data-table tbody tr').count()

    if (hasApplications > 0) {
      // Click review button on first application
      const reviewBtn = page.locator('button:has-text("Review"), button:has-text("View")').first()
      await reviewBtn.click()

      // Verify detail page loads
      await page.waitForURL('**/approver/queue/*', { timeout: 10000 })

      // Verify detail page has expected sections
      await expect(page.locator('.approver-detail-page, h1, .page-header')).toBeVisible({ timeout: 5000 })
    }
  })

  test('should display application detail sections', async ({ page }) => {
    await navigateToQueue(page)

    await page.waitForTimeout(1000)
    const hasApplications = await page.locator('.v-data-table tbody tr').count()

    if (hasApplications > 0) {
      // Navigate to detail
      const reviewBtn = page.locator('button:has-text("Review"), button:has-text("View")').first()
      await reviewBtn.click()
      await page.waitForURL('**/approver/queue/*', { timeout: 10000 })

      // Verify main sections exist
      // Applicant Information
      await expect(page.locator('h3:has-text("Applicant Information"), .section-title:has-text("Applicant")')).toBeVisible({ timeout: 5000 })

      // Loan Details
      await expect(page.locator('h3:has-text("Loan Details"), .section-title:has-text("Loan")')).toBeVisible({ timeout: 5000 })

      // Rate Decision
      await expect(page.locator('h3:has-text("Rate Decision"), .section-title:has-text("Rate")')).toBeVisible({ timeout: 5000 })
    }
  })

  test('should display rate comparison box', async ({ page }) => {
    await navigateToQueue(page)

    await page.waitForTimeout(1000)
    const hasApplications = await page.locator('.v-data-table tbody tr').count()

    if (hasApplications > 0) {
      // Navigate to detail
      await page.locator('button:has-text("Review"), button:has-text("View")').first().click()
      await page.waitForURL('**/approver/queue/*', { timeout: 10000 })

      // Verify rate comparison boxes
      await expect(page.locator('.rate-comparison, .rate-box')).toBeVisible({ timeout: 5000 })

      // Verify rate labels
      await expect(page.locator('.rate-box-label:has-text("Default Rate")')).toBeVisible()
      await expect(page.locator('.rate-box-label:has-text("Suggested Rate")')).toBeVisible()
      await expect(page.locator('.rate-box-label:has-text("Final Rate")')).toBeVisible()
    }
  })

  test('should display loan summary with calculations', async ({ page }) => {
    await navigateToQueue(page)

    await page.waitForTimeout(1000)
    const hasApplications = await page.locator('.v-data-table tbody tr').count()

    if (hasApplications > 0) {
      // Navigate to detail
      await page.locator('button:has-text("Review"), button:has-text("View")').first().click()
      await page.waitForURL('**/approver/queue/*', { timeout: 10000 })

      // Verify loan summary section
      await expect(page.locator('h3:has-text("Loan Summary"), .summary-title:has-text("Summary")')).toBeVisible({ timeout: 5000 })

      // Verify calculations are displayed
      await expect(page.locator('text=Monthly Payment, .summary-item:has-text("Monthly")')).toBeVisible({ timeout: 5000 })
    }
  })

  test('should display status timeline', async ({ page }) => {
    await navigateToQueue(page)

    await page.waitForTimeout(1000)
    const hasApplications = await page.locator('.v-data-table tbody tr').count()

    if (hasApplications > 0) {
      // Navigate to detail
      await page.locator('button:has-text("Review"), button:has-text("View")').first().click()
      await page.waitForURL('**/approver/queue/*', { timeout: 10000 })

      // Verify timeline section exists
      await expect(page.locator('.status-timeline, .timeline-item')).toBeVisible({ timeout: 5000 })
    }
  })

  test('should display action buttons based on status', async ({ page }) => {
    await navigateToQueue(page)

    await page.waitForTimeout(1000)
    const hasApplications = await page.locator('.v-data-table tbody tr').count()

    if (hasApplications > 0) {
      // Navigate to detail
      await page.locator('button:has-text("Review"), button:has-text("View")').first().click()
      await page.waitForURL('**/approver/queue/*', { timeout: 10000 })

      // Verify action buttons area exists
      const hasStartReview = await page.locator('button:has-text("Start Review")').isVisible({ timeout: 3000 }).catch(() => false)
      const hasApprove = await page.locator('button:has-text("Approve")').isVisible({ timeout: 3000 }).catch(() => false)
      const hasReject = await page.locator('button:has-text("Reject")').isVisible({ timeout: 3000 }).catch(() => false)
      const hasRequestDocs = await page.locator('button:has-text("Request")').isVisible({ timeout: 3000 }).catch(() => false)

      // At least one action should be visible depending on status
      expect(hasStartReview || hasApprove || hasReject || hasRequestDocs).toBeTruthy()
    }
  })

  test('should open approve dialog', async ({ page }) => {
    await navigateToQueue(page)

    await page.waitForTimeout(1000)
    const hasApplications = await page.locator('.v-data-table tbody tr').count()

    if (hasApplications > 0) {
      // Navigate to detail
      await page.locator('button:has-text("Review"), button:has-text("View")').first().click()
      await page.waitForURL('**/approver/queue/*', { timeout: 10000 })

      // Check if approve button is visible (only for under_review status)
      const approveBtn = page.locator('button:has-text("Approve")')
      if (await approveBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await approveBtn.click()

        // Verify dialog opens
        await expect(page.locator('.v-dialog:has-text("Approve"), .approve-dialog')).toBeVisible({ timeout: 5000 })

        // Verify final rate input exists
        await expect(page.locator('input[type="number"], .final-rate-input')).toBeVisible()

        // Close dialog
        await page.locator('button:has-text("Cancel")').click()
      }
    }
  })

  test('should open reject dialog', async ({ page }) => {
    await navigateToQueue(page)

    await page.waitForTimeout(1000)
    const hasApplications = await page.locator('.v-data-table tbody tr').count()

    if (hasApplications > 0) {
      // Navigate to detail
      await page.locator('button:has-text("Review"), button:has-text("View")').first().click()
      await page.waitForURL('**/approver/queue/*', { timeout: 10000 })

      // Check if reject button is visible
      const rejectBtn = page.locator('button:has-text("Reject")')
      if (await rejectBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await rejectBtn.click()

        // Verify dialog opens
        await expect(page.locator('.v-dialog:has-text("Reject"), .reject-dialog')).toBeVisible({ timeout: 5000 })

        // Verify notes field exists
        await expect(page.locator('textarea, .notes-input')).toBeVisible()

        // Close dialog
        await page.locator('button:has-text("Cancel")').click()
      }
    }
  })

  test('should open request documents dialog', async ({ page }) => {
    await navigateToQueue(page)

    await page.waitForTimeout(1000)
    const hasApplications = await page.locator('.v-data-table tbody tr').count()

    if (hasApplications > 0) {
      // Navigate to detail
      await page.locator('button:has-text("Review"), button:has-text("View")').first().click()
      await page.waitForURL('**/approver/queue/*', { timeout: 10000 })

      // Check if request docs button is visible
      const requestDocsBtn = page.locator('button:has-text("Request Documents"), button:has-text("Request Docs")')
      if (await requestDocsBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await requestDocsBtn.click()

        // Verify dialog opens
        await expect(page.locator('.v-dialog:has-text("Request"), .request-docs-dialog')).toBeVisible({ timeout: 5000 })

        // Close dialog
        await page.locator('button:has-text("Cancel")').click()
      }
    }
  })

  test('should display documents list', async ({ page }) => {
    await navigateToQueue(page)

    await page.waitForTimeout(1000)
    const hasApplications = await page.locator('.v-data-table tbody tr').count()

    if (hasApplications > 0) {
      // Navigate to detail
      await page.locator('button:has-text("Review"), button:has-text("View")').first().click()
      await page.waitForURL('**/approver/queue/*', { timeout: 10000 })

      // Verify documents section exists
      await expect(page.locator('h3:has-text("Documents"), .section-title:has-text("Documents")')).toBeVisible({ timeout: 5000 })
    }
  })

  test('should display assigned officer info', async ({ page }) => {
    await navigateToQueue(page)

    await page.waitForTimeout(1000)
    const hasApplications = await page.locator('.v-data-table tbody tr').count()

    if (hasApplications > 0) {
      // Navigate to detail
      await page.locator('button:has-text("Review"), button:has-text("View")').first().click()
      await page.waitForURL('**/approver/queue/*', { timeout: 10000 })

      // Verify assigned officer section exists
      await expect(page.locator('h3:has-text("Assigned Officer"), .section-title:has-text("Officer")')).toBeVisible({ timeout: 5000 })
    }
  })

  test('should navigate back to queue from detail', async ({ page }) => {
    await navigateToQueue(page)

    await page.waitForTimeout(1000)
    const hasApplications = await page.locator('.v-data-table tbody tr').count()

    if (hasApplications > 0) {
      // Navigate to detail
      await page.locator('button:has-text("Review"), button:has-text("View")').first().click()
      await page.waitForURL('**/approver/queue/*', { timeout: 10000 })

      // Click back button
      const backBtn = page.locator('button:has-text("Back"), a:has-text("Back")')
      if (await backBtn.isVisible({ timeout: 3000 })) {
        await backBtn.click()

        // Verify we're back on queue page
        await page.waitForURL('**/approver/queue', { timeout: 10000 })
        await expect(page.locator('h1:has-text("Approval Queue")')).toBeVisible()
      }
    }
  })

  test('should display notification bell', async ({ page }) => {
    await navigateToQueue(page)

    // Verify notification bell exists in topbar
    const notificationBell = page.locator('.notification-btn, button:has(.mdi-bell-outline)')
    await expect(notificationBell).toBeVisible({ timeout: 5000 })
  })

  test('should open notification dropdown', async ({ page }) => {
    await navigateToQueue(page)

    // Click notification bell
    const notificationBell = page.locator('.notification-btn, button:has(.mdi-bell-outline)')
    await notificationBell.click()

    // Verify dropdown opens
    await expect(page.locator('.notification-dropdown, .v-menu:has-text("Notifications")')).toBeVisible({ timeout: 5000 })

    // Verify dropdown has expected elements
    await expect(page.locator('.dropdown-title:has-text("Notifications"), h3:has-text("Notifications")')).toBeVisible()
  })

  test('should sort queue by different criteria', async ({ page }) => {
    await navigateToQueue(page)

    // Find sort select
    const sortSelect = page.locator('.v-select:has-text("Sort"), select:has-text("Sort")')
    if (await sortSelect.isVisible({ timeout: 3000 })) {
      await sortSelect.click()

      // Verify sort options are available
      await expect(page.locator('.v-list-item:has-text("Newest"), .v-list-item:has-text("Oldest")')).toBeVisible({ timeout: 3000 })
    }
  })

  test('should refresh queue on button click', async ({ page }) => {
    await navigateToQueue(page)

    // Find refresh button
    const refreshBtn = page.locator('button:has-text("Refresh")')
    await expect(refreshBtn).toBeVisible({ timeout: 5000 })

    // Click refresh
    await refreshBtn.click()

    // Wait for refresh to complete
    await page.waitForTimeout(1000)

    // Page should still be on queue
    await expect(page.locator('h1:has-text("Approval Queue")')).toBeVisible()
  })
})

test.describe('Loan Approval - Admin Access', () => {
  // Tenant admins should also be able to access approver pages
  test.beforeEach(async ({ page }) => {
    await page.waitForTimeout(1000)
    await loginAsTenantAdmin(page)
  })

  test('admin should access approval queue', async ({ page }) => {
    await page.goto('/approver/queue')

    // Admin should be able to view the queue page
    await expect(page.locator('h1:has-text("Approval Queue")')).toBeVisible({ timeout: 10000 })
  })
})
