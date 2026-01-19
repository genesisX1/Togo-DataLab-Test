import db from '../config/database.js';

export const getAllVehicles = async (req, res) => {
  try {
    const vehicles = db.prepare('SELECT * FROM vehicles ORDER BY created_at DESC').all();

    return res.status(200).json({
      success: true,
      data: { vehicles }
    });
  } catch (error) {
    console.error('Get vehicles error:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des véhicules'
    });
  }
};

export const getVehicleById = async (req, res) => {
  try {
    const { id } = req.params;

    const vehicle = db.prepare('SELECT * FROM vehicles WHERE id = ?').get(id);

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Véhicule non trouvé'
      });
    }

    return res.status(200).json({
      success: true,
      data: { vehicle }
    });
  } catch (error) {
    console.error('Get vehicle error:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du véhicule'
    });
  }
};

export const checkVehicleAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Les dates de début et de fin sont requises'
      });
    }

    const vehicle = db.prepare('SELECT * FROM vehicles WHERE id = ?').get(id);

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Véhicule non trouvé'
      });
    }

    // Vérifier les réservations qui chevauchent
    const overlappingReservations = db.prepare(`
      SELECT * FROM reservations
      WHERE vehicle_id = ?
        AND status IN ('confirmed', 'pending')
        AND start_date <= ?
        AND end_date >= ?
    `).all(id, endDate, startDate);

    const isAvailable = overlappingReservations.length === 0;

    return res.status(200).json({
      success: true,
      data: {
        vehicle,
        available: isAvailable,
        conflictingReservations: overlappingReservations
      }
    });
  } catch (error) {
    console.error('Check availability error:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la vérification de la disponibilité'
    });
  }
};
