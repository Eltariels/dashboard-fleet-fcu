import { connectDB } from '../_lib/db.js';
import Member from '../_lib/models/Member.js';
import { requireRole } from '../_lib/auth.js';
import { writeLog } from '../_lib/log.js';

export default requireRole(null, async (req, res) => {
  await connectDB();
  const params = req.query.id;
  const id = Array.isArray(params) ? params[0] : params;

  if (!id) {
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
    return;
  }

  if (req.method === 'GET') {
    const member = await Member.findById(id);
    if (!member) {
      res.status(404).json({ error: 'Membre introuvable' });
      return;
    }
    res.status(200).json(member);
    return;
  }

  if (!['cadre', 'super_admin'].includes(req.user.role)) {
    res.status(403).json({ error: 'Acces refuse' });
    return;
  }

  if (req.method === 'PUT') {
    const member = await Member.findById(id);
    if (!member) {
      res.status(404).json({ error: 'Membre introuvable' });
      return;
    }

    const before = { divisionActuelle: member.divisionActuelle, pseudo: member.pseudo };
    const { pseudo, competences, commentaire, vaisseaux, divisionActuelle, divisionSouhaitee } = req.body || {};

    if (pseudo !== undefined) member.pseudo = pseudo.trim();
    if (competences !== undefined) member.competences = competences;
    if (commentaire !== undefined) member.commentaire = commentaire;
    if (vaisseaux !== undefined) member.vaisseaux = vaisseaux;
    if (divisionActuelle !== undefined) member.divisionActuelle = divisionActuelle;
    if (divisionSouhaitee !== undefined) member.divisionSouhaitee = divisionSouhaitee;

    await member.save();

    if (divisionActuelle !== undefined && divisionActuelle !== before.divisionActuelle) {
      await writeLog(
        req.user,
        'CHANGE_DIVISION',
        `membre:${before.pseudo}`,
        `Division ${before.divisionActuelle || 'aucune'} -> ${divisionActuelle || 'aucune'}`
      );
    } else {
      await writeLog(req.user, 'UPDATE_MEMBER', `membre:${before.pseudo}`, 'Fiche modifiee');
    }

    res.status(200).json(member);
    return;
  }

  if (req.method === 'DELETE') {
    const member = await Member.findByIdAndDelete(id);
    if (!member) {
      res.status(404).json({ error: 'Membre introuvable' });
      return;
    }
    await writeLog(req.user, 'DELETE_MEMBER', `membre:${member.pseudo}`, 'Fiche supprimee');
    res.status(200).json({ ok: true });
    return;
  }

  res.status(405).json({ error: 'Methode non autorisee' });
});
