import { connectDB } from '../_lib/db.js';
import User from '../_lib/models/User.js';
import { hashPassword } from '../_lib/hash.js';
import { requireRole } from '../_lib/auth.js';
import { writeLog } from '../_lib/log.js';

export default requireRole(['super_admin'], async (req, res) => {
  await connectDB();

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
});
