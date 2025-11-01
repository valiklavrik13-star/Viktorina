import React, { useState, useEffect, useCallback } from 'react';
import { getDescriptionQuizRound, DescriptionQuizRoundData } from '../services/tmdbService';
import { useTranslation } from '../hooks/useTranslation';
import { MovieGenre } from '../types';
import { PlayerHeader } from './PlayerHeader';

type Word = {
  text: string;
  cost: number;
  revealed: boolean;
};

interface DescriptionQuizPlayerProps {
  onBack: () => void;
  genre: MovieGenre;
  onGameOver: (game: 'descriptionQuiz', genre: MovieGenre, result: { rounds: number, avgPercentage: number }) => void;
}

export const DescriptionQuizPlayer: React.FC<DescriptionQuizPlayerProps> = ({ onBack, genre, onGameOver }) => {
  const { t } = useTranslation();
  const [score, setScore] = useState(0); // This now represents rounds won
  const [roundData, setRoundData] = useState<DescriptionQuizRoundData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGameOver, setIsGameOver] = useState(false);
  const [userChoice, setUserChoice] = useState<{ title: string; isCorrect: boolean } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [gameOverMessage, setGameOverMessage] = useState('');

  const [words, setWords] = useState<Word[]>([]);
  const [budget, setBudget] = useState(100);
  const [sessionRoundPercentages, setSessionRoundPercentages] = useState<number[]>([]);
  
  const calculateWordCosts = (wordArray: string[]): Word[] => {
    const count = wordArray.length;
    if (count === 0) return [];

    // Assign weights in a decreasing sequence (e.g., for 5 words: 5, 4, 3, 2, 1)
    const weights = Array.from({ length: count }, (_, i) => count - i);
    
    // Sum of weights (sum of an arithmetic series 1 to n)
    const totalWeight = count * (count + 1) / 2;

    if (totalWeight === 0) {
        // Fallback for empty or single-word descriptions, though unlikely with the filter.
        return wordArray.map(text => ({ text, cost: 100 / (count || 1), revealed: false }));
    }
    
    // Calculate the cost of each word as its share of 100% based on its weight.
    return wordArray.map((text, index) => {
      const weight = weights[index];
      const cost = (weight / totalWeight) * 100;
      return {
        text,
        cost: parseFloat(cost.toFixed(2)),
        revealed: false,
      };
    });
  };

  const triggerGameOver = useCallback(() => {
    const avgPercentage = sessionRoundPercentages.length > 0
        ? sessionRoundPercentages.reduce((a, b) => a + b, 0) / sessionRoundPercentages.length
        : 100; // If no rounds were won, the average spend is effectively 100% for the losing round
    onGameOver('descriptionQuiz', genre, { rounds: score, avgPercentage });
    setIsGameOver(true);
  }, [sessionRoundPercentages, onGameOver, genre, score]);

  const fetchNextRound = useCallback(async () => {
    setIsLoading(true);
    setUserChoice(null);
    setError(null);
    setBudget(100);
    try {
      const data = await getDescriptionQuizRound(genre);
      setRoundData(data);
      const wordArray = data.correctMovie.overview?.split(/\s+/) || [];
      setWords(calculateWordCosts(wordArray.filter(w => w.length > 0)));
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
  
  const handleWordClick = (index: number) => {
    if (words[index].revealed || userChoice || isGameOver) return;
    
    const wordCost = words[index].cost;
    const newBudget = budget - wordCost;

    const newWords = [...words];
    newWords[index] = { ...newWords[index], revealed: true };
    setWords(newWords);
    
    if (newBudget <= 0) {
        setBudget(0);
        setGameOverMessage(t('descriptionQuiz.gameOverMessage'));
        setTimeout(() => triggerGameOver(), 1500);
    } else {
        setBudget(newBudget);
    }
  };

  const handleAnswerSelect = (selectedTitle: string) => {
    if (userChoice || !roundData) return;

    const { correctMovie } = roundData;
    const correctTitleWithYear = `${correctMovie.title} (${new Date(correctMovie.release_date).getFullYear()})`;
    const isCorrect = selectedTitle === correctTitleWithYear;
    setUserChoice({ title: selectedTitle, isCorrect });

    if (isCorrect) {
      const usedBudget = 100 - budget;
      setSessionRoundPercentages(prev => [...prev, usedBudget]);
      setTimeout(() => {
        setScore(prev => prev + 1);
        fetchNextRound();
      }, 1500);
    } else {
      setGameOverMessage(t('movieQuiz.gameOver'));
      setTimeout(() => triggerGameOver(), 1500);
    }
  };

  const handlePlayAgain = () => {
    setScore(0);
    setIsGameOver(false);
    setSessionRoundPercentages([]);
    fetchNextRound();
  };

  const getButtonClass = (option: string) => {
    const baseClass = "w-full text-left p-4 rounded-lg text-lg transition-all duration-300 transform disabled:opacity-70";
    if (!userChoice || !roundData) {
      return `${baseClass} bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 hover:scale-102`;
    }

    const { correctMovie } = roundData;
    const correctTitleWithYear = `${correctMovie.title} (${new Date(correctMovie.release_date).getFullYear()})`;
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
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-2">{gameOverMessage}</h1>
          <p className="text-xl text-gray-500 dark:text-gray-400 mb-6">{t('userProfile.descriptionQuizRounds')}: {score}</p>
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

  const budgetColor = budget > 50 ? 'bg-green-500' : budget > 20 ? 'bg-yellow-500' : 'bg-red-500';

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <PlayerHeader onBack={onBack}>
          <div className="text-xl font-bold bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm shadow-md px-4 py-2 rounded-lg text-gray-800 dark:text-white">
              {t('movieQuiz.score')}: <span className="text-teal-500">{score}</span>
          </div>
      </PlayerHeader>
      
      {isLoading && <p className="text-2xl animate-pulse dark:text-white">{t('movieQuiz.loading')}</p>}
      {error && <p className="text-2xl text-red-500 dark:text-red-400">{error}</p>}

      {!isLoading && !error && roundData && (
        <div className="w-full max-w-3xl pt-28 sm:pt-16">
            <div className="mb-4">
                <div className="flex justify-between items-center mb-1">
                    <span className="text-lg font-semibold text-gray-800 dark:text-white">{t('descriptionQuiz.budget')}</span>
                    <span className="text-lg font-bold text-gray-800 dark:text-white">{budget.toFixed(2)}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
                    <div className={`${budgetColor} h-4 rounded-full transition-all duration-300`} style={{ width: `${budget}%`}}></div>
                </div>
            </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 mb-8 min-h-[150px] max-h-[40vh] overflow-y-auto">
            <div className="flex flex-wrap gap-x-2.5 gap-y-2 leading-relaxed text-xl">
                {words.map((word, index) => (
                    <span
                    key={index}
                    onClick={() => handleWordClick(index)}
                    className={`transition-all duration-300 rounded px-1 py-0.5 select-none ${
                        word.revealed
                        ? 'bg-transparent text-current'
                        : 'bg-gray-300 dark:bg-gray-600 text-transparent cursor-pointer hover:bg-gray-400 dark:hover:bg-gray-500 blur-sm hover:blur-none'
                    }`}
                    >
                    {word.text}
                    </span>
                ))}
            </div>
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
