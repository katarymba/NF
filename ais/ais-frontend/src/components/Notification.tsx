// src/components/Notification.tsx
import React, { useState, useEffect } from 'react';

interface NotificationProps {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  onClose?: () => void;
}

const Notification: React.FC<NotificationProps> = ({ 
  message, 
  type, 
  duration = 3000, 
  onClose 
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onClose) onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-100 dark:bg-green-800 border-green-500';
      case 'error':
        return 'bg-red-100 dark:bg-red-800 border-red-500';
      case 'warning':
        return 'bg-yellow-100 dark:bg-yellow-800 border-yellow-500';
      case 'info':
      default:
        return 'bg-blue-100 dark:bg-blue-800 border-blue-500';
    }
  };

  const getTextColor = () => {
    switch (type) {
      case 'success':
        return 'text-green-800 dark:text-green-200';
      case 'error':
        return 'text-red-800 dark:text-red-200';
      case 'warning':
        return 'text-yellow-800 dark:text-yellow-200';
      case 'info':
      default:
        return 'text-blue-800 dark:text-blue-200';
    }
  };

  if (!isVisible) return null;

  return (
    <div className={`fixed top-4 right-4 z-50 max-w-sm p-4 rounded-lg border-l-4 shadow-md ${getBackgroundColor()} ${getTextColor()}`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p>{message}</p>
        </div>
        <button
          onClick={() => {
            setIsVisible(false);
            if (onClose) onClose();
          }}
          className={`ml-4 ${getTextColor()} hover:opacity-70`}
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Notification;