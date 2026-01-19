import { Calendar, Car, Clock, XCircle, CheckCircle } from 'lucide-react';

interface Vehicle {
  brand: string;
  model: string;
  registration_number: string;
}

interface Reservation {
  id: string;
  vehicle_id: string;
  start_date: string;
  end_date: string;
  reason: string;
  status: string;
  vehicle: Vehicle;
  created_at?: string;
}

interface MyReservationsProps {
  reservations: Reservation[];
  onCancel: (reservationId: string) => void;
}

export default function MyReservations({ reservations, onCancel }: MyReservationsProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusInfo = (status: string) => {
    const configs = {
      confirmed: {
        label: 'Confirmée',
        color: 'bg-green-100 text-green-800 border-green-200',
        icon: CheckCircle
      },
      cancelled: {
        label: 'Annulée',
        color: 'bg-red-100 text-red-800 border-red-200',
        icon: XCircle
      },
      completed: {
        label: 'Terminée',
        color: 'bg-slate-100 text-slate-800 border-slate-200',
        icon: CheckCircle
      },
      pending: {
        label: 'En attente',
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        icon: Clock
      }
    };

    return configs[status as keyof typeof configs] || configs.pending;
  };

  const activeReservations = reservations.filter(r => r.status !== 'cancelled');
  const cancelledReservations = reservations.filter(r => r.status === 'cancelled');

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-900 mb-6">Mes Réservations</h2>

      {reservations.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <Calendar className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-600">Aucune réservation</p>
        </div>
      ) : (
        <div className="space-y-6">
          {activeReservations.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">
                Réservations actives
              </h3>
              <div className="grid gap-4">
                {activeReservations.map((reservation) => {
                  const statusInfo = getStatusInfo(reservation.status);
                  const StatusIcon = statusInfo.icon;

                  return (
                    <div
                      key={reservation.id}
                      className="bg-white rounded-xl shadow-sm p-6 border border-slate-200 hover:shadow-md transition"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="bg-slate-900 p-2 rounded-lg">
                            <Car className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-slate-900">
                              {reservation.vehicle.brand} {reservation.vehicle.model}
                            </h4>
                            <p className="text-sm text-slate-600">
                              {reservation.vehicle.registration_number}
                            </p>
                          </div>
                        </div>
                        <div className={`flex items-center space-x-2 px-3 py-1 rounded-full border ${statusInfo.color}`}>
                          <StatusIcon className="w-4 h-4" />
                          <span className="text-xs font-medium">{statusInfo.label}</span>
                        </div>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center space-x-2 text-sm text-slate-600">
                          <Calendar className="w-4 h-4" />
                          <span>Du {formatDate(reservation.start_date)}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-slate-600">
                          <Calendar className="w-4 h-4" />
                          <span>Au {formatDate(reservation.end_date)}</span>
                        </div>
                      </div>

                      <div className="bg-slate-50 rounded-lg p-3 mb-4">
                        <p className="text-sm font-medium text-slate-700 mb-1">Motif:</p>
                        <p className="text-sm text-slate-600">{reservation.reason}</p>
                      </div>

                      {reservation.status === 'confirmed' && (
                        <button
                          onClick={() => onCancel(reservation.id)}
                          className="w-full flex items-center justify-center space-x-2 px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition font-medium"
                        >
                          <XCircle className="w-4 h-4" />
                          <span>Annuler la réservation</span>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {cancelledReservations.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">
                Réservations annulées
              </h3>
              <div className="grid gap-4">
                {cancelledReservations.map((reservation) => {
                  const statusInfo = getStatusInfo(reservation.status);
                  const StatusIcon = statusInfo.icon;

                  return (
                    <div
                      key={reservation.id}
                      className="bg-white rounded-xl shadow-sm p-6 border border-slate-200 opacity-75"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="bg-slate-300 p-2 rounded-lg">
                            <Car className="w-5 h-5 text-slate-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-slate-700">
                              {reservation.vehicle.brand} {reservation.vehicle.model}
                            </h4>
                            <p className="text-sm text-slate-500">
                              {reservation.vehicle.registration_number}
                            </p>
                          </div>
                        </div>
                        <div className={`flex items-center space-x-2 px-3 py-1 rounded-full border ${statusInfo.color}`}>
                          <StatusIcon className="w-4 h-4" />
                          <span className="text-xs font-medium">{statusInfo.label}</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center space-x-2 text-sm text-slate-500">
                          <Calendar className="w-4 h-4" />
                          <span>Du {formatDate(reservation.start_date)}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-slate-500">
                          <Calendar className="w-4 h-4" />
                          <span>Au {formatDate(reservation.end_date)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
