import { connectDB } from '../db.js';
import Division from '../models/Division.js';
import '../models/Member.js'; // requis par populate() ci-dessous
import { getUserFromReq } from '../auth.js';
import { writeLog } from '../log.js';

export default async function handler(req, res) {
  await connectDB();
  const authUser = getUserFromReq(req);
  const params = req.query.id;
  const id = Array.isArray(params) ? params[0] : params;

  if (!id) {
    if (req.method !== 'GET') {
      res.status(405).json({ error: 'Methode non autorisee' });
      return;
    }
    const divisions = await Division.find({}).populate('responsableMemberId').populate('secondMemberId');
    res.status(200).json(divisions);
    return;
  }

  if (!authUser || !['cadre', 'super_admin'].includes(authUser.role)) {
    res.status(authUser ? 403 : 401).json({ error: authUser ? 'Acces refuse' : 'Non authentifie' });
    return;
  }

  if (req.method !== 'PUT') {
    res.status(405).json({ error: 'Methode non autorisee' });
    return;
  }

  const division = await Division.findById(id);
  if (!division) {
    res.status(404).json({ error: 'Division introuvable' });
    return;
  }

  const { responsableMemberId, secondMemberId, devise } = req.body || {};
  if (responsableMemberId !== undefined) division.responsableMemberId = responsableMemberId || null;
  if (secondMemberId !== undefined) division.secondMemberId = secondMemberId || null;
  if (devise !== undefined) division.devise = devise;

  await division.save();
  await division.populate(['responsableMemberId', 'secondMemberId']);

  await writeLog(authUser, 'UPDATE_DIVISION', `division:${division.nom}`, 'Responsable/second mis a jour');

  res.status(200).json(division);
}
