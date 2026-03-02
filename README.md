# Ascendent

A modern, multi-tenant lending platform built with **Nuxt 3**, **TypeScript**, **Vuetify 3**, and **MongoDB**. Designed for financial institutions to manage loan applications, approvals, and multi-tenant operations with a professional, customizable UI.

## 🚀 Tech Stack

- **Frontend**: Nuxt 3 (SPA mode) + Vue 3 + TypeScript
- **UI Components**: Vuetify 3 (heavily customized theme)
- **State Management**: Pinia
- **Backend API**: Nuxt server/api
- **Database**: MongoDB Atlas (Mongoose)
- **Authentication**: JWT (access + refresh tokens)
- **Caching**: Redis (rate limiting, session storage)
- **File Storage**: Cloudinary
- **Desktop**: Tauri (cross-platform native apps)

## 📋 Project Status

✅ **Steps 1-5, 10, 11: Core Platform Complete!**

Current implementation:
- Project scaffolding with Nuxt 3 + TypeScript + Pinia
- Full JWT authentication with role-based access control
- Comprehensive security hardening (CSRF, rate limiting, session management)
- System Admin and User Management modules
- Vuetify 3 with custom Ascendent theme
- Light/Dark mode support
- Four role-specific dashboards (System Admin, Tenant Admin, Officer, Approver)
- StatCard component and real-time stats APIs
- Role-based navigation and authentication
- Professional financial application aesthetic

**Next Steps:** Loan Types Module (Step 6)

See [docs/plans/ascendent-compound-engineering-plan.md](docs/plans/ascendent-compound-engineering-plan.md) for the full implementation roadmap.

## 🎨 Design System

Ascendent uses a **custom Vuetify 3 theme** that moves away from default Material Design to achieve a modern, professional financial application look.

### Color Palette
- **Primary**: `#2563EB` (Modern blue)
- **Success**: `#10B981` (Emerald green)
- **Warning**: `#F59E0B` (Amber)
- **Error**: `#EF4444` (Red)

### Key Design Principles
- Subtle shadows (vs Material's prominent elevations)
- No uppercase button text (modern, approachable)
- Inter font for professional typography
- 12px border radius (softer than Material's 4px)

See [docs/VUETIFY_CUSTOMIZATION.md](docs/VUETIFY_CUSTOMIZATION.md) for detailed customization guidelines.

## 🛠️ Setup

### Prerequisites
- Node.js v20.19.6 or higher
- npm 10.8.2 or higher
- MongoDB Atlas account (for database)

### Installation

```bash
# Install dependencies
npm install

# Create .env file (copy from .env.example when available)
# Add your MongoDB URI, JWT secrets, etc.
```

### Development

```bash
# Start development server
npm run dev

# Open browser to http://localhost:3000
```

The development server includes:
- Hot Module Replacement (HMR)
- Auto-imports for Nuxt, Vue, and Vuetify components
- TypeScript support
- Pinia devtools

### Building

```bash
# Build for web (SPA)
npm run build

# Build for desktop (Tauri)
npm run build:desktop

# Preview production build
npm run preview
```

## 📁 Project Structure

```
ascendent/
├── .nuxt/                  # Nuxt build output (auto-generated)
├── composables/            # Reusable composables
│   └── useAscendentTheme.ts # Theme management
├── docs/                   # Documentation
│   ├── plans/              # Implementation plans
│   ├── brainstorms/        # Design decisions
│   └── VUETIFY_CUSTOMIZATION.md
├── middleware/             # Nuxt middleware (route guards)
├── pages/                  # Application pages (file-based routing)
│   └── index.vue          # Dashboard page
├── plugins/                # Nuxt plugins
│   └── vuetify.ts         # Vuetify configuration
├── public/                 # Static assets
├── server/                 # Server-side code
│   ├── api/               # API endpoints
│   ├── middleware/        # Server middleware
│   ├── models/            # Mongoose models
│   └── utils/             # Server utilities
├── stores/                 # Pinia stores
├── styles/                 # Global styles
│   └── vuetify/           # Vuetify theme customization
│       ├── _variables.scss
│       ├── _components.scss
│       └── index.scss
├── types/                  # TypeScript type definitions
├── app.vue                 # Root component
├── nuxt.config.ts          # Nuxt configuration
├── package.json            # Dependencies and scripts
└── tsconfig.json           # TypeScript configuration
```

## 🔒 Security Features (Planned)

- Account lockout after failed login attempts
- CSRF protection on state-changing operations
- Password strength validation with zxcvbn
- Secure session management with refresh tokens
- File upload validation and malware scanning
- Security headers (CSP, HSTS, X-Frame-Options)
- Input sanitization and validation

See Step 3 in the engineering plan for full security implementation.

## 👥 User Roles

1. **System Admin** - Platform-wide management
2. **Tenant Admin** - Organization management
3. **Tenant Officer** - Create loan applications
4. **Tenant Approver** - Review and approve loans

## 🌐 Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## 📚 Documentation

- [Engineering Plan](docs/plans/ascendent-compound-engineering-plan.md) - Complete implementation roadmap
- [Component Library Brainstorm](docs/brainstorms/2026-03-02-component-library-brainstorm.md) - Vuetify selection rationale
- [Vuetify Customization Guide](docs/VUETIFY_CUSTOMIZATION.md) - Theme customization reference

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## 🚢 Deployment

### Web Deployment
- **Frontend**: Vercel (SPA hosting)
- **Backend API**: Railway (Nuxt server)

### Desktop Deployment
- **Windows**: `.exe` installer
- **macOS**: `.dmg` installer
- **Linux**: `.AppImage`

See the engineering plan for deployment steps.

## 🤝 Contributing

This is a private project. For internal team members:
1. Follow the engineering plan steps
2. Maintain TypeScript strict mode
3. Test both light and dark themes
4. Update documentation when adding features
5. Follow the Vuetify customization guidelines

## 📝 License

Proprietary - All rights reserved

## 🔗 Related Resources

- [Nuxt 3 Documentation](https://nuxt.com/docs)
- [Vuetify 3 Documentation](https://vuetifyjs.com/)
- [Pinia Documentation](https://pinia.vuejs.org/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Tauri Documentation](https://tauri.app/)

---

**Version**: 1.0.0-alpha
**Last Updated**: March 2, 2026
**Status**: In Development (Steps 1-5, 10-11 Complete)
