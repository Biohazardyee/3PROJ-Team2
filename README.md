# Melodia

> Plateforme sociale musicale — découvrez, critiquez et partagez de la musique avec votre communauté.

---

## Sommaire

- [Présentation](#présentation)
- [Stack technique](#stack-technique)
- [Architecture](#architecture)
- [Prérequis](#prérequis)
- [Installation](#installation)
- [Variables d'environnement](#variables-denvironnement)
- [Déploiement Docker](#déploiement-docker)
- [Fonctionnalités](#fonctionnalités)
- [Structure du projet](#structure-du-projet)
- [Équipe](#équipe)

---

## Présentation

**Melodia** est une application full-stack permettant aux utilisateurs de :

- Rechercher des albums et artistes via des APIs musicales externes
- Rédiger des avis et noter des albums (1-5 étoiles)
- Commenter et liker les avis d'autres membres
- Créer et gérer des playlists personnelles
- Suivre d'autres utilisateurs et consulter un fil d'actualité
- Échanger via une messagerie instantanée
- Suivre ses statistiques musicales personnelles
- Recevoir des notifications en temps réel

---

## Stack technique

| Couche | Technologies |
|--------|-------------|
| **Backend** | Node.js 20, Express 5, TypeScript, Prisma 7, PostgreSQL 18 |
| **Web** | React 19, Vite 7, TypeScript, Tailwind CSS 4, React Router 7 |
| **Mobile** | React Native 0.81, Expo 54, Expo Router 6, TypeScript |
| **Temps réel** | Socket.io 4.8 |
| **Auth** | JWT, Passport.js (OAuth : Google, Discord) |
| **i18n** | i18next (5 langues : FR, EN, DE, IT, ES) |
| **Déploiement** | Docker, Cloudflare Tunnel |

---

## Architecture

```
3PROJ-Team2/
├── backend/                  # API REST + WebSocket (Express / Prisma / PostgreSQL)
├── clients/
│   ├── web/                  # Application React (Vite + Tailwind)
│   └── mobile/               # Application React Native (Expo)
├── docs/                     # Documentation technique
├── docker-compose.yml        # Orchestration des services
└── README.md
```

### Services Docker

| Service | Description | Port |
|---------|-------------|------|
| `db` | PostgreSQL 18.1 | 5432 |
| `api` | Backend Express | 3000 |
| `frontend` | Web React (Nginx) | 80 |
| `cloudflare-tunnel` | Reverse proxy | — |

---

## Prérequis

- [Node.js](https://nodejs.org/) ≥ 20
- [Docker](https://www.docker.com/) & Docker Compose
- [Expo CLI](https://docs.expo.dev/get-started/installation/) (pour le mobile)
- PostgreSQL (si lancement sans Docker)

---

## Installation

### 1. Cloner le dépôt

```bash
git clone https://github.com/<org>/3PROJ-Team2.git
cd 3PROJ-Team2
```

### 2. Installer les dépendances

```bash
# Backend
cd backend && npm install

# Web
cd ../clients/web && npm install

# Mobile
cd ../mobile && npm install
```

### 3. Configurer Prisma

```bash
cd backend
npx prisma generate
npx prisma migrate deploy
```

---

## Variables d'environnement

### Backend (`backend/.env`)

```env
DATABASE_URL=postgresql://USER:PASSWORD@localhost:5432/melodia
PORT=3000
JWT_SECRET=your_jwt_secret

# OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
DISCORD_CLIENT_ID=
DISCORD_CLIENT_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
FACEBOOK_CLIENT_ID=
FACEBOOK_CLIENT_SECRET=

# URLs
WEB_CLIENT_URL=http://localhost:5173
MOBILE_REDIRECT_URI=exp://localhost:8081
```

### Web (`clients/web/.env`)

```env
VITE_API_URL=http://localhost:3000
```

### Mobile (`clients/mobile/.env`)

```env
EXPO_PUBLIC_API_URL=http://localhost:3000
```

### Docker (racine `.env`)

```env
POSTGRES_DB=melodia
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_password
CLOUDFLARE_TUNNEL_TOKEN=your_token
```

---

## Déploiement Docker

```bash
# Construire et lancer tous les services
docker compose up --build -d

# Vérifier les logs
docker compose logs -f
```

L'application est ensuite accessible via le tunnel Cloudflare configuré (domaine `melodia.cloud`).

---

## Fonctionnalités

### Authentification
- Inscription / Connexion par email & mot de passe
- OAuth : Google, Discord
- Sessions JWT avec token sécurisé

### Musique
- Recherche d'albums et d'artistes (API externe Last.fm)
- Page détail album : tracklist, biographie, albums similaires
- Statut personnel : Écouté, À écouter, Favori, Abandonné

### Social
- Rédaction d'avis avec note (1-5 étoiles)
- Commentaires et likes sur les avis
- Fil d'activité des personnes suivies
- Système de signalement de contenus

### Playlists
- Création et gestion de playlists (publiques / privées)
- Ajout / suppression d'albums depuis la page de détail

### Messagerie
- Conversations privées en temps réel (Socket.io)
- Notifications push (Expo Notifications)

### Administration
- Tableau de bord admin
- Gestion des signalements et des bans

### Internationalisation
- 5 langues disponibles : Français, English, Deutsch, Italiano, Español

---

## Structure du projet

### Backend

```
backend/
├── bin/www.ts               # Point d'entrée, Socket.io
├── app.ts                   # Configuration Express
├── middlewares/             # Auth JWT, vérifications de rôle
├── modules/
│   ├── db/                  # Contrôleurs & services (users, reviews, playlists…)
│   ├── external_api/        # Intégrations APIs musicales
│   ├── oauth/               # Stratégies Passport.js
│   └── web_socket/          # Serveur Socket.io
├── routes/                  # Définitions des routes REST
└── prisma/
    └── schema.prisma        # Schéma base de données
```

### Web

```
clients/web/src/
├── pages/                   # Pages React (Login, Home, AlbumDetails…)
├── components/              # Composants réutilisables
├── context/                 # État global (React Context)
├── api/                     # Client Axios
└── i18n.ts                  # Configuration i18next
```

### Mobile

```
clients/mobile/
├── app/                     # Routes Expo Router (file-based)
│   └── review/[id]/         # Routes imbriquées (commentaires)
└── src/
    ├── pages/               # Composants de page
    ├── components/          # Composants réutilisables
    ├── context/             # ThemeContext, etc.
    ├── api/                 # Client Axios
    ├── hook/                # Custom hooks
    └── i18n.ts              # Configuration i18next
```

---

## Équipe

| Nom | Photo |
|-----|-------|
| Marlier Thibaud | <img src="img/thibaud.jpg" width="120" height="120" alt="Marlier Thibaud" /> |
| Guillard Noah | <img src="img/noah.jpeg" width="120" height="120" alt="Guillard Noah" /> |
| Aurelien Berlot | <img src="img/aurelien.png" width="120" height="120" alt="Aurelien Berlot" /> |
| Romain Metais | <img src="img/romain.png" width="120" height="120" alt="Romain Metais" /> |
