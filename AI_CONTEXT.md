# AI Assistant Context - Writer Plugin Development

**📖 Read this first if you're an AI helping with Naviga Writer plugin development.**

This document provides essential context about the Writer plugin ecosystem to help you assist developers effectively.

---

## 🎯 Quick Facts

| Aspect | Details |
|--------|---------|
| **Platform** | Naviga Writer (Digital Writer) - CMS for journalism |
| **Framework** | Substance.js (NOT React!) |
| **Build Tool** | Webpack 5 |
| **Language** | JavaScript or TypeScript |
| **Icons** | Font Awesome 4.x (class-based, NOT newer SVG versions) |
| **Dev URL** | https://local.plugins.writer.infomaker.io:3000/ |
| **SSL** | Required (mkcert for local dev) |

## 🚨 Critical Differences from React

Substance.js looks similar to React but has **critical differences**:

### State Management (MOST IMPORTANT!)

| Concept | React | Substance.js |
|---------|-------|-------------|
| **State update** | `setState()` merges | `setState()` **REPLACES** ❌ |
| **Correct method** | `setState()` | `extendState()` ✅ |
| **Initial state** | `useState()` / constructor | `getInitialState()` |

```javascript
// ❌ WRONG - Loses all other state properties!
this.setState({ isLoading: true })
// If state was { selectedText: 'foo', isLoading: false }
// Now it's { isLoading: true } - selectedText is GONE!

// ✅ CORRECT - Merges with existing state
this.extendState({ isLoading: true })
// State becomes { selectedText: 'foo', isLoading: true }
```

### Component Lifecycle

| React | Substance.js |
|-------|-------------|
| `componentDidMount()` | `didMount()` |
| `componentWillUnmount()` | `dispose()` |
| `render()` | `render($$)` - note the $$ param! |
| `useRef()` | `.ref('name')` method |

### Refs

```javascript
// React
const inputRef = useRef()
<input ref={inputRef} />
const value = inputRef.current.value

// Substance
$$('input').ref('myInput')
const value = this.refs.myInput.val()
```

### Event Listeners

```javascript
// Setup in didMount(), cleanup in dispose()
class MyPlugin extends Component {
    didMount() {
        // MUST bind if using 'this'
        this.handleChange = this.handleChange.bind(this)
        document.addEventListener('selectionchange', this.handleChange)
    }
    
    dispose() {
        // CRITICAL: Always clean up!
        document.removeEventListener('selectionchange', this.handleChange)
    }
}
```

## 🎨 Plugin Types

### 1. Sidebar Plugin (Recommended for Beginners)
- Appears in Writer's sidebar
- Full UI control
- Best for: AI assistants, tools, analyzers
- Icon: Configure in Package.js

### 2. Toolbar Plugin
- Button in main toolbar
- Can show dropdowns
- Best for: Quick actions, formatting

### 3. Content Tool
- Inline content manipulation
- Direct document interaction
- Best for: Custom blocks, widgets

### 4. Surface Tool
- Floating toolbars on selection
- Context-sensitive actions
- Best for: Text formatting

## 🔍 Common Patterns

### Basic Sidebar Plugin Structure

```javascript
import { Component } from 'substance'

class MyPlugin extends Component {
    getInitialState() {
        return {
            isOpen: false,
            selectedText: null
        }
    }
    
    didMount() {
        // Setup event listeners
        this.handleSelection = this.handleSelection.bind(this)
        document.addEventListener('selectionchange', this.handleSelection)
    }
    
    dispose() {
        // CRITICAL: Cleanup
        document.removeEventListener('selectionchange', this.handleSelection)
    }
    
    handleSelection() {
        // Get current selection
        const sel = this.context.editorSession.getSelection()
        // Use extendState, NOT setState!
        this.extendState({ hasSelection: !sel.isCollapsed() })
    }
    
    render($$) {
        const el = $$('div').addClass('my-plugin')
        
        // Create button
        const button = $$('button')
            .on('click', this.handleClick.bind(this))
            .append('Click Me')
        
        // Disable when no selection
        if (!this.state.hasSelection) {
            button.attr('disabled', 'disabled')
        }
        
        el.append(button)
        return el
    }
    
    handleClick() {
        this.extendState({ isProcessing: true })
    }
}

export default MyPlugin
```

### Plugin Package Configuration

```javascript
import { Component } from 'substance'

class MyPluginPackage {
    get name() {
        return 'my-plugin'
    }
    
    configure(config, pluginConfig) {
        config.addComponent('my-plugin', MyPluginComponent)
        
        // Sidebar plugin
        config.addToSidebar(
            'My Plugin',      // Display name
            pluginConfig,     // Plugin config
            MyPluginComponent,
            {
                icon: 'magic', // Font Awesome 4 name (no 'fa-' prefix!)
                alwaysMounted: false
            }
        )
    }
}

export default MyPluginPackage
```

