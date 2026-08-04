import { connectDB } from '../_lib/db.js';
import Division from '../_lib/models/Division.js';
import '../_lib/models/Member.js'; // requis par populate() ci-dessous
import { requireRole } from '../_lib/auth.js';

export default requireRole(null, async (req, res) => {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Methode non autorisee' });
    return;
  }

  await connectDB();
  const divisions = await Division.find({}).populate('responsableMemberId').populate('secondMemberId');
  res.status(200).json(divisions);
});
