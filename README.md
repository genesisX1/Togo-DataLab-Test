# Togo-DataLab-Test

# Application de Gestion de Réservations de Véhicules

## Contexte

Cette application web full-stack permet à une organisation de gérer les réservations de son parc de véhicules pour les déplacements professionnels des employés. Elle garantit qu'aucun véhicule ne peut être réservé sur des périodes qui se chevauchent, évitant ainsi les conflits d'usage.

## Technologies Utilisées

### Frontend
- **React 18** avec TypeScript
- **Vite** pour le bundling et le développement
- **Tailwind CSS** pour le styling
- **Lucide React** pour les icônes

### Backend
- **Node.js** avec Express
- **JWT (jsonwebtoken)** pour l'authentification
- **bcryptjs** pour le hachage des mots de passe
- **SQLite (better-sqlite3)** pour la base de données

## Architecture de la Base de Données

### Tables

#### `users`
- `id` (uuid, PK) - Identifiant unique de l'utilisateur
- `email` (text, unique) - Email pour l'authentification
- `password_hash` (text) - Mot de passe haché
- `first_name` (text) - Prénom
- `last_name` (text) - Nom
- `created_at` (timestamptz) - Date de création
- `updated_at` (timestamptz) - Dernière mise à jour

#### `vehicles`
- `id` (uuid, PK) - Identifiant unique du véhicule
- `brand` (text) - Marque du véhicule
- `model` (text) - Modèle du véhicule
- `registration_number` (text, unique) - Numéro d'immatriculation
- `status` (text) - Statut (available, maintenance, reserved)
- `created_at` (timestamptz) - Date de création
- `updated_at` (timestamptz) - Dernière mise à jour

#### `reservations`
- `id` (uuid, PK) - Identifiant unique de la réservation
- `user_id` (uuid, FK → users.id) - Utilisateur ayant fait la réservation
- `vehicle_id` (uuid, FK → vehicles.id) - Véhicule réservé
- `start_date` (timestamptz) - Date et heure de début
- `end_date` (timestamptz) - Date et heure de fin
- `reason` (text) - Motif de la réservation
- `status` (text) - Statut (pending, confirmed, cancelled, completed)
- `created_at` (timestamptz) - Date de création
- `updated_at` (timestamptz) - Dernière mise à jour

### Relations
- Une réservation appartient à un utilisateur
- Une réservation concerne un véhicule
- Un véhicule peut avoir plusieurs réservations
- Un utilisateur peut avoir plusieurs réservations

## Fonctionnalités Implémentées

### Authentification
- Inscription des nouveaux utilisateurs avec validation
- Connexion avec JWT
- Déconnexion
- Protection des routes par middleware d'authentification

### Gestion des Véhicules
- Affichage de tous les véhicules disponibles
- Consultation des détails d'un véhicule
- Vérification de disponibilité avec dates

### Gestion des Réservations
- Création d'une réservation avec validation de chevauchement
- Affichage des réservations de l'utilisateur connecté
- Annulation d'une réservation
- Historique des réservations (actives et annulées)

### Règle Métier Critique
**Validation des chevauchements de réservations**

Avant chaque création de réservation, le système vérifie qu'aucune autre réservation active n'existe pour le même véhicule sur une période qui chevauche les dates demandées.

Requête SQL utilisée:
```sql
SELECT * FROM reservations
WHERE vehicle_id = :vehicleId
AND status IN ('confirmed', 'pending')
AND start_date <= :newEndDate
AND end_date >= :newStartDate
```

Si un enregistrement existe, la réservation est rejetée avec un message d'erreur approprié.

## Structure du Projet

```
project/
├── backend/                    # API Express
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js    # Configuration SQLite
│   │   ├── scripts/
│   │   │   └── initDatabase.js # Script d'initialisation de la base de données
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── vehiclesController.js
│   │   │   └── reservationsController.js
│   │   ├── middleware/
│   │   │   └── auth.js        # Middleware JWT
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── vehicles.js
│   │   │   └── reservations.js
│   │   ├── utils/
│   │   │   └── jwt.js         # Utilitaires JWT
│   │   └── server.js          # Point d'entrée
│   ├── .env
│   └── package.json
│
├── src/                        # Application React
│   ├── components/
│   │   ├── VehicleCard.tsx
│   │   ├── ReservationModal.tsx
│   │   └── MyReservations.tsx
│   ├── contexts/
│   │   └── AuthContext.tsx    # Context d'authentification
│   ├── pages/
│   │   ├── Login.tsx
│   │   ├── Register.tsx
│   │   └── Dashboard.tsx
│   ├── services/
│   │   └── api.ts             # Services API
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
│
├── package.json
└── README.md
```

## API Routes

### Authentification
- `POST /api/auth/register` - Inscription d'un nouvel utilisateur
  - Body: `{ email, password, firstName, lastName }`
  - Response: `{ success, message, data: { user, token } }`

- `POST /api/auth/login` - Connexion
  - Body: `{ email, password }`
  - Response: `{ success, message, data: { user, token } }`

- `GET /api/auth/profile` - Profil utilisateur (protégé)
  - Headers: `Authorization: Bearer <token>`
  - Response: `{ success, data: { user } }`

### Véhicules
- `GET /api/vehicles` - Liste de tous les véhicules (protégé)
  - Headers: `Authorization: Bearer <token>`
  - Response: `{ success, data: { vehicles } }`

- `GET /api/vehicles/:id` - Détails d'un véhicule (protégé)
  - Headers: `Authorization: Bearer <token>`
  - Response: `{ success, data: { vehicle } }`

