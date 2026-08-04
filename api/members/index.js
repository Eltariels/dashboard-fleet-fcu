import { connectDB } from '../_lib/db.js';
import Member from '../_lib/models/Member.js';
import { requireRole } from '../_lib/auth.js';
import { writeLog } from '../_lib/log.js';

export default requireRole(null, async (req, res) => {
  await connectDB();

  if (req.method === 'GET') {
    const members = await Member.find({}).sort({ pseudo: 1 });
    res.status(200).json(members);
    return;
  }

  if (req.method === 'POST') {
    if (!['cadre', 'super_admin'].includes(req.user.role)) {
      res.status(403).json({ error: 'Acces refuse' });
      return;
    }

    const { pseudo, competences, commentaire, vaisseaux, divisionActuelle, divisionSouhaitee } = req.body || {};
    if (!pseudo || !pseudo.trim()) {
      res.status(400).json({ error: 'Le pseudo est requis' });
      return;
    }

    const member = await Member.create({
      pseudo: pseudo.trim(),
      competences: competences || [],
      commentaire: commentaire || '',
      vaisseaux: vaisseaux || [],
      divisionActuelle: divisionActuelle || null,
      divisionSouhaitee: divisionSouhaitee || null,
    });

    await writeLog(req.user, 'CREATE_MEMBER', `membre:${member.pseudo}`, `Fiche creee (division: ${member.divisionActuelle || 'aucune'})`);

    res.status(201).json(member);
    return;
  }

  res.status(405).json({ error: 'Methode non autorisee' });
});
