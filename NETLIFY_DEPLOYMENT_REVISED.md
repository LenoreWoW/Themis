# Themis Netlify Deployment with Independent Data Persistence

This guide provides instructions for deploying Themis on Netlify with data persistence options that don't rely on the existing server.

## Data Persistence Options

Since Netlify won't have access to the existing server at `pmo.projects.mod.qa`, we need alternative data storage solutions:

### Option 1: Cloud Database Service

Deploy a managed database that both your Netlify site and existing deployment can access.

1. **PostgreSQL Options**:
   - [Supabase](https://supabase.com/) - PostgreSQL with API
   - [Neon](https://neon.tech/) - Serverless PostgreSQL
   - [AWS RDS](https://aws.amazon.com/rds/) - Managed PostgreSQL
   - [DigitalOcean Managed Databases](https://www.digitalocean.com/products/managed-databases)

2. **Setup Process**:
   - Create account and deploy database
   - Configure security settings to allow access from both Netlify and existing servers
   - Migrate data from existing database
   - Update connection strings in both deployments

### Option 2: Serverless Database

For Netlify-specific deployments, consider serverless options:

1. **FaunaDB**:
   - Native Netlify integration
   - GraphQL or FQL API access
   - [Netlify-Fauna integration guide](https://docs.netlify.com/integrations/data-and-analytics/faunadb/)

2. **DynamoDB**:
   - AWS serverless database
   - Can be accessed via AWS Lambda functions
   - Connect using Netlify functions

### Option 3: API Gateway

Create an API gateway that both services can access:

1. **Implementation**:
   - Deploy API service on a neutral server (AWS, Azure, etc.)
   - Set up endpoints to read/write to the existing database
   - Configure CORS to allow requests from both domains
   - Update both applications to use this gateway

## Implementation Steps

### 1. Select and Set Up Database Service

For this guide, we'll use Supabase as an example:

```bash
# Install Supabase CLI
npm install -g supabase-cli

# Initialize Supabase project
supabase init

# Start local development
supabase start

# Generate database migration from existing schema
pg_dump -s -h api.pmo.projects.mod.qa -U your_username themisdb > schema.sql

# Apply schema to Supabase project
supabase db push
```

### 2. Migrate Data

Export data from existing database and import to new one:

```bash
# Export data
pg_dump -a -h api.pmo.projects.mod.qa -U your_username themisdb > data.sql

# Import data to Supabase
supabase db execute < data.sql
```

### 3. Update API Configuration

Create an environment-specific configuration for the API:

```json
// netlify-api-config.json
{
  "ConnectionStrings": {
    "DefaultConnection": "postgresql://[USER]:[PASSWORD]@[HOST]:[PORT]/[DB]?pgbouncer=true&connection_limit=1"
  },
  "Jwt": {
    "Key": "YourSecretKeyForJwtAuthentication",
    "Issuer": "ThemisAuthServer",
    "Audience": "ThemisApiClient",
    "ExpiryInMinutes": 60
  }
}
```

### 4. Deploy API to Netlify Functions

Create Netlify serverless functions to handle API requests:

```javascript
// netlify/functions/api.js
const { createProxyMiddleware } = require('http-proxy-middleware');
const express = require('express');
const serverless = require('serverless-http');

const app = express();

// Configure database connection for this environment
process.env.CONNECTION_STRING = "postgresql://[USER]:[PASSWORD]@[HOST]:[PORT]/[DB]";

// Set up proxy to API (if using existing API code)
app.use('/.netlify/functions/api', createProxyMiddleware({
  target: 'http://localhost:3000',
  pathRewrite: {
    '^/.netlify/functions/api': '/api'
  }
}));

// If building new API endpoints directly
app.get('/.netlify/functions/api/projects', async (req, res) => {
  // Connect to database and return projects
  // ...
});

module.exports.handler = serverless(app);
```

### 5. Update Frontend Configuration

Update the Netlify frontend configuration to use the new API:

```toml
# netlify.toml
[context.production.environment]
  REACT_APP_API_URL = "/.netlify/functions/api"
  REACT_APP_ENVIRONMENT = "production"
  REACT_APP_BASE_URL = "https://themis.netlify.app"
```

### 6. Synchronize Data (Optional)

If both deployments need to remain active with synchronized data:

1. **Set up database replication** between the two environments
2. **Use a message queue** (like RabbitMQ or AWS SQS) to propagate changes
3. **Implement webhooks** to notify each system of changes

## Testing and Verification

Before full deployment:

1. Test database connectivity from Netlify functions
2. Verify authentication works with the new setup
3. Run a staging deployment to check all functionality

## Security Considerations

1. Use environment variables for sensitive information
2. Set up proper database access controls
3. Configure CORS to restrict access to approved domains
4. Use encryption for data in transit and at rest

## Summary

This approach allows Themis to be deployed on Netlify with independent data persistence that doesn't rely on access to the existing server. By using a cloud database service, both deployments can access the same data, ensuring consistency across platforms. 