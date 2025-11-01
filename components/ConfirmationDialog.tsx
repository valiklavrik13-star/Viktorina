import React from 'react';
import { useTranslation } from '../hooks/useTranslation';

interface ConfirmationDialogProps {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmButtonText: string;
  isDestructive: boolean;
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({ message, onConfirm, onCancel, confirmButtonText, isDestructive }) => {
  const { t } = useTranslation();

  const confirmClasses = isDestructive
    ? "bg-red-600 hover:bg-red-700"
    : "bg-indigo-600 hover:bg-indigo-700";

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in" 
      role="alertdialog" 
      aria-modal="true" 
      aria-labelledby="dialog-title"
      onClick={onCancel}
    >
      <div 
        className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-sm w-full p-6 sm:p-8 text-center border border-gray-200 dark:border-gray-700 transform animate-scale-in"
        onClick={e => e.stopPropagation()}
        id="dialog-title"
      >
        <p className="text-lg text-gray-800 dark:text-gray-200 mb-6">{message}</p>
        <div className="flex flex-col sm:flex-row-reverse justify-center gap-3">
          <button
            onClick={onConfirm}
            className={`w-full sm:w-auto px-6 py-2.5 rounded-lg text-white font-semibold transition-colors shadow-md ${confirmClasses}`}
          >
            {confirmButtonText}
          </button>
          <button
            onClick={onCancel}
            className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-200 font-semibold hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
          >
            {t('confirmation.cancel')}
          </button>
        </div>
      </div>
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out forwards;
        }
        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-scale-in {
            animation: scale-in 0.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
};
