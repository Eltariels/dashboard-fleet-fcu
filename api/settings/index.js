import { connectDB } from '../_lib/db.js';
import Settings from '../_lib/models/Settings.js';
import { getUserFromReq } from '../_lib/auth.js';
import { writeLog } from '../_lib/log.js';

// Document singleton (un seul settings en base). Lecture publique (les
// couleurs de role s'appliquent aussi sur la page publique Flotte FCU).
export default async function handler(req, res) {
  await connectDB();

  if (req.method === 'GET') {
    let settings = await Settings.findOne({});
    if (!settings) settings = await Settings.create({});
    res.status(200).json(settings);
    return;
  }

  if (req.method === 'PUT') {
    const authUser = getUserFromReq(req);
    if (!authUser || !['cadre', 'super_admin'].includes(authUser.role)) {
      res.status(authUser ? 403 : 401).json({ error: authUser ? 'Acces refuse' : 'Non authentifie' });
      return;
    }

    const { roleColors } = req.body || {};
    let settings = await Settings.findOne({});
    if (!settings) settings = new Settings({});

    if (roleColors) {
      if (roleColors.chef_groupe) settings.roleColors.chef_groupe = roleColors.chef_groupe;
      if (roleColors.chef_division) settings.roleColors.chef_division = roleColors.chef_division;
      if (roleColors.officier) settings.roleColors.officier = roleColors.officier;
    }

    await settings.save();
    await writeLog(authUser, 'UPDATE_SETTINGS', 'settings:roleColors', 'Couleurs des roles mises a jour');

    res.status(200).json(settings);
    return;
  }

  res.status(405).json({ error: 'Methode non autorisee' });
}
