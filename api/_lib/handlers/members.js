import { connectDB } from '../db.js';
import Member from '../models/Member.js';
import { getUserFromReq } from '../auth.js';
import { writeLog } from '../log.js';

// Lecture publique (page Flotte FCU accessible sans connexion) ; ecriture
// reservee aux comptes cadre/super_admin. L'id passe en query string
// (?id=...) plutot qu'en segment d'URL : plus fiable avec le routeur
// serverless generique de Vercel (voir commit "Fix broken id-routing").
export default async function handler(req, res) {
  await connectDB();
  const authUser = getUserFromReq(req);
  const id = req.query.id;

  if (!id) {
    if (req.method === 'GET') {
      const members = await Member.find({}).sort({ pseudo: 1 });
      res.status(200).json(members);
      return;
    }

    if (req.method === 'POST') {
      if (!authUser || !['cadre', 'super_admin'].includes(authUser.role)) {
        res.status(authUser ? 403 : 401).json({ error: authUser ? 'Acces refuse' : 'Non authentifie' });
        return;
      }

      const { pseudo, competences, commentaire, vaisseaux, roles, divisionActuelle, divisionSouhaitee } = req.body || {};
      if (!pseudo || !pseudo.trim()) {
        res.status(400).json({ error: 'Le pseudo est requis' });
        return;
      }

      const member = await Member.create({
        pseudo: pseudo.trim(),
        competences: competences || [],
        commentaire: commentaire || '',
        vaisseaux: vaisseaux || [],
        roles: roles || [],
        divisionActuelle: divisionActuelle || null,
        divisionSouhaitee: divisionSouhaitee || null,
      });

      await writeLog(authUser, 'CREATE_MEMBER', `membre:${member.pseudo}`, `Fiche creee (division: ${member.divisionActuelle || 'aucune'})`);

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

  if (!authUser || !['cadre', 'super_admin'].includes(authUser.role)) {
    res.status(authUser ? 403 : 401).json({ error: authUser ? 'Acces refuse' : 'Non authentifie' });
    return;
  }

  if (req.method === 'PUT') {
    const member = await Member.findById(id);
    if (!member) {
      res.status(404).json({ error: 'Membre introuvable' });
      return;
    }

    const before = { divisionActuelle: member.divisionActuelle, pseudo: member.pseudo };
    const { pseudo, competences, commentaire, vaisseaux, roles, divisionActuelle, divisionSouhaitee } = req.body || {};

    if (pseudo !== undefined) member.pseudo = pseudo.trim();
    if (competences !== undefined) member.competences = competences;
    if (commentaire !== undefined) member.commentaire = commentaire;
    if (vaisseaux !== undefined) member.vaisseaux = vaisseaux;
    if (roles !== undefined) member.roles = roles;
    if (divisionActuelle !== undefined) member.divisionActuelle = divisionActuelle;
    if (divisionSouhaitee !== undefined) member.divisionSouhaitee = divisionSouhaitee;

    await member.save();

    if (divisionActuelle !== undefined && divisionActuelle !== before.divisionActuelle) {
      await writeLog(
        authUser,
        'CHANGE_DIVISION',
        `membre:${before.pseudo}`,
        `Division ${before.divisionActuelle || 'aucune'} -> ${divisionActuelle || 'aucune'}`
      );
    } else {
      await writeLog(authUser, 'UPDATE_MEMBER', `membre:${before.pseudo}`, 'Fiche modifiee');
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
    await writeLog(authUser, 'DELETE_MEMBER', `membre:${member.pseudo}`, 'Fiche supprimee');
    res.status(200).json({ ok: true });
    return;
  }

  res.status(405).json({ error: 'Methode non autorisee' });
}