- `GET /api/vehicles/:id/availability` - Vérifier la disponibilité (protégé)
  - Headers: `Authorization: Bearer <token>`
  - Query: `?startDate=<date>&endDate=<date>`
  - Response: `{ success, data: { vehicle, available, conflictingReservations } }`

### Réservations
- `POST /api/reservations` - Créer une réservation (protégé)
  - Headers: `Authorization: Bearer <token>`
  - Body: `{ vehicleId, startDate, endDate, reason }`
  - Response: `{ success, message, data: { reservation } }`

- `GET /api/reservations/my-reservations` - Réservations de l'utilisateur (protégé)
  - Headers: `Authorization: Bearer <token>`
  - Response: `{ success, data: { reservations } }`

- `GET /api/reservations` - Toutes les réservations (protégé)
  - Headers: `Authorization: Bearer <token>`
  - Response: `{ success, data: { reservations } }`

- `GET /api/reservations/:id` - Détails d'une réservation (protégé)
  - Headers: `Authorization: Bearer <token>`
  - Response: `{ success, data: { reservation } }`

- `DELETE /api/reservations/:id` - Annuler une réservation (protégé)
  - Headers: `Authorization: Bearer <token>`
  - Response: `{ success, message, data: { reservation } }`

## Installation et Configuration

### Prérequis
- Node.js (version 18 ou supérieure)
- npm ou yarn
- SQLite (installé automatiquement via better-sqlite3)

### Installation

1. **Cloner le projet**
```bash
git clone <repository-url>
cd project
```

2. **Installer les dépendances du frontend**
```bash
npm install
```

3. **Installer les dépendances du backend**
```bash
cd backend
npm install
cd ..
```

4. **Configuration des variables d'environnement et initialisation de la base de données**

Le fichier `.env` du backend est déjà configuré avec les valeurs nécessaires:

Backend (`backend/.env`):
```
PORT=3001
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=24h
DB_PATH=./database.sqlite
```

5. **Initialiser la base de données SQLite**
```bash
cd backend
npm run init-db
```
Cette commande crée la base de données SQLite et insère les véhicules de test.

### Lancement de l'Application

**IMPORTANT:** Vous devez lancer le backend ET le frontend dans deux terminaux séparés.

**Terminal 1 - Backend (À LANCER EN PREMIER):**
```bash
cd backend
node src/server.js
```
Attendez de voir: `🚀 Serveur démarré sur le port 3001`
Le serveur API démarre sur http://localhost:3001

**Terminal 2 - Frontend:**
```
npm run dev
```
L'application frontend démarre sur http://localhost:5173

**3. Accéder à l'application**
Ouvrez votre navigateur et accédez à http://localhost:5173



## Utilisation

### Première Connexion

1. Créez un compte en cliquant sur "S'inscrire"
2. Remplissez le formulaire avec:
   - Prénom et Nom
   - Email
   - Mot de passe (minimum 6 caractères)
3. Vous serez automatiquement connecté après l'inscription

### Réserver un Véhicule

1. Dans l'onglet "Véhicules Disponibles", parcourez les véhicules
2. Cliquez sur "Réserver" pour un véhicule disponible
3. Sélectionnez les dates de début et de fin
4. Indiquez le motif de la réservation
5. Cliquez sur "Confirmer"

Si le véhicule est déjà réservé sur la période choisie, un message d'erreur s'affichera.

### Gérer ses Réservations

1. Cliquez sur l'onglet "Mes Réservations"
2. Consultez vos réservations actives et historique
3. Annulez une réservation si nécessaire en cliquant sur "Annuler la réservation"

## Sécurité

### Authentification
- Les mots de passe sont hachés avec bcryptjs (10 rounds de salage)
- Les tokens JWT expirent après 24 heures
- Toutes les routes API (sauf auth) sont protégées par middleware

### Base de Données
- Base de données SQLite locale (fichier `backend/database.sqlite`)
- Clés étrangères activées avec suppression en cascade
- Validation des contraintes au niveau de la base de données
- Index optimisés pour les requêtes de chevauchement

### Validation
- Validation des entrées côté backend
- Vérification des dates (date de fin après date de début)
- Vérification de l'appartenance des ressources à l'utilisateur

## Données de Test

La base de données contient 5 véhicules de test:
- Toyota Corolla (TG-1234-AB)
- Honda Civic (TG-5678-CD)
- Ford Focus (TG-9012-EF)
- Volkswagen Golf (TG-3456-GH)
- Peugeot 308 (TG-7890-IJ)

## Build pour Production

```bash
# Frontend
npm run build

# Backend
cd backend
npm start
```

Le frontend compilé sera dans le dossier `dist/`.

## Choix Techniques

### Pourquoi SQLite ?

SQLite a été choisi pour cette application car :

1. **Simplicité** : Base de données locale, pas besoin de serveur séparé
2. **Performance** : Excellentes performances pour des applications de taille moyenne
3. **Portabilité** : Un seul fichier de base de données facile à déplacer et à sauvegarder
4. **Zéro configuration** : Pas besoin de configuration serveur ou de variables d'environnement complexes
5. **Parfait pour le développement** : Idéal pour les projets de démonstration et les tests
6. **Conformité aux exigences** : Répond aux besoins de l'application sans dépendances externes

### Architecture Backend

- Structure modulaire avec séparation des responsabilités
- Controllers pour la logique métier
- Middleware pour l'authentification
- Routes pour l'organisation des endpoints
- Validation et gestion d'erreurs appropriées

### Architecture Frontend

- Context API pour la gestion de l'état d'authentification
- Services API centralisés
- Composants réutilisables
- Design responsive et moderne avec Tailwind CSS
- Expérience utilisateur optimisée

## Auteur

Application développée pour le test pratique du Togo DataLab - Janvier 2026
