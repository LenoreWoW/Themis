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
  
  // Fix for stylis-plugin-rtl source map warning
  const rules = config.module.rules.find(rule => Array.isArray(rule.oneOf)).oneOf;
  
  // Find the source-map-loader rule
  const sourceMapRule = config.module.rules.find(
    rule => rule.loader && String(rule.loader).includes('source-map-loader')
  );
  
  if (sourceMapRule) {
    // Add exclusion for stylis-plugin-rtl
    sourceMapRule.exclude = [
      /node_modules[/\\]stylis-plugin-rtl/,
      ...(Array.isArray(sourceMapRule.exclude) ? sourceMapRule.exclude : 
         sourceMapRule.exclude ? [sourceMapRule.exclude] : [])
    ];
  }
  
  return config;
} 