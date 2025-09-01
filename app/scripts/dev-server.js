const http = require('http');
const fs = require('fs');
const path = require('path');

// Server configuration
const PORT = 8000;
const ROOT_DIR = path.join(__dirname, '..');

// CORS headers
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json'
};

// Handle requests
const server = http.createServer((req, res) => {
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.writeHead(200, CORS_HEADERS);
    res.end();
    return;
  }

  // Only handle GET requests
  if (req.method !== 'GET') {
    res.writeHead(405, { 'Content-Type': 'text/plain' });
    res.end('Method Not Allowed');
    return;
  }

  // Map URL paths to file paths
  let filePath;
  if (req.url === '/' || req.url === '/topics.json') {
    filePath = path.join(ROOT_DIR, '..', 'topics.json');
  } else if (req.url.startsWith('/topics/')) {
    // Handle topic problems: /topics/arrays/problems.json
    filePath = path.join(ROOT_DIR, '..', req.url.substring(1));
  } else if (req.url.startsWith('/problems/')) {
    // Handle individual problems: /problems/two-sum.json
    filePath = path.join(ROOT_DIR, '..', req.url.substring(1));
  } else if (req.url.startsWith('/testcases/')) {
    // Handle test cases: /testcases/two-sum.json
    filePath = path.join(ROOT_DIR, '..', req.url.substring(1));
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
    return;
  }

  // Check if file exists and serve it
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('File Not Found');
      return;
    }

    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
        return;
      }

      try {
        // Parse and re-stringify to ensure valid JSON
        const jsonData = JSON.parse(data);
        res.writeHead(200, CORS_HEADERS);
        res.end(JSON.stringify(jsonData));
      } catch (parseError) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Invalid JSON in file');
      }
    });
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`S3 Development Server running at http://localhost:${PORT}/`);
  console.log('Press Ctrl+C to stop the server');
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down server...');
  server.close(() => {
    console.log('Server closed.');
    process.exit(0);
  });
});