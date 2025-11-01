import React, { useState, useEffect, useCallback } from 'react';
import { getSeriesForSortingGame, POSTER_IMAGE_BASE_URL, SeriesSeason } from '../services/tmdbService';
import { useTranslation } from '../hooks/useTranslation';
import { MovieGenre } from '../types';
import { PlayerHeader } from './PlayerHeader';

const Poster: React.FC<{
  season: SeriesSeason;
  onClick: () => void;
  isGhost?: boolean;
}> = ({ season, onClick, isGhost }) => {
  return (
    <div
      onClick={onClick}
      className={`w-32 sm:w-36 flex-shrink-0 transition-opacity duration-200 ${isGhost ? 'opacity-30' : 'cursor-pointer'}`}
    >
      <div className="relative w-full aspect-[2/3] bg-gray-700 rounded-lg overflow-hidden shadow-lg border-2 border-transparent hover:border-indigo-500">
        <img
          src={`${POSTER_IMAGE_BASE_URL}${season.poster_path}`}
          alt={season.name}
          className="w-full h-full object-cover"
        />
      </div>
      <p className="mt-2 text-gray-800 dark:text-gray-200 text-sm sm:text-base font-semibold text-center leading-tight truncate">
        {season.name}
      </p>
    </div>
  );
};

const DropSlot: React.FC<{
  season: SeriesSeason | null;
  position: number;
  isSubmitted: boolean;
  isCorrect: boolean | null;
  isHoldingItem: boolean;
  onClick: () => void;
  onPosterClick: () => void;
}> = ({ season, position, isSubmitted, isCorrect, isHoldingItem, onClick, onPosterClick }) => {
  const baseStyle = "w-full h-full rounded-xl flex items-center justify-center transition-all duration-200";
  let borderStyle = "border-2 border-dashed border-gray-300 dark:border-gray-600";
  let content;

  if (isSubmitted && season) {
    borderStyle = isCorrect ? "border-4 border-green-500" : "border-4 border-red-500";
  } else if (isHoldingItem) {
    borderStyle = "border-2 border-solid border-indigo-500";
  }

  if (season) {
    content = (
      <div className="relative w-full aspect-[2/3] cursor-pointer" onClick={(e) => { e.stopPropagation(); onPosterClick()}}>
        <img
          src={`${POSTER_IMAGE_BASE_URL}${season.poster_path}`}
          alt={season.name}
          className="w-full h-full object-cover rounded-lg"
        />
        {isSubmitted && (
          <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-center py-1 font-bold text-lg">
            {season.vote_average.toFixed(1)}
          </div>
        )}
      </div>
    );
  } else {
    content = (
      <span className="text-4xl font-bold text-gray-300 dark:text-gray-600">
        {position}
      </span>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2 w-32 sm:w-36">
        <div 
            onClick={onClick}
            className={`w-full aspect-[2/3] p-1 ${baseStyle} ${borderStyle} ${isHoldingItem ? 'bg-indigo-500/10 cursor-pointer' : 'bg-gray-100 dark:bg-gray-800'} ${!season && isHoldingItem ? 'cursor-pointer' : ''}`}
        >
            {content}
        </div>
        <p className="h-10 text-gray-800 dark:text-gray-200 text-sm sm:text-base font-semibold text-center leading-tight flex items-center">
            {season?.name || ''}
        </p>
    </div>
  );
};

export const SeriesSortingGamePlayer: React.FC<{ onBack: () => void; genre: MovieGenre }> = ({ onBack, genre }) => {
  const { t } = useTranslation();
  const [seriesName, setSeriesName] = useState('');
  const [carouselSeasons, setCarouselSeasons] = useState<SeriesSeason[]>([]);
  const [placedSeasons, setPlacedSeasons] = useState<(SeriesSeason | null)[]>([]);
  const [correctOrder, setCorrectOrder] = useState<SeriesSeason[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const [heldItem, setHeldItem] = useState<{ season: SeriesSeason } | null>(null);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });


  const fetchNewGame = useCallback(async () => {
    setIsLoading(true);
    setIsSubmitted(false);
    setError(null);
    setScore(0);
    setHeldItem(null);
    try {
      const fetchedSeasons = await getSeriesForSortingGame(genre);
      setSeriesName(fetchedSeasons[0]?.series_name || '');
      const sortedByNumber = [...fetchedSeasons].sort((a,b) => a.season_number - b.season_number);
      setCarouselSeasons(sortedByNumber);
      setPlacedSeasons(Array(fetchedSeasons.length).fill(null));
      setCorrectOrder([...fetchedSeasons].sort((a, b) => b.vote_average - a.vote_average));
    } catch (err) {
      setError('Failed to load a new game. Please try again later.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [genre]);

  useEffect(() => {
    fetchNewGame();
  }, [fetchNewGame]);

  useEffect(() => {
    const handleMove = (e: MouseEvent | TouchEvent) => {
        if (heldItem) {
            const touch = (e as TouchEvent).touches?.[0];
            const x = touch ? touch.clientX : (e as MouseEvent).clientX;
            const y = touch ? touch.clientY : (e as MouseEvent).clientY;
            setCursorPosition({ x, y });
        }
    };
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('touchmove', handleMove);
    return () => {
        window.removeEventListener('mousemove', handleMove);
        window.removeEventListener('touchmove', handleMove);
    };
}, [heldItem]);


  const handlePickupFromCarousel = (season: SeriesSeason, index: number) => {
    if (isSubmitted || heldItem) return;
    setHeldItem({ season });
    setCarouselSeasons(prev => prev.filter((_, i) => i !== index));
  };

  const handlePickupFromSlot = (season: SeriesSeason, index: number) => {
    if (isSubmitted || heldItem) return;
    setHeldItem({ season });
    setPlacedSeasons(prev => {
        const newPlaced = [...prev];
        newPlaced[index] = null;
        return newPlaced;
    });
  };

  const handleDropOnSlot = (index: number) => {
    if (isSubmitted || !heldItem) return;

    const seasonAlreadyInSlot = placedSeasons[index];

    setPlacedSeasons(prev => {
        const newPlaced = [...prev];
        newPlaced[index] = heldItem.season;
        return newPlaced;
    });

    if (seasonAlreadyInSlot) {
        setCarouselSeasons(prev => [...prev, seasonAlreadyInSlot].sort((a,b) => a.season_number - b.season_number));
    }

    setHeldItem(null);
  };

  const handleDropOnCarousel = () => {
    if (isSubmitted || !heldItem) return;
    setCarouselSeasons(prev => [...prev, heldItem.season].sort((a,b) => a.season_number - b.season_number));
    setHeldItem(null);
  };


  const handleSubmit = () => {
    const allPlaced = placedSeasons.every(s => s !== null);
    if (!allPlaced) {
      alert(t('seriesSortingGame.placeAll'));
      return;
    }
    let currentScore = 0;
    placedSeasons.forEach((season, index) => {
      if (season?.id === correctOrder[index].id) {
        currentScore++;
      }
    });
    setScore(currentScore);
    setIsSubmitted(true);
  };
  
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center"><p className="text-2xl animate-pulse dark:text-white">{t('movieRatingGame.loading')}</p></div>;
  }
  
  if (error) {
    return <div className="min-h-screen flex items-center justify-center"><p className="text-2xl text-red-500 dark:text-red-400">{error}</p></div>;
  }

  return (
    <div className="min-h-screen flex flex-col items-center p-4">
      <PlayerHeader onBack={onBack} />
        {heldItem && (
            <div
            style={{
                position: 'fixed',
                left: cursorPosition.x,
                top: cursorPosition.y,
                transform: 'translate(-50%, -50%)',
                zIndex: 50,
                pointerEvents: 'none',
            }}
            className="w-32 sm:w-40"
            >
            <div className="relative w-full aspect-[2/3] bg-gray-700 rounded-lg overflow-hidden shadow-2xl scale-110 border-4 border-indigo-500 animate-pulse">
                <img 
                    src={`${POSTER_IMAGE_BASE_URL}${heldItem.season.poster_path}`} 
                    alt={heldItem.season.name} 
                    className="w-full h-full object-cover" 
                />
            </div>
            </div>
        )}

      <div className="w-full max-w-5xl mx-auto pt-24 sm:pt-28 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
          {seriesName || t('seriesSortingGame.title')}
        </h1>

        {isSubmitted ? (
            <div className="mt-8 text-center animate-fade-in h-[260px] flex flex-col justify-center items-center">
                <p className="text-2xl font-bold text-teal-500 dark:text-teal-400">
                {t('seriesSortingGame.scoreMessage', { score, total: correctOrder.length })}
                </p>
            </div>
        ) : (
            <>
                <p className="text-lg text-gray-500 dark:text-gray-400 mb-6">
                {t('seriesSortingGame.instructions')}
                </p>
                <div 
                    onClick={handleDropOnCarousel}
                    className="bg-gray-200/50 dark:bg-gray-800/50 rounded-xl p-4 min-h-[260px]"
                >
                    <div className="flex items-start gap-4 overflow-x-auto pb-4">
                        {carouselSeasons.map((season, index) => (
                           <Poster 
                             key={season.id} 
                             season={season} 
                             onClick={() => handlePickupFromCarousel(season, index)}
                           />
                        ))}
                        {carouselSeasons.length === 0 && <p className="w-full text-center text-gray-500 dark:text-gray-400 py-24">{t('seriesSortingGame.allPlaced')}</p>}
                    </div>
                </div>
            </>
        )}

        <div className="mt-8 flex flex-wrap items-start justify-center gap-4 sm:gap-6 min-h-[300px]">
            {placedSeasons.map((season, index) => (
                <DropSlot
                    key={index}
                    season={season}
                    position={index + 1}
                    isSubmitted={isSubmitted}
                    isCorrect={isSubmitted && season ? season.id === correctOrder[index].id : null}
                    isHoldingItem={!!heldItem}
                    onClick={() => handleDropOnSlot(index)}
                    onPosterClick={() => season && handlePickupFromSlot(season, index)}
                />
            ))}
        </div>


        <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
          {!isSubmitted ? (
            <button 
                onClick={handleSubmit} 
                className="bg-indigo-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-indigo-700 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={carouselSeasons.length > 0}
            >
              {t('seriesSortingGame.submit')}
            </button>
          ) : (
            <>
              <button onClick={fetchNewGame} className="bg-teal-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-teal-600 transition-colors duration-300 w-full sm:w-auto">
                {t('quizResult.playAgain')}
              </button>
              <button onClick={onBack} className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-bold py-3 px-6 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-300 w-full sm:w-auto">
                {t('quizResult.backToList')}
              </button>
            </>
          )}
        </div>
      </div>
       <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-in-out;
        }
        /* Custom scrollbar for carousel */
        .overflow-x-auto::-webkit-scrollbar {
            height: 8px;
        }
        .overflow-x-auto::-webkit-scrollbar-track {
            background: rgba(0,0,0,0.1);
            border-radius: 10px;
        }
        .overflow-x-auto::-webkit-scrollbar-thumb {
            background: rgba(0,0,0,0.3);
            border-radius: 10px;
        }
        .dark .overflow-x-auto::-webkit-scrollbar-thumb {
            background: rgba(255,255,255,0.3);
        }
      `}</style>
    </div>
  );
};
