import { connectDB } from '../_lib/db.js';
import User from '../_lib/models/User.js';
import { hashPassword, verifyPassword } from '../_lib/hash.js';
import { requireRole } from '../_lib/auth.js';
import { writeLog } from '../_lib/log.js';

export default requireRole(null, async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Methode non autorisee' });
    return;
  }

  const { currentPassword, newPassword } = req.body || {};
  if (!currentPassword || !newPassword) {
    res.status(400).json({ error: 'Mot de passe actuel et nouveau mot de passe requis' });
    return;
  }
  if (newPassword.length < 6) {
    res.status(400).json({ error: 'Le nouveau mot de passe doit faire au moins 6 caracteres' });
    return;
  }

  await connectDB();
  const user = await User.findById(req.user.id);
  if (!user) {
    res.status(404).json({ error: 'Compte introuvable' });
    return;
  }

  const ok = await verifyPassword(currentPassword, user.passwordHash);
  if (!ok) {
    res.status(401).json({ error: 'Mot de passe actuel incorrect' });
    return;
  }

  user.passwordHash = await hashPassword(newPassword);
  await user.save();

  await writeLog(req.user, 'CHANGE_PASSWORD', `compte:${user.pseudo}`, 'Changement de son propre mot de passe');

  res.status(200).json({ ok: true });
});
