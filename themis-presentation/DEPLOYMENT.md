# Themis Deployment Guide

This document outlines the process for deploying the Themis application to Netlify.

## Prerequisites

- Node.js 18.17.1 or higher
- npm 10.2.4 or higher
- Netlify account
- Netlify CLI (installed as a dev dependency)

## Deployment Steps

### First-time Setup

1. Create a Netlify account if you don't already have one
2. Install dependencies:
   ```
   npm install
   ```
3. Login to Netlify CLI:
   ```
   npx netlify login
   ```
4. Initialize Netlify site (first time only):
   ```
   npx netlify init
   ```
   - Choose "Create & configure a new site"
   - Select your team
   - Enter a site name (or leave blank for auto-generated name)

### Deployment

#### Preview Deployment

To deploy a preview version:

```
npm run netlify:deploy
```

This will build your application and deploy it to a unique preview URL.

#### Production Deployment

To deploy to production:

```
npm run netlify:deploy:prod
```

This will build and deploy to your main site URL.

### Local Development with Netlify

To test Netlify functions and redirects locally:

```
npm run netlify:dev
```

This starts a local development server that mimics the Netlify environment.

## Configuration

Deployment configuration is managed in `netlify.toml`. Key settings include:

- Build command and publish directory
- Environment variables
- Redirect rules for SPA routing
- Security headers

## Environment Variables

Production environment variables are set in the Netlify dashboard under Site settings > Build & deploy > Environment.

The following environment variables are required:

```
# Supabase Configuration
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key

# API Configuration
REACT_APP_API_URL=your_api_url
REACT_APP_BASE_URL=your_base_url

# Environment
REACT_APP_ENVIRONMENT=production
```

These can also be configured in the `netlify.toml` file under the appropriate context sections.

## Troubleshooting

If you encounter issues:

1. Check build logs in the Netlify dashboard
2. Verify that all required environment variables are set
3. Ensure the site build completes successfully locally before deploying
4. Confirm that your `netlify.toml` configuration is correct

## GitHub Actions Integration

This project includes a GitHub Actions workflow for continuous deployment. To set it up:

1. Go to your GitHub repository settings > Secrets and variables > Actions
2. Add the following secrets:
   - `NETLIFY_AUTH_TOKEN` - Your Netlify personal access token
   - `NETLIFY_SITE_ID` - Your Netlify site ID
   - `REACT_APP_SUPABASE_URL` - Your Supabase URL
   - `REACT_APP_SUPABASE_ANON_KEY` - Your Supabase anonymous key
   - `REACT_APP_API_URL` - Your API URL
   - `REACT_APP_BASE_URL` - Your application base URL

### Getting Your Netlify Access Token

1. Log in to Netlify
2. Go to User Settings > Applications > Personal access tokens
3. Generate a new token with an appropriate name
4. Copy the token immediately (it won't be shown again)

### Finding Your Netlify Site ID

1. Go to your Netlify site dashboard
2. Go to Site settings > General > Site details
3. Copy the API ID value

## Additional Resources

- [Netlify Docs](https://docs.netlify.com/)
- [React Deployment Best Practices](https://create-react-app.dev/docs/deployment/)
- [Netlify CLI Documentation](https://cli.netlify.com/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions) 