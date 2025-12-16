import MyPluginComponent from './MyPluginComponent'

/**
 * Plugin package configuration
 * Registers the plugin with Writer
 */
class MyPluginPackage {
    /**
     * Plugin name (must be unique)
     * This will be updated by setup.sh
     */
    get name() {
        return 'my-plugin'
    }
    
    /**
     * Configure the plugin
     * Called by Writer when loading the plugin
     * 
     * @param {Object} config - Writer configuration object
     * @param {Object} pluginConfig - Plugin-specific configuration from Writer
     */
    configure(config, pluginConfig) {
        console.log('📦 Configuring MyPlugin')
        console.log('Plugin config:', pluginConfig)
        
        // Register component
        config.addComponent('my-plugin', MyPluginComponent)
        
        // Add to sidebar
        config.addToSidebar(
            'My Plugin',           // Display name (shown in sidebar)
            pluginConfig,          // Plugin configuration
            MyPluginComponent,     // Component class
            {
                icon: 'puzzle-piece',  // Font Awesome 4 icon name (no 'fa-' prefix!)
                alwaysMounted: false   // Mount only when opened
            }
        )
        
        console.log('✅ MyPlugin configured')
    }
}

export default MyPluginPackage
