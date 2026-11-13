import { VercelRequest, VercelResponse } from '@vercel/node';
import { redirectRules } from '../data/redirects';
import * as fs from 'fs';
import * as path from 'path';

const map = new Map();
redirectRules.forEach(r => map.set(r.original.toLowerCase(), r.destination));

export default async (req: VercelRequest, res: VercelResponse) => {
  const host = req.headers.host || '';
  const proto = req.headers['x-forwarded-proto'] || 'https';
  const url = `${proto}://${host}${req.url}`.toLowerCase();

  if (map.has(url)) {
    return res.redirect(301, map.get(url));
  }

  // Servir la 404 personnalisée
  res.statusCode = 404;
  res.setHeader('Content-Type', 'text/html');
  try {
    const p = path.join(__dirname, '../public/404.html');
    res.end(fs.readFileSync(p, 'utf8'));
  } catch (e) {
    res.end('<h1>404</h1><a href="https://mega.cinmov.com">Home</a>');
  }
};