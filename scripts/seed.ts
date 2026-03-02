/**
 * Database Seeder Script
 *
 * Creates initial data for development and testing:
 * - System Admin user (admin@ascendent.com / Admin@123)
 * - Demo tenant (Ascendent Financial)
 * - Demo tenant admin (demo.admin@ascendent.com / Demo@123)
 *
 * Usage: npx tsx scripts/seed.ts
 */

import mongoose from 'mongoose'
import { hashPassword } from '../server/utils/password'

// Import models
import Tenant from '../server/models/Tenant'
import User from '../server/models/User'
import { LoanType } from '../server/models/LoanType'

// Load environment variables
import dotenv from 'dotenv'
dotenv.config()

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI environment variable is not set')
  process.exit(1)
}

async function seed() {
  try {
    console.log('🌱 Starting database seeding...\n')

    // Connect to database
    await mongoose.connect(MONGODB_URI!)
    console.log('✅ Connected to MongoDB\n')

    // 1. Create System Admin
    console.log('👤 Creating System Admin...')
    const existingSystemAdmin = await User.findOne({
      email: 'admin@ascendent.com'
    })

    if (existingSystemAdmin) {
      console.log('⚠️  System Admin already exists (admin@ascendent.com)')
    } else {
      const systemAdminPassword = await hashPassword('Admin@123')
      const systemAdmin = await User.create({
        tenantId: null, // System admins have no tenant
        role: 'system_admin',
        email: 'admin@ascendent.com',
        passwordHash: systemAdminPassword,
        firstName: 'System',
        lastName: 'Administrator',
        isActive: true,
      })
      console.log('✅ System Admin created')
      console.log('   Email: admin@ascendent.com')
      console.log('   Password: Admin@123')
      console.log('   ID:', systemAdmin._id.toString())
    }

    console.log('')

    // 2. Create Demo Tenant
    console.log('🏢 Creating Demo Tenant...')
    let demoTenant = await Tenant.findOne({ slug: 'ascendent-financial' })

    if (demoTenant) {
      console.log('⚠️  Demo Tenant already exists (ascendent-financial)')
    } else {
      demoTenant = await Tenant.create({
        name: 'Ascendent Financial',
        slug: 'ascendent-financial',
        isActive: true,
      })
      console.log('✅ Demo Tenant created')
      console.log('   Name: Ascendent Financial')
      console.log('   Slug: ascendent-financial')
      console.log('   ID:', demoTenant._id.toString())
    }

    console.log('')

    // 3. Create Demo Tenant Admin
    console.log('👤 Creating Demo Tenant Admin...')
    const existingTenantAdmin = await User.findOne({
      email: 'demo.admin@ascendent.com'
    })

    if (existingTenantAdmin) {
      console.log('⚠️  Demo Tenant Admin already exists (demo.admin@ascendent.com)')
    } else {
      const tenantAdminPassword = await hashPassword('Demo@123')
      const tenantAdmin = await User.create({
        tenantId: demoTenant._id,
        role: 'tenant_admin',
        email: 'demo.admin@ascendent.com',
        passwordHash: tenantAdminPassword,
        firstName: 'Demo',
        lastName: 'Administrator',
        isActive: true,
      })
      console.log('✅ Demo Tenant Admin created')
      console.log('   Email: demo.admin@ascendent.com')
      console.log('   Password: Demo@123')
      console.log('   Tenant: Ascendent Financial')
      console.log('   ID:', tenantAdmin._id.toString())
    }

    console.log('')

    // 4. Create Demo Tenant Officer
    console.log('👤 Creating Demo Tenant Officer...')
    const existingTenantOfficer = await User.findOne({
      email: 'demo.officer@ascendent.com'
    })

    if (existingTenantOfficer) {
      console.log('⚠️  Demo Tenant Officer already exists (demo.officer@ascendent.com)')
    } else {
      const tenantOfficerPassword = await hashPassword('Officer@123')
      const tenantOfficer = await User.create({
        tenantId: demoTenant._id,
        role: 'tenant_officer',
        email: 'demo.officer@ascendent.com',
        passwordHash: tenantOfficerPassword,
        firstName: 'Demo',
        lastName: 'Officer',
        isActive: true,
      })
      console.log('✅ Demo Tenant Officer created')
      console.log('   Email: demo.officer@ascendent.com')
      console.log('   Password: Officer@123')
      console.log('   Tenant: Ascendent Financial')
      console.log('   ID:', tenantOfficer._id.toString())
    }

    console.log('')

    // 5. Create Demo Tenant Approver
    console.log('👤 Creating Demo Tenant Approver...')
    const existingTenantApprover = await User.findOne({
      email: 'demo.approver@ascendent.com'
    })

    if (existingTenantApprover) {
      console.log('⚠️  Demo Tenant Approver already exists (demo.approver@ascendent.com)')
    } else {
      const tenantApproverPassword = await hashPassword('Approver@123')
      const tenantApprover = await User.create({
        tenantId: demoTenant._id,
        role: 'tenant_approver',
        email: 'demo.approver@ascendent.com',
        passwordHash: tenantApproverPassword,
        firstName: 'Demo',
        lastName: 'Approver',
        isActive: true,
      })
      console.log('✅ Demo Tenant Approver created')
      console.log('   Email: demo.approver@ascendent.com')
      console.log('   Password: Approver@123')
      console.log('   Tenant: Ascendent Financial')
      console.log('   ID:', tenantApprover._id.toString())
    }

    console.log('')

    // 6. Create Default Loan Types for Demo Tenant
    console.log('💼 Creating Default Loan Types...')

    const defaultLoanTypes = [
      {
        name: 'Business Loan',
        description: 'Financing for business expansion, equipment, and working capital',
        defaultInterestRate: 12,
        minInterestRate: 10,
        maxInterestRate: 18,
        minLoanAmount: 50000,
        maxLoanAmount: 5000000,
        availableTerms: [6, 12, 24, 36, 48],
        requiredDocuments: [
          { documentName: 'Government-issued ID', description: 'Valid government ID of business owner', isRequired: true },
          { documentName: 'Business Permit', description: 'Current business registration certificate', isRequired: true },
          { documentName: 'Financial Statements', description: 'Latest audited financial statements', isRequired: true },
          { documentName: 'Collateral Documents', description: 'Property titles or asset documents', isRequired: true },
          { documentName: 'Business Plan', description: 'Detailed business plan and projections', isRequired: false },
        ],
      },
      {
        name: 'Salary Loan',
        description: 'Personal loan for salaried employees',
        defaultInterestRate: 10,
        minInterestRate: 8,
        maxInterestRate: 15,
        minLoanAmount: 10000,
        maxLoanAmount: 500000,
        availableTerms: [6, 12, 18, 24],
        requiredDocuments: [
          { documentName: 'Government-issued ID', description: 'Valid government ID', isRequired: true },
          { documentName: 'Certificate of Employment', description: 'Current employment certificate', isRequired: true },
          { documentName: 'Latest Payslips', description: 'Last 3 months payslips', isRequired: true },
          { documentName: 'Bank Statements', description: 'Last 3 months bank statements', isRequired: false },
        ],
      },
      {
        name: 'OFW Loan',
        description: 'Special loan program for Overseas Filipino Workers',
        defaultInterestRate: 9,
        minInterestRate: 7,
        maxInterestRate: 12,
        minLoanAmount: 20000,
        maxLoanAmount: 1000000,
        availableTerms: [12, 24, 36],
        requiredDocuments: [
          { documentName: 'Passport', description: 'Valid passport with work visa', isRequired: true },
          { documentName: 'OFW ID or OWWA Membership', description: 'OWWA or OFW ID card', isRequired: true },
          { documentName: 'Employment Contract', description: 'Current overseas employment contract', isRequired: true },
          { documentName: 'Latest Payslips', description: 'Last 3 months payslips', isRequired: true },
          { documentName: 'Remittance Records', description: 'Proof of remittances to Philippines', isRequired: false },
        ],
      },
      {
        name: 'Personal Loan',
        description: 'General purpose personal financing',
        defaultInterestRate: 14,
        minInterestRate: 12,
        maxInterestRate: 20,
        minLoanAmount: 5000,
        maxLoanAmount: 200000,
        availableTerms: [3, 6, 12, 18, 24],
        requiredDocuments: [
          { documentName: 'Government-issued ID', description: 'Valid government ID', isRequired: true },
          { documentName: 'Proof of Income', description: 'Latest payslip or ITR', isRequired: true },
          { documentName: 'Proof of Billing', description: 'Utility bill for address verification', isRequired: true },
        ],
      },
      {
        name: 'Auto Loan',
        description: 'Vehicle financing for cars and motorcycles',
        defaultInterestRate: 8,
        minInterestRate: 6,
        maxInterestRate: 12,
        minLoanAmount: 100000,
        maxLoanAmount: 3000000,
        availableTerms: [12, 24, 36, 48, 60],
        requiredDocuments: [
          { documentName: 'Government-issued ID', description: 'Valid government ID', isRequired: true },
          { documentName: 'Proof of Income', description: 'Latest payslips or ITR', isRequired: true },
          { documentName: 'Vehicle Quotation', description: 'Official vehicle quotation or invoice', isRequired: true },
          { documentName: 'Proof of Billing', description: 'Utility bill for address verification', isRequired: true },
          { documentName: "Driver's License", description: 'Valid driver\'s license', isRequired: false },
        ],
      },
      {
        name: 'Housing Loan',
        description: 'Home purchase and construction financing',
        defaultInterestRate: 7,
        minInterestRate: 5,
        maxInterestRate: 10,
        minLoanAmount: 500000,
        maxLoanAmount: 10000000,
        availableTerms: [60, 120, 180, 240, 300],
        requiredDocuments: [
          { documentName: 'Government-issued ID', description: 'Valid government ID', isRequired: true },
          { documentName: 'Proof of Income', description: 'Latest payslips and ITR', isRequired: true },
          { documentName: 'Property Documents', description: 'Title or contract to sell', isRequired: true },
          { documentName: 'Tax Declaration', description: 'Property tax declaration', isRequired: true },
          { documentName: 'Building Plans', description: 'Approved building plans (for construction)', isRequired: false },
        ],
      },
    ]

    let loanTypesCreated = 0
    let loanTypesExisting = 0

    for (const loanTypeData of defaultLoanTypes) {
      const existingLoanType = await LoanType.findOne({
        tenantId: demoTenant._id,
        name: loanTypeData.name,
      })

      if (existingLoanType) {
        loanTypesExisting++
      } else {
        await LoanType.create({
          ...loanTypeData,
          tenantId: demoTenant._id,
          isActive: true,
        })
        loanTypesCreated++
      }
    }

    if (loanTypesCreated > 0) {
      console.log(`✅ Created ${loanTypesCreated} loan types for Demo Tenant`)
    }
    if (loanTypesExisting > 0) {
      console.log(`⚠️  ${loanTypesExisting} loan types already exist`)
    }

    console.log('')
    console.log('🎉 Database seeding completed successfully!')
    console.log('')
    console.log('📋 Summary of Test Accounts:')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('System Admin:')
    console.log('  Email: admin@ascendent.com | Password: Admin@123')
    console.log('')
    console.log('Demo Tenant (Ascendent Financial):')
    console.log('  Admin:    demo.admin@ascendent.com    | Password: Demo@123')
    console.log('  Officer:  demo.officer@ascendent.com  | Password: Officer@123')
    console.log('  Approver: demo.approver@ascendent.com | Password: Approver@123')
    console.log('')
    console.log(`  Loan Types: ${loanTypesCreated + loanTypesExisting} available`)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

  } catch (error) {
    console.error('❌ Seeding failed:', error)
    process.exit(1)
  } finally {
    // Close database connection
    await mongoose.connection.close()
    console.log('\n✅ Database connection closed')
  }
}

// Run the seeder
seed()
