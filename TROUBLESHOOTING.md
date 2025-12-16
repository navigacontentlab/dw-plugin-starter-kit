# Troubleshooting Guide

Common problems and their solutions when developing Writer plugins.

---

## 🚨 State Management Issues

### Problem: Button Becomes Disabled After Getting Response

**Symptom:**
- Button works initially
- After API call completes, button becomes disabled
- Can't click button anymore

**Cause:**
Using `setState()` instead of `extendState()` - this **replaces** entire state!

```javascript
// ❌ WRONG
this.setState({ response: data, isLoading: false })
// This DELETES selectedText, sourceNodeId, hasSelection!
```

**Solution:**
```javascript
// ✅ CORRECT
this.extendState({ response: data, isLoading: false })
// This MERGES, preserves all other state
```

**How to verify:**
```javascript
// Add logging before setState
console.log('State before:', this.state)
this.setState({ response: data })
console.log('State after:', this.state)  // Check if properties are missing!
```

---

## ⌨️ Input Focus Issues

### Problem: Textarea Loses Focus When Typing

**Symptom:**
- Click in textarea
- Start typing
- After first keystroke, focus disappears
- Can't continue typing

**Cause:**
Re-rendering on every keystroke due to state update in `input` event.

```javascript
// ❌ WRONG - Re-renders per keystroke
$$('textarea').on('input', (e) => {
    this.extendState({ value: e.target.value })
})
```

**Solution:**
Store reference, read value when needed (not on every keystroke).

```javascript
// ✅ CORRECT - No re-renders during typing
$$('textarea')
    .val(this.state.initialValue || '')
    .ref('myTextarea')

// Read value when submitting
handleSubmit() {
    const value = this.refs.myTextarea.val()
    this.extendState({ submittedValue: value })
}
```

### Problem: Selection Change Triggers During Typing

**Symptom:**
- Typing in plugin textarea
- Cursor jumps or focus is lost
- `selectionchange` event firing

**Cause:**
`selectionchange` event fires when focus moves to textarea, causing re-render.

**Solution:**
Ignore selection changes when focus is inside plugin.

```javascript
handleSelection() {
    const activeElement = document.activeElement
    
    // Skip if user is interacting with our plugin
    if (activeElement) {
        const inOurPlugin = activeElement.closest('.my-plugin') || 
                           activeElement.classList.contains('my-input')
        
        if (inOurPlugin) {
            return  // Don't update state
        }
    }
    
    // Only update for selection changes in editor
    const selectionInfo = this.getCurrentSelection()
    // ... continue
}
```

---

## 🔄 Event Listener Issues

### Problem: Event Listeners Keep Firing After Plugin Closes

**Symptom:**
- Close plugin
- Console still shows event logs
- Memory usage increases
- Multiple event handlers running

**Cause:**
Not cleaning up event listeners in `dispose()`.

```javascript
// ❌ WRONG - Memory leak!
didMount() {
    document.addEventListener('selectionchange', this.handleSelection)
}
// No dispose() method!
```

**Solution:**
Always implement `dispose()` and remove listeners.

```javascript
// ✅ CORRECT
didMount() {
    // Bind once
    this.handleSelection = this.handleSelection.bind(this)
    document.addEventListener('selectionchange', this.handleSelection)
}

dispose() {
    // CRITICAL: Clean up!
    document.removeEventListener('selectionchange', this.handleSelection)
}
```

### Problem: Event Handler Loses `this` Context

**Symptom:**
```
TypeError: Cannot read property 'extendState' of undefined
```

**Cause:**
Not binding event handler methods.

```javascript
// ❌ WRONG
didMount() {
    document.addEventListener('click', this.handleClick)
    // 'this' will be undefined in handleClick!
}
```

**Solution:**
```javascript
// ✅ CORRECT
didMount() {
    this.handleClick = this.handleClick.bind(this)
    document.addEventListener('click', this.handleClick)
}
```

Or use arrow functions:
```javascript
handleClick = () => {
    // 'this' is automatically bound
    this.extendState({ clicked: true })
}
```

---

## 📝 Text Replacement Issues

### Problem: Selection Still Visible After Text Replacement

**Symptom:**
- Replace text successfully
- Old selection range still highlighted
- New text may be different length

**Cause:**
Not clearing the selection after replacement.

