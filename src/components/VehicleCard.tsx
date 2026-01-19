import { Car, Calendar } from 'lucide-react';

interface Vehicle {
  id: string;
  brand: string;
  model: string;
  registration_number: string;
  status: string;
}

interface VehicleCardProps {
  vehicle: Vehicle;
  onReserve: () => void;
}

export default function VehicleCard({ vehicle, onReserve }: VehicleCardProps) {
  const statusColors = {
    available: 'bg-green-100 text-green-800',
    maintenance: 'bg-orange-100 text-orange-800',
    reserved: 'bg-slate-100 text-slate-800'
  };

  const statusLabels = {
    available: 'Disponible',
    maintenance: 'Maintenance',
    reserved: 'Réservé'
  };

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition p-6 border border-slate-200">
      <div className="flex items-start justify-between mb-4">
        <div className="bg-slate-900 p-3 rounded-lg">
          <Car className="w-6 h-6 text-white" />
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[vehicle.status as keyof typeof statusColors]}`}>
          {statusLabels[vehicle.status as keyof typeof statusLabels]}
        </span>
      </div>

      <h3 className="text-xl font-bold text-slate-900 mb-1">
        {vehicle.brand} {vehicle.model}
      </h3>
      <p className="text-slate-600 text-sm mb-4">
        Immatriculation: {vehicle.registration_number}
      </p>

      <button
        onClick={onReserve}
        disabled={vehicle.status !== 'available'}
        className="w-full flex items-center justify-center space-x-2 bg-slate-900 text-white py-3 rounded-lg font-medium hover:bg-slate-800 transition disabled:bg-slate-300 disabled:cursor-not-allowed"
      >
        <Calendar className="w-4 h-4" />
        <span>Réserver</span>
      </button>
    </div>
  );
}
