import { connectDB } from '../_lib/db.js';
import User from '../_lib/models/User.js';
import { verifyPassword } from '../_lib/hash.js';
import { signToken, setAuthCookie } from '../_lib/auth.js';
import { writeLog } from '../_lib/log.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Methode non autorisee' });
    return;
  }

  const { pseudo, password } = req.body || {};
  if (!pseudo || !password) {
    res.status(400).json({ error: 'Pseudo et mot de passe requis' });
    return;
  }

  await connectDB();
  const user = await User.findOne({ pseudo: pseudo.trim() });
  if (!user) {
    res.status(401).json({ error: 'Identifiants invalides' });
    return;
  }

  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) {
    res.status(401).json({ error: 'Identifiants invalides' });
    return;
  }

  const token = signToken({ sub: user._id.toString(), pseudo: user.pseudo, role: user.role });
  setAuthCookie(res, token);

  await writeLog({ pseudo: user.pseudo, role: user.role }, 'LOGIN', `compte:${user.pseudo}`, 'Connexion reussie');

  res.status(200).json({ id: user._id, pseudo: user.pseudo, role: user.role });
}
