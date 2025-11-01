import React, { useState, useEffect, useCallback } from 'react';
import { getSeriesQuizRound, IMAGE_BASE_URL, Series } from '../services/tmdbService';
import { useTranslation } from '../hooks/useTranslation';
import { MovieGenre } from '../types';
import { PlayerHeader } from './PlayerHeader';

interface SeriesQuizPlayerProps {
  onBack: () => void;
  genre: MovieGenre;
  onGameOver: (game: 'seriesQuiz', genre: MovieGenre, score: number) => void;
}

interface RoundData {
  correctSeries: Series;
  options: string[];
}

export const SeriesQuizPlayer: React.FC<SeriesQuizPlayerProps> = ({ onBack, genre, onGameOver }) => {
  const { t } = useTranslation();
  const [score, setScore] = useState(0);
  const [roundData, setRoundData] = useState<RoundData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGameOver, setIsGameOver] = useState(false);
  const [userChoice, setUserChoice] = useState<{ title: string; isCorrect: boolean } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchNextRound = useCallback(async () => {
    setIsLoading(true);
    setUserChoice(null);
    setError(null);
    try {
      const data = await getSeriesQuizRound(genre);
      setRoundData(data);
    } catch (err) {
      setError('Failed to load new round. Please try again later.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [genre]);

  useEffect(() => {
    fetchNextRound();
  }, [fetchNextRound]);

  const handleAnswerSelect = (selectedTitle: string) => {
    if (userChoice || !roundData) return;

    const { correctSeries } = roundData;
    const correctTitleWithYear = `${correctSeries.name} (${new Date(correctSeries.first_air_date).getFullYear()})`;
    const isCorrect = selectedTitle === correctTitleWithYear;
    setUserChoice({ title: selectedTitle, isCorrect });

    if (isCorrect) {
      setTimeout(() => {
        setScore(prev => prev + 1);
        fetchNextRound();
      }, 1500);
    } else {
      onGameOver('seriesQuiz', genre, score);
      setTimeout(() => setIsGameOver(true), 1500);
    }
  };

  const handlePlayAgain = () => {
    setScore(0);
    setIsGameOver(false);
    fetchNextRound();
  };

  const getButtonClass = (option: string) => {
    const baseClass = "w-full text-left p-4 rounded-lg text-lg transition-all duration-300 transform disabled:opacity-70";
    if (!userChoice || !roundData) {
      return `${baseClass} bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 hover:scale-102`;
    }

    const { correctSeries } = roundData;
    const correctTitleWithYear = `${correctSeries.name} (${new Date(correctSeries.first_air_date).getFullYear()})`;
    const isCorrect = option === correctTitleWithYear;
    const isSelected = option === userChoice.title;

    if (isCorrect) return `${baseClass} bg-green-500 text-white scale-105 shadow-lg`;
    if (isSelected && !isCorrect) return `${baseClass} bg-red-500 text-white scale-105 shadow-lg`;
    
    return `${baseClass} bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200`;
  };

  if (isGameOver) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md text-center bg-white dark:bg-gray-800 p-8 rounded-xl shadow-2xl">
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-2">{t('movieQuiz.gameOver')}</h1>
          <p className="text-xl text-gray-500 dark:text-gray-400 mb-6">{t('movieQuiz.finalScore', { score })}</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button onClick={handlePlayAgain} className="bg-teal-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-teal-600 transition-colors duration-300 w-full sm:w-auto">
              {t('quizResult.playAgain')}
            </button>
            <button onClick={onBack} className="bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-indigo-700 transition-colors duration-300 w-full sm:w-auto">
              {t('quizResult.backToList')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <PlayerHeader onBack={onBack}>
          <div className="text-2xl font-bold bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm shadow-md px-4 py-2 rounded-lg text-gray-800 dark:text-white">
              {t('movieQuiz.score')}: <span className="text-teal-500">{score}</span>
          </div>
      </PlayerHeader>

      {isLoading && <p className="text-2xl animate-pulse dark:text-white">{t('movieQuiz.loading')}</p>}
      {error && <p className="text-2xl text-red-500 dark:text-red-400">{error}</p>}

      {!isLoading && !error && roundData && (
        <div className="w-full max-w-4xl pt-24 sm:pt-0">
          <div className="relative w-full aspect-video rounded-xl shadow-2xl overflow-hidden mb-8 border-4 border-white dark:border-gray-600">
            <img 
                key={roundData.correctSeries.id}
                src={`${IMAGE_BASE_URL}${roundData.correctSeries.backdrop_path}`} 
                alt="Series backdrop" 
                className="w-full h-full object-cover animate-fade-in"
            />
             <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {roundData.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(option)}
                disabled={!!userChoice}
                className={getButtonClass(option)}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Add fade-in animation to tailwind config or a style tag if needed
const style = document.createElement('style');
style.innerHTML = `
  @keyframes fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  .animate-fade-in {
    animation: fade-in 0.8s ease-in-out;
  }
`;
document.head.appendChild(style);