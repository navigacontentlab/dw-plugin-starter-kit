#!/usr/bin/env node

/**
 * SSL Certificate Setup Script
 * Generates SSL certificates for local development using mkcert
 */

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')
const os = require('os')

const GREEN = '\x1b[32m'
const RED = '\x1b[31m'
const YELLOW = '\x1b[33m'
const BLUE = '\x1b[34m'
const NC = '\x1b[0m'  // No Color

console.log(`${BLUE}╔═══════════════════════════════════════════════════════╗${NC}`)
console.log(`${BLUE}║                                                       ║${NC}`)
console.log(`${BLUE}║        SSL Certificate Setup for Development         ║${NC}`)
console.log(`${BLUE}║                                                       ║${NC}`)
console.log(`${BLUE}╚═══════════════════════════════════════════════════════╝${NC}`)
console.log('')

// Check if mkcert is installed
console.log(`${BLUE}Checking for mkcert...${NC}`)
try {
    execSync('which mkcert', { stdio: 'ignore' })
    console.log(`${GREEN}✓ mkcert is installed${NC}`)
} catch (error) {
    console.log(`${RED}✗ mkcert is not installed${NC}`)
    console.log('')
    console.log(`${YELLOW}Please install mkcert first:${NC}`)
    console.log(`  macOS:   brew install mkcert`)
    console.log(`  Linux:   See https://github.com/FiloSottile/mkcert`)
    console.log(`  Windows: choco install mkcert (or see link above)`)
    console.log('')
    process.exit(1)
}

// Certificate directory
const certDir = path.join(os.homedir(), '.localhost-ssl')
const keyFile = path.join(certDir, 'localhost-key.pem')
const certFile = path.join(certDir, 'localhost.pem')

console.log('')
console.log(`${BLUE}Certificate directory: ${certDir}${NC}`)

// Create directory if it doesn't exist
if (!fs.existsSync(certDir)) {
    console.log(`${YELLOW}Creating certificate directory...${NC}`)
    fs.mkdirSync(certDir, { recursive: true })
    console.log(`${GREEN}✓ Directory created${NC}`)
}

// Check if certificates already exist
if (fs.existsSync(keyFile) && fs.existsSync(certFile)) {
    console.log(`${YELLOW}⚠️  Certificates already exist${NC}`)
    console.log('')
    console.log('Existing certificates:')
    console.log(`  Key:  ${keyFile}`)
    console.log(`  Cert: ${certFile}`)
    console.log('')
    
    // Prompt to regenerate
    console.log('Do you want to regenerate them? (y/n)')
    // For automated scripts, we'll skip regeneration
    console.log(`${GREEN}Keeping existing certificates${NC}`)
    console.log('')
} else {
    // Generate certificates
    console.log(`${YELLOW}Generating SSL certificates...${NC}`)
    
    try {
        execSync(
            `mkcert -key-file "${keyFile}" -cert-file "${certFile}" local.plugins.writer.infomaker.io localhost 127.0.0.1 ::1`,
            { stdio: 'inherit', cwd: certDir }
        )
        console.log(`${GREEN}✓ Certificates generated successfully${NC}`)
    } catch (error) {
        console.log(`${RED}✗ Failed to generate certificates${NC}`)
        console.log(error.message)
        process.exit(1)
    }
}

// Verify certificates exist
if (!fs.existsSync(keyFile) || !fs.existsSync(certFile)) {
    console.log(`${RED}✗ Certificate files not found${NC}`)
    process.exit(1)
}

console.log('')
console.log(`${GREEN}✅ SSL setup complete!${NC}`)
console.log('')
console.log(`${BLUE}═══════════════════════════════════════════════════════${NC}`)
console.log(`${YELLOW}Next Steps:${NC}`)
console.log(`${BLUE}═══════════════════════════════════════════════════════${NC}`)
console.log('')
console.log('1. Add this to your /etc/hosts file (if not already there):')
console.log(`   ${GREEN}127.0.0.1    local.plugins.writer.infomaker.io${NC}`)
console.log('')
console.log('2. Start the development server:')
console.log(`   ${GREEN}npm start${NC}`)
console.log('')
console.log('3. Open in browser:')
console.log(`   ${GREEN}https://local.plugins.writer.infomaker.io:3000/${NC}`)
console.log('')
console.log(`${BLUE}═══════════════════════════════════════════════════════${NC}`)
console.log('')
