/**
 * Plugin Entry Point
 * This is the main file that Writer loads
 */

import MyPluginPackage from './MyPluginPackage'

// Import styles
import './scss/index.scss'

// Log plugin initialization
console.log('🚀 MyPlugin loading...')

// Export the package (Writer expects this)
export default MyPluginPackage
