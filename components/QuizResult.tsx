import React, { useState, useMemo } from 'react';
import { Quiz, UserAnswers } from '../types';
import { StarRating } from './StarRating';
import { useTranslation } from '../hooks/useTranslation';

interface QuizResultProps {
  quiz: Quiz;
  userAnswers: UserAnswers;
  onRestart: () => void;
  onBackToList: () => void;
  onRateQuiz: (quizId: string, rating: number) => void;
  isAuthenticated: boolean;
}

export const QuizResult: React.FC<QuizResultProps> = ({ quiz, userAnswers, onRestart, onBackToList, onRateQuiz, isAuthenticated }) => {
  const { t } = useTranslation();
  const [rating, setRating] = useState(0);
  
  const score = useMemo(() => {
    return quiz.questions.reduce((acc, question) => {
      const userAnswer = userAnswers[question.id];
      const correctAnswer = question.correctAnswerIndex;

      // Handle legacy single-number answers if they exist
      if (typeof userAnswer === 'number') {
        if (correctAnswer.length === 1 && userAnswer === correctAnswer[0]) {
          return acc + 1;
        }
        return acc;
      }
      
      // Compare arrays for multi-answer questions
      if (Array.isArray(userAnswer) && Array.isArray(correctAnswer)) {
        const sortedUserAnswer = [...userAnswer].sort();
        const sortedCorrectAnswer = [...correctAnswer].sort();
        if (sortedUserAnswer.length === sortedCorrectAnswer.length && 
            sortedUserAnswer.every((val, index) => val === sortedCorrectAnswer[index])) {
          return acc + 1;
        }
      }
      
      return acc;
    }, 0);
  }, [quiz.questions, userAnswers]);

  const percentage = Math.round((score / quiz.questions.length) * 100);

  const handleRatingChange = (newRating: number) => {
    if (!isAuthenticated) return;
    setRating(newRating);
    onRateQuiz(quiz.id, newRating);
  };
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl text-center bg-white dark:bg-gray-800 p-8 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700">
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-2">{t('quizResult.complete')}</h1>
        <p className="text-xl text-gray-500 dark:text-gray-400 mb-6 break-words">{t('quizResult.youPlayed')} {quiz.title}</p>
        
        <div className="mb-8">
            <p className="text-lg text-gray-700 dark:text-gray-300">{t('quizResult.yourScore')}</p>
            <p className="text-7xl font-bold text-teal-500 dark:text-teal-400 my-2">{percentage}%</p>
            <p className="text-lg text-gray-700 dark:text-gray-300">{t('quizResult.scoreDetails', { score: score, total: quiz.questions.length })}</p>
        </div>

        <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg mb-8">
            <p className="text-lg text-gray-800 dark:text-gray-200 mb-2">{t('quizResult.rateQuiz')}</p>
            {isAuthenticated ? (
              <>
                <div className="flex justify-center">
                    <StarRating value={rating} onChange={handleRatingChange} size={36} isEditable={true} />
                </div>
                {rating > 0 && <p className="text-teal-500 dark:text-teal-400 mt-2 text-sm">{t('quizResult.feedbackThanks')}</p>}
              </>
            ) : (
               <p className="text-gray-500 dark:text-gray-400 mt-2">{t('quizResult.loginToRate')}</p>
            )}
        </div>

        <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button onClick={onRestart} className="bg-teal-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-teal-600 transition-colors duration-300 w-full sm:w-auto">
                {t('quizResult.playAgain')}
            </button>
            <button onClick={onBackToList} className="bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-indigo-700 transition-colors duration-300 w-full sm:w-auto">
                {t('quizResult.backToList')}
            </button>
        </div>
      </div>
    </div>
  );
};