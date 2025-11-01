import React, { useMemo, useState } from 'react';
import { UserPlayRecord, QuizCategory, GameStats, MovieGenre } from '../types';
import { useTranslation } from '../hooks/useTranslation';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';

const CategoryIcon = ({ category, className }: { category: QuizCategory, className?: string }) => {
    const iconClass = className || "w-6 h-6 mr-2 text-gray-500 dark:text-gray-400";
    if (category === QuizCategory.GAMES) return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={iconClass}><path fillRule="evenodd" d="M21.59 10.05C20.14 8.6 18.18 8 16.5 8h-9C5.82 8 3.86 8.6 2.41 10.05 1.42 11.04 1 12.2 1 13.5v1c0 1.3.42 2.46 1.41 3.45c1.45 1.45 3.41 2.05 5.09 2.05h9c1.68 0 3.64-.6 5.09-2.05C22.58 16.96 23 15.8 23 14.5v-1c0-1.3-.42-2.46-1.41-3.45zM10.5 15.5h-2V13H6V11h2.5V8.5h2V11H13v2H10.5v2.5zm5-2a1 1 0 11-2 0 1 1 0 012 0zm2-2a1 1 0 11-2 0 1 1 0 012 0zm2 2a1 1 0 11-2 0 1 1 0 012 0zm-2 2a1 1 0 11-2 0 1 1 0 012 0z" clipRule="evenodd" /></svg>;
    if (category === QuizCategory.MOVIES) return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={iconClass}><path fillRule="evenodd" d="M2.25 4.5A2.25 2.25 0 014.5 2.25h15A2.25 2.25 0 0121.75 4.5v15A2.25 2.25 0 0119.5 21.75h-15A2.25 2.25 0 012.25 19.5v-15zM4.5 6a.75.75 0 01.75-.75h1.5a.75.75 0 010 1.5H5.25A.75.75 0 014.5 6zm.75 3.75a.75.75 0 000 1.5h1.5a.75.75 0 000-1.5H5.25zm.75 3a.75.75 0 01.75-.75h1.5a.75.75 0 010 1.5H5.25a.75.75 0 01-.75-.75zm.75 3a.75.75 0 000 1.5h1.5a.75.75 0 000-1.5H5.25zM17.25 6a.75.75 0 01.75-.75h1.5a.75.75 0 010 1.5h-1.5a.75.75 0 01-.75-.75zm.75 3.75a.75.75 0 000 1.5h1.5a.75.75 0 000-1.5h-1.5zm.75 3a.75.75 0 01.75-.75h1.5a.75.75 0 010 1.5h-1.5a.75.75 0 01-.75-.75zm.75 3a.75.75 0 000 1.5h1.5a.75.75 0 000-1.5h-1.5z" clipRule="evenodd" /></svg>;
    if (category === QuizCategory.SERIES) return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={iconClass}><path d="M3.75 3A1.75 1.75 0 002 4.75v10.5c0 .966.784 1.75 1.75 1.75h4.5a.75.75 0 01.75.75v2.25a.75.75 0 001.5 0v-2.25a.75.75 0 01.75-.75h3a.75.75 0 01.75.75v2.25a.75.75 0 001.5 0v-2.25a.75.75 0 01.75-.75h4.5A1.75 1.75 0 0022 15.25V4.75A1.75 1.75 0 0020.25 3H3.75z" /></svg>;
    if (category === QuizCategory.BOOKS) return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={iconClass}><path d="M12 4.5a.75.75 0 01.75.75V9a.75.75 0 01-1.5 0V5.25A.75.75 0 0112 4.5z" /><path fillRule="evenodd" d="M3.75 3A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75zM11.25 6v10.5a.75.75 0 001.5 0V6h-1.5zM3 16.5V6A1.5 1.5 0 014.5 4.5h6V18h-6A1.5 1.5 0 013 16.5zm13.5-12h6A1.5 1.5 0 0121 6v10.5a1.5 1.5 0 01-1.5 1.5h-6V4.5z" clipRule="evenodd" /></svg>;
    if (category === QuizCategory.MUSIC) return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={iconClass}><path d="M10.5 4.5a.75.75 0 00-1.5 0v10.5a3 3 0 103 3V9.37l5.25-1.313a.75.75 0 00-.5-1.437l-5.25 1.313V4.5z" /></svg>;
    if (category === QuizCategory.OTHER) return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={iconClass}><path fillRule="evenodd" d="M3 3.75A.75.75 0 013.75 3h6a.75.75 0 01.75.75v6a.75.75 0 01-.75.75h-6A.75.75 0 013 9.75v-6zm10.5 0A.75.75 0 0114.25 3h6a.75.75 0 01.75.75v6a.75.75 0 01-.75.75h-6a.75.75 0 01-.75-.75v-6zm-10.5 10.5A.75.75 0 013.75 13.5h6a.75.75 0 01.75.75v6a.75.75 0 01-.75.75h-6a.75.75 0 01-.75-.75v-6zm10.5 0a.75.75 0 01.75-.75h6a.75.75 0 01.75.75v6a.75.75 0 01-.75.75h-6a.75.75 0 01-.75-.75v-6z" clipRule="evenodd" /></svg>;
    return null;
}

