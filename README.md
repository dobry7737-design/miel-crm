# AAM — Assistances Assurances Mali

Plateforme de courtage en assurances (Next.js + Prisma + SQLite).

## Prérequis

- Node.js 20+
- npm

## Configuration

Variables dans `.env` :

```
DATABASE_URL="file:../db/custom.db"
AUTH_SECRET="aam-dev-secret-change-me-in-production-32chars"
```

## Base de données

```bash
npx prisma db push
npx tsx prisma/seed.ts
```

Le seed charge des **données métier dynamiques** (compagnies, produits, devis, contrats, sinistres, paiements) en base Prisma — l’UI les lit via `/api`.

### Comptes bootstrap (mots de passe bcrypt)

| Email | Mot de passe | Rôle |
|-------|--------------|------|
| `contact@aamassistances.com` | `Oumartidiani7@` | Administrateur Principal |
| `agent@aam.ml` | `Agent@AAM2026!` | Agent Courtier |
| `client@aam.ml` | `Client@AAM2026!` | Client |
| `sinistres@aam.ml` | `Gest@AAM2026!` | Gestionnaire Sinistres |
| `partenaire@nsia.ml` | `Part@AAM2026!` | Correspondant NSIA |

Changez ces mots de passe en production.

## Démarrage

```bash
npm run dev
```

Ouvrir http://localhost:3000

## Auth

- Login : `POST /api/auth/login` (bcrypt + cookie JWT httpOnly `aam-session`)
- Session : `GET /api/auth/me`
- Logout : `POST /api/auth/logout`
- Les routes `/api/*` (sauf health + login) exigent le cookie de session