## 🐛 Common Pitfalls & Solutions

### 1. Input Loses Focus

**Problem:**
```javascript
// Re-renders on every keystroke, loses focus
$$('textarea').on('input', (e) => {
    this.extendState({ value: e.target.value })
})
```

**Solution:**
```javascript
// Store ref, read value when needed
$$('textarea').ref('myInput')

// Later, when submitting:
const value = this.refs.myInput.val()
```

### 2. Button Stays Disabled After Response

**Problem:**
```javascript
// setState REPLACES state, loses selectedText!
this.setState({ response: data, isLoading: false })
// Now hasSelection is undefined → button disabled
```

**Solution:**
```javascript
// extendState MERGES, preserves selectedText
this.extendState({ response: data, isLoading: false })
```

### 3. Deprecated API Warnings

**Problem:**
```javascript
// Deprecated
const text = doc.getTextForSelection(sel)
```

**Solution:**
```javascript
import { documentHelpers } from 'substance'
const text = documentHelpers.getTextForSelection(doc, sel)
```

### 4. Font Awesome Icon Not Showing

**Problem:**
```javascript
icon: 'fa-magic'  // ❌ Wrong prefix
icon: 'magic'     // ✅ Correct (no 'fa-')
```

**Solution:** Use plain icon name from Font Awesome 4.x (no prefix)

### 5. Event Listener Memory Leak

**Problem:**
```javascript
didMount() {
    document.addEventListener('click', this.handleClick)
}
// No cleanup → memory leak!
```

**Solution:**
```javascript
didMount() {
    this.handleClick = this.handleClick.bind(this)
    document.addEventListener('click', this.handleClick)
}

dispose() {
    document.removeEventListener('click', this.handleClick)
}
```

## 💡 When to Use Each Tool

### Use Document API When:
- Replacing text content
- Creating new nodes
- Modifying node properties
- Working with selections

### Use Context API When:
- Accessing editor session
- Getting document instance
- Triggering custom events
- Accessing plugin config

### Use State When:
- UI state (loading, errors)
- Temporary data (user input)
- Toggle states (open/closed)

### Use Refs When:
- Accessing DOM elements
- Reading input values
- Calling imperative methods

## 🤖 Questions to Ask Users

When a user asks for help with a Writer plugin, ask:

### 1. Plugin Type
- "What type of plugin?" (sidebar, toolbar, content tool)
- This determines the structure and configuration

### 2. Functionality
- "Does it need to read/modify document content?"
- "Does it need external API calls?"
- "Does it need to handle user input?"

### 3. State Requirements
- "What data needs to persist?"
- "What triggers state changes?"

### 4. Integration Needs
- "External APIs?" → Need .env setup
- "Custom icons?" → Font Awesome 4 names
- "SSL required?" → mkcert setup

## 📚 Code Examples Repository

Point users to examples in this starter kit:

- `examples/simple-sidebar/` - Basic sidebar plugin
- `examples/ai-assistant/` - Real AI integration (Anthropic Claude)
- `examples/content-tool/` - Document manipulation
- `COMMON_PATTERNS.md` - Reusable code snippets
- `TROUBLESHOOTING.md` - Solutions to specific problems

## 🎯 Step-by-Step Approach

### For New Plugins

1. **Determine type** → sidebar/toolbar/content
2. **Create structure** → Component + Package
3. **Add state** → getInitialState()
4. **Setup lifecycle** → didMount() + dispose()
5. **Build UI** → render($$ )
6. **Handle events** → Always clean up!
7. **Test thoroughly** → Hot reload helps

### For Debugging Issues

1. **Check state management** → setState vs extendState?
2. **Check event cleanup** → dispose() implemented?
3. **Check refs** → Using .ref() and this.refs?
4. **Check API usage** → Deprecated methods?
5. **Check focus** → Re-rendering on input?

## 🔗 Essential Resources

- [Writer Docs](https://docs.navigaglobal.com/writer/)
- [Substance.js GitHub](https://github.com/substance/substance)
- [Font Awesome 4](https://fontawesome.com/v4/icons/)
- [This Starter Kit](./README.md)

## ✅ Best Practices Checklist

When helping with Writer plugins, ensure:

- [ ] Using `extendState()` not `setState()`
- [ ] Event listeners have cleanup in `dispose()`
- [ ] Using modern APIs (documentHelpers)
- [ ] Icon names are Font Awesome 4 (no 'fa-' prefix)
- [ ] Refs used for form inputs, not state
- [ ] Proper binding of event handlers
- [ ] SSL configured for local dev
- [ ] .env used for API keys (not committed)

---

**Remember:** Writer plugins use Substance.js, which has subtle but critical differences from React. Always check the framework-specific behavior!
