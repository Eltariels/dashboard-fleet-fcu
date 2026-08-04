import 'dotenv/config';
import mongoose from 'mongoose';
import Ship from '../api/_lib/models/Ship.js';

// Marque + nom uniquement : description / style de combat / equipage / image
// sont a completer via l'onglet Vaisseaux (evite d'inventer des donnees de jeu).
const SHIPS = [
  { manufacturer: 'aegis', nom: 'Idris-P' },
  { manufacturer: 'aegis', nom: 'Idris-K' },
  { manufacturer: 'aegis', nom: 'Idris-T' },
  { manufacturer: 'aegis', nom: 'Idris-M' },
  { manufacturer: 'rsi', nom: 'Perseus' },
  { manufacturer: 'rsi', nom: 'Polaris' },
  { manufacturer: 'aegis', nom: 'Hammerhead' },
  { manufacturer: 'aegis', nom: 'Tiburon' },
  { manufacturer: 'anvil', nom: 'Paladin' },
];

async function main() {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI manquant dans .env');
  }

  await mongoose.connect(process.env.MONGODB_URI);

  for (const ship of SHIPS) {
    await Ship.findOneAndUpdate(
      { manufacturer: ship.manufacturer, nom: ship.nom },
      { $setOnInsert: ship },
      { upsert: true, new: true }
    );
    console.log(`Vaisseau ${ship.nom} OK`);
  }

  await mongoose.disconnect();
  console.log('Seed vaisseaux termine.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
