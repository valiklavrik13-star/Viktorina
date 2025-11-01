import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../hooks/useTranslation';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';
import { TelegramIcon } from './icons/TelegramIcon';

interface LoginScreenProps {
    onBack: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onBack }) => {
    const { login } = useAuth();
    const { t } = useTranslation();

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-sm text-center">
                <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700">
                    <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">{t('auth.pleaseLogin')}</h1>
                    <p className="text-gray-500 dark:text-gray-400 mb-8">{t('auth.loginPrompt')}</p>
                    <button
                        onClick={login}
                        className="w-full inline-flex items-center justify-center gap-3 bg-sky-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-sky-600 transition-colors duration-300 shadow-lg mb-4"
                    >
                        <TelegramIcon className="w-6 h-6" />
                        <span>{t('auth.loginWithTelegram')}</span>
                    </button>
                    <button onClick={onBack} className="flex items-center justify-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors w-full p-2">
                        <ArrowLeftIcon className="w-5 h-5"/>
                        {t('auth.backToGuest')}
                    </button>
                </div>
            </div>
        </div>
    );
};
