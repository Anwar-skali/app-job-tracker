# 📋 TODO List - Job Tracker Application

## 🎯 Vue d'ensemble des rôles et permissions

### Rôles utilisateurs
- **Admin** : Contrôle total de l'application
- **Recruteur** : Créer des offres, gérer les candidatures reçues, voir les CVs
- **Postulant (Candidate)** : Postuler aux offres, gérer ses candidatures, ajouter son CV

---

## ✅ FONCTIONNALITÉS IMPLÉMENTÉES

### 🔐 Authentification
- [x] Écran de connexion (login)
- [x] Écran d'inscription avec choix du rôle (Recruteur/Postulant)
- [x] Déconnexion
- [x] Restauration de session
- [x] Stockage sécurisé des tokens (Expo SecureStore)

### 👤 Gestion du profil utilisateur
- [x] Affichage du profil
- [x] Édition du profil
- [x] Champs communs : nom, email, téléphone, adresse
- [x] Champs postulant : compétences, expérience, formation, LinkedIn
- [x] Champs recruteur : entreprise, secteur, site web, taille

### 📝 Candidatures (Postulants)
- [x] Créer une candidature
- [x] Sélectionner une offre existante
- [x] Upload de CV (PDF/image)
- [x] Champs verrouillés après sélection d'une offre
- [x] Voir les détails d'une candidature
- [x] Modifier une candidature
- [x] Supprimer une candidature
- [x] Liste des candidatures avec filtres
- [x] Recherche de candidatures

### 💼 Offres d'emploi (Recruteurs)
- [x] Créer une offre d'emploi
- [x] Voir toutes les offres créées
- [x] Voir les détails d'une offre
- [x] Services de mise à jour et suppression (backend)

### 📊 Dashboard
- [x] Statistiques pour postulants (total, entretiens, taux de succès)
- [x] Répartition par statut
- [x] Activités récentes
- [x] Statistiques pour recruteurs (offres créées, candidatures reçues, etc.)

### 🔍 Recherche et filtres
- [x] Recherche d'offres par titre/entreprise
- [x] Filtres d'offres (type, localisation, remote)
- [x] Filtres de candidatures (statut, type de contrat)

### 🎨 Interface utilisateur
- [x] Design moderne avec Tailwind
- [x] Gradients et ombres
- [x] Responsive design
- [x] Navigation par onglets

---

## 🚧 FONCTIONNALITÉS À IMPLÉMENTER

### 🔴 PRIORITÉ HAUTE

#### 👨‍💼 Interface Admin
- [ ] **Dashboard Admin** (`app/admin/dashboard.tsx`)
  - Vue d'ensemble globale (nombre d'utilisateurs, offres, candidatures)
  - Statistiques par rôle
  - Graphiques d'évolution

- [ ] **Gestion des utilisateurs** (`app/admin/users.tsx`)
  - Liste de tous les utilisateurs
  - Filtrer par rôle (Admin/Recruteur/Postulant)
  - Voir les détails d'un utilisateur
  - Modifier le rôle d'un utilisateur
  - Désactiver/Activer un compte
  - Supprimer un utilisateur (avec confirmation)

- [ ] **Gestion des offres** (`app/admin/jobs.tsx`)
  - Voir toutes les offres (tous recruteurs confondus)
  - Modifier/Supprimer n'importe quelle offre
  - Statistiques par recruteur

- [ ] **Gestion des candidatures** (`app/admin/applications.tsx`)
  - Voir toutes les candidatures
  - Modifier le statut de n'importe quelle candidature
  - Statistiques globales

- [ ] **Permissions Admin dans usePermissions**
  - Ajouter `canManageUsers`, `canViewAllJobs`, `canViewAllApplications`
  - Ajouter `canModifyAnyJob`, `canModifyAnyApplication`

#### 💼 Gestion des offres (Recruteurs)
- [ ] **Éditer une offre** (`app/job/[id]/edit.tsx`)
  - Formulaire d'édition pré-rempli
  - Validation des champs
  - Redirection après sauvegarde
  - Vérifier que seul le créateur peut modifier

- [ ] **Supprimer une offre** (dans `app/job/[id].tsx` ou `app/recruiter/jobs.tsx`)
  - Bouton de suppression avec confirmation
  - Vérifier qu'il n'y a pas de candidatures en cours
  - Avertir si des candidatures existent

- [ ] **Dupliquer une offre** (`app/job/[id].tsx`)
  - Bouton "Dupliquer" pour créer une nouvelle offre basée sur l'existante
  - Ouvrir le formulaire de création avec les champs pré-remplis

