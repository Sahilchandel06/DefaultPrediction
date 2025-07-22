// src/components/Notification.jsx
import React, { useEffect } from 'react';

function Notification({ message, type }) {
  useEffect(() => {
    const timer = setTimeout(() => {}, 3000);
    return () => clearTimeout(timer);
  }, []);

  const baseStyles = 'fixed bottom-6 right-6 px-4 py-3 rounded shadow-md text-white z-50';
  const typeStyles = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
    warning: 'bg-yellow-500 text-black',
  };

  return (
    <div className={`${baseStyles} ${typeStyles[type] || typeStyles.info}`}>
      {message}
    </div>
  );
}

export default Notification;
