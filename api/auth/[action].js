import { connectDB } from '../_lib/db.js';
import User from '../_lib/models/User.js';
import { hashPassword, verifyPassword } from '../_lib/hash.js';
import { signToken, setAuthCookie, clearAuthCookie, getUserFromReq } from '../_lib/auth.js';
import { writeLog } from '../_lib/log.js';

// Regroupe login/logout/me/change-password dans une seule fonction serverless
// (le plan gratuit Vercel limite a 12 fonctions par deploiement).
export default async function handler(req, res) {
  const { action } = req.query;

  if (action === 'login') return handleLogin(req, res);
  if (action === 'register') return handleRegister(req, res);
  if (action === 'logout') return handleLogout(req, res);
  if (action === 'me') return handleMe(req, res);
  if (action === 'change-password') return handleChangePassword(req, res);

  res.status(404).json({ error: 'Route API introuvable' });
}

async function handleLogin(req, res) {
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

  if (user.status !== 'active') {
    res.status(403).json({ error: 'Compte en attente de validation par un administrateur' });
    return;
  }

  const token = signToken({ sub: user._id.toString(), pseudo: user.pseudo, role: user.role });
  setAuthCookie(res, token);

  await writeLog({ pseudo: user.pseudo, role: user.role }, 'LOGIN', `compte:${user.pseudo}`, 'Connexion reussie');

  res.status(200).json({ id: user._id, pseudo: user.pseudo, role: user.role });
}

async function handleRegister(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Methode non autorisee' });
    return;
  }

  const { pseudo, password } = req.body || {};
  if (!pseudo || !pseudo.trim() || !password) {
    res.status(400).json({ error: 'Pseudo et mot de passe requis' });
    return;
  }
  if (password.length < 6) {
    res.status(400).json({ error: 'Le mot de passe doit faire au moins 6 caracteres' });
    return;
  }

  await connectDB();
  const existing = await User.findOne({ pseudo: pseudo.trim() });
  if (existing) {
    res.status(409).json({ error: 'Ce pseudo est deja utilise' });
    return;
  }

  const passwordHash = await hashPassword(password);
  const user = await User.create({ pseudo: pseudo.trim(), passwordHash, role: 'cadre', status: 'pending' });

  await writeLog(
    { pseudo: user.pseudo, role: user.role },
    'REGISTER_REQUEST',
    `compte:${user.pseudo}`,
    'Demande de creation de compte cadre (en attente de validation)'
  );

  res.status(201).json({ ok: true });
}

async function handleLogout(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Methode non autorisee' });
    return;
  }

  const user = getUserFromReq(req);
  clearAuthCookie(res);

  if (user) {
    await connectDB();
    await writeLog(user, 'LOGOUT', `compte:${user.pseudo}`, 'Deconnexion');
  }

  res.status(200).json({ ok: true });
}

async function handleMe(req, res) {
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

async function handleChangePassword(req, res) {
  const authUser = getUserFromReq(req);
  if (!authUser) {
    res.status(401).json({ error: 'Non authentifie' });
    return;
  }

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
  const user = await User.findById(authUser.id);
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

  await writeLog(authUser, 'CHANGE_PASSWORD', `compte:${user.pseudo}`, 'Changement de son propre mot de passe');

  res.status(200).json({ ok: true });
}
