const fs = require('fs');
const path = require('path');
const { redirectRules } = require('../data/redirects');

// Création de la Map pour la performance
const map = new Map();
redirectRules.forEach(r => map.set(r.path.toLowerCase(), r.destination));

module.exports = (req, res) => {
  const urlPath = (req.url || '').split('?')[0].toLowerCase();

  // 1. Vérification directe
  if (map.has(urlPath)) {
    res.writeHead(301, { 'Location': map.get(urlPath) });
    res.end();
    return;
  }

  // 2. Fallback si .html manquant (ex: /film/123 au lieu de /film/123.html)
  if (!urlPath.endsWith('.html') && !urlPath.endsWith('/')) {
      const tryHtml = urlPath + '.html';
      if (map.has(tryHtml)) {
        res.writeHead(301, { 'Location': map.get(tryHtml) });
        res.end();
        return;
      }
  }

  // 3. Servir la 404 personnalisée
  res.statusCode = 404;
  res.setHeader('Content-Type', 'text/html');
  try {
    const errorPage = fs.readFileSync(path.join(__dirname, '../public/404.html'), 'utf8');
    res.end(errorPage);
  } catch (e) {
    res.end('<h1>404</h1><a href="https://mega.cinmov.com">Home</a>');
  }
};