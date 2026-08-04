import Log from './models/Log.js';

export async function writeLog(user, action, cible = '', details = '') {
  await Log.create({
    accountPseudo: user?.pseudo || 'inconnu',
    role: user?.role || 'inconnu',
    action,
    cible,
    details,
  });
}
