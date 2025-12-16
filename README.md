# Naviga Writer Plugin Starter Kit

**Production-ready template for building Naviga Writer plugins.**

This is a template repository used by [create-writer-plugin](https://github.com/Infomaker/create-writer-plugin). Users should use the CLI tool to create plugins from this template rather than cloning directly.

---

## 🚀 Quick Start (For Users)

**Use the CLI tool to create a new plugin:**

```bash
npx create-writer-plugin my-awesome-plugin
```

That's it! The CLI will clone this template, configure everything, and you'll have a working plugin ready to develop.

See [create-writer-plugin](https://github.com/Infomaker/create-writer-plugin) for full documentation.

---

## 📦 What's Included

This template provides everything you need for professional Writer plugin development:

### Core Features
- ✅ **Modern tooling** - Webpack 5 with hot module replacement
- ✅ **Development server** - HTTPS with SSL certificates
- ✅ **Component structure** - Production-tested patterns
- ✅ **Best practices** - All findings from production plugins integrated
- ✅ **Substance.js patterns** - Proper state management, event cleanup
- ✅ **TypeScript ready** - Easy to add TypeScript support

### Documentation
- ✅ **README.md** - Plugin development guide
- ✅ **AI_CONTEXT.md** - For AI assistants (Claude, ChatGPT, etc.)
- ✅ **COMMON_PATTERNS.md** - Reusable code patterns
- ✅ **TROUBLESHOOTING.md** - Solutions to common issues

### Development Tools
- ✅ **SSL setup script** - Automatic certificate generation
- ✅ **Hot reload** - See changes instantly
- ✅ **Source maps** - Easy debugging
- ✅ **Production build** - Optimized bundle

---

## 📁 Project Structure

```
dw-plugin-starter-kit/
├── 📄 package.json                  # Dependencies and scripts
├── 📄 webpack.config.js             # Build configuration
├── 📄 .env.example                  # Environment variables template
├── 📄 .nvmrc                        # Node version
│
├── 📚 DOCUMENTATION
│   ├── README.md                    # This file
│   ├── AI_CONTEXT.md               # AI assistant guide
│   ├── COMMON_PATTERNS.md          # Code examples
│   └── TROUBLESHOOTING.md          # Solutions guide
│
├── 📁 src/
│   ├── index.js                    # Entry point
│   ├── MyPluginComponent.js        # Main component (273 lines)
│   ├── MyPluginPackage.js          # Plugin configuration
│   └── scss/
│       └── index.scss              # Styles
│
└── 📁 scripts/
    └── setup-ssl.js                # SSL certificate setup
```

---

## 🎓 Learning Path

### For Beginners

1. **Use create-writer-plugin** to scaffold your first plugin
2. **Read README.md** in your generated project for quick start
3. **Explore src/MyPluginComponent.js** to understand structure
4. **Check COMMON_PATTERNS.md** for code examples

### For Experienced Developers

1. **Review AI_CONTEXT.md** to understand Substance.js patterns
2. **Study COMMON_PATTERNS.md** for advanced patterns
3. **Reference TROUBLESHOOTING.md** when issues arise
4. **Customize webpack.config.js** for your needs

---

## 🛠️ Key Features Explained

### Component Structure

The template component (`MyPluginComponent.js`) includes:

- **Proper state management** - Using `extendState()` not `setState()`
- **Event listener cleanup** - Preventing memory leaks with `dispose()`
- **Modern API usage** - Using `documentHelpers` instead of deprecated methods
- **Focus management** - Proper handling of selection changes
- **Loading states** - User feedback during async operations
- **Error handling** - Graceful error display with auto-clear

### Critical Patterns

**State Management:**
```javascript
// ❌ WRONG - setState() REPLACES entire state
this.setState({ isLoading: true })

// ✅ CORRECT - extendState() MERGES with existing state
this.extendState({ isLoading: true })
```

**Event Cleanup:**
```javascript
dispose() {
    // CRITICAL: Always cleanup event listeners
    this.context.editorSession.off('document:changed', this.handleDocumentChange)
    super.dispose()
}
```

**Form Inputs:**
```javascript
// ❌ WRONG - Using state causes re-renders
this.extendState({ inputValue: e.target.value })

// ✅ CORRECT - Use refs for form inputs
this.refs.inputField.val()
```

See **COMMON_PATTERNS.md** for complete examples.

---

## 📚 Documentation Files

### AI_CONTEXT.md
**For AI assistants helping with development**

Contains:
- Quick facts about Naviga Writer platform
- React vs Substance.js differences
- Common pitfalls and solutions
- When to use different tools
- Step-by-step approach for development

**Use this to help AI assistants (Claude, ChatGPT) understand your project better!**

### COMMON_PATTERNS.md
**Production-tested code patterns**

Includes:
1. Sidebar plugin structure
2. Package configuration
3. API integration pattern
4. Text replacement (single node, selection-based, element-aware)
5. Form input handling
6. Loading states with CSS spinner
7. Error handling with auto-clear
8. Button states (dynamic disabled)
9. Conditional rendering
10. State reset patterns

### TROUBLESHOOTING.md
**Solutions to real problems**

Covers:
- State management issues
- Input focus problems
- Event listener issues
- Text replacement challenges
- API integration issues
- Styling problems
- Deprecated API warnings
- Development server issues
- Build problems
- Debugging tips

---

## ⚙️ Configuration

### package.json Scripts

```bash
npm start          # Start development server (HTTPS, hot reload)
npm run dev        # Same as start
npm run build      # Production build
npm run build:dev  # Development build
npm run setup:ssl  # Setup SSL certificates
```

### Environment Variables

Create `.env` file (copied from `.env.example`):

```bash
# API Configuration
API_KEY=your-api-key-here
ANTHROPIC_API_KEY=sk-ant-xxx
OPENAI_API_KEY=sk-xxx

# Development
PORT=3000
```

### Node Version

Specified in `.nvmrc`:
```
18.18.0
```

Use with nvm:
```bash
nvm use
```

---

## 🔧 Development

### First Time Setup

When you create a plugin with `create-writer-plugin`, you'll need to:

```bash
cd your-plugin
npm install
npm run setup:ssl
npm start
```

### Development Workflow

1. **Edit files** in `src/`
2. **Save** - webpack hot reload updates browser
3. **Check console** for errors
4. **Iterate** quickly with instant feedback

### Building for Production

```bash
npm run build
```

Output: `dist/index.js` (optimized bundle)

---

## 🎯 Common Use Cases

### Simple Sidebar Plugin

Basic sidebar that displays information:
- Read COMMON_PATTERNS.md → "1. Sidebar Plugin Pattern"
- Customize render method
- Add your UI elements

### API Integration Plugin

Plugin that calls external APIs:
- Read COMMON_PATTERNS.md → "3. API Integration Pattern"
- Create service class
- Handle loading/error states
- Display results

### Text Manipulation Plugin

Plugin that modifies document content:
- Read COMMON_PATTERNS.md → "4. Text Replacement Patterns"
- Use documentHelpers API
- Preserve element types
- Handle selections properly

### Form-Based Plugin

Plugin with user inputs:
- Read COMMON_PATTERNS.md → "6. Form Input Pattern"
- Use refs (not state) for inputs
- Validate input
- Submit to API or update document

---

## 🆘 Getting Help

### Documentation

1. **README.md** - Overview and quick start
2. **AI_CONTEXT.md** - Platform understanding
3. **COMMON_PATTERNS.md** - Code examples
4. **TROUBLESHOOTING.md** - Problem solving

### AI Assistants

This template is optimized for AI assistance:

```
"I'm working on a Naviga Writer plugin. Read AI_CONTEXT.md 
and help me add a button that fetches data from an API."
```

### Common Issues

Check **TROUBLESHOOTING.md** for solutions to:
- State not updating → Use `extendState()`
- Input loses focus → Use refs
- Memory leaks → Implement `dispose()`
- Selection issues → Filter plugin interactions

---

## 🚀 Next Steps

After creating your plugin:

1. **Explore the code** - Start with `src/MyPluginComponent.js`
2. **Read the docs** - AI_CONTEXT.md and COMMON_PATTERNS.md
3. **Start developing** - Add your features
4. **Test thoroughly** - Check all user interactions
5. **Build and deploy** - `npm run build` and distribute

---

## 📄 License

MIT

---

## 🙏 Credits

Built with best practices from production Naviga Writer plugins, including comprehensive findings from the AI Assistant plugin development.

**Template maintained by:** Naviga Global Operations

**For users:** Use [create-writer-plugin](https://github.com/Infomaker/create-writer-plugin) to create plugins from this template.
