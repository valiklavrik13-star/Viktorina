import React, { useState, useEffect, useCallback } from 'react';
import { getYearQuizRound, POSTER_IMAGE_BASE_URL, YearQuizRoundData } from '../services/tmdbService';
import { useTranslation } from '../hooks/useTranslation';
import { MovieGenre } from '../types';
import { PlayerHeader } from './PlayerHeader';

interface YearQuizPlayerProps {
  onBack: () => void;
  genre: MovieGenre;
  onGameOver: (game: 'yearQuiz', genre: MovieGenre, score: number) => void;
}

export const YearQuizPlayer: React.FC<YearQuizPlayerProps> = ({ onBack, genre, onGameOver }) => {
  const { t } = useTranslation();
  const [score, setScore] = useState(0);
  const [roundData, setRoundData] = useState<YearQuizRoundData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGameOver, setIsGameOver] = useState(false);
  const [userChoice, setUserChoice] = useState<{ year: number; isCorrect: boolean } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchNextRound = useCallback(async () => {
    setIsLoading(true);
    setUserChoice(null);
    setError(null);
    try {
      const data = await getYearQuizRound(genre);
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

  const handleAnswerSelect = (selectedYear: number) => {
    if (userChoice || !roundData) return;

    const { correctYear } = roundData;
    const isCorrect = selectedYear === correctYear;
    setUserChoice({ year: selectedYear, isCorrect });

    if (isCorrect) {
      setTimeout(() => {
        setScore(prev => prev + 1);
        fetchNextRound();
      }, 1500);
    } else {
      onGameOver('yearQuiz', genre, score);
      setTimeout(() => setIsGameOver(true), 1500);
    }
  };

  const handlePlayAgain = () => {
    setScore(0);
    setIsGameOver(false);
    fetchNextRound();
  };

  const getButtonClass = (option: number) => {
    const baseClass = "w-full text-left p-4 rounded-lg text-lg transition-all duration-300 transform disabled:opacity-70 flex items-center justify-center";
    if (!userChoice || !roundData) {
      return `${baseClass} bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 hover:scale-102`;
    }

    const { correctYear } = roundData;
    const isCorrect = option === correctYear;
    const isSelected = option === userChoice.year;

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
        <div className="w-full max-w-2xl pt-28 sm:pt-16">
          <div className="flex flex-col items-center mb-8">
            <div className="relative w-52 sm:w-64 md:w-72 aspect-[2/3] rounded-xl shadow-2xl overflow-hidden mb-4 border-4 border-white dark:border-gray-600">
                <img 
                    key={roundData.movie.id}
                    src={`${POSTER_IMAGE_BASE_URL}${roundData.movie.poster_path}`} 
                    alt="Movie poster" 
                    className="w-full h-full object-cover animate-fade-in"
                />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center">{roundData.movie.title}</h2>
            {roundData.directorName && <p className="text-lg text-gray-500 dark:text-gray-400">{roundData.directorName}</p>}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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