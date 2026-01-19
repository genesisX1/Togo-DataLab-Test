# Documentation API - Système de Réservation de Véhicules

## URL de Base
```
http://localhost:3001/api
```

## Format des Réponses

Toutes les réponses de l'API suivent ce format:

```json
{
  "success": boolean,
  "message": string (optionnel),
  "data": object (optionnel)
}
```

## Authentification

L'API utilise JWT (JSON Web Tokens) pour l'authentification. Après la connexion, le token doit être inclus dans le header `Authorization` de toutes les requêtes protégées:

```
Authorization: Bearer <votre-token-jwt>
```

---

## Endpoints d'Authentification

### POST /api/auth/register
Inscription d'un nouvel utilisateur.

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "email": "jean.dupont@example.com",
  "password": "motdepasse123",
  "firstName": "Jean",
  "lastName": "Dupont"
}
```

**Réponse Succès (201):**
```json
{
  "success": true,
  "message": "Utilisateur créé avec succès",
  "data": {
    "user": {
      "id": "uuid",
      "email": "jean.dupont@example.com",
      "first_name": "Jean",
      "last_name": "Dupont",
      "created_at": "2026-01-19T10:30:00Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Erreurs Possibles:**
- 400: Tous les champs sont requis
- 400: Cet email est déjà utilisé
- 500: Erreur lors de l'inscription

---

### POST /api/auth/login
Connexion d'un utilisateur existant.

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "email": "jean.dupont@example.com",
  "password": "motdepasse123"
}
```

**Réponse Succès (200):**
```json
{
  "success": true,
  "message": "Connexion réussie",
  "data": {
    "user": {
      "id": "uuid",
      "email": "jean.dupont@example.com",
      "first_name": "Jean",
      "last_name": "Dupont",
      "created_at": "2026-01-19T10:30:00Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Erreurs Possibles:**
- 400: Email et mot de passe requis
- 401: Email ou mot de passe incorrect
- 500: Erreur lors de la connexion

---

### GET /api/auth/profile
Récupération du profil de l'utilisateur connecté.

**Headers:**
```
Authorization: Bearer <token>
```

**Réponse Succès (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "jean.dupont@example.com",
      "first_name": "Jean",
      "last_name": "Dupont",
      "created_at": "2026-01-19T10:30:00Z"
    }
  }
}
```

**Erreurs Possibles:**
- 401: Token manquant ou invalide
- 404: Utilisateur non trouvé
- 500: Erreur lors de la récupération du profil

---

## Endpoints Véhicules

### GET /api/vehicles
Liste de tous les véhicules.

**Headers:**
```
Authorization: Bearer <token>
```

**Réponse Succès (200):**
```json
{
  "success": true,
  "data": {
    "vehicles": [
      {
        "id": "uuid",
        "brand": "Toyota",
        "model": "Corolla",
        "registration_number": "TG-1234-AB",
        "status": "available",
        "created_at": "2026-01-19T10:00:00Z",
        "updated_at": "2026-01-19T10:00:00Z"
      }
    ]
  }
}
```

**Statuts Possibles:**
- `available`: Véhicule disponible
- `maintenance`: En maintenance
- `reserved`: Réservé

---

### GET /api/vehicles/:id
Détails d'un véhicule spécifique.

**Headers:**
```
Authorization: Bearer <token>
```

**Paramètres URL:**
- `id`: UUID du véhicule

**Réponse Succès (200):**
```json
{
  "success": true,
  "data": {
    "vehicle": {
      "id": "uuid",
      "brand": "Toyota",
      "model": "Corolla",
      "registration_number": "TG-1234-AB",
      "status": "available",
      "created_at": "2026-01-19T10:00:00Z",
      "updated_at": "2026-01-19T10:00:00Z"
    }
  }
}
```

**Erreurs Possibles:**
- 404: Véhicule non trouvé
- 500: Erreur lors de la récupération du véhicule

---

### GET /api/vehicles/:id/availability
Vérification de la disponibilité d'un véhicule pour des dates données.

**Headers:**
```
Authorization: Bearer <token>
```

**Paramètres URL:**
- `id`: UUID du véhicule

**Query Parameters:**
- `startDate`: Date de début (ISO 8601)
- `endDate`: Date de fin (ISO 8601)

**Exemple:**
```
GET /api/vehicles/uuid/availability?startDate=2026-01-20T08:00:00Z&endDate=2026-01-22T18:00:00Z
```

**Réponse Succès (200):**
```json
{
  "success": true,
  "data": {
    "vehicle": {
      "id": "uuid",
      "brand": "Toyota",
      "model": "Corolla",
      "registration_number": "TG-1234-AB",
      "status": "available"
    },
    "available": false,
    "conflictingReservations": [
      {
        "id": "uuid",
        "start_date": "2026-01-20T10:00:00Z",
        "end_date": "2026-01-21T16:00:00Z",
        "status": "confirmed"
      }
    ]
  }
}
```

**Erreurs Possibles:**
- 400: Les dates de début et de fin sont requises
- 404: Véhicule non trouvé
- 500: Erreur lors de la vérification de la disponibilité

---

## Endpoints Réservations

### POST /api/reservations
Création d'une nouvelle réservation.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**
```json
{
  "vehicleId": "uuid",
  "startDate": "2026-01-20T08:00:00Z",
  "endDate": "2026-01-22T18:00:00Z",
  "reason": "Mission à Lomé"
}
```

**Réponse Succès (201):**
```json
{
  "success": true,
  "message": "Réservation créée avec succès",
  "data": {
    "reservation": {
      "id": "uuid",
      "user_id": "uuid",
      "vehicle_id": "uuid",
      "start_date": "2026-01-20T08:00:00Z",
      "end_date": "2026-01-22T18:00:00Z",
      "reason": "Mission à Lomé",
      "status": "confirmed",
      "created_at": "2026-01-19T12:00:00Z",
      "vehicle": {
        "id": "uuid",
        "brand": "Toyota",
        "model": "Corolla",
        "registration_number": "TG-1234-AB"
      }
    }
  }
}
```

**Erreurs Possibles:**
- 400: Tous les champs sont requis
- 400: La date de fin doit être après la date de début
- 404: Véhicule non trouvé
- 409: Ce véhicule est déjà réservé pour cette période
- 500: Erreur lors de la création de la réservation

---

### GET /api/reservations/my-reservations
Liste des réservations de l'utilisateur connecté.

**Headers:**
```
Authorization: Bearer <token>
```

**Réponse Succès (200):**
```json
{
  "success": true,
  "data": {
    "reservations": [
      {
        "id": "uuid",
        "user_id": "uuid",
        "vehicle_id": "uuid",
        "start_date": "2026-01-20T08:00:00Z",
        "end_date": "2026-01-22T18:00:00Z",
        "reason": "Mission à Lomé",
        "status": "confirmed",
        "created_at": "2026-01-19T12:00:00Z",
        "vehicle": {
          "id": "uuid",
          "brand": "Toyota",
          "model": "Corolla",
          "registration_number": "TG-1234-AB",
          "status": "available"
        }
      }
    ]
  }
}
```

---

### GET /api/reservations
Liste de toutes les réservations (tous les utilisateurs).

**Headers:**
```
Authorization: Bearer <token>
```

**Réponse Succès (200):**
```json
{
  "success": true,
  "data": {
    "reservations": [
      {
        "id": "uuid",
        "user_id": "uuid",
        "vehicle_id": "uuid",
        "start_date": "2026-01-20T08:00:00Z",
        "end_date": "2026-01-22T18:00:00Z",
        "reason": "Mission à Lomé",
        "status": "confirmed",
        "created_at": "2026-01-19T12:00:00Z",
        "vehicle": {
          "id": "uuid",
          "brand": "Toyota",
          "model": "Corolla",
          "registration_number": "TG-1234-AB"
        },
        "user": {
          "id": "uuid",
          "email": "jean.dupont@example.com",
          "first_name": "Jean",
          "last_name": "Dupont"
        }
      }
    ]
  }
}
```

---

### GET /api/reservations/:id
Détails d'une réservation spécifique.

**Headers:**
```
Authorization: Bearer <token>
```

**Paramètres URL:**
- `id`: UUID de la réservation

**Réponse Succès (200):**
```json
{
  "success": true,
  "data": {
    "reservation": {
      "id": "uuid",
      "user_id": "uuid",
      "vehicle_id": "uuid",
      "start_date": "2026-01-20T08:00:00Z",
      "end_date": "2026-01-22T18:00:00Z",
      "reason": "Mission à Lomé",
      "status": "confirmed",
      "created_at": "2026-01-19T12:00:00Z",
      "vehicle": {
        "id": "uuid",
        "brand": "Toyota",
        "model": "Corolla",
        "registration_number": "TG-1234-AB"
      },
      "user": {
        "id": "uuid",
        "email": "jean.dupont@example.com",
        "first_name": "Jean",
        "last_name": "Dupont"
      }
    }
  }
}
```

**Erreurs Possibles:**
- 404: Réservation non trouvée
- 500: Erreur lors de la récupération de la réservation

---

### DELETE /api/reservations/:id
Annulation d'une réservation.

**Headers:**
```
Authorization: Bearer <token>
```

**Paramètres URL:**
- `id`: UUID de la réservation

**Réponse Succès (200):**
```json
{
  "success": true,
  "message": "Réservation annulée avec succès",
  "data": {
    "reservation": {
      "id": "uuid",
      "status": "cancelled",
      "updated_at": "2026-01-19T13:00:00Z"
    }
  }
}
```

**Erreurs Possibles:**
- 400: Cette réservation est déjà annulée
- 404: Réservation non trouvée
- 500: Erreur lors de l'annulation de la réservation

---

## Codes d'État HTTP

- **200 OK**: Requête réussie
- **201 Created**: Ressource créée avec succès
- **400 Bad Request**: Données invalides ou manquantes
- **401 Unauthorized**: Authentification requise ou token invalide
- **404 Not Found**: Ressource non trouvée
- **409 Conflict**: Conflit (ex: véhicule déjà réservé)
- **500 Internal Server Error**: Erreur serveur

---

## Logique de Validation des Chevauchements

La règle métier critique est implémentée dans l'endpoint de création de réservation. Avant d'insérer une nouvelle réservation, le système exécute la requête suivante:

```sql
SELECT * FROM reservations
WHERE vehicle_id = :vehicleId
AND status IN ('confirmed', 'pending')
AND start_date <= :newEndDate
AND end_date >= :newStartDate
```

**Conditions de rejet:**
- Si un ou plusieurs enregistrements sont retournés, la réservation est rejetée
- Un message d'erreur avec le code 409 (Conflict) est renvoyé
- Les réservations conflictuelles sont incluses dans la réponse

**Exemple de réponse en cas de conflit:**
```json
{
  "success": false,
  "message": "Ce véhicule est déjà réservé pour cette période",
  "data": {
    "conflictingReservations": [
      {
        "id": "uuid",
        "start_date": "2026-01-20T10:00:00Z",
        "end_date": "2026-01-21T16:00:00Z",
        "status": "confirmed"
      }
    ]
  }
}
```

---

## Exemples d'Utilisation avec cURL

### Inscription
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "firstName": "Test",
    "lastName": "User"
  }'
```

### Connexion
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Liste des véhicules
```bash
curl -X GET http://localhost:3001/api/vehicles \
  -H "Authorization: Bearer <votre-token>"
```

### Créer une réservation
```bash
curl -X POST http://localhost:3001/api/reservations \
  -H "Authorization: Bearer <votre-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "vehicleId": "uuid-du-vehicule",
    "startDate": "2026-01-20T08:00:00Z",
    "endDate": "2026-01-22T18:00:00Z",
    "reason": "Mission professionnelle"
  }'
```

### Mes réservations
```bash
curl -X GET http://localhost:3001/api/reservations/my-reservations \
  -H "Authorization: Bearer <votre-token>"
```

### Annuler une réservation
```bash
curl -X DELETE http://localhost:3001/api/reservations/<uuid-reservation> \
  -H "Authorization: Bearer <votre-token>"
```
