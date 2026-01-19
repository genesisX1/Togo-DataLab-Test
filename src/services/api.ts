const API_BASE_URL = 'http://localhost:3001/api';

const getAuthHeader = (): Record<string, string> => {
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
};

export const vehiclesAPI = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/vehicles`, {
      headers: getAuthHeader()
    });
    return response.json();
  },

  getById: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/vehicles/${id}`, {
      headers: getAuthHeader()
    });
    return response.json();
  },

  checkAvailability: async (id: string, startDate: string, endDate: string) => {
    const response = await fetch(
      `${API_BASE_URL}/vehicles/${id}/availability?startDate=${startDate}&endDate=${endDate}`,
      {
        headers: getAuthHeader()
      }
    );
    return response.json();
  }
};

export const reservationsAPI = {
  create: async (vehicleId: string, startDate: string, endDate: string, reason: string) => {
    const response = await fetch(`${API_BASE_URL}/reservations`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify({ vehicleId, startDate, endDate, reason })
    });
    return response.json();
  },

  getUserReservations: async () => {
    const response = await fetch(`${API_BASE_URL}/reservations/my-reservations`, {
      headers: getAuthHeader()
    });
    return response.json();
  },

  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/reservations`, {
      headers: getAuthHeader()
    });
    return response.json();
  },

  getById: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/reservations/${id}`, {
      headers: getAuthHeader()
    });
    return response.json();
  },

  cancel: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/reservations/${id}`, {
      method: 'DELETE',
      headers: getAuthHeader()
    });
    return response.json();
  }
};
