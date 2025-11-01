import React, { useState, useMemo, useEffect } from 'react';
import { Quiz, QuizCategory, MovieGenre, Leaderboards } from '../types';
import { StarRating } from './StarRating';
import { PlusIcon } from './icons/PlusIcon';
import { FilmIcon } from './icons/FilmIcon';
import { ChartBarIcon } from './icons/ChartBarIcon';
import { ShareIcon } from './icons/ShareIcon';
import { useTranslation } from '../hooks/useTranslation';
import { TrendingUpIcon } from './icons/TrendingUpIcon';
import { VideoCameraIcon } from './icons/VideoCameraIcon';
import { CalendarIcon } from './icons/CalendarIcon';
import { TrashIcon } from './icons/TrashIcon';
import { UsersIcon } from './icons/UsersIcon';
import { PencilIcon } from './icons/PencilIcon';
import { DocumentTextIcon } from './icons/DocumentTextIcon';
import { FlagIcon } from './icons/FlagIcon';
import { LeaderboardView } from './LeaderboardView';
import { TvIcon } from './icons/TvIcon';
import { ListBulletIcon } from './icons/ListBulletIcon';
import { LockClosedIcon } from './icons/LockClosedIcon';

interface QuizListProps {
  quizzes: Quiz[];
  onStartQuiz: (quiz: Quiz) => void;
  onCreateQuiz: () => void;
  onStartMovieQuiz: (genre: MovieGenre) => void;
  onStartSeriesQuiz: (genre: MovieGenre) => void;
  onStartMovieRatingGame: (genre: MovieGenre) => void;
  onStartSeriesSeasonRatingGame: (genre: MovieGenre) => void;
  onStartDirectorQuiz: (genre: MovieGenre) => void;
  onStartYearQuiz: (genre: MovieGenre) => void;
  onStartActorQuiz: (genre: MovieGenre) => void;
  onStartDescriptionQuiz: (genre: MovieGenre) => void;
  onStartSeriesSortingGame: (genre: MovieGenre) => void;
  onStartSeriesActorQuiz: (genre: MovieGenre) => void;
  onStartSeriesDescriptionQuiz: (genre: MovieGenre) => void;
  onViewStats: (quiz: Quiz) => void;
  onDeleteQuiz: (quizId: string) => void;
  onEditQuiz: (quiz: Quiz) => void;
  onReportQuiz: (quiz: Quiz) => void;
  onShowNotification: (message: string) => void;
  isMyQuiz: (quiz: Quiz) => boolean;
  userId: string | null;
  leaderboards: Leaderboards;
  isAuthenticated: boolean;
}

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

interface QuizCardProps {
  quiz: Quiz;
  onStartQuiz: (quiz: Quiz) => void;
  onViewStats: (quiz: Quiz) => void;
  onShareQuiz: (quiz: Quiz) => void;
  onDeleteQuiz: (quizId: string) => void;
  onEditQuiz: (quiz: Quiz) => void;
  onReportQuiz: (quiz: Quiz) => void;
  isMyQuiz: boolean;
}

