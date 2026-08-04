import { connectDB } from '../_lib/db.js';
import Division from '../_lib/models/Division.js';
import '../_lib/models/Member.js'; // requis par populate() ci-dessous
import { requireRole } from '../_lib/auth.js';
import { writeLog } from '../_lib/log.js';

export default requireRole(['cadre', 'super_admin'], async (req, res) => {
  if (req.method !== 'PUT') {
    res.status(405).json({ error: 'Methode non autorisee' });
    return;
  }

  await connectDB();
  const { id } = req.query;
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
