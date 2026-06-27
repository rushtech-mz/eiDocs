'use client';

import React, { useEffect } from 'react';
import { X, CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';

export interface ToastData {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  persistent?: boolean;
}

interface ToastProps {
  toast: ToastData;
  onClose: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  const { id, type, title, message, duration = 5000, persistent = false } = toast;

  useEffect(() => {
    if (!persistent && duration > 0) {
      const timer = setTimeout(() => {
        onClose(id);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [id, duration, persistent, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-500" />;
      default:
        return null;
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'info':
        return 'bg-green-50 border-green-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getTextColor = () => {
    switch (type) {
      case 'success':
        return 'text-green-800';
      case 'error':
        return 'text-red-800';
      case 'warning':
        return 'text-yellow-800';
      case 'info':
        return 'text-green-800';
      default:
        return 'text-gray-800';
    }
  };

  return (
    <div
      className={`
        relative max-w-sm w-full p-4 mb-3 border rounded-lg shadow-lg
        transform transition-all duration-300 ease-in-out
        animate-in slide-in-from-right-full
        ${getBackgroundColor()}
      `}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0 mr-3">
          {getIcon()}
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className={`text-sm font-semibold ${getTextColor()}`}>
            {title}
          </h4>
          {message && (
            <p className={`text-xs mt-1 opacity-75 ${getTextColor()}`}>
              {message}
            </p>
          )}
        </div>

        <button
          onClick={() => onClose(id)}
          className={`
            flex-shrink-0 ml-2 p-1 rounded-md hover:bg-black/10 
            transition-colors duration-150 ${getTextColor()}
          `}
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {!persistent && duration > 0 && (
        <div
          className={`
            absolute bottom-0 left-0 h-1 bg-current opacity-30 rounded-bl-lg
            animate-[shrink_${duration}ms_linear_forwards]
          `}
          style={{
            animation: `shrink ${duration}ms linear forwards`,
          }}
        />
      )}
    </div>
  );
};

export default Toast;
