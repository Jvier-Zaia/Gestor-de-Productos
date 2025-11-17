import React from 'react';

export const Cart = () => {
  return (
    <div 
      className="min-h-[calc(100vh-4rem)] p-8"
      style={{ backgroundColor: '#ABC7B1' }}
    >
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">🛒 Mi Carrito</h1>
        
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-6xl mb-4">🛒</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Tu carrito está vacío</h2>
          <p className="text-gray-600 mb-6">
            Esta funcionalidad estará disponible próximamente cuando agregues el endpoint en el backend.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
            <h3 className="font-bold text-blue-800 mb-2">💡 Próximas funcionalidades:</h3>
            <ul className="text-blue-700 space-y-1">
              <li>• Agregar productos al carrito</li>
              <li>• Ver resumen de compra</li>
              <li>• Procesar pagos</li>
              <li>• Historial de pedidos</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
