const path = require('path');

/**
 * React App Rewired configuration
 * This file is used by react-app-rewired to modify the webpack config
 */
module.exports = function override(config, env) {
  // Force a single React instance by explicitly aliasing to node_modules paths
  config.resolve = config.resolve || {};
  config.resolve.alias = {
    ...(config.resolve.alias || {}),
    'react': path.resolve(__dirname, 'node_modules', 'react'),
    'react-dom': path.resolve(__dirname, 'node_modules', 'react-dom'),
  };

  // Fix React Refresh issues by ensuring it's properly loaded
  if (env === 'development') {
    // Remove problematic alias and let webpack resolve react-refresh normally
    // If needed, uncomment and use proper path:
    // config.resolve.alias['react-refresh/runtime'] = path.resolve(__dirname, 'node_modules', 'react-refresh', 'runtime');
  }
  
  // Enable source maps for production build
  if (env === 'production') {
    config.devtool = 'source-map';
  }
  
  return config;
}
