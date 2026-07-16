# EduFlow Academy — site 3D interactif

Site Next.js pour EduFlow Academy : bâtiment en coupe isométrique et interactif (React
Three Fiber), planning façon Outlook par étage, fiches cours/professeur/élèves,
tableau de bord admin, et base de données réelle (Postgres + Prisma).

## ⚠️ Important — build non vérifié dans cet environnement

Ce projet a été entièrement écrit dans un environnement sandbox dont l'accès réseau
est restreint (le registre npm y est bloqué). **Je n'ai donc pas pu exécuter
`npm install` ni `next build` pour vérifier que tout compile.** Le code suit des
patterns standards (Next.js 14 App Router, Prisma, NextAuth, React Three Fiber) et a
été relu avec soin, mais il faudra lancer l'installation sur ta machine et corriger
d'éventuelles petites erreurs de compilation (versions de dépendances, typos) au
premier `npm run dev`. Dis-moi si tu rencontres une erreur, je t'aiderai à la corriger.

## Démarrage

Le projet utilise Postgres (même en local, pour que le passage en ligne soit
transparent). Crée un projet gratuit sur [neon.tech](https://neon.tech) (30 secondes,
aucune carte bancaire) et copie l'URL de connexion qu'il te donne.

```bash
cd eduflow-academy
cp .env.example .env
# colle ton URL Neon dans DATABASE_URL, dans .env
npm install
npm run db:push      # crée les tables dans la base à partir du schéma Prisma
npm run db:seed       # remplit la base avec le bâtiment, les cours, profs et élèves de démo
npm run dev
```

Ouvre http://localhost:3000

Connexion admin (créée par le seed) :
- Email : `admin@eduflow.academy`
- Mot de passe : `admin123`
(modifiable via `ADMIN_EMAIL` / `ADMIN_PASSWORD` dans `.env` avant le seed)

## Ce qui est implémenté

- **Bâtiment 3D en coupe** (`src/components/Building3D.tsx`, `Floor3D.tsx`,
  `FloorProps.tsx`) : sous-sol, rez-de-chaussée/accueil, 2 mezzanines admin, et les
  4 étages (informatique, accessible, langues x2), avec survol (élévation + halo de
  couleur), clic (ouverture du planning), légère rotation ±10° qui suit la souris, et
  couleur d'occupation calculée en direct depuis la base de données.
- **Planning façon Outlook** (`WeeklyCalendar.tsx`) : vue semaine, colonnes = jours,
  lignes = heures, événements colorés par type de formation, navigation de semaine.
- **Fiche cours** (`CourseDetailDrawer.tsx`) avec fiche professeur, infos salle
  (équipements, capacité, statut) et tableau des élèves (recherche, tri, filtre,
  présence, paiement).
- **Recherche globale** de formation qui met en évidence l'étage correspondant.
- **Tableau de bord admin** (`/admin`, protégé par NextAuth) avec statistiques et
  graphiques (recharts), et un formulaire pour réserver un nouveau créneau dans une
  salle libre.
- **Mode clair/sombre** persistant.
- **Mises à jour sans rechargement** : les données sont revalidées automatiquement
  (SWR, toutes les 10–15s) et immédiatement après chaque action admin (ajout de
  cours, etc.). Ce n'est pas du push temps réel par websocket — si tu veux du
  vrai push instantané multi-utilisateurs, on peut ajouter Socket.io ou Pusher
  ensuite.

## Google Calendar / Outlook

Les routes `/api/integrations/google` et `/api/integrations/outlook` implémentent
un vrai flux OAuth2, mais **elles ont besoin de tes propres identifiants** :

- Google : créer un projet sur [Google Cloud Console](https://console.cloud.google.com),
  activer l'API Calendar, créer un « OAuth Client ID » (type Web), ajouter
  `http://localhost:3000/api/integrations/google` comme URI de redirection, puis
  renseigner `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` dans `.env`.
- Outlook : créer une « App registration » sur [Azure Portal](https://portal.azure.com),
  ajouter `http://localhost:3000/api/integrations/outlook` comme URI de
  redirection, autoriser le scope `Calendars.ReadWrite`, puis renseigner
  `MICROSOFT_CLIENT_ID` / `MICROSOFT_CLIENT_SECRET` dans `.env`.

Sans ces clés, les boutons de connexion dans `/admin` renverront une erreur claire
plutôt qu'un plantage silencieux.

## Structure

```
prisma/schema.prisma      modèle de données (étages, salles, cours, profs, élèves)
prisma/seed.ts             données de démonstration
src/app/                   pages (App Router) + routes API
src/components/            composants React (3D, calendrier, drawers, dashboard)
src/lib/                   Prisma client, auth, logique d'occupation, store Zustand
src/hooks/useData.ts       hooks SWR pour appeler l'API
```

## Mettre le site en ligne gratuitement (Vercel + Neon)

C'est la combinaison la plus simple et la plus durable en gratuit pour un projet
Next.js : **Vercel** (hébergement, créé par l'équipe Next.js) + **Neon**
(Postgres serverless, gratuit sans limite de temps). Aucune carte bancaire requise
pour démarrer.

1. **Créer un dépôt GitHub** avec ce projet (dézippé), puis `git init`, `git add .`,
   `git commit -m "EduFlow Academy"`, et pousser sur un nouveau repo GitHub.
2. **Neon** (si pas déjà fait pour le développement local) : [neon.tech](https://neon.tech)
   → créer un projet → copier l'URL de connexion.
3. Sur **[vercel.com](https://vercel.com)** : « Add New Project » → importer le
   dépôt GitHub. Vercel détecte Next.js automatiquement.
4. Avant de déployer, dans **Environment Variables**, ajouter :
   - `DATABASE_URL` → l'URL Neon
   - `NEXTAUTH_SECRET` → une valeur générée avec `openssl rand -base64 32`
   - `NEXTAUTH_URL` → l'URL Vercel (ex. `https://eduflow-academy.vercel.app`,
     visible après le premier déploiement — à ajouter/mettre à jour ensuite)
   - `ADMIN_EMAIL`, `ADMIN_PASSWORD` → tes identifiants admin définitifs
5. **Déployer.** Vercel construit et publie le site (build automatique via
   `postinstall: prisma generate`, déjà configuré dans `package.json`).
6. **Créer les tables + données de démo sur la base de prod** : en local, avec
   `DATABASE_URL` pointé vers Neon dans `.env`, lance `npm run db:push` puis
   `npm run db:seed` une fois (la même base Neon sert au local et à la prod).

Le site est alors accessible publiquement sur l'URL `*.vercel.app` (un nom de
domaine personnalisé peut être ajouté gratuitement aussi, dans Vercel → Domains).

À noter : le plan gratuit « Hobby » de Vercel est prévu pour un usage personnel/non
commercial. Si EduFlow Academy est exploité comme un vrai centre de formation
payant, il vaudra la peine de passer sur le plan Pro (~20$/mois) à terme — mais
pour lancer et tester le site, le plan gratuit suffit largement.
