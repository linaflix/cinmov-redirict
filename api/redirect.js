const fs = require('fs');
const path = require('path');
const { redirectRules } = require('../data/redirects');

// Fonction pour extraire l'ID d'une URL (copie de la logique PHP)
function getIdFromUrl(url) {
    const patterns = [
        /fiche-(\d+)\.html/i,
        /film\/(\d+)\.html/i,
        /id=(\d+)/i,
        /film\/(\d+)/i
    ];
    for (const p of patterns) {
        const m = url.match(p);
        if (m) return parseInt(m[1]);
    }
    return null;
}

function getTypeFromUrl(url) {
    return (/\/tv\/|\/serie\/|\/series\//i.test(url)) ? 'tv' : 'movie';
}

module.exports = (req, res) => {
  // Récupérer l'URL complète demandée (path + query)
  const fullUrl = (req.url || '').toLowerCase();
  const targetDomain = "https://mega.cinmov.com";

  // 1. Essayer de trouver une correspondance exacte dans la liste générée
  const exactMatch = redirectRules.find(r => r.pattern.toLowerCase() === fullUrl || r.path.toLowerCase() === fullUrl.split('?')[0]);
  
  if (exactMatch) {
      res.writeHead(301, { 'Location': exactMatch.destination });
      res.end();
      return;
  }

  // 2. Si pas de match exact, essayer d'extraire l'ID dynamiquement (Fallback universel)
  const id = getIdFromUrl(fullUrl);
  if (id) {
      const type = getTypeFromUrl(fullUrl);
      const newUrl = `${targetDomain}/${type}/${id}`;
      res.writeHead(301, { 'Location': newUrl });
      res.end();
      return;
  }

  // 3. 404
  res.statusCode = 404;
  res.setHeader('Content-Type', 'text/html');
  try {
    const errorPage = fs.readFileSync(path.join(__dirname, '../public/404.html'), 'utf8');
    res.end(errorPage);
  } catch (e) {
    res.end('<h1>404</h1><a href="https://mega.cinmov.com">Home</a>');
  }
};