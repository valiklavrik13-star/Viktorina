import React, { useState, useMemo, useEffect } from 'react';
import { Leaderboards, MovieGenre, QuizCategory } from '../types';
import { useTranslation } from '../hooks/useTranslation';
import { TrophyIcon } from './icons/TrophyIcon';

type GameKey = keyof Omit<Leaderboards, 'descriptionQuiz'>;

interface LeaderboardViewProps {
  leaderboards: Leaderboards;
  currentUserId: string | null;
  activeCategory: QuizCategory;
}

const allGameNames: { key: GameKey, name: string, category: QuizCategory }[] = [
    { key: 'movieQuiz', name: 'movieQuiz.title', category: QuizCategory.MOVIES },
    { key: 'seriesQuiz', name: 'seriesQuiz.title', category: QuizCategory.SERIES },
    { key: 'movieRatingGame', name: 'movieRatingGame.title', category: QuizCategory.MOVIES },
    { key: 'seriesSeasonRatingGame', name: 'seriesSeasonRatingGame.title', category: QuizCategory.SERIES },
    { key: 'directorQuiz', name: 'directorQuiz.title', category: QuizCategory.MOVIES },
    { key: 'yearQuiz', name: 'yearQuiz.title', category: QuizCategory.MOVIES },
    { key: 'actorQuiz', name: 'actorQuiz.title', category: QuizCategory.MOVIES },
    { key: 'seriesActorQuiz', name: 'seriesActorQuiz.title', category: QuizCategory.SERIES },
];

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({ leaderboards, currentUserId, activeCategory }) => {
    const { t } = useTranslation();
    
    const filteredGameNames = useMemo(() => {
        return allGameNames.filter(game => game.category === activeCategory);
    }, [activeCategory]);

    const [selectedGame, setSelectedGame] = useState<GameKey | null>(null);

    useEffect(() => {
        if (filteredGameNames.length > 0) {
            if (!filteredGameNames.some(g => g.key === selectedGame)) {
                setSelectedGame(filteredGameNames[0].key);
            }
        } else {
            setSelectedGame(null);
        }
    }, [activeCategory, filteredGameNames, selectedGame]);

    const [selectedGenre, setSelectedGenre] = useState<MovieGenre>(MovieGenre.ALL);
    
    const showGenreFilter = useMemo(() => {
        return activeCategory === QuizCategory.MOVIES || activeCategory === QuizCategory.SERIES;
    }, [activeCategory]);

    const leaderboardData = useMemo(() => {
        if (!selectedGame) return [];
        const game = leaderboards[selectedGame];
        if (!game) return [];
        return game[selectedGenre] || [];
    }, [leaderboards, selectedGame, selectedGenre]);
    
    const currentUserEntry = useMemo(() => {
        if (!currentUserId) return null;
        const rank = leaderboardData.findIndex(entry => entry.userId === currentUserId);
        if (rank === -1) return null;
        return {
            ...leaderboardData[rank],
            rank: rank + 1
        };
    }, [leaderboardData, currentUserId]);

    const top10 = leaderboardData.slice(0, 10);
    const isUserInTop10 = currentUserEntry ? currentUserEntry.rank <= 10 : false;

    const getButtonStyle = (isActive: boolean) => {
        return isActive 
            ? 'bg-indigo-600 text-white' 
            : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600';
    }

    return (
        <div className="mt-8">
            <div className="mb-8 space-y-4">
                <div>
                    <h2 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">{t('leaderboard.selectGame')}</h2>
                    <div className="flex flex-wrap gap-2">
                        {filteredGameNames.length > 0 ? (
                            filteredGameNames.map(game => (
                                 <button key={game.key} onClick={() => setSelectedGame(game.key)} className={`py-2 px-4 rounded-lg font-semibold transition-colors ${getButtonStyle(selectedGame === game.key)}`}>
                                    {t(game.name)}
                                </button>
                            ))
                        ) : (
                            <p className="text-gray-500 dark:text-gray-400 italic">{t('leaderboard.noGamesInCategory')}</p>
                        )}
                    </div>
                </div>
                {showGenreFilter && selectedGame && (
                     <div>
                         <h2 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">{t('leaderboard.selectGenre')}</h2>
                         <div className="flex flex-wrap gap-2">
                            <button onClick={() => setSelectedGenre(MovieGenre.ALL)} className={`py-2 px-4 rounded-lg font-semibold transition-colors ${getButtonStyle(selectedGenre === MovieGenre.ALL)}`}>{t('movieGames.all')}</button>
                            <button onClick={() => setSelectedGenre(MovieGenre.HORROR)} className={`py-2 px-4 rounded-lg font-semibold transition-colors ${getButtonStyle(selectedGenre === MovieGenre.HORROR)}`}>{t('movieGames.horror')}</button>
                            <button onClick={() => setSelectedGenre(MovieGenre.COMEDY)} className={`py-2 px-4 rounded-lg font-semibold transition-colors ${getButtonStyle(selectedGenre === MovieGenre.COMEDY)}`}>{t('movieGames.comedy')}</button>
                         </div>
                    </div>
                )}
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                {leaderboardData.length > 0 ? (
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="p-4 w-16 text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">{t('leaderboard.rank')}</th>
                                <th className="p-4 text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">{t('leaderboard.player')}</th>
                                <th className="p-4 w-24 text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider text-right">{t('leaderboard.score')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                            {top10.map((entry, index) => (
                                <tr key={entry.userId} className={`${entry.userId === currentUserId ? 'bg-indigo-50 dark:bg-indigo-900/50' : ''}`}>
                                    <td className="p-4 font-bold text-lg text-gray-700 dark:text-gray-300 text-center">{index + 1}</td>
                                    <td className="p-4 font-medium text-gray-800 dark:text-gray-200">{`Player-${entry.userId.substring(0, 6)}`}</td>
                                    <td className="p-4 font-semibold text-lg text-teal-600 dark:text-teal-400 text-right">{entry.score}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                     <p className="p-8 text-center text-gray-500 dark:text-gray-400">
                        {selectedGame ? t('leaderboard.noData') : t('leaderboard.noGamesInCategory')}
                    </p>
                )}
                 {!isUserInTop10 && currentUserEntry && (
                    <>
                        <div className="h-4 bg-gray-100 dark:bg-gray-900 border-y-2 border-dashed border-gray-300 dark:border-gray-600"></div>
                        <table className="w-full text-left">
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                                <tr className="bg-indigo-50 dark:bg-indigo-900/50">
                                     <td className="p-4 w-16 font-bold text-lg text-gray-700 dark:text-gray-300 text-center">{currentUserEntry.rank}</td>
                                    <td className="p-4 font-medium text-gray-800 dark:text-gray-200">{`Player-${currentUserEntry.userId.substring(0, 6)}`} ({t('leaderboard.yourRank')})</td>
                                    <td className="p-4 w-24 font-semibold text-lg text-teal-600 dark:text-teal-400 text-right">{currentUserEntry.score}</td>
                                </tr>
                            </tbody>
                        </table>
                    </>
                )}
            </div>

        </div>
    );
};