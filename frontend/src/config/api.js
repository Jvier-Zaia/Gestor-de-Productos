/**
 * Configuración de la API
 * Centraliza la URL del backend para facilitar cambios
 */

// URL base del backend - cambiar según el entorno
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Endpoints de la API
export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: `${API_BASE_URL}/auth/register`,  // ← QUITADO /api/
    LOGIN: `${API_BASE_URL}/auth/login`,        // ← QUITADO /api/
  },
  PRODUCTS: {
    BASE: `${API_BASE_URL}/products`,           // ← QUITADO /api/
    BY_ID: (id) => `${API_BASE_URL}/products/${id}`,  // ← QUITADO /api/
  },
};

// Función para verificar la conexión con el backend
export const checkBackendConnection = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    
    const isConnected = response.status !== 0;
    
    return {
      connected: isConnected,
      status: response.status,
      message: isConnected 
        ? 'Backend conectado' 
        : `Backend no responde (${response.status})`,
    };
  } catch (error) {
    return {
      connected: false,
      status: 0,
      message: `Error de conexión: ${error.message}`,
      error: error.message,
    };
  }
};