interface UserProfileProps {
  playHistory: UserPlayRecord[];
  createdQuizzesCount: number;
  onBack: () => void;
  gameStats: GameStats;
  onLogout: () => void;
}

const StatCard = ({ label, value }: { label: string, value: string | number }) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 text-center">
        <p className="text-lg text-gray-500 dark:text-gray-400">{label}</p>
        <p className="text-5xl font-bold text-indigo-600 dark:text-indigo-400">{value}</p>
    </div>
);

interface CategoryPerformanceBarProps {
    category: QuizCategory;
    percentage: number;
    label: string;
}

const CategoryPerformanceBar: React.FC<CategoryPerformanceBarProps> = ({ category, percentage, label }) => (
    <div>
        <div className="flex justify-between mb-1">
            <span className="text-base font-medium text-gray-700 dark:text-gray-300">{label}</span>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{percentage.toFixed(0)}%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
            <div className="bg-teal-500 h-4 rounded-full" style={{ width: `${percentage}%` }}></div>
        </div>
    </div>
);

const GameStatsCard: React.FC<{
    title: string;
    stats: { [key in MovieGenre]?: number } | undefined;
}> = ({ title, stats }) => {
    const { t } = useTranslation();
    return (
        <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">{title}</h3>
            <div className="flex justify-around items-center text-center">
                <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{t('movieGames.all')}</p>
                    <p className="text-xl sm:text-2xl font-bold text-teal-500 dark:text-teal-400">{stats?.[MovieGenre.ALL] || 0}</p>
                </div>
                <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{t('movieGames.horror')}</p>
                    <p className="text-xl sm:text-2xl font-bold text-teal-500 dark:text-teal-400">{stats?.[MovieGenre.HORROR] || 0}</p>
                </div>
                <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{t('movieGames.comedy')}</p>
                    <p className="text-xl sm:text-2xl font-bold text-teal-500 dark:text-teal-400">{stats?.[MovieGenre.COMEDY] || 0}</p>
                </div>
            </div>
        </div>
    );
}

const DescriptionGameStatsCard: React.FC<{
    title: string;
    stats: { [key in MovieGenre]?: { rounds: number; avgPercentage: number } } | undefined;
}> = ({ title, stats }) => {
    const { t } = useTranslation();
    
    const allStat = stats?.[MovieGenre.ALL] || { rounds: 0, avgPercentage: 0 };
    const horrorStat = stats?.[MovieGenre.HORROR] || { rounds: 0, avgPercentage: 0 };
    const comedyStat = stats?.[MovieGenre.COMEDY] || { rounds: 0, avgPercentage: 0 };

    return (
        <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">{title}</h3>
            <div className="flex justify-around items-center text-center">
                <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{t('movieGames.all')}</p>
                    <p className="font-bold text-teal-500 dark:text-teal-400 text-xl sm:text-2xl">
                        {`${allStat.rounds}/${allStat.avgPercentage.toFixed(0)}%`}
                    </p>
                </div>
                <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{t('movieGames.horror')}</p>
                     <p className="font-bold text-teal-500 dark:text-teal-400 text-xl sm:text-2xl">
                        {`${horrorStat.rounds}/${horrorStat.avgPercentage.toFixed(0)}%`}
                    </p>
                </div>
                 <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{t('movieGames.comedy')}</p>
                     <p className="font-bold text-teal-500 dark:text-teal-400 text-xl sm:text-2xl">
                        {`${comedyStat.rounds}/${comedyStat.avgPercentage.toFixed(0)}%`}
                    </p>
                </div>
            </div>
        </div>
    );
}


