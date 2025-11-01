import React, { useState } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { Quiz } from '../types';

interface ReportDialogProps {
  quiz: Quiz;
  onClose: () => void;
  onSubmit: (quizId: string, reason: string) => void;
}

export const ReportDialog: React.FC<ReportDialogProps> = ({ quiz, onClose, onSubmit }) => {
  const { t } = useTranslation();
  const [reason, setReason] = useState('');

  const handleSubmit = () => {
    if (reason.trim()) {
      onSubmit(quiz.id, reason);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-lg w-full p-6 sm:p-8 border border-gray-200 dark:border-gray-700 transform animate-scale-in"
        onClick={e => e.stopPropagation()}
      >
        <h2 id="dialog-title" className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          {t('reportDialog.title')}
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1 break-words">
          {quiz.title}
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500 font-mono mb-4">
          ID: {quiz.id}
        </p>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder={t('reportDialog.placeholder')}
          className="w-full h-32 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-3 text-base focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition dark:text-white dark:placeholder-gray-400 mb-6"
          aria-label={t('reportDialog.placeholder')}
        />
        <div className="flex flex-col sm:flex-row-reverse justify-center gap-3">
          <button
            onClick={handleSubmit}
            disabled={!reason.trim()}
            className="w-full sm:w-auto px-6 py-2.5 rounded-lg text-white font-semibold transition-colors shadow-md bg-red-600 hover:bg-red-700 disabled:bg-red-400 dark:disabled:bg-red-800 disabled:cursor-not-allowed"
          >
            {t('reportDialog.send')}
          </button>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-200 font-semibold hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
          >
            {t('reportDialog.cancel')}
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
