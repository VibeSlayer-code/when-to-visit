import React, { useEffect } from 'react';

const Toast = ({ message, type = 'info', onClose, duration = 2500 }) => {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [message, onClose, duration]);

  if (!message) return null;

  let bg = 'bg-primary-500';
  if (type === 'success') bg = 'bg-green-500';
  if (type === 'error') bg = 'bg-red-500';
  if (type === 'warning') bg = 'bg-yellow-400 text-gray-900';

  return (
    <div className={`fixed top-6 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-xl shadow-lg text-white font-medium text-base transition-all ${bg}`}
      style={{ minWidth: 220, maxWidth: 360 }}
      role="alert"
    >
      <div className="flex items-center justify-between">
        <span>{message}</span>
        <button onClick={onClose} className="ml-4 text-lg font-bold focus:outline-none">×</button>
      </div>
    </div>
  );
};

export default Toast;
