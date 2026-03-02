# Ascendent - Deployment Guide

This guide covers deploying Ascendent to production using Railway (backend API) and Vercel (frontend SPA).

## Architecture Overview

- **Backend API**: Deployed to Railway (Node.js server)
- **Frontend SPA**: Deployed to Vercel (static site)
- **Database**: MongoDB Atlas
- **File Storage**: Cloudinary

## Prerequisites

1. GitHub repository with your code
2. Railway account (https://railway.app/)
3. Vercel account (https://vercel.com/)
4. MongoDB Atlas account (https://cloud.mongodb.com/)
5. Cloudinary account (https://cloudinary.com/)

## 1. MongoDB Atlas Setup

### Create Cluster

1. Log in to MongoDB Atlas
2. Create a new cluster (M0 free tier is fine for development)
3. Create a database user with read/write permissions
4. Note your connection string

### Configure IP Allowlist

1. Go to Network Access in Atlas
2. Add Railway's static IP addresses (you'll get these after Railway deployment)
3. Or allow access from anywhere (0.0.0.0/0) for initial testing

### Get Connection String

Your connection string should look like:
```
mongodb+srv://username:password@cluster.mongodb.net/ascendent?retryWrites=true&w=majority
```

## 2. Railway Setup (Backend API)

### Initial Setup

1. Go to https://railway.app/ and sign in
2. Click "New Project"
3. Choose "Deploy from GitHub repo"
4. Select your Ascendent repository
5. Railway will auto-detect the Nuxt.js application

### Configure Environment Variables

Go to your Railway project settings and add these environment variables:

```bash
# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ascendent?retryWrites=true&w=majority

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# SMTP Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=noreply@ascendent.com

# Application
APP_URL=https://your-frontend-domain.vercel.app
```

**Important**: Generate strong, random secrets for JWT keys in production.

### Build Configuration

Railway will automatically:
1. Install dependencies with `npm install`
2. Build the application with `npm run build`
3. Start the server with `npm start` (which runs `node .output/server/index.mjs`)

The `railway.json` file at the project root configures this:
```json
{
  "build": { "builder": "NIXPACKS" },
  "deploy": {
    "startCommand": "node .output/server/index.mjs",
    "healthcheckPath": "/api/health"
  }
}
```

### Get Your API URL

After deployment, Railway will provide a public URL like:
```
https://your-api-domain.up.railway.app
```

Make note of this URL - you'll need it for Vercel.

### Verify Deployment

Visit `https://your-api-domain.up.railway.app/api/health`

You should see:
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## 3. Vercel Setup (Frontend SPA)

### Initial Setup

1. Go to https://vercel.com/ and sign in
2. Click "Add New Project"
3. Import your Ascendent GitHub repository
4. Vercel will auto-detect the Nuxt.js framework

### Configure Build Settings

Vercel should automatically detect these settings:
- **Framework Preset**: Nuxt.js
- **Build Command**: `npm run build:client`
- **Output Directory**: `dist`

The `vercel.json` file at the project root ensures proper SPA routing:
```json
{
  "buildCommand": "npm run build:client",
  "outputDirectory": "dist",
  "routes": [
    { "src": "/(.*)", "dest": "/index.html" }
  ]
}
```

### Configure Environment Variables

Add this environment variable in Vercel:

```bash
NUXT_PUBLIC_API_BASE=https://your-api-domain.up.railway.app/api
```

Replace `your-api-domain.up.railway.app` with your actual Railway domain.

### Deploy

1. Click "Deploy"
2. Vercel will build and deploy your frontend
3. You'll get a URL like `https://your-app.vercel.app`

### Update Railway APP_URL

Go back to Railway and update the `APP_URL` environment variable with your Vercel URL:
```bash
APP_URL=https://your-app.vercel.app
```

This is needed for CORS configuration.

## 4. Cloudinary Setup

1. Log in to Cloudinary
2. Go to Dashboard to find your credentials:
   - Cloud Name
   - API Key
   - API Secret
3. Add these to both Railway and Vercel environment variables (if needed)

## 5. Final Configuration

### Update MongoDB IP Allowlist

If you initially set MongoDB to allow access from anywhere (0.0.0.0/0), you should now:

1. Get Railway's static IPs from their documentation
2. Update MongoDB Atlas Network Access to only allow those IPs

### Test the Deployment

1. Visit your Vercel frontend URL
2. Try to log in (use seed data if available)
3. Test file uploads (should go to Cloudinary)
4. Check that all API calls work

### Monitor Logs

- **Railway**: Click on your project → Deployments → View logs
- **Vercel**: Click on your project → Deployments → View function logs

## 6. Custom Domains (Optional)

### Railway Custom Domain

1. Go to Railway project settings
2. Click "Domains"
3. Add your custom domain (e.g., `api.yourdomain.com`)
4. Update DNS records as instructed

### Vercel Custom Domain

1. Go to Vercel project settings
2. Click "Domains"
3. Add your custom domain (e.g., `app.yourdomain.com`)
4. Update DNS records as instructed

### Update Environment Variables

After adding custom domains, update:
- Railway: `APP_URL=https://app.yourdomain.com`
- Vercel: `NUXT_PUBLIC_API_BASE=https://api.yourdomain.com/api`

## 7. Continuous Deployment

Both Railway and Vercel support automatic deployments:

- **Main Branch**: Automatically deploys to production
- **Other Branches**: Create preview deployments

### Branch Protection

Consider setting up branch protection rules on GitHub:
1. Require pull request reviews
2. Require status checks to pass
3. No direct pushes to main

## 8. Database Seeding

To seed your production database:

1. Update your seed script with production connection string (temporarily)
2. Run: `npm run seed`
3. Remove the production connection string from your local `.env`

**Warning**: Never commit production credentials to version control.

## 9. Monitoring and Maintenance

### Health Checks

Set up monitoring for:
- Railway: `/api/health` endpoint
- MongoDB Atlas: Enable monitoring alerts
- Cloudinary: Check usage limits

### Backups

- MongoDB Atlas: Configure automated backups
- Railway: Automatic backups included
- Cloudinary: Media assets are persistent

### Security

- Rotate JWT secrets regularly
- Keep dependencies updated: `npm audit`
- Monitor for security vulnerabilities
- Review audit logs regularly

## Troubleshooting

### Common Issues

**API returns 404**
- Check `NUXT_PUBLIC_API_BASE` in Vercel is correct
- Verify Railway deployment succeeded

**Authentication not working**
- Check JWT secrets match between Railway and any local testing
- Verify cookies are being set (check browser dev tools)

**File uploads fail**
- Verify Cloudinary credentials in Railway
- Check file size limits

**CORS errors**
- Verify `APP_URL` in Railway matches your Vercel domain
- Check CORS middleware is properly configured

### Viewing Logs

**Railway:**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link to project
railway link

# View logs
railway logs
```

**Vercel:**
```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Link to project
vercel link

# View logs
vercel logs
```

## Support

For issues specific to deployment platforms:
- Railway: https://railway.app/help
- Vercel: https://vercel.com/support
- MongoDB Atlas: https://www.mongodb.com/support
