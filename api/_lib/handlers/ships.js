import { connectDB } from '../db.js';
import Ship from '../models/Ship.js';
import { getUserFromReq } from '../auth.js';
import { writeLog } from '../log.js';

const MAX_IMAGE_LENGTH = 1_500_000; // ~1.1 Mo decode, marge large sous la limite de payload Vercel

export default async function handler(req, res) {
  await connectDB();
  const authUser = getUserFromReq(req);
  const params = req.query.id;
  const id = Array.isArray(params) ? params[0] : params;

  if (!id) {
    if (req.method === 'GET') {
      const ships = await Ship.find({}).sort({ manufacturer: 1, nom: 1 });
      res.status(200).json(ships);
      return;
    }

    if (req.method === 'POST') {
      if (!authUser || !['cadre', 'super_admin'].includes(authUser.role)) {
        res.status(authUser ? 403 : 401).json({ error: authUser ? 'Acces refuse' : 'Non authentifie' });
        return;
      }

      const { manufacturer, nom, image, description, styleCombat, equipage } = req.body || {};
      if (!manufacturer || !nom || !nom.trim()) {
        res.status(400).json({ error: 'Marque et nom sont requis' });
        return;
      }
      if (image && image.length > MAX_IMAGE_LENGTH) {
        res.status(400).json({ error: 'Image trop lourde' });
        return;
      }

      const ship = await Ship.create({
        manufacturer,
        nom: nom.trim(),
        image: image || null,
        description: description || '',
        styleCombat: styleCombat || '',
        equipage: equipage || '',
      });

      await writeLog(authUser, 'CREATE_SHIP', `vaisseau:${ship.nom}`, `Ajoute au catalogue (${ship.manufacturer})`);

      res.status(201).json(ship);
      return;
    }

    res.status(405).json({ error: 'Methode non autorisee' });
    return;
  }

  if (req.method === 'GET') {
    const ship = await Ship.findById(id);
    if (!ship) {
      res.status(404).json({ error: 'Vaisseau introuvable' });
      return;
    }
    res.status(200).json(ship);
    return;
  }

  if (!authUser || !['cadre', 'super_admin'].includes(authUser.role)) {
    res.status(authUser ? 403 : 401).json({ error: authUser ? 'Acces refuse' : 'Non authentifie' });
    return;
  }

  if (req.method === 'PUT') {
    const ship = await Ship.findById(id);
    if (!ship) {
      res.status(404).json({ error: 'Vaisseau introuvable' });
      return;
    }

    const { manufacturer, nom, image, description, styleCombat, equipage } = req.body || {};
    if (image !== undefined && image && image.length > MAX_IMAGE_LENGTH) {
      res.status(400).json({ error: 'Image trop lourde' });
      return;
    }

    if (manufacturer !== undefined) ship.manufacturer = manufacturer;
    if (nom !== undefined) ship.nom = nom.trim();
    if (image !== undefined) ship.image = image || null;
    if (description !== undefined) ship.description = description;
    if (styleCombat !== undefined) ship.styleCombat = styleCombat;
    if (equipage !== undefined) ship.equipage = equipage;

    await ship.save();

    await writeLog(authUser, 'UPDATE_SHIP', `vaisseau:${ship.nom}`, 'Fiche vaisseau modifiee');

    res.status(200).json(ship);
    return;
  }

  if (req.method === 'DELETE') {
    const ship = await Ship.findByIdAndDelete(id);
    if (!ship) {
      res.status(404).json({ error: 'Vaisseau introuvable' });
      return;
    }
    await writeLog(authUser, 'DELETE_SHIP', `vaisseau:${ship.nom}`, 'Retire du catalogue');
    res.status(200).json({ ok: true });
    return;
  }

  res.status(405).json({ error: 'Methode non autorisee' });
}
