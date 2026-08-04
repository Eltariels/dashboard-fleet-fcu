# Dashboard Fleet FCU

Dashboard de suivi des membres de la branche **Fleet** de la corporation FCU (Star Citizen) : 3 divisions de specialite (Stryker, Rhino, Spectre) + les membres Fleet classiques sans division.

Stack 100% gratuite : React (Vite, JS pur) + fonctions serverless Vercel (`/api`) + MongoDB Atlas (cluster M0 gratuit).

## 1. Logos des divisions

Depose les 3 fichiers dans `public/logos/` avec exactement ces noms :
- `stryker.png`
- `rhino.png`
- `spectre.png`

Tant qu'un fichier n'est pas present, un badge colore de remplacement s'affiche automatiquement.

## 2. Creer la base de donnees (MongoDB Atlas, gratuit)

1. Va sur https://www.mongodb.com/cloud/atlas/register et cree un compte.
2. Cree un cluster **M0 (Free)**.
3. Dans "Database Access", cree un utilisateur avec mot de passe.
4. Dans "Network Access", autorise `0.0.0.0/0` (acces depuis partout — necessaire pour Vercel).
5. Recupere la chaine de connexion ("Connect" > "Drivers"), du style :
   `mongodb+srv://user:password@cluster.mongodb.net/dashboard_fleet`

## 3. Configuration locale

```bash
cp .env.example .env
```

Remplis `.env` avec :
- `MONGODB_URI` : la chaine de connexion Atlas
- `JWT_SECRET` : une longue chaine aleatoire (ex: genere avec `openssl rand -hex 32`)
- `SUPERADMIN_PSEUDO` / `SUPERADMIN_PASSWORD` : identifiants du compte super admin (uniquement utilises par le script de seed ci-dessous, jamais commit)

```bash
npm install
npm run seed:divisions
npm run seed:superadmin
```

## 4. Lancer en local

```bash
npm install -g vercel   # une seule fois
vercel dev
```

`vercel dev` sert le frontend (Vite) et les fonctions `/api` sur le meme port (evite tout probleme de cookies/CORS). Ouvre l'URL affichee (en general http://localhost:3000).

## 5. Deployer (Vercel + GitHub, gratuit)

1. Cree un repo GitHub et pousse ce projet :
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin <url-de-ton-repo>
   git push -u origin main
   ```
2. Va sur https://vercel.com, "Add New Project", importe le repo GitHub.
3. Dans les parametres du projet Vercel > "Environment Variables", ajoute :
   - `MONGODB_URI`
   - `JWT_SECRET`
   - (pas besoin de `SUPERADMIN_*` en prod, le seed se fait en local en pointant vers l'URI Atlas)
4. Deploie. Vercel te donne une URL du type `https://ton-projet.vercel.app`.

## Roles

| Role | Peut |
|---|---|
| `lecteur` | Voir le dashboard (lecture seule) |
| `cadre` | + Gerer les fiches membres (creer/modifier/supprimer, changer de division), voir les logs |
| `super_admin` | + Gerer les comptes (creer, changer role, reinitialiser mot de passe, supprimer) |

## Securite : mots de passe

Les mots de passe sont hashes (bcrypt) et **ne sont jamais stockes ni affiches en clair**, y compris pour le super admin. Pour depanner un membre qui a perdu son mot de passe, le super admin utilise "Reinitialiser le mot de passe" dans `/admin/comptes` : une nouvelle valeur est definie et affichee **une seule fois**, a communiquer directement au membre.

## Journal d'activite

Chaque action de mutation (connexion/deconnexion, creation/modification/suppression de membre, changement de division, gestion des comptes) est tracee dans `/admin/logs` avec : compte, role, action, cible, date et heure.
