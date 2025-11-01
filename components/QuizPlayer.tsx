import React, { useState, useEffect, useRef } from 'react';
import { Quiz, UserAnswers } from '../types';
import { useTranslation } from '../hooks/useTranslation';
import { PlayerHeader } from './PlayerHeader';
import { FlagIcon } from './icons/FlagIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { XCircleIcon } from './icons/XCircleIcon';

interface QuizPlayerProps {
  quiz: Quiz;
  onFinish: (answers: UserAnswers, quiz: Quiz) => void;
  onBack: () => void;
  onReportQuiz: (quiz: Quiz) => void;
}

const formatTime = (seconds: number) => {
    if (seconds < 0) seconds = 0;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

export const QuizPlayer: React.FC<QuizPlayerProps> = ({ quiz, onFinish, onBack, onReportQuiz }) => {
  const { t } = useTranslation();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<UserAnswers>({});
  const [score, setScore] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackToShow, setFeedbackToShow] = useState<{ message: string; isCorrect: boolean } | null>(null);
  
  const currentQuestion = quiz.questions[currentQuestionIndex];
  const isMultiAnswer = currentQuestion.correctAnswerIndex.length > 1;
  
  const [overallTimeLeft, setOverallTimeLeft] = useState(quiz.timeLimit);
  const [questionTimeLeft, setQuestionTimeLeft] = useState(currentQuestion.timeLimit);
  const questionTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  
  const advanceQuiz = (isCorrect: boolean, submittedAnswers: number[]) => {
    const newAnswers = { ...answers, [currentQuestion.id]: submittedAnswers };
    setAnswers(newAnswers);
  
    if (!isCorrect && quiz.playUntilFirstMistake) {
      onFinish(newAnswers, quiz);
      return;
    }
    
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      onFinish(newAnswers, quiz);
    }
  };

  const handleContinueFromFeedback = () => {
      if (!feedbackToShow) return;
      const isCorrect = feedbackToShow.isCorrect;
      setFeedbackToShow(null);
      advanceQuiz(isCorrect, selectedAnswers);
  };

  const evaluateAnswer = (submittedAnswers: number[]) => {
      if (isSubmitting) return;
      if (questionTimerRef.current) clearInterval(questionTimerRef.current);
      
      setIsSubmitting(true);
      setSelectedAnswers(submittedAnswers);
  
      const isCorrect = JSON.stringify([...submittedAnswers].sort()) === JSON.stringify([...currentQuestion.correctAnswerIndex].sort());
  
      if (isCorrect) setScore(prev => prev + 1);
      
      const feedback = currentQuestion.feedback;
      let messageToShow: string | null = null;
      if (feedback?.text) {
          const { text, displayCondition } = feedback;
          if (displayCondition === 'ALWAYS' ||
              (displayCondition === 'ON_CORRECT' && isCorrect) ||
              (displayCondition === 'ON_INCORRECT' && !isCorrect)) {
              messageToShow = text;
          }
      }
  
      setTimeout(() => {
          if (messageToShow) {
              setFeedbackToShow({ message: messageToShow, isCorrect });
          } else {
              advanceQuiz(isCorrect, submittedAnswers);
          }
      }, 1500);
  };

  // Overall Quiz Timer
  useEffect(() => {
    if (!overallTimeLeft || overallTimeLeft <= 0) return;
    const timer = setInterval(() => {
        setOverallTimeLeft(prev => {
            if (prev !== undefined && prev <= 1) {
                clearInterval(timer);
                onFinish(answers, quiz); // Time's up
                return 0;
            }
            return prev !== undefined ? prev - 1 : undefined;
        });
    }, 1000);
    return () => clearInterval(timer);
  }, [quiz.id, onFinish, answers, quiz]);

  // Per-Question Timer
  useEffect(() => {
    const question = quiz.questions[currentQuestionIndex];
    setQuestionTimeLeft(question.timeLimit);
    setSelectedAnswers([]);
    setIsSubmitting(false);

    if (questionTimerRef.current) {
      clearInterval(questionTimerRef.current);
    }

    if (!question.timeLimit || question.timeLimit <= 0) return;

    questionTimerRef.current = setInterval(() => {
        setQuestionTimeLeft(prev => {
            if (prev !== undefined && prev <= 1) {
                if (questionTimerRef.current) clearInterval(questionTimerRef.current);
                evaluateAnswer(isMultiAnswer ? selectedAnswers : []);
                return 0;
            }
            return prev !== undefined ? prev - 1 : undefined;
        });
    }, 1000);

    return () => {
      if (questionTimerRef.current) clearInterval(questionTimerRef.current);
    };
  }, [currentQuestionIndex, quiz.questions]);


  const handleOptionClick = (optionIndex: number) => {
    if (isSubmitting) return;

    if (!isMultiAnswer) {
      evaluateAnswer([optionIndex]);
      return;
    }

    setSelectedAnswers(prev => 
      prev.includes(optionIndex) 
        ? prev.filter(i => i !== optionIndex)
        : [...prev, optionIndex]
    );
  };
  
  const progressPercentage = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <PlayerHeader onBack={onBack}>
        <div className="flex flex-col items-end gap-3">
          <div className="flex flex-col items-end gap-2 text-sm sm:text-base">
              <div className="font-bold bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm shadow-md px-3 py-1 rounded-lg text-gray-800 dark:text-white">
                  {t('movieQuiz.score')}: <span className="text-teal-500 font-bold">{score}</span>
              </div>
              {quiz.timeLimit && overallTimeLeft !== undefined ? (
                  <div className="font-bold bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm px-3 py-1 rounded-lg text-gray-800 dark:text-white">
                      <span>{t('quizPlayer.quizTime')}: </span>
                      <span className="text-teal-500 min-w-[45px] sm:min-w-[50px] inline-block text-right">{formatTime(overallTimeLeft)}</span>
                  </div>
              ) : null}
               {currentQuestion.timeLimit && questionTimeLeft !== undefined ? (
                  <div className="font-bold bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm px-3 py-1 rounded-lg text-gray-800 dark:text-white">
                      <span>{t('quizPlayer.questionTime')}: </span>
                      <span className={`min-w-[45px] sm:min-w-[50px] inline-block text-right ${questionTimeLeft <= 10 ? 'text-red-500 animate-pulse' : 'text-teal-500'}`}>
                          {formatTime(questionTimeLeft)}
                      </span>
                  </div>
              ) : null}
          </div>
          <button
            onClick={() => onReportQuiz(quiz)}
            title={t('quizCard.report')}
            className="flex items-center gap-2 text-red-600 dark:text-red-400 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm shadow-md hover:bg-red-100/80 dark:hover:bg-red-900/70 transition-colors font-semibold p-2 rounded-lg"
          >
            <FlagIcon className="w-5 h-5"/>
          </button>
        </div>
      </PlayerHeader>
      
      <div className="w-full max-w-2xl pt-28 sm:pt-16">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white break-words">{quiz.title}</h1>
          <p className="text-lg text-gray-500 dark:text-gray-400">{t(`category.${quiz.category}`)}</p>
        </div>

        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-8">
            <div className="bg-teal-500 h-2.5 rounded-full" style={{ width: `${progressPercentage}%`, transition: 'width 0.5s ease-in-out' }}></div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700">
            <p className="text-gray-500 dark:text-gray-400 mb-2 font-semibold">{t('quizPlayer.question', { current: currentQuestionIndex + 1, total: quiz.questions.length })}</p>
            <h2 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-white break-all">{currentQuestion.questionText}</h2>

            {currentQuestion.image && (
                <div className="mb-6 rounded-lg overflow-hidden">
                    <img src={currentQuestion.image} alt="Question visual aid" className="w-full max-h-80 object-contain" />
                </div>
            )}
            
            {isMultiAnswer && (
              <p className="text-center text-sm text-gray-500 dark:text-gray-400 -mt-2 mb-4">{t('quizPlayer.multiSelectHint')}</p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentQuestion.options.map((option, index) => {
                const isAnswered = isSubmitting;
                const isCorrect = currentQuestion.correctAnswerIndex.includes(index);
                const isSelected = selectedAnswers.includes(index);

                const baseClasses = "w-full text-left p-4 rounded-lg text-lg transition-all duration-300 transform break-all";
                
                let stateClasses;
                if (isAnswered) {
                    if (isCorrect) {
                        stateClasses = "bg-green-500 text-white scale-105 shadow-lg";
                    } else if (isSelected) {
                        stateClasses = "bg-red-500 text-white scale-105 shadow-lg";
                    } else {
                        stateClasses = "bg-gray-200 dark:bg-gray-700 opacity-60";
                    }
                } else {
                    if (isSelected) {
                        stateClasses = "bg-indigo-400 dark:bg-indigo-600 text-white scale-102";
                    } else {
                        stateClasses = "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 hover:scale-102";
                    }
                }
                
                return (
                    <button
                        key={index}
                        onClick={() => handleOptionClick(index)}
                        disabled={isSubmitting || (!isMultiAnswer && isAnswered)}
                        className={`${baseClasses} ${stateClasses}`}
                    >
                        {option}
                    </button>
                )
            })}
            </div>
            {isMultiAnswer && !isSubmitting && (
              <div className="mt-6">
                  <button
                      onClick={() => evaluateAnswer(selectedAnswers)}
                      disabled={selectedAnswers.length === 0}
                      className="w-full bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-indigo-700 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                      {t('quizPlayer.submitAnswer')}
                  </button>
              </div>
            )}
        </div>
      </div>
      {feedbackToShow && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in" role="alertdialog" aria-modal="true">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6 sm:p-8 text-center border border-gray-200 dark:border-gray-700 transform animate-scale-in">
                {feedbackToShow.isCorrect ? (
                    <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
                ) : (
                    <XCircleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
                )}
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {feedbackToShow.isCorrect ? t('quizPlayer.feedbackCorrectTitle') : t('quizPlayer.feedbackIncorrectTitle')}
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-6 break-words">{feedbackToShow.message}</p>
                <button onClick={handleContinueFromFeedback} className="w-full bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-indigo-700 transition-colors duration-300">
                    {t('quizPlayer.continue')}
                </button>
            </div>
        </div>
      )}
      <style>{`
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        .animate-fade-in { animation: fade-in 0.2s ease-out forwards; }
        @keyframes scale-in { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        .animate-scale-in { animation: scale-in 0.2s ease-out forwards; }
      `}</style>
    </div>
  );
};