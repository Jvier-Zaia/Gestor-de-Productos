import { Navigate } from 'react-router-dom';
import { authService } from '../services/authService';

/**
 * Componente para proteger rutas que requieren autenticación
 * Verifica directamente en localStorage para evitar problemas de sincronización
 */
export const ProtectedRoute = ({ children }) => {
  // Verificar autenticación directamente desde el servicio
  const token = authService.getToken();
  const user = authService.getUser();
  const isAuthenticated = !!token && !!user;

  if (!isAuthenticated) {
    // Limpiar cualquier dato corrupto
    if (token && !user) {
      authService.logout();
    }
    // Redirigir al login si no está autenticado
    return <Navigate to="/login" replace />;
  }

  return children;
};

