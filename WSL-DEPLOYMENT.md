# WSL Deployment Guide for BSG Helpdesk

This guide addresses common WSL (Windows Subsystem for Linux) deployment issues and provides optimized build commands.

## 🚨 Common WSL Issues & Solutions

### 1. **Peer Dependency Conflicts**
**Error**: `ERESOLVE unable to resolve dependency tree`

**Solution**: Use the legacy peer deps flag
```bash
npm install --legacy-peer-deps
```

### 2. **Permission Errors (EACCES)**
**Error**: `EACCES: permission denied`

**Solution**: Set npm permissions correctly
```bash
sudo chown -R $(whoami) ~/.npm
sudo chown -R $(whoami) /usr/local/lib/node_modules
```

### 3. **Symbolic Link Issues**
**Error**: Symlink-related build failures

**Solution**: The `.npmrc` file includes `no-bin-links=true` to fix this

### 4. **Memory Issues**
**Error**: `JavaScript heap out of memory`

**Solution**: Increase Node.js memory limit
```bash
export NODE_OPTIONS="--max-old-space-size=4096"
```

## 🛠️ WSL-Optimized Build Process

### **Method 1: Using Our WSL Script (Recommended)**
```bash
cd frontend
npm run build:wsl
```

### **Method 2: Manual Step-by-Step**
```bash
cd frontend

# Clean everything
npm run clean

# Install with WSL-optimized settings
npm run install:wsl

# Build
npm run build
```

### **Method 3: One-Line Build**
```bash
cd frontend && npm cache clean --force && rm -rf node_modules package-lock.json && npm install --legacy-peer-deps && npm run build
```

## 📁 File Structure Changes for WSL

We've added these WSL-specific files:

- **`.npmrc`**: npm configuration for WSL compatibility
- **`build-wsl.sh`**: Automated WSL build script
- **WSL-specific npm scripts** in `package.json`

## 🔧 WSL Configuration Files

### **`.npmrc` Contents**
```ini
# WSL and Windows compatibility
legacy-peer-deps=true
auto-install-peers=true
strict-peer-deps=false
prefer-offline=true
audit=false
unsafe-perm=true
no-bin-links=true
```

### **New Package.json Scripts**
```json
{
  "scripts": {
    "build:wsl": "bash build-wsl.sh",
    "install:wsl": "npm install --legacy-peer-deps --no-audit",
    "clean": "rm -rf node_modules package-lock.json && npm cache clean --force"
  }
}
```

## 🚀 Deployment Steps

### **1. Backend Setup (WSL)**
```bash
cd backend
npm install --legacy-peer-deps
npm run build  # If TypeScript build is needed
```

### **2. Frontend Setup (WSL)**
```bash
cd frontend
npm run build:wsl
```

### **3. Production Deployment**
```bash
# Backend
cd backend
npm start

# Frontend (serve static files)
cd frontend
npx serve -s build -l 3000
```

## 🐛 Troubleshooting

### **Build Still Failing?**

1. **Check Node.js Version**
   ```bash
   node --version  # Should be 16+ for React 18+
   npm --version   # Should be 8+
   ```

2. **Clear All Caches**
   ```bash
   npm cache clean --force
   rm -rf ~/.npm
   rm -rf node_modules package-lock.json
   ```

3. **Check WSL File Permissions**
   ```bash
   ls -la node_modules
   # Should show your user as owner, not root
   ```

4. **Memory Issues**
   ```bash
   # Increase WSL memory limit
   echo '[wsl2]' >> /mnt/c/Users/YourUsername/.wslconfig
   echo 'memory=4GB' >> /mnt/c/Users/YourUsername/.wslconfig
   # Restart WSL
   ```

### **Still Having Issues?**

Try the nuclear option:
```bash
# Remove everything and start fresh
cd frontend
rm -rf node_modules package-lock.json
npm cache clean --force
rm -rf ~/.npm/_cacache
npm install --legacy-peer-deps --force
npm run build
```

## ✅ Success Indicators

You should see:
```
✅ Build completed successfully!
📁 Build files are in the 'build' directory
```

The `build/` directory should contain:
- `index.html`
- `static/css/` (CSS files)
- `static/js/` (JavaScript files)
- Other static assets

## 🌐 Testing the Build

After successful build:
```bash
# Serve the build locally
cd frontend
npx serve -s build

# Open browser to http://localhost:3000
```

## 📝 Notes

- The `legacy-peer-deps` flag is safe for React projects and resolves most dependency conflicts
- WSL2 generally performs better than WSL1 for Node.js builds
- If deploying to production, consider using Docker for consistency across environments