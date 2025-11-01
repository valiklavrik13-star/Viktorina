import React from 'react';
import { Quiz } from '../types';
import { useTranslation } from '../hooks/useTranslation';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';

interface QuizStatsProps {
  quiz: Quiz;
  onBack: () => void;
}

const ProgressBar = ({ percent, isCorrect }: { percent: number, isCorrect: boolean }) => {
    const bgColor = isCorrect ? 'bg-teal-500' : 'bg-gray-300 dark:bg-gray-600';
    return (
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-6 relative">
            <div 
                className={`${bgColor} h-6 rounded-full transition-all duration-500`} 
                style={{ width: `${percent}%` }}
            ></div>
            <span className="absolute inset-0 flex items-center justify-end pr-3 text-sm font-medium text-gray-800 dark:text-white">
                {percent.toFixed(1)}%
            </span>
        </div>
    )
};


export const QuizStats: React.FC<QuizStatsProps> = ({ quiz, onBack }) => {
  const { t } = useTranslation();

  const totalPlays = quiz.stats.totalPlays;
  const averageScore = totalPlays > 0 
    ? (quiz.stats.totalCorrectAnswers / (totalPlays * quiz.questions.length)) * 100 
    : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="relative mb-8">
        <button onClick={onBack} className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
          <ArrowLeftIcon className="w-5 h-5"/>
          {t('stats.back')}
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 break-words">{quiz.title}</h1>
        <p className="text-xl text-gray-500 dark:text-gray-400">{t('stats.title')}</p>
      </div>

      {totalPlays === 0 ? (
        <div className="text-center bg-gray-100 dark:bg-gray-800 rounded-lg p-12">
            <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300">{t('stats.noStats')}</h2>
        </div>
      ) : (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 text-center">
                    <p className="text-lg text-gray-500 dark:text-gray-400">{t('stats.totalPlays')}</p>
                    <p className="text-5xl font-bold text-indigo-600 dark:text-indigo-400">{totalPlays}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 text-center">
                    <p className="text-lg text-gray-500 dark:text-gray-400">{t('stats.averageScore')}</p>
                    <p className="text-5xl font-bold text-teal-500 dark:text-teal-400">{averageScore.toFixed(1)}%</p>
                </div>
            </div>

            <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('stats.questionStats')}</h2>
                {quiz.questions.map((question, index) => {
                    const stats = quiz.stats.questionStats[question.id] || { attempts: 0, correct: 0, answers: {} };
                    const totalAttempts = stats.attempts;
                    const correctPercentage = totalAttempts > 0 ? (stats.correct / totalAttempts) * 100 : 0;
                    
                    return (
                        <div key={question.id} className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-1 break-all">
                                {t('createQuiz.question')} {index + 1}: {question.questionText}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                                {t('stats.correctAnswer')}: {correctPercentage.toFixed(1)}%
                            </p>
                            <div className="space-y-3">
                                {question.options.map((option, optionIndex) => {
                                    const answerCount = stats.answers[optionIndex] || 0;
                                    const answerPercentage = totalAttempts > 0 ? (answerCount / totalAttempts) * 100 : 0;
                                    const isCorrect = optionIndex === question.correctAnswerIndex;
                                    
                                    return (
                                        <div key={optionIndex}>
                                            <p className={`text-sm mb-1 break-all ${isCorrect ? 'font-semibold text-teal-600 dark:text-teal-400' : 'text-gray-600 dark:text-gray-300'}`}>
                                                {option}
                                            </p>
                                            <ProgressBar percent={answerPercentage} isCorrect={isCorrect} />
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )
                })}
            </div>
        </>
      )}
    </div>
  );
};