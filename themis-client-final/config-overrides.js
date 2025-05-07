module.exports = function override(config, env) {
  // Allow imports from outside src directory
  config.resolve.plugins = config.resolve.plugins.filter(plugin => 
    plugin.constructor.name !== 'ModuleScopePlugin'
  );
  
  // Ignore source map warnings from stylis-plugin-rtl
  config.ignoreWarnings = [
    // Ignore source map warnings from stylis-plugin-rtl
    function ignoreSourcemapsloaderWarnings(warning) {
      return (
        warning.module &&
        warning.module.resource &&
        (warning.module.resource.includes('stylis-plugin-rtl') ||
         warning.message.includes('Failed to parse source map'))
      );
    }
  ];
  
  return config;
}; 