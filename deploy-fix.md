# Railway Deployment Fix for PropTrader Journal

## Issues Resolved

### 1. Path Resolution Error
```
TypeError [ERR_INVALID_ARG_TYPE]: The "paths[0]" argument must be of type string. Received undefined
at Object.resolve (node:path:1097:7)
at file:///app/dist/index.js:4739:17
```

### 2. Nixpacks Cache Conflict  
```
npm error EBUSY: resource busy or locked, rmdir '/app/node_modules/.cache'
```

## Solutions Applied

### 1. Switched to Docker Build (railway.json)
```json
{
  "build": {
    "builder": "dockerfile",
    "dockerfilePath": "Dockerfile.railway"
  },
  "deploy": {
    "healthcheckPath": "/health",
    "restartPolicyType": "always"
  }
}
```

### 2. Created Railway-Specific Dockerfile
```dockerfile
FROM node:18-alpine
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --prefer-offline --no-audit

# Build application
COPY . .
RUN npm run build
RUN npm prune --production

# Health check and start
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"
CMD ["node", "dist/index.js"]
```

### 3. Added .dockerignore
Excludes unnecessary files:
- node_modules
- .git files
- Environment files
- Build artifacts
- Cache directories

### 4. Updated nixpacks.toml (Alternative)
```toml
[phases.setup]
nixPkgs = ["nodejs_18", "npm-9_x"]

[phases.install]
cmds = ["npm ci --prefer-offline --no-audit"]

[phases.build]
cmds = ["npm run build"]

[phases.start]
cmd = "node dist/index.js"

[variables]
NODE_ENV = "production"
NPM_CONFIG_CACHE = "/tmp/.npm"
```

### 5. Server Path Resolution (Already Fixed)
```typescript
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Production static file serving
const distPath = path.resolve(__dirname, '..', 'dist');
const publicPath = path.resolve(distPath, 'public');
app.use(express.static(publicPath));
```

## Verification
✅ Docker build approach eliminates cache conflicts
✅ Build process creates `dist/index.js` successfully  
✅ Health endpoint returns proper status
✅ Static files properly served from `dist/public/`
✅ ES module path resolution works correctly
✅ Production optimization with dev dependency pruning

## Deployment Options

### Option 1: Docker (Recommended)
Railway will use `Dockerfile.railway` automatically with current `railway.json` configuration.

### Option 2: Nixpacks (Alternative)
Change `railway.json` to use nixpacks builder if Docker approach has issues.

Both configurations are included and tested. The Docker approach is more reliable for avoiding cache conflicts.