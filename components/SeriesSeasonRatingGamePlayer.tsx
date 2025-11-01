import React, { useState, useEffect, useCallback } from 'react';
import { getSeriesSeasonRatingGameRound, POSTER_IMAGE_BASE_URL, SeriesSeason } from '../services/tmdbService';
import { useTranslation } from '../hooks/useTranslation';
import { MovieGenre } from '../types';
import { PlayerHeader } from './PlayerHeader';

interface SeriesSeasonRatingGamePlayerProps {
  onBack: () => void;
  genre: MovieGenre;
  onGameOver: (game: 'seriesSeasonRatingGame', genre: MovieGenre, score: number) => void;
}

type ChoiceStatus = {
    side: 'left' | 'right';
    isCorrect: boolean;
} | null;

type CardStatus = 'correct' | 'incorrect' | 'idle';

const SeasonCard: React.FC<{ season: SeriesSeason; onSelect: () => void; status: CardStatus; reveal: boolean }> = ({ season, onSelect, status, reveal }) => {
    const containerStyle = "flex flex-col items-center gap-3 w-[45%] max-w-[250px] cursor-pointer";

    const posterBaseStyle = "relative w-full aspect-[2/3] bg-gray-700 rounded-lg overflow-hidden shadow-lg transition-all duration-500";
    const posterHoverStyle = status === 'idle' ? "hover:shadow-2xl" : "";
    const posterStatusStyle = status === 'correct' ? "shadow-2xl border-4 border-green-500" : status === 'incorrect' ? "opacity-50" : "";

    return (
        <div className={containerStyle} onClick={onSelect}>
            <div className="w-full flex-grow min-h-20 flex flex-col justify-end items-center text-center">
                 <h3 className="text-gray-900 dark:text-white text-base md:text-lg font-bold leading-tight">
                    {season.series_name}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm md:text-base">{season.name}</p>
            </div>
            <div className={`${posterBaseStyle} ${posterHoverStyle} ${posterStatusStyle}`}>
                <img 
                    src={`${POSTER_IMAGE_BASE_URL}${season.poster_path}`} 
                    alt={season.name} 
                    className="w-full h-full object-cover" 
                />
            </div>
             <div className="h-16 flex items-center justify-center">
                 {reveal && (
                    <div className="text-center animate-fade-in bg-gray-200 dark:bg-gray-700 px-6 py-2 rounded-lg shadow-md">
                        <p className="text-gray-900 dark:text-white text-3xl font-extrabold">{season.vote_average.toFixed(1)}</p>
                    </div>
                )}
            </div>
        </div>
    );
}


export const SeriesSeasonRatingGamePlayer: React.FC<SeriesSeasonRatingGamePlayerProps> = ({ onBack, genre, onGameOver }) => {
    const { t } = useTranslation();
    const [score, setScore] = useState(0);
    const [seasonLeft, setSeasonLeft] = useState<SeriesSeason | null>(null);
    const [seasonRight, setSeasonRight] = useState<SeriesSeason | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isGameOver, setIsGameOver] = useState(false);
    const [choiceStatus, setChoiceStatus] = useState<ChoiceStatus>(null);
    const [error, setError] = useState<string | null>(null);
    
    const fetchNextRound = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        setChoiceStatus(null);
        try {
            const { season1, season2 } = await getSeriesSeasonRatingGameRound(genre);
            // Randomly assign to left/right
            if (Math.random() > 0.5) {
                setSeasonLeft(season1);
                setSeasonRight(season2);
            } else {
                setSeasonLeft(season2);
                setSeasonRight(season1);
            }
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

    const handleSelect = (selectedSide: 'left' | 'right') => {
        if (choiceStatus || !seasonLeft || !seasonRight) return;

        const chosenSeason = selectedSide === 'left' ? seasonLeft : seasonRight;
        const otherSeason = selectedSide === 'left' ? seasonRight : seasonLeft;

        const isCorrect = chosenSeason.vote_average >= otherSeason.vote_average;
        setChoiceStatus({ side: selectedSide, isCorrect });

        setTimeout(() => {
            if (isCorrect) {
                setScore(prev => prev + 1);
                fetchNextRound();
            } else {
                onGameOver('seriesSeasonRatingGame', genre, score);
                setIsGameOver(true);
            }
        }, 2000);
    };

    const handlePlayAgain = () => {
        setScore(0);
        setIsGameOver(false);
        fetchNextRound();
    };

    const getStatus = (cardSide: 'left' | 'right'): CardStatus => {
        if (!choiceStatus) return 'idle';
    
        const isThisCardChosen = choiceStatus.side === cardSide;
    
        if (isThisCardChosen) {
            return choiceStatus.isCorrect ? 'correct' : 'incorrect';
        } else {
            // This is the "other" card. It's "correct" if the user's choice was wrong.
            return choiceStatus.isCorrect ? 'incorrect' : 'correct';
        }
    }
    
    if (isGameOver) {
        return (
          <div className="min-h-screen flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md text-center bg-white dark:bg-gray-800 p-8 rounded-xl shadow-2xl">
              <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-2">{t('seriesSeasonRatingGame.gameOver')}</h1>
              <p className="text-xl text-gray-500 dark:text-gray-400 mb-6">{t('seriesSeasonRatingGame.finalScore', { score })}</p>
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
        <div className="min-h-screen flex flex-col items-center justify-center p-4 overflow-hidden">
            <PlayerHeader onBack={onBack}>
              <div className="text-2xl font-bold bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm shadow-md px-4 py-2 rounded-lg text-gray-800 dark:text-white">
                {t('seriesSeasonRatingGame.score')}: <span className="text-teal-500">{score}</span>
              </div>
            </PlayerHeader>

            {isLoading && <p className="text-2xl animate-pulse dark:text-white">{t('movieRatingGame.loading')}</p>}
            {error && <p className="text-2xl text-red-500 dark:text-red-400">{error}</p>}

            {!isLoading && !error && seasonLeft && seasonRight && (
                <div className="relative flex flex-row items-stretch justify-around w-full max-w-4xl mx-auto pt-24 sm:pt-0">
                    <SeasonCard 
                        season={seasonLeft} 
                        onSelect={() => handleSelect('left')} 
                        reveal={!!choiceStatus}
                        status={getStatus('left')}
                    />

                     <SeasonCard 
                        season={seasonRight} 
                        onSelect={() => handleSelect('right')} 
                        reveal={!!choiceStatus}
                        status={getStatus('right')}
                    />
                </div>
            )}
        </div>
    )
}

const style = document.createElement('style');
style.innerHTML = `
  @keyframes fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  .animate-fade-in {
    animation: fade-in 0.5s ease-in-out;
  }
`;
document.head.appendChild(style);