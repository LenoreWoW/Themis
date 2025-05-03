# Themis Netlify Deployment Guide

This guide provides instructions for deploying Themis on Netlify while ensuring data persistence.

## Overview

The deployment consists of two main components:
1. **Frontend**: Deployed on Netlify
2. **API**: Remains on existing server (api.pmo.projects.mod.qa)

Data persistence is maintained because the Netlify deployment only hosts the frontend application, while the API and database remain on the original server.

## Prerequisites

- Netlify account
- Git repository with Themis code
- Access to the existing API server
- Netlify CLI (optional)

## Deployment Steps

### 1. Configure netlify.toml

The `netlify.toml` file in the root directory configures the Netlify build:

```toml
[build]
  base = "themis-client"
  command = "npm run build"
  publish = "build"

[build.environment]
  NODE_VERSION = "18"
  NPM_FLAGS = "--legacy-peer-deps"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[context.production.environment]
  REACT_APP_API_URL = "https://api.pmo.projects.mod.qa/api"
  REACT_APP_ENVIRONMENT = "production"
  REACT_APP_BASE_URL = "https://themis.netlify.app"
```

### 2. Update API CORS Configuration

The API needs to accept requests from the Netlify domain. The `appsettings.json` file has been updated to include the Netlify domains in the CORS configuration:

```json
"CorsOrigins": [
  "http://localhost:3000",
  "https://pmo.projects.mod.qa",
  "https://themis.netlify.app",
  "https://*.netlify.app"
]
```

### 3. Deploy to Netlify

#### Option 1: Using Netlify CLI

```bash
# Install Netlify CLI if not already installed
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy to Netlify
netlify deploy --prod
```

#### Option 2: Using Netlify Dashboard

1. Go to [Netlify](https://app.netlify.com/)
2. Click "Add new site" > "Import an existing project"
3. Connect to your GitHub repository
4. Configure build settings:
   - Base directory: `themis-client`
   - Build command: `npm run build`
   - Publish directory: `themis-client/build`
5. Click "Deploy site"

### 4. Verify Deployment

1. Check that the frontend is deployed successfully on Netlify
2. Verify API connections are working
3. Test authentication and data operations

## Data Persistence

The data persistence is maintained because:

1. **Database remains unchanged**: The PostgreSQL database at api.pmo.projects.mod.qa continues to store all data
2. **API endpoints remain the same**: The frontend on Netlify connects to the same API endpoints
3. **Authentication tokens**: JWT authentication continues to work across domains

## Troubleshooting

### CORS Issues

If you see CORS errors in the browser console:

1. Verify the API's CORS configuration includes the Netlify domain
2. Check that the API is accessible from the Netlify domain
3. Ensure the API is properly handling preflight requests

### API Connection Issues

If the frontend cannot connect to the API:

1. Check the environment variables in Netlify
2. Verify the API URL is correct
3. Test the API endpoints directly

### Database Connectivity

If data is not being saved or retrieved:

1. Check the database connection in the API
2. Verify the API has proper permissions to access the database
3. Check for any changes in connection strings

## Maintenance

### Updating the Deployment

To update the Netlify deployment:

1. Push changes to the GitHub repository
2. Netlify will automatically rebuild and deploy the site

### Monitoring

1. Use Netlify's built-in analytics to monitor frontend performance
2. Continue to monitor the API and database as before

## Security Considerations

1. Ensure JWT secrets are properly protected
2. Consider using environment variables for sensitive configuration
3. Regularly update dependencies for security patches 