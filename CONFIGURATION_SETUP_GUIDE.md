# Complete Configuration and Setup Guide

## Project Configuration Files

### 1. Package.json Configuration

```json
{
  "name": "proptrader-journal",
  "version": "1.0.0",
  "description": "Professional trading journal for prop traders",
  "type": "module",
  "scripts": {
    "dev": "NODE_ENV=development tsx server/index.ts",
    "build": "tsc && vite build",
    "start": "NODE_ENV=production tsx server/index.ts",
    "db:push": "drizzle-kit push",
    "db:push:force": "drizzle-kit push --force",
    "db:studio": "drizzle-kit studio",
    "db:generate": "drizzle-kit generate",
    "test": "jest",
    "lint": "eslint . --ext .ts,.tsx",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "@anthropic-ai/sdk": "^0.24.3",
    "@hookform/resolvers": "^3.3.4",
    "@neondatabase/serverless": "^0.9.0",
    "@radix-ui/react-accordion": "^1.1.2",
    "@radix-ui/react-alert-dialog": "^1.0.5",
    "@radix-ui/react-avatar": "^1.0.4",
    "@radix-ui/react-checkbox": "^1.0.4",
    "@radix-ui/react-dialog": "^1.0.5",
    "@radix-ui/react-dropdown-menu": "^2.0.6",
    "@radix-ui/react-label": "^2.0.2",
    "@radix-ui/react-popover": "^1.0.7",
    "@radix-ui/react-progress": "^1.0.3",
    "@radix-ui/react-select": "^2.0.0",
    "@radix-ui/react-separator": "^1.0.3",
    "@radix-ui/react-slider": "^1.1.2",
    "@radix-ui/react-slot": "^1.0.2",
    "@radix-ui/react-switch": "^1.0.3",
    "@radix-ui/react-tabs": "^1.0.4",
    "@radix-ui/react-toast": "^1.1.5",
    "@radix-ui/react-tooltip": "^1.0.7",
    "@stripe/react-stripe-js": "^2.7.1",
    "@stripe/stripe-js": "^3.4.0",
    "@tanstack/react-query": "^5.0.0",
    "@types/bcryptjs": "^2.4.6",
    "@types/compression": "^1.7.5",
    "@types/connect-pg-simple": "^7.0.3",
    "@types/express": "^4.17.21",
    "@types/express-session": "^1.18.0",
    "@types/node": "^20.0.0",
    "@types/nodemailer": "^6.4.15",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "bcryptjs": "^2.4.3",
    "chart.js": "^4.4.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.1",
    "cmdk": "^1.0.0",
    "compression": "^1.7.4",
    "connect-pg-simple": "^9.0.1",
    "date-fns": "^3.6.0",
    "drizzle-kit": "^0.21.0",
    "drizzle-orm": "^0.30.0",
    "drizzle-zod": "^0.5.1",
    "express": "^4.19.2",
    "express-rate-limit": "^7.2.0",
    "express-session": "^1.18.0",
    "framer-motion": "^11.2.10",
    "lucide-react": "^0.379.0",
    "nodemailer": "^6.9.13",
    "papaparse": "^5.4.1",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-hook-form": "^7.51.0",
    "stripe": "^15.8.0",
    "tailwind-merge": "^2.3.0",
    "tailwindcss": "^3.4.0",
    "tailwindcss-animate": "^1.0.7",
    "tsx": "^4.7.0",
    "typescript": "^5.4.0",
    "vite": "^5.2.0",
    "wouter": "^3.1.0",
    "ws": "^8.17.0",
    "zod": "^3.23.0"
  },
  "devDependencies": {
    "@types/papaparse": "^5.3.14",
    "@types/ws": "^8.5.10",
    "@vitejs/plugin-react": "^4.2.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0"
  }
}
```

### 2. Vite Configuration

```typescript
// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client/src"),
      "@shared": path.resolve(__dirname, "./shared"),
      "@assets": path.resolve(__dirname, "./attached_assets"),
    },
  },
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: "dist",
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
          charts: ['chart.js'],
          utils: ['date-fns', 'clsx', 'tailwind-merge'],
        },
      },
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom', '@tanstack/react-query', 'wouter'],
  },
});
```

### 3. TypeScript Configuration

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": false,
    "noUnusedParameters": false,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./client/src/*"],
      "@shared/*": ["./shared/*"],
      "@assets/*": ["./attached_assets/*"]
    },
    "types": ["node"]
  },
  "include": [
    "client/src",
    "shared",
    "server",
    "*.ts",
    "*.tsx"
  ],
  "exclude": [
    "node_modules",
    "dist"
  ],
  "references": [
    { "path": "./tsconfig.node.json" }
  ]
}
```

### 4. Tailwind Configuration

```typescript
// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./client/src/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
```

### 5. CSS Variables and Styling

```css
/* client/src/index.css */
@import 'tailwindcss/base';
@import 'tailwindcss/components';
@import 'tailwindcss/utilities';

