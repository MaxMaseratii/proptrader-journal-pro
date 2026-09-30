# PropTrader Journal Pro - Trading Journal Application

Elite trading journal designed specifically for prop firm traders and futures traders. Track performance, manage risk, and pass challenges with professional-grade analytics.

**Frontend-only architecture** - Deployed on GitHub Pages with Firebase backend (Auth, Firestore, Storage).

## Application Structure

### Frontend (client/)
- **client/src/** - React TypeScript application
  - components/ - UI components and trading interface
  - pages/ - Application pages and routes
  - lib/ - Utilities and Firebase integration
  - hooks/ - React hooks for state management
  - contexts/ - React context providers

## Key Features

- Advanced trading journal for prop traders
- Real-time dashboard with performance analytics
- CSV import for trade data
- Risk management and position sizing
- Account tracking and challenge management
- Discipline scoring system
- Achievement badges and statistics
- Strategy management
- Daily planning and reflective journal
- Payout tracking and calculations

## Technology Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Radix UI
- **Backend**: Firebase (Authentication, Firestore, Cloud Storage)
- **Deployment**: GitHub Pages (static hosting)
- **Build Tools**: Vite
- **Auth**: Firebase Authentication
- **Database**: Firestore (NoSQL)
- **File Storage**: Firebase Cloud Storage
- **Charts**: Recharts, Chart.js, Lightweight Charts
- **State Management**: React Query, React Context

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

## Build

```bash
npm run build
```

## Configuration Files

- `tsconfig.json` - TypeScript configuration
- `vite.config.ts` - Vite bundler configuration
- `tailwind.config.ts` - Tailwind CSS configuration
- `postcss.config.js` - PostCSS configuration
- `.env.example` - Firebase environment variables template

## Firebase Setup

### 1. Create a Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Create a project"
3. Name it "PropTrader Journal Pro"
4. Enable Google Analytics (optional)

### 2. Configure Firebase Services
**Authentication:**
- Go to Authentication > Sign-in method
- Enable Email/Password
- Enable Google OAuth
- Add authorized redirect URIs

**Firestore Database:**
- Go to Firestore Database
- Create database in production mode
- Set security rules:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{uid} {
      allow read, write: if request.auth.uid == uid;
    }
    match /trades/{uid}/{document=**} {
      allow read, write: if request.auth.uid == uid;
    }
    match /accounts/{uid}/{document=**} {
      allow read, write: if request.auth.uid == uid;
    }
  }
}
```

**Cloud Storage:**
- Go to Cloud Storage
- Create storage bucket
- Set security rules:
```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /users/{uid}/{allPaths=**} {
      allow read, write: if request.auth.uid == uid;
    }
  }
}
```

### 3. Get Firebase Config
1. Go to Project Settings (gear icon)
2. Copy your web app config
3. Create `.env.local` in root directory
4. Add Firebase variables (see .env.example)

## Environment Variables

Create a `.env.local` file (based on `.env.example`):
```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

## Deployment to GitHub Pages

### Automatic Deployment
Push to `main` branch - GitHub Actions automatically builds and deploys to GitHub Pages.

### Manual Deployment
```bash
npm run build
npm run preview
```

### Enable GitHub Pages
1. Go to repo Settings > Pages
2. Set source to "Deploy from a branch"
3. Select `gh-pages` branch
4. Your app will be live at: `https://maxmaseratii.github.io/proptrader-journal-pro/`

## License

MIT
