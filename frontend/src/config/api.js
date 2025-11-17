/**
 * Configuración de la API
 * Centraliza la URL del backend para facilitar cambios
 */

// URL base del backend - cambiar según el entorno
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Endpoints de la API
export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: `${API_BASE_URL}/api/auth/register`,
    LOGIN: `${API_BASE_URL}/api/auth/login`,
  },
  PRODUCTS: {
    BASE: `${API_BASE_URL}/api/products`,
    BY_ID: (id) => `${API_BASE_URL}/api/products/${id}`,
  },
};

// Función para verificar la conexión con el backend
// Usa el endpoint raíz que no requiere autenticación
export const checkBackendConnection = async () => {
  try {
    // Intentar hacer una petición GET al endpoint raíz
    // Esto no requiere autenticación y solo verifica que el servidor responda
    const response = await fetch(`${API_BASE_URL}/`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    
    // Si el servidor responde (cualquier status 200-599), significa que está conectado
    // Solo falla si es un error de red (CORS, servidor caído, etc.)
    const isConnected = response.status !== 0;
    
    return {
      connected: isConnected,
      status: response.status,
      message: isConnected 
        ? 'Backend conectado' 
        : `Backend no responde (${response.status})`,
    };
  } catch (error) {
    // Error de red (CORS, servidor caído, etc.)
    return {
      connected: false,
      status: 0,
      message: `Error de conexión: ${error.message}`,
      error: error.message,
    };
  }
};


