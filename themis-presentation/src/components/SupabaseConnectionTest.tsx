import React, { useEffect, useState } from 'react';
import supabase from '../lib/supabase';

const SupabaseConnectionTest = () => {
  const [connectionStatus, setConnectionStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const testConnection = async () => {
      try {
        // Check if we can connect by making a simple query
        const { data, error } = await supabase.from('test_connection').select('*').limit(1);
        
        if (error) {
          console.error('Supabase connection error:', error);
          setConnectionStatus('error');
          setErrorMessage(error.message);
        } else {
          console.log('Supabase connection successful');
          setConnectionStatus('success');
        }
      } catch (err) {
        console.error('Unexpected error connecting to Supabase:', err);
        setConnectionStatus('error');
        setErrorMessage(err instanceof Error ? err.message : 'Unknown error');
      }
    };

    testConnection();
  }, []);

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h2>Supabase Connection Test</h2>
      
      {connectionStatus === 'loading' && (
        <div style={{ color: 'blue' }}>
          Testing connection to Supabase...
        </div>
      )}
      
      {connectionStatus === 'success' && (
        <div style={{ color: 'green' }}>
          ✅ Successfully connected to Supabase!
        </div>
      )}
      
      {connectionStatus === 'error' && (
        <div style={{ color: 'red' }}>
          ❌ Failed to connect to Supabase
          {errorMessage && (
            <div style={{ marginTop: '10px', fontSize: '14px' }}>
              Error: {errorMessage}
            </div>
          )}
        </div>
      )}

      <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
        <strong>Database URL:</strong> {process.env.REACT_APP_SUPABASE_URL || 'Using default URL'}
      </div>
    </div>
  );
};

export default SupabaseConnectionTest; 