const QuizCard: React.FC<QuizCardProps> = ({ quiz, onStartQuiz, onViewStats, onShareQuiz, onDeleteQuiz, onEditQuiz, onReportQuiz, isMyQuiz }) => {
    const { t } = useTranslation();

    return (
        <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-lg transform hover:-translate-y-1 transition-transform duration-300 border border-gray-200 dark:border-gray-700 flex flex-col justify-between">
            {quiz.isPrivate && isMyQuiz && (
                <div title={t('quizCard.private')} className="absolute top-3 left-3 z-10 p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
                    <LockClosedIcon className="w-5 h-5" />
                </div>
            )}
            <button
                onClick={() => onReportQuiz(quiz)}
                title={t('quizCard.report')}
                aria-label={t('quizCard.report')}
                className="absolute top-3 right-3 z-10 p-2 rounded-full text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
            >
                <FlagIcon className="w-5 h-5" />
            </button>
            <div className="p-6">
                <div className="flex items-center mb-4">
                    <CategoryIcon category={quiz.category} className="w-6 h-6 mr-3 text-gray-500 dark:text-gray-400" />
                    <span className="text-sm font-semibold text-teal-500 dark:text-teal-400 uppercase tracking-wider">{t(`category.${quiz.category}`)}</span>
                </div>
                <div className="h-24 mb-1">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white line-clamp-3" title={quiz.title}>{quiz.title}</h3>
                </div>
                <p className="text-xs text-gray-400 dark:text-gray-500 font-mono mb-2">{t('quizCard.id')}: {quiz.id}</p>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">{quiz.questions.length} {t('quizCard.questions')}</p>
                <div className="flex items-center">
                    <StarRating value={quiz.averageRating} isEditable={false} size={20} />
                </div>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-slate-800/50 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between w-full gap-2">
                    {/* Left side: Icon buttons */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => onShareQuiz(quiz)}
                            title={t('quizCard.share')}
                            className="p-2.5 rounded-lg bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                        >
                            <ShareIcon className="w-5 h-5" />
                        </button>
                        {isMyQuiz && (
                            <>
                                <button
                                    onClick={() => onEditQuiz(quiz)}
                                    title={t('quizCard.edit')}
                                    className="p-2.5 rounded-lg bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                                >
                                    <PencilIcon className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => onViewStats(quiz)}
                                    title={t('quizCard.stats')}
                                    className="p-2.5 rounded-lg bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                                >
                                    <ChartBarIcon className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => onDeleteQuiz(quiz.id)}
                                    title={t('quizCard.delete')}
                                    className="p-2.5 rounded-lg bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/70 transition-colors"
                                >
                                    <TrashIcon className="w-5 h-5" />
                                </button>
                            </>
                        )}
                    </div>
            
                    {/* Right side: Play button */}
                    <button
                        onClick={() => onStartQuiz(quiz)}
                        className="flex-shrink-0 text-center bg-teal-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-teal-600 transition-colors duration-300"
                    >
                        {t('quizCard.play')}
                    </button>
                </div>
            </div>
        </div>
    );
};

const AutoGameGroup: React.FC<{
    title: string;
    description: string;
    icon: React.ReactNode;
    onSelectGenre: (genre: MovieGenre) => void;
    gradient: string;
    borderColor: string;
    buttonTextColor: string;
}> = ({ title, description, icon, onSelectGenre, gradient, borderColor, buttonTextColor }) => {
    const { t } = useTranslation();
    const buttonBaseClasses = `w-full text-center py-3 px-4 rounded-lg text-lg font-bold transition-transform duration-200 transform hover:scale-105`;
    const buttonBgClasses = `bg-white/20 hover:bg-white/30 backdrop-blur-sm`;
    
    return (
        <div className={`sm:col-span-2 lg:col-span-3 ${gradient} rounded-xl shadow-lg p-6 border ${borderColor} flex flex-col md:flex-row md:items-center md:gap-8`}>
            <div className="flex-1 mb-6 md:mb-0">
                <div className="flex items-center mb-2">
                    {icon}
                    <h3 className="text-2xl font-bold text-white">{title}</h3>
                </div>
                <p className="text-white/80 text-base">{description}</p>
            </div>
            <div className="flex-shrink-0 grid grid-cols-1 sm:grid-cols-3 gap-3 w-full md:w-auto md:max-w-md">
                <button onClick={() => onSelectGenre(MovieGenre.ALL)} className={`${buttonBaseClasses} ${buttonBgClasses} ${buttonTextColor}`}>{t('movieGames.all')}</button>
                <button onClick={() => onSelectGenre(MovieGenre.HORROR)} className={`${buttonBaseClasses} ${buttonBgClasses} ${buttonTextColor}`}>{t('movieGames.horror')}</button>
                <button onClick={() => onSelectGenre(MovieGenre.COMEDY)} className={`${buttonBaseClasses} ${buttonBgClasses} ${buttonTextColor}`}>{t('movieGames.comedy')}</button>
            </div>
        </div>
    );
};

const EmptyState: React.FC<{ type: 'community' | 'my', searchTerm: string }> = ({ type, searchTerm }) => {
    const { t } = useTranslation();
    return (
        <div className="text-center bg-gray-100 dark:bg-gray-800 rounded-lg p-12 mt-10">
            {searchTerm ? (
                <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300">{t('quizList.noResults')}</h2>
            ) : type === 'my' ? (
                <>
                    <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300">{t('quizList.noMyQuizzes')}</h2>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">{t('quizList.createOne')}</p>
                </>
            ) : (
                <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300">{t('quizList.noQuizzes')}</h2>
            )}
        </div>
    );
};