**Solution:**
```javascript
replaceText(nodeId, newText) {
    const editorSession = this.context.editorSession
    
    editorSession.transaction(tx => {
        tx.set([nodeId, 'content'], newText)
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

### Problem: Multi-Node Selection Warnings

**Symptom:**
- Select text across multiple paragraphs
- Warning about multi-node selection

**Cause:**
Text replacement is designed for single nodes.

**Solution:**
```javascript
getCurrentSelection() {
    const sel = editorSession.getSelection()
    
    // Check if selection spans multiple nodes
    if (sel.start.path[0] !== sel.end.path[0]) {
        this.showError('⚠️ Please select text within a single paragraph')
        return null
    }
    
    // Single node - safe to proceed
    return { ... }
}
```

---

## 🔌 API Integration Issues

### Problem: API Calls Fail with CORS Error

**Symptom:**
```
Access to fetch at '...' from origin 'https://local.plugins.writer.infomaker.io:3000'
has been blocked by CORS policy
```

**Cause:**
API doesn't allow requests from local development domain.

**Solution (Development):**
```javascript
// In API service - development only!
const client = new APIClient({
    apiKey: this.apiKey,
    dangerouslyAllowBrowser: true  // For development only
})
```

**Solution (Production):**
Set up proxy server or ensure API has proper CORS headers.

### Problem: Environment Variables Not Loaded

**Symptom:**
```
API_KEY is undefined
```

**Cause:**
- `.env` file not in project root
- Webpack not configured for environment variables
- Using wrong variable name

**Solution:**
1. Ensure `.env` file exists in project root
2. Check webpack config has `dotenv-webpack` plugin
3. Use correct prefix: `process.env.VARIABLE_NAME`

```javascript
// Check if loaded
console.log('API_KEY:', process.env.API_KEY)

// Better error message
if (!process.env.API_KEY) {
    console.error('❌ API_KEY not found in environment variables')
    console.error('💡 Create .env file with: API_KEY=your-key-here')
}
```

---

## 🎨 Styling Issues

### Problem: Font Awesome Icon Not Showing

**Symptom:**
- Icon placeholder appears
- No actual icon visible
- Console shows 404 for icon font

**Cause:**
Using wrong Font Awesome version or wrong icon name format.

**Solution:**
```javascript
// ❌ WRONG
config.addToSidebar('My Plugin', pluginConfig, Component, {
    icon: 'fa-magic'  // Wrong! Don't include 'fa-' prefix
})

// ❌ WRONG
icon: 'magic-wand'  // Wrong! This is Font Awesome 5 name

// ✅ CORRECT
config.addToSidebar('My Plugin', pluginConfig, Component, {
    icon: 'magic'  // Font Awesome 4.x name, no prefix
})
```

Browse available icons: https://fontawesome.com/v4/icons/

### Problem: Styles Not Applied

**Symptom:**
- CSS classes defined
- No visual changes in plugin

**Cause:**
- Class name mismatch
- Webpack not processing SCSS
- Style specificity issues

**Solution:**
```javascript
// Check class is actually applied
const el = $$('div').addClass('my-class')
console.log(el.el.classList)  // Should show 'my-class'

// Check webpack is processing SCSS
// In webpack.config.js:
{
    test: /\.scss$/,
    use: [
        'style-loader',
        'css-loader',
        'sass-loader'
    ]
}

// Check specificity
.my-plugin .my-button {  // More specific
    background: red !important;  // Last resort
}
```

---

## 🐛 Deprecated API Warnings

### Problem: Warning About Deprecated Method

**Symptom:**
```
Warning: doc.getTextForSelection() is deprecated
```

**Cause:**
Using old Substance.js APIs.

**Solution:**
```javascript
// ❌ DEPRECATED
const text = doc.getTextForSelection(sel)

// ✅ MODERN
import { documentHelpers } from 'substance'
const text = documentHelpers.getTextForSelection(doc, sel)
```

### Common Deprecated APIs

| Deprecated | Modern Alternative |
|------------|-------------------|
| `doc.getTextForSelection(sel)` | `documentHelpers.getTextForSelection(doc, sel)` |
| `doc.getNodes()` | `doc.getNodeIds().map(id => doc.get(id))` |
| `component.setState()` | `component.extendState()` |

---

## 🔧 Development Server Issues

### Problem: SSL Certificate Warnings

**Symptom:**
- Browser shows "Not Secure" or certificate error
- Can't access plugin at https://local.plugins.writer.infomaker.io:3000/

**Cause:**
- mkcert not installed
- Certificate not generated
- Certificate not trusted

**Solution:**
```bash
# 1. Install mkcert
brew install mkcert  # macOS
# or see: https://github.com/FiloSottile/mkcert

