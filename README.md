# Job Tracker App

Application mobile React Native construite avec Expo pour suivre les candidatures d'emploi.

## 📋 Objectif

Créer une application mobile permettant aux utilisateurs de suivre l'ensemble de leurs candidatures (offres d'emploi, entretiens, réponses, relances) de manière simple, rapide et intuitive.

## 🎯 Cible

- Demandeurs d'emploi
- Étudiants en recherche de stage ou d'alternance
- Professionnels en veille active

## ✨ Fonctionnalités

### ✅ Implémentées

- **Authentification & Profil utilisateur**
  - Écran de connexion
  - Écran d'inscription
  - Écran de profil utilisateur
  - Service d'authentification (login/logout)
  - Stockage sécurisé des données utilisateur

- **Gestion des candidatures**
  - Ajouter/Modifier/Supprimer une candidature
  - Champs : Titre, Entreprise, Lieu, Lien, Type de contrat, Date, Statut, Notes, Documents
  - Consultation des détails
  - Stockage SQLite local

- **Dashboard / Statistiques**
  - Nombre total de candidatures
  - Répartition par statut (graphiques)
  - Nombre d'entretiens obtenus
  - Taux de réussite
  - Évolution dans le temps

- **Recherche et filtres**
  - Recherche par titre/entreprise
  - Filtres par statut, type de contrat, date

### 🚧 À venir

- **Notifications**
  - Rappels pour relancer les recruteurs
  - Notifications de changement de statut

- **Authentification sociale**
  - Google / Apple Login
  - Synchronisation cloud (Supabase/Firebase)

## 🛠️ Stack Technique

- **Frontend**: React Native + Expo SDK 54
- **Langage**: TypeScript
- **Navigation**: Expo Router (file-based routing)
- **Gestion d'état**: Context API (Auth) + Zustand (Theme)
- **Stockage local**: SQLite (expo-sqlite)
- **Stockage sécurisé**: Expo SecureStore (tokens)
- **Design**: Palette bleue/grise, icônes Feather (@expo/vector-icons)
- **Mode sombre**: Optionnel (Zustand)

## 📁 Architecture

```
app/                    # Expo Router pages (file-based routing)
  ├── (auth)/           # Groupe d'authentification
  │   ├── login.tsx
  │   └── signup.tsx
  └── (tabs)/           # Navigation par onglets
      ├── index.tsx     # Dashboard
      ├── applications.tsx
      └── profile.tsx
src/
  ├── components/       # Composants UI réutilisables
  │   ├── Button.tsx
  │   ├── Input.tsx
  │   └── Card.tsx
  ├── constants/        # Constantes (couleurs, thème, statuts)
  │   ├── colors.ts
  │   ├── theme.ts
  │   └── status.ts
  ├── hooks/            # Hooks React personnalisés
  │   └── useAuth.ts
  ├── providers/        # Context Providers
  │   └── AuthProvider.tsx
  ├── services/         # Services (API, auth, database)
  │   ├── auth.ts
  │   ├── storage.ts
  │   ├── database.ts   # SQLite
  │   └── jobApplication.ts
  ├── store/            # State management (Zustand)
  │   └── themeStore.ts
  ├── types/            # Types TypeScript
  │   ├── auth.ts
  │   ├── jobApplication.ts
  │   └── index.ts
  └── utils/            # Fonctions utilitaires
assets/                 # Images, fonts, etc.
```

## 🚀 Getting Started

### Prérequis

- Node.js (v18 ou supérieur)
- npm ou yarn
- Expo Go app sur iOS/Android (SDK 54)

### Installation

```bash
npm install
npm start
```

Appuyez sur `i` pour iOS simulator, `a` pour Android emulator, ou scannez le QR code avec l'app Expo Go.

### Scripts Disponibles

- `npm start` - Démarrer le serveur Expo
- `npm run android` - Lancer sur Android
- `npm run ios` - Lancer sur iOS
- `npm run web` - Lancer sur web

## 🎨 Design

- **Palette**: Bleue/Grise (#2563EB, #64748B)
- **Icônes**: Feather Icons via @expo/vector-icons
- **Mode sombre**: Optionnel (toggle dans les paramètres)

## 📝 Notes de Développement

- **Authentification**: Implémentée avec Expo SecureStore pour le stockage sécurisé des tokens
- **Base de données**: SQLite pour le stockage local des candidatures
- **Navigation**: Utilise Expo Router avec file-based routing et groupes de routes
- **TypeScript**: Configuration stricte activée
- **SDK**: Expo SDK 54 (compatible avec Expo Go iOS/Android)

## 👥 Collaboration Équipe

- Créer des branches feature pour votre travail
- Commit souvent avec des messages clairs
- Pull avant de push pour éviter les conflits
- Tester les changements avant de créer des PRs
