import React, { useState, useEffect, useCallback } from 'react';
import { getMovieForRatingGame, POSTER_IMAGE_BASE_URL, Movie } from '../services/tmdbService';
import { useTranslation } from '../hooks/useTranslation';
import { MovieGenre } from '../types';
import { PlayerHeader } from './PlayerHeader';

interface MovieRatingGamePlayerProps {
  onBack: () => void;
  genre: MovieGenre;
  onGameOver: (game: 'movieRatingGame', genre: MovieGenre, score: number) => void;
}

type ChoiceStatus = {
    side: 'left' | 'right';
    isCorrect: boolean;
} | null;

type MovieCardStatus = 'correct' | 'incorrect' | 'idle';

const MovieCard: React.FC<{ movie: Movie; onSelect: () => void; status: MovieCardStatus; reveal: boolean }> = ({ movie, onSelect, status, reveal }) => {
    const containerStyle = "flex flex-col items-center gap-3 w-[45%] max-w-[250px] cursor-pointer";

    const posterBaseStyle = "relative w-full aspect-[2/3] bg-gray-700 rounded-lg overflow-hidden shadow-lg transition-all duration-500";
    const posterHoverStyle = status === 'idle' ? "hover:shadow-2xl" : "";
    const posterStatusStyle = status === 'correct' ? "shadow-2xl border-4 border-green-500" : status === 'incorrect' ? "opacity-50" : "";

    const year = movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A';

    return (
        <div className={containerStyle} onClick={onSelect}>
            <div className="w-full flex-grow min-h-16 flex flex-col justify-end items-center text-center">
                 <h3 className="text-gray-900 dark:text-white text-base md:text-lg font-bold leading-tight">
                    {movie.title}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm md:text-base">{year}</p>
            </div>
            <div className={`${posterBaseStyle} ${posterHoverStyle} ${posterStatusStyle}`}>
                <img 
                    src={`${POSTER_IMAGE_BASE_URL}${movie.poster_path}`} 
                    alt={movie.title} 
                    className="w-full h-full object-cover" 
                />
            </div>
             <div className="h-16 flex items-center justify-center">
                 {reveal && (
                    <div className="text-center animate-fade-in bg-gray-200 dark:bg-gray-700 px-6 py-2 rounded-lg shadow-md">
                        <p className="text-gray-900 dark:text-white text-3xl font-extrabold">{movie.vote_average.toFixed(1)}</p>
                    </div>
                )}
            </div>
        </div>
    );
}


