import { createClient } from '@supabase/supabase-js';

// Supabase URL and anon key from environment variables or use the provided values
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://jxtsbjkfashodslayoaw.supabase.co';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4dHNiamtmYXNob2RzbGF5b2F3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYyNzc1NzYsImV4cCI6MjA2MTg1MzU3Nn0.KdqGGqc1r0LjHLgPZnfKff7seIcmFdJiDT3bTEBKHdw';

// Create a single supabase client for interacting with your database
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase; 