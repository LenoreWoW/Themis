# Deploying Themis to Netlify

This guide provides step-by-step instructions for deploying the Themis application to Netlify with Supabase integration.

## Prerequisites

- Netlify account (sign up at [netlify.com](https://netlify.com))
- Node.js and npm installed locally
- Git repository with the Themis code
- Supabase project set up (as described in the MIGRATION.md)

## Deployment Options

There are two ways to deploy to Netlify:

1. **Automatic deployment via GitHub**: Connects your GitHub repository to Netlify for CI/CD
2. **Manual deployment via Netlify CLI**: Deploy using the command line

## Option 1: Automatic Deployment via GitHub

### 1. Connect your repository to Netlify

1. Log in to your Netlify account
2. Click "New site from Git"
3. Select your Git provider (GitHub)
4. Authorize Netlify and select your repository
5. Configure the following build settings:
   - Build command: `npm run build`
   - Publish directory: `build`
   - Base directory: (leave blank)

### 2. Configure environment variables

1. Go to Site settings > Build & deploy > Environment
2. Add the following environment variables:
   - `REACT_APP_SUPABASE_URL`: `https://jxtsbjkfashodslayoaw.supabase.co`
   - `REACT_APP_SUPABASE_ANON_KEY`: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4dHNiamtmYXNob2RzbGF5b2F3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYyNzc1NzYsImV4cCI6MjA2MTg1MzU3Nn0.KdqGGqc1r0LjHLgPZnfKff7seIcmFdJiDT3bTEBKHdw`
   - `SUPABASE_SERVICE_ROLE_KEY`: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4dHNiamtmYXNob2RzbGF5b2F3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NjI3NzU3NiwiZXhwIjoyMDYxODUzNTc2fQ.E80s0mW2s9l6D3z1YWjRaT6CKuvNWf5ObdQAdBygZg8`

### 3. Deploy the site

1. Click "Deploy site"
2. Netlify will automatically build and deploy your application
3. Once deployed, Netlify will provide a URL where your site is accessible

## Option 2: Manual Deployment via Netlify CLI

### 1. Install Netlify CLI

```bash
npm install -g netlify-cli
```

### 2. Log in to Netlify

```bash
netlify login
```

### 3. Initialize Netlify configuration

```bash
netlify init
```

Follow the interactive prompts to set up your site.

### 4. Deploy using the provided script

```bash
# For a preview deployment
./netlify-deploy.sh

# For a production deployment
./netlify-deploy.sh --prod
```

## Post-Deployment Configuration

### Custom Domain Setup

1. Go to Netlify site dashboard > Domain settings
2. Click "Add custom domain"
3. Enter your domain name and follow the instructions
4. Set up DNS records as directed by Netlify

### HTTPS Configuration

Netlify automatically provides SSL certificates through Let's Encrypt. To enable:

1. Go to Site settings > Domain management > HTTPS
2. Ensure "SSL/TLS certificate" is set to "Let's Encrypt certificate"

### Continuous Deployment

If using GitHub integration:

1. Go to Site settings > Build & deploy > Continuous Deployment
2. Ensure "Build settings" has the correct configuration
3. Optionally set up build hooks for triggering deployments

## Serverless Functions

Netlify Functions are serverless functions that allow you to run server-side code without managing servers.

### Using Netlify Functions with Supabase

1. Functions are located in the `netlify/functions` directory
2. `supabase-auth.js` is a sample function for Supabase authentication
3. These can be called from your client application using:

```javascript
// Example of calling a Netlify function
const callAuthFunction = async (action, data) => {
  const response = await fetch('/.netlify/functions/supabase-auth', {
    method: 'POST',
    body: JSON.stringify({ action, ...data }),
  });
  return await response.json();
};
```

## Troubleshooting

### Build Failures

1. Check build logs in Netlify dashboard
2. Ensure all dependencies are correctly listed in package.json
3. Verify that build commands are correctly set

### Environment Variables

1. Ensure all required environment variables are set in Netlify dashboard
2. For local testing, create a `.env` file with the required variables

### Routing Issues

1. Verify the Netlify configuration in `netlify.toml`
2. Ensure redirects are properly set up for single-page application routing

## Monitoring and Analytics

1. Netlify provides basic analytics in the dashboard
2. For more detailed analytics, integrate with tools like Google Analytics

## Security Considerations

1. Never commit sensitive environment variables to your repository
2. Rotate Supabase keys periodically
3. Use environment variables in Netlify dashboard for sensitive information
4. Implement appropriate CORS policies in Supabase 