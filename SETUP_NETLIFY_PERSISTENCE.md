# Setting Up Themis on Netlify with Data Persistence

This guide provides step-by-step instructions for deploying Themis on Netlify with data persistence using a cloud database.

## Prerequisites

- Netlify account
- Git repository with Themis code
- PostgreSQL client (psql, pg_dump)
- Access to the existing Themis database
- Account on a cloud database provider (examples below)

## Step 1: Set Up a Cloud Database

Choose a cloud PostgreSQL provider. Here are some options with setup instructions:

### Option A: Supabase

1. Sign up at [Supabase](https://supabase.com/)
2. Create a new project
3. Get the database connection string from Settings > Database
4. Note the connection string for later use

### Option B: Neon

1. Sign up at [Neon](https://neon.tech/)
2. Create a new project
3. Create a new branch (or use the default 'main' branch)
4. Get the connection string from the dashboard
5. Note the connection string for later use

### Option C: Railway

1. Sign up at [Railway](https://railway.app/)
2. Create a new project
3. Add a PostgreSQL database
4. Get the connection string from the Connect tab
5. Note the connection string for later use

## Step 2: Migrate the Database

Use the provided `db-migration.sh` script to migrate your data:

1. Edit the script to set the correct source database credentials:
   ```bash
   SOURCE_DB_HOST="api.pmo.projects.mod.qa"
   SOURCE_DB_NAME="themisdb"
   SOURCE_DB_USER="your_username"
   SOURCE_DB_PASSWORD="your_password"
   ```

2. Set the target database URL (replace with your actual connection string):
   ```bash
   export DATABASE_URL="postgresql://user:password@host:port/dbname"
   ```

3. Run the migration script:
   ```bash
   ./db-migration.sh
   ```

4. Verify the data was migrated correctly by connecting to the new database:
   ```bash
   psql $DATABASE_URL
   ```

## Step 3: Set Up Netlify Functions

The API functionality will be handled by Netlify Functions, which act as serverless endpoints.

1. Ensure you have the `netlify/functions` directory with the API code:
   ```
   netlify/
   └── functions/
       ├── api.js
       └── package.json
   ```

2. Install dependencies for the functions:
   ```bash
   cd netlify/functions
   npm install
   ```

## Step 4: Update Configuration Files

1. Ensure your `netlify.toml` file is correctly configured with:
   - Build settings
   - Function location
   - Redirects for API endpoints
   - Environment variables (without sensitive values)

2. Check that your API function (`netlify/functions/api.js`) is set up to:
   - Connect to the database using environment variables
   - Handle authentication correctly
   - Provide all necessary API endpoints

## Step 5: Deploy to Netlify

1. Push your changes to the Git repository:
   ```bash
   git add .
   git commit -m "Configure Netlify deployment with cloud database"
   git push
   ```

2. Connect your repository to Netlify:
   - Go to [Netlify Dashboard](https://app.netlify.com/)
   - Click "New site from Git"
   - Select your repository
   - Configure build settings according to your `netlify.toml`

3. Set environment variables in Netlify:
   - Go to Site settings > Environment variables
   - Add the following variables:
     - `DATABASE_URL`: Your cloud database connection string
     - `JWT_SECRET`: A secure secret for JWT token signing

4. Deploy the site:
   - Netlify will automatically deploy when you push to the repository
   - You can also trigger manual deploys from the Netlify dashboard

## Step 6: Verify the Deployment

1. Check that the frontend is accessible at your Netlify URL
2. Test API functionality through the frontend
3. Verify that data is being stored in the cloud database

## Troubleshooting

### Database Connection Issues

If you encounter database connection problems:
- Verify the `DATABASE_URL` environment variable is set correctly
- Check that the database is accessible from Netlify's IP range
- Review database logs for connection attempts

### API Endpoint Errors

If API endpoints aren't working:
- Check the Netlify Function logs in the Netlify dashboard
- Verify that the redirects in `netlify.toml` are correct
- Test endpoints directly with a tool like Postman

### Authentication Problems

If users can't log in:
- Verify the `JWT_SECRET` environment variable is set
- Check that the login API is correctly implemented
- Review frontend code for correct API URL

## Maintenance

### Database Backups

Set up regular backups for your cloud database:
- Most providers offer automated backups
- Consider setting up additional manual backup procedures

### Monitoring

Monitor your application's performance:
- Use Netlify Analytics for frontend monitoring
- Set up database monitoring through your cloud provider
- Consider adding application monitoring with tools like Sentry

## Advanced: Database Synchronization

If you need to keep both deployments active with synchronized data:

1. Consider database replication options offered by your provider
2. Implement a webhook system to notify both systems of changes
3. Use a message queue (like RabbitMQ or AWS SQS) for reliable event handling

## Security Considerations

1. Store all sensitive information in environment variables
2. Regularly rotate database credentials and JWT secrets
3. Set up proper database access controls
4. Use HTTPS for all communications
5. Implement rate limiting for API endpoints 