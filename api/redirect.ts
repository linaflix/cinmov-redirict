import { VercelRequest, VercelResponse } from '@vercel/node';
import { redirectRules } from '../data/redirects';
import * as fs from 'fs';
import * as path from 'path';

// Création d'une Map pour une recherche ultra-rapide O(1)
const redirectMap = new Map<string, string>();
redirectRules.forEach(rule => redirectMap.set(rule.path.toLowerCase(), rule.destination));

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Récupérer le chemin demandé (sans les paramètres ?...)
  let reqPath = req.url?.split('?')[0].toLowerCase() || '';

  // 1. Vérification directe
  if (redirectMap.has(reqPath)) {
    return res.redirect(301, redirectMap.get(reqPath)!);
  }

  // 2. Fallback intelligent : Si Vercel a supprimé le .html, on essaie de l'ajouter
  if (!reqPath.endsWith('.html') && !reqPath.endsWith('/')) {
      const tryWithHtml = reqPath + '.html';
      if (redirectMap.has(tryWithHtml)) {
          return res.redirect(301, redirectMap.get(tryWithHtml)!);
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
}