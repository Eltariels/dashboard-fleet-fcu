import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../api/_lib/models/User.js';
import { hashPassword } from '../api/_lib/hash.js';

async function main() {
  const { MONGODB_URI, SUPERADMIN_PSEUDO, SUPERADMIN_PASSWORD } = process.env;

  if (!MONGODB_URI) throw new Error('MONGODB_URI manquant dans .env');
  if (!SUPERADMIN_PSEUDO || !SUPERADMIN_PASSWORD) {
    throw new Error('SUPERADMIN_PSEUDO et SUPERADMIN_PASSWORD requis dans .env');
  }

  await mongoose.connect(MONGODB_URI);

  const existing = await User.findOne({ pseudo: SUPERADMIN_PSEUDO });
  if (existing) {
    if (existing.role !== 'super_admin') {
      existing.role = 'super_admin';
      await existing.save();
      console.log(`Compte ${SUPERADMIN_PSEUDO} deja existant : role remis a super_admin.`);
    } else {
      console.log(`Compte ${SUPERADMIN_PSEUDO} deja super_admin, rien a faire.`);
    }
    console.log('Le mot de passe existant n\'a pas ete modifie (utilise l\'interface admin pour le changer).');
  } else {
    const passwordHash = await hashPassword(SUPERADMIN_PASSWORD);
    await User.create({ pseudo: SUPERADMIN_PSEUDO, passwordHash, role: 'super_admin' });
    console.log(`Compte super_admin ${SUPERADMIN_PSEUDO} cree.`);
  }

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
