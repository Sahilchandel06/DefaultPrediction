import React, { useEffect } from 'react';

function Notification({ message, type }) {
  useEffect(() => {
    const timer = setTimeout(() => {}, 3000);
    return () => clearTimeout(timer);
  }, []);

  const baseStyles = 'fixed bottom-6 right-6 px-4 py-3 rounded-lg shadow-lg text-white z-50 flex items-start max-w-sm';
  const typeStyles = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
    warning: 'bg-yellow-400 text-gray-800',
  };

  const iconMap = {
    success: 'fa-check-circle',
    error: 'fa-exclamation-circle',
    info: 'fa-info-circle',
    warning: 'fa-exclamation-triangle'
  };

  return (
    <div className={`${baseStyles} ${typeStyles[type] || typeStyles.info} animate-fade-in-up`}>
      <i className={`fas ${iconMap[type] || iconMap.info} mt-1 mr-3`}></i>
      <div>
        <div className="font-medium">
          {type === 'success' && 'Success!'}
          {type === 'error' && 'Error!'}
          {type === 'info' && 'Info'}
          {type === 'warning' && 'Warning'}
        </div>
        <div className="text-sm">{message}</div>
      </div>
    </div>
  );
}

export default Notification;