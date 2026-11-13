const fs = require('fs');
const path = require('path');
const { redirectRules } = require('../data/redirects');

// Map pour recherche rapide O(1)
const map = new Map();
redirectRules.forEach(r => map.set(r.path.toLowerCase(), r.destination));

// Extraction d'ID robuste (Fallback dynamique)
function getIdFromUrl(url) {
  const cleanUrl = url.split('?')[0]; 
  const patterns = [
    /fiche-(\d+)\.html/i,
    /\/film\/(\d+)\.html/i,
    /\/(\d+)\.html$/i,
    /id=(\d+)/i
  ];
  for (const p of patterns) {
    const m = cleanUrl.match(p);
    if (m && m[1]) return parseInt(m[1], 10);
  }
  return null;
}

module.exports = (req, res) => {
  const reqUrl = req.url || '';
  const reqPath = reqUrl.split('?')[0].toLowerCase();
  const targetDomain = "https://mega.cinmov.com";

  // 1. Vérification Exacte (Priorité absolue)
  if (map.has(reqPath)) {
    res.writeHead(301, { 'Location': map.get(reqPath) });
    res.end();
    return;
  }

  // 2. Fallback Dynamique (Pour ?id= ou URLs non listées)
  const id = getIdFromUrl(reqUrl);
  if (id && id > 100) {
      const type = (/\/tv\/|\/serie\//i.test(reqUrl)) ? 'tv' : 'movie';
      res.writeHead(301, { 'Location': `${targetDomain}/${type}/${id}` });
      res.end();
      return;
  }

  // 3. 404 Personnalisée
  res.statusCode = 404;
  res.setHeader('Content-Type', 'text/html');
  try {
    const errorPage = fs.readFileSync(path.join(__dirname, '../public/404.html'), 'utf8');
    res.end(errorPage);
  } catch (e) {
    res.end('<h1>404</h1>');
  }
};