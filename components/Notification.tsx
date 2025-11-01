import React, { useEffect } from 'react';

interface NotificationProps {
  message: string;
  onClose: () => void;
  duration?: number;
}

export const Notification: React.FC<NotificationProps> = ({ message, onClose, duration = 3000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => {
      clearTimeout(timer);
    };
  }, [onClose, duration]);

  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 animate-slide-up-fade-in">
      <div className="bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-900 text-sm font-semibold py-3 px-6 rounded-full shadow-lg">
        {message}
      </div>
       <style>{`
        @keyframes slide-up-fade-in {
          0% {
            opacity: 0;
            transform: translate(-50%, 20px);
          }
          100% {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }
        .animate-slide-up-fade-in {
          animation: slide-up-fade-in 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};