export const UserProfile: React.FC<UserProfileProps> = ({ playHistory, createdQuizzesCount, onBack, gameStats, onLogout }) => {
  const { t } = useTranslation();
  const [activeCategory, setActiveCategory] = useState<QuizCategory>(QuizCategory.MOVIES);
  
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchMoveX, setTouchMoveX] = useState<number | null>(null);
  const categoryTabs: QuizCategory[] = Object.values(QuizCategory);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.targetTouches[0].clientX);
    setTouchMoveX(null);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX !== null) {
      setTouchMoveX(e.targetTouches[0].clientX);
    }
  };

  const handleTouchEnd = () => {
    if (touchStartX !== null && touchMoveX !== null) {
      const diff = touchStartX - touchMoveX;
      const swipeThreshold = 50; // Minimum distance for a swipe
      const currentIndex = categoryTabs.indexOf(activeCategory);

      if (diff > swipeThreshold) { // Swiped left
        const nextIndex = (currentIndex + 1) % categoryTabs.length;
        setActiveCategory(categoryTabs[nextIndex]);
      } else if (diff < -swipeThreshold) { // Swiped right
        const prevIndex = (currentIndex - 1 + categoryTabs.length) % categoryTabs.length;
        setActiveCategory(categoryTabs[prevIndex]);
      }
    }
    setTouchStartX(null);
    setTouchMoveX(null);
  };

  const stats = useMemo(() => {
    const uniqueQuizIds = new Set(playHistory.map(record => record.quizId));
    const totalQuizzesTaken = uniqueQuizIds.size;
    
    const totalCorrect = playHistory.reduce((sum, record) => sum + record.score, 0);
    const totalPossible = playHistory.reduce((sum, record) => sum + record.totalQuestions, 0);
    const averageScore = totalPossible > 0 ? (totalCorrect / totalPossible) * 100 : 0;

    const categoryStats: { [key in QuizCategory]?: { correct: number; total: number } } = {};
    for (const record of playHistory) {
        if (!categoryStats[record.category]) {
            categoryStats[record.category] = { correct: 0, total: 0 };
        }
        categoryStats[record.category]!.correct += record.score;
        categoryStats[record.category]!.total += record.totalQuestions;
    }

    const performanceByCategory = Object.entries(categoryStats).map(([category, data]) => ({
        category: category as QuizCategory,
        percentage: data.total > 0 ? (data.correct / data.total) * 100 : 0,
    }));

    return { totalQuizzesTaken, averageScore, performanceByCategory };
  }, [playHistory]);
  
  const activeCategoryIndex = categoryTabs.indexOf(activeCategory);

  return (
    <>
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex justify-between items-center mb-8">
        <button onClick={onBack} className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
          <ArrowLeftIcon className="w-5 h-5"/>
          {t('userProfile.back')}
        </button>
        <button onClick={onLogout} className="bg-red-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-red-600 transition-colors">
            {t('auth.logout')}
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t('userProfile.title')}</h1>
      </div>
      
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('userProfile.overallStats')}</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard label={t('userProfile.quizzesTaken')} value={stats.totalQuizzesTaken} />
        <StatCard label={t('userProfile.averageScore')} value={`${stats.averageScore.toFixed(1)}%`} />
        <StatCard label={t('userProfile.quizzesCreated')} value={createdQuizzesCount} />
      </div>

      <div className="mb-8 mt-4">
        <nav className="flex justify-center items-center gap-4 sm:gap-6" aria-label="Categories">
            {categoryTabs.map(cat => (
                <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    title={t(`category.${cat}`)}
                    aria-label={t(`category.${cat}`)}
                    className={`p-3 rounded-full transition-colors duration-200 ${activeCategory === cat ? 'bg-indigo-100 dark:bg-indigo-900/50' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                >
                    <CategoryIcon 
                        category={cat} 
                        className={`w-7 h-7 sm:w-8 sm:h-8 ${activeCategory === cat ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400'}`} 
                    />
                </button>
            ))}
        </nav>
      </div>
      
      <div
        className="overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
            className="flex transition-transform duration-300 ease-in-out"
            style={{ transform: `translateX(-${activeCategoryIndex * 100}%)` }}
        >
          {categoryTabs.map(category => {
            const filteredPlayHistory = playHistory.filter(record => record.category === category);

            const allGameCards = [
              { key: 'movieQuiz', title: 'movieQuiz.title', stats: gameStats?.movieQuiz, category: QuizCategory.MOVIES },
              { key: 'seriesQuiz', title: 'seriesQuiz.title', stats: gameStats?.seriesQuiz, category: QuizCategory.SERIES },
              { key: 'movieRatingGame', title: 'movieRatingGame.title', stats: gameStats?.movieRatingGame, category: QuizCategory.MOVIES },
              { key: 'seriesSeasonRatingGame', title: 'seriesSeasonRatingGame.title', stats: gameStats?.seriesSeasonRatingGame, category: QuizCategory.SERIES },
              { key: 'directorQuiz', title: 'directorQuiz.title', stats: gameStats?.directorQuiz, category: QuizCategory.MOVIES },
              { key: 'yearQuiz', title: 'yearQuiz.title', stats: gameStats?.yearQuiz, category: QuizCategory.MOVIES },
              { key: 'actorQuiz', title: 'actorQuiz.title', stats: gameStats?.actorQuiz, category: QuizCategory.MOVIES },
              { key: 'seriesActorQuiz', title: 'seriesActorQuiz.title', stats: gameStats?.seriesActorQuiz, category: QuizCategory.SERIES },
            ];
            const allDescriptionGameCards = [
                { key: 'descriptionQuiz', title: 'descriptionQuiz.title', stats: gameStats?.descriptionQuiz, category: QuizCategory.MOVIES },
                { key: 'seriesDescriptionQuiz', title: 'seriesDescriptionQuiz.title', stats: gameStats?.seriesDescriptionQuiz, category: QuizCategory.SERIES },
            ];
            
            const regularGames = allGameCards.filter(game => game.category === category);
            const descriptionGames = allDescriptionGameCards.filter(game => game.category === category);
            const filteredGameStats = { regularGames, descriptionGames };

            return (
              <div key={category} className="w-full flex-shrink-0">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 mt-8">{t('userProfile.gameHighScores')}</h2>
                {(filteredGameStats.regularGames.length > 0 || filteredGameStats.descriptionGames.length > 0) ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        {filteredGameStats.regularGames.map(game => (
                            <GameStatsCard key={game.key} title={t(game.title)} stats={game.stats} />
                        ))}
                        {filteredGameStats.descriptionGames.map(game => (
                            <DescriptionGameStatsCard key={game.key} title={t(game.title)} stats={game.stats} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center bg-gray-100 dark:bg-gray-800 rounded-lg p-12 my-8">
                        <p className="text-gray-500 dark:text-gray-400">{t('userProfile.noGameStatsInCategory')}</p>
                    </div>
                )}

                {filteredPlayHistory.length > 0 ? (
                    <>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('userProfile.playHistory')}</h2>
                        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                            <ul className="divide-y divide-gray-200 dark:divide-gray-600">
                                {filteredPlayHistory.slice(0, 10).map((record, index) => (
                                    <li key={index} className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center">
                                        <div className="mb-2 sm:mb-0">
                                            <p className="font-semibold text-gray-800 dark:text-gray-200 break-all">{record.quizTitle}</p>
                                        </div>
                                        <div className="flex items-center gap-4 text-right">
                                            <p className="text-lg font-bold text-teal-500 dark:text-teal-400">{record.score}/{record.totalQuestions}</p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 w-24">{new Date(record.date).toLocaleDateString()}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </>
                ) : (
                    <>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('userProfile.playHistory')}</h2>
                        <div className="text-center bg-gray-100 dark:bg-gray-800 rounded-lg p-12">
                            <p className="text-gray-500 dark:text-gray-400">{t('userProfile.noHistoryInCategory')}</p>
                        </div>
                    </>
                )}
                
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 mt-8">{t('userProfile.performanceByCategory')}</h2>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 mb-8 space-y-4">
                    {stats.performanceByCategory.length > 0 ? stats.performanceByCategory.map(({ category, percentage }) => (
                        <CategoryPerformanceBar key={category} category={category} percentage={percentage} label={t(`category.${category}`)} />
                    )) : <p className="text-center text-gray-500 dark:text-gray-400">{t('userProfile.noHistory')}</p>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
    <style>{`
        .overflow-x-auto::-webkit-scrollbar {
            height: 4px;
        }
        .overflow-x-auto::-webkit-scrollbar-track {
            background: transparent;
        }
        .overflow-x-auto::-webkit-scrollbar-thumb {
            background: #cbd5e1;
            border-radius: 10px;
        }
        .dark .overflow-x-auto::-webkit-scrollbar-thumb {
            background: #4b5563;
        }
    `}</style>
    </>
  );
};