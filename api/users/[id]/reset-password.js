import { connectDB } from '../../_lib/db.js';
import User from '../../_lib/models/User.js';
import { hashPassword } from '../../_lib/hash.js';
import { requireRole } from '../../_lib/auth.js';
import { writeLog } from '../../_lib/log.js';

export default requireRole(['super_admin'], async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Methode non autorisee' });
    return;
  }

  await connectDB();
  const { id } = req.query;
  const { newPassword } = req.body || {};

  if (!newPassword || newPassword.length < 6) {
    res.status(400).json({ error: 'Le nouveau mot de passe doit faire au moins 6 caracteres' });
    return;
  }

  const user = await User.findById(id);
  if (!user) {
    res.status(404).json({ error: 'Compte introuvable' });
    return;
  }

  user.passwordHash = await hashPassword(newPassword);
  await user.save();

  await writeLog(req.user, 'RESET_PASSWORD', `compte:${user.pseudo}`, 'Mot de passe reinitialise par le super admin');

  res.status(200).json({ ok: true });
});
