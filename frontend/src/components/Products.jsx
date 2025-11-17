import { useState, useEffect } from 'react';
import { productService } from '../services/productServices';
import { sanitizeObject, sanitizeString, sanitizeNumber, sanitizeHTML, sanitizeProductName } from '../utils/sanitize';
import { useToast } from '../hooks/useToast';
import { ToastContainer } from './Toast';
import { ConfirmModal } from './ConfirmModal';
import { AddIcon, EditIcon, DeleteIcon, SaveIcon, CancelIcon, SearchIcon } from './Icons';

const Products = ({ onRefresh }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    sku: '',
    category: 'other'
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const { toasts, success, error: showError, removeToast } = useToast();
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, productId: null, productName: '' });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await productService.getProducts();
      setProducts(data?.products || []);
      setError(null);
      onRefresh?.();
    } catch (err) {
      let errorMessage = err?.message || 'Error al cargar productos';
      // Traducir mensajes de error comunes al español
      if (errorMessage.includes('Cannot read properties of undefined')) {
        errorMessage = 'Error: No se pudieron cargar los productos. Por favor, recarga la página.';
      } else if (errorMessage.includes('reading')) {
        errorMessage = 'Error: Falta información requerida. Por favor, verifica tu conexión.';
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar productos basado en el término de búsqueda
  const filteredProducts = products.filter(product => {
    if (!searchTerm.trim()) return true;
    
    const search = searchTerm.toLowerCase().trim();
    const name = (product?.name || '').toLowerCase();
    const description = (product?.description || '').toLowerCase();
    const sku = (product?.sku || '').toLowerCase();
    const category = (product?.category || '').toLowerCase();
    const price = String(product?.price || '');
    const stock = String(product?.stock || '');
    
    return (
      name.includes(search) ||
      description.includes(search) ||
      sku.includes(search) ||
      category.includes(search) ||
      price.includes(search) ||
      stock.includes(search)
    );
  });

  const handleEdit = (product) => {
    if (!product || !product._id) {
      showError('Error: No se pudo cargar la información del producto');
      return;
    }
    
    try {
      setEditingProductId(product._id);
      setFormData({
        name: product?.name || '',
        description: product?.description || '',
        price: product?.price || '',
        stock: product?.stock || '',
        sku: product?.sku || '',
        category: product?.category || 'other'
      });
      // Si el producto tiene imagen, mostrar preview
      if (product?.imageUrl) {
        const imageUrl = product.imageUrl.startsWith('http') 
          ? product.imageUrl 
          : `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}${product.imageUrl}`;
        setImagePreview(imageUrl);
      } else {
        setImagePreview(null);
      }
      setSelectedImage(null);
      setShowForm(true);
      setFormErrors({});
      // Scroll suave al formulario
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      showError('Error al cargar los datos del producto para editar');
      console.error('Error en handleEdit:', err);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingProductId(null);
    setFormData({ name: '', description: '', price: '', stock: '', sku: '', category: 'other' });
    setImagePreview(null);
    setSelectedImage(null);
    setFormErrors({});
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validar tipo de archivo
      if (!file.type.match('image.*')) {
        showError('Por favor selecciona un archivo de imagen válido');
        return;
      }
      // Validar tamaño (5MB máximo)
      if (file.size > 5 * 1024 * 1024) {
        showError('La imagen no debe superar los 5MB');
        return;
      }
      setSelectedImage(file);
      // Crear preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    try {
      setFormErrors({});
      
      let sanitized = {};
      
      if (editingProductId) {
        // En modo edición, solo sanitizar campos que tienen valores
        if (formData.name && formData.name.trim()) {
          sanitized.name = sanitizeProductName(formData.name).trim();
          if (sanitized.name.length < 2) {
            throw new Error('El nombre debe tener al menos 2 caracteres');
          }
        }
        if (formData.description && formData.description.trim()) {
          sanitized.description = sanitizeProductName(formData.description).trim();
        }
        if (formData.price !== '' && formData.price !== undefined && formData.price !== null) {
          sanitized.price = sanitizeNumber(formData.price);
          if (sanitized.price <= 0) {
            throw new Error('El precio debe ser mayor a 0');
          }
        }
        if (formData.stock !== '' && formData.stock !== undefined && formData.stock !== null) {
          sanitized.stock = sanitizeNumber(formData.stock, { allowDecimals: false });
          if (sanitized.stock < 0) {
            throw new Error('El stock no puede ser negativo');
          }
        }
        if (formData.sku !== '' && formData.sku !== undefined && formData.sku !== null) {
          sanitized.sku = sanitizeString(formData.sku.replace(/\s/g, ''), false, false).trim().toUpperCase();
          if (sanitized.sku.length > 0 && sanitized.sku.length < 3) {
            throw new Error('El SKU debe tener al menos 3 caracteres si se proporciona');
          }
        }
        if (formData.category && formData.category !== '') {
          sanitized.category = formData.category;
        }
        
        // Verificar que al menos un campo se está editando
        if (Object.keys(sanitized).length === 0) {
          throw new Error('Debes editar al menos un campo');
        }
        
        await productService.updateProduct(editingProductId, sanitized, selectedImage);
        success('Producto actualizado exitosamente');
      } else {
        // En modo creación, todos los campos requeridos deben estar presentes
        sanitized = {
          name: sanitizeProductName(formData.name).trim(),
          description: sanitizeProductName(formData.description).trim(),
          price: sanitizeNumber(formData.price),
          stock: sanitizeNumber(formData.stock, { allowDecimals: false }),
          sku: formData.sku ? sanitizeString(formData.sku.replace(/\s/g, ''), false, false).trim().toUpperCase() : '',
          category: formData.category || 'other'
        };
        
        if (!sanitized.name || sanitized.name.length < 2) {
          throw new Error('El nombre debe tener al menos 2 caracteres');
        }
        
        if (sanitized.price <= 0) {
          throw new Error('El precio debe ser mayor a 0');
        }
        
        if (sanitized.stock < 0) {
          throw new Error('El stock no puede ser negativo');
        }
        
        if (sanitized.sku && sanitized.sku.length > 0 && sanitized.sku.length < 3) {
          throw new Error('El SKU debe tener al menos 3 caracteres si se proporciona');
        }
        
        await productService.createProduct(sanitized, selectedImage);
        success('Producto creado exitosamente');
      }
      
      handleCancel();
      loadProducts();
    } catch (err) {
      const errorMessage = err?.message || `Error al ${editingProductId ? 'actualizar' : 'crear'} producto`;
      // Traducir mensajes de error comunes al español
      let translatedMessage = errorMessage;
      if (errorMessage.includes('Cannot read properties of undefined')) {
        translatedMessage = 'Error: No se pudo acceder a los datos. Por favor, recarga la página.';
      } else if (errorMessage.includes('reading')) {
        translatedMessage = 'Error: Falta información requerida. Por favor, verifica los datos.';
      }
      setFormErrors({ submit: translatedMessage });
      showError(translatedMessage);
    }
  };

  const handleDeleteClick = (product) => {
    if (!product || !product._id) {
      showError('Error: No se pudo obtener la información del producto');
      return;
    }
    
    setDeleteModal({
      isOpen: true,
      productId: product._id,
      productName: product?.name || 'este producto'
    });
  };

  const handleDeleteConfirm = async () => {
    try {
      if (!deleteModal.productId) {
        showError('Error: No se pudo identificar el producto a eliminar');
        setDeleteModal({ isOpen: false, productId: null, productName: '' });
        return;
      }
      
      await productService.deleteProduct(deleteModal.productId);
      loadProducts();
      success('Producto eliminado exitosamente');
      setDeleteModal({ isOpen: false, productId: null, productName: '' });
    } catch (err) {
      let errorMessage = err?.message || 'Error al eliminar producto';
      // Traducir mensajes de error comunes al español
      if (errorMessage.includes('Cannot read properties of undefined')) {
        errorMessage = 'Error: No se pudo acceder a los datos del producto. Por favor, recarga la página.';
      } else if (errorMessage.includes('reading')) {
        errorMessage = 'Error: Falta información requerida para eliminar el producto.';
      }
      showError(errorMessage);
      setDeleteModal({ isOpen: false, productId: null, productName: '' });
    }
  };

  if (loading) {
    return (
      <div 
        className="min-h-[calc(100vh-4rem)] flex items-center justify-center"
        style={{ backgroundColor: '#ABC7B1' }}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando productos...</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-[calc(100vh-4rem)] p-4 sm:p-6 md:p-8"
      style={{ backgroundColor: '#ABC7B1' }}
    >
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, productId: null, productName: '' })}
        onConfirm={handleDeleteConfirm}
        title="Eliminar Producto"
        message={`¿Estás seguro de que deseas eliminar "${deleteModal.productName}"? Esta acción no se puede deshacer.`}
        confirmText="Sí, eliminar"
        cancelText="Cancelar"
        type="danger"
      />
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-6 sm:mb-8">Mis Productos</h1>

        <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row gap-3 sm:gap-4">
          <div className="flex-1 relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              <SearchIcon className="w-5 h-5" fill="currentColor" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar productos por nombre, descripción, SKU, categoría, precio o stock..."
              className="w-full pl-10 pr-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-sm sm:text-base"
              onFocus={(e) => e.target.style.borderColor = '#6940DB'}
              onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
            />
          </div>
          <button
            onClick={() => {
              if (showForm) {
                handleCancel();
              } else {
                setShowForm(true);
                setEditingProductId(null);
                setFormData({ name: '', description: '', price: '', stock: '', sku: '', category: 'other' });
                setImagePreview(null);
                setSelectedImage(null);
              }
            }}
            className="w-full sm:w-auto text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold transition text-sm sm:text-base flex items-center justify-center gap-2 whitespace-nowrap"
            style={{ 
              backgroundColor: showForm ? '#6b7280' : '#6940DB',
            }}
            onMouseEnter={(e) => !showForm && (e.currentTarget.style.backgroundColor = '#5a35c2')}
            onMouseLeave={(e) => !showForm && (e.currentTarget.style.backgroundColor = '#6940DB')}
          >
            {showForm ? (
              <>
                <CancelIcon className="w-5 h-5" fill="currentColor" />
                <span>Cancelar</span>
              </>
            ) : (
              <>
                <AddIcon className="w-5 h-5" fill="currentColor" />
                <span>Agregar Producto</span>
              </>
            )}
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-lg shadow-lg p-4 sm:p-5 md:p-6 mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
              <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                {editingProductId ? (
                  <>
                    <EditIcon className="w-6 h-6" fill="currentColor" />
                    <span>Editar Producto</span>
                  </>
                ) : (
                  <>
                    <AddIcon className="w-6 h-6" fill="currentColor" />
                    <span>Nuevo Producto</span>
                  </>
                )}
              </h2>
              {editingProductId && (
                <p className="text-xs sm:text-sm text-gray-500">
                  Puedes editar solo los campos que necesites cambiar
                </p>
              )}
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Nombre {!editingProductId && '*'}
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => {
                      // Usar sanitizeProductName que permite espacios
                      const sanitized = sanitizeProductName(e.target.value);
                      setFormData({ ...formData, name: sanitized });
                      if (formErrors.name) setFormErrors({ ...formErrors, name: '' });
                    }}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                      formErrors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder={editingProductId ? "Dejar vacío para no cambiar" : "Ej: Laptop Dell Inspiron 15"}
                    maxLength={100}
                  />
                  {formErrors.name && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    SKU <span className="text-gray-400 text-sm font-normal">(Opcional)</span>
                  </label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) => {
                      // SKU sin espacios, solo letras, números y guiones
                      const sanitized = sanitizeString(e.target.value.replace(/\s/g, ''), false, false).toUpperCase();
                      setFormData({ ...formData, sku: sanitized });
                      if (formErrors.sku) setFormErrors({ ...formErrors, sku: '' });
                    }}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                      formErrors.sku ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Ej: LAP-DELL-001 (opcional)"
                    maxLength={50}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Código único para inventario (opcional)
                  </p>
                  {formErrors.sku && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.sku}</p>
                  )}
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Categoría {!editingProductId && '*'}
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => {
                      setFormData({ ...formData, category: e.target.value });
                      if (formErrors.category) setFormErrors({ ...formErrors, category: '' });
                    }}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                      formErrors.category ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="electronics">Electrónica</option>
                    <option value="clothing">Ropa</option>
                    <option value="food">Comida</option>
                    <option value="books">Libros</option>
                    <option value="toys">Juguetes</option>
                    <option value="other">Otros</option>
                  </select>
                  {formErrors.category && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.category}</p>
                  )}
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Precio {!editingProductId && '*'}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => {
                      const value = e.target.value;
                      setFormData({ ...formData, price: value });
                      if (formErrors.price) setFormErrors({ ...formErrors, price: '' });
                    }}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                      formErrors.price ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder={editingProductId ? "Dejar vacío para no cambiar" : "0.00"}
                  />
                  {formErrors.price && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.price}</p>
                  )}
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Stock {!editingProductId && '*'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.stock}
                    onChange={(e) => {
                      const value = e.target.value;
                      setFormData({ ...formData, stock: value });
                      if (formErrors.stock) setFormErrors({ ...formErrors, stock: '' });
                    }}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                      formErrors.stock ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder={editingProductId ? "Dejar vacío para no cambiar" : "0"}
                  />
                  {formErrors.stock && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.stock}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Descripción {!editingProductId && '*'}
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => {
                    // Descripción permite espacios y saltos de línea
                    const sanitized = sanitizeProductName(e.target.value);
                    setFormData({ ...formData, description: sanitized });
                    if (formErrors.description) setFormErrors({ ...formErrors, description: '' });
                  }}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                    formErrors.description ? 'border-red-500' : 'border-gray-300'
                  }`}
                  rows="3"
                  placeholder={editingProductId ? "Dejar vacío para no cambiar" : "Describe el producto con detalles..."}
                  maxLength={500}
                />
                {formErrors.description && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.description}</p>
                )}
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Imagen {!editingProductId && <span className="text-gray-400 text-sm font-normal">(Opcional)</span>}
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Formatos: JPG, PNG, GIF, WEBP. Tamaño máximo: 5MB
                </p>
                {imagePreview && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-600 mb-2">Vista previa:</p>
                    <div className="relative inline-block w-full max-w-xs sm:max-w-sm md:max-w-md">
                      <div className="relative w-full aspect-[4/3] rounded-lg border border-gray-300 bg-gray-50 overflow-hidden">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-full object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setImagePreview(null);
                            setSelectedImage(null);
                          }}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center hover:bg-red-600 transition text-sm sm:text-base"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {formErrors.submit && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {formErrors.submit}
                </div>
              )}
              <div className="flex gap-3">
                <button
                  onClick={handleCancel}
                  className="flex-1 bg-gray-500 text-white py-3 rounded-lg font-semibold hover:bg-gray-600 transition flex items-center justify-center gap-2"
                >
                  <CancelIcon className="w-5 h-5" fill="currentColor" />
                  <span>Cancelar</span>
                </button>
                <button
                  onClick={handleSubmit}
                  className="flex-1 text-white py-3 rounded-lg font-semibold transition disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  style={{ 
                    backgroundColor: loading ? '#9ca3af' : '#6940DB',
                  }}
                  onMouseEnter={(e) => !loading && (e.currentTarget.style.backgroundColor = '#5a35c2')}
                  onMouseLeave={(e) => !loading && (e.currentTarget.style.backgroundColor = '#6940DB')}
                  disabled={loading}
                >
                  <SaveIcon className="w-5 h-5" fill="currentColor" />
                  <span>{editingProductId ? 'Actualizar Producto' : 'Guardar Producto'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {searchTerm && (
          <div className="mb-4 text-sm text-gray-600">
            {filteredProducts.length === 0 ? (
              <p>No se encontraron productos que coincidan con "{searchTerm}"</p>
            ) : (
              <p>
                {filteredProducts.length} {filteredProducts.length === 1 ? 'producto encontrado' : 'productos encontrados'}
                {searchTerm && ` para "${searchTerm}"`}
              </p>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
          {products.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500 text-lg">No tienes productos aún</p>
              <p className="text-gray-400">Haz clic en "Agregar Producto" para comenzar</p>
            </div>
          ) : filteredProducts.length === 0 && searchTerm ? (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500 text-lg">No se encontraron productos</p>
              <p className="text-gray-400">Intenta con otro término de búsqueda</p>
            </div>
          ) : (
            filteredProducts.map((product) => {
              const imageUrl = product.imageUrl 
                ? (product.imageUrl.startsWith('http') 
                    ? product.imageUrl 
                    : `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}${product.imageUrl}`)
                : null;
              
              return (
              <div key={product._id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition flex flex-col">
                <div className="w-full aspect-[4/3] overflow-hidden bg-gray-100 flex items-center justify-center">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-gray-400 h-full">
                      <span className="text-3xl sm:text-4xl md:text-5xl mb-2">🖼️</span>
                      <p className="text-xs sm:text-sm">Sin imagen</p>
                    </div>
                  )}
                </div>
                <div className="p-4 sm:p-5 md:p-6 flex-1 flex flex-col">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-3">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 break-words">{product.name}</h3>
                    {product.sku && (
                      <span className="bg-gray-100 text-gray-700 text-xs font-semibold px-2 py-1 rounded self-start sm:self-auto">
                        {product.sku}
                      </span>
                    )}
                  </div>
                  
                  <p className="text-gray-600 mb-4 text-sm line-clamp-2 sm:line-clamp-3 flex-1">{product.description}</p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-sm sm:text-base">Precio:</span>
                      <span className="font-bold text-green-600 text-base sm:text-lg">${product.price}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-sm sm:text-base">Stock:</span>
                      <span className={`font-semibold text-sm sm:text-base ${product.stock < 10 ? 'text-red-600' : 'text-gray-900'}`}>
                        {product.stock} unidades
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 mt-auto">
                    <button
                      onClick={() => handleEdit(product)}
                      className="flex-1 text-white py-2 sm:py-2.5 rounded-lg font-semibold text-sm sm:text-base flex items-center justify-center gap-2 transition-all duration-300 ease-in-out transform hover:scale-105 active:scale-95"
                      style={{ 
                        backgroundColor: '#0E9E51',
                        boxShadow: '0 2px 4px rgba(14, 158, 81, 0.3)',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#0d8d47';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(14, 158, 81, 0.5)';
                        e.currentTarget.style.transform = 'scale(1.05)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#0E9E51';
                        e.currentTarget.style.boxShadow = '0 2px 4px rgba(14, 158, 81, 0.3)';
                        e.currentTarget.style.transform = 'scale(1)';
                      }}
                    >
                      <EditIcon className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300" fill="currentColor" />
                      <span>Editar</span>
                    </button>
                    <button
                      onClick={() => handleDeleteClick(product)}
                      className="flex-1 text-white py-2 sm:py-2.5 rounded-lg font-semibold text-sm sm:text-base flex items-center justify-center gap-2 relative overflow-hidden transition-all duration-300 ease-in-out transform hover:scale-105 active:scale-95"
                      style={{ 
                        backgroundColor: '#FF0044',
                        boxShadow: '0 2px 4px rgba(255, 0, 68, 0.3)',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#cc0036';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(255, 0, 68, 0.5)';
                        e.currentTarget.style.transform = 'scale(1.05)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#FF0044';
                        e.currentTarget.style.boxShadow = '0 2px 4px rgba(255, 0, 68, 0.3)';
                        e.currentTarget.style.transform = 'scale(1)';
                      }}
                    >
                      <DeleteIcon className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300" fill="currentColor" style={{ transform: 'translateZ(0)' }} />
                      <span className="relative z-10">Eliminar</span>
                    </button>
                  </div>
                </div>
              </div>
            )})
          )}
        </div>
      </div>
    </div>
  );
};

export default Products;