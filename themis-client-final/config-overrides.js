/**
 * React App Rewired configuration
 * This file is used by react-app-rewired to modify the webpack config
 */
module.exports = function override(config, env) {
  // Fix React Refresh issues by ensuring it's properly loaded
  if (env === 'development') {
    config.resolve.alias = {
      ...config.resolve.alias,
      'react-refresh/runtime': require.resolve('react-refresh/runtime')
    };
  }
  
  // Enable source maps for production build
  if (env === 'production') {
    config.devtool = 'source-map';
  }
  
  return config;
}
