// CDN and static asset optimization for ultra-scale deployment
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export class CDNOptimizer {
  // Static asset configuration for CDN delivery
  static getCDNAssetPaths() {
    return {
      images: ['/assets/**/*.{png,jpg,jpeg,gif,webp,svg}'],
      fonts: ['/assets/**/*.{woff,woff2,ttf,eot}'],
      css: ['**/*.css'],
      js: ['**/*.js', '**/*.mjs'],
      videos: ['/assets/**/*.{mp4,webm,ogg}'],
      documents: ['/assets/**/*.{pdf,doc,docx}']
    };
  }

  // Cache headers for different asset types
  static getCacheHeaders() {
    return {
      // Long-term caching for immutable assets
      immutable: {
        'Cache-Control': 'public, max-age=31536000, immutable', // 1 year
        'Expires': new Date(Date.now() + 31536000 * 1000).toUTCString()
      },
      
      // Standard caching for versioned assets
      versioned: {
        'Cache-Control': 'public, max-age=86400', // 1 day
        'Expires': new Date(Date.now() + 86400 * 1000).toUTCString()
      },
      
      // Short caching for dynamic content
      dynamic: {
        'Cache-Control': 'public, max-age=300', // 5 minutes
        'Expires': new Date(Date.now() + 300 * 1000).toUTCString()
      },
      
      // No caching for API responses
      api: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    };
  }

  // Middleware for optimizing static asset delivery
  static createAssetMiddleware() {
    return (req: any, res: any, next: any) => {
      const url = req.url;
      const headers = this.getCacheHeaders();

      // Set appropriate cache headers based on file type
      if (url.match(/\.(png|jpg|jpeg|gif|webp|svg|woff|woff2|ttf|eot)$/)) {
        // Immutable assets (images, fonts)
        Object.entries(headers.immutable).forEach(([key, value]) => {
          res.setHeader(key, value);
        });
      } else if (url.match(/\.(css|js|mjs)$/)) {
        // Versioned assets (CSS, JS)
        Object.entries(headers.versioned).forEach(([key, value]) => {
          res.setHeader(key, value);
        });
      } else if (url.startsWith('/api/')) {
        // API responses - no caching
        Object.entries(headers.api).forEach(([key, value]) => {
          res.setHeader(key, value);
        });
      }

      // Add security headers
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('X-Frame-Options', 'DENY');
      res.setHeader('X-XSS-Protection', '1; mode=block');
      
      next();
    };
  }

  // Asset fingerprinting for cache busting
  static generateAssetFingerprint(content: Buffer): string {
    const crypto = require('crypto');
    return crypto.createHash('md5').update(content).digest('hex').substring(0, 8);
  }

  // CDN URL generation
  static generateCDNUrl(assetPath: string, cdnDomain?: string): string {
    if (!cdnDomain) {
      return assetPath;
    }
    
    // Remove leading slash and construct CDN URL
    const cleanPath = assetPath.startsWith('/') ? assetPath.substring(1) : assetPath;
    return `https://${cdnDomain}/${cleanPath}`;
  }

  // Preload critical resources
  static getCriticalResourcePreloads() {
    return [
      // Critical CSS
      '<link rel="preload" href="/assets/css/critical.css" as="style">',
      
      // Essential fonts
      '<link rel="preload" href="/assets/fonts/main.woff2" as="font" type="font/woff2" crossorigin>',
      
      // Logo and key images
      '<link rel="preload" href="/assets/images/logo.svg" as="image">',
      
      // Critical JavaScript
      '<link rel="preload" href="/assets/js/critical.js" as="script">'
    ];
  }

  // Service worker registration for advanced caching
  static getServiceWorkerScript() {
    return `
      if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
          navigator.serviceWorker.register('/sw.js')
            .then((registration) => {
              console.log('SW registered: ', registration);
            })
            .catch((registrationError) => {
              console.log('SW registration failed: ', registrationError);
            });
        });
      }
    `;
  }
}

// Express middleware configuration for CDN optimization
export function setupCDNOptimization(app: express.Application) {
  // Apply CDN optimization middleware
  app.use(CDNOptimizer.createAssetMiddleware());
  
  // Serve static files with optimization
  app.use('/assets', express.static(path.join(__dirname, '../client/assets'), {
    maxAge: process.env.NODE_ENV === 'production' ? '1y' : '1d',
    etag: true,
    lastModified: true,
    immutable: true
  }));

  // Service worker endpoint
  app.get('/sw.js', (req, res) => {
    res.setHeader('Content-Type', 'application/javascript');
    res.setHeader('Service-Worker-Allowed', '/');
    res.send(getServiceWorkerContent());
  });
}

function getServiceWorkerContent(): string {
  return `
    const CACHE_NAME = 'proptrader-v1';
    const urlsToCache = [
      '/',
      '/assets/css/main.css',
      '/assets/js/main.js',
      '/assets/images/logo.svg',
      '/assets/fonts/main.woff2'
    ];

    self.addEventListener('install', (event) => {
      event.waitUntil(
        caches.open(CACHE_NAME)
          .then((cache) => {
            return cache.addAll(urlsToCache);
          })
      );
    });

    self.addEventListener('fetch', (event) => {
      // Cache-first strategy for assets
      if (event.request.url.includes('/assets/')) {
        event.respondWith(
          caches.match(event.request)
            .then((response) => {
              if (response) {
                return response;
              }
              return fetch(event.request);
            })
        );
      }
      
      // Network-first strategy for API calls
      else if (event.request.url.includes('/api/')) {
        event.respondWith(
          fetch(event.request)
            .catch(() => {
              return caches.match(event.request);
            })
        );
      }
      
      // Default: try cache first, then network
      else {
        event.respondWith(
          caches.match(event.request)
            .then((response) => {
              return response || fetch(event.request);
            })
        );
      }
    });
  `;
}