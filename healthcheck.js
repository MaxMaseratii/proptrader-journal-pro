#!/usr/bin/env node
// Simple health check script for Docker containers

const http = require('http');

const options = {
  host: '0.0.0.0',
  port: process.env.PORT || 5000,
  timeout: 2000,
  path: '/health'
};

const request = http.request(options, (res) => {
  console.log(`Health check status: ${res.statusCode}`);
  if (res.statusCode === 200) {
    process.exit(0);
  } else {
    process.exit(1);
  }
});

request.on('error', (err) => {
  console.error('Health check failed:', err.message);
  process.exit(1);
});

request.on('timeout', () => {
  console.error('Health check timed out');
  request.destroy();
  process.exit(1);
});

request.setTimeout(options.timeout);
request.end();