export const MovieRatingGamePlayer: React.FC<MovieRatingGamePlayerProps> = ({ onBack, genre, onGameOver }) => {
    const { t } = useTranslation();
    const [score, setScore] = useState(0);
    const [movieLeft, setMovieLeft] = useState<Movie | null>(null);
    const [movieRight, setMovieRight] = useState<Movie | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isGameOver, setIsGameOver] = useState(false);
    const [choiceStatus, setChoiceStatus] = useState<ChoiceStatus>(null);
    const [error, setError] = useState<string | null>(null);
    
    // State for new difficulty logic
    const [difficultyLevel, setDifficultyLevel] = useState<'normal' | 'hard'>('normal');
    const [roundsUntilForcedSpecial, setRoundsUntilForcedSpecial] = useState(() => Math.floor(Math.random() * 3) + 3); // 3-5
    const [wasLastRoundSpecial, setWasLastRoundSpecial] = useState(false);

    const startGame = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        setChoiceStatus(null);
        
        // Reset difficulty state for a new game
        setDifficultyLevel('normal');
        setRoundsUntilForcedSpecial(Math.floor(Math.random() * 3) + 3); // 3-5 rounds until first special
        setWasLastRoundSpecial(false);

        try {
            const firstMovie = await getMovieForRatingGame({}, genre);
            const secondMovie = await getMovieForRatingGame({ excludeId: firstMovie.id, excludeVoteAverage: firstMovie.vote_average }, genre);
            
            setMovieLeft(firstMovie);
            setMovieRight(secondMovie);

        } catch (err) {
            setError('Failed to load new round. Please try again later.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [genre]);

    useEffect(() => {
        startGame();
    }, [startGame]);

    const handleSelect = (selectedSide: 'left' | 'right') => {
        if (choiceStatus || !movieLeft || !movieRight) return;

        const chosenMovie = selectedSide === 'left' ? movieLeft : movieRight;
        const otherMovie = selectedSide === 'left' ? movieRight : movieLeft;

        const isCorrect = chosenMovie.vote_average >= otherMovie.vote_average;
        setChoiceStatus({ side: selectedSide, isCorrect });

        setTimeout(() => {
            if (isCorrect) {
                setScore(prev => prev + 1);
                
                // Determine next difficulty level based on performance
                let nextDifficultyLevel = difficultyLevel;
                if (wasLastRoundSpecial && difficultyLevel === 'normal') {
                    nextDifficultyLevel = 'hard';
                    setDifficultyLevel('hard');
                }
                
                const winner = chosenMovie;
                
                const fetchNextMovie = async () => {
                    const isNextRoundSpecial = roundsUntilForcedSpecial <= 0;
                    setWasLastRoundSpecial(isNextRoundSpecial);

                    const ratingDiff = nextDifficultyLevel === 'hard' ? 0.3 : 0.5;

                    try {
                        const nextMovie = await getMovieForRatingGame({
                            excludeId: winner.id,
                            excludeVoteAverage: isNextRoundSpecial ? undefined : winner.vote_average,
                            fetchCloseRating: isNextRoundSpecial,
                            targetRating: winner.vote_average,
                            ratingDifference: ratingDiff,
                        }, genre);

                        setMovieLeft(winner);
                        setMovieRight(nextMovie);
                        setChoiceStatus(null);

                        if (isNextRoundSpecial) {
                            // Reset countdown based on the new difficulty
                            const resetValue = nextDifficultyLevel === 'hard' ? 2 : 4; // next special in 3 or 5 rounds
                            setRoundsUntilForcedSpecial(resetValue);
                        } else {
                            setRoundsUntilForcedSpecial(prev => prev - 1);
                        }
                    } catch(err) {
                        setError('Failed to load next movie.');
                        console.error(err);
                    }
                };
                fetchNextMovie();

            } else {
                onGameOver('movieRatingGame', genre, score);
                setIsGameOver(true);
            }
        }, 2000);
    };

    const handlePlayAgain = () => {
        setScore(0);
        setIsGameOver(false);
        startGame();
    };

    const getStatus = (cardSide: 'left' | 'right'): MovieCardStatus => {
        if (!choiceStatus) return 'idle';
    
        const isThisCardChosen = choiceStatus.side === cardSide;
    
        if (isThisCardChosen) {
            return choiceStatus.isCorrect ? 'correct' : 'incorrect';
        } else {
            return choiceStatus.isCorrect ? 'incorrect' : 'correct';
        }
    }
    
    if (isGameOver) {
        return (
          <div className="min-h-screen flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md text-center bg-white dark:bg-gray-800 p-8 rounded-xl shadow-2xl">
              <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-2">{t('movieRatingGame.gameOver')}</h1>
              <p className="text-xl text-gray-500 dark:text-gray-400 mb-6">{t('movieRatingGame.finalScore', { score })}</p>
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
                {t('movieRatingGame.score')}: <span className="text-teal-500">{score}</span>
              </div>
            </PlayerHeader>

            {isLoading && <p className="text-2xl animate-pulse dark:text-white">{t('movieRatingGame.loading')}</p>}
            {error && <p className="text-2xl text-red-500 dark:text-red-400">{error}</p>}

            {!isLoading && !error && movieLeft && movieRight && (
                <div className="relative flex flex-row items-stretch justify-around w-full max-w-4xl mx-auto pt-24 sm:pt-0">
                    <MovieCard 
                        movie={movieLeft} 
                        onSelect={() => handleSelect('left')} 
                        reveal={true}
                        status={getStatus('left')}
                    />

                     <MovieCard 
                        movie={movieRight} 
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