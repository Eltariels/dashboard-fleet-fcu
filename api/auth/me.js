import { getUserFromReq } from '../_lib/auth.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Methode non autorisee' });
    return;
  }

  const user = getUserFromReq(req);
  if (!user) {
    res.status(401).json({ error: 'Non authentifie' });
    return;
  }

  res.status(200).json(user);
}
