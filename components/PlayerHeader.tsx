import React from 'react';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';
import { SettingsWidget } from './SettingsWidget';
import { useTranslation } from '../hooks/useTranslation';

interface PlayerHeaderProps {
    onBack: () => void;
    children?: React.ReactNode;
}

export const PlayerHeader: React.FC<PlayerHeaderProps> = ({ onBack, children }) => {
    const { t } = useTranslation();
    return (
        <div className="fixed top-0 left-0 right-0 w-full p-4 sm:p-6 flex justify-between items-start z-20 pointer-events-none">
            <div className="pointer-events-auto">
                <button onClick={onBack} className="flex items-center gap-2 text-gray-800 dark:text-white bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm shadow-md hover:bg-white/80 dark:hover:bg-gray-900/80 transition-colors font-semibold py-2 px-4 rounded-lg">
                    <ArrowLeftIcon className="w-5 h-5"/>
                    <span className="hidden sm:inline">{t('quizPlayer.quit')}</span>
                </button>
            </div>
            <div className="flex flex-col sm:flex-row items-end sm:items-center gap-4 pointer-events-auto">
                <SettingsWidget />
                {children}
            </div>
        </div>
    )
}