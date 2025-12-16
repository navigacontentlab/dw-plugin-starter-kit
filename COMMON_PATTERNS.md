# Common Plugin Patterns

Reusable code patterns for Naviga Writer plugin development, tested in production.

---

## 🎨 Sidebar Plugin Pattern

### Basic Sidebar Component

```javascript
import { Component } from 'substance'

class MySidebarPlugin extends Component {
    getInitialState() {
        return {
            isOpen: false,
            selectedText: null,
            sourceNodeId: null,
            hasSelection: false,
            isLoading: false,
            error: null
        }
    }
    
    didMount() {
        console.log('Plugin mounted')
        // Bind event handlers
        this.handleSelection = this.handleSelection.bind(this)
        // Add listeners
        document.addEventListener('selectionchange', this.handleSelection)
    }
    
    dispose() {
        console.log('Plugin disposed')
        // CRITICAL: Clean up listeners
        document.removeEventListener('selectionchange', this.handleSelection)
    }
    
    handleSelection() {
        // Check if focus is in our plugin (avoid re-renders during typing)
        const activeElement = document.activeElement
        if (activeElement && activeElement.closest('.my-plugin')) {
            return
        }
        
        const selectionInfo = this.getCurrentSelection()
        const hasSelection = selectionInfo?.text?.trim().length > 0
        
        // Only update if actually changed
        if (this.state.hasSelection !== hasSelection) {
            this.extendState({ hasSelection })
        }
    }
    
    getCurrentSelection() {
        try {
            const editorSession = this.context.editorSession
            const sel = editorSession.getSelection()
            
            if (!sel || sel.isCollapsed()) {
                return null
            }
            
            const doc = editorSession.getDocument()
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
    
    render($$) {
        const el = $$('div').addClass('my-plugin')
        
        // Add your UI here
        el.append(this.renderContent($$))
        
        return el
    }
    
    renderContent($$) {
        const content = $$('div').addClass('content')
        
        // Add button
        const button = $$('button')
            .addClass('btn')
            .on('click', this.handleAction.bind(this))
            .append('Do Something')
        
        // Disable if no selection
        if (!this.state.hasSelection) {
            button.attr('disabled', 'disabled')
            button.attr('title', 'Select text first')
        }
        
        content.append(button)
        
        return content
    }
    
    async handleAction() {
        this.extendState({ isLoading: true, error: null })
        
        try {
            // Your action here
            await this.performAction()
            
            this.extendState({ isLoading: false })
        } catch (error) {
            this.extendState({
                error: error.message,
                isLoading: false
            })
        }
    }
}

export default MySidebarPlugin
```

### Package Configuration

```javascript
class MyPluginPackage {
    get name() {
        return 'my-plugin'
    }
    
    configure(config, pluginConfig) {
        // Register component
        config.addComponent('my-plugin', MyPluginComponent)
        
        // Add to sidebar
        config.addToSidebar(
            'My Plugin',           // Display name
            pluginConfig,          // Plugin config
            MyPluginComponent,
            {
                icon: 'magic',     // Font Awesome 4 icon (no 'fa-' prefix)
                alwaysMounted: false
            }
        )
    }
}

export default MyPluginPackage
```

---

## 🔌 API Integration Pattern

### Service Class

```javascript
// services/APIService.js
class APIService {
    constructor() {
        this.apiKey = process.env.API_KEY
        this.baseURL = process.env.API_URL || 'https://api.example.com'
        
        if (!this.apiKey) {
            console.warn('⚠️ API_KEY not configured')
        }
    }
    
    isConfigured() {
        return !!this.apiKey
    }
    
    async callAPI(params) {
        if (!this.isConfigured()) {
            throw new Error('API is not configured. Add API_KEY to .env')
        }
        
        try {
            const response = await fetch(`${this.baseURL}/endpoint`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify(params)
            })
            
            if (!response.ok) {
                throw new Error(`API error: ${response.statusText}`)
            }
            
            return await response.json()
        } catch (error) {
            console.error('API call failed:', error)
            throw error
        }
    }
}

// Export singleton
export default new APIService()
```

### Using the Service