- [ ] **Archiver/Désarchiver une offre**
  - Ajouter un champ `archived` dans la table jobs
  - Filtrer les offres archivées dans la liste
  - Bouton pour archiver/désarchiver

#### 📝 Gestion des candidatures (Recruteurs)
- [ ] **Envoyer un message au candidat**
  - Champ de message dans le modal de détails
  - Stocker les messages dans une table `messages` ou dans les notes
  - Historique des échanges

- [ ] **Exporter les candidatures** (`app/recruiter/applications.tsx`)
  - Export CSV/PDF des candidatures filtrées
  - Inclure les informations du candidat et du CV

- [ ] **Filtres avancés** (`app/recruiter/applications.tsx`)
  - Filtrer par date de candidature
  - Filtrer par offre spécifique
  - Filtrer par compétences (si disponibles dans le profil candidat)

#### 📝 Gestion des candidatures (Postulants)
- [ ] **Relancer un recruteur**
  - Bouton "Relancer" dans les détails d'une candidature
  - Enregistrer la date de relance
  - Rappel automatique si pas de réponse après X jours

- [ ] **Historique des modifications**
  - Afficher l'historique des changements de statut
  - Date et heure de chaque changement

- [ ] **Dupliquer une candidature**
  - Bouton pour créer une nouvelle candidature basée sur une existante

### 🟡 PRIORITÉ MOYENNE

#### 🔔 Notifications
- [ ] **Système de notifications** (`src/services/notifications.ts`)
  - Notifications locales (expo-notifications)
  - Rappels pour relancer les recruteurs
  - Notification quand un recruteur change le statut
  - Notification pour les nouveaux messages

- [ ] **Paramètres de notifications** (`app/(tabs)/settings.tsx`)
  - Activer/Désactiver les notifications
  - Choisir les types de notifications
  - Fréquence des rappels

#### 📊 Statistiques avancées
- [ ] **Graphiques détaillés** (`app/(tabs)/index.tsx` et `app/recruiter/dashboard.tsx`)
  - Graphique d'évolution temporelle (candidatures par mois)
  - Graphique en secteurs (répartition par type de contrat)
  - Graphique de performance (taux de réponse par entreprise)

- [ ] **Statistiques recruteur avancées**
  - Taux de réponse par offre
  - Temps moyen de traitement des candidatures
  - Top 5 des offres les plus populaires

#### 🔍 Recherche et filtres avancés
- [ ] **Recherche globale** (`app/(tabs)/jobs.tsx`)
  - Recherche dans la description des offres
  - Recherche par compétences requises
  - Recherche par salaire (fourchette)

- [ ] **Sauvegarder des recherches** (`app/(tabs)/jobs.tsx`)
  - Sauvegarder des critères de recherche fréquents
  - Alertes pour nouvelles offres correspondant aux critères

#### 📤 Export et partage
- [ ] **Export des données** (`app/(tabs)/settings.tsx`)
  - Export de toutes les candidatures en CSV/PDF
  - Export du profil complet
  - Backup de la base de données

- [ ] **Partage de candidature** (`app/application/[id].tsx`)
  - Partager une candidature par email/message
  - Générer un lien de partage (si backend disponible)

#### 🎨 Améliorations UX
- [ ] **Mode sombre complet**
  - Implémenter le mode sombre dans tous les écrans
  - Toggle dans les paramètres

- [ ] **Animations et transitions**
  - Animations de transition entre écrans
  - Animations de chargement
  - Feedback visuel pour les actions

- [ ] **Accessibilité**
  - Support des lecteurs d'écran
  - Tailles de police ajustables
  - Contraste amélioré

### 🟢 PRIORITÉ BASSE / AMÉLIORATIONS FUTURES

#### 🔐 Sécurité et authentification
- [ ] **Authentification sociale**
  - Google Sign-In
  - Apple Sign-In
  - LinkedIn Sign-In

- [ ] **Récupération de mot de passe**
  - Mot de passe oublié
  - Réinitialisation par email
  - Code de vérification

- [ ] **Authentification à deux facteurs (2FA)**
  - SMS ou email
  - Application d'authentification

#### ☁️ Synchronisation cloud
- [ ] **Backend API**
  - Intégration avec Firebase/Supabase
  - Synchronisation multi-appareils
  - Sauvegarde automatique dans le cloud

- [ ] **Synchronisation en temps réel**
  - Mise à jour automatique des candidatures
  - Notifications push depuis le serveur

