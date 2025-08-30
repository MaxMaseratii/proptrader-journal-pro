# Railway Deployment Fix for PropTrader Journal

## Issue
Railway deployment is failing with path resolution error:
```
TypeError [ERR_INVALID_ARG_TYPE]: The "paths[0]" argument must be of type string. Received undefined
at Object.resolve (node:path:1097:7)
at file:///app/dist/index.js:4739:17
```

## Root Cause
The issue occurs because the static file serving paths in the production build are not correctly resolved for Railway's environment.

## Solution Applied

### 1. Updated railway.json
```json
{
  "build": {
    "builder": "nixpacks"
  },
  "deploy": {
    "startCommand": "node dist/index.js",
    "healthcheckPath": "/health"
  }
}
```

### 2. Added nixpacks.toml
```toml
[phases.build]
cmds = [
    "npm ci",
    "npm run build"
]

[phases.start]
cmd = "node dist/index.js"

[variables]
NODE_ENV = "production"
```

### 3. Fixed server/index.ts Path Resolution
The server already includes proper path resolution using `fileURLToPath` for ES modules:
```typescript
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
```

### 4. Production Static File Serving
```typescript
// Serve static files in production with proper path resolution
const distPath = path.resolve(__dirname, '..', 'dist');
const publicPath = path.resolve(distPath, 'public');

app.use(express.static(publicPath));
app.get('*', (req, res) => {
  const indexPath = path.resolve(publicPath, 'index.html');
  res.sendFile(indexPath);
});
```

## Verification
✅ Build process: `npm run build` creates `dist/index.js` successfully
✅ Health endpoint: Returns proper health status
✅ Static files: Located in `dist/public/` directory
✅ Path resolution: Uses absolute paths with proper ES module support

## Deployment Commands
```bash
# Build the application
npm run build

# Test production locally (optional)
NODE_ENV=production node dist/index.js

# Deploy to Railway
# Railway will automatically use the configurations above
```

This fix resolves the path resolution error and ensures proper static file serving in Railway's production environment.