@layer base {
  :root {
    --background: 0 0% 3.9%;
    --foreground: 0 0% 98%;
    --card: 0 0% 3.9%;
    --card-foreground: 0 0% 98%;
    --popover: 0 0% 3.9%;
    --popover-foreground: 0 0% 98%;
    --primary: 45 93% 47%;
    --primary-foreground: 26 83% 14%;
    --secondary: 0 0% 14.9%;
    --secondary-foreground: 0 0% 98%;
    --muted: 0 0% 14.9%;
    --muted-foreground: 0 0% 63.9%;
    --accent: 0 0% 14.9%;
    --accent-foreground: 0 0% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 0 0% 98%;
    --border: 0 0% 14.9%;
    --input: 0 0% 14.9%;
    --ring: 45 93% 47%;
    --radius: 0.5rem;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}

/* Custom widget styling */
.widget-card {
  @apply bg-gradient-to-br from-gray-800/40 via-gray-700/40 to-gray-800/40 
         border border-gray-600/40 rounded-xl p-4 shadow-lg 
         hover:border-amber-400/30 transition-all duration-300;
}

/* Gradient backgrounds */
.gradient-gold {
  @apply bg-gradient-to-r from-yellow-400 to-amber-500;
}

.gradient-dark {
  @apply bg-gradient-to-br from-gray-900 via-black to-gray-900;
}

/* Profit/Loss color system */
.profit-text {
  @apply text-green-400;
}

.loss-text {
  @apply text-red-400;
}

.neutral-text {
  @apply text-gray-400;
}

/* Animation utilities */
.animate-glow {
  animation: glow 2s ease-in-out infinite alternate;
}

@keyframes glow {
  from {
    box-shadow: 0 0 5px rgba(251, 191, 36, 0.3);
  }
  to {
    box-shadow: 0 0 20px rgba(251, 191, 36, 0.6);
  }
}
```

### 6. Database Configuration

```typescript
// drizzle.config.ts
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./shared/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
});
```

### 7. Environment Variables Setup

```bash
# .env (Create this file in project root)
# Database Configuration
DATABASE_URL=postgresql://username:password@host:port/database

# Session Management
SESSION_SECRET=your-super-secret-session-key-min-32-chars

# Stripe Configuration (for subscriptions)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
VITE_STRIPE_PUBLIC_KEY=pk_test_your_stripe_public_key

# Email Configuration (Optional - for email verification)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=noreply@yourapp.com

# Application Settings
NODE_ENV=development
BASE_URL=http://localhost:5000

# AI Integration (Optional - for Trading Companion)
ANTHROPIC_API_KEY=your-anthropic-api-key
OPENAI_API_KEY=your-openai-api-key

# Replit Configuration (Auto-provided in Replit)
REPL_ID=your-repl-id
REPLIT_DOMAINS=your-app-domain.replit.app
```

### 8. Express Server Configuration

```typescript
// server/index.ts
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import compression from "compression";
import rateLimit from "express-rate-limit";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";

const app = express();
const PORT = parseInt(process.env.PORT || "5000", 10);

// Trust proxy for secure cookies
app.set('trust proxy', 1);

// Compression middleware
app.use(compression({
  level: 6,
  threshold: 1024,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs
  message: 'Too many requests from this IP',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

// Stricter rate limiting for AI endpoints
const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // limit each IP to 10 AI requests per minute
  message: 'Too many AI requests, please wait',
});
app.use('/api/trading-companion', aiLimiter);

// Parse JSON bodies
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Session configuration
const PgSession = connectPgSimple(session);
app.use(session({
  store: new PgSession({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false, // Table created via Drizzle schema
    tableName: 'sessions',
  }),
  secret: process.env.SESSION_SECRET!,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week
  },
}));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Register API routes
const httpServer = await registerRoutes(app);

// Vite setup for development/production
if (process.env.NODE_ENV === "development") {
  await setupVite(app, httpServer);
} else {
  serveStatic(app);
}

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    message: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { error: err.message })
  });
});

// Start server
httpServer.listen(PORT, "0.0.0.0", () => {
  log(`Server running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  httpServer.close(() => {
    console.log('Process terminated');
  });
});
```

### 9. React Query Client Setup

```typescript
// client/src/lib/queryClient.ts
import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: (failureCount, error: any) => {
        if (error?.message?.includes('401')) return false;
        return failureCount < 3;
      },
    },
    mutations: {
      retry: false,
    },
  },
});

// API request helper
export async function apiRequest(
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH",
  url: string,
  data?: any
) {
  const config: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include", // Include cookies for session auth
  };

  if (data && method !== "GET") {
    config.body = JSON.stringify(data);
  }

  const response = await fetch(url, config);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`${response.status}: ${errorData.message || response.statusText}`);
  }

  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return response.json();
  }
  
  return response.text();
}

// Default query function
queryClient.setQueryDefaults([], {
  queryFn: async ({ queryKey }) => {
    const [url] = queryKey as [string];
    return apiRequest("GET", url);
  },
});
```

### 10. Component Library Setup

```typescript
// client/src/components/ui/index.ts
export { Button } from "./button";
export { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./card";
export { Input } from "./input";
export { Label } from "./label";
export { Textarea } from "./textarea";
export { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select";
export { Checkbox } from "./checkbox";
export { Progress } from "./progress";
export { Badge } from "./badge";
export { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./dialog";
export { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "./form";
export { Toaster } from "./toaster";
export { useToast } from "../hooks/use-toast";
```

## Production Deployment Configuration

### Docker Configuration

```dockerfile
# Dockerfile
FROM node:18-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM base AS build
RUN npm ci
COPY . .
RUN npm run build

FROM base AS production
COPY --from=build /app/dist ./dist
COPY --from=build /app/server ./server
COPY --from=build /app/shared ./shared
EXPOSE 5000
CMD ["npm", "start"]
```

### Nginx Configuration

```nginx
# nginx.conf
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    location /static/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

This configuration provides a complete, production-ready setup for the PropTraderJournal application with all necessary dependencies, security measures, and optimization settings.