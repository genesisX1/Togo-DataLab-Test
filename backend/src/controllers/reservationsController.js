import db, { generateUUID } from '../config/database.js';

export const createReservation = async (req, res) => {
  try {
    const { vehicleId, startDate, endDate, reason } = req.body;
    const userId = req.user.userId;

    if (!vehicleId || !startDate || !endDate || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Tous les champs sont requis'
      });
    }

    if (new Date(endDate) <= new Date(startDate)) {
      return res.status(400).json({
        success: false,
        message: 'La date de fin doit être après la date de début'
      });
    }

    // Vérifier que la date de début n'est pas dans le passé
    const now = new Date();
    if (new Date(startDate) < now) {
      return res.status(400).json({
        success: false,
        message: 'La date de début ne peut pas être dans le passé'
      });
    }

    const vehicle = db.prepare('SELECT * FROM vehicles WHERE id = ?').get(vehicleId);

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Véhicule non trouvé'
      });
    }

    // Vérifier les chevauchements
    const overlappingReservations = db.prepare(`
      SELECT * FROM reservations
      WHERE vehicle_id = ?
        AND status IN ('confirmed', 'pending')
        AND start_date <= ?
        AND end_date >= ?
    `).all(vehicleId, endDate, startDate);

    if (overlappingReservations.length > 0) {
      // Formater les périodes en conflit pour l'affichage
      const conflictDetails = overlappingReservations.map(conflict => ({
        start_date: conflict.start_date,
        end_date: conflict.end_date,
        reason: conflict.reason
      }));

      return res.status(409).json({
        success: false,
        message: 'Ce véhicule est déjà réservé pour cette période',
        data: {
          conflictingReservations: conflictDetails
        }
      });
    }

    const reservationId = generateUUID();
    const now = new Date().toISOString();

    // Insérer la réservation
    db.prepare(`
      INSERT INTO reservations (id, user_id, vehicle_id, start_date, end_date, reason, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(reservationId, userId, vehicleId, startDate, endDate, reason, 'confirmed', now, now);

    // Mettre à jour le statut du véhicule en 'reserved'
    db.prepare(`
      UPDATE vehicles 
      SET status = 'reserved', updated_at = ?
      WHERE id = ?
    `).run(now, vehicleId);

    // Récupérer la réservation avec les relations
    const reservation = db.prepare(`
      SELECT r.*, 
             v.id as vehicle_id_full,
             v.brand as vehicle_brand,
             v.model as vehicle_model,
             v.registration_number as vehicle_registration_number,
             u.id as user_id_full,
             u.email as user_email,
             u.first_name as user_first_name,
             u.last_name as user_last_name
      FROM reservations r
      LEFT JOIN vehicles v ON r.vehicle_id = v.id
      LEFT JOIN users u ON r.user_id = u.id
      WHERE r.id = ?
    `).get(reservationId);

    // Formater la réponse pour correspondre au format attendu
    const formattedReservation = {
      id: reservation.id,
      user_id: reservation.user_id,
      vehicle_id: reservation.vehicle_id,
      start_date: reservation.start_date,
      end_date: reservation.end_date,
      reason: reservation.reason,
      status: reservation.status,
      created_at: reservation.created_at,
      updated_at: reservation.updated_at,
      vehicle: {
        id: reservation.vehicle_id_full,
        brand: reservation.vehicle_brand,
        model: reservation.vehicle_model,
        registration_number: reservation.vehicle_registration_number
      },
      user: {
        id: reservation.user_id_full,
        email: reservation.user_email,
        first_name: reservation.user_first_name,
        last_name: reservation.user_last_name
      }
    };

    return res.status(201).json({
      success: true,
      message: 'Réservation créée avec succès',
      data: { reservation: formattedReservation }
    });
  } catch (error) {
    console.error('Create reservation error:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de la réservation'
    });
  }
};

export const getUserReservations = async (req, res) => {
  try {
    const userId = req.user.userId;

    const reservations = db.prepare(`
      SELECT r.*,
             v.id as vehicle_id_full,
             v.brand as vehicle_brand,
             v.model as vehicle_model,
             v.registration_number as vehicle_registration_number,
             v.status as vehicle_status
      FROM reservations r
      LEFT JOIN vehicles v ON r.vehicle_id = v.id
      WHERE r.user_id = ?
      ORDER BY r.created_at DESC
    `).all(userId);

    // Formater les réservations
    const formattedReservations = reservations.map(r => ({
      id: r.id,
      user_id: r.user_id,
      vehicle_id: r.vehicle_id,
      start_date: r.start_date,
      end_date: r.end_date,
      reason: r.reason,
      status: r.status,
      created_at: r.created_at,
      updated_at: r.updated_at,
      vehicle: {
        id: r.vehicle_id_full,
        brand: r.vehicle_brand,
        model: r.vehicle_model,
        registration_number: r.vehicle_registration_number,
        status: r.vehicle_status
      }
    }));

    return res.status(200).json({
      success: true,
      data: { reservations: formattedReservations }
    });
  } catch (error) {
    console.error('Get user reservations error:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des réservations'
    });
  }
};

export const getAllReservations = async (req, res) => {
  try {
    const reservations = db.prepare(`
      SELECT r.*,
             v.id as vehicle_id_full,
             v.brand as vehicle_brand,
             v.model as vehicle_model,
             v.registration_number as vehicle_registration_number,
             u.id as user_id_full,
             u.email as user_email,
             u.first_name as user_first_name,
             u.last_name as user_last_name
      FROM reservations r
      LEFT JOIN vehicles v ON r.vehicle_id = v.id
      LEFT JOIN users u ON r.user_id = u.id
      ORDER BY r.created_at DESC
    `).all();

    // Formater les réservations
    const formattedReservations = reservations.map(r => ({
      id: r.id,
      user_id: r.user_id,
      vehicle_id: r.vehicle_id,
      start_date: r.start_date,
      end_date: r.end_date,
      reason: r.reason,
      status: r.status,
      created_at: r.created_at,
      updated_at: r.updated_at,
      vehicle: {
        id: r.vehicle_id_full,
        brand: r.vehicle_brand,
        model: r.vehicle_model,
        registration_number: r.vehicle_registration_number
      },
      user: {
        id: r.user_id_full,
        email: r.user_email,
        first_name: r.user_first_name,
        last_name: r.user_last_name
      }
    }));

    return res.status(200).json({
      success: true,
      data: { reservations: formattedReservations }
    });
  } catch (error) {
    console.error('Get all reservations error:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des réservations'
    });
  }
};

export const getReservationById = async (req, res) => {
  try {
    const { id } = req.params;

    const reservation = db.prepare(`
      SELECT r.*,
             v.id as vehicle_id_full,
             v.brand as vehicle_brand,
             v.model as vehicle_model,
             v.registration_number as vehicle_registration_number,
             u.id as user_id_full,
             u.email as user_email,
             u.first_name as user_first_name,
             u.last_name as user_last_name
      FROM reservations r
      LEFT JOIN vehicles v ON r.vehicle_id = v.id
      LEFT JOIN users u ON r.user_id = u.id
      WHERE r.id = ?
    `).get(id);

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: 'Réservation non trouvée'
      });
    }

    // Formater la réservation
    const formattedReservation = {
      id: reservation.id,
      user_id: reservation.user_id,
      vehicle_id: reservation.vehicle_id,
      start_date: reservation.start_date,
      end_date: reservation.end_date,
      reason: reservation.reason,
      status: reservation.status,
      created_at: reservation.created_at,
      updated_at: reservation.updated_at,
      vehicle: {
        id: reservation.vehicle_id_full,
        brand: reservation.vehicle_brand,
        model: reservation.vehicle_model,
        registration_number: reservation.vehicle_registration_number
      },
      user: {
        id: reservation.user_id_full,
        email: reservation.user_email,
        first_name: reservation.user_first_name,
        last_name: reservation.user_last_name
      }
    };

    return res.status(200).json({
      success: true,
      data: { reservation: formattedReservation }
    });
  } catch (error) {
    console.error('Get reservation error:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de la réservation'
    });
  }
};

export const cancelReservation = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const reservation = db.prepare(`
      SELECT * FROM reservations 
      WHERE id = ? AND user_id = ?
    `).get(id, userId);

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: 'Réservation non trouvée'
      });
    }

    if (reservation.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Cette réservation est déjà annulée'
      });
    }

    const now = new Date().toISOString();
    db.prepare(`
      UPDATE reservations 
      SET status = ?, updated_at = ?
      WHERE id = ?
    `).run('cancelled', now, id);

    // Vérifier s'il reste des réservations actives pour ce véhicule
    const activeReservations = db.prepare(`
      SELECT COUNT(*) as count FROM reservations
      WHERE vehicle_id = ? 
        AND status IN ('confirmed', 'pending')
    `).get(reservation.vehicle_id);

    // Si aucune réservation active, remettre le véhicule à 'available'
    if (activeReservations.count === 0) {
      db.prepare(`
        UPDATE vehicles 
        SET status = 'available', updated_at = ?
        WHERE id = ?
      `).run(now, reservation.vehicle_id);
    }

    const updatedReservation = db.prepare(`
      SELECT r.*,
             v.id as vehicle_id_full,
             v.brand as vehicle_brand,
             v.model as vehicle_model,
             v.registration_number as vehicle_registration_number,
             u.id as user_id_full,
             u.email as user_email,
             u.first_name as user_first_name,
             u.last_name as user_last_name
      FROM reservations r
      LEFT JOIN vehicles v ON r.vehicle_id = v.id
      LEFT JOIN users u ON r.user_id = u.id
      WHERE r.id = ?
    `).get(id);

    // Formater la réservation
    const formattedReservation = {
      id: updatedReservation.id,
      user_id: updatedReservation.user_id,
      vehicle_id: updatedReservation.vehicle_id,
      start_date: updatedReservation.start_date,
      end_date: updatedReservation.end_date,
      reason: updatedReservation.reason,
      status: updatedReservation.status,
      created_at: updatedReservation.created_at,
      updated_at: updatedReservation.updated_at,
      vehicle: {
        id: updatedReservation.vehicle_id_full,
        brand: updatedReservation.vehicle_brand,
        model: updatedReservation.vehicle_model,
        registration_number: updatedReservation.vehicle_registration_number
      },
      user: {
        id: updatedReservation.user_id_full,
        email: updatedReservation.user_email,
        first_name: updatedReservation.user_first_name,
        last_name: updatedReservation.user_last_name
      }
    };

    return res.status(200).json({
      success: true,
      message: 'Réservation annulée avec succès',
      data: { reservation: formattedReservation }
    });
  } catch (error) {
    console.error('Cancel reservation error:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'annulation de la réservation'
    });
  }
};