#### 🤖 Fonctionnalités intelligentes
- [ ] **Recommandations d'offres**
  - Algorithme de matching basé sur le profil
  - Suggestions personnalisées

- [ ] **Analyse de CV**
  - Extraction automatique des compétences
  - Matching avec les offres

- [ ] **Prédiction de succès**
  - Score de compatibilité avec une offre
  - Suggestions d'amélioration du profil

#### 📱 Fonctionnalités mobiles
- [ ] **Géolocalisation**
  - Recherche d'offres par proximité
  - Carte des offres disponibles

- [ ] **Caméra pour CV**
  - Scanner un CV papier
  - OCR pour extraction de texte

#### 🌐 Internationalisation
- [ ] **Multi-langues**
  - Support français/anglais
  - Traduction de l'interface
  - Format de dates localisé

---

## 🔧 AMÉLIORATIONS TECHNIQUES

### Base de données
- [ ] **Migration de schéma**
  - Système de migration pour les mises à jour de schéma
  - Backup avant migration

- [ ] **Optimisation des requêtes**
  - Index supplémentaires si nécessaire
  - Pagination pour les grandes listes

- [ ] **Validation des données**
  - Validation côté client et serveur
  - Messages d'erreur clairs

### Services
- [ ] **Gestion d'erreurs centralisée**
  - Service de logging
  - Gestion des erreurs réseau
  - Retry automatique

- [ ] **Cache et performance**
  - Cache des données fréquemment utilisées
  - Lazy loading des images
  - Optimisation des re-renders

### Tests
- [ ] **Tests unitaires**
  - Tests des services
  - Tests des hooks
  - Tests des utilitaires

- [ ] **Tests d'intégration**
  - Tests des flux utilisateur
  - Tests des permissions

- [ ] **Tests E2E**
  - Tests des scénarios complets

---

## 📋 VALIDATION DE LA LOGIQUE MÉTIER

### ✅ Règles implémentées
- [x] Un postulant ne peut pas créer d'offres
- [x] Un recruteur ne peut pas créer de candidatures
- [x] Un postulant ne peut pas modifier les champs d'une offre après sélection
- [x] Un recruteur ne voit que ses propres offres
- [x] Un recruteur ne voit que les candidatures pour ses offres
- [x] Un postulant ne voit que ses propres candidatures

### ⚠️ Règles à valider/implémenter
- [ ] Un recruteur ne peut modifier/supprimer que ses propres offres
- [ ] Un recruteur ne peut modifier le statut que des candidatures pour ses offres
- [ ] Un postulant ne peut modifier/supprimer que ses propres candidatures
- [ ] Un admin peut tout voir et modifier
- [ ] Un recruteur ne peut pas voir les CVs des candidatures qui ne sont pas pour ses offres
- [ ] Validation : un postulant ne peut pas postuler deux fois à la même offre
- [ ] Validation : une offre ne peut pas être supprimée si elle a des candidatures en cours
- [ ] Un recruteur ne peut pas modifier une candidature créée par un postulant (seulement le statut)

---

## 🎯 PROCHAINES ÉTAPES RECOMMANDÉES

### Phase 1 (Court terme)
1. Implémenter l'interface Admin complète
2. Ajouter l'édition et suppression d'offres pour les recruteurs
3. Ajouter la validation de la logique métier manquante
4. Améliorer la gestion d'erreurs

### Phase 2 (Moyen terme)
1. Système de notifications
2. Statistiques avancées avec graphiques
3. Export de données
4. Recherche et filtres avancés

### Phase 3 (Long terme)
1. Authentification sociale
2. Synchronisation cloud
3. Fonctionnalités intelligentes (matching, recommandations)
4. Internationalisation

---

## 📝 NOTES IMPORTANTES

### Permissions à ajouter dans `usePermissions.ts`
```typescript
const canManageUsers = isAdmin;
const canViewAllJobs = isAdmin;
const canViewAllApplications = isAdmin;
const canModifyAnyJob = isAdmin;
const canModifyAnyApplication = isAdmin;
const canDeleteAnyJob = isAdmin;
const canDeleteAnyApplication = isAdmin;
```

### Tables de base de données à ajouter
- `messages` : Pour les échanges entre recruteurs et candidats
- `notifications` : Pour stocker les notifications
- `saved_searches` : Pour les recherches sauvegardées
- `application_history` : Pour l'historique des changements de statut

### Services à créer
- `adminService.ts` : Gestion des utilisateurs, statistiques globales
- `notificationService.ts` : Gestion des notifications
- `exportService.ts` : Export CSV/PDF
- `matchingService.ts` : Algorithme de matching (futur)

