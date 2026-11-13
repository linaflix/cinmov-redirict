import { VercelRequest, VercelResponse } from '@vercel/node';
import { redirectRules } from '../../../data/redirects';

// Création d'une Map pour recherche ultra-rapide O(1)
const redirectMap = new Map<string, string>();
redirectRules.forEach(rule => redirectMap.set(rule.original.toLowerCase(), rule.destination));

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const host = req.headers.host || '';
  const protocol = req.headers['x-forwarded-proto'] || 'https';
  const currentUrl = `${protocol}://${host}${req.url}`.toLowerCase();

  // Vérification exacte
  if (redirectMap.has(currentUrl)) {
    return res.redirect(301, redirectMap.get(currentUrl)!);
  }
  
  // Fallback vers la page d'accueil si non trouvé
  return res.redirect(302, 'https://mega.cinmov.com');
}