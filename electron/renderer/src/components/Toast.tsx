import React from 'react';
import { useToast } from '../contexts/ToastContext';

interface ToastProps {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

const Toast: React.FC<ToastProps> = ({ id, message, type }) => {
  const { removeToast } = useToast();
  
  const bgColor = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500'
  }[type];

  return (
    <div className={`${bgColor} text-white p-4 rounded shadow-lg`}>
      <div className="flex justify-between items-center">
        <span>{message}</span>
        <button onClick={() => removeToast(id)} className="ml-4 text-xl">
          ×
        </button>
      </div>
    </div>
  );
};

export default Toast;
