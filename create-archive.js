import fs from 'fs';
import path from 'path';
import archiver from 'archiver';

// Create output stream
const output = fs.createWriteStream('PropTraderJournal-Complete-App.zip');
const archive = archiver('zip', {
  zlib: { level: 9 } // Sets the compression level
});

// Listen for all archive data to be written
output.on('close', function() {
  console.log('Archive created successfully!');
  console.log(archive.pointer() + ' total bytes');
});

// Good practice to catch warnings (e.g. stat failures and other non-blocking errors)
archive.on('warning', function(err) {
  if (err.code === 'ENOENT') {
    console.warn('Warning:', err);
  } else {
    throw err;
  }
});

// Good practice to catch this error explicitly
archive.on('error', function(err) {
  throw err;
});

// Pipe archive data to the file
archive.pipe(output);

// Add directories
archive.directory('client/', 'client/');
archive.directory('server/', 'server/');
archive.directory('shared/', 'shared/');

// Add individual files
const files = [
  'package.json',
  'package-lock.json',
  'tsconfig.json',
  'vite.config.ts',
  'tailwind.config.ts',
  'postcss.config.js',
  'drizzle.config.ts',
  'components.json',
  'replit.md',
  'PropJournal-Pro-Journal-Capabilities.md'
];

files.forEach(file => {
  if (fs.existsSync(file)) {
    archive.file(file, { name: file });
  }
});

// Create README for the archive
const readmeContent = `# PropTraderJournal - Complete Application

## Overview
This is a complete trading journal application built for proprietary trading firms and traders.

## Installation
1. Extract this archive
2. Run: npm install
3. Set up your database with the provided schema
4. Configure environment variables
5. Run: npm run dev

## Features
- Complete trading journal with data persistence
- Account management with projection system
- Risk management and performance analytics
- CSV import functionality
- Comprehensive dashboard with real-time data
- User authentication via Replit Auth

## Architecture
- Frontend: React 18 + TypeScript + Tailwind CSS
- Backend: Node.js + Express + TypeScript
- Database: PostgreSQL with Drizzle ORM
- Authentication: Replit Auth with session management

## Recent Updates (July 16, 2025)
- Implemented comprehensive data persistence across all forms
- Connected projection data to dashboard widgets
- Fixed discipline calculator integration
- Enhanced account selection and data filtering
- Production-ready with proper error handling

For full documentation, see replit.md
`;

archive.append(readmeContent, { name: 'README.md' });

// Finalize the archive
archive.finalize();