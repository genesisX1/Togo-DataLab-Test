import db, { generateUUID } from '../config/database.js';

// Créer la table users
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Créer la table vehicles
db.exec(`
  CREATE TABLE IF NOT EXISTS vehicles (
    id TEXT PRIMARY KEY,
    brand TEXT NOT NULL,
    model TEXT NOT NULL,
    registration_number TEXT UNIQUE NOT NULL,
    status TEXT DEFAULT 'available' CHECK (status IN ('available', 'maintenance', 'reserved')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Créer la table reservations
db.exec(`
  CREATE TABLE IF NOT EXISTS reservations (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    vehicle_id TEXT NOT NULL,
    start_date DATETIME NOT NULL,
    end_date DATETIME NOT NULL,
    reason TEXT NOT NULL,
    status TEXT DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CHECK (end_date > start_date),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
  )
`);

// Créer les index pour les performances
db.exec(`
  CREATE INDEX IF NOT EXISTS idx_reservations_overlap 
  ON reservations(vehicle_id, start_date, end_date)
`);

db.exec(`
  CREATE INDEX IF NOT EXISTS idx_reservations_user 
  ON reservations(user_id)
`);

db.exec(`
  CREATE INDEX IF NOT EXISTS idx_reservations_vehicle 
  ON reservations(vehicle_id)
`);

// Insérer les véhicules de test
const insertVehicle = db.prepare(`
  INSERT OR IGNORE INTO vehicles (id, brand, model, registration_number, status)
  VALUES (?, ?, ?, ?, ?)
`);

const vehicles = [
  [generateUUID(), 'Toyota', 'Corolla', 'TG-1234-AB', 'available'],
  [generateUUID(), 'Honda', 'Civic', 'TG-5678-CD', 'available'],
  [generateUUID(), 'Ford', 'Focus', 'TG-9012-EF', 'available'],
  [generateUUID(), 'Volkswagen', 'Golf', 'TG-3456-GH', 'available'],
  [generateUUID(), 'Peugeot', '308', 'TG-7890-IJ', 'available']
];

const insertMany = db.transaction((vehicles) => {
  for (const vehicle of vehicles) {
    insertVehicle.run(...vehicle);
  }
});

insertMany(vehicles);

console.log('✅ Base de données initialisée avec succès!');
console.log('📦 5 véhicules de test insérés');

db.close();
