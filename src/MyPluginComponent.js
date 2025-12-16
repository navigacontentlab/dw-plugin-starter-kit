import { Component, documentHelpers } from 'substance'

/**
 * Main plugin component - extends Substance Component
 * 
 * Key principles:
 * - Use extendState() NOT setState() (setState replaces entire state!)
 * - Clean up event listeners in dispose()
 * - Use refs for form inputs, not state (avoid re-renders)
 */
class MyPluginComponent extends Component {
    /**
     * Initialize component state
     * Called once when component is created
     */
    getInitialState() {
        return {
            isOpen: false,
            selectedText: null,
            sourceNodeId: null,
            sourceNodeType: null,
            hasSelection: false,
            isLoading: false,
            error: null,
            response: null
        }
    }
    
    /**
     * Component mounted - setup event listeners
     * IMPORTANT: Always implement dispose() to clean up!
     */
    didMount() {
        console.log('🎯 MyPlugin mounted')
        
        // Bind event handlers (required for 'this' context)
        this.handleSelection = this.handleSelection.bind(this)
        
        // Add event listeners
        document.addEventListener('selectionchange', this.handleSelection)
    }
    
    /**
     * Component disposed - clean up event listeners
     * CRITICAL: Always clean up to prevent memory leaks!
     */
    dispose() {
        console.log('🧹 MyPlugin disposed')
        
        // Remove event listeners
        document.removeEventListener('selectionchange', this.handleSelection)
    }
    
    /**
     * Handle selection changes in the editor
     * Ignores changes when user is typing in plugin UI
     */
    handleSelection() {
        // Skip if user is interacting with our plugin
        const activeElement = document.activeElement
        if (activeElement) {
            const inOurPlugin = activeElement.closest('.my-plugin') ||
                               activeElement.classList.contains('my-input')
            if (inOurPlugin) {
                return
            }
        }
        
        // Get current selection
        const selectionInfo = this.getCurrentSelection()
        const hasSelection = selectionInfo?.text?.trim().length > 0
        
        // Only update if changed (avoid unnecessary re-renders)
        if (this.state.hasSelection !== hasSelection) {
            this.extendState({ hasSelection })  // Use extendState, NOT setState!
        }
    }
    
    /**
     * Get current selection from editor
     * Returns: { text, nodeId, nodeType } or null
     */
    getCurrentSelection() {
        try {
            const editorSession = this.context.editorSession
            const sel = editorSession.getSelection()
            
            if (!sel || sel.isCollapsed()) {
                return null
            }
            
            const doc = editorSession.getDocument()
            
            // Use modern API (documentHelpers)
            const text = documentHelpers.getTextForSelection(doc, sel)
            
            const nodeId = sel.start.path[0]
            const node = doc.get(nodeId)
            
            return {
                text,
                nodeId,
                nodeType: node.type
            }
        } catch (error) {
            console.error('Failed to get selection:', error)
            return null
        }
    }
    
    /**
     * Example action handler
     */
    async handleAction() {
        const selectionInfo = this.getCurrentSelection()
        
        if (!selectionInfo || !selectionInfo.text) {
            this.showError('⚠️ Please select some text first')
            return
        }
        
        console.log('🚀 Processing text:', selectionInfo.text.substring(0, 50) + '...')
        
        // Save selection to state
        this.extendState({
            selectedText: selectionInfo.text,
            sourceNodeId: selectionInfo.nodeId,
            sourceNodeType: selectionInfo.nodeType,
            isLoading: true,
            error: null
        })
        
        try {
            // Simulate async operation
            await new Promise(resolve => setTimeout(resolve, 1000))
            
            this.extendState({
                response: 'Action completed!',
                isLoading: false
            })
        } catch (error) {
            console.error('Action failed:', error)
            this.extendState({
                error: error.message,
                isLoading: false
            })
        }
    }
    
    /**
     * Show error message (auto-clear after 3 seconds)
     */
    showError(message, duration = 3000) {
        this.extendState({ error: message })
        
        setTimeout(() => {
            this.extendState({ error: null })
        }, duration)
    }
    
    /**
     * Render the plugin UI
     * @param {Function} $$ - Element factory from Substance
     */
    render($$) {
        const el = $$('div').addClass('my-plugin')
        
        // Add content
        el.append(this.renderContent($$))
        
        return el
    }
    
    /**
     * Render main content
     */
    renderContent($$) {
        const content = $$('div').addClass('plugin-content')
        
        // Show selected text preview if available
        if (this.state.selectedText) {
            content.append(this.renderSelection($$))
        }
        
        // Action button
        content.append(this.renderButton($$))
        
        // Loading indicator
        if (this.state.isLoading) {
            content.append(this.renderLoading($$))
        }
        
        // Error message
        if (this.state.error) {
            content.append(this.renderError($$))
        }
        
        // Response
        if (this.state.response) {
            content.append(this.renderResponse($$))
        }
        
        return content
    }
    
    /**
     * Render selected text preview
     */
    renderSelection($$) {
        return $$('div').addClass('selected-text').append([
            $$('label').append('Selected Text:'),
            $$('div').addClass('text-preview')
                .append(this.state.selectedText.substring(0, 100) + '...')
        ])
    }
    
    /**
     * Render action button
     */
    renderButton($$) {
        const button = $$('button')
            .addClass('btn btn-primary')
            .on('click', this.handleAction.bind(this))
            .append('Process Text')
        
        // Disable if no selection or loading
        const canProcess = this.state.hasSelection && !this.state.isLoading
        if (!canProcess) {
            button.attr('disabled', 'disabled')
            
            if (!this.state.hasSelection) {
                button.attr('title', 'Select text in the document first')
            } else if (this.state.isLoading) {
                button.attr('title', 'Processing...')
            }
        }
        
        return button
    }
    
    /**
     * Render loading indicator
     */
    renderLoading($$) {
        return $$('div').addClass('loading').append([
            $$('div').addClass('spinner'),
            $$('span').append(' Processing...')
        ])
    }
    
    /**
     * Render error message
     */
    renderError($$) {
        return $$('div').addClass('error-message').append([
            $$('span').addClass('error-icon').append('⚠️'),
            $$('span').addClass('error-text').append(this.state.error)
        ])
    }
    
    /**
     * Render response
     */
    renderResponse($$) {
        return $$('div').addClass('response-section').append([
            $$('label').append('Result:'),
            $$('div').addClass('response-text').append(this.state.response)
        ])
    }
}

export default MyPluginComponent
