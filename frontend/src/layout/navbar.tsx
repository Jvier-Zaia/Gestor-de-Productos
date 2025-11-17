import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { StoreIcon, DashboardIcon, ProductsIcon, CartIcon, UserIcon, LogoutIcon, LoginIcon } from "../components/Icons";

type User = {
  name: string;
};

type NavbarProps = {
  user?: User | null;
  onLogout: () => void;
};

export const Navbar = ({ user, onLogout }: NavbarProps) => {
  const [cartCount] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav 
      className="shadow-lg"
      style={{
        background: `linear-gradient(to right, #2A5E3C, #6BBF8D)`
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="text-white text-2xl font-bold hover:opacity-80 transition flex items-center gap-2">
              <StoreIcon className="w-7 h-7" fill="currentColor" />
              <span>Mi Tienda</span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className={`px-4 py-2 rounded-lg font-semibold transition flex items-center gap-2 ${
                    isActive('/dashboard')
                      ? 'bg-white'
                      : 'text-white hover:opacity-80'
                  }`}
                  style={isActive('/dashboard') ? { color: '#2A5E3C' } : {}}
                >
                  <DashboardIcon className="w-5 h-5" fill="currentColor" />
                  <span>Dashboard</span>
                </Link>
                <Link
                  to="/products"
                  className={`px-4 py-2 rounded-lg font-semibold transition flex items-center gap-2 ${
                    isActive('/products')
                      ? 'bg-white'
                      : 'text-white hover:opacity-80'
                  }`}
                  style={isActive('/products') ? { color: '#2A5E3C' } : {}}
                >
                  <ProductsIcon className="w-5 h-5" fill="currentColor" />
                  <span>Mis Productos</span>
                </Link>
                <Link
                  to="/cart"
                  className={`relative px-4 py-2 rounded-lg font-semibold transition flex items-center gap-2 ${
                    isActive('/cart')
                      ? 'bg-white'
                      : 'text-white hover:opacity-80'
                  }`}
                  style={isActive('/cart') ? { color: '#2A5E3C' } : {}}
                >
                  <CartIcon className="w-5 h-5" fill="currentColor" />
                  <span>Carrito</span>
                  {cartCount > 0 && (
                    <span 
                      className="absolute -top-1 -right-1 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
                      style={{ backgroundColor: '#433DF2' }}
                    >
                      {cartCount}
                    </span>
                  )}
                </Link>
                <div 
                  className="border-l h-8 mx-2"
                  style={{ borderColor: 'rgba(255, 255, 255, 0.3)' }}
                ></div>
                <span className="text-white font-semibold flex items-center gap-2">
                  <UserIcon className="w-5 h-5" fill="currentColor" />
                  <span>{user.name}</span>
                </span>
                <button
                  onClick={handleLogout}
                  className="text-white px-4 py-2 rounded-lg transition font-semibold flex items-center gap-2"
                  style={{ 
                    backgroundColor: '#433DF2',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#5a52f5'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#433DF2'}
                >
                  <LogoutIcon className="w-5 h-5" fill="currentColor" />
                  <span>Cerrar Sesión</span>
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="bg-white px-6 py-2 rounded-lg hover:bg-gray-100 transition font-semibold flex items-center gap-2"
                style={{ color: '#2A5E3C' }}
              >
                <LoginIcon className="w-5 h-5" fill="currentColor" />
                <span>Iniciar Sesión</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};