```javascript
import apiService from './services/APIService'

class MyPlugin extends Component {
    async handleAction() {
        if (!apiService.isConfigured()) {
            this.showError('API not configured. Check .env file')
            return
        }
        
        this.extendState({ isLoading: true })
        
        try {
            const result = await apiService.callAPI({
                text: this.state.selectedText
            })
            
            this.extendState({
                response: result.data,
                isLoading: false
            })
        } catch (error) {
            this.extendState({
                error: error.message,
                isLoading: false
            })
        }
    }
}
```

---

## 📝 Text Replacement Pattern

### Single Node Replacement

```javascript
import { documentHelpers } from 'substance'

replaceNodeText(nodeId, newText) {
    const editorSession = this.context.editorSession
    
    // Use transaction for atomic changes
    editorSession.transaction(tx => {
        tx.set([nodeId, 'content'], newText)
    })
    
    console.log(`✅ Replaced text in node ${nodeId}`)
}
```

### Selection-Based Replacement

```javascript
replaceSelectedText(newText) {
    const editorSession = this.context.editorSession
    const sel = editorSession.getSelection()
    
    if (!sel || sel.isCollapsed()) {
        console.warn('No selection to replace')
        return
    }
    
    editorSession.transaction(tx => {
        tx.deleteSelection()
        tx.insertText(newText)
    })
    
    // Clear selection after replacement
    this.clearSelection(editorSession)
}

clearSelection(editorSession) {
    try {
        const sel = editorSession.getSelection()
        if (sel && !sel.isCollapsed()) {
            const collapsedSel = sel.collapse('end')
            editorSession.setSelection(collapsedSel)
        }
    } catch (error) {
        console.error('Failed to clear selection:', error)
    }
}
```

### Element-Type Aware Replacement

```javascript
replaceText() {
    const selectionInfo = this.getCurrentSelection()
    
    if (!selectionInfo) {
        return
    }
    
    const editorSession = this.context.editorSession
    const doc = editorSession.getDocument()
    const node = doc.get(selectionInfo.nodeId)
    
    // Different handling based on element type
    switch (node.type) {
        case 'heading':
            // Keep headings short
            this.replaceNodeText(selectionInfo.nodeId, newText)
            break
            
        case 'paragraph':
            // Can be longer
            this.replaceNodeText(selectionInfo.nodeId, newText)
            break
            
        default:
            console.warn(`Unsupported node type: ${node.type}`)
    }
}
```

---

## 🎯 Form Input Pattern

### Text Input (Don't Store in State!)

```javascript
render($$) {
    const el = $$('div')
    
    // Create input with ref
    const input = $$('input')
        .attr('type', 'text')
        .attr('placeholder', 'Enter text...')
        .val(this.state.initialValue || '')  // Set initial value
        .ref('textInput')                     // Save reference
    
    // Don't use .on('input') - causes re-renders!
    
    el.append(input)
    return el
}

handleSubmit() {
    // Read value when needed
    const value = this.refs.textInput.val()
    
    // Now save to state if needed
    this.extendState({ submittedValue: value })
}
```

### Textarea Pattern

```javascript
render($$) {
    const textarea = $$('textarea')
        .addClass('prompt-input')
        .attr('placeholder', 'Enter your prompt...')
        .attr('rows', '4')
        .val(this.state.savedPrompt || '')
        .ref('promptTextarea')
    
    return $$('div').append(textarea)
}

getPromptValue() {
    const textarea = this.refs.promptTextarea
    return textarea ? textarea.val() : ''
}
```

---

## 🔄 Loading States Pattern

### Loading Indicator

```javascript
render($$) {
    const el = $$('div')
    
    if (this.state.isLoading) {
        el.append(this.renderLoading($$))
    } else {
        el.append(this.renderContent($$))
    }
    
    return el
}

renderLoading($$) {
    return $$('div').addClass('loading').append([
        $$('div').addClass('spinner'),  // CSS spinner
        $$('span').append(' Processing...')
    ])
}
```

### CSS Spinner

```scss
.spinner {
    width: 24px;
    height: 24px;
    border: 3px solid rgba(102, 126, 234, 0.2);
    border-top-color: #667eea;
    border-radius: 50%;
    animation: loading-spin 0.8s linear infinite;
}

@keyframes loading-spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

.loading {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 20px;
    color: #667eea;
}
```

