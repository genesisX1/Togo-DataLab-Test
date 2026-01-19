import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { vehiclesAPI, reservationsAPI } from '../services/api';
import { Car, Calendar, LogOut, Clock } from 'lucide-react';
import VehicleCard from '../components/VehicleCard';
import ReservationModal from '../components/ReservationModal';
import MyReservations from '../components/MyReservations';

interface Vehicle {
  id: string;
  brand: string;
  model: string;
  registration_number: string;
  status: string;
}

interface Reservation {
  id: string;
  vehicle_id: string;
  start_date: string;
  end_date: string;
  reason: string;
  status: string;
  vehicle: Vehicle;
  created_at: string;
}

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [currentView, setCurrentView] = useState<'vehicles' | 'reservations'>('vehicles');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [vehiclesRes, reservationsRes] = await Promise.all([
        vehiclesAPI.getAll(),
        reservationsAPI.getUserReservations()
      ]);

      if (vehiclesRes.success) {
        setVehicles(vehiclesRes.data.vehicles);
      }

      if (reservationsRes.success) {
        setReservations(reservationsRes.data.reservations);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReservationSuccess = () => {
    setSelectedVehicle(null);
    loadData();
  };

  const handleCancelReservation = async (reservationId: string) => {
    try {
      const result = await reservationsAPI.cancel(reservationId);
      if (result.success) {
        loadData();
      }
    } catch (error) {
      console.error('Error canceling reservation:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <nav className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-slate-900 p-2 rounded-lg">
                <Car className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">
                  Gestion de Réservations
                </h1>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-slate-900">
                  {user?.first_name} {user?.last_name}
                </p>
                <p className="text-xs text-slate-600">{user?.email}</p>
              </div>
              <button
                onClick={logout}
                className="flex items-center space-x-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition"
              >
                <LogOut className="w-4 h-4" />
                <span>Déconnexion</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex space-x-4 mb-8">
          <button
            onClick={() => setCurrentView('vehicles')}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition ${
              currentView === 'vehicles'
                ? 'bg-slate-900 text-white'
                : 'bg-white text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Car className="w-5 h-5" />
            <span>Véhicules Disponibles</span>
          </button>

          <button
            onClick={() => setCurrentView('reservations')}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition ${
              currentView === 'reservations'
                ? 'bg-slate-900 text-white'
                : 'bg-white text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Calendar className="w-5 h-5" />
            <span>Mes Réservations</span>
            {reservations.length > 0 && (
              <span className="bg-slate-700 text-white px-2 py-0.5 rounded-full text-xs">
                {reservations.filter(r => r.status !== 'cancelled').length}
              </span>
            )}
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center space-x-3 text-slate-600">
              <Clock className="w-6 h-6 animate-spin" />
              <span className="text-lg">Chargement...</span>
            </div>
          </div>
        ) : currentView === 'vehicles' ? (
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-6">
              Véhicules Disponibles
            </h2>
            {vehicles.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                <Car className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600">Aucun véhicule disponible</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {vehicles.map((vehicle) => (
                  <VehicleCard
                    key={vehicle.id}
                    vehicle={vehicle}
                    onReserve={() => setSelectedVehicle(vehicle)}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <MyReservations
            reservations={reservations}
            onCancel={handleCancelReservation}
          />
        )}
      </div>

      {selectedVehicle && (
        <ReservationModal
          vehicle={selectedVehicle}
          onClose={() => setSelectedVehicle(null)}
          onSuccess={handleReservationSuccess}
        />
      )}
    </div>
  );
}
