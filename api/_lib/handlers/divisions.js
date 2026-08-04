import { connectDB } from '../db.js';
import Division from '../models/Division.js';
import '../models/Member.js'; // requis par populate() ci-dessous
import { requireRole } from '../auth.js';
import { writeLog } from '../log.js';

export default requireRole(null, async (req, res) => {
  await connectDB();
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

  if (!['cadre', 'super_admin'].includes(req.user.role)) {
    res.status(403).json({ error: 'Acces refuse' });
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

  await writeLog(req.user, 'UPDATE_DIVISION', `division:${division.nom}`, 'Responsable/second mis a jour');

  res.status(200).json(division);
});
