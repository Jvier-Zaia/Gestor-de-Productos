import { Navigate, useLocation } from 'react-router-dom';
import { authService } from '../services/authService';

/**
 * Componente para rutas públicas que redirige si ya está autenticado
 * Pero permite el acceso durante el proceso de login/registro
 */
export const PublicRoute = ({ children }) => {
  const location = useLocation();
  const isAuthenticated = authService.isAuthenticated();
  const user = authService.getUser();

  // Solo redirigir si está autenticado Y no está en proceso de login/registro
  // Esto evita loops de redirección
  if (isAuthenticated && user && location.pathname === '/login') {
    // Redirigir al dashboard si ya está autenticado y está en login
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

