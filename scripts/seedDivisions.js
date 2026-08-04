import 'dotenv/config';
import mongoose from 'mongoose';
import Division from '../api/_lib/models/Division.js';

const DIVISIONS = [
  { slug: 'stryker', nom: 'Groupe Stryker', devise: 'Strike fast. Hit hard.' },
  { slug: 'rhino', nom: 'Groupe Rhino', devise: 'First in - Last out' },
  { slug: 'spectre', nom: 'Groupe Spectre', devise: 'Snipe from the dark' },
];

async function main() {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI manquant dans .env');
  }

  await mongoose.connect(process.env.MONGODB_URI);

  for (const div of DIVISIONS) {
    await Division.findOneAndUpdate(
      { slug: div.slug },
      { $setOnInsert: div },
      { upsert: true, new: true }
    );
    console.log(`Division ${div.nom} OK`);
  }

  await mongoose.disconnect();
  console.log('Seed divisions termine.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