export const QuizList: React.FC<QuizListProps> = ({ quizzes, userId, isMyQuiz, leaderboards, onStartQuiz, onCreateQuiz, onStartMovieQuiz, onStartSeriesQuiz, onStartMovieRatingGame, onStartSeriesSeasonRatingGame, onStartDirectorQuiz, onStartYearQuiz, onStartActorQuiz, onStartDescriptionQuiz, onStartSeriesSortingGame, onStartSeriesActorQuiz, onStartSeriesDescriptionQuiz, onViewStats, onDeleteQuiz, onEditQuiz, onReportQuiz, onShowNotification, isAuthenticated }) => {
  const { t } = useTranslation();
  const [activeCategory, setActiveCategory] = useState<QuizCategory>(QuizCategory.MOVIES);
  const [activeContentTab, setActiveContentTab] = useState<'auto' | 'community' | 'my' | 'leaderboard'>('auto');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchMoveX, setTouchMoveX] = useState<number | null>(null);

  const categoryTabs: QuizCategory[] = Object.values(QuizCategory);

  const handleCategoryClick = (category: QuizCategory) => {
    setActiveCategory(category);
    setSearchTerm('');
    setActiveContentTab('auto');
  };

  const handleShareQuiz = (quiz: Quiz) => {
    const shareUrl = `${window.location.origin}${window.location.pathname}?quiz=${quiz.id}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
        onShowNotification(t('notification.linkCopied'));
    }, (err) => {
        console.error('Could not copy text: ', err);
    });
  };
  
  const availableTabs = useMemo(() => {
    const tabs: ('auto' | 'community' | 'my' | 'leaderboard')[] = ['auto', 'community'];
    if (isAuthenticated) {
        tabs.push('my');
    }
    tabs.push('leaderboard');
    return tabs;
  }, [isAuthenticated]);

  useEffect(() => {
    // If user logs out while on 'my' tab, switch to a valid one
    if (!availableTabs.includes(activeContentTab)) {
        setActiveContentTab('auto');
    }
  }, [availableTabs, activeContentTab]);


  const activeTabIndex = availableTabs.indexOf(activeContentTab);
  
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

          if (diff > swipeThreshold) { // Swiped left (next tab)
              const nextIndex = (activeTabIndex + 1) % availableTabs.length;
              setActiveContentTab(availableTabs[nextIndex]);
          } else if (diff < -swipeThreshold) { // Swiped right (previous tab)
              const prevIndex = (activeTabIndex - 1 + availableTabs.length) % availableTabs.length;
              setActiveContentTab(availableTabs[prevIndex]);
          }
      }
      setTouchStartX(null);
      setTouchMoveX(null);
  };

  const communityQuizzes = useMemo(() => {
    let list = quizzes.filter(q => q.category === activeCategory && !q.isPrivate);
    if (searchTerm.trim()) {
      const lowercasedSearchTerm = searchTerm.toLowerCase();
      list = list.filter(quiz =>
        quiz.title.toLowerCase().includes(lowercasedSearchTerm) ||
        quiz.id.toLowerCase().includes(lowercasedSearchTerm)
      );
    }
    return list.sort((a, b) => b.averageRating - a.averageRating);
  }, [quizzes, activeCategory, searchTerm]);
  
  const myQuizzes = useMemo(() => {
      let list = quizzes.filter(q => q.category === activeCategory && isMyQuiz(q));
      if (searchTerm.trim()) {
          const lowercasedSearchTerm = searchTerm.toLowerCase();
          list = list.filter(quiz =>
              quiz.title.toLowerCase().includes(lowercasedSearchTerm) ||
              quiz.id.toLowerCase().includes(lowercasedSearchTerm)
          );
      }
      return list.sort((a, b) => b.averageRating - a.averageRating);
  }, [quizzes, activeCategory, searchTerm, isMyQuiz]);


  const movieGameCards = [
      <AutoGameGroup
          key="movie-quiz"
          title={t('movieQuiz.title')}
          description={t('movieQuiz.description')}
          icon={<FilmIcon className="w-8 h-8 mr-3 text-white/80" />}
          onSelectGenre={onStartMovieQuiz}
          gradient="from-purple-600 to-indigo-700 bg-gradient-to-br"
          borderColor="border-purple-500"
          buttonTextColor="text-white"
      />,
      <AutoGameGroup
          key="movie-rating-game"
          title={t('movieRatingGame.title')}
          description={t('movieRatingGame.description')}
          icon={<TrendingUpIcon className="w-8 h-8 mr-3 text-white/80" />}
          onSelectGenre={onStartMovieRatingGame}
          gradient="from-cyan-500 to-sky-600 bg-gradient-to-br"
          borderColor="border-cyan-400"
          buttonTextColor="text-white"
      />,
       <AutoGameGroup
          key="director-quiz"
          title={t('directorQuiz.title')}
          description={t('directorQuiz.description')}
          icon={<VideoCameraIcon className="w-8 h-8 mr-3 text-white/80" />}
          onSelectGenre={onStartDirectorQuiz}
          gradient="from-rose-500 to-red-600 bg-gradient-to-br"
          borderColor="border-rose-400"
          buttonTextColor="text-white"
      />,
      <AutoGameGroup
          key="year-quiz"
          title={t('yearQuiz.title')}
          description={t('yearQuiz.description')}
          icon={<CalendarIcon className="w-8 h-8 mr-3 text-white/80" />}
          onSelectGenre={onStartYearQuiz}
          gradient="from-amber-500 to-orange-600 bg-gradient-to-br"
          borderColor="border-amber-400"
          buttonTextColor="text-white"
      />,
      <AutoGameGroup
          key="actor-quiz"
          title={t('actorQuiz.title')}
          description={t('actorQuiz.description')}
          icon={<UsersIcon className="w-8 h-8 mr-3 text-white/80" />}
          onSelectGenre={onStartActorQuiz}
          gradient="from-emerald-500 to-green-600 bg-gradient-to-br"
          borderColor="border-emerald-400"
          buttonTextColor="text-white"
      />,
      <AutoGameGroup
          key="description-quiz"
          title={t('descriptionQuiz.title')}
          description={t('descriptionQuiz.description')}
          icon={<DocumentTextIcon className="w-8 h-8 mr-3 text-white/80" />}
          onSelectGenre={onStartDescriptionQuiz}
          gradient="from-teal-500 to-cyan-600 bg-gradient-to-br"
          borderColor="border-teal-400"
          buttonTextColor="text-white"
      />
  ];

  const seriesGameCards = [
      <AutoGameGroup
        key="series-quiz"
        title={t('seriesQuiz.title')}
        description={t('seriesQuiz.description')}
        icon={<TvIcon className="w-8 h-8 mr-3 text-white/80" />}
        onSelectGenre={onStartSeriesQuiz}
        gradient="from-blue-600 to-violet-700 bg-gradient-to-br"
        borderColor="border-blue-500"
        buttonTextColor="text-white"
      />,
      <AutoGameGroup
        key="series-season-rating-game"
        title={t('seriesSeasonRatingGame.title')}
        description={t('seriesSeasonRatingGame.description')}
        icon={<TrendingUpIcon className="w-8 h-8 mr-3 text-white/80" />}
        onSelectGenre={onStartSeriesSeasonRatingGame}
        gradient="from-pink-500 to-rose-600 bg-gradient-to-br"
        borderColor="border-pink-400"
        buttonTextColor="text-white"
      />,
      <AutoGameGroup
        key="series-sorting-game"
        title={t('seriesSortingGame.title')}
        description={t('seriesSortingGame.description')}
        icon={<ListBulletIcon className="w-8 h-8 mr-3 text-white/80" />}
        onSelectGenre={onStartSeriesSortingGame}
        gradient="from-slate-500 to-slate-700 bg-gradient-to-br"
        borderColor="border-slate-400"
        buttonTextColor="text-white"
      />,
       <AutoGameGroup
          key="series-actor-quiz"
          title={t('seriesActorQuiz.title')}
          description={t('seriesActorQuiz.description')}
          icon={<UsersIcon className="w-8 h-8 mr-3 text-white/80" />}
          onSelectGenre={onStartSeriesActorQuiz}
          gradient="from-fuchsia-500 to-purple-600 bg-gradient-to-br"
          borderColor="border-fuchsia-400"
          buttonTextColor="text-white"
      />,
      <AutoGameGroup
          key="series-description-quiz"
          title={t('seriesDescriptionQuiz.title')}
          description={t('seriesDescriptionQuiz.description')}
          icon={<DocumentTextIcon className="w-8 h-8 mr-3 text-white/80" />}
          onSelectGenre={onStartSeriesDescriptionQuiz}
          gradient="from-lime-500 to-emerald-600 bg-gradient-to-br"
          borderColor="border-lime-400"
          buttonTextColor="text-white"
      />
  ];

  const searchAndCreateControls = (
      <div className="mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div className="flex-grow">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t('quizList.searchPlaceholder')}
                className="w-full max-w-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md py-3 px-4 text-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition dark:text-white dark:placeholder-gray-400"
              />
          </div>
          <button
              onClick={onCreateQuiz}
              className="flex-shrink-0 inline-flex items-center gap-2 bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-indigo-700 transition-colors duration-300 shadow-lg"
          >
              <PlusIcon className="w-5 h-5" />
              {t('quizList.createQuiz')}
          </button>
      </div>
  );

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="mb-8 mt-4">
            <nav className="flex justify-center items-center gap-4 sm:gap-6" aria-label="Categories">
                {categoryTabs.map(cat => (
                    <button
                        key={cat}
                        onClick={() => handleCategoryClick(cat)}
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
      
      <section>
        <div className="flex justify-center mb-6">
            <div className="flex items-center gap-2 bg-gray-200 dark:bg-gray-700 p-1 rounded-lg">
                {availableTabs.map(tab => {
                    const tabLabels = {
                        auto: 'quizList.autoQuizzesTab',
                        community: 'quizList.communityQuizzesTab',
                        my: 'quizList.myQuizzesTab',
                        leaderboard: 'quizList.leaderboardTab'
                    };
                    return (
                        <button 
                            key={tab}
                            onClick={() => setActiveContentTab(tab)} 
                            className={`px-4 py-1.5 text-sm font-semibold rounded-md transition ${activeContentTab === tab ? 'bg-white dark:bg-gray-800 shadow' : 'text-gray-600 dark:text-gray-300'}`}
                        >
                            {t(tabLabels[tab])}
                        </button>
                    )
                })}
            </div>
        </div>
        
        <div 
            className="overflow-hidden"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            <div 
                className="flex transition-transform duration-300 ease-in-out"
                style={{ transform: `translateX(-${activeTabIndex * 100}%)` }}
            >
                <div className="w-full flex-shrink-0 px-2">
                    {(activeCategory === QuizCategory.MOVIES || activeCategory === QuizCategory.SERIES) ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                            {activeCategory === QuizCategory.MOVIES && movieGameCards}
                            {activeCategory === QuizCategory.SERIES && seriesGameCards}
                        </div>
                     ) : (
                        <div className="text-center bg-gray-100 dark:bg-gray-800 rounded-lg p-12 mt-10">
                            <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300">{t('quizList.noAutoQuizzes')}</h2>
                            <p className="text-gray-500 dark:text-gray-400 mt-2">{t('quizList.checkOtherCategories')}</p>
                        </div>
                    )}
                </div>
                
                <div className="w-full flex-shrink-0 px-2">
                    {searchAndCreateControls}
                    {communityQuizzes.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                            {communityQuizzes.map((quiz) => (
                                <QuizCard 
                                    key={quiz.id} 
                                    quiz={quiz} 
                                    onStartQuiz={onStartQuiz} 
                                    onViewStats={onViewStats}
                                    onShareQuiz={handleShareQuiz}
                                    onDeleteQuiz={onDeleteQuiz}
                                    onEditQuiz={onEditQuiz}
                                    onReportQuiz={onReportQuiz}
                                    isMyQuiz={isMyQuiz(quiz)}
                                />
                            ))}
                        </div>
                    ) : (
                        <EmptyState type="community" searchTerm={searchTerm} />
                    )}
                </div>

                {isAuthenticated && (
                  <div className="w-full flex-shrink-0 px-2">
                      {searchAndCreateControls}
                      {myQuizzes.length > 0 ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                              {myQuizzes.map((quiz) => (
                                  <QuizCard 
                                      key={quiz.id} 
                                      quiz={quiz} 
                                      onStartQuiz={onStartQuiz} 
                                      onViewStats={onViewStats}
                                      onShareQuiz={handleShareQuiz}
                                      onDeleteQuiz={onDeleteQuiz}
                                      onEditQuiz={onEditQuiz}
                                      onReportQuiz={onReportQuiz}
                                      isMyQuiz={isMyQuiz(quiz)}
                                  />
                              ))}
                          </div>
                      ) : (
                          <EmptyState type="my" searchTerm={searchTerm} />
                      )}
                  </div>
                )}


                <div className="w-full flex-shrink-0">
                    <LeaderboardView leaderboards={leaderboards} currentUserId={userId} activeCategory={activeCategory} />
                </div>
            </div>
        </div>
      </section>

    </main>
  );
};