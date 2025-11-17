import { authService } from './authService';
import { API_ENDPOINTS } from '../config/api';

// Product Service
export const productService = {
  async getProducts() {
    const token = localStorage.getItem('token');
    const response = await fetch(API_ENDPOINTS.PRODUCTS.BASE, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      let errorMessage = 'Error al obtener productos';
      try {
        const error = await response.json();
        errorMessage = error?.message || error?.error || errorMessage;
      } catch (e) {
        errorMessage = 'Error de conexión con el servidor';
      }
      throw new Error(errorMessage);
    }
    
    const data = await response.json();
    // El backend devuelve { success: true, data: products }
    // Convertimos a { products: [...] } para mantener compatibilidad
    return {
      products: data.data || data.products || []
    };
  },

  async createProduct(productData, imageFile = null) {
    const token = localStorage.getItem('token');
    const user = authService.getUser();
    
    // Obtener userId - el backend devuelve 'usuario' con 'id'
    const userId = user?.id || user?._id;
    
    if (!userId) {
      throw new Error('No se pudo obtener el ID del usuario. Por favor, inicia sesión nuevamente.');
    }
    
    // Si hay imagen, usar FormData, sino JSON normal
    if (imageFile) {
      const formData = new FormData();
      formData.append('image', imageFile);
      
      // Agregar todos los campos del producto
      Object.keys(productData).forEach(key => {
        if (productData[key] !== undefined && productData[key] !== null && productData[key] !== '') {
          // Convertir números a string para FormData
          const value = typeof productData[key] === 'number' ? String(productData[key]) : productData[key];
          formData.append(key, value);
        }
      });
      
      formData.append('userId', String(userId));
      
      const response = await fetch(API_ENDPOINTS.PRODUCTS.BASE, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      if (!response.ok) {
        let errorMessage = 'Error al crear producto';
        try {
          const error = await response.json();
          errorMessage = error?.error || error?.message || errorMessage;
          // Traducir errores comunes
          if (errorMessage.includes('Cannot read properties')) {
            errorMessage = 'Error: No se pudieron procesar los datos del producto';
          }
        } catch (e) {
          errorMessage = 'Error de conexión con el servidor';
        }
        throw new Error(errorMessage);
      }
      
      return response.json();
    } else {
      // Sin imagen, usar JSON
      const response = await fetch(API_ENDPOINTS.PRODUCTS.BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        ...productData,
          userId: userId
      })
    });
    
    if (!response.ok) {
      let errorMessage = 'Error al crear producto';
      try {
        const error = await response.json();
        errorMessage = error?.error || error?.message || errorMessage;
        // Traducir errores comunes
        if (errorMessage.includes('Cannot read properties')) {
          errorMessage = 'Error: No se pudieron procesar los datos del producto';
        }
      } catch (e) {
        errorMessage = 'Error de conexión con el servidor';
      }
      throw new Error(errorMessage);
    }
      
      return response.json();
    }
  },

  async updateProduct(id, productData, imageFile = null) {
    const token = localStorage.getItem('token');
    
    // Si hay imagen, usar FormData, sino JSON normal
    if (imageFile) {
      const formData = new FormData();
      formData.append('image', imageFile);
      
      // Agregar todos los campos del producto
      Object.keys(productData).forEach(key => {
        if (productData[key] !== undefined && productData[key] !== null && productData[key] !== '') {
          // Convertir números a string para FormData
          const value = typeof productData[key] === 'number' ? String(productData[key]) : productData[key];
          formData.append(key, value);
        }
      });
      
      const response = await fetch(API_ENDPOINTS.PRODUCTS.BY_ID(id), {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      if (!response.ok) {
        let errorMessage = 'Error al actualizar producto';
        try {
          const error = await response.json();
          errorMessage = error?.message || error?.error || errorMessage;
          // Si el error es un objeto, intentar extraer el mensaje
          if (typeof errorMessage === 'object') {
            errorMessage = JSON.stringify(errorMessage);
          }
        } catch (e) {
          errorMessage = 'Error de conexión con el servidor';
        }
        throw new Error(errorMessage);
      }
      
      return response.json();
    } else {
      // Sin imagen, usar JSON
      const response = await fetch(API_ENDPOINTS.PRODUCTS.BY_ID(id), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(productData)
      });
    
      if (!response.ok) {
        let errorMessage = 'Error al actualizar producto';
        try {
          const error = await response.json();
          errorMessage = error?.message || error?.error || errorMessage;
          // Si el error es un objeto, intentar extraer el mensaje
          if (typeof errorMessage === 'object') {
            errorMessage = JSON.stringify(errorMessage);
          }
        } catch (e) {
          errorMessage = 'Error de conexión con el servidor';
        }
        throw new Error(errorMessage);
      }
      
      return response.json();
    }
  },

  async deleteProduct(id) {
    const token = localStorage.getItem('token');
    const response = await fetch(API_ENDPOINTS.PRODUCTS.BY_ID(id), {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Error al eliminar producto');
    }
    
    return response.json();
  }
};
