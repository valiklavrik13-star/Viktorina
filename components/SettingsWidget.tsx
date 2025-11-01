import React from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { useTheme } from '../hooks/useTheme';
import { SunIcon } from './icons/SunIcon';
import { MoonIcon } from './icons/MoonIcon';

export const SettingsWidget = () => {
    const { locale, setLocale, t } = useTranslation();
    const { theme, toggleTheme } = useTheme();

    return (
        <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="flex items-center bg-gray-200 dark:bg-gray-700 rounded-full p-1">
                <button
                    onClick={toggleTheme}
                    title={theme === 'light' ? t('theme.toggleDark') : t('theme.toggleLight')}
                    className={'p-1.5 rounded-full transition-colors text-gray-500 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'}
                >
                    {theme === 'light' ? <MoonIcon className="w-5 h-5" /> : <SunIcon className="w-5 h-5" />}
                </button>
                <div className="w-px h-5 bg-gray-300 dark:bg-gray-600 mx-1"></div>
                <button 
                    onClick={() => setLocale('ru')}
                    className={`px-3 py-1 text-sm font-semibold rounded-full transition-colors ${locale === 'ru' ? 'bg-white text-gray-800 dark:bg-gray-200 dark:text-gray-800' : 'text-gray-500 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
                >
                    RU
                </button>
                <button 
                    onClick={() => setLocale('uk')}
                    className={`px-3 py-1 text-sm font-semibold rounded-full transition-colors ${locale === 'uk' ? 'bg-white text-gray-800 dark:bg-gray-200 dark:text-gray-800' : 'text-gray-500 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
                >
                    UA
                </button>
            </div>
        </div>
    );
};
