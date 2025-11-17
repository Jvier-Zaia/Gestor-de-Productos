import React, { useState, useEffect } from 'react';
import { checkBackendConnection, API_BASE_URL } from '../config/api';

/**
 * Componente para mostrar el estado de conexión con el backend
 */
export const BackendStatus = () => {
  const [status, setStatus] = useState({
    connected: null,
    loading: true,
    message: '',
  });

  useEffect(() => {
    const verifyConnection = async () => {
      setStatus({ connected: null, loading: true, message: 'Verificando conexión...' });
      const result = await checkBackendConnection();
      setStatus({
        connected: result.connected,
        loading: false,
        message: result.message,
      });
    };

    verifyConnection();
    
    // Verificar cada 30 segundos
    const interval = setInterval(verifyConnection, 30000);
    
    return () => clearInterval(interval);
  }, []);

  if (status.loading) {
    return (
      <div className="fixed bottom-4 right-4 bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-2 rounded-lg shadow-lg text-sm">
        <div className="flex items-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600"></div>
          <span>{status.message}</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`fixed bottom-4 right-4 px-4 py-2 rounded-lg shadow-lg text-sm ${
        status.connected
          ? 'bg-green-100 border border-green-400 text-green-800'
          : 'bg-red-100 border border-red-400 text-red-800'
      }`}
    >
      <div className="flex items-center gap-2">
        <span className={status.connected ? 'text-green-600' : 'text-red-600'}>
          {status.connected ? '✓' : '✗'}
        </span>
        <div>
          <div className="font-semibold">
            {status.connected ? 'Backend Conectado' : 'Backend Desconectado'}
          </div>
          <div className="text-xs mt-1">{status.message}</div>
          <div className="text-xs mt-1 opacity-75">URL: {API_BASE_URL}</div>
        </div>
      </div>
    </div>
  );
};

