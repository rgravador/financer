import { chromium } from 'playwright';
import { mkdir } from 'fs/promises';
import { join } from 'path';

// Test credentials from scripts/seed.ts
const credentials = {
  system_admin: {
    email: 'admin@ascendent.com',
    password: 'Admin@123',
  },
  tenant_admin: {
    email: 'demo.admin@ascendent.com',
    password: 'Demo@123',
  },
  tenant_officer: {
    email: 'demo.officer@ascendent.com',
    password: 'Officer@123',
  },
  tenant_approver: {
    email: 'demo.approver@ascendent.com',
    password: 'Approver@123',
  },
};

// Pages to capture with their required roles
const pages = [
  // Tenant Admin pages
  { url: '/tenant/dashboard', name: 'tenant-admin-dashboard', role: 'tenant_admin' },
  { url: '/tenant/users', name: 'users-management', role: 'tenant_admin' },
  { url: '/tenant/loan-types', name: 'loan-types-list', role: 'tenant_admin' },
  { url: '/loans/applications', name: 'loan-applications', role: 'tenant_admin' },
  { url: '/tenant/settings', name: 'tenant-settings', role: 'tenant_admin' },
  { url: '/tenant/audit-logs', name: 'audit-logs', role: 'tenant_admin' },

  // Officer pages
  { url: '/officer/dashboard', name: 'officer-dashboard', role: 'tenant_officer' },

  // Approver pages
  { url: '/approver/dashboard', name: 'approver-dashboard', role: 'tenant_approver' },
  { url: '/approver/queue', name: 'approver-queue', role: 'tenant_approver' },
];

async function login(page, role) {
  const creds = credentials[role];

  console.log(`  Logging in as ${role} (${creds.email})...`);

  // Navigate to login page
  await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle' });

  // Fill login form
  await page.fill('input[type="email"]', creds.email);
  await page.fill('input[type="password"]', creds.password);

  // Click login button
  await page.click('button[type="submit"]');

  // Wait for navigation after login
  await page.waitForLoadState('networkidle');

  // Wait a bit for session to be established
  await page.waitForTimeout(1000);

  console.log(`  ✓ Logged in successfully`);
}

async function captureScreenshots() {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });

  // Create screenshots directory
  await mkdir('docs/screenshots', { recursive: true });

  console.log('Starting authenticated screenshot capture...\n');

  let currentRole = null;
  let page = await context.newPage();

  for (const pageConfig of pages) {
    try {
      // Login if switching roles
      if (currentRole !== pageConfig.role) {
        console.log(`\n🔐 Switching to ${pageConfig.role} role...`);

        // Close old page and create new one to clear session
        if (currentRole !== null) {
          await page.close();
          await context.clearCookies();
          page = await context.newPage();
        }

        await login(page, pageConfig.role);
        currentRole = pageConfig.role;
        console.log('');
      }

      const url = `http://localhost:3000${pageConfig.url}`;
      console.log(`📸 Capturing: ${pageConfig.name}`);
      console.log(`   URL: ${url}`);

      // Navigate to page
      await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });

      // Wait for content to load
      await page.waitForTimeout(2000);

      // Capture full page screenshot
      const screenshotPath = join('docs/screenshots', `${pageConfig.name}.png`);
      await page.screenshot({
        path: screenshotPath,
        fullPage: true
      });

      console.log(`   ✓ Saved: ${screenshotPath}\n`);
    } catch (error) {
      console.error(`   ✗ Failed: ${error.message}\n`);
    }
  }

  await browser.close();
  console.log('Screenshot capture complete!');
  console.log('\n📋 Summary:');
  console.log('  Roles used:');
  console.log('    - tenant_admin (demo.admin@ascendent.com)');
  console.log('    - tenant_officer (demo.officer@ascendent.com)');
  console.log('    - tenant_approver (demo.approver@ascendent.com)');
}

captureScreenshots().catch(console.error);
