import React, { useState } from 'react';
import { Quiz, Question, QuizCategory, QuestionFeedback, FeedbackDisplayCondition } from '../types';
import { PlusIcon } from './icons/PlusIcon';
import { TrashIcon } from './icons/TrashIcon';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';
import { useTranslation } from '../hooks/useTranslation';

type QuizData = Omit<Quiz, 'id' | 'ratings' | 'averageRating' | 'creatorId' | 'stats' | 'playedBy'>;

interface CreateQuizProps {
  onSaveQuiz: (quizData: QuizData) => void;
  onBack: () => void;
  quizToEdit?: Quiz | null;
}

interface QuestionEditorProps {
  question: Question;
  index: number;
  updateQuestion: (index: number, question: Question) => void;
  removeQuestion: (index: number) => void;
}

const secondsToMinSec = (totalSeconds: number | undefined): { minutes: number; seconds: number } => {
  const s = totalSeconds || 0;
  if (s <= 0) return { minutes: 0, seconds: 0 };
  const minutes = Math.floor(s / 60);
  const seconds = s % 60;
  return { minutes, seconds };
};

const QuestionEditor: React.FC<QuestionEditorProps> = ({
  question,
  index,
  updateQuestion,
  removeQuestion,
}) => {
  const { t } = useTranslation();
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    updateQuestion(index, { ...question, [name]: value });
  };

  const handleTimeChange = (part: 'minutes' | 'seconds', value: string) => {
    if (!/^\d*$/.test(value)) return;

    let numValue = value === '' ? 0 : parseInt(value, 10);
    const currentValues = secondsToMinSec(question.timeLimit);
    
    let minutes = currentValues.minutes;
    let seconds = currentValues.seconds;

    if (part === 'minutes') {
        minutes = numValue;
    } else { // seconds
        if (numValue > 59) numValue = 59;
        seconds = numValue;
    }

    let totalSeconds = (minutes * 60) + seconds;
    
    // per-question limit: 300 seconds (5 minutes)
    if (totalSeconds > 300) {
        totalSeconds = 300;
    }

    updateQuestion(index, { ...question, timeLimit: totalSeconds });
  };

  const { minutes, seconds } = secondsToMinSec(question.timeLimit);

  const handleOptionChange = (optionIndex: number, value: string) => {
    const newOptions = [...question.options];
    newOptions[optionIndex] = value;
    updateQuestion(index, { ...question, options: newOptions });
  };

  const handleCorrectAnswerChange = (optionIndex: number) => {
    const newCorrectAnswers = [...question.correctAnswerIndex];
    const currentIndex = newCorrectAnswers.indexOf(optionIndex);
  
    if (currentIndex > -1) {
      // Prevent removing the last correct answer
      if (newCorrectAnswers.length > 1) {
        newCorrectAnswers.splice(currentIndex, 1);
      }
    } else {
      newCorrectAnswers.push(optionIndex);
    }
    
    updateQuestion(index, { ...question, correctAnswerIndex: newCorrectAnswers.sort((a, b) => a - b) });
  };
  
  const addOption = () => {
    if (question.options.length < 6) {
      updateQuestion(index, { ...question, options: [...question.options, ''] });
    }
  };

  const removeOption = (optionIndex: number) => {
    if (question.options.length > 2) {
      const newOptions = question.options.filter((_, i) => i !== optionIndex);
      
      // Remove the index from correct answers if it exists
      let newCorrectIndices = question.correctAnswerIndex.filter(i => i !== optionIndex);
      
      // Shift down subsequent correct answer indices
      newCorrectIndices = newCorrectIndices.map(i => (i > optionIndex ? i - 1 : i));
      
      // Ensure at least one correct answer remains if possible.
      // If we removed the only correct answer, set the first option as correct.
      if (newCorrectIndices.length === 0 && newOptions.length > 0) {
          newCorrectIndices = [0];
      }
      
      updateQuestion(index, { ...question, options: newOptions, correctAnswerIndex: newCorrectIndices });
    }
  };


  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateQuestion(index, { ...question, image: reader.result as string });
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleFeedbackChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    const currentText = question.feedback?.text || '';
    const currentCondition = question.feedback?.displayCondition || FeedbackDisplayCondition.ALWAYS;

    let newFeedback: QuestionFeedback | undefined = {
        text: name === 'text' ? value : currentText,
        displayCondition: name === 'displayCondition' ? value as FeedbackDisplayCondition : currentCondition
    };
    
    if (newFeedback.text.trim() === '') {
        newFeedback = undefined;
    }

    updateQuestion(index, { ...question, feedback: newFeedback });
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <h3 className="text-lg font-bold text-gray-800 dark:text-white">{t('createQuiz.question')} {index + 1}</h3>
        <div className="flex items-center gap-2">
            <label className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">{t('createQuiz.questionTimeLimit')}</label>
            <div className="flex items-center gap-1">
                <input
                    type="text"
                    placeholder={t('createQuiz.minutesPlaceholder')}
                    value={minutes || ''}
                    onChange={(e) => handleTimeChange('minutes', e.target.value)}
                    className="w-14 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-1 text-center"
                />
                <span className="text-gray-500 dark:text-gray-400">:</span>
                <input
                    type="text"
                    placeholder={t('createQuiz.secondsPlaceholder')}
                    value={seconds || ''}
                    onChange={(e) => handleTimeChange('seconds', e.target.value)}
                    className="w-14 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-1 text-center"
                />
            </div>
            <button type="button" onClick={() => removeQuestion(index)} className="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-500 p-1 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50">
                <TrashIcon className="w-5 h-5" />
            </button>
        </div>
      </div>
      <div className="space-y-4">
        <textarea
          name="questionText"
          value={question.questionText}
          onChange={handleInputChange}
          placeholder={t('createQuiz.questionTextPlaceholder')}
          className="w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition dark:text-white"
          rows={2}
        />
        <div className="flex items-center gap-4">
            <input type="file" accept="image/*" onChange={handleImageUpload} id={`file-upload-${index}`} className="hidden" />
            <label htmlFor={`file-upload-${index}`} className="cursor-pointer bg-gray-200 dark:bg-gray-600 text-sm text-gray-700 dark:text-gray-200 font-medium py-2 px-4 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 transition">
                {question.image ? t('createQuiz.changeImage') : t('createQuiz.uploadImage')}
            </label>
            {question.image && <img src={question.image} alt="Preview" className="w-16 h-16 rounded-md object-cover" />}
        </div>
        <div className="space-y-3">
            <p className="text-sm text-gray-600 dark:text-gray-400">{t('createQuiz.multipleAnswers')}</p>
            {question.options.map((option, i) => (
            <div key={i} className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name={`correct-answer-${index}`}
                  checked={question.correctAnswerIndex.includes(i)}
                  onChange={() => handleCorrectAnswerChange(i)}
                  className="form-checkbox h-5 w-5 text-teal-500 bg-gray-200 dark:bg-gray-600 border-gray-400 dark:border-gray-500 focus:ring-teal-500 dark:focus:ring-teal-400 shrink-0"
                />
                <input
                  type="text"
                  value={option}
                  onChange={(e) => handleOptionChange(i, e.target.value)}
                  placeholder={`${t('createQuiz.optionPlaceholder')} ${i + 1}`}
                  className="w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition dark:text-white"
                  required
                />
                 <button type="button" onClick={() => removeOption(i)} disabled={question.options.length <= 2} className="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-500 disabled:opacity-50 disabled:cursor-not-allowed p-1 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50 shrink-0">
                    <TrashIcon className="w-4 h-4"/>
                </button>
            </div>
            ))}
        </div>
        <button type="button" onClick={addOption} disabled={question.options.length >= 6} className="text-sm text-indigo-600 dark:text-indigo-400 font-semibold hover:underline disabled:opacity-50 disabled:cursor-not-allowed">
            {t('createQuiz.addOption')}
        </button>
      </div>

      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">{t('createQuiz.feedbackTitle')}</h4>
          <div className="space-y-3">
              <textarea
                  name="text"
                  value={question.feedback?.text || ''}
                  onChange={handleFeedbackChange}
                  placeholder={t('createQuiz.feedbackPlaceholder')}
                  className="w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition dark:text-white"
                  rows={2}
              />
              {question.feedback?.text && (
                  <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">{t('createQuiz.feedbackCondition')}</label>
                      <select
                          name="displayCondition"
                          value={question.feedback?.displayCondition || FeedbackDisplayCondition.ALWAYS}
                          onChange={handleFeedbackChange}
                          className="w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition dark:text-white"
                      >
                          <option value={FeedbackDisplayCondition.ALWAYS}>{t('feedbackCondition.ALWAYS')}</option>
                          <option value={FeedbackDisplayCondition.ON_CORRECT}>{t('feedbackCondition.ON_CORRECT')}</option>
                          <option value={FeedbackDisplayCondition.ON_INCORRECT}>{t('feedbackCondition.ON_INCORRECT')}</option>
                      </select>
                  </div>
              )}
          </div>
      </div>
    </div>
  );
};

