const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://jxtsbjkfashodslayoaw.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Set this in Netlify environment variables

// Create a Supabase client with the service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey);

exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { action, email, userId } = JSON.parse(event.body);

    switch (action) {
      case 'create-user': {
        // Sample function to create a user
        const { data, error } = await supabase.auth.admin.createUser({
          email,
          email_confirm: true,
          user_metadata: { role: 'USER' }
        });

        if (error) throw error;
        return {
          statusCode: 200,
          body: JSON.stringify({ success: true, data })
        };
      }

      case 'get-user': {
        // Get user details
        const { data, error } = await supabase.auth.admin.getUserById(userId);
        
        if (error) throw error;
        return {
          statusCode: 200,
          body: JSON.stringify({ success: true, data })
        };
      }

      default:
        return {
          statusCode: 400,
          body: JSON.stringify({ success: false, error: 'Invalid action specified' })
        };
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: error.message })
    };
  }
}; 