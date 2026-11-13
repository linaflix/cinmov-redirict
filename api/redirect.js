const fs = require('fs');
const path = require('path');
const { redirectRules } = require('../data/redirects');

// Création d'une Map pour une recherche ultra-rapide O(1)
const map = new Map();
redirectRules.forEach(rule => map.set(rule.path.toLowerCase(), rule.destination));

module.exports = (req, res) => {
  // Récupérer le chemin demandé (sans les paramètres ?...)
  let reqPath = (req.url || '').split('?')[0].toLowerCase();

  // 1. Vérification directe
  if (map.has(reqPath)) {
    res.writeHead(301, { 'Location': map.get(reqPath) });
    res.end();
    return;
  }

  // 2. Fallback intelligent : Si Vercel a supprimé le .html, on essaie de l'ajouter
  if (!reqPath.endsWith('.html') && !reqPath.endsWith('/')) {
      const tryWithHtml = reqPath + '.html';
      if (map.has(tryWithHtml)) {
          res.writeHead(301, { 'Location': map.get(tryWithHtml) });
          res.end();
          return;
      }
  }

  // 3. Si aucune correspondance, servir la page 404 personnalisée
  res.statusCode = 404;
  res.setHeader('Content-Type', 'text/html');
  
  try {
      const errorPagePath = path.join(__dirname, '../public/404.html');
      const errorPage = fs.readFileSync(errorPagePath, 'utf8');
      res.end(errorPage);
  } catch (e) {
      res.end('<h1>404 Not Found</h1><a href="https://mega.cinmov.com">Home</a>');
  }
};