const getInitialState = (quiz?: Quiz | null): QuizData => {
    if (quiz) {
        return {
            title: quiz.title,
            category: quiz.category,
            timeLimit: quiz.timeLimit,
            questions: quiz.questions.map(q => ({...q, options: [...q.options], correctAnswerIndex: [...q.correctAnswerIndex]})),
            playUntilFirstMistake: quiz.playUntilFirstMistake ?? false,
            isPrivate: quiz.isPrivate ?? false,
        };
    }
    return {
      title: '',
      category: QuizCategory.GAMES,
      timeLimit: 0,
      questions: [{ id: crypto.randomUUID(), questionText: '', options: ['', ''], correctAnswerIndex: [0], timeLimit: 0 }],
      playUntilFirstMistake: false,
      isPrivate: false,
    };
};


export const CreateQuiz: React.FC<CreateQuizProps> = ({ onSaveQuiz, onBack, quizToEdit }) => {
  const { t } = useTranslation();
  const isEditing = !!quizToEdit;
  const [quizData, setQuizData] = useState<QuizData>(() => getInitialState(quizToEdit));

  const updateQuestion = (index: number, question: Question) => {
    setQuizData(prev => {
      const newQuestions = [...prev.questions];
      newQuestions[index] = question;
      return { ...prev, questions: newQuestions };
    });
  };

  const addQuestion = () => {
    if (quizData.questions.length >= 20) return;
    setQuizData(prev => ({
      ...prev,
      questions: [
        ...prev.questions,
        { id: crypto.randomUUID(), questionText: '', options: ['', ''], correctAnswerIndex: [0], timeLimit: 0 },
      ],
    }));
  };

  const removeQuestion = (index: number) => {
    if (quizData.questions.length <= 1) return;
    setQuizData(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index),
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, type } = e.target;
    const value = type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
    setQuizData(prev => ({ ...prev, [name]: value }));
  };

  const handleOverallTimeChange = (part: 'minutes' | 'seconds', value: string) => {
    if (!/^\d*$/.test(value)) return;
    
    let numValue = value === '' ? 0 : parseInt(value, 10);
    const currentValues = secondsToMinSec(quizData.timeLimit);

    let minutes = currentValues.minutes;
    let seconds = currentValues.seconds;

    if (part === 'minutes') {
        minutes = numValue;
    } else { // seconds
        if (numValue > 59) numValue = 59;
        seconds = numValue;
    }

    let totalSeconds = (minutes * 60) + seconds;

    if (totalSeconds > 3600) { // 1 hour limit
        totalSeconds = 3600;
    }

    setQuizData(prev => ({ ...prev, timeLimit: totalSeconds }));
  };

  const { minutes: overallMinutes, seconds: overallSeconds } = secondsToMinSec(quizData.timeLimit);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const isFormValid = quizData.title.trim() !== '' &&
      quizData.questions.every(q => 
        (q.questionText.trim() !== '' || !!q.image) &&
        q.options.every(opt => opt.trim() !== '') &&
        q.options.length >= 2 &&
        q.correctAnswerIndex.length > 0
      );

    if (!isFormValid) {
      alert(t('createQuiz.fillFieldsError'));
      return;
    }
    
    onSaveQuiz(quizData);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <button onClick={onBack} className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors self-start">
          <ArrowLeftIcon className="w-5 h-5"/>
          {t('createQuiz.back')}
        </button>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white text-center sm:text-left">
          {isEditing ? t('editQuiz.title') : t('createQuiz.title')}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('createQuiz.detailsTitle')}</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('createQuiz.quizTitlePlaceholder')}</label>
              <input
                type="text"
                id="title"
                name="title"
                value={quizData.title}
                onChange={handleInputChange}
                placeholder={t('createQuiz.quizTitlePlaceholder')}
                className="w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition dark:text-white"
                required
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('createQuiz.category')}</label>
                <select
                  id="category"
                  name="category"
                  value={quizData.category}
                  onChange={handleInputChange}
                  className="w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition dark:text-white"
                >
                  {Object.values(QuizCategory).map(cat => (
                    <option key={cat} value={cat}>{t(`category.${cat}`)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="timeLimitMinutes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('createQuiz.overallTimeLimit')}</label>
                <div className="flex items-center gap-2">
                    <input
                        type="text"
                        id="timeLimitMinutes"
                        placeholder={t('createQuiz.minutesPlaceholder')}
                        value={overallMinutes || ''}
                        onChange={(e) => handleOverallTimeChange('minutes', e.target.value)}
                        className="w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition dark:text-white"
                    />
                    <span className="text-gray-500 dark:text-gray-400 font-bold">:</span>
                    <input
                        type="text"
                        id="timeLimitSeconds"
                        placeholder={t('createQuiz.secondsPlaceholder')}
                        value={overallSeconds || ''}
                        onChange={(e) => handleOverallTimeChange('seconds', e.target.value)}
                        className="w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition dark:text-white"
                    />
                </div>
              </div>
            </div>
             <div className="relative flex items-start mt-2">
                <div className="flex h-6 items-center">
                    <input
                        id="playUntilFirstMistake"
                        name="playUntilFirstMistake"
                        type="checkbox"
                        checked={quizData.playUntilFirstMistake}
                        onChange={handleInputChange}
                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                </div>
                <div className="ml-3 text-sm leading-6">
                    <label htmlFor="playUntilFirstMistake" className="font-medium text-gray-900 dark:text-gray-300">
                        {t('createQuiz.playUntilFirstMistake')}
                    </label>
                </div>
            </div>
             <div className="relative flex items-start mt-2">
                <div className="flex h-6 items-center">
                    <input
                        id="isPrivate"
                        name="isPrivate"
                        type="checkbox"
                        checked={(quizData as any).isPrivate}
                        onChange={handleInputChange}
                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                </div>
                <div className="ml-3 text-sm leading-6">
                    <label htmlFor="isPrivate" className="font-medium text-gray-900 dark:text-gray-300">
                        {t('createQuiz.isPrivate')}
                    </label>
                    {(quizData as any).isPrivate && (
                        <p className="text-gray-500 dark:text-gray-400">{t('createQuiz.isPrivateDescription')}</p>
                    )}
                </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('createQuiz.questionsTitle')}</h2>
          </div>
          {quizData.questions.map((q, i) => (
            <QuestionEditor
              key={q.id || i}
              question={q}
              index={i}
              updateQuestion={updateQuestion}
              removeQuestion={removeQuestion}
            />
          ))}
        </div>

        <div className="flex flex-col sm:flex-row-reverse gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
           <button
            type="submit"
            className="w-full sm:w-auto inline-flex justify-center items-center gap-2 bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-indigo-700 transition-colors duration-300 shadow-lg"
          >
            {isEditing ? t('editQuiz.saveChanges') : t('createQuiz.saveQuiz')}
          </button>
          <button
            type="button"
            onClick={addQuestion}
            disabled={quizData.questions.length >= 20}
            className="w-full sm:w-auto inline-flex justify-center items-center gap-2 bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200 font-bold py-3 px-6 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <PlusIcon className="w-5 h-5"/>
            {t('createQuiz.addQuestion')}
          </button>
        </div>
      </form>
    </div>
  );
};