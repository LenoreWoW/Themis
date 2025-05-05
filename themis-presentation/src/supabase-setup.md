# Supabase Setup Instructions

## 1. Create a .env file in the project root

Create a file named `.env` in the themis-client-final directory with the following content:

```
# Supabase Configuration
REACT_APP_SUPABASE_URL=https://your-project-id.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-supabase-anon-key
```

Replace `your-project-id` and `your-supabase-anon-key` with your actual Supabase project values.

## 2. Get Supabase Credentials

1. Sign up or log in to [Supabase](https://supabase.com/)
2. Create a new project
3. Once the project is created, go to Project Settings > API
4. Copy the URL under "Project URL" and use it as `REACT_APP_SUPABASE_URL`
5. Copy the "anon" key (public) and use it as `REACT_APP_SUPABASE_ANON_KEY`

## 3. Restart Your Development Server

After setting up the .env file, restart your development server for the changes to take effect. 