# 2. Install local CA
mkcert -install

# 3. Generate certificate (run from project root)
npm run setup:ssl

# 4. Verify certificate exists
ls -la ~/.localhost-ssl/
# Should show: localhost-key.pem, localhost.pem

# 5. Restart dev server
npm start
```

### Problem: Hot Reload Not Working

**Symptom:**
- Make code changes
- Browser doesn't update
- Must manually refresh

**Cause:**
- Webpack HMR not enabled
- File watcher not working
- Port conflict

**Solution:**
```javascript
// webpack.config.js
devServer: {
    hot: true,           // Enable HMR
    liveReload: true,    // Enable live reload
    watchFiles: ['src/**/*'],  // Watch these files
}

// Check if port is in use
lsof -i :3000
# If another process is using port 3000, kill it or use different port

// Use different port
PORT=3001 npm start
```

---

## 📦 Build Issues

### Problem: Build Fails with Module Not Found

**Symptom:**
```
Module not found: Error: Can't resolve 'some-module'
```

**Cause:**
- Module not installed
- Wrong import path
- Missing webpack loader

**Solution:**
```bash
# 1. Verify module is installed
npm list some-module

# 2. Install if missing
npm install some-module

# 3. Check import path
// ❌ WRONG
import { Component } from './substance'

// ✅ CORRECT
import { Component } from 'substance'

# 4. Check webpack config has loader
// For SCSS:
{
    test: /\.scss$/,
    use: ['style-loader', 'css-loader', 'sass-loader']
}
```

### Problem: Bundle Size Too Large

**Symptom:**
- Build creates huge index.js file (>1MB)
- Slow plugin loading
- Performance issues

**Cause:**
- Including large dependencies
- No code splitting
- Not using production build

**Solution:**
```bash
# Use production build
npm run build

# Check bundle size
ls -lh dist/index.js

# Analyze bundle (if webpack-bundle-analyzer installed)
npm run analyze

# Consider splitting large dependencies
// Dynamic import
const heavyModule = await import('./heavy-module')
```

---

## 🔍 Debugging Tips

### Enable Verbose Logging

```javascript
class MyPlugin extends Component {
    didMount() {
        console.log('🎯 Plugin mounted')
        console.log('Context:', this.context)
        console.log('Props:', this.props)
        console.log('Initial state:', this.state)
    }
    
    extendState(changes) {
        console.log('🔄 State update:', changes)
        console.log('Previous state:', this.state)
        super.extendState(changes)
        console.log('New state:', this.state)
    }
}
```

### Check Plugin Loading

```javascript
// In Package.js
configure(config, pluginConfig) {
    console.log('📦 Plugin configure called')
    console.log('Config:', pluginConfig)
    
    config.addToSidebar(/*...*/)
    console.log('✅ Plugin added to sidebar')
}
```

### Inspect Writer Context

```javascript
// In component
didMount() {
    console.log('Editor session:', this.context.editorSession)
    console.log('Document:', this.context.editorSession.getDocument())
    console.log('API:', this.context.api)
}
```

---

## 🆘 Getting Help

If you can't solve your issue:

1. **Check logs** - Browser console and webpack output
2. **Read documentation** - This starter kit's docs
3. **Check examples** - See how it's done in `examples/`
4. **Search issues** - GitHub issues for Writer/Substance
5. **Ask AI** - Provide AI_CONTEXT.md for better help

### Good Bug Report Format

```
**Problem**: Button stays disabled after API call

**Expected**: Button should stay enabled

**Actual**: Button becomes disabled and won't re-enable

**Code**:
```javascript
this.setState({ response: data, isLoading: false })
```

**State before**: { selectedText: 'foo', isLoading: true }
**State after**: { response: 'bar', isLoading: false }

**Environment**: 
- Writer version: X.Y.Z
- Node version: 18.x
- Browser: Chrome 120
```

---

**Remember: Most issues come from using `setState()` instead of `extendState()` or forgetting to clean up event listeners!**
