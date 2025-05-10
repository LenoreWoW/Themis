const path = require('path');
const { addWebpackAlias, addWebpackPlugin, override } = require('customize-cra');

/**
 * React App Rewired configuration
 * This file is used by react-app-rewired to modify the webpack config
 */
module.exports = override(
  // Force a single React instance by explicitly aliasing to node_modules paths
  addWebpackAlias({
    'react': path.resolve(__dirname, 'node_modules', 'react'),
    'react-dom': path.resolve(__dirname, 'node_modules', 'react-dom'),
  }),
  
  // Custom config modifications
  (config) => {
    // Disable ModuleScopePlugin
    config.resolve.plugins = (config.resolve.plugins || []).filter(
      plugin => !(plugin.constructor && plugin.constructor.name && plugin.constructor.name === 'ModuleScopePlugin')
    );
    
    // Enable source maps for production build
    if (process.env.NODE_ENV === 'production') {
      config.devtool = 'source-map';
    }
    
    return config;
  }
);
