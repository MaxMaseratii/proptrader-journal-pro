import archiver from 'archiver';
import fs from 'fs';
import path from 'path';

const output = fs.createWriteStream('PropTraderJournal-Complete.zip');
const archive = archiver('zip', {
  zlib: { level: 9 } // Maximum compression
});

output.on('close', function() {
  console.log('✅ ZIP file created successfully!');
  console.log('📦 Total size:', archive.pointer() + ' bytes');
  console.log('📁 File: PropTraderJournal-Complete.zip');
});

archive.on('warning', function(err) {
  if (err.code === 'ENOENT') {
    console.warn('Warning:', err);
  } else {
    throw err;
  }
});

archive.on('error', function(err) {
  throw err;
});

archive.pipe(output);

// Add all necessary directories and files
console.log('📦 Creating ZIP archive...');

// Core application files
archive.directory('client/', 'client/');
archive.directory('server/', 'server/');
archive.directory('shared/', 'shared/');

// Configuration files
archive.file('package.json', { name: 'package.json' });
archive.file('package-lock.json', { name: 'package-lock.json' });
archive.file('tsconfig.json', { name: 'tsconfig.json' });
archive.file('tsconfig.node.json', { name: 'tsconfig.node.json' });
archive.file('vite.config.ts', { name: 'vite.config.ts' });
archive.file('tailwind.config.ts', { name: 'tailwind.config.ts' });
archive.file('postcss.config.js', { name: 'postcss.config.js' });
archive.file('drizzle.config.ts', { name: 'drizzle.config.ts' });
archive.file('components.json', { name: 'components.json' });

// Deployment files
archive.file('railway.json', { name: 'railway.json' });
archive.file('Dockerfile.production', { name: 'Dockerfile.production' });
archive.file('docker-compose.production.yml', { name: 'docker-compose.production.yml' });
archive.file('kubernetes-deployment.yml', { name: 'kubernetes-deployment.yml' });
archive.file('nginx.conf', { name: 'nginx.conf' });
archive.file('prometheus.yml', { name: 'prometheus.yml' });

// Documentation
archive.file('replit.md', { name: 'README.md' });
archive.file('CSV_IMPORT_GUIDE.md', { name: 'CSV_IMPORT_GUIDE.md' });
archive.file('DEPLOYMENT_READY_CHECKLIST.md', { name: 'DEPLOYMENT_READY_CHECKLIST.md' });
archive.file('SCALABILITY_RECOMMENDATIONS.md', { name: 'SCALABILITY_RECOMMENDATIONS.md' });
archive.file('PropJournal-Pro-Journal-Capabilities.md', { name: 'PropJournal-Pro-Journal-Capabilities.md' });

// Additional files
archive.file('.gitignore', { name: '.gitignore' });

console.log('📁 Added all source files and configurations');

archive.finalize();