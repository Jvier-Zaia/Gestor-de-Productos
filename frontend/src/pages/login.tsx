import React, { useState, type FC, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/authService";
import { sanitizeEmail, sanitizeString, validatePassword } from "../utils/sanitize";
import { EyeIcon, EyeOffIcon } from "../components/Icons";

interface LoginProps {
  onLoginSuccess?: () => void;
}

const Login: FC<LoginProps> = ({ onLoginSuccess }) => {
  const navigate = useNavigate();
  const [view, setView] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({ name: '', email: '', password: '' });
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      
      // Sanitizar datos
      const sanitizedEmail = sanitizeEmail(loginData.email);
      const validatedPassword = validatePassword(loginData.password);
      
      const data = await authService.login(sanitizedEmail, validatedPassword);
      
      // Verificar que se guardó correctamente
      // El backend devuelve 'usuario', pero authService lo convierte a 'user'
      if (data.token && (data.user || data.usuario)) {
        // Verificar que se guardó en localStorage
        const savedToken = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');
        
        if (!savedToken || !savedUser) {
          throw new Error('Error: No se pudo guardar la sesión');
        }
        
        // Actualizar el estado primero
        onLoginSuccess?.();
        
        // Pequeño delay para asegurar que el estado se actualice antes de navegar
        await new Promise(resolve => setTimeout(resolve, 150));
        
        // Navegar al dashboard
        navigate('/dashboard', { replace: true });
      } else {
        throw new Error('Error: No se recibió token o usuario del servidor');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      
      // Sanitizar y validar datos
      const sanitizedName = sanitizeString(registerData.name);
      if (!sanitizedName || sanitizedName.length < 2) {
        throw new Error('El nombre debe tener al menos 2 caracteres');
      }
      
      const sanitizedEmail = sanitizeEmail(registerData.email);
      const validatedPassword = validatePassword(registerData.password, 6);
      
      const data = await authService.register(sanitizedName, sanitizedEmail, validatedPassword);
      
      // Si el registro devuelve token y usuario, redirigir al dashboard
      if (data.token && data.user) {
        // Pequeño delay para asegurar que el estado se actualice
        onLoginSuccess?.();
        setTimeout(() => {
          navigate('/dashboard');
        }, 100);
      } else {
        // Si no, mostrar mensaje y cambiar a login
      alert('✅ Registro exitoso! Ahora puedes iniciar sesión');
      setView('login');
      setRegisterData({ name: '', email: '', password: '' });
        // Pre-llenar el email en el formulario de login
        setLoginData({ ...loginData, email: sanitizedEmail });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4"
      style={{ 
        backgroundColor: '#B8D9BE'
      }}
    >
      <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 max-w-md w-full">
        <div className="flex mb-6 rounded-lg p-1" style={{ backgroundColor: '#e8f5e9' }}>
          <button
            onClick={() => setView('login')}
            className={`flex-1 py-2 rounded-lg font-semibold transition ${
              view === 'login' ? 'bg-white shadow' : 'text-gray-600'
            }`}
            style={view === 'login' ? { color: '#03A80E' } : {}}
          >
            Iniciar Sesión
          </button>
          <button
            onClick={() => setView('register')}
            className={`flex-1 py-2 rounded-lg font-semibold transition ${
              view === 'register' ? 'bg-white shadow' : 'text-gray-600'
            }`}
            style={view === 'register' ? { color: '#03A80E' } : {}}
          >
            Registrarse
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {view === 'login' ? (
          <form onSubmit={handleLogin}>
            <h2 className="text-2xl font-bold mb-6" style={{ color: '#335943' }}>Iniciar Sesión</h2>
            
            <div className="mb-4">
              <label className="block font-semibold mb-2" style={{ color: '#258F4F' }}>Email</label>
              <input
                type="email"
                value={loginData.email}
                onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 transition"
                style={{ 
                  focusRingColor: '#03A80E',
                  '--tw-ring-color': '#03A80E'
                }}
                onFocus={(e) => e.target.style.borderColor = '#03A80E'}
                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                placeholder="tu@email.com"
                required
              />
            </div>

            <div className="mb-6">
              <label className="block font-semibold mb-2" style={{ color: '#258F4F' }}>Contraseña</label>
              <div className="relative">
                <input
                  type={showLoginPassword ? "text" : "password"}
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 transition"
                  onFocus={(e) => e.target.style.borderColor = '#03A80E'}
                  onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none transition"
                  aria-label={showLoginPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showLoginPassword ? (
                    <EyeOffIcon className="w-5 h-5" fill="currentColor" />
                  ) : (
                    <EyeIcon className="w-5 h-5" fill="currentColor" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full text-white py-3 rounded-lg font-semibold transition disabled:bg-gray-400 disabled:cursor-not-allowed"
              style={{ 
                backgroundColor: loading ? '#9ca3af' : '#03A80E',
              }}
              onMouseEnter={(e) => !loading && (e.currentTarget.style.backgroundColor = '#028a0c')}
              onMouseLeave={(e) => !loading && (e.currentTarget.style.backgroundColor = '#03A80E')}
            >
              {loading ? 'Iniciando...' : 'Iniciar Sesión'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister}>
            <h2 className="text-2xl font-bold mb-6" style={{ color: '#335943' }}>Crear Cuenta</h2>
            
            <div className="mb-4">
              <label className="block font-semibold mb-2" style={{ color: '#258F4F' }}>Nombre</label>
              <input
                type="text"
                value={registerData.name}
                onChange={(e) => {
                  const sanitized = sanitizeString(e.target.value);
                  setRegisterData({ ...registerData, name: sanitized });
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none transition"
                placeholder="Tu nombre"
                required
                minLength={2}
                maxLength={50}
              />
            </div>

            <div className="mb-4">
              <label className="block font-semibold mb-2" style={{ color: '#258F4F' }}>Email</label>
              <input
                type="email"
                value={registerData.email}
                onChange={(e) => setRegisterData({ ...registerData, email: e.target.value.toLowerCase() })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none transition"
                placeholder="tu@email.com"
                required
              />
            </div>

            <div className="mb-6">
              <label className="block font-semibold mb-2" style={{ color: '#258F4F' }}>Contraseña</label>
              <div className="relative">
                <input
                  type={showRegisterPassword ? "text" : "password"}
                  value={registerData.password}
                  onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none transition"
                  onFocus={(e) => e.target.style.borderColor = '#03A80E'}
                  onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none transition"
                  aria-label={showRegisterPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showRegisterPassword ? (
                    <EyeOffIcon className="w-5 h-5" fill="currentColor" />
                  ) : (
                    <EyeIcon className="w-5 h-5" fill="currentColor" />
                  )}
                </button>
              </div>
              <p className="text-xs mt-1" style={{ color: '#6b7280' }}>Mínimo 6 caracteres</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full text-white py-3 rounded-lg font-semibold transition disabled:bg-gray-400 disabled:cursor-not-allowed"
              style={{ 
                backgroundColor: loading ? '#9ca3af' : '#03A80E',
              }}
              onMouseEnter={(e) => !loading && (e.currentTarget.style.backgroundColor = '#028a0c')}
              onMouseLeave={(e) => !loading && (e.currentTarget.style.backgroundColor = '#03A80E')}
            >
              {loading ? 'Registrando...' : 'Crear Cuenta'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Login;