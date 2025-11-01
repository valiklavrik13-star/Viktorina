import React from 'react';
import { SettingsWidget } from './SettingsWidget';
import { useTranslation } from '../hooks/useTranslation';
import { UserIcon } from './icons/UserIcon';

interface HeaderProps {
    onViewProfile: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onViewProfile }) => {
    const { t } = useTranslation();
    return (
        <header className="w-full p-4 sm:p-6 z-20">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
                <SettingsWidget />
                <button 
                    onClick={onViewProfile} 
                    title={t('quizList.myStats')} 
                    className="p-2 rounded-full text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                    <UserIcon className="w-7 h-7" />
                </button>
            </div>
        </header>
    );
};