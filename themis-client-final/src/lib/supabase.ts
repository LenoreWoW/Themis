import { createClient } from '@supabase/supabase-js';

// Supabase URL and anon key from environment variables
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://jxtsbjkfashodslayoaw.supabase.co';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4dHNiamtmYXNob2RzbGF5b2F3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTU4ODY3MDEsImV4cCI6MjAzMTQ2MjcwMX0.UdqJKIL4QFaQqEi4A07s3m_9BZ5LWcXQK1IUjEJtv34';

console.log('Initializing Supabase client with URL:', supabaseUrl);

// Create a single supabase client for interacting with your database
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase; 