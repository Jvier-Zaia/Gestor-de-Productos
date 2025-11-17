import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import Login from '../pages/login';
import Dashboard from '../pages/dashboard';
import Products from '../components/Products';
import { Cart } from '../components/cart';
import { ProtectedRoute } from './ProtectedRoute';
import { PublicRoute } from './PublicRoute';
import { authService } from '../services/authService';
import { useState, useEffect } from 'react';

/**
 * Componente principal de rutas de la aplicación
 */
export const AppRoutes = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar si hay un usuario autenticado al cargar
    const checkAuth = () => {
      const savedUser = authService.getUser();
      const isAuth = authService.isAuthenticated();
      
      if (savedUser && isAuth) {
        setUser(savedUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    };
    
    checkAuth();
    
    // Escuchar cambios en localStorage para actualizar el estado
    const handleStorageChange = () => {
      checkAuth();
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const handleLoginSuccess = () => {
    // Forzar actualización del estado del usuario inmediatamente
    const checkAndUpdateUser = () => {
      const savedUser = authService.getUser();
      const isAuth = authService.isAuthenticated();
      
      if (savedUser && isAuth) {
        setUser(savedUser);
        return true;
      }
      return false;
    };
    
    // Intentar varias veces para asegurar que se actualice
    checkAndUpdateUser();
    setTimeout(() => checkAndUpdateUser(), 50);
    setTimeout(() => checkAndUpdateUser(), 200);
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
  };

  const handleRefresh = () => {
    // Función para refrescar datos cuando sea necesario
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Routes>
      {/* Ruta pública - Login */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Layout user={user} onLogout={handleLogout}>
              <Login onLoginSuccess={handleLoginSuccess} />
            </Layout>
          </PublicRoute>
        }
      />

      {/* Rutas protegidas */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Layout user={user} onLogout={handleLogout}>
              <Dashboard user={user} />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/products"
        element={
          <ProtectedRoute>
            <Layout user={user} onLogout={handleLogout}>
              <Products onRefresh={handleRefresh} />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/cart"
        element={
          <ProtectedRoute>
            <Layout user={user} onLogout={handleLogout}>
              <Cart />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Ruta por defecto - redirige según autenticación */}
      <Route
        path="/"
        element={
          authService.isAuthenticated() ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* Ruta 404 - cualquier otra ruta */}
      <Route
        path="*"
        element={
          <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
              <p className="text-gray-600 mb-6">Página no encontrada</p>
              <a
                href="/"
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
              >
                Volver al inicio
              </a>
            </div>
          </div>
        }
      />
      </Routes>
    </>
  );
};

