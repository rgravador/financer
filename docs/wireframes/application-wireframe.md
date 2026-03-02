# Ascendent Application Wireframe

## Color Scheme
- **Primary**: Navy Blue (#1e3a8a)
- **Secondary**: Amber Gold (#f59e0b)
- **Accent**: Yellow Gold (#eab308)
- **Background**: Light Gray (#F8FAFC)
- **Surface**: White (#FFFFFF)

---

## Application Layout Structure

```
┌─────────────────────────────────────────────────────────────────┐
│                         APP TOPBAR                              │
│  [☰] Page Title               [🔔] [User Avatar ▼]             │
├─────────────────────────────────────────────────────────────────┤
│         │                                                        │
│   APP   │                                                        │
│ SIDEBAR │                  PAGE CONTENT                         │
│         │                                                        │
│  Nav    │                                                        │
│  Items  │                                                        │
│         │                                                        │
│         │                                                        │
│         │                                                        │
└─────────────────────────────────────────────────────────────────┘
```

---

## 1. App Topbar Component

```
┌────────────────────────────────────────────────────────────────────────┐
│  [☰ Menu]  Dashboard                        [🔔 3] [JD ▼]             │
│                                              Notifications  User Menu   │
└────────────────────────────────────────────────────────────────────────┘

Components:
- Mobile menu toggle (visible on small screens)
- Dynamic page title (extracted from route)
- Notification bell with badge
- User menu dropdown
```

### User Menu Dropdown

```
┌──────────────────────┐
│  John Doe            │
│  john@example.com    │
│  ┌────────────────┐  │
│  │ Tenant Admin   │  │
│  └────────────────┘  │
├──────────────────────┤
│  👤 Profile          │
│  ⚙️  Settings        │
│  🚪 Logout           │
└──────────────────────┘
```

---

## 2. App Sidebar Component

```
┌──────────────────────────┐
│                          │
│  ╔═══════════════════╗  │
│  ║   ASCENDENT       ║  │
│  ║   [Logo]          ║  │
│  ╚═══════════════════╝  │
│                          │
│  ┌────────────────────┐ │
│  │  John Doe          │ │
│  │  Tenant Admin      │ │
│  └────────────────────┘ │
│                          │
│  ► Dashboard            │
│                          │
│  ► Tenants              │
│  ► Users                │
│  ► Loan Types           │
│  ► Loan Applications    │
│  ► Payments             │
│  ► Reports              │
│  ► Audit Logs           │
│                          │
│  ► Settings             │
│                          │
└──────────────────────────┘

Features:
- Collapsible on desktop
- Drawer on mobile
- Role-based navigation items
- Active state highlighting (Navy Blue bg)
```

---

## 3. User Roles & Access

### System Admin
```
Navigation:
├── Dashboard (System Overview)
├── Tenants Management
│   ├── All Tenants List
│   └── Tenant Details
├── System Audit Logs
└── System Settings
```

### Tenant Admin
```
Navigation:
├── Dashboard (Tenant Overview)
├── Users Management
│   ├── All Users
│   └── User Details
├── Loan Types
│   ├── List Loan Types
│   ├── Create Loan Type
│   └── Edit Loan Type
├── Loan Applications
│   ├── All Applications
│   └── Application Details
├── Payments
├── Reports
├── Audit Logs
└── Settings
```

### Tenant Officer
```
Navigation:
├── Dashboard
├── Loan Applications
│   ├── Create Application
│   ├── My Applications
│   └── Application Details
├── Clients
│   ├── Client List
│   └── Client Details
└── Reports
```

### Tenant Approver
```
Navigation:
├── Dashboard
├── Pending Approvals
│   ├── Loan Applications
│   └── Application Details
├── Approved Applications
├── Rejected Applications
└── Reports
```

---

## 4. Page Wireframes

### 4.1 System Admin - Dashboard

```
┌─────────────────────────────────────────────────────────────────┐
│  System Admin Dashboard                    [🔔] [Admin ▼]       │
├──────┬──────────────────────────────────────────────────────────┤
│      │  System Admin Dashboard                                  │
│      │  Complete oversight of all tenants and system activity   │
│ Nav  │                                                           │
│ Bar  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │
│      │  │   25     │ │   1.2M   │ │   450    │ │  98.5%   │   │
│      │  │ Tenants  │ │  Users   │ │  Active  │ │ Uptime   │   │
│      │  └──────────┘ └──────────┘ └──────────┘ └──────────┘   │
│      │                                                           │
│      │  Recent Tenant Activity                                  │
│      │  ┌────────────────────────────────────────────────────┐ │
│      │  │ Tenant      │ Status  │ Users │ Created    │ [⋮]  │ │
│      │  ├────────────────────────────────────────────────────┤ │
│      │  │ ABC Bank    │ Active  │  250  │ 2025-01-15 │ [⋮]  │ │
│      │  │ XYZ Credit  │ Active  │  120  │ 2025-01-10 │ [⋮]  │ │
│      │  │ DEF Finance │ Pending │   45  │ 2025-02-01 │ [⋮]  │ │
│      │  └────────────────────────────────────────────────────┘ │
│      │                                                           │
│      │  System Health                 Resource Usage            │
│      │  ┌──────────────────┐         ┌──────────────────┐      │
│      │  │ 🟢 Database: OK │         │ CPU: 45%         │      │
│      │  │ 🟢 API: OK      │         │ Memory: 62%      │      │
│      │  │ 🟢 Storage: OK  │         │ Disk: 38%        │      │
│      │  └──────────────────┘         └──────────────────┘      │
└─────────────────────────────────────────────────────────────────┘
```

### 4.2 System Admin - Tenants Management

```
┌─────────────────────────────────────────────────────────────────┐
│  Tenants                                    [🔔] [Admin ▼]       │
├──────┬──────────────────────────────────────────────────────────┤
│      │  Tenants Management                                      │
│      │  Manage all organizational tenants                       │
│ Nav  │                                                           │
│ Bar  │  [+ Create Tenant]           🔍 Search tenants...        │
│      │                                                           │
│      │  ┌────────────────────────────────────────────────────┐ │
│      │  │ Name        │ Status  │ Users │ Created    │ [⋮]  │ │
│      │  ├────────────────────────────────────────────────────┤ │
│      │  │ ABC Bank    │ 🟢 Active│ 250  │ 2025-01-15 │ View │ │
│      │  │ XYZ Credit  │ 🟢 Active│ 120  │ 2025-01-10 │ View │ │
│      │  │ DEF Finance │ 🟡 Pending│ 45  │ 2025-02-01 │ View │ │
│      │  │ GHI Loans   │ 🔴 Suspended│ 80│ 2024-12-05 │ View │ │
│      │  └────────────────────────────────────────────────────┘ │
│      │                                                           │
│      │  ◄ Previous  Page 1 of 5 (25 total)  Next ►            │
└─────────────────────────────────────────────────────────────────┘
```

### 4.3 System Admin - Tenant Details

```
┌─────────────────────────────────────────────────────────────────┐
│  Tenant Details                             [🔔] [Admin ▼]       │
├──────┬──────────────────────────────────────────────────────────┤
│      │  [← Back] ABC Bank                                       │
│      │                                                           │
│ Nav  │  ┌─────────────────────────────┐  ┌──────────────────┐  │
│ Bar  │  │  Tenant Information         │  │  Quick Actions   │  │
│      │  │                             │  │                  │  │
│      │  │  Name: ABC Bank             │  │  [Edit]         │  │
│      │  │  Status: 🟢 Active          │  │  [Suspend]      │  │
│      │  │  Created: Jan 15, 2025      │  │  [View Logs]    │  │
│      │  │  Users: 250                 │  │  [Settings]     │  │
│      │  │  Contact: admin@abc.com     │  │                  │  │
│      │  │                             │  └──────────────────┘  │
│      │  └─────────────────────────────┘                        │
│      │                                                           │
│      │  Recent Activity                                         │
│      │  ┌────────────────────────────────────────────────────┐ │
│      │  │ User Created      │ Jan Doe   │ 2025-03-01 10:30  │ │
│      │  │ Loan Approved     │ App #123  │ 2025-03-01 09:15  │ │
│      │  │ Settings Updated  │ Admin     │ 2025-02-28 16:45  │ │
│      │  └────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### 4.4 Tenant Admin - Dashboard

```
┌─────────────────────────────────────────────────────────────────┐
│  Dashboard                                  [🔔] [Admin ▼]       │
├──────┬──────────────────────────────────────────────────────────┤
│      │  Welcome back, John Doe                                  │
│      │  ABC Bank Dashboard                                      │
│ Nav  │                                                           │
│ Bar  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │
│      │  │   120    │ │   45     │ │  $2.5M   │ │   15     │   │
│      │  │  Users   │ │  Active  │ │  Disbursed│ │ Pending  │   │
│      │  │          │ │  Loans   │ │  This Mo. │ │ Approvals│   │
│      │  └──────────┘ └──────────┘ └──────────┘ └──────────┘   │
│      │                                                           │
│      │  Recent Loan Applications                                │
│      │  ┌────────────────────────────────────────────────────┐ │
│      │  │ ID    │ Client      │ Amount  │ Status  │ Date   │ │
│      │  ├────────────────────────────────────────────────────┤ │
│      │  │ #1234 │ John Smith  │ $50,000 │ Pending │ 3/1/25 │ │
│      │  │ #1233 │ Jane Doe    │ $25,000 │ Approved│ 2/28   │ │
│      │  │ #1232 │ Bob Wilson  │ $75,000 │ Review  │ 2/27   │ │
│      │  └────────────────────────────────────────────────────┘ │
│      │                                                           │
│      │  Portfolio Performance        Pending Tasks              │
│      │  ┌──────────────────┐         ┌──────────────────┐      │
│      │  │ [Chart: Loans]  │         │ • Review App #123│      │
│      │  │ by Status       │         │ • Approve User   │      │
│      │  │                 │         │ • Update Report  │      │
│      │  └──────────────────┘         └──────────────────┘      │
└─────────────────────────────────────────────────────────────────┘
```

### 4.5 Tenant Admin - Users Management

```
┌─────────────────────────────────────────────────────────────────┐
│  Users                                      [🔔] [Admin ▼]       │
├──────┬──────────────────────────────────────────────────────────┤
│      │  Users Management                                        │
│      │  Manage users and their roles                            │
│ Nav  │                                                           │
│ Bar  │  [+ Add User]                🔍 Search users...          │
│      │                                                           │
│      │  Filters: [All Roles ▼] [Active ▼] [All Departments ▼] │
│      │                                                           │
│      │  ┌────────────────────────────────────────────────────┐ │
│      │  │ Name       │ Email       │ Role    │ Status │ [⋮] │ │
│      │  ├────────────────────────────────────────────────────┤ │
│      │  │ John Doe   │ j@abc.com   │ Admin   │ 🟢    │ Edit│ │
│      │  │ Jane Smith │ jane@abc.com│ Officer │ 🟢    │ Edit│ │
│      │  │ Bob Wilson │ bob@abc.com │ Approver│ 🟢    │ Edit│ │
│      │  │ Alice Lee  │ alice@abc   │ Officer │ 🔴    │ Edit│ │
│      │  └────────────────────────────────────────────────────┘ │
│      │                                                           │
│      │  ◄ Previous  Page 1 of 12 (120 total)  Next ►          │
└─────────────────────────────────────────────────────────────────┘
```

### 4.6 Tenant Admin - Loan Types

```
┌─────────────────────────────────────────────────────────────────┐
│  Loan Types                                 [🔔] [Admin ▼]       │
├──────┬──────────────────────────────────────────────────────────┤
│      │  Loan Types Management                                   │
│      │  Configure available loan products                       │
│ Nav  │                                                           │
│ Bar  │  [+ Create Loan Type]        🔍 Search loan types...     │
│      │                                                           │
│      │  ┌────────────────────────────────────────────────────┐ │
│      │  │ Name           │ Rate │ Term  │ Status  │ [⋮]     │ │
│      │  ├────────────────────────────────────────────────────┤ │
│      │  │ Personal Loan  │ 8.5% │ 1-5y  │ 🟢 Active │ Edit │ │
│      │  │ Auto Loan      │ 6.2% │ 2-7y  │ 🟢 Active │ Edit │ │
│      │  │ Home Loan      │ 4.5% │ 5-30y │ 🟢 Active │ Edit │ │
│      │  │ Business Loan  │ 9.0% │ 1-10y │ 🔴 Inactive│Edit │ │
│      │  └────────────────────────────────────────────────────┘ │
│      │                                                           │
└─────────────────────────────────────────────────────────────────┘
```

### 4.7 Loan Type Form (Create/Edit)

```
┌─────────────────────────────────────────────────────────────────┐
│  New Loan Type                              [🔔] [Admin ▼]       │
├──────┬──────────────────────────────────────────────────────────┤
│      │  [← Back]  Edit Loan Type                               │
│      │                                                           │
│ Nav  │  ┌─────────────────────────────────┐  ┌──────────────┐  │
│ Bar  │  │  Basic Information              │  │  Loan Type   │  │
│      │  │                                 │  │  Information │  │
│      │  │  Name: [Personal Loan_______]  │  │              │  │
│      │  │                                 │  │  Status:     │  │
│      │  │  Description:                   │  │  🟢 Active   │  │
│      │  │  [___________________________] │  │              │  │
│      │  │  [___________________________] │  │  Created:    │  │
│      │  │                                 │  │  Jan 15,2025 │  │
│      │  │  Interest Rate: [8.5___] %     │  │              │  │
│      │  │                                 │  │  Updated:    │  │
│      │  │  Min Amount: [$5,000_______]   │  │  Mar 1, 2025 │  │
│      │  │  Max Amount: [$100,000_____]   │  │              │  │
│      │  │                                 │  │  [Deactivate]│  │
│      │  │  Min Term: [1____] years       │  └──────────────┘  │
│      │  │  Max Term: [5____] years       │                    │
│      │  │                                 │                    │
│      │  │  Required Documents:            │                    │
│      │  │  ☑ ID Proof                    │                    │
│      │  │  ☑ Income Proof                │                    │
│      │  │  ☑ Address Proof               │                    │
│      │  │  ☐ Collateral Documents        │                    │
│      │  │                                 │                    │
│      │  │  [Cancel]  [Save Loan Type]    │                    │
│      │  └─────────────────────────────────┘                    │
└─────────────────────────────────────────────────────────────────┘
```

### 4.8 Audit Logs

```
┌─────────────────────────────────────────────────────────────────┐
│  Organization Audit Logs                    [🔔] [Admin ▼]       │
├──────┬──────────────────────────────────────────────────────────┤
│      │  Organization Audit Logs                                 │
│      │  Activity trail for your organization                    │
│ Nav  │                                                           │
│ Bar  │  Filters:                                                │
│      │  ┌─────────────────────────────────────────────────────┐│
│      │  │ Action: [loan.submitted___]  Entity: [User______]  ││
│      │  │ From: [2025-02-01]           To: [2025-03-01]       ││
│      │  │ [Clear Filters]                                     ││
│      │  └─────────────────────────────────────────────────────┘│
│      │                                                           │
│      │  ┌────────────────────────────────────────────────────┐ │
│      │  │ Timestamp      │ User    │ Action       │ Entity  │ │
│      │  ├────────────────────────────────────────────────────┤ │
│      │  │ Mar 1, 10:30am │ J. Doe  │ loan.created │ Loan    │▼│
│      │  │ ├── Details: Created loan application #1234         │ │
│      │  │ ├── IP: 192.168.1.100                               │ │
│      │  │ └── Metadata: {"amount": 50000, "type": "personal"} │ │
│      │  │                                                      │ │
│      │  │ Mar 1, 9:15am  │ Admin   │ user.updated │ User    │▼│
│      │  │ Feb 28, 4:45pm │ J.Smith │ loan.approved│ Loan    │▼│
│      │  └────────────────────────────────────────────────────┘ │
│      │                                                           │
│      │  ◄ Previous  Page 1 of 50 (2,500 total)  Next ►        │
└─────────────────────────────────────────────────────────────────┘
```

### 4.9 Login Page

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                  │
│                                                                  │
│                    ┌────────────────────────┐                   │
│                    │                        │                   │
│                    │   ╔═══════════════╗   │                   │
│                    │   ║  ASCENDENT    ║   │                   │
│                    │   ║   [Logo]      ║   │                   │
│                    │   ╚═══════════════╝   │                   │
│                    │                        │                   │
│                    │  Sign in to continue   │                   │
│                    │                        │                   │
│                    │  Email                 │                   │
│                    │  [________________]    │                   │
│                    │                        │                   │
│                    │  Password              │                   │
│                    │  [________________]    │                   │
│                    │                        │                   │
│                    │  ☐ Remember me         │                   │
│                    │                        │                   │
│                    │  [   Sign In   ]       │                   │
│                    │                        │                   │
│                    │  Forgot password?      │                   │
│                    │                        │                   │
│                    └────────────────────────┘                   │
│                                                                  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 5. Component Hierarchy

```
App.vue
└── NuxtPage
    └── layouts/default.vue
        ├── AppTopbar
        │   ├── Mobile Menu Toggle
        │   ├── Page Title (dynamic)
        │   ├── Notification Badge
        │   └── UserMenu
        │       ├── User Info
        │       ├── Role Badge
        │       └── Actions (Profile, Settings, Logout)
        │
        ├── AppSidebar
        │   ├── Logo
        │   ├── User Profile Card
        │   └── Navigation Menu (role-based)
        │       ├── Dashboard
        │       ├── Tenants (System Admin only)
        │       ├── Users (Tenant Admin only)
        │       ├── Loan Types (Tenant Admin only)
        │       ├── Loan Applications
        │       ├── Payments
        │       ├── Reports
        │       ├── Audit Logs
        │       └── Settings
        │
        └── Page Content
            └── [Dynamic page component]
```

---

## 6. Responsive Breakpoints

### Desktop (≥1280px)
```
┌────────────────────────────────────────────┐
│  Topbar                                    │
├──────┬─────────────────────────────────────┤
│      │                                     │
│ Side │         Content                     │
│ bar  │         (Full Width)                │
│      │                                     │
└──────┴─────────────────────────────────────┘
```

### Tablet (768px - 1279px)
```
┌────────────────────────────────────────────┐
│  Topbar                                    │
├──────┬─────────────────────────────────────┤
│      │                                     │
│ Side │         Content                     │
│ bar  │         (Adjusted)                  │
│      │                                     │
└──────┴─────────────────────────────────────┘
```

### Mobile (<768px)
```
┌────────────────────────┐
│  [☰] Topbar            │
├────────────────────────┤
│                        │
│      Content           │
│      (Full Width)      │
│                        │
└────────────────────────┘

Sidebar as drawer:
┌────────────┬───────────┐
│            │           │
│  Sidebar   │  Content  │
│  (Overlay) │  (Dimmed) │
│            │           │
└────────────┴───────────┘
```

---

## 7. Navigation Flow

### System Admin Flow
```
Login
  │
  └─► System Dashboard
        │
        ├─► Tenants List
        │     │
        │     └─► Tenant Details
        │           │
        │           ├─► Edit Tenant
        │           ├─► View Users
        │           └─► View Activity
        │
        └─► System Audit Logs
              │
              └─► Filter & Search
```

### Tenant Admin Flow
```
Login
  │
  └─► Tenant Dashboard
        │
        ├─► Users Management
        │     │
        │     ├─► Add User
        │     └─► Edit User
        │
        ├─► Loan Types
        │     │
        │     ├─► Create Loan Type
        │     └─► Edit Loan Type
        │
        ├─► Loan Applications
        │     │
        │     └─► Application Details
        │
        └─► Audit Logs
```

### Officer Flow
```
Login
  │
  └─► Officer Dashboard
        │
        ├─► Create Application
        │     │
        │     ├─► Client Selection
        │     ├─► Loan Type Selection
        │     ├─► Document Upload
        │     └─► Submit
        │
        └─► My Applications
              │
              └─► View/Edit Application
```

### Approver Flow
```
Login
  │
  └─► Approver Dashboard
        │
        ├─► Pending Approvals
        │     │
        │     └─► Review Application
        │           │
        │           ├─► Approve
        │           ├─► Reject
        │           └─► Request More Info
        │
        └─► Approved/Rejected Lists
```

---

## 8. Data Tables Pattern

### Standard Table Layout
```
┌──────────────────────────────────────────────────────────────┐
│  [+ Action Button]              🔍 Search...    [Filter ▼]   │
├──────────────────────────────────────────────────────────────┤
│  Column 1  │  Column 2  │  Column 3  │  Status  │  Actions  │
├──────────────────────────────────────────────────────────────┤
│  Data 1    │  Data 2    │  Data 3    │  🟢      │  [⋮]      │
│  Data 1    │  Data 2    │  Data 3    │  🟡      │  [⋮]      │
│  Data 1    │  Data 2    │  Data 3    │  🔴      │  [⋮]      │
└──────────────────────────────────────────────────────────────┘
│  ◄ Previous    Page 1 of 10 (100 total)    Next ►          │
└──────────────────────────────────────────────────────────────┘

Features:
- Sortable columns
- Row hover effects (light navy blue background)
- Status indicators with color coding
- Action menu per row
- Pagination controls
```

---

## 9. Form Patterns

### Standard Form Layout
```
┌─────────────────────────────────────────────────────────────┐
│  Form Title                                                  │
│  Description text                                            │
│                                                              │
│  Field Label                                                 │
│  [Input Field___________________________________________]   │
│                                                              │
│  Field Label                                                 │
│  [Dropdown ▼]                                               │
│                                                              │
│  Field Label                                                 │
│  [Text Area____________________________________________]    │
│  [___________________________________________________]       │
│                                                              │
│  ☐ Checkbox Option                                          │
│                                                              │
│  [Cancel]                            [Submit Button]         │
└─────────────────────────────────────────────────────────────┘

Validation:
- Required fields marked with *
- Inline validation messages
- Error states in red
- Success states in green
```

---

## 10. Status Indicators

### Color Coding
- 🟢 **Green**: Active, Approved, Success
- 🟡 **Yellow**: Pending, In Review, Warning
- 🔴 **Red**: Inactive, Rejected, Error, Suspended
- 🔵 **Blue**: In Progress, Processing, Info

### Badge Styles
```
┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐
│  Active    │  │  Pending   │  │ Rejected   │  │ Processing │
│  (Green)   │  │  (Yellow)  │  │  (Red)     │  │  (Blue)    │
└────────────┘  └────────────┘  └────────────┘  └────────────┘
```

---

## 11. Empty States

```
┌─────────────────────────────────────────────────────────────┐
│                                                              │
│                        📋                                    │
│                   [Empty Icon]                               │
│                                                              │
│                   No items found                             │
│                                                              │
│         Try adjusting your filters or create a new item      │
│                                                              │
│                  [+ Create New Item]                         │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 12. Loading States

```
┌─────────────────────────────────────────────────────────────┐
│                                                              │
│                        ⚪                                    │
│                   [Spinner Icon]                             │
│                                                              │
│                   Loading...                                 │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Technology Stack

- **Frontend**: Nuxt 3, Vue 3, TypeScript
- **UI Framework**: Vuetify 3 (Material Design)
- **State Management**: Pinia
- **Backend**: Nuxt Server API (Nitro)
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT-based auth
- **Icons**: Material Design Icons (@mdi/font)
- **Styling**: SCSS with Vuetify theme system
