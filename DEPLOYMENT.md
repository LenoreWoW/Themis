# Themis Deployment Guide

## Repository Structure

The repository contains two main applications:
```
Themis/
├── themis-client/          # Main Themis application
├── project-collector/      # Project Collector application
└── Themis.API/            # Backend API
```

## Deployment Options

Both applications support two deployment environments:

1. **Subdomain Deployment**
   - Traditional deployment with Nginx
   - Full control over the environment
   - Suitable for production use

2. **Netlify Deployment**
   - Automated deployments from GitHub
   - Easy staging/preview environments
   - Suitable for development and testing

## Netlify Deployment

### Prerequisites
- GitHub repository with the Themis codebase
- Netlify account
- API deployed and accessible

### Setup Steps

#### Themis Application

1. **Connect to GitHub**
   - Go to [Netlify](https://app.netlify.com/)
   - Click "Add new site" > "Import an existing project"
   - Connect to your GitHub repository
   - Select the repository containing Themis

2. **Configure Build Settings**
   - Base directory: `themis-client`
   - Build command: `npm run build`
   - Publish directory: `themis-client/build`
   - Node version: 18
   - NPM flags: `--legacy-peer-deps`

3. **Set Environment Variables**
   In Netlify dashboard, go to Site settings > Environment variables:
   ```
   REACT_APP_API_URL=https://api.pmo.projects.mod.qa/api
   REACT_APP_ENVIRONMENT=production
   REACT_APP_BASE_URL=https://pmo.projects.mod.qa
   ```

#### Project Collector Application

1. **Connect to GitHub**
   - Go to [Netlify](https://app.netlify.com/)
   - Click "Add new site" > "Import an existing project"
   - Connect to your GitHub repository
   - Select the repository containing Themis

2. **Configure Build Settings**
   - Base directory: `project-collector`
   - Build command: `npm run build`
   - Publish directory: `project-collector/build`
   - Node version: 18
   - NPM flags: `--legacy-peer-deps`

3. **Set Environment Variables**
   In Netlify dashboard, go to Site settings > Environment variables:
   ```
   REACT_APP_API_URL=https://api.pmo.projects.mod.qa/api
   REACT_APP_ENVIRONMENT=production
   REACT_APP_BASE_URL=https://collector.pmo.projects.mod.qa
   ```

### Domain Configuration

#### Themis
- Production: `pmo.projects.mod.qa`
- Staging: `themis-staging.netlify.app`

#### Project Collector
- Production: `collector.pmo.projects.mod.qa`
- Staging: `collector-staging.netlify.app`

### Deployment Workflow

1. **Development**
   - Work on feature branches for both applications
   - Push to GitHub
   - Netlify automatically creates preview deployments

2. **Staging**
   - Merge to staging branch
   - Netlify automatically deploys to staging URLs
   - Test with staging API

3. **Production**
   - Merge to main branch
   - Netlify automatically deploys to production
   - Or manually trigger deployment

## Environment Configuration

### API Endpoints
- Production: `https://api.pmo.projects.mod.qa/api`
- Staging: `https://api.pmo.projects.mod.qa/api`

### Frontend URLs
#### Themis
- Production: `https://pmo.projects.mod.qa`
- Staging: `https://themis-staging.netlify.app`

#### Project Collector
- Production: `https://collector.pmo.projects.mod.qa`
- Staging: `https://collector-staging.netlify.app`

## Important Notes

1. **API Access**
   - Ensure your API has CORS configured to accept requests from all domains
   - Update CORS settings in `Program.cs` to include all domains

2. **Environment Variables**
   - Keep environment variables in sync between all deployments
   - Use Netlify's environment variable management for sensitive data

3. **Database**
   - Use the same database for all deployments
   - Ensure proper backup and migration procedures

4. **Authentication**
   - Configure OAuth providers to accept all domains
   - Update callback URLs in authentication providers

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Check API CORS configuration
   - Verify allowed origins in `Program.cs`

2. **API Connection Issues**
   - Verify API is running and accessible
   - Check environment variables
   - Test API endpoints directly

3. **Build Failures**
   - Check Node.js version (must be 18.x)
   - Verify all dependencies are installed
   - Check for TypeScript errors

4. **Deployment Issues**
   - Check Netlify build logs
   - Verify GitHub repository permissions
   - Ensure all required files are committed 