---

## ⚠️ Error Handling Pattern

### Error Display

```javascript
renderError($$) {
    if (!this.state.error) {
        return null
    }
    
    return $$('div').addClass('error-message').append([
        $$('span').addClass('error-icon').append('⚠️'),
        $$('span').addClass('error-text').append(this.state.error)
    ])
}

showError(message, duration = 3000) {
    this.extendState({ error: message })
    
    // Auto-clear after duration
    setTimeout(() => {
        this.extendState({ error: null })
    }, duration)
}
```

### Try-Catch Pattern

```javascript
async performAction() {
    this.extendState({ isLoading: true, error: null })
    
    try {
        const result = await this.callAPI()
        
        this.extendState({
            result: result,
            isLoading: false
        })
    } catch (error) {
        console.error('Action failed:', error)
        
        // User-friendly error message
        let errorMessage = 'Something went wrong'
        if (error.message.includes('API_KEY')) {
            errorMessage = 'API not configured. Check .env file'
        } else if (error.message.includes('network')) {
            errorMessage = 'Network error. Check your connection'
        }
        
        this.extendState({
            error: errorMessage,
            isLoading: false
        })
    }
}
```

---

## 🎨 Button States Pattern

### Dynamic Button State

```javascript
renderButton($$) {
    const button = $$('button')
        .addClass('btn btn-primary')
        .on('click', this.handleClick.bind(this))
        .append('Process Text')
    
    // Disabled state
    const canProcess = this.state.hasSelection && !this.state.isLoading
    if (!canProcess) {
        button.attr('disabled', 'disabled')
        
        // Helpful tooltip
        if (!this.state.hasSelection) {
            button.attr('title', 'Select text first')
        } else if (this.state.isLoading) {
            button.attr('title', 'Processing...')
        }
    }
    
    // Loading state
    if (this.state.isLoading) {
        button.empty()
        button.append([
            $$('div').addClass('spinner-small'),
            $$('span').append(' Processing...')
        ])
    }
    
    return button
}
```

### Button Styles

```scss
.btn {
    padding: 10px 20px;
    border: none;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    
    &.btn-primary {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        
        &:hover:not(:disabled) {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }
    }
    
    &:disabled {
        background: linear-gradient(135deg, #cbd5e1 0%, #94a3b8 100%);
        color: #64748b;
        cursor: not-allowed;
        box-shadow: none;
    }
}
```

---

## 🎭 Conditional Rendering Pattern

### Show/Hide Based on State

```javascript
render($$) {
    const el = $$('div').addClass('my-plugin')
    
    // Always show controls
    el.append(this.renderControls($$))
    
    // Conditionally show response
    if (this.state.response) {
        el.append(this.renderResponse($$))
    }
    
    // Conditionally show error
    if (this.state.error) {
        el.append(this.renderError($$))
    }
    
    return el
}
```

### Response Type-Specific Rendering

```javascript
renderResponse($$) {
    const responseSection = $$('div').addClass('response-section')
    
    responseSection.append([
        $$('label').append(
            this.state.responseType === 'improve' 
                ? 'Improved Text:' 
                : 'AI Response:'
        ),
        $$('div').addClass('response-text')
            .append(this.state.response)
    ])
    
    // Only show replace button for improved text
    if (this.state.responseType === 'improve') {
        responseSection.append(
            $$('button').addClass('btn btn-primary')
                .on('click', this.handleReplace.bind(this))
                .append('Replace Original Text')
        )
    }
    
    return responseSection
}
```

---

## 💾 State Reset Pattern

### Reset After Action

```javascript
handleReplace() {
    // Perform replacement
    this.replaceText()
    
    // Reset state completely
    this.extendState({
        selectedText: null,
        sourceNodeId: null,
        response: null,
        responseType: null,
        hasSelection: false
    })
}
```

### Partial Reset

```javascript
handleNewAction() {
    // Keep some state, clear others
    this.extendState({
        response: null,
        error: null,
        isLoading: false
        // Keeps: selectedText, sourceNodeId
    })
}
```

---

**These patterns are battle-tested in production plugins. Use them as starting points for your own implementations!**
