import { VercelRequest, VercelResponse } from '@vercel/node';
import { redirectRules } from '../data/redirects';
import * as fs from 'fs';
import * as path from 'path';

const map = new Map();
redirectRules.forEach(r => map.set(r.path.toLowerCase(), r.destination));

export default async (req: VercelRequest, res: VercelResponse) => {
  // Récupérer l'URL brute
  let reqPath = req.url?.split('?')[0].toLowerCase() || '';

  // 1. Essai direct
  if (map.has(reqPath)) {
    return res.redirect(301, map.get(reqPath));
  }

  // 2. Fallback si Vercel a mangé le .html (ex: /film/123 au lieu de /film/123.html)
  if (!reqPath.endsWith('.html')) {
     const tryWithHtml = reqPath + '.html';
     if (map.has(tryWithHtml)) {
       return res.redirect(301, map.get(tryWithHtml));
     }
  }

  // 3. Si toujours rien, 404
  res.statusCode = 404;
  res.setHeader('Content-Type', 'text/html');
  try {
    const p = path.join(__dirname, '../public/404.html');
    res.end(fs.readFileSync(p, 'utf8'));
  } catch (e) {
    res.end('<h1>404</h1>');
  }
};