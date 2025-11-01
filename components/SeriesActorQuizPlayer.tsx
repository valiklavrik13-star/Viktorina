import React, { useState, useEffect, useCallback } from 'react';
import { getSeriesActorQuizRound, POSTER_IMAGE_BASE_URL, SeriesActorQuizRoundData } from '../services/tmdbService';
import { useTranslation } from '../hooks/useTranslation';
import { MovieGenre } from '../types';
import { PlayerHeader } from './PlayerHeader';

const ActorList: React.FC<{ actors: SeriesActorQuizRoundData['actors'] }> = ({ actors }) => {
    const { t } = useTranslation();
    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 mb-8">
            <h2 className="text-xl font-bold text-center text-gray-800 dark:text-white mb-4">{t('seriesActorQuiz.starring')}</h2>
            <div className="flex flex-wrap justify-center gap-4">
                {actors.map(actor => (
                    <div key={actor.id} className="text-center w-24">
                        <img 
                            src={`${POSTER_IMAGE_BASE_URL}${actor.profile_path}`} 
                            alt={actor.name} 
                            className="w-20 h-20 rounded-full object-cover mx-auto mb-2 border-2 border-gray-300 dark:border-gray-600"
                        />
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 leading-tight">{actor.name}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};


interface SeriesActorQuizPlayerProps {
  onBack: () => void;
  genre: MovieGenre;
  onGameOver: (game: 'seriesActorQuiz', genre: MovieGenre, score: number) => void;
}

export const SeriesActorQuizPlayer: React.FC<SeriesActorQuizPlayerProps> = ({ onBack, genre, onGameOver }) => {
  const { t } = useTranslation();
  const [score, setScore] = useState(0);
  const [roundData, setRoundData] = useState<SeriesActorQuizRoundData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGameOver, setIsGameOver] = useState(false);
  const [userChoice, setUserChoice] = useState<{ title: string; isCorrect: boolean } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchNextRound = useCallback(async () => {
    setIsLoading(true);
    setUserChoice(null);
    setError(null);
    try {
      const data = await getSeriesActorQuizRound(genre);
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
      onGameOver('seriesActorQuiz', genre, score);
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
        <div className="w-full max-w-3xl pt-28 sm:pt-16">
          <ActorList actors={roundData.actors} />
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