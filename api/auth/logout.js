import { clearAuthCookie, getUserFromReq } from '../_lib/auth.js';
import { writeLog } from '../_lib/log.js';
import { connectDB } from '../_lib/db.js';

export default async function handler(req, res) {
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
