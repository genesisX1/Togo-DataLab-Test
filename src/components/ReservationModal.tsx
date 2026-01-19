import { useState } from 'react';
import { reservationsAPI } from '../services/api';
import { X, Calendar, AlertCircle } from 'lucide-react';

interface Vehicle {
  id: string;
  brand: string;
  model: string;
  registration_number: string;
}

interface ReservationModalProps {
  vehicle: Vehicle;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ReservationModal({ vehicle, onClose, onSuccess }: ReservationModalProps) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [conflictDetails, setConflictDetails] = useState<Array<{start_date: string; end_date: string; reason: string}>>([]);
  const [isLoading, setIsLoading] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setConflictDetails([]);

    // Validation côté client
    if (new Date(endDate) <= new Date(startDate)) {
      setError('La date de fin doit être après la date de début');
      return;
    }

    // Vérifier que la date de début n'est pas dans le passé
    if (new Date(startDate) < new Date()) {
      setError('La date de début ne peut pas être dans le passé');
      return;
    }

    setIsLoading(true);

    try {
      const result = await reservationsAPI.create(
        vehicle.id,
        new Date(startDate).toISOString(),
        new Date(endDate).toISOString(),
        reason
      );

      if (!result.success) {
        setError(result.message);
        // Si des conflits sont retournés, les afficher
        if (result.data?.conflictingReservations) {
          setConflictDetails(result.data.conflictingReservations);
        }
        return;
      }

      onSuccess();
    } catch (err) {
      setError('Erreur lors de la création de la réservation');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div className="flex items-center space-x-3">
            <div className="bg-slate-900 p-2 rounded-lg">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">
              Réserver un véhicule
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="bg-slate-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-slate-900 mb-1">
              {vehicle.brand} {vehicle.model}
            </h3>
            <p className="text-sm text-slate-600">
              Immatriculation: {vehicle.registration_number}
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-start space-x-3 mb-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700 font-medium">{error}</p>
              </div>
              {conflictDetails.length > 0 && (
                <div className="mt-3 pl-8">
                  <p className="text-xs font-semibold text-red-800 mb-2">Périodes en conflit :</p>
                  <ul className="space-y-2">
                    {conflictDetails.map((conflict, index) => (
                      <li key={index} className="text-xs text-red-700">
                        <span className="font-medium">Du {formatDate(conflict.start_date)}</span>
                        {' '}au{' '}
                        <span className="font-medium">{formatDate(conflict.end_date)}</span>
                        {conflict.reason && (
                          <span className="block text-red-600 mt-1">Motif: {conflict.reason}</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-slate-700 mb-2">
                Date de début
              </label>
              <input
                type="datetime-local"
                id="startDate"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setError('');
                  setConflictDetails([]);
                }}
                min={new Date().toISOString().slice(0, 16)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition"
                required
              />
            </div>

            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-slate-700 mb-2">
                Date de fin
              </label>
              <input
                type="datetime-local"
                id="endDate"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setError('');
                  setConflictDetails([]);
                }}
                min={startDate || new Date().toISOString().slice(0, 16)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition"
                required
              />
            </div>

            <div>
              <label htmlFor="reason" className="block text-sm font-medium text-slate-700 mb-2">
                Motif de la réservation
              </label>
              <textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition resize-none"
                rows={3}
                placeholder="Déplacement professionnel, mission, etc."
                required
              />
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 px-4 py-3 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition disabled:bg-slate-400 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Réservation...' : 'Confirmer'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
