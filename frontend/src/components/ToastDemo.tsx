'use client';

import React from 'react';
import { useToastContext } from '@/contexts/ToastContext';

const ToastDemo: React.FC = () => {
  const { success, error, warning, info } = useToastContext();

  const showSuccess = () => {
    success('Operação realizada!', 'O departamento foi criado com sucesso.');
  };

  const showError = () => {
    error(
      'Erro ao salvar',
      'Não foi possível excluir o departamento. Existem 5 categoria(s) vinculada(s).',
      { persistent: true }
    );
  };

  const showWarning = () => {
    warning('Atenção', 'Esta operação não pode ser desfeita.', { duration: 3000 });
  };

  const showInfo = () => {
    info('Informação', 'Os dados foram sincronizados automaticamente.');
  };

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-2xl font-bold mb-4">Sistema de Toasts</h2>
      
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={showSuccess}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
        >
          Mostrar Sucesso
        </button>
        
        <button
          onClick={showError}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
        >
          Mostrar Erro
        </button>
        
        <button
          onClick={showWarning}
          className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors"
        >
          Mostrar Aviso
        </button>
        
        <button
          onClick={showInfo}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
        >
          Mostrar Info
        </button>
      </div>
    </div>
  );
};

export default ToastDemo;
