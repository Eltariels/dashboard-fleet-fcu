import { connectDB } from '../_lib/db.js';
import Ship from '../_lib/models/Ship.js';
import { requireRole } from '../_lib/auth.js';
import { writeLog } from '../_lib/log.js';

const MAX_IMAGE_LENGTH = 1_500_000; // ~1.1 Mo decode, marge large sous la limite de payload Vercel

export default requireRole(null, async (req, res) => {
  await connectDB();

  if (req.method === 'GET') {
    const ships = await Ship.find({}).sort({ manufacturer: 1, nom: 1 });
    res.status(200).json(ships);
    return;
  }

  if (req.method === 'POST') {
    if (!['cadre', 'super_admin'].includes(req.user.role)) {
      res.status(403).json({ error: 'Acces refuse' });
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

    await writeLog(req.user, 'CREATE_SHIP', `vaisseau:${ship.nom}`, `Ajoute au catalogue (${ship.manufacturer})`);

    res.status(201).json(ship);
    return;
  }

  res.status(405).json({ error: 'Methode non autorisee' });
});
