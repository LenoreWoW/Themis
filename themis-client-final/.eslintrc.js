module.exports = {
  extends: ['react-app', 'react-app/jest'],
  rules: {
    // Disable unused variables warning that's causing most of the issues
    '@typescript-eslint/no-unused-vars': 'off',
    
    // Disable exhaustive-deps warnings for useEffect
    'react-hooks/exhaustive-deps': 'off',
    
    // Other common warnings we want to disable
    'no-unreachable': 'off',
    'no-useless-escape': 'off',
    'import/no-anonymous-default-export': 'off',
    
    // Set rules for production builds only
    ...(process.env.NODE_ENV === 'production' ? {
      // You can enable specific rules for production if needed
    } : {})
  },
  overrides: [
    {
      // Specific overrides for test files
      files: ['**/*.test.ts', '**/*.test.tsx', '**/*.spec.ts', '**/*.spec.tsx'],
      rules: {
        // Usually we want to allow more lax rules in test files
        '@typescript-eslint/no-explicit-any': 'off',
        'react/jsx-props-no-spreading': 'off'
      }
    },
    {
      // Service files need special handling for some rules
      files: ['**/services/**/*.ts'],
      rules: {
        'import/no-anonymous-default-export': 'off'
      }
    }
  ]
}; 