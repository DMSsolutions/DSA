const http = require('http');
const fs = require('fs');
const path = require('path');

const port = Number(process.env.PORT || 4173);
const rootDir = process.cwd();

const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

function resolveSafePath(urlPath) {
  const decoded = decodeURIComponent(urlPath);
  const withoutQuery = decoded.split('?')[0].split('#')[0];
  const normalized = path.posix.normalize(withoutQuery);
  const cleaned = normalized.startsWith('/') ? normalized.slice(1) : normalized;
  const localPath = cleaned === '' ? 'index.html' : cleaned;
  const resolved = path.resolve(rootDir, localPath);

  if (!resolved.startsWith(rootDir)) {
    return null;
  }

  return resolved;
}

function send(res, statusCode, body, headers = {}) {
  res.writeHead(statusCode, {
    'Cache-Control': 'no-cache',
    ...headers,
  });
  res.end(body);
}

const server = http.createServer((req, res) => {
  if (!req.url) {
    send(res, 400, 'Bad Request', { 'Content-Type': 'text/plain; charset=utf-8' });
    return;
  }

  const filePath = resolveSafePath(req.url);
  if (!filePath) {
    send(res, 403, 'Forbidden', { 'Content-Type': 'text/plain; charset=utf-8' });
    return;
  }

  fs.stat(filePath, (statErr, stats) => {
    if (statErr) {
      send(res, 404, 'Not Found', { 'Content-Type': 'text/plain; charset=utf-8' });
      return;
    }

    if (stats.isDirectory()) {
      const indexCandidate = path.join(filePath, 'index.html');
      fs.stat(indexCandidate, (indexErr, indexStats) => {
        if (indexErr || !indexStats.isFile()) {
          send(res, 404, 'Not Found', { 'Content-Type': 'text/plain; charset=utf-8' });
          return;
        }

        const ext = '.html';
        res.writeHead(200, { 'Content-Type': contentTypes[ext] });
        fs.createReadStream(indexCandidate).pipe(res);
      });
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = contentTypes[ext] || 'application/octet-stream';

    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(port, '0.0.0.0', () => {
  console.log(`Server running at http://localhost:${port}/`);
  console.log(`Server running at http://127.0.0.1:${port}/`);
});

server.on('error', (err) => {
  console.error(err);
  process.exitCode = 1;
});
