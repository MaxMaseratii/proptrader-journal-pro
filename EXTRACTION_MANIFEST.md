# PropTrader Journal Pro - Complete File Extraction Manifest

This document lists all files from the Replit application that should be extracted to complete the application.

## Already Extracted
- package.json
- package-lock.json (available from Replit)
- tsconfig.json
- tsconfig.node.json (available from Replit)
- vite.config.ts
- tailwind.config.ts
- postcss.config.js
- drizzle.config.ts
- .gitignore
- README.md
- client/index.html
- client/src/main.tsx
- client/src/index.css

## To Extract - Root Level Config Files
```
components.json
tailwind.config.ts (already extracted)
```

## To Extract - Client Source Files (client/src/)

### Main App Files
- App.tsx

### Components (client/src/components/)
44 component files including:
- account-management.tsx
- achievement-system.tsx
- ai-trading-mentor.tsx
- automatic-csv-import.tsx
- chart-components.tsx
- community-forum.tsx
- csv-import.tsx
- customizable-dashboard.tsx
- daily-planning-widget.tsx
- dashboard-widget.tsx
- discipline-analyzer.tsx
- enhanced-achievement-system.tsx
- enhanced-csv-import.tsx
- enhanced-discipline-analyzer.tsx
- FlowStateTraining.tsx
- MMM-DisciplinaryAssistant-Full.tsx
- MMM-DisciplinaryAssistant.tsx
- notification-dropdown.tsx
- notification-settings.tsx
- PaymentForm.tsx
- realtime-data.tsx
- report-generator.tsx
- robust-trade-entry.tsx
- sidebar.tsx
- spending-entry.tsx
- strategy-export.tsx
- strategy-form.tsx
- strategy-management.tsx
- target-progress-widget.tsx
- trade-analysis-calendar-new.tsx
- trade-analysis-calendar.tsx
- trade-calendar.tsx
- trade-detail-modal.tsx
- trade-entry.tsx
- TradingDisciplineSystem.tsx
- tradingview/ (subdirectory)
- ui/ (46 Radix UI component files)
- universal-csv-importer.tsx
- unrealized-profit-widgets.tsx
- user-profile-dropdown.tsx
- weekly-performance-overview.tsx

### UI Components (client/src/components/ui/)
46 files including button, dialog, form, input, select, table, tabs, etc.

### Pages (client/src/pages/)
60+ page files for all routes in the application

### Lib Utilities (client/src/lib/)
- authUtils.ts
- colorUtils.ts
- discipline-calculator.ts
- disciplined-score.ts
- notifications.ts
- queryClient.ts
- risk-calculator.ts
- trading-assets.ts
- utils.ts

### Utils (client/src/utils/)
- accurate-csv-processor.tsx
- advanced-csv-processor.tsx
- productionOptimizations.ts

### Hooks (client/src/hooks/)
- use-mobile.tsx
- use-toast.ts
- useAdminAccess.ts
- useAuth.ts
- useDebounce.ts

### Contexts (client/src/contexts/)
- ThemeContext.tsx

## To Extract - Server Files (server/)

### Main Server Files
- index.ts (main entry point)
- auth.ts (authentication logic)
- db.ts (database setup)
- routes.ts (API routes)
- storage.ts (file/data storage)
- vite.ts (development server setup)

### Additional Server Files
- advancedMonitoring.ts
- backgroundJobs.ts
- cdnOptimization.ts
- csv-broker-detection.ts
- customAuth.ts
- databaseOptimizations.ts
- developmentOptimizations.ts
- loadBalancer.ts
- monitoring.ts
- production.cjs
- production.ts
- redis.ts
- redisGracefulFallback.ts
- sessionStore.ts
- simplifiedRedis.ts
- storage.ts
- webWorkers.ts

## To Extract - Shared Schema (shared/)

- schema.ts (complete database schema with Drizzle ORM)
- projection-schema.ts
- subscriptionPlans.ts

## To Extract - Public/Assets

### client/public/
- Static assets (if any)

## To Extract - Documentation & Config

- components.json (component configuration)
- tailwind.config.ts (styling configuration)
- replit.md (Replit-specific configuration)

## Extraction Instructions

Use the Replit tools to read each file:

```javascript
// For each file, use the read_app_file tool with:
replId: "ca43e01f-4c33-40fb-a678-1390e07c9c68"
path: "relative/path/to/file.ts"
```

### Recommended Extraction Order

1. Config files (root level)
2. Shared schema (shared/)
3. Server files (server/)
4. Client lib utilities (client/src/lib/)
5. Client hooks (client/src/hooks/)
6. Client contexts (client/src/contexts/)
7. Client UI components (client/src/components/ui/)
8. Client components (client/src/components/)
9. Client pages (client/src/pages/)
10. Public assets

## File Count Summary

- Root config files: ~3
- Server files: ~20
- Shared files: 3
- Client lib: 9
- Client hooks: 5
- Client contexts: 1
- Client UI components: 46
- Client components: 44
- Client pages: 60+
- **Total: 200+ files**

## Notes

- All files are available in the Replit app
- Use a batch approach to extract multiple files
- All TypeScript files should be included
- CSS files are minimal (styling is in Tailwind)
- Image files are in attached_assets/ if needed
