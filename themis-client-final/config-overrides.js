module.exports = function override(config, env) {
  // Allow imports from outside src directory
  config.resolve.plugins = config.resolve.plugins.filter(plugin => 
    plugin.constructor.name !== 'ModuleScopePlugin'
  );
  
  return config;
}; 