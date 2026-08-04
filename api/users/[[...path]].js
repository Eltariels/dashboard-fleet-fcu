import { connectDB } from '../_lib/db.js';
import User from '../_lib/models/User.js';
import { hashPassword } from '../_lib/hash.js';
import { requireRole } from '../_lib/auth.js';
import { writeLog } from '../_lib/log.js';

// path: undefined -> /api/users, [id] -> /api/users/:id, [id, 'reset-password'] -> /api/users/:id/reset-password
export default requireRole(['super_admin'], async (req, res) => {
  await connectDB();
  const parts = req.query.path;
  const segments = Array.isArray(parts) ? parts : parts ? [parts] : [];
  const [id, subAction] = segments;

  if (!id) {
    if (req.method === 'GET') {
      const users = await User.find({}, '-passwordHash').sort({ pseudo: 1 });
      res.status(200).json(users);
      return;
    }

    if (req.method === 'POST') {
      const { pseudo, password, role } = req.body || {};
      if (!pseudo || !password) {
        res.status(400).json({ error: 'Pseudo et mot de passe requis' });
        return;
      }
      if (password.length < 6) {
        res.status(400).json({ error: 'Le mot de passe doit faire au moins 6 caracteres' });
        return;
      }
      if (!['super_admin', 'cadre', 'lecteur'].includes(role)) {
        res.status(400).json({ error: 'Role invalide' });
        return;
      }

      const existing = await User.findOne({ pseudo: pseudo.trim() });
      if (existing) {
        res.status(409).json({ error: 'Ce pseudo est deja utilise' });
        return;
      }

      const passwordHash = await hashPassword(password);
      const user = await User.create({ pseudo: pseudo.trim(), passwordHash, role });

      await writeLog(req.user, 'CREATE_USER', `compte:${user.pseudo}`, `Role initial: ${role}`);

      const { passwordHash: _omit, ...safe } = user.toObject();
      res.status(201).json(safe);
      return;
    }

    res.status(405).json({ error: 'Methode non autorisee' });
    return;
  }

  if (subAction === 'reset-password') {
    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Methode non autorisee' });
      return;
    }

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
    return;
  }

  if (req.method === 'PUT') {
    const user = await User.findById(id);
    if (!user) {
      res.status(404).json({ error: 'Compte introuvable' });
      return;
    }

    const before = { pseudo: user.pseudo, role: user.role };
    const { pseudo, role } = req.body || {};

    if (pseudo !== undefined && pseudo.trim() !== user.pseudo) {
      const existing = await User.findOne({ pseudo: pseudo.trim() });
      if (existing) {
        res.status(409).json({ error: 'Ce pseudo est deja utilise' });
        return;
      }
      user.pseudo = pseudo.trim();
    }

    if (role !== undefined && role !== user.role) {
      if (!['super_admin', 'cadre', 'lecteur'].includes(role)) {
        res.status(400).json({ error: 'Role invalide' });
        return;
      }
      if (user._id.toString() === req.user.id && role !== 'super_admin') {
        res.status(400).json({ error: 'Impossible de retirer son propre role super_admin' });
        return;
      }
      user.role = role;
    }

    await user.save();

    const changes = [];
    if (before.pseudo !== user.pseudo) changes.push(`pseudo: ${before.pseudo} -> ${user.pseudo}`);
    if (before.role !== user.role) changes.push(`role: ${before.role} -> ${user.role}`);

    await writeLog(req.user, before.role !== user.role ? 'CHANGE_ROLE' : 'UPDATE_USER', `compte:${before.pseudo}`, changes.join(', ') || 'Aucun changement');

    const { passwordHash: _omit, ...safe } = user.toObject();
    res.status(200).json(safe);
    return;
  }

  if (req.method === 'DELETE') {
    if (id === req.user.id) {
      res.status(400).json({ error: 'Impossible de supprimer son propre compte' });
      return;
    }
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      res.status(404).json({ error: 'Compte introuvable' });
      return;
    }
    await writeLog(req.user, 'DELETE_USER', `compte:${user.pseudo}`, 'Compte supprime');
    res.status(200).json({ ok: true });
    return;
  }

  res.status(405).json({ error: 'Methode non autorisee' });
});
