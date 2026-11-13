import { VercelRequest, VercelResponse } from '@vercel/node';
import { redirectRules } from '../../../data/redirects';
import * as fs from 'fs';
import * as path from 'path';

const redirectMap = new Map<string, string>();
redirectRules.forEach(rule => redirectMap.set(rule.original.toLowerCase(), rule.destination));

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const host = req.headers.host || '';
  const protocol = req.headers['x-forwarded-proto'] || 'https';
  const currentUrl = `${protocol}://${host}${req.url}`.toLowerCase();

  // 1. Vérification exacte dans la liste
  if (redirectMap.has(currentUrl)) {
    return res.redirect(301, redirectMap.get(currentUrl)!);
  }
  
  // 2. Si non trouvé, servir la page 404 personnalisée
  res.statusCode = 404;
  res.setHeader('Content-Type', 'text/html');
  
  try {
      const errorPagePath = path.join(__dirname, '../../../public/404.html');
      const errorPage = fs.readFileSync(errorPagePath, 'utf8');
      res.end(errorPage);
  } catch (e) {
      res.end('<h1>404 - Not Found</h1><p><a href="https://mega.cinmov.com">Retour à l\'accueil</a></p>');
  }
}