import { API_ENDPOINTS } from '../config/api';

// Auth Service
export const authService = {
  async register(name, email, password) {
    const response = await fetch(API_ENDPOINTS.AUTH.REGISTER, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error en el registro');
    }
    
    const data = await response.json();
    localStorage.setItem('token', data.token);
    // El backend devuelve 'usuario', no 'user'
    const userData = data.usuario || data.user;
    localStorage.setItem('user', JSON.stringify(userData));
    return { ...data, user: userData };
  },

  async login(email, password) {
    const response = await fetch(API_ENDPOINTS.AUTH.LOGIN, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error en el login');
    }
    
    const data = await response.json();
    localStorage.setItem('token', data.token);
    // El backend devuelve 'usuario', no 'user'
    const userData = data.usuario || data.user;
    localStorage.setItem('user', JSON.stringify(userData));
    return { ...data, user: userData };
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getToken() {
    return localStorage.getItem('token');
  },

  getUser() {
    const user = localStorage.getItem('user');
    return (user && user !== 'undefined') ? JSON.parse(user) : null;
  },

  isAuthenticated() {
    return !!this.getToken();
  }
};