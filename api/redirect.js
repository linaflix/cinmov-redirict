const fs = require('fs');
const path = require('path');
const { redirectRules } = require('../data/redirects');

const map = new Map();
redirectRules.forEach(r => map.set(r.path.toLowerCase(), r.destination));

module.exports = (req, res) => {
  const urlPath = (req.url || '').split('?')[0].toLowerCase();

  if (map.has(urlPath)) {
    res.writeHead(301, { 'Location': map.get(urlPath) });
    res.end();
    return;
  }

  if (!urlPath.endsWith('.html') && !urlPath.endsWith('/')) {
      const tryHtml = urlPath + '.html';
      if (map.has(tryHtml)) {
        res.writeHead(301, { 'Location': map.get(tryHtml) });
        res.end();
        return;
      }
  }

  res.statusCode = 404;
  res.setHeader('Content-Type', 'text/html');
  try {
    const errorPage = fs.readFileSync(path.join(__dirname, '../public/404.html'), 'utf8');
    res.end(errorPage);
  } catch (e) {
    res.end('<h1>404</h1><a href="https://mega.cinmov.com">Home</a>');
  }
};