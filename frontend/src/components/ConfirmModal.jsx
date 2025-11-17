import React from 'react';

export const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirmar', cancelText = 'Cancelar', type = 'danger' }) => {
  if (!isOpen) return null;

  const bgColor = {
    danger: 'bg-red-500',
    warning: 'bg-yellow-500',
    info: 'bg-blue-500'
  }[type];

  const buttonColor = {
    danger: 'bg-red-600 hover:bg-red-700',
    warning: 'bg-yellow-600 hover:bg-yellow-700',
    info: 'bg-blue-600 hover:bg-blue-700'
  }[type];

  const icon = {
    danger: '⚠️',
    warning: '⚠️',
    info: 'ℹ️'
  }[type];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay transparente */}
      <div 
        className="fixed inset-0 bg-transparent transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 transform transition-all animate-modal-in">
        <div className="p-6">
          {/* Icono y título */}
          <div className="flex items-center gap-4 mb-4">
            <div className={`${bgColor} text-white rounded-full w-12 h-12 flex items-center justify-center text-2xl`}>
              {icon}
            </div>
            <h3 className="text-xl font-bold text-gray-900">{title}</h3>
          </div>
          
          {/* Mensaje */}
          <p className="text-gray-600 mb-6 ml-16">{message}</p>
          
          {/* Botones */}
          <div className="flex gap-3 justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition"
            >
              {cancelText}
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`px-6 py-2 ${buttonColor} text-white rounded-lg font-semibold transition shadow-lg hover:shadow-xl`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

