/**
 * React App Rewired configuration
 * This file is used by react-app-rewired to modify the webpack config
 */
module.exports = function override(config, env) {
  // Disable React Fast Refresh completely
  if (env === 'development') {
    // Remove ReactRefreshPlugin from the plugins array
    config.plugins = config.plugins.filter(
      plugin => plugin.constructor.name !== 'ReactRefreshPlugin'
    );
  }
  
  // Enable source maps for production build
  if (env === 'production') {
    config.devtool = 'source-map';
  }
  
  return config;
} 